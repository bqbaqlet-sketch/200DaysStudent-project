// BEGIN COLLEGE2_INTERIOR
function buildCollege2Interior(){
 const scene=new THREE.Scene(),colliders=[],batches=new Map();
 scene.background=new THREE.Color(0xc1c8cc);
 scene.add(new THREE.HemisphereLight(0xf5faff,0xa49a86,.8));
 scene.add(new THREE.AmbientLight(0xfff5df,.08));
 const sun=new THREE.DirectionalLight(0xfff6e5,.28);
 sun.position.set(-4,7,6);scene.add(sun);
 const boxGeo=new THREE.BoxGeometry(),tubeGeo=new THREE.CylinderGeometry(1,1,1,10);
 const leafGeo=new THREE.SphereGeometry(1,8,5),potGeo=new THREE.CylinderGeometry(1,.72,1,16);
 const up=new THREE.Vector3(0,1,0),dummy=new THREE.Object3D();
 let seed=227;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const mat=(color,props={})=>new THREE.MeshStandardMaterial({color,roughness:.72,...props});
 const plain=0xf0efe9,white=mat(plain),trim=mat(0xf9f9f5),joint=mat(0x817d76);
 const steel=mat(0xaeb9bc,{metalness:.4,roughness:.23}),black=mat(0x262b2e),brass=mat(0xaf884e,{metalness:.36,roughness:.35});
 const light=new THREE.MeshBasicMaterial({color:0xfcfdff});
 const glass=mat(0x84a1ad,{transparent:true,opacity:.25,roughness:.14,depthWrite:false});
 const frost=mat(0xc4d0ca,{roughness:.47});
 const red=mat(0xac2c2d),yellow=mat(0xd3a015),ridge=mat(0xe5ae18),beige=mat(0xe2d8c4);
 function texture(w,h,draw){
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  draw(canvas.getContext('2d'),w,h);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;
  return map;
 }
 const glassDark=mat(0xffffff,{map:texture(160,256,(ctx,w,h)=>{
  const color=ctx.createLinearGradient(0,0,w,h);
  color.addColorStop(0,'#293638');color.addColorStop(.43,'#4b5a5b');color.addColorStop(1,'#253334');
  ctx.fillStyle=color;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='rgba(210,221,215,.10)';ctx.fillRect(w*.57,0,w*.19,h);
  ctx.fillStyle='rgba(210,221,215,.16)';ctx.fillRect(w*.74,0,w*.025,h);
  ctx.fillStyle='rgba(229,238,230,.10)';
  for(let y=38;y<h;y+=57)ctx.fillRect(0,y,w,3);
 }),roughness:.28});
 const tile=mat(0xffffff,{map:texture(160,160,(ctx,w,h)=>{
  ctx.fillStyle='#d8d8d1';ctx.fillRect(0,0,w,h);
  for(let i=0;i<4100;i++){ctx.fillStyle=random()<.5?'rgba(255,255,255,.12)':'rgba(60,57,50,.07)';ctx.fillRect(random()*w,random()*h,1+random()*2,1)}
  ctx.fillStyle='#aaa9a3';ctx.fillRect(0,0,w,1.6);ctx.fillRect(0,0,1.6,h);
  ctx.fillStyle='#e8e8e0';ctx.fillRect(2,2,w-2,1);ctx.fillRect(2,2,1,h-2);
 }),roughness:.36});
 const ceiling=mat(0xffffff,{map:texture(96,96,(ctx,w,h)=>{
  ctx.fillStyle='#d7d9db';ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#909498';ctx.fillRect(0,0,w,1.5);ctx.fillRect(0,0,1.5,h);
 })});
 const wood=mat(0xffffff,{map:texture(256,512,(ctx,w,h)=>{
  ctx.fillStyle='#795e48';ctx.fillRect(0,0,w,h);
  for(let i=0;i<1050;i++){
   const x=random()*w,y=random()*h;
   ctx.strokeStyle=random()<.47?'rgba(37,22,15,.085)':'rgba(237,196,139,.095)';
   ctx.lineWidth=.35+random()*2;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-3,y+30,x+4,y+82,x,y+154);ctx.stroke();
  }
 }),roughness:.56});
 const mosaic=mat(0xffffff,{map:texture(512,512,(ctx,w,h)=>{
  ctx.fillStyle='#f1f1ec';ctx.fillRect(0,0,w,h);
  for(let y=0;y<42;y++)for(let x=0;x<48;x++){
   const band=y/42,density=.13+.48*Math.exp(-Math.pow((band-.7)*3.1,2));
   if(random()>density||band<.07||band>.93)continue;
   ctx.fillStyle=band>.72?(random()<.5?'#65956d':'#87af8c'):band>.56?'#7d9eab':band>.27?'#8887ac':'#8ca6bd';
   ctx.fillRect(x*w/48+random()*3,y*h/42,5+random()*2,5+random()*2);
  }
 })});
 function stamp(geo,material,x,y,z,sx,sy,sz,rotation){
  const key=geo.uuid+material.uuid;
  if(!batches.has(key))batches.set(key,{geo,material,matrices:[]});
  dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);
  if(rotation)dummy.quaternion.copy(rotation);else dummy.quaternion.identity();
  dummy.updateMatrix();batches.get(key).matrices.push(dummy.matrix.clone());
 }
 function box(x1,y1,z1,x2,y2,z2,material,solid=false){
  stamp(boxGeo,material,(x1+x2)/2,(y1+y2)/2,(z1+z2)/2,x2-x1,y2-y1,z2-z1);
  if(solid)colliders.push([x1,z1,x2,z2,y1,y2]);
 }
 function rod(a,b,r,material=steel){
  const delta=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
  stamp(tubeGeo,material,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,r,delta.length(),r,
   new THREE.Quaternion().setFromUnitVectors(up,delta.normalize()));
 }
 function surface(w,h,x,y,z,material,{yaw=0,rx=0,u=1,v=1}={}){
  const geo=new THREE.PlaneGeometry(w,h),uv=geo.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*u,uv.getY(i)*v);
  const mesh=new THREE.Mesh(geo,material);mesh.position.set(x,y,z);mesh.rotation.set(rx,yaw,0,'YXZ');scene.add(mesh);return mesh;
 }
 const signMaterials=new Map();
 function sign(lines,w,h,x,y,z,yaw=0,{bg='#e6ecec',fg='#164c7f',size=38}={}){
  const key=JSON.stringify([lines,bg,fg,size]);
  if(!signMaterials.has(key)){
   const map=texture(512,160,(ctx,tw,th)=>{
    ctx.fillStyle=bg;ctx.fillRect(0,0,tw,th);
    ctx.fillStyle=fg;ctx.font='bold '+size+'px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
    lines.forEach((line,i)=>ctx.fillText(line,tw/2,th/2+(i-(lines.length-1)/2)*(size+10),tw-24));
   });
   signMaterials.set(key,new THREE.MeshBasicMaterial({map}));
  }
  surface(w,h,x,y,z,signMaterials.get(key),{yaw});
 }

 const h=2.95;

 function wallsX(x1,x2,z,material=white,base=0,top=h){
  box(x1,base,z-.085,x2,top,z+.085,material,true);
  if(base===0)box(x1,0,z-.095,x2,.09,z+.095,joint);
 }
 function wallsZ(z1,z2,x,material=white,base=0,top=h){
  box(x-.085,base,z1,x+.085,top,z2,material,true);
  if(base===0)box(x-.095,0,z1,x+.095,.09,z2,joint);
 }
 function oakWall(z1,z2,x,direction){
  wallsZ(z1,z2,x,wood);
  for(let z=z1+.78;z<z2-.06;z+=.83)box(x+direction*.088-.005,0,z,x+direction*.088+.005,h,z+.012,black);
  box(x+direction*.092-.006,.39,z1,x+direction*.092+.006,.402,z2,black);
 }
 function pointLamp(x,z,y=h){
  box(x-.3,y-.019,z-.3,x+.3,y-.004,z+.3,light);
  surface(.59,.59,x,y-.021,z,light,{rx:Math.PI/2});
 }
 function roomLight(x,z,intensity,y=2.79){
  const lamp=new THREE.PointLight(0xfffaf0,intensity,8,2);
  lamp.position.set(x,y,z);scene.add(lamp);
 }

 // Place door parts in the plane of the opening, facing the player.
 function door(x,z,w,height,yaw,{double=false,top=0,pane=glassDark,panorama=null,label=null,bottom=0,closed=false}={}){
  const cos=Math.round(Math.cos(yaw)),sin=Math.round(Math.sin(yaw));
  function part(u1,y1,n1,u2,y2,n2,material){
   const ax=x+u1*cos+n1*sin,bx=x+u2*cos+n2*sin;
   const az=z-u1*sin+n1*cos,bz=z-u2*sin+n2*cos;
   box(Math.min(ax,bx),y1+bottom,Math.min(az,bz),Math.max(ax,bx),y2+bottom,Math.max(az,bz),material);
  }
  part(-w/2,0,-.075,w/2,height+top,.015,black);
  if(panorama)surface(w-.089,height+top-.058,x+.025*sin,bottom+(height+top)/2,z+.025*cos,panorama,{yaw});
  for(const u of [-w/2,w/2-.054])part(u,0,.01,u+.054,height+top,.076,trim);
  for(const y of [0,height-.053,...(top?[height+top-.046]:[])])part(-w/2,y,.01,w/2,y+.047,.076,trim);
  const split=double?[[-w/2+.056,-.026],[.026,w/2-.056]]:[[-w/2+.056,w/2-.056]];
  if(double)part(-.026,0,.01,.026,height+top,.076,trim);
  for(const [a,b] of split){
   if(!panorama){
    part(a+.008,.06,.018,b-.008,.64,.047,pane);
    part(a+.008,.704,.018,b-.008,height-.066,.047,pane);
    if(top)part(a+.008,height+.018,.018,b-.008,height+top-.05,.047,pane);
   }
   part(a,.642,.013,b,.703,.072,trim);
   const side=a<0&&double?b-.045:a+.04;
   part(side-.023,.9,.046,side+.023,1.104,.09,trim);
   part(side-.014,1.021,.076,side+.115,1.053,.137,trim);
   const hinge=a<0&&double?a:b-.027;
   for(const y of [.19,.88,1.49,height-.29]){
    part(hinge,y,.064,hinge+.031,y+.081,.098,trim);
    part(hinge+.012,y+.036,.096,hinge+.025,y+.078,.105,steel);
   }
   part(side-.008,.943,.089,side+.008,.961,.093,black);
  }
  if(closed){
   const hw=cos?w/2:.083,hd=cos?.083:w/2;
   colliders.push([x-hw,z-hd,x+hw,z+hd,bottom,bottom+height]);
  }
  if(label){
   const u=w/2+.29;
   const y=height-.05;
   part(u-.26,y-.085,.086,u+.26,y+.085,.094,trim);
   for(const offset of [-.245,.245])part(u+offset-.009,y-.009,.095,u+offset+.009,y+.009,.107,steel);
   sign(label,.46,.133,x+u*cos+.097*sin,bottom+y,z-u*sin+.097*cos,yaw,{bg:'#e9ece7',size:33});
  }
 }

 const entryScene=mat(0xffffff,{map:texture(384,384,(ctx,w,h)=>{
  const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#92afd0');sky.addColorStop(.48,'#bac9d0');sky.addColorStop(1,'#7b8287');
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#b3b6b8';ctx.fillRect(0,88,w,163);
  ctx.fillStyle='#234c72';ctx.fillRect(0,82,w,14);
  for(let i=0;i<9;i++){ctx.fillStyle='#2a5985';ctx.fillRect(7+i*45,117,27,74);ctx.fillStyle='#688da5';ctx.fillRect(10+i*45,121,21,65)}
  ctx.strokeStyle='#c4c2b7';ctx.lineWidth=2;
  for(let y=262;y<h;y+=13){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  for(let x=-w;x<w*2;x+=33){ctx.beginPath();ctx.moveTo(w/2+(x-w/2)*.49,252);ctx.lineTo(x,h);ctx.stroke()}
 }),roughness:.26});

 function rail(ax,az,bx,bz,ay=0,by=ay,{solid=true,posts=null}={}){
  const len=Math.hypot(bx-ax,bz-az);
  for(const [height,r] of [[.96,.028],[.69,.014],[.44,.014],[.20,.014]])rod([ax,ay+height,az],[bx,by+height,bz],r);
  const n=posts||Math.ceil(len/.8);
  for(let i=0;i<=n;i++){
   const f=i/n,x=ax+(bx-ax)*f,z=az+(bz-az)*f,y=ay+(by-ay)*f;
   rod([x,y,z],[x,y+.963,z],.024);rod([x,y,z],[x,y+.025,z],.059);
  }
  if(solid)colliders.push([Math.min(ax,bx)-.024,Math.min(az,bz)-.024,Math.max(ax,bx)+.024,Math.max(az,bz)+.024,Math.min(ay,by),Math.max(ay,by)+.96]);
 }
 function turnstile(x,z){
  box(x-.16,0,z-.29,x+.16,.91,z+.29,steel,true);
  box(x-.24,.88,z-.34,x+.24,1.015,z+.34,steel);
  rod([x,1,z],[x,1.19,z],.045);
  box(x-.115,1.13,z-.057,x+.115,1.43,z+.057,black);
  const display={bg:'#172633',fg:'#a9dfca',size:55};
  sign(['↗'],.165,.23,x,1.278,z+.059,0,display);sign(['↗'],.165,.23,x,1.278,z-.059,Math.PI,display);
  for(const d of [-1,1])rod([x+.17,.84,z],[x+.23,.34,z+.28*d],.024);
 }

 function tactile(x1,z1,x2,z2,dots=false){
  if(dots){
   box(x1,.002,z1,x2,.027,z2,yellow);
   const columns=Math.round((x2-x1)/.066),rows=Math.round((z2-z1)/.066);
   for(let col=0;col<columns;col++)for(let row=0;row<rows;row++){
    const x=x1+(x2-x1)*(col+.5)/columns,z=z1+(z2-z1)*(row+.5)/rows;
    stamp(potGeo,ridge,x,.028,z,.017,.014,.017);
   }
   return;
  }
  box(x1,.002,z1,x2,.016,z2,yellow);
  const alongZ=z2-z1>x2-x1;
  const length=alongZ?z2-z1:x2-x1,count=Math.ceil(length/.31);
  for(let i=0;i<count;i++){
   const start=i*length/count,end=(i+1)*length/count-.011;
   for(let j=0;j<5;j++){
    const offset=.035+j*.061;
    if(alongZ)box(x1+offset,.014,z1+start,x1+offset+.017,.023,z1+end,ridge);
    else box(x1+start,.014,z1+offset,x1+end,.023,z1+offset+.017,ridge);
   }
  }
 }

 const greens=[0x173b27,0x244a30,0x355b34,0x4d713e].map(c=>mat(c,{roughness:.43}));
 const soil=mat(0x463728);
 function plant(x,z,s=1,y=0,solid=false){
  const r=.20*s;
  stamp(potGeo,trim,x,y+.15*s,z,r,.3*s,r);
  stamp(tubeGeo,soil,x,y+.295*s,z,r*.86,.012,r*.86);
  if(solid)colliders.push([x-r,z-r,x+r,z+r,y,y+.45*s]);
  for(let j=0;j<8;j++){
   const angle=(j+random()*.4)*Math.PI/4,dx=Math.cos(angle),dz=Math.sin(angle);
   const tip=[x+dx*.29*s,y+(.7+random()*.27)*s,z+dz*.29*s];
   rod([x,y+.28*s,z],tip,.012*s,greens[0]);
   for(let k=1;k<=3;k++)for(const side of [-1,1]){
    const f=.18+k*.21,py=y+.28*s+(tip[1]-y-.28*s)*f;
    const leafAngle=angle+side*.75,ldx=Math.cos(leafAngle),ldz=Math.sin(leafAngle);
    const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(.12,-leafAngle,.29));
    stamp(leafGeo,greens[(j+k)%greens.length],x+dx*.29*s*f+ldx*.083*s,py+.02*s,z+dz*.29*s*f+ldz*.083*s,.13*s,.036*s,.067*s,q);
   }
   stamp(leafGeo,greens[(j+1)%greens.length],tip[0],tip[1],tip[2],.12*s,.036*s,.068*s,
    new THREE.Quaternion().setFromEuler(new THREE.Euler(.1,-angle,.55)));
  }
 }

 const photoMaterial=mat(0xffffff,{side:THREE.DoubleSide,map:texture(384,512,(ctx,w,h)=>{
  for(let row=0;row<8;row++)for(let col=0;col<6;col++){
   const x=col*64,y=row*64;
   ctx.fillStyle='#ece7dc';ctx.fillRect(x,y,64,64);
   const sky=ctx.createLinearGradient(0,y,0,y+52);
   sky.addColorStop(0,['#6f95b3','#526e83','#7f9c99','#a79884'][Math.floor(random()*4)]);sky.addColorStop(1,'#c7c7ac');
   ctx.fillStyle=sky;ctx.fillRect(x+2,y+2,60,55);
   if((row+col)%3===0){
    ctx.fillStyle='#5a725b';ctx.beginPath();ctx.moveTo(x+2,y+44);ctx.lineTo(x+18,y+18);ctx.lineTo(x+29,y+38);
    ctx.lineTo(x+49,y+14);ctx.lineTo(x+62,y+35);ctx.lineTo(x+62,y+57);ctx.lineTo(x+2,y+57);ctx.closePath();ctx.fill();
   }else{
    ctx.fillStyle=['#526168','#8f7965','#668287'][Math.floor(random()*3)];ctx.fillRect(x+8,y+24,49,30);
    for(let j=0;j<5;j++){ctx.fillStyle='#c4d9df';ctx.fillRect(x+11+j*9,y+28,5,9);ctx.fillRect(x+11+j*9,y+42,5,7)}
    if((row+col)%2===0){ctx.fillStyle='#4b5356';ctx.fillRect(x+27,y+43,4,14);ctx.fillRect(x+39,y+45,4,12)}
   }
  }
 })});

 function bin(x,z){
  box(x-.145,0,z-.14,x+.145,.39,z+.14,trim,true);
  box(x-.15,.31,z-.145,x+.15,.34,z+.145,black);
  box(x-.11,.383,z-.101,x+.11,.405,z+.101,white);
 }
 function cooler(x,z){
  box(x-.17,0,z-.164,x+.17,.94,z+.164,steel,true);
  box(x-.115,.54,z+.14,x+.115,.82,z+.174,black);
  box(x-.08,.736,z+.174,x+.08,.77,z+.197,trim);
  stamp(potGeo,mat(0x568cbb,{roughness:.33}),x,1.137,z,.155,.39,.155);
  stamp(tubeGeo,mat(0x326797),x,1.16,z,.157,.08,.157);
  stamp(potGeo,trim,x,1.344,z,.044,.07,.044);
 }

 function poster(title,x,z,yaw,ochre){
  const map=texture(220,390,(ctx,w,h)=>{
   const gradient=ctx.createLinearGradient(0,0,0,h);
   gradient.addColorStop(0,ochre?'#d5a51d':'#598db5');gradient.addColorStop(1,ochre?'#a45e15':'#253e78');
   ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
   ctx.strokeStyle='#f8eee0';ctx.lineWidth=5;
   for(const [cx,cy,d] of [[106,294,1],[146,324,-1]]){
    ctx.beginPath();
    for(let i=0;i<105;i++){
     const a=i/8,r=i*.47,px=cx+Math.cos(a)*r*d,py=cy+Math.sin(a)*r;
     if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.stroke();
   }
   ctx.fillStyle='#f6f0e8';ctx.font='bold 25px Arial';ctx.textAlign='center';
   title.forEach((line,i)=>ctx.fillText(line,w/2,134+i*36,w-22));
  });
  surface(.75,1.34,x,1.66,z,new THREE.MeshBasicMaterial({map}),{yaw});
 }

 // Dimensions use the 60 cm floor tiles and the entrance door as references.
 // Enter toward -Z. The far hall turns LEFT (-X), away from the main corridor.
 const layout={corridorLeft:-.95,corridorRight:2.15,endZ:-30.6,turnZ:-27.85};
 const floorAreas=[
  {x1:-4.8,x2:7.2,z1:-6.6,z2:0},
  {x1:-.95,x2:2.15,z1:-30.6,z2:-6.6},
  {x1:-4.8,x2:-.95,z1:-11.7,z2:-6.6},
  {x1:2.15,x2:6.75,z1:-21.4,z2:-17.8},
  {x1:-8.9,x2:-.95,z1:-30.6,z2:-25.2},
  {x1:2.3,x2:5.8,z1:0,z2:4.4}
 ];
 for(const a of floorAreas){
  const w=a.x2-a.x1,d=a.z2-a.z1,x=(a.x1+a.x2)/2,z=(a.z1+a.z2)/2;
  surface(w,d,x,0,z,tile,{rx:-Math.PI/2,u:w/.6,v:d/.6});
  const ceilingY=a.z1===0?6.662:h;
  if(a.x1!==2.15)surface(w,d,x,ceilingY,z,ceiling,{rx:Math.PI/2,u:w/.6,v:d/.6});
 }
 wallsX(-4.8,-1.04,0);wallsX(1.04,2.3,0);wallsX(4.25,7.2,0,wood);
 wallsX(-1.04,1.04,0,white,2.72);wallsX(2.3,4.25,0,white,2.68);
 wallsZ(-6.6,0,-4.8);oakWall(-6.6,0,7.2,-1);
 wallsX(2.15,7.2,-6.6,wood);
 oakWall(-11.7,-6.6,-4.8,1);wallsX(-4.8,-.95,-11.7,wood);
 oakWall(-26.2,-11.7,-.95,1);
 oakWall(-30.6,-29.8,-.95,1);
 wallsZ(-29.8,-26.2,-.95,white,2.68);
 for(const [z1,z2] of [[-17.8,-6.6],[-30.6,-21.4]]){
  wallsZ(z1,z2,2.15);
  surface(z2-z1,2.67,2.061,1.5,(z1+z2)/2,mosaic,{yaw:-Math.PI/2,u:(z2-z1)/4.5});
 }
 // A broad, perpendicular hall. The display cases cannot be seen straight ahead.
 wallsX(-8.9,-.95,-25.2);wallsX(-8.9,2.15,-30.6,wood);
 wallsZ(-30.6,-28.99,-8.9,wood);wallsZ(-26.71,-25.2,-8.9,wood);
 wallsZ(-28.99,-26.71,-8.9,wood,2.72);
 for(const z of [-6.6,-11.9,-16.5,-21.5,-26.1])box(-.87,h-.24,z-.13,2.07,h,z+.13,white);
 for(const x of [-6.8,-3.8])box(x-.12,h-.24,-30.6,x+.12,h,-25.2,white);
 box(-4.8,h-.24,-6.62,7.2,h,-6.4,white);
 for(const z of [-1.1,-3.8,-5.8])for(const x of [-3.45,.1,4.8])pointLamp(x,z);
 for(const z of [-8.4,-11.8,-15.1,-18.7,-22.3,-25.6,-29])pointLamp(.55,z);
 for(const x of [-2.9,-5.5,-7.9])for(const z of [-26.5,-29.2])pointLamp(x,z);
 pointLamp(-3,-8.6);
 for(const [x,z,i] of [[-.8,-2.9,.20],[5.3,-3.5,.19],[-2.8,-8.6,.19],[.6,-10,.16],[.6,-16,.17],[.6,-22.9,.16],[.6,-28,.16],[-4,-27.8,.19],[-7.4,-27.8,.17]])roomLight(x,z,i);

 door(0,-.035,2.08,2.16,Math.PI,{double:true,top:.56,panorama:entryScene,closed:true});
 sign(['ШЫҒУ · ВЫХОД'],.54,.135,0,2.84,-.106,Math.PI,{bg:'#287054',fg:'#fff',size:54});
 sign(['ВНИМАНИЕ','ВХОД В КОРПУС'],.32,.35,.46,1.28,-.122,Math.PI,{bg:'#e7bb22',fg:'#433512',size:39});
 for(const z of [-1.45,-3.25,-5.05]){
  surface(1.02,1.76,-4.707,1.7,z,entryScene,{yaw:Math.PI/2});
  for(const y of [.8,2.6])box(-4.71,y-.025,z-.55,-4.65,y+.025,z+.55,trim);
  for(const zz of [z-.55,z+.52])box(-4.71,.78,zz,-4.65,2.625,zz+.03,trim);
  box(-4.72,.76,z-.61,-4.5,.81,z+.61,trim);
  for(let i=0;i<9;i++)box(-4.7,.13,z-.46+i*.11,-4.61,.66,z-.39+i*.11,white);
 }
 for(const [z,label,opaque] of [
  [-14.35,['ЖЕНСКИЙ ТУАЛЕТ'],true],[-17.15,['МУЖСКОЙ ТУАЛЕТ'],true],
  [-22.5,['ОТДЕЛ КАДРОВ','МАРИНА СЕРГЕЕВНА'],false],[-25.05,['УЧЕБНЫЙ ОТДЕЛ','ЕЛЕНА ВИКТОРОВНА'],false]
 ])door(-.858,z,.93,2.1,Math.PI/2,{pane:opaque?frost:glassDark,label,closed:true});
 door(-2.55,-11.608,1.08,2.12,0,{double:true,label:['ПРЕПОДАВАТЕЛЬСКАЯ','АНДРЕЙ ПЕТРОВИЧ'],closed:true});
 for(const [z,label] of [[-8.08,['АКТОВЫЙ ЗАЛ']],[-12.8,['АУДИТОРИЯ №3']],[-22.8,['АУДИТОРИЯ №2']],[-28.65,['АУДИТОРИЯ №1']]])
  door(2.057,z,.98,2.1,-Math.PI/2,{label,closed:true});
 door(.63,-30.505,1.66,2.16,0,{double:true,pane:white,closed:true});
 door(-8.805,-27.85,2.28,2.16,Math.PI/2,{double:true,top:.56,panorama:entryScene,closed:true});
 sign(['ШЫҒУ · ВЫХОД'],.54,.135,-8.79,2.84,-27.85,Math.PI/2,{bg:'#287054',fg:'#fff',size:54});

 turnstile(-.68,-2.62);turnstile(-1.99,-2.62);
 rail(1.22,-2.62,2.3,-2.62);rail(2.3,-2.62,2.3,-1.42);
 rail(-3.73,-2.62,-3.15,-2.62);
 rod([-3.13,0,-2.62],[-3.13,1.02,-2.62],.035);
 box(-3.17,.18,-2.64,-3.09,.91,-1.92,glass,true);

 // The waiting room faces sideways from the entrance lane, as in the photographs.
 function sofaX(x1,x2,z,backTowardNorth,seats){
  const z1=z-.39,z2=z+.39;
  box(x1,.035,z1,x2,.09,z2,black,true);
  for(let i=0;i<seats;i++){
   const a=x1+(x2-x1)*i/seats,b=x1+(x2-x1)*(i+1)/seats-.018;
   box(a,.09,z1,b,.44,z2,beige,true);
   const backZ=backTowardNorth?z1:z2-.17;
   box(a+.009,.45,backZ,b-.009,.94,backZ+.17,beige,true);
  }
 }
 sofaX(2.65,6.63,-6.09,true,5);sofaX(4.35,6.63,-.47,false,3);
 const ribbed=mat(0xffffff,{map:texture(128,256,(ctx,w,th)=>{
  ctx.fillStyle='#ecece6';ctx.fillRect(0,0,w,th);ctx.fillStyle='#c8c8bf';for(let x=0;x<w;x+=4)ctx.fillRect(x,0,1,th);
 })});
 surface(4.15,h-.07,4.38,h/2,-6.507,ribbed,{u:8});
 sign(['BQFQ','БІЛІМ · ШЫҒАРМАШЫЛЫҚ · ДАМУ'],2.7,.44,4.38,1.91,-6.49,0,{bg:'#ecece6',fg:'#17467b',size:37});
 for(const [z,w] of [[-5.37,.92],[-3.53,1.64],[-1.66,.94]])
  box(7.065,1.02,z-w/2,7.11,2.69,z+w/2,black);
 for(const z of [-5.32,-3.52,-1.7])plant(6.7,z,.93,0,true);

 // Guard post, three compact nature stands, then the circular photo exhibition.
 box(-3.62,0,-5.55,-1.24,1.01,-5.22,white,true);
 box(-3.62,0,-6.48,-3.34,1.01,-5.55,white,true);
 box(-3.67,1.01,-6.49,-3.32,1.065,-5.17,trim);
 box(-3.32,1.01,-5.6,-1.19,1.065,-5.17,trim);
 const deskFace=mat(0xffffff,{map:texture(384,160,(ctx,w,th)=>{
  ctx.fillStyle='#f3f2e9';ctx.fillRect(0,0,w,th);ctx.fillStyle='#896a4e';ctx.beginPath();
  ctx.moveTo(w*.85,0);ctx.lineTo(w,0);ctx.lineTo(w*.44,th);ctx.lineTo(w*.23,th);ctx.closePath();ctx.fill();
 })});
 surface(2.38,.995,-2.43,.51,-5.215,deskFace);
 box(-2.8,1.067,-5.53,-2.45,1.09,-5.31,black);
 box(-2.68,1.08,-5.46,-2.63,1.2,-5.41,black);box(-2.93,1.19,-5.47,-2.38,1.48,-5.43,black);
 // One guard counter: each pot stands on its top, clear of the monitor.
 for(const x of [-3.28,-2.05,-1.49])plant(x,-5.40,.4,1.065);
 box(-1.07,0,-6.6,-.83,h,-6.35,white,true);
 for(const z of [-1.18,-2.46,-3.74]){
  const x=-4.1;
  box(x-.23,0,z-.23,x+.23,.78,z+.23,wood,true);
  box(x-.255,.78,z-.255,x+.255,2.15,z+.255,trim);
  for(const [dx,dz,yaw] of [[0,.257,0],[.257,0,Math.PI/2],[0,-.257,Math.PI],[-.257,0,-Math.PI/2]])
   surface(.47,1.26,x+dx,1.46,z+dz,photoMaterial,{yaw,u:1/6,v:.75});
 }
 const ringX=-3,ringZ=-8.75,ringRadius=1.26;
 for(const y of [.055,2.15]){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(ringRadius,.022,8,64),brass);
  ring.position.set(ringX,y,ringZ);ring.rotation.x=Math.PI/2;scene.add(ring);
 }
 for(let i=0;i<18;i++){
  const a=i*Math.PI*2/18,x=ringX+Math.sin(a)*ringRadius,z=ringZ+Math.cos(a)*ringRadius;
  rod([x,.055,z],[x,2.15,z],.011,brass);
  if(i===4||i===5)continue;
  surface(.4,1.98,x,1.08,z,glass,{yaw:a});
  const photos=surface(.31,1.48,x+Math.sin(a)*.006,1.08,z+Math.cos(a)*.006,photoMaterial,{yaw:a,u:1/6,v:1});
  const uv=photos.geometry.attributes.uv;for(let j=0;j<uv.count;j++)uv.setX(j,uv.getX(j)+(i%6)/6);
 }
 colliders.push([ringX-1.22,ringZ-1.22,ringX+1.22,ringZ+1.22,0,2.17]);
 for(const [y1,z1,y2,z2] of [[.25,-6.7,2.9,-10],[1.05,-11.55,1.7,-6.7],[2.9,-6.8,1.4,-9.7],[.4,-11.5,2.8,-9.3]])
  rod([-4.705,y1,z1],[-4.705,y2,z2],.047,trim);
 cooler(-1.31,-11.28);bin(-1.78,-11.28);bin(1.88,-30.17);

 tactile(-.165,-5.63,.165,-.85);
 tactile(-.38,-3.17,.38,-2.9,true);tactile(-.38,-2.31,.38,-2.04,true);
 tactile(-.165,-5.96,1.26,-5.63);tactile(1.26,-5.96,1.59,-5.63,true);
 tactile(1.26,-29.96,1.59,-5.96);
 for(const z of [-14.5,-17.3,-22.65,-25.2]){
  tactile(-.43,z,1.26,z+.33);tactile(-.65,z,-.32,z+.33,true);tactile(1.26,z,1.59,z+.33,true);
 }
 // The tactile route makes the same left turn as the corridor.
 tactile(-8.24,-28.015,1.26,-27.685);tactile(1.26,-28.015,1.59,-27.685,true);
 tactile(-8.32,-28.23,-8.04,-27.47,true);
 tactile(-2.58,-11.3,-2.25,-10.92);
 tactile(-2.58,-11.3,-2.25,-10.92,true);
 for(const [x,z,s] of [[1.81,-9.95,.91],[1.81,-11.2,.91],[1.81,-14.8,.9],[1.81,-16.1,.9],[1.81,-24.6,.97],[1.81,-26.1,.95],[1.81,-29.75,.88],[-3.87,-4.58,1.05]])plant(x,z,s,0,true);
 for(const [i,z,title] of [
  [0,-9.65,['СПОРТ','И КОМАНДА']],[1,-11.1,['ИДЕИ','В ДЕЙСТВИИ']],[2,-15.25,['ПРОЕКТЫ','СТУДЕНТОВ']],
  [3,-24.55,['СОЗДАВАЙ','И УЧИСЬ']],[4,-26.2,['ОТКРЫВАЙ','НОВОЕ']],[5,-29.83,['ЖИЗНЬ','КОЛЛЕДЖА']]
 ])poster(title,2.045,z,-Math.PI/2,i%2);

 // Glass trophy cabinets are along the LEFT wall when walking toward the side exit.
 const cupShape=[new THREE.Vector2(.026,0),new THREE.Vector2(.03,.018),new THREE.Vector2(.047,.04),new THREE.Vector2(.073,.11),new THREE.Vector2(.075,.14),new THREE.Vector2(.062,.143),new THREE.Vector2(.055,.065),new THREE.Vector2(.023,.028)];
 const cupGeo=new THREE.LatheGeometry(cupShape,16);
 const awardColors=[brass,mat(0xa7b5bd,{metalness:.48,roughness:.28}),mat(0x4d74a1),mat(0x963e3b)];
 function cup(x,y,z,s=1,variant=0){
  box(x-.073*s,y,z-.065*s,x+.073*s,y+.035*s,z+.065*s,black);
  rod([x,y+.035*s,z],[x,y+.1*s,z],.018*s,brass);
  stamp(cupGeo,awardColors[variant%awardColors.length],x,y+.09*s,z,s,s,s);
  for(const side of [-1,1]){
   rod([x+side*.06*s,y+.2*s,z],[x+side*.105*s,y+.195*s,z],.009*s,brass);
   rod([x+side*.105*s,y+.195*s,z],[x+side*.085*s,y+.13*s,z],.009*s,brass);
   rod([x+side*.085*s,y+.13*s,z],[x+side*.045*s,y+.125*s,z],.009*s,brass);
  }
 }
 const cabinetBack=mat(0x9caaa7);
 for(let i=0;i<7;i++){
  const x=-8.14+i*.70,z=-25.5;
  colliders.push([x-.35,-25.81,x+.35,-25.27,0,2.25]);
  // Recessed gray back, fine white frame and transparent front doors.
  box(x-.32,.10,-25.30,x+.32,2.20,-25.27,cabinetBack);
  for(const edge of [x-.35,x+.324])box(edge,.08,-25.78,edge+.026,2.25,-25.25,trim);
  box(x-.35,.05,-25.78,x+.35,.11,-25.25,trim);
  box(x-.35,2.21,-25.78,x+.35,2.25,-25.25,trim);
  for(let j=0;j<4;j++){
   const y=.16+j*.49;
   box(x-.322,y,-25.79,x+.322,y+.021,-25.29,steel);
   if((i+j)%3===0){
    cup(x,y+.024,z,1.15+((i+j)%2)*.2,i+j);
   }else{
    box(x-.23,y+.024,-25.63,x+.22,y+.36,-25.61,brass);
    sign(['BQFQ','ДИПЛОМ'],.42,.30,x,y+.195,-25.638,Math.PI,{bg:'#e9e4d6',fg:'#8b7247',size:44});
   }
  }
  box(x-.32,.11,-25.806,x+.32,2.20,-25.799,glass);
  box(x-.012,.11,-25.819,x+.012,2.21,-25.811,trim);
  rod([x+.045,.98,-25.84],[x+.045,1.16,-25.84],.008);
  for(let j=0;j<2;j++)cup(x+(j-.5)*.29,2.25,-25.49,1.25+((i+j)%3)*.3,i+j);
 }
 // Keep foliage clear of the turnstile's short side rail.
 for(const x of [-6.9,-5.8,-4.7,-3.6])plant(x,-26.16,1.1,0,true);
 // A neutral college exhibition replaces the political and state-symbol display.
 for(let i=0;i<3;i++){
  const x=-7.15+i*1.32;
  box(x-.61,.40,-30.49,x+.61,2.44,-30.41,trim);
  for(const edge of [x-.59,x+.57])box(edge,.43,-30.403,edge+.018,2.41,-30.389,brass);
  sign([['ПРОЕКТЫ','СПОРТ','ДОСТИЖЕНИЯ'][i]],1.11,.20,x,2.28,-30.38,0,{fg:'#826939',bg:'#eee9dc',size:44});
  const art=surface(1.06,1.59,x,1.39,-30.375,photoMaterial,{u:1/3,v:1});
  const uv=art.geometry.attributes.uv;for(let j=0;j<uv.count;j++)uv.setX(j,uv.getX(j)+i/3);
 }
 // Mount the header below the beams, with a visible clearance above it.
 box(-7.895,2.50,-30.46,-3.765,2.68,-30.40,trim);
 sign(['BQFQ · ЖИЗНЬ КОЛЛЕДЖА'],4.05,.16,-5.83,2.59,-30.385,0,{fg:'#826939',bg:'#eee9dc',size:44});
 for(let i=0;i<5;i++){
  const x=-7.8+i*1.08,z=-29.83;
  rod([x,0,z],[x,.87,z],.023,brass);rod([x,0,z],[x,.032,z],.10,brass);
  stamp(leafGeo,brass,x,.9,z,.044,.044,.044);
  if(i<4){
   for(let j=0;j<12;j++){
    const a=j/12,b=(j+1)/12;
    rod([x+1.08*a,.86-.25*Math.sin(a*Math.PI),z],[x+1.08*b,.86-.25*Math.sin(b*Math.PI),z],.017,red);
   }
   colliders.push([x,z-.025,x+1.08,z+.025,0,.94]);
  }
 }
 // Turnstile and short gates face the second exit, perpendicular to the main entry.
 rail(-7.57,-29.45,-7.57,-28.54);
 rail(-7.57,-26.62,-7.57,-26.15);
 box(-7.87,0,-27.07,-7.27,.92,-26.75,steel,true);
 box(-7.91,.89,-27.14,-7.23,1.015,-26.68,steel);
 rod([-7.57,1,-26.91],[-7.57,1.18,-26.91],.043);
 box(-7.625,1.12,-27.02,-7.515,1.42,-26.80,black);
 sign(['↗'],.17,.23,-7.507,1.28,-26.91,Math.PI/2,{bg:'#172633',fg:'#a9dfca',size:55});
 for(const d of [-1,1])rod([-7.57,.83,-27.08],[-7.57+.25*d,.34,-27.23],.023);
 // Open side gate stays beside the lane, leaving a clear 1.2 m passage.
 rod([-7.57,0,-28.54],[-7.57,1,-28.54],.026);
 box(-8.26,.2,-28.57,-7.57,.88,-28.53,glass,true);
 bin(-8.43,-29.93);
 for(const [x,z,yaw] of [[-1.22,-.1,Math.PI],[2.04,-17.57,-Math.PI/2],[2.04,-29.6,-Math.PI/2],[-8.79,-29.17,Math.PI/2]])
  sign(['⊙'],.14,.14,x,1.36,z,yaw,{bg:'#b52b2b',fg:'#fff',size:111});

 // The corridor's staircase has an ascending flight on its left and a walkway
 // underneath the return flight on its right. The first floor remains connected.
 wallsZ(-21.4,-17.8,6.75,white,0,6.502);
 wallsX(2.15,6.75,-21.4,white,0,6.502);wallsX(2.15,6.75,-17.8,white,0,6.502);
 // The return flight opens directly into the second-floor hall.
 // Both lanes open at the second floor: return from below and ascent to the hall.
 wallsZ(-21.4,-21.24,2.15,white,h,6.502);
 wallsZ(-19.72,-19.55,2.15,white,h,6.502);
 wallsZ(-21.24,-19.72,2.15,white,h,3.352);
 wallsZ(-21.24,-19.72,2.15,white,6.23,6.502);
 wallsZ(-18.03,-17.8,2.15,white,h,6.502);
 wallsZ(-19.55,-18.03,2.15,white,h,3.352);
 wallsZ(-19.55,-18.03,2.15,white,6.23,6.502);
 for(const [z,yaw] of [[-21.305,0],[-17.895,Math.PI]])surface(1.25,2.65,2.86,1.48,z,mosaic,{yaw,u:.28});
 const stone=mat(0xc2c1b9,{roughness:.51}),stairRuns=[];
 function flight(x0,direction,z1,z2,y0,steps=12,rise=.148,run=.255){
  const end=x0+direction*steps*run,top=y0+steps*rise;
  const profile=new THREE.Shape();profile.moveTo(x0,y0-.20);profile.lineTo(x0,y0-.04);
  for(let i=0;i<steps;i++){
   const a=x0+direction*i*run,b=a+direction*run,y=y0+(i+1)*rise;
   box(Math.min(a,b),y-rise-.01,z1,Math.max(a,b),y,z2,stone);
   box(a-.003,y-.007,z1,a+.003,y+.002,z2,joint);
  }
  profile.lineTo(end,top-.04);profile.lineTo(end,top-.20);profile.lineTo(x0,y0-.20);profile.closePath();
  const slab=new THREE.Mesh(new THREE.ExtrudeGeometry(profile,{depth:z2-z1-.04,bevelEnabled:false}),white);
  slab.position.z=z1+.02;scene.add(slab);
  stairRuns.push({axis:'x',start:x0,end,direction,lo:z1,hi:z2,y0,steps,rise,run});
  return {end,top,steps,rise,run};
 }
 const lower=flight(2.45,1,-21.24,-19.72,0);
 box(lower.end,lower.top-.2,-21.24,6.66,lower.top,-18.02,stone);
 const upper=flight(lower.end,-1,-19.55,-18.03,lower.top);
 box(2.22,upper.top-.2,-19.55,2.45,upper.top,-18.03,stone);
 function slopeRail(x0,x1,z,y0,rise,run,steps){
  for(const [height,r] of [[.96,.026],[.68,.012],[.42,.012],[.19,.012]])rod([x0,y0+rise+height,z],[x1,y0+rise*steps+height,z],r);
  for(let i=0;i<steps;i+=3){
   const x=x0+(x1-x0)*(i+.5)/steps,y=y0+(i+1)*rise;
   rod([x,y,z],[x,y+.96,z],.023);rod([x,y,z],[x,y+.023,z],.052);
  }
 }
 slopeRail(2.45,lower.end,-19.73,0,lower.rise,lower.run,lower.steps);
 slopeRail(lower.end,upper.end,-19.54,lower.top,upper.rise,upper.run,upper.steps);
 // The outer flight follows the wall; the inner edge alone has balustrade posts.
 rod([2.49,1.13,-21.30],[lower.end,lower.top+.96,-21.30],.026);
 for(const y of [.96,.68,.42,.19])rod([lower.end,lower.top+y,-19.73],[lower.end,lower.top+y,-19.54],.013);
 for(const f of stairRuns){
  for(let i=0;i<f.steps;i++){
   const a=f.start+f.direction*i*f.run,b=a+f.direction*f.run,y=f.y0+(i+1)*f.rise;
   const inner=f===stairRuns[0]?f.hi:f.lo;
   colliders.push([Math.min(a,b),inner-.027,Math.max(a,b),inner+.027,y-.2,y+.96]);
  }
 }
 // The landing soffit meets the sloping flight and the door's solid lintel.
 const landingSoffit=lower.top-.20;
 box(lower.end,landingSoffit,-19.55,6.66,landingSoffit+.035,-18.03,white);
 box(6.57,1.535,-19.26,6.675,landingSoffit,-18.16,trim);
 door(6.655,-18.71,1.00,1.54,-Math.PI/2,{double:true,pane:white,closed:true});
 const blueBin=mat(0x1b5792);
 box(6.02,0,-18.36,6.42,.81,-17.96,blueBin,true);box(5.99,.78,-18.39,6.45,.85,-17.93,blueBin);
 box(6.03,.837,-18.35,6.41,.849,-17.97,black);
 sign(['↓'],.17,.2,6.22,.52,-18.392,Math.PI,{bg:'#1b5792',fg:'#fff',size:80});
 pointLamp(5.9,-18.6,lower.top-.23);roomLight(5.6,-18.7,.13,2.03);
 // Second floor: a broad, plain white stair hall and a narrower office corridor.
 // Its level comes from the existing rear staircase, so neither end teleports.
 const floor2=upper.top,frontLevel=floor2+.16,ceiling2=floor2+h;
 const upperFloors=[];
 function tiledLanding(x1,z1,x2,z2,level,ceilingHeight=null){
  box(x1,level-.20,z1,x2,level-.008,z2,white);
  surface(x2-x1,z2-z1,(x1+x2)/2,level,(z1+z2)/2,tile,
   {rx:-Math.PI/2,u:(x2-x1)/.6,v:(z2-z1)/.6});
  if(ceilingHeight!==null)surface(x2-x1,z2-z1,(x1+x2)/2,ceilingHeight,(z1+z2)/2,ceiling,
   {rx:Math.PI/2,u:(x2-x1)/.6,v:(z2-z1)/.6});
  upperFloors.push({x1,z1,x2,z2,level});
 }
 function upperWallX(x1,x2,z,base=floor2,top=ceiling2){
  wallsX(x1,x2,z,white,base,top);
  box(x1,base,z-.096,x2,base+.095,z+.096,joint);
 }
 function upperWallZ(z1,z2,x,base=floor2,top=ceiling2){
  wallsZ(z1,z2,x,white,base,top);
  box(x-.096,base,z1,x+.096,base+.095,z2,joint);
 }
 // Office plaques use fictional staff names and remain readable at walking height.
 function office(x,z,w,yaw,lines,{double=false,opaque=false,level=floor2}={}){
  door(x,z,w,2.12,yaw,{double,pane:opaque?frost:glassDark,bottom:level,closed:true});
  const nx=Math.sin(yaw),nz=Math.cos(yaw),ux=Math.cos(yaw),uz=-Math.sin(yaw);
  const px=x+ux*(w/2+.47)+nx*.10,pz=z+uz*(w/2+.47)+nz*.10;
  if(Math.abs(nx)>.5)box(px-.012,level+1.73,pz-.38,px+.012,level+1.99,pz+.38,trim);
  else box(px-.38,level+1.73,pz-.012,px+.38,level+1.99,pz+.012,trim);
  sign(lines,.73,.245,px+nx*.014,level+1.86,pz+nz*.014,yaw,{size:32,bg:'#edf0ed',fg:'#214d7c'});
 }
 tiledLanding(-2.75,-22.4,2.22,-16.55,floor2,ceiling2);
 tiledLanding(.30,-16.55,2.20,-1.75,floor2,ceiling2);
 // A single 16 cm step leads to the landing above the entrance staircase.
 tiledLanding(.30,-1.75,2.20,-1.40,frontLevel,ceiling2+.16);
 box(.30,floor2-.01,-1.76,2.20,frontLevel,-1.75,stone);
 tiledLanding(.30,-1.40,5.61,.08,frontLevel,ceiling2+.16);
 upperWallX(-2.75,2.15,-22.4);
 upperWallZ(-22.4,-16.55,-2.75);
 upperWallX(-2.75,.30,-16.55);
 upperWallZ(-22.4,-21.4,2.15);
 upperWallZ(-17.8,-16.55,2.15);
 upperWallZ(-16.55,-1.75,.30);
 upperWallZ(-16.55,-1.75,2.20);
 upperWallZ(-1.75,-1.40,2.20,frontLevel,ceiling2+.16);
 upperWallZ(-1.75,.08,.30,frontLevel,ceiling2+.16);
 upperWallX(.30,2.30,.08,frontLevel,ceiling2+.16);
 upperWallX(2.20,5.80,-1.40,frontLevel,ceiling2+.16);
 upperWallZ(-1.40,0,5.80,frontLevel,ceiling2+.16);
 // A wide hall with two small frosted doors, and an office opposite the stairs.
 office(-2.65,-20.88,.82,Math.PI/2,['ЖЕНСКИЙ','ТУАЛЕТ'],{opaque:true});
 office(-2.65,-18.40,.82,Math.PI/2,['МУЖСКОЙ','ТУАЛЕТ'],{opaque:true});
 office(-.42,-22.30,1.40,0,['КАБИНЕТ ДИРЕКТОРА','НАТАЛЬИ ИВАНОВНЫ'],{double:true});
 office(.40,-14.20,.90,Math.PI/2,['ЗАМЕСТИТЕЛЬ ДИРЕКТОРА','АЛЕКСЕЙ ПЕТРОВИЧ']);
 office(2.10,-11.70,.90,-Math.PI/2,['МЕТОДИЧЕСКИЙ КАБИНЕТ','ОЛЬГА СЕРГЕЕВНА']);
 office(.40,-7.00,.90,Math.PI/2,['БУХГАЛТЕРИЯ','ТАТЬЯНА ВИКТОРОВНА']);
 office(2.10,-3.85,.90,-Math.PI/2,['ПРИЁМНАЯ','АННА МИХАЙЛОВНА']);
 // The plain white finish, skirting, ceiling grid and small crossbeams match the photos.
 for(const z of [-15.85,-9.4,-2.20])box(.39,ceiling2-.24,z-.12,2.11,ceiling2,z+.12,white);
 for(const [x,z] of [[-1.35,-21.10],[.88,-21.10],[-1.35,-17.55],[.88,-17.55],
  [1.25,-14.7],[1.25,-11.55],[1.25,-8.45],[1.25,-5.3],[1.25,-2.15]])pointLamp(x,z,ceiling2);
 for(const [x,z] of [[-.5,-20.4],[.5,-17.3],[1.25,-12.4],[1.25,-7.8],[1.25,-3]])roomLight(x,z,.15,ceiling2-.18);
 // Closed office doors are the only doors upstairs; passageways stay open.
 sign(['ЛЕСТНИЦА ↓'],.48,.13,2.053,floor2+2.25,-17.12,-Math.PI/2,{bg:'#287054',fg:'#fff',size:46});
 sign(['2 ЭТАЖ'],.37,.14,-1.48,floor2+2.25,-22.294,0,{bg:'#e7ebe7',fg:'#214d7c',size:54});
 // Compact waste bin against the landing wall, leaving the circulation space clear.
 box(-2.48,floor2,-16.98,-2.19,floor2+.39,-16.69,trim,true);
 box(-2.49,floor2+.31,-16.99,-2.18,floor2+.34,-16.68,black);
 box(-2.45,floor2+.383,-16.95,-2.22,floor2+.405,-16.72,white);

 // Complete the staircase behind the short sofa: two parallel flights and a turn.
 // The old first flight stopped halfway up; this one reaches the new corridor.
 const frontRise=frontLevel/24,frontMid=frontLevel/2;
 // Close the wall above the ground-floor doorway up to the upper landing slab.
 // The former 2.95 m wall left an open band exposing the lobby ceiling from the stairs.
 wallsX(2.30,5.80,0,white,h,frontLevel-.20);
 wallsZ(0,4.40,2.30,white,0,ceiling2+.16);
 wallsZ(0,4.40,5.80,white,0,ceiling2+.16);
 wallsX(2.30,5.80,4.40,white,0,ceiling2+.16);
 function frontFlight(x1,x2,z0,direction,y0){
  const steps=12,run=.25,end=z0+direction*steps*run,top=y0+steps*frontRise;
  for(let i=0;i<steps;i++){
   const a=z0+direction*i*run,b=a+direction*run,y=y0+(i+1)*frontRise;
   box(x1,y-frontRise-.01,Math.min(a,b),x2,y,Math.max(a,b),stone);
   box(x1,y-.006,a-.003,x2,y+.002,a+.003,joint);
  }
  const p=new THREE.Shape();p.moveTo(-z0,y0-.20);p.lineTo(-z0,y0-.04);
  p.lineTo(-end,top-.04);p.lineTo(-end,top-.20);p.closePath();
  const soffit=new THREE.Mesh(new THREE.ExtrudeGeometry(p,{depth:x2-x1,bevelEnabled:false}),white);
  soffit.rotation.y=Math.PI/2;soffit.position.x=x1;scene.add(soffit);
  stairRuns.push({axis:'z',start:z0,end,direction,lo:x1,hi:x2,y0,steps,rise:frontRise,run});
  return {end,top};
 }
 frontFlight(2.42,3.93,.08,1,0);
 tiledLanding(2.42,3.08,5.61,4.28,frontMid);
 frontFlight(4.10,5.61,3.08,-1,frontMid);
 function frontRail(x,z0,z1,y0){
  for(const [height,r] of [[.96,.026],[.68,.012],[.42,.012],[.19,.012]])
   rod([x,y0+frontRise+height,z0],[x,y0+12*frontRise+height,z1],r);
  for(let i=0;i<12;i++){
   const z=z0+(z1-z0)*(i+.5)/12,y=y0+(i+1)*frontRise;
   if(i%3===0){rod([x,y,z],[x,y+.96,z],.023);rod([x,y,z],[x,y+.024,z],.052)}
   colliders.push([x-.027,Math.min(z0,z1)+(i*.25),x+.027,Math.min(z0,z1)+(i+1)*.25,
    y0+(z1>z0?i+1:12-i)*frontRise-.2,y0+(z1>z0?i+1:12-i)*frontRise+.96]);
  }
 }
 frontRail(3.91,.08,3.08,0);frontRail(4.12,3.08,.08,frontMid);
 rail(3.91,3.08,4.12,3.08,frontMid);
 rail(2.42,4.28,5.61,4.28,frontMid);
 // Upper landing guards stop at the stair mouth rather than crossing the path.
 rail(2.42,.08,3.96,.08,frontLevel);
 pointLamp(4.8,3.7,ceiling2+.16);pointLamp(3.1,-.38,ceiling2+.16);
 roomLight(4.7,2.6,.16,ceiling2-.05);

 // Third floor. The staircase opens inside the hall, beside the stage on the left.
 // Audience faces -X; the tall curtained windows are on its right (-Z).
 const hallLevel=floor2*2,hallCeiling=hallLevel+3.20,hallFloors=[];
 const hallBounds={x1:-2.60,x2:16.20,z1:-29.10,z2:-16.85};
 const carpet=mat(0xffffff,{map:texture(256,256,(ctx,w,h)=>{
  ctx.fillStyle='#777a76';ctx.fillRect(0,0,w,h);
  for(let i=0;i<22000;i++){
   const value=105+Math.floor(random()*45);
   ctx.fillStyle=`rgba(${value},${value+2},${value},${.15+random()*.26})`;
   ctx.fillRect(random()*w,random()*h,.4+random()*.6,1+random()*2);
  }
 }),roughness:.96});
 const teal=mat(0x1b6677,{roughness:.73,side:THREE.DoubleSide});
 const tealDark=mat(0x164f5e,{roughness:.8,side:THREE.DoubleSide});
 const cream=mat(0xe4e0ce,{roughness:.8,side:THREE.DoubleSide});
 const chrome=mat(0xaebbc0,{metalness:.72,roughness:.21});
 const seatCloth=mat(0x827f6f,{roughness:.75});
 const seatEdge=mat(0x6d6b5e,{roughness:.8});
 const screenBlack=mat(0x14191c,{roughness:.9});

 function hallFloor(x1,z1,x2,z2,level=hallLevel){
  box(x1,level-.17,z1,x2,level-.006,z2,white);
  surface(x2-x1,z2-z1,(x1+x2)/2,level,(z1+z2)/2,carpet,
   {rx:-Math.PI/2,u:(x2-x1)/.8,v:(z2-z1)/.8});
  hallFloors.push({x1,z1,x2,z2,level});
 }
 // One actual floor opening, shared by the stairs from the floor below.
 hallFloor(-2.60,-29.10,2.45,-16.85);
 hallFloor(6.66,-29.10,16.20,-16.85);
 hallFloor(2.45,-29.10,6.66,-21.24);
 hallFloor(2.45,-18.03,6.66,-16.85);
 surface(18.80,12.25,6.80,hallCeiling,-22.975,ceiling,
  {rx:Math.PI/2,u:18.8/.6,v:12.25/.6});
 wallsZ(-29.10,-16.85,-2.60,white,hallLevel,hallCeiling);
 wallsZ(-29.10,-16.85,16.20,white,hallLevel,hallCeiling);
 wallsX(-2.60,16.20,-29.10,white,hallLevel,hallCeiling);
 wallsX(-2.60,16.20,-16.85,white,hallLevel,hallCeiling);
 for(const z of [-29.003,-16.947])box(-2.51,hallLevel,z-.009,16.11,hallLevel+.09,z+.009,joint);
 for(const x of [-2.503,16.103])box(x-.009,hallLevel,-29.01,x+.009,hallLevel+.09,-16.94,joint);

 // Continue the same pair of flights, with white tiled treads below the carpet.
 const nextRunStart=stairRuns.length;
 tiledLanding(2.22,-21.24,2.45,-18.03,floor2);
 const hallLower=flight(2.45,1,-21.24,-19.72,floor2);
 tiledLanding(hallLower.end,-21.24,6.66,-18.02,hallLower.top);
 const hallUpper=flight(hallLower.end,-1,-19.55,-18.03,hallLower.top);
 for(const x of [6.75])wallsZ(-21.4,-17.8,x,white,ceiling2,hallLevel);
 for(const z of [-21.4,-17.8])wallsX(2.15,6.75,z,white,ceiling2,hallLevel);
 slopeRail(2.45,hallLower.end,-19.73,floor2,hallLower.rise,hallLower.run,hallLower.steps);
 slopeRail(hallLower.end,hallUpper.end,-19.54,hallLower.top,hallUpper.rise,hallUpper.run,hallUpper.steps);
 rod([2.49,floor2+1.13,-21.30],[hallLower.end,hallLower.top+.96,-21.30],.026,chrome);
 for(const y of [.96,.68,.42,.19])rod([hallLower.end,hallLower.top+y,-19.73],[hallLower.end,hallLower.top+y,-19.54],.013,chrome);
 for(const f of stairRuns.slice(nextRunStart))for(let i=0;i<f.steps;i++){
  const a=f.start+f.direction*i*f.run,b=a+f.direction*f.run,y=f.y0+(i+1)*f.rise;
  const inner=f===stairRuns[nextRunStart]?f.hi:f.lo;
  colliders.push([Math.min(a,b),inner-.027,Math.max(a,b),inner+.027,y-.2,y+.96]);
 }
 // The raised ledge and its two shallow steps follow the photographed stair well.
 hallFloor(2.45,-18.03,6.66,-16.85,hallLevel+.30);
 hallFloor(6.66,-18.03,6.96,-16.85,hallLevel+.30);
 hallFloor(6.96,-18.03,7.26,-16.85,hallLevel+.15);
 box(6.655,hallLevel,-18.04,6.67,hallLevel+.30,-16.86,white);
 box(6.95,hallLevel,-18.04,6.968,hallLevel+.30,-16.86,white);
 box(7.25,hallLevel,-18.04,7.267,hallLevel+.15,-16.86,white);
 for(const x of [6.965,7.265])box(x-.008,hallLevel+(x<7?.30:.15)-.005,-18.03,x+.008,hallLevel+(x<7?.30:.15)+.004,-16.85,chrome);
 rail(2.47,-18.03,6.65,-18.03,hallLevel+.30);
 rail(6.66,-18.03,6.66,-21.24,hallLevel);
 rail(6.66,-21.24,2.45,-21.24,hallLevel);
 rail(2.45,-21.24,2.45,-19.69,hallLevel);
 // Solid well linings hide adjacent rooms and slab edges without closing the stairs.
 box(2.44,hallLevel-.30,-21.31,6.74,hallLevel-.008,-21.24,white);
 box(6.66,hallLevel-.30,-21.24,6.74,hallLevel-.008,-18.03,white);
 box(2.45,hallLevel-.30,-18.03,6.66,hallLevel+.292,-17.97,white);
 sign(['↓'],.22,.16,6.65,hallLevel+1.38,-16.946,Math.PI,{bg:'#287054',fg:'#fff',size:100});

 // Soft pleats are real geometry, including the tied-back window curtains.
 function fabric(x,y,z,width,height,yaw,material=teal,{tied=false,fold=.038}={}){
  const nx=Math.max(18,Math.ceil(width*85)),ny=tied?18:4;
  const geo=new THREE.PlaneGeometry(width,height,nx,ny),p=geo.attributes.position;
  const folds=Math.max(5,Math.round(width/.095));
  for(let i=0;i<p.count;i++){
   const u=(p.getX(i)+width/2)/width,v=(p.getY(i)+height/2)/height;
   const pinch=tied?1-.64*Math.exp(-Math.pow((v-.27)/.19,2)):1;
   p.setXYZ(i,(u-.5)*width*pinch,p.getY(i),
    fold*(Math.cos(u*folds*Math.PI*2)+.23*Math.cos(u*folds*Math.PI*4))+.015*Math.sin(v*5+u*3));
  }
  geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo,material);mesh.position.set(x,y+height/2,z);mesh.rotation.y=yaw;scene.add(mesh);
  return mesh;
 }
 const valanceMap=texture(384,224,(ctx,w,h)=>{
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#236b7a';
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w,0);ctx.lineTo(w,h*.58);
  ctx.bezierCurveTo(w*.83,h*.95,w*.67,h*.95,w*.5,h*.68);
  ctx.bezierCurveTo(w*.33,h*.95,w*.17,h*.95,0,h*.58);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#eee9d6';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(0,h*.56);
  ctx.bezierCurveTo(w*.17,h*.93,w*.33,h*.93,w*.5,h*.66);
  ctx.bezierCurveTo(w*.67,h*.93,w*.83,h*.93,w,h*.56);ctx.stroke();
  ctx.lineWidth=5;ctx.lineCap='round';
  for(const [cx,d] of [[w*.25,1],[w*.75,-1]]){
   ctx.beginPath();ctx.moveTo(cx-d*72,65);ctx.bezierCurveTo(cx-d*30,63,cx-d*24,23,cx,25);
   ctx.bezierCurveTo(cx+d*65,20,cx+d*68,98,cx+d*8,103);
   ctx.bezierCurveTo(cx-d*34,106,cx-d*39,55,cx-d*2,55);
   ctx.bezierCurveTo(cx+d*26,55,cx+d*20,80,cx+d*6,76);ctx.stroke();
  }
  ctx.beginPath();ctx.moveTo(w/2-15,22);ctx.quadraticCurveTo(w/2,1,w/2+15,22);ctx.quadraticCurveTo(w/2,43,w/2-15,22);ctx.stroke();
 });
 const valanceMat=mat(0xffffff,{map:valanceMap,transparent:true,alphaTest:.2,side:THREE.DoubleSide,roughness:.8});
 const borderMap=texture(96,256,(ctx,w,h)=>{
  ctx.fillStyle='#236b7a';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='#eee9d6';ctx.lineWidth=5;ctx.beginPath();
  ctx.moveTo(14,0);ctx.lineTo(14,h);ctx.moveTo(w-14,0);ctx.lineTo(w-14,h);ctx.stroke();
  for(const cy of [64,192]){
   ctx.beginPath();ctx.moveTo(48,cy-62);ctx.bezierCurveTo(9,cy-24,14,cy+28,47,cy+28);
   ctx.bezierCurveTo(78,cy+28,81,cy-15,51,cy-15);ctx.bezierCurveTo(30,cy-15,30,cy+8,45,cy+8);ctx.stroke();
  }
 });
 const borderMat=mat(0xffffff,{map:borderMap,side:THREE.DoubleSide,roughness:.8});
 function valance(x,z,width,yaw=0){
  surface(width,.53,x,hallCeiling-.245,z,valanceMat,{yaw,u:width/.82});
  const ux=Math.cos(yaw),uz=-Math.sin(yaw);
  const count=Math.floor(width/.82);
  for(let i=0;i<=count;i++){
   const u=-width/2+.12+i*(width-.24)/count,px=x+u*ux,pz=z+u*uz;
   rod([px,hallCeiling-.41,pz],[px,hallCeiling-.61,pz],.011,cream);
   stamp(potGeo,cream,px,hallCeiling-.65,pz,.025,.12,.025);
   stamp(leafGeo,cream,px,hallCeiling-.59,pz,.022,.025,.022);
  }
 }

 // Broad, low stage with continuous gray carpet and bright edge strips.
 const stageFront=.60,stageHeight=.56;
 hallFloor(-2.51,-29.01,stageFront,-16.94,hallLevel+stageHeight);
 box(-2.51,hallLevel,-29.01,stageFront,hallLevel+stageHeight-.01,-16.94,carpet);
 for(let i=0;i<4;i++){
  const x1=stageFront+i*.30,x2=x1+.30,level=hallLevel+stageHeight-i*.14;
  hallFloor(x1,-29.01,x2,-16.94,level);
  box(x2-.012,hallLevel,-29.01,x2+.002,level-.004,-16.94,carpet);
  box(x2-.012,level-.004,-29.01,x2+.006,level+.003,-16.94,chrome);
 }
 // The screen sits at the back; cream inner drapes separate it from the teal wings.
 box(-2.50,hallLevel+stageHeight,-26.54,-2.40,hallCeiling-.43,-19.41,trim);
 box(-2.389,hallLevel+.79,-26.02,-2.362,hallCeiling-.70,-19.93,screenBlack);
 fabric(-2.33,hallLevel+stageHeight,-26.27,.43,2.25,Math.PI/2,cream,{fold:.025});
 fabric(-2.33,hallLevel+stageHeight,-19.67,.43,2.25,Math.PI/2,cream,{fold:.025});
 fabric(.39,hallLevel+stageHeight,-27.91,2.20,2.64,Math.PI/2,teal,{fold:.055});
 fabric(.39,hallLevel+stageHeight,-18.04,2.20,2.64,Math.PI/2,teal,{fold:.055});
 fabric(-1.15,hallLevel+stageHeight,-28.94,2.65,2.64,0,tealDark,{fold:.045});
 fabric(-1.15,hallLevel+stageHeight,-17.01,2.65,2.64,0,tealDark,{fold:.045});
 for(const z of [-26.76,-19.19])surface(.16,2.61,.46,hallLevel+stageHeight+1.305,z,borderMat,{yaw:Math.PI/2,v:3.9});
 for(const z of [-27.94,-18.05])surface(2.1,.18,.46,hallLevel+stageHeight+.22,z,borderMat,{yaw:Math.PI/2,u:4,v:.35});
 valance(.48,-22.975,12.06,Math.PI/2);

 // A quiet daytime view, white sheers, teal tiebacks, sills and radiators.
 const windowView=mat(0xffffff,{map:texture(256,384,(ctx,w,h)=>{
  const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#c2d5dd');g.addColorStop(.58,'#d9e1de');g.addColorStop(1,'#a7b69b');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#abb5a2';ctx.fillRect(0,h*.59,w,h*.41);
  for(let i=0;i<70;i++){
   ctx.fillStyle=['#718465','#8c9a73','#a9b48c','#bac2a4'][i%4];ctx.beginPath();
   ctx.ellipse(random()*w,h*.52+random()*h*.4,12+random()*30,9+random()*22,0,0,Math.PI*2);ctx.fill();
  }
 }),roughness:1});
 const sheer=mat(0xf0efe8,{transparent:true,opacity:.59,side:THREE.DoubleSide,roughness:.9,depthWrite:false});
 function hallRadiator(x,z,width,yaw=0){
  const ux=Math.cos(yaw),uz=-Math.sin(yaw),nx=Math.sin(yaw),nz=Math.cos(yaw);
  for(let i=0;i<Math.round(width/.072);i++){
   const u=-width/2+.035+i*.072,px=x+ux*u,pz=z+uz*u;
   stamp(boxGeo,trim,px,hallLevel+.41,pz,.051,.55,.10,new THREE.Quaternion().setFromAxisAngle(up,yaw));
  }
  for(const y of [.15,.67])rod([x-ux*width/2,hallLevel+y,z-uz*width/2],[x+ux*width/2,hallLevel+y,z+uz*width/2],.023,trim);
  rod([x+ux*(width/2+.06),hallLevel+.16,z+uz*(width/2+.06)],
   [x+ux*(width/2+.06),hallLevel+.08,z+uz*(width/2+.06)],.021,trim);
 }
 for(const x of [3.65,6.15,8.65,11.15,13.65]){
  const z=-28.992,bottom=hallLevel+.78,top=hallCeiling-.15,w=1.73;
  surface(w,top-bottom,x,(top+bottom)/2,z,windowView);
  for(const px of [x-w/2-.035,x+w/2+.007,x-.018])box(px,bottom-.04,z-.01,px+.04,top+.04,z+.035,trim);
  for(const y of [bottom-.04,top,bottom+1.21])box(x-w/2-.035,y,z-.01,x+w/2+.047,y+.04,z+.035,trim);
  box(x-w/2-.13,bottom-.071,z-.02,x+w/2+.13,bottom-.02,z+.17,trim);
  hallRadiator(x,z+.14,1.20);
  fabric(x,hallLevel+.07,z+.19,2.15,hallCeiling-hallLevel-.22,0,sheer,{fold:.02});
  for(const px of [x-1.02,x+1.02]){
   fabric(px,hallLevel+.08,z+.29,.51,hallCeiling-hallLevel-.22,0,teal,{tied:true,fold:.041});
   rod([px-.10,hallLevel+.83,z+.31],[px+.10,hallLevel+.83,z+.31],.022,cream);
   rod([px,hallLevel+.81,z+.34],[px,hallLevel+.57,z+.34],.009,cream);
   stamp(potGeo,cream,px,hallLevel+.53,z+.34,.025,.10,.025);
  }
 }
 valance(8.45,-28.61,15.30);
 for(const x of [9.00,12.20,14.95])hallRadiator(x,-16.976,1.08,Math.PI);
 hallRadiator(16.075,-23.2,1.42,-Math.PI/2);

 // Rounded upholstery and continuous chrome sled frames distinguish the chairs.
 function roundedUnit(){
  const s=new THREE.Shape(),r=.075;
  s.moveTo(-.5+r,-.5);s.lineTo(.5-r,-.5);s.quadraticCurveTo(.5,-.5,.5,-.5+r);
  s.lineTo(.5,.5-r);s.quadraticCurveTo(.5,.5,.5-r,.5);s.lineTo(-.5+r,.5);
  s.quadraticCurveTo(-.5,.5,-.5,.5-r);s.lineTo(-.5,-.5+r);s.quadraticCurveTo(-.5,-.5,-.5+r,-.5);
  const geo=new THREE.ExtrudeGeometry(s,{depth:.88,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:.055,bevelThickness:.06,curveSegments:3});
  geo.translate(0,0,-.44);return geo;
 }
 const cushionGeo=roundedUnit();
 const backRotation=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.PI/2,-.13));
 function chair(x,z){
  const y=hallLevel;
  stamp(cushionGeo,seatCloth,x-.015,y+.49,z,.55,.12,.57);
  stamp(cushionGeo,seatCloth,x+.285,y+.85,z,.57,.62,.105,backRotation);
  stamp(cushionGeo,seatEdge,x+.337,y+.85,z,.56,.61,.035,backRotation);
  for(const side of [-1,1]){
   const pz=z+side*.285;
   rod([x-.20,y+.47,pz],[x-.26,y+.065,pz],.014,chrome);
   rod([x-.26,y+.065,pz],[x+.32,y+.065,pz],.014,chrome);
   rod([x+.32,y+.065,pz],[x+.32,y+.44,pz],.014,chrome);
   rod([x+.32,y+.44,pz],[x+.30,y+.98,pz],.012,chrome);
   rod([x-.17,y+.47,pz],[x-.17,y+.69,pz],.013,chrome);
   rod([x-.17,y+.69,pz],[x+.24,y+.69,pz],.013,chrome);
   stamp(cushionGeo,seatEdge,x+.04,y+.713,pz,.44,.044,.075);
  }
  rod([x+.37,y+.85,z-.058],[x+.37,y+.91,z-.058],.008,chrome);
  rod([x+.37,y+.91,z-.058],[x+.37,y+.91,z+.058],.008,chrome);
  rod([x+.37,y+.91,z+.058],[x+.37,y+.85,z+.058],.008,chrome);
  rod([x+.37,y+.85,z+.058],[x+.37,y+.85,z-.058],.008,chrome);
  colliders.push([x-.27,z-.31,x+.37,z+.31,y,y+1.17]);
 }
 const seatRows=9,seatsPerBlock=4;
 for(let row=0;row<seatRows;row++)for(const z of [-28.02,-27.28,-26.54,-25.80,-24.02,-23.28,-22.54,-21.80])
  chair(3.55+row*1.18,z);

 // PA stacks on gray plinths, and seven overhead stage luminaires.
 const grille=mat(0xffffff,{map:texture(64,64,(ctx,w,h)=>{
  ctx.fillStyle='#23282a';ctx.fillRect(0,0,w,h);ctx.fillStyle='#101416';
  for(let y=1;y<h;y+=5)for(let x=1;x<w;x+=5){ctx.beginPath();ctx.arc(x,y,.9,0,Math.PI*2);ctx.fill()}
 }),roughness:.8});
 function speaker(x,z){
  const base=hallLevel+.14;
  box(x-.30,base,z-.36,x+.30,base+.29,z+.36,joint,true);
  box(x-.27,base+.29,z-.32,x+.27,base+.93,z+.32,black,true);
  box(x-.23,base+.93,z-.28,x+.23,base+1.55,z+.28,black,true);
  surface(.55,.60,x+.273,base+.62,z,grille,{yaw:Math.PI/2,u:3,v:3});
  surface(.48,.55,x+.233,base+1.25,z,grille,{yaw:Math.PI/2,u:3,v:3});
  for(const [cy,r] of [[base+.59,.215],[base+1.18,.165]]){
   stamp(leafGeo,screenBlack,x+.282,cy,z,.009,r,r);
   stamp(leafGeo,black,x+.29,cy,z,.008,r*.35,r*.35);
  }
  box(x+.287,base+1.00,z-.025,x+.294,base+1.035,z+.025,red);
 }
 speaker(1.12,-28.34);speaker(1.12,-19.06);
 rod([-1.92,hallCeiling-.36,-26.04],[-1.92,hallCeiling-.36,-19.92],.032,black);
 for(let i=0;i<7;i++){
  const z=-25.70+i*.90;
  rod([-1.92,hallCeiling-.35,z],[-1.92,hallCeiling-.49,z],.017,steel);
  rod([-1.98,hallCeiling-.48,z],[-1.75,hallCeiling-.63,z],.095,black);
  stamp(leafGeo,mat(0x89958b,{metalness:.25,roughness:.25}),-1.742,hallCeiling-.635,z,.012,.070,.070);
 }
 // White lectern on the window side, plus the small table visible in the wing.
 const lecternX=-.50,lecternZ=-26.95,stageY=hallLevel+stageHeight;
 box(lecternX-.29,stageY,lecternZ-.34,lecternX+.29,stageY+.055,lecternZ+.34,trim,true);
 box(lecternX-.10,stageY+.055,lecternZ-.20,lecternX+.13,stageY+1.01,lecternZ+.20,trim,true);
 const lecternTop=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),-.11);
 stamp(boxGeo,trim,lecternX,stageY+1.025,lecternZ,.54,.07,.67,lecternTop);
 box(lecternX-.26,stageY+1.04,lecternZ-.34,lecternX-.21,stageY+1.16,lecternZ+.34,trim);
 sign(['BQFQ'],.28,.18,lecternX+.137,stageY+.74,lecternZ,Math.PI/2,{bg:'#eceee9',fg:'#286580',size:52});
 box(-1.80,stageY+.70,-28.19,-.99,stageY+.75,-27.62,trim);
 for(const x of [-1.73,-1.08])for(const z of [-28.12,-27.69])box(x,stageY,z,x+.045,stageY+.70,z+.045,trim);

 function standingAC(x,z){
  box(x-.23,hallLevel,z-.21,x+.23,hallLevel+1.68,z+.21,trim,true);
  box(x-.195,hallLevel+1.29,z-.22,x+.195,hallLevel+1.54,z-.214,black);
  for(let i=0;i<6;i++)box(x-.19,hallLevel+1.30+i*.037,z-.225,x+.19,hallLevel+1.313+i*.037,z-.221,joint);
  box(x-.20,hallLevel+.43,z-.22,x+.20,hallLevel+.44,z-.211,joint);
 }
 standingAC(15.72,-28.44);standingAC(15.72,-17.54);
 // Regular ceiling lights keep the carpet and curtains visible without clipping white walls.
 for(const x of [2.8,5.2,7.6,10.0,12.4,14.8])for(const z of [-27.8,-24.8,-21.8,-18.8])pointLamp(x,z,hallCeiling);
 for(const [x,z] of [[3.8,-25.7],[8.8,-25.7],[13.8,-25.7],[8.8,-19.2],[-.8,-23]])roomLight(x,z,.11,hallCeiling-.22);
 for(const {geo,material,matrices} of batches.values()){
  const mesh=new THREE.InstancedMesh(geo,material,matrices.length);
  matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));scene.add(mesh);
 }
 function groundAt(x,z,feet){
  for(const f of stairRuns){
   const along=f.axis==='x'?x:z,across=f.axis==='x'?z:x;
   if(across>f.lo&&across<f.hi&&along>=Math.min(f.start,f.end)&&along<=Math.max(f.start,f.end)){
    const step=Math.min(f.steps,Math.floor((along-f.start)*f.direction/f.run)+1);
    const level=f.y0+step*f.rise;
    if(Math.abs(feet-level)<.19)return level;
   }
  }
  if(x>=lower.end&&x<=6.66&&z>=-21.24&&z<=-18.02&&Math.abs(feet-lower.top)<.19)return lower.top;
  if(x>=2.22&&x<=2.45&&z>=-19.55&&z<=-18.03&&Math.abs(feet-upper.top)<.19)return upper.top;
  for(const a of hallFloors.slice().sort((a,b)=>b.level-a.level)){
   if(x>=a.x1&&x<=a.x2&&z>=a.z1&&z<=a.z2&&Math.abs(feet-a.level)<.19)return a.level;
  }
  for(const a of upperFloors){
   if(x>=a.x1&&x<=a.x2&&z>=a.z1&&z<=a.z2&&Math.abs(feet-a.level)<.19)return a.level;
  }
  return Math.abs(feet)<.19&&floorAreas.some(a=>x>=a.x1&&x<=a.x2&&z>=a.z1&&z<=a.z2)?0:null;
 }
 function roomAt(x,z,feet=0){
  if(feet>hallLevel-.19)return x<1.80?'Корпус 2 · 3 этаж · Сцена':'Корпус 2 · 3 этаж · Актовый зал';
  if(feet>floor2+.20)return'Корпус 2 · Лестница в актовый зал';
  if(feet>3.3){
   if(z>-1.40)return'Корпус 2 · 2 этаж · Площадка у входа';
   if(z>-16.55)return'Корпус 2 · 2 этаж · Коридор';
   return'Корпус 2 · 2 этаж · Лестничный холл';
  }
  if(z>0&&x>2.3)return'Корпус 2 · Лестница у входа';
  if(x>2.15&&z>-21.4&&z<-17.8)return'Корпус 2 · Лестничная площадка';
  if(x<-.95&&z<-25.2)return'Корпус 2 · Холл с кубками';
  if(z>-6.6&&x>2.4)return'Корпус 2 · Зона ожидания';
  if(z>-6.6)return'Корпус 2 · Входной холл';
  if(z>-11.7&&x<-.95)return'Корпус 2 · Фотовыставка';
  return'Корпус 2 · Коридор первого этажа';
 }
 return {scene,colliders,groundAt,roomAt,spawn:[0,1.7,-1.04],exitDoor:{x:0,z:0,radius:1.45}};
}
// END COLLEGE2_INTERIOR
