const fs=require('node:fs'),path=require('node:path'),THREE=require('three'),{createCanvas,loadImage}=require('@napi-rs/canvas');
(async()=>{
 const folder=path.resolve(__dirname,'../assets/characters/mom'),asset=JSON.parse(fs.readFileSync(path.join(folder,'mom-asset.json'))),bytes=Buffer.from(asset.mesh,'base64');let offset=0;
 function read(Type,count){const result=new Type(bytes.buffer,bytes.byteOffset+offset,count);offset=Math.ceil((offset+result.byteLength)/4)*4;return result}
 const position=Float32Array.from(read(Int16Array,asset.vertices*3),v=>v/12000);read(Int8Array,asset.vertices*3);const uv=Float32Array.from(read(Uint16Array,asset.vertices*2),v=>v/65535);read(Uint8Array,asset.vertices*4);read(Uint8Array,asset.vertices*4);const index=read(Uint16Array,asset.indexCount),face=[];
 for(let i=0;i<index.length;i+=3){const tri=[index[i],index[i+1],index[i+2]];if(tri.some(v=>position[v*3+1]>1.45&&position[v*3+1]<1.56&&Math.abs(position[v*3])<.09&&position[v*3+2]>.02))face.push(...tri)}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(position,3));geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));geometry.setIndex(face);
 const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));mesh.updateMatrixWorld();
 const source=await loadImage(Buffer.from(asset.maps.color.split(',')[1],'base64')),canvas=createCanvas(source.width,source.height),ctx=canvas.getContext('2d');ctx.drawImage(source,0,0);const pixels=ctx.getImageData(0,0,source.width,source.height).data;
 const ray=new THREE.Raycaster(),profile={columns:32,rows:16,halfWidth:.0125,upper:.0045,lower:.0035,irisRadius:.0044,pupilRadius:.0019,centers:[[-.03613,1.50713,0],[.03442,1.50694,0]],depths:[],lidColors:[]};
 const hitAt=(x,y,required=true)=>{ray.set(new THREE.Vector3(x,y,.4),new THREE.Vector3(0,0,-1));const hit=ray.intersectObject(mesh)[0];if(!hit&&required)throw Error('Missed mom eye surface');return hit};
 for(const center of profile.centers){
  center[2]=hitAt(center[0],center[1]).point.z+.0012;
  const colors=[-.005,0,.005].map(x=>{const hit=hitAt(center[0]+x,center[1]+.011),xx=Math.round(hit.uv.x*(source.width-1)),yy=Math.round(hit.uv.y*(source.height-1)),i=(yy*source.width+xx)*4;return [pixels[i]/255,pixels[i+1]/255,pixels[i+2]/255]});profile.lidColors.push([0,1,2].map(i=>colors.reduce((s,c)=>s+c[i],0)/colors.length));
  const depths=[];for(let j=0;j<=profile.rows;j++)for(let i=0;i<=profile.columns;i++){const u=i/profile.columns*2-1,v=j/profile.rows*2-1,x=u*profile.halfWidth,y=v*(v>0?profile.upper:profile.lower)*(1-u*u),hit=hitAt(center[0]+x,center[1]+y,false);depths.push(Math.max(center[2]-.0035,hit?.point.z??center[2]-.0012)+.0008+.001*Math.sqrt(Math.max(0,(1-u*u)*(1-v*v))))}profile.depths.push(depths);
 }
 fs.writeFileSync(path.join(folder,'eye-profile.json'),JSON.stringify(profile));console.log(JSON.stringify({centers:profile.centers,lidColors:profile.lidColors,triangles:profile.columns*profile.rows*4}));
})().catch(e=>{console.error(e);process.exitCode=1});
