import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),file=path.join(root,fs.readdirSync(root).find(name=>name!=='index.html'&&name.endsWith('.html')));
const html=fs.readFileSync(file,'utf8'),newline=html.includes('\r\n')?'\r\n':'\n',begin='// BEGIN HOME_LOCATION',end='// END HOME_LOCATION';
const runtime=fs.readFileSync(path.join(root,'.preview/playground-runtime.js'),'utf8').trim(),home=fs.readFileSync(path.join(root,'.preview/home-location.js'),'utf8').trim();
const block=[begin,runtime,home,end,''].join('\n').replace(/\r?\n/g,newline);let updated;
if(html.includes(begin)){const first=html.indexOf(begin),last=html.indexOf(end,first);if(last<0)throw Error('Missing home block end');updated=html.slice(0,first)+block+html.slice(last+end.length).replace(/^\r?\n/,'');}
else{const first=html.indexOf('function buildHomeLocation(){'),last=html.indexOf('// ---- Интерьер четвёртого подъезда.',first);if(first<0||last<0)throw Error('Missing home boundaries');updated=html.slice(0,first)+block+html.slice(last);}
new vm.Script(updated.match(/<script>([\s\S]*?)<\/script>/)[1]);fs.writeFileSync(file,updated);console.log('Updated home and playground mechanics');
