const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('playwright'),{browserOptions}=require('./test-runtime.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'main-menu-qa');fs.mkdirSync(out,{recursive:true});
const game=fs.readdirSync(root).find(f=>f!=='index.html'&&f.endsWith('.html')),url=pathToFileURL(path.join(root,game)).href;
(async()=>{
 const browser=await chromium.launch({...browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox','--autoplay-policy=document-user-activation-required']});
 const errors=[],report={};let currentPage;
 async function setup(page,freeze=true){
  currentPage=page;
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/WebGLProgram|shader error|SecurityError/.test(m.text()))errors.push(m.text());});
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.addInitScript(freeze=>{
   if(freeze)requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject();
   // Exercise browsers that deny autoplay, then use native playback after a tap.
   const play=HTMLMediaElement.prototype.play;let gesture=false;
   window.addEventListener('pointerdown',()=>gesture=true,true);window.addEventListener('keydown',()=>gesture=true,true);
   HTMLMediaElement.prototype.play=function(){return gesture?play.call(this):Promise.reject(new DOMException('User gesture required','NotAllowedError'));};
  },freeze);
  await page.goto(url,{waitUntil:'load',timeout:60000});
 }
 async function showMenu(page){
  await page.evaluate(async()=>{if(mainMenu.phase==='intro'){if(mainMenu.introElapsed===0)mainMenu.render(0);mainMenu.render(5601);}await Promise.all(mainMenu.previews.map(p=>p.image.decode()));for(const p of mainMenu.previews)for(const key of ['map','normalMap','roughnessMap'])await p.model.mesh.material[key].image.decode();mainMenu.render(5700);});
 }
 try{
  const context=await browser.newContext({viewport:{width:1600,height:900}}),page=await context.newPage();await setup(page);
  await page.evaluate(()=>mainMenu.render(0));await page.screenshot({path:path.join(out,'intro-black.png')});
  report.intro=await page.evaluate(()=>{
   const sample=t=>{mainMenu.render(t);return {t,opacity:Number(document.getElementById('studioLogo').style.opacity),phase:mainMenu.phase};};
   return [sample(0),sample(1000),sample(1999),sample(2000),sample(2550),sample(3900)];
  });
  for(const item of report.intro.filter(x=>x.t<=2000))assert.equal(item.opacity,0,'The first two seconds must stay black');
  assert(Math.abs(report.intro[4].opacity-.5)<.01);assert.equal(report.intro[5].opacity,1);
  await page.screenshot({path:path.join(out,'atm4-intro.png')});
  const fading=await page.evaluate(()=>{mainMenu.render(5100);return Number(document.getElementById('studioLogo').style.opacity);});assert(Math.abs(fading-.5)<.01);
  await showMenu(page);assert.equal(await page.evaluate(()=>mainMenu.phase),'menu');assert(await page.locator('#studioIntro').isHidden());
  await page.screenshot({path:path.join(out,'main-menu-desktop.png')});
  report.menu=await page.evaluate(()=>{
   const time=clockElapsedMs,position=C.position.toArray(),before=mainMenu.previews.map(p=>p.model.names.body.scale.y);
   mainMenu.render(6900);const after=mainMenu.previews.map(p=>p.model.names.body.scale.y);
   return {labels:Array.from(document.querySelectorAll('.menuLabel')).map(e=>e.textContent),breathing:before.map((v,i)=>Math.abs(v-after[i])>.0001),outfits:mainMenu.previews.map(p=>p.avatar.outfit),timeFrozen:clockElapsedMs===time,playerFrozen:position.every((v,i)=>v===C.position.toArray()[i]),backgrounds:mainMenu.previews.every(p=>p.scene.background.isTexture&&p.image.src.startsWith('data:')),pausedAudio:document.getElementById('menuMusic').paused};
  });
  assert.deepEqual(report.menu.labels,['Играть','Режим тестера','Поддержка','Настройки','Реклама','Пожертвование']);
  assert(report.menu.breathing.every(Boolean)&&report.menu.timeFrozen&&report.menu.playerFrozen&&report.menu.backgrounds);
  assert.deepEqual(report.menu.outfits,['casual','uniform']);assert.equal(report.menu.pausedAudio,true,'Autoplay rejection must remain a usable menu');
  await page.locator('#menuSettings').click();assert(await page.locator('[data-menu-panel="settings"]').isVisible());
  await page.locator('#menuMusicVolume').focus();await page.keyboard.press('Home');
  assert.equal(await page.evaluate(()=>document.getElementById('menuMusic').volume),0);
  for(let i=0;i<25;i++)await page.keyboard.press('ArrowRight');
  await page.waitForFunction(()=>!document.getElementById('menuMusic').paused,null,{polling:100});
  await page.waitForFunction(()=>Number.isFinite(document.getElementById('menuMusic').duration)&&document.getElementById('menuMusic').readyState>=2,null,{polling:100});
  report.audio=await page.evaluate(()=>({volume:document.getElementById('menuMusic').volume,loop:document.getElementById('menuMusic').loop,time:document.getElementById('menuMusic').currentTime,duration:document.getElementById('menuMusic').duration}));
  assert.equal(report.audio.volume,.25);assert(report.audio.loop&&report.audio.duration>30);
  await page.waitForFunction(time=>document.getElementById('menuMusic').currentTime>time+.15,report.audio.time,{polling:100});
  await page.screenshot({path:path.join(out,'music-settings.png')});
  await page.keyboard.press('Escape');assert(await page.locator('#menuPanel').isHidden());
  await page.reload({waitUntil:'load'});assert.equal(await page.evaluate(()=>mainMenu.musicVolume),.25);await showMenu(page);
  await page.locator('#testerMode').click();
  report.tester=await page.evaluate(()=>({phase:mainMenu.phase,mode:gameMode,location:currentLocation,startHidden:document.getElementById('start').style.display==='none',musicPaused:document.getElementById('menuMusic').paused}));
  assert.deepEqual(report.tester,{phase:'game',mode:'tester',location:'college',startHidden:true,musicPaused:true});
  await page.keyboard.press('f');assert.equal(await page.evaluate(()=>!!fly),true);await page.keyboard.press('f');
  await page.keyboard.press('t');assert(await page.locator('#timeControls').isVisible());await page.keyboard.press('Escape');
  await page.locator('#gameMenu').click();assert(await page.locator('[data-menu-panel="pause"]').isVisible());
  const paused=await page.evaluate(()=>{const before=clockElapsedMs;loop(last+3000);return clockElapsedMs===before;});assert(paused);
  await page.locator('#returnMainMenu').click();await page.evaluate(()=>mainMenu.render(7200));await page.locator('#play').click();
  assert(await page.locator('[data-menu-panel="chapter"]').isVisible());await page.screenshot({path:path.join(out,'story-opening.png')});
  await page.locator('#beginChapter').click();
  report.story=await page.evaluate(()=>({mode:gameMode,location:currentLocation,step:mainMenu.story.step,time:gameTime.get(),outfit:playerAvatar.outfit,clockDisabled:document.getElementById('gameClock').disabled}));
  assert.equal(report.story.mode,'story');assert.equal(report.story.location,'apartment');assert.equal(report.story.step,'dress');assert.equal(report.story.outfit,'casual');assert(report.story.clockDisabled);
  await page.keyboard.press('f');await page.keyboard.press('l');await page.keyboard.press('t');
  assert.deepEqual(await page.evaluate(()=>({fly:!!fly,location:currentLocation,timeOpen:timeControls.opened})),{fly:false,location:'apartment',timeOpen:false});
  report.story.steps=await page.evaluate(()=>{
   const steps=[mainMenu.story.step];playerClothing.equipped='uniform';playerClothing.stored='casual';playerAvatar.setOutfit('uniform');mainMenu.updateStory();steps.push(mainMenu.story.step);
   switchLocation('home',{exiting:true,fromApartment:true});mainMenu.updateStory();steps.push(mainMenu.story.step);return steps;
  });assert.deepEqual(report.story.steps,['dress','leave','bus']);
  report.story.trip=await page.evaluate(()=>{
   function step(seconds){for(let t=0;t<seconds-1e-8;){const dt=Math.min(.05,seconds-t);t+=dt;clockElapsedMs+=dt*1000;busTransit.update(dt);activeWorld.update?.(dt,{x:C.position.x,z:C.position.z,feet:feetY});mainMenu.updateStory();}publishGameClock();updateInteraction(performance.now());}
   gameTime.set(1,7,42);const home=busTransit.fleet.get('home');C.position.copy(home.root.localToWorld(new THREE.Vector3(-2.05,1.7-home.root.position.y,BUS_DOORS[1])));feetY=0;
   busTransit.act(getInteractionTarget());step(.8);const boarded=busTransit.aboard;mainMenu.updateStory();
   step(busTransit.rider.arrival+1.3-busTransit.timing.service);const arrived=currentLocation==='college'&&busTransit.rider.arrived;
   busTransit.act(getInteractionTarget());step(3);const exited=!busTransit.aboard,arrivalStep=mainMenu.story.step;
   switchLocation('college1',{fresh:true});mainMenu.updateStory();const enterStep=mainMenu.story.step;
   C.position.copy(activeWorld.frontStudent108.root.parent.localToWorld(new THREE.Vector3(7.8,1.7,15.0)));feetY=0;mainMenu.updateStory();
   return {boarded,arrived,exited,arrivalStep,enterStep,completed:mainMenu.story.completed,finalStep:mainMenu.story.step};
  });
  assert.deepEqual(report.story.trip,{boarded:true,arrived:true,exited:true,arrivalStep:'college',enterStep:'classroom',completed:true,finalStep:'complete'});
  // A fresh mode starts a new trip and restores testing tools.
  await page.evaluate(()=>mainMenu.returnToMenu());await page.locator('#testerMode').click();assert.equal(await page.evaluate(()=>currentLocation),'college');
  const mobile=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:1}),touch=await mobile.newPage();await setup(touch);await showMenu(touch);
  report.mobile=[];
  for(const size of [{width:844,height:390},{width:568,height:320}]){
   await touch.setViewportSize(size);await touch.evaluate(()=>{resize();mainMenu.render(7500);});
   const fit=await touch.evaluate(()=>Array.from(document.querySelectorAll('.menuActions button')).map(b=>{const r=b.getBoundingClientRect();return {label:b.innerText,inside:r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth,height:r.height};}));assert(fit.every(x=>x.inside&&x.height>=44),JSON.stringify(fit));report.mobile.push({size,fit});
   await touch.screenshot({path:path.join(out,`menu-${size.width}x${size.height}.png`)});
  }
  await touch.locator('#menuSettings').tap();
  const range=await touch.locator('#menuMusicVolume').boundingBox();await touch.locator('#menuMusicVolume').tap({position:{x:range.width*.25,y:range.height/2}});
  const touchVolume=await touch.evaluate(()=>document.getElementById('menuMusic').volume);assert(touchVolume>=.20&&touchVolume<=.30,'Touch must change the native volume slider');report.touchVolume=touchVolume;
  await touch.locator('#menuPanelClose').tap();await touch.locator('#testerMode').tap();assert.equal(await touch.evaluate(()=>gameMode),'tester');
  const liveContext=await browser.newContext({viewport:{width:1280,height:720}}),live=await liveContext.newPage();await setup(live,false);
  await live.waitForFunction(()=>mainMenu.phase==='menu',null,{polling:100});
  const livePose=await live.evaluate(()=>({time:clockElapsedMs,chest:mainMenu.previews.map(p=>p.model.names.body.scale.x)}));
  await live.waitForFunction(before=>mainMenu.previews.every((p,i)=>Math.abs(p.model.names.body.scale.x-before[i])>.0002),livePose.chest,{polling:100});
  assert.equal(await live.evaluate(()=>clockElapsedMs),livePose.time);report.nativeLoop={breathing:true,timeFrozen:true};
  await live.locator('#menuSettings').focus();await live.keyboard.press('Enter');assert(await live.locator('[data-menu-panel="settings"]').isVisible());await live.keyboard.press('Escape');
  await live.screenshot({path:path.join(out,'menu-native-loop.png')});
  assert.deepEqual(errors,[]);report.errors=errors;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({intro:'2 seconds black / fade in / hold / fade out',breathing:report.menu.breathing,audio:report.audio,story:report.story.steps,mobile:report.mobile.map(x=>x.size),errors},null,2));
 }catch(error){
  const state=await currentPage.evaluate(()=>{const a=document.getElementById('menuMusic');return {phase:mainMenu.phase,volume:mainMenu.musicVolume,input:document.getElementById('menuMusicVolume').value,audio:{paused:a.paused,duration:String(a.duration),time:a.currentTime,readyState:a.readyState,networkState:a.networkState,error:a.error?{code:a.error.code,message:a.error.message}:null},clock:gameTime.get()};}).catch(()=>null);
  fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({message:error.message,state,errors},null,2));throw error;
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
