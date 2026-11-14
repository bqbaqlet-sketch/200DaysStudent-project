const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const project=path.resolve(__dirname,'..'),three=path.dirname(require.resolve('three/package.json'));
(async()=>{const browser=await chromium.launch({...require('./test-runtime.cjs').browserOptions(),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',route=>route.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
 await page.addInitScript(()=>{requestAnimationFrame=()=>0});
 const game=fs.readdirSync(project).find(file=>file!=='index.html'&&file.endsWith('.html'));
 await page.goto(pathToFileURL(path.join(project,game)).href,{waitUntil:'load',timeout:60000});
 await page.addScriptTag({path:path.join(three,'examples/js/exporters/GLTFExporter.js')});
 const result=await page.evaluate(async()=>{
  playerAvatar.setOutfit('uniform');const model=playerAvatar.model,root=model.root,joints=Object.values(model.names),clips=[];
  root.position.set(0,0,0);root.rotation.set(0,0,0);root.scale.set(1,1,1);playerAvatar.firstPersonMesh.visible=false;playerAvatar.uniformFirstPerson.visible=false;
  const images=new Set();for(const mesh of [model.mesh,playerAvatar.uniformMesh])for(const key of ['map','normalMap','roughnessMap','metalnessMap'])if(mesh.material[key]?.image?.decode)images.add(mesh.material[key].image);
  await Promise.allSettled([...images].map(image=>image.decode()));
  for(const [name,duration,mode] of [['Player_Idle',4,'idle'],['Player_Walk',model.cycleLength/2.7,'walk'],['Player_Seated',4,'seated']]){
   const count=Math.ceil(duration*48),times=[],rotations=joints.map(()=>[]),positions=[],scales=[];
   for(let frame=0;frame<=count;frame++){
    const t=frame/count;times.push(t*duration);model.pose({time:t*duration,height:mode==='seated'?.535:model.standingHeight,sitting:mode==='seated'?1:0,walking:mode==='walk'?1:0,gait:mode==='walk'?t:0});
    joints.forEach((bone,index)=>rotations[index].push(...bone.quaternion.toArray()));positions.push(...model.names.hips.position.toArray());scales.push(...model.names.body.scale.toArray());
   }
   for(const values of rotations)values.splice(values.length-4,4,...values.slice(0,4));positions.splice(positions.length-3,3,...positions.slice(0,3));scales.splice(scales.length-3,3,...scales.slice(0,3));
   const tracks=joints.map((bone,index)=>new THREE.QuaternionKeyframeTrack(bone.name+'.quaternion',times,rotations[index]));tracks.push(new THREE.VectorKeyframeTrack('hips.position',times,positions),new THREE.VectorKeyframeTrack('body.scale',times,scales));clips.push(new THREE.AnimationClip(name,duration,tracks));
  }
  model.pose({height:model.standingHeight,time:0});
  for(const mesh of [model.mesh,playerAvatar.uniformMesh,playerAvatar.neckMesh]){mesh.geometry=mesh.geometry.clone();const normal=mesh.geometry.attributes.normal,divisor=normal.normalized&&normal.array instanceof Int8Array?127:1;mesh.geometry.setAttribute('normal',new THREE.Float32BufferAttribute(Float32Array.from(normal.array,value=>value/divisor),3));}
  root.updateMatrixWorld(true);const buffer=await new Promise(resolve=>new THREE.GLTFExporter().parse(root,resolve,{binary:true,animations:clips,onlyVisible:true}));
  const bytes=new Uint8Array(buffer);let text='';for(let i=0;i<bytes.length;i+=32768)text+=String.fromCharCode(...bytes.subarray(i,i+32768));return {data:btoa(text),clips:clips.map(clip=>clip.name)};
 });
 await page.addScriptTag({path:path.join(three,'examples/js/loaders/GLTFLoader.js')});
 const check=await page.evaluate(async encoded=>{
  const gltf=await new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(Uint8Array.from(atob(encoded),character=>character.charCodeAt(0)).buffer,'',resolve,reject));
  const meshes=[];gltf.scene.traverse(object=>{if(object.isSkinnedMesh)meshes.push(object)});const mixer=new THREE.AnimationMixer(gltf.scene);mixer.clipAction(gltf.animations.find(clip=>clip.name==='Player_Walk')).play();mixer.setTime(.3);gltf.scene.updateMatrixWorld(true);
  return {meshes:meshes.length,bones:meshes.map(mesh=>mesh.skeleton.bones.length),eyes:!!gltf.scene.getObjectByName('player-eye-left')&&!!gltf.scene.getObjectByName('player-eye-right'),finite:meshes.every(mesh=>mesh.skeleton.bones.every(bone=>bone.matrixWorld.elements.every(Number.isFinite))),clips:gltf.animations.map(clip=>clip.name)};
 },result.data);
 assert.equal(check.meshes,3);assert.deepEqual(check.bones,[15,15,15]);assert.equal(check.eyes,true);assert.equal(check.finite,true);assert.equal(check.clips.length,3);assert.deepEqual(errors,[]);
 const file=path.join(project,'assets/characters/player-uniform/player-uniform-animated.glb');fs.writeFileSync(file,Buffer.from(result.data,'base64'));
 console.log(JSON.stringify({file:path.relative(project,file),bytes:fs.statSync(file).size,...check},null,2));
}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});
