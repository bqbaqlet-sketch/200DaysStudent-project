import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const main = fs.readdirSync(root).find(name => name.endsWith('.html') && name !== 'index.html');
if (!main) throw Error('Game HTML not found');
const translations = JSON.parse(fs.readFileSync(path.join(root, 'assets/localization/map-ru.json'), 'utf8'));
const textures = [
  ['posterImage', 'jpeg', 'robotics-ru.jpg'],
  ['mapImage', 'webp', 'kazakhstan-map-ru.webp'],
  ['atlas', 'jpeg', 'nvp-posters-ru.jpg']
];
// Editable geometry sources only. Historical before/v1/v2 snapshots stay archival.
const sources = fs.readdirSync(path.join(root, '.preview')).filter(name =>
  /^college[12]-.*\.js$/.test(name) && !/before|(?:^|-)v\d|layout-v/.test(name));
let changed = 0;
for (const relative of [main, ...sources.map(name => `.preview/${name}`)]) {
  const filename = path.join(root, relative);
  const original = fs.readFileSync(filename, 'utf8');
  let source = original;
  source = source.replaceAll('«КОЛЛЕДЖ МАҚТАНЫШЫ»', '«ГОРДОСТЬ КОЛЛЕДЖА»');
  for (const [from, to] of Object.entries(translations)) {
    for (const quote of ["'", '"', '`']) source = source.split(quote + from + quote).join(quote + to + quote);
  }
  // Long Russian headings must fit the existing plaque, without changing geometry.
  source = source.replace("g.fillText('ИСТОРИЧЕСКИЕ ЛИЧНОСТИ',177,164)",
    "g.fillText('ИСТОРИЧЕСКИЕ ЛИЧНОСТИ',177,164,232)");
  // Keep the photographed faces; exclude the tiny original-language captions.
  source = source.replaceAll('galleryImage,i*96,0,96,126,59,20,122,145', 'galleryImage,i*96,0,96,116,59,20,122,134');
  source = source.replaceAll('galleryImage,picture*96,0,96,126,125,18,91,119', 'galleryImage,picture*96,0,96,116,125,18,91,110');
  source = source.replace(/const quotation=galleryTexture\(576,72,\(g,w,h\)=>\{[\s\S]*?\n\s*\}\);/,
    `const quotation=galleryTexture(1536,76,(g,w,h)=>{\n    g.fillStyle='#6a4e35';g.fillRect(0,0,w,h);\n    g.strokeStyle='#b59668';g.lineWidth=3;g.strokeRect(5,5,w-10,h-10);\n    g.fillStyle='#e9dbbd';g.textAlign='center';g.font='bold 28px Georgia';\n    g.fillText('ЗНАНИЕ ИСТОРИИ ПОМОГАЕТ ПОНИМАТЬ НАСТОЯЩЕЕ',w/2,32,w-40);\n    g.fillText('И СОЗДАВАТЬ БУДУЩЕЕ',w/2,62,w-40);\n   });`);
  for (const [variable, format, asset] of textures) {
    const expression = new RegExp(`${variable}\\.src='data:image/${format};base64,[A-Za-z0-9+/=]+'`, 'g');
    if (!expression.test(source)) continue;
    const bytes = fs.readFileSync(path.join(root, 'assets/localization/textures', asset));
    expression.lastIndex = 0;
    source = source.replace(expression, `${variable}.src='data:image/${format};base64,${bytes.toString('base64')}'`);
  }
  if (source !== original) {
    // Respect each source file's existing line endings.
    if (original.includes('\r\n')) source = source.replace(/\r?\n/g, '\r\n');
    fs.writeFileSync(filename, source);
    changed++;
  }
}
console.log(`Russian map text synchronized: ${changed} file(s).`);
