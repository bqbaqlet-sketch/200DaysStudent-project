const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const project=path.resolve(__dirname,'..'),out=path.join(__dirname,'sports-courtyard-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1240,height:700}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});
  const main=path.join(project,fs.readdirSync(project).find(f=>f!=='index.html'&&f.endsWith('.html')));
  await page.goto(pathToFileURL(main).href,{waitUntil:'load',timeout:60000});await page.locator('#play').click();
  const report=await page.evaluate(()=>{
   gameTime.set(1,7,38);const root=collegeSportsCourtyard,blocked=(x,z)=>hit(x,z,0);
   const walk=points=>{for(let i=1;i<points.length;i++){const [x,z]=points[i-1],[xx,zz]=points[i],n=Math.ceil(Math.hypot(xx-x,zz-z)/.04);for(let j=0;j<=n;j++){const px=x+(xx-x)*j/n,pz=z+(zz-z)*j/n;if(blocked(px,pz))return {clear:false,blockedAt:[px,pz]};}}return {clear:true};};
   const routes={gardenToCourt:walk([[-29,7.15],[-22.2,7.15],[-22.2,6.0],[-19.5,6.0],[-19.5,4.8]]),northGate:walk([[-22.2,6.5],[-22.2,10.0],[-27.5,16]]),eastGate:walk([[-27.5,21.5],[-15.95,21.5]]),buildingSide:walk([[-15.95,6.5],[-15.95,17.0],[-15.95,21.5],[-15.95,33.5],[-15.95,36.0]]),goalMouth:walk([[-27.5,10.5],[-27.5,8.85]])};
   const obstacles={westFence:blocked(-35.55,21),eastFence:blocked(-19.45,13),northFence:blocked(-27.5,7.98),goalBack:blocked(-27.5,8.27),planter:blocked(-14.75,9.3),bikeRack:blocked(-24.28,5.8),serviceWall:blocked(-19.5,4.0)};
   const flight={fenceSolid:collegeFlyHit(-35.55,2.3,21),aboveFenceClear:!collegeFlyHit(-35.55,7,21),centerClear:!collegeFlyHit(-27.5,3,21),openGateClear:!collegeFlyHit(-22.2,1.7,7.98)};
   root.updateMatrixWorld(true);const bounds=new THREE.Box3(),matrix=new THREE.Matrix4();let meshes=0,instances=0,triangles=0,finite=true;
   root.traverse(o=>{if(!o.isMesh)return;meshes++;const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();finite&&=Array.from(g.attributes.position.array).every(Number.isFinite);if(o.isInstancedMesh){instances+=o.count;finite&&=Array.from(o.instanceMatrix.array).every(Number.isFinite);for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);matrix.premultiply(o.matrixWorld);bounds.union(g.boundingBox.clone().applyMatrix4(matrix));}triangles+=(g.index?.count??g.attributes.position.count)/3*o.count;}else{bounds.union(g.boundingBox.clone().applyMatrix4(o.matrixWorld));triangles+=(g.index?.count??g.attributes.position.count)/3;}});
   return {routes,obstacles,flight,metadata:root.userData,finite,meshes,instances,triangles,bounds:[bounds.min.toArray(),bounds.max.toArray()],collidersFinite:cols.every(b=>b.every(Number.isFinite)),charactersPreserved:typeof createMedvedevRoutine==='function'&&typeof buildStudentCharacter==='function'};
  });
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  for(const [name,result] of Object.entries(report.routes))assert.equal(result.clear,true,name+': '+JSON.stringify(result));
  for(const [name,result] of Object.entries(report.obstacles))assert.equal(result,true,name);
  for(const [name,result] of Object.entries(report.flight))assert.equal(result,true,name);
  for(const name of ['finite','collidersFinite','charactersPreserved'])assert.equal(report[name],true,name);
  assert.equal(report.metadata.pitch.goals.length,2);assert.equal(report.metadata.serviceEntrance.replacedBrownSlab,true);assert.ok(report.metadata.gates.every(g=>g.open));assert.ok(report.meshes<70);
  assert.ok(!fs.readFileSync(main,'utf8').includes('B(-20.6,0,4.1,-18.4,2.6,4.3,m.door)'));
  await page.evaluate(()=>{C.position.set(-34.5,23,23);C.lookAt(-22.1,.5,7.8);hud.textContent='Колледж · Спортивный двор';R.render(S,C);});await page.screenshot({path:path.join(out,'aerial.png')});
  await page.evaluate(()=>{C.position.set(-22.15,1.75,6.35);C.lookAt(-19.5,1.40,4.2);R.render(S,C);});await page.screenshot({path:path.join(out,'service-entry.png')});
  await page.evaluate(()=>{C.position.set(-34.2,2.1,31.2);C.lookAt(-25.6,1.05,12);R.render(S,C);});await page.screenshot({path:path.join(out,'pitch.png')});
  assert.deepEqual(errors,[]);report.javascriptErrors=errors;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({routes:report.routes,flight:report.flight,meshes:report.meshes,triangles:report.triangles,errors},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1;});
