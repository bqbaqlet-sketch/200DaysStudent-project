const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const project=path.resolve(__dirname,'..'),out=path.join(__dirname,'misha-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1794,height:1008}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});
  const main=path.join(project,fs.readdirSync(project).find(f=>f!=='index.html'&&f.endsWith('.html')));
  await page.goto(pathToFileURL(main).href,{waitUntil:'load',timeout:60000});await page.locator('#play').click();
  const report=await page.evaluate(()=>{
   switchLocation('college1',{fresh:true});const world=activeWorld,misha=world.misha108;
   const students=[world.student108,world.alexey108,world.sanya108,misha];
   const door=world.interactiveClassroomDoors.find(d=>d.number==='108'),far={x:999,z:999,feet:0};
   gameTime.set(1,7,43);clockElapsedMs=(7*60+44)*REAL_MS_PER_GAME_MINUTE-50;world.update(.05,far);
   const hiddenBeforeStart=!misha.root.visible;
   clockElapsedMs=(7*60+44)*REAL_MS_PER_GAME_MINUTE;world.update(.05,far);
   const start=misha.root.getWorldPosition(new THREE.Vector3()).toArray();
   gameTime.set(1,7,27);
   const routes=students.map(s=>({id:s.root.name,seatedAt:null}));let minimum=Infinity,doorClear=true,maxCrossers=0,pathClear=true;
   const trace=[],blocked=[];
   for(let time=(7*60+27)*REAL_MS_PER_GAME_MINUTE;time<=(8*60+15)*REAL_MS_PER_GAME_MINUTE;time+=50){
    clockElapsedMs=time;world.update(.05,far);let crossers=0;
    const positions=students.map(s=>s.root.getWorldPosition(new THREE.Vector3()));
    students.forEach((s,i)=>{
     if(!s.root.visible)return;
     if(s.state.elapsed>=s.schedule.enterAt&&s.state.elapsed<s.schedule.clearAt){crossers++;doorClear&&=door.fullyOpen;}
     if(s.state.phase==='seated'&&routes[i].seatedAt===null)routes[i].seatedAt=time/REAL_MS_PER_GAME_MINUTE;
    });
    maxCrossers=Math.max(maxCrossers,crossers);
    for(let i=0;i<students.length;i++)for(let j=i+1;j<students.length;j++)if(students[i].root.visible&&students[j].root.visible)minimum=Math.min(minimum,positions[i].distanceTo(positions[j]));
    if(misha.root.visible&&misha.state.elapsed<misha.schedule.enterAt){
     const p=positions[3],bodyRadius=.28;
     // Use the student's torso clearance; the player's .35 m capsule is wider.
     const obstacles=world.colliders.filter(b=>p.x>b[0]-bodyRadius&&p.x<b[2]+bodyRadius&&p.z>b[1]-bodyRadius&&p.z<b[3]+bodyRadius&&(b.length<6||(1.85>b[4]+.02&&0<b[5]-.02)));
     if(obstacles.length){pathClear=false;if(blocked.length<10)blocked.push({position:p.toArray(),elapsed:misha.state.elapsed,obstacles});}
    }
    if(misha.root.visible&&time%1000===0&&misha.state.phase!=='seated')trace.push({minute:time/REAL_MS_PER_GAME_MINUTE,elapsed:misha.state.elapsed,position:positions[3].toArray(),waiting:misha.state.waitingFor});
   }
   const seat=world.student108Seats.find(s=>s.id==='misha-108');
   const seated={root:misha.root.position.toArray(),chair:misha.chair.position.toArray(),state:{...misha.state},name:misha.root.userData.characterName};
   // Keep the player in the hall at the spawn, then release the whole queue.
   gameTime.set(2,7,43);let waited=false,queueMinimum=Infinity;
   const startMs=(1440+7*60+43)*REAL_MS_PER_GAME_MINUTE,endMs=(1440+8*60+20)*REAL_MS_PER_GAME_MINUTE;
   for(let time=startMs;time<=endMs;time+=50){
    clockElapsedMs=time;const blocking=time<(1440+7*60+46)*REAL_MS_PER_GAME_MINUTE;
    world.update(.05,blocking?{x:.85,z:8.975,feet:0}:far);
    if(blocking&&time>=(1440+7*60+44)*REAL_MS_PER_GAME_MINUTE&&!misha.root.visible&&misha.state.waitingFor)waited=true;
    const positions=students.map(s=>s.root.getWorldPosition(new THREE.Vector3()));
    for(let i=0;i<students.length;i++)for(let j=i+1;j<students.length;j++)if(students[i].root.visible&&students[j].root.visible)queueMinimum=Math.min(queueMinimum,positions[i].distanceTo(positions[j]));
   }
   const queue={waited,minimum:queueMinimum,allSeated:students.every(s=>s.state.phase==='seated')};
   switchLocation('college');switchLocation('college1');const sceneReused=world===activeWorld&&activeWorld.misha108===misha&&misha.state.phase==='seated';
   gameTime.set(3,7,43);const nextDayHidden=!misha.root.visible;gameTime.set(3,8,20);const nextDaySeated=misha.state.phase==='seated';
   const m=misha.model,root=m.root,parent=root.parent,position=root.position.clone(),rotation=root.quaternion.clone(),scale=root.scale.clone();
   parent.remove(root);root.position.set(0,0,0);root.quaternion.identity();root.scale.set(1,1,1);
   const bounds=new THREE.Box3(),point=new THREE.Vector3();let finite=true,weightError=0,hipMin=Infinity,hipMax=-Infinity;
   const weights=m.mesh.geometry.attributes.skinWeight;
   for(let i=0;i<weights.count;i++)weightError=Math.max(weightError,Math.abs(weights.getX(i)+weights.getY(i)+weights.getZ(i)+weights.getW(i)-1));
   for(let i=0;i<=24;i++){
    m.pose({height:m.standingHeight,walking:1,gait:i/24,time:i/24});root.updateMatrixWorld(true);
    hipMin=Math.min(hipMin,m.names.hips.position.y);hipMax=Math.max(hipMax,m.names.hips.position.y);
    for(let v=0;v<m.mesh.geometry.attributes.position.count;v++){point.fromBufferAttribute(m.mesh.geometry.attributes.position,v);m.mesh.boneTransform(v,point);finite&&=point.toArray().every(Number.isFinite);bounds.expandByPoint(point);}
   }
   root.position.copy(position);root.quaternion.copy(rotation);root.scale.copy(scale);parent.add(root);gameTime.set(1,8,20);
   return {hiddenBeforeStart,start,arrivalMinute:misha.arrivalMinute,duration:misha.sequence.duration,routes,minimum,doorClear,maxCrossers,pathClear,trace,blocked,
    seat:{tableX:seat.tableX,tableZ:seat.tableZ,side:seat.side},seated,queue,sceneReused,nextDayHidden,nextDaySeated,
    model:{triangles:m.mesh.geometry.index.count/3,bones:m.mesh.skeleton.bones.length,finite,weightError,hipRange:[hipMin,hipMax],bounds:[bounds.min.toArray(),bounds.max.toArray()]}};
  });
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  assert.equal(report.hiddenBeforeStart,true);assert.equal(report.arrivalMinute,464);
  assert.ok(Math.abs(report.start[0]-.85)<.01&&Math.abs(report.start[2]-8.975)<.01,'Misha must start in the hall');
  assert.deepEqual(report.seat,{tableX:6.65,tableZ:13.32,side:-1});assert.equal(report.seated.name,'Миша');
  assert.ok(Math.abs(report.seated.chair[0]-6.146)<.001&&Math.abs(report.seated.chair[2]-13.035)<.001);
  for(const route of report.routes)assert.ok(route.seatedAt!==null&&route.seatedAt<495,route.id+' must reach the seat');
  for(const key of ['doorClear','pathClear','sceneReused','nextDayHidden','nextDaySeated'])assert.equal(report[key],true,key);
  assert.ok(report.maxCrossers<=1);assert.ok(report.minimum>.53);assert.ok(report.queue.minimum>.53);assert.equal(report.queue.waited,true);assert.equal(report.queue.allSeated,true);
  assert.equal(report.model.triangles,36000);assert.equal(report.model.bones,15);assert.equal(report.model.finite,true);assert.ok(report.model.weightError<1e-6);
  assert.ok(report.model.hipRange[1]-report.model.hipRange[0]>.015);assert.ok(report.model.bounds[0][1]>-.11&&report.model.bounds[1][1]<2.1);
  await page.evaluate(async()=>{
   gameTime.set(1,8,20);const a=activeWorld.misha108.root.parent;
   for(const s of [activeWorld.student108,activeWorld.alexey108,activeWorld.sanya108,activeWorld.misha108])for(const key of ['map','normalMap','roughnessMap'])await s.model.mesh.material[key].image.decode();
   C.position.copy(a.localToWorld(new THREE.Vector3(8.9,1.64,14.25)));C.lookAt(a.localToWorld(new THREE.Vector3(2.2,1.05,15.70)));hud.textContent=zone(C.position.x,C.position.z);R.render(activeWorld.scene,C);
  });await page.screenshot({path:path.join(out,'misha-marked-seat.png')});
  await page.evaluate(()=>{const a=activeWorld.misha108.root.parent;C.position.copy(a.localToWorld(new THREE.Vector3(7.8,1.5,14.1)));C.lookAt(a.localToWorld(new THREE.Vector3(5.93,1.1,13.035)));R.render(activeWorld.scene,C)});
  await page.screenshot({path:path.join(out,'misha-seated-close.png')});
  await page.setViewportSize({width:844,height:390});await page.evaluate(()=>{resize();R.render(activeWorld.scene,C)});await page.screenshot({path:path.join(out,'mobile-landscape.png')});
  assert.deepEqual(errors,[]);report.errors=errors;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({start:report.start,arrivalMinute:report.arrivalMinute,routes:report.routes,seat:report.seat,queue:report.queue,model:report.model,errors},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
