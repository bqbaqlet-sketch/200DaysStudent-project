const PLAYER_CHARACTER=Object.freeze({id:'player-protagonist',height:1.85,eyeHeight:1.70,eyeForward:.096,stride:1.62});
const PLAYER_OUTFITS=Object.freeze({casual:'Повседневная одежда',uniform:'Форма'});
const playerClothing={equipped:'casual',stored:'uniform'};
function playerGeometryPart(geometry,keep){
 const part=new THREE.BufferGeometry(),position=geometry.attributes.position,index=geometry.index,indices=[];
 for(const [name,attribute] of Object.entries(geometry.attributes))part.setAttribute(name,attribute);
 for(let i=0;i<index.count;i+=3){const triangle=[index.getX(i),index.getX(i+1),index.getX(i+2)];if(keep(triangle,position,i/3))indices.push(...triangle);}
 part.setIndex(indices);part.computeBoundingSphere();return part;
}
function playerAssetPart(geometry,encodedMask){
 const mask=Uint8Array.from(atob(encodedMask),character=>character.charCodeAt(0));
 return playerGeometryPart(geometry,(_triangle,_positions,index)=>!!(mask[index>>3]&(1<<(index&7))));
}
function applyPlaygroundFeet(model,targets){
 if(!targets)return;const hips=model.names.hips;hips.updateMatrix();const inverse=hips.matrix.clone().invert();
 for(const [index,side] of ['L','R'].entries()){
  const target=targets[index];if(!target)continue;
  const thigh=model.names['thigh'+side],shin=model.names['shin'+side],foot=model.names['foot'+side],upper=shin.position.length(),lower=foot.position.length();
  const goal=new THREE.Vector3(target.x,target.y,target.z).applyMatrix4(inverse).sub(thigh.position),distance=THREE.MathUtils.clamp(goal.length(),Math.abs(upper-lower)+.0002,upper+lower-.0002),direction=goal.normalize(),pole=new THREE.Vector3(0,.05,1);
  pole.addScaledVector(direction,-pole.dot(direction)).normalize();const along=(upper*upper+distance*distance-lower*lower)/(2*distance),upperVector=direction.clone().multiplyScalar(along).addScaledVector(pole,Math.sqrt(Math.max(0,upper*upper-along*along))),lowerVector=direction.multiplyScalar(distance).sub(upperVector);
  const upperTurn=new THREE.Quaternion().setFromUnitVectors(shin.position.clone().normalize(),upperVector.normalize()),lowerTurn=new THREE.Quaternion().setFromUnitVectors(foot.position.clone().normalize(),lowerVector.normalize().applyQuaternion(upperTurn.clone().invert()));
  thigh.quaternion.copy(upperTurn);shin.quaternion.copy(lowerTurn);foot.quaternion.copy(upperTurn.clone().multiply(lowerTurn).invert());
 }
}
function playerGripFrame(side,profile){
 const forward=new THREE.Vector3(side*.64,-.768,0).normalize(),normal=new THREE.Vector3(side*.768,.64,0).normalize(),width=new THREE.Vector3(0,0,1),radius=profile==='chain'?.018:.035;
 return {forward,normal,width,radius,center:forward.clone().multiplyScalar(.072).addScaledVector(normal,-radius).addScaledVector(width,.006)};
}
function playerClosedHands(geometry,profile){
 // The supplied models have rigid open hands. Bend their existing fingers in
 // bind space; keep the texture, wrist, skin weights and the original open mesh.
 const result=geometry.clone(),position=result.attributes.position,point=new THREE.Vector3(),smooth=THREE.MathUtils.smoothstep;
 for(let i=0;i<position.count;i++){
  const x=position.getX(i),side=Math.sign(x);if(Math.abs(x)<.62)continue;
  const wrist=playerCharacterAsset.joints[side<0?5:11][2],frame=playerGripFrame(side,profile);
  point.set(x-wrist[0],position.getY(i)-wrist[1],position.getZ(i)-wrist[2]);
  const u=point.dot(frame.forward),v=point.z,w=point.dot(frame.normal),hinge=.072-.012*smooth(-v,.025,.055),angle=Math.min(2.7,Math.max(0,u-hinge)/frame.radius);
  let bentU=angle?hinge+(frame.radius+w)*Math.sin(angle):u,bentW=angle?(frame.radius+w)*Math.cos(angle)-frame.radius:w,bentV=v;
  const thumb=smooth(v,.040,.063)*(1-smooth(u,.060,.083))*smooth(u,.006,.026);
  if(thumb>0){const radius=profile==='chain'?.019:.027,a=Math.min(2.5,Math.max(0,v-.035)/radius);bentV=THREE.MathUtils.lerp(bentV,.035+(radius+w)*Math.sin(a),thumb);bentW=THREE.MathUtils.lerp(bentW,(radius+w)*Math.cos(a)-radius,thumb);bentU+=thumb*.024;}
  point.copy(frame.forward).multiplyScalar(bentU).addScaledVector(frame.normal,bentW).addScaledVector(frame.width,bentV).add(new THREE.Vector3(...wrist));
  position.setXYZ(i,point.x,point.y,point.z);
 }
 result.setAttribute('normal',new THREE.Float32BufferAttribute(new Float32Array(position.count*3),3));result.computeVertexNormals();result.computeBoundingSphere();result.userData={...geometry.userData,gripProfile:profile};return result;
}
function applyPlaygroundGrips(model,grips){
 if(!grips)return;const hips=model.names.hips,body=model.names.body;hips.updateMatrix();body.updateMatrix();
 const bodyMatrix=new THREE.Matrix4().multiplyMatrices(hips.matrix,body.matrix),inverse=bodyMatrix.clone().invert(),bodyTurn=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().extractRotation(bodyMatrix));
 for(const [i,side] of [-1,1].entries()){
  const grip=grips[i];if(!grip)continue;const suffix=side<0?'L':'R',arm=model.names['arm'+suffix],elbow=model.names['elbow'+suffix],hand=model.names['hand'+suffix],frame=playerGripFrame(side,grip.profile);
  const axis=grip.axis.clone().normalize().multiplyScalar(grip.profile==='bar'?-side:1),normal=grip.normal.clone().normalize();normal.addScaledVector(axis,-normal.dot(axis)).normalize();
  const forward=new THREE.Vector3().crossVectors(normal,axis).multiplyScalar(side),source=new THREE.Matrix4().makeBasis(frame.forward,frame.normal,frame.width.clone().multiplyScalar(side)),destination=new THREE.Matrix4().makeBasis(forward,normal,axis.clone().multiplyScalar(side));
  const orientation=new THREE.Quaternion().setFromRotationMatrix(destination).multiply(new THREE.Quaternion().setFromRotationMatrix(source).invert());
  const wrist=grip.center.clone().sub(frame.center.clone().applyQuaternion(orientation)),goal=wrist.applyMatrix4(inverse).sub(arm.position),upper=elbow.position.length(),lower=hand.position.length();
  const distance=THREE.MathUtils.clamp(goal.length(),Math.abs(upper-lower)+.0002,upper+lower-.0002),direction=goal.normalize(),pole=grip.profile==='chain'?new THREE.Vector3(side*.4,-.5,1):new THREE.Vector3(side*.3,-.5,-.5);pole.addScaledVector(direction,-pole.dot(direction)).normalize();
  const along=(upper*upper+distance*distance-lower*lower)/(2*distance),upperVector=direction.clone().multiplyScalar(along).addScaledVector(pole,Math.sqrt(Math.max(0,upper*upper-along*along))),lowerVector=direction.multiplyScalar(distance).sub(upperVector);
  const upperTurn=new THREE.Quaternion().setFromUnitVectors(elbow.position.clone().normalize(),upperVector.normalize()),lowerTurn=new THREE.Quaternion().setFromUnitVectors(hand.position.clone().normalize(),lowerVector.normalize().applyQuaternion(upperTurn.clone().invert()));
  // Carry forearm roll through the arm, rather than twisting the wrist skin.
  const handTurn=bodyTurn.clone().invert().multiply(orientation),relative=upperTurn.clone().multiply(lowerTurn).invert().multiply(handTurn),forearmAxis=hand.position.clone().normalize();
  const projection=forearmAxis.clone().multiplyScalar(new THREE.Vector3(relative.x,relative.y,relative.z).dot(forearmAxis)),roll=new THREE.Quaternion(projection.x,projection.y,projection.z,relative.w).normalize();
  lowerTurn.multiply(roll);if(roll.w<0)roll.set(-roll.x,-roll.y,-roll.z,-roll.w);
  const upperRoll=new THREE.Quaternion().setFromAxisAngle(elbow.position.clone().normalize(),2*Math.atan2(new THREE.Vector3(roll.x,roll.y,roll.z).dot(forearmAxis),roll.w)*.45);
  upperTurn.multiply(upperRoll);lowerTurn.premultiply(upperRoll.clone().invert());
  arm.quaternion.copy(upperTurn);elbow.quaternion.copy(lowerTurn);hand.quaternion.copy(upperTurn.clone().multiply(lowerTurn).invert().multiply(handTurn));
 }
}
function createWardrobeGarment(outfit){
 const asset=outfit==='uniform'?playerUniformAsset:playerCharacterAsset;
 const model=buildClassroomCharacter(asset,'hanging-'+outfit,asset.joints[0][2][1],PLAYER_CHARACTER.stride,undefined,{phase:0});
 model.root.scale.set(1,1,1);
 model.pose({height:model.standingHeight,time:0,handTargets:[{x:-.235,y:.88,z:.03,flex:0},{x:.235,y:.88,z:.03,flex:0}]});
 model.root.updateMatrixWorld(true);
 const geometry=playerAssetPart(model.mesh.geometry,playerUniformAsset.parts[outfit==='uniform'?'uniformHanging':'casualHanging']);
 const positions=new Float32Array(geometry.attributes.position.count*3),point=new THREE.Vector3();
 for(let i=0;i<geometry.attributes.position.count;i++){point.fromBufferAttribute(geometry.attributes.position,i);model.mesh.boneTransform(i,point);point.toArray(positions,i*3);}
 geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(new Float32Array(positions.length),3));geometry.computeVertexNormals();geometry.computeBoundingSphere();
 geometry.deleteAttribute('skinIndex');geometry.deleteAttribute('skinWeight');
 const material=model.mesh.material;material.skinning=false;material.side=THREE.DoubleSide;
 const garment=new THREE.Mesh(geometry,material);garment.name='wardrobe-outfit';garment.userData={outfit,clothingOnly:true};
 garment.scale.setScalar(.72);garment.position.y=-1.515*.72-.10;
 return garment;
}
function buildPlayerEyes(head,profile){
 const root=new THREE.Group();root.name='player-corrected-eyes';head.add(root);
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.48,metalness:0,transparent:true,depthWrite:false});
 const eyes=profile.centers.map((center,side)=>{
  const positions=[],colors=[],indices=[],color=new THREE.Color(),skin=new THREE.Color(0xb69787).convertSRGBToLinear();
  for(let j=0;j<=profile.rows;j++)for(let i=0;i<=profile.columns;i++){
   const u=i/profile.columns*2-1,v=j/profile.rows*2-1,x=u*profile.halfWidth,y=v*(v>0?profile.upper:profile.lower)*(1-u*u);
   const radius=Math.hypot(x,y),angle=Math.atan2(y,x),fiber=.5+.5*Math.sin(angle*43+Math.sin(angle*17)+radius*12000);
   if(radius<profile.pupilRadius)color.setRGB(.002,.004,.006);
   else if(radius<profile.irisRadius)color.setRGB(.025+.025*fiber,.055+.035*fiber,.070+.040*fiber);
   else if(radius<profile.irisRadius+.0005)color.setRGB(.018,.030,.035);
   else color.setRGB(.34,.36,.33);
   if(Math.hypot(x+.0015,y-.0011)<.00048)color.setRGB(.60,.65,.61);
   const edge=Math.max(Math.abs(v),Math.abs(u)),rim=THREE.MathUtils.smoothstep(edge,.65,1);color.lerp(skin,rim);
   colors.push(color.r,color.g,color.b,1-THREE.MathUtils.smoothstep(edge,.88,1));
   positions.push(x,y,profile.depths[side][j*(profile.columns+1)+i]-center[2]);
   if(i<profile.columns&&j<profile.rows){const k=j*(profile.columns+1)+i;indices.push(k,k+1,k+profile.columns+2,k,k+profile.columns+2,k+profile.columns+1);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));geometry.setIndex(indices);geometry.computeVertexNormals();
  const eye=new THREE.Mesh(geometry,material);eye.name='player-eye-'+(side?'left':'right');
  eye.position.copy(head.worldToLocal(new THREE.Vector3(...center)));eye.quaternion.copy(head.getWorldQuaternion(new THREE.Quaternion()).invert());eye.layers.set(1);root.add(eye);return eye;
 });
 return {root,eyes,sample(seconds){const t=((seconds+2.2)%5.7+5.7)%5.7,blink=t<.15?Math.sin(Math.PI*t/.15)**2:0;for(const eye of eyes)eye.scale.y=1-.96*blink;}};
}
function createPlayerAvatar(){
 const asset=playerCharacterAsset,model=buildClassroomCharacter(asset,PLAYER_CHARACTER.id,asset.joints[0][2][1],PLAYER_CHARACTER.stride,undefined,{phase:0,armSwing:1.0,bodySway:.94});
 model.root.scale.set(1,1,1);model.root.userData={characterId:PLAYER_CHARACTER.id,role:'Главный герой',firstPerson:true};
 model.root.updateMatrixWorld(true);const eyes=buildPlayerEyes(model.names.head,asset.eyes);
 model.mesh.layers.set(1);
 // Main camera sees the body below the neck. The reflection sees the complete
 // skinned model on layer 1, including its head and the fitted eyes.
 const firstPersonGeometry=new THREE.BufferGeometry();
 for(const [name,attribute] of Object.entries(model.mesh.geometry.attributes))firstPersonGeometry.setAttribute(name,attribute);
 const position=model.mesh.geometry.attributes.position,index=model.mesh.geometry.index,bodyIndices=[];
 for(let i=0;i<index.count;i+=3){const a=index.getX(i),b=index.getX(i+1),c=index.getX(i+2);if(Math.max(position.getY(a),position.getY(b),position.getY(c))<1.52)bodyIndices.push(a,b,c);}
 firstPersonGeometry.setIndex(bodyIndices);firstPersonGeometry.computeBoundingSphere();
 const firstPersonMesh=new THREE.SkinnedMesh(firstPersonGeometry,model.mesh.material);firstPersonMesh.name='player-first-person-body';firstPersonMesh.frustumCulled=false;
 firstPersonMesh.bind(model.mesh.skeleton,model.mesh.bindMatrix);firstPersonMesh.layers.set(2);model.root.add(firstPersonMesh);
 const casualGeometry=model.mesh.geometry,headGeometry=playerAssetPart(casualGeometry,playerUniformAsset.parts.head);
 let uniformMesh=null,uniformFirstPerson=null,neckMesh=null,uniformOpen=null,uniformFirstOpen=null,outfit='casual',gripKey=null;
 const gripGeometry=new WeakMap();
 function geometryForGrip(geometry,profile){if(!profile)return geometry;let variants=gripGeometry.get(geometry);if(!variants){variants=new Map();gripGeometry.set(geometry,variants);}if(!variants.has(profile))variants.set(profile,playerClosedHands(geometry,profile));return variants.get(profile);}
 function setGrip(profile){
  const key=outfit+':'+(profile||'open');if(key===gripKey)return;gripKey=key;
  model.mesh.geometry=outfit==='uniform'?headGeometry:geometryForGrip(casualGeometry,profile);firstPersonMesh.geometry=geometryForGrip(firstPersonGeometry,profile);
  if(uniformMesh){uniformMesh.geometry=geometryForGrip(uniformOpen,profile);uniformFirstPerson.geometry=geometryForGrip(uniformFirstOpen,profile);}
 }
 function setOutfit(next){
  if(!Object.prototype.hasOwnProperty.call(PLAYER_OUTFITS,next))throw Error('Unknown player outfit');
  if(next==='uniform'&&!uniformMesh){
   const uniform=buildClassroomCharacter(playerUniformAsset,'player-uniform',model.standingHeight,model.cycleLength,undefined,{phase:0});
   uniformMesh=uniform.mesh;uniform.root.remove(uniformMesh);
   uniformMesh.geometry=playerAssetPart(uniformMesh.geometry,playerUniformAsset.parts.body);
   uniformOpen=uniformMesh.geometry;
   uniformMesh.bind(model.mesh.skeleton,model.mesh.bindMatrix);uniformMesh.layers.set(1);model.root.add(uniformMesh);
   const body=playerGeometryPart(uniformMesh.geometry,(triangle,p)=>triangle.every(i=>p.getY(i)<1.52));
   uniformFirstOpen=body;
   uniformFirstPerson=new THREE.SkinnedMesh(body,uniformMesh.material);uniformFirstPerson.name='player-uniform-first-person';uniformFirstPerson.frustumCulled=false;
   uniformFirstPerson.bind(model.mesh.skeleton,model.mesh.bindMatrix);uniformFirstPerson.layers.set(2);model.root.add(uniformFirstPerson);
   // Bridge the two source necklines beneath the collar, with the player's own
   // skin texture. Body/head weights keep it closed while looking and walking.
   const rings=[[1.525,.060,.043],[1.54,.059,.043],[1.56,.056,.042],[1.58,.053,.042],[1.60,.050,.040]],segments=32;
   const vertices=[],skinIndices=[],weights=[],uvs=[],indices=[],sourceUV=casualGeometry.attributes.uv,sourcePosition=casualGeometry.attributes.position;
   let skinVertex=0,best=Infinity;
   for(let i=0;i<headGeometry.index.count;i++){
    const id=headGeometry.index.getX(i),x=sourcePosition.getX(id),y=sourcePosition.getY(id),z=sourcePosition.getZ(id),distance=x*x+(y-1.55)**2+(z-.04)**2;
    if(distance<best){best=distance;skinVertex=id;}
   }
   const uvScale=sourceUV.normalized?65535:1,u=sourceUV.getX(skinVertex)/uvScale,v=sourceUV.getY(skinVertex)/uvScale;
   for(const [y,rx,rz] of rings)for(let i=0;i<=segments;i++){
    const angle=i/segments*Math.PI*2,headWeight=THREE.MathUtils.smoothstep(y,1.53,1.61);
    vertices.push(Math.cos(angle)*rx,y,-.008+Math.sin(angle)*rz);uvs.push(u,v);skinIndices.push(1,2,0,0);weights.push(1-headWeight,headWeight,0,0);
   }
   for(let row=0;row<rings.length-1;row++)for(let i=0;i<segments;i++){const a=row*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,a+1,b,b+1);}
   const neck=new THREE.BufferGeometry();neck.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));neck.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));neck.setAttribute('skinIndex',new THREE.Uint8BufferAttribute(skinIndices,4));neck.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));neck.setIndex(indices);neck.computeVertexNormals();
   const skin=model.mesh.material.clone();skin.normalMap=null;skin.side=THREE.DoubleSide;
   neckMesh=new THREE.SkinnedMesh(neck,skin);neckMesh.name='player-uniform-neck';neckMesh.frustumCulled=false;neckMesh.bind(model.mesh.skeleton,model.mesh.bindMatrix);neckMesh.layers.set(1);model.root.add(neckMesh);
  }
  outfit=next;model.mesh.geometry=next==='uniform'?headGeometry:casualGeometry;firstPersonMesh.visible=next==='casual';
  gripKey=null;
  if(uniformMesh){uniformMesh.visible=uniformFirstPerson.visible=neckMesh.visible=next==='uniform';}
 }
 const anchor=new THREE.Group();anchor.name='player-avatar-anchor';anchor.matrixAutoUpdate=false;anchor.add(model.root);
 const shadow=createClassroomCharacterShadow(anchor);shadow.name='player-contact-shadow';shadow.visible=true;shadow.position.y=.012;
 const previous=new THREE.Vector3(),direction=new THREE.Vector3(),worldPosition=new THREE.Vector3(),rotation=new THREE.Quaternion(),matrix=new THREE.Matrix4(),unit=new THREE.Vector3(1,1,1);
 let world=null,lastTime=null,gait=0,walking=0,bodyYaw=0,sitting=0,lastSpeed=0,wasPlayground=false;
 function update(dt){
  const now=performance.now()/1000;
  dt=THREE.MathUtils.clamp(dt??(lastTime===null?0:now-lastTime),0,.05);lastTime=now;
  const changed=world!==activeWorld;
  if(changed){anchor.parent?.remove(anchor);activeWorld.scene.add(anchor);world=activeWorld;previous.copy(C.position);walking=0;lastSpeed=0;}
  C.updateMatrixWorld();C.getWorldDirection(direction);const desiredYaw=Math.atan2(direction.x,direction.z);
  const activity=activeWorld.playground?.avatarPose,activityChanged=!!activity!==wasPlayground,rider=busTransit?.rider,seatTarget=rider?.seated?1:0;
  sitting=activity?(activity.sitting||0):changed||activityChanged?seatTarget:THREE.MathUtils.lerp(sitting,seatTarget,1-Math.exp(-dt*10));
  const distance=Math.hypot(C.position.x-previous.x,C.position.z-previous.z),teleported=distance>1.2;
  const moving=!activity&&!activityChanged&&!fly&&!rider?.motion&&distance>.00002&&!teleported&&!changed&&sitting<.1;
  lastSpeed=moving?distance/Math.max(dt,.001):0;
  const target=moving?THREE.MathUtils.clamp(lastSpeed/2.0,0,1):0;
  walking=activity?(activity.walking||0):THREE.MathUtils.lerp(walking,target,1-Math.exp(-dt*13));
  if(moving)gait+=distance/model.cycleLength;
  const yawTarget=activity?activity.yaw:rider&&sitting>.5?rider.bus.stop.yaw:desiredYaw;
  const turn=Math.atan2(Math.sin(yawTarget-bodyYaw),Math.cos(yawTarget-bodyYaw));
  bodyYaw=activity||changed||teleported||activityChanged?yawTarget:bodyYaw+turn*(1-Math.exp(-Math.max(dt,.008)*15));
  const headTurn=Math.atan2(Math.sin(desiredYaw-bodyYaw),Math.cos(desiredYaw-bodyYaw));
  const height=activity?.height??THREE.MathUtils.lerp(model.standingHeight,.535,sitting);
  const eyeHeight=PLAYER_CHARACTER.eyeHeight-model.standingHeight+height;
  const floor=rider||fly?C.position.y-eyeHeight:feetY;
  worldPosition.set(C.position.x-Math.sin(bodyYaw)*PLAYER_CHARACTER.eyeForward,floor,C.position.z-Math.cos(bodyYaw)*PLAYER_CHARACTER.eyeForward);
  if(activity)worldPosition.copy(activity.position);
  rotation.setFromAxisAngle(new THREE.Vector3(0,1,0),bodyYaw);matrix.compose(worldPosition,rotation,unit);
  world.scene.updateWorldMatrix(true,false);anchor.matrix.copy(world.scene.matrixWorld).invert().multiply(matrix);anchor.matrixWorldNeedsUpdate=true;
  model.pose({height,sitting,gait:activity?.gait??gait,walking,time:now,lean:activity?.lean??walking*.045,leanSide:activity?.leanSide||0,handTargets:activity?.hands,look:THREE.MathUtils.clamp(headTurn,-.75,.75),headPitch:THREE.MathUtils.clamp(-C.rotation.x,-.65,.60)});
  setGrip(activity?.grips?.[0]?.profile);applyPlaygroundGrips(model,activity?.grips);applyPlaygroundFeet(model,activity?.feet);eyes.sample(now);shadow.visible=!activity&&!fly&&sitting<.15;wasPlayground=!!activity;
  previous.copy(C.position);anchor.updateWorldMatrix(true,true);
 }
 setOutfit(playerClothing.equipped);
 return {root:anchor,model,eyes,firstPersonMesh,update,setOutfit,get outfit(){return outfit},get uniformMesh(){return uniformMesh},get uniformFirstPerson(){return uniformFirstPerson},get neckMesh(){return neckMesh},get state(){return {location:world===activeWorld?currentLocation:null,gait,walking,sitting,speed:lastSpeed,bodyYaw,outfit,activity:activeWorld.playground?.rider?.unit.id||null};}};
}
// Planar reflection adapted from Three.js r128 examples/js/objects/Reflector.js
// (Three.js contributors, MIT). One extra scene pass, only when facing the mirror.
/*
The MIT License — Copyright (c) 2010-2021 three.js authors
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
function createBathroomMirror(width,height){
 const target=new THREE.WebGLRenderTarget(512,768,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat});
 target.texture.generateMipmaps=false;
 const textureMatrix=new THREE.Matrix4(),virtualCamera=new THREE.PerspectiveCamera();virtualCamera.layers.set(0);virtualCamera.layers.enable(1);
 const material=new THREE.ShaderMaterial({
  uniforms:{reflection:{value:target.texture},textureMatrix:{value:textureMatrix}},
  vertexShader:'uniform mat4 textureMatrix; varying vec4 reflectedUv; void main(){ reflectedUv=textureMatrix*vec4(position,1.0); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader:'uniform sampler2D reflection; varying vec4 reflectedUv; void main(){ vec3 color=texture2DProj(reflection,reflectedUv).rgb; gl_FragColor=vec4(color*vec3(0.98,0.995,1.0),1.0); }'
 });
 const mirror=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);mirror.name='bathroom-real-mirror';mirror.isReflector=true;
 mirror.userData={realReflection:true,reflectionRenders:0,includesPlayer:true};
 mirror.reflectionCamera=virtualCamera;mirror.getRenderTarget=()=>target;
 const mirrorPosition=new THREE.Vector3(),cameraPosition=new THREE.Vector3(),normal=new THREE.Vector3(),view=new THREE.Vector3(),look=new THREE.Vector3(),reflectedTarget=new THREE.Vector3();
 const rotation=new THREE.Matrix4(),plane=new THREE.Plane(),clip=new THREE.Vector4(),q=new THREE.Vector4();let rendering=false;
 mirror.onBeforeRender=(renderer,scene,camera)=>{
  if(rendering||camera!==C)return;
  mirrorPosition.setFromMatrixPosition(mirror.matrixWorld);cameraPosition.setFromMatrixPosition(camera.matrixWorld);
  normal.set(0,0,1).transformDirection(mirror.matrixWorld);view.subVectors(mirrorPosition,cameraPosition);
  if(view.dot(normal)>0||view.lengthSq()>64)return;
  view.reflect(normal).negate().add(mirrorPosition);
  rotation.extractRotation(camera.matrixWorld);look.set(0,0,-1).applyMatrix4(rotation).add(cameraPosition);
  reflectedTarget.subVectors(mirrorPosition,look).reflect(normal).negate().add(mirrorPosition);
  virtualCamera.position.copy(view);virtualCamera.up.set(0,1,0).applyMatrix4(rotation).reflect(normal);virtualCamera.lookAt(reflectedTarget);
  virtualCamera.near=camera.near;virtualCamera.far=camera.far;virtualCamera.updateMatrixWorld();virtualCamera.projectionMatrix.copy(camera.projectionMatrix);
  textureMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(virtualCamera.projectionMatrix).multiply(virtualCamera.matrixWorldInverse).multiply(mirror.matrixWorld);
  plane.setFromNormalAndCoplanarPoint(normal,mirrorPosition).applyMatrix4(virtualCamera.matrixWorldInverse);clip.set(plane.normal.x,plane.normal.y,plane.normal.z,plane.constant);
  const projection=virtualCamera.projectionMatrix.elements;
  q.set((Math.sign(clip.x)+projection[8])/projection[0],(Math.sign(clip.y)+projection[9])/projection[5],-1,(1+projection[10])/projection[14]);
  clip.multiplyScalar(2/clip.dot(q));projection[2]=clip.x;projection[6]=clip.y;projection[10]=clip.z+1-.003;projection[14]=clip.w;
  virtualCamera.projectionMatrixInverse.copy(virtualCamera.projectionMatrix).invert();target.texture.encoding=renderer.outputEncoding;
  const savedTarget=renderer.getRenderTarget(),savedXr=renderer.xr.enabled,savedShadow=renderer.shadowMap.autoUpdate;
  rendering=true;mirror.visible=false;
  try{
   renderer.xr.enabled=false;renderer.shadowMap.autoUpdate=false;renderer.setRenderTarget(target);renderer.state.buffers.depth.setMask(true);
   if(!renderer.autoClear)renderer.clear();renderer.render(scene,virtualCamera);mirror.userData.reflectionRenders++;
  }finally{
   renderer.xr.enabled=savedXr;renderer.shadowMap.autoUpdate=savedShadow;renderer.setRenderTarget(savedTarget);
   if(camera.viewport)renderer.state.viewport(camera.viewport);mirror.visible=true;rendering=false;
  }
 };
 mirror.dispose=()=>{target.dispose();mirror.geometry.dispose();material.dispose()};
 return mirror;
}
function installPlayerRendering(){
 const avatar=createPlayerAvatar(),render=R.render.bind(R);C.layers.enable(2);
 R.render=function(scene,camera){if(camera===C&&scene===activeWorld.scene)avatar.update();return render(scene,camera)};
 return avatar;
}
