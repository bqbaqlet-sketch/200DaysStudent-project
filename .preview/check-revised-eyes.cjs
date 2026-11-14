const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'eyes-revision-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1000,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));await page.addInitScript(()=>{requestAnimationFrame=()=>0;Element.prototype.requestFullscreen=()=>Promise.reject()});
 await page.goto(pathToFileURL(path.join(root,fs.readdirSync(root).find(f=>f!=='index.html'&&f.endsWith('.html')))).href,{waitUntil:'load',timeout:60000});await require('./test-runtime.cjs').startTester(page);
 const metadata=await page.evaluate(async()=>{
  const ilya=buildFrontStudentModel();ilya.root.scale.x=1;switchLocation('home',{fresh:true});const seller=activeWorld.clothingSeller.model;seller.root.parent.remove(seller.root);seller.root.position.set(0,0,0);seller.root.rotation.set(0,0,0);
  window.eyeModels=[{id:'ilya',name:FRONT_STUDENT.characterName,model:ilya,eyes:ilya.eyes,profile:frontStudentEyes,closedTime:4.7-1.83+.095},{id:'seller',model:seller,eyes:activeWorld.clothingSeller.eyes,profile:clothingSellerEyes,closedTime:5.2-.47+.095}];
  const scene=new THREE.Scene();scene.background=new THREE.Color('#c9c9c7');scene.add(new THREE.HemisphereLight(0xffffff,0x66685f,.85));const key=new THREE.DirectionalLight(0xfff1e7,.65);key.position.set(-1,3,4);scene.add(key);window.eyeStage={scene,key};
  for(const actor of eyeModels){actor.model.root.visible=true;actor.model.pose({height:actor.model.standingHeight,time:0});scene.add(actor.model.root);for(const key of ['map','normalMap','roughnessMap'])await actor.model.mesh.material[key].image.decode();}
  R.setPixelRatio(1);R.setSize(1000,900);for(const n of document.body.children)if(n!==R.domElement)n.style.visibility='hidden';
  window.eyePortrait=(index,blink=false,angle=0,dark=false)=>{
   const actor=eyeModels[index];eyeModels.forEach((a,i)=>a.model.root.visible=i===index);actor.model.root.rotation.y=angle;actor.model.pose({height:actor.model.standingHeight,time:0});actor.eyes.sample(blink?actor.closedTime:1,0);
   const camera=new THREE.PerspectiveCamera(31,1000/900,.02,5);camera.position.set(0,1.665,.47);camera.lookAt(0,1.665,0);eyeStage.key.intensity=dark?.1:.65;eyeStage.scene.children.find(x=>x.isHemisphereLight).intensity=dark?.15:.85;R.render(eyeStage.scene,camera);
  };
  return eyeModels.map(actor=>{
   const canvas=actor.eyes.eyes[0].material.map.image,ctx=canvas.getContext('2d'),offset=actor.id==='ilya'?.0012:.0006,pixel=(x,y)=>Array.from(ctx.getImageData(Math.round(canvas.width*(.5+x/(actor.profile.halfWidth*2))),Math.round(canvas.height*(.5-y/(actor.profile.halfHeight*2))),1,1).data);
   actor.eyes.sample(1,0);const pupilOpen=pixel(0,offset-.00025),irisCorner=actor.id==='ilya'?pixel(.0055,offset+.0025):pixel(.0049,offset+.00195);actor.eyes.sample(actor.closedTime,0);const pupilClosed=pixel(0,offset-.00025);
   return {id:actor.id,name:actor.name,style:actor.eyes.style,pupilOpen,pupilClosed,irisCorner,eyes:actor.eyes.eyes.map(e=>({texture:[e.material.map.image.width,e.material.map.image.height],vertexColors:e.material.vertexColors,mappedEmission:e.material.emissiveMap===e.material.map,finite:Array.from(e.geometry.attributes.position.array).every(Number.isFinite)}))};
  });
 });assert.equal(metadata[0].name,'Илья');
 for(let i=0;i<2;i++){
  if(!process.argv.includes('--pair-only')){
  for(const [mode,blink,angle,dark] of [['front',false,0,false],['blink',true,0,false],['angle',false,.35,false],['dim',false,0,true]]){await page.evaluate(([i,b,a,d])=>eyePortrait(i,b,a,d),[i,blink,angle,dark]);await page.screenshot({path:path.join(out,metadata[i].id+'-'+mode+'.png')});}
  }
  assert(metadata[i].eyes.every(e=>e.texture[0]>=512&&!e.vertexColors&&e.mappedEmission&&e.finite));
  assert(metadata[i].pupilClosed[0]>metadata[i].pupilOpen[0]+40,'Blink must cover the pupil');assert(metadata[i].irisCorner[0]>metadata[i].pupilOpen[0]+25,'Iris must have a round transparent border');
 }
 await page.setViewportSize({width:1200,height:650});await page.evaluate(()=>{R.setSize(1200,650);eyeStage.key.intensity=.65;eyeStage.scene.children.find(x=>x.isHemisphereLight).intensity=.85;eyeModels.forEach((actor,i)=>{actor.model.root.visible=true;actor.model.root.position.set(i?.14:-.14,0,0);actor.model.root.rotation.set(0,0,0);actor.model.pose({height:actor.model.standingHeight,time:0});actor.eyes.sample(1,0)});const camera=new THREE.OrthographicCamera(-.34*1200/650/2,.34*1200/650/2,1.84,1.50,.01,3);camera.position.z=.6;R.render(eyeStage.scene,camera)});await page.screenshot({path:path.join(out,'characters-after.png')});
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({metadata,errors},null,2));console.log(JSON.stringify({metadata,errors},null,2));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
