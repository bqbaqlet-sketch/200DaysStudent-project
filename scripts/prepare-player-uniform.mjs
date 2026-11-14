import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {MeshoptSimplifier} from 'meshoptimizer';
import {createCanvas,loadImage} from '@napi-rs/canvas';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),folder=path.join(root,'assets/characters/player-uniform');
const source=fs.readFileSync(path.join(folder,'source/base_basic_pbr.glb'));
const length=source.readUInt32LE(12),gltf=JSON.parse(source.subarray(20,20+length)),bin=source.subarray(28+length);
function read(id){
 const a=gltf.accessors[id],view=gltf.bufferViews[a.bufferView],Type={5126:Float32Array,5125:Uint32Array,5123:Uint16Array}[a.componentType],width={SCALAR:1,VEC2:2,VEC3:3}[a.type];
 if(!Type||!width||view.byteStride&&view.byteStride!==width*Type.BYTES_PER_ELEMENT)throw Error('Unsupported uniform accessor');
 return new Type(bin.buffer,bin.byteOffset+(view.byteOffset??0)+(a.byteOffset??0),a.count*width);
}
const primitive=gltf.meshes[0].primitives[0],position=Float32Array.from(read(primitive.attributes.POSITION)),normal=Float32Array.from(read(primitive.attributes.NORMAL)),uv=Float32Array.from(read(primitive.attributes.TEXCOORD_0)),index=Uint32Array.from(read(primitive.indices));
const bounds=new THREE.Box3().setFromBufferAttribute(new THREE.BufferAttribute(position,3)),height=1.85,scale=height/(bounds.max.y-bounds.min.y),center=(bounds.max.x+bounds.min.x)/2;
for(let i=0;i<position.length;i+=3){position[i]=(position[i]-center)*scale;position[i+1]=(position[i+1]-bounds.min.y)*scale;position[i+2]*=scale;}
const attributes=new Float32Array(position.length/3*5);
for(let i=0;i<position.length/3;i++)attributes.set([...normal.subarray(i*3,i*3+3),...uv.subarray(i*2,i*2+2)],i*5);
await MeshoptSimplifier.ready;
const [simplified,error]=MeshoptSimplifier.simplifyWithAttributes(index,position,3,attributes,5,[.35,.35,.35,.85,.85],null,48000*3,.012,['Regularize']);
const [remap,count]=MeshoptSimplifier.compactMesh(simplified);if(count>=65536)throw Error('Uniform exceeds the packed vertex limit');
const pp=new Float32Array(count*3),nn=new Float32Array(count*3),uu=new Float32Array(count*2);
for(let i=0;i<remap.length;i++){const destination=remap[i];if(destination===0xffffffff)continue;pp.set(position.subarray(i*3,i*3+3),destination*3);nn.set(normal.subarray(i*3,i*3+3),destination*3);uu.set(uv.subarray(i*2,i*2+2),destination*2);}
const casual=JSON.parse(fs.readFileSync(path.join(root,'assets/characters/player/player-asset.json'),'utf8')),joints=casual.joints,proportion=height/1.9085;
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const skinIndex=new Uint8Array(count*4),skinWeight=new Uint8Array(count*4);
for(let i=0;i<count;i++){
 const x=pp[i*3]/proportion,y=pp[i*3+1]/proportion,ax=Math.abs(x),right=x>0,weights=new Map(),add=(id,w)=>weights.set(id,(weights.get(id)??0)+w);
 if(ax>.30||ax>.205&&y>1.61-.74*ax-.12){const arm=smooth(.205,.30,ax),elbow=smooth(.405,.515,ax),hand=smooth(.615,.705,ax),base=right?9:3;add(1,1-arm);add(base,arm*(1-elbow));add(base+1,arm*elbow*(1-hand));add(base+2,arm*elbow*hand);}
 else if(y<1.025){const leg=smooth(.995,.89,y),knee=1-smooth(.46,.60,y),foot=1-smooth(.10,.20,y),side=smooth(-.05,.05,x);add(0,1-leg);for(const [base,s] of [[6,1-side],[12,side]]){add(base,leg*s*(1-knee));add(base+1,leg*s*knee*(1-foot));add(base+2,leg*s*knee*foot);}}
 else{const head=smooth(1.595,1.695,y),body=smooth(1.025,1.16,y);add(0,(1-body)*(1-head));add(1,body*(1-head));add(2,head);}
 const list=[...weights].filter(([,w])=>w>0).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=list.reduce((s,[,w])=>s+w,0);let total=0;
 list.forEach(([id,w],j)=>{skinIndex[i*4+j]=id;skinWeight[i*4+j]=Math.round(w/sum*255);total+=skinWeight[i*4+j]});skinWeight[i*4]+=255-total;
}
const material=gltf.materials[primitive.material],pbr=material.pbrMetallicRoughness,maps={};
for(const [key,id] of Object.entries({color:pbr.baseColorTexture.index,normal:material.normalTexture.index,surface:pbr.metallicRoughnessTexture.index})){
 const view=gltf.bufferViews[gltf.images[gltf.textures[id].source].bufferView],image=await loadImage(bin.subarray(view.byteOffset??0,(view.byteOffset??0)+view.byteLength)),size=key==='color'?1536:1024;
 const canvas=createCanvas(size,size);canvas.getContext('2d').drawImage(image,0,0,size,size);const bytes=await canvas.encode('webp',94);fs.writeFileSync(path.join(folder,key+'.webp'),bytes);maps[key]='data:image/webp;base64,'+bytes.toString('base64');
}
const chunks=[];let bytes=0;
for(const array of [Int16Array.from(pp,v=>Math.round(v*12000)),Int8Array.from(nn,v=>Math.round(Math.max(-1,Math.min(1,v))*127)),Uint16Array.from(uu,v=>Math.round(Math.max(0,Math.min(1,v))*65535)),skinIndex,skinWeight,Uint16Array.from(simplified)]){
 const buffer=Buffer.from(array.buffer,array.byteOffset,array.byteLength);chunks.push(buffer);bytes+=buffer.length;const padding=(4-bytes%4)%4;if(padding){chunks.push(Buffer.alloc(padding));bytes+=padding;}
}
// Separate the clothing from skin using the saved diffuse maps. This keeps the
// player's original face/neck and removes bare forearms from clothes on hangers.
const casualBytes=Buffer.from(casual.mesh,'base64');let casualOffset=0;
function packed(Type,n){const array=new Type(casualBytes.buffer,casualBytes.byteOffset+casualOffset,n);casualOffset=Math.ceil((casualOffset+array.byteLength)/4)*4;return array;}
const cp=Float32Array.from(packed(Int16Array,casual.vertices*3),v=>v/12000);packed(Int8Array,casual.vertices*3);
const cu=Float32Array.from(packed(Uint16Array,casual.vertices*2),v=>v/65535);packed(Uint8Array,casual.vertices*4);packed(Uint8Array,casual.vertices*4);const ci=packed(Uint16Array,casual.indexCount);
async function samples(file){const image=await loadImage(file),canvas=createCanvas(image.width,image.height),context=canvas.getContext('2d');context.drawImage(image,0,0);return {data:context.getImageData(0,0,image.width,image.height).data,width:image.width,height:image.height};}
const casualPixels=await samples(path.join(root,'assets/characters/player/color.webp')),uniformPixels=await samples(path.join(folder,'color.webp'));
function makeMask(p,u,indices,pixels,keep){
 const mask=new Uint8Array(Math.ceil(indices.length/3/8));let triangles=0;
 for(let i=0;i<indices.length;i+=3){
  const ids=[indices[i],indices[i+1],indices[i+2]],y=ids.map(id=>p[id*3+1]),x=ids.map(id=>p[id*3]),cy=y.reduce((a,b)=>a+b,0)/3,cx=x.reduce((a,b)=>a+b,0)/3;
  const tu=ids.reduce((sum,id)=>sum+u[id*2],0)/3,tv=ids.reduce((sum,id)=>sum+u[id*2+1],0)/3;
  const pixel=(Math.max(0,Math.min(pixels.height-1,Math.floor(tv*pixels.height)))*pixels.width+Math.max(0,Math.min(pixels.width-1,Math.floor(tu*pixels.width))))*4;
  const [r,g,b]=pixels.data.subarray(pixel,pixel+3),skin=r>g*1.04&&r>b*1.13&&r>60&&g>40;
  if(keep({minY:Math.min(...y),maxY:Math.max(...y),maxX:Math.max(...x.map(Math.abs)),cy,cx,skin})){const triangle=i/3;mask[triangle>>3]|=1<<(triangle&7);triangles++;}
 }
 return {mask:Buffer.from(mask).toString('base64'),triangles};
}
const head=makeMask(cp,cu,ci,casualPixels,s=>s.minY>1.535&&s.maxX<.17&&(s.cy>1.61||s.skin));
const body=makeMask(pp,uu,simplified,uniformPixels,s=>s.maxY<1.565);
const hanging=s=>s.minY>.155&&s.maxY<1.565&&s.maxX<.635&&!(s.cy>1.025&&s.skin);
const casualHanging=makeMask(cp,cu,ci,casualPixels,hanging),uniformHanging=makeMask(pp,uu,simplified,uniformPixels,hanging);
const parts={head:head.mask,body:body.mask,casualHanging:casualHanging.mask,uniformHanging:uniformHanging.mask};
const asset={vertices:count,indexCount:simplified.length,joints,mesh:Buffer.concat(chunks).toString('base64'),maps,parts,armBindCorrection:true,restHandsInLap:true};
fs.writeFileSync(path.join(folder,'uniform-asset.json'),JSON.stringify(asset));
const metadata={source:'source/base_basic_pbr.glb',archive:'23918bea-19f4-4b91-b9ef-9ba190b22550.zip',sourceSha256:createHash('sha256').update(source).digest('hex'),originalTriangles:index.length/3,triangles:simplified.length/3,vertices:count,joints:joints.length,height,centered:true,sharedPlayerSkeleton:true,head:'The current player head and fitted eyes are retained; the old shirt collar and the supplied distorted face are excluded; the two necklines overlap beneath the collar',parts:{head:head.triangles,body:body.triangles,casualHanging:casualHanging.triangles,uniformHanging:uniformHanging.triangles},simplificationError:error};
fs.writeFileSync(path.join(folder,'preparation.json'),JSON.stringify(metadata,null,2)+'\n');console.log(JSON.stringify(metadata,null,2));
