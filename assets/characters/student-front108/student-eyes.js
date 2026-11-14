function buildFrontStudentEyes(model,profile){
 // Smooth the socket's lighting across the source model's coarse triangles,
 // including UV seams. Keep the original surface and the rest of his face.
 const {columns,rows,halfWidth,halfHeight}=profile,stride=columns+1;
 const eyeNormals=profile.depths.map(depths=>{
  let field=depths.slice();
  for(let pass=0;pass<8;pass++){
   const next=field.slice();
   for(let y=1;y<rows;y++)for(let x=1;x<columns;x++){
    const k=y*stride+x;next[k]=(field[k]*4+field[k-1]+field[k+1]+field[k-stride]+field[k+stride])/8;
   }field=next;
  }
  const normals=[];
  for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++){
   const left=Math.max(0,x-1),right=Math.min(columns,x+1),bottom=Math.max(0,y-1),top=Math.min(rows,y+1);
   const dx=(field[y*stride+right]-field[y*stride+left])/((right-left)*2*halfWidth/columns);
   const dy=(field[top*stride+x]-field[bottom*stride+x])/((top-bottom)*2*halfHeight/rows);
   normals.push(...new THREE.Vector3(-dx,-dy,1).normalize().toArray());
  }return normals;
 });
 const geometry=model.mesh.geometry,source=geometry.attributes.normal;
 const normals=Float32Array.from(source.array,value=>source.normalized?value/127:value),p=geometry.attributes.position;
 const face=[];
 for(let i=0;i<p.count;i++)if(p.getY(i)>1.61&&p.getY(i)<1.72&&Math.abs(p.getX(i))<.085&&p.getZ(i)>.055)
  face.push({point:new THREE.Vector3().fromBufferAttribute(p,i),normal:new THREE.Vector3().fromArray(normals,i*3)});
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i);if(p.getZ(i)<.035||y<1.64||y>1.695)continue;
  const socket=Math.max(...profile.centers.map(center=>1-THREE.MathUtils.smoothstep(Math.hypot((x-center[0])/.035,(y-center[1])/.028),.3,1)));
  if(socket){
   const point=new THREE.Vector3().fromBufferAttribute(p,i),average=new THREE.Vector3();
   for(const sample of face){const distance=point.distanceToSquared(sample.point);if(distance<.018**2)average.addScaledVector(sample.normal,Math.exp(-distance/(2*.007**2)));}
   if(average.lengthSq())new THREE.Vector3().fromArray(normals,i*3).lerp(average.normalize(),socket*.9).normalize().toArray(normals,i*3);
  }
  profile.centers.forEach((center,side)=>{
   const u=(x-center[0])/halfWidth,v=(y-center[1])/halfHeight;
   const blend=1-THREE.MathUtils.smoothstep(Math.hypot(u,v),.35,1);
   if(!blend)return;
   const column=Math.round(THREE.MathUtils.clamp((u+1)*columns/2,0,columns)),row=Math.round(THREE.MathUtils.clamp((v+1)*rows/2,0,rows));
   const normal=new THREE.Vector3().fromArray(normals,i*3).lerp(new THREE.Vector3().fromArray(eyeNormals[side],(row*stride+column)*3),blend).normalize();
   normal.toArray(normals,i*3);
  });
 }
 geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
 return buildFittedCharacterEyes(model,{...profile,normals:eyeNormals},{id:'ilya',width:.0132,upper:.0043,lower:.0023,centerOffset:.0012,irisRadius:.0057,pupilRadius:.0021,blinkPhase:1.83,blinkPeriod:4.7,naturalLids:true});
}
