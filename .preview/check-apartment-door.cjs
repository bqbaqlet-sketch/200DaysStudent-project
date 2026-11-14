const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dep = name => require(name);
const {JSDOM}=dep('jsdom'),realThree=dep('three');
const file=fs.readdirSync('.').find(f => f !== 'index.html' && f.endsWith('.html')),html=fs.readFileSync(file,'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const dom=new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document,context=dom.getInternalVMContext();let clock=1000;
Object.defineProperty(w.performance,'now',{value:()=>clock});
Object.defineProperty(d.documentElement,'clientWidth',{value:1280});
Object.defineProperty(d.documentElement,'clientHeight',{value:800});
w.requestAnimationFrame=()=>0;
const ctx=new Proxy({createImageData:(width,height)=>({width,height,data:new Uint8ClampedArray(width*height*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},
 {get:(target,key)=>target[key]||(()=>{})});
w.HTMLCanvasElement.prototype.getContext=()=>ctx;
w.HTMLCanvasElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:1280,height:800});
class Renderer{
 constructor(){this.domElement=d.createElement('canvas');this.info={render:{calls:0,triangles:0}}}
 setPixelRatio(){} setSize(width,height){this.domElement.width=width;this.domElement.height=height}
 render(scene,camera){scene.updateMatrixWorld(true);camera.updateMatrixWorld(true)}
}
const sounds=[];
class Audio{
 constructor(){this.sampleRate=8000;this.currentTime=1;this.state='running';this.destination={}}
 createBuffer(channels,length){return{getChannelData:()=>new Float32Array(length)}}
 createBufferSource(){return{connect(){},disconnect(){},start(at){sounds.push(at)}}}
 createBiquadFilter(){return{frequency:{value:0},connect(){},disconnect(){}}}
 createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}
}
w.THREE={...realThree,WebGLRenderer:Renderer};w.AudioContext=Audio;
const evaluate=code=>vm.runInContext(code,context);
evaluate(script);evaluate("mainMenu.start('tester')");
const events=[];w.addEventListener('game:door-knock',e=>events.push({...e.detail}));
const button=d.getElementById('interact');
button.getBoundingClientRect=()=>({left:602,top:362,width:76,height:76});
const pointer=(type,id=7,x=640,y=400)=>{
 const event=new w.MouseEvent(type,{bubbles:true,clientX:x,clientY:y,button:0,detail:1});
 Object.defineProperty(event,'pointerId',{value:id});return event;
};
const keyEvent=(type,code,repeat=false)=>new w.KeyboardEvent(type,{code,repeat,bubbles:true});
const nearDoor=()=>evaluate('C.position.set(-2.05,4.7,1.32);feetY=3;yaw=Math.PI/2;pitch=0;C.rotation.set(0,yaw,0);updateInteraction(performance.now())');
const keyHold=()=>{
 w.dispatchEvent(keyEvent('keydown','KeyE'));clock+=540;evaluate('updateInteraction(performance.now())');
 w.dispatchEvent(keyEvent('keyup','KeyE'));assert.equal(d.getElementById('doorActions').hidden,false);
};
evaluate("switchLocation('home');C.position.set(29.6,1.7,2);updateInteraction(performance.now())");
assert.equal(evaluate('getInteractionTarget().allowed'),false);
button.click();assert.equal(evaluate('currentLocation'),'home');
evaluate('C.position.set(14.8,1.7,2.8);updateInteraction(performance.now())');
assert.equal(button.dataset.direction,'enter');assert(button.querySelector('svg path').getAttribute('d').includes('M14 5h13'));
button.dispatchEvent(pointer('pointerdown'));assert.equal(evaluate('currentLocation'),'entrance4','Entrance icon must work on a tap');
button.dispatchEvent(pointer('pointerup'));
evaluate(`C.position.set(-1.75,1.7,.4);feetY=0;
 for(let z=.4;z>=-3.8;z-=.08)if(!walkInterior(-1.75,z))throw Error('First flight blocked');
 for(let x=-1.75;x<=1.75;x+=.08)if(!walkInterior(x,-3.8))throw Error('Landing blocked');
 for(let z=-3.8;z<=1.32;z+=.08)if(!walkInterior(1.75,z))throw Error('Second flight blocked');
 for(let x=1.75;x>=-2.05;x-=.08)if(!walkInterior(x,1.32))throw Error('Door approach blocked');
 C.position.y=feetY+1.7;`);
assert.equal(evaluate('feetY'),3);assert.equal(evaluate('getInteractionTarget().action'),'apartment');
evaluate('C.position.x=2.05');assert.equal(evaluate('getInteractionTarget()'),null);
evaluate('C.position.x=-2.05;feetY=0');assert.equal(evaluate('getInteractionTarget()'),null);nearDoor();
assert.equal(d.getElementById('doorActions').querySelector('[role="dialog"]'),null,'Door choices must not be a dialog');
assert.equal(d.getElementById('doorMenu'),null);assert.equal(d.getElementById('knockHand'),null);
// A quick tap must not open the apartment choices.
button.dispatchEvent(pointer('pointerdown'));clock+=100;button.dispatchEvent(pointer('pointerup'));
button.dispatchEvent(new w.MouseEvent('click',{bubbles:true,detail:1}));
assert.equal(d.getElementById('doorActions').hidden,true);
// Holding replaces the circle with two icon actions; release does not select either action.
button.dispatchEvent(pointer('pointerdown'));clock+=540;evaluate('updateInteraction(performance.now())');
assert.equal(d.getElementById('doorActions').hidden,false);
assert.equal(w.getComputedStyle(button).display,'none');assert.equal(button.getAttribute('aria-expanded'),'true');
assert.equal(d.querySelectorAll('#doorActions button svg').length,2);
assert.equal(d.getElementById('knockDoor').getAttribute('aria-label'),'Постучать');
assert.equal(d.getElementById('enterApartment').getAttribute('aria-label'),'Зайти');
d.getElementById('enterApartment').click();assert.equal(evaluate('currentLocation'),'entrance4');
w.dispatchEvent(pointer('pointerup'));d.getElementById('enterApartment').click();assert.equal(evaluate('currentLocation'),'entrance4','Release must not accidentally enter');
clock+=180;d.getElementById('knockDoor').click();assert.equal(sounds.length,3);assert.equal(events.length,1);
assert.equal(events[0].doorId,'apartment-2-right');assert.equal(evaluate('currentLocation'),'entrance4');
assert.equal(d.getElementById('doorActions').hidden,true);assert.equal(evaluate('storyState.apartmentDoor.knocks'),1);
clock+=1000;nearDoor();keyHold();
w.dispatchEvent(keyEvent('keydown','KeyE',true));assert.equal(d.getElementById('doorActions').hidden,false,'Key autorepeat must not close the actions');
w.dispatchEvent(keyEvent('keydown','Escape'));assert.equal(d.getElementById('doorActions').hidden,true);
// A cancelled pointer hold and a hold that moves away from the door must not open choices.
button.dispatchEvent(pointer('pointerdown'));clock+=100;button.dispatchEvent(pointer('pointercancel'));clock+=600;evaluate('updateInteraction(performance.now())');
assert.equal(d.getElementById('doorActions').hidden,true);
button.dispatchEvent(pointer('pointerdown'));button.dispatchEvent(pointer('pointermove',7,760,400));clock+=600;evaluate('updateInteraction(performance.now())');
assert.equal(d.getElementById('doorActions').hidden,true);
keyHold();evaluate('C.position.z=-3.8;updateInteraction(performance.now())');assert.equal(d.getElementById('doorActions').hidden,true);
nearDoor();keyHold();w.dispatchEvent(keyEvent('keydown','Digit2'));
assert.equal(evaluate('currentLocation'),'apartment');assert.equal(evaluate('feetY'),0);
assert.equal(d.getElementById('location').textContent,'В подъезд →');assert.equal(evaluate('hit(C.position.x,C.position.z)'),false);
const apartment=evaluate('activeWorld'),scale=apartment.scene.userData.floorScale;
const bathroom=apartment.bathroomDoor,portalZ=bathroom.hinge.z+bathroom.width/2;
assert(bathroom,'Bathroom must have an animated door');
assert(bathroom.intersects(bathroom.hinge.x,portalZ,0),'Closed leaf must block the doorway');
evaluate(`C.position.set(${bathroom.hinge.x+.8},1.7,${portalZ});feetY=0;updateInteraction(performance.now())`);
assert.equal(evaluate('getInteractionTarget().action'),'bathroomDoor');
assert(button.getAttribute('aria-label').includes('Открыть туалет'));
button.dispatchEvent(pointer('pointerdown'));button.dispatchEvent(pointer('pointerup'));
button.dispatchEvent(new w.MouseEvent('click',{bubbles:true,detail:1}));
assert.equal(bathroom.target,1,'A pointer gesture must toggle once');assert.equal(bathroom.angle,0,'Opening must animate');
for(let i=0;i<6;i++)apartment.update(.05,{x:bathroom.hinge.x+.8,z:portalZ,feet:0});
assert(bathroom.progress>0&&bathroom.progress<1);assert(bathroom.angle<0&&bathroom.angle>-Math.PI/2);
for(let i=0;i<10;i++)apartment.update(.05,{x:bathroom.hinge.x+.8,z:portalZ,feet:0});
assert.equal(bathroom.progress,1);assert(!bathroom.intersects(bathroom.hinge.x,portalZ,0));
evaluate(`for(let x=${bathroom.hinge.x+.8};x>=${bathroom.hinge.x-.7};x-=.05)if(!walkInterior(x,${portalZ}))throw Error('Open bathroom doorway blocked')`);
// Closing detects the player in the swing path and reopens instead of passing through them.
const obstructingPlayer={x:bathroom.hinge.x-.7,z:portalZ,feet:0};bathroom.toggle(obstructingPlayer);
for(let i=0;i<30;i++)apartment.update(.05,obstructingPlayer);
assert.equal(bathroom.target,1);assert.equal(bathroom.progress,1);
const insidePlayer={x:-2.65,z:portalZ+.08,feet:0};
evaluate(`C.position.set(${insidePlayer.x},1.7,${insidePlayer.z});updateInteraction(performance.now())`);
assert.equal(evaluate('getInteractionTarget().action'),'bathroomDoor');button.click();
for(let i=0;i<16;i++)apartment.update(.05,insidePlayer);
assert.equal(bathroom.progress,0);assert(bathroom.intersects(bathroom.hinge.x,portalZ,0));
w.dispatchEvent(keyEvent('keydown','KeyE'));w.dispatchEvent(keyEvent('keyup','KeyE'));
for(let i=0;i<16;i++)apartment.update(.05,insidePlayer);
assert.equal(bathroom.progress,1);assert.equal(bathroom.direction,1,'Door must open away from an inside player');
apartment.scene.updateMatrixWorld(true);
const plantLeaves=[],petioleEnds=[];
apartment.scene.traverse(mesh=>{
 if(mesh.name==='plant-leaf')plantLeaves.push(mesh);
 if(!mesh.isInstancedMesh||mesh.material.color.getHex()!==0x526d53)return;
 const local=new realThree.Matrix4(),world=new realThree.Matrix4(),pos=new realThree.Vector3(),axis=new realThree.Vector3();
 for(let i=0;i<mesh.count;i++){
  mesh.getMatrixAt(i,local);world.multiplyMatrices(mesh.matrixWorld,local);pos.setFromMatrixPosition(world);axis.setFromMatrixColumn(world,1);
  if(axis.length()>.04&&axis.length()<.09){petioleEnds.push(pos.clone().addScaledVector(axis,.5),pos.clone().addScaledVector(axis,-.5))}
 }
});
assert.equal(plantLeaves.length,12);
const kitchenPlantBounds=new realThree.Box3();
for(const leaf of plantLeaves){
 const origin=new realThree.Vector3().setFromMatrixPosition(leaf.matrixWorld);
 assert(petioleEnds.some(p=>p.distanceTo(origin)<1e-5),'Leaves must connect to their stems');
 if(origin.x>0&&origin.z>0){leaf.geometry.computeBoundingBox();kitchenPlantBounds.union(leaf.geometry.boundingBox.clone().applyMatrix4(leaf.matrixWorld))}
}
const boxes=[],localMatrix=new realThree.Matrix4(),worldMatrix=new realThree.Matrix4();
for(const mesh of apartment.scene.children){
 if(!mesh.isInstancedMesh)continue;
 mesh.geometry.computeBoundingBox();
 for(let i=0;i<mesh.count;i++){
  mesh.getMatrixAt(i,localMatrix);worldMatrix.multiplyMatrices(mesh.matrixWorld,localMatrix);
  boxes.push(mesh.geometry.boundingBox.clone().applyMatrix4(worldMatrix));
 }
}
const near=(a,b)=>Math.abs(a-b)<1e-4;
const table=boxes.find(b=>near(b.min.y,.72)&&near(b.max.y,.79)&&near(b.max.x-b.min.x,.91)&&near(b.max.z-b.min.z,.72));
const sill=boxes.find(b=>near(b.min.y,.7)&&near(b.max.y,.77)&&b.max.x>3.1*scale&&b.max.z-b.min.z>2);
const radiator=boxes.find(b=>near(b.min.y,.1)&&near(b.max.y,.65)&&b.min.x>4&&b.max.z-b.min.z>1.5);
assert(table&&sill&&radiator,'Kitchen table, windowsill and radiator must exist');
assert(table.max.x<sill.min.x-.3,'Table must be clear of the windowsill');
assert(table.max.x<radiator.min.x-.3,'Table must be clear of the radiator');
const tableWindowClearance=Number((sill.min.x-table.max.x).toFixed(3));
assert(!kitchenPlantBounds.intersectsBox(table)&&!kitchenPlantBounds.intersectsBox(sill)&&!kitchenPlantBounds.intersectsBox(radiator),'Plant must clear the table, windowsill and radiator');
const kitchenArea=apartment.areas[3];
assert.equal(apartment.roomAt(3.5*scale,1.3*scale),'Кухня','Expanded strip must belong to the kitchen');
assert(kitchenArea[2]-kitchenArea[0]>4.2,'Kitchen must be wider');
const appliances=apartment.scene.userData.furniture.filter(f=>f.kind==='refrigerator'||f.kind==='freezer');
assert.equal(appliances.length,2);assert(appliances.every(f=>f.room==='Кухня'&&apartment.roomAt(f.position[0],f.position[2])==='Кухня'));
const fridgeBody=boxes.find(b=>near(b.min.y,0)&&near(b.max.y,1.76)&&near(b.max.x-b.min.x,.56)&&near(b.max.z-b.min.z,.62));
const freezerBody=boxes.find(b=>near(b.min.y,0)&&near(b.max.y,.84)&&near(b.max.x-b.min.x,.56)&&near(b.max.z-b.min.z,.54));
assert(fridgeBody&&freezerBody,'Both appliance bodies must exist');
assert(!fridgeBody.intersectsBox(freezerBody));
for(const appliance of [fridgeBody,freezerBody]){
 assert(appliance.min.x>kitchenArea[0]&&appliance.max.x<kitchenArea[2]&&appliance.min.z>kitchenArea[1]&&appliance.max.z<kitchenArea[3]);
 assert(!appliance.intersectsBox(table)&&!appliance.intersectsBox(sill)&&!appliance.intersectsBox(radiator)&&!appliance.intersectsBox(kitchenPlantBounds));
}
for(const chair of apartment.scene.userData.furniture.filter(f=>f.kind==='kitchenChair')){
 const chairBox=new realThree.Box3(new realThree.Vector3(chair.position[0]-.24,0,chair.position[2]-.23),new realThree.Vector3(chair.position[0]+.24,.52,chair.position[2]+.23));
 assert(!chairBox.intersectsBox(fridgeBody)&&!chairBox.intersectsBox(freezerBody),'Appliances must not intersect the chairs');
}
assert.equal(scale,1.55);assert.equal(apartment.scene.scale.y,1);assert.equal(apartment.scene.userData.designVersion,2);
assert.equal(apartment.scene.userData.normalSizeFurniture,true);assert(apartment.scene.userData.furniture.some(f=>f.kind==='bed'));
assert.equal(apartment.scene.userData.kitchenChairCount,2);
assert.equal(apartment.scene.userData.furniture.filter(f=>f.kind==='kitchenChair'&&f.position[1]===0&&!f.upsideDown).length,2);
for(const mesh of apartment.scene.children){
 if(mesh.isInstancedMesh)assert(Array.from(mesh.instanceMatrix.array).every(Number.isFinite));
 if(mesh.geometry)assert(Array.from(mesh.geometry.attributes.position.array).every(Number.isFinite));
}
for(const b of apartment.colliders)assert(b.every(Number.isFinite));
const hit=(x,z)=>apartment.colliders.some(b=>x>b[0]-.35&&x<b[2]+.35&&z>b[1]-.35&&z<b[3]+.35&&1.65>b[4]+.02&&0<b[5]-.02)||apartment.dynamicHit(x,z,0);
const step=.06,grid=(x,z)=>[Math.round(x/step),Math.round(z/step)],key=(a,b)=>a+','+b;
const first=grid(apartment.spawn[0],apartment.spawn[2]),queue=[first],seen=new Set([key(...first)]);
for(let i=0;i<queue.length;i++){
 const [a,b]=queue[i];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const aa=a+dx,bb=b+dz,k=key(aa,bb),x=aa*step,z=bb*step;
  if(!seen.has(k)&&apartment.groundAt(x,z,0)!==null&&!hit(x,z)){seen.add(k);queue.push([aa,bb])}
 }
}
const reachable={};
for(const [name,x,z] of [['living',-1.65,-3.8],['bedroom',1.9,-3.1],['kitchen',1.25,1.15],['kitchenWindow',2.72,1.03],['bathroom',-1.3,1.18]]){
 const [a,b]=grid(x*scale,z*scale);reachable[name]=seen.has(key(a,b));assert(reachable[name],name+' is unreachable');
}
for(const [name,x,z] of [['fridgeFront',3.31*scale,1.25],['freezerFront',2.9*scale,3.05],['clearedHall',-.4,.3]]){
 const [a,b]=grid(x,z);reachable[name]=seen.has(key(a,b));assert(reachable[name],name+' is blocked');
}
assert(!boxes.some(b=>b.min.x<0&&near(b.min.y,0)&&(near(b.max.y,1.76)||near(b.max.y,.84))),'Old appliance bodies must be removed from the hall');
evaluate('C.position.set(...activeWorld.spawn);updateInteraction(performance.now())');
assert.equal(button.dataset.direction,'exit');button.click();assert.equal(evaluate('currentLocation'),'entrance4');assert.equal(evaluate('feetY'),3);
nearDoor();keyHold();d.getElementById('enterApartment').click();assert.equal(evaluate('currentLocation'),'apartment');
assert.equal(evaluate('activeWorld.scene===locations.apartment.scene'),true);
evaluate('C.rotation.set(0,Math.PI,0);yaw=Math.PI;pitch=0;');
d.querySelector('canvas').dispatchEvent(pointer('pointerdown'));d.querySelector('canvas').dispatchEvent(pointer('pointerup'));
assert.equal(evaluate('currentLocation'),'entrance4');assert.equal(evaluate('feetY'),3);
assert.equal(evaluate('hit(C.position.x,C.position.z)'),false);
const report={syntax:'passed',entranceDoorIcon:'passed',tapEntrance:'passed',stairsAndRightDoor:'passed',
 holdToReveal:'passed',quickTapIgnored:true,releaseDoesNotChoose:true,noDialog:true,inlineIconActions:2,
 pointerCancel:'passed',keyboardAndAutorepeat:'passed',closesOutOfRange:true,
 knock:{audioImpacts:sounds.length,storyEvents:events.length,handOverlay:false},
 floorScale:scale,newInterior:true,normalSizeFurniture:true,roomsReachable:reachable,
 kitchenChairsOnFloor:2,tableWindowClearance,tableRadiatorOverlap:false,kitchenWidth: Number((kitchenArea[2]-kitchenArea[0]).toFixed(3)),appliancesInKitchen:2,applianceOverlaps:false,
 plant:{leavesConnected:true,furnitureOverlap:false},bathroomDoor:{opensAndCloses:true,animated:true,blocksWhenClosed:true,worksBothSides:true,playerObstructionReopens:true},
 enterAndReturn:'passed',apartmentSceneReused:true,graphicsUsed:false};
fs.writeFileSync('.preview/apartment-door-checks.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));w.close();
