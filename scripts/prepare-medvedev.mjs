import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {MeshoptSimplifier} from 'meshoptimizer';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import * as THREE from 'three';
import {buildMedvedevEyes} from '../assets/characters/medvedev/medvedev-eyes.mjs';
import {buildCharacterDialogue} from './character-dialogue.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'assets/characters/medvedev');
const eyeProfile=JSON.parse(fs.readFileSync(path.join(out,'eye-profile.json'),'utf8'));
const source=fs.readFileSync(path.join(out,'source/base_basic_pbr.glb'));
const length=source.readUInt32LE(12),g=JSON.parse(source.subarray(20,20+length)),bin=source.subarray(28+length);
const widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16},types={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};
function access(id){
 const a=g.accessors[id],v=g.bufferViews[a.bufferView],Type=types[a.componentType],width=widths[a.type];
 if(v.byteStride&&v.byteStride!==width*Type.BYTES_PER_ELEMENT)throw Error('Unexpected interleaved data');
 return new Type(bin.buffer,bin.byteOffset+(v.byteOffset??0)+(a.byteOffset??0),a.count*width);
}
const primitive=g.meshes[0].primitives[0],attrs=primitive.attributes;
const positions=access(attrs.POSITION),normals=access(attrs.NORMAL),uvs=access(attrs.TEXCOORD_0),indices=Uint32Array.from(access(primitive.indices));
await MeshoptSimplifier.ready;
const attributes=new Float32Array(positions.length/3*5);
for(let i=0;i<positions.length/3;i++)attributes.set([...normals.subarray(i*3,i*3+3),...uvs.subarray(i*2,i*2+2)],i*5);
const [simple,error]=MeshoptSimplifier.simplifyWithAttributes(indices,positions,3,attributes,5,[.35,.35,.35,.7,.7],null,36000*3,.015,['Regularize']);
const [remap,count]=MeshoptSimplifier.compactMesh(simple);
if(count>=65536)throw Error('Too many vertices for packed mobile character');
const pos=new Float32Array(count*3),normal=new Float32Array(count*3),uv=new Float32Array(count*2),joints=new Uint8Array(count*4),weights=new Uint8Array(count*4);
const sourceJoints=[access(attrs.JOINTS_0),access(attrs.JOINTS_1)],sourceWeights=[access(attrs.WEIGHTS_0),access(attrs.WEIGHTS_1)];
let maxDiscardedWeight=0,totalDiscardedWeight=0;
for(let old=0;old<remap.length;old++){
 const dest=remap[old];if(dest===0xffffffff)continue;
 pos.set(positions.subarray(old*3,old*3+3),dest*3);normal.set(normals.subarray(old*3,old*3+3),dest*3);uv.set(uvs.subarray(old*2,old*2+2),dest*2);
 const influences=[];for(let set=0;set<2;set++)for(let k=0;k<4;k++)influences.push([sourceJoints[set][old*4+k],sourceWeights[set][old*4+k]]);
 influences.sort((a,b)=>b[1]-a[1]);const kept=influences.slice(0,4),sum=kept.reduce((n,[,w])=>n+w,0),discarded=influences.slice(4).reduce((n,[,w])=>n+w,0);
 maxDiscardedWeight=Math.max(maxDiscardedWeight,discarded);totalDiscardedWeight+=discarded;
 let total=0;kept.forEach(([id,w],i)=>{joints[dest*4+i]=id;weights[dest*4+i]=Math.round(w/sum*255);total+=weights[dest*4+i]});weights[dest*4]+=255-total;
}
const maps={},images=[];
for(const [name,index] of [['normal',0],['color',1],['surface',2]]){
 const image=g.images[index],view=g.bufferViews[image.bufferView],original=await loadImage(bin.subarray(view.byteOffset,view.byteOffset+view.byteLength));
 const canvas=createCanvas(1024,1024);canvas.getContext('2d').drawImage(original,0,0,1024,1024);
 const bytes=await canvas.encode('webp',name==='color'?89:92);fs.writeFileSync(path.join(out,name+'.webp'),bytes);images[index]=bytes;maps[name]='data:image/webp;base64,'+bytes.toString('base64');
}
const packed=[];let packedSize=0;
for(const ar of [Int16Array.from(pos,v=>Math.round(v*12000)),Int8Array.from(normal,v=>Math.round(Math.max(-1,Math.min(1,v))*127)),Uint16Array.from(uv,v=>Math.round(Math.max(0,Math.min(1,v))*65535)),joints,weights,Uint16Array.from(simple)]){
 const data=Buffer.from(ar.buffer,ar.byteOffset,ar.byteLength);packed.push(data);packedSize+=data.length;const pad=(4-packedSize%4)%4;if(pad){packed.push(Buffer.alloc(pad));packedSize+=pad}
}
const b64=a=>Buffer.from(a.buffer,a.byteOffset,a.byteLength).toString('base64');
const animations=g.animations.map((animation,index)=>({
 name:['Medvedev_Stance','Medvedev_Walk_Source','Medvedev_Idle'][index],sourceName:animation.name,
 duration:Math.max(...animation.samplers.map(s=>access(s.input).at(-1))),
 tracks:animation.channels.map(channel=>{
  const sampler=animation.samplers[channel.sampler],a=access(sampler.input),values=access(sampler.output),width=widths[g.accessors[sampler.output].type];
  let constant=true;for(let i=width;i<values.length&&constant;i++)if(Math.abs(values[i]-values[i%width])>1e-7)constant=false;
  return {node:channel.target.node,path:channel.target.path,times:b64(constant?a.subarray(0,1):a),values:b64(constant?values.subarray(0,width):values)};
 })
}));
const walk=g.animations[1],hipChannel=walk.channels.find(c=>g.nodes[c.target.node].name==='Hips'&&c.target.path==='translation'),hipData=access(walk.samplers[hipChannel.sampler].output);
const stride=hipData.at(-1)-hipData[2];
const asset={vertices:count,indexCount:simple.length,mesh:Buffer.concat(packed).toString('base64'),maps,nodes:g.nodes,roots:g.scenes[g.scene??0].nodes,skin:g.skins[0],inverseBind:b64(access(g.skins[0].inverseBindMatrices)),animations,stride,eyes:eyeProfile};
fs.writeFileSync(path.join(out,'medvedev-asset.json'),JSON.stringify(asset));

// A standalone glTF keeps the original skeleton and all three untouched source clips.
const gltf={asset:{version:'2.0',generator:'200DaysStudent native animation preparation'},scene:0,scenes:g.scenes,nodes:structuredClone(g.nodes),meshes:[{name:'Medvedev-mobile',primitives:[]}],skins:[{...g.skins[0]}],animations:[],materials:g.materials,samplers:g.samplers,textures:g.textures.map(t=>({...t,source:undefined,extensions:{EXT_texture_webp:{source:t.source}}})),images:[],buffers:[{byteLength:0}],bufferViews:[],accessors:[],extensionsUsed:['EXT_texture_webp'],extensionsRequired:['EXT_texture_webp']};
const buffers=[];let binarySize=0;
function view(bytes,target){const pad=(4-binarySize%4)%4;if(pad){buffers.push(Buffer.alloc(pad));binarySize+=pad}const index=gltf.bufferViews.length;gltf.bufferViews.push({buffer:0,byteOffset:binarySize,byteLength:bytes.length,...target?{target}:{}});buffers.push(bytes);binarySize+=bytes.length;return index;}
function accessor(array,type,componentType,normalized=false,min,max){const id=gltf.accessors.length;gltf.accessors.push({bufferView:view(Buffer.from(array.buffer,array.byteOffset,array.byteLength)),componentType,count:array.length/widths[type],type,...normalized?{normalized:true}:{},...min?{min,max}:{}});return id;}
const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<pos.length;i++){min[i%3]=Math.min(min[i%3],pos[i]);max[i%3]=Math.max(max[i%3],pos[i]);}
gltf.meshes[0].primitives.push({attributes:{POSITION:accessor(pos,'VEC3',5126,false,min,max),NORMAL:accessor(normal,'VEC3',5126),TEXCOORD_0:accessor(uv,'VEC2',5126),JOINTS_0:accessor(joints,'VEC4',5121),WEIGHTS_0:accessor(weights,'VEC4',5121,true)},indices:accessor(Uint16Array.from(simple),'SCALAR',5123),material:0});
gltf.skins[0].inverseBindMatrices=accessor(access(g.skins[0].inverseBindMatrices),'MAT4',5126);
for(const a of g.animations){const times=new Map();gltf.animations.push({name:a.name,channels:a.channels,samplers:a.samplers.map(s=>{
 const input=access(s.input);if(!times.has(s.input))times.set(s.input,accessor(input,'SCALAR',5126,false,[input[0]],[input.at(-1)]));
 return {...s,input:times.get(s.input),output:accessor(access(s.output),g.accessors[s.output].type,5126)};
})});}
// Additional eye surfaces follow the existing Head joint in every source clip.
const headNode=g.nodes.findIndex(n=>n.name==='Head'),headJoint=g.skins[0].joints.indexOf(headNode);
const headMatrix=new THREE.Matrix4().fromArray(access(g.skins[0].inverseBindMatrices),headJoint*16).invert(),head=new THREE.Object3D();
headMatrix.decompose(head.position,head.quaternion,head.scale);head.updateMatrixWorld(true);
const eyes=buildMedvedevEyes(THREE,head,eyeProfile),eyeMaterial=gltf.materials.length;
gltf.materials.push({name:'Medvedev-eyes',pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],metallicFactor:0,roughnessFactor:.38},alphaMode:'BLEND'});
let eyeTriangles=0;
for(const eye of eyes.eyes){
 const geometry=eye.geometry;geometry.computeBoundingBox();eyeTriangles+=geometry.index.count/3;
 const meshId=gltf.meshes.length;gltf.meshes.push({name:eye.name,primitives:[{attributes:{
  POSITION:accessor(geometry.attributes.position.array,'VEC3',5126,false,geometry.boundingBox.min.toArray(),geometry.boundingBox.max.toArray()),
  NORMAL:accessor(geometry.attributes.normal.array,'VEC3',5126),COLOR_0:accessor(geometry.attributes.color.array,'VEC4',5126)
 },indices:accessor(geometry.index.array,'SCALAR',5123),material:eyeMaterial}]});
 const nodeId=gltf.nodes.length;gltf.nodes.push({name:eye.name,mesh:meshId,translation:eye.position.toArray(),rotation:eye.quaternion.toArray()});
 (gltf.nodes[headNode].children??=[]).push(nodeId);
}
for(let i=0;i<images.length;i++)gltf.images.push({name:g.images[i].name,mimeType:'image/webp',bufferView:view(images[i])});
const binaryPad=(4-binarySize%4)%4;if(binaryPad){buffers.push(Buffer.alloc(binaryPad));binarySize+=binaryPad}gltf.buffers[0].byteLength=binarySize;
let json=Buffer.from(JSON.stringify(gltf));const jsonPad=(4-json.length%4)%4;json=Buffer.concat([json,Buffer.alloc(jsonPad,32)]);
const header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+binarySize,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);
const binHeader=Buffer.alloc(8);binHeader.writeUInt32LE(binarySize,0);binHeader.writeUInt32LE(0x004e4942,4);
fs.writeFileSync(path.join(out,'medvedev-prepared.glb'),Buffer.concat([header,json,binHeader,...buffers]));
const metadata={vertices:count,triangles:simple.length/3,sourceTriangles:indices.length/3,joints:g.skins[0].joints.length,clips:animations.map(a=>({name:a.name,source:a.sourceName,duration:a.duration})),stride,simplificationError:error,maxDiscardedWeight,averageDiscardedWeight:totalDiscardedWeight/count,eyeTriangles,totalTriangles:simple.length/3+eyeTriangles,eyeRevision:eyeProfile.revision};
fs.writeFileSync(path.join(out,'preparation.json'),JSON.stringify(metadata,null,2)+'\n');
const runtimePath=path.join(out,'medvedev-animation.js');
if(fs.existsSync(runtimePath)){
 const main=path.join(root,fs.readdirSync(root).find(f => f !== 'index.html' && f.endsWith('.html'))),original=fs.readFileSync(main,'utf8'),begin='// BEGIN MEDVEDEV_CHARACTER',end='// END MEDVEDEV_CHARACTER',newline=original.includes('\r\n')?'\r\n':'\n';
 const dialogue=buildCharacterDialogue(root,'medvedev');
 const block=(begin+'\nconst medvedevAsset='+JSON.stringify(asset)+';\nconst medvedevDialogue='+JSON.stringify(dialogue)+';\n'+fs.readFileSync(path.join(out,'medvedev-eyes.mjs'),'utf8').replace('export function','function')+'\n'+fs.readFileSync(runtimePath,'utf8')+'\n'+end+'\n').replace(/\r?\n/g,newline);
 let updated;if(original.includes(begin)){const start=original.indexOf(begin),finish=original.indexOf(end,start);if(finish<0)throw Error('Missing block end');updated=original.slice(0,start)+block+original.slice(finish+end.length).replace(/^\r?\n/,'');}
 else{const anchor='function buildCollegeEntranceInterior(){';if(original.split(anchor).length!==2)throw Error('Missing unique college builder');updated=original.replace(anchor,block+newline+anchor);}
 fs.writeFileSync(main,updated);
}
console.log(JSON.stringify(metadata,null,2));
