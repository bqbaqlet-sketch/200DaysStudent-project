const NVP_TEACHER=Object.freeze({id:'nvp-110',characterName:'Анатолий',role:'Преподаватель НВП',room:'110',seatedMinute:7*60+35});
function buildNvpCharacter(){
 const asset=nvpTeacherAsset,bytes=Uint8Array.from(atob(asset.mesh),c=>c.charCodeAt(0));let offset=0;
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
 const mesh=new THREE.SkinnedMesh(geometry,material);mesh.name=NVP_TEACHER.id+'-imported-mesh';mesh.frustumCulled=false;
 const root=new THREE.Group();root.name=NVP_TEACHER.id;root.userData={characterId:NVP_TEACHER.id,role:NVP_TEACHER.role,room:'110',stanceReserved:true};
 const jointSet=new Set(asset.skin.joints),objects=asset.nodes.map((node,i)=>{
  const object=node.mesh!==undefined?mesh:jointSet.has(i)?new THREE.Bone():new THREE.Object3D();
  if(object!==mesh)object.name=NVP_TEACHER.id+'-'+node.name;
  if(node.translation)object.position.fromArray(node.translation);if(node.rotation)object.quaternion.fromArray(node.rotation);if(node.scale)object.scale.fromArray(node.scale);return object;
 });
 asset.nodes.forEach((node,i)=>node.children?.forEach(child=>objects[i].add(objects[child])));asset.roots.forEach(i=>root.add(objects[i]));
 const inverseBytes=Uint8Array.from(atob(asset.inverseBind),c=>c.charCodeAt(0)),inverses=new Float32Array(inverseBytes.buffer);
 const skeleton=new THREE.Skeleton(asset.skin.joints.map(i=>objects[i]),asset.skin.joints.map((_,i)=>new THREE.Matrix4().fromArray(inverses,i*16)));
 root.updateMatrixWorld(true);mesh.bind(skeleton,new THREE.Matrix4());skeleton.pose();root.updateMatrixWorld(true);
 const names=Object.fromEntries(asset.skin.joints.map(i=>[asset.nodes[i].name,objects[i]]));
 const base=asset.skin.joints.map(i=>({bone:objects[i],position:objects[i].position.clone(),quaternion:objects[i].quaternion.clone()}));
 const baseByName=Object.fromEntries(base.map(b=>[b.bone.name,b]));
 const decode=s=>new Float32Array(Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer);
 function makeClip(definition){return new THREE.AnimationClip(definition.name,definition.duration,definition.tracks.map(track=>{
  const Track=track.path==='rotation'?THREE.QuaternionKeyframeTrack:THREE.VectorKeyframeTrack,property={rotation:'quaternion',translation:'position',scale:'scale'}[track.path];
  return new Track(objects[track.node].name+'.'+property,decode(track.times),decode(track.values));
 }));}
 const stance=makeClip(asset.animations[0]),sourceWalk=makeClip(asset.animations[1]),walk=sourceWalk.clone();walk.name='NVP_Walk_InPlace';
 const hipTrack=walk.tracks.find(t=>t.name===names.Hips.name+'.position');
 const firstZ=hipTrack.values[2],lastZ=hipTrack.values.at(-1);
 for(let i=0;i<hipTrack.times.length;i++)hipTrack.values[i*3+2]-=hipTrack.times[i]/walk.duration*(lastZ-firstZ);
 const samplers=clip=>clip.tracks.map(track=>{const split=track.name.lastIndexOf('.');return {bone:root.getObjectByName(track.name.slice(0,split)),property:track.name.slice(split+1),interpolant:track.createInterpolant()};});
 const walkSamplers=samplers(walk),stanceSamplers=samplers(stance);
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
  const turningWeight=turning?.progress!==undefined?.3*Math.sin(Math.PI*turning.progress):0;
  const weight=Math.max(walking,turningWeight),phase=(gait+(turning?.progress??0)*.5)*walk.duration;
  if(weight>0)applyNative(walkSamplers,((phase%walk.duration)+walk.duration)%walk.duration,weight);
  if(gripTarget&&grip>0){const limb=limbs.find(l=>l.side==='Right');solve(limb.arm,limb.elbow,limb.hand,gripTarget,new THREE.Vector3(-.4,-.5,.4),limb.standingHand,grip);}
  root.userData.activity=sitting>.99?'seated':walking>.01?'walking':turning?'turning':'standing';
 }
 function sampleStance(seconds){restore();applyNative(stanceSamplers,((seconds%stance.duration)+stance.duration)%stance.duration);root.updateWorldMatrix(true,true);}
 // Counter the historical X mirror of the first college scene, as the other NPCs do.
 root.scale.x=-1;pose();
 return {root,mesh,names,pose,sampleStance,clips:{walk,sourceWalk,stance},standingHeight,cycleLength:asset.stride};
}

function buildNvp110Routine(anchor,chair,crossing){
 const model=buildNvpCharacter(),{standingHeight,cycleLength}=model;
 const fromPlan=anchor.matrix.clone().invert();
 const entrance=[[.55,.68],[.55,3.48],[.85,4.28],[.85,8.975]].map(([x,z])=>new THREE.Vector3(-x,0,z).applyMatrix4(fromPlan));
 const first=entrance[0],second=entrance[1],chairHome=chair.position.x,seatZ=chair.position.z;
 const sequence=buildClassroomSequence({x:first.x,z:first.z,yaw:Math.atan2(second.x-first.x,second.z-first.z),chairPosition:chairHome},cycleLength,standingHeight,true,1);
 sequence.walkRoute([...entrance.slice(1).map(p=>[p.x,p.z]),[-.18,-1.10],[0,-.94]],1.76,.22);sequence.turn(0);
 const queueAt=sequence.duration-.45,handle=sequence.state();
 sequence.clip(.32,t=>({...handle,grip:characterEase(t),lean:.08*characterEase(t)}));
 const openAt=sequence.duration;
 sequence.clip(classroomDoorSwingSeconds+.05,t=>({...handle,grip:1-characterEase(t),lean:.08*(1-characterEase(t))}));
 const enterAt=sequence.duration;sequence.walk(0,1.14,1.68);const clearAt=sequence.duration;
 sequence.walkRoute([[4.15,1.24],[5.10,1.60],[5.12,seatZ-.46]],1.66,.22);sequence.turn(Math.PI/2);
 const pull=sequence.state(),pulledX=chairHome+.22;
 sequence.clip(.75,t=>({...pull,chairPosition:THREE.MathUtils.lerp(chairHome,pulledX,characterEase(t)),reach:.5*Math.sin(Math.PI*t),lean:.18*Math.sin(Math.PI*t)}));
 sequence.setPosition({chairPosition:pulledX});sequence.walk(4.72,seatZ-.46,1.0);sequence.walk(4.72,seatZ,.92);sequence.turn(-Math.PI/2);
 const sitAt=sequence.duration,sit=sequence.state(),restX=chairHome+.13;
 sequence.clip(1.12,t=>{const k=characterEase(t);return {...sit,x:THREE.MathUtils.lerp(sit.x,pulledX,k),height:THREE.MathUtils.lerp(standingHeight,.555,k),sitting:k,lean:.18*Math.sin(Math.PI*t)+.055*k}});
 const seated={...sit,x:restX,z:seatZ,yaw:-Math.PI/2,height:.555,sitting:1,lean:.055,chairPosition:restX};
 sequence.clip(.58,t=>({...seated,x:THREE.MathUtils.lerp(pulledX,restX,characterEase(t)),chairPosition:THREE.MathUtils.lerp(pulledX,restX,characterEase(t))}));
 const arrivalMinute=NVP_TEACHER.seatedMinute-sequence.duration/(REAL_MS_PER_GAME_MINUTE/1000);
 const routine=buildScheduledClassroomRoutine({anchor,model,chair,chairAxis:'x',crossing,arrivalMinute,sequence,seated,openAt,enterAt,clearAt,sitAt,queueAt,gripDoor:true});
 return {...routine,name:'Преподаватель НВП',subject:'Начальная военная подготовка',model,chair,
  schedule:{startMinute:arrivalMinute,seatedMinute:NVP_TEACHER.seatedMinute,duration:sequence.duration,openAt,enterAt,clearAt,sitAt},sequence};
}
