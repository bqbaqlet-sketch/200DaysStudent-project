import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {MeshoptSimplifier} from 'meshoptimizer';
import {createCanvas,loadImage} from '@napi-rs/canvas';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(project,'assets/characters/bus-driver');
const source=fs.readFileSync(path.join(out,'source/base_basic_pbr.glb'));
const output=name=>path.join(out,name);
const jsonBytes=source.readUInt32LE(12),g=JSON.parse(source.subarray(20,20+jsonBytes));
const bin=source.subarray(28+jsonBytes);
function access(id){const a=g.accessors[id],v=g.bufferViews[a.bufferView];const Types={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array};const T=Types[a.componentType];const n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type];if(v.byteStride&&v.byteStride!==n*T.BYTES_PER_ELEMENT)throw Error('Interleaved attributes');return new T(bin.buffer,bin.byteOffset+(v.byteOffset??0)+(a.byteOffset??0),a.count*n);}
const p=g.meshes[0].primitives[0],pos=access(p.attributes.POSITION),normal=access(p.attributes.NORMAL),uv=access(p.attributes.TEXCOORD_0),indices=Uint32Array.from(access(p.indices));
await MeshoptSimplifier.ready;
const attributes=new Float32Array(pos.length/3*5);
for(let i=0;i<pos.length/3;i++)attributes.set([...normal.subarray(i*3,i*3+3),...uv.subarray(i*2,i*2+2)],i*5);
const [simple,error]=MeshoptSimplifier.simplifyWithAttributes(indices,pos,3,attributes,5,[.35,.35,.35,.7,.7],null,36000*3,.015,['Regularize']);
const [remap,count]=MeshoptSimplifier.compactMesh(simple);
const positions=new Float32Array(count*3),normals=new Float32Array(count*3),uvs=new Float32Array(count*2);
for(let old=0;old<remap.length;old++){const dest=remap[old];if(dest===0xffffffff)continue;positions.set(pos.subarray(old*3,old*3+3),dest*3);normals.set(normal.subarray(old*3,old*3+3),dest*3);uvs.set(uv.subarray(old*2,old*2+2),dest*2);}
const maps={};for(const [key,i] of [['normal',0],['color',1],['surface',2]]){const image=g.images[i],v=g.bufferViews[image.bufferView],img=await loadImage(bin.subarray(v.byteOffset,v.byteOffset+v.byteLength));const cv=createCanvas(1024,1024),ctx=cv.getContext('2d');ctx.drawImage(img,0,0,1024,1024);const buf=await cv.encode('webp',key==='color'?88:92);fs.writeFileSync(output(key+'.webp'),buf);maps[key]='data:image/webp;base64,'+buf.toString('base64');}
const a={vertices:count,triangles:simple.length/3,error,positions:Buffer.from(positions.buffer).toString('base64'),normals:Buffer.from(normals.buffer).toString('base64'),uvs:Buffer.from(uvs.buffer).toString('base64'),indices:Buffer.from(Uint32Array.from(simple).buffer).toString('base64'),maps};
const array=(s,T)=>{const b=Buffer.from(s,'base64');return new T(b.buffer,b.byteOffset,b.byteLength/T.BYTES_PER_ELEMENT)};
const packedPositions=array(a.positions,Float32Array),packedNormals=array(a.normals,Float32Array),packedUvs=array(a.uvs,Float32Array),idx=array(a.indices,Uint32Array);
const joints=[['hips',-1,[0,1.005,-.01]],['body',0,[0,1.13,-.015]],['head',1,[0,1.638,-.005]],
 ['armL',1,[-.218,1.505,-.012]],['elbowL',3,[-.462,1.326,-.002]],['handL',4,[-.659,1.181,.009]],
 ['thighL',0,[-.112,.992,-.008]],['shinL',6,[-.116,.537,-.006]],['footL',7,[-.122,.105,.025]],
 ['armR',1,[.218,1.505,-.012]],['elbowR',9,[.462,1.326,-.002]],['handR',10,[.659,1.181,.009]],
 ['thighR',0,[.112,.992,-.008]],['shinR',12,[.116,.537,-.006]],['footR',13,[.122,.105,.025]],
 ['fingersL',5,[-.728,1.12,.014]],['fingersR',11,[.728,1.12,.014]]];
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const si=new Uint8Array(a.vertices*4),sw=new Uint8Array(a.vertices*4);
for(let v=0;v<a.vertices;v++){
 const x=packedPositions[v*3],y=packedPositions[v*3+1],ax=Math.abs(x),right=x>0,weights=new Map();
 const add=(i,w)=>weights.set(i,(weights.get(i)??0)+w);
 if(ax>.30||ax>.205&&y>1.61-.74*ax-.12){
  const arm=smooth(.205,.30,ax),elbow=smooth(.405,.515,ax),hand=smooth(.615,.705,ax),base=right?9:3;
  const fingers=smooth(.705,.752,ax);
  add(1,1-arm);add(base,arm*(1-elbow));add(base+1,arm*elbow*(1-hand));add(base+2,arm*elbow*hand*(1-fingers));add(right?16:15,arm*elbow*hand*fingers);
 }else if(y<1.025){
  const leg=smooth(.995,.89,y),knee=1-smooth(.46,.60,y),foot=1-smooth(.10,.20,y),side=smooth(-.05,.05,x);
  add(0,1-leg);
  for(const [base,s] of [[6,1-side],[12,side]]){add(base,leg*s*(1-knee));add(base+1,leg*s*knee*(1-foot));add(base+2,leg*s*knee*foot);}
 }else{const head=smooth(1.595,1.695,y),body=smooth(1.025,1.16,y);add(0,(1-body)*(1-head));add(1,body*(1-head));add(2,head);}
 const list=[...weights].filter(([,w])=>w>0).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=list.reduce((n,[,w])=>n+w,0);let total=0;
 list.forEach(([id,w],i)=>{si[v*4+i]=id;sw[v*4+i]=Math.round(w/sum*255);total+=sw[v*4+i]});sw[v*4]+=255-total;
}
const pp=Int16Array.from(packedPositions,v=>Math.round(v*12000)),nn=Int8Array.from(packedNormals,v=>Math.round(Math.max(-1,Math.min(1,v))*127)),uu=Uint16Array.from(packedUvs,v=>Math.round(Math.max(0,Math.min(1,v))*65535));
const chunks=[];let offset=0;for(const ar of [pp,nn,uu,si,sw,Uint16Array.from(idx)]){const b=Buffer.from(ar.buffer,ar.byteOffset,ar.byteLength);chunks.push(b);offset+=b.length;const pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad}}
const asset={vertices:a.vertices,indexCount:idx.length,joints,mesh:Buffer.concat(chunks).toString('base64'),maps:a.maps,armBindCorrection:true,restHandsInLap:true};
fs.writeFileSync(output('driver-asset.json'),JSON.stringify(asset));

const main=fs.readdirSync(project).find(f => f !== 'index.html' && f.endsWith('.html'));
const file=path.join(project,main),original=fs.readFileSync(file,'utf8');
const begin='// BEGIN BUS_DRIVER',end='// END BUS_DRIVER';
const runtime=fs.readFileSync(output('driver-animation.js'),'utf8');
const newline=original.includes('\r\n')?'\r\n':'\n';
const block=(begin+'\nconst busDriverAsset='+JSON.stringify(asset)+';\n'+runtime+'\n'+end+'\n').replace(/\r?\n/g,newline);
let updated;
if(original.includes(begin)){const start=original.indexOf(begin),finish=original.indexOf(end,start);if(finish<0)throw Error('Driver block end missing');updated=original.slice(0,start)+block+original.slice(finish+end.length).replace(/^\r?\n/,'')}
else{const anchor='function buildTransportBus(asset){';if(original.split(anchor).length!==2)throw Error('Bus builder must occur once');updated=original.replace(anchor,block+'\n'+anchor)}
fs.writeFileSync(file,updated);
fs.writeFileSync(output('preparation.json'),JSON.stringify({source:'source/base_basic_pbr.glb',originalTriangles:indices.length/3,triangles:idx.length/3,vertices:a.vertices,skeletonJoints:joints.length,textureSize:1024,simplificationError:error,packedGeometryBytes:offset},null,2)+'\n');
console.log(JSON.stringify({triangles:idx.length/3,vertices:a.vertices,skeletonJoints:joints.length,packedGeometryBytes:offset}));
