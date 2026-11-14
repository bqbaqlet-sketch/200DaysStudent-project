const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const project=path.resolve(__dirname,'..'),before=process.argv.includes('--before'),out=path.join(__dirname,'entrance-qa',before?'before':'after');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];page.setDefaultTimeout(60000);page.on('pageerror',error=>errors.push(error.message));
 await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',route=>route.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
 await page.addInitScript(()=>{requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});
 const game=fs.readdirSync(project).find(file=>file!=='index.html'&&file.endsWith('.html'));
 await page.goto(pathToFileURL(path.join(project,game)).href,{waitUntil:'load',timeout:60000});await require('./test-runtime.cjs').startTester(page);
 const initial=await page.evaluate(()=>{
  switchLocation('entrance4',{fresh:true});feetY=0;gameTime.set(1,9,0);
  window.drawEntrance=(eye,target)=>{if(eye){C.position.set(...eye);C.lookAt(...target);yaw=C.rotation.y;pitch=C.rotation.x;}C.rotation.set(pitch,yaw,0);hud.textContent=zone(C.position.x,C.position.z);updateInteraction(performance.now());applyGameLighting(activeWorld);R.render(activeWorld.scene,C)};
  window.walkEntrance=(x,z)=>{const start=C.position.clone(),length=Math.hypot(x-start.x,z-start.z),steps=Math.ceil(length/.06);for(let i=1;i<=steps;i++){
   const nx=start.x+(x-start.x)*i/steps,nz=start.z+(z-start.z)*i/steps;
   if(!walkInterior(nx,C.position.z)||!walkInterior(C.position.x,nz))throw Error('Blocked entrance path: '+JSON.stringify({from:[start.x,start.z],to:[x,z],at:[C.position.x,feetY,C.position.z]}));C.position.y=feetY+1.7;
  }};
  return {spawn:activeWorld.spawn.slice(),clear:!hit(C.position.x,C.position.z,0),nook:activeWorld.groundAt(1.75,-.8,0),topGuard:!!hit(-1.75,-.05,12),doorCount:activeWorld.apartmentDoors?.length};
 });assert.equal(initial.clear,true);
 await page.evaluate(()=>drawEntrance([0,1.7,4.55],[0,1.25,.4]));await page.screenshot({path:path.join(out,'ground-floor.png')});
 const ascent=await page.evaluate(()=>{
  feetY=0;C.position.set(...activeWorld.spawn);walkEntrance(0,1.45);walkEntrance(-1.75,.6);const floors=[];
  for(let floor=1;floor<=4;floor++){
   walkEntrance(-1.75,-3.8);walkEntrance(1.75,-3.8);walkEntrance(1.75,.6);floors.push(feetY);
   if(Math.abs(feetY-floor*3)>.01)throw Error('Wrong floor after ascent');
   if(floor<4)walkEntrance(-1.75,.6);
  }return floors;
 });assert.deepEqual(ascent,[3,6,9,12]);
 await page.evaluate(()=>drawEntrance([1.7,13.7,.8],[-1.8,13.45,2.1]));await page.screenshot({path:path.join(out,'fifth-floor.png')});
 const details=await page.evaluate(async()=>{
  const doors=(activeWorld.apartmentDoors||[]).map(door=>({number:door.number,floor:door.floor,style:door.style,id:door.leaf.name,color:door.leaf.material.userData.finishColor,panels:door.panels}));
  if(activeWorld.easterEgg)await activeWorld.easterEgg.image.decode();
  const firstSign=activeWorld.scene.getObjectByName('entrance-floor-sign-1');
  return {doors,entrySign:firstSign?{oneSided:firstSign.material.side===THREE.FrontSide,bottom:firstSign.position.y-.16}:null,windows:activeWorld.stairWindows?.map(window=>({open:window.open,fixedPanes:window.fixedPanes,openingClear:window.openingClear})),meme:activeWorld.easterEgg?{floor:activeWorld.easterEgg.floor,width:activeWorld.easterEgg.image.naturalWidth,height:activeWorld.easterEgg.image.naturalHeight}:null};
 });
 if(!before){
  assert.equal(initial.nook,0);assert.equal(initial.topGuard,true);assert(initial.spawn[2]>2.65&&initial.spawn[2]<4);
  assert.equal(details.entrySign.oneSided,true);assert(details.entrySign.bottom>2.32,'The first floor sign must be above the vestibule opening');
  assert.equal(details.doors.length,10);assert.deepEqual(details.doors.map(door=>door.number),[31,32,33,34,35,36,37,38,39,40]);assert.equal(new Set(details.doors.map(door=>door.style)).size,10);assert.equal(new Set(details.doors.map(door=>door.color)).size,10);
  assert.equal(details.meme.floor,5);assert(details.meme.width>100&&details.meme.height>100);assert.equal(details.windows.filter(window=>window.open).length,1);assert(details.windows.every(window=>window.open?window.fixedPanes===1&&window.openingClear:window.fixedPanes===2));
  const embedded=await page.evaluate(()=>entranceEasterEggImage.split(',')[1]),original=fs.readFileSync(path.join(project,'assets/easter-eggs/spongebob-totya.webp'));
  assert.equal(crypto.createHash('sha256').update(Buffer.from(embedded,'base64')).digest('hex'),crypto.createHash('sha256').update(original).digest('hex'));
  await page.evaluate(()=>drawEntrance([1.65,13.55,1.65],[1.65,13.45,2.59]));await page.screenshot({path:path.join(out,'meme.png')});
  await page.evaluate(()=>{feetY=10.5;drawEntrance([0,12.15,-3.55],[0,11.65,-4.4])});await page.screenshot({path:path.join(out,'open-window.png')});
 }
 const descent=await page.evaluate(()=>{
  feetY=12;C.position.set(1.75,13.7,.6);const floors=[];
  for(let floor=4;floor>0;floor--){walkEntrance(1.75,-3.8);walkEntrance(-1.75,-3.8);walkEntrance(-1.75,.6);floors.push(feetY);if(floor>1)walkEntrance(1.75,.6);}
  return floors;
 });assert.deepEqual(descent,[9,6,3,0]);
 const apartment=await page.evaluate(()=>{
  walkEntrance(-1.75,-3.8);walkEntrance(1.75,-3.8);walkEntrance(1.75,.6);walkEntrance(-2.35,1.32);
  const target=getInteractionTarget();return {action:target?.action,id:target?.id,feet:feetY};
 });assert.equal(apartment.action,'apartment');assert.equal(apartment.id,'apartment-2-right');assert.equal(apartment.feet,3);
 await page.evaluate(()=>drawEntrance([-.7,4.65,1.32],[-2.9,4.05,1.32]));await page.screenshot({path:path.join(out,'player-door.png')});
 const state=await page.evaluate(()=>{switchLocation('apartment',{fresh:true});return {hangers:activeWorld.wardrobe.hangers.length,outfit:playerAvatar.outfit}});assert.equal(state.hangers,4);assert.equal(state.outfit,'casual');
 assert.deepEqual(errors,[]);const report={before,initial,ascent,descent,details,apartment,wardrobePreserved:state,errors};fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});
