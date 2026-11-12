// Uses the game's Three.js version and software WebGL to verify the real renderer.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const dep = name => require(name);
const { chromium } = dep('playwright');
const { loadImage, createCanvas } = dep('@napi-rs/canvas');
const assert = require('node:assert/strict');

async function main() {
 const browser = await chromium.launch({
  ...require('./test-runtime.cjs').browserOptions(),
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox']
 });
 try {
  const page = await browser.newPage({ viewport: { width: 1120, height: 630 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  const file = fs.readdirSync('.').find(name => name.endsWith('.html'));
  await page.goto(pathToFileURL(path.resolve(file)).href, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction("typeof THREE !== 'undefined' && typeof updateInteraction === 'function'");
  await page.evaluate(`document.getElementById('start').style.display='none';
   C.position.set(11.55,1.7,10.95);feetY=0;yaw=Math.PI;pitch=0;updateInteraction(performance.now());`);
  assert.equal(await page.evaluate('getInteractionTarget().action'), 'enterCollege2');
  await page.keyboard.down('e');
  await page.waitForTimeout(950);
  await page.evaluate('updateInteraction(performance.now())');
  await page.keyboard.up('e');
  assert.equal(await page.evaluate('currentLocation'), 'college2');
  const report = await page.evaluate(`({
   revision:THREE.REVISION,
   physicallyCorrectLights:R.physicallyCorrectLights,
   toneMapping:R.toneMapping,
   lights:activeWorld.scene.children.filter(o=>o.isLight).map(o=>({type:o.type,intensity:o.intensity})),
   renderCalls:R.info.render.calls
  })`);
  const before = process.argv.includes('--before');
  const marked = process.argv.includes('--marked');
  const secondFloor = process.argv.includes('--second-floor');
  const frontStairWall = process.argv.includes('--front-stair-wall');
  const assemblyHall = process.argv.includes('--assembly-hall');
  const shots = assemblyHall ? [
   ['корпус-2-актовый-зал', [15.72,8.804,-25.19], [-1.85,8.65,-23.0]],
   ['корпус-2-сцена-в-зал', [-1.15,9.364,-23.0], [14.5,8.45,-24]],
   ['корпус-2-зал-лестница', [2.05,8.804,-22.0], [4.9,7.35,-19.5]],
   ['корпус-2-зал-шторы', [9.0,8.804,-25.1], [7.4,8.8,-28.8]],
   ['корпус-2-зал-подъём', [1.25,5.252,-20.48], [5.9,6.0,-20.48]],
   ['корпус-2-зал-кресла', [11.0,8.804,-25.19], [7.8,7.9,-26.5]]
  ] : frontStairWall ? [
   ['корпус-2-входная-лестница-стык'+(before?'-до':''), [3.15,3.556,3.70], [3.15,3.45,-3]],
   ['корпус-2-входная-лестница-сверху'+(before?'-до':''), [4.85,5.10,.55], [3.15,3.25,-2.5]],
   ['корпус-2-входная-лестница-снизу'+(before?'-до':''), [3.15,1.7,-1.40], [3.15,2.15,3.35]]
  ] : secondFloor ? [
   ['корпус-2-2этаж-холл', [1.60,5.252,-18.88], [-2.5,4.9,-20.8]],
   ['корпус-2-2этаж-коридор', [1.25,5.252,-16.0], [1.25,5.1,-2.2]],
   ['корпус-2-2этаж-обратно', [1.25,5.252,-2.4], [1.25,5.1,-19]],
   ['корпус-2-2этаж-лестница', [1.15,5.252,-18.7], [5.8,3.8,-19.4]],
   ['корпус-2-2этаж-входная-лестница', [4.7,5.412,-.35], [4.7,3.35,3.65]],
   ['корпус-2-2этаж-ступенька', [1.25,5.252,-2.3], [2.5,4.8,-.2]],
   ['корпус-2-лестница-у-входа', [3.15,1.7,-1.4], [3.15,2.15,3.35]]
  ] : marked ? [
   ['корпус-2-исправления-стенд', [-4.7,1.7,-27.7], [-5.8,2.12,-30.44]],
   ['корпус-2-исправления-ограждение', [-6.8,1.7,-27.8], [-7.05,.78,-26.16]],
   ['корпус-2-исправления-полка', [-.6,1.7,-4.3], [-2.8,1.03,-6.05]],
   ['корпус-2-исправления-лестница', [.9,1.7,-18.82], [6.6,1.30,-19.1]]
  ] : before ? [
   ['корпус-2-свет-до', [.05,1.7,-1.04], [-.44,1.42,-7]]
  ] : [
   ['корпус-2-свет-после', [.05,1.7,-1.04], [-.2,1.42,-7]],
   ['корпус-2-коридор-браузер', [.25,1.7,-7.7], [.65,1.45,-28]],
   ['корпус-2-ожидание-браузер', [1.5,1.7,-3.6], [6.9,1.39,-3.5]],
   ['корпус-2-выставка-браузер', [.15,1.7,-6.65], [-3.05,1.35,-8.8]],
   ['корпус-2-поворот-браузер', [.55,1.7,-25], [-3.6,1.45,-28.15]],
   ['корпус-2-кубки-браузер', [-1.6,1.7,-28.1], [-7.4,1.42,-27.75]],
   ['корпус-2-лестница-браузер', [.9,1.7,-19.6], [5.7,1.45,-19.4]]
  ];
  report.shots = [];
  for (const [name, position, target] of shots) {
   await page.evaluate(({position,target}) => {
    // Evaluate in the page's global lexical scope to use the game's camera.
    window.eval('C.position.set(...'+JSON.stringify(position)+'); feetY='+Math.max(0,position[1]-1.7)+'; C.lookAt(...'+JSON.stringify(target)+');'+
     'hud.textContent=zone(C.position.x,C.position.z);updateInteraction(performance.now());'+
     'document.getElementById("notice").style.display="none";R.render(activeWorld.scene,C);');
   }, {position,target});
   const screenshot = await page.screenshot();
   fs.writeFileSync(path.join('.preview', name+'.png'), screenshot);
   const image = await loadImage(screenshot);
   const canvas = createCanvas(image.width,image.height);
   const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
   const data=ctx.getImageData(0,70,image.width,image.height-110).data;
   let clipped=0,brightness=0;
   for(let i=0;i<data.length;i+=4) {
    if(data[i]>248&&data[i+1]>248&&data[i+2]>248)clipped++;
    brightness+=(data[i]+data[i+1]+data[i+2])/3;
   }
   const measurement={name,whiteFraction:clipped/(data.length/4),averageBrightness:brightness/(data.length/4)};
   report.shots.push(measurement);
   if(!before)assert(measurement.whiteFraction<.12, name+' has clipped surfaces');
  }
  if(!before) {
   if(frontStairWall){
    report.frontStairWall=await page.evaluate(`(()=>{
     activeWorld.scene.updateMatrixWorld(true);
     const rays=[3.05,3.23,3.49].map(y=>{
      const ray=new THREE.Raycaster(new THREE.Vector3(3.15,y,.5),new THREE.Vector3(0,0,-1),0,.6);
      const intersections=ray.intersectObjects(activeWorld.scene.children,true);
      if(!intersections.length)throw Error('The lobby ceiling is visible through the stair wall at height '+y);
      return {height:y,distance:intersections[0].distance};
     });
     if(hit(3.15,.3,.154667))throw Error('The ground-floor stair doorway is blocked');
     if(hit(4.85,-.3,3.712))throw Error('The upper stair doorway is blocked');
     return {sealedSightlines:rays,doorwaysClear:true};
    })()`);
   }
   const navigation = await page.evaluate(`(()=>{
    const route=[[0,-1.04],[.25,-2.6],[.25,-5.5],[.6,-8],[.6,-27.85],[-1.5,-27.85],[-6.9,-27.85],[-8.1,-27.85]];
    let count=0;
    for(let i=1;i<route.length;i++){
     const a=route[i-1],b=route[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.08);
     for(let j=0;j<=n;j++){
      const x=a[0]+(b[0]-a[0])*j/n,z=a[1]+(b[1]-a[1])*j/n;
      if(hit(x,z,0)||activeWorld.groundAt(x,z,0)!==0)throw Error('Blocked route at '+x+','+z);
      count++;
     }
    }
    if(!hit(.65,-30.55,0))throw Error('The closed door at the end is passable');
    for(const path of [
     [[.25,-4],[1.5,-4],[3,-3.5],[5.8,-3.5]],
     [[0,-7.2],[-1.22,-7.2],[-1.22,-10.45]],
     [[.8,-20.48],[2.4,-20.48],[6.05,-20.48],[6.05,-18.78],[2.62,-18.78],[6.05,-18.78],[6.05,-20.48],[2.4,-20.48],[.8,-20.48]]
    ]){
     C.position.set(path[0][0],1.7,path[0][1]);feetY=0;
     for(let i=1;i<path.length;i++){
      const a=path[i-1],b=path[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.03);
      for(let j=1;j<=n;j++){
       const x=a[0]+(b[0]-a[0])*j/n,z=a[1]+(b[1]-a[1])*j/n;
       if(!walkInterior(x,z))throw Error('Walk blocked at '+x+','+z+' height '+feetY);
       count++;
      }
     }
     if(Math.abs(feetY)>.01)throw Error('Stair return did not reach ground level');
    }
    return {samples:count,endHall:activeWorld.roomAt(-4,-27.85),mainCorridor:activeWorld.roomAt(.6,-24)};
   })()`);
   report.navigation=navigation;
   if(assemblyHall){
    report.assemblyHall = await page.evaluate(`(()=>{
     const route=[[.8,-20.48],[2.4,-20.48],[6.05,-20.48],[6.05,-18.78],[2.62,-18.78],
      [1.25,-18.78],[1.25,-20.48],[2.4,-20.48],[6.05,-20.48],[6.05,-18.78],[2.62,-18.78],
      [2.05,-18.78],[2.05,-21.67],[14.4,-21.67],[2.05,-21.67],[2.05,-25.19],[14.4,-25.19],[2.05,-25.19],[-1.1,-25.19],
      [2.05,-25.19],[15.72,-25.19],[15.72,-21.67],[14.4,-21.67],[14.4,-17.40],[3.0,-17.40],
      [14.4,-17.40],[14.4,-21.67],[15.72,-21.67],[15.72,-25.19],
      [2.05,-25.19],[2.05,-18.78],[2.62,-18.78],[6.05,-18.78],[6.05,-20.48],[2.4,-20.48],
      [1.25,-20.48],[1.25,-18.78],[2.62,-18.78],[6.05,-18.78],[6.05,-20.48],[2.4,-20.48],[.8,-20.48]];
     C.position.set(route[0][0],1.7,route[0][1]);feetY=0;
     let samples=0,highest=0;
     activeWorld.scene.updateMatrixWorld(true);
     for(let i=1;i<route.length;i++){
      const a=route[i-1],b=route[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.025);
      for(let j=1;j<=n;j++){
       const x=a[0]+(b[0]-a[0])*j/n,z=a[1]+(b[1]-a[1])*j/n;
       if(!walkInterior(x,z))throw Error('Assembly hall route blocked at '+x+','+z+' feet '+feetY);
       if(x>2.45&&x<6.65&&z>-21.20&&z<-18.10&&samples%10===0){
        const ray=new THREE.Raycaster(new THREE.Vector3(x,feetY+.30,z),new THREE.Vector3(0,1,0),0,1.40);
        const overhead=ray.intersectObjects(activeWorld.scene.children,true);
        if(overhead.length)throw Error('Insufficient stair headroom at '+x+','+z+' feet '+feetY+' clearance '+(overhead[0].distance+.30));
       }
       highest=Math.max(highest,feetY);samples++;
      }
     }
     if(Math.abs(feetY)>.01)throw Error('Hall stairs do not return to ground floor');
     const finalFeet=feetY;
     C.position.set(3.72,8.804,-28.65);feetY=7.104;
     let rowPassages=0;
     for(let row=0;row<8;row++){
      const x=3.72+row*1.50;
      const [startZ,endZ]=row%2===0?[-28.65,-21.67]:[-21.67,-28.65];
      for(let j=0;j<=60;j++){
       const nextX=x-(row===0?0:1.50)*(1-j/60);
       if(!walkInterior(nextX,startZ))throw Error('Blocked side aisle at '+nextX+','+startZ);
      }
      for(let j=1;j<=280;j++){
       const z=startZ+(endZ-startZ)*j/280;
       if(!walkInterior(x,z)||Math.abs(feetY-7.104)>.001)throw Error('Blocked seat-row passage at '+x+','+z);
      }
      rowPassages++;
     }
     if(activeWorld.groundAt(4.2,-20.3,7.104)!==null)throw Error('Floor covers hall stair opening');
     const edgeSamples=[];
     for(const [x,z] of [[3.2,-21.46],[4.2,-21.40],[5.2,-21.34],[6.2,-21.30],[6.9,-20.45]]){
      const ray=new THREE.Raycaster(new THREE.Vector3(x,7.224,z),new THREE.Vector3(0,-1,0),0,.40);
      const surfaces=ray.intersectObjects(activeWorld.scene.children,true).filter(h=>Math.abs(h.point.y-7.104)<.002);
      if(surfaces.length!==1)throw Error('Overlapping or missing stairwell carpet at '+x+','+z+': '+surfaces.length);
      if(!surfaces[0].object.material.map)throw Error('Untextured stairwell edge at '+x+','+z);
      edgeSamples.push({x,z,height:surfaces[0].point.y});
     }
     const ledgeSamples=[];
     for(const [x,y] of [[3.17,6.99],[4.21,7.05],[5.47,7.18],[6.12,7.32]]){
      const ray=new THREE.Raycaster(new THREE.Vector3(x,y,-18.45),new THREE.Vector3(0,0,1),0,.53);
      const surfaces=ray.intersectObjects(activeWorld.scene.children,true).filter(h=>Math.abs(h.point.z+18.03)<.002);
      if(surfaces.length!==1||!surfaces[0].object.material.map)
       throw Error('Overlapping or missing raised ledge face at '+x+','+y+': '+surfaces.length);
      ledgeSamples.push({x,y});
     }
     return {samples,highest,finalFeet,rowPassages,edgeSamples,ledgeSamples};
    })()`);
   }
   if(secondFloor){
    report.secondFloor = await page.evaluate(`(()=>{
     const route=[[.8,-20.48],[2.4,-20.48],[6.05,-20.48],[6.05,-18.78],[2.62,-18.78],
      [1.25,-18.78],[1.25,-2.0],[1.25,-.65],[4.85,-.65],[4.85,3.7],[3.15,3.7],[3.15,-1.25]];
     C.position.set(route[0][0],1.7,route[0][1]);feetY=0;
     let samples=0,highest=0;
     for(let i=1;i<route.length;i++){
      const a=route[i-1],b=route[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.025);
      for(let j=1;j<=n;j++){
       const x=a[0]+(b[0]-a[0])*j/n,z=a[1]+(b[1]-a[1])*j/n;
       if(!walkInterior(x,z))throw Error('Second floor route blocked at '+x+','+z+' feet '+feetY);
       highest=Math.max(highest,feetY);samples++;
      }
     }
     if(Math.abs(feetY)>.01)throw Error('Front staircase does not return to the entrance');
     for(const [x,z] of [[-2.65,-20.88],[-2.65,-18.4],[-.42,-22.30],[.40,-14.20],[2.10,-11.70],[.40,-7],[2.10,-3.85]]){
      if(!hit(x,z,3.552))throw Error('An upstairs room door is not closed');
     }
     return {samples,highest,finalFeet:feetY,closedRoomDoors:7};
    })()`);
   }
   await page.evaluate('C.position.set(0,1.7,-1.04);feetY=0;updateInteraction(performance.now());');
   await page.keyboard.press('e');
   assert.equal(await page.evaluate('currentLocation'), 'college');
   assert.deepEqual(await page.evaluate('C.position.toArray()'), [11.55,1.7,10.95]);
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify(report,null,2));
 } finally {
  await browser.close();
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
