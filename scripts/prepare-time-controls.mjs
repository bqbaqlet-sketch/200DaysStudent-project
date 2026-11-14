import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),folder=path.join(root,'assets/time-controls');
const file=path.join(root,fs.readdirSync(root).find(f=>f!=='index.html'&&f.endsWith('.html')));
let html=fs.readFileSync(file,'utf8');const newline=html.includes('\r\n')?'\r\n':'\n';
const normalized=text=>text.replace(/\r?\n/g,newline);
function replace(from,to){if(html.split(from).length!==2)throw Error('Missing/ambiguous time control hook: '+from.slice(0,100));html=html.replace(from,to);}
function embed(begin,end,source,anchor){
 const block=normalized(begin+'\n'+source.trim()+'\n'+end+'\n');
 if(html.includes(begin)){const start=html.indexOf(begin),stop=html.indexOf(end,start);if(stop<start)throw Error('Missing time control block end');html=html.slice(0,start)+block+html.slice(stop+end.length).replace(/^\r?\n/,'');}
 else replace(anchor,block+anchor);
}
embed('/* BEGIN TIME_CONTROLS_STYLE */','/* END TIME_CONTROLS_STYLE */',fs.readFileSync(path.join(folder,'time-controls.css'),'utf8'),'</style>');
embed('<!-- BEGIN TIME_CONTROLS_UI -->','<!-- END TIME_CONTROLS_UI -->',fs.readFileSync(path.join(folder,'time-controls.html'),'utf8'),'<div id="interaction">');
embed('// BEGIN TIME_CONTROLS','// END TIME_CONTROLS',fs.readFileSync(path.join(folder,'time-controls.js'),'utf8')+'\ntimeControls=createTimeControls();', '// Цвет неба и сила света меняются плавно между ключевыми моментами.');
if(!html.includes('aria-controls="timeControls"')){
 replace('<div id="gameClock" aria-label="Игровое время">','<button type="button" id="gameClock" aria-label="Игровое время — перемотать" aria-controls="timeControls" aria-expanded="false" title="Скоротать время (T)">');
 replace('<span id="clockPhase">День 1 · Утро</span></div>','<span id="clockPhase">День 1 · Утро</span><span class="clockAction" aria-hidden="true">↔</span></button>');
}
if(!html.includes('clockState=null,timeControls=null;'))replace('clockFrame=null,clockState=null;','clockFrame=null,clockState=null,timeControls=null;');
if(!html.includes('if(document.hidden||sh>sw||timeControls?.opened)'))replace('if(document.hidden||sh>sw){clockFrame=null;return}','if(document.hidden||sh>sw||timeControls?.opened){clockFrame=null;return}');
if(!html.includes('shift(minutes){'))replace(" get:()=>({...clockState}),"," get:()=>({...clockState}),"+newline+normalized(` shift(minutes){
  if(!Number.isSafeInteger(minutes))throw new RangeError('Сдвиг времени должен быть целым числом минут');
  const total=Math.max(0,Math.floor(clockElapsedMs/REAL_MS_PER_GAME_MINUTE)+minutes);
  if(!Number.isSafeInteger(total))throw new RangeError('Игровое время вне диапазона');
  return gameTime.set(Math.floor(total/GAME_DAY_MINUTES)+1,Math.floor(total%GAME_DAY_MINUTES/60),total%60);
 },`));
if(!html.includes('if(timeControls.opened){clockFrame=null;'))replace(' advanceGameClock(t);busTransit.update(dt);',' if(timeControls.opened){clockFrame=null;R.render(activeWorld.scene,C);return;}'+newline+' advanceGameClock(t);busTransit.update(dt);');
if(!html.includes('T — перемотать'))replace('L — смена локации.</p>','L — смена локации. T — перемотать время (или нажмите на часы).</p>');
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);fs.writeFileSync(file,html);console.log('Updated clock button, time menu and game clock pause/shift');
