import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),file=path.join(root,fs.readdirSync(root).find(name=>name!=='index.html'&&name.endsWith('.html')));
const original=fs.readFileSync(file,'utf8'),newline=original.includes('\r\n')?'\r\n':'\n',begin='// BEGIN ENTRANCE_INTERIOR',end='// END ENTRANCE_INTERIOR';
const image='data:image/webp;base64,'+fs.readFileSync(path.join(root,'assets/easter-eggs/spongebob-totya.webp')).toString('base64');
const source=fs.readFileSync(path.join(root,'.preview/entrance-interior.js'),'utf8').trim(),block=[begin,'const entranceEasterEggImage='+JSON.stringify(image)+';',source,end,''].join('\n').replace(/\r?\n/g,newline);
let updated;
if(original.includes(begin)){const first=original.indexOf(begin),last=original.indexOf(end,first);if(last<0)throw Error('Missing entrance end marker');updated=original.slice(0,first)+block+original.slice(last+end.length).replace(/^\r?\n/,'');}
else{const first=original.indexOf('function buildEntranceInterior(){'),last=original.indexOf('function hitsHingedLeaf(',first);if(first<0||last<0)throw Error('Missing entrance boundaries');updated=original.slice(0,first)+block+original.slice(last);}
new vm.Script(updated.match(/<script>([\s\S]*?)<\/script>/)[1]);fs.writeFileSync(file,updated);console.log('Updated entrance, ten door designs and the fifth-floor image');
