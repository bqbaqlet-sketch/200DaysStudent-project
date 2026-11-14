const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const {browserOptions}=require('./test-runtime.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'world-audio-qa');fs.mkdirSync(out,{recursive:true});
const url=pathToFileURL(path.join(root,fs.readdirSync(root).find(f=>f.endsWith('.html')&&f!=='index.html'))).href;
(async()=>{
 const browser=await chromium.launch({...browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
 const errors=[],report={};
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},hasTouch:true,isMobile:true,deviceScaleFactor:1});
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/three.min.js',route=>route.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.addInitScript(()=>{requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject();});
  await page.goto(url,{waitUntil:'load',timeout:60000});
  await page.evaluate(()=>{mainMenu.render(0);mainMenu.render(5700);});
  await page.waitForFunction(()=>!document.getElementById('menuMusic').paused&&document.getElementById('menuMusic').currentTime>.05,null,{polling:100});
  report.autoMusicBeforeInput=true;
  await page.locator('#testerMode').tap();
  await page.waitForFunction(()=>Object.keys(GAME_AUDIO_ASSETS).every(name=>gameAudio.debug.decoded.includes(name)),null,{polling:100});
  report.audio=await page.evaluate(()=>{gameAudio.update(.05);return gameAudio.debug;});
  assert.deepEqual(report.audio.stats.errors,[]);assert(report.audio.unlocked&&report.audio.stats.decodedBytes<16*1024*1024);
  await page.waitForTimeout(250);report.outputRMS=await page.evaluate(()=>gameAudio.measureLevel());assert(report.outputRMS>1e-5,'Real Web Audio output is silent');
  report.walks=await page.evaluate(()=>{
   const world=locations.college,facade=world.scene.getObjectByName('college1-photo-exterior');
   function walk(name,points){
    const result={name,steps:0,blocked:[],heights:[]},start=points[0];fly=0;feetY=world.walkGroundAt(start.x,start.z,null);C.position.set(start.x,feetY+1.7,start.z);gameAudio.pause();gameAudio.update(.016);
    for(let n=1;n<points.length;n++){
     const target=points[n],from=C.position.clone(),count=Math.ceil(from.distanceTo(new THREE.Vector3(target.x,from.y,target.z))/.035);
     for(let i=1;i<=count;i++){
      const x=THREE.MathUtils.lerp(from.x,target.x,i/count),z=THREE.MathUtils.lerp(from.z,target.z,i/count);
      if(!walkInterior(x,z)){result.blocked.push({x,z,feetY,ground:world.walkGroundAt(x,z,feetY)});break;}
      C.position.y=feetY+1.7;gameAudio.update(.016);result.steps++;result.heights.push(feetY);
     }
    }
    result.end=[C.position.x,feetY,C.position.z];return result;
   }
   const point=(u,v)=>facade.localToWorld(new THREE.Vector3(u,0,v));
   return [walk('college1-stairs',[point(0,2.5),point(0,.82)]),walk('college1-ramp',[point(7.5,1.63),point(3.3,1.63)]),
    walk('college2-stairs',[{x:11.55,z:12.8},{x:11.55,z:10.85}]),walk('college2-ramp',[{x:5.4,z:15.6},{x:5.4,z:10.8}])];
  });
  console.log('walks',JSON.stringify(report.walks.map(w=>({name:w.name,blocked:w.blocked,end:w.end}))));
  for(const walk of report.walks){assert.deepEqual(walk.blocked,[],walk.name);assert(walk.steps>20);}
  assert(Math.abs(report.walks[0].end[1]-.35)<.01);assert(Math.abs(report.walks[2].end[1]-.54)<.01);
  assert(report.walks[2].heights.some(h=>Math.abs(h-.092)<.01),'Lowest physical step missing');
  report.solids=await page.evaluate(()=>{
   const world=locations.college,old=barAng;barAng=0;const closed=world.collisionMapping.barrierHit(1.5,41.27,0);barAng=-1.32;const raised=world.collisionMapping.barrierHit(1.5,41.27,0);barAng=old;
   return {bench:hit(-10.4,39.2,0),bin:hit(9.17,11.3,0),post:hit(3.56,14.51,0),
    highLandingSide:world.walkGroundAt(11.55,10.85,0)===null,
    closed,raised,obstacles:world.collisionMapping.obstacles.length,surfaces:world.collisionMapping.surfaces.length};
  });
  assert(report.solids.bench&&report.solids.bin&&report.solids.post&&report.solids.highLandingSide&&report.solids.closed&&!report.solids.raised);
  report.steps=await page.evaluate(()=>{
   const before=gameAudio.debug.stats.footsteps;C.position.set(0,1.7,20);feetY=0;gameAudio.pause();gameAudio.update(.016);
   for(let i=0;i<60;i++){walkInterior(C.position.x+.04,C.position.z);gameAudio.update(.016);}
   const after=gameAudio.debug.stats.footsteps;
   for(let i=0;i<90;i++)gameAudio.update(.016);
   const idle=gameAudio.debug.stats.footsteps;
   fly=1;for(let i=0;i<40;i++){C.position.x+=.05;gameAudio.update(.016);}fly=0;
   return {before,after,idle,flying:gameAudio.debug.stats.footsteps};
  });
  assert(report.steps.after>report.steps.before&&report.steps.idle===report.steps.after&&report.steps.flying===report.steps.after);
  report.outdoorSteps=await page.evaluate(()=>{
   function sample(running){
    C.position.set(0,1.7,15);feetY=0;keys.ShiftLeft=running?1:0;gameAudio.pause();gameAudio.update(1/60);
    const before=gameAudio.debug.stats.footsteps;
    for(let i=0;i<240;i++){C.position.z+=(running?8:4.5)/60;gameAudio.update(1/60);}
    return gameAudio.debug.stats.footsteps-before;
   }
   const walk=sample(false),run=sample(true);keys.ShiftLeft=0;
   const recent=gameAudio.debug.stats.recentFootsteps.filter(step=>step.kind==='street');
   return {walk,run,recent,oldInteriorAvailable:gameAudio.debug.decoded.includes('footstep_concrete_000')};
  });
  assert(report.outdoorSteps.walk>=9&&report.outdoorSteps.walk<=11&&report.outdoorSteps.run>=13&&report.outdoorSteps.run<=15);
  assert(report.outdoorSteps.oldInteriorAvailable&&report.outdoorSteps.recent.length>=4);
  assert(report.outdoorSteps.recent.every((step,i,list)=>!i||step.index!==list[i-1].index));
  report.bus=await page.evaluate(async()=>{
   gameTime.set(1,7,30);const bus=busTransit.fleet.get('college');bus.root.visible=true;C.position.copy(bus.root.position).add(new THREE.Vector3(-4,1.7,0));feetY=0;
   gameAudio.pause();gameAudio.update(.05);const near=gameAudio.debug.loops.find(l=>l.id==='bus-engine');
   bus.speed=5;gameAudio.update(.05);await new Promise(resolve=>setTimeout(resolve,250));const fast=gameAudio.debug.loops.find(l=>l.id==='bus-engine');
   bus.speed=.2;gameAudio.update(.05);bus.doors=.15;gameAudio.update(.05);
   C.position.set(0,1.7,-30);gameAudio.update(.05);const far=gameAudio.debug.loops.find(l=>l.id==='bus-engine');
   return {near,fast,far,brakes:gameAudio.debug.stats.played['air-brake']||0};
  });
  console.log('bus',JSON.stringify(report.bus));assert(report.bus.near.gain>.01&&report.bus.fast.rate>report.bus.near.rate&&!report.bus.far&&report.bus.brakes>0);
  report.indoor=await page.evaluate(()=>{
   switchLocation('college1',{fresh:true});gameAudio.update(.05);
   const door=activeWorld.interactiveClassroomDoors.find(d=>d.number==='108');
   door.handlePosition(C.position);C.position.y=1.7;gameAudio.update(.05);door.setOpen(!door.open,true);gameAudio.update(.05);
   return gameAudio.debug;
  });
  assert(report.indoor.loops.some(l=>l.id==='room-tone')&&!report.indoor.loops.some(l=>l.id==='nature'));
  assert((report.indoor.stats.played['door-open']||0)+(report.indoor.stats.played['door-close']||0)>0);
  report.npc=await page.evaluate(()=>{
   gameTime.set(1,7,43);const actor=activeWorld.frontStudent108,far={x:999,z:999,feet:0},before=gameAudio.debug.stats.npcSteps;
   gameAudio.pause();
   for(let i=0;i<240;i++){
    clockElapsedMs+=50;activeWorld.update(.05,far);
    actor.root.getWorldPosition(C.position);C.position.add(new THREE.Vector3(2.5,1.7,0));feetY=0;gameAudio.update(.05);
   }
   const after=gameAudio.debug.stats.npcSteps;
   timeControls.open();gameAudio.update(.05);const timePause=gameAudio.debug.muted&&gameAudio.debug.loops.length===0;timeControls.close();
   return {before,after,timePause,voices:gameAudio.debug.voices};
  });assert(report.npc.after>report.npc.before&&report.npc.timePause&&report.npc.voices<=24);
  report.playground=await page.evaluate(()=>{
   switchLocation('home',{fresh:true,exitingCollege:true});const pg=activeWorld.playground;
   const swing=pg.units.find(unit=>unit.kind==='swing'),carousel=pg.units.find(unit=>unit.kind==='carousel');
   C.position.copy(swing.sample(0).seat).add(new THREE.Vector3(0,1.7,1.5));gameAudio.update(.05);
   swing.theta=.25;swing.speed=.3;gameAudio.update(.05);swing.speed=-.2;gameAudio.update(.05);
   C.position.copy(carousel.sample(0).seat).add(new THREE.Vector3(0,1.7,2));carousel.speed=.6;gameAudio.update(.05);
   return {creak:(gameAudio.debug.stats.played.creak1||0)+(gameAudio.debug.stats.played.creak2||0),carousel:gameAudio.debug.loops.find(l=>l.id.startsWith('carousel-'))};
  });assert(report.playground.creak>0&&report.playground.carousel?.gain>0);
  report.mobileWalks=[];
  const cdp=await page.context().newCDPSession(page);
  for(const size of [{width:844,height:390},{width:568,height:320}]){
   await page.setViewportSize(size);
   await page.evaluate(()=>{switchLocation('college');resize();fly=0;feetY=0;yaw=0;pitch=-.45;C.position.set(11.55,1.7,13);C.rotation.set(pitch,yaw,0);window.qaFrame=performance.now();last=qaFrame;});
   const touch={x:120,y:size.height-50,id:0};
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...touch,y:touch.y-50}]});
   await page.evaluate(()=>{for(let i=0;i<32;i++)loop(qaFrame+=16);});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   const state=await page.evaluate(()=>({feet:feetY,z:C.position.z,joy:joy.y,steps:gameAudio.debug.stats.footsteps,target:getInteractionTarget()?.action}));
   assert(Math.abs(state.feet-.54)<.01&&state.z<11.04&&state.joy===0&&state.target==='enterCollege2');report.mobileWalks.push({...size,...state});
   await page.screenshot({path:path.join(out,`mobile-${size.width}-stairs.png`)});
   const button=await page.locator('#interact').boundingBox();
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:button.x+button.width/2,y:button.y+button.height/2,id:0}]});
   await page.waitForTimeout(1000);await page.evaluate(()=>updateInteraction(performance.now()));
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.equal(await page.evaluate(()=>currentLocation),'college2');
   await page.evaluate(()=>exitCollegeInterior());assert(Math.abs(await page.evaluate(()=>feetY)-.54)<.01);
  }
  await page.evaluate(()=>{mainMenu.pause();gameAudio.update(.05);});
  assert(await page.evaluate(()=>gameAudio.debug.muted&&gameAudio.debug.loops.length===0));
  await page.locator('#pauseSettings').tap();
  await page.locator('#gameEffectsVolume').fill('28');await page.locator('#gameEffectsVolume').dispatchEvent('input');
  await page.locator('#gameAmbienceVolume').fill('18');await page.locator('#gameAmbienceVolume').dispatchEvent('input');
  await page.locator('#menuMusicVolume').fill('41');await page.locator('#menuMusicVolume').dispatchEvent('input');
  report.settings=await page.evaluate(()=>JSON.parse(localStorage.getItem('200daysstudent.settings')));
  assert.equal(report.settings.sfxVolume,.28);assert.equal(report.settings.ambienceVolume,.18);assert.equal(report.settings.menuMusicVolume,.41);
  for(const size of [{width:844,height:390},{width:568,height:320}]){
   await page.setViewportSize(size);await page.evaluate(()=>resize());await page.locator('#gameAmbienceVolume').scrollIntoViewIfNeeded();
   const box=await page.locator('#gameAmbienceVolume').boundingBox();assert(box.height>=44&&box.x>=0&&box.x+box.width<=size.width);
   await page.touchscreen.tap(box.x+box.width*.78,box.y+box.height/2);
   assert(await page.evaluate(()=>gameAudio.debug.volumes.ambience>.65&&gameAudio.debug.volumes.sfx===.28&&joy.y===0));
   await page.locator('#gameAmbienceVolume').fill('18');await page.locator('#gameAmbienceVolume').dispatchEvent('input');
   await page.screenshot({path:path.join(out,`mobile-${size.width}-audio-settings.png`)});
  }
  await page.locator('#menuPanelClose').tap();await page.locator('#returnMainMenu').tap();
  await page.waitForFunction(()=>!document.getElementById('menuMusic').paused,null,{polling:100});report.autoMusicOnReturn=true;
  await page.reload({waitUntil:'load'});report.persisted=await page.evaluate(()=>({music:mainMenu.musicVolume,effects:gameAudio.debug.volumes.sfx,ambience:gameAudio.debug.volumes.ambience}));
  assert.deepEqual(report.persisted,{music:.41,effects:.28,ambience:.18});
  await page.addInitScript(()=>{
   const native=HTMLMediaElement.prototype.play;let gesture=false;
   addEventListener('pointerdown',()=>gesture=true,true);addEventListener('keydown',()=>gesture=true,true);
   HTMLMediaElement.prototype.play=function(){return this.id==='menuMusic'&&!gesture?Promise.reject(new DOMException('First gesture required','NotAllowedError')):native.call(this);};
  });
  await page.reload({waitUntil:'load'});await page.evaluate(()=>{mainMenu.render(0);mainMenu.render(5700);});
  await page.waitForTimeout(80);assert(await page.evaluate(()=>document.getElementById('menuMusic').paused));
  await page.touchscreen.tap(20,100);
  await page.waitForFunction(()=>!document.getElementById('menuMusic').paused,null,{polling:100});report.firstOrdinaryTouchUnlocksMusic=true;
  await page.reload({waitUntil:'load'});await page.evaluate(()=>mainMenu.render(0));await page.touchscreen.tap(20,20);
  await page.waitForTimeout(150);assert(await page.evaluate(()=>mainMenu.phase==='intro'&&document.getElementById('menuMusic').paused));
  await page.evaluate(()=>mainMenu.render(5700));
  await page.waitForFunction(()=>!document.getElementById('menuMusic').paused,null,{polling:100});report.introTouchPrimesAutomaticMusic=true;
  assert.deepEqual(errors,[]);report.errors=errors;
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  console.log('PASS actual stair/ramp walks, props, barrier, native audio output, movement/surface steps, bus distance/rpm/brakes, doors, playground, mobile settings and auto menu music');
 }catch(error){fs.writeFileSync(path.join(out,'failed-report.json'),JSON.stringify(report,null,2));throw error;}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
