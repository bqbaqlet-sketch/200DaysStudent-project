import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {MeshoptSimplifier} from 'meshoptimizer';
import {createCanvas,loadImage} from '@napi-rs/canvas';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(project,'assets/characters/misha');
const source=fs.readFileSync(path.join(out,'source/base_basic_pbr.glb'));
const jsonLength=source.readUInt32LE(12),gltf=JSON.parse(source.subarray(20,20+jsonLength));
const bin=source.subarray(28+jsonLength);
function accessor(id){
 const a=gltf.accessors[id],view=gltf.bufferViews[a.bufferView];
 const Type={5126:Float32Array,5125:Uint32Array,5123:Uint16Array}[a.componentType];
 const width={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type];
 if(!Type||!width||view.byteStride&&view.byteStride!==width*Type.BYTES_PER_ELEMENT)throw Error('Unsupported source accessor');
 return new Type(bin.buffer,bin.byteOffset+(view.byteOffset??0)+(a.byteOffset??0),a.count*width);
}
const primitive=gltf.meshes[0].primitives[0];
const positions=accessor(primitive.attributes.POSITION),normals=accessor(primitive.attributes.NORMAL);
const uvs=accessor(primitive.attributes.TEXCOORD_0),indices=Uint32Array.from(accessor(primitive.indices));
const attributes=new Float32Array(positions.length/3*5);
for(let i=0;i<positions.length/3;i++)attributes.set([...normals.subarray(i*3,i*3+3),...uvs.subarray(i*2,i*2+2)],i*5);
await MeshoptSimplifier.ready;
const [simplified,error]=MeshoptSimplifier.simplifyWithAttributes(indices,positions,3,attributes,5,[.35,.35,.35,.7,.7],null,36000*3,.015,['Regularize']);
const [remap,count]=MeshoptSimplifier.compactMesh(simplified);
if(count>=65536)throw Error('Too many vertices for the mobile packed format');
const pos=new Float32Array(count*3),normal=new Float32Array(count*3),uv=new Float32Array(count*2);
for(let i=0;i<remap.length;i++){
 const destination=remap[i];if(destination===0xffffffff)continue;
 pos.set(positions.subarray(i*3,i*3+3),destination*3);
 normal.set(normals.subarray(i*3,i*3+3),destination*3);
 uv.set(uvs.subarray(i*2,i*2+2),destination*2);
}
const material=gltf.materials[primitive.material],pbr=material.pbrMetallicRoughness;
const textureIds={color:pbr.baseColorTexture.index,normal:material.normalTexture.index,surface:pbr.metallicRoughnessTexture.index};
const maps={};
for(const [name,id] of Object.entries(textureIds)){
 const image=gltf.images[gltf.textures[id].source],view=gltf.bufferViews[image.bufferView];
 const picture=await loadImage(bin.subarray(view.byteOffset??0,(view.byteOffset??0)+view.byteLength));
 const canvas=createCanvas(1024,1024);canvas.getContext('2d').drawImage(picture,0,0,1024,1024);
 const bytes=await canvas.encode('webp',name==='color'?90:93);
 fs.writeFileSync(path.join(out,name+'.webp'),bytes);maps[name]='data:image/webp;base64,'+bytes.toString('base64');
}
// The supplied A-pose has no rig. These joints follow its shoulders, elbows,
// wrists, hips, knees and ankles; the existing student IK retargets the walk.
const joints=[['hips',-1,[0,1.004,-.012]],['body',0,[0,1.135,-.012]],['head',1,[0,1.650,.002]],
 ['armL',1,[-.217,1.510,.010]],['elbowL',3,[-.460,1.325,.035]],['handL',4,[-.660,1.178,.060]],
 ['thighL',0,[-.110,.995,-.014]],['shinL',6,[-.120,.540,.004]],['footL',7,[-.125,.104,.038]],
 ['armR',1,[.217,1.510,.010]],['elbowR',9,[.460,1.325,.035]],['handR',10,[.660,1.178,.060]],
 ['thighR',0,[.110,.995,-.014]],['shinR',12,[.120,.540,.004]],['footR',13,[.125,.104,.038]]];
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const skinIndex=new Uint8Array(count*4),skinWeight=new Uint8Array(count*4);
for(let i=0;i<count;i++){
 const x=pos[i*3],y=pos[i*3+1],ax=Math.abs(x),right=x>0,weights=new Map();
 const add=(id,w)=>weights.set(id,(weights.get(id)??0)+w);
 if(ax>.30||ax>.205&&y>1.61-.74*ax-.12){
  const arm=smooth(.205,.30,ax),elbow=smooth(.405,.515,ax),hand=smooth(.615,.705,ax),base=right?9:3;
  add(1,1-arm);add(base,arm*(1-elbow));add(base+1,arm*elbow*(1-hand));add(base+2,arm*elbow*hand);
 }else if(y<1.025){
  const leg=smooth(.995,.89,y),knee=1-smooth(.46,.60,y),foot=1-smooth(.10,.20,y),side=smooth(-.05,.05,x);
  add(0,1-leg);
  for(const [base,s] of [[6,1-side],[12,side]]){add(base,leg*s*(1-knee));add(base+1,leg*s*knee*(1-foot));add(base+2,leg*s*knee*foot);}
 }else{
  const head=smooth(1.595,1.695,y),body=smooth(1.025,1.16,y);
  add(0,(1-body)*(1-head));add(1,body*(1-head));add(2,head);
 }
 const list=[...weights].filter(([,w])=>w>0).sort((a,b)=>b[1]-a[1]).slice(0,4);
 const sum=list.reduce((total,[,w])=>total+w,0);let total=0;
 list.forEach(([id,w],j)=>{skinIndex[i*4+j]=id;skinWeight[i*4+j]=Math.round(w/sum*255);total+=skinWeight[i*4+j]});
 skinWeight[i*4]+=255-total;
}
const chunks=[];let packedBytes=0;
for(const array of [Int16Array.from(pos,v=>Math.round(v*12000)),Int8Array.from(normal,v=>Math.round(Math.max(-1,Math.min(1,v))*127)),Uint16Array.from(uv,v=>Math.round(Math.max(0,Math.min(1,v))*65535)),skinIndex,skinWeight,Uint16Array.from(simplified)]){
 const bytes=Buffer.from(array.buffer,array.byteOffset,array.byteLength);chunks.push(bytes);packedBytes+=bytes.length;
 const pad=(4-packedBytes%4)%4;if(pad){chunks.push(Buffer.alloc(pad));packedBytes+=pad;}
}
const asset={vertices:count,indexCount:simplified.length,joints,mesh:Buffer.concat(chunks).toString('base64'),maps,armBindCorrection:true,restHandsInLap:true};
fs.writeFileSync(path.join(out,'misha-asset.json'),JSON.stringify(asset));
const metadata={source:'source/base_basic_pbr.glb',sourceArchive:'5ea92504-7bae-4a48-8d7e-69c99798e210.zip',sourceSha256:createHash('sha256').update(source).digest('hex'),sourceTriangles:indices.length/3,triangles:simplified.length/3,vertices:count,joints:joints.length,textureSize:1024,simplificationError:error,packedGeometryBytes:packedBytes};
fs.writeFileSync(path.join(out,'preparation.json'),JSON.stringify(metadata,null,2)+'\n');
const file=path.join(project,fs.readdirSync(project).find(f=>f!=='index.html'&&f.endsWith('.html')));
const html=fs.readFileSync(file,'utf8'),begin='// BEGIN MISHA_STUDENT',end='// END MISHA_STUDENT',newline=html.includes('\r\n')?'\r\n':'\n';
const block=(begin+'\nconst misha108Asset='+JSON.stringify(asset)+';\n'+end+'\n').replace(/\r?\n/g,newline);
let updated;
if(html.includes(begin)){
 const first=html.indexOf(begin),last=html.indexOf(end,first);if(last<0)throw Error('Missing Misha block end');
 updated=html.slice(0,first)+block+html.slice(last+end.length).replace(/^\r?\n/,'');
}else{
 const anchor='function buildCollegeEntranceInterior(){';if(html.split(anchor).length!==2)throw Error('Expected one college builder');
 updated=html.replace(anchor,block+newline+anchor);
}
fs.writeFileSync(file,updated);console.log(JSON.stringify(metadata,null,2));
