import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {MeshoptSimplifier} from 'meshoptimizer';
import {createCanvas,loadImage} from '@napi-rs/canvas';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'assets/characters/player');
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
const height=1.85,scale=height/(bounds.max.y-bounds.min.y),centerX=(bounds.min.x+bounds.max.x)/2;
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
const proportion=height/1.9085;
const joints=[['hips',-1,[0,1.004,-.012]],['body',0,[0,1.135,-.012]],['head',1,[0,1.650,.002]],
 ['armL',1,[-.217,1.510,.010]],['elbowL',3,[-.460,1.325,.035]],['handL',4,[-.660,1.178,.060]],
 ['thighL',0,[-.110,.995,-.014]],['shinL',6,[-.120,.540,.004]],['footL',7,[-.125,.104,.038]],
 ['armR',1,[.217,1.510,.010]],['elbowR',9,[.460,1.325,.035]],['handR',10,[.660,1.178,.060]],
 ['thighR',0,[.110,.995,-.014]],['shinR',12,[.120,.540,.004]],['footR',13,[.125,.104,.038]]].map(([name,parent,p])=>[name,parent,p.map(v=>v*proportion)]);
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const si=new Uint8Array(count*4),sw=new Uint8Array(count*4);
for(let i=0;i<count;i++){
 const x=pp[i*3]/proportion,y=pp[i*3+1]/proportion,ax=Math.abs(x),right=x>0,weights=new Map(),add=(id,w)=>weights.set(id,(weights.get(id)??0)+w);
 if(ax>.30||ax>.205&&y>1.61-.74*ax-.12){const arm=smooth(.205,.30,ax),elbow=smooth(.405,.515,ax),hand=smooth(.615,.705,ax),base=right?9:3;add(1,1-arm);add(base,arm*(1-elbow));add(base+1,arm*elbow*(1-hand));add(base+2,arm*elbow*hand);}
 else if(y<1.025){const leg=smooth(.995,.89,y),knee=1-smooth(.46,.60,y),foot=1-smooth(.10,.20,y),side=smooth(-.05,.05,x);add(0,1-leg);for(const [base,s] of [[6,1-side],[12,side]]){add(base,leg*s*(1-knee));add(base+1,leg*s*knee*(1-foot));add(base+2,leg*s*knee*foot);}}
 else{const head=smooth(1.595,1.695,y),body=smooth(1.025,1.16,y);add(0,(1-body)*(1-head));add(1,body*(1-head));add(2,head);}
 const list=[...weights].filter(([,w])=>w>0).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=list.reduce((n,[,w])=>n+w,0);let total=0;
 list.forEach(([id,w],j)=>{si[i*4+j]=id;sw[i*4+j]=Math.round(w/sum*255);total+=sw[i*4+j]});sw[i*4]+=255-total;
}
const chunks=[];let packedBytes=0;
for(const array of [Int16Array.from(pp,v=>Math.round(v*12000)),Int8Array.from(nn,v=>Math.round(Math.max(-1,Math.min(1,v))*127)),Uint16Array.from(uu,v=>Math.round(Math.max(0,Math.min(1,v))*65535)),si,sw,Uint16Array.from(simplified)]){
 const b=Buffer.from(array.buffer,array.byteOffset,array.byteLength);chunks.push(b);packedBytes+=b.length;const pad=(4-packedBytes%4)%4;if(pad){chunks.push(Buffer.alloc(pad));packedBytes+=pad;}
}
const profileFile=path.join(out,'eye-profile.json');
const asset={vertices:count,indexCount:simplified.length,joints,mesh:Buffer.concat(chunks).toString('base64'),maps,armBindCorrection:true,restHandsInLap:true,...fs.existsSync(profileFile)?{eyes:JSON.parse(fs.readFileSync(profileFile,'utf8'))}:{}};
fs.writeFileSync(path.join(out,'player-asset.json'),JSON.stringify(asset));
const metadata={source:'source/original.glb',sourceFile:'9db7205006fe9223154092ebee144c90.glb',sourceSha256:createHash('sha256').update(source).digest('hex'),originalTriangles:index.length/3,triangles:simplified.length/3,vertices:count,joints:joints.length,height,sourceTransformApplied:true,textureSizes:{color:1536,normal:1024,surface:1024},simplificationError:error,packedGeometryBytes:packedBytes};
fs.writeFileSync(path.join(out,'preparation.json'),JSON.stringify(metadata,null,2)+'\n');
const main=path.join(root,fs.readdirSync(root).find(f=>f!=='index.html'&&f.endsWith('.html'))),html=fs.readFileSync(main,'utf8'),newline=html.includes('\r\n')?'\r\n':'\n';
const begin='// BEGIN PLAYER_CHARACTER',end='// END PLAYER_CHARACTER',runtimeFile=path.join(out,'player-runtime.js');
if(fs.existsSync(runtimeFile)){
 const uniformFile=path.join(root,'assets/characters/player-uniform/uniform-asset.json');
 const uniform=fs.existsSync(uniformFile)?'const playerUniformAsset='+fs.readFileSync(uniformFile,'utf8').trim()+';\n':'';
 const block=(begin+'\nconst playerCharacterAsset='+JSON.stringify(asset)+';\n'+uniform+fs.readFileSync(runtimeFile,'utf8').trim()+'\n'+end+'\n').replace(/\r?\n/g,newline);
 let updated;if(html.includes(begin)){const first=html.indexOf(begin),last=html.indexOf(end,first);if(last<0)throw Error('Player block end missing');updated=html.slice(0,first)+block+html.slice(last+end.length).replace(/^\r?\n/,'');}
 else{const anchor='function buildCollegeEntranceInterior(){';if(html.split(anchor).length!==2)throw Error('Expected one college builder');updated=html.replace(anchor,block+newline+anchor);}
 fs.writeFileSync(main,updated);
}
console.log(JSON.stringify(metadata,null,2));
