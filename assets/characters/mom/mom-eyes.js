function buildApartmentMomEyes(model,profile){
 const group=new THREE.Group();group.name='mom-corrected-eyes';model.names.head.add(group);
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.48,metalness:0,transparent:true,depthWrite:false});
 const eyes=profile.centers.map((center,side)=>{
  const positions=[],colors=[],base=[],indices=[],color=new THREE.Color(),skin=new THREE.Color(...profile.lidColors[side]).convertSRGBToLinear();
  for(let j=0;j<=profile.rows;j++)for(let i=0;i<=profile.columns;i++){
   const u=i/profile.columns*2-1,v=j/profile.rows*2-1,x=u*profile.halfWidth,y=v*(v>0?profile.upper:profile.lower)*(1-u*u),r=Math.hypot(x,y),angle=Math.atan2(y,x),fiber=.5+.5*Math.sin(angle*41+r*11000);
   if(r<profile.pupilRadius)color.setRGB(.003,.004,.003);
   else if(r<profile.irisRadius)color.setRGB(.045+.025*fiber,.026+.020*fiber,.012+.013*fiber);
   else if(r<profile.irisRadius+.0005)color.setRGB(.020,.017,.009);
   else color.setRGB(.34,.34,.30);
   if(Math.hypot(x+.0014,y-.0013)<.00048)color.setRGB(.63,.64,.58);
   const edge=Math.max(Math.abs(v),Math.abs(u));color.lerp(skin,THREE.MathUtils.smoothstep(edge,.68,1));
   const alpha=1-THREE.MathUtils.smoothstep(edge,.88,1);colors.push(color.r,color.g,color.b,alpha);base.push(color.r,color.g,color.b);
   positions.push(x,y,profile.depths[side][j*(profile.columns+1)+i]-center[2]);
   if(i<profile.columns&&j<profile.rows){const k=j*(profile.columns+1)+i;indices.push(k,k+1,k+profile.columns+2,k,k+profile.columns+2,k+profile.columns+1)}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));geometry.setIndex(indices);geometry.computeVertexNormals();
  const eye=new THREE.Mesh(geometry,material);eye.name='mom-eye-'+(side?'left':'right');eye.position.copy(model.names.head.worldToLocal(new THREE.Vector3(...center)));eye.quaternion.copy(model.names.head.getWorldQuaternion(new THREE.Quaternion()).invert());group.add(eye);
  return {mesh:eye,base,skin};
 });
 let last=-1,closed=0;
 return {root:group,eyes:eyes.map(e=>e.mesh),sample(seconds,sleeping=0){
  const t=((seconds+1.4)%5.3+5.3)%5.3,blink=t<.17?Math.sin(Math.PI*t/.17)**2:0;closed=Math.max(blink,sleeping);if(Math.abs(closed-last)<.002)return;last=closed;
  for(const eye of eyes){const a=eye.mesh.geometry.attributes.color;for(let j=0;j<=profile.rows;j++)for(let i=0;i<=profile.columns;i++){
   const k=j*(profile.columns+1)+i,v=j/profile.rows*2-1,cover=closed===0?0:THREE.MathUtils.smoothstep(Math.abs(v),Math.max(0,1-closed)-.10,Math.max(0,1-closed)+.06),crease=closed>.9&&Math.abs(v)<.07;
   const skin=crease?new THREE.Color(.12,.075,.05):eye.skin;
   a.setXYZ(k,THREE.MathUtils.lerp(eye.base[k*3],skin.r,cover),THREE.MathUtils.lerp(eye.base[k*3+1],skin.g,cover),THREE.MathUtils.lerp(eye.base[k*3+2],skin.b,cover));
  }a.needsUpdate=true}
 },get closed(){return closed}};
}
