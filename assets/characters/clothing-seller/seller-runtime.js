const CLOTHING_SELLER=Object.freeze({id:'clothing-shop-seller',opens:6*60,closes:22*60,walkSpeed:1.25,stride:1.36});
function buildClothingSeller(scene,shop,world){
 const model=buildClassroomCharacter(clothingSellerAsset,CLOTHING_SELLER.id,clothingSellerAsset.joints[0][2][1],CLOTHING_SELLER.stride,undefined,{phase:.17,armSwing:.87,bodySway:.72});
 const {root}=model;root.scale.x=1;root.updateMatrixWorld(true);const eyes=buildClothingSellerEyes(model,clothingSellerEyes);scene.add(root);
 root.userData={characterId:CLOTHING_SELLER.id,role:'Продавец магазина одежды',workingHours:'06:00–22:00'};
 const shadow=createClassroomCharacterShadow(scene),point=new THREE.Vector3(),stand=new THREE.Vector3(...shop.stand);
 const sequence=buildClassroomSequence({x:stand.x,z:stand.z,yaw:0},CLOTHING_SELLER.stride,model.standingHeight,true),start=sequence.state();
 sequence.clip(.65,t=>({...start,look:-.12*characterEase(t),lean:.025*(1-t)}));
 sequence.walkRoute(shop.leaveRoute.slice(1),CLOTHING_SELLER.walkSpeed,.20);
 const fadeAt=sequence.duration,end=sequence.state();sequence.clip(.55,()=>({...end,walking:0}));
 const state={phase:'off-duty',day:-1,minute:0,elapsed:0,waitingFor:null,working:false,closed:0};
 let lastClock=null,lastDay=-1,elapsed=0,attention=0,transparent=false;
 function opacity(value){
  const next=value<.999;if(next!==transparent){transparent=next;model.mesh.material.transparent=next;model.mesh.material.needsUpdate=true;}
  model.mesh.material.opacity=value;for(const eye of eyes.eyes)eye.material.opacity=value;shadow.material.opacity=value;
 }
 function blockedByPlayer(sample,player){return player&&Math.abs(player.feet-(world.walkGroundAt(sample.x,sample.z,null)||0))<.55&&Math.hypot(player.x-sample.x,player.z-sample.z)<.66;}
 function update(clockMs,player,sync=false){
  const dayMs=GAME_DAY_MINUTES*REAL_MS_PER_GAME_MINUTE,day=Math.floor(clockMs/dayMs),within=((clockMs%dayMs)+dayMs)%dayMs,minute=within/REAL_MS_PER_GAME_MINUTE;
  const seek=sync||lastClock===null||day!==lastDay||clockMs<lastClock||clockMs-lastClock>1500,dt=lastClock===null?0:Math.max(0,(clockMs-lastClock)/1000),seconds=clockMs/1000;
  lastClock=clockMs;lastDay=day;Object.assign(state,{day,minute,waitingFor:null,working:minute>=CLOTHING_SELLER.opens&&minute<CLOTHING_SELLER.closes});
  if(minute<CLOTHING_SELLER.opens){elapsed=0;attention=0;root.visible=shadow.visible=false;opacity(1);Object.assign(state,{phase:'off-duty',elapsed:0});return;}
  if(state.working){
   elapsed=0;root.visible=shadow.visible=true;root.position.copy(stand);root.rotation.y=0;opacity(1);
   let target=0;root.updateWorldMatrix(true,false);
   if(player&&Math.abs(player.feet-stand.y)<.55){point.set(player.x,stand.y+1.6,player.z);root.worldToLocal(point);if(point.z>0&&Math.hypot(point.x,point.z)<3.4)target=THREE.MathUtils.clamp(Math.atan2(point.x,point.z),-.48,.48);}
   attention=seek?target:THREE.MathUtils.lerp(attention,target,1-Math.exp(-Math.min(dt,.1)*4));
   const hands=[-.16,.16].map((x,i)=>({x,y:shop.counter.height-stand.y+.08+.003*Math.sin(seconds*1.7+i),z:.41,flex:.09}));
   const look=attention+.035*Math.sin(seconds*.19);model.pose({height:model.standingHeight,time:seconds,lean:.024,leanSide:.006*Math.sin(seconds*.31),look,handTargets:hands});eyes.sample(seconds,look*1.3);
   shadow.position.set(stand.x,stand.y+.008,stand.z);Object.assign(state,{phase:'working',elapsed:0,closed:eyes.closed});return;
  }
  attention=0;const sinceClose=(within-CLOTHING_SELLER.closes*REAL_MS_PER_GAME_MINUTE)/1000;
  let next=seek?Math.min(sinceClose,sequence.duration):Math.min(elapsed+dt,sequence.duration),sample=sequence.sample(next,end);
  if(!seek&&next<fadeAt&&blockedByPlayer(sample,player)){next=elapsed;sample=sequence.sample(next,end);state.waitingFor='player';}
  elapsed=next;Object.assign(state,{phase:elapsed>=sequence.duration?'off-duty':'leaving',elapsed});
  if(elapsed>=sequence.duration){root.visible=shadow.visible=false;opacity(1);return;}
  root.visible=shadow.visible=true;root.position.set(sample.x,world.walkGroundAt(sample.x,sample.z,null)||0,sample.z);root.rotation.y=sample.yaw;
  model.pose({...sample,time:seconds,walking:state.waitingFor?0:sample.walking});eyes.sample(seconds,sample.look||0);state.closed=eyes.closed;
  shadow.position.set(root.position.x,root.position.y+.008,root.position.z);opacity(1-THREE.MathUtils.smoothstep(elapsed,fadeAt,sequence.duration));
 }
 function blocks(x,z,feet=0){return root.visible&&Math.hypot(x-root.position.x,z-root.position.z)<.62&&feet<root.position.y+1.8&&feet+1.65>root.position.y+.03;}
 root.visible=shadow.visible=false;return {root,model,eyes,shadow,state,update,blocks,sequence,shop,schedule:{opens:CLOTHING_SELLER.opens,closes:CLOTHING_SELLER.closes,leaveDuration:sequence.duration,fadeAt}};
}
