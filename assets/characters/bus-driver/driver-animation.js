// Driver pose is sampled from route time, so scene changes do not restart his motion.
const BUS_DRIVER=Object.freeze({id:'bus-driver',scale:.93,seat:[.6903,.866,4.83],wheel:[.6903,1.087,5.3063],wheelRadius:.226});
let busDriverTemplate=null;
function buildBusDriver(){
 const root=busDriverTemplate?busDriverTemplate.clone(true):buildClassroomCharacter(busDriverAsset,BUS_DRIVER.id,1.005,.8).root;
 if(busDriverTemplate){
  const mesh=root.getObjectByName(BUS_DRIVER.id+'-imported-mesh');
  mesh.skeleton=new THREE.Skeleton(busDriverAsset.joints.map(([name])=>root.getObjectByName(name)),mesh.skeleton.boneInverses.map(matrix=>matrix.clone()));
 }else{
  const geometry=root.getObjectByName(BUS_DRIVER.id+'-imported-mesh').geometry;
  // r128 CPU skinning reads raw attribute values; floats keep picking/export correct too.
  geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(Float32Array.from(geometry.attributes.skinWeight.array,value=>value/255),4));
  busDriverTemplate=root.clone(true);
 }
 root.scale.setScalar(BUS_DRIVER.scale);
 root.userData={characterId:BUS_DRIVER.id,role:'driver',dialoguePending:true};
 const names={};for(const [name] of busDriverAsset.joints)names[name]=root.getObjectByName(name);
 const limbs=[[-1,'L'],[1,'R']].map(([sign,suffix])=>({sign,arm:names['arm'+suffix],elbow:names['elbow'+suffix],hand:names['hand'+suffix],thigh:names['thigh'+suffix],shin:names['shin'+suffix],foot:names['foot'+suffix]}));
 const matrix=new THREE.Matrix4();
 function solve(upper,lower,end,target,pole,endRotation){
  upper.parent.updateWorldMatrix(true,false);root.updateWorldMatrix(true,false);
  const rootToParent=matrix.copy(upper.parent.matrixWorld).invert().multiply(root.matrixWorld);
  const point=target.clone().applyMatrix4(rootToParent).sub(upper.position);
  const a=lower.position.length(),b=end.position.length(),d=THREE.MathUtils.clamp(point.length(),Math.abs(a-b)+.001,a+b-.001);
  const direction=point.normalize(),normal=pole.clone().transformDirection(rootToParent);
  normal.addScaledVector(direction,-normal.dot(direction)).normalize();
  const along=(a*a+d*d-b*b)/(2*d),elbow=direction.clone().multiplyScalar(along).addScaledVector(normal,Math.sqrt(Math.max(0,a*a-along*along)));
  const q=new THREE.Quaternion().setFromUnitVectors(lower.position.clone().normalize(),elbow.clone().normalize());
  const child=direction.multiplyScalar(d).sub(elbow).normalize().applyQuaternion(q.clone().invert());
  upper.quaternion.copy(q);lower.quaternion.setFromUnitVectors(end.position.clone().normalize(),child);
  upper.updateWorldMatrix(true,true);
  const desired=root.getWorldQuaternion(new THREE.Quaternion()).multiply(endRotation);
  end.quaternion.copy(end.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(desired));
 }
 function sample(time,{speed=0,doors=0,phase=0}={}){
  const driving=THREE.MathUtils.smoothstep(speed,.1,2.2),breath=Math.sin(time*1.64),sway=driving*Math.sin(time*1.17)*.006;
  const opening=1-THREE.MathUtils.smoothstep(phase,1.6,3.9),closing=THREE.MathUtils.smoothstep(phase,6.5,8.6);
  const doorLook=doors*(.44*opening+.20*closing),mirror=driving*.12*Math.sin(time*.43)**8;
  const steering=driving*(.024*Math.sin(time*.69)+.013*Math.sin(time*1.31));
  for(const bone of Object.values(names))bone.rotation.set(0,0,0);
  names.hips.position.y=.125+breath*.0018;
  names.body.rotation.set(.025+driving*.014+breath*.003,.008*Math.sin(time*.42),sway);
  names.head.rotation.set(-.025+breath*.007,-doorLook+mirror+.021*Math.sin(time*.31),-.006*Math.sin(time*.59));
  root.updateWorldMatrix(true,true);
  const wheel=new THREE.Vector3(...BUS_DRIVER.wheel).sub(new THREE.Vector3(...BUS_DRIVER.seat)).divideScalar(BUS_DRIVER.scale);
  const wheelForward=new THREE.Vector3(0,.324,.946).normalize();
  for(const limb of limbs){
   const {sign,arm,elbow,hand,thigh,shin,foot}=limb;
   const angle=sign*1.05+steering;
   const grip=wheel.clone().addScaledVector(new THREE.Vector3(1,0,0),Math.sin(angle)*BUS_DRIVER.wheelRadius/BUS_DRIVER.scale)
    .addScaledVector(wheelForward,-Math.cos(angle)*BUS_DRIVER.wheelRadius/BUS_DRIVER.scale);
   grip.y+=.065;
   const handRotation=new THREE.Quaternion().setFromEuler(new THREE.Euler(.14,-sign*1.30,sign*.15));
   solve(arm,elbow,hand,grip,new THREE.Vector3(sign*.55,-1,-.15),handRotation);
   names[sign<0?'fingersL':'fingersR'].rotation.z=-sign*.95;
   const pedal=sign===1?driving*(.008+.013*Math.sin(time*.73)):0;
   solve(thigh,shin,foot,new THREE.Vector3(sign*.135,-.485-pedal,.45+pedal),new THREE.Vector3(sign*.10,.12,1),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-.06-pedal*.9));
  }
  root.userData.animationState=driving>.1?'driving':doorLook>.08?'door-check':'waiting';
  root.userData.steering=steering;
  return steering;
 }
 sample(0);
 return {root,sample,names};
}
