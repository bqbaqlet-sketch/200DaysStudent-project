const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const project=path.resolve(__dirname,'..'),out=path.join(__dirname,'front-student-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1794,height:1008}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});
  const main=path.join(project,fs.readdirSync(project).find(f=>f!=='index.html'&&f.endsWith('.html')));
  await page.goto(pathToFileURL(main).href,{waitUntil:'load',timeout:60000});await require('./test-runtime.cjs').startTester(page);
  const report=await page.evaluate(()=>{
   switchLocation('college1',{fresh:true});const world=activeWorld,student=world.frontStudent108;
   const students=[world.student108,world.alexey108,world.sanya108,world.misha108,student];
   const door=world.interactiveClassroomDoors.find(d=>d.number==='108'),far={x:999,z:999,feet:0};
   gameTime.set(1,7,42);clockElapsedMs=(7*60+43)*REAL_MS_PER_GAME_MINUTE-50;world.update(.05,far);
   const hiddenBeforeStart=!student.root.visible;
   clockElapsedMs=(7*60+43)*REAL_MS_PER_GAME_MINUTE;world.update(.05,far);
   const start=student.root.getWorldPosition(new THREE.Vector3()).toArray();
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
    if(student.root.visible&&student.state.elapsed<student.schedule.enterAt){
     const p=positions[4],bodyRadius=.28;
     // Use the student's torso clearance; the player's .35 m capsule is wider.
     const obstacles=world.colliders.filter(b=>p.x>b[0]-bodyRadius&&p.x<b[2]+bodyRadius&&p.z>b[1]-bodyRadius&&p.z<b[3]+bodyRadius&&(b.length<6||(1.85>b[4]+.02&&0<b[5]-.02)));
     if(obstacles.length){pathClear=false;if(blocked.length<10)blocked.push({position:p.toArray(),elapsed:student.state.elapsed,obstacles});}
    }
    if(student.root.visible&&time%1000===0&&student.state.phase!=='seated')trace.push({minute:time/REAL_MS_PER_GAME_MINUTE,elapsed:student.state.elapsed,position:positions[4].toArray(),waiting:student.state.waitingFor});
   }
   const seat=world.student108Seats.find(s=>s.id==='student-front-108');
   const seated={root:student.root.position.toArray(),chair:student.chair.position.toArray(),state:{...student.state},name:student.root.userData.characterName};
   // Keep the player in the hall at the spawn, then release the whole queue.
   gameTime.set(2,7,42);let waited=false,queueMinimum=Infinity;
   const startMs=(1440+7*60+42)*REAL_MS_PER_GAME_MINUTE,endMs=(1440+8*60+20)*REAL_MS_PER_GAME_MINUTE;
   for(let time=startMs;time<=endMs;time+=50){
    clockElapsedMs=time;const blocking=time<(1440+7*60+46)*REAL_MS_PER_GAME_MINUTE;
    world.update(.05,blocking?{x:.85,z:8.975,feet:0}:far);
    if(blocking&&time>=(1440+7*60+43)*REAL_MS_PER_GAME_MINUTE&&!student.root.visible&&student.state.waitingFor)waited=true;
    const positions=students.map(s=>s.root.getWorldPosition(new THREE.Vector3()));
    for(let i=0;i<students.length;i++)for(let j=i+1;j<students.length;j++)if(students[i].root.visible&&students[j].root.visible)queueMinimum=Math.min(queueMinimum,positions[i].distanceTo(positions[j]));
   }
   const queue={waited,minimum:queueMinimum,allSeated:students.every(s=>s.state.phase==='seated')};
   switchLocation('college');switchLocation('college1');const sceneReused=world===activeWorld&&activeWorld.frontStudent108===student&&student.state.phase==='seated';
   gameTime.set(3,7,42);const nextDayHidden=!student.root.visible;gameTime.set(3,8,20);const nextDaySeated=student.state.phase==='seated';
   const m=student.model,root=m.root,parent=root.parent,position=root.position.clone(),rotation=root.quaternion.clone(),scale=root.scale.clone();
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
   return {hiddenBeforeStart,start,arrivalMinute:student.arrivalMinute,duration:student.sequence.duration,routes,minimum,doorClear,maxCrossers,pathClear,trace,blocked,
    seat:{tableX:seat.tableX,tableZ:seat.tableZ,side:seat.side},seated,queue,sceneReused,nextDayHidden,nextDaySeated,
    model:{triangles:m.mesh.geometry.index.count/3,bones:m.mesh.skeleton.bones.length,finite,weightError,hipRange:[hipMin,hipMax],bounds:[bounds.min.toArray(),bounds.max.toArray()]}};
  });
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  assert.equal(report.hiddenBeforeStart,true);assert.equal(report.arrivalMinute,463);
  assert.ok(Math.abs(report.start[0]-.85)<.01&&Math.abs(report.start[2]-8.975)<.01,'New student must start in the hall');
  assert.deepEqual(report.seat,{tableX:6.65,tableZ:15.51,side:-1});assert.equal(report.seated.name,'Илья');
  assert.ok(Math.abs(report.seated.chair[0]-6.146)<.001&&Math.abs(report.seated.chair[2]-15.225)<.001);
  for(const route of report.routes)assert.ok(route.seatedAt!==null&&route.seatedAt<495,route.id+' must reach the seat');
  for(const key of ['doorClear','pathClear','sceneReused','nextDayHidden','nextDaySeated'])assert.equal(report[key],true,key);
  assert.ok(report.maxCrossers<=1);assert.ok(report.minimum>.53);assert.ok(report.queue.minimum>.53);assert.equal(report.queue.waited,true);assert.equal(report.queue.allSeated,true);
  assert.equal(report.model.triangles,48000);assert.equal(report.model.bones,15);assert.equal(report.model.finite,true);assert.ok(report.model.weightError<1e-6);
  assert.ok(report.model.hipRange[1]-report.model.hipRange[0]>.015);assert.ok(report.model.bounds[0][1]>-.11&&report.model.bounds[1][1]<2.1);
  const life=await page.evaluate(()=>{
   const actor=activeWorld.frontStudent108,far={x:999,z:999,feet:0},modes=new Set(),root=actor.root.position.clone();let maxBlink=0,headRange=[Infinity,-Infinity];
   for(let t=0;t<38;t+=.05){clockElapsedMs=(8*60+20)*REAL_MS_PER_GAME_MINUTE+t*1000;activeWorld.update(.05,far);modes.add(actor.animation.mode);maxBlink=Math.max(maxBlink,actor.eyes.closed);headRange[0]=Math.min(headRange[0],actor.model.names.head.rotation.y);headRange[1]=Math.max(headRange[1],actor.model.names.head.rotation.y);}
   return {modes:[...modes],maxBlink,headRange,staysSeated:actor.root.position.distanceTo(root)<.001,eyes:actor.eyes.eyes.length};
  });report.life=life;assert(life.modes.includes('adjust-cuff')&&life.modes.includes('settle')&&life.modes.includes('attentive-nod')&&life.modes.includes('finger-tap'));assert(life.maxBlink>.9&&life.eyes===2&&life.staysSeated&&life.headRange[1]-life.headRange[0]>.15);
  report.hands=await page.evaluate(()=>{
   const model=activeWorld.frontStudent108.model,mesh=model.mesh,g=mesh.geometry,p=g.attributes.position,indices=g.attributes.skinIndex.array,weights=g.attributes.skinWeight.array;
   const edges=[],seen=new Set(),handVertices=[];
   for(let i=0;i<p.count;i++)if(Math.abs(p.getX(i))>.55&&p.getY(i)<.97&&p.getY(i)>.80)handVertices.push(i);
   for(let i=0;i<g.index.count;i+=3)for(let j=0;j<3;j++){
    const a=g.index.array[i+j],b=g.index.array[i+(j+1)%3],x=Math.abs((p.getX(a)+p.getX(b))/2),y=(p.getY(a)+p.getY(b))/2;
    if(x<.46||x>.55||y<.95||y>1.08)continue;
    const key=Math.min(a,b)+':'+Math.max(a,b);if(seen.has(key))continue;seen.add(key);
    const length=new THREE.Vector3().fromBufferAttribute(p,a).distanceTo(new THREE.Vector3().fromBufferAttribute(p,b));
    if(length>.001)edges.push([a,b,length]);
   }
   function vertex(i){
    const point=new THREE.Vector3().fromBufferAttribute(p,i),result=new THREE.Vector3();
    // r128 boneTransform reads the base attribute itself, so evaluate the GPU
    // morph-before-skinning order explicitly for the relaxed thumb pose.
    point.lerp(new THREE.Vector3().fromBufferAttribute(g.morphAttributes.position[0],i),mesh.morphTargetInfluences[0]).applyMatrix4(mesh.bindMatrix);
    for(let k=0;k<4;k++)if(weights[i*4+k])result.addScaledVector(point.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(mesh.skeleton.bones[indices[i*4+k]].matrixWorld,mesh.skeleton.boneInverses[indices[i*4+k]])),weights[i*4+k]);
    return result.applyMatrix4(mesh.bindMatrixInverse);
   }
   let maxWristStretch=0,minDeskContact=Infinity,maxDeskContact=-Infinity;
   for(let t=0;t<36;t+=.5){
    model.pose({height:.535,sitting:1,time:activeWorld.frontStudent108.sequence.duration+t});model.root.updateMatrixWorld(true);
    for(const [a,b,length] of edges)maxWristStretch=Math.max(maxWristStretch,vertex(a).distanceTo(vertex(b))/length);
    if(t<8){const contact=Math.min(...handVertices.map(i=>vertex(i).y));minDeskContact=Math.min(minDeskContact,contact);maxDeskContact=Math.max(maxDeskContact,contact);}
   }
   model.pose({height:model.standingHeight,walking:1,gait:.25,time:0});
   const walkingRestored=mesh.morphTargetInfluences[0]===0;gameTime.set(1,8,20);
   return {maxWristStretch,minDeskContact,maxDeskContact,walkingRestored};
  });
  assert(report.hands.maxWristStretch<2.4,'Cuffs must not stretch into spikes during idle gestures');
  assert(report.hands.minDeskContact>=.764&&report.hands.maxDeskContact<.779,'Relaxed fingers must rest just above the desk');
  assert(report.hands.walkingRestored,'Walking must restore the source hand shape');
  assert(report.routes.find(r=>r.id==='student-front-108').seatedAt<480,'New student must sit before 08:00');
  report.attention=await page.evaluate(()=>{
   const actor=activeWorld.frontStudent108,far={x:999,z:999,feet:0};clockElapsedMs=(7*60+43)*REAL_MS_PER_GAME_MINUTE+(actor.sequence.duration+.5)*1000;activeWorld.updateCharacters(far,true);actor.root.updateWorldMatrix(true,false);
   const point=actor.root.localToWorld(new THREE.Vector3(.7,0,1.1)),before=actor.animation.look;for(let t=0;t<1;t+=.05){clockElapsedMs+=50;activeWorld.update(.05,{x:point.x,z:point.z,feet:0});}return {before,near:actor.animation.look,mode:actor.animation.mode};
  });assert(Math.abs(report.attention.near-report.attention.before)>.1,'Student must notice a nearby player');
  await page.evaluate(async()=>{
   gameTime.set(1,8,20);const a=activeWorld.misha108.root.parent;
   for(const s of [activeWorld.student108,activeWorld.alexey108,activeWorld.sanya108,activeWorld.misha108,activeWorld.frontStudent108])for(const key of ['map','normalMap','roughnessMap'])await s.model.mesh.material[key].image.decode();
   C.position.copy(a.localToWorld(new THREE.Vector3(8.9,1.64,14.25)));C.lookAt(a.localToWorld(new THREE.Vector3(2.2,1.05,15.70)));hud.textContent=zone(C.position.x,C.position.z);R.render(activeWorld.scene,C);
  });await page.screenshot({path:path.join(out,'student-marked-seat.png')});
  await page.evaluate(()=>{const a=activeWorld.misha108.root.parent;C.position.copy(a.localToWorld(new THREE.Vector3(7.8,1.5,14.7)));C.lookAt(a.localToWorld(new THREE.Vector3(6.165,1.15,15.225)));R.render(activeWorld.scene,C)});
  await page.screenshot({path:path.join(out,'student-seated-close.png')});
  await page.setViewportSize({width:844,height:390});await page.evaluate(()=>{resize();R.render(activeWorld.scene,C)});await page.screenshot({path:path.join(out,'mobile-landscape.png')});
  assert.deepEqual(errors,[]);report.errors=errors;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({start:report.start,arrivalMinute:report.arrivalMinute,routes:report.routes,seat:report.seat,queue:report.queue,model:report.model,errors},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
