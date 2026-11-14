const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const project=path.resolve(__dirname,'..'),out=path.join(__dirname,'player-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE.WebGLProgram|shader error/i.test(m.text()))errors.push(m.text())});
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.addInitScript(()=>{
   window.nativePlayerNow=performance.now.bind(performance);window.nativePlayerRAF=requestAnimationFrame.bind(window);window.qaTime=1000;
   Object.defineProperty(performance,'now',{configurable:true,value:()=>qaTime});requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject();
  });
  const game=fs.readdirSync(project).find(f=>f!=='index.html'&&f.endsWith('.html'));
  await page.goto(pathToFileURL(path.join(project,game)).href,{waitUntil:'load',timeout:60000});await require('./test-runtime.cjs').startTester(page);assert.deepEqual(errors,[]);
  const setup=await page.evaluate(()=>{
   window.drawHero=(dt=1/60)=>{qaTime+=dt*1000;C.rotation.set(pitch,yaw,0);hud.textContent=zone(C.position.x,C.position.z);updateInteraction(performance.now());applyGameLighting(activeWorld);R.render(activeWorld.scene,C)};
   return {sourceTriangles:playerAvatar.model.mesh.geometry.index.count/3,firstPersonTriangles:playerAvatar.firstPersonMesh.geometry.index.count/3,
    bones:playerAvatar.model.mesh.skeleton.bones.length,eyes:playerAvatar.eyes.eyes.length,
    mainSeesBody:C.layers.test(playerAvatar.firstPersonMesh.layers),mainSeesHead:C.layers.test(playerAvatar.model.mesh.layers)};
  });
  assert.equal(setup.sourceTriangles,48000);assert.equal(setup.bones,15);assert.equal(setup.eyes,2);assert(setup.firstPersonTriangles>20000&&setup.firstPersonTriangles<48000);assert.equal(setup.mainSeesBody,true);assert.equal(setup.mainSeesHead,false);
  const transitions=await page.evaluate(()=>{
   const results=[];
   for(const name of ['college1','college2','home','entrance4','apartment','college','apartment']){
    switchLocation(name,{fresh:true});drawHero();const scale=playerAvatar.model.root.getWorldScale(new THREE.Vector3());
    results.push({name,sceneAttached:playerAvatar.root.parent===activeWorld.scene,unitWorldScale:scale.toArray().every(v=>Math.abs(v-1)<1e-6),
     positiveDeterminant:playerAvatar.root.matrixWorld.determinant()>0,finite:playerAvatar.model.mesh.skeleton.bones.every(b=>b.matrixWorld.elements.every(Number.isFinite))});
   }
   return results;
  });for(const t of transitions)for(const k of ['sceneAttached','unitWorldScale','positiveDeterminant','finite'])assert.equal(t[k],true,t.name+': '+k);
  const bathroom=await page.evaluate(async()=>{
   gameTime.set(1,9,0);activeWorld.bathroomDoor.setOpen(true,true);feetY=0;fly=false;C.position.set(...activeWorld.spawn);drawHero();
   const step=.04,cell=(x,z)=>[Math.round(x/step),Math.round(z/step)],key=p=>p.join(','),start=cell(C.position.x,C.position.z),goal=cell(-2.95,1.8755),queue=[start],parents=new Map([[key(start),null]]);
   for(let i=0;i<queue.length&&!parents.has(key(goal));i++)for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const next=[queue[i][0]+dx,queue[i][1]+dz],id=key(next),x=next[0]*step,z=next[1]*step;
    if(parents.has(id)||activeWorld.groundAt(x,z,0)===null||hit(x,z,0))continue;parents.set(id,queue[i]);queue.push(next);
   }
   if(!parents.has(key(goal)))throw Error('Mirror is unreachable from the apartment entrance');
   const route=[];for(let c=goal;c;c=parents.get(key(c)))route.push([c[0]*step,c[1]*step]);route.reverse();
   for(const [x,z] of route)if(!walkInterior(x,z))throw Error('Blocked on mirror approach');
   C.position.y=1.7;C.position.x=-2.95;C.position.z=1.8755;yaw=Math.PI/2;pitch=0;
   const images=new Set();activeWorld.scene.traverse(o=>{for(const m of o.material?Array.isArray(o.material)?o.material:[o.material]:[])for(const k of ['map','normalMap','roughnessMap','metalnessMap'])if(m[k]?.image?.decode)images.add(m[k].image)});
   await Promise.allSettled([...images].map(i=>i.decode()));for(let i=0;i<20;i++)drawHero(.05);
   const mirror=activeWorld.bathroomMirror,position=mirror.getWorldPosition(new THREE.Vector3());
   window.readMirror=()=>{const target=mirror.getRenderTarget(),bytes=new Uint8Array(target.width*target.height*4);R.readRenderTargetPixels(target,0,0,target.width,target.height,bytes);return bytes};
   window.mirrorPixelsWithHero=readMirror();playerAvatar.root.visible=false;drawHero();const without=readMirror();playerAvatar.root.visible=true;drawHero();
   let changed=0,nonblank=0;for(let i=0;i<without.length;i+=4){if(Math.abs(without[i]-mirrorPixelsWithHero[i])+Math.abs(without[i+1]-mirrorPixelsWithHero[i+1])+Math.abs(without[i+2]-mirrorPixelsWithHero[i+2])>30)changed++;if(without[i]+without[i+1]+without[i+2]>30)nonblank++;}
   const before=mirror.userData.reflectionRenders;yaw=-Math.PI/2;drawHero();const culled=mirror.userData.reflectionRenders===before;yaw=Math.PI/2;drawHero();
   return {routeSteps:route.length,room:zone(C.position.x,C.position.z),clear:!hit(C.position.x,C.position.z,0),nonblankPixels:nonblank,characterPixels:changed,
    reflectionRenders:mirror.userData.reflectionRenders,culledWhenLookingAway:culled,reflectionSeesHead:mirror.reflectionCamera.layers.test(playerAvatar.model.mesh.layers),reflectionSeesFirstPersonDuplicate:mirror.reflectionCamera.layers.test(playerAvatar.firstPersonMesh.layers),
    reflectedEyePosition:mirror.reflectionCamera.position.toArray(),expectedReflectedX:2*position.x-C.position.x};
  });
  assert(bathroom.routeSteps>20);assert.equal(bathroom.clear,true);assert(bathroom.nonblankPixels>100000);assert(bathroom.characterPixels>5000);assert(bathroom.reflectionRenders>3);assert.equal(bathroom.culledWhenLookingAway,true);assert.equal(bathroom.reflectionSeesHead,true);assert.equal(bathroom.reflectionSeesFirstPersonDuplicate,false);assert(Math.abs(bathroom.reflectedEyePosition[0]-bathroom.expectedReflectedX)<1e-5);
  await page.screenshot({path:path.join(out,'bathroom-mirror.png')});
  const motion=await page.evaluate(()=>{
   const old=readMirror(),gait=playerAvatar.state.gait,initial=playerAvatar.model.names.thighL.quaternion.clone();
   for(let i=0;i<8;i++){if(!walkInterior(C.position.x,C.position.z+.025))throw Error('Side step blocked');drawHero(1/60);}
   const next=readMirror();let changed=0;for(let i=0;i<next.length;i+=4)if(Math.abs(old[i]-next[i])+Math.abs(old[i+1]-next[i+1])+Math.abs(old[i+2]-next[i+2])>30)changed++;
   const walking=playerAvatar.state.walking,animated=initial.angleTo(playerAvatar.model.names.thighL.quaternion)>.02,advanced=playerAvatar.state.gait>gait;
   pitch=-.22;yaw=Math.PI/2+.12;drawHero();const eyesFollowHead=playerAvatar.eyes.root.parent===playerAvatar.model.names.head;
   return {changedPixels:changed,walking,animated,advanced,eyesFollowHead};
  });assert(motion.changedPixels>3000);assert(motion.walking>.2);assert.equal(motion.animated,true);assert.equal(motion.advanced,true);assert.equal(motion.eyesFollowHead,true);
  await page.screenshot({path:path.join(out,'mirror-moving.png')});
  await page.evaluate(()=>{pitch=-1.2;yaw=Math.PI/2;drawHero()});await page.screenshot({path:path.join(out,'first-person-body.png')});
  await page.setViewportSize({width:844,height:390});await page.evaluate(()=>{resize();C.position.set(-2.95,1.7,1.8755);yaw=Math.PI/2;pitch=0;for(let i=0;i<20;i++)drawHero(.05)});await page.screenshot({path:path.join(out,'mirror-mobile.png')});
  const bus=await page.evaluate(()=>{
   switchLocation('home',{fresh:true});gameTime.set(1,7,42);
   const step=seconds=>{for(let t=0;t<seconds-1e-6;){const dt=Math.min(.05,seconds-t);t+=dt;clockElapsedMs+=dt*1000;busTransit.update(dt);activeWorld.update?.(dt,{x:C.position.x,z:C.position.z,feet:feetY})}};
   step(1.1);const bus=busTransit.fleet.get('home');C.position.copy(bus.root.localToWorld(new THREE.Vector3(-2.05,1.7-bus.root.position.y,BUS_DOORS[1])));yaw=-Math.PI;pitch=0;updateInteraction(performance.now());
   busTransit.act(getInteractionTarget());step(.8);busTransit.act(getInteractionTarget());step(1.8);for(let i=0;i<25;i++)drawHero(.05);const seated=playerAvatar.state.sitting>.98;
   const r=busTransit.rider;step(r.arrival+1.3-busTransit.timing.service);drawHero();busTransit.act(getInteractionTarget());step(3);for(let i=0;i<30;i++)drawHero(.05);
   return {seated,exited:!busTransit.aboard,standingAgain:playerAvatar.state.sitting<.01,finite:playerAvatar.root.matrixWorld.elements.every(Number.isFinite)};
  });for(const value of Object.values(bus))assert.equal(value,true);
  const live=await page.evaluate(async()=>{
   switchLocation('college1',{fresh:true});C.position.set(.85,1.7,8.975);feetY=0;yaw=0;pitch=0;
   Object.defineProperty(performance,'now',{configurable:true,value:nativePlayerNow});let pending;requestAnimationFrame=fn=>(pending=nativePlayerRAF(fn));last=performance.now();
   const start=C.position.clone();keys.KeyW=true;loop(last);
   for(let i=0;i<6;i++)await new Promise(resolve=>nativePlayerRAF(resolve));keys.KeyW=false;cancelAnimationFrame(pending);requestAnimationFrame=()=>0;
   const result={distance:C.position.distanceTo(start),walking:playerAvatar.state.walking,finite:playerAvatar.root.matrixWorld.elements.every(Number.isFinite)};
   Object.defineProperty(performance,'now',{configurable:true,value:()=>qaTime});return result;
  });assert(live.distance>.05);assert(live.walking>.1);assert.equal(live.finite,true);
  // Separate neutral-light views verify the fitted eyes without changing game lighting.
  await page.setViewportSize({width:900,height:1000});
  await page.evaluate(async()=>{
   window.heroPreview=createPlayerAvatar();const model=heroPreview.model;model.pose({height:model.standingHeight,time:0});
   window.heroScene=new THREE.Scene();heroScene.background=new THREE.Color(0xb9c2c5);heroScene.add(model.root);heroScene.add(new THREE.HemisphereLight(0xf4f8ff,0x6a665e,.85));const light=new THREE.DirectionalLight(0xfff0dd,.85);light.position.set(-2,3,3);heroScene.add(light);
   window.heroCamera=new THREE.PerspectiveCamera(34,.9,.01,10);heroCamera.layers.enable(1);R.setSize(900,1000);R.outputEncoding=THREE.sRGBEncoding;
   for(const e of document.body.children)if(e!==R.domElement)e.style.display='none';await Promise.allSettled(Object.values(model.mesh.material).filter(v=>v?.image?.decode).map(v=>v.image.decode()));
   heroCamera.position.set(0,1,3.6);heroCamera.lookAt(0,.98,0);R.render(heroScene,heroCamera);
  });await page.screenshot({path:path.join(out,'hero-body.png')});
  await page.evaluate(()=>{heroCamera.position.set(0,1.70,.73);heroCamera.lookAt(0,1.70,.03);R.render(heroScene,heroCamera)});await page.screenshot({path:path.join(out,'eyes-corrected.png')});
  await page.evaluate(()=>{heroPreview.eyes.root.visible=false;R.render(heroScene,heroCamera)});await page.screenshot({path:path.join(out,'eyes-original.png')});
  await page.evaluate(()=>{heroPreview.eyes.root.visible=true;heroCamera.position.set(.46,1.7,.55);heroCamera.lookAt(0,1.7,.03);R.render(heroScene,heroCamera)});await page.screenshot({path:path.join(out,'eyes-side.png')});
  let exported;
  if(process.argv.includes('--export')){
   await page.addScriptTag({path:path.join(project,'node_modules/three/examples/js/exporters/GLTFExporter.js')});
   const result=await page.evaluate(async()=>{
    const m=heroPreview.model,root=m.root,joints=Object.values(m.names),clips=[];heroPreview.firstPersonMesh.parent.remove(heroPreview.firstPersonMesh);
    for(const [name,duration,mode] of [['Player_Idle',4,'idle'],['Player_Walk',m.cycleLength/2.7,'walk'],['Player_Seated',4,'seated']]){
     const count=Math.ceil(duration*48),times=[],rotations=joints.map(()=>[]),positions=[],scales=[];
     for(let f=0;f<=count;f++){
      const t=f/count;times.push(t*duration);m.pose({time:t*duration,height:mode==='seated'?.535:m.standingHeight,sitting:mode==='seated'?1:0,walking:mode==='walk'?1:0,gait:mode==='walk'?t:0});
      for(let j=0;j<joints.length;j++)rotations[j].push(...joints[j].quaternion.toArray());positions.push(...m.names.hips.position.toArray());scales.push(...m.names.body.scale.toArray());
     }
     for(const values of rotations)values.splice(values.length-4,4,...values.slice(0,4));positions.splice(positions.length-3,3,...positions.slice(0,3));scales.splice(scales.length-3,3,...scales.slice(0,3));
     const tracks=joints.map((b,j)=>new THREE.QuaternionKeyframeTrack(b.name+'.quaternion',times,rotations[j]));tracks.push(new THREE.VectorKeyframeTrack('hips.position',times,positions),new THREE.VectorKeyframeTrack('body.scale',times,scales));clips.push(new THREE.AnimationClip(name,duration,tracks));
    }
    m.pose({height:m.standingHeight,time:0});root.updateMatrixWorld(true);const original=m.mesh.geometry;m.mesh.geometry=original.clone();m.mesh.geometry.setAttribute('normal',new THREE.Float32BufferAttribute(Float32Array.from(original.attributes.normal.array,v=>v/127),3));
    const result=await new Promise(resolve=>new THREE.GLTFExporter().parse(root,resolve,{binary:true,animations:clips}));m.mesh.geometry.dispose();m.mesh.geometry=original;
    const bytes=new Uint8Array(result);let data='';for(let i=0;i<bytes.length;i+=32768)data+=String.fromCharCode(...bytes.subarray(i,i+32768));return {data:btoa(data),clips:clips.map(c=>({name:c.name,duration:c.duration}))};
   });
   const file=path.join(project,'assets/characters/player/player-animated.glb');fs.writeFileSync(file,Buffer.from(result.data,'base64'));
   await page.addScriptTag({path:path.join(project,'node_modules/three/examples/js/loaders/GLTFLoader.js')});
   const roundTrip=await page.evaluate(async encoded=>{
    const gltf=await new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)).buffer,'',resolve,reject));const mesh=gltf.scene.getObjectByProperty('isSkinnedMesh',true),mixer=new THREE.AnimationMixer(gltf.scene);mixer.clipAction(gltf.animations.find(c=>c.name==='Player_Walk')).play();mixer.setTime(.3);gltf.scene.updateMatrixWorld(true);
    return {bones:mesh.skeleton.bones.length,eyes:!!gltf.scene.getObjectByName('player-eye-left')&&!!gltf.scene.getObjectByName('player-eye-right'),finite:mesh.skeleton.bones.every(b=>b.matrixWorld.elements.every(Number.isFinite)),clips:gltf.animations.length};
   },result.data);assert.equal(roundTrip.bones,15);assert.equal(roundTrip.eyes,true);assert.equal(roundTrip.finite,true);assert.equal(roundTrip.clips,3);exported={bytes:fs.statSync(file).size,clips:result.clips,roundTrip};
  }
  assert.deepEqual(errors,[]);const report={setup,transitions,bathroom,motion,bus,live,exported,errors};fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
