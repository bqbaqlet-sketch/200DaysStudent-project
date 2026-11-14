// BEGIN COLLEGE1_EXTERIOR
// Фасад корпуса 1 по двум фотографиям: три витража и симметричные боковые окна.
function buildCollege1Exterior(){
 const root=new THREE.Group();root.name='college1-photo-exterior';
 root.position.set(-8.8,0,-7);root.rotation.y=Math.PI/2;S.add(root);
 let seed=301126;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296};
 const canvas=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c};
 const texture=c=>{const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t};
 const mat=(color,opts={})=>new THREE.MeshPhongMaterial({color,shininess:24,...opts});
 const p={wall:mat(0xa6aaad),blue:mat(0x08649d),blueShade:mat(0x084b78),
  brown:mat(0x513b31),rubber:mat(0x202e34),white:mat(0xe3e5e0),
  steel:mat(0xbac3c6,{shininess:95,specular:0x7b8b92}),base:mat(0x575954),
  roof:mat(0x795750),gold:mat(0xc3ae68,{shininess:60}),dark:mat(0x1b282e)};
 const unit=new THREE.BoxGeometry(1,1,1),batches=new Map(),dummy=new THREE.Object3D();
 function batch(geometry,mt,matrix){const key=geometry.uuid+mt.uuid;let b=batches.get(key);if(!b){b={geometry,mt,matrices:[]};batches.set(key,b)}b.matrices.push(matrix.clone())}
 function box(a,y,b,c,top,d,mt){dummy.position.set((a+c)/2,(y+top)/2,(b+d)/2);dummy.scale.set(c-a,top-y,d-b);dummy.rotation.set(0,0,0);dummy.updateMatrix();batch(unit,mt,dummy.matrix)}
 const cylinder=new THREE.CylinderGeometry(1,1,1,10);
 function tube(a,b,r,mt=p.steel){const x=new THREE.Vector3(...a),v=new THREE.Vector3(...b).sub(x);dummy.position.copy(x).addScaledVector(v,.5);dummy.scale.set(r,v.length(),r);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());dummy.updateMatrix();batch(cylinder,mt,dummy.matrix)}
 function plane(u,y,v,w,h,mt,ry=0){const q=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mt);q.position.set(u,y,v);q.rotation.y=ry;root.add(q);return q}
 const panelTexture=texture(canvas(256,128,(g,w,h)=>{
  g.fillStyle='#a9adb1';g.fillRect(0,0,w,h);
  for(let i=0;i<3500;i++){const v=random()>.5?255:45;g.fillStyle=`rgba(${v},${v},${v},.022)`;g.fillRect(random()*w,random()*h,1,1)}
  g.fillStyle='#646e76';g.fillRect(0,h-6,w,6);g.fillRect(w-3,0,3,h);
  g.fillStyle='#bbc0c2';g.fillRect(0,0,w,1);
 }));
 const panelMaterial=mat(0xffffff,{map:panelTexture,shininess:18});
 function panelWall(u,y,v,w,h,ry=0){const q=plane(u,y,v,w,h,panelMaterial,ry),uv=q.geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)*w+u-w/2)/1.15,(uv.getY(i)*h+y-h/2)/.29);uv.needsUpdate=true;return q}
 const glassTexture=texture(canvas(1024,1024,(g,w,h)=>{
  const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#67b9e5');sky.addColorStop(.5,'#78c7ea');sky.addColorStop(.62,'#c0d6dc');sky.addColorStop(1,'#193c55');g.fillStyle=sky;g.fillRect(0,0,w,h);
  // Спокойное отражение противоположного крыла, общее для всех трёх витражей.
  g.fillStyle='#356c8b';g.beginPath();g.moveTo(0,665);g.lineTo(220,617);g.lineTo(560,653);g.lineTo(775,608);g.lineTo(1024,640);g.lineTo(1024,1024);g.lineTo(0,1024);g.fill();
  g.fillStyle='#b6c2c1';g.fillRect(0,684,w,205);g.fillStyle='#24688f';g.fillRect(0,685,w,24);g.fillRect(0,874,w,32);
  for(let x=-20;x<w;x+=102){g.fillStyle='#dde0d9';g.fillRect(x,735,54,124);g.fillStyle='#275773';g.fillRect(x+5,740,44,114);g.fillStyle='#698f9e';g.fillRect(x+24,740,3,114)}
  g.strokeStyle='#7c929c';g.lineWidth=1;for(let y=714;y<890;y+=26){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}
  g.fillStyle='#31546a';g.fillRect(0,910,w,114);g.strokeStyle='#7a9aaa';g.lineWidth=2;for(let x=-200;x<1300;x+=85){g.beginPath();g.moveTo(512+(x-512)*.65,910);g.lineTo(x,1024);g.stroke()}
  g.fillStyle='#d3ecf0';g.globalAlpha=.07;g.beginPath();g.moveTo(50,0);g.lineTo(105,0);g.lineTo(650,1024);g.lineTo(565,1024);g.fill();g.globalAlpha=1;
 }));
 const reflectedGlass=mat(0xffffff,{map:glassTexture,shininess:100,specular:0x447d95});
 function glazing(u,y,v,w,h,ry=0){const q=plane(u,y,v,w,h,reflectedGlass,ry),uv=q.geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)*w+u+5.2)/10.4,(uv.getY(i)*h+y-h/2)/7.0);uv.needsUpdate=true;return q}
 const blindTexture=texture(canvas(128,256,(g,w,h)=>{
  g.fillStyle='#46565b';g.fillRect(0,0,w,h);g.fillStyle='#7e8984';for(let y=15;y<98;y+=6)g.fillRect(0,y,w,2);
  g.fillStyle='#a79d81';g.fillRect(14,17,7,h-17);g.fillStyle='#68796f';g.fillRect(88,18,6,h-18);
 }));
 const blindGlass=mat(0xffffff,{map:blindTexture,shininess:55});
 const upperGlass=mat(0xffffff,{map:texture(canvas(160,160,(g,w,h)=>{
  const light=g.createLinearGradient(0,0,0,h);
  light.addColorStop(0,'#657e87');light.addColorStop(.35,'#b0b7b6');light.addColorStop(1,'#e2ded1');
  g.fillStyle=light;g.fillRect(0,0,w,h);
  for(let x=2;x<w;x+=6){g.fillStyle=x%4?'#646c6c43':'#ffffff62';g.fillRect(x,40,2,h-40)}
  g.fillStyle='#b6d1db40';g.beginPath();g.moveTo(w-40,0);g.lineTo(w,0);g.lineTo(w,h);g.lineTo(w-70,h);g.fill();
 })),shininess:55});
 // Полноценные корпуса, сохранившие общий контур двора и место входа.
 const shells=[[-24,-18,-8.8,4],[-18,-32,-6,-18],[-14,4,-6,22]];
 for(const [x1,z1,x2,z2] of shells){
  B(x1,0,z1,x2,7.18,z2,p.wall,true);B(x1-.06,0,z1-.06,x2+.06,.22,z2+.06,p.base);
  // Невысокая кровля крыльев не заслоняет синий фронтон.
  if(x2===-6){const cg=new THREE.ConeGeometry(.7071,1,4);cg.rotateY(Math.PI/4);const r=new THREE.Mesh(cg,p.roof);r.scale.set(x2-x1+.4,1.15,z2-z1+.4);r.position.set((x1+x2)/2,7.755,(z1+z2)/2);S.add(r)}
 }
 panelWall(0,3.7,.012,22,6.96);
 box(-11.08,7.03,-.04,11.08,7.43,.16,p.blue);
 box(-11.08,7.08,.16,11.08,7.14,.205,p.blueShade);
 box(-11.08,7.34,.16,11.08,7.4,.205,p.blueShade);
 box(-11.08,.22,.015,11.08,.32,.1,p.base);
 // Боковые плоскости крыльев: облицовка, синие карнизы и окна в коричневых рамах.
 function wingFace(cx,cz,w,ry,windows,skipGround=[]){
  const side=new THREE.Group();side.position.set(cx,0,cz);side.rotation.y=ry;root.add(side);
  function moveAdded(start){for(const q of root.children.slice(start)){root.remove(q);side.add(q)}}
  let start=root.children.length;panelWall(0,3.7,.012,w,6.96);moveAdded(start);
  const bx=(a,y,b,c,t,d,mt)=>{const q=new THREE.Mesh(unit,mt);q.position.set((a+c)/2,(y+t)/2,(b+d)/2);q.scale.set(c-a,t-y,d-b);side.add(q)};
  bx(-w/2-.03,7.03,0,w/2+.03,7.43,.15,p.blue);bx(-w/2,.22,0,w/2,.32,.1,p.base);
  for(const u of windows)for(const y of [1.65,5.18]){
   if(y<2&&skipGround.includes(u))continue;
   start=root.children.length;narrowWindow(u,y,.012,1.12,1.85);moveAdded(start);
  }
  return side;
 }
 function narrowWindow(u,y,v,w=.96,h=1.82,glassMaterial=blindGlass){
  const g=new THREE.Group();g.position.set(u,y,v);root.add(g);
  const b=(a,c,d,e,f,k,mt)=>{const q=new THREE.Mesh(unit,mt);q.position.set((a+e)/2,(c+f)/2,(d+k)/2);q.scale.set(e-a,f-c,k-d);g.add(q)};
  b(-w/2-.1,-h/2-.08,0,w/2+.1,h/2+.08,.09,p.blue);
  b(-w/2,-h/2,.09,w/2,h/2,.102,p.blueShade);
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(w-.16,h-.16),glassMaterial);glass.position.z=.105;g.add(glass);
  const mullions=w>2?[-w*.18,w*.18]:w>.65?[0]:[];
  for(const x of [-w/2+.07,w/2-.07,...mullions])b(x-.022,-h/2+.05,.107,x+.022,h/2-.05,.14,p.brown);
  for(const a of [-h/2+.05,h/2-.05,h/2-.4])b(-w/2+.05,a-.022,.107,w/2-.05,a+.022,.14,p.brown);
  b(-w/2-.11,-h/2-.1,.02,w/2+.11,-h/2-.05,.18,p.blue);
 }
 for(const u of [-9.55,-7.45,-5.35,5.35,7.45,9.55])for(const y of [1.65,5.18])narrowWindow(u,y,.025);
 // Положения боковых фасадов заданы в локальных координатах главного входа.
 wingFace(-11,-1.2,8,Math.PI/2,[-2.18]); // южное крыло, внутренняя стена
 wingFace(11,-3.2,12,-Math.PI/2,[-3.5,.8]); // северное крыло, внутренняя стена
 // Фасады крыльев, обращённые во двор, продолжают ту же облицовку.
 wingFace(-20,2.81,18,0,[]);
 wingFace(18,2.81,14,0,[]);
 for(const [u,w] of [[-27.3,.67],[-25.15,1.68],[-22.05,2.4],[-18.2,2.23],[-15.12,1.63],[-12.4,.64],
  [12.7,.79],[15.35,1.72],[18.22,1.9],[21.3,1.49],[23.65,.74]]){
  narrowWindow(u,5.37,2.828,w,1.85,upperGlass);
 }
 for(const [u,w] of [[-27.43,.67],[-25.45,.98],[-23.07,.94],[-21.48,.9],[-19.52,.54],[-18.39,.74],[-17.3,.5],
  [-15.72,.7],[-14.72,.52],[-12.7,.65],[12.55,.75],[14.55,.81],[16.55,.73],[18.6,.83],[20.5,.68],[22.4,.8],[23.88,.58]]){
  narrowWindow(u,u===-27.43?2.13:1.53,2.828,w,u===-27.43?.72:1.67);
 }
 const wingSign=texture(canvas(1536,96,(g,w,h)=>{
  const title='BQFQ · ИННОВАЦИОННЫЙ МНОГОПРОФИЛЬНЫЙ КОЛЛЕДЖ';
  g.font='bold 59px Arial';g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='#203b57';g.fillText(title,w/2+4,h/2+5,w-30);
  g.strokeStyle='#194875';g.lineWidth=2;g.strokeText(title,w/2,h/2,w-30);
  g.fillStyle='#3675bb';g.fillText(title,w/2,h/2,w-30);
 }));
 plane(-20,6.78,2.892,15.75,.84,mat(0xffffff,{map:wingSign,transparent:true,depthWrite:false}));
 // Остальные стороны также сохраняют окна и отделку, когда игрок обходит корпус.
 wingFace(0,-15.21,22,Math.PI,[-9.4,-6.2,-3.1,0,3.1,6.2,9.4]);
 wingFace(-20,-5.21,18,Math.PI,[-7,-3.6,0,3.6,7]);
 wingFace(18,-9.21,14,Math.PI,[-5.3,-1.8,1.8,5.3]);
 wingFace(25,-3.2,12,Math.PI/2,[-4.2,-.3,3.5]);
 wingFace(-11,-10.2,10,-Math.PI/2,[-3.2,0,3.2],[0]);
 wingFace(11,-12.2,6,Math.PI/2,[-1.6,1.6]);
 wingFace(-29,-1.2,8,-Math.PI/2,[]);
 // Центральный фронтон: серая плоскость внутри двух синих наклонных поясов.
 const shape=new THREE.Shape();shape.moveTo(-6.5,7.43);shape.lineTo(6.5,7.43);shape.lineTo(0,10.1);shape.closePath();
 const gable=new THREE.Mesh(new THREE.ShapeGeometry(shape),panelMaterial);gable.position.z=.025;
 const guv=gable.geometry.attributes.uv,gpos=gable.geometry.attributes.position;for(let i=0;i<guv.count;i++)guv.setXY(i,gpos.getX(i)/1.15,gpos.getY(i)/.29);root.add(gable);
 const backGable=gable.clone();backGable.position.z=-15.21;backGable.rotation.y=Math.PI;root.add(backGable);
 box(-11,7.18,-15.2,-6.5,7.26,0,p.roof);box(6.5,7.18,-15.2,11,7.26,0,p.roof);
 function beam(a,b,width,depth,mt){const dx=b[0]-a[0],dy=b[1]-a[1],q=new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(dx,dy),width,depth),mt);q.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,.08);q.rotation.z=Math.atan2(dy,dx);root.add(q)}
 for(const side of [-1,1]){beam([side*6.6,7.43],[0,10.16],.3,.25,p.blue);beam([side*6.27,7.43],[0,9.99],.05,.28,p.blueShade)}
 const roofSlope=Math.atan2(2.67,6.5);
 for(const sign of [-1,1]){const roof=new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(6.5,2.67),.1,15.3),p.roof);roof.position.set(sign*3.25,8.765,-7.65);roof.rotation.z=-sign*roofSlope;root.add(roof)}
 const logoCanvas=canvas(256,256,(g,w,h)=>{
  g.fillStyle='#ecefe9';g.beginPath();g.arc(128,128,121,0,Math.PI*2);g.fill();g.strokeStyle='#284865';g.lineWidth=5;g.beginPath();g.arc(128,128,113,0,Math.PI*2);g.stroke();
  g.strokeStyle='#a65d61';g.lineWidth=10;g.beginPath();g.arc(128,128,91,3.7,5.73);g.stroke();g.strokeStyle='#567e9d';g.beginPath();g.arc(128,128,91,.6,2.55);g.stroke();
  g.fillStyle='#3f4d62';g.font='bold 52px Georgia';g.textAlign='center';g.fillText('BQFQ',128,143);g.font='16px Arial';g.fillText('КОЛЛЕДЖ',128,177);
 });
 const logo=new THREE.Mesh(new THREE.CircleGeometry(.55,40),mat(0xffffff,{map:texture(logoCanvas)}));logo.position.set(0,8.82,.24);root.add(logo);
 // Три высоких витража. Все нижние дверные полотна стоят в одной плоскости и закрыты.
 const portals=[];
 for(const u of [-2.6,0,2.6]){
  const w=1.7,bottom=.35,top=6.92;
  box(u-w/2-.1,bottom-.07,.018,u+w/2+.1,top+.1,.15,p.blue);
  box(u-w/2,bottom,.15,u+w/2,top,.163,p.blueShade);
  const glass=glazing(u,(bottom+top)/2,.166,w-.12,top-bottom-.1);
  glass.name='college1-closed-portal-'+u;
  for(const x of [u-w/2+.045,u+w/2-.045])box(x-.035,bottom,.166,x+.035,top,.22,p.brown);
  box(u-.026,2.5,.17,u+.026,top,.235,p.brown);
  for(const y of [2.5,3.23,3.97,4.71,5.45,6.19,top-.035])box(u-w/2+.045,y-.03,.167,u+w/2-.045,y+.03,.235,p.brown);
  // Нижняя секция с двумя створками и без открытого зазора.
  const halves=u===2.6?[-.23]:[0];
  for(const offset of halves)box(u+offset-.026,bottom,.17,u+offset+.026,2.5,.235,p.brown);
  box(u-w/2+.04,bottom,.17,u+w/2-.04,bottom+.07,.235,p.brown);
  if(u!==-2.6){
   const grips=u===0?[u-.14,u+.14]:[u+.48];
   for(const x of grips){
    for(let i=0;i<8;i++){const t=i/8,s=(i+1)/8;
     tube([x-.075*Math.sin(t*Math.PI),.98+t*.96,.28+.065*Math.sin(t*Math.PI)],
      [x-.075*Math.sin(s*Math.PI),.98+s*.96,.28+.065*Math.sin(s*Math.PI)],.022,p.brown);
    }
    tube([x,.98,.23],[x,.98,.28],.016,p.brown);tube([x,1.94,.23],[x,1.94,.28],.016,p.brown);
   }
   portals.push({u,closed:true,width:w,height:2.15});
  }
 }
 const yellowCircle=new THREE.Mesh(new THREE.CircleGeometry(.075,20),mat(0xe6ca17));yellowCircle.position.set(2.95,1.47,.245);root.add(yellowCircle);
 const notice=canvas(256,384,(g,w,h)=>{g.fillStyle='#e9ca20';g.fillRect(0,0,w,h);g.strokeStyle='#71662a';g.lineWidth=4;g.strokeRect(11,11,w-22,h-22);g.fillStyle='#363a29';g.textAlign='center';g.font='bold 22px Arial';g.fillText('КОРПУС 1',128,45);g.font='17px Arial';g.fillText('ВХОД',128,78);for(let y=108;y<350;y+=22)g.fillRect(27,y,202-(y%5)*13,3)});
 plane(-.42,1.32,.249,.33,.49,mat(0xffffff,{map:texture(notice)}));
 const paper=canvas(256,192,(g,w,h)=>{g.fillStyle='#e3e9e7';g.fillRect(0,0,w,h);g.fillStyle='#8b9aa0';g.fillRect(14,18,54,66);g.fillStyle='#465c66';for(let y=23;y<175;y+=17)g.fillRect(82,y,155-(y%4)*12,3)});
 plane(-.46,1.95,.25,.35,.26,mat(0xffffff,{map:texture(paper)}));
 function plaque(u){
  box(u-.39,2.56,.04,u+.39,3.12,.1,p.gold);
  const c=canvas(384,256,(g,w,h)=>{g.fillStyle='#115382';g.fillRect(0,0,w,h);g.strokeStyle='#c8b473';g.lineWidth=4;g.strokeRect(8,8,w-16,h-16);g.fillStyle='#d5c78b';g.beginPath();g.arc(192,45,16,0,7);g.fill();g.textAlign='center';g.font='bold 21px Arial';g.fillText('КОЛЛЕДЖ BQFQ',192,110);g.font='17px Arial';g.fillText('ОБРАЗОВАТЕЛЬНЫЙ ЦЕНТР',192,146);g.fillText('КОРПУС 1',192,184)});
  plane(u,2.84,.105,.74,.52,mat(0xffffff,{map:texture(c)}));
 }
 plaque(-1.3);plaque(1.3);
 // Наружные блоки кондиционеров с решётками и кронштейнами.
 const grille=texture(canvas(128,128,(g,w,h)=>{g.fillStyle='#c5cecb';g.fillRect(0,0,w,h);g.fillStyle='#52646a';g.beginPath();g.arc(54,64,46,0,7);g.fill();g.strokeStyle='#a6b4b4';g.lineWidth=2;for(let x=7;x<110;x+=5){g.beginPath();g.moveTo(x,10);g.lineTo(x,118);g.stroke()}for(let y=12;y<120;y+=5){g.beginPath();g.moveTo(7,y);g.lineTo(110,y);g.stroke()}g.fillStyle='#778887';g.fillRect(114,21,8,55)}));
 function ac(u,y,v=.03){box(u-.34,y-.26,v,u+.34,y+.26,v+.3,p.white);plane(u,y,v+.306,.62,.45,mat(0xffffff,{map:grille}));for(const x of [u-.24,u+.24]){box(x-.025,y-.35,v,x+.025,y-.26,v+.3,p.steel);tube([x,y-.35,v+.26],[x,y-.48,v+.01],.015)}}
 ac(-1.35,4.22);ac(8.5,5.46);
 ac(12.2,4.03,2.847);
 for(const [a,b] of [[-29,-11],[11,25]]){
  tube([a,7.46,2.98],[b,7.46,2.98],.046,p.white);
  for(const [u,dir] of [[a+.21,1],[b-.21,-1]]){
   box(u-.18,.29,2.825,u+.18,7.08,2.906,p.blue);
   tube([u,7.46,2.98],[u,7.18,3.025],.045,p.white);
   tube([u,7.18,3.025],[u,.42,3.025],.045,p.white);
   tube([u,.42,3.025],[u+dir*.075,.19,3.15],.045,p.white);
   for(const y of [.83,3.62,6.61])box(u-.066,y-.015,2.889,u+.066,y+.015,3.075,p.steel);
  }
 }
 tube([-20.21,7.46,2.98],[-20.21,.28,3.0],.043,p.white);
 box(23.25,3.37,2.828,23.44,3.46,2.98,p.white);
 box(23.29,3.38,2.979,23.4,3.438,3.006,p.dark);
 for(const u of [-10.84,10.84]){
  tube([u,7.41,.23],[u,.43,.23],.055,p.white);tube([u,.43,.23],[u+.12,.15,.42],.055,p.white);
  for(const y of [.8,3.7,6.6])box(u-.08,y-.02,.07,u+.08,y+.02,.27,p.steel);
 }
 tube([-11,7.48,.1],[11,7.48,.1],.045,p.white);
 for(const [u,y] of [[0,7.0],[-.09,6.85],[.09,6.85]]){const q=new THREE.Mesh(new THREE.SphereGeometry(.047,10,8),p.white);q.position.set(u,y,.28);root.add(q)}
 for(const u of [-6,-1.3,1.3,5.1,7.5]){box(u-.08,.88,.055,u+.08,.91,.19,p.dark);box(u-.06,.875,.19,u+.06,.89,.215,p.white)}
 // Каменная площадка и две невысокие ступени; пандус справа от центральной двери.
 const stoneMap=texture(canvas(256,256,(g,w,h)=>{g.fillStyle='#777a76';g.fillRect(0,0,w,h);for(let i=0;i<15000;i++){g.fillStyle=random()>.5?'#cacbc154':'#2f383942';g.fillRect(random()*w,random()*h,1,1)}g.fillStyle='#555f5b';g.fillRect(0,0,w,2);g.fillRect(0,0,2,h)}));
 const stone=mat(0xffffff,{map:stoneMap,shininess:38});
 box(-3.75,.125,.19,3.85,.35,1.1,stone);
 box(-3.75,.125,1.1,1.1,.23,1.44,stone);
 box(-3.75,.125,1.44,1.1,.16,1.76,stone);
 for(const v of [1.1,1.44,1.76])box(-3.75,v===1.1?.343:v===1.44?.223:.153,v-.023,1.1,v===1.1?.35:v===1.44?.23:.16,v, p.base);
 box(1.15,.125,1.1,3.85,.35,2.12,stone);
 const ramp=new THREE.Shape();ramp.moveTo(-.1,.125);ramp.lineTo(3.3,.125);ramp.lineTo(-.1,.35);ramp.closePath();
 const rampMesh=new THREE.Mesh(new THREE.ExtrudeGeometry(ramp,{depth:.95,bevelEnabled:false}),stone);
 rampMesh.position.set(3.8,0,1.15);root.add(rampMesh);
 function railing(points){for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i];tube([a[0],a[1]+.91,a[2]],[b[0],b[1]+.91,b[2]],.023);
  for(const h of [.23,.48,.68])tube([a[0],a[1]+h,a[2]],[b[0],b[1]+h,b[2]],.011);
  const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/1.1));
  for(let j=0;j<n;j++){const t=j/n,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,z=a[2]+(b[2]-a[2])*t;tube([x,y,z],[x,y+.91,z],.018);tube([x,y+.01,z],[x,y+.04,z],.052)}
 }const a=points[points.length-1];tube(a,[a[0],a[1]+.91,a[2]],.018)}
 railing([[1.22,.35,1.12],[1.22,.35,2.13],[3.7,.35,2.13],[7.1,.125,2.13]]);
 railing([[3.7,.35,1.12],[7.1,.125,1.12]]);
 // Покрытие двора: светлые восьмигранники с небольшими тёмными квадратами.
 const paving=texture(canvas(512,512,(g,w,h)=>{
  g.fillStyle='#676966';g.fillRect(0,0,w,h);
  const size=128,cut=25;for(let row=0;row<4;row++)for(let col=0;col<4;col++){
   const x=col*size,y=row*size;g.fillStyle=(row+col)%2?'#cec9bd':'#dad5c8';g.beginPath();g.moveTo(x+cut+2,y+2);g.lineTo(x+size-cut-2,y+2);g.lineTo(x+size-2,y+cut+2);g.lineTo(x+size-2,y+size-cut-2);g.lineTo(x+size-cut-2,y+size-2);g.lineTo(x+cut+2,y+size-2);g.lineTo(x+2,y+size-cut-2);g.lineTo(x+2,y+cut+2);g.closePath();g.fill();
   g.strokeStyle='#b3b7b1';g.lineWidth=2;g.stroke();g.strokeStyle='#dedfd6';g.lineWidth=1;g.beginPath();g.arc(x+64,y+64,37,0,7);g.stroke();
   g.strokeStyle='#b8bcb4';for(let k=0;k<6;k++){g.beginPath();g.ellipse(x+64+Math.cos(k*Math.PI/3)*10,y+64+Math.sin(k*Math.PI/3)*10,14,7,k*Math.PI/3,0,7);g.stroke()}
  }
  for(let i=0;i<12000;i++){g.fillStyle=random()>.5?'#ffffff10':'#353c3810';g.fillRect(random()*w,random()*h,1,1)}
 }));
 const pavingMaterial=mat(0xe7e6e1,{map:paving,shininess:12});
 function pave(u1,v1,u2,v2){
  box(u1,.026,v1,u2,.126,v2,p.base);
  const geometry=new THREE.PlaneGeometry(u2-u1,v2-v1),uv=geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(u1+uv.getX(i)*(u2-u1))/1.44,(-v2+uv.getY(i)*(v2-v1))/1.44);
  const pavement=new THREE.Mesh(geometry,pavingMaterial);
  pavement.rotation.x=-Math.PI/2;pavement.position.set((u1+u2)/2,.127,(v1+v2)/2);root.add(pavement);
 }
 pave(-11,.06,11,9.46);
 pave(-29,2.8,-11,3.92);
 pave(11,2.8,25,3.92);
 pave(-30.1,-5.2,-29,3.92);
 pave(25,-9.2,26.1,3.92);
 box(-11,.04,9.46,11,.135,9.54,p.base);
 const tactile=mat(0xc7ac53);box(-.8,.129,1.93,.8,.14,2.18,tactile);for(let u=-.76;u<.8;u+=.07)box(u,.14,1.95,u+.015,.145,2.16,p.gold);
 // Повторяющиеся крепежи и перила объединены, чтобы не нагружать видеокарту.
 root.updateMatrixWorld(true);
 const inverse=root.matrixWorld.clone().invert(),toBatch=[];
 root.traverse(q=>{if(q.isMesh&&q.geometry===unit)toBatch.push(q)});
 for(const q of toBatch){batch(unit,q.material,inverse.clone().multiply(q.matrixWorld));q.parent.remove(q)}
 for(const {geometry,mt,matrices} of batches.values()){const mesh=new THREE.InstancedMesh(geometry,mt,matrices.length);matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));mesh.frustumCulled=false;root.add(mesh)}
 root.userData={photoFacade:true,doorsClosed:true,portals,frontWidth:22,sideWindowCount:12,tallWindows:3};
 return root;
}
const college1Exterior=buildCollege1Exterior();
// END COLLEGE1_EXTERIOR
