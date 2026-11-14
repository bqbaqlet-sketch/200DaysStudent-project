const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'clothing-seller-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1240,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));await page.addInitScript(()=>{requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});
 await page.goto(pathToFileURL(path.join(root,fs.readdirSync(root).find(n=>n!=='index.html'&&n.endsWith('.html')))).href,{waitUntil:'load',timeout:60000});await page.locator('#play').click();
 const report=await page.evaluate(()=>{
  switchLocation('home',{fresh:true});window.seller=activeWorld.clothingSeller;const world=activeWorld,far={x:999,z:999,feet:0};
  window.sellerTime=(day,minute,seconds=0,sync=true)=>{clockElapsedMs=((day-1)*1440+minute)*REAL_MS_PER_GAME_MINUTE+seconds*1000;world.updateCharacters(far,sync);publishGameClock();applyGameLighting(world);};
  window.stepSeller=(seconds,player=far)=>{for(let t=0;t<seconds-1e-8;){const dt=Math.min(.025,seconds-t);t+=dt;clockElapsedMs+=dt*1000;world.update(dt,player);}publishGameClock();};
  window.sellerState=()=>({phase:seller.state.phase,visible:seller.root.visible,working:seller.state.working,position:seller.root.position.toArray(),elapsed:seller.state.elapsed,opacity:seller.model.mesh.material.opacity});
  sellerTime(1,360,-.001);const before=sellerState();sellerTime(1,360);const opens=sellerState();sellerTime(1,720);const midday=sellerState();sellerTime(1,1320,-.001);const untilClose=sellerState();sellerTime(1,1320);const closes=sellerState();
  const paths=[],blocked=[],trace=[];let sawStreet=false,sawCourtyard=false,finite=true,maxBlink=0;
  for(let t=0;t<seller.sequence.duration+.5;t+=.05){
   stepSeller(.05);const p=seller.root.position;maxBlink=Math.max(maxBlink,seller.eyes.closed);if(!seller.root.visible)continue;
   if(p.z>world.clothingShop.front+.3)sawStreet=true;if(p.x<56)sawCourtyard=true;
   const obstacles=world.colliders.filter(b=>p.x>b[0]-.26&&p.x<b[2]+.26&&p.z>b[1]-.26&&p.z<b[3]+.26&&(b.length<6||p.y<b[5]&&p.y+1.82>b[4]));
   if((obstacles.length||!world.contains(p.x,p.z))&&blocked.length<12)blocked.push({time:t,point:p.toArray(),obstacles,inside:world.contains(p.x,p.z)});
   finite&&=seller.model.mesh.skeleton.bones.every(b=>b.matrixWorld.elements.every(Number.isFinite));if(Math.round(t*20)%20===0)trace.push({time:t,position:p.toArray()});
  }
  const finished=sellerState();sellerTime(2,360);const nextDay=sellerState();sellerTime(2,1320);stepSeller(1.0);
  const next=seller.sequence.sample(seller.state.elapsed+.025,seller.sequence.state()),stop={x:next.x,z:next.z,feet:world.walkGroundAt(next.x,next.z,null)},beforeWait=seller.state.elapsed;stepSeller(1.2,stop);const waited=seller.state.waitingFor==='player'&&seller.state.elapsed===beforeWait;stepSeller(1,far);const resumed=seller.state.elapsed>beforeWait;
  sellerTime(2,1325);const seek=sellerState();switchLocation('college');switchLocation('home');const same=seller===activeWorld.clothingSeller,afterReturn=sellerState();
  sellerTime(3,0);const midnight=sellerState();sellerTime(3,360);const again=sellerState();
  const physical=world.dynamicHit(seller.root.position.x,seller.root.position.z,seller.root.position.y);
  const instances=world.scene.children.filter(o=>o.userData.characterId===CLOTHING_SELLER.id).length;
  return {before,opens,midday,untilClose,closes,finished,nextDay,midnight,again,schedule:seller.schedule,sawStreet,sawCourtyard,blocked,finite,maxBlink,waited,resumed,seek,afterReturn,same,physical,instances,trace,model:{triangles:seller.model.mesh.geometry.index.count/3,bones:seller.model.mesh.skeleton.bones.length,eyes:seller.eyes.eyes.length}};
 });
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({opens:report.opens,closes:report.closes,duration:report.schedule.leaveDuration,blocked:report.blocked,waited:report.waited,finished:report.finished},null,2));
 assert.equal(report.before.visible,false);for(const key of ['opens','midday','untilClose','nextDay','again']){assert.equal(report[key].working,true,key);assert.equal(report[key].visible,true,key);assert.equal(report[key].opacity,1);}
 assert.equal(report.closes.phase,'leaving');assert.equal(report.closes.working,false);assert.equal(report.closes.elapsed,0);assert.equal(report.finished.visible,false);assert.equal(report.midnight.visible,false);assert(report.sawStreet&&report.sawCourtyard);assert.deepEqual(report.blocked,[]);assert(report.finite&&report.waited&&report.resumed&&report.same&&report.physical);assert.equal(report.instances,1);assert.equal(report.model.triangles,48000);assert.equal(report.model.bones,15);assert.equal(report.model.eyes,2);assert(Math.abs(report.seek.elapsed-15)<.001&&Math.abs(report.afterReturn.elapsed-15)<.001);
 await page.evaluate(async()=>{sellerTime(1,720);for(const key of ['map','normalMap','roughnessMap'])await seller.model.mesh.material[key].image.decode();const shop=activeWorld.clothingShop;C.position.set(shop.mid+.6,1.7,shop.front-.65);C.lookAt(seller.root.position.x,1.35,seller.root.position.z);yaw=C.rotation.y;pitch=C.rotation.x;hud.textContent='Дом · Магазин одежды';applyGameLighting(activeWorld);R.render(activeWorld.scene,C)});await page.screenshot({path:path.join(out,'seller-at-counter.png')});
 await page.evaluate(()=>{const s=seller.root.position;C.position.set(s.x,1.76,s.z+.78);C.lookAt(s.x,1.78,s.z);yaw=C.rotation.y;pitch=C.rotation.x;R.render(activeWorld.scene,C)});await page.screenshot({path:path.join(out,'seller-eyes.png')});
 await page.evaluate(()=>{sellerTime(1,1320);stepSeller(5);const s=seller.root.position;C.position.set(s.x+2.2,1.72,s.z+3.4);C.lookAt(s.x,1.15,s.z);yaw=C.rotation.y;pitch=C.rotation.x;hud.textContent='Дом · Магазин одежды';applyGameLighting(activeWorld);R.render(activeWorld.scene,C)});await page.screenshot({path:path.join(out,'seller-leaving-2200.png')});
 await page.setViewportSize({width:844,height:390});await page.evaluate(()=>{resize();sellerTime(1,600);const shop=activeWorld.clothingShop;C.position.set(shop.mid+.6,1.7,shop.front-.65);C.lookAt(seller.root.position.x,1.35,seller.root.position.z);yaw=C.rotation.y;pitch=C.rotation.x;R.render(activeWorld.scene,C)});await page.screenshot({path:path.join(out,'mobile-counter.png')});
 assert.deepEqual(errors,[]);report.errors=errors;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log('PASS seller hours / exit route / player blocking / daily repeat / eyes / mobile');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
