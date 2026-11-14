const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const project=path.resolve(__dirname,'..'),out=path.join(__dirname,'wardrobe-qa');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:800},hasTouch:true}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',route=>route.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.addInitScript(()=>{requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});
  const game=fs.readdirSync(project).find(file=>file!=='index.html'&&file.endsWith('.html'));
  await page.goto(pathToFileURL(path.join(project,game)).href,{waitUntil:'load',timeout:60000});
  await page.locator('#play').click();
  await page.evaluate(()=>{
   switchLocation('apartment',{fresh:true});gameTime.set(1,9,0);
   window.wardrobeState=()=>({openSide:activeWorld.wardrobe.openSide,progress:activeWorld.wardrobe.leaves.map(leaf=>leaf.progress),positions:activeWorld.wardrobe.leaves.map(leaf=>leaf.root.position.x)});
   window.drawWardrobe=()=>{C.rotation.set(pitch,yaw,0);hud.textContent=zone(C.position.x,C.position.z);updateInteraction(performance.now());applyGameLighting(activeWorld);R.render(activeWorld.scene,C)};
   window.approachWardrobe=(side=0)=>{feetY=0;C.position.set((side===0?1.56:2.55)*1.55,1.7,-2.55);yaw=Math.PI;pitch=-.12;drawWardrobe()};
   window.stepWardrobe=seconds=>{for(let t=0;t<seconds;t+=.025)activeWorld.update(Math.min(.025,seconds-t),{x:C.position.x,z:C.position.z,feet:feetY});drawWardrobe()};
  });
  assert.notEqual(await page.evaluate(()=>getInteractionTarget()?.action),'wardrobe','No wardrobe action at the apartment entrance');
  const approach=await page.evaluate(()=>{approachWardrobe();return {clear:!hit(C.position.x,C.position.z),action:getInteractionTarget()?.action}});
  assert.equal(approach.clear,true);assert.equal(approach.action,'wardrobe');
  assert.equal(await page.locator('#interact .interactionCaption').textContent(),'Открыть');
  await page.screenshot({path:path.join(out,'closed.png')});
  await page.keyboard.down('e');
  assert.equal(await page.evaluate(()=>wardrobeState().openSide),0);
  assert.equal(await page.evaluate(()=>wardrobeState().progress[0]),0,'Opening starts without jumping to the end');
  await page.keyboard.down('e');await page.keyboard.up('e');
  assert.equal(await page.evaluate(()=>wardrobeState().openSide),0,'Keyboard repeat must not close the door');
  const halfway=await page.evaluate(()=>{stepWardrobe(.3);return wardrobeState()});
  assert(halfway.progress[0]>0&&halfway.progress[0]<1);assert(halfway.positions[0]>1.56&&halfway.positions[0]<2.55);
  await page.keyboard.press('e');
  assert.equal(await page.evaluate(()=>wardrobeState().positions[0]),halfway.positions[0],'Reversing must not jump');
  await page.evaluate(()=>stepWardrobe(.8));
  assert.deepEqual(await page.evaluate(()=>wardrobeState().progress),[0,0]);
  await page.keyboard.press('e');await page.evaluate(()=>stepWardrobe(.8));
  const opened=await page.evaluate(()=>wardrobeState());assert.equal(opened.progress[0],1);assert(Math.abs(opened.positions[0]-2.55)<1e-8);
  assert.equal(await page.locator('#interact .interactionCaption').textContent(),'Закрыть');
  await page.screenshot({path:path.join(out,'left-open.png')});
  await page.keyboard.press('e');await page.evaluate(()=>stepWardrobe(.8));
  await page.setViewportSize({width:844,height:390});
  await page.evaluate(()=>{resize();approachWardrobe(1)});
  const panelPoint=await page.evaluate(()=>{
   C.updateMatrixWorld();activeWorld.scene.updateMatrixWorld(true);
   for(const x of [2.30,2.80,2.55])for(const y of [1.8,.95,1.45]){
    const point=new THREE.Vector3(x,y,-.69).multiply(new THREE.Vector3(1.55,1,1.55)).project(C),px=(point.x+1)*sw/2,py=(1-point.y)*sh/2;
    if(px>10&&px<sw-10&&py>10&&py<sh-10&&document.elementFromPoint(px,py)===R.domElement)return {x:px,y:py};
   }
   throw Error('No visible part of the wardrobe for a direct tap');
  });
  await page.touchscreen.tap(panelPoint.x,panelPoint.y);
  assert.equal(await page.evaluate(()=>wardrobeState().openSide),1,'Tapping the right panel must slide that panel');
  await page.evaluate(()=>stepWardrobe(.8));
  assert(Math.abs(await page.evaluate(()=>wardrobeState().positions[1])-1.56)<1e-8);
  await page.screenshot({path:path.join(out,'mobile-right-open.png')});
  await page.locator('#interact').tap();await page.evaluate(()=>stepWardrobe(.8));
  assert.deepEqual(await page.evaluate(()=>wardrobeState().progress),[0,0],'One mobile button tap must close the wardrobe once');
  await page.dispatchEvent('canvas','pointerdown',{pointerId:29,pointerType:'touch',clientX:panelPoint.x,clientY:panelPoint.y,button:0});
  await page.dispatchEvent('canvas','pointermove',{pointerId:29,pointerType:'touch',clientX:panelPoint.x+24,clientY:panelPoint.y,buttons:1});
  await page.dispatchEvent('canvas','pointerup',{pointerId:29,pointerType:'touch',clientX:panelPoint.x+24,clientY:panelPoint.y,button:0});
  assert.equal(await page.evaluate(()=>wardrobeState().openSide),null,'Dragging the view must not open the wardrobe');
  await page.evaluate(()=>approachWardrobe(1));await page.locator('#interact').tap();await page.evaluate(()=>stepWardrobe(.8));
  const retained=await page.evaluate(()=>{
   const world=activeWorld;switchLocation('home');switchLocation('apartment',{fresh:true});
   const retained=world===activeWorld&&activeWorld.wardrobe.openSide===1;
   const solid=hit(2.55*1.55,-.39*1.55,0);
   C.position.set(0,1.7,-1.15);updateInteraction(performance.now());
   return {retained,solid,throughWall:getInteractionTarget()?.action==='wardrobe'};
  });assert.equal(retained.retained,true);assert.equal(retained.solid,true);assert.equal(retained.throughWall,false);
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>{resize();approachWardrobe();return getInteractionTarget()}),null,'Portrait orientation disables interaction');
  assert.deepEqual(errors,[]);
  const report={keyboard:true,smoothReversal:true,touchPanel:true,touchButton:true,dragIgnored:true,sceneStateRetained:true,solidCabinet:true,noInteractionThroughWall:true,portraitDisabled:true,errors};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
