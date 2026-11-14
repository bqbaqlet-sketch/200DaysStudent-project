const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const project=path.resolve(__dirname,'..'),out=path.join(__dirname,'driver-qa');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:700}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});
  await page.goto(pathToFileURL(path.join(project,fs.readdirSync(project).find(f => f !== 'index.html' && f.endsWith('.html')))).href,{waitUntil:'load',timeout:60000});
  await require('./test-runtime.cjs').startTester(page);
  const report=await page.evaluate(()=>{
   const college=busTransit.fleet.get('college'),actor=college.driver.root,model=actor.getObjectByName('bus-driver-imported-mesh');
   const report={triangles:model.geometry.index.count/3,bones:model.skeleton.bones.length,steeringMeshes:college.steering.children.length,weightsNormalized:true};
   const weights=model.geometry.attributes.skinWeight;
   for(let i=0;i<weights.count;i++)if(Math.abs(weights.getX(i)+weights.getY(i)+weights.getZ(i)+weights.getW(i)-1)>1e-6)report.weightsNormalized=false;
   const samples=[];const v=new THREE.Vector3();
   for(const state of [{time:0,speed:0,doors:1,phase:1.1},{time:4,speed:7,doors:0,phase:16},{time:6,speed:2,doors:.8,phase:8.1}]){
    const angle=college.driver.sample(state.time,state);college.steering.quaternion.setFromAxisAngle(new THREE.Vector3(0,.946,-.324).normalize(),angle);
    actor.updateWorldMatrix(true,true);
    const bounds=new THREE.Box3();
    for(let i=0;i<model.geometry.attributes.position.count;i++){v.fromBufferAttribute(model.geometry.attributes.position,i);model.boneTransform(i,v);v.applyMatrix4(model.matrixWorld);college.root.worldToLocal(v);bounds.expandByPoint(v)}
    const handDistances=[];
    for(const hand of ['handL','handR']){
     const wrist=college.driver.names[hand].getWorldPosition(new THREE.Vector3());let nearest=Infinity;
     college.steering.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position,index=o.geometry.index;for(let i=0;i<index.count;i++){v.fromBufferAttribute(p,index.getX(i)).applyMatrix4(o.matrixWorld);nearest=Math.min(nearest,v.distanceTo(wrist))}});
     handDistances.push(nearest);
    }
    samples.push({state:actor.userData.animationState,bounds:[bounds.min.toArray(),bounds.max.toArray()],handDistances,head:college.driver.names.head.quaternion.toArray(),steering:angle});
   }
   report.samples=samples;
   switchLocation('home',{fresh:true});const home=busTransit.fleet.get('home'),other=home.driver.root.getObjectByName('bus-driver-imported-mesh');
   report.sharedGeometry=other.geometry===model.geometry;report.sharedMaterial=other.material===model.material;
   report.independentSkeletons=other.skeleton!==model.skeleton&&other.skeleton.bones.every(b=>!model.skeleton.bones.includes(b));
   const previous=college.driver.names.head.quaternion.clone();home.driver.sample(19,{speed:7,doors:0,phase:25});
   report.poseIsolated=previous.angleTo(college.driver.names.head.quaternion)<1e-6;
   switchLocation('college',{fresh:true});college.driver.sample(1355,{speed:7,doors:0,phase:15});
   C.position.copy(college.root.localToWorld(new THREE.Vector3(-.65,1.7,5.35)));C.lookAt(college.root.localToWorld(new THREE.Vector3(.69,1.4,4.9)));R.render(activeWorld.scene,C);
   return report;
  });
  assert.equal(report.triangles,36000);assert.equal(report.bones,17);assert.ok(report.steeringMeshes>0,'Original steering wheel must be separated');
  for(const key of ['weightsNormalized','sharedGeometry','sharedMaterial','independentSkeletons','poseIsolated'])assert.equal(report[key],true,key);
  for(const s of report.samples){
   assert.ok(s.bounds.flat().every(Number.isFinite));
   const [min,max]=s.bounds;assert.ok(min[0]>.20&&max[0]<1.20&&min[1]>.25&&max[1]<1.95&&min[2]>4.3&&max[2]<5.7,'Driver must remain seated inside the cabin');
   for(const d of s.handDistances)assert.ok(d<.11,'Hands must stay on the existing wheel');
  }
  assert.equal(report.samples[0].state,'door-check');assert.equal(report.samples[1].state,'driving');
  assert.notDeepEqual(report.samples[0].head,report.samples[1].head);assert.notEqual(report.samples[0].steering,report.samples[1].steering);
  await page.screenshot({path:path.join(out,'driver-in-game.png')});
  if(process.argv.includes('--export')){
   await page.addScriptTag({path:path.join(project,'node_modules/three/examples/js/exporters/GLTFExporter.js')});
   const exported=await page.evaluate(async()=>{
    const driver=busTransit.fleet.get('college').driver,actor=driver.root,anchor=actor.parent;
    anchor.remove(actor);actor.updateMatrixWorld(true);
    const joints=busDriverAsset.joints.map(([name])=>driver.names[name]);
    const clips=[];
    for(const [name,duration,mode] of [['Driver_Idle',8,'idle'],['Driver_Driving',10,'driving'],['Driver_DoorCheck',8.8,'door'],['Driver_MirrorCheck',7.3,'mirror']]){
     const count=Math.ceil(duration*24),times=[],positions=[],rotations=joints.map(()=>[]),initial=[];
     for(let frame=0;frame<=count;frame++){
      const t=frame/count*duration;times.push(t);
      driver.sample(t,{speed:mode==='idle'||mode==='door'?0:7,doors:mode==='door'?1:0,phase:mode==='door'?t:15});
      const fade=frame/count>.90?(frame/count-.90)/.10:0;
      for(let j=0;j<joints.length;j++){if(frame===0)initial[j]=joints[j].quaternion.clone();else if(fade>0)joints[j].quaternion.slerp(initial[j],fade);rotations[j].push(...joints[j].quaternion.toArray())}
      const y=driver.names.hips.position.y;positions.push(0,THREE.MathUtils.lerp(y,.125,fade),-.01);
     }
     positions.splice(positions.length-3,3,...positions.slice(0,3));
     const tracks=joints.map((joint,j)=>new THREE.QuaternionKeyframeTrack(joint.name+'.quaternion',times,rotations[j]));
     tracks.push(new THREE.VectorKeyframeTrack('hips.position',times,positions));clips.push(new THREE.AnimationClip(name,duration,tracks));
    }
    driver.sample(0);actor.updateMatrixWorld(true);
    for(const joint of joints)joint.quaternion.normalize();
    const model=actor.getObjectByName('bus-driver-imported-mesh');
    for(const key of ['map','normalMap','roughnessMap'])await model.material[key].image.decode();
    const originalGeometry=model.geometry;
    model.geometry=originalGeometry.clone();
    model.geometry.setAttribute('normal',new THREE.Float32BufferAttribute(Float32Array.from(originalGeometry.attributes.normal.array,value=>value/127),3));
    let result;
    try{result=await new Promise(resolve=>new THREE.GLTFExporter().parse(actor,resolve,{binary:true,animations:clips}));}
    finally{model.geometry.dispose();model.geometry=originalGeometry;anchor.add(actor);}
    const bytes=new Uint8Array(result);let s='';for(let i=0;i<bytes.length;i+=32768)s+=String.fromCharCode(...bytes.subarray(i,i+32768));
    return {data:btoa(s),clips:clips.map(c=>({name:c.name,seconds:c.duration,tracks:c.tracks.length}))};
   });
   const destination=path.join(project,'assets/characters/bus-driver/bus-driver-animated.glb');fs.writeFileSync(destination,Buffer.from(exported.data,'base64'));
   report.export={file:path.relative(project,destination),bytes:fs.statSync(destination).size,clips:exported.clips};
   await page.addScriptTag({path:path.join(project,'node_modules/three/examples/js/loaders/GLTFLoader.js')});
   report.export.roundTrip=await page.evaluate(async encoded=>{
    const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
    const gltf=await new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(bytes.buffer,'',resolve,reject));
    const model=gltf.scene.getObjectByProperty('isSkinnedMesh',true),mixer=new THREE.AnimationMixer(gltf.scene);
    mixer.clipAction(gltf.animations.find(a=>a.name==='Driver_Driving')).play();mixer.setTime(2.5);
    gltf.scene.updateMatrixWorld(true);
    return {clips:gltf.animations.map(a=>a.name),bones:model.skeleton.bones.length,finite:model.skeleton.bones.every(b=>b.matrixWorld.elements.every(Number.isFinite))};
   },exported.data);
   assert.equal(report.export.roundTrip.bones,17);assert.equal(report.export.roundTrip.clips.length,4);assert.equal(report.export.roundTrip.finite,true);
  }
  assert.deepEqual(errors,[]);report.javascriptErrors=errors;
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
