const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'room212-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1360,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.addInitScript(()=>{requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});
  const project=path.resolve(__dirname,'..'),game=fs.readdirSync(project).find(f=>f!=='index.html'&&f.endsWith('.html'));
  await page.goto(pathToFileURL(path.join(project,game)).href,{waitUntil:'load',timeout:60000});await page.locator('#play').click();
  const arrival=await page.evaluate(()=>{
   switchLocation('college1',{fresh:true});gameTime.set(1,9,30);
   const world=activeWorld,room=world.room212;let samples=0,highest=0;
   window.walk212=points=>{
    for(let i=1;i<points.length;i++){
     const [x,z]=points[i-1],[xx,zz]=points[i],steps=Math.ceil(Math.hypot(xx-x,zz-z)/.025);
     for(let j=1;j<=steps;j++){
      const a=x+(xx-x)*j/steps,b=z+(zz-z)*j/steps;
      if(!walkInterior(a,b))throw Error('Blocked at '+JSON.stringify({x:a,z:b,feetY}));
      C.position.y=feetY+1.7;samples++;highest=Math.max(highest,feetY);
     }
    }
   };
   window.local212=([x,z])=>{const p=room.frame.localToWorld(new THREE.Vector3(x,0,z));return [p.x,p.z]};
   window.walkLocal212=points=>walk212(points.map(local212));
   C.position.set(16.3,1.7,8.975);feetY=0;
   walk212([[16.3,8.975],[16.3,.825],[21.625,.825],[21.625,6.875],[16.65,6.875]]);
   // Follow the actual upper-floor passages around the existing plant stands.
   const step=.06,cell=(x,z)=>[Math.round(x/step),Math.round(z/step)],key=([x,z])=>x+','+z;
   const start=cell(C.position.x,C.position.z),goal=cell(.2,10.1),queue=[start],parents=new Map([[key(start),null]]);
   for(let i=0;i<queue.length&&!parents.has(key(goal));i++){
    const [x,z]=queue[i];
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
     const next=[x+dx,z+dz],id=key(next),xx=next[0]*step,zz=next[1]*step;
     if(parents.has(id)||hit(xx,zz,3.74)||world.groundAt(xx,zz,3.74)!==3.74)continue;
     parents.set(id,[x,z]);queue.push(next);
    }
   }
   if(!parents.has(key(goal)))throw Error('Room 212 cannot be reached from the stairs');
   const route=[];for(let c=goal;c;c=parents.get(key(c)))route.push([c[0]*step,c[1]*step]);
   walk212([[C.position.x,C.position.z],...route.reverse(),[.2,10.05]]);
   updateInteraction(performance.now());
   return {samples,highest,floor:feetY,target:getInteractionTarget()?.door?.number,closedDoorSolid:hit(room.door.x,room.door.z,3.74),duplicates:world.scene.userData.classroomDoors.filter(d=>d.number==='212').length};
  });
  assert.equal(arrival.floor,3.74);assert.equal(arrival.target,'212');assert.equal(arrival.closedDoorSolid,true);assert.equal(arrival.duplicates,1);
  await page.keyboard.press('e');await page.keyboard.press('2');
  const report=await page.evaluate(()=>{
   const world=activeWorld,room=world.room212;
   for(let i=0;i<20;i++)world.update(.05,{x:C.position.x,z:C.position.z,feet:feetY});
   if(!room.door.fullyOpen)throw Error('Door 212 failed to open');
   walkLocal212([[0,-.60],[0,.85],[0,2.30],[-.30,2.30],[-4.10,2.30],[-4.10,3.10],[-4.10,2.30]]);
   const roomName=world.roomAt(C.position.x,C.position.z,feetY),workstations=[];
   for(const {x,z} of room.workstationPositions){
    const p=room.frame.worldToLocal(C.position.clone());
    walkLocal212([[p.x,p.z],[p.x,2.30],[x,2.30],[x,2.15],[x,2.30]]);workstations.push({x,z,reachable:true});
   }
   const p=room.frame.worldToLocal(C.position.clone());walkLocal212([[p.x,p.z],[p.x,2.30],[-.30,2.30]]);
   room.door.setOpen(false);for(let i=0;i<20;i++)world.update(.05,{x:C.position.x,z:C.position.z,feet:feetY});
   const closesFromInside=!room.door.open&&hit(room.door.x,room.door.z,feetY);
   walkLocal212([[-.30,2.30],[0,2.30],[0,.65]]);updateInteraction(performance.now());
   const direction=room.frame.localToWorld(new THREE.Vector3(0,1.7,1)).sub(room.frame.localToWorld(new THREE.Vector3(0,1.7,0))).normalize();
   const ray=new THREE.Raycaster(room.frame.localToWorld(new THREE.Vector3(0,1.7,.30)),direction),views=[];
   world.scene.traverse(o=>{if(o.userData?.kind==='room212WindowView')views.push(o)});world.scene.updateMatrixWorld(true);
   const straightWindow=ray.intersectObjects(views)[0]?.object.userData.oppositeEntry===true;
   const left=room.frame.localToWorld(new THREE.Vector3(-4.1,0,2.3)),right=room.frame.localToWorld(new THREE.Vector3(1.2,0,2.3));
   const extendsLeft=room.bounds.left<-5&&room.bounds.right<1&&room.bounds.depth<4&&room.workstationAxis==='x'&&world.groundAt(left.x,left.z,3.74)===3.74&&world.groundAt(right.x,right.z,3.74)===null;
   const nextDoor=world.scene.userData.classroomDoors.find(d=>d.number==='214'&&d.wing==='upper-left');
   return {roomName,workstations,closesFromInside,insideTarget:getInteractionTarget()?.door?.number,fixture:world.scene.userData.fixtures.find(f=>f.kind==='room212'),floor:feetY,
    layout:{revision:room.layoutRevision,straightWindow,extendsLeft,nextDoorPreserved:!!nextDoor&&hit(nextDoor.x,nextDoor.z,3.74),bounds:room.bounds},
    otherStudentsPresent:[world.student108,world.alexey108,world.sanya108,world.misha108].every(s=>s.state.phase==='seated'),finiteColliders:world.colliders.every(c=>c.every(Number.isFinite))};
  });
  assert.equal(report.roomName,'Корпус 1 · Кабинет 212 · Информатика');assert.equal(report.floor,3.74);assert.equal(report.closesFromInside,true);assert.equal(report.insideTarget,'212');
  assert.equal(report.workstations.length,3);assert.equal(report.fixture.windows,2);assert.equal(report.fixture.clutter,false);assert.equal(report.otherStudentsPresent,true);assert.equal(report.finiteColliders,true);
  assert.equal(report.layout.revision,2);for(const key of ['straightWindow','extendsLeft','nextDoorPreserved'])assert.equal(report.layout[key],true,key);
  await page.keyboard.press('e');await page.keyboard.press('2');
  report.openingStopsForPlayer=await page.evaluate(()=>{
   for(let i=0;i<20;i++)activeWorld.update(.05,{x:C.position.x,z:C.position.z,feet:feetY});
   const stopped=!activeWorld.room212.door.fullyOpen;
   walkLocal212([[0,.65],[0,1.35]]);
   for(let i=0;i<20;i++)activeWorld.update(.05,{x:C.position.x,z:C.position.z,feet:feetY});
   if(!activeWorld.room212.door.fullyOpen)throw Error('Opening failed to resume after stepping back');
   walkLocal212([[0,1.35],[0,-.65],[0,-1.25]]);if(Math.abs(feetY-3.74)>.001)throw Error('Exit changed floor');
   return stopped;
  });assert.equal(report.openingStopsForPlayer,true);
  async function shot(name,eye,target){
   await page.evaluate(({eye,target})=>{
    const room=activeWorld.room212;feetY=3.74;C.position.copy(room.frame.localToWorld(new THREE.Vector3(...eye)));C.lookAt(room.frame.localToWorld(new THREE.Vector3(...target)));
    hud.textContent=zone(C.position.x,C.position.z);updateInteraction(performance.now());applyGameLighting(activeWorld);R.render(activeWorld.scene,C);
   },{eye,target});await page.screenshot({path:path.join(out,name+'.png')});
  }
  await shot('entry',[0,1.72,-.42],[0,1.55,3.55]);
  await shot('entry-left',[-.08,1.72,1.50],[-4.9,1.35,2.05]);
  await shot('server',[-1.15,1.72,2.24],[-5.2,1.35,2.2]);
  await shot('windows',[-2.60,1.72,1.50],[-1.10,1.65,3.55]);
  await shot('storage',[-4.10,1.72,2.65],[.65,1.45,1.85]);
  await page.evaluate(()=>{activeWorld.room212.door.setOpen(false,true)});
  await shot('corridor-door',[0,1.72,-2.10],[0,1.52,0]);
  await page.setViewportSize({width:844,height:390});await page.evaluate(()=>{resize();activeWorld.room212.door.setOpen(true,true)});
  await shot('mobile-landscape',[-.08,1.72,1.50],[-4.9,1.35,2.05]);
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({arrival,...report,errors},null,2)+'\n');
  console.log(JSON.stringify({arrival,room:report.roomName,layout:report.layout,workstations:report.workstations,closesFromInside:report.closesFromInside,otherStudentsPresent:report.otherStudentsPresent,errors},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
