import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {embedFittedEyes} from './lib/embed-fitted-eyes.mjs';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),folder=path.join(root,'assets/characters/clothing-seller'),file=path.join(root,fs.readdirSync(root).find(f=>f!=='index.html'&&f.endsWith('.html')));
let html=fs.readFileSync(file,'utf8');const newline=html.includes('\r\n')?'\r\n':'\n',begin='// BEGIN CLOTHING_SELLER',end='// END CLOTHING_SELLER';
const block=[begin,'const clothingSellerAsset='+fs.readFileSync(path.join(folder,'seller-asset.json'),'utf8').trim()+';','const clothingSellerEyes='+fs.readFileSync(path.join(folder,'eye-profile.json'),'utf8').trim()+';',fs.readFileSync(path.join(folder,'seller-eyes.js'),'utf8').trim(),fs.readFileSync(path.join(folder,'seller-runtime.js'),'utf8').trim(),end,''].join('\n').replace(/\r?\n/g,newline);
if(html.includes(begin)){const a=html.indexOf(begin),b=html.indexOf(end,a);if(b<a)throw Error('Missing clothing seller block end');html=html.slice(0,a)+block+html.slice(b+end.length).replace(/^\r?\n/,'');}
else{const anchor='// BEGIN HOME_LOCATION';if(html.split(anchor).length!==2)throw Error('Missing home block');html=html.replace(anchor,block+newline+anchor);}
html=embedFittedEyes(html,newline);
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);fs.writeFileSync(file,html);console.log('Updated clothing seller and fitted eyes');
