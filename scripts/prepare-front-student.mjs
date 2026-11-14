import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {MeshoptSimplifier} from 'meshoptimizer';
import {createCanvas,loadImage} from '@napi-rs/canvas';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'assets/characters/student-front108');
const source=fs.readFileSync(path.join(out,'source/original.glb'));
const jsonBytes=source.readUInt32LE(12),g=JSON.parse(source.subarray(20,20+jsonBytes)),bin=source.subarray(28+jsonBytes);
function access(id){
 const a=g.accessors[id],view=g.bufferViews[a.bufferView],Type={5126:Float32Array,5125:Uint32Array,5123:Uint16Array}[a.componentType],width={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type];
 if(!Type||!width||view.byteStride&&view.byteStride!==width*Type.BYTES_PER_ELEMENT)throw Error('Unsupported player accessor');
 return new Type(bin.buffer,bin.byteOffset+(view.byteOffset??0)+(a.byteOffset??0),a.count*width);
}
const node=g.nodes.find(n=>n.mesh!==undefined),primitive=g.meshes[node.mesh].primitives[0];
const position=Float32Array.from(access(primitive.attributes.POSITION)),normal=Float32Array.from(access(primitive.attributes.NORMAL)),uv=Float32Array.from(access(primitive.attributes.TEXCOORD_0));
const index=Uint32Array.from(access(primitive.indices));
const transform=node.matrix?new THREE.Matrix4().fromArray(node.matrix):new THREE.Matrix4().compose(new THREE.Vector3().fromArray(node.translation??[0,0,0]),new THREE.Quaternion().fromArray(node.rotation??[0,0,0,1]).normalize(),new THREE.Vector3().fromArray(node.scale??[1,1,1]));
const normalMatrix=new THREE.Matrix3().getNormalMatrix(transform),point=new THREE.Vector3(),bounds=new THREE.Box3();
for(let i=0;i<position.length;i+=3){point.fromArray(position,i).applyMatrix4(transform);point.toArray(position,i);bounds.expandByPoint(point);point.fromArray(normal,i).applyMatrix3(normalMatrix).normalize().toArray(normal,i);}
const height=1.82,scale=height/(bounds.max.y-bounds.min.y),centerX=(bounds.min.x+bounds.max.x)/2;
for(let i=0;i<position.length;i+=3){position[i]=(position[i]-centerX)*scale;position[i+1]=(position[i+1]-bounds.min.y)*scale;position[i+2]*=scale;}
const attributes=new Float32Array(position.length/3*5);
for(let i=0;i<position.length/3;i++)attributes.set([...normal.subarray(i*3,i*3+3),...uv.subarray(i*2,i*2+2)],i*5);
await MeshoptSimplifier.ready;
const [simplified,error]=MeshoptSimplifier.simplifyWithAttributes(index,position,3,attributes,5,[.35,.35,.35,.85,.85],null,48000*3,.012,['Regularize']);
const [remap,count]=MeshoptSimplifier.compactMesh(simplified);if(count>=65536)throw Error('Player exceeds packed vertex limit');
const pp=new Float32Array(count*3),nn=new Float32Array(count*3),uu=new Float32Array(count*2);
for(let i=0;i<remap.length;i++){const destination=remap[i];if(destination===0xffffffff)continue;pp.set(position.subarray(i*3,i*3+3),destination*3);nn.set(normal.subarray(i*3,i*3+3),destination*3);uu.set(uv.subarray(i*2,i*2+2),destination*2);}
const material=g.materials[primitive.material],pbr=material.pbrMetallicRoughness,maps={};
for(const [key,id] of Object.entries({color:pbr.baseColorTexture.index,normal:material.normalTexture.index,surface:pbr.metallicRoughnessTexture.index})){
 const view=g.bufferViews[g.images[g.textures[id].source].bufferView],image=await loadImage(bin.subarray(view.byteOffset??0,(view.byteOffset??0)+view.byteLength));
 const size=key==='color'?1536:1024,canvas=createCanvas(size,size);canvas.getContext('2d').drawImage(image,0,0,size,size);
 const bytes=await canvas.encode('webp',key==='color'?94:93);fs.writeFileSync(path.join(out,key+'.webp'),bytes);maps[key]='data:image/webp;base64,'+bytes.toString('base64');
}
const joints=[['hips',-1,[0,.925,-.012]],['body',0,[0,1.080,-.012]],['head',1,[0,1.550,.002]],
 ['armL',1,[-.190,1.430,.010]],['elbowL',3,[-.375,1.170,.020]],['handL',4,[-.515,.990,.035]],
 ['thighL',0,[-.090,.920,-.014]],['shinL',6,[-.095,.505,.004]],['footL',7,[-.102,.100,.038]],
 ['armR',1,[.190,1.430,.010]],['elbowR',9,[.375,1.170,.020]],['handR',10,[.515,.990,.035]],
 ['thighR',0,[.090,.920,-.014]],['shinR',12,[.095,.505,.004]],['footR',13,[.102,.100,.038]]];
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const si=new Uint8Array(count*4),sw=new Uint8Array(count*4);
for(let i=0;i<count;i++){
 const x=pp[i*3],y=pp[i*3+1],ax=Math.abs(x),right=x>0,weights=new Map(),add=(id,w)=>weights.set(id,(weights.get(id)??0)+w);
 const segment=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy)));return Math.hypot(px-ax-t*dx,py-ay-t*dy)};
 const armDistance=Math.min(segment(ax,y,.19,1.43,.375,1.17),segment(ax,y,.375,1.17,.515,.99),segment(ax,y,.515,.99,.63,.85)),bodyDistance=Math.max(0,Math.hypot(ax,y-Math.max(.94,Math.min(1.37,y)))-.155),armBlend=smooth(-.055,.055,bodyDistance-armDistance);
 if(armBlend>.0001&&ax>.14&&y<1.55){const arm=armBlend,elbow=smooth(.325,.415,ax),hand=smooth(.475,.555,ax),base=right?9:3;add(1,1-arm);add(base,arm*(1-elbow));add(base+1,arm*elbow*(1-hand));add(base+2,arm*elbow*hand);}
 else if(y<.95){const leg=smooth(.95,.84,y),knee=1-smooth(.44,.58,y),foot=1-smooth(.10,.20,y),side=smooth(-.05,.05,x);add(0,1-leg);for(const [base,s] of [[6,1-side],[12,side]]){add(base,leg*s*(1-knee));add(base+1,leg*s*knee*(1-foot));add(base+2,leg*s*knee*foot);}}
 else{const head=smooth(1.51,1.63,y),body=smooth(.95,1.10,y);add(0,(1-body)*(1-head));add(1,body*(1-head));add(2,head);}
 const list=[...weights].filter(([,w])=>w>0).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=list.reduce((n,[,w])=>n+w,0);let total=0;
 list.forEach(([id,w],j)=>{si[i*4+j]=id;sw[i*4+j]=Math.round(w/sum*255);total+=sw[i*4+j]});sw[i*4]+=255-total;
}
const chunks=[];let packedBytes=0;
for(const array of [Int16Array.from(pp,v=>Math.round(v*12000)),Int8Array.from(nn,v=>Math.round(Math.max(-1,Math.min(1,v))*127)),Uint16Array.from(uu,v=>Math.round(Math.max(0,Math.min(1,v))*65535)),si,sw,Uint16Array.from(simplified)]){
 const b=Buffer.from(array.buffer,array.byteOffset,array.byteLength);chunks.push(b);packedBytes+=b.length;const pad=(4-packedBytes%4)%4;if(pad){chunks.push(Buffer.alloc(pad));packedBytes+=pad;}
}
const asset={vertices:count,indexCount:simplified.length,joints,mesh:Buffer.concat(chunks).toString('base64'),maps,armBindCorrection:true,restHandsInLap:true};
fs.writeFileSync(path.join(out,'student-asset.json'),JSON.stringify(asset));
const metadata={characterId:'student-front-108',characterName:'Илья',source:'source/original.glb',sourceFile:'d40127a3c28c9dcf48ed6df7d8dda67c.glb',sourceSha256:createHash('sha256').update(source).digest('hex'),sourceTriangles:index.length/3,triangles:simplified.length/3,vertices:count,joints:joints.length,height,sourceTransformApplied:true,textureSizes:{color:1536,normal:1024,surface:1024},simplificationError:error,packedGeometryBytes:packedBytes};
fs.writeFileSync(path.join(out,'preparation.json'),JSON.stringify(metadata,null,2)+'\n');
console.log(JSON.stringify(metadata,null,2));
