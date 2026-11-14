const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const project=path.resolve(__dirname,'..'),manifest=require('../assets/voices/dialogue.json'),out=path.join(__dirname,'voices-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.addInitScript(()=>{requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});
  const game=fs.readdirSync(project).find(f=>f!=='index.html'&&f.endsWith('.html'));
  await page.goto(pathToFileURL(path.join(project,game)).href,{waitUntil:'load',timeout:60000});await require('./test-runtime.cjs').startTester(page);
  const recordings=await page.evaluate(async()=>{
   const context=new AudioContext(),rows=[];
   for(const [character,dialogue] of [['medvedev',medvedevDialogue],['larisa',director110Dialogue]])for(const [id,line] of Object.entries(dialogue)){
    const bytes=Uint8Array.from(atob(line.audio.split(',')[1]),c=>c.charCodeAt(0)),hash=await crypto.subtle.digest('SHA-256',bytes),decoded=await context.decodeAudioData(bytes.slice().buffer);
    let peak=0;for(let c=0;c<decoded.numberOfChannels;c++)for(const sample of decoded.getChannelData(c))peak=Math.max(peak,Math.abs(sample));
    rows.push({character,id,text:line.text,ms:line.ms,mime:line.audio.split(';')[0],sha256:[...new Uint8Array(hash)].map(v=>v.toString(16).padStart(2,'0')).join(''),duration:decoded.duration,peak});
   }
   await context.close();return rows;
  });assert.equal(recordings.length,4);
  for(const row of recordings){
   const expected=manifest.characters[row.character].lines[row.id],file=path.join(project,'assets/voices',expected.file);
   assert.equal(row.sha256,expected.sha256);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),row.sha256);
   assert.equal(row.mime,'data:audio/mpeg');assert.equal(row.text,expected.text);assert.equal(row.ms,Math.ceil(expected.duration*1000));assert(Math.abs(row.ms-row.duration*1000)<2);assert(row.peak>.1&&row.peak<1);
  }
  const director=await page.evaluate(async()=>{
   window.waitVoiceEnd=(audio,ms)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Voice did not finish')),ms+2000);audio.addEventListener('ended',()=>{clearTimeout(timer);resolve()},{once:true});audio.addEventListener('error',()=>{clearTimeout(timer);reject(Error('Voice playback error'))},{once:true})});
   const rows=[];
   for(const id of ['first','second','eject']){
    playDirectorLine(id);const audio=directorSpeech,line=director110Dialogue[id],text=notice.textContent;await waitVoiceEnd(audio,line.ms);
    rows.push({id,text,expected:line.text,ended:audio.ended,subtitleRemainsAtEnd:noticeUntil>performance.now()-100});
   }
   return rows;
  });for(const line of director){assert.equal(line.text,line.expected);assert.equal(line.ended,true);assert.equal(line.subtitleRemainsAtEnd,true)}
  const guard=await page.evaluate(async()=>{
   const NativeAudio=window.Audio,instances=[];window.Audio=function(src){const audio=new NativeAudio(src);instances.push(audio);return audio};
   try{
    switchLocation('college',{fresh:true});C.position.set(1.5,1.7,37);feetY=0;gameTime.set(1,9,0);medvedev.update(clockElapsedMs,{x:1.5,z:37,feet:0});
    const audio=instances.at(-1);if(!audio)throw Error('Guard did not speak');const text=notice.textContent;await waitVoiceEnd(audio,medvedevDialogue.hurry.ms);
    return {text,expected:medvedevDialogue.hurry.text,ended:audio.ended,subtitleRemainsAtEnd:noticeUntil>performance.now()-100,lineCount:medvedev.state.lineCount};
   }finally{window.Audio=NativeAudio}
  });assert.equal(guard.text,guard.expected);assert.equal(guard.ended,true);assert.equal(guard.subtitleRemainsAtEnd,true);assert.equal(guard.lineCount,1);
  const profiles=await page.evaluate(()=>({medvedev:characterVoices.medvedev,larisa:characterVoices.larisa}));
  for(const id of ['medvedev','larisa'])assert.deepEqual(profiles[id],manifest.characters[id].profile);
  assert.deepEqual(errors,[]);const report={recordings,director,guard,profiles,errors};fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({recordings:recordings.map(({character,id,text,ms,peak})=>({character,id,text,ms,peak})),director,guard,errors},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
