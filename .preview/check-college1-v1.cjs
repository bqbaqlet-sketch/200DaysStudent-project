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
const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},
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
evaluate(script);d.getElementById('start').style.display='none';
const button=d.getElementById('interact');
button.getBoundingClientRect=()=>({left:602,top:362,width:76,height:76});
const pointer=(type,id=7,x=640,y=400)=>{
 const event=new w.MouseEvent(type,{bubbles:true,clientX:x,clientY:y,button:0,detail:1});
 Object.defineProperty(event,'pointerId',{value:id});return event;
};
const key=(type,code='KeyE',repeat=false)=>new w.KeyboardEvent(type,{code,repeat,bubbles:true});
const update=()=>evaluate('updateInteraction(performance.now())');
const approach=()=>evaluate("C.position.set(-6.9,1.7,-7);feetY=0;yaw=Math.PI/2;pitch=0;C.rotation.set(0,yaw,0);updateInteraction(performance.now())");
assert.equal(evaluate('getInteractionTarget()'),null);
approach();assert.equal(evaluate('hit(C.position.x,C.position.z)'),false);
assert.equal(evaluate('getInteractionTarget().action'),'enterCollege1');
assert.equal(button.dataset.mode,'hold');
assert.equal(button.querySelector('.interactionCaption').hidden,false);
assert.equal(button.querySelector('.interactionCaption').textContent,'Войти');
assert(button.title.includes('Удерживайте E'));
// A quick key press and a quick pointer tap must never enter.
w.dispatchEvent(key('keydown'));clock+=120;w.dispatchEvent(key('keyup'));update();
assert.equal(evaluate('currentLocation'),'college');
button.dispatchEvent(pointer('pointerdown'));clock+=100;button.dispatchEvent(pointer('pointerup'));
button.dispatchEvent(new w.MouseEvent('click',{bubbles:true,detail:1}));
assert.equal(evaluate('currentLocation'),'college');
// Holding is cancelled by moving away, pointer drift, cancellation and focus loss.
w.dispatchEvent(key('keydown'));clock+=150;evaluate('C.position.z=-3;updateInteraction(performance.now())');clock+=1000;update();w.dispatchEvent(key('keyup'));
assert.equal(evaluate('currentLocation'),'college');assert.equal(evaluate('interaction.holding'),false);
approach();button.dispatchEvent(pointer('pointerdown'));button.dispatchEvent(pointer('pointermove',7,760,400));clock+=1000;update();
assert.equal(evaluate('currentLocation'),'college');
button.dispatchEvent(pointer('pointerdown'));clock+=100;button.dispatchEvent(pointer('pointercancel'));clock+=1000;update();
assert.equal(evaluate('currentLocation'),'college');
w.dispatchEvent(key('keydown'));clock+=100;w.dispatchEvent(new w.Event('blur'));clock+=1000;update();assert.equal(evaluate('currentLocation'),'college');
// No prompt at another facade, behind the wall, in flight, or outside the entry zone.
for(const [x,y,z] of [[-6.9,1.7,-3],[-10,1.7,-7],[0,1.7,0],[-6.9,8,-7]]){
 evaluate(`C.position.set(${x},${y},${z});updateInteraction(performance.now())`);assert.equal(evaluate('getInteractionTarget()'),null);
}
approach();evaluate('fly=1');assert.equal(evaluate('getInteractionTarget()'),null);evaluate('fly=0');update();
// Complete an actual E hold; repeats do not accelerate it and the ring shows progress.
w.dispatchEvent(key('keydown'));clock+=450;update();
assert.equal(evaluate('currentLocation'),'college');assert.equal(button.dataset.holding,'true');
assert(Math.abs(Number(button.querySelector('.holdRing circle').getAttribute('stroke-dashoffset'))-103.675)<.01);
w.dispatchEvent(key('keydown','KeyE',true));clock+=449;update();assert.equal(evaluate('currentLocation'),'college');
clock+=2;update();assert.equal(evaluate('currentLocation'),'college1');w.dispatchEvent(key('keyup'));
assert.equal(evaluate('fly'),0);assert.equal(d.getElementById('fly').style.display,'none');
evaluate('setFly(true)');assert.equal(evaluate('fly'),0);
assert.equal(d.getElementById('location').textContent,'На улицу →');
const college=evaluate('activeWorld');
assert.equal(college.scene.userData.stage,'vestibule-and-turnstiles');
assert.equal(college.scene.userData.turnstilesOpen,true);
assert.equal(college.scene.userData.waitingBenches,2);
assert.equal(evaluate('getInteractionTarget()'),null,'Spawn must be away from the exit prompt');
assert.equal(evaluate('hit(C.position.x,C.position.z)'),false);
assert(college.roomAt(0,1).includes('Прихожая'));assert(college.roomAt(0,5).includes('турникеты'));
assert.equal(college.groundAt(0,2.4,0),0);assert.equal(college.groundAt(0,9,0),null);
assert.equal(college.groundAt(0,5,3),null,'Other floors are outside this stage');
for(const b of college.colliders){assert(b.every(Number.isFinite));assert(b[0]<=b[2]&&b[1]<=b[3]&&b[4]<=b[5]);}
let meshCount=0,instances=0;
college.scene.traverse(mesh=>{
 if(!mesh.isMesh)return;meshCount++;
 assert(Array.from(mesh.geometry.attributes.position.array).every(Number.isFinite));
 if(mesh.isInstancedMesh){instances+=mesh.count;assert(Array.from(mesh.instanceMatrix.array).every(Number.isFinite));}
});
// Walk through the open internal door with the game's real collision code.
evaluate(`for(let z=1.65;z<=4.08;z+=.04)if(!walkInterior(0,z))throw Error('Inner door blocked at '+z)`);
for(const x of [-.75,.75]){
 evaluate(`C.position.set(0,1.7,4.08);feetY=0;
  for(let a=0;a<=.75;a+=.03)if(!walkInterior(a*Math.sign(${x}),4.08))throw Error('Lane approach blocked');
  for(let z=4.08;z<=6.9;z+=.04)if(!walkInterior(${x},z))throw Error('Open turnstile lane blocked at '+z)`);
}
assert.equal(evaluate('hit(0,5.4,0)'),true,'Central pedestal must remain solid');
assert.equal(evaluate('hit(1.35,5.4,0)'),true,'Steel barrier must remain solid');
assert.equal(evaluate('hit(0,8.2,0)'),true,'Future rooms must be closed off');
// Explore the actual floor with player radius .35, including the side of the trophy cabinet.
const hit=(x,z)=>college.colliders.some(b=>x>b[0]-.35&&x<b[2]+.35&&z>b[1]-.35&&z<b[3]+.35&&1.65>b[4]+.02&&0<b[5]-.02);
const step=.05,grid=(x,z)=>[Math.round(x/step),Math.round(z/step)],cell=(a,b)=>a+','+b;
const first=grid(college.spawn[0],college.spawn[2]),queue=[first],seen=new Set([cell(...first)]);
for(let i=0;i<queue.length;i++){
 const [a,b]=queue[i];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const aa=a+dx,bb=b+dz,k=cell(aa,bb),x=aa*step,z=bb*step;
  if(!seen.has(k)&&college.groundAt(x,z,0)!==null&&!hit(x,z)){seen.add(k);queue.push([aa,bb]);}
 }
}
const reachable={};
for(const [name,x,z] of [['leftBench',2.45,1.15],['rightBench',-2.45,1.15],['innerDoor',0,2.4],['leftLane',.75,5.4],['rightLane',-.75,5.4],['backHall',0,7.3],['trophyCabinet',1.95,7.1],['reception',-1.1,3.35]]){
 reachable[name]=seen.has(cell(...grid(x,z)));assert(reachable[name],name+' is unreachable');
}
// Exit at the front returns outside the same building, clear of its wall.
evaluate('C.position.set(0,1.7,.7);updateInteraction(performance.now())');
assert.equal(evaluate('getInteractionTarget().action'),'exitCollege1');
assert.equal(button.querySelector('.interactionCaption').textContent,'Выйти');button.click();
assert.equal(evaluate('currentLocation'),'college');assert.equal(evaluate('hit(C.position.x,C.position.z)'),false);
assert.equal(evaluate('C.position.z'),-7);assert.equal(evaluate('getInteractionTarget().action'),'enterCollege1');
// The touch/button hold behaves the same and its release cannot bounce back outside.
clock+=1000;button.dispatchEvent(pointer('pointerdown'));clock+=901;update();
assert.equal(evaluate('currentLocation'),'college1');button.dispatchEvent(pointer('pointerup'));
button.dispatchEvent(new w.MouseEvent('click',{bubbles:true,detail:1}));
assert.equal(evaluate('currentLocation'),'college1');assert.equal(evaluate('activeWorld.scene===locations.college1.scene'),true);
// Top-right exit and L both restore a safe outdoor position.
d.getElementById('location').click();assert.equal(evaluate('currentLocation'),'college');
w.dispatchEvent(key('keydown'));clock+=901;w.dispatchEvent(key('keyup'));assert.equal(evaluate('currentLocation'),'college1');
w.dispatchEvent(key('keydown','KeyL'));assert.equal(evaluate('currentLocation'),'college');
assert.equal(evaluate('hit(C.position.x,C.position.z)'),false);
const report={syntax:'passed',entryAtBuilding1:true,holdMilliseconds:900,quickTapIgnored:true,holdCancel:'passed',keyboardAndPointer:'passed',
 progressRing:'passed',openTurnstileLanes:2,reachability:reachable,visibleMeshes:meshCount,batchedParts:instances,finiteGeometry:true,
 exitReturnsToSameDoor:true,sceneReused:true,onlyVestibuleAndLobby:true,graphicsUsed:false};
fs.writeFileSync('.preview/college1-checks.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));w.close();
