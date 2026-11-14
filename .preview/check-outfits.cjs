const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const project=path.resolve(__dirname,'..'),out=path.join(__dirname,'outfits-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1200,height:800},hasTouch:true}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error'&&/WebGLProgram|shader error/i.test(message.text()))errors.push(message.text())});
 await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',route=>route.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
 await page.addInitScript(()=>{window.qaTime=1000;Object.defineProperty(performance,'now',{value:()=>qaTime});requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});
 const game=fs.readdirSync(project).find(file=>file!=='index.html'&&file.endsWith('.html'));
 await page.goto(pathToFileURL(path.join(project,game)).href,{waitUntil:'load',timeout:60000});await page.locator('#play').click();
 const initial=await page.evaluate(()=>{
  switchLocation('apartment',{fresh:true});gameTime.set(1,9,0);
  window.drawOutfit=()=>{C.rotation.set(pitch,yaw,0);hud.textContent=zone(C.position.x,C.position.z);updateInteraction(performance.now());applyGameLighting(activeWorld);R.render(activeWorld.scene,C)};
  window.stepOutfit=seconds=>{for(let t=0;t<seconds;t+=.025){qaTime+=25;activeWorld.update(.025,{x:C.position.x,z:C.position.z,feet:feetY});updateInteraction(performance.now())}drawOutfit()};
  window.aimOutfit=()=>{feetY=0;C.position.set(1.44*1.55,1.7,-2.45);C.lookAt(1.44*1.55,1.22,-.39*1.55);pitch=C.rotation.x;yaw=C.rotation.y;drawOutfit()};
  window.outfitState=()=>({equipped:playerClothing.equipped,stored:playerClothing.stored,avatar:playerAvatar.outfit,garment:activeWorld.wardrobe.activeGarment.userData.outfit,hangers:activeWorld.wardrobe.hangers.length});
  window.clothingPoint=()=>{for(const y of [1.3,1.1,.85,1.45])for(const x of [1.44*1.55,1.44*1.55-.07,1.44*1.55+.07]){
   const point=new THREE.Vector3(x,y,-.39*1.55).project(C),pixel={x:(point.x+1)*sw/2,y:(1-point.y)*sh/2};
   if(activeWorld.wardrobe.clothingTarget(pixel)&&document.elementFromPoint(pixel.x,pixel.y)===R.domElement)return pixel;
  }throw Error('No visible clothing surface for touch')};
  aimOutfit();return {state:outfitState(),closedTarget:getInteractionTarget()?.action,head:playerAvatar.eyes.root.uuid};
 });assert.equal(initial.state.hangers,4);assert.equal(initial.state.equipped,'casual');assert.equal(initial.state.stored,'uniform');assert.notEqual(initial.closedTarget,'outfit');
 await page.evaluate(()=>{activeWorld.wardrobe.toggle(0);stepOutfit(.9);aimOutfit()});
 assert.equal(await page.evaluate(()=>getInteractionTarget()?.action),'outfit');
 await page.screenshot({path:path.join(out,'uniform-on-hanger.png')});
 await page.keyboard.down('e');await page.evaluate(()=>stepOutfit(.5));await page.keyboard.up('e');assert.equal(await page.evaluate(()=>playerClothing.equipped),'casual','Short E press must not change clothing');
 await page.keyboard.down('e');await page.evaluate(()=>stepOutfit(1.2));await page.keyboard.up('e');
 const dressed=await page.evaluate(()=>({state:outfitState(),sameFace:playerAvatar.eyes.root.uuid,uniformVisible:playerAvatar.uniformMesh.visible,firstPerson:playerAvatar.uniformFirstPerson.visible,casualBodyHidden:!playerAvatar.firstPersonMesh.visible}));
 assert.equal(dressed.state.equipped,'uniform');assert.equal(dressed.state.stored,'casual');assert.equal(dressed.state.garment,'casual');assert.equal(dressed.sameFace,initial.head);assert(dressed.uniformVisible&&dressed.firstPerson&&dressed.casualBodyHidden);
 await page.evaluate(()=>stepOutfit(2));assert.equal(await page.evaluate(()=>playerClothing.equipped),'uniform','One hold must exchange clothing once');
 await page.screenshot({path:path.join(out,'casual-on-hanger.png')});
 const transitions=await page.evaluate(()=>{const result=[];for(const id of ['college1','college2','home','entrance4','apartment']){switchLocation(id,{fresh:true});drawOutfit();result.push({id,outfit:playerAvatar.outfit,finite:playerAvatar.uniformMesh.skeleton.bones.every(bone=>bone.matrixWorld.elements.every(Number.isFinite))});}return result;});
 for(const item of transitions){assert.equal(item.outfit,'uniform');assert.equal(item.finite,true);}
 const bus=await page.evaluate(()=>{
  switchLocation('home',{fresh:true});gameTime.set(1,7,42);
  const step=seconds=>{for(let t=0;t<seconds;t+=.05){const dt=Math.min(.05,seconds-t);clockElapsedMs+=dt*1000;busTransit.update(dt);activeWorld.update?.(dt,{x:C.position.x,z:C.position.z,feet:feetY})}};
  step(1.1);const vehicle=busTransit.fleet.get('home');C.position.copy(vehicle.root.localToWorld(new THREE.Vector3(-2.05,1.7-vehicle.root.position.y,BUS_DOORS[1])));yaw=-Math.PI;pitch=0;C.rotation.set(pitch,yaw,0);
  busTransit.act(getInteractionTarget());step(.8);busTransit.act(getInteractionTarget());step(1.8);for(let i=0;i<30;i++)playerAvatar.update(.05);
  const seated=playerAvatar.state.sitting>.98,clothed=playerAvatar.uniformMesh.visible;
  const rider=busTransit.rider;step(rider.arrival+1.3-busTransit.timing.service);busTransit.act(getInteractionTarget());step(3);for(let i=0;i<35;i++)playerAvatar.update(.05);
  return {seated,clothed,exited:!busTransit.aboard,standing:playerAvatar.state.sitting<.01,outfit:playerAvatar.outfit};
 });assert(bus.seated&&bus.clothed&&bus.exited&&bus.standing);assert.equal(bus.outfit,'uniform');
 await page.evaluate(()=>switchLocation('apartment',{fresh:true}));
 await page.evaluate(()=>{gameTime.set(1,9,0);aimOutfit()});
 await page.setViewportSize({width:844,height:390});await page.evaluate(()=>{resize();aimOutfit()});
 const cdp=await page.context().newCDPSession(page),point=await page.evaluate(()=>clothingPoint());
 const touch=async(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(p=>({x:p.x,y:p.y,radiusX:2,radiusY:2,force:1,id:0}))});
 await touch('touchStart',[point]);await page.evaluate(()=>stepOutfit(.4));await touch('touchEnd',[]);assert.equal(await page.evaluate(()=>playerClothing.equipped),'uniform','Short clothing tap must not equip it');
 await touch('touchStart',[point]);await touch('touchMove',[{x:point.x+25,y:point.y}]);await page.evaluate(()=>stepOutfit(1.3));await touch('touchEnd',[]);assert.equal(await page.evaluate(()=>playerClothing.equipped),'uniform','Swiping clothing must not equip it');
 await page.evaluate(()=>aimOutfit());const heldPoint=await page.evaluate(()=>clothingPoint());
 await touch('touchStart',[heldPoint]);await page.evaluate(()=>stepOutfit(1.2));await touch('touchEnd',[]);
 const undressed=await page.evaluate(()=>outfitState());assert.equal(undressed.equipped,'casual');assert.equal(undressed.stored,'uniform');assert.equal(undressed.garment,'uniform');
 await page.screenshot({path:path.join(out,'mobile-change.png')});
 await page.keyboard.down('e');await page.evaluate(()=>stepOutfit(.4));await page.evaluate(()=>{yaw+=Math.PI;drawOutfit();stepOutfit(1)});await page.keyboard.up('e');assert.equal(await page.evaluate(()=>playerClothing.equipped),'casual','Looking away cancels dressing');
 await page.evaluate(()=>aimOutfit());const buttonBounds=await page.locator('#interact').boundingBox(),buttonPoint={x:buttonBounds.x+buttonBounds.width/2,y:buttonBounds.y+buttonBounds.height/2};
 await touch('touchStart',[buttonPoint]);await page.evaluate(()=>{stepOutfit(1.2);stepOutfit(1.5)});await touch('touchEnd',[]);assert.equal(await page.evaluate(()=>playerAvatar.outfit),'uniform','Holding the mobile button must change the outfit once');
 const pose=await page.evaluate(async()=>{
  switchLocation('apartment',{fresh:true});gameTime.set(1,9,0);feetY=0;C.position.set(-2.95,1.7,1.8755);yaw=Math.PI/2;pitch=0;
  const images=new Set();activeWorld.scene.traverse(o=>{for(const m of o.material?Array.isArray(o.material)?o.material:[o.material]:[])for(const key of ['map','normalMap','roughnessMap'])if(m[key]?.image?.decode)images.add(m[key].image)});await Promise.allSettled([...images].map(image=>image.decode()));
  drawOutfit();return {headTriangles:playerAvatar.model.mesh.geometry.index.count/3,bodyTriangles:playerAvatar.uniformMesh.geometry.index.count/3,bones:playerAvatar.uniformMesh.skeleton.bones.length,neckVisible:playerAvatar.neckMesh.visible,reflectionSeesUniform:activeWorld.bathroomMirror.reflectionCamera.layers.test(playerAvatar.uniformMesh.layers)};
 });assert(pose.headTriangles>1000&&pose.headTriangles<15000);assert(pose.bodyTriangles>20000);assert.equal(pose.bones,15);assert.equal(pose.neckVisible,true);assert.equal(pose.reflectionSeesUniform,true);
 await page.screenshot({path:path.join(out,'uniform-mirror.png')});
 await page.setViewportSize({width:1000,height:1000});
 await page.evaluate(()=>{
  window.uniformScene=new THREE.Scene();uniformScene.background=new THREE.Color(0xb8c2c7);uniformScene.add(playerAvatar.model.root);playerAvatar.model.root.position.set(0,0,0);playerAvatar.model.root.rotation.set(0,0,0);playerAvatar.model.root.scale.set(1,1,1);
  uniformScene.add(new THREE.HemisphereLight(0xffffff,0x6b6258,.8));const light=new THREE.DirectionalLight(0xfff5e8,.75);light.position.set(-2,3,4);uniformScene.add(light);
  window.uniformCamera=new THREE.PerspectiveCamera(38,1,.01,15);uniformCamera.layers.enable(1);R.setSize(1000,1000);R.outputEncoding=THREE.sRGBEncoding;
  for(const element of document.body.children)if(element!==R.domElement)element.style.setProperty('display','none','important');
  playerAvatar.model.pose({height:playerAvatar.model.standingHeight,time:0});uniformCamera.position.set(0,.95,3.2);uniformCamera.lookAt(0,.95,0);R.render(uniformScene,uniformCamera);
 });await page.screenshot({path:path.join(out,'uniform-corrected.png')});
 await page.evaluate(()=>{uniformCamera.position.set(0,1.69,.72);uniformCamera.lookAt(0,1.69,0);R.render(uniformScene,uniformCamera)});await page.screenshot({path:path.join(out,'uniform-face.png')});
 assert.deepEqual(errors,[]);const report={initial:initial.state,dressed:dressed.state,undressed,shortPressCancelled:true,dragCancelled:true,lookingAwayCancelled:true,sameHead:true,transitions,bus,pose,errors};fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});
