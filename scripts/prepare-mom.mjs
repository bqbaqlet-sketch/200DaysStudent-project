import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),folder=path.join(root,'assets/characters/mom'),media=path.join(root,'assets/television');
const file=path.join(root,fs.readdirSync(root).find(f=>f!=='index.html'&&f.endsWith('.html'))),html=fs.readFileSync(file,'utf8'),newline=html.includes('\r\n')?'\r\n':'\n';
const begin='// BEGIN APARTMENT_MOM',end='// END APARTMENT_MOM';
const runtime=fs.readFileSync(path.join(folder,'mom-runtime.js'),'utf8'),eyes=fs.readFileSync(path.join(folder,'mom-eyes.js'),'utf8'),tv=fs.readFileSync(path.join(folder,'mom-tv.js'),'utf8'),remote=fs.readFileSync(path.join(folder,'mom-remote.js'),'utf8'),profile=JSON.parse(fs.readFileSync(path.join(folder,'eye-profile.json'),'utf8'));
const block=[begin,'const apartmentMomAsset='+fs.readFileSync(path.join(folder,'mom-asset.json'),'utf8').trim()+';',
 'const apartmentMomEyeProfile='+JSON.stringify(profile)+';',
 'const apartmentTelevisionPicture="data:image/jpeg;base64,'+fs.readFileSync(path.join(media,'mom-screen.jpg')).toString('base64')+'";',
 'const apartmentTelevisionGuitar="data:audio/wav;base64,'+fs.readFileSync(path.join(media,'mom-guitar.wav')).toString('base64')+'";',eyes.trim(),tv.trim(),remote.trim(),runtime.trim(),end,''].join('\n').replace(/\r?\n/g,newline);
let updated;
if(html.includes(begin)){const first=html.indexOf(begin),last=html.indexOf(end,first);if(last<0)throw Error('Missing mom block end');updated=html.slice(0,first)+block+html.slice(last+end.length).replace(/^\r?\n/,'')}
else{const first=html.indexOf('const apartmentMomAsset='),last=html.indexOf('function buildApartmentInterior(){',first);if(first<0||last<first)throw Error('Missing mom runtime');updated=html.slice(0,first)+block+newline+html.slice(last)}
updated=updated.replace('buildApartmentMom(scene,floorScale,bathroomDoor,television,colliders);','buildApartmentMom(scene,floorScale,bathroomDoor,television);');
new vm.Script(updated.match(/<script>([\s\S]*?)<\/script>/)[1]);fs.writeFileSync(file,updated);console.log('Updated mom, fitted eyes, television picture and guitar audio');
