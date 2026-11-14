import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const main=path.join(root,fs.readdirSync(root).find(name=>name!=='index.html'&&name.endsWith('.html')));
let html=fs.readFileSync(main,'utf8');const newline=html.includes('\r\n')?'\r\n':'\n';
function once(from,to){const n=html.split(from).length-1;if(n!==1)throw Error(`Missing or ambiguous hook (${n}): ${from.slice(0,80)}`);html=html.replace(from,to);}
if(!html.includes("let gameAudio=null;"))once("let gameMode='tester',frontEnd=null;","let gameMode='tester',frontEnd=null;\nlet gameAudio=null;");
if(!html.includes("g.userData.collegePhysical=solid?'existing':'box';"))
 once('S.add(g);if(solid)cols.push([x1,z1,x2,z2]);return g}',"S.add(g);g.userData.collegePhysical=solid?'existing':'box';if(solid)cols.push([x1,z1,x2,z2]);return g}");
if(!html.includes("g.userData.collegePhysical='bench';"))
 once('g.position.set(x,y,z);g.rotation.y=r;S.add(g)}',"g.position.set(x,y,z);g.rotation.y=r;g.userData.collegePhysical='bench';S.add(g)}");
if(!html.includes('gameAudio?.update(dt);'))once(' if(frontEnd?.blocking){clockFrame=null;', ' gameAudio?.update(dt);\n if(frontEnd?.blocking){clockFrame=null;');
if(!html.includes('gameAudio?.interact(target);'))once('function completeInteraction(target){','function completeInteraction(target){\n gameAudio?.interact(target);');
// Door reach is measured from the supported feet, including the new raised landings.
html=html.replaceAll("currentLocation==='college'&&Math.abs(C.position.y-1.7)<.35&&",
 "currentLocation==='college'&&!fly&&Math.abs(C.position.y-(feetY+1.7))<.35&&");
if(!html.includes('if(id===\'college\'&&!fly){feetY=activeWorld.walkGroundAt'))
 once('feetY=state.feetY||0;updateFlyUI();',"feetY=state.feetY||0;if(id==='college'&&!fly){feetY=activeWorld.walkGroundAt?.(C.position.x,C.position.z,null)??feetY;C.position.y=feetY+1.7;}updateFlyUI();");
const assets={};
for(const name of fs.readdirSync(path.join(root,'assets/audio/samples')).sort()){
 if(!/\.(ogg|mp3)$/.test(name))continue;
 const key=name.replace(/\.(ogg|mp3)$/,''),mime=name.endsWith('.mp3')?'mpeg':'ogg';
 assets[key]='data:audio/'+mime+';base64,'+fs.readFileSync(path.join(root,'assets/audio/samples',name)).toString('base64');
}
const begin='// BEGIN WORLD_COLLISION_AUDIO',end='// END WORLD_COLLISION_AUDIO';
const block=[begin,fs.readFileSync(path.join(root,'assets/world/college-collision.js'),'utf8').trim(),
 'installCollegeCollision(locations.college);','const GAME_AUDIO_ASSETS='+JSON.stringify(assets)+';',
 fs.readFileSync(path.join(root,'assets/audio/game-audio.js'),'utf8').trim(),
 'gameAudio=createGameAudio();window.gameAudio=gameAudio;',end].join('\n');
if(html.includes(begin)){const a=html.indexOf(begin),b=html.indexOf(end,a);if(b<0)throw Error('Missing closing marker');html=html.slice(0,a)+block+html.slice(b+end.length);}
else once('// BEGIN MAIN_MENU_RUNTIME',block+'\n// BEGIN MAIN_MENU_RUNTIME');
html=html.replace(/\r?\n/g,newline);
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);fs.writeFileSync(main,html);
console.log(`Synchronized college collision mapping and ${Object.keys(assets).length} compressed sounds.`);
