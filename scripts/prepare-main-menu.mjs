import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const main=path.join(root,fs.readdirSync(root).find(name=>name!=='index.html'&&name.endsWith('.html')));
let html=fs.readFileSync(main,'utf8');const newline=html.includes('\r\n')?'\r\n':'\n';
html=html.replace('<title>Мой колледж 3D</title>','<title>200DaysStudent</title>');
const normalize=text=>text.replace(/\r?\n/g,newline);
function replaceOne(from,to,label=from.slice(0,60)){
 if(html.split(from).length!==2)throw Error('Missing or ambiguous hook: '+label);html=html.replace(from,to);
}
function embed(begin,end,source,anchor){
 const block=normalize(source.trim())+newline;
 if(html.includes(begin)){const first=html.indexOf(begin),last=html.indexOf(end,first);if(last<0)throw Error('Missing '+end);html=html.slice(0,first)+block+html.slice(last+end.length).replace(/^\r?\n/,'');}
 else replaceOne(anchor,block+anchor);
}
if(!html.includes('data-screen="intro"'))replaceOne('<html lang="ru">','<html lang="ru" data-screen="intro" data-mode="tester">');
const ui=fs.readFileSync(path.join(root,'assets/menu/main-menu.html'),'utf8');
if(!html.includes('<!-- BEGIN MAIN_MENU_UI -->')){
 const original=html.match(/<div class="ov" id="start">[^\r\n]*<\/div>/)?.[0];if(!original)throw Error('Original start screen missing');replaceOne(original,normalize(ui.trim()));
}else embed('<!-- BEGIN MAIN_MENU_UI -->','<!-- END MAIN_MENU_UI -->',ui,'</body>');
embed('/* BEGIN MAIN_MENU_STYLE */','/* END MAIN_MENU_STYLE */',fs.readFileSync(path.join(root,'assets/menu/main-menu.css'),'utf8'),'</style>');
if(!html.includes("let gameMode='tester',frontEnd=null;"))replaceOne("const R=new THREE.WebGLRenderer",normalize("let gameMode='tester',frontEnd=null;\nconst R=new THREE.WebGLRenderer"));
const oldStart=html.match(/document\.getElementById\('play'\)\.onclick=\(\)=>\{document\.getElementById\('start'\)\.style\.display='none';[\s\S]*?requestAnimationFrame\(loop\)\};/);
if(oldStart)replaceOne(oldStart[0],'// The main menu owns session launch and fullscreen entry.');
if(!html.includes('if(frontEnd?.blocking){clockFrame=null;frontEnd.render(t);return;}'))replaceOne(' if(timeControls.opened){clockFrame=null;',normalize(' if(frontEnd?.blocking){clockFrame=null;frontEnd.render(t);return;}\n if(timeControls.opened){clockFrame=null;'));
if(!html.includes('frontEnd?.updateStory();updateDirectorEjection(t);'))replaceOne(' updateDirectorEjection(t);updateInteraction(t);',' frontEnd?.updateStory();updateDirectorEjection(t);updateInteraction(t);');
if(!html.includes("if(gameMode!=='tester')return;"))replaceOne('function setFly(v){',normalize("function setFly(v){\n if(gameMode!=='tester')return;"));
html=html.replace("locationButton.onclick=()=>switchLocation();","locationButton.onclick=()=>{if(gameMode==='tester')switchLocation();};");
html=html.replace("if(e.code==='KeyL')switchLocation();","if(e.code==='KeyL'&&gameMode==='tester')switchLocation();");
const timeBegin='// BEGIN TIME_CONTROLS',timeEnd='// END TIME_CONTROLS';
const timeFile=path.join(root,'assets/time-controls/time-controls.js');
let time=fs.readFileSync(timeFile,'utf8');
if(!time.includes("if(gameMode!=='tester')return;")){
 time=time.replace(' function open(){'," function open(){\n  if(gameMode!=='tester')return;");fs.writeFileSync(timeFile,time);
}
embed(timeBegin,timeEnd,[timeBegin,time.trim(),'timeControls=createTimeControls();',timeEnd].join('\n'),'// Цвет неба и сила света меняются плавно между ключевыми моментами.');
const begin='// BEGIN MAIN_MENU_RUNTIME',end='// END MAIN_MENU_RUNTIME';
// Data URLs also work when the game is opened directly from the filesystem:
// Chrome treats separate file: images as cross-origin WebGL texture sources.
const backgrounds=Object.fromEntries(['home','college'].map(name=>[name,'data:image/jpeg;base64,'+fs.readFileSync(path.join(root,'assets/menu',name+'-background.jpg')).toString('base64')]));
const runtime=[begin,'const MAIN_MENU_BACKGROUNDS='+JSON.stringify(backgrounds)+';',fs.readFileSync(path.join(root,'assets/menu/main-menu.js'),'utf8').trim(),'frontEnd=createGameFrontEnd();window.mainMenu=frontEnd;','requestAnimationFrame(loop);',end].join('\n');
embed(begin,end,runtime,'</script></body></html>');
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);fs.writeFileSync(main,html);
console.log('Updated live main menu, ATM4 intro, story/tester modes and menu music settings.');
