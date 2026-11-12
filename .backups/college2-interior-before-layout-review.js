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
 const h=3.08;
 const floorAreas=[
  {x1:-6.2,x2:5.65,z1:-7.25,z2:0},
  {x1:-.95,x2:2.8,z1:-30,z2:-7.25},
  {x1:-5.6,x2:-.95,z1:-12.35,z2:-7.25},
  {x1:2.8,x2:7.45,z1:-21.9,z2:-17.35},
  {x1:-4.85,x2:2.8,z1:-35.85,z2:-30}
 ];
 for(const {x1,x2,z1,z2} of floorAreas){
  const w=x2-x1,d=z2-z1,x=(x1+x2)/2,z=(z1+z2)/2;
  surface(w,d,x,0,z,tile,{rx:-Math.PI/2,u:w/.62,v:d/.62});
  if(x1!==2.8)surface(w,d,x,h,z,ceiling,{rx:Math.PI/2,u:w/.61,v:d/.61});
 }
 surface(4.65,4.55,5.125,5.4,-19.625,ceiling,{rx:Math.PI/2,u:8,v:8});
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
 wallsX(-6.2,-1.14,0);wallsX(1.14,5.65,0);wallsX(-1.14,1.14,0,white,2.83);
 wallsZ(-7.25,0,-6.2);
 oakWall(-7.25,0,5.65,-1);
 wallsX(-6.2,-5.6,-7.25);wallsX(2.8,5.65,-7.25,wood);
 oakWall(-12.35,-7.25,-5.6,1);wallsX(-5.6,-.95,-12.35,wood);
 oakWall(-30,-12.35,-.95,1);
 for(const [z1,z2] of [[-17.35,-7.25],[-30,-21.9]]){
  wallsZ(z1,z2,2.8);
  surface(z2-z1,2.65,2.709,1.47,(z1+z2)/2,mosaic,{yaw:-Math.PI/2,u:(z2-z1)/4.5});
 }
 wallsZ(-21.9,-17.35,7.45,white,0,5.43);
 wallsX(2.8,7.45,-21.9,white,0,5.43);wallsX(2.8,7.45,-17.35,white,0,5.43);
 wallsZ(-21.9,-17.35,2.8,white,h,5.43);
 oakWall(-35.85,-30,-4.85,1);wallsZ(-35.85,-30,2.8);wallsX(-4.85,-.95,-30);
 wallsX(-4.85,2.8,-35.85,wood);
 for(const z of [-7.15,-12.42,-16.6,-21.95,-26.2,-30.02]){
  box(-.87,h-.26,z-.12,2.71,h,z+.12,white);
 }
 for(const z of [-1.2,-3.8,-6.1])for(const x of [-4.5,-.18,3.65])pointLamp(x,z);
 for(const z of [-8.7,-12.9,-16.1,-19.6,-23.6,-27.6,-30.6,-34.1])pointLamp(1.05,z);
 for(const [x,z] of [[-3.8,-9.25],[-2.6,-11.4],[-2.9,-32.1],[-2.9,-34.7]])pointLamp(x,z);
 pointLamp(5.7,-19.4,5.4);
 // Intensities match the legacy light units used by the game's Three.js r128.
 for(const [x,z,intensity] of [[-2,-2.7,.22],[4.04,-4.4,.18],[-3.6,-9.45,.24],[1,-11.9,.17],[1,-17.7,.20],[1,-23.6,.17],[1,-28.5,.18],[-1.8,-33.25,.22]])roomLight(x,z,intensity);
 roomLight(5.9,-19.75,.20,4.6);

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
 door(0,-.035,2.29,2.23,Math.PI,{double:true,top:.60,panorama:entryScene,closed:true});
 sign(['ШЫҒУ · ВЫХОД'],.54,.135,0,2.94,-.105,Math.PI,{bg:'#287054',fg:'#fff',size:54});
 sign(['ВНИМАНИЕ','ВХОД В КОРПУС'],.32,.35,.52,1.29,-.121,Math.PI,{bg:'#e7bb22',fg:'#433512',size:39});
 for(const z of [-2.05,-4.92]){
  wallsZ(z-.54,z+.54,-6.105,wood,0,.85);
  surface(1.08,1.61,-6.01,1.65,z,entryScene,{yaw:Math.PI/2});
  for(const y of [.84,2.46])box(-6.11,y-.035,z-.58,-5.97,y+.035,z+.58,trim);
  box(-6.105,.85,z-.035,-5.98,2.46,z+.035,trim);
  box(-6.09,.12,z-.48,-5.94,.72,z+.48,trim);
  for(let i=0;i<10;i++)box(-5.95,.14,z-.45+i*.094,-5.912,.68,z-.40+i*.094,white);
 }
 const classroomLeft=[
  [-15.05,['ӘЖЕТХАНА','ӘЙЕЛДЕР'],true],[-17.95,['ӘЖЕТХАНА','ЕРЛЕР'],true],
  [-22.62,['КАДР БӨЛІМІ'],false],[-27.35,['ОҚУ БӨЛІМІ'],false]
 ];
 // The first office is beside the photo gallery on its wood-clad wall.
 door(-3.65,-12.25,1.01,2.13,0,{label:['ДЕНЕ ШЫНЫҚТЫРУ','ӘДІСТЕМЕЛІК КАБИНЕТ']});
 for(const [z,label,opaque] of classroomLeft)door(-.859,z,1.02,2.13,Math.PI/2,{pane:opaque?frost:glassDark,label});
 for(const [z,label] of [[-8.44,['МӘЖІЛІС ЗАЛ']],[-13.28,['АУДИТОРИЯ №3']],[-23.1,['АУДИТОРИЯ №2']],[-28.47,['АУДИТОРИЯ №1']]]){
  door(2.704,z,1.04,2.13,-Math.PI/2,{label});
 }
 door(-1.9,-35.75,2.38,2.22,0,{double:true,top:.62,panorama:entryScene});
 door(1.25,-35.75,1.72,2.18,0,{double:true,pane:white});
 sign(['ШЫҒУ · ВЫХОД'],.54,.135,-1.9,2.985,-35.745,0,{bg:'#287054',fg:'#fff',size:54});
 door(7.35,-20.78,1.01,2.07,-Math.PI/2,{pane:white});

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
 turnstile(-.92,-2.88);turnstile(-2.24,-2.88);
 rail(1.12,-2.88,2.7,-2.88);rail(2.7,-2.88,2.7,-1.55);
 rail(-4.03,-2.88,-3.46,-2.88);
 rod([-3.44,0,-2.88],[-3.44,1.02,-2.88],.035);
 box(-3.49,.18,-2.89,-3.41,.91,-2.16,glass,true);
 rail(-4.53,-33.92,-3.25,-33.92);turnstile(-.99,-33.92);
 rail(-.05,-33.92,.74,-33.92);
 box(.74,.18,-34.56,.79,.91,-33.92,glass,true);
 rod([.76,0,-33.92],[.76,1,-33.92],.036);

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
 tactile(-.18,-6.17,.15,-.92);
 tactile(-.39,-3.45,.39,-3.17,true);tactile(-.39,-2.51,.39,-2.23,true);
 tactile(-.18,-6.5,1.45,-6.17);tactile(1.45,-6.5,1.78,-6.17,true);
 for(const [z1,z2] of [[-14.87,-6.5],[-17.78,-15.2],[-22.45,-18.11],[-27.18,-22.78],[-31.96,-27.51]]){
  tactile(1.45,z1,1.78,z2);
 }
 for(const z of [-15.2,-18.11,-22.78,-27.51]){
  tactile(-.42,z,1.45,z+.33);tactile(1.45,z,1.78,z+.33,true);
 }
 tactile(-2.2,-32.29,1.45,-31.96);tactile(1.45,-32.29,1.78,-31.96,true);
 tactile(-2.53,-35.21,-2.2,-32.29);tactile(-2.53,-32.29,-2.2,-31.96,true);

 const greens=[0x24462c,0x335638,0x466d40,0x6a8548].map(c=>mat(c,{roughness:.43}));
 const soil=mat(0x463728);
 function plant(x,z,s=1,y=0,solid=false){
  const r=.20*s;
  stamp(potGeo,trim,x,y+.15*s,z,r,.3*s,r);
  stamp(tubeGeo,soil,x,y+.295*s,z,r*.86,.012,r*.86);
  if(solid)colliders.push([x-r,z-r,x+r,z+r,y,y+.45*s]);
  for(let j=0;j<6;j++){
   const angle=(j+random()*.5)*Math.PI/3,dx=Math.cos(angle),dz=Math.sin(angle);
   const tip=[x+dx*.29*s,y+(.62+random()*.27)*s,z+dz*.29*s];
   rod([x,y+.28*s,z],tip,.012*s,greens[0]);
   for(let k=1;k<=4;k++){
    const f=k/4,py=y+.28*s+(tip[1]-y-.28*s)*f,spread=(k%2?1:-1)*.09*s;
    const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(.22,angle+.42*k,.38));
    stamp(leafGeo,greens[(j+k)%greens.length],x+dx*.33*s*f+dz*spread,py,z+dz*.33*s*f-dx*spread,.145*s,.025*s,.057*s,q);
   }
  }
 }
 for(const [x,z,s] of [[2.44,-10.3,.86],[2.44,-12.08,.95],[2.42,-15.03,.94],[2.43,-16.19,.88],[2.45,-24.64,1.03],[2.44,-26.17,.95],[2.44,-29.45,.94],
  [3.2,-6.72,.96],[4.05,-6.74,1.02],[4.89,-6.74,.93],[-4.24,-2.21,1.18],[-4.55,-32.2,.92],[-4.47,-33.23,.83]])plant(x,z,s,0,true);
 function sofa(x1,x2,z1,z2,backAtRight,seats){
  box(x1,.022,z1,x2,.085,z2,black,true);
  for(let i=0;i<seats;i++){
   const start=z1+(z2-z1)*i/seats,end=z1+(z2-z1)*(i+1)/seats-.022;
   box(x1,.078,start,x2,.455,end,beige,true);
   const backX=backAtRight?x2-.17:x1;
   box(backX,.47,start+.016,backX+.17,.94,end-.016,beige,true);
  }
 }
 sofa(4.81,5.55,-5.97,-1.62,true,4);
 sofa(2.98,3.71,-3.58,-.18,false,3);
 // Low wall behind the second sofa forms the wood recess near the entrance.
 box(2.82,0,-3.63,2.965,2.85,-.085,wood,true);
 for(const [x,w] of [[3.15,.54],[4.03,1.04],[4.94,.55]]){
  box(x-w/2,.92,-7.147,x+w/2,2.86,-7.066,black);
 }
 sign(['BQFQ','КОЛЛЕДЖ'],1.9,.52,5.542,1.96,-3.94,-Math.PI/2,{bg:'#f0efe9',fg:'#17467b',size:55});
 box(5.546,.5,-5.69,5.57,2.66,-2.08,white);

 // Guard counter and the circular project exhibition behind it.
 box(-3.7,0,-5.99,-1.42,1.05,-5.53,white,true);
 box(-3.7,0,-6.78,-3.44,1.05,-5.99,white,true);
 box(-3.76,1.05,-6.79,-3.43,1.103,-5.47,trim);
 box(-3.43,1.05,-6.01,-1.36,1.103,-5.47,trim);
 const deskFace=mat(0xffffff,{map:texture(384,160,(ctx,w,h)=>{
  ctx.fillStyle='#f3f2e9';ctx.fillRect(0,0,w,h);ctx.fillStyle='#8b6b4e';ctx.beginPath();
  ctx.moveTo(w*.79,0);ctx.lineTo(w,0);ctx.lineTo(w*.49,h);ctx.lineTo(w*.29,h);ctx.closePath();ctx.fill();
 })});
 surface(2.28,1.035,-2.56,.53,-5.526,deskFace);
 box(-2.96,1.1,-5.89,-2.64,1.127,-5.7,black);
 box(-2.83,1.12,-5.83,-2.78,1.26,-5.78,black);
 box(-3.04,1.25,-5.86,-2.56,1.54,-5.815,black);
 for(const x of [-3.26,-1.78])plant(x,-5.78,.49,1.103);
 box(-1.11,0,-6.9,-.87,h,-6.64,white,true);
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
 const ringX=-3.59,ringZ=-9.45,ringRadius=1.33;
 for(const y of [.075,2.13]){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(ringRadius,.023,8,56),brass);
  ring.position.set(ringX,y,ringZ);ring.rotation.x=Math.PI/2;scene.add(ring);
 }
 for(let i=0;i<14;i++){
  const a=i*Math.PI*2/14,x=ringX+Math.sin(a)*ringRadius,z=ringZ+Math.cos(a)*ringRadius;
  rod([x,.075,z],[x,2.13,z],.013,brass);
  if(i===3||i===4)continue;
  const photos=surface(.48,1.62,x,1.09,z,photoMaterial,{yaw:a,u:.167,v:1});
  const uv=photos.geometry.attributes.uv;
  for(let j=0;j<uv.count;j++)uv.setX(j,uv.getX(j)+(i%6)/6);
 }
 colliders.push([ringX-1.29,ringZ-1.29,ringX+1.29,ringZ+1.29,0,2.14]);
 for(const [y1,z1,y2,z2] of [[.32,-7.41,2.9,-10.4],[1.15,-12.28,1.72,-7.32],[2.99,-7.46,1.55,-9.82],[.46,-12.3,2.8,-9.66],[1.53,-10.23,1.96,-12.27]]){
  rod([-5.495,y1,z1],[-5.495,y2,z2],.046,trim);
 }
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
 cooler(-1.72,-11.92);bin(-2.14,-11.96);bin(.55,-35.22);
 for(let i=0;i<3;i++){
  const x=-5.64+.53*i;
  box(x-.17,0,-.64,x+.17,.83,-.28,wood,true);
  surface(.39,1.5,x,1.56,-.297,photoMaterial,{yaw:Math.PI,u:.16,v:.75});
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
 for(const [i,z,title] of [
  [0,-10.1,['СПОРТ','И КОМАНДА']],[1,-11.53,['ИДЕИ','В ДЕЙСТВИИ']],[2,-15.17,['ПРОЕКТЫ','СТУДЕНТОВ']],
  [3,-24.6,['СОЗДАВАЙ','И УЧИСЬ']],[4,-26.43,['ОТКРЫВАЙ','НОВОЕ']],[5,-29.48,['ЖИЗНЬ','КОЛЛЕДЖА']]
 ])poster(title,2.692,z,-Math.PI/2,i%2);
 for(let i=0;i<3;i++){
  const z=-31.04-i*1.13;
  box(2.62,.42,z-.555,2.7,2.64,z+.555,trim);
  for(const edge of [z-.535,z+.517])box(2.608,.46,edge,2.623,2.59,edge+.018,brass);
  for(const y of [.443,2.57])box(2.608,y,z-.535,2.623,y+.021,z+.535,brass);
  sign([['ПРОЕКТЫ','МАСТЕРСКИЕ','ДОСТИЖЕНИЯ'][i]],.98,.24,2.617,2.45,z,-Math.PI/2,{fg:'#7a653c',bg:'#f3efe3',size:46});
  const art=surface(.87,1.62,2.613,1.43,z,photoMaterial,{yaw:-Math.PI/2,u:1/3,v:1});
  const uv=art.geometry.attributes.uv;
  for(let corner=0;corner<uv.count;corner++)uv.setX(corner,uv.getX(corner)+i/3);
 }
 sign(['ПРОЕКТЫ КОЛЛЕДЖА BQFQ'],3.4,.23,2.694,2.82,-32.17,-Math.PI/2,{fg:'#826939',bg:'#eee9dc',size:46});
 for(let i=0;i<4;i++){
  const z=-30.6-i*1.11;
  rod([1.89,.025,z],[1.89,.9,z],.026,brass);rod([1.89,0,z],[1.89,.034,z],.10,brass);
  stamp(leafGeo,brass,1.89,.93,z,.045,.043,.045);
  if(i<3){
   for(let j=0;j<10;j++){
    const a=j/10,b=(j+1)/10;
    rod([1.89,.89-.27*Math.sin(a*Math.PI),z-1.11*a],[1.89,.89-.27*Math.sin(b*Math.PI),z-1.11*b],.021,red);
   }
   colliders.push([1.86,z-1.11,1.92,z,0,.94]);
  }
 }
 for(let i=0;i<6;i++){
  const z=-30.58-i*.72;
  colliders.push([-4.76,z-.345,-4.23,z+.345,0,2.22]);
  box(-4.76,0,z-.345,-4.70,2.22,z+.345,white);
  for(const edge of [z-.345,z+.317])box(-4.71,0,edge,-4.23,2.22,edge+.028,trim);
  box(-4.71,2.185,z-.345,-4.23,2.22,z+.345,trim);
  box(-4.71,0,z-.345,-4.23,.078,z+.345,trim);
  box(-4.243,.078,z-.311,-4.236,2.185,z+.311,glass);
  for(let j=0;j<4;j++){
   const y=.17+j*.47;
   box(-4.70,y,z-.316,-4.245,y+.027,z+.316,trim);
   if((i+j)%3===0){
    box(-4.49,y+.028,z-.10,-4.35,y+.052,z+.08,black);
    rod([-4.42,y+.052,z],[-4.42,y+.144,z],.025,brass);
    stamp(potGeo,brass,-4.42,y+.179,z,.077,.12,.077);
   }else{
    box(-4.54,y+.026,z-.22,-4.51,y+.306,z+.18,brass);
    sign(['BQFQ','ДИПЛОМ'],.36,.24,-4.508,y+.17,z-.02,Math.PI/2,{bg:'#e9e4d6',fg:'#8b7247',size:44});
   }
  }
  for(let j=0;j<2;j++){
   const zz=z+(j-.5)*.27,yy=2.22;
   box(-4.61,yy,zz-.063,-4.43,yy+.037,zz+.063,black);
   stamp(potGeo,brass,-4.52,yy+.14,zz,.08,.14,.08);
   rod([-4.52,yy+.033,zz],[-4.52,yy+.11,zz],.029,brass);
  }
 }
 for(const [x,z,yaw] of [[-1.28,-.098,Math.PI],[2.687,-16.95,-Math.PI/2],[2.687,-29.88,-Math.PI/2],[-3.59,-35.748,0]]){
  sign(['⊙'],.14,.14,x,1.36,z,yaw,{bg:'#b52b2b',fg:'#fff',size:111});
 }
 const stair={x1:3.08,x2:7.35,z1:-19.73,z2:-18.05,steps:12,rise:.174,run:.255};
 const stairEnd=stair.x1+stair.steps*stair.run,stairTop=stair.steps*stair.rise;
 const stone=mat(0xa9a8a1,{roughness:.47});
 const stringer=new THREE.Shape();
 stringer.moveTo(stair.x1,0);
 for(let i=0;i<stair.steps;i++){
  const x=stair.x1+i*stair.run,y=(i+1)*stair.rise-.013;
  stringer.lineTo(x,y);stringer.lineTo(x+stair.run,y);
 }
 stringer.lineTo(stair.x2,stairTop-.013);
 stringer.lineTo(stair.x2,stairTop-.23);
 stringer.lineTo(stairEnd,stairTop-.23);
 stringer.closePath();
 const underside=new THREE.Mesh(new THREE.ExtrudeGeometry(stringer,{depth:stair.z2-stair.z1-.015,bevelEnabled:false}),white);
 underside.position.z=stair.z1+.0075;scene.add(underside);
 for(let i=0;i<stair.steps;i++){
  const x=stair.x1+i*stair.run,y=(i+1)*stair.rise;
  box(x,y-.19,stair.z1,x+stair.run,y,stair.z2,stone);
  box(x+.012,y-.01,stair.z1,x+.035,y+.005,stair.z2,steel);
 }
 box(stairEnd,stairTop-.19,stair.z1,stair.x2,stairTop,stair.z2,stone);
 for(let i=0;i<stair.steps;i++){
  const x=stair.x1+i*stair.run,top=(i+1)*stair.rise;
  for(const z of [stair.z1,stair.z2])colliders.push([x,z-.035,x+stair.run,z+.035,Math.max(0,top-.27),top+.96]);
 }
 // Posts align to the treads instead of following an interpolated height.
 for(const z of [stair.z1+.075,stair.z2-.075]){
  for(const [y,r] of [[.96,.027],[.68,.014],[.41,.014],[.18,.014]])rod([stair.x1+.09,y+stair.rise,z],[stairEnd,y+stairTop,z],r);
  for(let i=0;i<stair.steps;i+=3){
   const x=stair.x1+(i+.5)*stair.run,y=(i+1)*stair.rise;
   rod([x,y,z],[x,y+.96,z],.026);rod([x,y,z],[x,y+.025,z],.054);
  }
  rail(stairEnd,z,stair.x2-.08,z,stairTop,stairTop,{solid:false});
 }
 for(const z of [stair.z1,stair.z2])colliders.push([stairEnd,z-.032,stair.x2,z+.032,stairTop-.23,stairTop+.95]);
 door(7.35,-18.89,1.1,2.08,-Math.PI/2,{pane:white,bottom:stairTop});
 sign(['←'],.23,.16,3.34,1.27,-17.452,Math.PI,{bg:'#2c7354',fg:'#fff',size:85});
 for(const {geo,material,matrices} of batches.values()){
  const mesh=new THREE.InstancedMesh(geo,material,matrices.length);
  matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));scene.add(mesh);
 }
 function groundAt(x,z,feet){
  if(x>=stair.x1&&x<=stair.x2&&z>stair.z1&&z<stair.z2){
   const step=Math.min(stair.steps,Math.floor((x-stair.x1)/stair.run)+1);
   const level=step*stair.rise;
   return Math.abs(feet-level)<.19?level:null;
  }
  return Math.abs(feet)<.19&&floorAreas.some(a=>x>=a.x1&&x<=a.x2&&z>=a.z1&&z<=a.z2)?0:null;
 }
 function roomAt(x,z){
  if(x>2.8&&z>-21.9&&z<-17.35)return'Корпус 2 · Лестничная площадка';
  if(z<-30)return'Корпус 2 · Зал достижений';
  if(z>-7.25)return'Корпус 2 · Входной холл';
  if(z>-12.35&&x<-.95)return'Корпус 2 · Фотовыставка';
  return'Корпус 2 · Коридор первого этажа';
 }
 return {scene,colliders,groundAt,roomAt,spawn:[0,1.7,-1.04],exitDoor:{x:0,z:0,radius:1.45}};
}
// END COLLEGE2_INTERIOR
