import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,fs.readdirSync(root).find(f=>f!=='index.html'&&f.endsWith('.html')));
const original=fs.readFileSync(file,'utf8'),newline=original.includes('\r\n')?'\r\n':'\n';
const begin='// BEGIN COLLEGE1_ROOM212',end='// END COLLEGE1_ROOM212';
const block=fs.readFileSync(path.join(root,'.preview/college1-room212.js'),'utf8').trim().replace(/\r?\n/g,newline)+newline;
let updated;
if(original.includes(begin)){
 const first=original.indexOf(begin),last=original.indexOf(end,first);if(last<0)throw Error('Room 212 block end missing');
 updated=original.slice(0,first)+block+original.slice(last+end.length).replace(/^\r?\n/,'');
}else{
 const anchor=original.match(/^[ \t]*function buildRoom216\(doorWidth\)\{/m)?.[0];if(!anchor||original.split(anchor).length!==2)throw Error('Expected one room 216 builder');
 updated=original.replace(anchor,block+anchor);
}
// The closed 214 door stays in place. Its old preview meshes intersect the
// wider 212 floor and must not be regenerated inside the corrected room.
const preview=/^([ \t]*)\{\r?\n([ \t]*\/\/[^\r\n]*\r?\n[ \t]*const roomDepth=wing===)/m;
if(preview.test(updated))updated=updated.replace(preview,(_,indent,tail)=>indent+"if(!(wing==='upper-left'&&d.n==='214')){"+newline+indent+' // The inaccessible 214 preview overlapped the corrected room 212 footprint.'+newline+tail);
else if(!updated.includes("if(!(wing==='upper-left'&&d.n==='214')){"))throw Error('Missing classroom preview guard');
fs.writeFileSync(file,updated);console.log('Updated room 212 geometry block and adjacent preview guard.');
