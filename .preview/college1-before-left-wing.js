// ---- Корпус 1: увеличенный холл и правый коридор, план уточнён по встречным ракурсам.
function buildCollegeEntranceInterior(){
 const scene=new THREE.Scene(),colliders=[],batches=new Map(),geometryCache=new Map(),zones=[[-5.4,0,5.4,2.85],[-1.05,2.85,1.05,3.12],[-5.4,3.12,5.4,10.3],[5.4,7.85,17.5,10.1]];
 const fixtures=[],classroomDoors=[];let pose=new THREE.Matrix4();
 scene.background=new THREE.Color(0xc9c9be);
 scene.add(new THREE.HemisphereLight(0xfffcf2,0x919897,.8));
 const sun=new THREE.DirectionalLight(0xffffff,.3);sun.position.set(1,6,-4);scene.add(sun);
 let seed=109;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const canvas=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c};
 const texture=(w,h,draw,meters=1)=>{
  const tx=new THREE.CanvasTexture(canvas(w,h,draw));tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.anisotropy=4;tx.userData={tileMeters:meters};return tx;
 };
 const grain=(g,w,h,count=5000)=>{for(let i=0;i<count;i++){g.fillStyle=i%2?'#ffffff10':'#00000008';g.fillRect(rand()*w,rand()*h,1+rand()*2,1)}};
 const tileMap=texture(384,384,(g,w,h)=>{
  g.fillStyle='#c9cfcc';g.fillRect(0,0,w,h);grain(g,w,h,14000);
  for(let i=0;i<5;i++){
   const y=rand()*h;g.strokeStyle='#8e9b9816';g.lineWidth=2;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(120,y+40,230,y-30,w,y+18);g.stroke();
  }
  g.strokeStyle='#949d9b';g.lineWidth=2;g.strokeRect(0,0,w,h);
 },.6);
 const oakMap=texture(384,768,(g,w,h)=>{
  g.fillStyle='#b19a79';g.fillRect(0,0,w,h);
  for(let i=0;i<1100;i++){
   const x=rand()*w,y=rand()*h;g.strokeStyle=i%2?'#67523c19':'#eee2c41d';g.lineWidth=.3+rand()*1.7;
   g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x-3,y+70,x+4,y+140,x+1,y+230);g.stroke();
  }grain(g,w,h);
 },1.15);
 const wallMap=texture(128,128,(g,w,h)=>{g.fillStyle='#e3dfd1';g.fillRect(0,0,w,h);grain(g,w,h,5000)},.8);
 const ceilingMap=texture(128,128,(g,w,h)=>{g.fillStyle='#e4e6e0';g.fillRect(0,0,w,h);grain(g,w,h,1500);g.strokeStyle='#a6aeaa';g.lineWidth=2;g.strokeRect(0,0,w,h)},.6);
 const material=(color,map=null,options={})=>new THREE.MeshPhongMaterial({color,map,specular:0x3b4140,shininess:20,...options});
 const p={floor:material(0xffffff,tileMap,{shininess:36}),oak:material(0xffffff,oakMap),cream:material(0xffffff,wallMap),
  ceiling:material(0xffffff,ceilingMap),white:material(0xf3f0e4),trim:material(0xeeece2),seam:material(0x5f584e),
  frame:material(0x6d4128),iron:material(0x262a29),red:material(0x692c38,null,{shininess:5}),
  steel:material(0xadb8b8,null,{shininess:95,specular:0xd6e4df}),dark:material(0x202626),black:material(0x11191d),
  green:material(0x3d6243,null,{side:THREE.DoubleSide,shininess:12}),soil:material(0x453d2f),gold:material(0xb9a36a),blue:material(0x2677a8),
  glass:material(0xa7bdb9,null,{transparent:true,opacity:.17,depthWrite:false,side:THREE.DoubleSide}),
  bulb:new THREE.MeshBasicMaterial({color:0xfffcec})};
 const boxGeo=new THREE.BoxGeometry(1,1,1),rodGeo=new THREE.CylinderGeometry(1,1,1,10),
  ballGeo=new THREE.SphereGeometry(1,10,7),matrix=new THREE.Matrix4(),quat=new THREE.Quaternion(),euler=new THREE.Euler(),v=new THREE.Vector3(),scale=new THREE.Vector3();
 function add(geo,mt,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){
  if(geo===boxGeo&&mt.map){
   const meters=mt.map.userData?.tileMeters||1,key=[sx,sy,sz,meters].map(n=>n.toFixed(4)).join(':');
   if(!geometryCache.has(key)){
    const g=boxGeo.clone(),uv=g.attributes.uv;
    [[sz,sy],[sz,sy],[sx,sz],[sx,sz],[sx,sy],[sx,sy]].forEach(([w,h],face)=>{for(let i=face*4;i<face*4+4;i++)uv.setXY(i,uv.getX(i)*w/meters,uv.getY(i)*h/meters)});
    geometryCache.set(key,g);
   }geo=geometryCache.get(key);
  }
  const key=geo.uuid+':'+mt.id;if(!batches.has(key))batches.set(key,{geo,mt,list:[]});
  quat.setFromEuler(euler.set(rx,ry,rz));matrix.compose(v.set(x,y,z),quat,scale.set(sx,sy,sz)).premultiply(pose);batches.get(key).list.push(matrix.clone());
 }
 function at(x,z,ry,build){
  const saved=pose;pose=new THREE.Matrix4().makeRotationY(ry);pose.setPosition(x,0,z);pose.premultiply(saved);
  try{build()}finally{pose=saved}
 }
 // Всё правое крыло повёрнуто к проёму на боковой стене, отмеченному игроком.
 function inRightCorridor(build){at(5.4,8.975,Math.PI/2,()=>at(-4.275,-10.3,0,build))}
 function collider(x1,y1,z1,x2,y2,z2){
  const b=new THREE.Box3(new THREE.Vector3(x1,y1,z1),new THREE.Vector3(x2,y2,z2)).applyMatrix4(pose);
  colliders.push([b.min.x,b.min.z,b.max.x,b.max.z,b.min.y,b.max.y]);
 }
 function box(x1,y1,z1,x2,y2,z2,mt,solid=false){
  add(boxGeo,mt,(x1+x2)/2,(y1+y2)/2,(z1+z2)/2,x2-x1,y2-y1,z2-z1);
  if(solid)collider(x1,y1,z1,x2,y2,z2);
 }
 function rod(a,b,r,mt=p.steel){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
  quat.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());matrix.compose(start.add(end).multiplyScalar(.5),quat,scale.set(r,delta.length(),r)).premultiply(pose);
  const key=rodGeo.uuid+':'+mt.id;if(!batches.has(key))batches.set(key,{geo:rodGeo,mt,list:[]});batches.get(key).list.push(matrix.clone());
 }
 function panel(x,y,z,w,h,mt,ry=0,rx=0){
  const geo=new THREE.PlaneGeometry(w,h),uv=geo.attributes.uv;
  // План развёрнут по X, надписи и фотографии сохраняют правильное направление.
  for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i));
  const mesh=new THREE.Mesh(geo,mt);mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,0);mesh.applyMatrix4(pose);scene.add(mesh);return mesh;
 }
 function label(text,x,y,z,w,h,bg='#ebe8d9',fg='#4b544f',ry=0){
  const cw=512,ch=Math.max(64,Math.round(cw*h/w));
  const tx=new THREE.CanvasTexture(canvas(cw,ch,g=>{
   if(bg){g.fillStyle=bg;g.fillRect(0,0,cw,ch)}g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';
   let font=ch*.95;g.font='bold '+font+'px Arial, sans-serif';const metrics=g.measureText(text);
   if(metrics&&metrics.width>cw*.92){font*=cw*.92/metrics.width;g.font='bold '+font+'px Arial, sans-serif'}
   g.fillText(text,cw/2,ch*.53,cw*.94);
  }));
  const mesh=panel(x,y,z,w,h,new THREE.MeshBasicMaterial({map:tx,transparent:!bg,depthWrite:!!bg}),ry);mesh.userData.text=text;return mesh;
 }
 const outsideMap=texture(768,512,(g,w,h)=>{
  g.fillStyle='#dbe7e7';g.fillRect(0,0,w,h);g.fillStyle='#c7b58d';g.fillRect(0,160,w,230);
  g.fillStyle='#437aa4';g.fillRect(0,162,w,23);g.fillRect(0,212,w,38);
  for(let x=24;x<w;x+=86){g.fillStyle='#e7e4d4';g.fillRect(x,267,49,85);g.fillStyle='#5e7983';g.fillRect(x+5,272,39,75)}
  g.fillStyle='#b2b6b0';g.fillRect(0,390,w,122);g.strokeStyle='#d7d9d0';g.lineWidth=2;
  for(let y=396;y<h;y+=18){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}
  for(let x=0;x<w;x+=32){g.beginPath();g.moveTo(x,390);g.lineTo(x-60,512);g.stroke()}
 });
 const outside=new THREE.MeshBasicMaterial({map:outsideMap});
 const contactMap=texture(128,128,(g,w,h)=>{const grad=g.createRadialGradient(64,64,1,64,64,64);grad.addColorStop(0,'#17201d50');grad.addColorStop(1,'#17201d00');g.fillStyle=grad;g.fillRect(0,0,w,h)});
 const contactMat=new THREE.MeshBasicMaterial({map:contactMap,transparent:true,depthWrite:false});
 const contact=(x,z,w,d)=>panel(x,.012,z,w,d,contactMat,0,-Math.PI/2);
 // Все координаты плана: X вправо от входа, Z вглубь корпуса; высота мебели не масштабируется.
 const corridorMap=texture(384,384,(g,w,h)=>{
  g.fillStyle='#9faeb3';g.fillRect(0,0,w,h);
  for(let i=0;i<10500;i++){g.fillStyle=i%3===0?'#e7eee8a0':i%3===1?'#6d7f8550':'#cbd4ce90';g.fillRect(rand()*w,rand()*h,.5+rand()*1.5,.5+rand()*1.5)}
 },1.2);
 p.corridor=material(0xffffff,corridorMap,{shininess:85,specular:0x929f9f});
 const counterMap=texture(768,384,(g,w,h)=>{
  g.fillStyle='#b19a79';g.fillRect(0,0,w,h);
  for(let i=0;i<950;i++){
   const x=rand()*w,y=rand()*h;g.strokeStyle=i%2?'#67523c19':'#eee2c41d';g.lineWidth=.3+rand()*1.4;
   g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+80,y-2,x+170,y+3,x+260,y+1);g.stroke();
  }
 },1.15);
 p.counter=material(0xffffff,counterMap);p.blind=material(0xa9a38e);p.blindLight=material(0xd9d4bf);
 p.doorGlass=material(0x79827b,null,{shininess:65});
 const mark=(kind,x,z,width,depth,extra={})=>{
  const b=new THREE.Box3(new THREE.Vector3(x-width/2,0,z-depth/2),new THREE.Vector3(x+width/2,1,z+depth/2)).applyMatrix4(pose);
  fixtures.push({kind,x:(b.min.x+b.max.x)/2,z:(b.min.z+b.max.z)/2,width:b.max.x-b.min.x,depth:b.max.z-b.min.z,...extra});
 };
 const leafGeo=new THREE.BufferGeometry(),leafPositions=[],leafIndices=[];
 for(let row=0;row<=10;row++){
  const t=row/10,half=Math.sin(Math.PI*t)*.095;
  for(const side of [-1,0,1])leafPositions.push(t*.31,Math.sin(Math.PI*t)*.055-Math.abs(side)*half*.16,side*half);
 }
 for(let row=0;row<10;row++)for(let col=0;col<2;col++){const n=row*3+col;leafIndices.push(n,n+3,n+1,n+1,n+3,n+4)}
 leafGeo.setAttribute('position',new THREE.Float32BufferAttribute(leafPositions,3));leafGeo.setIndex(leafIndices);leafGeo.computeVertexNormals();
 const strapGeo=new THREE.BufferGeometry(),strapPositions=[],strapIndices=[];
 for(let row=0;row<=12;row++){
  const t=row/12,half=Math.sin(Math.PI*t)*.038;
  for(const side of [-1,0,1])strapPositions.push(t*.57,Math.sin(t*Math.PI*.9)*.14-t*t*.29,side*half);
 }
 for(let row=0;row<12;row++)for(let col=0;col<2;col++){const n=row*3+col;strapIndices.push(n,n+3,n+1,n+1,n+3,n+4)}
 strapGeo.setAttribute('position',new THREE.Float32BufferAttribute(strapPositions,3));strapGeo.setIndex(strapIndices);strapGeo.computeVertexNormals();
 function pot(x,z,size=1,y=0,type='broad',solid=true){
  const r=.19*size,height=.36*size;
  add(new THREE.CylinderGeometry(r,.145*size,height,14),p.white,x,y+height/2,z,1,1,1);
  add(rodGeo,p.soil,x,y+height,z,r*.91,.012,r*.91);
  if(type==='strap'||type==='strap-wall'){
   for(let stem=0;stem<3;stem++){
    const a=stem*2.4,top=[x+Math.cos(a)*.065*size,y+(.95+stem*.17)*size,z+Math.sin(a)*.065*size];
    rod([x,y+height*.8,z],top,.012*size,p.frame);
    for(let j=0;j<8;j++)add(strapGeo,p.green,...top,size,size,size,0,type==='strap-wall'?-Math.PI/2+j*Math.PI/7:a+j*Math.PI/4,-.08+stem*.06);
   }
  }else{
   for(let i=0;i<12;i++){
    const a=i*2.4,top=[x+Math.cos(a)*.12*size,y+(.5+i*.045)*size,z+Math.sin(a)*.12*size];
    rod([x,y+height*.9,z],top,.008*size,p.green);add(leafGeo,p.green,...top,size,size,size,0,-a,.2);
   }
  }
  if(solid)collider(x-r,y,z-r,x+r,y+height,z+r);
  contact(x,z,.7*size,.7*size);
 }
 // Светлая прихожая стала шире и глубже, с двумя скамьями под арками.
 box(-5.4,-.14,0,5.4,0,2.85,p.floor);box(-1.05,-.14,2.85,1.05,0,3.12,p.floor);
 box(-5.4,-.14,3.12,5.4,0,10.3,p.floor);
 inRightCorridor(()=>box(3.15,-.14,10.3,5.4,0,22.4,p.corridor));
 box(-5.55,0,-.12,-5.4,4.52,3.12,p.oak,true);box(5.4,0,-.12,5.55,4.52,3.12,p.oak,true);
 box(-5.4,4.48,0,5.4,4.62,2.85,p.white);
 collider(-5.4,0,-.15,5.4,4.52,.025);
 for(const [x1,x2] of [[-5.4,-1.15],[1.15,5.4]]){
  box(x1,0,-.1,x2,4.48,-.03,p.oak);
  panel((x1+x2)/2,2.4,-.012,x2-x1-.24,3.85,outside);
  for(const x of [x1+.07,x2-.07])box(x-.034,.45,-.005,x+.034,4.42,.075,p.frame);
  for(const y of [.45,2.4,3.12,3.8,4.4])box(x1+.04,y-.028,-.005,x2-.04,y+.028,.075,p.frame);
 }
 panel(0,2.24,-.095,2.26,4.4,outside);
 for(const x of [-1.12,0,1.12])box(x-.035,.03,-.04,x+.035,4.47,.075,p.frame);
 for(const y of [.04,2.4,3.08,3.76,4.44])box(-1.15,y-.035,-.04,1.15,y+.035,.075,p.frame);
 for(const side of [-1,1]){
  const x=side*.13;rod([x,1.05,.1],[x+side*.07,1.35,.16],.02,p.frame);rod([x+side*.07,1.35,.16],[x,1.65,.1],.02,p.frame);
  add(new THREE.CircleGeometry(.07,24),p.gold,side*.57,1.57,.08,1,1,1);
 }
 label('ВЫХОД',0,2.56,.08,.62,.17,'#e7dfaa','#544a31');
 // Вход и два настоящих окна на одной стене. Со стороны холла на окнах жалюзи.
 for(const [x1,x2] of [[-5.4,-4.6],[-2.8,-1.05],[1.05,2.8],[4.6,5.4]]){
  box(x1,0,2.85,x2,4.48,3.12,p.cream,true);
  box(x1,.08,2.825,x2,4.46,2.85,p.oak);
 }
 for(const cx of [-3.7,3.7]){
  box(cx-.9,0,2.85,cx+.9,.9,3.12,p.cream,true);box(cx-.9,3.12,2.85,cx+.9,4.48,3.12,p.oak,true);
  collider(cx-.9,.9,2.85,cx+.9,3.12,3.12);
  box(cx-.87,.94,2.97,cx+.87,3.1,3,p.glass);
  for(const x of [cx-.9,cx+.9])box(x-.035,.88,2.81,x+.035,3.15,3.14,p.frame);
  for(const y of [.91,3.12])box(cx-.93,y-.035,2.81,cx+.93,y+.035,3.14,p.frame);
  box(cx-.96,.87,2.7,cx+.96,.93,3.28,p.white);
  for(let y=1.56;y<3.1;y+=.13)box(cx-.88,y,3.14,cx+.88,y+.073,3.158,p.blind);
  box(cx-.96,3.13,3.13,cx+.96,3.185,3.19,p.trim);
  for(let y=1.56;y<3.1;y+=.13)box(cx-.88,y+.074,3.14,cx+.88,y+.103,3.155,p.blindLight);
  box(cx-.83,.15,3.14,cx+.83,.73,3.27,p.white,true);
  for(let x=cx-.78;x<cx+.8;x+=.095)box(x,.18,3.27,x+.04,.69,3.3,p.trim);
  mark('entryWallWindow',cx,3,1.8,.27);
 }
 box(-1.05,3.5,2.85,1.05,4.48,3.12,p.oak,true);box(-1.05,2.43,2.91,1.05,3.5,2.94,p.glass);
 for(const x of [-1.05,-.68,1.05])box(x-.03,0,2.81,x+.03,3.53,2.97,p.frame);
 for(const y of [2.4,3.51])box(-1.08,y-.034,2.81,1.08,y+.034,2.97,p.frame);
 box(-1.01,.04,2.89,-.72,2.36,2.92,p.glass);
 const innerDoor=new THREE.Group();innerDoor.position.set(1.01,0,2.85);innerDoor.rotation.y=-Math.PI/2.2;scene.add(innerDoor);
 function doorPart(x,y,z,w,h,d,mt){const q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mt);q.position.set(x,y,z);innerDoor.add(q)}
 doorPart(-.81,1.2,0,1.62,2.36,.025,p.glass);
 for(const x of [-1.62,0])doorPart(x,1.2,0,.06,2.42,.06,p.frame);
 for(const y of [.03,2.4])doorPart(-.81,y,0,1.68,.06,.06,p.frame);
 doorPart(-1.43,1.25,-.065,.04,.57,.04,p.frame);
 collider(.735,0,1.21,1.05,2.45,2.88);
 function archPath(path,w,spring,top){path.moveTo(-w/2,0);path.lineTo(-w/2,spring);path.quadraticCurveTo(-w/2,top-.28,0,top);path.quadraticCurveTo(w/2,top-.28,w/2,spring);path.lineTo(w/2,0);path.closePath()}
 for(const x of [-5.18,-2.65,2.5,5.0]){
  const shape=new THREE.Shape();archPath(shape,2.92,3.0,4.48);const hole=new THREE.Path();archPath(hole,2.46,2.85,4.23);shape.holes.push(hole);
  const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.14,bevelEnabled:false,curveSegments:18}),p.oak);mesh.rotation.y=Math.PI/2;mesh.position.set(x,0,1.425);scene.add(mesh);
 }
 for(const x of [-5.39,5.39]){
  const shape=new THREE.Shape();archPath(shape,2.35,2.8,4.05);
  const niche=new THREE.Mesh(new THREE.ShapeGeometry(shape),p.cream);niche.rotation.y=x<0?Math.PI/2:-Math.PI/2;niche.position.set(x,0,1.425);scene.add(niche);
 }
 function waitingBench(x,ry){
  at(x,1.425,ry,()=>{
   for(const a of [-.74,.74]){
    for(const c of [-.2,.2])rod([a,0,c],[a,.49,c],.015,p.iron);rod([a,.45,-.23],[a,1.0,-.23],.017,p.iron);
   }
   box(-.83,.435,-.235,.83,.51,.235,p.red);rod([-.78,.97,-.23],[.78,.97,-.23],.016,p.iron);rod([-.78,.6,-.23],[.78,.6,-.23],.015,p.iron);
   for(let a=-.71;a<.65;a+=.235){rod([a,.62,-.23],[a+.235,.96,-.23],.01,p.iron);rod([a,.96,-.23],[a+.235,.62,-.23],.01,p.iron)}
   collider(-.85,0,-.26,.85,1.03,.26);
  });contact(x,1.425,.9,2);mark('vestibuleBench',x,1.425,.52,1.7);
 }
 waitingBench(-5.02,Math.PI/2);waitingBench(5.02,-Math.PI/2);
 pot(-4.44,2.26,.82);pot(4.44,.52,.82);
 for(const cx of [-3.7,3.7]){
  box(cx-.35,4.42,1.07,cx+.35,4.47,1.77,p.bulb);
  for(let i=0;i<72;i++){
   const side=i%4,x=side<2?cx-1.0+rand()*2:cx+(side===2?-1:1),z=side<2?(side===0?.55:2.3):.55+rand()*1.75,drop=.2+rand()*.4;
   rod([x,4.45,z],[x,4.45-drop,z],.007,p.green);
   for(let j=0;j<3;j++)add(leafGeo,p.green,x,4.45-drop+j*.09,z,.6,.6,.6,0,i*2.4+j,.5+j*.2);
  }
 }
 // Просторный холл. Прежний проём за кабинетами закрыт, новый — на правой боковой стене.
 box(-5.55,0,3.12,-5.4,3.35,10.45,p.cream,true);
 box(5.4,0,3.12,5.55,3.35,7.85,p.cream,true);box(5.4,0,10.1,5.55,3.35,10.45,p.cream,true);
 box(5.4,3.0,7.85,5.55,3.35,10.1,p.cream,true);
 box(-5.4,0,10.3,5.4,3.35,10.45,p.cream,true);
 box(-5.4,3.3,3.12,5.4,3.43,10.3,p.ceiling);
 for(const x of [-5.385,5.385]){
  for(let z=3.12;z<=10.3;z+=.6)if(x<0||z<7.8||z>10.15)box(x-.007,.07,z-.003,x+.007,3.3,z+.003,p.seam);
  for(const [z1,z2] of x<0?[[3.12,10.3]]:[[3.12,7.8],[10.15,10.3]])box(x-.018,0,z1,x+.018,.09,z2,p.trim);
 }
 for(let x=-5.4;x<=5.4;x+=.6)box(x-.003,.07,10.28,x+.003,3.3,10.3,p.seam);
 for(const [x,z] of [[-3.6,4.4],[0,4.4],[3.6,4.4],[-3.6,7.4],[0,7.4],[3.6,7.4]]){
  box(x-.295,3.278,z-.295,x+.295,3.3,z+.295,p.bulb);
 }
 for(const [x,z] of [[-2.7,6.7],[2.7,6.7]]){
  const light=new THREE.PointLight(0xfffcf2,.2,8,2);light.position.set(x,3,z);scene.add(light);
 }
 inRightCorridor(()=>{
  box(3.0,0,10.45,3.15,3.35,22.55,p.cream,true);box(5.4,0,10.45,5.55,3.35,22.55,p.cream,true);
  box(3.15,0,22.4,5.4,3.35,22.55,p.cream,true);box(3.15,3.3,10.3,5.4,3.43,22.4,p.ceiling);
  for(const x of [3.165,5.385]){
   for(let z=10.45;z<=22.4;z+=.6)box(x-.007,.07,z-.003,x+.007,3.3,z+.003,p.seam);
   box(x-.018,0,10.45,x+.018,.09,22.4,p.trim);
  }
  for(const z of [11.5,14.5,17.5,20.5])box(3.98,3.278,z-.295,4.57,3.3,z+.295,p.bulb);
  for(const z of [13.5,19.5]){const light=new THREE.PointLight(0xfffcf2,.2,8,2);light.position.set(4.25,3,z).applyMatrix4(pose);scene.add(light)}
 });
 // Стойка у входной стены справа; её широкий фасад смотрит в глубину холла.
 box(2.25,0,3.72,5.22,1.12,5.0,p.counter,true);box(2.2,1.12,3.67,5.28,1.2,5.05,p.white);
 function triangle(points){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geo.computeVertexNormals();scene.add(new THREE.Mesh(geo,new THREE.MeshPhongMaterial({color:0xe8e4d4,side:THREE.DoubleSide})))}
 triangle([2.26,.03,5.008,5.2,.03,5.008,5.2,1.1,5.008]);
 triangle([4.1,1.105,5.009,5.2,1.105,5.009,5.2,.64,5.009]);
 rod([2.26,.03,5.015],[5.2,1.1,5.015],.006,p.iron);
 triangle([2.242,.03,3.74,2.242,.03,4.98,2.242,1.1,4.98]);
 box(4.19,1.2,4.15,4.26,1.42,4.31,p.iron);box(3.8,1.36,4.13,4.65,1.85,4.2,p.black);box(3.72,1.202,4.48,4.57,1.23,4.73,p.dark);
 mark('reception',3.735,4.36,2.97,1.28,{wall:'entry',side:'right',faceToward:'hall'});
 const paperMap=texture(384,256,(g,w,h)=>{g.fillStyle='#efeee6';g.fillRect(0,0,w,h);for(let i=0;i<10;i++){g.fillStyle=i===0?'#8e4840':'#a7aaa2';g.fillRect(14,15+i*21,w-30,2+i%2)}});
 for(let i=0;i<6;i++)panel(1.55+i*.42,1.76,3.139,.34,.45,new THREE.MeshBasicMaterial({map:paperMap}));
 box(4.84,1.53,3.13,5.3,1.87,3.22,p.white);box(4.9,1.61,3.22,5.23,1.66,3.23,p.red);
 for(const [x,z] of [[1.75,3.77],[2.05,4.21]])for(const dx of [-.18,.18])rod([x+dx,.05,z-.17],[x+dx,.58,z+.17],.012,p.white);
 pot(1.75,3.77,.72,.45,'broad',false);pot(2.05,4.21,.8,.2,'broad',false);
 collider(1.45,0,3.48,2.24,.95,4.48);
 // Две высокие стойки считывателей и опущенные штанги, без закрытого прохода.
 const turnZ=5.65;
 box(-.235,0,turnZ-.34,.235,.065,turnZ+.34,p.iron);box(-.17,.065,turnZ-.25,.17,1.07,turnZ+.25,p.counter,true);
 for(const side of [-1,1]){
  add(boxGeo,p.steel,side*.23,1.08,turnZ,.1,.35,.36,0,0,side*.66);
  for(const z of [turnZ-.12,turnZ,turnZ+.12])rod([side*.3,1.07,z],[side*.43,.18,z+.13],.016,p.steel);
  box(side*.29-.025,1.05,turnZ-.1,side*.29+.025,2.08,turnZ+.02,p.steel);
  box(side*.29-.075,1.67,turnZ-.16,side*.29+.075,2.07,turnZ-.09,p.black);
  box(side*.29-.045,1.81,turnZ-.169,side*.29+.045,1.95,turnZ-.161,p.dark);
 }
 mark('openTurnstile',0,turnZ,.9,.8,{lanes:[-.85,.85],readers:2});contact(0,turnZ,1.2,1.4);
 function rail(x1,z1,x2,z2,gate=false){
  for(const [x,z] of [[x1,z1],[x2,z2]]){add(rodGeo,p.steel,x,.025,z,.07,.05,.07);rod([x,.04,z],[x,1.05,z],.027,p.steel)}
  for(const y of [.22,.48,.74,1.04])rod([x1,y,z1],[x2,y,z2],y>1?.032:.014,p.steel);
  collider(Math.min(x1,x2)-.03,0,Math.min(z1,z2)-.03,Math.max(x1,x2)+.03,1.08,Math.max(z1,z2)+.03);
  if(gate){rod([x1,.18,z1+.055],[x2,.18,z2+.055],.02,p.steel);rod([x1,.98,z1+.055],[x2,.98,z2+.055],.02,p.steel)}
  mark('securityRail',(x1+x2)/2,(z1+z2)/2,Math.abs(x2-x1)+.06,Math.abs(z2-z1)+.06,{gate});
 }
 rail(-5.32,5.62,-1.35,5.62,true);rail(1.35,5.62,5.32,5.62);
 rail(-1.35,4.42,-1.35,5.62);rail(1.35,4.42,1.35,5.62);
 // Витрина стоит у ЛЕВОЙ БОКОВОЙ стены, а не на стене с дверями кабинетов.
 at(-5.16,7.06,-Math.PI/2,()=>{
  const width=3.05;
  box(-width/2,.08,.16,width/2,2.55,.2,p.dark,true);box(-width/2,.07,-.23,width/2,.14,.19,p.white);
  box(-width/2,2.51,-.23,width/2,2.57,.19,p.white);
  for(let col=0;col<=6;col++)box(-width/2+col*width/6-.015,.09,-.25,-width/2+col*width/6+.015,2.55,.18,p.white);
  for(let row=0;row<5;row++)box(-width/2,.23+row*.45,-.22,width/2,.245+row*.45,.18,p.white);
  for(let col=0;col<6;col++)for(let row=0;row<5;row++){
   const x=-width/2+(col+.5)*width/6,y=.32+row*.45;
   if((col+row)%7===0){
    add(rodGeo,p.gold,x,y+.11,-.01,.08,.13,.08);rod([x,y,-.01],[x,y+.07,-.01],.02,p.gold);
   }else{
    box(x-.17,y-.005,-.12,x+.17,y+.3,-.1,p.gold);
    panel(x,y+.15,-.125,.31,.275,new THREE.MeshBasicMaterial({map:paperMap}),Math.PI);
   }
  }
  panel(0,1.32,-.26,width-.04,2.35,p.glass,Math.PI);collider(-width/2,0,-.27,width/2,2.57,.2);
 });mark('certificateCabinet',-5.16,7.06,.47,3.05,{wall:'left-side',panes:6});
 // Чёрный кулер под окном слева от входа, рядом с радиатором.
 box(-4.05,0,3.54,-3.57,.97,4.03,p.black,true);box(-4.01,.54,3.52,-3.61,.8,3.54,p.dark);
 add(rodGeo,material(0x649fbd,null,{transparent:true,opacity:.72}),-3.81,1.23,3.78,.205,.49,.205);
 add(rodGeo,p.blue,-3.81,.99,3.78,.12,.09,.12);mark('waterCooler',-3.81,3.785,.48,.49,{wall:'entry',side:'left'});
 pot(-4.65,4.67,1.0);pot(-4.59,7.6,1.08);pot(-3.95,3.01,.5,.94,'broad',false);pot(3.4,3.01,.52,.94,'broad',false);
 // Стена НАПРОТИВ входа: телевизор, терминал, дверь 109, зеркало и следующая дверь.
 function officeDoor(cx,cz,width,number,ry=0){
  at(cx,cz,ry,()=>{
   box(-width/2-.15,0,-.015,width/2+.15,3.3,.075,p.counter);
   box(-width/2,0,-.08,width/2,2.43,-.015,p.iron);
   const split=number==='109'?-width*.19:0;
   for(const [a,b] of [[-width/2+.05,split-.025],[split+.025,width/2-.05]]){
    box(a,.08,-.105,b,2.35,-.079,p.doorGlass);
    for(let y=.2;y<2.28;y+=.21)box(a,y,-.116,b,y+.078,-.107,p.blindLight);
   }
   box(split-.025,.04,-.12,split+.025,2.39,-.07,p.iron);
   rod([split+.08,.98,-.145],[split+.08,1.18,-.145],.012,p.iron);rod([split+.08,1.07,-.145],[split+.19,1.07,-.145],.012,p.iron);
   label(number,0,2.55,-.125,.26,.14,'#bbaa70','#454934',Math.PI);
   const brand=label('BQFQ',width*.12,1.59,-.126,width*.56,.22,null,'#217ab3',Math.PI);brand.name='office-brand-'+number;
  });const center=new THREE.Vector3(cx,0,cz).applyMatrix4(pose);
  classroomDoors.push({number,brand:'BQFQ',x:center.x,z:center.z,width,facing:ry+Math.atan2(pose.elements[8],pose.elements[0])});
 }
 officeDoor(-1.35,10.285,1.67,'109');officeDoor(2.08,10.285,1.48,'110');
 box(-4.95,1.72,10.17,-3.35,2.62,10.24,p.black);mark('television',-4.15,10.205,1.6,.07,{wall:'opposite-entry'});
 box(-4.48,0,9.55,-4.02,1.03,10.0,p.white,true);add(boxGeo,p.white,-4.25,1.15,9.74,.69,.075,.49,-.47);
 add(boxGeo,p.black,-4.25,1.19,9.72,.58,.015,.4,-.47);
 for(let y=.15;y<.91;y+=.12){rod([-4.31,y,9.543],[-4.19,y+.09,9.543],.008,p.gold);rod([-4.19,y,9.543],[-4.31,y+.09,9.543],.008,p.gold)}
 mark('informationKiosk',-4.25,9.775,.7,.5,{wall:'opposite-entry'});
 pot(-5.02,9.48,.98);pot(-3.1,9.45,.98);
 const mirrorMap=texture(256,384,(g,w,h)=>{
  g.fillStyle='#c5cdc0';g.fillRect(0,0,w,h);g.fillStyle='#b6b099';g.fillRect(0,65,w,80);g.fillStyle='#dedbd1';g.fillRect(0,147,w,185);
  g.strokeStyle='#8c9d96';g.lineWidth=5;for(let y=235;y<360;y+=40){g.beginPath();g.moveTo(0,y);g.lineTo(w,y-12);g.stroke()}
  g.fillStyle='#4d7750';for(let i=0;i<18;i++){g.beginPath();g.ellipse(60+rand()*90,200+rand()*65,8,18,rand(),0,Math.PI*2);g.fill()}
 });
 panel(.45,1.67,10.265,1.15,1.92,new THREE.MeshBasicMaterial({map:mirrorMap}),Math.PI);
 for(const x of [-.16,1.06])box(x-.025,.67,10.22,x+.025,2.69,10.29,p.white);
 for(const y of [.69,2.67])box(-.18,y-.025,10.22,1.08,y+.025,10.29,p.white);
 mark('mirror',.45,10.26,1.22,.07,{between:['109','110'],wall:'opposite-entry'});
 // Проём и весь коридор развёрнуты на 90 градусов к правой боковой стене.
 inRightCorridor(()=>{
 for(const x of [3.15,5.4])box(x-.055,0,10.25,x+.055,3.02,10.47,p.oak);
 box(3.1,2.95,10.25,5.45,3.05,10.47,p.oak);
 mark('rightCorridorPortal',4.275,10.36,2.25,.22,{open:true,wall:'right-side',direction:'right',axis:'x'});
 officeDoor(3.166,12.4,1.4,'111',-Math.PI/2);officeDoor(5.384,12.5,1.4,'112',Math.PI/2);
 officeDoor(3.166,16.1,1.4,'113',-Math.PI/2);officeDoor(5.384,16.3,1.4,'114',Math.PI/2);
 // Большое окно в конце, рулонные жалюзи и белые подставки с горшками.
 panel(4.275,1.84,22.38,1.78,2.15,outside,Math.PI);
 for(const x of [3.36,4.275,5.19])box(x-.025,.75,22.29,x+.025,3.0,22.4,p.white);
 for(const y of [.76,2.98])box(3.33,y-.025,22.29,5.22,y+.025,22.4,p.white);
 for(let y=1.76;y<3;y+=.13){box(3.38,y,22.265,5.17,y+.073,22.28,p.blind);box(3.38,y+.075,22.265,5.17,y+.105,22.28,p.blindLight)}
 box(3.3,.72,22.12,5.25,.79,22.4,p.white);
 for(const x of [3.63,4.86]){
  for(const z of [21.68,22.06])rod([x,0,z],[x,1.1,z],.012,p.white);
  for(const y of [.35,.73,1.09])box(x-.23,y,21.65,x+.23,y+.025,22.09,p.white);
  pot(x,21.87,.55,.36,'broad',false);pot(x,21.87,.63,.75,'broad',false);pot(x,21.87,.6,1.11,'broad',false);
 }
 collider(3.35,0,21.6,5.11,1.6,22.15);
 for(const [x,z,size] of [[3.49,18.3,.84],[3.49,19.28,.91],[3.49,20.3,.85],[3.5,21.17,.77]]){pot(x,z,size,0,'strap-wall');mark('corridorPlant',x,z,.38*size,.38*size)}
 // Пожарные знаки и датчики: геометрия не перекрывает дорогу игроку.
 at(5.376,19.1,Math.PI/2,()=>{
  label('→',0,1.53,-.03,.22,.22,'#ae4140','#fff',Math.PI);label('ВЫХОД',.33,1.53,-.03,.32,.22,'#438161','#fff',Math.PI);
  box(-.3,1.42,-.055,-.16,1.58,-.02,p.red);
 });
 for(const z of [11.7,15.5,19.3])add(ballGeo,p.white,4.275,3.25,z,.055,.026,.055);
 });
 label('ВЫХОД',0,3.2,3.13,.72,.2,'#2f715b','#f1f2df');
 box(.95,1.45,3.13,1.1,1.6,3.17,p.red);
 // Блоки и листья объединены по материалам. План переводится в оси камеры один раз.
 for(const {geo,mt,list} of batches.values()){
  const mesh=new THREE.InstancedMesh(geo,mt,list.length);list.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;scene.add(mesh);
 }
 scene.scale.x=-1;
 for(const b of colliders){const left=b[0];b[0]=-b[2];b[2]=-left}
 for(const bounds of zones){const left=bounds[0];bounds[0]=-bounds[2];bounds[2]=-left}
 for(const fixture of fixtures)fixture.x=-fixture.x;
 for(const door of classroomDoors)door.x=-door.x;
 const groundAt=(x,z,feet)=>Math.abs(feet)<.21&&zones.some(([x1,z1,x2,z2])=>x>=x1&&x<=x2&&z>=z1&&z<=z2)?0:null;
 const roomAt=(x,z)=>x<=-5.4?'Корпус 1 · Правый коридор':z<3.12?'Корпус 1 · Прихожая':z<6.2?'Корпус 1 · Открытые турникеты':'Корпус 1 · Входной холл';
 scene.userData={building:1,stage:'entrance-and-right-corridor',layoutVersion:3,reference:'userPhotos-opposing-views',turnstilesOpen:true,waitingBenches:2,reception:true,certificateCabinet:true,
  hallWidth:10.8,hallDepth:7.18,corridorWidth:2.25,corridorLength:12.1,corridorAxis:'x',normalSizeFurniture:true,fixtures,classroomDoors,areas:zones};
 return {name:'Корпус 1',scene,colliders,groundAt,roomAt,areas:zones,exitDoor:{x:0,z:.05,radius:1.35},spawn:[0,1.7,1.8],yaw:Math.PI,pitch:-.025,state:null};
}
