const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const project=path.resolve(__dirname,'..'),out=path.join(__dirname,'students108-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1240,height:700}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});
  await page.goto(pathToFileURL(path.join(project,fs.readdirSync(project).find(f=>f!=='index.html'&&f.endsWith('.html')))).href,{waitUntil:'load',timeout:60000});await require('./test-runtime.cjs').startTester(page);
  const report=await page.evaluate(()=>{
   switchLocation('college1',{fresh:true});const world=activeWorld,students=[world.student108,world.alexey108,world.sanya108],door=world.interactiveClassroomDoors.find(d=>d.number==='108');
   const far={x:999,z:999,feet:0},start=(7*60+27)*REAL_MS_PER_GAME_MINUTE,end=8*60*REAL_MS_PER_GAME_MINUTE;
   gameTime.set(1,7,27);const routes=students.map(s=>({id:s.root.name,arrival:s.arrivalMinute,passedEntrance:false,passedTurnstiles:false,seatedAt:null}));
   let minimum=Infinity,doorClear=true,maxCrossers=0,preEntryHidden=false;
   for(let time=start;time<=end;time+=50){
    clockElapsedMs=time;world.update(.05,far);
    const positions=students.map(s=>s.root.getWorldPosition(new THREE.Vector3()));
    if(time===(7*60+34)*REAL_MS_PER_GAME_MINUTE-50)preEntryHidden=!world.alexey108.root.visible;
    let crossing=0;
    students.forEach((s,i)=>{
     if(!s.root.visible)return;const p=positions[i],r=routes[i];
     if(Math.hypot(p.x-.55,p.z-.68)<.25)r.passedEntrance=true;
     if(Math.abs(p.x-.85)<.35&&p.z>4.3&&p.z<6.0)r.passedTurnstiles=true;
     if(s.state.elapsed>=s.schedule.enterAt&&s.state.elapsed<s.schedule.clearAt){crossing++;if(!door.fullyOpen)doorClear=false;}
     if(s.state.phase==='seated'&&r.seatedAt===null)r.seatedAt=time/REAL_MS_PER_GAME_MINUTE;
    });
    maxCrossers=Math.max(maxCrossers,crossing);
    for(let i=0;i<students.length;i++)for(let j=i+1;j<students.length;j++)if(students[i].root.visible&&students[j].root.visible)minimum=Math.min(minimum,positions[i].distanceTo(positions[j]));
   }
   const normal=students.map(s=>({id:s.root.name,state:s.state,schedule:s.schedule,world:s.root.getWorldPosition(new THREE.Vector3()).toArray(),local:s.root.position.toArray(),chair:s.chair.position.toArray(),locomotion:s.root.userData.locomotion}));
   // Hold up the line at the turnstiles, then let everybody continue.
   gameTime.set(1,7,29);let queueMinimum=Infinity,waits=0;
   for(let time=(7*60+29)*REAL_MS_PER_GAME_MINUTE;time<=(8*60+10)*REAL_MS_PER_GAME_MINUTE;time+=50){
    clockElapsedMs=time;world.update(.05,time<(7*60+42)*REAL_MS_PER_GAME_MINUTE?{x:.85,z:4.28,feet:0}:far);
    const positions=students.map(s=>s.root.getWorldPosition(new THREE.Vector3()));
    for(let i=0;i<students.length;i++){if(students[i].state.waitingFor)waits++;for(let j=i+1;j<students.length;j++)if(students[i].root.visible&&students[j].root.visible)queueMinimum=Math.min(queueMinimum,positions[i].distanceTo(positions[j]));}
   }
   const queue={minimum:queueMinimum,waits,allSeated:students.every(s=>s.state.phase==='seated')};
   gameTime.set(2,7,33);let entranceWaited=false;
   for(let time=((24*60)+(7*60+33))*REAL_MS_PER_GAME_MINUTE;time<=((24*60)+(7*60+36))*REAL_MS_PER_GAME_MINUTE;time+=50){
    clockElapsedMs=time;const block=time<((24*60)+(7*60+35))*REAL_MS_PER_GAME_MINUTE;world.update(.05,block?{x:.55,z:.68,feet:0}:far);
    if(block&&time>=((24*60)+(7*60+34))*REAL_MS_PER_GAME_MINUTE&&!world.alexey108.root.visible&&world.alexey108.state.waitingFor)entranceWaited=true;
   }
   const entranceResumed=world.alexey108.root.visible;
   gameTime.set(2,8,30);const secondDay=students.every(s=>s.root.visible&&s.state.phase==='seated');
   const motion=[];
   for(const s of students){
    const m=s.model,root=m.root,parent=root.parent,position=root.position.clone(),quaternion=root.quaternion.clone(),scale=root.scale.clone();parent.remove(root);root.position.set(0,0,0);root.quaternion.identity();root.scale.set(1,1,1);
    let minY=Infinity,maxY=-Infinity,hipMin=Infinity,hipMax=-Infinity,plantError=0,previous=[null,null];
    for(let i=0;i<=48;i++){
     const gait=i/48;m.pose({height:m.standingHeight,walking:1,gait,time:gait*1.1});root.updateMatrixWorld(true);
     hipMin=Math.min(hipMin,m.names.hips.position.y);hipMax=Math.max(hipMax,m.names.hips.position.y);
     for(let leg=0;leg<2;leg++){
      const foot=m.names[leg?'footR':'footL'].getWorldPosition(new THREE.Vector3()),ankle=m.names[leg?'footR':'footL'];
      const bindHeight=s.model.root.name==='sanya-108'?.09387:s.model.root.name==='student-108'?.10028:.104;
      const grounded=foot.y<bindHeight+.018,z=foot.z+gait*m.cycleLength;
      if(grounded&&previous[leg])plantError=Math.max(plantError,Math.abs(z-previous[leg]));previous[leg]=grounded?z:null;
     }
     if(i%8===0){const p=new THREE.Vector3();for(let v=0;v<m.mesh.geometry.attributes.position.count;v++){p.fromBufferAttribute(m.mesh.geometry.attributes.position,v);m.mesh.boneTransform(v,p);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);}}
    }
    motion.push({id:root.name,hipRange:[hipMin,hipMax],boundsY:[minY,maxY],plantError,stride:m.cycleLength,bones:m.mesh.skeleton.bones.length,triangles:m.mesh.geometry.index.count/3});
    root.position.copy(position);root.quaternion.copy(quaternion);root.scale.copy(scale);parent.add(root);
   }
   gameTime.set(1,8,41);
   const seats=world.student108Seats.map(s=>({id:s.id,tableX:s.tableX,tableZ:s.tableZ,side:s.side,chair:s.chair.position.toArray()}));
   return {preEntryHidden,routes,normal,minimum,doorClear,maxCrossers,queue,entranceWaited,entranceResumed,secondDay,motion,seats};
  });
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  assert.equal(report.preEntryHidden,true);assert.equal(report.doorClear,true);assert.ok(report.maxCrossers<=1);
  for(const r of report.routes){assert.equal(r.passedEntrance,true,r.id+' entrance');assert.equal(r.passedTurnstiles,true,r.id+' turnstiles');assert.ok(r.seatedAt!==null&&r.seatedAt<480,r.id+' seated');}
  assert.equal(report.routes.find(r=>r.id==='alexey-108').arrival,454);assert.ok(report.minimum>.53);assert.ok(report.queue.minimum>.53);assert.ok(report.queue.waits>0);assert.equal(report.queue.allSeated,true);
  for(const key of ['entranceWaited','entranceResumed','secondDay'])assert.equal(report[key],true,key);
  const seat=report.seats.find(s=>s.id==='alexey-108');assert.deepEqual([seat.tableX,seat.tableZ,seat.side],[4.95,16.69,1]);
  for(const m of report.motion){assert.ok(m.hipRange[1]-m.hipRange[0]>.015);assert.ok(m.boundsY[0]>-.11&&m.boundsY[1]<2.1,m.id+' finite human bounds');assert.ok(m.plantError<.075,m.id+' planted-foot slide');}
  await page.evaluate(async()=>{
   const w=activeWorld;gameTime.set(1,8,41);for(const s of [w.student108,w.alexey108,w.sanya108])for(const key of ['map','normalMap','roughnessMap'])await s.model.mesh.material[key].image.decode();
   const anchor=w.alexey108.root.parent;C.position.copy(anchor.localToWorld(new THREE.Vector3(8.9,1.64,14.25)));C.lookAt(anchor.localToWorld(new THREE.Vector3(2.2,1.05,15.70)));hud.textContent=zone(C.position.x,C.position.z);R.render(w.scene,C);
  });await page.screenshot({path:path.join(out,'alexey-in-room108.png')});
  assert.deepEqual(errors,[]);report.javascriptErrors=errors;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({routes:report.routes,separation:report.minimum,queue:report.queue,motion:report.motion,secondDay:report.secondDay,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
