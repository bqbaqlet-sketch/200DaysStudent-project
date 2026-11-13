const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const project=path.resolve(__dirname,'..'),out=path.join(__dirname,'nvp110-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:740}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});
  await page.goto(pathToFileURL(path.join(project,fs.readdirSync(project).find(n => n !== 'index.html' && n.endsWith('.html')))).href,{waitUntil:'load',timeout:60000});
  await page.locator('#play').click();
  const report=await page.evaluate(()=>{
   switchLocation('college1',{fresh:true});const world=activeWorld,nvp=world.nvp110,actor=nvp.model.root;
   const start=nvp.schedule.startMinute*REAL_MS_PER_GAME_MINUTE,deadline=NVP_TEACHER.seatedMinute*REAL_MS_PER_GAME_MINUTE;
   const report={schedule:nvp.schedule,joints:nvp.model.mesh.skeleton.bones.length,triangles:nvp.model.mesh.geometry.index.count/3,clips:Object.fromEntries(Object.entries(nvp.model.clips).map(([name,clip])=>[name,{name:clip.name,duration:clip.duration}]))};
   gameTime.set(1,7,27);clockElapsedMs=start-50;world.update(.05,null);report.hiddenBeforeArrival=!actor.visible;
   const samples=[];let openCrossing=true,passedEntrance=false,passedTurnstiles=false,firstSeated=null;
   let last=start-50;
   for(let i=0;i<=Math.ceil(nvp.schedule.duration/.05)+4;i++){
    const time=start+i*.05*1000;clockElapsedMs=time;world.update((time-last)/1000,null);last=time;
    const p=actor.getWorldPosition(new THREE.Vector3()),local=actor.position;
    if(Math.hypot(p.x-.55,p.z-.68)<.10)passedEntrance=true;
    if(Math.abs(p.x-.85)<.30&&p.z>4.3&&p.z<6.0)passedTurnstiles=true;
    if(Math.abs(local.x)<.50&&local.z>.10&&local.z<.85&&!world.interactiveClassroomDoors.find(d=>d.number==='110').fullyOpen)openCrossing=false;
    if(actor.userData.activity==='seated'&&firstSeated===null)firstSeated=time/REAL_MS_PER_GAME_MINUTE;
    if(i%20===0)samples.push({minute:time/REAL_MS_PER_GAME_MINUTE,position:p.toArray(),activity:actor.userData.activity});
   }
   report.realtime={passedEntrance,passedTurnstiles,openCrossing,firstSeated,samples};
   gameTime.set(1,7,35);report.at0735={visible:actor.visible,activity:actor.userData.activity,position:actor.position.toArray(),chair:nvp.chair.position.toArray(),room:world.roomAt(...[actor.getWorldPosition(new THREE.Vector3()).x,actor.getWorldPosition(new THREE.Vector3()).z],0)};
   const q=actor.quaternion.clone();world.updateCharacters(null,true);report.repeatSeekStable=actor.quaternion.angleTo(q)<1e-6;
   gameTime.set(2,7,35);report.day2=actor.visible&&actor.userData.activity==='seated';
   switchLocation('home',{fresh:true});gameTime.set(1,7,35);switchLocation('college1');report.sceneReused=activeWorld===world&&activeWorld.nvp110===nvp&&actor.userData.activity==='seated';
   gameTime.set(1,7,50);report.otherCharacters=['teacher-110','visitor-110','director-110'].map(name=>({name,visible:!!world.scene.getObjectByName(name)?.visible}));
   report.roomDoor=world.interactiveClassroomDoors.find(d=>d.number==='110').name;
   const model=nvp.model.mesh,points=model.geometry.attributes.position,bounds=new THREE.Box3(),p=new THREE.Vector3();actor.updateWorldMatrix(true,true);
   for(let i=0;i<points.count;i++){p.fromBufferAttribute(points,i);model.boneTransform(i,p);p.applyMatrix4(model.matrixWorld);actor.parent.worldToLocal(p);bounds.expandByPoint(p)}
   report.seatedBounds=[bounds.min.toArray(),bounds.max.toArray()];
   return report;
  });
  assert.equal(report.joints,52);assert.equal(report.triangles,36000);assert.equal(report.hiddenBeforeArrival,true);
  for(const key of ['passedEntrance','passedTurnstiles','openCrossing'])assert.equal(report.realtime[key],true,key);
  assert.ok(report.realtime.firstSeated<=455+.1,'Must be seated by 07:35');assert.equal(report.at0735.activity,'seated');assert.equal(report.at0735.visible,true);
  assert.match(report.at0735.room,/Учительская 110/);assert.match(report.roomDoor,/Учительская/);
  for(const key of ['repeatSeekStable','day2','sceneReused'])assert.equal(report[key],true,key);assert.ok(report.otherCharacters.every(c=>c.visible));
  assert.ok(report.seatedBounds.flat().every(Number.isFinite));assert.ok(report.seatedBounds[0][1]>-.1&&report.seatedBounds[1][1]<1.65,'Seated deformation must fit chair height');
  await page.addScriptTag({path:path.join(project,'node_modules/three/examples/js/loaders/GLTFLoader.js')});
  const prepared=fs.readFileSync(path.join(project,'assets/characters/nvp-teacher/nvp-teacher-prepared.glb')).toString('base64');
  report.stancePreserved=await page.evaluate(async encoded=>{
   const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),gltf=await new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(bytes.buffer,'',resolve,reject));
   const mixer=new THREE.AnimationMixer(gltf.scene);mixer.clipAction(gltf.animations.find(a=>a.name==='human_000000')).play();mixer.setTime(2.1);
   const model=activeWorld.nvp110.model;model.sampleStance(2.1);
   let error=0;for(const [name,bone] of Object.entries(model.names)){const original=gltf.scene.getObjectByName(name);error=Math.max(error,1-Math.abs(bone.quaternion.dot(original.quaternion)));}
   activeWorld.updateCharacters(null,true);return {maxQuaternionError:error,sourceClips:gltf.animations.map(a=>a.name)};
  },prepared);
  assert.ok(report.stancePreserved.maxQuaternionError<1e-5);assert.deepEqual(report.stancePreserved.sourceClips,['human_000000','human_000089']);
  await page.evaluate(async()=>{
   gameTime.set(1,7,35);const n=activeWorld.nvp110,anchor=n.model.root.parent;
   for(const key of ['map','normalMap','roughnessMap'])await n.model.mesh.material[key].image.decode();
   C.position.copy(anchor.localToWorld(new THREE.Vector3(3.2,1.52,1.45)));C.lookAt(anchor.localToWorld(new THREE.Vector3(5.01,1.0,2.695)));
   hud.textContent=zone(C.position.x,C.position.z);applyGameLighting(activeWorld);R.render(activeWorld.scene,C);
  });
  await page.screenshot({path:path.join(out,'nvp-in-staff-room.png')});
  assert.deepEqual(errors,[]);report.javascriptErrors=errors;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
