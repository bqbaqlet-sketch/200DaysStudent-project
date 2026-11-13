const fs=require('node:fs'),path=require('node:path'),project=path.resolve(__dirname,'..'),THREE=require('three');
const a=JSON.parse(fs.readFileSync(project+'/assets/characters/medvedev/medvedev-asset.json','utf8')),bytes=Buffer.from(a.mesh,'base64');let offset=0;
function read(Type,n){const v=new Type(bytes.buffer,bytes.byteOffset+offset,n);offset=Math.ceil((offset+v.byteLength)/4)*4;return v;}
const pos=Float32Array.from(read(Int16Array,a.vertices*3),v=>v/12000);read(Int8Array,a.vertices*3);read(Uint16Array,a.vertices*2);read(Uint8Array,a.vertices*4);read(Uint8Array,a.vertices*4);const indices=read(Uint16Array,a.indexCount),face=[];
for(let i=0;i<indices.length;i+=3){const tri=Array.from(indices.subarray(i,i+3));if(tri.some(k=>pos[k*3+1]>1.75&&pos[k*3+1]<1.79&&pos[k*3+2]>.08&&Math.abs(pos[k*3])<.065))face.push(...tri);}
const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(pos,3));geometry.setIndex(face);const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));mesh.updateMatrixWorld(true);const ray=new THREE.Raycaster();
const profile=JSON.parse(fs.readFileSync(path.join(project,'assets/characters/medvedev/eye-profile.json'),'utf8'));profile.depths=[];
for(const [cx,cy,cz] of profile.centers){const depths=[];
 for(let j=0;j<=profile.rows;j++)for(let i=0;i<=profile.columns;i++){
  const u=i/profile.columns*2-1,v=j/profile.rows*2-1,x=u*profile.halfWidth,y=v*(v>0?profile.upper:profile.lower)*(1-u*u);
  ray.set(new THREE.Vector3(cx+x,cy+y,.4),new THREE.Vector3(0,0,-1));const hit=ray.intersectObject(mesh)[0];if(!hit)throw Error('Unfitted eye vertex');depths.push(Math.round((Math.max(hit.point.z+.0012,.1005+Math.sqrt(Math.max(0,.014*.014-x*x-y*y))))*1e6)/1e6);
 }
 profile.depths.push(depths);
}
fs.writeFileSync(path.join(project,'assets/characters/medvedev/eye-profile.json'),JSON.stringify(profile));console.log({faceTriangles:face.length/3,eyeVertices:profile.depths[0].length});
