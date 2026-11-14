// Geometry stays instanced, but moving pieces live under their real hinge.
// All equipment uses fixed physics steps; avatar targets are in world metres.
function createHomePlayground(ctx){
 const {scene,colliders,batches,lines}=ctx,units=[],scenery=[],parts=[],rayObjects=[],step=1/120;
 const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),point=new THREE.Vector3();
 const hidden=new THREE.MeshBasicMaterial({visible:false}),up=new THREE.Vector3(0,1,0);
 let world=null,rider=null,accumulator=0,time=0,cooldown=0,positive=0,negative=0,pulse=0,pulseUntil=0,ui=null,pausedAt=null;
 const vector=value=>value?.isVector3?value.clone():new THREE.Vector3(...value);
 const mix=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t),clamp=THREE.MathUtils.clamp;
 const facing=yaw=>new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
 function moving(name,pivot,build){
  // Detach only geometry/colliders appended by this builder; supports stay still.
  const marks=new Map([...batches].map(([key,batch])=>[key,batch.transforms.length])),lineMarks=new Map([...lines].map(([key,list])=>[key,list.length])),firstCollider=colliders.length;
  build();const group=new THREE.Group();group.name=name;group.position.copy(vector(pivot));scene.add(group);
  const inverse=new THREE.Matrix4().makeTranslation(-pivot[0],-pivot[1],-pivot[2]);
  for(const [key,batch] of [...batches]){
   const start=marks.get(key)||0,matrices=batch.transforms.splice(start);if(!matrices.length)continue;
   const mesh=new THREE.InstancedMesh(batch.geo,batch.material,matrices.length);matrices.forEach((matrix,index)=>mesh.setMatrixAt(index,new THREE.Matrix4().multiplyMatrices(inverse,matrix)));mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;group.add(mesh);
   if(!batch.transforms.length)batches.delete(key);
  }
  for(const [color,list] of [...lines]){
   const values=list.splice(lineMarks.get(color)||0);if(!values.length)continue;
   for(let i=0;i<values.length;i+=3){values[i]-=pivot[0];values[i+1]-=pivot[1];values[i+2]-=pivot[2];}
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(values,3));group.add(new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color})));if(!list.length)lines.delete(color);
  }
  const boxes=colliders.splice(firstCollider).map(box=>[box[0]-pivot[0],box[1]-pivot[2],box[2]-pivot[0],box[3]-pivot[2],...box.slice(4)]);
  const part={group,boxes,pivot:vector(pivot)};parts.push(part);group.updateMatrixWorld(true);return part;
 }
 function local(part,position){part.group.updateMatrixWorld(true);return part.group.localToWorld(vector(position));}
 function ground(x,z){return world?.walkGroundAt(x,z,null)??(x>=5&&x<=51&&z>=21&&z<=51?.145:0);}
 function register(unit){
  unit.slots??=1;unit.theta??=0;unit.speed??=0;unit.phase??=0;unit.amplitude??=0;unit.stroke??=0;unit.reps??=0;unit.brake=false;unit.proxies=[];
  // Only swings and the carousel remain usable; other equipment keeps its geometry and collision.
  if(!['swing','swingBench','carousel'].includes(unit.kind)){unit.render?.();scenery.push(unit);return unit;}
  for(let slot=0;slot<unit.slots;slot++){
   const proxy=new THREE.Mesh(new THREE.BoxGeometry(...(unit.proxySize||[.8,1,.8])),hidden);proxy.name=unit.id+'-touch-'+slot;proxy.userData={playgroundId:unit.id,slot};scene.add(proxy);rayObjects.push(proxy);unit.proxies.push(proxy);
  }
  units.push(unit);unit.render?.();refreshProxies(unit);return unit;
 }
 function refreshProxies(unit){
  unit.proxies.forEach((proxy,slot)=>{const sample=unit.sample(slot);proxy.position.copy(unit.proxyPosition?.(slot)||sample.seat||sample.position);proxy.position.y+=unit.proxyLift??.28;proxy.rotation.y=sample.yaw||0;proxy.updateMatrixWorld(true);});
 }
 function pendulum({id,name,part,seat,length,maxAngle=.52,yaw=Math.PI,entry,bench=false,chainX=.3,chainDrop=length,chainZ=0}){
  return register({id,name,kind:bench?'swingBench':'swing',part,length,maxAngle,entry:()=>vector(entry),pumpLabel:'Раскачиваться',brakeLabel:'Тормоз',
   sample(){
    const position=local(part,seat),forward=facing(yaw),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)),turn=part.group.getWorldQuaternion(new THREE.Quaternion()),gripY=seat[1]+.80;
    return {seat:position,yaw,sitting:1,lean:this.theta*.16,
     hands:bench?[-1,1].map(side=>local(part,[seat[0]+side*.20,seat[1]+.12,seat[2]+.24])):undefined,
     grips:bench?undefined:[-1,1].map(side=>({center:local(part,[seat[0]+side*chainX,gripY,chainZ*(-gripY/chainDrop)]),axis:new THREE.Vector3(0,chainDrop,-chainZ).normalize().applyQuaternion(turn),normal:new THREE.Vector3(-side,0,0).applyQuaternion(turn),profile:'chain'})),
     feet:[-1,1].map(side=>position.clone().addScaledVector(forward,.28+clamp(this.speed,-1,1)*.12).addScaledVector(right,side*.13).add(new THREE.Vector3(0,-.33+.08*Math.abs(this.theta),0)))};
   },
   render(){part.group.rotation.x=this.theta;part.group.updateMatrixWorld(true);},
   physics(dt,input,occupied){
    let acceleration=-(this.brake?9:9.81/length)*Math.sin(this.theta)-(this.brake?6:occupied?.18:.38)*this.speed;
    if(occupied&&!this.brake&&input>0)acceleration+=input*.95*(Math.sign(this.speed)||1)*Math.max(.15,Math.cos(this.theta));
    if(input<0)acceleration-=this.speed*5*(-input);
    this.speed+=acceleration*dt;this.theta+=this.speed*dt;
    if(Math.abs(this.theta)>maxAngle){this.theta=clamp(this.theta,-maxAngle,maxAngle);this.speed*=-.08;}
    if(!occupied&&Math.abs(this.theta)+Math.abs(this.speed)<.0001)this.theta=this.speed=0;
   },ready(){return Math.abs(this.theta)<.035&&Math.abs(this.speed)<.07;}
  });
 }
 function carousel({part,x,z,seats}){
  const seat=seats[seats.length-1],seatPoint=[Math.cos(seat)*1.25,.6725,Math.sin(seat)*1.25];
  return register({id:'play-carousel',name:'Карусель',kind:'carousel',part,proxySize:[3.1,.8,3.1],proxyLift:0,proxyPosition:()=>new THREE.Vector3(x,.7,z),pumpLabel:'Раскручивать',brakeLabel:'Тормоз',
   entry(){const p=local(part,[0,.145,-2.3]);p.y=ground(p.x,p.z);return p;},
   sample(){const position=local(part,seatPoint),yaw=Math.PI*1.5-seat+this.theta,forward=facing(yaw),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));return {seat:position,yaw,sitting:1,grips:[-1,1].map(side=>({center:position.clone().addScaledVector(forward,.48).addScaledVector(right,side*.20).add(new THREE.Vector3(0,.44,0)),axis:right.clone(),normal:up.clone(),profile:'bar'})),feet:[-1,1].map(side=>position.clone().addScaledVector(forward,.34).addScaledVector(right,side*.13).setY(.465))};},
   enterPath(){return [local(part,[0,.365,-1.25]),local(part,[-.76,.365,-.95])];},
   render(){part.group.rotation.y=this.theta;part.group.updateMatrixWorld(true);},
   physics(dt,input,occupied){let acceleration=-this.speed*(this.brake?2.5:.16);if(occupied&&!this.brake)acceleration+=Math.max(0,input)*.70;if(input<0||this.brake)acceleration-=Math.sign(this.speed)*Math.min(Math.abs(this.speed)/dt,.9);this.speed=clamp(this.speed+acceleration*dt,-.90,.90);this.theta+=this.speed*dt;if(Math.abs(this.speed)<.00001)this.speed=0;},
   ready(){return Math.abs(this.speed)<.045;}
  });
 }
 function seesaw(part){
  const rest=.05;return register({id:'play-seesaw',name:'Балансир',kind:'seesaw',part,theta:rest,slots:2,pumpLabel:'Отталкиваться',brakeLabel:'Остановить',
   entry(slot){const p=local(part,[slot?2.65:-2.65,0,0]);p.y=ground(p.x,p.z);return p;},
   sample(slot){const sign=slot?1:-1,seat=[sign*1.65,.10-sign*1.65*.05,0],position=local(part,seat);return {seat:position,yaw:sign<0?Math.PI/2:-Math.PI/2,sitting:1,leanSide:-this.theta*.2,hands:[-.11,.11].map(z=>local(part,[seat[0],seat[1]+.405,z]))};},
   render(){part.group.rotation.z=this.theta;part.group.updateMatrixWorld(true);},
   physics(dt,input,occupied,slot){const target=rest+(occupied&&!this.brake?(slot?-.14:.14):0);let acceleration=-8*(this.theta-target)-(this.brake?5:1.35)*this.speed;if(occupied&&!this.brake&&input>0)acceleration+=input*1.15*(Math.sign(this.speed)||(slot?1:-1));if(input<0)acceleration-=this.speed*5;this.speed+=acceleration*dt;this.theta=clamp(this.theta+this.speed*dt,rest-.24,rest+.24);},
   ready(){return Math.abs(this.theta-rest)<.035&&Math.abs(this.speed)<.08;}
  });
 }
 function exercise(config){
  return register({...config,kind:config.kind||'exercise',pumpLabel:config.pumpLabel||'Упражняться',brakeLabel:'Отдых',
   physics(dt,input,occupied){const drive=occupied&&!this.brake?Math.max(0,input):0;this.amplitude+=(drive-this.amplitude)*(1-Math.exp(-dt*(drive?3:6)));if(this.amplitude>.0005){this.phase+=dt*2.5;while(this.phase>=Math.PI*2){this.phase-=Math.PI*2;if(drive>.1)this.reps++;}}else{this.amplitude=0;this.phase=0;}this.stroke=this.amplitude*(.5-.5*Math.cos(this.phase));},
   ready(){return this.amplitude<.025;}
  });
 }
 function bench({id,name='Скамейка',position,yaw=0,seatY}){
  return register({id,name,kind:'bench',entry(){return vector(position).addScaledVector(facing(yaw),1.12).setY(ground(position[0],position[2]));},sample(){return {seat:new THREE.Vector3(position[0],seatY,position[2]),yaw,sitting:1};},ready(){return true;}});
 }
 function spring({id,name,group,coil,center,material}){
  const startY=.16,height=.405,segments=90,cylinder=ctx.unitCylinder,matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion(),a=new THREE.Vector3(),b=new THREE.Vector3(),delta=new THREE.Vector3();
  const mesh=new THREE.InstancedMesh(cylinder,material,segments);mesh.frustumCulled=false;scene.add(mesh);
  return register({id,name,kind:'spring',theta:0,speed:0,pumpLabel:'Качаться',brakeLabel:'Остановить',
   entry(){return new THREE.Vector3(center[0],ground(...center),center[1]+1.25);},
   sample(){const seat=group.localToWorld(new THREE.Vector3(0,.17,0));return {seat,yaw:Math.PI,sitting:1,lean:this.theta*.2,hands:[-.19,.19].map(x=>group.localToWorld(new THREE.Vector3(x,.51,-.22))),feet:[-.15,.15].map(x=>group.localToWorld(new THREE.Vector3(x,-.04,-.15)))};},
   physics(dt,input,occupied){let acceleration=-11*this.theta-(this.brake?7:1.5)*this.speed;if(occupied&&!this.brake&&input>0)acceleration+=input*2.3*(Math.sign(this.speed)||1);if(input<0)acceleration-=5*this.speed;this.speed+=acceleration*dt;this.theta=clamp(this.theta+this.speed*dt,-.24,.24);},
   render(){
    const shift=Math.sin(this.theta)*.24,compression=Math.abs(this.theta)*.055;group.position.set(center[0],startY+height-compression,center[1]+shift);group.rotation.x=this.theta;group.updateMatrixWorld(true);
    const at=t=>new THREE.Vector3(center[0]+Math.cos(t*segments*Math.PI/7)*.105,startY+t*(height-compression),center[1]+Math.sin(t*segments*Math.PI/7)*.105+shift*t*t);
    for(let i=0;i<segments;i++){a.copy(at(i/segments));b.copy(at((i+1)/segments));delta.subVectors(b,a);rotation.setFromUnitVectors(up,delta.clone().normalize());matrix.compose(a.add(b).multiplyScalar(.5),rotation,new THREE.Vector3(.018,delta.length(),.018));mesh.setMatrixAt(i,matrix);}mesh.instanceMatrix.needsUpdate=true;
   },ready(){return Math.abs(this.theta)<.035&&Math.abs(this.speed)<.07;}
  });
 }
 function slide(config){return register({...config,kind:'slide',entry:()=>vector(config.climb[0]),sample(){return {position:vector(config.climb[0]),seat:vector(config.climb[0]),yaw:config.yaw,sitting:0};},ready(){return true;}});}
 function sandbox(group){
  return register({id:'play-sandbox',name:'Песочница',kind:'sandbox',build:0,pumpLabel:'Лепить замок',brakeLabel:'Разровнять',
   entry(){return new THREE.Vector3(31.5,.145,36.65);},
   sample(){return {position:new THREE.Vector3(31.5,.17,38.05),yaw:0,sitting:.86,height:.30,hands:[-.18,.18].map((x,i)=>new THREE.Vector3(31.5+x,.53+.05*Math.sin(time*7+i*Math.PI),38.43))};},
   physics(dt,input,occupied){if(occupied&&!this.brake)this.build=clamp(this.build+input*dt*.24,0,1);},render(){group.visible=this.build>.002;group.scale.y=Math.max(.001,this.build);},ready(){return true;}
  });
 }
 function input(){if(!rider||rider.stage!=='active')return 0;const keyboard=(keys.KeyW?1:0)-(keys.KeyS?1:0),touch=joy.y+(positive?1:0)-(negative?1:0)+(time<pulseUntil?pulse:0);return clamp(keyboard+touch,-1,1);}
 function interfaceUI(){
  if(ui)return;const root=document.createElement('div');root.id='playgroundControls';root.innerHTML='<div id="playgroundStatus"></div><div class="playgroundButtons"><button id="playgroundPump" type="button"></button><button id="playgroundBrake" type="button"></button></div>';document.body.appendChild(root);ui={root,status:root.querySelector('#playgroundStatus'),pump:root.querySelector('#playgroundPump'),brake:root.querySelector('#playgroundBrake')};
  for(const [button,sign] of [[ui.pump,1],[ui.brake,-1]]){
   button.addEventListener('pointerdown',event=>{event.preventDefault();event.stopPropagation();if(sign>0)positive=event.pointerId+1;else negative=event.pointerId+1;button.setPointerCapture?.(event.pointerId);});
   const release=event=>{if(sign>0&&positive===event.pointerId+1)positive=0;if(sign<0&&negative===event.pointerId+1)negative=0;};for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,release);
   button.addEventListener('click',event=>{if(event.detail===0){pulse=sign;pulseUntil=time+.3;}});
  }
 }
 function updateUI(){
  if(!ui&&!rider)return;if(!ui)interfaceUI();const hiddenNow=!rider||rider.unit.kind==='slide'||rider.unit.kind==='bench'||document.hidden||sh>sw;ui.root.style.display=hiddenNow?'none':'block';if(hiddenNow)return;
  ui.pump.textContent=rider.unit.pumpLabel;ui.brake.textContent=rider.unit.brakeLabel;
  const repetitions=rider.unit.kind==='exercise'||rider.unit.kind==='walker'||rider.unit.kind==='pullup';ui.status.textContent=rider.unit.name+(repetitions?' · Повторения: '+rider.unit.reps:'')+' · W — '+rider.unit.pumpLabel.toLowerCase()+' · S — '+rider.unit.brakeLabel.toLowerCase()+' · E — сойти';
  const disabled=rider.stage!=='active';ui.pump.disabled=ui.brake.disabled=disabled;
 }
 function canReach(unit,slot,look=true){
  const entry=unit.entry(slot),distance=Math.hypot(C.position.x-entry.x,C.position.z-entry.z);if(distance>1.45||Math.abs(feetY-ground(entry.x,entry.z))>.4)return null;
  const sample=unit.sample(slot),target=unit.kind==='slide'?vector(unit.top):(sample.seat||sample.position||entry);C.getWorldDirection(point);const dx=target.x-C.position.x,dz=target.z-C.position.z,alignment=(point.x*dx+point.z*dz)/Math.max(.01,Math.hypot(dx,dz));if(look&&alignment<.12)return null;return {entry,distance,alignment};
 }
 function target(){
  if(rider){const automatic=['enter','exit','sitSlide','sliding','rollout'].includes(rider.stage);return {id:rider.unit.id+'-exit',allowed:!automatic,action:'playExit',caption:rider.unit.kind==='slide'?'Спуститься':'Сойти',restriction:automatic?'Подождите завершения движения':null,hint:automatic?rider.unit.name+' · '+(rider.stage==='sliding'?'Съезжаем вниз':'Подождите'):rider.unit.name+' · E или кнопка — сойти'};}
  if(time<cooldown)return null;let best=null;
  for(const unit of units)for(let slot=0;slot<unit.slots;slot++){const reach=canReach(unit,slot);if(!reach)continue;const score=reach.distance-.18*reach.alignment;if(!best||score<best.score)best={id:unit.id,unit,slot,score,allowed:true,action:'playUse',caption:unit.kind==='slide'?'Скатиться':unit.kind==='sandbox'?'Лепить':unit.kind==='pullup'?'Подтягиваться':unit.kind==='bench'?'Сесть':'Пользоваться',hint:unit.name+' · Нажмите / E'};}
  return best;
 }
 function tapTarget(x,y){
  if(rider||time<cooldown)return null;const rect=R.domElement.getBoundingClientRect();ndc.set((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1);C.updateMatrixWorld();ray.setFromCamera(ndc,C);ray.far=5;
  for(const hit of ray.intersectObjects(rayObjects)){const unit=units.find(unit=>unit.id===hit.object.userData.playgroundId),slot=hit.object.userData.slot;if(unit&&canReach(unit,slot,false))return {id:unit.id,unit,slot,allowed:true,action:'playUse'};}return null;
 }
 function positionOf(sample){return sample.position?.clone()||(sample.seat.clone().add(new THREE.Vector3(0,-.43,0)));}
 function descriptor(sample){
  const position=positionOf(sample),yaw=sample.yaw||0,rotation=new THREE.Quaternion().setFromAxisAngle(up,-yaw);
  const relative=targets=>targets?.map(target=>{const local=target.clone().sub(position).applyQuaternion(rotation);return {x:local.x,y:local.y,z:local.z,flex:0};}).sort((a,b)=>a.x-b.x);
  const grips=sample.grips?.map(grip=>({...grip,center:grip.center.clone().sub(position).applyQuaternion(rotation),axis:grip.axis.clone().applyQuaternion(rotation),normal:grip.normal.clone().applyQuaternion(rotation)})).sort((a,b)=>a.center.x-b.center.x);
  return {position,yaw,sitting:sample.sitting??1,height:sample.height,walking:sample.walking||0,gait:sample.gait||0,lean:sample.lean||0,leanSide:sample.leanSide||0,hands:relative(sample.hands),grips,feet:relative(sample.feet)};
 }
 function pathSample(points,t){
  const lengths=points.slice(1).map((p,i)=>p.distanceTo(points[i])),total=lengths.reduce((a,b)=>a+b,0);let distance=clamp(t,0,1)*total;
  for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]||i===lengths.length-1)return points[i].clone().lerp(points[i+1],lengths[i]?distance/lengths[i]:1);distance-=lengths[i];}return points.at(-1).clone();
 }
 function blendPose(from,to,t){const pose={...to,position:from.position.clone().lerp(to.position,t),sitting:mix(from.sitting||0,to.sitting||0,t),height:mix(from.height??.973,to.height??mix(.973,.535,to.sitting??1),t)};if(t<.75){pose.hands=undefined;pose.grips=undefined;pose.feet=undefined;}return pose;}
 function act(action){
  if(action.action==='playExit'){requestExit();return;}
  if(rider||time<cooldown)return;const unit=units.find(unit=>unit.id===action.id),slot=action.slot||0;if(!unit||!canReach(unit,slot,false))return;
  const currentYaw=Math.atan2(-Math.sin(yaw),-Math.cos(yaw)),start={position:new THREE.Vector3(C.position.x-Math.sin(currentYaw)*.096,feetY,C.position.z-Math.cos(currentYaw)*.096),yaw:currentYaw,sitting:0,height:.973};
  rider={unit,slot,stage:unit.kind==='slide'?'climb':'waiting',elapsed:0,start,pose:start,lastYaw:null,exitRequested:false,climbProgress:0,slideDistance:0,slideSpeed:.12};unit.brake=true;positive=negative=0;resetInput();updateFlyUI();updateUI();
  if(unit.kind==='slide'){rider.climb=[start.position.clone(),...unit.climb.map(vector),vector(unit.top)];rider.climbLength=rider.climb.slice(1).reduce((sum,p,i)=>sum+p.distanceTo(rider.climb[i]),0);yaw=unit.yaw+Math.PI;pitch=-.12;}
 }
 function clearExit(unit,slot){
  const entry=unit.entry(slot);for(const [dx,dz] of [[0,0],[-.5,0],[.5,0],[0,.5],[0,-.5],[-.7,.4],[.7,.4],[-.7,-.4],[.7,-.4],[0,1],[-1,0],[1,0]]){const x=entry.x+dx,z=entry.z+dz,y=ground(x,z);if(!hit(x,z,y))return new THREE.Vector3(x,y,z);}return null;
 }
 function requestExit(){
  if(!rider)return;if(rider.unit.kind==='slide'){if(rider.stage==='climb'||rider.stage==='sitSlide'){rider.abort=true;rider.stage='climb';}return;}
  if(rider.stage==='waiting'){finish(rider.start.position);return;}
  if(rider.stage==='exit'||rider.stage==='enter')return;rider.exitRequested=true;rider.unit.brake=true;positive=negative=0;
 }
 function finish(position){
  C.position.copy(position).add(new THREE.Vector3(0,1.7,0));feetY=ground(position.x,position.z);C.position.y=feetY+1.7;
  if(rider)rider.unit.brake=false;rider=null;cooldown=time+.4;resetInput();updateFlyUI();updateUI();
 }
 function updateRide(dt){
  if(!rider)return;const r=rider,u=r.unit;
  if(u.kind==='slide'){
   const top=vector(u.top),bottom=vector(u.bottom),direction=bottom.clone().sub(top),length=direction.length();r.elapsed+=dt;
   if(r.stage==='climb'){
    r.climbProgress=clamp(r.climbProgress+(r.abort?-1:1)*dt/Math.max(.6,r.climbLength/1.1),0,1);
    r.pose={position:pathSample(r.climb,r.climbProgress),yaw:u.yaw,sitting:u.covered?.65:0,height:u.covered?.45:.973,walking:.65,gait:r.climbProgress*r.climbLength/1.62};
    if(r.abort&&r.climbProgress===0){finish(r.climb[0]);return;}if(!r.abort&&r.climbProgress===1){r.stage='sitSlide';r.elapsed=0;}
   }else if(r.stage==='sitSlide'){
    const standing={position:top.clone(),sitting:u.covered?.65:0,height:u.covered?.45:.973},seated={position:top.clone().add(new THREE.Vector3(0,-.43,0)),yaw:u.yaw,sitting:1,height:.535};r.pose=blendPose(standing,seated,ease(clamp(r.elapsed/.5,0,1)));if(r.elapsed>=.5){r.stage='sliding';r.elapsed=0;}
   }else if(r.stage==='sliding'){
    const acceleration=9.81*((top.y-bottom.y)/length-.14*Math.hypot(direction.x,direction.z)/length);r.slideSpeed=Math.min(4,r.slideSpeed+acceleration*dt);r.slideDistance=Math.min(length,r.slideDistance+r.slideSpeed*dt);
    const t=r.slideDistance/length,seat=top.clone().lerp(bottom,t),forward=facing(u.yaw),right=new THREE.Vector3(Math.cos(u.yaw),0,-Math.sin(u.yaw));
    const feet=top.clone().lerp(bottom,clamp(t+.60/length,0,1)).add(new THREE.Vector3(0,.105,0)),hands=top.clone().lerp(bottom,clamp(t+.18/length,0,1)).add(new THREE.Vector3(0,.22,0));
    r.pose=descriptor({seat,yaw:u.yaw,sitting:1,lean:-.06,hands:[-1,1].map(side=>hands.clone().addScaledVector(right,side*.52)),feet:[-1,1].map(side=>feet.clone().addScaledVector(right,side*.13))});
    if(t===1){r.stage='rollout';r.elapsed=0;r.exitStart=r.pose;}
   }else if(r.stage==='rollout'){
    const end=vector(u.after);end.y=ground(end.x,end.z);r.pose=blendPose(r.exitStart,{position:end,yaw:u.yaw,sitting:0,height:.973},ease(clamp(r.elapsed/.65,0,1)));if(r.elapsed>=.65){finish(end);return;}
   }
  }else{
   if(r.stage==='waiting'&&u.ready()){
    r.stage='enter';r.elapsed=0;r.end=descriptor(u.sample(r.slot));r.path=[r.start.position.clone(),...(u.enterPath?.(r.slot)||[]),r.end.position.clone()];yaw=r.end.yaw+Math.PI;pitch=-.12;
   }
   if(r.stage==='enter'){
    r.elapsed+=dt;const t=ease(clamp(r.elapsed/.9,0,1)),end=descriptor(u.sample(r.slot));r.pose=blendPose(r.start,end,t);r.pose.position=pathSample(r.path,t);
    if(t===1){r.stage='active';u.brake=false;}
   }else if(r.stage==='active'){
    r.pose=descriptor(u.sample(r.slot));
    if(r.exitRequested&&u.ready()){
     const exit=clearExit(u,r.slot);if(exit){r.stage='exit';r.elapsed=0;r.exit=exit;r.exitStart=r.pose;r.path=[r.pose.position.clone(),...(u.enterPath?.(r.slot)||[]).reverse(),exit];}
     else{r.exitRequested=false;showNotice('Место для выхода занято. Попробуйте ещё раз.');}
    }
   }else if(r.stage==='exit'){
    r.elapsed+=dt;const t=ease(clamp(r.elapsed/1,0,1));r.pose=blendPose(r.exitStart,{position:r.exit,yaw:r.exitStart.yaw,sitting:0,height:.973},t);r.pose.position=pathSample(r.path,t);if(t===1){finish(r.exit);return;}
   }
  }
 }
 function syncCamera(){
  if(!rider)return;const pose=rider.pose,height=pose.height??mix(.973,.535,pose.sitting||0),eyeHeight=1.7-.973+height,forward=facing(pose.yaw);
  if(rider.lastYaw!==null&&rider.unit.kind==='carousel')yaw+=Math.atan2(Math.sin(pose.yaw-rider.lastYaw),Math.cos(pose.yaw-rider.lastYaw));rider.lastYaw=pose.yaw;
  C.position.copy(pose.position).addScaledVector(forward,.096).add(new THREE.Vector3(0,eyeHeight,0));feetY=ground(C.position.x,C.position.z);
 }
 function update(dt){
  if(typeof C==='undefined')return;if(document.hidden||sh>sw){resetControls();updateUI();return;}resume();accumulator+=Math.min(.1,Math.max(0,dt));
  while(accumulator+1e-10>=step){
   time+=step;const drive=input();
   for(const unit of units)unit.physics?.(step,rider?.unit===unit?drive:0,rider?.unit===unit&&rider.stage==='active',rider?.slot||0);
   updateRide(step);accumulator-=step;
  }
  for(const unit of units){unit.render?.();refreshProxies(unit);}if(rider?.stage==='active'&&rider.unit.kind!=='slide')rider.pose=descriptor(rider.unit.sample(rider.slot));syncCamera();updateUI();
 }
 function blocks(x,z,feet=0){
  for(const unit of [...units,...scenery]){
   if(unit.kind==='carousel'){
    const c=Math.cos(unit.theta),s=Math.sin(unit.theta),dx=x-unit.part.pivot.x,dz=z-unit.part.pivot.z,lx=c*dx-s*dz,lz=s*dx+c*dz;
    if(unit.part.boxes.some(b=>lx>b[0]-.35&&lx<b[2]+.35&&lz>b[1]-.35&&lz<b[3]+.35))return true;
   }else if(['swing','swingBench','spring','seesaw'].includes(unit.kind)){
    for(let slot=0;slot<unit.slots;slot++){const seat=unit.sample(slot).seat;if(Math.abs(x-seat.x)<(unit.kind==='swingBench'?1.85:.68)&&Math.abs(z-seat.z)<.62&&feet<seat.y+.1&&feet+1.65>seat.y-.1)return true;}
    if(unit.kind==='seesaw'){const a=local(unit.part,[-1.95,0,0]),b=local(unit.part,[1.95,0,0]);if(x>Math.min(a.x,b.x)-.35&&x<Math.max(a.x,b.x)+.35&&Math.abs(z-a.z)<.46&&feet<Math.max(a.y,b.y)+.15)return true;}
   }else if(unit.kind==='sandbox'&&unit.build>.1&&Math.abs(x-31.5)<.8&&Math.abs(z-38.9)<.8&&feet<.7)return true;
  }return false;
 }
 function resetControls(){positive=negative=0;pulseUntil=0;}
 function pause(){resetControls();pausedAt=typeof performance==='undefined'?0:performance.now();if(ui)ui.root.style.display='none';}
 function resume(){
  if(pausedAt===null)return;const elapsed=clamp(((typeof performance==='undefined'?pausedAt:performance.now())-pausedAt)/1000,0,90);pausedAt=null;
  for(const unit of units){if(unit.kind==='carousel'){const decay=Math.exp(-.16*elapsed);unit.theta+=unit.speed/.16*(1-decay);unit.speed*=decay;}else if(unit.kind==='swing'||unit.kind==='swingBench'){const decay=Math.exp(-.38*elapsed);unit.theta*=decay;unit.speed*=decay;}else if(unit.kind==='spring'){unit.theta*=Math.exp(-elapsed*1.5);unit.speed*=Math.exp(-elapsed*1.5);}unit.render?.();refreshProxies(unit);}
 }
 return {units,moving,local,pendulum,carousel,seesaw,exercise,bench,spring,slide,sandbox,register,target,tapTarget,act,update,blocks,pause,resume,resetControls,setWorld(value){world=value;},get occupied(){return !!rider},get rider(){return rider},get avatarPose(){return rider?.pose||null},get time(){return time}};
}
