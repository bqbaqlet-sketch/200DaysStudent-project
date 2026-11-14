const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'time-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.addInitScript(()=>{requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});
  const file=path.join(root,fs.readdirSync(root).find(f=>f!=='index.html'&&f.endsWith('.html')));
  await page.goto(pathToFileURL(file).href,{waitUntil:'load',timeout:60000});
  await page.keyboard.press('t');assert(await page.locator('#timeControls').isHidden(),'Time menu stays closed before starting');
  await require('./test-runtime.cjs').startTester(page);await page.keyboard.down('w');await page.keyboard.press('t');
  assert(await page.locator('#timeControls').isVisible());assert.equal(await page.locator('#gameClock').getAttribute('aria-expanded'),'true');
  const pause=await page.evaluate(()=>{
   const time=clockElapsedMs,position=C.position.toArray(),bus=busTransit.fleet.get('college').root,vehicle=bus.position.toArray();
   loop(last+1000);loop(last+60000);advanceGameClock(performance.now()+3600000);
   return {timeUnchanged:time===clockElapsedMs,positionUnchanged:position.every((v,i)=>v===C.position.toArray()[i]),busUnchanged:vehicle.every((v,i)=>v===bus.position.toArray()[i]),noInput:!Object.values(keys).some(Boolean)&&Object.keys(ptr).length===0};
  });assert(Object.values(pause).every(Boolean),JSON.stringify(pause));await page.keyboard.up('w');
  await page.keyboard.press('f');await page.keyboard.press('l');await page.keyboard.press('e');
  assert.deepEqual(await page.evaluate(()=>({location:currentLocation,fly,holding:interaction.holding})),{location:'college',fly:0,holding:false});
  await page.locator('[data-time-shift="-10"]').click();assert.equal(await page.locator('#clockTime').innerText(),'07:20');
  await page.locator('[data-time-shift="60"]').click();assert.equal(await page.locator('#timeValue').inputValue(),'08:20');
  await page.locator('[data-time-shift="1440"]').click();assert.equal(await page.locator('#timeDay').inputValue(),'2');
  await page.locator('#timeDay').fill('2');await page.locator('#timeValue').fill('00:05');await page.locator('#timeApply').click();
  await page.locator('[data-time-shift="-10"]').click();assert.deepEqual(await page.evaluate(()=>[gameTime.get().day,gameTime.get().hour,gameTime.get().minute]),[1,23,55]);
  await page.locator('[data-time-shift="10"]').click();assert.deepEqual(await page.evaluate(()=>[gameTime.get().day,gameTime.get().hour,gameTime.get().minute]),[2,0,5]);
  await page.locator('[data-time-shift="-1440"]').click();await page.locator('[data-time-shift="-10"]').click();
  assert.equal(await page.locator('#clockTime').innerText(),'00:00');assert(await page.locator('[data-time-shift="-60"]').isDisabled());
  const floor=await page.evaluate(()=>{gameTime.shift(-1);return gameTime.get().absoluteMinute;});assert.equal(floor,0);
  await page.locator('#timeDay').fill('0');await page.locator('#timeApply').click();assert.equal(await page.evaluate(()=>gameTime.get().absoluteMinute),0);
  await page.locator('#timeDay').fill('1');await page.locator('#timeValue').fill('12:00');await page.locator('#timeApply').click();
  const lightingDay=await page.evaluate(()=>lightingStates.get(activeWorld).lights.map(l=>l.light.intensity));
  await page.locator('#timeValue').fill('23:00');await page.locator('#timeApply').click();
  const lightingNight=await page.evaluate(()=>lightingStates.get(activeWorld).lights.map(l=>l.light.intensity));
  assert(lightingNight.some((v,i)=>v<lightingDay[i]*.7),'Night lighting updates immediately');
  await page.screenshot({path:path.join(out,'desktop.png')});
  await page.locator('#timeResume').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'timeClose');
  await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'timeResume');
  await page.keyboard.press('Escape');assert(await page.locator('#timeControls').isHidden());assert.equal(await page.evaluate(()=>document.activeElement.id),'gameClock');
  const resumed=await page.evaluate(()=>{const before=clockElapsedMs;loop(last+60000);const first=clockElapsedMs;loop(last+3000);return {noCatchUp:first===before,minute:gameTime.get().minute};});assert(resumed.noCatchUp);assert.equal(resumed.minute,1);
  // Seeks must reset schedules in both directions, including an already loaded scene.
  const student=await page.evaluate(()=>{switchLocation('college1',{fresh:true});gameTime.set(1,7,42);return {name:activeWorld.frontStudent108.name,hidden:!activeWorld.frontStudent108.root.visible};});assert(student.hidden);assert.equal(student.name,'Илья');
  async function seek(day,time){await page.locator('#timeDay').fill(String(day));await page.locator('#timeValue').fill(time);await page.locator('#timeApply').click();}
  await page.locator('#gameClock').click();await seek(1,'08:00');assert.equal(await page.evaluate(()=>activeWorld.frontStudent108.state.phase),'seated');
  await seek(1,'07:42');assert.equal(await page.evaluate(()=>activeWorld.frontStudent108.root.visible),false);await seek(2,'08:00');assert.equal(await page.evaluate(()=>activeWorld.frontStudent108.state.phase),'seated');await page.keyboard.press('Escape');
  await page.evaluate(()=>switchLocation('home',{fresh:true}));await page.locator('#gameClock').click();
  await seek(1,'21:59');assert.equal(await page.evaluate(()=>activeWorld.clothingSeller.state.working),true);
  await seek(1,'22:00');assert.equal(await page.evaluate(()=>activeWorld.clothingSeller.state.phase),'leaving');
  await seek(1,'23:00');assert.equal(await page.evaluate(()=>activeWorld.clothingSeller.root.visible),false);
  await seek(1,'05:59');assert.equal(await page.evaluate(()=>activeWorld.clothingSeller.root.visible),false);
  await seek(1,'06:00');assert.equal(await page.evaluate(()=>activeWorld.clothingSeller.state.working),true);
  await page.keyboard.press('Escape');
  // The menu must not change a passenger's in-progress trip or capture movement keys.
  const aboard=await page.evaluate(()=>{
   switchLocation('college',{fresh:true});gameTime.set(1,7,30);clockElapsedMs+=1250;busTransit.update(1.25);
   const bus=busTransit.fleet.get('college');C.position.copy(bus.root.localToWorld(new THREE.Vector3(-2.05,1.7-bus.root.position.y,BUS_DOORS[1])));feetY=0;
   busTransit.act(getInteractionTarget());
   clockElapsedMs+=(busTransit.rider.departure-busTransit.timing.service+BUS_ROUTE.fadeDelay+BUS_ROUTE.fadeSeconds+.1)*1000;busTransit.update(0);publishGameClock();
   return busTransit.aboard&&busTransit.fade===1;
  });assert(aboard);await page.locator('#gameClock').click();
  assert(await page.locator('[data-time-shift="60"]').isDisabled());assert(await page.locator('#timeApply').isDisabled());
  assert((await page.locator('#timeMessage').innerText()).includes('автобуса'));
  assert(await page.evaluate(()=>Number(getComputedStyle(document.getElementById('timeControls')).zIndex)>Number(getComputedStyle(document.getElementById('busFade')).zIndex)),'Time menu stays visible during the bus fade');
  const passenger=await page.evaluate(()=>{const before=clockElapsedMs,local=busTransit.rider.local.toArray();loop(last+30000);return {aboard:busTransit.aboard,unchanged:before===clockElapsedMs&&local.every((v,i)=>v===busTransit.rider.local.toArray()[i])};});assert(passenger.aboard&&passenger.unchanged);await page.keyboard.press('t');assert(await page.locator('#timeControls').isHidden());
  await page.evaluate(()=>{gameTime.set(1,7,29);switchLocation('home',{fresh:true});gameTime.set(1,12,0);});
  const mobile=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:1});const touch=await mobile.newPage();touch.on('pageerror',e=>errors.push(e.message));
  await touch.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));await touch.addInitScript(()=>{requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});await touch.goto(pathToFileURL(file).href,{waitUntil:'load',timeout:60000});await require('./test-runtime.cjs').startTester(touch);
  await touch.locator('#gameClock').tap();assert(await touch.locator('#timeControls').isVisible());await touch.locator('[data-time-shift="60"]').tap();assert.equal(await touch.locator('#clockTime').innerText(),'08:30');
  const layout=await touch.evaluate(()=>{const card=document.querySelector('.timeCard').getBoundingClientRect(),buttons=Array.from(document.querySelectorAll('#timeControls button')).map(b=>b.getBoundingClientRect());return {fits:card.x>=0&&card.y>=0&&card.right<=innerWidth&&card.bottom<=innerHeight,buttonsFit:buttons.every(b=>b.x>=card.x&&b.right<=card.right&&b.height>=44),noDrag:Object.keys(ptr).length===0&&joy.x===0&&joy.y===0};});assert(Object.values(layout).every(Boolean),JSON.stringify(layout));
  await touch.screenshot({path:path.join(out,'mobile.png')});
  await touch.setViewportSize({width:568,height:320});await touch.evaluate(()=>resize());
  const compact=await touch.evaluate(()=>{const card=document.querySelector('.timeCard').getBoundingClientRect();return {fits:card.y>=0&&card.bottom<=innerHeight&&card.x>=0&&card.right<=innerWidth,canScroll:getComputedStyle(document.documentElement).touchAction==='pan-y'&&getComputedStyle(document.body).touchAction==='pan-y'};});assert(compact.fits&&compact.canScroll,JSON.stringify(compact));
  await touch.locator('#timeResume').tap();assert(await touch.locator('#timeControls').isHidden());
  assert.equal(await touch.evaluate(()=>document.documentElement.classList.contains('timeControlsOpen')),false);
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({pause,resumed,lightingDay,lightingNight,student,passenger,layout,compact,errors},null,2));console.log('PASS desktop/mobile time controls, midnight/day 1, input/pause, lighting, Ilya/seller seeks, bus passenger safety');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
