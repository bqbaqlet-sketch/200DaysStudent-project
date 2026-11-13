import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {MeshoptSimplifier} from 'meshoptimizer';
import {createCanvas,loadImage} from '@napi-rs/canvas';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(project,'assets/characters/alexey'),source=path.join(out,'source');
const v=[],vt=[],vn=[],positions=[],normals=[],uvs=[],indices=[],unique=new Map();
for(const line of fs.readFileSync(path.join(source,'base.obj'),'utf8').split(/\r?\n/)){
 const words=line.trim().split(/\s+/),kind=words.shift();
 if(kind==='v')v.push(...words.map(Number));else if(kind==='vt')vt.push(...words.slice(0,2).map(Number));else if(kind==='vn')vn.push(...words.map(Number));
 else if(kind==='f'){
  const face=words.map(key=>{
   let id=unique.get(key);if(id!==undefined)return id;
   const [p,t,n]=key.split('/').map(s=>Number(s)-1);id=positions.length/3;unique.set(key,id);
   positions.push(...v.slice(p*3,p*3+3));uvs.push(vt[t*2],1-vt[t*2+1]);normals.push(...vn.slice(n*3,n*3+3));return id;
  });for(let i=1;i<face.length-1;i++)indices.push(face[0],face[i],face[i+1]);
 }
}
const pos=Float32Array.from(positions),normal=Float32Array.from(normals),uv=Float32Array.from(uvs),idx=Uint32Array.from(indices),attributes=new Float32Array(pos.length/3*5);
for(let i=0;i<pos.length/3;i++)attributes.set([...normal.subarray(i*3,i*3+3),...uv.subarray(i*2,i*2+2)],i*5);
await MeshoptSimplifier.ready;
const [simple,error]=MeshoptSimplifier.simplifyWithAttributes(idx,pos,3,attributes,5,[.35,.35,.35,.7,.7],null,36000*3,.015,['Regularize']);
const [remap,count]=MeshoptSimplifier.compactMesh(simple);if(count>=65536)throw Error('Too many mobile vertices');
const pp=new Float32Array(count*3),nn=new Float32Array(count*3),uu=new Float32Array(count*2);
for(let i=0;i<remap.length;i++){const dest=remap[i];if(dest===0xffffffff)continue;pp.set(pos.subarray(i*3,i*3+3),dest*3);nn.set(normal.subarray(i*3,i*3+3),dest*3);uu.set(uv.subarray(i*2,i*2+2),dest*2);}
const maps={};
for(const [name,file] of [['color','texture_diffuse.png'],['normal','texture_normal.png']]){
 const image=await loadImage(path.join(source,file)),canvas=createCanvas(1024,1024);canvas.getContext('2d').drawImage(image,0,0,1024,1024);
 const data=await canvas.encode('webp',name==='color'?90:93);fs.writeFileSync(path.join(out,name+'.webp'),data);maps[name]='data:image/webp;base64,'+data.toString('base64');
}
const rough=createCanvas(1024,1024),metal=createCanvas(1024,1024);
rough.getContext('2d').drawImage(await loadImage(path.join(source,'texture_roughness.png')),0,0,1024,1024);metal.getContext('2d').drawImage(await loadImage(path.join(source,'texture_metallic.png')),0,0,1024,1024);
const r=rough.getContext('2d').getImageData(0,0,1024,1024),m=metal.getContext('2d').getImageData(0,0,1024,1024);
for(let i=0;i<r.data.length;i+=4){r.data[i+1]=r.data[i];r.data[i+2]=m.data[i];r.data[i]=255;r.data[i+3]=255;}
rough.getContext('2d').putImageData(r,0,0);const surface=await rough.encode('webp',93);fs.writeFileSync(path.join(out,'surface.webp'),surface);maps.surface='data:image/webp;base64,'+surface.toString('base64');
const joints=[['hips',-1,[0,1.004,-.018]],['body',0,[0,1.135,-.016]],['head',1,[0,1.663,.004]],
 ['armL',1,[-.217,1.520,.033]],['elbowL',3,[-.460,1.325,.061]],['handL',4,[-.660,1.178,.099]],
 ['thighL',0,[-.110,.995,-.025]],['shinL',6,[-.120,.540,.005]],['footL',7,[-.125,.104,.041]],
 ['armR',1,[.217,1.520,.033]],['elbowR',9,[.460,1.325,.061]],['handR',10,[.660,1.178,.099]],
 ['thighR',0,[.110,.995,-.025]],['shinR',12,[.120,.540,.005]],['footR',13,[.125,.104,.041]]];
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const si=new Uint8Array(count*4),sw=new Uint8Array(count*4);
for(let i=0;i<count;i++){
 const x=pp[i*3],y=pp[i*3+1],ax=Math.abs(x),right=x>0,weights=new Map(),add=(id,w)=>weights.set(id,(weights.get(id)??0)+w);
 if(ax>.30||ax>.205&&y>1.61-.74*ax-.12){const arm=smooth(.205,.30,ax),elbow=smooth(.405,.515,ax),hand=smooth(.615,.705,ax),base=right?9:3;add(1,1-arm);add(base,arm*(1-elbow));add(base+1,arm*elbow*(1-hand));add(base+2,arm*elbow*hand);}
 else if(y<1.025){const leg=smooth(.995,.89,y),knee=1-smooth(.46,.60,y),foot=1-smooth(.10,.20,y),side=smooth(-.05,.05,x);add(0,1-leg);for(const [base,s] of [[6,1-side],[12,side]]){add(base,leg*s*(1-knee));add(base+1,leg*s*knee*(1-foot));add(base+2,leg*s*knee*foot);}}
 else{const head=smooth(1.595,1.695,y),body=smooth(1.025,1.16,y);add(0,(1-body)*(1-head));add(1,body*(1-head));add(2,head);}
 const list=[...weights].filter(([,w])=>w>0).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=list.reduce((n,[,w])=>n+w,0);let total=0;
 list.forEach(([id,w],j)=>{si[i*4+j]=id;sw[i*4+j]=Math.round(w/sum*255);total+=sw[i*4+j]});sw[i*4]+=255-total;
}
const chunks=[];let size=0;for(const array of [Int16Array.from(pp,x=>Math.round(x*12000)),Int8Array.from(nn,x=>Math.round(Math.max(-1,Math.min(1,x))*127)),Uint16Array.from(uu,x=>Math.round(Math.max(0,Math.min(1,x))*65535)),si,sw,Uint16Array.from(simple)]){const b=Buffer.from(array.buffer,array.byteOffset,array.byteLength);chunks.push(b);size+=b.length;const pad=(4-size%4)%4;if(pad){chunks.push(Buffer.alloc(pad));size+=pad;}}
const asset={vertices:count,indexCount:simple.length,joints,mesh:Buffer.concat(chunks).toString('base64'),maps,armBindCorrection:true,restHandsInLap:true};
fs.writeFileSync(path.join(out,'alexey-asset.json'),JSON.stringify(asset));
const metadata={source:'source/base.obj',sourceTriangles:idx.length/3,triangles:simple.length/3,vertices:count,joints:joints.length,textureSize:1024,simplificationError:error,packedGeometryBytes:size};fs.writeFileSync(path.join(out,'preparation.json'),JSON.stringify(metadata,null,2)+'\n');
const main=path.join(project,fs.readdirSync(project).find(f=>f!=='index.html'&&f.endsWith('.html'))),html=fs.readFileSync(main,'utf8'),begin='// BEGIN ALEXEY_STUDENT',end='// END ALEXEY_STUDENT',nl=html.includes('\r\n')?'\r\n':'\n';
const block=(begin+'\nconst alexey108Asset='+JSON.stringify(asset)+';\n'+end+'\n').replace(/\r?\n/g,nl);
let updated;if(html.includes(begin)){const start=html.indexOf(begin),finish=html.indexOf(end,start);if(finish<0)throw Error('Missing Alexey block end');updated=html.slice(0,start)+block+html.slice(finish+end.length).replace(/^\r?\n/,'');}else updated=html.replace('function buildCollegeEntranceInterior(){',block+nl+'function buildCollegeEntranceInterior(){');
fs.writeFileSync(main,updated);console.log(JSON.stringify(metadata,null,2));
