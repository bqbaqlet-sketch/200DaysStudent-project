const fs=require('fs'),path=require('path'),THREE=require('three'),{createCanvas,loadImage}=require('@napi-rs/canvas');
(async()=>{
 const folder=path.resolve(__dirname,'../assets/characters/student-front108'),file=path.join(folder,'student-asset.json'),asset=JSON.parse(fs.readFileSync(file)),bytes=Buffer.from(asset.mesh,'base64');let offset=0;
 const read=(Type,count)=>{const a=new Type(bytes.buffer,bytes.byteOffset+offset,count);offset=Math.ceil((offset+a.byteLength)/4)*4;return a;};
 const packed=read(Int16Array,asset.vertices*3),positions=Float32Array.from(packed,n=>n/12000),normals=read(Int8Array,asset.vertices*3),uv=Float32Array.from(read(Uint16Array,asset.vertices*2),n=>n/65535);read(Uint8Array,asset.vertices*4);read(Uint8Array,asset.vertices*4);const indices=read(Uint16Array,asset.indexCount);
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(Float32Array.from(normals,n=>n/127),3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));const face=[];for(let k=0;k<indices.length;k+=3){const tri=[indices[k],indices[k+1],indices[k+2]];if(tri.some(i=>positions[i*3+1]>1.61&&positions[i*3+1]<1.72&&Math.abs(positions[i*3])<.095&&positions[i*3+2]>.02))face.push(...tri);}geometry.setIndex(face);
 const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})),ray=new THREE.Raycaster();mesh.updateMatrixWorld();
 const hitAt=(x,y)=>{ray.set(new THREE.Vector3(x,y,.4),new THREE.Vector3(0,0,-1));const hit=ray.intersectObject(mesh)[0];if(!hit)throw Error('Missing front student face at '+[x,y]);return hit;};
 const profile={columns:48,rows:36,halfWidth:.023,halfHeight:.014,eyeWidth:.0148,upper:.0038,lower:.0027,irisRadius:.0041,pupilRadius:.0017,centers:[[-.039,1.6665,0],[.036,1.6665,0]],depths:[],normals:[],skinTop:[],skinBottom:[],skinSurface:[]};
 // Remove the generated ridges inside the eyelid area, without moving brows or cheeks.
 if(!process.argv.includes('--profile-only'))for(const center of profile.centers){
  const corners=[[-1,-1],[1,-1],[-1,1],[1,1]].map(([x,y])=>hitAt(center[0]+x*.024,center[1]+(y<0?-.016:.012)).point.z);
  for(let i=0;i<asset.vertices;i++){
   const x=positions[i*3],y=positions[i*3+1],z=positions[i*3+2],u=(x-center[0])/.024,v=(y-center[1]+.002)/.014,r=u*u+v*v;if(r>=1||z<.035)continue;
   const a=(u+1)/2,b=(v+1)/2,bridge=THREE.MathUtils.lerp(THREE.MathUtils.lerp(corners[0],corners[1],a),THREE.MathUtils.lerp(corners[2],corners[3],a),b)+.001*(1-r),weight=THREE.MathUtils.smoothstep(1-r,0,.6);
   positions[i*3+2]=THREE.MathUtils.lerp(z,bridge,weight);packed[i*3+2]=Math.round(positions[i*3+2]*12000);
   const dx=THREE.MathUtils.lerp(corners[1]-corners[0],corners[3]-corners[2],b)/.048-.002*u/.024,dy=THREE.MathUtils.lerp(corners[2]-corners[0],corners[3]-corners[1],a)/.028-.002*v/.014,targetNormal=new THREE.Vector3(-dx,-dy,1).normalize(),oldNormal=new THREE.Vector3(normals[i*3]/127,normals[i*3+1]/127,normals[i*3+2]/127).lerp(targetNormal,weight).normalize();for(let k=0;k<3;k++)normals[i*3+k]=Math.round(oldNormal.getComponent(k)*127);
  }
 }
 geometry.attributes.position.copyArray(positions);geometry.attributes.position.needsUpdate=true;geometry.attributes.normal.copyArray(Float32Array.from(normals,n=>n/127));
 const image=await loadImage(Buffer.from(asset.maps.color.split(',')[1],'base64')),canvas=createCanvas(image.width,image.height),g=canvas.getContext('2d');g.drawImage(image,0,0);const pixels=g.getImageData(0,0,image.width,image.height).data;
 const colorAt=(x,y)=>{const hit=hitAt(x,y),xx=Math.round(hit.uv.x*(image.width-1)),yy=Math.round(hit.uv.y*(image.height-1)),i=(yy*image.width+xx)*4;return [pixels[i]/255,pixels[i+1]/255,pixels[i+2]/255];};
 for(const center of profile.centers){
  center[2]=hitAt(center[0],center[1]).point.z+.001;
  profile.skinTop.push(Array.from({length:profile.columns+1},(_,i)=>colorAt(center[0]+(i/profile.columns*2-1)*profile.halfWidth,center[1]+.010)));
  profile.skinBottom.push(Array.from({length:profile.columns+1},(_,i)=>colorAt(center[0]+(i/profile.columns*2-1)*profile.halfWidth,center[1]-.016)));
  const depths=[],eyeNormals=[],surface=[];for(let j=0;j<=profile.rows;j++)for(let i=0;i<=profile.columns;i++){
   const u=i/profile.columns*2-1,v=j/profile.rows*2-1,hit=hitAt(center[0]+u*profile.halfWidth,center[1]+v*profile.halfHeight);depths.push(hit.point.z+.0008);const pixel=(Math.round(hit.uv.y*(image.height-1))*image.width+Math.round(hit.uv.x*(image.width-1)))*4;surface.push(pixels[pixel]/255,pixels[pixel+1]/255,pixels[pixel+2]/255);
   const ids=[hit.face.a,hit.face.b,hit.face.c],vertices=ids.map(id=>new THREE.Vector3().fromBufferAttribute(geometry.attributes.position,id)),bary=THREE.Triangle.getBarycoord(hit.point,...vertices,new THREE.Vector3()),normal=new THREE.Vector3();ids.forEach((id,k)=>normal.addScaledVector(new THREE.Vector3().fromBufferAttribute(geometry.attributes.normal,id),bary.getComponent(k)));eyeNormals.push(...normal.normalize().toArray());
  }profile.depths.push(depths);profile.normals.push(eyeNormals);profile.skinSurface.push(surface);
 }
 asset.mesh=bytes.toString('base64');fs.writeFileSync(file,JSON.stringify(asset));fs.writeFileSync(path.join(folder,'eye-profile.json'),JSON.stringify(profile));console.log(JSON.stringify({centers:profile.centers,reference:'reference.jpg',eyeWidth:profile.eyeWidth*2,iris:'dark brown'}));
})().catch(e=>{console.error(e);process.exitCode=1});
