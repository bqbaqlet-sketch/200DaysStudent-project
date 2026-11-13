function createApartmentRemote(anchor){
 const remote=new THREE.Group();remote.name='mom-television-remote';anchor.add(remote);
 const shell=new THREE.MeshStandardMaterial({color:0x252930,roughness:.48});remote.add(new THREE.Mesh(new THREE.BoxGeometry(.048,.019,.145),shell));
 const top=new THREE.Mesh(new THREE.BoxGeometry(.042,.003,.136),new THREE.MeshStandardMaterial({color:0x3c4249,roughness:.62}));top.position.y=.010;remote.add(top);
 const power=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.004,12),new THREE.MeshStandardMaterial({color:0xa92c2e}));power.position.set(-.011,.013,.051);power.name='remote-power-button';remote.add(power);
 const keys=new THREE.MeshStandardMaterial({color:0xc1c4c6,roughness:.83});
 for(let row=0;row<4;row++)for(let col=0;col<3;col++){const key=new THREE.Mesh(new THREE.BoxGeometry(.008,.003,.010),keys);key.position.set((col-1)*.012,.013,.026-row*.023);remote.add(key)}
 const home=new THREE.Vector3(-3.14,.4805,-3.66),homeRotation=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.PI-.18,0));
 const along=new THREE.Vector3(.865,-.502,0).normalize(),normal=new THREE.Vector3(0,0,1),across=new THREE.Vector3().crossVectors(normal,along);
 const gripRotation=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(across,normal,along));
 const inverseGrip=gripRotation.clone().invert(),gripOffset=new THREE.Vector3(.049,-.024,.003),wristRotation=new THREE.Quaternion(),wristPosition=new THREE.Vector3();
 let held=false,error=0;
 function wristTarget(root,position,rotation){
  wristRotation.copy(rotation).multiply(inverseGrip);wristPosition.copy(gripOffset).applyQuaternion(wristRotation).negate().add(position);
  const local=root.worldToLocal(wristPosition.clone());return {x:local.x,y:local.y,z:local.z,flex:0};
 }
 function orientHand(root,weight=1){
  const hand=root.getObjectByName('handR');hand.parent.updateWorldMatrix(true,false);
  const local=hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(wristRotation);hand.quaternion.slerp(local,weight);hand.updateWorldMatrix(false,true);
 }
 function update(root,holding,position,press){
  held=!!holding;power.position.y=.013-.0027*press;
  if(held){const hand=root.getObjectByName('handR');if(remote.parent!==hand)hand.add(remote);remote.position.copy(gripOffset);remote.quaternion.copy(gripRotation)}
  else{if(remote.parent!==anchor)anchor.add(remote);remote.position.copy(home);remote.quaternion.copy(homeRotation)}
  remote.updateWorldMatrix(true,true);error=held?remote.getWorldPosition(new THREE.Vector3()).distanceTo(position):0;
 }
 remote.position.copy(home);remote.quaternion.copy(homeRotation);
 return {home,homeRotation,gripOffset,gripRotation,wristTarget,orientHand,update,mesh:remote,get state(){return {held,gripError:error}}};
}

function applyApartmentMomFeet(model,anchor,feet,yaw){
 const {hips}=model.names;hips.updateWorldMatrix(true,true);
 const up=new THREE.Vector3(0,1,0),orientation=new THREE.Quaternion().setFromAxisAngle(up,yaw);
 for(const [side,target] of [['L',feet[0]],['R',feet[1]]]){
  const thigh=model.names['thigh'+side],shin=model.names['shin'+side],foot=model.names['foot'+side];
  const point=hips.worldToLocal(anchor.localToWorld(new THREE.Vector3(...target))).sub(thigh.position),a=shin.position.length(),b=foot.position.length(),distance=THREE.MathUtils.clamp(point.length(),Math.abs(a-b)+.0002,a+b-.0002);
  const direction=point.normalize(),pole=new THREE.Vector3(0,.1,1).addScaledVector(direction,-direction.dot(new THREE.Vector3(0,.1,1))).normalize(),along=(a*a+distance*distance-b*b)/(2*distance);
  const first=direction.clone().multiplyScalar(along).addScaledVector(pole,Math.sqrt(Math.max(0,a*a-along*along))),second=direction.multiplyScalar(distance).sub(first);
  const upper=new THREE.Quaternion().setFromUnitVectors(shin.position.clone().normalize(),first.normalize()),lower=new THREE.Quaternion().setFromUnitVectors(foot.position.clone().normalize(),second.normalize().applyQuaternion(upper.clone().invert()));
  thigh.quaternion.copy(upper);shin.quaternion.copy(lower);shin.updateWorldMatrix(true,false);foot.quaternion.copy(shin.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(orientation));
 }
}
