const MEDVEDEV=Object.freeze({id:'guard-medvedev',name:'Медведев',role:'Охранник',outsideMinute:420,enterMinute:660,dialogueStart:540,dialogueEnd:600});
function buildMedvedevCharacter(){
 const asset=medvedevAsset,bytes=Uint8Array.from(atob(asset.mesh),c=>c.charCodeAt(0));let offset=0;
 function read(Type,count){const values=new Type(bytes.buffer,offset,count);offset=Math.ceil((offset+values.byteLength)/4)*4;return values;}
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(Float32Array.from(read(Int16Array,asset.vertices*3),v=>v/12000),3));
 geometry.setAttribute('normal',new THREE.BufferAttribute(read(Int8Array,asset.vertices*3),3,true));
 geometry.setAttribute('uv',new THREE.BufferAttribute(read(Uint16Array,asset.vertices*2),2,true));
 geometry.setAttribute('skinIndex',new THREE.BufferAttribute(read(Uint8Array,asset.vertices*4),4));
 geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(Float32Array.from(read(Uint8Array,asset.vertices*4),v=>v/255),4));
 geometry.setIndex(new THREE.BufferAttribute(read(Uint16Array,asset.indexCount),1));
 function texture(source){const image=document.createElement('img'),map=new THREE.Texture(image);map.flipY=false;map.anisotropy=4;image.onload=()=>map.needsUpdate=true;image.src=source;return map;}
 const color=texture(asset.maps.color),surface=texture(asset.maps.surface);
 const material=new THREE.MeshStandardMaterial({map:color,normalMap:texture(asset.maps.normal),normalScale:new THREE.Vector2(.8,.8),roughnessMap:surface,metalnessMap:surface,roughness:1,metalness:1,skinning:true,emissive:0x101010,emissiveMap:color});
 const mesh=new THREE.SkinnedMesh(geometry,material);mesh.name=MEDVEDEV.id+'-imported-mesh';mesh.frustumCulled=false;
 const root=new THREE.Group();root.name=MEDVEDEV.id;root.userData={characterId:MEDVEDEV.id,characterName:MEDVEDEV.name,role:MEDVEDEV.role};
 const jointSet=new Set(asset.skin.joints),objects=asset.nodes.map((node,i)=>{
  const object=node.mesh!==undefined?mesh:jointSet.has(i)?new THREE.Bone():new THREE.Object3D();
  if(object!==mesh)object.name=MEDVEDEV.id+'-'+node.name;
  if(node.translation)object.position.fromArray(node.translation);if(node.rotation)object.quaternion.fromArray(node.rotation);if(node.scale)object.scale.fromArray(node.scale);return object;
 });
 asset.nodes.forEach((node,i)=>node.children?.forEach(child=>objects[i].add(objects[child])));asset.roots.forEach(i=>root.add(objects[i]));
 const inverseBytes=Uint8Array.from(atob(asset.inverseBind),c=>c.charCodeAt(0)),inverses=new Float32Array(inverseBytes.buffer);
 const skeleton=new THREE.Skeleton(asset.skin.joints.map(i=>objects[i]),asset.skin.joints.map((_,i)=>new THREE.Matrix4().fromArray(inverses,i*16)));
 root.updateMatrixWorld(true);mesh.bind(skeleton,new THREE.Matrix4());skeleton.pose();root.updateMatrixWorld(true);
 const names=Object.fromEntries(asset.skin.joints.map(i=>[asset.nodes[i].name,objects[i]]));
 const base=asset.skin.joints.map(i=>({bone:objects[i],position:objects[i].position.clone(),quaternion:objects[i].quaternion.clone()}));
 const baseByName=Object.fromEntries(base.map(b=>[b.bone.name,b]));
 const eyes=buildMedvedevEyes(THREE,names.Head,asset.eyes);
 const decode=s=>new Float32Array(Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer);
 function makeClip(definition){return new THREE.AnimationClip(definition.name,definition.duration,definition.tracks.map(track=>{
  const Track=track.path==='rotation'?THREE.QuaternionKeyframeTrack:THREE.VectorKeyframeTrack,property={rotation:'quaternion',translation:'position',scale:'scale'}[track.path];
  return new Track(objects[track.node].name+'.'+property,decode(track.times),decode(track.values));
 }));}
 const stance=makeClip(asset.animations[0]),sourceWalk=makeClip(asset.animations[1]),walk=sourceWalk.clone();walk.name='Medvedev_Walk_InPlace';
 const hipTrack=walk.tracks.find(t=>t.name===names.Hips.name+'.position');
 const firstZ=hipTrack.values[2],lastZ=hipTrack.values.at(-1);
 for(let i=0;i<hipTrack.times.length;i++)hipTrack.values[i*3+2]-=hipTrack.times[i]/walk.duration*(lastZ-firstZ);
 const samplers=clip=>clip.tracks.map(track=>{const split=track.name.lastIndexOf('.');return {bone:root.getObjectByName(track.name.slice(0,split)),property:track.name.slice(split+1),interpolant:track.createInterpolant()};});
 const idle=makeClip(asset.animations[2]),walkSamplers=samplers(walk),stanceSamplers=samplers(stance),idleSamplers=samplers(idle);
 for(const clip of [idle])for(const track of clip.tracks)if(track.name===names.Hips.name+'.position')for(let i=0;i<track.times.length;i++){track.values[i*3]=0;track.values[i*3+2]=0;}
 const standingHeight=names.Hips.position.y,frame=new THREE.Matrix4();
 const limbs=[['Left',1],['Right',-1]].map(([side,sign])=>{
  const hand=names[side+'Hand'],middle=names[side+'HandMiddle1'];
  const handWorld=hand.getWorldQuaternion(new THREE.Quaternion()),direction=middle.position.clone().applyQuaternion(handWorld).normalize();
  return {side,sign,arm:names[side+'Arm'],elbow:names[side+'ForeArm'],hand,thigh:names[side+'UpLeg'],knee:names[side+'Leg'],foot:names[side+'Foot'],footOrientation:names[side+'Foot'].getWorldQuaternion(new THREE.Quaternion()),
   standingHand:new THREE.Quaternion().setFromUnitVectors(direction,new THREE.Vector3(0,-1,0)).multiply(handWorld),
   sittingHand:new THREE.Quaternion().setFromUnitVectors(direction,new THREE.Vector3(0,0,1)).multiply(handWorld)};
 });
 function restore(){for(const entry of base){entry.bone.position.copy(entry.position);entry.bone.quaternion.copy(entry.quaternion);}}
 function solve(upper,lower,end,target,pole,endRotation,blend=1){
  const previous=[upper.quaternion.clone(),lower.quaternion.clone(),end.quaternion.clone()];
  upper.parent.updateWorldMatrix(true,false);root.updateWorldMatrix(true,false);
  const transform=frame.copy(upper.parent.matrixWorld).invert().multiply(root.matrixWorld);
  const desired=target.clone().applyMatrix4(transform).sub(upper.position),distance=desired.length();
  const a=lower.position.length(),b=end.position.length(),d=THREE.MathUtils.clamp(distance,Math.abs(a-b)+.001,a+b-.001),direction=desired.normalize();
  const bend=pole.clone().transformDirection(transform);bend.addScaledVector(direction,-bend.dot(direction)).normalize();
  const along=(a*a+d*d-b*b)/(2*d),joint=direction.clone().multiplyScalar(along).addScaledVector(bend,Math.sqrt(Math.max(0,a*a-along*along)));
  const upperBase=baseByName[upper.name].quaternion,lowerBase=baseByName[lower.name].quaternion;
  const reference=lower.position.clone().applyQuaternion(upperBase).normalize();
  upper.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(reference,joint.clone().normalize()).multiply(upperBase));
  const endDirection=direction.multiplyScalar(d).sub(joint).normalize().applyQuaternion(upper.quaternion.clone().invert());
  lower.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(end.position.clone().applyQuaternion(lowerBase).normalize(),endDirection).multiply(lowerBase));
  upper.updateWorldMatrix(true,true);
  end.quaternion.copy(end.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(root.getWorldQuaternion(new THREE.Quaternion())).multiply(endRotation));
  if(blend<1){upper.quaternion.copy(previous[0].slerp(upper.quaternion,blend));lower.quaternion.copy(previous[1].slerp(lower.quaternion,blend));end.quaternion.copy(previous[2].slerp(end.quaternion,blend));}
 }
 function applyNative(list,time,weight=1){for(const s of list){const value=s.interpolant.evaluate(time);if(s.property==='quaternion')s.bone.quaternion.slerp(new THREE.Quaternion().fromArray(value),weight);else if(s.property==='position')s.bone.position.lerp(new THREE.Vector3().fromArray(value),weight);else s.bone.scale.fromArray(value);}}
 function pose(state={}){
  restore();const {height=standingHeight,sitting=0,walking=0,gait=0,time=0,lean=0,look=0,turning,gripTarget,grip=0,reach=0}=state;
  names.Hips.position.y=height+.002*Math.sin(time*1.8)*(1-walking);
  names.Spine.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(lean,0,.004*Math.sin(time*.8))));
  names.Head.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-lean*.4,look,0)));
  root.updateWorldMatrix(true,true);
  for(const limb of limbs){
   const {sign,arm,elbow,hand,thigh,knee,foot}=limb;
   solve(thigh,knee,foot,new THREE.Vector3(sign*.10,.105,.012+.43*sitting),new THREE.Vector3(sign*.04,.1,1),limb.footOrientation);
   const y=THREE.MathUtils.lerp(standingHeight-.02,height+.10,sitting),z=THREE.MathUtils.lerp(.025,.255,sitting)+reach*.09;
   solve(arm,elbow,hand,new THREE.Vector3(sign*THREE.MathUtils.lerp(.265,.14,sitting),y,z),new THREE.Vector3(sign*.55,-.7,.12),limb.standingHand.clone().slerp(limb.sittingHand,sitting));
  }
  if(sitting<.001)applyNative(idleSamplers,((time%idle.duration)+idle.duration)%idle.duration);
  const turningWeight=turning?.progress!==undefined?.3*Math.sin(Math.PI*turning.progress):0;
  const weight=Math.max(walking,turningWeight),phase=(gait+(turning?.progress??0)*.5)*walk.duration;
  if(weight>0)applyNative(walkSamplers,((phase%walk.duration)+walk.duration)%walk.duration,weight);
  if(gripTarget&&grip>0){const limb=limbs.find(l=>l.side==='Right');solve(limb.arm,limb.elbow,limb.hand,gripTarget,new THREE.Vector3(-.4,-.5,.4),limb.standingHand,grip);}
  names.Head.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,look,0)));
  eyes.sample(time);
  root.userData.activity=sitting>.99?'seated':walking>.01?'walking':turning?'turning':'standing';
 }
 function sampleStance(seconds){restore();applyNative(stanceSamplers,((seconds%stance.duration)+stance.duration)%stance.duration);eyes.sample(seconds);root.updateWorldMatrix(true,true);}
 // The college exterior has no X mirror.
 root.scale.x=1;pose();
 return {root,mesh,names,eyes,pose,sampleStance,clips:{walk,sourceWalk,stance,idle},standingHeight,cycleLength:asset.stride};
}

function createMedvedevRoutine(post){
 const model=buildMedvedevCharacter(),height=model.standingHeight;
 S.add(model.root);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.34,20),new THREE.MeshBasicMaterial({color:0x111b22,transparent:true,opacity:.19,depthWrite:false}));
 shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;model.root.add(shadow);
 const outside={x:3.65,z:36.75,yaw:-Math.PI/2,height,sitting:0,gait:0};
 const inside={x:6.8,z:38.9,yaw:Math.PI/2,height:.555,sitting:1,lean:.055,gait:0};
 const make=start=>buildClassroomSequence(start,model.cycleLength,height,true,1);
 const hold=(s,seconds,values={})=>{const at=s.state();s.clip(seconds,t=>({...at,...(typeof values==='function'?values(t):values)}));};
 const entry=make(outside);
 entry.walk(3.65,38.25,1.02);entry.walk(4.62,38.25,.94);
 const entryOpen=entry.duration;
 hold(entry,.72,t=>({grip:Math.sin(Math.PI*t),lean:.08*Math.sin(Math.PI*t)}));
 entry.walk(6.55,38.25,.98);
 const entryClose=entry.duration;
 hold(entry,.75);entry.walk(6.8,38.9,.85);entry.turn(Math.PI/2);
 const beforeSit=entry.state();
 entry.clip(1.10,t=>({...beforeSit,sitting:characterEase(t),height:THREE.MathUtils.lerp(height,.555,characterEase(t)),lean:.055*characterEase(t)}));
 const exit=make(inside);
 exit.clip(.95,t=>({...inside,sitting:1-characterEase(t),height:THREE.MathUtils.lerp(.555,height,characterEase(t)),lean:.15*Math.sin(Math.PI*t)}));
 exit.setPosition({sitting:0,height,lean:0});exit.walk(6.55,38.25,.85);exit.walk(5.78,38.25,.94);
 const exitOpen=exit.duration;
 hold(exit,.72);exit.walk(4.0,38.25,.98);
 const exitClose=exit.duration;
 hold(exit,.75);exit.walkRoute([[3.65,38.25],[3.65,36.75]],1.02,.18);exit.turn(-Math.PI/2);
 const doorAmount=(seconds,openAt,closeAt)=>seconds<openAt?0:seconds<openAt+.72?(seconds-openAt)/.72:seconds<closeAt?1:Math.max(0,1-(seconds-closeAt)/.75);
 const groundAt=x=>.335*characterEase((x-4.0)/1.05);
 let travel={key:null,delay:0,lastMs:null},lastMs=null,phase='inside',waiting=false;
 let armed=true,windowDay=null,lastLineMs=-Infinity,playingUntil=0,audio=null,retryButton=null,lineCount=0;
 const voice=medvedevDialogue.hurry;
 function removeRetry(){retryButton?.remove();retryButton=null;}
 function pauseDialogue(){audio?.pause();audio=null;playingUntil=0;removeRetry();}
 function playLine(ms,player){
  pauseDialogue();lineCount++;lastLineMs=ms;playingUntil=ms+voice.ms;
  showNotice(MEDVEDEV.name+': «'+voice.text+'»',voice.ms+650);
  audio=new Audio(voice.audio);audio.volume=Math.min(1,Math.max(.35,1-Math.hypot(player.x-model.root.position.x,player.z-model.root.position.z)/12));
  const spoken=audio;
  spoken.play().catch(()=>{
   if(audio!==spoken||currentLocation!=='college')return;
   retryButton=document.createElement('button');retryButton.id='medvedev-voice-retry';retryButton.textContent='Медведев · включить звук';
   retryButton.style.cssText='position:fixed;left:50%;top:110px;transform:translateX(-50%);z-index:25;padding:10px 16px;border:0;border-radius:10px;background:#20436b;color:white;font:600 15px Arial';
   retryButton.onclick=()=>{spoken.currentTime=0;spoken.play().then(removeRetry).catch(()=>{});};document.body.append(retryButton);
  });
 }
 function update(ms,player=null,sync=false){
  const minute=(ms/REAL_MS_PER_GAME_MINUTE)%GAME_DAY_MINUTES,day=Math.floor(ms/REAL_MS_PER_GAME_MINUTE/GAME_DAY_MINUTES)+1;
  const secondsPerMinute=REAL_MS_PER_GAME_MINUTE/1000;
  if(sync||lastMs!==null&&ms<lastMs){travel={key:null,delay:0,lastMs:null};pauseDialogue();armed=true;}
  let state,door=0,sequence=null,raw=0,endState=null,openAt=0,closeAt=0;
  if(minute>=MEDVEDEV.outsideMinute&&minute<MEDVEDEV.enterMinute){
   phase='leaving';sequence=exit;raw=(minute-MEDVEDEV.outsideMinute)*secondsPerMinute;endState=outside;openAt=exitOpen;closeAt=exitClose;
  }else if(minute>=MEDVEDEV.enterMinute){
   phase='entering';sequence=entry;raw=(minute-MEDVEDEV.enterMinute)*secondsPerMinute;endState=inside;openAt=entryOpen;closeAt=entryClose;
  }else{phase='inside';state=inside;}
  waiting=false;
  if(sequence){
   const key=day+':'+phase;
   if(travel.key!==key)travel={key,delay:0,lastMs:ms};
   const dt=travel.lastMs===null?0:Math.max(0,ms-travel.lastMs);travel.lastMs=ms;
   let sampleTime=Math.max(0,raw-travel.delay/1000);
   state=sequence.sample(sampleTime,endState);
   if(!sync&&dt>0&&dt<250&&state.walking>.05&&player&&Math.abs((player.feet??0)-groundAt(state.x))<1.7){
    const next=Math.hypot(player.x-state.x,player.z-state.z),previous=Math.hypot(player.x-model.root.position.x,player.z-model.root.position.z);
    if(next<.72&&next<previous+.001){travel.delay+=dt;sampleTime=Math.max(0,raw-travel.delay/1000);state=sequence.sample(sampleTime,endState);state={...state,walking:0};waiting=true;}
   }
   if(sampleTime>=sequence.duration){phase=endState===inside?'inside':'outside';state=endState;}
   else door=doorAmount(sampleTime,openAt,closeAt);
  }
  const y=groundAt(state.x);model.root.position.set(state.x,y,state.z);model.root.rotation.y=state.yaw;
  let look=0;
  if(phase==='outside'&&player&&Math.hypot(player.x-state.x,player.z-state.z)<5){const angle=Math.atan2(player.x-state.x,player.z-state.z)-state.yaw;look=THREE.MathUtils.clamp(Math.atan2(Math.sin(angle),Math.cos(angle)),-.60,.60);}
  let gripTarget;
  if(state.grip>0){model.root.updateWorldMatrix(true,false);gripTarget=model.root.worldToLocal(new THREE.Vector3(5.08,1.25,38.66));}
  model.pose({...state,time:ms/1000,look,gripTarget});
  if(ms<playingUntil)model.names.Head.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(.035*Math.sin(ms/115),0,0)));
  post.setDoorOpen(door);model.root.userData.schedulePhase=phase;model.root.userData.waiting=waiting;
  const eligible=minute>=MEDVEDEV.dialogueStart&&minute<MEDVEDEV.dialogueEnd&&phase==='outside';
  if(windowDay!==day){windowDay=day;armed=true;lastLineMs=-Infinity;}
  const distance=player?Math.hypot(player.x-state.x,player.z-state.z):Infinity;
  if(!eligible||distance>4.5)armed=true;
  const playable=currentLocation==='college'&&!document.hidden&&sh<=sw&&document.getElementById('start').style.display==='none';
  if(!playable||!eligible||distance>9)pauseDialogue();
  if(!sync&&playable&&eligible&&armed&&distance<3.1&&Math.abs(C.position.y-y-1.7)<1.7&&ms-lastLineMs>=6000){armed=false;playLine(ms,player);}
  lastMs=ms;
  return {phase,waiting,position:model.root.position.toArray(),door,eligible,lineCount};
 }
 function blocks(x,z,feet=0){return phase!=='inside'&&feet<model.root.position.y+1.85&&feet+1.65>model.root.position.y&&Math.hypot(x-model.root.position.x,z-model.root.position.z)<.60;}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseDialogue();});
 return {name:MEDVEDEV.name,model,update,blocks,pauseDialogue,voice:characterVoices.medvedev,
  schedule:{outsideMinute:420,enterMinute:660,dialogueStart:540,dialogueEnd:600,entryDuration:entry.duration,exitDuration:exit.duration,entryOpen,entryClose,exitOpen,exitClose},
  get state(){return {phase,waiting,position:model.root.position.toArray(),lineCount,armed,voicePlaying:audio!==null&&!audio.paused,delay:travel.delay};}};
}
