const PLAYER_CHARACTER=Object.freeze({id:'player-protagonist',height:1.85,eyeHeight:1.70,eyeForward:.096,stride:1.62});
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
 const anchor=new THREE.Group();anchor.name='player-avatar-anchor';anchor.matrixAutoUpdate=false;anchor.add(model.root);
 const shadow=createClassroomCharacterShadow(anchor);shadow.name='player-contact-shadow';shadow.visible=true;shadow.position.y=.012;
 const previous=new THREE.Vector3(),direction=new THREE.Vector3(),worldPosition=new THREE.Vector3(),rotation=new THREE.Quaternion(),matrix=new THREE.Matrix4(),unit=new THREE.Vector3(1,1,1);
 let world=null,lastTime=null,gait=0,walking=0,bodyYaw=0,sitting=0,lastSpeed=0;
 function update(dt){
  const now=performance.now()/1000;
  dt=THREE.MathUtils.clamp(dt??(lastTime===null?0:now-lastTime),0,.05);lastTime=now;
  const changed=world!==activeWorld;
  if(changed){anchor.parent?.remove(anchor);activeWorld.scene.add(anchor);world=activeWorld;previous.copy(C.position);walking=0;lastSpeed=0;}
  C.updateMatrixWorld();C.getWorldDirection(direction);const desiredYaw=Math.atan2(direction.x,direction.z);
  const rider=busTransit?.rider,seatTarget=rider?.seated?1:0;
  sitting=changed?seatTarget:THREE.MathUtils.lerp(sitting,seatTarget,1-Math.exp(-dt*10));
  const distance=Math.hypot(C.position.x-previous.x,C.position.z-previous.z),teleported=distance>1.2;
  const moving=!fly&&!rider?.motion&&distance>.00002&&!teleported&&!changed&&sitting<.1;
  lastSpeed=moving?distance/Math.max(dt,.001):0;
  const target=moving?THREE.MathUtils.clamp(lastSpeed/2.0,0,1):0;
  walking=THREE.MathUtils.lerp(walking,target,1-Math.exp(-dt*13));
  if(moving)gait+=distance/model.cycleLength;
  const yawTarget=rider&&sitting>.5?rider.bus.stop.yaw:desiredYaw;
  const turn=Math.atan2(Math.sin(yawTarget-bodyYaw),Math.cos(yawTarget-bodyYaw));
  bodyYaw=changed||teleported?yawTarget:bodyYaw+turn*(1-Math.exp(-Math.max(dt,.008)*15));
  const headTurn=Math.atan2(Math.sin(desiredYaw-bodyYaw),Math.cos(desiredYaw-bodyYaw));
  const height=THREE.MathUtils.lerp(model.standingHeight,.535,sitting);
  const eyeHeight=PLAYER_CHARACTER.eyeHeight-model.standingHeight+height;
  const floor=rider||fly?C.position.y-eyeHeight:feetY;
  worldPosition.set(C.position.x-Math.sin(bodyYaw)*PLAYER_CHARACTER.eyeForward,floor,C.position.z-Math.cos(bodyYaw)*PLAYER_CHARACTER.eyeForward);
  rotation.setFromAxisAngle(new THREE.Vector3(0,1,0),bodyYaw);matrix.compose(worldPosition,rotation,unit);
  world.scene.updateWorldMatrix(true,false);anchor.matrix.copy(world.scene.matrixWorld).invert().multiply(matrix);anchor.matrixWorldNeedsUpdate=true;
  model.pose({height,sitting,gait,walking,time:now,lean:walking*.045,look:THREE.MathUtils.clamp(headTurn,-.75,.75),headPitch:THREE.MathUtils.clamp(-C.rotation.x,-.65,.60)});
  eyes.sample(now);shadow.visible=!fly&&sitting<.15;
  previous.copy(C.position);anchor.updateWorldMatrix(true,true);
 }
 return {root:anchor,model,eyes,firstPersonMesh,update,get state(){return {location:world===activeWorld?currentLocation:null,gait,walking,sitting,speed:lastSpeed,bodyYaw};}};
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
