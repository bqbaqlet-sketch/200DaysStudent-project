const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    ...require('./test-runtime.cjs').browserOptions(),
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !m.location().url.endsWith('/favicon.ico')) errors.push(m.text()); });
  const file = fs.readdirSync(process.cwd()).find(f => f !== 'index.html' && f.endsWith('.html'));
  await page.goto(pathToFileURL(path.join(process.cwd(), file)).href);
  await page.waitForFunction(() => typeof THREE !== 'undefined' && typeof switchLocation === 'function');
  await page.click('#play');
  await page.click('#location');
  await page.waitForTimeout(400);
  const report = await page.evaluate(() => ({
    location: currentLocation, metadata: activeWorld.scene.userData,
    spawn: C.position.toArray(), spawnBlocked: hit(C.position.x, C.position.z),
    colliders: activeWorld.colliders.length,
    invalidColliders: activeWorld.colliders.filter(b => b.some(v => !Number.isFinite(v))),
    invalidTransforms: activeWorld.scene.children.filter(o => o.isInstancedMesh &&
      Array.from(o.instanceMatrix.array).some(v => !Number.isFinite(v))).length,
    renderer: {calls: R.info.render.calls, triangles: R.info.render.triangles}
  }));
  await page.screenshot({ path: '.preview/двор-от-пятого-подъезда.png' });
  const views = [
    ['площадка-обзор', [59, 27, 6], [23, 0, 34]],
    ['площадка-с-уровня-глаз', [31, 1.7, 23], [40, .8, 42]],
    ['тренажёры-и-турники', [31.5, 1.7, 21], [16, 1.1, 28]],
    ['футбольное-поле', [-24, 1.7, 17.3], [-24, 1.1, 40]],
    ['скамейки-у-подъезда', [29.6, 1.7, 7], [29.6, 1.2, .6]]
  ];
  for (const [name, position, target] of views) {
    await page.evaluate(({position, target}) => {
      fly = 1; resetInput(); C.position.set(...position); C.lookAt(...target);
      yaw = C.rotation.y; pitch = C.rotation.x;
    }, { position, target });
    await page.waitForTimeout(250);
    await page.screenshot({ path: '.preview/' + name + '.png' });
  }
  // Door access is still reachable between the two facing benches.
  report.entrances = await page.evaluate(() => {
    fly = 0; C.position.y = 1.7;
    return [1,2,3,4,5].map(n => {
      const x = -29.6 + (n - 1) * 14.8;
      const blocked = [];
      for (let z = 6.7; z >= 1; z -= .1) if (hit(x, z)) blocked.push(Number(z.toFixed(2)));
      C.position.set(x - 1.1, 1.7, 1.5);
      return { entrance: n, blocked, interaction: getInteractionTarget() };
    });
  });
  await page.evaluate(() => switchLocation('entrance4'));
  report.interior = await page.evaluate(() => ({ location: currentLocation, floors: activeWorld.scene.userData.floors }));
  await page.evaluate(() => switchLocation('home', {exiting: true}));
  await page.click('#location');
  report.returnLocation = await page.evaluate(() => currentLocation);
  await page.setViewportSize({width: 844, height: 390});
  await page.click('#location');
  await page.evaluate(() => { activeWorld.state = null; switchLocation('college'); switchLocation('home', {fresh: true}); });
  await page.waitForTimeout(100);
  await page.screenshot({path: '.preview/двор-телефон.png'});
  report.mobile = await page.evaluate(() => ({
    width: R.domElement.width, height: R.domElement.height,
    location: currentLocation, rotateOverlay: getComputedStyle(document.getElementById('rot')).display
  }));
  report.errors = errors;
  fs.writeFileSync('.preview/courtyard-checks.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
