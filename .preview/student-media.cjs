const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const project=path.resolve(__dirname,'..'),out=path.join(__dirname,'students108-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:700}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});
  await page.goto(pathToFileURL(path.join(project,fs.readdirSync(project).find(f=>f!=='index.html'&&f.endsWith('.html')))).href,{waitUntil:'load',timeout:60000});await require('./test-runtime.cjs').startTester(page);
  const modelCount=await page.evaluate(async mishaOnly=>{
   const definitions=[['Дима',student108Asset,'student-108',.884,1.32],['Саня',sanya108Asset,'sanya-108',.775,1.28],['Алексей',alexey108Asset,'alexey-108',.986,1.34],['Миша',misha108Asset,'misha-108',.984,1.30]];
   window.studentStage={models:definitions.filter(([, ,id])=>!mishaOnly||id==='misha-108').map(([name,asset,id,height,speed])=>({name,id,speed,model:buildStudentCharacter(asset,id,height)}))};
   for(const s of studentStage.models){s.model.root.scale.x=1;s.model.root.userData.characterName=s.name;for(const key of ['map','normalMap','roughnessMap'])await s.model.mesh.material[key].image.decode();}
   return studentStage.models.length;
  },process.argv.includes('--misha'));
  const exports=[];
  if(process.argv.includes('--export')){
   await page.addScriptTag({path:path.join(project,'node_modules/three/examples/js/exporters/GLTFExporter.js')});
   for(let index=0;index<modelCount;index++){
    const result=await page.evaluate(async index=>{
     const s=studentStage.models[index],m=s.model,root=m.root,joints=Object.values(m.names),ease=characterEase;
     root.position.set(0,0,0);root.quaternion.identity();root.scale.set(1,1,1);
     const definitions=[['Student_Idle',4,'idle'],['Student_Walk',m.cycleLength/s.speed,'walk'],['Door_Reach_Open',1.60,'door'],['Chair_Pull',1.10,'chair'],['Sit_Down',1.03,'sit'],['Seated_Idle',4,'seated']],clips=[];
     for(const [name,duration,mode] of definitions){
      const count=Math.ceil(duration*(mode==='walk'?48:24)),times=[],rotations=joints.map(()=>[]),positions=[],scales=[],initial=[];let firstPosition,firstScale;
      for(let f=0;f<=count;f++){
       const t=f/count,seconds=t*duration;times.push(seconds);let state={time:seconds,height:m.standingHeight};
       if(mode==='walk')state={...state,walking:1,gait:t};
       if(mode==='door'){const reach=t<.22?ease(t/.22):t>.72?1-ease((t-.72)/.28):1;state={...state,grip:reach,gripTarget:new THREE.Vector3(.34,1.08,.36-.10*ease((t-.22)/.50)),lean:.11*reach,look:-.09*reach};}
       if(mode==='chair')state={...state,reach:.95*Math.sin(Math.PI*t),lean:.26*Math.sin(Math.PI*t)};
       if(mode==='sit')state={...state,sitting:ease(t),height:THREE.MathUtils.lerp(m.standingHeight,.535,ease(t)),lean:.26*Math.sin(Math.PI*t)+.075*ease(t),shift:.055*Math.sin(Math.PI*t)};
       if(mode==='seated')state={...state,sitting:1,height:.535,lean:.075};
       m.pose(state);const close=(mode==='idle'||mode==='seated')?ease((t-.90)/.10):0;
       for(let j=0;j<joints.length;j++){if(f===0)initial[j]=joints[j].quaternion.clone();else if(close>0)joints[j].quaternion.slerp(initial[j],close);joints[j].quaternion.normalize();rotations[j].push(...joints[j].quaternion.toArray());}
       if(f===0){firstPosition=m.names.hips.position.clone();firstScale=m.names.body.scale.clone();}
       positions.push(...m.names.hips.position.clone().lerp(firstPosition,close).toArray());scales.push(...m.names.body.scale.clone().lerp(firstScale,close).toArray());
      }
      if(mode==='walk'){positions.splice(positions.length-3,3,...positions.slice(0,3));for(const r of rotations)r.splice(r.length-4,4,...r.slice(0,4));}
      const tracks=joints.map((bone,j)=>new THREE.QuaternionKeyframeTrack(bone.name+'.quaternion',times,rotations[j]));tracks.push(new THREE.VectorKeyframeTrack('hips.position',times,positions),new THREE.VectorKeyframeTrack('body.scale',times,scales));clips.push(new THREE.AnimationClip(name,duration,tracks));
     }
     m.pose({height:m.standingHeight,time:0});root.updateMatrixWorld(true);
     const original=m.mesh.geometry;m.mesh.geometry=original.clone();m.mesh.geometry.setAttribute('normal',new THREE.Float32BufferAttribute(Float32Array.from(original.attributes.normal.array,v=>v/127),3));
     let result;try{result=await new Promise(resolve=>new THREE.GLTFExporter().parse(root,resolve,{binary:true,animations:clips}));}finally{m.mesh.geometry.dispose();m.mesh.geometry=original;}
     const bytes=new Uint8Array(result);let data='';for(let i=0;i<bytes.length;i+=32768)data+=String.fromCharCode(...bytes.subarray(i,i+32768));
     return {id:s.id,name:s.name,data:btoa(data),clips:clips.map(c=>({name:c.name,duration:c.duration,tracks:c.tracks.length}))};
    },index);
    const destinations={'student-108':'students/dima-animated.glb','sanya-108':'students/sanya-animated.glb','alexey-108':'alexey/alexey-animated.glb','misha-108':'misha/misha-animated.glb'};
    const destination=path.join(project,'assets/characters',destinations[result.id]);
    fs.writeFileSync(destination,Buffer.from(result.data,'base64'));exports.push({id:result.id,file:path.relative(project,destination),bytes:fs.statSync(destination).size,clips:result.clips});console.log('Exported '+result.name);
   }
   await page.addScriptTag({path:path.join(project,'node_modules/three/examples/js/loaders/GLTFLoader.js')});
   for(const exported of exports){
    const encoded=fs.readFileSync(path.join(project,exported.file)).toString('base64');
    exported.roundTrip=await page.evaluate(async encoded=>{
     const gltf=await new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)).buffer,'',resolve,reject)),mixer=new THREE.AnimationMixer(gltf.scene);
     const mesh=gltf.scene.getObjectByProperty('isSkinnedMesh',true);mixer.clipAction(gltf.animations.find(c=>c.name==='Student_Walk')).play();mixer.setTime(.4);gltf.scene.updateMatrixWorld(true);
     return {bones:mesh.skeleton.bones.length,clips:gltf.animations.map(c=>c.name),finite:mesh.skeleton.bones.every(b=>b.matrixWorld.elements.every(Number.isFinite))};
    },encoded);assert.equal(exported.roundTrip.bones,15);assert.equal(exported.roundTrip.clips.length,6);assert.equal(exported.roundTrip.finite,true);
   }
  }
  await page.evaluate(()=>{
   const scene=new THREE.Scene();scene.background=new THREE.Color(0xdce5eb);scene.add(new THREE.HemisphereLight(0xffffff,0x575f61,.92));const sun=new THREE.DirectionalLight(0xfff1df,.80);sun.position.set(-3,6,5);scene.add(sun);
   const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshPhongMaterial({color:0x87999d}));floor.rotation.x=-Math.PI/2;floor.position.y=-.038;scene.add(floor);const grid=new THREE.GridHelper(60,60,0x627b82,0x9caaad);grid.position.y=-.036;scene.add(grid);
   const camera=new THREE.PerspectiveCamera(39,1100/700,.05,100);R.setSize(1100,700);R.setPixelRatio(1);
   studentStage.models.forEach((s,i)=>{
    s.model.root.position.set((i-(studentStage.models.length-1)/2)*1.40,0,-3);scene.add(s.model.root);
    s.shadow=createClassroomCharacterShadow(scene);s.shadow.visible=true;
    const cv=document.createElement('canvas');cv.width=512;cv.height=96;const g=cv.getContext('2d');g.fillStyle='#193e50';g.font='600 48px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(s.name,256,48);
    s.label=new THREE.Mesh(new THREE.PlaneGeometry(.9,.17),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false}));scene.add(s.label);
   });
   studentStage.render=t=>{
    const center=-3+t*1.31;camera.position.set(3.4,2.35,center+6.6);camera.lookAt(0,1.05,center);
    studentStage.models.forEach((s,i)=>{s.model.root.position.z=-3+t*s.speed;s.model.pose({height:s.model.standingHeight,time:t,gait:t*s.speed/s.model.cycleLength,walking:1});s.shadow.position.set(s.model.root.position.x,-.034,s.model.root.position.z);s.label.position.set(s.model.root.position.x,i>=2?2.10:1.95,s.model.root.position.z);s.label.quaternion.copy(camera.quaternion);});
    R.render(scene,camera);
   };
   studentStage.render(.4);for(const child of document.body.children)if(child!==R.domElement)child.style.visibility='hidden';
  });
  await page.screenshot({path:path.join(out,'student-walk-preview.png')});
  const contact=await page.evaluate(()=>{
   const canvas=document.createElement('canvas');canvas.width=2200;canvas.height=700;const g=canvas.getContext('2d');
   for(let i=0;i<8;i++){studentStage.render(i*.14);g.drawImage(R.domElement,(i%4)*550,Math.floor(i/4)*350,550,350);}
   return canvas.toDataURL('image/png').split(',')[1];
  });fs.writeFileSync(path.join(out,'walk-cycle-contact.png'),Buffer.from(contact,'base64'));
  if(process.argv.includes('--video')){
   const recording=await page.evaluate(async()=>{
    const stream=R.domElement.captureStream(24),type=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';
    const recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:2800000}),chunks=[];recorder.ondataavailable=e=>chunks.push(e.data);const stopped=new Promise(resolve=>recorder.onstop=resolve);
    recorder.start();const start=performance.now();let frames=0;
    while(performance.now()-start<6500){studentStage.render((performance.now()-start)/1000);frames++;await new Promise(r=>setTimeout(r,1000/24));}
    recorder.stop();await stopped;stream.getTracks().forEach(t=>t.stop());const bytes=new Uint8Array(await new Blob(chunks,{type}).arrayBuffer());let data='';for(let i=0;i<bytes.length;i+=32768)data+=String.fromCharCode(...bytes.subarray(i,i+32768));return {data:btoa(data),frames,type};
   });fs.writeFileSync(path.join(out,'students-walk.webm'),Buffer.from(recording.data,'base64'));console.log('Recorded '+recording.frames+' frames');
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'media-report.json'),JSON.stringify({exports,errors},null,2)+'\n');console.log(JSON.stringify({exports:exports.map(e=>({id:e.id,bytes:e.bytes,clips:e.clips.length})),errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
