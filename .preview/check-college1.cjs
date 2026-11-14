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
const layout=college.scene.userData;
assert.equal(layout.layoutVersion,23);
assert(layout.hallWidth>10.8&&layout.hallDepth>7.18,'The hall must be larger than the old reconstruction');
assert.equal(layout.normalSizeFurniture,true,'Enlarging the space must not stretch furniture');
assert.equal(layout.stairHall.lowerInteriorDeferred,false);
assert.equal(layout.stairHall.upperInteriorDeferred,false);
assert.equal(layout.stairHall.stepsPerFlight,11);
assert.equal(layout.stairHall.stairsSide,'right');
assert(layout.stairHall.width>5.35&&layout.stairHall.depth>6.35,'This building part must be larger');
const forbiddenLabels=[];college.scene.traverse(m=>{if(/гардероб/i.test(m.userData.text||''))forbiddenLabels.push(m)});
assert.equal(forbiddenLabels.length,0,'No wardrobe label should appear in the scene');
const fixture=kind=>layout.fixtures.find(f=>f.kind===kind);
assert.equal(fixture('stairForwardPassage').open,true);
assert(Math.abs(fixture('stairForwardPassage').x-layout.stairHall.entry.x)<1e-5,'The continuation must be straight ahead');
assert.equal(fixture('stairEmergencyExit').wall,'entry-wall');
assert(Math.abs(fixture('stairEmergencyExit').z-layout.stairHall.entry.z)<.1,'Emergency exit must be beside the entry on the marked wall');
assert(fixture('stairEmergencyExit').x>layout.stairHall.entry.x);
assert.equal(layout.stairHall.flightTurnDegrees,90);
assert.equal(fixture('stairUpFlight').axis,'x');
assert.equal(fixture('stairUpperFlight').axis,'z');
assert.equal(fixture('stairUpperFlight').turnAtTop,'right');
assert.equal(layout.stairHall.continuationDeferred,false);
assert.equal(fixture('continuationHall').turnFromStairs,'right');
assert.equal(fixture('continuationEndExit').closed,true);
assert.equal(fixture('continuationEndExit').interactive,false);
assert.equal(fixture('continuationEndExit').leaves,2);
assert.equal(layout.fixtures.filter(f=>f.kind==='corridorNoticeBoard').length,7);
assert.equal(layout.classroomDoors.filter(d=>d.wing==='continuation'&&d.closed).length,5);
assert.equal(fixture('continuationPlantNiche').recessed,true);
assert(fixture('continuationPlantNiche').z<fixture('continuationHall').z,'Niche must be opposite the stair passage');

assert.equal(fixture('stairEmergencyExit').level,0);
assert(Math.abs(fixture('stairEmergencyExit').x-20.1)<1e-6);
assert(Math.abs(fixture('stairEmergencyExit').z-7.815)<1e-6,'The exit must remain on the same entry wall');
assert.equal(fixture('stairEmergencyExit').movedLeft,1.6);
const railAnchors=layout.fixtures.filter(f=>f.kind==='stairRailAnchor');
assert(railAnchors.length>70);
for(const anchor of railAnchors){
 const floor=college.groundAt(anchor.x,anchor.z,anchor.level);
 assert(floor!==null&&Math.abs(floor-anchor.level)<1e-5,'Rail base must rest on an actual tread or landing: '+JSON.stringify(anchor));
}
assert.equal(layout.fixtures.filter(f=>f.kind==='certificateTrophy'&&f.supported&&f.shelfLevel===f.baseLevel).length,4);
assert.equal(layout.fixtures.filter(f=>f.kind==='secondStairWindowPalm'&&f.shortGreenStems).length,2);
assert.equal(fixture('stairContinuationPortal').continuousLining,true);
const upFlight=fixture('stairUpFlight');
assert(Math.abs(upFlight.z-.825)<1e-6,'The widened flight must remain against the marked wall');
assert(Math.abs(upFlight.depth-1.85)<1e-6);assert(Math.abs(fixture('stairDownFlight').depth-1.85)<1e-6);
const wallEdge=layout.stairHall.origin.z-7.96;
const treadEdge=upFlight.z-upFlight.depth/2;
assert(Math.abs(treadEdge-wallEdge-.01)<1e-6,'The treads must meet the wood wall with only fitting clearance');
assert(layout.stairSurfaces.some(s=>Math.abs(s[1]+.1)<1e-5&&s[4]>.15),'Actual tread surfaces must move with the geometry');

assert(fixture('reception').x<-3&&fixture('reception').z<5,'Reception belongs to the entry wall, on the right when entering');
assert(fixture('waterCooler').x>0&&fixture('waterCooler').z<4,'Cooler belongs under the window opposite reception');
assert(fixture('certificateCabinet').x>5.4&&fixture('certificateCabinet').depth>2.8,'Certificate cabinet must run along the left side wall');
assert(fixture('television').z>10&&fixture('informationKiosk').z>9,'TV and kiosk belong to the wall opposite the entry');
assert(fixture('mirror').z>10&&fixture('mirror').x<1.35&&fixture('mirror').x>-2.08,'Mirror must be between the two office doors');
assert(layout.fixtures.filter(f=>f.kind==='entryWallWindow').length===2);
assert(layout.fixtures.filter(f=>f.kind==='securityRail').every(f=>f.z<5.7),'Rails must not form long queues into the back of the hall');
const securityRails=layout.fixtures.filter(f=>f.kind==='securityRail');
assert.equal(securityRails.length,3,'Only a compact L section and a short rail beside the desk are needed');
assert(securityRails.every(f=>Math.max(f.width,f.depth)<2.2),'No barrier may span the enlarged hall');
assert(securityRails.filter(f=>f.x>0).every(f=>f.x+f.width/2<3),'Cabinet-side barrier must stop well before the cooler and cabinet');
assert.equal(fixture('reception').shape,'L');assert.equal(fixture('reception').hollow,true);
assert.equal(fixture('reception').openSide,'hall');
assert.equal(layout.fixtures.filter(f=>f.kind==='guardChair').length,2);
assert.equal(layout.fixtures.filter(f=>f.kind==='guardMonitor').length,2);
assert.equal(fixture('guardWorktop').height,.77,'Work desk must sit below the privacy screen');
assert.equal(fixture('waterCooler').taps,2);
assert(fixture('rightCorridorPortal').x<-6&&fixture('rightCorridorPortal').open,'Portal must be on the right side wall');
assert(Math.abs(fixture('rightCorridorPortal').z-8.975)<1e-5);
assert(fixture('rightCorridorPortal').depth>2.2&&fixture('rightCorridorPortal').width<.3,'Portal must face sideways');
assert.equal(layout.corridorAxis,'x');
assert.equal(college.roomAt(11,8.975),'Корпус 1 · Левый коридор');
assert.equal(college.groundAt(11,8.975,0),0);
const leftPortal=fixture('leftCorridorPortal'),rightPortal=fixture('rightCorridorPortal');
assert(leftPortal.open&&leftPortal.x>6&&leftPortal.depth>2.2&&leftPortal.width<.3);
assert(Math.abs(leftPortal.z-rightPortal.z)<1e-5,'Portals must share the same axis across the hall');
assert(Math.abs(leftPortal.x+rightPortal.x)<1e-5,'Portals must be opposite on the two side walls');
assert(fixture('certificateCabinet').z+fixture('certificateCabinet').depth/2<leftPortal.z-leftPortal.depth/2,'Cabinet must end before the left opening');
assert.equal(fixture('leftPlantDisplay').shelves,9);
assert.equal(fixture('leftPlantDisplay').pots,11);
assert(layout.classroomDoors.some(d=>d.number==='106')&&layout.classroomDoors.some(d=>d.number==='107'));
assert.equal(layout.classroomDoors.length,44);
const brands=[];college.scene.traverse(m=>{if(m.name.startsWith('office-brand-'))brands.push(m)});
assert.equal(brands.length,44);assert(brands.every(m=>m.userData.text==='BQFQ'&&m.material.map),'All visible office labels must say BQFQ');
assert(layout.classroomDoors.every(door=>door.brand==='BQFQ'));
assert.equal(college.groundAt(-11,8.975,0),0);assert.equal(college.groundAt(-4.275,16,0),null);
assert.equal(evaluate('hit(-4.275,11.0,0)'),true,'The old opening must be closed');
assert.equal(college.roomAt(-11,8.975),'Корпус 1 · Правый коридор');
assert.equal(college.scene.userData.stage,'entrance-corridors-and-stairs');
assert.equal(college.scene.userData.turnstilesOpen,true);
assert.equal(college.scene.userData.waitingBenches,2);
assert.equal(evaluate('getInteractionTarget()'),null,'Spawn must be away from the exit prompt');
assert.equal(evaluate('hit(C.position.x,C.position.z)'),false);
assert(college.roomAt(0,1).includes('Прихожая'));assert(college.roomAt(0,5).includes('турникеты'));
assert.equal(college.groundAt(0,2.4,0),0);assert.equal(college.groundAt(0,11.5,0),null);
assert.equal(college.groundAt(0,5,3),null,'Other floors are outside this stage');
for(const b of college.colliders){assert(b.every(Number.isFinite));assert(b[0]<=b[2]&&b[1]<=b[3]&&b[4]<=b[5]);}
let meshCount=0,instances=0;
college.scene.traverse(mesh=>{
 if(!mesh.isMesh)return;meshCount++;
 assert(Array.from(mesh.geometry.attributes.position.array).every(Number.isFinite));
 if(mesh.isInstancedMesh){instances+=mesh.count;assert(Array.from(mesh.instanceMatrix.array).every(Number.isFinite));}
});
// Walk through the open internal door with the game's real collision code.
evaluate(`for(let z=1.8;z<=4.08;z+=.04)if(!walkInterior(0,z))throw Error('Inner door blocked at '+z)`);
for(const x of [-.85,.85]){
 evaluate(`C.position.set(0,1.7,4.08);feetY=0;
  for(let a=0;a<=.85;a+=.03)if(!walkInterior(a*Math.sign(${x}),4.08))throw Error('Lane approach blocked');
  for(let z=4.08;z<=7.2;z+=.04)if(!walkInterior(${x},z))throw Error('Open turnstile lane blocked at '+z)`);
}
assert.equal(evaluate('hit(0,5.65,0)'),true,'Central pedestal must remain solid');
assert.equal(evaluate('hit(2.0,5.62,0)'),true,'Steel barrier must remain solid');
assert.equal(evaluate('hit(3.8,5.62,0)'),false,'Old barrier toward cabinet must be removed');
assert.equal(evaluate('hit(-5.4,4.0,0)'),false,'Inside of the old solid reception block must be open');
assert.equal(evaluate('hit(-3.44,4.5,0)'),true,'Thin privacy screen must remain solid');
evaluate(`C.position.set(4.4,1.7,6.5);feetY=0;
 for(let z=6.5;z>=4.8;z-=.03)if(!walkInterior(4.4,z))throw Error('Cooler bypass blocked');
 C.position.set(-5.4,1.7,6.5);
 for(let z=6.5;z>=3.95;z-=.03)if(!walkInterior(-5.4,z))throw Error('Open security post entrance blocked');`);
assert.equal(evaluate('hit(1.35,10.9,0)'),true,'Future rooms must be closed off');
// The hallway continues straight from the marked doorway; the stairs are on its right.
evaluate(`C.position.set(16.3,1.7,8.975);feetY=0;
 for(let z=8.975;z>=-2.8;z-=.025)if(!walkInterior(16.3,z))throw Error('Straight continuation blocked at '+z);`);
assert.equal(evaluate('zone(C.position.x,C.position.z)'),'Корпус 1 · Продолжение коридора');
// Walk the new right turn and the full photographed corridor with the real player body.
evaluate(`for(let z=-2.8;z>=-3;z-=.02)if(!walkInterior(16.3,z))throw Error('New corridor turn blocked');
 for(let x=16.3;x<=44.1;x+=.025)if(!walkInterior(x,-3))throw Error('Long continuation blocked at '+x);`);
assert(Math.abs(evaluate('feetY')-.12)<1e-6,'Exit threshold must be walkable');
assert.equal(evaluate('getInteractionTarget()'),null,'The terminal exit must stay closed without an enter action');
assert.equal(evaluate('hit(44.7,-3,.12)'),true,'The closed end door must block passage');
assert.equal(college.groundAt(44.9,-3,.12),null,'There is no playable area behind the closed exit');
evaluate(`for(let x=44.1;x>=16.3;x-=.025)if(!walkInterior(x,-3))throw Error('Return along new corridor blocked at '+x);
 for(let z=-3;z<=-2.8;z+=.02)if(!walkInterior(16.3,z))throw Error('Return to stair passage blocked');`);
assert(Math.abs(evaluate('feetY'))<1e-6);

evaluate(`for(let z=-2.8;z<=.825;z+=.025)if(!walkInterior(16.3,z))throw Error('Return from unchanged corridor blocked');
 for(let x=16.3;x<=21.2;x+=.025)if(!walkInterior(x,.825))throw Error('Transverse ascending flight blocked at '+x);`);
assert(Math.abs(evaluate('feetY')-1.87)<1e-5);
// Exercise the added tread width with the actual player body and collision rules.
for(const laneZ of [.405,1.245]){
 const x=18.8,foot=college.groundAt(x,laneZ,1.02);
 assert(foot!==null&&foot>.8&&foot<1.3,'Added tread width must carry the player');
 assert.equal(evaluate(`hit(${x},${laneZ},${foot})`),false,'Railings must leave the added width walkable');
}

// From the photographed landing: climb straight toward the wall, then turn right.
evaluate(`for(let x=21.2;x<=21.625;x+=.025)if(!walkInterior(x,.825))throw Error('Upper straight flight approach blocked');
 for(let z=.825;z<=6.875;z+=.025)if(!walkInterior(21.625,z))throw Error('Straight flight toward wall blocked at '+z);`);
assert(Math.abs(evaluate('feetY')-3.74)<1e-5);
assert.equal(evaluate('zone(C.position.x,C.position.z)'),'Корпус 1 · Площадка 2 этажа');
evaluate(`for(let x=21.625;x>=16.65;x-=.025)if(!walkInterior(x,6.875))throw Error('Right turn along the wall blocked at '+x);`);
assert(Math.abs(evaluate('feetY')-3.74)<1e-5);
// Explore and walk the upper floor independently of the ground floor underneath it.
assert.equal(layout.fixtures.filter(f=>f.kind==='upperLandingEmptyRack'&&f.empty).length,6);
assert.equal(layout.fixtures.filter(f=>f.kind==='upperWindowEmptyRack'&&f.empty).length,2);
assert.equal(layout.classroomDoors.filter(f=>f.wing==='upper-right').length,8);
assert.equal(layout.classroomDoors.filter(f=>f.wing==='upper-right'&&f.open).length,0);
assert(Math.abs(fixture('upperLeftPortal').x-fixture('upperRightPortal').x)<1e-5);
const upperStep=.06,upperGrid=(x,z)=>[Math.round(x/upperStep),Math.round(z/upperStep)];
const upperStart=upperGrid(16.65,6.875),upperKey=(a,b)=>a+','+b,upperQueue=[upperStart],upperParents=new Map([[upperKey(...upperStart),null]]);
const upperBlocked=(x,z)=>college.dynamicHit(x,z,3.74)||college.colliders.some(b=>x>b[0]-.35&&x<b[2]+.35&&z>b[1]-.35&&z<b[3]+.35&&5.39>b[4]+.02&&3.74<b[5]-.02);
for(let i=0;i<upperQueue.length;i++){
 const [a,b]=upperQueue[i];
 for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const aa=a+dx,bb=b+dz,k=upperKey(aa,bb),x=aa*upperStep,z=bb*upperStep;
  const y=college.groundAt(x,z,3.74);
  if(!upperParents.has(k)&&y!==null&&Math.abs(y-3.74)<1e-5&&!upperBlocked(x,z)){
   upperParents.set(k,[a,b]);upperQueue.push([aa,bb]);
  }
 }
}
for(const [name,x,z] of [['racks',15.15,3.8],['leftPortal',15.15,8.7],['rightPortal',15.15,-.8],['window',15.35,-3],['208',17.4,-3.5],['207',21,-2.5],['206',24.6,-2.2],['205',28.3,-3.8],['204',32,-3],['203',35.7,-3.8],['202',39.5,-3],['201',42.5,-3.8],['end',44.05,-3],['leftNearWindow',14.6,10.7],['left205',13.95,11.25],['left207',8.1,11.25],['left210',5.5,10.1],['left209',2.8,11.25],['left212',.2,10.1],['left211',-2.2,11.25],['left214',-4.6,10.1],['left213',-7.1,11.25],['left216',-11.8,10.1],['left215',-14.4,11.25],['leftFarWindow',-15.7,10.7],['leftFarStairPassage',-15.4,8.7]] ){
 const cell=upperGrid(x,z),key=upperKey(...cell);assert(upperParents.has(key),'Upper '+name+' is unreachable');
 const route=[];let c=cell;
 while(c){route.push([c[0]*upperStep,c[1]*upperStep]);c=upperParents.get(upperKey(...c));}
 route.reverse();
 evaluate(`for(const [x,z] of ${JSON.stringify(route)})if(!walkInterior(x,z))throw Error('Upper route to ${name} blocked at '+x+','+z);`);
 assert(Math.abs(evaluate('feetY')-3.74)<1e-6,'Upper movement must never snap to the ground floor');
 evaluate(`for(const [x,z] of ${JSON.stringify(route.reverse())})if(!walkInterior(x,z))throw Error('Upper return blocked');`);
}
assert.equal(college.roomAt(30,-3,3.74),'Корпус 1 · 2 этаж · Правый коридор');
assert.equal(college.roomAt(30,-3,0),'Корпус 1 · Продолжение коридора');
assert.equal(upperBlocked(44.7,-3),true,'Upper end door must remain solid');
for(const door of layout.classroomDoors.filter(d=>d.wing==='upper-right')){assert.equal(door.open,false);assert.equal(upperBlocked(door.x,door.z),true,'Closed classroom '+door.number+' must block passage');}
const afterDoors=layout.classroomDoors.filter(d=>d.wing==='upper-after-stairs');
assert.equal(afterDoors.length,7);assert(afterDoors.every(d=>d.closed&&!d.open));
for(const door of afterDoors)assert(upperBlocked(door.x,door.z),'New closed classroom must block entry');
assert.equal(fixture('afterStairBench').besideClassroom,'215');
assert.equal(fixture('afterStairEndDoor').closed,true);
assert.equal(fixture('afterStairWindow').sillPlants,0);
assert.equal(fixture('secondStairHall').upperThroughPassage,true);
for(const [name,u,v] of [['entry',-.65,10.5],['window',0,11.05],['215',-9.7,11.55],['bench',-7.85,11.3],['middle',-16,11.05],['221',-25.9,11.55],['closed-end',-29.4,11.05]]){
 const target=upperGrid(-15.4+u,9.45-v),key=upperKey(...target);
 assert(upperParents.has(key),'Continuation '+name+' must be reachable from the original upper landing');
 const route=[];let c=target;
 while(c){route.push([c[0]*upperStep,c[1]*upperStep]);c=upperParents.get(upperKey(...c));}
 route.reverse();
 evaluate(`for(const [x,z] of ${JSON.stringify(route)})if(!walkInterior(x,z))throw Error('After-stair route ${name} blocked');`);
 assert(Math.abs(evaluate('feetY')-3.74)<1e-6);
 evaluate(`for(const [x,z] of ${JSON.stringify(route.reverse())})if(!walkInterior(x,z))throw Error('After-stair return blocked');`);
}
assert(upperBlocked(-45.37,-1.6),'Far white door must remain closed');
assert(layout.fixtures.filter(f=>f.kind==='upperClassroomDoor').every(f=>!f.open&&f.angle===0));
assert.equal(layout.stairHall.upperLeftDeferred,false);
const leftDoors=layout.classroomDoors.filter(d=>d.wing==='upper-left');assert.equal(leftDoors.length,10);
for(const door of leftDoors){assert.equal(door.open,false);assert(upperBlocked(door.x,door.z),'Closed left classroom '+door.number+' must block entry');}
assert.equal(layout.fixtures.filter(f=>f.kind==='upperLeftCrossBeam').length,2);
assert.equal(layout.fixtures.filter(f=>f.kind==='upperLeftWindow').length,2);
assert.equal(fixture('upperLeftPlantStand').pots,3);
assert.equal(college.roomAt(-2,10.7,3.74),'Корпус 1 · 2 этаж · Левый коридор');

evaluate('walkInterior(16.65,6.875)');
// The old sideways upper flight must be gone; the new straight flight has usable width.
assert.equal(college.groundAt(18.8,2.925,2.89),null);
for(const laneX of [21.205,22.045]){
 const foot=college.groundAt(laneX,3.85,2.89);
 assert(foot!==null&&foot>2.6&&foot<3.1);
 assert.equal(evaluate(`hit(${laneX},3.85,${foot})`),false);
}
evaluate(`for(let x=16.65;x<=21.625;x+=.025)if(!walkInterior(x,6.875))throw Error('Return from right turn blocked');
 for(let z=6.875;z>=.825;z-=.025)if(!walkInterior(21.625,z))throw Error('Return from straight upper flight blocked');
 for(let x=21.625;x>=16.3;x-=.025)if(!walkInterior(x,.825))throw Error('Return first ascending flight blocked');`);
assert(Math.abs(evaluate('feetY'))<1e-5);
evaluate(`for(let z=.825;z<=2.925;z+=.025)if(!walkInterior(16.3,z))throw Error('Lower stair approach blocked');
 for(let x=16.3;x<=21.7;x+=.025)if(!walkInterior(x,2.925))throw Error('Rotated descending flight blocked at '+x);`);
assert(Math.abs(evaluate('feetY')+1.87)<1e-5);
assert.equal(evaluate('zone(C.position.x,C.position.z)'),'Корпус 1 · Лестница вниз');
// Follow the return flight underneath the upward stairs to the actual cloakroom.
evaluate(`for(let z=2.925;z>=.825;z-=.025)if(!walkInterior(21.7,z))throw Error('Wardrobe turn blocked at '+z);
 for(let x=21.7;x>=16.4;x-=.025)if(!walkInterior(x,.825))throw Error('Wardrobe return flight blocked at '+x+' feet '+feetY);`);
assert(Math.abs(evaluate('feetY')+3.74)<1e-5);
assert.equal(college.roomAt(16.4,.825,-3.74),'Корпус 1 · Гардероб');
assert.equal(fixture('wardrobeBasement').floorStands,0);
assert.equal(fixture('wardrobeEntry').clear,true);
assert.equal(fixture('wardrobeReturnFlight').underUpstairs,true);
assert.equal(layout.fixtures.filter(f=>f.kind==='wardrobeBayPortal').length,3);
assert(fixture('wardrobeBasement').hookCount>130);
assert.equal(layout.fixtures.filter(f=>f.kind==='wardrobeWallCoat'&&f.wallMounted).length,7);
college.scene.updateMatrixWorld(true);
for(const [u,feet,v] of [[2.5,-3.74,4.6],[2.5,-3.74,-2.5],[4.6,-3.74,2],[4.6,-3.74,-2.6],[4.8,-2.89,7.025],[7.8,-1.87,6.9]]){
 const ray=new realThree.Raycaster(new realThree.Vector3(13.9+u,feet+.02,7.85-v),new realThree.Vector3(0,1,0),0,6);
 const hits=ray.intersectObject(college.scene,true).filter(h=>!h.object.material.transparent||h.object.material.opacity>.9);
 assert(hits.length&&hits[0].distance>1.8,'Cloakroom and descent must have actual visible headroom at '+[u,feet,v]);
}
const basementStep=.075,basementGrid=(x,z)=>[Math.round(x/basementStep),Math.round(z/basementStep)],basementKey=(a,b)=>a+','+b;
const basementStart=basementGrid(16.4,.825),basementQueue=[basementStart],basementParents=new Map([[basementKey(...basementStart),null]]);
const basementBlocked=(x,z)=>college.colliders.some(b=>x>b[0]-.35&&x<b[2]+.35&&z>b[1]-.35&&z<b[3]+.35&&-2.09>b[4]+.02&&-3.74<b[5]-.02);
for(let i=0;i<basementQueue.length;i++){
 const [a,b]=basementQueue[i];
 for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const aa=a+dx,bb=b+dz,k=basementKey(aa,bb),x=aa*basementStep,z=bb*basementStep,y=college.groundAt(x,z,-3.74);
  if(!basementParents.has(k)&&y!==null&&Math.abs(y+3.74)<1e-6&&!basementBlocked(x,z)){
   basementParents.set(k,[a,b]);basementQueue.push([aa,bb]);
  }
 }
}
for(const [name,x,z] of [['entry',16.4,3.2],['aisle',16.4,8],['bayA',18.5,5.8],['bayB',18.5,8.3],['bayC',18.5,10.5]]){
 const target=basementGrid(x,z);assert(basementParents.has(basementKey(...target)),'Wardrobe '+name+' must be reachable');
 const route=[];let c=target;
 while(c){route.push([c[0]*basementStep,c[1]*basementStep]);c=basementParents.get(basementKey(...c))}
 route.reverse();evaluate(`for(const [x,z] of ${JSON.stringify(route)})if(!walkInterior(x,z))throw Error('Wardrobe ${name} blocked');`);
 assert(Math.abs(evaluate('feetY')+3.74)<1e-6);
 evaluate(`for(const [x,z] of ${JSON.stringify(route.reverse())})if(!walkInterior(x,z))throw Error('Wardrobe return from ${name} blocked');`);
}
evaluate(`C.position.set(16.4,-2.04,.825);feetY=-3.74;
 for(let x=16.4;x<=21.7;x+=.025)if(!walkInterior(x,.825))throw Error('Climb back from wardrobe blocked at '+x);
 for(let z=.825;z<=2.925;z+=.025)if(!walkInterior(21.7,z))throw Error('Wardrobe return turn blocked');`);
assert(Math.abs(evaluate('feetY')+1.87)<1e-5);
evaluate(`for(let x=21.7;x>=16.3;x-=.025)if(!walkInterior(x,2.925))throw Error('Return from lower stairs blocked');`);
assert(Math.abs(evaluate('feetY'))<1e-5);
// Reach the exit at the marked spot beside the corridor entrance.
evaluate(`for(let z=2.925;z<=6.8;z+=.025)if(!walkInterior(16.3,z))throw Error('Exit approach blocked');
 for(let x=16.3;x<=18.5;x+=.025)if(!walkInterior(x,6.8))throw Error('Marked exit landing blocked');`);
// A single straight walk must connect both wings across the hall: the portals are directly opposite.
evaluate(`C.position.set(16.65,1.7,8.975);feetY=0;
 for(let x=16.65;x>=-16.75;x-=.035)if(!walkInterior(x,8.975))throw Error('Opposite-wing route blocked at '+x);
 for(let x=-16.75;x<=16.65;x+=.035)if(!walkInterior(x,8.975))throw Error('Return between wings blocked at '+x)`);
for(const side of [-1,1]){
 assert.equal(evaluate(`hit(${side*17.95},8.975,0)`),true,'End window must remain solid');
 assert.equal(evaluate(`hit(${side*6.05},7.5,0)`),true,'Wall before each opening must remain solid');
 assert.equal(evaluate(`hit(${side*6.05},10.15,0)`),true,'Wall after each opening must remain solid');
}
// Walk the second staircase from the marked ground-floor door to classroom 216.
assert.equal(fixture('upperLeftFarStairPassage').stairInteriorDeferred,false);
assert.equal(fixture('kitchenRestrictedDoor').text,'не заходить');assert.equal(fixture('kitchenRestrictedDoor').closed,true);
const kitchenDoor=fixture('kitchenRestrictedDoor'),upFootprint=fixture('secondStairUpFootprint');
assert(kitchenDoor.x>=upFootprint.x-upFootprint.width/2&&kitchenDoor.x<=upFootprint.x+upFootprint.width/2,'Kitchen must be under the upward flight in plan');
assert(kitchenDoor.z>=upFootprint.z-upFootprint.depth/2&&kitchenDoor.z<=upFootprint.z+upFootprint.depth/2);
assert.equal(kitchenDoor.level,-3.74);assert.equal(fixture('secondStairHall').windowGallery,false);
const treadAboveKitchen=college.groundAt(kitchenDoor.x,kitchenDoor.z,0);
assert(treadAboveKitchen!==null&&treadAboveKitchen>0&&treadAboveKitchen<1.87,'An actual upward tread must be above the kitchen doorway');
assert.equal(college.groundAt(-20.95,3.35,3.74),null,'No walkable gallery may remain in front of the upper windows');
assert.equal(fixture('secondStairHall').groundDoorways,1);
assert.equal(fixture('secondStairHall').upperEnclosed,true);
assert.equal(college.groundAt(-18.4,6.75,3.74),3.74,'Upper landing must reach its south wall, leaving no extra floor opening');
for(const [u,v] of [[-.82,1.5],[-1.85,2.7],[-1.85,4.72]])assert.equal(evaluate(`hit(${-15.4+u},${9.45-v},3.74)`),true,'Upper access must be enclosed by solid walls');
assert.equal(evaluate('hit(-17.25,5.65,3.74)'),false,'Upper landing must remain accessible');
// Check actual opaque wall faces above railing height, including the former open bridge edge.
college.scene.updateMatrixWorld(true);
for(const y of [5.5,6.1]){
 const ray=new realThree.Raycaster(new realThree.Vector3(-15.4,y,8.2),new realThree.Vector3(-1,0,0),0,1.05);
 const hits=ray.intersectObject(college.scene,true).filter(h=>!h.object.material.transparent||h.object.material.opacity>.9);
 assert(hits.length>0,'Upper bridge must have a visible full-height wall, not just railing collision');
}
for(const v of [2.6,6.3])assert.equal(evaluate(`hit(${-15.4-1.85},${9.45-v},0)`),true,'Divider beside the sole entrance must be solid');
assert.equal(evaluate('hit(-17.25,5.65,0)'),false,'The sole stair-room entrance must be open');
function walkSecondStair(points){
 const route=points.map(([u,v])=>[-15.4+u,9.45-v]);
 for(let i=1;i<route.length;i++){
  const [ax,az]=route[i-1],[bx,bz]=route[i],n=Math.ceil(Math.hypot(bx-ax,bz-az)/.025);
  const path=Array.from({length:n+1},(_,j)=>[ax+(bx-ax)*j/n,az+(bz-az)*j/n]);
  evaluate(`for(const [x,z] of ${JSON.stringify(path)})if(!walkInterior(x,z))throw Error('Second staircase blocked at '+x+','+z+' feet '+feetY+' colliders '+JSON.stringify(activeWorld.colliders.filter(b=>x>b[0]-.35&&x<b[2]+.35&&z>b[1]-.35&&z<b[3]+.35&&feetY+1.65>b[4]+.02&&feetY<b[5]-.02)));`);
 }
}
evaluate('C.position.set(-16.3,1.7,8.975);feetY=0');
walkSecondStair([[-.9,.475],[-.9,3.8],[-2.725,3.8],[-2.725,8.7]]);
assert(Math.abs(evaluate('feetY')-1.87)<1e-5);
walkSecondStair([[-2.725,8.7],[-4.625,8.7],[-4.625,3.9],[0,3.9],[0,-1.25]]);
assert(Math.abs(evaluate('feetY')-3.74)<1e-5);
assert.equal(evaluate('zone(C.position.x,C.position.z)'),'Корпус 1 · 2 этаж · Левый коридор');
walkSecondStair([[0,-1.25],[0,3.9],[-4.625,3.9],[-4.625,8.7],[-2.725,8.7],[-2.725,3.9],[-4.625,3.9],[-4.625,8.7]]);
assert(Math.abs(evaluate('feetY')+1.87)<1e-5);
walkSecondStair([[-4.625,8.7],[-2.725,8.7],[-2.725,5.3]]);
assert(Math.abs(evaluate('feetY')+3.74)<1e-5);
assert.equal(evaluate('getInteractionTarget()'),null,'Kitchen must not have an enter action');
assert.equal(evaluate('hit(-18.125,4.6,-3.74)'),true,'Restricted kitchen door must block entry');
walkSecondStair([[-2.725,5.3],[-2.725,8.7],[-4.625,8.7],[-4.625,3.9],[-.9,3.8],[-.9,.475]]);
assert(Math.abs(evaluate('feetY'))<1e-5);

// The final ground-floor wing must connect directly through the existing stair passage.
const finalGroundDoors=layout.classroomDoors.filter(d=>d.wing==='ground-after-stairs');
assert.equal(finalGroundDoors.length,6);
assert.equal(finalGroundDoors.map(d=>d.number).sort().join(','),'114,116,117,118,119,120');
assert(finalGroundDoors.every(d=>d.closed&&!d.open&&d.level===0));
assert.equal(layout.classroomDoors.filter(d=>d.number==='114').length,1,'114 must move to the photographed location without a duplicate');
assert.equal(fixture('finalGroundEndDoor').closed,true);
const finalGroundRestroom=fixture('finalGroundRestroomDoor');
assert.equal(finalGroundRestroom.closed,true);
assert.equal(finalGroundRestroom.interactive,true);
assert.equal(evaluate(`hit(${finalGroundRestroom.x},${finalGroundRestroom.z},0)`),true);
assert.equal(fixture('finalGroundPortal').open,true);
assert.equal(layout.fixtures.filter(f=>f.kind==='finalGroundPrideBoard').length,3);
assert.equal(fixture('finalGroundWindowPlants').pots,14);
assert.equal(fixture('finalGroundDesk').beforeEndStep,true);
evaluate('C.position.set(-16.3,1.7,8.975);feetY=0');
walkSecondStair([[-.9,.475],[-.9,11.05],[-29.45,11.05]]);
assert(Math.abs(evaluate('feetY')-.12)<1e-6,'The final exit step must carry the player');
assert.equal(evaluate('zone(C.position.x,C.position.z)'),'Корпус 1 · Правый коридор за лестницей');
assert.equal(evaluate('getInteractionTarget()'),null,'The final exit stays closed');
assert.equal(evaluate('hit(-45.3,-1.6,.12)'),true,'The final white door must block passage');
assert.equal(college.groundAt(-45.65,-1.6,0),null,'The final ground corridor ends at the photographed exit');
walkSecondStair([[-29.45,11.05],[-.9,11.05],[-.9,.475]]);
assert(Math.abs(evaluate('feetY'))<1e-6,'Returning through the final wing must stay on the ground floor');
for(const door of finalGroundDoors)assert.equal(evaluate(`hit(${door.x},${door.z},0)`),true,'Closed final classroom '+door.number+' must block entry');
for(const [u,v] of [[-.9,7.5],[-.9,9.4],[-5,11.05],[-18,11.05],[-28,11.05]]){
 const ray=new realThree.Raycaster(new realThree.Vector3(-15.4+u,.02,9.45-v),new realThree.Vector3(0,1,0),0,4);
 const hits=ray.intersectObject(college.scene,true).filter(h=>!h.object.material.transparent||h.object.material.opacity>.9);
 assert(hits.length&&hits[0].distance>2.5,'The final wing and transition require visible headroom');
}

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
for(const [name,x,z] of [['leftBench',4.15,1.425],['rightBench',-4.15,1.425],['innerDoor',0,2.97],['leftLane',.85,5.65],['rightLane',-.85,5.65],['backHall',0,8.3],['trophyCabinet',4.8,6.1],['reception',-3.0,6.5],['guardStaffEntrance',-5.4,5.6],['guardStaffAisle',-5.4,4.0],['coolerFront',4.4,4.8],['cabinetBypass',3.7,5.65],['kiosk',4.5,9.8],['office109',1.35,10.45],['mirror',-.45,10.45],['rightCorridorEntrance',-6.4,8.975],['rightCorridorMiddle',-11.7,8.975],['rightCorridorWindow',-16.7,8.975],['leftCorridorEntrance',6.4,8.975],['leftCorridorMiddle',11.7,8.975],['leftCorridorPlants',16.6,8.975],['stairHallDoor',16.3,7.8],['stairHallEntry',16.3,7.05],['stairHallGroundFloor',16.3,3.05],['forwardCorridor',16.3,-2.5],['continuationMiddle',31.9,-3],['continuationPlantNiche',17.7,-3.5],['continuationClosedExit',44.1,-3],['markedEmergencyExit',20.1,6.8],['finalGroundEntry',-16.3,-1.6],['finalGround116',-20.6,-1.6],['finalGroundMiddle',-33.4,-1.6],['finalGroundDeskFront',-43.9,-1.8],['finalGroundEnd',-44.85,-1.6]]){
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
 progressRing:'passed',openTurnstileLanes:2,finalGroundCorridorReachable:true,finalGroundClassrooms:finalGroundDoors.length,finalGroundEndDoorClosed:true,wardrobeReachable:true,wardrobeBays:3,wardrobeFloorStands:0,reachability:reachable,visibleMeshes:meshCount,batchedParts:instances,finiteGeometry:true,
 exitReturnsToSameDoor:true,sceneReused:true,layoutCorrected:true,rightCorridorAccessible:true,corridorTurnDegrees:90,oldPortalClosed:true,newPortalOnMarkedSideWall:true,compactSecurityRails:true,hollowSecurityPost:true,stairHallConnected:true,walkUpToSecondLanding:true,upperFlightStraightThenRight:true,walkDownAndBack:true,lowerStairsUnlabelled:true,forwardPassageOpen:true,stairsOnRight:true,exitOnMarkedWall:true,stairRotationDegrees:90,corridorPreserved:true,guardChairs:2,guardMonitors:2,BQFQDoors:layout.classroomDoors.length,afterStairClassrooms:afterDoors.length,afterStairCorridorAccessible:true,afterStairEndDoorClosed:true,secondFloorLeftWing:true,secondStaircaseConnected:true,kitchenDoorClosed:true,secondFloorRightWing:true,continuationEndDoorClosed:true,longContinuationWalkable:true,continuationNoticeBoards:7,leftCorridorAccessible:true,oppositePortals:true,hallWidth:layout.hallWidth,hallDepth:layout.hallDepth,graphicsUsed:false};
fs.writeFileSync('.preview/college1-checks.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));w.close();
