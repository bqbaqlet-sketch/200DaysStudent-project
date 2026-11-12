// ---- Корпус 1: увеличенный холл и два коридора, план уточнён по встречным ракурсам.
function buildCollegeEntranceInterior(){
 const scene=new THREE.Scene(),colliders=[],batches=new Map(),geometryCache=new Map(),zones=[[-6,0,6,2.85],[-1.05,2.85,1.05,3.12],[-6,3.12,6,11.1],[6,7.85,18.1,10.1],[-18.1,7.85,-6,10.1]];
 const fixtures=[],classroomDoors=[],stairSurfaces=[];let pose=new THREE.Matrix4();
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
 function inRightCorridor(build){at(6,8.975,Math.PI/2,()=>at(-4.275,-10.3,0,build))}
 function inLeftCorridor(build){at(-6,8.975,-Math.PI/2,()=>at(-4.275,-10.3,0,build))}
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
  }else if(type!=='empty'){
   for(let i=0;i<12;i++){
    const a=i*2.4,top=[x+Math.cos(a)*.12*size,y+(.5+i*.045)*size,z+Math.sin(a)*.12*size];
    rod([x,y+height*.9,z],top,.008*size,p.green);add(leafGeo,p.green,...top,size,size,size,0,-a,.2);
   }
  }
  if(solid)collider(x-r,y,z-r,x+r,y+height,z+r);
  contact(x,z,.7*size,.7*size);
 }
 // Светлая прихожая стала шире и глубже, с двумя скамьями под арками.
 box(-6,-.14,0,6,0,2.85,p.floor);box(-1.05,-.14,2.85,1.05,0,3.12,p.floor);
 box(-6,-.14,3.12,6,0,11.1,p.floor);
 inRightCorridor(()=>box(3.15,-.14,10.3,5.4,0,22.4,p.corridor));
 box(-6.15,0,-.12,-6,4.52,3.12,p.oak,true);box(6,0,-.12,6.15,4.52,3.12,p.oak,true);
 box(-6,4.48,0,6,4.62,2.85,p.white);
 collider(-6,0,-.15,6,4.52,.025);
 for(const [x1,x2] of [[-6,-1.15],[1.15,6]]){
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
 for(const [x1,x2] of [[-6,-5.2],[-3.4,-1.05],[1.05,3.4],[5.2,6]]){
  box(x1,0,2.85,x2,4.48,3.12,p.cream,true);
  box(x1,.08,2.825,x2,4.46,2.85,p.oak);
 }
 for(const cx of [-4.3,4.3]){
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
 for(const x of [-5.78,-2.65,2.5,5.6]){
  const shape=new THREE.Shape();archPath(shape,2.92,3.0,4.48);const hole=new THREE.Path();archPath(hole,2.46,2.85,4.23);shape.holes.push(hole);
  const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.14,bevelEnabled:false,curveSegments:18}),p.oak);mesh.rotation.y=Math.PI/2;mesh.position.set(x,0,1.425);scene.add(mesh);
 }
 for(const x of [-5.99,5.99]){
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
 waitingBench(-5.62,Math.PI/2);waitingBench(5.62,-Math.PI/2);
 pot(-5.04,2.26,.82);pot(5.04,.52,.82);
 for(const cx of [-4.3,4.3]){
  box(cx-.35,4.42,1.07,cx+.35,4.47,1.77,p.bulb);
  for(let i=0;i<72;i++){
   const side=i%4,x=side<2?cx-1.0+rand()*2:cx+(side===2?-1:1),z=side<2?(side===0?.55:2.3):.55+rand()*1.75,drop=.2+rand()*.4;
   rod([x,4.45,z],[x,4.45-drop,z],.007,p.green);
   for(let j=0;j<3;j++)add(leafGeo,p.green,x,4.45-drop+j*.09,z,.6,.6,.6,0,i*2.4+j,.5+j*.2);
  }
 }
 // Холл раздвинут на 0.6 м по бокам и на 0.8 м в глубину; проёмы строго друг напротив друга.
 for(const side of [-1,1]){
  const x1=side<0?-6.15:6,x2=side<0?-6:6.15;
  box(x1,0,3.12,x2,3.35,7.85,p.cream,true);box(x1,0,10.1,x2,3.35,11.25,p.cream,true);
  box(x1,3.0,7.85,x2,3.35,10.1,p.cream,true);
 }
 box(-6,0,11.1,6,3.35,11.25,p.cream,true);box(-6,3.3,3.12,6,3.43,11.1,p.ceiling);
 for(const x of [-5.985,5.985]){
  for(let z=3.12;z<=11.1;z+=.6)if(z<7.8||z>10.15)box(x-.007,.07,z-.003,x+.007,3.3,z+.003,p.seam);
  for(const [z1,z2] of [[3.12,7.8],[10.15,11.1]])box(x-.018,0,z1,x+.018,.09,z2,p.trim);
 }
 for(let x=-6;x<=6;x+=.6)box(x-.003,.07,11.08,x+.003,3.3,11.1,p.seam);
 for(const x of [-4.2,0,4.2])for(const z of [4.4,7.4,10.4])box(x-.295,3.278,z-.295,x+.295,3.3,z+.295,p.bulb);
 for(const [x,z] of [[-3,6.8],[3,6.8]]){
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
 const paperMap=texture(384,256,(g,w,h)=>{g.fillStyle='#efeee6';g.fillRect(0,0,w,h);for(let i=0;i<10;i++){g.fillStyle=i===0?'#8e4840':'#a7aaa2';g.fillRect(14,15+i*21,w-30,2+i%2)}});
 // Пост охраны: открытая Г-образная перегородка, рабочий стол ниже борта и вход со стороны холла.
 const guardGray=material(0x777f80,null,{shininess:4}),guardEdge=material(0x3d4443),guardWhite=material(0xd9d6ca);
 function guardTriangle(points){
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo,new THREE.MeshPhongMaterial({color:0xe9e5d8,side:THREE.DoubleSide}));mesh.applyMatrix4(pose);scene.add(mesh);
 }
 // Длинный дубовый фасад перпендикулярен стене с окном. У окна находится короткий возврат.
 box(3.4,.025,3.45,3.48,1.155,5.9,p.white,true);
 box(3.385,.025,3.45,3.4,1.155,5.9,p.counter);
 box(3.4,.025,3.45,4.54,1.155,3.53,p.white,true);
 box(3.4,.025,3.435,4.54,1.155,3.45,p.counter);
 box(3.34,1.155,3.4,3.56,1.2,5.94,p.trim);box(3.34,1.155,3.4,4.59,1.2,3.6,p.trim);
 guardTriangle([3.377,.035,3.46,3.377,.035,5.89,3.377,.66,3.46]);
 rod([3.372,.66,3.46],[3.372,.035,5.89],.0045,p.iron);
 guardTriangle([3.405,1.15,3.427,4.53,1.15,3.427,4.53,.49,3.427]);
 for(const z of [3.45,5.9])rod([3.379,.03,z],[3.379,1.153,z],.004,p.iron);
 // Нижняя рабочая поверхность и две тумбы. В середине нет сплошного объёма.
 box(3.5,.728,3.55,4.16,.77,5.79,guardWhite,true);
 for(const z of [3.56,5.25]){
  box(3.54,.035,z,4.12,.716,z+.46,guardWhite,true);
  for(const y of [.24,.46])box(4.12,y, z+.012,4.128,y+.008,z+.448,guardEdge);
  for(const y of [.15,.37,.59])rod([4.137,y,z+.17],[4.137,y,z+.3],.008,p.iron);
 }
 const cctvMap=texture(576,384,(g,w,h)=>{
  g.fillStyle='#171d1d';g.fillRect(0,0,w,h);
  const colors=['#797d70','#8a8069','#6b777b','#a49c87','#747962','#716b60','#a0a59b','#8b8b81','#68716a'];
  for(let i=0;i<9;i++){
   const x=(i%3)*192+3,y=Math.floor(i/3)*128+3;
   g.fillStyle=colors[i];g.fillRect(x,y,186,122);g.fillStyle='#353d39';g.fillRect(x+9,y+22,37,72);g.fillRect(x+126,y+13,27,90);
   g.strokeStyle='#d9d5c375';g.lineWidth=2;g.beginPath();g.moveTo(x+51,y+122);g.lineTo(x+75,y+65);g.lineTo(x+112,y+65);g.lineTo(x+145,y+122);g.stroke();
   g.fillStyle='#e3e7d4';g.font='10px monospace';g.fillText('CAM '+String(i+1).padStart(2,'0'),x+5,y+12);
  }
 });
 const monitorScreen=new THREE.MeshBasicMaterial({map:cctvMap});
 for(const z of [3.99,4.63]){
  at(3.83,z,-Math.PI/2,()=>{
   box(-.13,.771,-.08,.13,.789,.12,p.black);box(-.022,.789,-.018,.022,.925,.024,p.iron);
   box(-.295,.878,-.033,.295,1.225,.025,p.black);panel(0,1.052,-.036,.55,.31,monitorScreen,Math.PI);
  });
  box(3.98,.772,z-.21,4.125,.79,z+.21,p.black);
  mark('guardMonitor',3.83,z,.11,.59,{inside:true,feeds:9});
 }
 function guardChair(x,z){
  at(x,z,-Math.PI/2,()=>{
   box(-.224,.43,-.22,.224,.492,.22,guardGray);box(-.218,.52,-.283,.218,.96,-.228,guardGray);
   for(const a of [-.195,.195]){
    rod([a,.025,-.19],[a,.45,-.19],.013,p.steel);rod([a,.025,.18],[a,.45,.18],.013,p.steel);
    rod([a,.45,-.215],[a,.93,-.26],.012,p.steel);
   }
   rod([-.2,.2,-.19],[.2,.2,-.19],.011,p.steel);collider(-.24,0,-.3,.24,.98,.235);
  });mark('guardChair',x,z,.535,.48,{inside:true,seatHeight:.43});
 }
 guardChair(4.61,4.08);guardChair(4.61,5.05);
 // Бутылка и бумаги лежат на рабочем столе, а не на верхнем бортике.
 const clearBottle=material(0xb9d7d7,null,{transparent:true,opacity:.44,shininess:90});
 add(rodGeo,clearBottle,3.91,.922,5.48,.057,.28,.057);add(rodGeo,p.blue,3.91,1.073,5.48,.025,.024,.025);
 box(3.62,.772,3.59,3.93,.777,3.87,p.white);box(3.65,.778,3.61,3.95,.782,3.87,p.white);
 mark('reception',4.0,4.67,1.2,2.5,{wall:'entry',side:'right',shape:'L',hollow:true,openSide:'hall',faceToward:'turnstile'});
 mark('guardWorktop',3.83,4.67,.66,2.24,{height:.77});
 // Объявления находятся на боковой стене рядом с окном, как на снимках изнутри поста.
 for(let i=0;i<6;i++)panel(5.978,1.72,3.75+i*.29,.24,.39,new THREE.MeshBasicMaterial({map:paperMap}),-Math.PI/2);
 box(5.87,1.54,3.28,5.96,1.86,3.63,p.white);box(5.86,1.63,3.31,5.87,1.69,3.53,p.red);
 panel(5.977,1.2,3.65,.41,.29,new THREE.MeshBasicMaterial({map:paperMap}),-Math.PI/2);
 // Компактная белая подставка с тремя горшками у наружного угла поста.
 for(const [x,z] of [[2.46,3.71],[2.46,4.18]]){
  rod([x,.035,z],[x,.78,z],.011,p.white);add(ballGeo,p.iron,x,.035,z,.025,.025,.025);
 }
 for(const [x,z,y,size] of [[2.66,3.92,.8,.66],[2.37,3.84,.49,.63],[2.68,4.12,.19,.7]]){
  add(rodGeo,p.white,x,y-.015,z,.15,.025,.15);pot(x,z,size,y,'broad',false);
  rod([2.46,.07,z],[x,y-.02,z],.011,p.white);
 }
 collider(2.2,0,3.56,2.93,1.12,4.35);mark('guardPlantStand',2.565,3.955,.73,.79,{pots:3});

 // Две высокие стойки считывателей и опущенные штанги, без закрытого прохода.
 const turnZ=5.65;
 box(-.235,0,turnZ-.34,.235,.065,turnZ+.34,p.iron);box(-.17,.065,turnZ-.25,.17,1.07,turnZ+.25,p.counter,true);
 for(const side of [-1,1]){
  add(boxGeo,p.steel,side*.23,1.08,turnZ,.1,.35,.36,0,0,side*.66);
  for(const z of [turnZ-.12,turnZ,turnZ+.12])rod([side*.3,1.07,z],[side*.43,.18,z+.13],.016,p.steel);
  box(side*.29-.025,1.05,turnZ-.1,side*.29+.025,1.96,turnZ+.02,p.steel);
  box(side*.29-.075,1.55,turnZ-.16,side*.29+.075,1.95,turnZ-.09,p.black);
  box(side*.29-.045,1.69,turnZ-.169,side*.29+.045,1.83,turnZ-.161,p.dark);
 }
 mark('openTurnstile',0,turnZ,.9,.8,{lanes:[-.85,.85],readers:2});contact(0,turnZ,1.2,1.4);
 function rail(x1,z1,x2,z2,gate=false){
  for(const [x,z] of [[x1,z1],[x2,z2]]){add(rodGeo,p.steel,x,.025,z,.07,.05,.07);rod([x,.04,z],[x,1.05,z],.027,p.steel)}
  for(const y of [.22,.48,.74,1.04])rod([x1,y,z1],[x2,y,z2],y>1?.032:.014,p.steel);
  collider(Math.min(x1,x2)-.03,0,Math.min(z1,z2)-.03,Math.max(x1,x2)+.03,1.08,Math.max(z1,z2)+.03);
  if(gate){for(const y of [.31,.82])add(rodGeo,p.steel,x1,y,z1,.039,.075,.039);box(x2-.08,.87,z2-.027,x2-.015,.93,z2+.027,p.steel)}
  mark('securityRail',(x1+x2)/2,(z1+z2)/2,Math.abs(x2-x1)+.06,Math.abs(z2-z1)+.06,{gate});
 }
 // Только короткие секции около турникета. До кулера и витрины остаётся свободный обход.
 rail(-2.75,5.62,-1.35,5.62,true);rail(-1.35,4.42,-1.35,5.62);
 rail(1.35,5.62,3.4,5.62);
 // Витрина стоит у ЛЕВОЙ БОКОВОЙ стены, а не на стене с дверями кабинетов.
 at(-5.76,6.1,-Math.PI/2,()=>{
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
 });mark('certificateCabinet',-5.76,6.1,.47,3.05,{wall:'left-side',panes:6});
 at(-.6,0,0,()=>{
 // Кулер сохраняет место под окном. Краны, ниша и поддон обращены в холл.
 box(-4.05,0,3.54,-3.57,.97,4.03,p.black,true);
 box(-4.01,.51,4.031,-3.61,.875,4.04,guardEdge);box(-3.99,.55,4.042,-3.63,.84,4.046,p.dark);
 for(const [x,mt] of [[-3.91,p.red],[-3.72,p.blue]]){
  rod([x,.79,4.04],[x,.79,4.105],.016,p.white);box(x-.016,.805,4.085,x+.016,.84,4.11,mt);
 }
 box(-4.01,.49,4.02,-3.61,.516,4.16,p.black);
 for(let x=-3.98;x<-3.62;x+=.045)rod([x,.519,4.04],[x,.519,4.14],.004,p.steel);
 const waterBottle=material(0x77adc8,null,{transparent:true,opacity:.55,shininess:95});
 add(new THREE.CylinderGeometry(.2,.155,.08,20),waterBottle,-3.81,1.025,3.78,1,1,1);
 add(rodGeo,waterBottle,-3.81,1.235,3.78,.2,.34,.2);
 add(new THREE.CylinderGeometry(.095,.2,.08,20),waterBottle,-3.81,1.445,3.78,1,1,1);
 for(const y of [1.09,1.16,1.31,1.38])add(rodGeo,waterBottle,-3.81,y,3.78,.207,.014,.207);
 add(rodGeo,p.blue,-3.81,1.495,3.78,.095,.026,.095);add(rodGeo,p.blue,-3.81,.984,3.78,.12,.065,.12);
 mark('waterCooler',-3.81,3.785,.48,.49,{wall:'entry',side:'left',taps:2,faces:'hall'});
 });
 pot(-5.25,4.67,1.0);pot(-5.25,6.8,1.08);pot(-4.55,3.14,.5,.94,'broad',false);pot(3.92,3.14,.52,.94,'broad',false);pot(4.56,3.14,.52,.94,'broad',false);
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
 at(0,.8,0,()=>{officeDoor(-1.35,10.285,1.67,'109');officeDoor(2.08,10.285,1.48,'110')});
 at(-.6,.8,0,()=>{
 box(-4.95,1.72,10.17,-3.35,2.62,10.24,p.black);mark('television',-4.15,10.205,1.6,.07,{wall:'opposite-entry'});
 box(-4.48,0,9.55,-4.02,1.03,10.0,p.white,true);add(boxGeo,p.white,-4.25,1.15,9.74,.69,.075,.49,-.47);
 add(boxGeo,p.black,-4.25,1.19,9.72,.58,.015,.4,-.47);
 for(let y=.15;y<.91;y+=.12){rod([-4.31,y,9.543],[-4.19,y+.09,9.543],.008,p.gold);rod([-4.19,y,9.543],[-4.31,y+.09,9.543],.008,p.gold)}
 mark('informationKiosk',-4.25,9.775,.7,.5,{wall:'opposite-entry'});
 pot(-5.02,9.48,.98);pot(-3.1,9.45,.98);
 });
 at(0,.8,0,()=>{
 const mirrorMap=texture(256,384,(g,w,h)=>{
  g.fillStyle='#c5cdc0';g.fillRect(0,0,w,h);g.fillStyle='#b6b099';g.fillRect(0,65,w,80);g.fillStyle='#dedbd1';g.fillRect(0,147,w,185);
  g.strokeStyle='#8c9d96';g.lineWidth=5;for(let y=235;y<360;y+=40){g.beginPath();g.moveTo(0,y);g.lineTo(w,y-12);g.stroke()}
  g.fillStyle='#4d7750';for(let i=0;i<18;i++){g.beginPath();g.ellipse(60+rand()*90,200+rand()*65,8,18,rand(),0,Math.PI*2);g.fill()}
 });
 panel(.45,1.67,10.265,1.15,1.92,new THREE.MeshBasicMaterial({map:mirrorMap}),Math.PI);
 for(const x of [-.16,1.06])box(x-.025,.67,10.22,x+.025,2.69,10.29,p.white);
 for(const y of [.69,2.67])box(-.18,y-.025,10.22,1.08,y+.025,10.29,p.white);
 mark('mirror',.45,10.26,1.22,.07,{between:['109','110'],wall:'opposite-entry'});
 });
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
 // Левое крыло стоит напротив правого: общая ось проёмов Z=8.975.
 inLeftCorridor(()=>{
  box(3.15,-.14,10.3,5.4,0,22.4,p.corridor);
  box(3.0,0,10.45,3.15,3.35,19.78,p.cream,true);box(3.0,0,21.42,3.15,3.35,22.55,p.cream,true);
  box(3.0,2.6,19.78,3.15,3.35,21.42,p.cream,true);box(5.4,0,10.45,5.55,3.35,22.55,p.cream,true);
  box(3.15,0,22.4,5.4,3.35,22.55,p.cream,true);box(3.15,3.3,10.3,5.4,3.43,22.4,p.ceiling);
  for(const x of [3.165,5.385]){
   for(let z=10.45;z<=22.4;z+=.6)if(x>4||z<19.73||z>21.47)box(x-.007,.07,z-.003,x+.007,3.3,z+.003,p.seam);
   for(const [z1,z2] of x>4?[[10.45,22.4]]:[[10.45,19.73],[21.47,22.4]])box(x-.018,0,z1,x+.018,.09,z2,p.trim);
  }
  for(const z of [11.5,14.5,17.5,20.5])box(3.98,3.278,z-.295,4.57,3.3,z+.295,p.bulb);
  for(const z of [13.5,19.5]){const light=new THREE.PointLight(0xfffcf2,.18,8,2);light.position.set(4.25,3,z).applyMatrix4(pose);scene.add(light)}
  for(const x of [3.15,5.4])box(x-.055,0,10.25,x+.055,3.02,10.47,p.oak);
  box(3.1,2.95,10.25,5.45,3.05,10.47,p.oak);
  mark('leftCorridorPortal',4.275,10.36,2.25,.22,{open:true,wall:'left-side',direction:'left',axis:'x'});
  // На фотографиях в ближней паре 106 и 107, дальше справа ещё один кабинет.
  officeDoor(3.166,12.4,1.4,'106',-Math.PI/2);officeDoor(5.384,12.5,1.4,'107',Math.PI/2);
  officeDoor(5.384,17.3,1.4,'108',Math.PI/2);
  // Вместо временной двери — настоящий проём в лестничный холл.
  for(const z of [19.78,21.42])box(2.98,0,z-.035,3.18,2.63,z+.035,p.oak);
  box(2.98,2.56,19.745,3.18,2.64,21.455,p.oak);
  mark('stairHallPortal',3.075,20.6,.2,1.64,{open:true,replaces:'leftServiceDoor'});
  // Окно с жалюзи, чёрный ступенчатый стеллаж и белые горшки, как на крупном плане.
  panel(4.275,1.84,22.38,1.78,2.15,outside,Math.PI);
  for(const x of [3.36,4.275,5.19])box(x-.025,.75,22.29,x+.025,3.0,22.4,p.white);
  for(const y of [.76,2.98])box(3.33,y-.025,22.29,5.22,y+.025,22.4,p.white);
  for(let y=1.76;y<3;y+=.13){box(3.38,y,22.265,5.17,y+.073,22.28,p.blind);box(3.38,y+.075,22.265,5.17,y+.105,22.28,p.blindLight)}
  box(3.3,.72,22.12,5.25,.79,22.4,p.white);
  box(3.57,.025,21.46,5.04,.055,22.15,p.counter);
  for(const x of [3.67,4.275,4.9]){
   for(const z of [21.78,22.09])rod([x,0,z],[x,1.46,z],.012,p.iron);
   for(let row=0;row<3;row++){
    const y=.28+row*.47+(x===4.275?.1:0);
    box(x-.205,y,21.7,x+.205,y+.035,22.12,p.counter);
    pot(x,21.91,.53+(row%2)*.05,y+.036,'broad',false);
   }
  }
  pot(3.96,21.57,.5,.055,'broad',false);pot(4.5,21.57,.5,.055,'broad',false);
  collider(3.57,0,21.46,5.04,1.8,22.15);mark('leftPlantDisplay',4.305,21.805,1.47,.69,{shelves:9,pots:11});
  // Высокий фикус слева. Листья соединены с ветвями, крона помещается перед стеной.
  pot(3.39,21.8,.85,0,'empty');
  rod([3.39,.28,21.8],[3.41,1.62,21.8],.018,p.frame);
  for(let i=0;i<18;i++){
   const a=i*2.4,top=[3.39+Math.cos(a)*.065,.72+i*.06,21.8+Math.sin(a)*.13];
   rod([3.4,top[1]-.14,21.8],top,.006,p.frame);
   for(let j=0;j<3;j++)add(leafGeo,p.green,...top,.44,.44,.44,0,a+j*.7,.2);
  }
  // Пальма и два прямоугольных кашпо с длинными листьями у правой стены.
  pot(4.83,21.36,.92,0,'empty');rod([4.83,.28,21.36],[4.83,2.02,21.36],.02,p.frame);
  for(let j=0;j<16;j++)add(strapGeo,p.green,4.83,1.88+(j%3)*.08,21.36,.85,1.5,.85,0,j*Math.PI/8,.2+(j%3)*.16);
  const bladeGeo=new THREE.BufferGeometry(),vertices=[],indices=[];
  for(let row=0;row<=9;row++){
   const t=row/9,width=Math.sin(Math.PI*t)*.045;
   for(const side of [-1,0,1])vertices.push(Math.sin(t*Math.PI/2)*.09,t,side*width);
  }
  for(let row=0;row<9;row++)for(let side=0;side<2;side++){const n=row*3+side;indices.push(n,n+3,n+1,n+1,n+3,n+4)}
  bladeGeo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));bladeGeo.setIndex(indices);bladeGeo.computeVertexNormals();
  for(const z of [19.95,20.78]){
   box(4.9,.03,z-.3,5.26,.48,z+.3,p.white,true);box(4.925,.48,z-.275,5.235,.49,z+.275,p.soil);
   for(let i=0;i<10;i++)add(bladeGeo,p.green,5.08+(i%2?-.055:.055),.49,z-.23+(i/10)*.46,1,.7+(i%4)*.12,1,0,i*2.4);
   mark('leftRectangularPlanter',5.08,z,.36,.6);
  }
  at(3.177,18.4,-Math.PI/2,()=>{
   label('→',0,1.53,-.03,.22,.22,'#ae4140','#fff',Math.PI);box(-.32,1.41,-.055,-.18,1.57,-.02,p.red);
  });
  for(const z of [11.7,15.5,19.3])add(ballGeo,p.white,4.275,3.25,z,.055,.026,.055);
 });

 // Лестничный холл за отмеченным проёмом левого крыла. Вход из коридора: (16.3, 7.85).
 const stairInfo={entry:{x:16.3,z:7.85},origin:{x:13.9,z:7.85},rise:.17,tread:.285,stepsPerFlight:11,
  halfFloor:1.87,upperFloor:3.74,stairStart:2,stairEnd:5.135,width:8.8,depth:8,stairsSide:'right',stairAxis:'x',flightTurnDegrees:90,wallShift:2,wallClearance:.01,flightWidth:1.85,upperRoute:'forward-then-right',upperRun:4.2,forwardCorridor:true,lowerInteriorDeferred:true,upperInteriorDeferred:false,upperLeftDeferred:false,continuationDeferred:false};
 const graniteMap=texture(512,512,(g,w,h)=>{
  g.fillStyle='#737a7a';g.fillRect(0,0,w,h);
  for(let i=0;i<39000;i++){
   const c=i%4;g.fillStyle=c===0?'#e6e8e3b8':c===1?'#303b3b9a':c===2?'#b1b7b2b0':'#89918c99';
   g.fillRect(rand()*w,rand()*h,.5+rand()*1.5,.5+rand()*1.7);
  }
  g.strokeStyle='#555f5d';g.lineWidth=1.3;g.strokeRect(0,0,w,h);
 },1.2);
 const granite=material(0xffffff,graniteMap,{shininess:90,specular:0x9aabab});
 const stairWhite=new THREE.MeshPhongMaterial({color:0xe7e5dc,side:THREE.DoubleSide,shininess:15});
 const stairBounds={x1:13.9,x2:22.7,z1:-.15,z2:7.85};
 const continuationBounds={x1:14.55,x2:44.6,z1:-4.25,z2:-1.75};
 const continuationEntryBounds={x1:15.42,x2:17.18,z1:-1.75,z2:-.15};
 function stairSurface(x1,z1,x2,z2,y){
  const bounds=new THREE.Box3(new THREE.Vector3(x1,y,z1),new THREE.Vector3(x2,y,z2)).applyMatrix4(pose);
  stairSurfaces.push([bounds.min.x,bounds.min.z,bounds.max.x,bounds.max.z,bounds.min.y]);
 }
 function stairFloor(x1,z1,x2,z2,y,mt=granite){box(x1,y-.14,z1,x2,y,z2,mt);stairSurface(x1,z1,x2,z2,y)}
 function stairQuad(points,mt){
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geo.setIndex([0,1,2,0,2,3]);const uv=[],flatX=Math.abs(points[0]-points[3])<1e-6&&Math.abs(points[0]-points[6])<1e-6;
  for(let i=0;i<12;i+=3)uv.push((flatX?points[i+2]:points[i])/(mt.map?.userData?.tileMeters||1), (flatX?points[i+1]:points[i+2])/(mt.map?.userData?.tileMeters||1));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo,mt);mesh.applyMatrix4(pose);scene.add(mesh);return mesh;
 }
 function stairRail(a,b,flight=false){
  const intervals=flight?11:Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/.85));
  for(let i=0;i<=intervals;i++){
   if(flight&&i%3&&i!==11)continue;
   const t=i/intervals,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,z=a[2]+(b[2]-a[2])*t;
   add(rodGeo,p.steel,x,y+.021,z,.067,.042,.067);rod([x,y+.03,z],[x,y+1.04,z],.025,p.steel);
  }
  for(const y of [.27,.52,.77,1.04])rod([a[0],a[1]+y,a[2]],[b[0],b[1]+y,b[2]],y>1?.033:.013,p.steel);
  collider(Math.min(a[0],b[0])-.026,Math.min(a[1],b[1]),Math.min(a[2],b[2])-.026,
   Math.max(a[0],b[0])+.026,Math.max(a[1],b[1])+1.07,Math.max(a[2],b[2])+.026);
 }
 function stairFlight(x1,x2,baseY,returning=false,descending=false,run=3.135){
  const tread=run/11;
  for(let i=0;i<11;i++){
   const za=returning?2+run-(i+1)*tread:2+i*tread,zb=za+tread,y=baseY+(descending?-1:1)*(i+1)*.17;
   box(x1,y-.17,za,x2,y,zb,granite);stairSurface(x1,za,x2,zb,y);
   const nose=returning?zb:za;box(x1,y+.001,nose-.008,x2,y+.012,nose+.008,p.steel);
  }
  const y0=baseY-.2,y1=baseY+(descending?-1:1)*1.87-.2,za=returning?2+run:2,zb=returning?2:2+run;
  stairQuad([x1,y0,za,x2,y0,za,x2,y1,zb,x1,y1,zb],stairWhite);
  for(const x of [x1,x2]){
   stairQuad([x,baseY-.16,za,x,baseY-.39,za,x,baseY+(descending?-1:1)*1.87-.39,zb,x,baseY+(descending?-1:1)*1.87-.16,zb],stairWhite);
   rod([x,baseY-.39,za],[x,baseY+(descending?-1:1)*1.87-.39,zb],.006,p.iron);
  }
 }
 at(-13.9,7.85,Math.PI,()=>{
  // Коридор не сдвигается. Справа открыт доступ к поперечным маршам.
  stairFloor(0,0,8.8,3.65,0);stairFloor(0,3.65,3.4,8,0);
  mark('collegeStairHall',4.4,4,8.8,8,{floors:[0,3.74],stairsSide:'right',stairAxis:'x',openForward:true});
  // Стены увеличенного объёма. На дальней стене открыт проход продолжения, а не дверь выхода.
  box(-.15,-2.1,-.15,0,7.15,8.15,p.oak,true);box(8.8,-2.1,-.15,8.95,7.15,8.15,p.cream,true);
  box(0,-2.1,8,1.52,3.74,8.15,p.cream,true);box(3.28,-2.1,8,8.8,3.74,8.15,p.cream,true);
  box(1.52,2.65,8,3.28,3.74,8.15,p.cream,true);
  box(0,-2.1,-.15,1.58,3.74,0,p.cream,true);box(3.22,-2.1,-.15,8.8,3.74,0,p.cream,true);
  box(1.58,2.6,-.15,3.22,3.74,0,p.cream,true);
  for(const [v1,v2] of [[-.15,0],[8,8.15]]){
   box(0,3.74,v1,.35,7.15,v2,p.cream,true);box(2.15,3.74,v1,8.8,7.15,v2,p.cream,true);
   box(.35,6.44,v1,2.15,7.15,v2,p.cream,true);
  }
  box(0,7.15,0,8.8,7.28,8,p.white);
  for(const v of [0,2,4,6,7.95])box(8.73,0,v-.045,8.797,7.14,v+.045,p.oak);
  for(let v=0;v<8;v+=1.6){
   const end=Math.min(v+1.6,8),h1=1+v*.43,h2=1+end*.43;
   stairQuad([8.78,0,v,8.78,0,end,8.78,h2,end,8.78,h1,v],new THREE.MeshPhongMaterial({map:oakMap,side:THREE.DoubleSide,color:0xc2a586}));
  }
  for(const [x1,x2] of [[0,1.52],[3.28,8.8]])box(x1,-2.05,7.96,x2,3.1,8,p.oak);
  for(const x of [.08,1.5,3.3,5.1,6.8,8.7]){
   box(x-.04,0,7.935,x+.04,x===1.5?3.74:7.14,7.97,p.oak);
   if(x===1.5)box(x-.04,6.44,7.935,x+.04,7.14,7.97,p.oak);
  }
  for(const x of [.015,8.785]){
   box(x-.012,0,0,x+.012,.09,7.95,granite);
   for(let v=.8;v<7.95;v+=.8)rod([x,.12,v],[x,7.1,v],.0025,p.seam);
  }
  // С промежуточной площадки — прямо к стене, затем вправо на верхнюю площадку.
  // Нижний марш и спуск сохраняют принятую привязку к деревянной стене.
  at(1.4,11.5,Math.PI/2,()=>{
   stairFloor(3.55,5.135,5.4,7.25,1.87);
   stairFloor(5.65,5.135,7.5,7.25,-1.87);
   stairFlight(3.55,5.4,0);stairFlight(5.65,7.5,0,false,true);
   stairRail([5.44,0,2],[5.44,1.87,5.135],true);
   stairRail([3.64,0,2],[3.64,1.87,5.135],true);
   stairRail([5.61,0,2],[5.61,-1.87,5.135],true);
   stairRail([7.64,0,2],[7.64,0,7.2]);
   stairRail([7.53,-1.87,5.135],[7.53,-1.87,7.2]);
   for(const v of [2.5,3.55,4.6]){
    const y=(v-2)/3.135*1.87-.22;rod([3.56,y,v],[5.39,y,v],.003,p.seam);
   }
  });
  // Второй марш идёт вперёд от места на снимке; ступени шириной 1.85 м.
  at(0,-.1,0,()=>stairFlight(6.8,8.65,1.87,true,false,4.2));
  stairRail([6.76,1.87,6.1],[6.76,3.74,1.9],true);
  stairRail([8.56,1.87,6.1],[8.56,3.74,1.9],true);
  // Площадка касается передней стены. Вправо при подъёме — в сторону убывания U.
  stairFloor(2.15,0,8.65,1.9,3.74);
  stairRail([8.56,3.74,.09],[8.56,3.74,1.9]);
  stairRail([2.2,3.74,.09],[8.56,3.74,.09]);
  stairRail([2.2,3.74,1.94],[6.76,3.74,1.94]);
  for(const [x,v,base] of [[8.4,7.6,1.87],[8.35,.38,3.74]]){
   add(new THREE.CylinderGeometry(.16,.13,.48,14),p.white,x,base+.24,v,1,1,1);
   for(let i=0;i<9;i++){
    const a=i*2.4,top=[x+Math.cos(a)*.08,base+.59+i*.035,v+Math.sin(a)*.08];
    rod([x,base+.48,v],top,.006,p.green);add(leafGeo,p.green,...top,.7,.7,.7,0,a,.3);
   }
   collider(x-.16,base,v-.16,x+.16,base+.9,v+.16);
  }
  // Аварийная дверь — на отмеченной передней стене, рядом с входом из коридора.
  at(4.6,.035,0,()=>{
   box(-.59,0,-.015,.59,2.39,.055,p.trim);box(-.53,.035,.056,.53,2.32,.082,guardWhite);
   rod([-.37,.96,.095],[-.37,1.16,.095],.011,p.iron);
   label('ВЫХОД',0,2.55,.085,.66,.19,'#4c8398','#ffffff');
  });
  mark('stairEmergencyExit',4.6,.035,1.18,.12,{level:0,wall:'entry-wall',nearCorridorEntry:true});
  add(rodGeo,p.red,5.5,1.2,.16,.082,.41,.082);rod([5.5,1.4,.16],[5.58,1.51,.16],.015,p.iron);
  label('1',5.73,1.52,.17,.14,.19,'#b73735','#fff');
  label('←',3.75,1.0,.17,.22,.15,'#4f805b','#fff');
  mark('stairUpFlight',4.9675,7.025,3.135,1.85,{axis:'x',ascendingToward:'right-wall',footX:3.4,topX:6.535});
  mark('stairDownFlight',4.9675,4.925,3.135,1.85,{axis:'x',unlabelled:true});
  mark('stairUpperFlight',7.725,4,1.85,4.2,{axis:'z',ascendingToward:'entry-wall',baseY:1.87,topY:3.74,turnAtTop:'right'});
  mark('stairUpperTurn',5.4,.95,6.5,1.9,{level:3.74,turn:'right',wall:'entry-wall'});

  // Окна расположены дальше вдоль левой стены: аварийный выход перед ними.
  for(const base of [0]){
   panel(.025,base+1.91,5.65,1.7,2.12,outside,Math.PI/2);
   for(const v of [4.77,6.53])box(0,base+.82,v-.025,.07,base+3.01,v+.025,p.frame);
   for(const y of [.84,2.99])box(0,base+y-.025,4.74,.07,base+y+.025,6.56,p.frame);
   for(let y=1.57;y<3;y+=.13){box(.08,base+y,4.8,.095,base+y+.073,6.5,p.blind);box(.082,base+y+.075,4.8,.094,base+y+.104,6.5,p.blindLight)}
   box(0,base+.82,4.69,.4,base+.89,6.61,p.counter);
   box(.04,base+.13,4.84,.22,base+.73,6.46,p.white);
   for(let v=4.89;v<6.46;v+=.1)box(.205,base+.17,v,.25,base+.69,v+.035,p.trim);
   rod([.15,base+.18,6.5],[.15,base+.05,6.5],.013,p.white);
   pot(.23,5.21,.5,base+.89,'broad',false);pot(.23,6.10,.5,base+.89,'broad',false);
  }
  for(const [x,v,y,size] of [[.32,4.43,.52,.65],[.43,4.69,.18,.7],[.47,4.26,.86,.6]]){
   rod([.3,.03,v],[x,y,v],.012,p.white);add(rodGeo,p.white,x,y-.015,v,.14,.025,.14);pot(x,v,size,y,'broad',false);
  }
  collider(.12,0,4.07,.65,1.15,4.9);
  // Внизу остаются только спуск и площадка без надписей и дверей.
  box(.28,.015,.38,.54,.48,.68,guardWhite,true);box(.26,.48,.36,.56,.53,.7,p.trim);box(.33,.525,.41,.49,.532,.57,p.dark);
  for(const [x,y,v] of [[2.4,7.115,.8],[3.3,7.115,3.1],[3.3,7.115,6.6],[1.1,3.1,6.4]])add(rodGeo,p.bulb,x,y,v,.14,.02,.14);
  const lamp=new THREE.PointLight(0xfff5df,.28,12,2);lamp.position.set(3.2,4.2,4).applyMatrix4(pose);scene.add(lamp);
  // Продолжение первого этажа по новым фотографиям: окно слева от прохода,
  // ниша напротив него, длинный коридор вправо, закрытый выход в торце.
  for(const x of [1.52,3.28])box(x-.035,0,7.94,x+.035,2.69,8.18,p.oak);
  box(1.485,2.62,7.94,3.315,2.7,8.18,p.oak);
  stairFloor(1.52,8,3.28,9.6,0,p.corridor);
  box(1.37,0,8.15,1.52,3.3,9.6,p.oak,true);box(3.28,0,8.15,3.43,3.3,9.6,p.oak,true);
  box(1.52,2.68,8.15,3.28,2.8,9.6,p.oak);
  stairFloor(.65,9.6,29.8,12.1,0,p.corridor);
  stairFloor(29.8,9.6,30.7,12.1,.12,p.corridor);
  box(.5,0,9.45,.65,3.35,12.25,p.cream,true);
  box(.65,0,9.45,1.52,3.35,9.6,p.cream,true);
  box(3.28,0,9.45,30.85,3.35,9.6,p.cream,true);
  box(1.52,2.68,9.45,3.28,3.35,9.6,p.cream,true);
  box(30.7,0,9.6,30.85,3.35,12.25,p.cream,true);
  // Правая деревянная ниша утоплена в стену, а не стоит поперёк прохода.
  box(.65,0,12.1,1.85,3.35,12.25,p.cream,true);
  box(5.75,0,12.1,30.7,3.35,12.25,p.cream,true);
  box(1.85,0,12.1,5.75,.67,12.55,p.cream,true);
  box(1.85,2.7,12.1,5.75,3.35,12.55,p.cream,true);
  box(1.85,.67,12.52,5.75,2.7,12.59,p.oak,true);
  for(const u of [1.85,5.75])box(u-.025,.66,12.075,u+.025,2.72,12.56,p.iron);
  box(1.825,.66,11.88,5.775,.73,12.56,p.counter,true);
  box(1.825,2.69,12.075,5.775,2.73,12.56,p.iron);
  for(const [u,size] of [[2.18,.64],[2.94,.72],[3.8,.62],[4.62,.69],[5.37,.6]])pot(u,12.23,size,.73,'broad',false);
  mark('continuationPlantNiche',3.8,12.23,3.9,.66,{pots:5,recessed:true});
  box(.65,3.3,9.6,30.7,3.43,12.1,p.ceiling);
  for(const v of [9.615,12.085]){
   for(let u=.65;u<30.7;u+=.8){
    if(v<10&&u>1.48&&u<3.32)continue;
    if(v>12&&u>1.82&&u<5.78){box(u-.003,0,v-.006,u+.003,.66,v+.006,p.seam);continue}
    box(u-.003,.07,v-.006,u+.003,3.3,v+.006,p.seam);
   }
   for(const [a,b] of v<10?[[.65,1.48],[3.32,30.7]]:[[.65,30.7]]){
    box(a,0,v-.012,b,.08,v+.012,p.trim);
    box(a,.55,v-.006,b,.557,v+.006,p.seam);
   }
  }
  for(const u of [2.5,5.9,9.3,12.7,16.1,19.5,22.9,26.3,29.2]){
   box(u-.295,3.276,10.555,u+.295,3.3,11.145,p.bulb);
   if(u===5.9||u===16.1||u===26.3){const light=new THREE.PointLight(0xfffcf2,.16,10,2);light.position.set(u,3,10.85).applyMatrix4(pose);scene.add(light)}
  }
  for(const u of [4.7,15.3,25.8])add(ballGeo,p.white,u,3.255,10.85,.055,.026,.055);
  // Окно в коротком конце, рулонные жалюзи день-ночь и батарея под ним.
  panel(.667,1.91,10.85,2.08,2.17,outside,Math.PI/2);
  for(const v of [9.78,10.85,11.92])box(.66,.79,v-.026,.74,3.02,v+.026,p.frame);
  for(const y of [.81,3.0])box(.66,y-.025,9.75,.74,y+.025,11.95,p.frame);
  for(let y=1.59;y<3;y+=.13){box(.75,y,9.8,.765,y+.073,11.9,p.blind);box(.752,y+.075,9.8,.767,y+.104,11.9,p.blindLight)}
  box(.65,.77,9.72,1.04,.84,11.98,p.counter);
  box(.7,.13,9.96,.88,.71,11.74,p.white,true);
  for(let v=10;v<11.73;v+=.1)box(.875,.17,v,.915,.68,v+.035,p.trim);
  mark('continuationWindow',.72,10.85,.14,2.2,{blinds:'day-night'});
  // Высокий чёрный стеллаж у ниши и округлая белая подставка перед окном.
  for(const u of [1.04,1.68])for(const v of [11.27,11.86])rod([u,0,v],[u,1.92,v],.013,p.iron);
  for(let row=0;row<4;row++){
   const y=.06+row*.53;
   box(1.0,y,11.23,1.72,y+.035,11.9,p.counter);
   pot(1.34,11.56,.59+(row%2)*.06,y+.035,'broad',false);
  }
  collider(.98,0,11.21,1.74,2.25,11.92);
  for(const v of [10.2,10.83]){
   rod([1.09,.035,v],[1.17,.91,v],.012,p.white);
   add(ballGeo,p.iron,1.09,.035,v,.026,.026,.026);
  }
  for(const [u,v,y] of [[1.07,10.49,.96],[1.38,10.29,.59],[1.35,10.77,.2]]){
   add(rodGeo,p.white,u,y-.015,v,.15,.025,.15);pot(u,v,.67,y,'broad',false);
   rod([1.11,.04,v],[u,y-.02,v],.012,p.white);
  }
  collider(.86,0,10.06,1.62,1.5,10.98);
  mark('continuationWindowPlants',1.3,10.97,.9,1.9,{rackPots:4,whiteStandPots:3});
  box(.89,.015,9.69,1.16,.43,9.97,guardWhite,true);box(.88,.43,9.68,1.17,.48,9.98,p.trim);

  // Стенды рисуются как поверхности сцены: белая рама, золотой орнамент,
  // центральная иллюстрация и отдельные информационные карточки.
  function corridorBoard(u,v,width,title,theme,ry){
   const tx=texture(1280,640,(g,w,h)=>{
    g.fillStyle='#f4f3e8';g.fillRect(0,0,w,h);
    g.fillStyle='#b9a46b';g.fillRect(15,12,w-30,6);g.fillRect(15,h-18,w-30,6);
    for(const x of [31,w-31]){
     g.strokeStyle='#bca66a';g.lineWidth=4;
     for(let y=28;y<h-30;y+=42){g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x-22,y+5,x+22,y+23,x,y+38);g.stroke();g.beginPath();g.arc(x,y+17,9,0,Math.PI*1.6);g.stroke()}
    }
    g.fillStyle='#786a42';g.textAlign='center';g.font='bold 29px Arial';g.fillText(title,w/2,57,w-130);
    const palette=theme==='health'?['#46a8ad','#88bd6a','#e8b16b']:['#4b94bd','#b65e8a','#72aa9f'];
    g.fillStyle=palette[0];g.beginPath();g.ellipse(w/2,h*.54,112,122,0,0,Math.PI*2);g.fill();
    g.fillStyle='#f0f2db';g.beginPath();g.ellipse(w/2,h*.54,94,104,0,0,Math.PI*2);g.fill();
    if(theme==='health'){
     g.fillStyle=palette[0];g.fillRect(w/2-15,h*.54-55,30,110);g.fillRect(w/2-55,h*.54-15,110,30);
    }else{
     g.fillStyle='#9e455d';g.beginPath();g.moveTo(w/2,h*.54+43);g.bezierCurveTo(w/2-100,h*.54-12,w/2-53,h*.54-80,w/2,h*.54-35);g.bezierCurveTo(w/2+53,h*.54-80,w/2+100,h*.54-12,w/2,h*.54+43);g.fill();
     g.fillStyle='#3b7197';g.font='bold 20px Arial';g.fillText('ДОСБОЛ LIKE',w/2,h*.54+82);
    }
    for(let row=0;row<4;row++)for(const side of [-1,1]){
     const x=side<0?72:w-445,y=98+row*126,bw=373,bh=108;
     g.fillStyle='#e4e6df';g.fillRect(x+4,y+5,bw,bh);g.fillStyle='#fcfcf7';g.fillRect(x,y,bw,bh);
     g.strokeStyle=palette[row%3];g.lineWidth=2;g.strokeRect(x,y,bw,bh);
     if(row%2===0){
      g.fillStyle='#b5c7bf';g.fillRect(x+12,y+13,94,79);
      for(let a=0;a<3;a++){g.fillStyle=['#6e8b91','#c5b68f','#719481'][a];g.fillRect(x+17+a*25,y+37,20,49);g.fillStyle='#e9e8d9';g.fillRect(x+22+a*25,y+43,9,13)}
     }
     const offset=row%2===0?118:14;
     g.fillStyle='#68716e';for(let k=0;k<7;k++)g.fillRect(x+offset,y+14+k*11,bw-offset-14-(k%3)*12,2.4);
    }
   });
   at(u,v,ry,()=>{
    box(-width/2,1.23,-.035,width/2,2.73,.016,p.white);
    panel(0,1.98,-.038,width-.06,1.44,new THREE.MeshBasicMaterial({map:tx}),Math.PI);
   });mark('corridorNoticeBoard',u,v,width,.08,{title,wing:'continuation'});
  }
  for(const [u,w,title,theme] of [[5.5,3.4,'ҚАУІПСІЗ ОРТА','friendship'],[13.4,3.6,'ДОСБОЛ LIKE','friendship'],[18.1,3.8,'АДАЛ АЗАМАТ','friendship'],[22.7,2.4,'ДЕНСАУЛЫҚ','health']])corridorBoard(u,9.635,w,title,theme,Math.PI);
  for(const [u,w,title,theme] of [[10.7,2.5,'ДЕНСАУЛЫҚ','health'],[18.6,3.8,'ДОСБОЛ LIKE','friendship'],[22,1.7,'ҚАУІПСІЗДІК','friendship']])corridorBoard(u,12.065,w,title,theme,0);

  // На снимках кабинеты со сплошным стеклом в одной створке; у 101 — боковая вставка.
  const extensionFrost=material(0x8f9a92,null,{shininess:45});
  function extensionDoor(u,v,width,number,ry,sidelight=false){
   at(u,v,ry,()=>{
    box(-width/2-.14,0,-.015,width/2+.14,3.3,.075,p.counter);
    box(-width/2,0,-.082,width/2,2.43,-.015,p.iron);
    const split=sidelight?-width*.23:-width/2;
    box(split+.055,.075,-.11,width/2-.055,2.35,-.083,p.doorGlass);
    for(let y=.22;y<2.3;y+=.21)box(split+.055,y,-.119,width/2-.055,y+.084,-.111,extensionFrost);
    if(sidelight){box(-width/2+.05,.075,-.11,split-.035,2.35,-.083,extensionFrost);box(split-.025,.04,-.128,split+.025,2.39,-.075,p.iron)}
    rod([split+.12,.99,-.145],[split+.12,1.19,-.145],.012,p.iron);rod([split+.12,1.08,-.145],[split+.27,1.08,-.145],.013,p.iron);
    add(new THREE.CircleGeometry(1,28),p.gold,0,2.55,-.132,.17,.105,1,0,Math.PI);
    label(number,0,2.55,-.136,.27,.13,null,'#343b36',Math.PI);
    const brand=label('BQFQ',sidelight?width*.1:0,1.58,-.131,width*.64,.23,null,'#1684bf',Math.PI);
    brand.name='office-brand-continuation-'+number;
   });
   const center=new THREE.Vector3(u,0,v).applyMatrix4(pose);
   classroomDoors.push({number,brand:'BQFQ',x:center.x,z:center.z,width,wing:'continuation',closed:true,facing:ry+Math.atan2(pose.elements[8],pose.elements[0])});
   mark('continuationClassroomDoor',u,v,width,.15,{number,closed:true});
  }
  extensionDoor(7.7,12.045,1.06,'108',0);
  extensionDoor(9.2,9.655,1.12,'103',Math.PI);
  extensionDoor(13.9,12.045,1.12,'106',0);
  extensionDoor(24.5,12.045,1.12,'102',0);
  extensionDoor(26.4,9.655,1.52,'101',Math.PI,true);
  at(26.4,12.045,0,()=>{
   box(-.67,0,-.015,.67,3.3,.075,p.counter);box(-.55,0,-.092,.55,2.43,-.015,p.iron);
   box(-.47,.12,-.104,.47,2.3,-.093,p.dark);
   rod([-.39,1,-.14],[-.39,1.18,-.14],.012,p.iron);rod([-.39,1.08,-.14],[-.24,1.08,-.14],.013,p.iron);
  });mark('continuationServiceDoor',26.4,12.045,1.1,.15,{closed:true});
  // Две закрытые деревянные створки и остеклённая фрамуга, как на последнем фото.
  at(30.68,10.85,Math.PI/2,()=>{
   for(const x of [-.89,0,.89])box(x-.035,.12,-.08,x+.035,3.17,.035,p.frame);
   for(const y of [.14,2.4,3.14])box(-.92,y-.035,-.08,.92,y+.035,.035,p.frame);
   for(const side of [-1,1]){
    const cx=side*.445;
    box(cx-.405,.18,-.06,cx+.405,2.36,-.015,p.frame);
    box(cx-.335,.32,-.075,cx+.335,.94,-.061,p.oak);
    box(cx-.335,1.06,-.075,cx+.335,2.22,-.061,p.oak);
    for(const y of [.29,.97,1.03,2.25])box(cx-.36,y,-.085,cx+.36,y+.025,-.07,p.counter);
    rod([side*.09,1.14,-.11],[side*.09,1.36,-.11],.015,p.steel);
   }
   panel(0,2.78,-.057,1.71,.67,outside,Math.PI);
   box(-.022,2.43,-.085,.022,3.12,-.04,p.frame);
   label('ШЫҒУ · ВЫХОД',0,3.24,-.09,.78,.18,'#4c8398','#ffffff',Math.PI);
   add(rodGeo,p.red,-1.02,1.16,-.1,.095,.52,.095);
   rod([-1.02,1.42,-.1],[-.94,1.52,-.1],.016,p.iron);
   label('←',-1.02,1.63,-.13,.2,.18,'#4f805b','#fff',Math.PI);
   box(.99,1.32,-.095,1.15,1.48,-.04,p.red);
  });
  mark('continuationEndExit',30.68,10.85,.18,1.84,{closed:true,interactive:false,leaves:2,threshold:.12});
  mark('continuationHall',15.675,10.85,30.05,2.5,{turnFromStairs:'right',endDoorClosed:true,noticeBoards:7});
  mark('stairForwardPassage',2.4,8.06,1.76,.24,{open:true,direction:'straight',furtherReferencePending:false});
  // Парные окна справа от лестницы на уровнях верхнего марша и площадки.
  for(const [v,base] of [[2.95,3.74],[6.1,1.87]]){
   panel(8.715,base+1.91,v,1.7,2.12,outside,-Math.PI/2);
   for(const z of [v-.88,v+.88])box(8.66,base+.82,z-.025,8.73,base+3.01,z+.025,p.frame);
   for(const y of [.84,2.99])box(8.66,base+y-.025,v-.91,8.73,base+y+.025,v+.91,p.frame);
   for(let y=1.57;y<3;y+=.13){box(8.64,base+y,v-.85,8.655,base+y+.073,v+.85,p.blind);box(8.638,base+y+.075,v-.85,8.652,base+y+.104,v+.85,p.blindLight)}
   box(8.35,base+.82,v-.96,8.75,base+.89,v+.96,p.counter);
   box(8.52,base+.13,v-.81,8.7,base+.73,v+.81,p.white);
   for(let z=v-.76;z<v+.81;z+=.1)box(8.49,base+.17,z,8.54,base+.69,z+.035,p.trim);
  }
  // Второй этаж. Из лестницы — на поперечную площадку с шестью пустыми
  // стеллажами; правый проём ведёт к окну и кабинетам 201–208.
  const upperSavedPose=pose;
  pose=new THREE.Matrix4().makeTranslation(0,3.74,0).premultiply(upperSavedPose);
  try{
   const upperMark=(kind,u,v,w,d,extra={})=>mark(kind,u,v,w,d,{level:3.74,...extra});
   const vinylMap=texture(384,384,(g,w,h)=>{
    g.fillStyle='#a6a7ae';g.fillRect(0,0,w,h);
    for(let i=0;i<19000;i++){g.fillStyle=i%3===0?'#e1e0df75':i%3===1?'#666b7755':'#c3c4c866';g.fillRect(rand()*w,rand()*h,.5+rand()*1.1,.5+rand()*1.1)}
   },1.2);
   const vinyl=material(0xffffff,vinylMap,{shininess:48,specular:0x62656b});
   const upperGlass=material(0xb9d3ce,null,{shininess:75,transparent:true,opacity:.17,depthWrite:false,side:THREE.DoubleSide});
   const frost=material(0xe1e5df,null,{shininess:25});
   const upperWoodFloor=material(0xbeb9a8,counterMap,{shininess:25});
   stairFloor(.05,0,2.15,8,0);
   stairRail([2.2,0,1.94],[2.2,0,7.95]);
   box(.005,0,0,.025,3.3,8,p.cream);
   box(.05,3.3,0,2.15,3.43,8,p.ceiling);
   for(let v=.1;v<8;v+=.7)box(.028,.07,v-.003,.035,3.3,v+.003,p.seam);
   box(.025,0,0,.05,.09,8,granite);
   for(const v of [1,4,7])box(.8,3.278,v-.29,1.39,3.3,v+.29,p.bulb);

   // Чёрные прямоугольные стойки и деревянные полочки разной высоты.
   // На новых фотографиях все эти стеллажи пустые.
   function emptyUpperRack(u,v,width=.7,ry=0,kind='upperLandingEmptyRack'){
    at(u,v,ry,()=>{
     box(-width/2-.025,.015,-.19,width/2+.025,.055,.19,p.counter);
     for(const x of [-width/2,0,width/2])for(const z of [-.15,.15])rod([x,.045,z],[x,2.05,z],.009,p.iron);
     for(const [x1,x2,y] of [[-width/2,0,.54],[0,width/2,.71],[-width/2,0,1.4],[0,width/2,1.57]]){
      box(x1-.025,y,-.19,x2+.025,y+.03,.19,p.counter);
     }
     for(const [x1,x2,y] of [[-width/2,0,2.03],[0,width/2,1.92]])rod([x1,y,-.15],[x2,y,-.15],.009,p.iron);
     collider(-width/2-.03,0,-.2,width/2+.03,2.07,.2);
    });upperMark(kind,u,v,ry? .4:width,ry?width:.4,{empty:true});
   }
   for(const v of [2.2,2.97,3.74,4.51,5.28,6.05])emptyUpperRack(.35,v,.69,Math.PI/2);
   // Два проёма на одной оси соединяют площадку с левым и правым крыльями.
   for(const v of [0,8]){
    for(const u of [.35,2.15])box(u-.024,0,v-.04,u+.024,2.71,v+.14,p.iron);
    box(.326,2.67,v-.04,2.174,2.72,v+.14,p.iron);
    upperMark(v===8?'upperRightPortal':'upperLeftPortal',1.25,v,1.8,.2,{open:true,side:v===8?'right':'left'});
   }
   upperMark('upperLanding',1.1,4,2.1,8,{emptyRacks:6,leftWingDeferred:false});
   label('←',.06,2.38,7.0,.23,.18,'#4f805b','#fff',Math.PI/2);

   stairFloor(.35,8,2.15,9.6,0,vinyl);
   box(.2,0,8.15,.35,3.3,9.6,p.cream,true);box(2.15,0,8.15,2.3,3.3,9.6,p.cream,true);
   box(.35,2.7,8.15,2.15,2.83,9.6,p.cream);
   stairFloor(.2,9.6,30.7,12.1,0,vinyl);
   box(.2,3.3,9.6,30.7,3.43,12.1,p.ceiling);
   box(.05,0,9.45,.2,3.35,12.25,p.cream,true);
   box(30.7,0,9.6,30.85,3.35,12.25,p.cream,true);
   const doorPlan=[
    {u:3.5,v:12.1,n:'208',w:1.55,open:false,double:true},
    {u:7.1,v:9.6,n:'207',w:1.5,open:false,double:true},
    {u:10.7,v:12.1,n:'206',w:1.12,open:false},
    {u:14.4,v:9.6,n:'205',w:1.12,open:false},
    {u:18.1,v:12.1,n:'204',w:1.12,open:false},
    {u:21.8,v:9.6,n:'203',w:1.12,open:false},
    {u:25.6,v:12.1,n:'202',w:1.12,open:false},
    {u:28.6,v:9.6,n:'201',w:1.12,open:false}
   ];
   for(const side of [9.6,12.1]){
    const doors=doorPlan.filter(d=>d.v===side),a=side<10?9.45:12.1,b=side<10?9.6:12.25;
    let edge=side<10?2.15:.2;
    for(const d of doors){
     box(edge,0,a,d.u-d.w/2,3.3,b,p.cream,true);
     box(d.u-d.w/2,2.44,a,d.u+d.w/2,3.3,b,p.cream,true);
     edge=d.u+d.w/2;
    }
    box(edge,0,a,30.7,3.3,b,p.cream,true);
    for(let u=.3;u<30.7;u+=.7){
     if(side<10&&u<2.2)continue;
     if(doors.some(d=>Math.abs(u-d.u)<d.w/2+.14))continue;
     box(u-.003,.07,side<10?9.602:12.09,u+.003,3.3,side<10?9.61:12.098,p.seam);
    }
    const segments=[];let last=side<10?2.15:.2;
    for(const d of doors){segments.push([last,d.u-d.w/2]);last=d.u+d.w/2}segments.push([last,30.7]);
    for(const [x1,x2] of segments){
     box(x1,0,side<10?9.601:12.07,x2,.08,side<10?9.63:12.099,p.trim);
     box(x1,.55,side<10?9.602:12.09,x2,.557,side<10?9.61:12.098,p.seam);
    }
   }
   for(const u of [1.3,4.6,7.9,11.2,14.5,17.8,21.1,24.4,27.7,29.7]){
    box(u-.295,3.276,10.555,u+.295,3.3,11.145,p.bulb);
    if(u===4.6||u===14.5||u===24.4){const light=new THREE.PointLight(0xfffcf2,.17,10,2);light.position.set(u,3,10.85).applyMatrix4(pose);scene.add(light)}
   }
   for(const u of [6.1,16.6,26.3])add(ballGeo,p.white,u,3.255,10.85,.05,.022,.05);
   // Окно и четыре горшка на подоконнике; сами напольные стойки пустые.
   panel(.215,1.9,10.85,2.08,2.16,outside,Math.PI/2);
   for(const v of [9.79,10.85,11.91])box(.21,.79,v-.025,.27,3.02,v+.025,p.frame);
   for(const y of [.81,3])box(.21,y-.025,9.76,.27,y+.025,11.94,p.frame);
   for(let y=1.6;y<3;y+=.13){box(.28,y,9.8,.295,y+.073,11.9,p.blind);box(.282,y+.075,9.8,.297,y+.104,11.9,p.blindLight)}
   box(.2,.77,9.72,.74,.84,11.98,p.counter);
   box(.25,.15,9.98,.43,.71,11.73,p.white,true);
   for(let v=10;v<11.72;v+=.1)box(.425,.18,v,.46,.68,v+.035,p.trim);
   rod([.38,.15,11.8],[.38,.06,11.8],.012,p.white);rod([.38,.06,11.8],[.88,.06,11.8],.012,p.white);
   for(const [v,size] of [[10.12,.63],[10.6,.67],[11.08,.65],[11.56,.64]])pot(.45,v,size,.84,'broad',false);
   emptyUpperRack(.82,11.82,.64,0,'upperWindowEmptyRack');emptyUpperRack(1.55,11.82,.64,0,'upperWindowEmptyRack');
   box(.48,0,9.72,.77,.43,10.02,guardWhite,true);box(.47,.43,9.71,.78,.48,10.03,p.trim);
   add(rodGeo,p.red,.73,1.54,12.02,.083,.46,.083);label('1',.73,1.92,12.005,.17,.2,'#b73735','#fff',Math.PI);
   box(.79,2.92,9.64,.94,3.09,9.77,p.white);
   upperMark('upperRightWindow',.24,10.85,.15,2.2,{sillPlants:4,blinds:'day-night'});
   // Каркасы и полосы матового стекла, овальные номера, BQFQ на створках.
   function upperClassroom(d,wing='upper-right'){
    const ry=d.ry??(d.v<10?Math.PI:0);
    at(d.u,d.v,ry,()=>{
     for(const [a,b] of [[-d.w/2-.14,-d.w/2],[d.w/2,d.w/2+.14]])box(a,0,-.015,b,3.3,.075,p.counter);
     box(-d.w/2,2.44,-.015,d.w/2,3.3,.075,p.counter);
     for(const x of [-d.w/2,d.w/2])box(x-.026,0,-.065,x+.026,2.45,.035,p.iron);
     box(-d.w/2,2.4,-.065,d.w/2,2.45,.035,p.iron);
     {
      // Только видимая часть кабинета за открытой дверью; основной маршрут — коридор.
      stairFloor(-1.25,0,1.25,1.6,0,upperWoodFloor);
      box(-1.4,0,0,-1.25,3.3,1.75,p.cream,true);box(1.25,0,0,1.4,3.3,1.75,p.cream,true);
      box(-1.25,0,1.6,1.25,3.3,1.75,p.cream,true);box(-1.25,3.3,0,1.25,3.43,1.6,p.ceiling);
      if(d.n==='207'&&wing==='upper-right'){
       const alphabet=texture(512,512,(g,w,h)=>{
        g.fillStyle='#f2efe3';g.fillRect(0,0,w,h);g.fillStyle='#a64d56';g.fillRect(0,0,w,36);g.fillRect(0,h-30,w,30);
        g.fillStyle='#44678d';g.fillRect(0,36,24,h-66);g.fillRect(w-24,36,24,h-66);
        g.fillStyle='#324345';g.textAlign='center';g.font='bold 25px Arial';g.fillText('ENGLISH ALPHABET',w/2,76);
        for(let i=0;i<26;i++){
         const x=43+(i%5)*86,y=98+Math.floor(i/5)*62;
         g.strokeStyle='#869b9b';g.strokeRect(x,y,78,54);g.font='25px Arial';g.fillText(String.fromCharCode(65+i)+' '+String.fromCharCode(97+i),x+39,y+36);
        }
       });panel(0,1.75,1.595,1.15,1.2,new THREE.MeshBasicMaterial({map:alphabet}),Math.PI);
      }
      for(const x of [-.69,.69]){
       box(x-.32,.72,.79,x+.32,.76,1.25,p.trim,true);
       for(const a of [-.25,.25])rod([x+a,0,.91],[x+a,.72,.91],.014,p.steel);
       box(x-.2,.42,.38,x+.2,.47,.72,p.blue);
       box(x-.2,.48,.7,x+.2,.87,.735,p.blue);
      }
     }
     if(!d.open)collider(-d.w/2,0,-.08,d.w/2,2.43,.08);
     const leafWidth=d.double?d.w*.71:d.w-.052,hinge=d.w/2-.024;
     if(d.double){
      box(-d.w/2+.04,.08,-.07,hinge-leafWidth-.025,2.35,-.035,frost);
      box(hinge-leafWidth-.025,0,-.085,hinge-leafWidth+.025,2.43,.02,p.iron);
     }
     at(hinge,-.025,d.open?-Math.PI*68/180:0,()=>{
      for(const x of [-leafWidth,0])box(x-.023,0,-.045,x+.023,2.43,.02,p.iron,d.open);
      for(const y of [.035,2.405])box(-leafWidth,y-.025,-.045,0,y+.025,.02,p.iron,d.open);
      box(-leafWidth,2.265,-.045,0,2.43,.02,p.iron);
      box(-leafWidth+.035,.07,-.017,-.035,2.265,.004,upperGlass);
      for(let y=.19;y<2.2;y+=.205)box(-leafWidth+.035,y,-.024,-.035,y+.085,-.017,frost);
      if(d.open)collider(-leafWidth,0,-.045,0,2.43,.02);
      rod([-leafWidth+.12,.99,-.09],[-leafWidth+.12,1.17,-.09],.012,p.iron);
      rod([-leafWidth+.12,1.07,-.09],[-leafWidth+.26,1.07,-.09],.013,p.iron);
      add(new THREE.CircleGeometry(1,28),p.gold,-leafWidth/2,2.345,-.05,.15,.098,1,0,Math.PI);
      label(d.n,-leafWidth/2,2.345,-.054,.245,.125,null,'#353b35',Math.PI);
      const brand=label('BQFQ',-leafWidth/2,1.65,-.028,leafWidth*.74,.22,null,'#177caf',Math.PI);brand.name='office-brand-'+wing+'-'+d.n;
      label('BQFQ',-leafWidth/2,1.65,.006,leafWidth*.74,.22,null,'#177caf',0).name=wing+'-door-back-'+d.n;
     });
    });
    const c=new THREE.Vector3(d.u,0,d.v).applyMatrix4(pose);
    classroomDoors.push({number:d.n,brand:'BQFQ',x:c.x,z:c.z,width:d.w,level:3.74,wing,open:d.open,facing:ry+Math.atan2(pose.elements[8],pose.elements[0])});
    upperMark(wing==='upper-left'?'upperLeftClassroomDoor':'upperClassroomDoor',d.u,d.v,d.w,.15,{number:d.n,open:d.open,angle:d.open?68:0});
   }
   for(const d of doorPlan)upperClassroom(d);
   // Закрытая деревянная дверь в дальнем торце под высокой фрамугой.
   at(30.68,10.85,Math.PI/2,()=>{
    box(-.91,0,-.055,.91,2.35,.025,p.frame);
    for(const x of [-.88,0,.88])box(x-.03,0,-.065,x+.03,3.15,.035,p.frame);
    for(const side of [-1,1])for(const [a,b] of [[.18,.8],[.93,2.2]])box(side*.44-.34,a,-.07,side*.44+.34,b,-.055,p.oak);
    panel(0,2.75,-.054,1.71,.7,outside,Math.PI);box(-.91,3.1,-.065,.91,3.16,.035,p.frame);
    label('ШЫҒУ · ВЫХОД',0,3.24,-.075,.75,.17,'#4c8398','#fff',Math.PI);
    add(rodGeo,p.red,-1.04,1.24,-.08,.084,.48,.084);
   });upperMark('upperRightEndDoor',30.68,10.85,.16,1.82,{closed:true});
   upperMark('upperRightCorridor',15.45,10.85,30.5,2.5,{classrooms:8,openDoors:0});
   // Левое крыло второго этажа: окно у входа остаётся слева при выходе
   // с лестничной площадки, коридор уходит вправо от этого окна (к -U).
   stairFloor(.35,-1.6,2.15,0,0,vinyl);
   box(.2,0,-1.6,.35,3.3,0,p.cream,true);box(2.15,0,-1.6,2.3,3.3,0,p.cream,true);
   box(.35,2.7,-1.6,2.15,2.83,0,p.cream);
   stairFloor(-30.7,-4.1,2.3,-1.6,0,vinyl);
   box(-30.7,3.3,-4.1,2.3,3.43,-1.6,p.ceiling);
   box(2.3,0,-4.25,2.45,3.35,-1.45,p.cream,true);
   box(-30.85,0,-4.25,-30.7,3.35,-1.45,p.cream,true);
   const leftDoors=[
    {u:.05,v:-4.1,n:'205',w:1.12,open:false,ry:Math.PI},
    {u:-5.8,v:-4.1,n:'207',w:1.12,open:false,ry:Math.PI},
    {u:-8.4,v:-1.6,n:'210',w:1.12,open:false,ry:0},
    {u:-11.1,v:-4.1,n:'209',w:1.12,open:false,ry:Math.PI},
    {u:-13.7,v:-1.6,n:'212',w:1.12,open:false,ry:0},
    {u:-16.1,v:-4.1,n:'211',w:1.12,open:false,ry:Math.PI},
    {u:-18.5,v:-1.6,n:'214',w:1.12,open:false,ry:0},
    {u:-21,v:-4.1,n:'213',w:1.12,open:false,ry:Math.PI},
    {u:-25.7,v:-1.6,n:'216',w:1.12,open:false,ry:0},
    {u:-28.3,v:-4.1,n:'215',w:1.12,open:false,ry:Math.PI}
   ];
   // Стены с настоящими проёмами для дверей и двух входов в лестничные холлы.
   for(const side of [-4.1,-1.6]){
    const cuts=leftDoors.filter(d=>d.v===side).map(d=>({a:d.u-d.w/2,b:d.u+d.w/2,top:2.44}));
    if(side===-1.6)cuts.push({a:.35,b:2.15,top:2.7},{a:-30.05,b:-28.55,top:2.7});
    cuts.sort((a,b)=>a.a-b.a);
    const v1=side===-4.1?-4.25:-1.6,v2=side===-4.1?-4.1:-1.45;
    let edge=-30.7;
    for(const c of cuts){
     box(edge,0,v1,c.a,3.3,v2,p.cream,true);box(c.a,c.top,v1,c.b,3.3,v2,p.cream,true);edge=c.b;
    }
    box(edge,0,v1,2.3,3.3,v2,p.cream,true);
    const face=side===-4.1?-4.095:-1.605;
    for(let u=-30.4;u<2.3;u+=.7){
     if(cuts.some(c=>u>c.a-.13&&u<c.b+.13))continue;
     box(u-.003,.07,face-.003,u+.003,3.3,face+.003,p.seam);
    }
    edge=-30.7;
    for(const c of [...cuts,{a:2.3,b:2.3}]){
     box(edge,0,face-.012,c.a,.08,face+.012,p.trim);
     box(edge,.55,face-.004,c.a,.557,face+.004,p.seam);edge=c.b;
    }
   }
   // Низкие поперечные балки и выступы панелей, видимые в обоих направлениях.
   for(const u of [-9.4,-20.2]){
    box(u-.13,2.72,-4.1,u+.13,3.3,-1.6,p.cream,true);
    for(const [a,b] of [[-4.1,-3.97],[-1.73,-1.6]]){
     box(u-.13,0,a,u+.13,2.72,b,p.cream,true);
     rod([u-.136,.08,b],[u-.136,2.72,b],.0025,p.seam);
    }
    rod([u-.134,2.72,-4.1],[u-.134,2.72,-1.6],.003,p.seam);
    upperMark('upperLeftCrossBeam',u,-2.85,.26,2.5,{clearHeight:2.72});
   }
   for(const u of [.8,-2.5,-5.8,-9.1,-12.4,-15.7,-19,-22.3,-25.6,-28.9]){
    box(u-.295,3.276,-3.145,u+.295,3.3,-2.555,p.bulb);
    if(u===-2.5||u===-12.4||u===-22.3){const light=new THREE.PointLight(0xfffcf2,.17,10,2);light.position.set(u,3,-2.85).applyMatrix4(pose);scene.add(light)}
   }
   for(const u of [-4,-14.2,-24])add(ballGeo,p.white,u,3.255,-2.85,.05,.022,.05);
   for(const d of leftDoors)upperClassroom(d,'upper-left');

   // Два оконных торца: у входа растения, у дальней лестницы подоконник пустой.
   function leftEndWindow(u,facesPositiveU,hasPlants){
    const inward=facesPositiveU?1:-1,ry=facesPositiveU?Math.PI/2:-Math.PI/2;
    panel(u+inward*.016,1.91,-2.85,2.07,2.16,outside,ry);
    for(const v of [-3.91,-2.85,-1.79])box(u-.032,.8,v-.025,u+.032,3.02,v+.025,p.frame);
    for(const y of [.82,3])box(u-.032,y-.025,-3.94,u+.032,y+.025,-1.76,p.frame);
    for(let y=1.63;y<3;y+=.13){
     const x=u+inward*.06;
     box(x-.007,y,-3.9,x+.007,y+.073,-1.8,p.blind);box(x-.008,y+.075,-3.9,x+.008,y+.104,-1.8,p.blindLight);
    }
    const a=u+inward*.02,b=u+inward*.43;
    box(Math.min(a,b),.77,-3.98,Math.max(a,b),.84,-1.72,p.counter);
    const back=u+inward*.05,front=u+inward*.23;
    box(Math.min(back,front),.15,-3.65,Math.max(back,front),.71,-2.05,p.white,true);
    for(let v=-3.6;v<-2.04;v+=.1)box(front-.02,.18,v,front+.02,.68,v+.035,p.trim);
    const pipeX=u+inward*.17;
    rod([pipeX,.17,-3.77],[pipeX,.06,-3.77],.012,p.white);
    rod([pipeX,.06,-3.77],[pipeX,.06,-1.87],.012,p.white);
    rod([pipeX,.06,-1.87],[pipeX,.18,-1.87],.012,p.white);
    if(hasPlants)for(const v of [-3.38,-2.34])pot(u+inward*.23,v,.68,.84,'broad',false);
    upperMark('upperLeftWindow',u,-2.85,.15,2.2,{sillPlants:hasPlants?2:0,blinds:'day-night',end:hasPlants?'entry':'far'});
   }
   leftEndWindow(2.3,false,true);leftEndWindow(-30.7,true,false);
   // Пышные зелёно-кремовые листья на белой круглой передвижной подставке.
   const variegatedMap=texture(128,128,(g,w,h)=>{
    g.fillStyle='#446a36';g.fillRect(0,0,w,h);
    for(let i=0;i<100;i++){g.fillStyle=i%3?'#adc78b':'#d5dfae';g.beginPath();g.ellipse(rand()*w,rand()*h,2+rand()*6,1+rand()*4,rand()*3,0,Math.PI*2);g.fill()}
   });
   const variegated=material(0xffffff,variegatedMap,{side:THREE.DoubleSide,shininess:15});
   const variegatedLeaf=leafGeo.clone(),variedUV=[],variedPosition=variegatedLeaf.attributes.position;
   for(let row=0;row<=10;row++)for(let col=0;col<3;col++){const i=row*3+col;variedUV.push(row/10,col/2);variedPosition.setZ(i,variedPosition.getZ(i)*1.55)}
   variegatedLeaf.setAttribute('uv',new THREE.Float32BufferAttribute(variedUV,2));variegatedLeaf.computeVertexNormals();
   const standU=1.78,standV=-2.85;
   for(const v of [standV-.32,standV+.32]){
    add(ballGeo,p.iron,standU,.035,v,.027,.027,.027);
    for(let i=0;i<12;i++){
     const t=i/12,tt=(i+1)/12;
     rod([standU+.12*Math.sin(t*Math.PI),.05+t*1.05,v],[standU+.12*Math.sin(tt*Math.PI),.05+tt*1.05,v],.01,p.white);
    }
   }
   for(const [du,dv,y,size] of [[0,0,1.12,.85],[-.05,-.27,.67,.85],[-.05,.27,.25,.91]]){
    const x=standU+du,v=standV+dv;
    add(new THREE.TorusGeometry(.19,.01,6,24),p.white,x,y-.01,v,1,1,1,Math.PI/2);
    pot(x,v,size,y,'empty',false);
    const potTop=y+.36*size;
    for(let i=0;i<36;i++){
     const a=i*2.4,r=.09+(i%4)*.022;
     const tip=[x+Math.cos(a)*r,potTop+.12+(i%6)*.045,v+Math.sin(a)*r];
     rod([x,potTop-.03,v],tip,.006,p.green);
     add(variegatedLeaf,variegated,...tip,1.05,1.05,1.05,0,-a,.12+(i%3)*.12);
    }
    rod([standU,.05,v],[x,y-.01,v],.01,p.white);
   }
   collider(1.45,0,-3.38,2.15,1.97,-2.32);
   upperMark('upperLeftPlantStand',1.78,-2.85,.7,1.06,{pots:3,whiteFrame:true,wheels:true,variegated:true});
   box(1.81,0,-1.94,2.09,.43,-1.65,guardWhite,true);box(1.8,.43,-1.95,2.1,.48,-1.64,p.trim);
   // Красные указатели и огнетушители рядом с оконными нишами.
   for(const [u,v,ry] of [[1.48,-4.075,Math.PI],[-30.05,-1.625,0]]){
    at(u,v,ry,()=>{
     add(rodGeo,p.red,0,1.4,-.075,.083,.47,.083);rod([0,1.63,-.075],[.09,1.73,-.075],.013,p.iron);
     label('1',.2,1.75,-.055,.16,.18,'#b73735','#fff',Math.PI);
    });
   }
   for(const u of [-3.4,-17.9]){
    label('←',u,1.52,-1.625,.2,.18,'#4f805b','#fff',Math.PI);
    box(u+.22,1.43,-1.66,u+.35,1.57,-1.6,p.red);
   }
   // Дальний проход с деревянными откосами и видимым ограждением лестницы.
   // Продолжение самой лестницы можно достроить по следующим ракурсам.
   stairFloor(-30.05,-1.6,-28.55,.8,0);
   box(-30.2,0,-1.45,-30.05,3.3,.95,p.oak,true);box(-28.55,0,-1.45,-28.4,3.3,.95,p.oak,true);
   box(-30.05,0,.8,-28.55,3.3,.95,p.oak,true);box(-30.05,3.3,-1.6,-28.55,3.43,.8,p.ceiling);
   for(const u of [-30.05,-28.55])box(u-.035,0,-1.68,u+.035,2.72,-1.43,p.oak);
   box(-30.085,2.67,-1.68,-28.515,2.74,-1.43,p.oak);
   stairRail([-29.9,0,-.55],[-29.9,0,.55]);stairRail([-29.9,0,.55],[-28.7,0,.55]);
   box(-29.6,3.275,-.5,-29.01,3.3,.09,p.bulb);
   label('ШЫҒУ · ВЫХОД',-29.3,2.9,-1.65,.72,.17,'#4c8398','#fff',Math.PI);
   upperMark('upperLeftFarStairPassage',-29.3,-1.6,1.5,.2,{open:true,stairInteriorDeferred:true});
   upperMark('upperLeftCorridor',-14.2,-2.85,33,2.5,{classrooms:10,closedDoors:10,crossBeams:2});
  }finally{pose=upperSavedPose}
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
 for(const surface of stairSurfaces){const left=surface[0];surface[0]=-surface[2];surface[2]=-left}
 for(const fixture of fixtures)fixture.x=-fixture.x;
 for(const door of classroomDoors)door.x=-door.x;
 function groundAt(x,z,feet){
  let result=null,best=Infinity;
  if(Math.abs(feet)<.205&&zones.some(([x1,z1,x2,z2])=>x>=x1&&x<=x2&&z>=z1&&z<=z2)){result=0;best=Math.abs(feet)}
  for(const [x1,z1,x2,z2,y] of stairSurfaces){
   const delta=Math.abs(y-feet);
   if(x>=x1-.0001&&x<=x2+.0001&&z>=z1-.0001&&z<=z2+.0001&&delta<=.205&&delta<best){result=y;best=delta}
  }
  return result;
 }
 function roomAt(x,z,feet=0){
  if(feet>3.5){
   if(x>=14.1&&x<=44.75&&z>=-5.9&&z<=-.15)return 'Корпус 1 · 2 этаж · Правый коридор';
   if((x>=-17&&x<=16.3&&z>7.85&&z<=13.75)||(x>=-16.15&&x<=-14.65&&z>=7.05&&z<=9.45))return 'Корпус 1 · 2 этаж · Левый коридор';
  }
  if([continuationBounds,continuationEntryBounds].some(b=>x>=b.x1&&x<=b.x2&&z>=b.z1&&z<=b.z2))return 'Корпус 1 · Продолжение коридора';
  if(x>=stairBounds.x1&&x<=stairBounds.x2&&z>=stairBounds.z1&&z<7.85)
   return feet>3.5?'Корпус 1 · Площадка 2 этажа':feet<-.25?'Корпус 1 · Лестница вниз':'Корпус 1 · Лестничный холл';
  return x<=-6?'Корпус 1 · Правый коридор':x>=6?'Корпус 1 · Левый коридор':z<3.12?'Корпус 1 · Прихожая':z<6.2?'Корпус 1 · Открытые турникеты':'Корпус 1 · Входной холл';
 }
 scene.userData={building:1,stage:'entrance-corridors-and-stairs',layoutVersion:15,reference:'userPhotos-opposing-views',turnstilesOpen:true,waitingBenches:2,reception:true,certificateCabinet:true,
  hallWidth:12,hallDepth:7.98,corridorWidth:2.25,corridorLength:12.1,corridorAxis:'x',normalSizeFurniture:true,fixtures,classroomDoors,stairHall:stairInfo,stairSurfaces,areas:zones};
 return {name:'Корпус 1',scene,colliders,groundAt,roomAt,stairSurfaces,areas:zones,exitDoor:{x:0,z:.05,radius:1.35},spawn:[0,1.7,1.8],yaw:Math.PI,pitch:-.025,state:null};
}
