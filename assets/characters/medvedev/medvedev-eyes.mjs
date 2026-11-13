// Small curved ocular surfaces fitted inside the existing elderly eyelids.
export function buildMedvedevEyes(THREE,head,profile){
 const group=new THREE.Group();group.name='medvedev-eyes';head.add(group);
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.38,metalness:0,transparent:true,depthWrite:false});
 const positions=[],colors=[],indices=[],color=new THREE.Color(),nx=profile.columns,ny=profile.rows;
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
  const u=i/nx*2-1,v=j/ny*2-1,x=u*profile.halfWidth,arch=1-u*u,y=v*(v>0?profile.upper:profile.lower)*arch;
  const r=Math.hypot(x,y),angle=Math.atan2(y,x),bulge=Math.sqrt(Math.max(0,(1-u*u)*(1-v*v)));
  positions.push(x,y,.0025*bulge);
  if(r<.00215)color.setHex(0x070c0d);
  else if(r<.0051){
   const fiber=.5+.5*Math.sin(angle*39+Math.sin(angle*13)+r*9000);
   color.setRGB(.14+.09*fiber,.20+.11*fiber,.22+.11*fiber);
  }else if(r<.00565)color.setHex(0x33464a);
  else color.setHex(0x87918a);
  const rim=THREE.MathUtils.smoothstep(Math.abs(v),.79,1);
  color.lerp(new THREE.Color(0x8a6558),rim*.82);colors.push(color.r,color.g,color.b,1-THREE.MathUtils.smoothstep(Math.abs(v),.84,1));
  if(i<nx&&j<ny){const k=j*(nx+1)+i;indices.push(k,k+1,k+nx+2,k,k+nx+2,k+nx+1);}
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));geometry.setIndex(indices);
 const eyes=profile.centers.map((center,i)=>{
  const fitted=geometry.clone();for(let k=0;k<fitted.attributes.position.count;k++)fitted.attributes.position.setZ(k,profile.depths[i][k]-center[2]);fitted.computeVertexNormals();
  const eye=new THREE.Mesh(fitted,material);eye.name='medvedev-eye-'+(i?'left':'right');eye.position.copy(head.worldToLocal(new THREE.Vector3(...center)));
  eye.quaternion.copy(head.getWorldQuaternion(new THREE.Quaternion()).invert());group.add(eye);return eye;
 });
 return {root:group,eyes,sample(seconds){
  const t=((seconds+1.7)%5.9+5.9)%5.9,amount=t<.17?Math.sin(Math.PI*t/.17)**2:0;
  for(const eye of eyes){eye.scale.y=1-amount*.95;eye.visible=amount<.96;}
 }};
}
