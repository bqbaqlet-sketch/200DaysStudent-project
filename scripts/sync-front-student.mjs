import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {embedFittedEyes} from './lib/embed-fitted-eyes.mjs';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),folder=path.join(root,'assets/characters/student-front108'),file=path.join(root,fs.readdirSync(root).find(f=>f!=='index.html'&&f.endsWith('.html')));
let html=fs.readFileSync(file,'utf8');const newline=html.includes('\r\n')?'\r\n':'\n',begin='// BEGIN FRONT_STUDENT',end='// END FRONT_STUDENT';
const block=[begin,'const frontStudentAsset='+fs.readFileSync(path.join(folder,'student-asset.json'),'utf8').trim()+';','const frontStudentEyes='+fs.readFileSync(path.join(folder,'eye-profile.json'),'utf8').trim()+';',fs.readFileSync(path.join(folder,'student-eyes.js'),'utf8').trim(),fs.readFileSync(path.join(folder,'student-runtime.js'),'utf8').trim(),end,''].join('\n').replace(/\r?\n/g,newline);
if(html.includes(begin)){const a=html.indexOf(begin),b=html.indexOf(end,a);if(b<a)throw Error('Missing front student block end');html=html.slice(0,a)+block+html.slice(b+end.length).replace(/^\r?\n/,'');}
else{const anchor='function buildCollegeEntranceInterior(){';if(html.split(anchor).length!==2)throw Error('Missing college builder');html=html.replace(anchor,block+newline+anchor);}
if(!html.includes('frontStudent108,student108Seats')){
 const replace=(from,to)=>{if(html.split(from).length!==2)throw Error('Ambiguous scene hook: '+from.slice(0,80));html=html.replace(from,to);};
 replace('alexey108,misha108,student108Seats,classroom108Crossing','alexey108,misha108,frontStudent108,student108Seats,classroom108Crossing');
 replace("{id:'misha-108',tableX:6.65,tableZ:13.32,side:-1}","{id:'misha-108',tableX:6.65,tableZ:13.32,side:-1},"+newline+"    {id:FRONT_STUDENT.id,...FRONT_STUDENT.seat}");
 replace('const [dimaSeat,sanyaSeat,alexeySeat,mishaSeat]=seats;','const [dimaSeat,sanyaSeat,alexeySeat,mishaSeat,frontSeat]=seats;');
 replace("   student108.name='Дима';","   frontStudent108=buildFrontStudentRoutine(studentAnchor,frontSeat.chair,classroom108Crossing,door108X,door108Z);"+newline+"   student108.name='Дима';");
 replace('[student108,sanya108,alexey108,misha108])student.root.userData','[student108,sanya108,alexey108,misha108,frontStudent108])student.root.userData');
 replace('[student108,alexey108,sanya108,misha108,nvp110','[student108,alexey108,sanya108,misha108,frontStudent108,nvp110');
 replace('sanya108,alexey108,misha108,student108Seats,teacher110','sanya108,alexey108,misha108,frontStudent108,student108Seats,teacher110');
}
html=embedFittedEyes(html,newline);
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);fs.writeFileSync(file,html);console.log('Updated front student, eyes and classroom 108 seat');
