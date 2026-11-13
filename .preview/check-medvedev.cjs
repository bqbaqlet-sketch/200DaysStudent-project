const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const project=path.resolve(__dirname,'..'),out=path.join(__dirname,'medvedev-qa');fs.mkdirSync(out,{recursive:true});
const expectedVoice=require('../assets/voices/dialogue.json').characters.medvedev;
(async()=>{
 const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1240,height:650}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject();});
  await page.goto(pathToFileURL(path.join(project,fs.readdirSync(project).find(f=>f!=='index.html'&&f.endsWith('.html')))).href,{waitUntil:'load',timeout:60000});
  await page.locator('#play').click();
  const report=await page.evaluate(async()=>{
   const g=locations.college.medvedev,actor=g.model.root,world=locations.college;
   C.position.set(0,1.7,45);feetY=0;
   const at=(day,hour,minute)=>{gameTime.set(day,hour,minute);return {...g.state,eligible:g.update(clockElapsedMs,null,true).eligible};};
   const states=[[1,6,59],[1,7,0],[1,7,5],[1,7,59],[1,8,30],[1,9,0],[1,9,59],[1,10,0],[1,10,59],[1,11,0],[1,11,5],[1,12,30],[1,13,0],[1,23,59],[2,0,0],[2,6,59],[2,7,0],[2,7,5]].map(t=>({time:t,...at(...t)}));
   const paths=[];
   for(const hour of [7,11]){
    gameTime.set(1,hour,0);const start=clockElapsedMs,duration=hour===7?g.schedule.exitDuration:g.schedule.entryDuration;
    const trace=[];let clearDoor=true,maxSpeed=0,previous=null;
    for(let i=0;i<=Math.ceil((duration+1)/.05);i++){
     clockElapsedMs=start+i*50;const result=g.update(clockElapsedMs,{x:0,z:45,feet:0});const p=actor.position;
     if(p.x>4.95&&p.x<5.50&&(Math.abs(p.z-38.25)>.01||result.door<.98))clearDoor=false;
     if(previous)maxSpeed=Math.max(maxSpeed,p.distanceTo(previous)/.05);previous=p.clone();
     if(i%10===0)trace.push({seconds:i*.05,...result});
    }
    paths.push({hour,clearDoor,maxSpeed,final:g.state,trace});
   }
   // Stop before a player in the path and continue once the path clears.
   gameTime.set(1,11,0);const start=clockElapsedMs;let waited=false;
   for(let i=1;i<80;i++){clockElapsedMs=start+i*50;const r=g.update(clockElapsedMs,{x:3.65,z:37.7,feet:0});waited ||= r.waiting;}
   const delay=g.state.delay;
   for(let i=80;i<500;i++){clockElapsedMs=start+i*50;g.update(clockElapsedMs,{x:0,z:45,feet:0});}
   const resumed=g.state.phase==='inside';
   // Repeat visits, the exact hour boundaries, seeks and scene changes.
   let plays=0,pauses=0;const realPlay=HTMLMediaElement.prototype.play,realPause=HTMLMediaElement.prototype.pause;
   HTMLMediaElement.prototype.play=function(){plays++;return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){pauses++;};
   const near={x:1.5,z:37,feet:0},far={x:0,z:45,feet:0};C.position.set(near.x,1.7,near.z);
   gameTime.set(1,8,59);g.update(clockElapsedMs,near);const before=plays;
   gameTime.set(1,9,0);g.update(clockElapsedMs,near);const first=plays;for(let i=1;i<30;i++)g.update(clockElapsedMs+i*50,near);const stationary=plays;
   clockElapsedMs+=6500;g.update(clockElapsedMs,far);g.update(clockElapsedMs,near);const revisit=plays;
   gameTime.set(1,10,0);g.update(clockElapsedMs,near);const after=plays;
   gameTime.set(2,9,0);g.update(clockElapsedMs,near);const nextDay=plays;
   switchLocation('home',{fresh:true});const stoppedOnExit=pauses>0;gameTime.set(2,23,30);switchLocation('college');const reentryInside=g.state.phase==='inside';
   HTMLMediaElement.prototype.play=realPlay;HTMLMediaElement.prototype.pause=realPause;
  // Decode and play the actual embedded recording in the browser.
   const audioBytes=Uint8Array.from(atob(medvedevDialogue.hurry.audio.split(',')[1]),c=>c.charCodeAt(0));
   const context=new AudioContext(),decoded=await context.decodeAudioData(audioBytes.buffer),samples=decoded.getChannelData(0);let peak=0;for(const x of samples)peak=Math.max(peak,Math.abs(x));await context.close();
   const recording=new Audio(medvedevDialogue.hurry.audio);await recording.play();const playback=!recording.paused;recording.pause();
   gameTime.set(1,7,30);const mesh=g.model.mesh,bounds=new THREE.Box3(),v=new THREE.Vector3();S.updateMatrixWorld(true);mesh.skeleton.update();
   for(let i=0;i<mesh.geometry.attributes.position.count;i++){v.fromBufferAttribute(mesh.geometry.attributes.position,i);mesh.boneTransform(i,v);v.applyMatrix4(mesh.matrixWorld);bounds.expandByPoint(v);}
   return {states,paths,waiting:{waited,delay,resumed},dialogue:{before,first,stationary,revisit,after,nextDay,stoppedOnExit,reentryInside,text:medvedevDialogue.hurry.text,voiceId:g.voice.id},
    audio:{seconds:decoded.duration,rate:decoded.sampleRate,channels:decoded.numberOfChannels,peak,playback},joints:mesh.skeleton.bones.length,triangles:mesh.geometry.index.count/3,clips:Object.keys(g.model.clips),outsideBounds:[bounds.min.toArray(),bounds.max.toArray()],schedule:g.schedule,
    collision:{guard:g.blocks(3.65,36.75,0),lane:hit(0,38),booth:hit(7.2,38),barrier:S.children.includes(barG)}};
  });
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  assert.equal(report.joints,52);assert.equal(report.triangles,36000);assert.equal(report.clips.length,4);
  const phases=['inside','leaving','outside','outside','outside','outside','outside','outside','outside','entering','inside','inside','inside','inside','inside','inside','leaving','outside'];
  report.states.forEach((s,i)=>assert.equal(s.phase,phases[i],s.time.join(':')));
  for(const s of report.states)assert.equal(s.eligible,s.time[1]===9);
  for(const p of report.paths){assert.equal(p.clearDoor,true,'Guard must cross an open doorway');assert.ok(p.maxSpeed<2.2);assert.ok(p.trace.every(t=>t.position.every(Number.isFinite)));}
  assert.equal(report.waiting.waited,true);assert.ok(report.waiting.delay>0);assert.equal(report.waiting.resumed,true);
  assert.deepEqual(Object.values(report.dialogue).slice(0,6),[0,1,1,2,2,3]);assert.equal(report.dialogue.stoppedOnExit,true);assert.equal(report.dialogue.reentryInside,true);
  assert.equal(report.dialogue.text,expectedVoice.lines.hurry.text);assert.equal(report.dialogue.voiceId,expectedVoice.profile.id);
  assert.ok(report.audio.seconds>1.5&&report.audio.seconds<7);assert.ok(report.audio.peak>.3&&report.audio.peak<.99);assert.equal(report.audio.playback,true);
  assert.ok(report.outsideBounds.flat().every(Number.isFinite));assert.ok(report.outsideBounds[0][1]>-.10&&report.outsideBounds[0][1]<.10);assert.ok(report.outsideBounds[1][1]>1.65&&report.outsideBounds[1][1]<2.1);
  assert.deepEqual(report.collision,{guard:true,lane:false,booth:true,barrier:true});
  await page.evaluate(async()=>{gameTime.set(1,9,15);for(const key of ['map','normalMap','roughnessMap'])await medvedev.model.mesh.material[key].image.decode();C.position.set(.4,1.7,40.4);C.lookAt(5.5,1.4,37.7);barG.rotation.z=-1.32;hud.textContent=zone(C.position.x,C.position.z);R.render(S,C);});
  await page.screenshot({path:path.join(out,'medvedev-at-post.png')});
  await page.evaluate(()=>{gameTime.set(1,11,30);document.getElementById('notice').style.display='none';C.position.set(7,1.7,41.6);C.lookAt(7.1,1.3,38.6);R.render(S,C);});
  await page.screenshot({path:path.join(out,'medvedev-inside.png')});
  await page.evaluate(()=>{gameTime.set(1,11,0);clockElapsedMs+=5400;medvedev.update(clockElapsedMs,null,true);C.position.set(.5,1.7,40);C.lookAt(5.7,1.35,38.2);R.render(S,C);});
  await page.screenshot({path:path.join(out,'medvedev-entering.png')});
  await page.setViewportSize({width:844,height:390});
  await page.evaluate(()=>{resize();gameTime.set(2,9,15);C.position.set(.5,1.7,39.7);C.lookAt(5.4,1.3,37.7);R.render(S,C);});
  await page.screenshot({path:path.join(out,'mobile-landscape.png')});
  assert.deepEqual(errors,[]);report.javascriptErrors=errors;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({states:report.states.map(s=>({time:s.time,phase:s.phase})),waiting:report.waiting,dialogue:report.dialogue,audio:report.audio,schedule:report.schedule,javascriptErrors:errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
