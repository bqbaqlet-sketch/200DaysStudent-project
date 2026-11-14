const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');
const {browserOptions} = require('./test-runtime.cjs');
const root = path.resolve(__dirname, '..');
const out = path.join(__dirname, 'russian-mapping-qa');
fs.mkdirSync(out, {recursive: true});

(async () => {
  const browser = await chromium.launch({...browserOptions(), headless: true,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox']});
  const errors = [], report = {screens: []};
  try {
    const context = await browser.newContext({viewport: {width: 1600, height: 900},
      hasTouch: true, isMobile: true, deviceScaleFactor: 1,
      userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'});
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && /SecurityError|WebGLProgram|shader error/.test(message.text())) errors.push(message.text());
    });
    await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', route =>
      route.fulfill({path: require.resolve('three/build/three.min.js'), contentType: 'application/javascript'}));
    await page.addInitScript(() => {
      requestAnimationFrame = () => 0;
      Element.prototype.requestFullscreen = () => Promise.reject();
      window.mappingLabels = new Map();
      for (const method of ['fillText', 'strokeText']) {
        const native = CanvasRenderingContext2D.prototype[method];
        CanvasRenderingContext2D.prototype[method] = function(text, x, y, maxWidth) {
          const value = String(text);
          if (/[А-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі]/.test(value)) {
            const width = Math.min(this.measureText(value).width, maxWidth ?? Infinity);
            const left = this.textAlign === 'center' ? x - width / 2 : this.textAlign === 'right' ? x - width : x;
            const entry = {text: value, canvas: [this.canvas.width, this.canvas.height], font: this.font,
              bounds: [left, left + width], maxWidth};
            mappingLabels.set(value + '|' + this.canvas.width + '|' + this.font, entry);
          }
          return native.apply(this, arguments);
        };
      }
    });
    const main = fs.readdirSync(root).find(name => name !== 'index.html' && name.endsWith('.html'));
    await page.goto(pathToFileURL(path.join(root, main)).href, {waitUntil: 'load', timeout: 60000});
    await page.evaluate(() => {mainMenu.render(0); mainMenu.render(5700);});
    await page.locator('#testerMode').tap();
    report.touchStart = await page.evaluate(() => gameMode === 'tester' && currentLocation === 'college');
    assert(report.touchStart);
    report.locations = await page.evaluate(() => {
      const visited = [];
      for (const location of ['college', 'college1', 'college2', 'home', 'entrance4', 'apartment']) {
        switchLocation(location);
        visited.push(currentLocation);
      }
      return visited;
    });
    report.labels = await page.evaluate(() => Array.from(mappingLabels.values()));
    assert.equal(report.locations.length, 6);
    const untranslated = report.labels.filter(label => /[ӘәҒғҚқҢңӨөҰұҮүҺһІі]/.test(label.text)
      || /^(СУ|ТАРИХ|ДОСБОЛ LIKE|АДАЛ АЗАМАТ)$/.test(label.text));
    assert.deepEqual(untranslated, [], 'Kazakh labels rendered by a location');
    const tooWide = report.labels.filter(label => label.bounds[0] < -1 || label.bounds[1] > label.canvas[0] + 1);
    report.overflows = tooWide;
    assert.deepEqual(tooWide, [], 'A location label overflows its texture');

    async function shot(name, location, position, target, anchor = false) {
      await page.evaluate(async ({location, position, target, anchor}) => {
        switchLocation(location);
        gameTime.set(1, 9, 0);
        playerAvatar.root.visible = false;
        activeWorld.scene.updateMatrixWorld(true);
        const relative = anchor ? activeWorld.frontStudent108.root.parent : null;
        const point = xyz => relative ? relative.localToWorld(new THREE.Vector3(...xyz)) : new THREE.Vector3(...xyz);
        C.position.copy(point(position)); C.lookAt(point(target));
        const images = new Set();
        activeWorld.scene.traverse(object => {
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            for (const key of ['map', 'normalMap', 'roughnessMap']) if (material?.[key]?.image?.decode) images.add(material[key].image);
          }
        });
        await Promise.all(Array.from(images, image => image.decode()));
        hud.textContent = zone(C.position.x, C.position.z);
        resize(); R.setPixelRatio(1); R.render(activeWorld.scene, C);
      }, {location, position, target, anchor});
      await page.screenshot({path: path.join(out, name + '.png')});
      report.screens.push(name);
    }
    await shot('desktop-facade', 'college', [0,1.7,16], [0,3.3,0]);
    await shot('desktop-history', 'college1', [8.9,1.64,14.25], [2.2,1.5,15.7], true);
    for (const size of [{width:844,height:390}, {width:568,height:320}]) {
      await page.setViewportSize(size);
      await shot(`mobile-${size.width}-history`, 'college1', [7.8,1.65,15], [2.5,1.7,15], true);
      await shot(`mobile-${size.width}-posters`, 'college1', [17,1.7,10.8], [13.4,1.9,9.64], true);
      await shot(`mobile-${size.width}-college2`, 'college2', [.05,1.7,-1.04], [-.44,1.8,-7]);
    }
    // Explicit export only; ordinary checks never overwrite a shipped asset.
    if (process.argv.includes('--export-menu-background')) {
    await page.setViewportSize({width:1600,height:1200});
    await page.evaluate(async () => {
      switchLocation('college1');gameTime.set(1,8,20);playerAvatar.root.visible=false;
      const anchor=activeWorld.frontStudent108.root.parent;
      const camera=new THREE.PerspectiveCamera(43,1600/1200,.04,40);
      camera.position.copy(anchor.localToWorld(new THREE.Vector3(8.9,1.42,12.7)));
      camera.lookAt(anchor.localToWorld(new THREE.Vector3(7.15,1.12,15)));
      for(const element of document.body.children)if(element!==R.domElement)element.style.setProperty('display','none','important');
      const images=new Set();activeWorld.scene.traverse(object=>{
        for(const material of Array.isArray(object.material)?object.material:[object.material])
          for(const key of ['map','normalMap','roughnessMap'])if(material?.[key]?.image?.decode)images.add(material[key].image);
      });
      await Promise.all(Array.from(images,image=>image.decode()));
      R.setPixelRatio(1);R.setSize(1600,1200);R.render(activeWorld.scene,camera);
    });
    await page.screenshot({path: path.join(root,'assets/menu/college-background.jpg'), type:'jpeg', quality:92});
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({locations: report.locations, labels: report.labels.length,
      overflows: report.overflows, screens: report.screens, errors}, null, 2));
  } finally {await browser.close();}
})().catch(error => {console.error(error); process.exitCode = 1;});
