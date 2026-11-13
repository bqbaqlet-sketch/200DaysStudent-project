const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const project=path.resolve(__dirname,'..'),out=path.join(__dirname,'mom-qa');fs.mkdirSync(out,{recursive:true});
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
(async()=>{
 const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE.WebGLProgram|shader error/i.test(m.text()))errors.push(m.text())});
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.addInitScript(()=>{requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});
  const game=fs.readdirSync(project).find(f=>f!=='index.html'&&f.endsWith('.html'));
  await page.goto(pathToFileURL(path.join(project,game)).href,{waitUntil:'load',timeout:60000});await page.locator('#play').click();
  const setup=await page.evaluate(async()=>{
   switchLocation('apartment',{fresh:true});feetY=0;C.position.set(-2,1.7,-2);
   window.momQA=activeWorld.mom;window.momWorld=activeWorld;
   window.momSet=(hour,minute,seconds=0,day=1)=>{gameTime.set(day,hour,minute);clockElapsedMs+=seconds*1000;momQA.update(clockElapsedMs,null,true);return momQA.state};
   const images=new Set();activeWorld.scene.traverse(o=>{for(const m of o.material?Array.isArray(o.material)?o.material:[o.material]:[])for(const k of ['map','normalMap','roughnessMap'])if(m[k]?.image?.decode)images.add(m[k].image)});
   images.add(momQA.television.image);await Promise.allSettled([...images].map(i=>i.decode()));
   window.momDraw=(eye,target)=>{C.position.set(...eye);C.lookAt(...target);hud.textContent=zone(C.position.x,C.position.z);updateInteraction(performance.now());applyGameLighting(activeWorld);R.render(activeWorld.scene,C)};
   return {eyes:momQA.eyes.eyes.length,bones:momQA.model.mesh.skeleton.bones.length,textureReady:momQA.television.state.imageReady,tableBounds:momQA.props.tableBounds};
  });assert.equal(setup.eyes,2);assert.equal(setup.bones,15);assert.equal(setup.textureReady,true);
  const evening=await page.evaluate(()=>{
   const initial=momSet(19,15),base=clockElapsedMs,events=initial.events,remote=momQA.remote;
   let maxGrip=0,maxRootStep=0,pickupJump=0,previousRoot=null,previousRemote=null,wasHeld=false,onBefore=false,onAfter=false,press=0,contacts=[];
   for(let t=0;t<=initial.duration+.10;t+=.025){
    clockElapsedMs=base+t*1000;momQA.update(clockElapsedMs,null,false);const s=momQA.state,root=momQA.model.root.position.clone(),p=remote.getWorldPosition(new THREE.Vector3());
    if(previousRoot)maxRootStep=Math.max(maxRootStep,root.distanceTo(previousRoot));previousRoot=root;
    if(s.held){maxGrip=Math.max(maxGrip,s.gripError);if(!wasHeld&&previousRemote)pickupJump=p.distanceTo(previousRemote);if(remote.parent!==momQA.model.names.handR)throw Error('Remote is not attached to right hand')}
    if(t<events.powerOnAt-.04)onBefore ||= momQA.television.state.watching;
    if(t>events.powerOnAt+.04)onAfter ||= momQA.television.state.watching;
    if(Math.abs(t-events.powerOnAt)<.025)press=Math.max(press,s.pressing);
    if(Math.abs(t-events.sitStart)<.025||Math.abs(t-events.sitEnd)<.025)contacts.push({t,position:s.position,height:s.height});
    wasHeld=s.held;previousRemote=p;
   }
   const bones=Object.fromEntries(['hips','shinL','footL'].map(n=>[n,momQA.model.names[n].getWorldPosition(new THREE.Vector3()).toArray()]));
   return {events,duration:initial.duration,maxGrip,maxRootStep,pickupJump,onBefore,onAfter,press,bones,contacts,final:momQA.state};
  });
  assert(evening.events.pickupAt<evening.events.powerOnAt&&evening.events.powerOnAt<evening.events.sitStart&&evening.events.sitStart<evening.events.sitEnd);
  assert.equal(evening.onBefore,false);assert.equal(evening.onAfter,true);assert(evening.press>.97);assert(evening.maxGrip<.001,JSON.stringify(evening));assert(evening.pickupJump<.002);assert(evening.maxRootStep<.05);assert(evening.final.sitting>.999);
  assert(evening.bones.hips[0]>-4.92&&evening.bones.hips[0]<-4.33);assert(evening.bones.shinL[0]>-4.33&&evening.bones.shinL[1]>.56);
  await page.evaluate(()=>{momSet(19,15,20);momDraw([-1.9,1.45,-3],[-4.64,1.10,-4])});await page.screenshot({path:path.join(out,'mother-watching.png')});
  await page.evaluate(t=>{momSet(19,15,t);momDraw([-1.9,1.25,-4.65],[-3.1,.86,-3.55])},evening.events.pickupAt+.01);await page.screenshot({path:path.join(out,'remote-contact.png')});
  await page.evaluate(t=>{momSet(19,15,t);momDraw([-2.2,1.65,-3],[-4.1,1.1,-4])},evening.events.powerOnAt);await page.screenshot({path:path.join(out,'remote-switch-on.png')});
  await page.evaluate(()=>{momSet(19,15,20);momDraw([-3.17,1.65,-1.6],[-3.195,1.48,-.206])});await page.screenshot({path:path.join(out,'television-picture.png')});
  const audio=await page.evaluate(async()=>{
   const tv=momQA.television;C.position.set(-3.2,1.7,-1.2);momSet(19,30);await new Promise(r=>setTimeout(r,350));
   const before=tv.audio.currentTime;await new Promise(r=>setTimeout(r,350));const after=tv.audio.currentTime;
   const samples=[];for(const point of [[-3.2,1.7,-1.2],[-4.6,1.7,-5.2],[0,1.7,-.3],[3,1.7,2]]){C.position.set(...point);momQA.update(clockElapsedMs,null,false);samples.push({point,room:activeWorld.roomAt(point[0],point[2]),...tv.state})}
   const data=await fetch(apartmentTelevisionGuitar).then(r=>r.arrayBuffer()),ctx=new AudioContext(),buffer=await ctx.decodeAudioData(data),ch=buffer.getChannelData(0);let peak=0,sum=0;for(const n of ch){peak=Math.max(peak,Math.abs(n));sum+=n*n}await ctx.close();
   const wasPlaying=tv.playing&&tv.audible;switchLocation('entrance4',{fromApartment:true});const leftPaused=tv.audio.paused;switchLocation('apartment');momSet(19,30);await new Promise(r=>setTimeout(r,100));const resumed=tv.playing;
   return {before,after,wasPlaying,leftPaused,resumed,samples,duration:buffer.duration,peak,rms:Math.sqrt(sum/ch.length),channels:buffer.numberOfChannels};
  });
  assert.equal(audio.wasPlaying,true);assert(audio.after>audio.before);assert.equal(audio.leftPaused,true);assert.equal(audio.resumed,true);assert.equal(audio.channels,1);assert(Math.abs(audio.duration-24.615375)<.01);assert(audio.peak>.7&&audio.peak<.9&&audio.rms>.1);
  assert(audio.samples[0].volume>audio.samples[1].volume*3);assert(audio.samples[1].volume>audio.samples[2].volume);assert(audio.samples[2].volume>audio.samples[3].volume);
  const bedtime=await page.evaluate(()=>{
   const first=momSet(22,30),base=clockElapsedMs,events=first.events;let maxGrip=0,releaseJump=0,previous=null,wasHeld=true,offBefore=false,offAfter=false;
   for(let t=0;t<=first.duration+.10;t+=.025){clockElapsedMs=base+t*1000;momQA.update(clockElapsedMs,null,false);const s=momQA.state,p=momQA.remote.getWorldPosition(new THREE.Vector3());if(s.held)maxGrip=Math.max(maxGrip,s.gripError);if(!s.held&&wasHeld&&previous)releaseJump=p.distanceTo(previous);if(t<events.powerOffAt-.04)offBefore ||= !momQA.television.state.watching;if(t>events.powerOffAt+.04)offAfter ||= !momQA.television.state.watching;wasHeld=s.held;previous=p}
   return {events,duration:first.duration,maxGrip,releaseJump,offBefore,offAfter,paused:momQA.television.audio.paused,final:momQA.state,eyeClosed:momQA.eyes.closed,remoteHome:momQA.remote.position.toArray(),remoteUnparented:momQA.remote.parent!==momQA.model.names.handR};
  });assert.equal(bedtime.offBefore,false);assert.equal(bedtime.offAfter,true);assert(bedtime.maxGrip<.001,JSON.stringify(bedtime));assert(bedtime.releaseJump<.002);assert.equal(bedtime.paused,true);assert.equal(bedtime.remoteUnparented,true);assert.equal(bedtime.final.activity,'sleep');assert(bedtime.eyeClosed>.99);
  const schedule=await page.evaluate(()=>{
   const results=[];for(const day of [1,2])for(const slot of momQA.schedule){gameTime.set(day,Math.floor(slot.minute/60),slot.minute%60);momQA.update(clockElapsedMs,null,true);clockElapsedMs+=(momQA.state.duration+.5)*1000;momQA.update(clockElapsedMs,null,true);const s=momQA.state;results.push({day,action:slot.action,activity:s.activity,finite:momQA.model.mesh.skeleton.bones.every(b=>b.matrixWorld.elements.every(Number.isFinite)),spoon:momQA.props.spoon?.visible,pan:momQA.props.pan.visible,meal:momQA.props.meal.visible})}
   momSet(19,30);const eye=momQA.eyes.eyes[0],before=eye.getWorldPosition(new THREE.Vector3());momQA.model.names.head.rotation.y+=.2;momQA.model.root.updateWorldMatrix(true,true);const eyeMoves=eye.getWorldPosition(new THREE.Vector3()).distanceTo(before)>.005;
   momQA.eyes.sample(0);const opened=momQA.eyes.closed;momQA.eyes.sample(3.985);const blink=momQA.eyes.closed;
   // Rewind must release the remote, turn TV off, and restore table placement.
   momSet(7,30);return {results,eyeMoves,opened,blink,rewound:!momQA.state.held&&!momQA.television.state.watching};
  });for(const s of schedule.results){assert.equal(s.activity,s.action,JSON.stringify(s));assert.equal(s.finite,true);assert.equal(s.pan,s.action==='cook');assert.equal(s.meal,s.action==='eat')}assert.equal(schedule.eyeMoves,true);assert.equal(schedule.opened,0);assert(schedule.blink>.99);assert.equal(schedule.rewound,true);
  const privacy=await page.evaluate(()=>{
   gameTime.set(1,7,0);const start=clockElapsedMs;momQA.update(start,null,true);clockElapsedMs+=momQA.state.duration*1000+100;momQA.update(clockElapsedMs,{x:-2.4,z:2.04,feet:0},true);const waits=momQA.state.activity==='walking'&&momQA.model.root.position.x>momWorld.bathroomDoor.hinge.x-.12;
   for(let i=0;i<500;i++){clockElapsedMs+=25;momWorld.bathroomDoor.update(.025);momQA.update(clockElapsedMs,null,false)}
   return {waits,entered:momQA.activity==='bathroom',private:momWorld.bathroomDoor.occupied};
  });assert.equal(privacy.waits,true);assert.equal(privacy.entered,true);assert.equal(privacy.private,true);
  await page.setViewportSize({width:844,height:390});await page.evaluate(()=>{resize();momSet(19,30);momDraw([-2,1.7,-2],[-4.64,1.1,-4])});await page.screenshot({path:path.join(out,'mother-mobile.png')});
  assert.deepEqual(errors,[]);
  const picture=fs.readFileSync(path.join(project,'assets/television/mom-screen.jpg')),html=fs.readFileSync(path.join(project,game),'utf8');
  assert.equal(sha(picture),sha(Buffer.from(html.match(/const apartmentTelevisionPicture="data:image\/jpeg;base64,([^"]+)"/)[1],'base64')));
  const report={setup,evening,audio,bedtime,schedule,privacy,errors,pictureSHA256:sha(picture)};
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,duration:evening.duration,maxGripError:Math.max(evening.maxGrip,bedtime.maxGrip),audioPlaying:audio.wasPlaying,volumeNear:audio.samples[0].volume,volumeFar:audio.samples[1].volume,scheduleSlots:schedule.results.length,privacy}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
