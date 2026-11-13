import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

export function readCharacterVoices(root){
 return JSON.parse(fs.readFileSync(path.join(root,'assets/voices/dialogue.json'),'utf8'));
}

export function buildCharacterDialogue(root,character,manifest=readCharacterVoices(root)){
 const definition=manifest.characters[character];if(!definition)throw Error('Missing character voice: '+character);
 const folder=path.join(root,'assets/voices');
 return Object.fromEntries(Object.entries(definition.lines).map(([id,line])=>{
  const file=path.resolve(folder,line.file);
  if(path.dirname(file)!==folder||!file.endsWith('.mp3'))throw Error('Invalid voice file: '+line.file);
  if(!line.text?.trim()||!Number.isFinite(line.duration)||line.duration<=0)throw Error('Invalid voice line: '+character+'.'+id);
  const bytes=fs.readFileSync(file),sha256=createHash('sha256').update(bytes).digest('hex');
  if(sha256!==line.sha256)throw Error('Voice checksum mismatch: '+line.file);
  return [id,{text:line.text,ms:Math.ceil(line.duration*1000),audio:'data:audio/mpeg;base64,'+bytes.toString('base64')}];
 }));
}
