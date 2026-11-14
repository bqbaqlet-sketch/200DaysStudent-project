// Fitted eye surfaces with antialiased textures. Skin and eyes use the same
// lighting as the source face; blinking covers the original generated eyes.
function buildFittedCharacterEyes(model,profile,options){
 const group=new THREE.Group();group.name=options.id+'-corrected-eyes';model.names.head.add(group);
 const clamp=THREE.MathUtils.clamp,mix=THREE.MathUtils.lerp,smooth=THREE.MathUtils.smoothstep,W=768,H=384;
 const width=options.width,upper=options.upper,lower=options.lower,radius=options.irisRadius,offset=options.centerOffset||0;
 const rgb=(r,g,b,a=1)=>'rgba('+[r,g,b].map(v=>Math.round(clamp(v,0,1)*255)).join(',')+','+a+')';
 const irisCanvas=document.createElement('canvas');irisCanvas.width=irisCanvas.height=256;const ig=irisCanvas.getContext('2d');ig.save();ig.beginPath();ig.arc(128,128,127,0,Math.PI*2);ig.clip();
 const radial=ig.createRadialGradient(128,128,24,128,128,126),irisColors=options.naturalLids?['#242019','#30271c','#211e16','#10130f']:['#33261b','#443021','#30251c','#131510'];
 [0,.40,.78,1].forEach((stop,i)=>radial.addColorStop(stop,irisColors[i]));ig.fillStyle=radial;ig.fillRect(0,0,256,256);
 for(let i=0;i<190;i++){const a=i/190*Math.PI*2,phase=.5+.5*Math.sin(i*12.37);ig.strokeStyle=i%3?'rgba(120,87,47,.13)':'rgba(12,14,10,.35)';ig.lineWidth=1.1;ig.beginPath();ig.moveTo(128+Math.cos(a)*52,128+Math.sin(a)*52);ig.lineTo(128+Math.cos(a+.025)*(.85+.12*phase)*126,128+Math.sin(a+.025)*(.85+.12*phase)*126);ig.stroke();}
 const pupil=options.pupilRadius/radius*128,pg=ig.createRadialGradient(128,128,pupil*.77,128,128,pupil*1.12);pg.addColorStop(0,'#080a08');pg.addColorStop(1,'#151710');ig.fillStyle=pg;ig.beginPath();ig.arc(128,128,pupil*1.1,0,Math.PI*2);ig.fill();ig.restore();
 const eyes=profile.centers.map((center,side)=>{
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d'),base=ctx.createImageData(W,H);
  const skinAt=(u,v)=>{
   const f=clamp((u+1)*profile.columns/2,0,profile.columns),a=Math.floor(f),b=Math.min(profile.columns,a+1),t=f-a,q=clamp((v+1)/2,0,1),r=q*profile.rows,j=Math.floor(r),next=Math.min(profile.rows,j+1),blend=r-j;
   const surface=profile.skinSurface?.[side],x=u*profile.halfWidth,y=v*profile.halfHeight,erase=(1-smooth(Math.abs(x),.016,.022))*(1-smooth(Math.abs(y+.0007),.006,.011));
   return [0,1,2].map(k=>{const clean=mix(mix(profile.skinBottom[side][a][k],profile.skinBottom[side][b][k],t),mix(profile.skinTop[side][a][k],profile.skinTop[side][b][k],t),q);if(!surface)return clean;const read=(column,row)=>surface[(row*(profile.columns+1)+column)*3+k],original=mix(mix(read(a,j),read(b,j),t),mix(read(a,next),read(b,next),t),blend);return mix(original,clean,erase);});
  };
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
   const u=x/(W-1)*2-1,v=1-y/(H-1)*2,color=skinAt(u,v),i=(y*W+x)*4;
   for(let k=0;k<3;k++)base.data[i+k]=Math.round(color[k]*255);
   const edge=options.naturalLids?1-smooth(Math.hypot(u,v*.70),.85,1):
    (1-smooth(Math.abs(u),.86,1))*(1-smooth(Math.abs(v),.78,1));
   base.data[i+3]=Math.round(255*edge);
  }
  const average=skinAt(0,0);
  const texture=new THREE.CanvasTexture(canvas);texture.anisotropy=4;
  const material=model.mesh.material.clone();Object.assign(material,{map:texture,emissiveMap:texture,normalMap:null,roughnessMap:null,metalnessMap:null,skinning:false,vertexColors:false,roughness:.78,metalness:0,transparent:true,depthWrite:false});
  const positions=[],normals=[],uv=[],indices=[];
  for(let j=0;j<=profile.rows;j++)for(let i=0;i<=profile.columns;i++){
   const u=i/profile.columns*2-1,v=j/profile.rows*2-1,x=u*profile.halfWidth,y=v*profile.halfHeight,k=j*(profile.columns+1)+i,lens=Math.max(0,1-(x/width)**2-((y-offset)/.0065)**2),curve=options.naturalLids?.00065:.00105,bulge=curve*lens*lens;
   positions.push(x,y,profile.depths[side][k]-center[2]+bulge);const normal=new THREE.Vector3().fromArray(profile.normals[side],k*3);normal.x+=curve*4*lens*x/(width*width);normal.y+=curve*4*lens*(y-offset)/(.0065*.0065);normal.normalize();normals.push(...normal.toArray());uv.push(i/profile.columns,j/profile.rows);
   if(i<profile.columns&&j<profile.rows){indices.push(k,k+1,k+profile.columns+2,k,k+profile.columns+2,k+profile.columns+1);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);
  const mesh=new THREE.Mesh(geometry,material);mesh.name=options.id+'-eye-'+side;mesh.userData={eyeStyle:'fitted-texture-v2',side};mesh.position.copy(model.names.head.worldToLocal(new THREE.Vector3(...center)));mesh.quaternion.copy(model.names.head.getWorldQuaternion(new THREE.Quaternion()).invert());group.add(mesh);
  const sx=W/(profile.halfWidth*2),sy=H/(profile.halfHeight*2),X=x=>W/2+x*sx,Y=y=>H/2-y*sy;
  function paint(closed,gaze){
   ctx.putImageData(base,0,0);const tilt=(side?1:-1)*.00022,shut=-lower*.30,top=mix(upper,shut,closed),bottom=mix(-lower,shut,closed);
   const left=-width,right=width,canthus=x=>offset+tilt*x/width;
   const upperPath=()=>{ctx.moveTo(X(left),Y(canthus(left)));const inner=side?-1:1;ctx.bezierCurveTo(X(-width*.55),Y(top*(options.naturalLids?1.33-inner*.17:1.33)+canthus(-width*.55)),X(width*.52),Y(top*(options.naturalLids?1.33+inner*.17:1.33)+canthus(width*.52)),X(right),Y(canthus(right)));};
   ctx.save();ctx.beginPath();upperPath();ctx.bezierCurveTo(X(width*.55),Y(bottom*1.33+canthus(width*.55)),X(-width*.52),Y(bottom*1.33+canthus(-width*.52)),X(left),Y(canthus(left)));ctx.closePath();ctx.clip();
   const white=ctx.createRadialGradient(X(0),Y(offset-.0004),0,X(0),Y(offset),width*sx);
   const sclera=options.naturalLids?['#c5bcaa','#b0a391','#877768']:['#85847b','#74736b','#56564f'];
   white.addColorStop(0,sclera[0]);white.addColorStop(.70,sclera[1]);white.addColorStop(1,sclera[2]);ctx.fillStyle=white;ctx.fillRect(0,0,W,H);
   const irisX=clamp(gaze,-1,1)*.0009,irisY=offset-.00025;ctx.drawImage(irisCanvas,X(irisX-radius),Y(irisY+radius),radius*2*sx,radius*2*sy);
   const shade=ctx.createLinearGradient(0,Y(offset+upper+.0006),0,Y(offset-lower));shade.addColorStop(0,'rgba(35,24,18,.62)');shade.addColorStop(.38,'rgba(45,31,22,.16)');shade.addColorStop(1,'rgba(45,31,22,0)');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
   ctx.fillStyle='rgba(235,229,213,.23)';ctx.beginPath();ctx.ellipse(X(irisX-.0011),Y(irisY+.0011),.00024*sx,.00020*sy,0,0,Math.PI*2);ctx.fill();ctx.restore();
   ctx.beginPath();upperPath();ctx.strokeStyle=rgb(average[0]*.36,average[1]*.33,average[2]*.31,options.naturalLids?.45:.64);ctx.lineWidth=(options.naturalLids?.00038:.00028)*sy;ctx.lineCap='round';ctx.stroke();
   ctx.beginPath();ctx.moveTo(X(right),Y(canthus(right)));ctx.bezierCurveTo(X(width*.55),Y(bottom*1.33+canthus(width*.55)),X(-width*.52),Y(bottom*1.33+canthus(-width*.52)),X(left),Y(canthus(left)));ctx.strokeStyle=rgb(average[0]*.65,average[1]*.58,average[2]*.54,.23);ctx.lineWidth=.00022*sy;ctx.stroke();
   ctx.beginPath();ctx.moveTo(X(-width*.84),Y(offset+top*.55+.0013));ctx.bezierCurveTo(X(-width*.40),Y(offset+top*1.24+.0015),X(width*.38),Y(offset+top*1.24+.0015),X(width*.82),Y(offset+top*.60+.0013));ctx.strokeStyle=rgb(average[0]*.63,average[1]*.54,average[2]*.48,.19);ctx.lineWidth=.00032*sy;ctx.stroke();
   texture.needsUpdate=true;
  }
  return {mesh,paint};
 });
 let closed=0,lastClosed=-1,lastGaze=99;
 function sample(seconds,gaze=0){const t=((seconds+options.blinkPhase)%options.blinkPeriod+options.blinkPeriod)%options.blinkPeriod;closed=t<.19?Math.sin(Math.PI*t/.19)**2:0;if(Math.abs(closed-lastClosed)<.005&&Math.abs(gaze-lastGaze)<.025)return;lastClosed=closed;lastGaze=gaze;for(const eye of eyes)eye.paint(closed,gaze);}
 sample(0);return {root:group,eyes:eyes.map(eye=>eye.mesh),sample,get closed(){return closed},style:'fitted-texture-v2'};
}
