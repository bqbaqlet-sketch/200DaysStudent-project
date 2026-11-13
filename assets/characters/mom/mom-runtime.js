const apartmentMomSchedule=[
 [0,'sleep','Спит'],
 [7*60,'bathroom','В ванной'],
 [7*60+20,'cook','Готовит завтрак'],
 [7*60+50,'eat','Завтракает'],
 [8*60+15,'rest','Отдыхает в гостиной'],
 [11*60+45,'cook','Готовит обед'],
 [12*60+30,'eat','Обедает'],
 [13*60,'rest','Отдыхает в гостиной'],
 [18*60,'cook','Готовит ужин'],
 [18*60+45,'eat','Ужинает'],
 [19*60+15,'tv','Смотрит телевизор'],
 [22*60+30,'sleep','Спит']
].map(([minute,action,label])=>({minute,action,label}));

function createApartmentMomProps(anchor,television){
 function mesh(group,geometry,color,x,y,z){
  const material=new THREE.MeshStandardMaterial({color,roughness:.82});
  const part=new THREE.Mesh(geometry,material);part.position.set(x,y,z);group.add(part);return part;
 }
 const pan=new THREE.Group(),meal=new THREE.Group();
 pan.name='mom-cooking-pan';meal.name='mom-meal';
 anchor.add(pan,meal);
 pan.position.set(3.7665,.925,.4475);
 mesh(pan,new THREE.CylinderGeometry(.132,.115,.063,24),0x353c3a,0,.033,0);
 mesh(pan,new THREE.TorusGeometry(.124,.008,8,24),0x555c5a,0,.068,0).rotation.x=Math.PI/2;
 mesh(pan,new THREE.CylinderGeometry(.111,.107,.008,24),0x9d6842,0,.057,0);
 mesh(pan,new THREE.BoxGeometry(.19,.023,.031),0x30342e,.203,.037,0);
 const food=new THREE.Group();pan.add(food);
 for(let i=0;i<13;i++){
  const angle=i*2.4,r=.078*Math.sqrt(i/13);
  mesh(food,new THREE.BoxGeometry(.020,.013,.016),[0xbb6f37,0xb09b45,0x6b823c][i%3],
   Math.cos(angle)*r,.068,Math.sin(angle)*r).rotation.y=angle;
 }

 meal.position.set(3.39,.79,2.957);
 mesh(meal,new THREE.CylinderGeometry(.14,.114,.022,32),0xf2eee3,0,.012,0);
 mesh(meal,new THREE.TorusGeometry(.125,.007,8,32),0xded9cd,0,.023,0).rotation.x=Math.PI/2;
 mesh(meal,new THREE.SphereGeometry(.088,15,10),0xa9784d,-.019,.024,-.005).scale.y=.28;
 for(let i=0;i<8;i++){
  const a=i*2.4;
  mesh(meal,new THREE.SphereGeometry(.013,7,5),i%2?0xb5793d:0x75874b,Math.cos(a)*.071,.033,Math.sin(a)*.060).scale.y=.62;
 }
 mesh(meal,new THREE.CylinderGeometry(.045,.039,.083,16),0xd9e6e1,.19,.045,.16);
 mesh(meal,new THREE.TorusGeometry(.023,.005,7,14),0xd9e6e1,.238,.047,.16).rotation.y=Math.PI/2;
 mesh(meal,new THREE.CylinderGeometry(.037,.037,.004,16),0x936039,.19,.086,.16);

 const spoon=new THREE.Group();spoon.name='mom-spoon';anchor.add(spoon);
 mesh(spoon,new THREE.CylinderGeometry(.008,.006,1,9),0xa77547,0,.5,0);
 mesh(spoon,new THREE.SphereGeometry(.027,12,8),0xb38458,0,0,0).scale.set(.72,1.35,.37);
 const up=new THREE.Vector3(0,1,0),axis=new THREE.Vector3();
 function moveSpoon(grip,tip){
  axis.subVectors(grip,tip);
  spoon.position.copy(tip);spoon.scale.y=axis.length();
  spoon.quaternion.setFromUnitVectors(up,axis.normalize());
 }

 const duvetCenterZ=-5.37,duvetGeo=new THREE.PlaneGeometry(.94,1.19,24,32);
 duvetGeo.rotateX(-Math.PI/2);
 const points=duvetGeo.getAttribute('position');
 for(let i=0;i<points.count;i++){
  const x=points.getX(i),z=points.getZ(i)+duvetCenterZ;
  const bodyWidth=.205+.068*(1-characterEase((z+5.75)/.27));
  const drape=characterEase((.47-Math.abs(x))/(.47-bodyWidth))*characterEase((-4.775-z)/.08);
  const rise=.257-.115*characterEase((z+5.75)/.55)+.071*Math.exp(-((z+4.965)**2)/.024);
  points.setY(i,.025+drape*(rise+.005*Math.sin(x*30+z*8)));
 }
 duvetGeo.computeVertexNormals();
 const duvet=mesh(anchor,duvetGeo,0x839c95,3.82,.705,duvetCenterZ);
 duvet.name='mom-sleep-blanket';duvet.material.side=THREE.DoubleSide;

 const tableBounds=[-3.615,-4.53,-2.895,-3.53,.40,.47];
 const tv=createApartmentTelevision(television),remote=createApartmentRemote(anchor);
 function update(action,settled,time){
  pan.visible=action==='cook';meal.visible=action==='eat';
  spoon.visible=pan.visible||meal.visible;
  food.rotation.y=.18*Math.sin(time*3.2);
  duvet.visible=action==='sleep'&&settled;
  duvet.position.y=.705+.003*Math.sin(time*1.7);

 }
 return {pan,meal,moveSpoon,update,tv,remote,tableBounds};
}

function buildApartmentMom(scene,floorScale,door,television){
 const anchor=new THREE.Group();anchor.scale.set(1/floorScale,1,1/floorScale);scene.add(anchor);
 const model=buildClassroomCharacter(apartmentMomAsset,'apartment-mom',.822,1.12,undefined,{phase:.08,armSwing:.68,bodySway:.72});
 const {root,pose,standingHeight,cycleLength}=model;
 root.scale.x=1;anchor.add(root);root.updateWorldMatrix(true,true);
 model.mesh.material.map.encoding=THREE.sRGBEncoding;model.mesh.material.emissive.setHex(0x0b0907);
 const eyes=buildApartmentMomEyes(model,apartmentMomEyeProfile);
 const shadow=createClassroomCharacterShadow(anchor),props=createApartmentMomProps(anchor,television);
 scene.userData.furniture.push({kind:'coffeeTable',room:'Гостиная',position:[-3.255,.47,-4.03]});
 const sofaFeet=[[-4.206,.08091,-3.89821],[-4.206,.08091,-4.10179]],seatedFeet=[[-4.296,.210,-3.89821],[-4.296,.210,-4.10179]];
 const hub=[0,-.65],bathOutside=[-.64,2.04],bathInside=[-2.4,2.04];
 const stations={
  cook:{route:[[.90,1.20],[3.7665,1.09]],yaw:Math.PI},
  eat:{route:[[.90,1.45],[1.92,1.58],[2.27,2.91]],yaw:Math.PI/2,
   seat:{x:2.7925,z:3.007,height:.593,yaw:Math.PI/2,sitting:1,lean:.06}},
   sofa:{route:[[-1.84,-1.64],[-3.97,-2.94],[-4.18,-4.00]],yaw:Math.PI/2,
    seat:{x:-4.64,z:-4.00,height:.644,yaw:Math.PI/2,sitting:1,lean:-.045,footLock:1}},
  bedroom:{route:[[1.70,-2.40],[3.13,-5.47]],yaw:-Math.PI/2,
   edge:{x:3.54,z:-5.47,yaw:-Math.PI/2,height:.765,sitting:1,lean:.07},
   bed:{x:3.82,z:-4.98,y:.815,pitch:-Math.PI/2,yaw:0,height:standingHeight,sitting:0,lean:0}},
  bathroom:{route:[[0,1.85],bathOutside],yaw:-Math.PI/2}
 };
 const zone={cook:'cook',eat:'eat',rest:'sofa',tv:'sofa',sleep:'bedroom',bathroom:'bathroom'};
 const ease=characterEase,mix=THREE.MathUtils.lerp;
 const turnDelta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
 function standing(station){
  const [x,z]=station.route.at(-1);
  return {x,z,yaw:station.yaw,height:standingHeight};
 }
 function restPose(action){
  const station=stations[zone[action]];
  if(action==='bathroom')return {x:bathInside[0],z:bathInside[1],yaw:-Math.PI/2,height:standingHeight};
  return station.bed??station.seat??standing(station);
 }
 function createTransition(previous,action){
  const from=stations[zone[previous]],to=stations[zone[action]],initial=restPose(previous),final=restPose(action);
  const sequence=buildClassroomSequence({x:initial.x,z:initial.z,yaw:initial.yaw},cycleLength,standingHeight,true,1);
  const access={};
  const events={};
  if(from===to&&action!=='tv'&&previous!=='tv')return {sequence,final,access,events};
   function changePose(a,b,seconds,bed=false){
   const yaw=turnDelta(a.yaw,b.yaw),fromState=sequence.state();
   sequence.clip(seconds,t=>{
    const k=ease(t),pitch=mix(a.pitch??0,b.pitch??0,k),height=mix(a.height??standingHeight,b.height??standingHeight,k);
    const hipLift=bed?mix((a.y??0)+(a.height??standingHeight)*Math.cos(a.pitch??0),
     (b.y??0)+(b.height??standingHeight)*Math.cos(b.pitch??0),k)-height*Math.cos(pitch):mix(a.y??0,b.y??0,k);
    return {...fromState,x:mix(a.x,b.x,k),z:mix(a.z,b.z,k),yaw:a.yaw+yaw*k,height,
     sitting:mix(a.sitting??0,b.sitting??0,k),lean:mix(a.lean??0,b.lean??0,k)+.14*Math.sin(Math.PI*t),
      y:hipLift,pitch,footLock:a===stations.sofa.seat||b===stations.sofa.seat?1:0};
   });
   sequence.setPosition({x:b.x,z:b.z,yaw:b.yaw});
  }
  function follow(points,speed=1.22){
   const start=sequence.state(),first=points.find(([x,z])=>Math.hypot(x-start.x,z-start.z)>.01);
   if(!first)return;
   sequence.turn(Math.atan2(first[0]-start.x,first[1]-start.z));
   sequence.walkRoute(points,speed,.16);
  }
  function crossBathroom(entering){
   sequence.turn(entering?-Math.PI/2:Math.PI/2);
   const approach=sequence.state();
   access.entering=entering;
   access.waitAt=sequence.duration;
   access.openAt=sequence.duration;
   sequence.clip(.74,t=>({...approach,reach:.34*Math.sin(Math.PI*t)}));
   access.crossAt=sequence.duration;
   follow([entering?bathInside:bathOutside],1.04);
   access.closeAt=sequence.duration;
  }

   function pressRemote(turnOn,stance=stations.sofa.seat){
    sequence.clip(.68,t=>({...stance,aimRemote:ease(t)}));
    events[turnOn?'powerOnAt':'powerOffAt']=sequence.duration+.15;
    sequence.clip(.30,t=>({...stance,aimRemote:1,pressRemote:Math.sin(Math.PI*t)}));
    sequence.clip(.58,t=>({...stance,aimRemote:1-ease(t)}));
  }
  function reachRemote(taking){
   sequence.turn(Math.PI);
   const atTable=sequence.state();
    sequence.clip(1.08,t=>{
    const k=ease(t);
     return {...atTable,height:mix(standingHeight,.53,k),lean:.85*k,headPitch:.30*k,remoteReach:k};
   });
    events[taking?'pickupAt':'putDownAt']=sequence.duration+.16;
    sequence.clip(.24,()=>({...atTable,height:.53,lean:.85,headPitch:.30,remoteReach:1}));
    sequence.clip(1.06,t=>{
    const k=ease(t);
     return {...atTable,height:mix(.53,standingHeight,k),lean:.85*(1-k),headPitch:.30*(1-k),
     remoteReach:taking?1:1-k,remoteLift:taking?k:0};
   });
  }

  if(previous==='tv')pressRemote(false);
  if(from.bed){changePose(from.bed,from.edge,1.6,true);changePose(from.edge,standing(from),.98)}
   else if(from.seat)changePose(from.seat,standing(from),from===stations.sofa?1.65:1.12);
  else if(previous==='bathroom')crossBathroom(false);

  if(previous==='tv'){
    follow([[-3.97,-2.94],[-2.96,-3.12]]);
   reachRemote(false);
   follow([[-1.84,-1.64],hub,...to.route]);
  }else if(action==='tv'){
    const pickup=[[-1.84,-1.64],[-2.96,-3.12]];
    follow(from===stations.sofa?[[-3.97,-2.94],[-2.96,-3.12]]:
    [...from.route.slice(0,-1).reverse(),hub,...pickup]);
   reachRemote(true);
   follow([[-3.97,-2.94],...to.route.slice(-1)]);
  }else if(previous==='cook'&&action==='eat'){
   follow([[2.27,1.58],...to.route.slice(-1)]);
  }else{
   follow([...from.route.slice(0,-1).reverse(),hub,...to.route]);
  }

  if(action==='bathroom')crossBathroom(true);
  else{
   sequence.turn(to.yaw);
   if(to.bed){changePose(standing(to),to.edge,1.10);changePose(to.edge,to.bed,1.90,true)}
    else if(to.seat){
     if(action==='tv')pressRemote(true,standing(to));
     events.sitStart=sequence.duration;changePose(standing(to),to.seat,to===stations.sofa?1.75:1.35);events.sitEnd=sequence.duration;
    }
  }
  return {sequence,final,access,events};
 }
 const transitions=apartmentMomSchedule.map(({action},i)=>createTransition(apartmentMomSchedule.at(i-1).action,action));
 let lastClock=null,phase=-1,elapsed=0,activity=null,ownsDoor=false;
  const point=new THREE.Vector3(),gripPoint=new THREE.Vector3(),tipPoint=new THREE.Vector3(),remotePosition=new THREE.Vector3(),remoteRotation=new THREE.Quaternion(),aimMatrix=new THREE.Matrix4(),tvPosition=new THREE.Vector3();
  let snapshot=null;
 function insideBathroom(player){return player&&player.x<door.hinge.x-.12&&player.z>=.05*floorScale&&player.z<=2.2*floorScale}
 function update(clockMs,player,sync=false){
  const dayMs=GAME_DAY_MINUTES*REAL_MS_PER_GAME_MINUTE,day=Math.floor(clockMs/dayMs),local=clockMs%dayMs;
  const minute=local/REAL_MS_PER_GAME_MINUTE;
  let index=apartmentMomSchedule.length-1;
  while(minute<apartmentMomSchedule[index].minute)index--;
  const slot=apartmentMomSchedule[index],track=transitions[index],id=day*apartmentMomSchedule.length+index;
  const scheduled=(local-slot.minute*REAL_MS_PER_GAME_MINUTE)/1000;
  const seek=sync||lastClock===null||clockMs<lastClock||clockMs-lastClock>1500;
  const delta=lastClock===null?0:Math.max(0,clockMs-lastClock)/1000;
  let next=Math.min(track.sequence.duration,seek?scheduled:phase===id?elapsed+delta:0);
  const {access,events}=track,playerInBath=insideBathroom(player),prior=phase===id?elapsed:0;
  const waitingForBathroom=access.entering&&playerInBath&&next>=access.waitAt&&prior<access.crossAt;
  if(waitingForBathroom)next=access.waitAt;
  if(!waitingForBathroom&&access.openAt!==undefined&&next>=access.openAt&&next<access.closeAt){
   door.occupied=false;
   if(!door.target){door.setOpen(true,seek,-1);ownsDoor=true}
   else if(seek&&door.progress!==1)door.setOpen(true,true);
   if(next>=access.crossAt&&door.progress<.98)next=access.crossAt-.001;
  }
  let sample=track.sequence.sample(next,track.final);
  if(!seek&&phase===id&&player&&sample.walking&&Math.abs(player.feet)<.4&&
     Math.hypot(player.x-sample.x,player.z-sample.z)<.40){
   next=elapsed;sample={...track.sequence.sample(next,track.final),walking:0};
  }
  const usingDoor=access.openAt!==undefined&&next>=access.openAt&&next<access.closeAt;
  const settled=next>=track.sequence.duration;
  const privateDoor=settled&&slot.action==='bathroom'&&!playerInBath;
  if(privateDoor){
   door.occupied=true;door.setOpen(false,seek);ownsDoor=false;
  }else{
   door.occupied=false;
   if(!usingDoor&&ownsDoor){door.setOpen(false,seek);ownsDoor=false}
  }
  phase=id;elapsed=next;lastClock=clockMs;
  activity=settled?slot.action:'walking';
  const time=local/1000;
  root.position.set(sample.x,sample.y??0,sample.z);
  root.rotation.set(sample.pitch??0,sample.yaw,0,'YXZ');
  shadow.visible=activity!=='sleep';shadow.position.set(sample.x,.009,sample.z);
   let handTargets,headPitch=sample.headPitch??0,look=sample.look??0,torsoTurn=sample.torsoTurn??0,leanSide=sample.leanSide??0;
  const previous=apartmentMomSchedule.at(index-1).action;
  const held=slot.action==='tv'?next>=events.pickupAt:previous==='tv'&&next<events.putDownAt;
  const aiming=sample.aimRemote??0,pressing=sample.pressRemote??0;
   const focusTV=slot.action==='tv'&&next>=events.powerOnAt||previous==='tv'&&next<events.powerOffAt;
  if(activity==='cook'){
   const a=time*3.15;
   handTargets=[{x:-.19,y:1.04,z:.33,flex:.12},{x:.10+Math.sin(a)*.043,y:1.135,z:.36+Math.cos(a)*.04,flex:.20}];
   tipPoint.set(.045+Math.sin(a)*.084,.990,.643+Math.cos(a)*.073);
   headPitch=.42;look=.13*Math.sin(time*.9);
  }else if(activity==='eat'){
   const t=time%4.7,lift=ease((t-.65)/.93)*(1-ease((t-2.36)/.96));
   handTargets=[{x:-.14,y:.805,z:.325,flex:.10},
    {x:mix(.095,.060,lift),y:mix(.86,1.148,lift),z:mix(.36,.162,lift),flex:mix(.21,-.17,lift)}];
   tipPoint.set(mix(.05,.016,lift),mix(.836,1.179,lift),mix(.576,.115,lift));
   headPitch=.28-.13*lift;
   }else if(activity==='tv'||focusTV){
    television.getWorldPosition(tvPosition);root.updateWorldMatrix(true,false);point.copy(tvPosition);root.worldToLocal(point);
    let angle=Math.atan2(point.x,point.z);
    if(player&&Math.hypot(player.x-sample.x,player.z-sample.z)<2.1){const glance=ease((time%19-12)/.6)*(1-ease((time%19-13.4)/.7));const p=root.worldToLocal(new THREE.Vector3(player.x,1.55,player.z));angle=mix(angle,Math.atan2(p.x,p.z),glance*.65)}
    torsoTurn=THREE.MathUtils.clamp(angle*.28,-.34,.34);look=THREE.MathUtils.clamp(angle-torsoTurn,-.90,.90);headPitch=-.045+.008*Math.sin(time*.31);leanSide=.006*Math.sin(time*.23);
   }
   else if(activity==='rest'){look=-.16+.13*Math.sin(time*.23);headPitch=.045;leanSide=.009*Math.sin(time*.29)}
  else if(activity==='sleep'){root.position.y+=.003*Math.sin(time*1.7);look=0}
  const handBlend=settled?ease((scheduled-track.sequence.duration)/.42):1;
  if(handTargets)handTargets=handTargets.map(target=>({...target,weight:handBlend}));
   let remoteWeight=0;
   if(held||sample.remoteReach){
    root.updateWorldMatrix(true,false);const sitting=sample.sitting??0,reach=(sample.remoteReach??0)*(1-(sample.remoteLift??0));remoteWeight=held?1:sample.remoteReach;
    remotePosition.set(mix(.14,.105,aiming),mix(mix(.99,sample.height+.12,sitting),sample.height+.31,aiming),mix(.26,.40,aiming));root.localToWorld(remotePosition);
    remoteRotation.setFromEuler(new THREE.Euler(-.10,sample.yaw,0,'YXZ'));television.getWorldPosition(tvPosition);
    aimMatrix.lookAt(tvPosition,remotePosition,new THREE.Vector3(0,1,0));remoteRotation.slerp(new THREE.Quaternion().setFromRotationMatrix(aimMatrix),aiming);
    remotePosition.lerp(anchor.localToWorld(props.remote.home.clone()),reach);remoteRotation.slerp(props.remote.homeRotation,reach);
    const wrist=props.remote.wristTarget(root,remotePosition,remoteRotation);handTargets=[sitting?{x:-.13,y:sample.height+.11,z:.24,flex:.06,weight:sitting}:reach>.01?{x:-.16,y:sample.height+.08,z:.18,flex:.08,weight:reach}:null,{...wrist,weight:remoteWeight}];
    if(aiming){const target=root.worldToLocal(tvPosition.clone()),angle=Math.atan2(target.x,target.z),turn=THREE.MathUtils.clamp(angle*.28,-.34,.34);torsoTurn=mix(torsoTurn,turn,aiming);look=mix(look,THREE.MathUtils.clamp(angle-turn,-.90,.90),aiming);headPitch=mix(headPitch,-.04,aiming)}
   }
  const sleeping=THREE.MathUtils.clamp(-(sample.pitch??0)/(Math.PI/2),0,1);
   pose({...sample,time,look,headPitch,torsoTurn,leanSide,handTargets,sleeping});
   if(sample.footLock){const k=ease(sample.sitting??0),feet=sofaFeet.map((point,i)=>point.map((v,j)=>mix(v,seatedFeet[i][j],k)));applyApartmentMomFeet(model,anchor,feet,stations.sofa.yaw)}
   if(remoteWeight)props.remote.orientHand(root,remoteWeight);
   eyes.sample(time,sleeping);
  if(handTargets&&(activity==='cook'||activity==='eat')){
   root.updateWorldMatrix(true,false);
   const wrist=handTargets[1];
   gripPoint.set(wrist.x,wrist.y-.008,wrist.z+.069);
   props.moveSpoon(root.localToWorld(gripPoint),root.localToWorld(tipPoint));
  }
   props.remote.update(root,held,remotePosition,pressing);
  props.update(activity,settled,time);
  const watching=slot.action==='tv'?next>=events.powerOnAt:previous==='tv'&&next<events.powerOffAt;
  const tvIndex=apartmentMomSchedule.findIndex(item=>item.action==='tv');
  const onAt=transitions[tvIndex].events.powerOnAt;
  const contentSeconds=(local-apartmentMomSchedule[tvIndex].minute*REAL_MS_PER_GAME_MINUTE)/1000-onAt;
  props.tv.update(watching,Math.max(0,contentSeconds),day,seek);
   snapshot={action:slot.action,activity,elapsed:next,duration:track.sequence.duration,settled,held,aiming,pressing,sitting:sample.sitting??0,height:sample.height,footLock:!!sample.footLock,position:root.position.toArray(),events:{...events},gripError:props.remote.state.gripError};
 }
  return {name:'Мама',model,eyes,props,stations,schedule:apartmentMomSchedule,get activity(){return activity},get state(){return snapshot},
   get television(){return props.tv},get remote(){return props.remote.mesh},update};
}
