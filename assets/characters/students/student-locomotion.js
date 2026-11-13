let decodedStudentWalk=null;
function createStudentLocomotion({hips,body,head,limbs,bendLimb,placeHands,standingHeight,cycleLength,profile}){
 const clip=studentWalkMotion;
 if(!decodedStudentWalk)decodedStudentWalk=new Float32Array(Uint8Array.from(atob(clip.samples),c=>c.charCodeAt(0)).buffer);
 const values=decodedStudentWalk,identity=new THREE.Quaternion(),frame=new THREE.Matrix4();
 const styles={phase:0,armSwing:.86,bodySway:1,...profile};
 const legScales=limbs.map((l,i)=>(l.upper+l.lower)/clip.reference[i].legLength);
 const armScales=limbs.map((l,i)=>(l.elbow.position.length()+l.hand.position.length())/clip.reference[i].armLength);
 function apply({gait=0,walking=0,sitting=0,lean=0,look=0,torsoTurn=0,leanSide=0}){
  const weight=THREE.MathUtils.clamp(walking*(1-sitting),0,1);if(weight<=0)return;
  const at=(((gait+styles.phase)%1)+1)%1*clip.frames,a=Math.floor(at),b=a+1,mix=at-a;
  const number=k=>THREE.MathUtils.lerp(values[a*clip.channels+k],values[b*clip.channels+k],mix);
  const vector=k=>new THREE.Vector3(number(k),number(k+1),number(k+2));
  const quaternion=k=>new THREE.Quaternion().fromArray(values,a*clip.channels+k).slerp(new THREE.Quaternion().fromArray(values,b*clip.channels+k),mix);
  const sourceHip=vector(0);
  const y=limbs.reduce((sum,l,i)=>sum+l.ankleHeight+(sourceHip.y-clip.reference[i].footMin+clip.reference[i].thighY)*legScales[i]-l.thigh.position.y,0)/2;
  hips.position.y=THREE.MathUtils.lerp(hips.position.y,y,weight);
  hips.position.x=sourceHip.x*(legScales[0]+legScales[1])*.5*weight;
  hips.quaternion.copy(identity).slerp(quaternion(3),weight*styles.bodySway);
  const torso=quaternion(7).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(lean*.35,torsoTurn,leanSide)));
  body.quaternion.slerp(torso,weight);head.quaternion.slerp(quaternion(11).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,look,0))),weight);
  hips.updateMatrix();frame.copy(hips.matrix).invert();
  for(let i=0;i<limbs.length;i++){
   const l=limbs[i],ref=clip.reference[i],sample=vector(15+i*7),s=legScales[i];
   const target=new THREE.Vector3(l.ankle[0]+(sample.x-ref.footX)*s,l.ankleHeight+(sample.y-ref.footMin)*s,l.ankle[2]+(sample.z-ref.footZ)*cycleLength/clip.stride);
   target.applyMatrix4(frame).sub(l.thigh.position);
   const pole=new THREE.Vector3(l.sign*.045,.02,1).applyQuaternion(hips.quaternion.clone().invert());
   const {upperTurn,lowerTurn}=bendLimb(l.shin.position,l.foot.position,target,pole);
   const ankleTurn=hips.quaternion.clone().multiply(upperTurn).multiply(lowerTurn).invert().multiply(quaternion(18+i*7));
   l.thigh.quaternion.slerp(upperTurn,weight);l.shin.quaternion.slerp(lowerTurn,weight);l.foot.quaternion.slerp(ankleTurn,weight);
  }
  hips.updateMatrix();body.updateMatrix();const bodyToModel=new THREE.Matrix4().multiplyMatrices(hips.matrix,body.matrix);
  placeHands(weight,sign=>{
   const i=sign<0?0:1,l=limbs[i],s=armScales[i],hand=vector(29+i*3);
   hand.z*=styles.armSwing;hand.multiplyScalar(s).add(l.arm.position.clone().applyMatrix4(bodyToModel));
   return {x:hand.x,y:hand.y,z:hand.z,flex:.055+.09*Math.sin((gait+styles.phase)*Math.PI*2+sign)};
  });
  // During walking the fingers follow the forearm down, with a relaxed wrist.
  // The generic reach solver's forward palm is kept for handles and seated poses.
  for(const l of limbs){
   const relaxed=new THREE.Quaternion().setFromEuler(new THREE.Euler(.055,l.sign*.035+.018*Math.sin((gait+styles.phase)*Math.PI*2),l.sign*.018));
   l.hand.quaternion.slerp(relaxed,weight);
  }
 }
 return {apply,source:clip.sourceClip,style:styles};
}

const STUDENT_WALK_STYLES=Object.freeze({
 'student-108':{stride:1.36,phase:.0,armSwing:.86,bodySway:.92},
 'sanya-108':{stride:1.22,phase:.19,armSwing:.95,bodySway:1.02},
 'alexey-108':{stride:1.42,phase:.37,armSwing:.80,bodySway:.88},
 'misha-108':{stride:1.38,phase:.12,armSwing:.84,bodySway:.94}
});
function buildStudentCharacter(asset,id,height){
 const style=STUDENT_WALK_STYLES[id];
 const model=buildClassroomCharacter(asset,id,height,style.stride,undefined,style);
 model.root.userData={characterId:id,role:'Студент',walkSource:studentWalkMotion.sourceClip,locomotion:'retargeted-native-walk',stride:style.stride};
 return model;
}
