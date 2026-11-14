import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export function embedFittedEyes(html,newline){
 const begin='// BEGIN FITTED_CHARACTER_EYES',end='// END FITTED_CHARACTER_EYES',block=[begin,fs.readFileSync(path.join(root,'assets/characters/shared/fitted-eyes.js'),'utf8').trim(),end,''].join('\n').replace(/\r?\n/g,newline);
 if(html.includes(begin)){const a=html.indexOf(begin),b=html.indexOf(end,a);if(b<a)throw Error('Missing fitted eyes block end');return html.slice(0,a)+block+html.slice(b+end.length).replace(/^\r?\n/,'');}
 const anchor=html.includes('// BEGIN CLOTHING_SELLER')?'// BEGIN CLOTHING_SELLER':'// BEGIN FRONT_STUDENT';if(!html.includes(anchor))throw Error('Missing character anchor');return html.replace(anchor,block+newline+anchor);
}
