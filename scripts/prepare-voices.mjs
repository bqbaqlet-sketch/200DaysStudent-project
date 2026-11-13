import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {readCharacterVoices,buildCharacterDialogue} from './character-dialogue.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),manifest=readCharacterVoices(root);
const main=path.join(root,fs.readdirSync(root).find(f=>f!=='index.html'&&f.endsWith('.html')));
let html=fs.readFileSync(main,'utf8');
function replaceOne(pattern,replacement,label){
 const hits=[...html.matchAll(new RegExp(pattern.source,pattern.flags.includes('g')?pattern.flags:pattern.flags+'g'))];
 if(hits.length!==1)throw Error('Expected one '+label+', got '+hits.length);html=html.replace(pattern,replacement);
}
const voices='const characterVoices=Object.freeze({'+Object.entries(manifest.characters).map(([name,value])=>JSON.stringify(name)+':Object.freeze('+JSON.stringify(value.profile)+')').join(',')+'});';
replaceOne(/const characterVoices=Object\.freeze\(\{[\s\S]*?\}\);/,()=>voices,'voice profiles');
for(const [character,constant] of [['medvedev','medvedevDialogue'],['larisa','director110Dialogue']]){
 const dialogue=buildCharacterDialogue(root,character,manifest);
 replaceOne(new RegExp('const '+constant+'=[^\\r\\n]*;'),()=> 'const '+constant+'='+JSON.stringify(dialogue)+';',constant);
 console.log(character+': '+Object.entries(dialogue).map(([id,line])=>id+' '+line.ms+' ms').join(', '));
}
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);fs.writeFileSync(main,html);
