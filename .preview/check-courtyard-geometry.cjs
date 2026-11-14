const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const THREE = require('three');
const file = fs.readdirSync('.').find(f => f !== 'index.html' && f.endsWith('.html'));
const html = fs.readFileSync(file, 'utf8');
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
// Canvas drawing is skipped: this checks the actual Three.js geometry without a GPU or browser.
const gradient = () => ({addColorStop(){}});
const context = new Proxy({createLinearGradient: gradient, createRadialGradient: gradient}, {
  get: (target, key) => target[key] || (() => {})
});
const document = { createElement: () => ({width: 0, height: 0, getContext: () => context}) };
const start = html.includes('// BEGIN HOME_LOCATION') ? html.indexOf('// BEGIN HOME_LOCATION') : html.indexOf('function buildHomeLocation()');
const end = html.indexOf('// ---- Интерьер четвёртого подъезда.', start);
const world = new vm.Script(html.slice(start, end) + '\nbuildHomeLocation()').runInNewContext({THREE, document});
const hit = (x, z) => !world.contains(x, z) || world.dynamicHit(x, z) ||
  world.colliders.some(b => x > b[0] - .35 && x < b[2] + .35 && z > b[1] - .35 && z < b[3] + .35);
assert(!hit(world.spawn[0], world.spawn[2]), 'Player spawn must be clear');
assert.equal(world.scene.userData.footballGoals, 2);
assert.equal(world.scene.userData.fitnessMachines, 3);
assert.equal(world.scene.userData.courtyardReference.entrance, 5);
let instances = 0, triangles = 0;
world.scene.traverse(mesh=>{
  if(mesh.isInstancedMesh){
    assert(Array.from(mesh.instanceMatrix.array).every(Number.isFinite), 'Invalid instance transform');
    instances += mesh.count;
    triangles += (mesh.geometry.index?.count || mesh.geometry.attributes.position.count) / 3 * mesh.count;
  }
  if(mesh.geometry) assert(Array.from(mesh.geometry.attributes.position.array).every(Number.isFinite), 'Invalid geometry');
});
for(const b of world.colliders) assert(b.every(Number.isFinite), 'Invalid collider');
const blockedEntries=[];
for(const unit of world.playground.units)for(let slot=0;slot<unit.slots;slot++){
  const entry=unit.entry(slot);if(hit(entry.x,entry.z))blockedEntries.push({id:unit.id,slot,entry:entry.toArray()});
}
assert.deepEqual(blockedEntries,[],'Every playground entrance must be reachable');
const treesOnPlaySurface=world.scene.userData.trees.filter(t=>t.x+t.radius>5&&t.x-t.radius<51&&t.z+t.radius>21&&t.z-t.radius<51);
assert.equal(treesOnPlaySurface.length,0,'Tree trunks must be outside the rubber play surface');
function walk(points) {
  let feet = world.walkGroundAt(...points[0], null);
  assert(!hit(...points[0]), 'The start of a playground route must be clear');
  const levels = [feet];
  for (let i = 1; i < points.length; i++) {
    const [x, z] = points[i - 1], [endX, endZ] = points[i];
    const steps = Math.ceil(Math.hypot(endX - x, endZ - z) / .025);
    for (let step = 1; step <= steps; step++) {
      const px = x + (endX - x) * step / steps, pz = z + (endZ - z) * step / steps;
      const level = world.walkGroundAt(px, pz, feet);
      assert(level !== null && !hit(px, pz), 'Blocked playground route at ' + [px, pz]);
      feet = level;
    }
    levels.push(feet);
  }
  return levels;
}
assert.deepEqual(walk([[39.8,22],[39.8,23.36],[39.8,24.2],[39.8,22]]), [.145,.269,.365,.145]);
assert(hit(39.8,26.9), 'The carousel rail must stay solid away from the entrance');
assert(hit(39.8,25.2), 'The center handle must not be walkable');
assert.deepEqual(walk([[44,33.95],[44,36.4],[44,40.49]]), [.145,1.66,.145]);
const towerLevels = walk([[42.55,46],[40,46],[36.6,46],[35.95,46]]);
assert.equal(towerLevels[0],.145);
assert.equal(towerLevels[1],1.4);
assert(towerLevels[2]>.23 && towerLevels[2]<1.4,'The tower slide must descend from the platform');
assert.equal(towerLevels[3],.145);
assert.deepEqual(walk([[31.5,36.4],[31.5,37.04],[31.5,38],[31.5,36.4]]), [.145,.214,.17,.145]);
const market = world.scene.userData.market;
assert.equal(market.shops.map(shop => shop.title).join('|'),'КСЕРОКОПИЯ|АПТЕКА|МАГАЗИН ОДЕЖДЫ|МАГАЗИН ТЕХНИКИ');
assert.equal(market.stops.length,2);
assert.equal(market.stops[0].facing,1);
assert.equal(market.stops[1].facing,-1);
assert.equal(market.roadFar-market.roadNear,18);
assert(market.roadMin<market.stopZ1-70 && market.roadMax>market.stopZ2+70,'Bus approaches must continue well beyond the stops');
assert(!hit(49,-8.95) && hit(49,-2.25) && hit(49,4.45),'Only the car at the new exit should be removed');
assert(hit(market.gate.x,-15) && hit(market.gate.x,-3),'The fence must remain solid beside the open gate');
const crossingZ = -10.74;
const eastWalk = market.roadFar+.61, eastShelter = market.roadFar+1.75;
assert.deepEqual(walk([[39.1,crossingZ],[57,crossingZ],[115.26,crossingZ],[(market.roadNear+market.roadFar)/2,crossingZ],[eastWalk,crossingZ]]),
  [.12,.12,.12,.054,.12]);
for(const shop of market.shops){
  const x = (shop.x1 + shop.x2) / 2;
  assert.deepEqual(walk([[x,crossingZ],[x,shop.front+.57],[x,crossingZ]]),[.12,.12,.12]);
  if(shop.title==='КСЕРОКОПИЯ'){
    const inside=shop.front-4.15,back=shop.front-7.25;
    assert.deepEqual(walk([[x,crossingZ],[x,inside],[x-3.26,inside],[x-3.26,back],[x,back],[x-3.26,back],[x-3.26,inside],[x,inside],[x,crossingZ]]),Array(9).fill(.12));
    assert.equal(world.streetZone(x,inside),'Ксерокопия');
    assert(hit(x,shop.front-5.65),'The print shop counter must be solid');
    assert(hit(x-2.05,shop.front-.15)&&hit(x+2.05,shop.front-.15),'The storefront windows must be solid');
    continue;
  }
  if(shop.title==='МАГАЗИН ОДЕЖДЫ'){
    const entrance=shop.front-2.8, aisle=shop.front-5.67, rear=shop.front-8.48;
    const route=[[x,crossingZ],[x,entrance],[x-3.2,entrance],[x-3.2,aisle],[x+3.34,aisle],
      [x+3.34,rear],[x-3.2,rear],[x-3.2,entrance],[x,entrance],[x,crossingZ]];
    assert.deepEqual(walk(route),Array(route.length).fill(.12));
    assert.equal(world.streetZone(x,aisle),'Магазин одежды');
    assert(hit(x,shop.front-4.49)&&hit(x+.98,shop.front-6.92),'Both clothing displays must be solid');
    assert(hit(x-4.47,shop.front-4.63)&&hit(x+4.48,shop.front-4.66)&&hit(x,shop.front-9.57),'Clothing racks must be solid');
    assert(hit(x-2.05,shop.front-.15)&&hit(x+2.05,shop.front-.15),'The storefront windows must be solid');
    continue;
  }
  if(shop.title==='МАГАЗИН ТЕХНИКИ'){
    const entrance=shop.front-2.96, rear=shop.front-7.79;
    const route=[[x,crossingZ],[x,entrance],[x,rear],[x-5.17,rear],[x-5.17,entrance],[x+5.24,entrance],
      [x+5.24,rear],[x,rear],[x,entrance],[x,crossingZ]];
    assert.deepEqual(walk(route),Array(route.length).fill(.12));
    assert.equal(world.streetZone(x,rear),'Магазин техники');
    assert(hit(x-3.29,shop.front-4.83)&&hit(x+2.87,shop.front-5.04),'Both electronics displays must be solid');
    assert(hit(x,shop.front-9.08)&&hit(x+6.35,shop.front-7.44),'The glass cabinet and sofa must be solid');
    assert(hit(x-2.05,shop.front-.15)&&hit(x+2.05,shop.front-.15),'The storefront windows must be solid');
    continue;
  }
  assert(hit(x,shop.front-.15),'The storefront should stay closed');
}
assert.deepEqual(walk([[115.26,crossingZ],[115.26,-16.65],[114.22,-16.65]]),[.12,.12,.12]);
assert.deepEqual(walk([[eastWalk,crossingZ],[eastWalk,-16.65],[eastShelter,-16.65]]),[.12,.12,.12]);
assert.equal(world.streetZone(114.22,-16.65),'Автобусная остановка');
assert.equal(world.streetZone(eastShelter,-16.65),'Автобусная остановка');
assert.deepEqual(walk([[61.15,crossingZ],[61.15,-19.52],[59.76,-22.85]]),[.12,.12,.12]);
for(const x of [58.37,59.76,61.15])assert(hit(x,-24.17),'Container models must have physical collision');
for(const [x,z] of [[79,-28],[88,4],[110,-19],[market.roadFar+7,-16.65],[122.5,-48]]){
  assert(hit(x,z),'The empty edges should be closed to pedestrians');
}
assert(world.flyHit(185,8,-16.65),'The player should not be able to fly to the empty terrain outside the map');
const woodParts=[],metalParts=[],partMatrix=new THREE.Matrix4(),partPosition=new THREE.Vector3(),partScale=new THREE.Vector3();
for(const mesh of world.scene.children){
  if(!mesh.isInstancedMesh)continue;
  const color=mesh.material.color.getHex();if(color!==0x8e623e&&color!==0x48423a)continue;
  for(let i=0;i<mesh.count;i++){
    mesh.getMatrixAt(i,partMatrix);partPosition.setFromMatrixPosition(partMatrix);partScale.setFromMatrixScale(partMatrix);
    (color===0x8e623e?woodParts:metalParts).push({position:partPosition.clone(),scale:partScale.clone(),matrix:partMatrix.clone()});
  }
}
const entrances = [];
for(let n = 1; n <= 5; n++){
  const x = -29.6 + (n - 1) * 14.8;
  for(let z = 6.7; z >= 1; z -= .1) assert(!hit(x, z), `Blocked approach to entrance ${n}`);
  // Both benches are solid, with an unobstructed passage between them.
  for(const side of [-1, 1]) assert(hit(x + side * 2.18, 3.48), `Missing bench at entrance ${n}`);
  for(const side of [-1,1]){
    const benchX=x+side*2.18;
    const backSlats=woodParts.filter(p=>Math.abs(p.position.x-benchX)<.6&&Math.abs(p.position.z-3.48)<.6&&Math.abs(p.scale.y-.135)<1e-5&&p.position.y>.7&&p.position.y<1.4);
    assert.equal(backSlats.length,3,'Every bench must have three backrest planks');
    for(const plank of backSlats)assert(Math.abs(plank.matrix.elements[1])<1e-6,'Backrest planks must stay horizontal when the bench turns');
    const legs=metalParts.filter(p=>Math.abs(p.position.x-benchX)<.3&&Math.abs(p.position.z-3.48)<1.2&&Math.abs(p.scale.y-.45)<1e-5&&p.position.y<.5);
    assert.equal(legs.length,4,'Each bench must stand on four level legs');
    for(const leg of legs)assert(Math.abs(leg.position.y-Math.abs(leg.matrix.elements[5])/2-.09)<1e-6,'Bench feet must rest on the entrance paving');
  }
  entrances.push({entrance: n, passageClear: true, benches: 2});
}
const report = {
  syntax: 'passed', geometry: 'passed', spawnClear: true, entrances,
  instances, instancedTriangles: triangles, colliders: world.colliders.length,
  footballGoals: 2, fitnessMachines: 3,treesOnPlaySurface:0,levelEntranceBenches:10,graphicsUsed: false
};
fs.writeFileSync('.preview/courtyard-geometry-checks.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
