const FRONT_STUDENT=Object.freeze({id:'student-front-108',characterName:'Илья',arrivalMinute:7*60+43,walkSpeed:1.30,stride:1.36,seat:{tableX:6.65,tableZ:15.51,side:-1}});
function sampleFrontStudentIdle(seconds,attention=0){
 const t=((seconds%36)+36)%36,pulse=(a,b)=>characterEase(THREE.MathUtils.clamp(Math.min((t-a)/.65,(b-t)/.65),0,1)),cuff=pulse(15,19),shift=pulse(24,28),tap=pulse(30,33),aside=pulse(8,12),nod=pulse(3,5);
 const hands=[{x:-.12,y:.782,z:.31,flex:.09},{x:.13,y:.782,z:.31,flex:.09}];
 const adjust=[{x:.035,y:.865,z:.285,flex:.14},{x:.145,y:.845,z:.27,flex:.20}];
 for(let i=0;i<2;i++)for(const key of ['x','y','z','flex'])hands[i][key]=THREE.MathUtils.lerp(hands[i][key],adjust[i][key],cuff);
 hands[1].y+=tap*.004*Math.sin(seconds*8);hands[1].z+=tap*.004*Math.sin(seconds*4);
 return {height:.535+shift*.007,sitting:1,lean:.065-shift*.024,leanSide:shift*.016,torsoTurn:shift*.035,
  look:attention+aside*.23+.025*Math.sin(seconds*.27),headPitch:nod*.065*Math.sin((t-3)*Math.PI/2),handTargets:hands,
  mode:cuff>.1?'adjust-cuff':shift>.1?'settle':tap>.1?'finger-tap':aside>.1?'look-aside':nod>.1?'attentive-nod':Math.abs(attention)>.08?'notice-player':'seated-idle'};
}
function buildFrontStudentModel(){
 const model=buildClassroomCharacter(frontStudentAsset,FRONT_STUDENT.id,frontStudentAsset.joints[0][2][1],FRONT_STUDENT.stride,undefined,{phase:.31,armSwing:.88,bodySway:.78});
 model.root.scale.x=1;model.root.updateMatrixWorld(true);const eyes=buildFrontStudentEyes(model,frontStudentEyes);model.root.scale.x=-1;
 const basePose=model.pose;let seatedAt=Infinity,attention=0;const animation={mode:'idle',closed:0,look:0};
 model.pose=state=>{
  let sample=state;if(state.sitting>.999&&state.time>=seatedAt){const idle=sampleFrontStudentIdle(state.time-seatedAt,attention);sample={...state,...idle};animation.mode=idle.mode;}else animation.mode=state.walking>.05?'walk':state.grip>.05?'door':state.sitting>0?'sit-down':state.reach>.05?'pull-chair':'idle';
  basePose(sample);eyes.sample(state.time||0,THREE.MathUtils.clamp((sample.look||0)*1.3,-1,1));animation.closed=eyes.closed;animation.look=sample.look||0;
 };
 model.setSeatedAt=seconds=>seatedAt=seconds;model.setAttention=value=>attention=value;model.eyes=eyes;model.animation=animation;
 model.root.userData={characterId:FRONT_STUDENT.id,characterName:FRONT_STUDENT.characterName,role:'Студент',reference:'image_4d95113c.jpg',locomotion:'retargeted-native-walk'};return model;
}
function buildFrontStudentRoutine(anchor,chair,crossing,doorX,doorZ){
 const model=buildFrontStudentModel(),routine=buildStudent108Routine(anchor,chair,crossing,doorX,doorZ,{model,arrivalMinute:FRONT_STUDENT.arrivalMinute,walkSpeed:FRONT_STUDENT.walkSpeed,entranceRoute:classroom108EntranceRoute.slice(3),seatSide:1,aisleOffset:.82,passingOffset:.285});
 model.setSeatedAt(routine.sequence.duration);const update=routine.update;let lastClock=null,attention=0;
 routine.update=(clockMs,player,sync=false)=>{
  const dt=lastClock===null||sync||clockMs<lastClock?0:Math.min(.1,(clockMs-lastClock)/1000);lastClock=clockMs;let target=0;
  if(routine.state.phase==='seated'&&player&&Math.abs(player.feet)<.55){model.root.updateWorldMatrix(true,false);const point=model.root.worldToLocal(new THREE.Vector3(player.x,1.55,player.z));if(Math.hypot(point.x,point.z)<2.7&&point.z>-.25)target=THREE.MathUtils.clamp(Math.atan2(point.x,Math.max(.2,point.z)),-.48,.48);}
  attention=sync?target:THREE.MathUtils.lerp(attention,target,1-Math.exp(-dt*4));model.setAttention(attention);update(clockMs,player,sync);
 };
 return {name:FRONT_STUDENT.characterName,...routine,eyes:model.eyes,animation:model.animation};
}
