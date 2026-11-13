const fs=require('node:fs'),path=require('node:path'),THREE=require('three');
const folder=path.resolve(__dirname,'../assets/characters/player'),asset=JSON.parse(fs.readFileSync(path.join(folder,'player-asset.json'),'utf8'));
const bytes=Buffer.from(asset.mesh,'base64');let offset=0;
function read(Type,count){const result=new Type(bytes.buffer,bytes.byteOffset+offset,count);offset=Math.ceil((offset+result.byteLength)/4)*4;return result;}
const positions=Float32Array.from(read(Int16Array,asset.vertices*3),n=>n/12000);
read(Int8Array,asset.vertices*3);read(Uint16Array,asset.vertices*2);read(Uint8Array,asset.vertices*4);read(Uint8Array,asset.vertices*4);
const indices=read(Uint16Array,asset.indexCount),face=[];
for(let i=0;i<indices.length;i+=3){const triangle=Array.from(indices.subarray(i,i+3));if(triangle.some(v=>positions[v*3+1]>1.64&&positions[v*3+1]<1.76&&Math.abs(positions[v*3])<.09&&positions[v*3+2]>.04))face.push(...triangle);}
const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setIndex(face);
const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));mesh.updateMatrixWorld();
const ray=new THREE.Raycaster(),profile={columns:28,rows:14,halfWidth:.0122,upper:.0034,lower:.0028,irisRadius:.0044,pupilRadius:.0018,
 centers:[[-.03516,1.69853,0],[.03673,1.69852,0]],depths:[]};
for(const center of profile.centers){
 ray.set(new THREE.Vector3(center[0],center[1],.5),new THREE.Vector3(0,0,-1));const central=ray.intersectObject(mesh)[0];if(!central)throw Error('Missing eye surface');center[2]=central.point.z+.0011;
 const depths=[];
 for(let j=0;j<=profile.rows;j++)for(let i=0;i<=profile.columns;i++){
  const u=i/profile.columns*2-1,v=j/profile.rows*2-1,x=u*profile.halfWidth,y=v*(v>0?profile.upper:profile.lower)*(1-u*u);
  ray.set(new THREE.Vector3(center[0]+x,center[1]+y,.5),new THREE.Vector3(0,0,-1));const hit=ray.intersectObject(mesh)[0];if(!hit)throw Error('Eye fitting missed the face');
  depths.push(Math.round((hit.point.z+.00075+.0010*Math.sqrt(Math.max(0,(1-u*u)*(1-v*v))))*1e6)/1e6);
 }
 profile.depths.push(depths);
}
fs.writeFileSync(path.join(folder,'eye-profile.json'),JSON.stringify(profile));
console.log(JSON.stringify({centers:profile.centers,triangles:profile.columns*profile.rows*4,faceTriangles:face.length/3}));
