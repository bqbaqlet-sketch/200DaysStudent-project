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
  box(3.0,0,10.45,3.15,3.35,22.55,p.cream,true);
  box(5.4,0,10.45,5.55,3.35,19.78,p.cream,true);box(5.4,0,21.42,5.55,3.35,22.55,p.cream,true);
  box(5.4,2.7,19.78,5.55,3.35,21.42,p.cream,true);
  box(3.15,0,22.4,5.4,3.35,22.55,p.cream,true);box(3.15,3.3,10.3,5.4,3.43,22.4,p.ceiling);
  for(const x of [3.165,5.385]){
   for(let z=10.45;z<=22.4;z+=.6)if(x<4||z<19.73||z>21.47)box(x-.007,.07,z-.003,x+.007,3.3,z+.003,p.seam);
   for(const [a,b] of x<4?[[10.45,22.4]]:[[10.45,19.73],[21.47,22.4]])box(x-.018,0,a,x+.018,.09,b,p.trim);
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
   const x=-width/2+(col+.5)*width/6,shelf=.245+row*.45;
   if((col+row)%7===0){
    box(x-.075,shelf,-.085,x+.075,shelf+.026,.065,p.dark);
    rod([x,shelf+.026,-.01],[x,shelf+.104,-.01],.013,p.gold);
    add(new THREE.CylinderGeometry(.073,.027,.12,18),p.gold,x,shelf+.158,-.01,1,1,1);
    add(new THREE.TorusGeometry(.073,.006,6,24),p.gold,x,shelf+.219,-.01,1,1,1,Math.PI/2);
    for(const side of [-1,1]){
     rod([x+side*.058,shelf+.185,-.01],[x+side*.103,shelf+.17,-.01],.007,p.gold);
     rod([x+side*.103,shelf+.17,-.01],[x+side*.09,shelf+.117,-.01],.007,p.gold);
     rod([x+side*.09,shelf+.117,-.01],[x+side*.04,shelf+.117,-.01],.007,p.gold);
    }
    mark('certificateTrophy',x,-.01,.21,.15,{shelfLevel:shelf,baseLevel:shelf,supported:true});
   }else{
    box(x-.17,shelf+.003,-.12,x+.17,shelf+.308,-.1,p.gold);
    panel(x,shelf+.158,-.125,.31,.275,new THREE.MeshBasicMaterial({map:paperMap}),Math.PI);
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
 officeDoor(3.166,16.1,1.4,'113',-Math.PI/2);
 // Кабинет 114 находится у следующего окна за лестницей, по уточнённым фотографиям.
 for(const z of [19.78,21.42])box(5.37,0,z-.025,5.57,2.73,z+.025,p.iron);
 box(5.37,2.68,19.755,5.57,2.74,21.445,p.iron);
 mark('rightCorridorSecondStairPortal',5.475,20.6,.2,1.64,{open:true,level:0});
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
  halfFloor:1.87,upperFloor:3.74,basementFloor:-3.74,stairStart:2,stairEnd:5.135,width:8.8,depth:8,stairsSide:'right',stairAxis:'x',flightTurnDegrees:90,wallShift:2,wallClearance:.01,flightWidth:1.85,upperRoute:'forward-then-right',upperRun:4.2,forwardCorridor:true,lowerInteriorDeferred:false,upperInteriorDeferred:false,upperLeftDeferred:false,continuationDeferred:false};
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
   const t=flight?Math.min(10.5,i+.5)/11:i/intervals;
   const x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,z=a[2]+(b[2]-a[2])*t;
   const worldPoint=new THREE.Vector3(x,y,z).applyMatrix4(pose);
   let footY=y,nearest=.21;
   for(const [x1,z1,x2,z2,height] of stairSurfaces){
    const delta=Math.abs(worldPoint.y-height);
    if(worldPoint.x>=x1-.0001&&worldPoint.x<=x2+.0001&&worldPoint.z>=z1-.0001&&worldPoint.z<=z2+.0001&&delta<nearest){footY=height-pose.elements[13];nearest=delta}
   }
   add(rodGeo,p.steel,x,footY+.021,z,.067,.042,.067);rod([x,footY+.03,z],[x,y+1.04,z],.025,p.steel);
   mark('stairRailAnchor',x,z,.134,.134,{level:footY+pose.elements[13],flight});
  }
  for(const y of [.27,.52,.77,1.04])rod([a[0],a[1]+y,a[2]],[b[0],b[1]+y,b[2]],y>1?.033:.013,p.steel);
  collider(Math.min(a[0],b[0])-.026,Math.min(a[1],b[1]),Math.min(a[2],b[2])-.026,
   Math.max(a[0],b[0])+.026,Math.max(a[1],b[1])+1.07,Math.max(a[2],b[2])+.026);
 }
 function stairFlight(x1,x2,baseY,returning=false,descending=false,run=3.135){
  const tread=run/11,sign=descending?-1:1,start=returning?2+run:2,end=returning?2:2+run;
  for(let i=0;i<11;i++){
   const za=returning?2+run-(i+1)*tread:2+i*tread,zb=za+tread,y=baseY+(descending?-1:1)*(i+1)*.17;
   box(x1,y-.17,za,x2,y,zb,granite);stairSurface(x1,za,x2,zb,y);
   const nose=returning?zb:za;box(x1,y+.001,nose-.008,x2,y+.012,nose+.008,p.steel);
   const a=start+(end-start)*i/11,b=start+(end-start)*(i+1)/11;
   const bottomA=baseY+sign*i*.17-.36,bottomB=baseY+sign*(i+1)*.17-.36;
   for(const x of [x1-.002,x2+.002])stairQuad([x,bottomA,a,x,bottomB,b,x,y,b,x,y,a],stairWhite);
  }
  const y0=baseY-.36,y1=baseY+sign*1.87-.36;
  stairQuad([x1,y0,start,x2,y0,start,x2,y1,end,x1,y1,end],stairWhite);
  for(const [z,low,high] of [[start,y0,baseY+sign*.17-.17],[end,y1,baseY+sign*1.87-.17]])
   if(high>low)stairQuad([x1,low,z,x2,low,z,x2,high,z,x1,high,z],stairWhite);
  for(const x of [x1-.002,x2+.002])rod([x,y0,start],[x,y1,end],.006,p.iron);
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
   stairFloor(3.55,5.135,7.5,7.25,-1.87);
   stairFlight(3.55,5.4,0);stairFlight(5.65,7.5,0,false,true);
   stairRail([5.31,0,2],[5.31,1.87,5.135],true);
   stairRail([3.64,0,2],[3.64,1.87,5.135],true);
   stairRail([5.74,0,2],[5.74,-1.87,5.135],true);
   stairRail([7.94,0,2],[7.94,0,7.2]);
   stairRail([7.41,-1.87,5.135],[7.41,-1.87,7.2]);
   // Поворот и второй спуск находятся под маршем вверх, как на фото гардероба.
   stairFlight(3.55,5.4,-1.87,true,true);
   stairRail([3.64,-1.87,5.135],[3.64,-1.87,7.16]);
   stairRail([3.64,-1.87,7.16],[7.41,-1.87,7.16]);
   box(5.4,-3.89,2,5.56,-.15,5.135,stairWhite,true);
   box(5.39,-.15,2,5.57,-.07,5.135,granite);
   for(const v of [2.5,3.55,4.6]){
    const y=(v-2)/3.135*1.87-.22;rod([3.56,y,v],[5.39,y,v],.003,p.seam);
   }
  });
  // Второй марш идёт вперёд от места на снимке; ступени шириной 1.85 м.
  at(0,-.1,0,()=>stairFlight(6.8,8.65,1.87,true,false,4.2));
  stairRail([6.89,1.87,6.1],[6.89,3.74,1.9],true);
  stairRail([8.56,1.87,6.1],[8.56,3.74,1.9],true);
  // Площадка касается передней стены. Вправо при подъёме — в сторону убывания U.
  stairFloor(2.15,0,8.65,1.9,3.74);
  stairRail([8.56,3.74,.09],[8.56,3.74,1.9]);
  stairRail([2.24,3.74,.09],[8.56,3.74,.09]);
  stairRail([2.24,3.74,1.81],[6.89,3.74,1.81]);
  mark('mainWindowRailClearance',8.56,4,.066,4.2,{sillFront:8.68,minimumGap:.087});
  for(const [x,v,base] of [[8.4,7.6,1.87],[8.35,.38,3.74]]){
   add(new THREE.CylinderGeometry(.16,.13,.48,14),p.white,x,base+.24,v,1,1,1);
   for(let i=0;i<9;i++){
    const a=i*2.4,top=[x+Math.cos(a)*.08,base+.59+i*.035,v+Math.sin(a)*.08];
    rod([x,base+.48,v],top,.006,p.green);add(leafGeo,p.green,...top,.7,.7,.7,0,a,.3);
   }
   collider(x-.16,base,v-.16,x+.16,base+.9,v+.16);
  }
  // Аварийная дверь — на отмеченной передней стене, рядом с входом из коридора.
  at(6.2,.035,0,()=>{
   box(-.59,0,-.015,.59,2.39,.055,p.trim);box(-.53,.035,.056,.53,2.32,.082,guardWhite);
   rod([-.37,.96,.095],[-.37,1.16,.095],.011,p.iron);
   label('ВЫХОД',0,2.55,.085,.66,.19,'#4c8398','#ffffff');
  });
  mark('stairEmergencyExit',6.2,.035,1.18,.12,{level:0,wall:'entry-wall',nearCorridorEntry:true,movedLeft:1.6});
  add(rodGeo,p.red,7.1,1.2,.16,.082,.41,.082);rod([7.1,1.4,.16],[7.18,1.51,.16],.015,p.iron);
  label('1',7.33,1.52,.17,.14,.19,'#b73735','#fff');
  label('←',5.35,1.0,.17,.22,.15,'#4f805b','#fff');
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
  // На первом этаже остаётся прежняя урна; гардероб находится этажом ниже.
  box(.28,.015,.38,.54,.48,.68,guardWhite,true);box(.26,.48,.36,.56,.53,.7,p.trim);box(.33,.525,.41,.49,.532,.57,p.dark);
  for(const [x,y,v] of [[2.4,7.115,.8],[3.3,7.115,3.1],[3.3,7.115,6.6],[1.1,3.1,6.4]])add(rodGeo,p.bulb,x,y,v,.14,.02,.14);
  const lamp=new THREE.PointLight(0xfff5df,.28,12,2);lamp.position.set(3.2,4.2,4).applyMatrix4(pose);scene.add(lamp);
  // BEGIN COLLEGE1_WARDROBE
  // Нижняя площадка: белая стена перед спуском и единственный открытый проход слева.
  const wardrobeY=-3.74,wardrobeTop=-1.14;
  const wardrobeWhite=material(0xeeeeea,null,{shininess:26});
  const wardrobeJoint=material(0xb5b8b5,null,{shininess:12});
  const wardrobeFloorMap=texture(384,384,(g,w,h)=>{
   g.fillStyle='#c3c4c0';g.fillRect(0,0,w,h);
   for(let i=0;i<24500;i++){
    g.fillStyle=['#f4f4efb0','#5b64636b','#a6aaa48c','#e0e1da90'][i%4];
    g.fillRect(rand()*w,rand()*h,.4+rand()*1.25,.4+rand()*1.25);
   }
  },.9);
  const wardrobeFloor=material(0xffffff,wardrobeFloorMap,{shininess:42,specular:0x798581});
  const plasterMap=texture(512,512,(g,w,h)=>{
   g.fillStyle='#c7c8c1';g.fillRect(0,0,w,h);
   for(let i=0;i<2300;i++){
    const x=rand()*w,y=rand()*h,r=3+rand()*17;
    g.strokeStyle=i%3===0?'#858d843c':i%3===1?'#ffffff8c':'#a7ada039';
    g.lineWidth=.6+rand()*2.1;g.beginPath();g.moveTo(x-r,y+r*.3);
    g.bezierCurveTo(x+r*.3,y-r,x-r*.25,y+r,x+r,y-r*.1);g.stroke();
   }
  },1.25);
  const wardrobePlaster=material(0xffffff,plasterMap,{bumpMap:plasterMap,bumpScale:.018,shininess:28,specular:0x757b72});
  stairFloor(1.4,5.9,3.4,7.96,wardrobeY,wardrobeFloor);
  stairFloor(1.7,-3.5,5.8,3.4,wardrobeY,wardrobeFloor);
  stairFloor(1.7,3.4,3.4,5.9,wardrobeY,wardrobeFloor);
  box(1.25,wardrobeY,5.9,1.4,-1.02,8.1,wardrobeWhite,true);
  box(1.4,wardrobeY,7.94,3.4,wardrobeTop,8.12,wardrobeWhite,true);
  // Плотные белые боковины спуска продолжаются до пола, без открытого пустого пространства.
  box(3.4,-3.89,7.94,8.8,-1.87,8.12,wardrobeWhite,true);
  box(1.4,wardrobeY,5.76,1.7,wardrobeTop,5.9,wardrobeWhite,true);
  box(3.3,wardrobeY,5.76,3.4,wardrobeTop,5.9,wardrobeWhite,true);
  box(1.7,wardrobeY+2.3,5.76,3.3,wardrobeTop,5.9,wardrobeWhite,true);
  for(const u of [1.7,3.3])box(u-.025,wardrobeY,5.74,u+.025,wardrobeY+2.32,5.925,wardrobeWhite);
  box(1.675,wardrobeY+2.3,5.74,3.325,wardrobeY+2.34,5.925,wardrobeWhite);
  box(1.4,wardrobeTop,5.9,3.4,wardrobeTop+.08,7.96,wardrobeWhite);
  // Панели и низкий реечный потолок — как на снимках подвального помещения.
  function wardrobePanelWall(x1,z1,x2,z2){
   box(x1,wardrobeY,z1,x2,wardrobeTop,z2,wardrobeWhite,true);
   if(x2-x1<.2){
    const front=x2;
    for(let z=z1+.14;z<z2;z+=.14)box(front,wardrobeY,z,front+.006,wardrobeTop,z+.009,wardrobeJoint);
   }else{
    const front=z2;
    for(let x=x1+.14;x<x2;x+=.14)box(x,wardrobeY,front,x+.009,wardrobeTop,front+.006,wardrobeJoint);
   }
  }
  wardrobePanelWall(1.55,-3.5,1.7,5.76);
  wardrobePanelWall(1.7,-3.65,5.95,-3.5);
  box(5.8,wardrobeY,-3.5,5.95,wardrobeTop,3.55,wardrobePlaster,true);
  box(3.4,wardrobeY,3.4,5.8,wardrobeTop,3.55,wardrobePlaster,true);
  box(3.4,wardrobeY,3.55,3.55,wardrobeTop,5.76,wardrobeWhite,true);
  // Три секции: широкие проёмы между фактурными простенками, пол остаётся единым.
  for(const [a,b] of [[2.85,3.4],[.65,1.1],[-2,-1.35],[-3.5,-3.25]])
   box(3.3,wardrobeY,a,3.45,wardrobeTop,b,wardrobePlaster,true);
  for(const [a,b] of [[-1.8,-1.65],[.65,.8]])
   box(3.45,wardrobeY,a,5.8,wardrobeTop,b,wardrobePlaster,true);
  box(3.3,wardrobeY+2.21,-3.5,3.45,wardrobeTop,3.4,wardrobePlaster,true);
  for(const [a,b] of [[1.1,2.85],[-1.35,.65],[-3.25,-2]]){
   for(const z of [a,b])box(3.275,wardrobeY,z-.025,3.475,wardrobeY+2.23,z+.025,wardrobeWhite);
   box(3.275,wardrobeY+2.19,a-.025,3.475,wardrobeY+2.24,b+.025,wardrobeWhite);
   box(3.24,wardrobeY+.001,a,3.5,wardrobeY+.012,a+.014,p.gold);
   mark('wardrobeBayPortal',3.37,(a+b)/2,.2,b-a,{level:wardrobeY,clearHeight:2.19});
  }
  box(1.7,wardrobeTop,-3.5,5.8,wardrobeTop+.08,3.4,wardrobeWhite);
  box(1.7,wardrobeTop,3.4,3.4,wardrobeTop+.08,5.76,wardrobeWhite);
  // Снаружи низкий потолок закрыт до низа перекрытия первого этажа.
  // Заполнение скрывает верхние стороны плит с лестницы, не меняя внутренний потолок.
  const wardrobeCeilingSlabTop=wardrobeTop+.08,wardrobeEnclosureTop=-.14;
  box(1.7,wardrobeCeilingSlabTop,-3.5,5.8,wardrobeEnclosureTop,3.4,p.cream);
  box(5.8,wardrobeTop,-3.5,5.95,wardrobeEnclosureTop,3.65,p.cream);
  box(1.7,wardrobeTop,3.4,5.8,wardrobeEnclosureTop,3.65,p.cream);
  box(1.7,wardrobeCeilingSlabTop,3.65,3.4,wardrobeEnclosureTop,5.9,p.cream);
  box(1.4,wardrobeCeilingSlabTop,5.9,3.4,wardrobeEnclosureTop,7.96,wardrobeWhite);
  for(let z=-3.5;z<5.76;z+=.12){
   const end=z<3.4?5.8:3.4;
   box(1.71,wardrobeTop-.008,z,end-.01,wardrobeTop,z+.008,wardrobeJoint);
  }
  for(const z of [-2.15,1.0,3.4]){
   const end=z<3.4?5.8:3.4;
   box(1.7,wardrobeTop-.18,z-.075,end,wardrobeTop,z+.075,wardrobeWhite);
  }
  // Плинтус и потолочный профиль не пересекают открытые проходы.
  for(const y of [wardrobeY+.035,wardrobeTop-.045]){
   box(1.7,y-.025,-3.5,1.735,y+.025,5.74,wardrobeWhite);
   box(5.765,y-.025,-3.5,5.8,y+.025,3.4,wardrobeWhite);
   box(1.7,y-.025,-3.5,5.8,y+.025,-3.465,wardrobeWhite);
   box(3.45,y-.025,3.365,5.8,y+.025,3.4,wardrobeWhite);
  }
  // Поверхности перед лестницей: тонкие швы, план эвакуации и урна в углу.
  for(const z of [6.5,7.3])box(1.401,wardrobeY,z,1.406,-1.03,z+.006,p.seam);
  box(1.41,wardrobeY,7.55,1.69,wardrobeY+.43,7.84,wardrobeJoint,true);
  box(1.395,wardrobeY+.43,7.535,1.705,wardrobeY+.475,7.855,wardrobeWhite);
  at(1.415,6.75,-Math.PI/2,()=>{
   label('→',0,wardrobeY+1.55,-.02,.3,.19,'#477950','#fff',Math.PI);
   const plan=texture(384,256,(g,w,h)=>{
    g.fillStyle='#f4f5ee';g.fillRect(0,0,w,h);g.strokeStyle='#616e69';g.lineWidth=2;
    g.strokeRect(6,6,w-12,h-12);g.fillStyle='#6b7771';g.font='bold 18px Arial';g.fillText('ПЛАН ЭВАКУАЦИИ',36,30);
    g.strokeRect(35,65,310,83);for(let x=48;x<335;x+=40)g.strokeRect(x,70,27,32);
    g.strokeStyle='#428754';g.lineWidth=5;g.beginPath();g.moveTo(303,117);g.lineTo(75,117);g.lineTo(75,153);g.stroke();
    g.fillStyle='#6b7771';for(let y=178;y<235;y+=13)g.fillRect(29,y,w-60-(y%3)*25,2);
   });
   panel(-.48,wardrobeY+1.55,-.022,.48,.32,new THREE.MeshBasicMaterial({map:plan}),Math.PI);
  });
  // Белые планки с металлическими двойными крючками на двух высотах.
  let wardrobeHookCount=0;
  const hookRodGeo=new THREE.CylinderGeometry(1,1,1,6),hookTipGeo=new THREE.SphereGeometry(1,6,4);
  function hookRod(a,b,r){
   const start=new THREE.Vector3(...a),delta=new THREE.Vector3(...b).sub(start);
   quat.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());
   matrix.compose(start.addScaledVector(delta,.5),quat,scale.set(r,delta.length(),r)).premultiply(pose);
   const key=hookRodGeo.uuid+':'+p.steel.id;
   if(!batches.has(key))batches.set(key,{geo:hookRodGeo,mt:p.steel,list:[]});batches.get(key).list.push(matrix.clone());
  }
  function hookRow(x,z,ry,width,height,rowId,shelf=false){
   at(x,z,ry,()=>{
    box(-width/2,wardrobeY+height-.12,-.035,width/2,wardrobeY+height+.12,.015,wardrobeWhite);
    const n=Math.max(3,Math.floor(width/.21));
    const numbers=texture(1024,128,(g,w,h)=>{
     g.fillStyle='#eeeeea';g.fillRect(0,0,w,h);g.fillStyle='#4a514f';g.textAlign='center';g.font='18px Arial';
     for(let i=0;i<n;i++){const xx=(i+.5)*w/n;g.fillText(rowId+'-'+String(i+1).padStart(2,'0'),xx,24);g.fillText(String(i+1).padStart(2,'0'),xx,116)}
    });
    panel(0,wardrobeY+height,-.037,width,.24,new THREE.MeshBasicMaterial({map:numbers}),Math.PI);
    for(let i=0;i<n;i++){
     const xx=-width/2+(i+.5)*width/n,yy=wardrobeY+height;
     hookRod([xx,yy-.065,-.049],[xx,yy+.053,-.067],.008);
     hookRod([xx,yy+.053,-.067],[xx,yy+.088,-.1],.008);
     add(hookTipGeo,p.steel,xx,yy+.088,-.1,.012,.012,.012);
     for(const side of [-1,1]){
      hookRod([xx,yy-.055,-.05],[xx+side*.043,yy-.08,-.092],.007);
      hookRod([xx+side*.043,yy-.08,-.092],[xx+side*.051,yy-.044,-.11],.007);
      add(hookTipGeo,p.steel,xx+side*.051,yy-.044,-.11,.01,.01,.01);
     }
     for(const yy2 of [-.084,.072])add(hookTipGeo,p.steel,xx,yy+yy2,-.048,.008,.008,.004);
    }
    if(shelf)box(-width/2-.02,wardrobeY+height+.135,-.23,width/2+.02,wardrobeY+height+.17,.035,wardrobeWhite);
    wardrobeHookCount+=n;mark('wardrobeHookRow',0,0,width,.25,{level:wardrobeY,height,hooks:n,rowId,shelf});
   });
  }
  for(const [z,width,id] of [[2.1,2.15,'A'],[-.5,2.15,'B'],[-2.65,1.35,'C']]){
   hookRow(5.775,z,Math.PI/2,width,1.92,id,true);
   hookRow(5.775,z,Math.PI/2,width,1.13,id+'2');
  }
  for(const [z,ry,id] of [[3.365,0,'D'],[.825,Math.PI,'E'],[.615,0,'F'],[-1.625,Math.PI,'G'],[-1.825,0,'H'],[-3.465,Math.PI,'I']]){
   hookRow(4.65,z,ry,2.08,1.92,id,true);
   hookRow(4.65,z,ry,2.08,1.13,id+'2');
  }
  // У дальней стены прохода остаётся несколько настенных крючков; напольных стоек нет.
  hookRow(1.735,-.1,-Math.PI/2,1.55,1.92,'J',false);
  // Объёмные куртки: мягкий силуэт, рукава, воротник, молния и карманы.
  const coatGeo=new THREE.BufferGeometry(),coatVertices=[],coatIndices=[];
  const rows=12,cols=12;
  for(let r=0;r<=rows;r++){
   const t=r/rows,y=-t*.94;
   const half=t<.18?.12+t*.66:t<.3?.24:.23-(t-.3)*.035;
   for(let c=0;c<=cols;c++){
    const a=c/cols*Math.PI*2;
    coatVertices.push(Math.cos(a)*half,y,-.09+Math.sin(a)*(.07+.025*Math.sin(t*Math.PI)));
   }
  }
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
   const n=r*(cols+1)+c;coatIndices.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);
  }
  coatGeo.setAttribute('position',new THREE.Float32BufferAttribute(coatVertices,3));coatGeo.setIndex(coatIndices);coatGeo.computeVertexNormals();
  const cloth=material(0x1e2427,null,{shininess:8,side:THREE.DoubleSide}),khakiCloth=material(0x9c9380,null,{shininess:5,side:THREE.DoubleSide}),
   navyCloth=material(0x303946,null,{shininess:10,side:THREE.DoubleSide}),zipMat=material(0x606666,null,{shininess:28});
  function hungCoat(x,z,ry,mt,scale=1){
   at(x,z,ry,()=>{
    const y=wardrobeY+1.96;
    add(coatGeo,mt,0,y,-.025,scale,scale,scale);
    for(const side of [-1,1]){
     const a=[side*.18*scale,y-.16*scale,-.11],b=[side*.32*scale,y-.7*scale,-.11];
     const length=new THREE.Vector3(...a).distanceTo(new THREE.Vector3(...b));
     add(new THREE.CylinderGeometry(.079*scale,.06*scale,length,10),mt,(a[0]+b[0])/2,(a[1]+b[1])/2,-.11,1,1,1,0,0,side*.25);
     rod([side*.085*scale,y-.57*scale,-.19],[side*.17*scale,y-.59*scale,-.19],.007,zipMat);
    }
    add(new THREE.TorusGeometry(.09*scale,.025*scale,6,14,Math.PI*1.65),mt,0,y-.015,-.095,1,1,1,Math.PI/2,0,0);
    rod([0,y-.1,-.197],[0,y-.88*scale,-.197],.004,zipMat);
    add(ballGeo,zipMat,0,y-.49,-.204,.009,.023,.006);
    mark('wardrobeWallCoat',0,-.1,.65,.3,{level:wardrobeY,wallMounted:true});
   });
  }
  for(const [z,mt,s] of [[2.38,cloth,1],[1.45,khakiCloth,.96],[-.25,navyCloth,1],[-2.6,cloth,.91]])hungCoat(5.72,z,Math.PI/2,mt,s);
  hungCoat(4.4,3.29,0,khakiCloth,1);hungCoat(4.95,-3.39,Math.PI,navyCloth,.97);
  hungCoat(1.8,-.3,-Math.PI/2,khakiCloth,.94);
  // Квадратные светильники, дымовые датчики, вентиляция и кабель вдоль потолка.
  for(const [u,v] of [[2.5,6.9],[2.5,4.5],[2.5,1.75],[2.5,-1.8],[4.65,2.0],[4.65,-.55],[4.65,-2.65]]){
   box(u-.27,wardrobeTop-.045,v-.27,u+.27,wardrobeTop,v+.27,wardrobeJoint);
   box(u-.245,wardrobeTop-.052,v-.245,u+.245,wardrobeTop-.046,v+.245,p.bulb);
  }
  for(const [u,v] of [[2.5,3.1],[4.65,-1.3]])add(ballGeo,wardrobeWhite,u,wardrobeTop-.045,v,.065,.035,.065);
  box(1.77,wardrobeTop-.26,-3.45,1.93,wardrobeTop-.06,5.7,wardrobeWhite);
  rod([1.96,wardrobeTop-.12,-3.4],[1.96,wardrobeTop-.12,5.65],.012,p.steel);
  box(2.12,wardrobeY+2.05,-3.475,2.66,wardrobeY+2.27,-3.43,wardrobeWhite);
  for(let x=2.15;x<2.64;x+=.035)box(x,wardrobeY+2.08,-3.42,x+.012,wardrobeY+2.24,-3.414,wardrobeJoint);
  box(1.71,wardrobeY+1.38,4.9,1.77,wardrobeY+1.53,5.05,p.red);
  for(const [u,v] of [[2.5,4.3],[2.55,.05],[4.8,1.9],[4.8,-2.5]]){
   const light=new THREE.PointLight(0xf4f6f1,.18,7,2);light.position.set(u,wardrobeTop-.2,v).applyMatrix4(pose);scene.add(light);
  }
  mark('wardrobeBasement',3.75,-.05,4.1,6.9,{level:wardrobeY,ceiling:wardrobeTop,bays:3,hookCount:wardrobeHookCount,floorStands:0,clearEntry:true});
  mark('wardrobeEntry',2.5,4.65,1.6,2.5,{level:wardrobeY,clear:true,floorStands:0});
  mark('wardrobeLowerLanding',2.4,6.95,2,2.06,{level:wardrobeY,connected:true});
  mark('wardrobeReturnFlight',4.9675,7.025,3.135,1.85,{baseY:-1.87,topY:-3.74,underUpstairs:true});
  // END COLLEGE1_WARDROBE
  // Продолжение первого этажа по новым фотографиям: окно слева от прохода,
  // ниша напротив него, длинный коридор вправо, закрытый выход в торце.
  // Единый деревянный откос перекрывает торцы штукатурки без совпадающих поверхностей.
  box(1.46,0,7.91,1.54,2.72,9.64,p.oak,true);
  box(3.26,0,7.91,3.34,2.72,9.64,p.oak,true);
  box(1.46,2.62,7.91,3.34,2.72,9.64,p.oak);
  stairFloor(1.52,8,3.28,9.6,0,p.corridor);
  mark('stairContinuationPortal',2.4,8.775,1.72,1.73,{clearHeight:2.62,continuousLining:true});
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
   box(8.68,base+.82,v-.96,8.87,base+.89,v+.96,p.counter);
   box(8.71,base+.13,v-.81,8.79,base+.73,v+.81,p.white);
   for(let z=v-.76;z<v+.81;z+=.1)box(8.685,base+.17,z,8.72,base+.69,z+.035,p.trim);
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
   stairRail([2.06,0,1.94],[2.06,0,7.95]);
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
      const roomDepth=wing==='upper-right'&&d.v===9.6?1.15:1.6,roomScale=roomDepth/1.6;
      stairFloor(-1.25,0,1.25,roomDepth,0,upperWoodFloor);
      box(-1.4,0,0,-1.25,3.3,roomDepth+.15,p.cream,true);box(1.25,0,0,1.4,3.3,roomDepth+.15,p.cream,true);
      box(-1.25,0,roomDepth,1.25,3.3,roomDepth+.15,p.cream,true);box(-1.25,3.3,0,1.25,3.43,roomDepth,p.ceiling);
      if(d.n==='207'&&wing==='upper-right'){
       const alphabet=texture(512,512,(g,w,h)=>{
        g.fillStyle='#f2efe3';g.fillRect(0,0,w,h);g.fillStyle='#a64d56';g.fillRect(0,0,w,36);g.fillRect(0,h-30,w,30);
        g.fillStyle='#44678d';g.fillRect(0,36,24,h-66);g.fillRect(w-24,36,24,h-66);
        g.fillStyle='#324345';g.textAlign='center';g.font='bold 25px Arial';g.fillText('ENGLISH ALPHABET',w/2,76);
        for(let i=0;i<26;i++){
         const x=43+(i%5)*86,y=98+Math.floor(i/5)*62;
         g.strokeStyle='#869b9b';g.strokeRect(x,y,78,54);g.font='25px Arial';g.fillText(String.fromCharCode(65+i)+' '+String.fromCharCode(97+i),x+39,y+36);
        }
       });panel(0,1.75,roomDepth-.005,1.15,1.2,new THREE.MeshBasicMaterial({map:alphabet}),Math.PI);
      }
      for(const x of [-.69,.69]){
       box(x-.32,.72,.79*roomScale,x+.32,.76,1.25*roomScale,p.trim,true);
       for(const a of [-.25,.25])rod([x+a,0,.91*roomScale],[x+a,.72,.91*roomScale],.014,p.steel);
       box(x-.2,.42,.38*roomScale,x+.2,.47,.72*roomScale,p.blue);
       box(x-.2,.48,.7*roomScale,x+.2,.87,.735*roomScale,p.blue);
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
   // Открытый проход в общий лестничный холл, соединённый с первым этажом.
   for(const u of [-30.05,-28.55])box(u-.035,0,-1.68,u+.035,2.72,-1.43,p.oak);
   box(-30.085,2.67,-1.68,-28.515,2.74,-1.43,p.oak);
   label('ШЫҒУ · ВЫХОД',-29.3,2.9,-1.65,.72,.17,'#4c8398','#fff',Math.PI);
   upperMark('upperLeftFarStairPassage',-29.3,-1.6,1.5,.2,{open:true,stairInteriorDeferred:false});
   upperMark('upperLeftCorridor',-14.2,-2.85,33,2.5,{classrooms:10,closedDoors:10,crossBeams:2});
  }finally{pose=upperSavedPose}
 });

 // Второй лестничный холл. U направлен вправо по миру, V — вглубь от 216.
 // Из единственного нижнего входа смотрим к -U: окно слева, подъём справа по +V.
 at(15.4,9.45,Math.PI,()=>{
  const oakPanel=p.cream.clone();oakPanel.side=THREE.DoubleSide;
  // Связующий проход. В его левой стене ровно один проём в лестничный зал.
  stairFloor(-1.8,1.6,0,4.85,0);
  box(-.15,0,1.6,0,3.35,5,p.cream,true);
  box(-1.95,-4.05,1.6,-1.8,3.6,3,p.oak,true);
  box(-1.95,-4.05,4.6,-1.8,3.6,9.75,p.oak,true);
  box(-1.95,2.7,3,-1.8,3.6,4.6,p.oak,true);
  for(const v of [3,4.6])box(-1.98,0,v-.025,-1.77,2.73,v+.025,p.frame);
  box(-1.98,2.67,2.975,-1.77,2.74,4.625,p.frame);
  at(-1.77,3.8,-Math.PI/2,()=>label('ШЫҒУ · ВЫХОД',0,2.94,-.02,.7,.17,'#4c8398','#fff',Math.PI));
  box(-1.8,3.3,1.6,-.15,3.43,4.85,p.ceiling);
  for(let v=1.8;v<4.85;v+=.65)box(-.158,.08,v-.003,-.15,3.3,v+.003,p.seam);
  box(-.175,0,1.6,-.15,.09,4.85,p.trim);
  for(const v of [2.4,4.2])box(-1.27,3.276,v-.29,-.68,3.3,v+.29,p.bulb);
  // Нижний связующий коридор продолжается прямо за лестничным залом.
  stairFloor(-1.8,4.85,0,9.8,0);
  box(0,0,4.85,.15,3.35,9.8,p.cream,true);
  box(-1.8,0,4.6,-1.775,3.3,9.6,p.cream);
  box(-1.8,3.3,4.85,0,3.43,9.8,p.ceiling);
  for(const v of [5.35,6.1,6.85,7.6,8.35,9.1]){
   box(-1.774,.08,v-.003,-1.768,3.3,v+.003,p.seam);
   box(-.006,.08,v-.003,.002,3.3,v+.003,p.seam);
  }
  for(const x of [-1.77,-.025])box(x,0,4.85,x+.02,.08,9.6,granite);
  for(const v of [5.9,8.65])box(-1.195,3.276,v-.295,-.605,3.3,v+.295,p.bulb);
  // Общая площадка перед маршами — без столба и второго прохода сбоку.
  stairFloor(-5.65,2.4,-1.8,4.8,0);
  box(-5.8,-4.05,2.25,-5.65,7.15,9.75,p.oak,true);
  box(-5.65,-4.05,2.25,-1.8,7.15,2.4,p.oak,true);
  box(-5.65,-4.05,9.6,-1.8,7.15,9.75,p.oak,true);
  // Два встречных входа в общий верхний холл: стена справа, лестница слева.
  box(-1.95,3.74,1.6,-1.8,7.15,3,p.cream,true);
  box(-.9,3.74,0,-.75,7.15,2.4,p.cream,true);
  box(-1.8,3.74,2.25,-.75,7.15,2.4,p.cream,true);
  box(-5.65,7.1,2.4,.75,7.24,9.8,p.white);
  // Стена с окнами светлая, деревянная отделка остаётся ниже промежуточной площадки.
  box(-5.646,1.87,4.8,-5.62,7.1,9.6,p.cream);
  for(let v=4.85;v<9.6;v+=.8)box(-5.615,1.89,v-.003,-5.61,7.1,v+.003,p.seam);
  box(-5.61,1.87,4.8,-5.575,1.96,9.6,granite);
  for(const [a,b] of [[-5.6,-4.42],[-4.3,-3.12],[-3,-1.85]]){
   const mid=(a+b)/2;
   stairQuad([a,4.15,9.58,mid,3.3,9.58,mid,7.08,9.58,a,7.08,9.58],oakPanel);
   stairQuad([mid,3.3,9.58,b,4.15,9.58,b,7.08,9.58,mid,7.08,9.58],oakPanel);
   box(a-.035,0,9.525,a+.035,7.08,9.58,p.oak);
  }
  box(.715,0,4.8,.74,7.1,9.6,p.oak);
  for(const [a,b] of [[4.85,6.32],[6.44,7.91],[8.03,9.55]]){
   const mid=(a+b)/2;
   stairQuad([.705,4.15,a,.705,3.3,mid,.705,7.08,mid,.705,7.08,a],oakPanel);
   stairQuad([.705,3.3,mid,.705,4.15,b,.705,7.08,b,.705,7.08,mid],oakPanel);
   box(.685,0,b,.715,7.08,b+.06,p.oak);
  }
  // Цельная лестничная плита с закрытыми белыми боковинами и ступенчатым верхом.
  function solidSecondFlight(x1,x2,baseY,returning=false,descending=false,run=3.135){
   stairFlight(x1,x2,baseY,returning,descending,run);
  }
  at(0,2.8,0,()=>{
   stairFloor(-5.45,5.135,-1.9,6.75,1.87);
   stairFloor(-5.45,5.135,-1.9,6.75,-1.87);
   solidSecondFlight(-3.4,-1.9,0);
   solidSecondFlight(-5.45,-3.95,1.87,true);
   solidSecondFlight(-5.45,-3.95,0,false,true);
   at(0,.285,0,()=>solidSecondFlight(-3.4,-1.9,-1.87,true,true,2.85));
   stairRail([-3.31,0,2],[-3.31,1.87,5.135],true);
   rod([-2.025,1.04,2],[-2.025,2.91,5.135],.03,p.steel);
   stairRail([-4.04,3.74,2],[-4.04,1.87,5.135],true);
   // У окна пристенный поручень: отдельной полосы пола вдоль батарей нет.
   rod([-5.39,4.78,2],[-5.39,2.91,5.135],.03,p.steel);
   rod([-5.39,4.78,2],[-5.60,4.78,2],.03,p.steel);
   rod([-5.39,2.91,5.135],[-5.60,2.91,5.135],.03,p.steel);
   for(const v of [2.1,4.45]){
    const y=4.78-(v-2)/3.135*1.87;
    rod([-5.39,y-.06,v],[-5.60,y-.06,v],.012,p.steel);
   }
   rod([-5.53,1.04,2],[-5.53,-.83,5.135],.03,p.steel);
   stairRail([-4.04,0,2],[-4.04,-1.87,5.135],true);
   stairRail([-3.31,-1.87,5.135],[-3.31,-3.74,2.285],true);
   rod([-2.025,-.83,5.135],[-2.025,-2.7,2.285],.03,p.steel);
   // Поручни непрерывно огибают края колодца на разворотах.
   for(const y of [0,1.87,-1.87]){
    const z=y===0?2:5.135;
    for(const h of [.27,.52,.77,1.04])rod([-4.04,y+h,z],[-3.31,y+h,z],h>1?.033:.013,p.steel);
    for(const x of [-4.04,-3.31])add(ballGeo,p.steel,x,y+1.04,z,.033,.033,.033);
   }
   for(const y of [1.87,-1.87]){
    rod([-5.53,y+1.04,5.135],[-5.53,y+1.04,6.65],.03,p.steel);
    rod([-5.53,y+1.04,6.65],[-2.025,y+1.04,6.65],.03,p.steel);
    rod([-2.025,y+1.04,5.135],[-2.025,y+1.04,6.65],.03,p.steel);
   }
  });
  // Верхняя площадка доходит до сплошной стены, за перилами только колодец лестницы.
  stairFloor(-5.65,2.4,.75,4.8,3.74);
  box(-5.65,3.57,2.4,.75,3.6,4.8,p.trim);
  stairFloor(-.75,0,.75,2.4,3.74);
  stairFloor(-1.8,4.8,.75,9.8,3.74);
  stairRail([-4.04,3.74,4.71],[-1.71,3.74,4.71]);
  stairRail([-1.71,3.74,4.71],[-1.71,3.74,9.6]);
  add(ballGeo,p.steel,-1.71,4.78,4.71,.033,.033,.033);
  // За ограждением нет наружной пустоты: узкий торец закрыт до нижнего уровня.
  box(0,-.14,4.85,.75,3.6,5,p.cream,true);
  box(.75,0,4.85,.9,7.1,9.95,p.cream,true);
  box(.75,3.74,0,.9,7.1,4.85,p.cream,true);
  box(-.75,7.04,0,.75,7.17,2.4,p.ceiling);
  box(-1.8,7.04,2.4,.75,7.17,9.8,p.ceiling);
  for(let v=.1;v<9.8;v+=.7)box(.74,3.82,v-.003,.75,7.04,v+.003,p.seam);
  box(.72,3.74,0,.75,3.83,9.8,granite);
  for(const v of [1,4.1,7.4])box(-.79,7.016,v-.29,-.2,7.04,v+.3,p.bulb);
  box(.47,3.74,.8,.75,4.17,1.09,guardWhite,true);box(.46,4.17,.79,.76,4.22,1.1,p.trim);
  // Нижнее окно слева от входа, как на фронтальном снимке холла.
  panel(-3.8,1.9,2.415,1.7,2.1,outside);
  for(const u of [-4.685,-3.8,-2.915])box(u-.024,.8,2.41,u+.024,3,2.47,p.frame);
  for(const y of [.82,2.98])box(-4.71,y-.025,2.41,-2.89,y+.025,2.47,p.frame);
  for(let y=1.6;y<3;y+=.13){box(-4.65,y,2.48,-2.95,y+.073,2.495,p.blind);box(-4.65,y+.075,2.48,-2.95,y+.104,2.493,p.blindLight)}
  box(-4.76,.77,2.39,-2.84,.84,2.85,p.counter);
  box(-4.58,.15,2.46,-3.02,.71,2.64,p.white);
  for(let u=-4.53;u<-3.01;u+=.095)box(u,.18,2.635,u+.035,.68,2.675,p.trim);
  // Пальмы на фото имеют короткие зелёные стебли и перистые дугообразные ветви.
  const palmLeaf=material(0x3e7938,null,{side:THREE.DoubleSide,shininess:12});
  function windowPalm(u,v){
   const sill=.84,soil=sill+.27;
   add(new THREE.CylinderGeometry(.145,.11,.27,22),p.white,u,sill+.135,v,1,1,1);
   add(rodGeo,p.soil,u,soil,v,.132,.009,.132);
   for(let i=0;i<18;i++){
    const a=i*Math.PI/9;
    rod([u+Math.cos(a)*.113,sill+.025,v+Math.sin(a)*.113],[u+Math.cos(a)*.143,soil-.025,v+Math.sin(a)*.143],.003,p.trim);
   }
   for(let branch=0;branch<12;branch++){
    const angle=Math.PI*.1+branch*Math.PI*.8/11,length=.43+(branch%3)*.065,hub=soil+.22+(branch%3)*.045;
    const point=t=>[u+Math.cos(angle)*length*t,hub+.36*Math.sin(Math.PI*t)-.12*t,v+Math.sin(angle)*length*t];
    rod([u,soil,v],point(0),.005,p.green);
    for(let k=0;k<9;k++)rod(point(k/9),point((k+1)/9),.004,palmLeaf);
    for(let k=1;k<10;k++){
     const t=k/11,pos=point(t),length=.06+.13*Math.sin(Math.PI*t);
     for(const side of [-1,1]){
      const direction=angle+side*1.25;
      add(leafGeo,palmLeaf,...pos,length/.31,.25,.16,0,-direction,-.2);
     }
    }
   }
   mark('secondStairWindowPalm',u,v,.95,.8,{sill,fronds:12,leaflets:216,shortGreenStems:true});
  }
  for(const u of [-4.25,-3.35])windowPalm(u,2.66);
  // Наружная дверь на соседней с окном стене закрыта; вход из коридора остаётся один.
  at(-5.63,3.05,-Math.PI/2,()=>{
   box(-.53,0,-.035,.53,2.48,.035,p.frame);
   box(-.47,.04,-.067,.47,2.41,-.036,p.oak);
   for(const y of [.12,1.02])box(-.4,y,-.078,.4,y+.06,-.068,p.frame);
   for(const x of [-.4,.34])box(x,.12,-.078,x+.06,2.3,-.068,p.frame);
   box(-.4,2.24,-.078,.4,2.3,-.068,p.frame);
   rod([.31,1.05,-.105],[.31,1.26,-.105],.014,p.iron);
   label('ШЫҒУ · ВЫХОД',0,2.7,-.075,.77,.18,'#4c8398','#fff',Math.PI);
   box(-.5,2.62,-.1,-.42,2.79,-.04,p.red);
  });
  // Верхние окна вдоль возвратного марша, без площадки перед ними.
  for(const v of [6.15,8.4]){
   panel(-5.605,5.34,v,1.7,2.5,outside,Math.PI/2);
   for(const z of [v-.885,v,v+.885])box(-5.64,4.08,z-.024,-5.57,6.6,z+.024,p.frame);
   for(const y of [4.1,6.58])box(-5.64,y-.025,v-.91,-5.57,y+.025,v+.91,p.frame);
   for(let y=4.95;y<6.6;y+=.13){box(-5.56,y,v-.85,-5.545,y+.073,v+.85,p.blind);box(-5.558,y+.075,v-.85,-5.544,y+.104,v+.85,p.blindLight)}
   box(-5.63,4.03,v-.96,-5.5,4.1,v+.96,p.counter);
   box(-5.61,3.18,v-.78,-5.54,3.94,v+.78,p.white);
   for(let z=v-.73;z<v+.78;z+=.095)box(-5.55,3.21,z,-5.52,3.91,z+.035,p.trim);
  }
  // Бак стоит напротив входа у задней стены, вне подхода к спуску.
  const binBlue=material(0x176cb0,null,{shininess:45});
  box(-5.56,.12,4.23,-5.06,1.08,4.77,binBlue,true);
  box(-5.6,1.08,4.2,-5.02,1.16,4.8,binBlue);
  box(-5.54,1.155,4.26,-5.08,1.17,4.74,p.black);
  for(const v of [4.32,4.68])add(rodGeo,p.iron,-5.46,.085,v,.06,.05,.06,0,0,Math.PI/2);
  label('♻',-5.055,.75,4.5,.22,.27,null,'#dce6e5',Math.PI/2);
  function cage(x,y,v,w,h,d,mt){
   box(x-w/2,y,v-d/2,x+w/2,y+.04,v+d/2,mt);
   for(const a of [-w/2,w/2])for(const b of [-d/2,d/2])rod([x+a,y,v+b],[x+a,y+h,v+b],.006,p.steel);
   for(let a=-w/2;a<=w/2+.001;a+=.065)for(const b of [-d/2,d/2])rod([x+a,y,v+b],[x+a,y+h,v+b],.003,p.steel);
   for(let b=-d/2;b<=d/2+.001;b+=.065)for(const a of [-w/2,w/2])rod([x+a,y,v+b],[x+a,y+h,v+b],.003,p.steel);
   for(const yy of [y+h*.45,y+h])for(const b of [-d/2,d/2])rod([x-w/2,yy,v+b],[x+w/2,yy,v+b],.004,p.steel);
  }
  cage(-5.28,.03,3.85,.55,.42,.36,p.trim);cage(-5.28,.47,3.85,.32,.36,.26,binBlue);
  collider(-5.56,0,3.66,-5,.85,4.05);
  add(ballGeo,p.white,-5.28,.71,3.85,.035,.06,.035);
  add(rodGeo,p.red,-5.52,1.55,3.85,.08,.46,.08);label('1',-5.515,1.9,3.85,.17,.19,'#b73735','#fff',Math.PI/2);
  const orange=material(0xb86e35,null,{shininess:12});
  box(-5.52,.09,5.02,-5.12,.14,5.37,orange);box(-5.52,.15,5.33,-5.12,.57,5.36,orange);
  for(const u of [-5.49,-5.15])for(const v of [5.05,5.32])rod([u,-.34,v],[u,.09,v],.01,p.iron);
  collider(-5.53,-.34,5.01,-5.11,.59,5.38);
  // После разворота в подвале дверь расположена именно под правым подъёмом.
  stairFloor(-3.4,4.7,-1.9,5.34,-3.74);
  box(-3.66,-4.05,4.6,-1.8,-.9,4.77,p.oak,true);
  at(-2.725,4.85,Math.PI,()=>{
   box(-.59,-3.74,-.065,.59,-1.34,.035,p.frame,true);
   box(-.52,-3.7,-.082,.52,-1.42,-.066,p.oak);
   label('не заходить',0,-2.12,-.09,.92,.23,'#e7dfce','#9d342f',Math.PI);
   rod([-.36,-2.81,-.12],[-.36,-2.63,-.12],.012,p.iron);
  });
  for(const [u,y,v] of [[-3.8,3.56,3.7],[-.9,3.27,3.8],[-3.8,6.99,8.7]])add(rodGeo,p.bulb,u,y,v,.14,.022,.14);
  mark('kitchenRestrictedDoor',-2.725,4.85,1.18,.14,{level:-3.74,closed:true,text:'не заходить',interactive:false,underUpFlight:true});
  mark('secondStairKitchenTurn',-3.675,8.7,3.55,1.3,{level:-1.87,turnDegrees:180});
  mark('secondStairUpFootprint',-2.65,6.3675,1.5,3.135,{level:0,axis:'v',direction:'right-from-entry'});
  mark('secondStairHall',-2.45,4.8,6.4,9.6,{levels:[-3.74,-1.87,0,1.87,3.74],kitchenUnderUpFlight:true,windowGallery:false,groundDoorways:1,groundThroughPassage:true,upperEnclosed:true,upperThroughPassage:true,centralWellWidth:.55,windowSill:4.03,upAxis:'v',connects:'ground-right-to-upper-left',upFlights:2});
  mark('secondStairGroundEntry',-.9,1.6,1.64,.2,{level:0,open:true});
  mark('secondStairRoomDoor',-1.8,3.8,.15,1.6,{level:0,open:true,onlyGroundEntrance:true});
  mark('secondStairUpperRoomDoor',-1.8,3.8,.15,1.6,{level:3.74,open:true});
  mark('secondStairEmergencyExit',-5.63,3.05,.14,1.06,{level:0,closed:true,interactive:false,wall:'beside-window'});
  mark('secondStairUpperEntry',0,0,1.5,.2,{level:3.74,open:true,nearClassroom:'216'});
  mark('secondStairFarUpperEntry',-.65,9.8,1.6,.2,{level:3.74,open:true});
  // BEGIN COLLEGE1_FINAL_GROUND_WING
  // Первый этаж за вторым лестничным холлом: тот же переход, отдельный нижний коридор.
  const finalMark=(kind,u,v,w,d,extra={})=>mark(kind,u,v,w,d,{level:0,...extra});
  const finalFloorMap=texture(384,384,(g,w,h)=>{
   g.fillStyle='#a7b9bd';g.fillRect(0,0,w,h);
   for(let i=0;i<18000;i++){
    g.fillStyle=['#ecf2ecaa','#5a737b65','#c7d5d184','#849c9d66'][i%4];
    g.fillRect(rand()*w,rand()*h,.4+rand()*1.2,.4+rand()*1.2);
   }
  },1.2);
  const finalFloor=material(0xffffff,finalFloorMap,{shininess:85,specular:0x99aeb0});
  const finalGlass=material(0xb7cbc6,null,{transparent:true,opacity:.32,depthWrite:false,side:THREE.DoubleSide,shininess:80});
  const finalFrost=material(0xe0e5db,null,{shininess:28});
  const finalDarkGlass=material(0x151c1d,null,{shininess:65,specular:0x7b9695});
  const finalDarkFrost=material(0x252e30,null,{shininess:35});
  const finalDoors=[
   {u:-.62,v:12.3,n:'114',w:1.12,dark:true},
   {u:-5.2,v:12.3,n:'116',w:1.12},
   {u:-6.9,v:9.8,n:'',w:.98,utility:true},
   {u:-11.1,v:12.3,n:'118',w:1.55,double:true},
   {u:-16.2,v:9.8,n:'117',w:1.55,double:true},
   {u:-25.55,v:12.3,n:'120',w:1.12},
   {u:-25.9,v:9.8,n:'119',w:1.55,double:true}
  ];
  stairFloor(-29.35,9.8,.75,12.3,0,finalFloor);
  stairFloor(-30,9.8,-29.35,12.3,.12,finalFloor);
  box(-30,3.3,9.8,.75,3.44,12.3,p.ceiling);
  box(.75,0,9.8,.9,3.4,12.45,p.cream,true);
  box(-30.15,0,9.65,-30,3.4,12.45,p.oak,true);
  for(const side of [9.8,12.3]){
   const cuts=finalDoors.filter(d=>d.v===side).map(d=>({a:d.u-d.w/2,b:d.u+d.w/2,top:2.48}));
   if(side===9.8)cuts.push({a:-1.8,b:0,top:2.7});
   cuts.sort((a,b)=>a.a-b.a);
   const za=side===9.8?9.65:12.3,zb=side===9.8?9.8:12.45,front=side===9.8?9.81:12.29;
   let edge=-30;
   for(const cut of cuts){
    if(cut.a>edge)box(edge,0,za,cut.a,3.3,zb,p.cream,true);
    box(cut.a,cut.top,za,cut.b,3.3,zb,p.cream,true);edge=cut.b;
   }
   box(edge,0,za,.75,3.3,zb,p.cream,true);
   for(let u=-29.8;u<.75;u+=.8){
    if(cuts.some(c=>u>c.a-.15&&u<c.b+.15))continue;
    box(u-.003,.075,front-.003,u+.003,3.3,front+.003,p.seam);
   }
   edge=-30;
   for(const cut of [...cuts,{a:.75,b:.75}]){
    box(edge,0,front-.012,cut.a,.08,front+.012,granite);
    box(edge,.56,front-.003,cut.a,.566,front+.003,p.seam);edge=cut.b;
   }
  }
  // Светлые откосы с тонким тёмным кантом, без двери поперёк связующего прохода.
  for(const u of [-1.8,0]){
   box(u-.035,0,9.58,u+.035,2.72,9.96,p.cream,true);
   box(u-.01,0,9.972,u+.01,2.72,9.98,p.iron);
  }
  box(-1.835,2.68,9.58,.035,2.76,9.96,p.cream);
  box(-1.81,2.7,9.972,.01,2.72,9.98,p.iron);
  label('ШЫҒУ · ВЫХОД',-.9,2.98,9.825,.71,.17,'#4c8398','#fff',0);
  box(-.355,0,8.89,-.085,.43,9.19,guardWhite,true);
  box(-.36,.405,8.885,-.08,.445,9.195,p.black);
  box(-.37,.445,8.875,-.07,.49,9.205,p.trim);
  box(-.322,.485,8.923,-.118,.499,9.157,guardWhite);
  finalMark('finalGroundStairPassage',-.9,7.25,1.8,5.1,{open:true,graniteFloor:true,straight:true});
  finalMark('finalGroundPortal',-.9,9.8,1.8,.4,{open:true,creamReveals:true});
  finalMark('finalGroundPassageBin',-.22,9.04,.3,.33,{outsidePortal:true});
  // Окно с жалюзи закрывает короткий торец. Батарея остаётся позади растений.
  panel(.732,1.9,11.05,2.06,2.16,outside,-Math.PI/2);
  for(const v of [10,11.05,12.1])box(.68,.79,v-.024,.745,3.02,v+.024,p.frame);
  for(const y of [.81,3])box(.68,y-.025,9.98,.745,y+.025,12.12,p.frame);
  for(let y=1.6;y<3;y+=.13){
   box(.655,y,10.02,.67,y+.073,12.08,p.blind);
   box(.653,y+.075,10.02,.668,y+.104,12.08,p.blindLight);
  }
  box(.29,.77,9.94,.78,.84,12.16,p.counter);
  box(.48,.14,10.28,.69,.71,11.82,p.white);
  for(let v=10.32;v<11.81;v+=.095)box(.44,.17,v,.49,.68,v+.035,p.trim);
  rod([.55,.16,10.17],[.55,.065,10.17],.012,p.white);
  rod([.55,.065,10.17],[.55,.065,12.08],.012,p.white);
  box(.5,3.06,10.97,.61,3.23,11.13,p.white);
  add(ballGeo,p.black,.51,3.2,10.02,.042,.037,.045);
  finalMark('finalGroundWindow',.73,11.05,.15,2.16,{blinds:'day-night',radiator:true,plantDisplay:true});
  // Пышные парные листья на зелёных стеблях и белая керамика с рёбрами.
  let finalPlantCount=0;
  function finalPlant(u,v,y,size=.7){
   const h=.29*size,r=.16*size,soil=y+h;
   add(new THREE.CylinderGeometry(r,r*.76,h,14),p.white,u,y+h/2,v,1,1,1);
   add(rodGeo,p.soil,u,soil,v,r*.91,.008,r*.91);
   for(let j=0;j<12;j++){
    const a=j*Math.PI/6;
    rod([u+Math.cos(a)*r*.79,y+.02,v+Math.sin(a)*r*.79],[u+Math.cos(a)*r*.98,soil-.025,v+Math.sin(a)*r*.98],.0024,p.trim);
   }
   for(let stem=0;stem<5;stem++){
    const a=stem*2.4,dx=Math.cos(a)*.17*size,dz=Math.sin(a)*.17*size,ht=(.46+(stem%3)*.06)*size;
    const point=t=>[u+dx*t,soil+ht*t,v+dz*t];
    rod(point(0),point(1),.005*size,p.green);
    for(let row=1;row<=4;row++){
     const t=row/4,pt=point(t);
     for(const side of [-1,1])add(leafGeo,p.green,...pt,.75*size,.85*size,.72*size,0,a+side*1.3,.35);
    }
   }
   finalPlantCount++;
  }
  // Два чёрных ступенчатых стеллажа и круглая белая подставка на колёсиках.
  for(const v of [10.17,11.93]){
   for(const u of [.04,.48])for(const z of [v-.23,v+.23])rod([u,0,z],[u,1.92,z],.012,p.iron);
   for(let row=0;row<4;row++){
    const y=.045+row*.52;
    box(.005,y,v-.27,.52,y+.035,v+.27,p.counter);
    finalPlant(.24,v,y+.035,row===3?.59:.65);
   }
   collider(-.015,0,v-.285,.53,2.1,v+.285);
   finalMark('finalGroundPlantRack',.255,v,.545,.57,{shelves:4,pots:4,blackFrame:true,woodShelves:true});
  }
  at(-.07,11.05,Math.PI/2,()=>{
   add(new THREE.TorusGeometry(.32,.012,6,36),p.white,0,.61,0,1,1,1);
   for(const x of [-.26,.26]){
    rod([x,.035,-.18],[x,.7,.03],.012,p.white);
    add(ballGeo,p.iron,x,.035,-.18,.028,.028,.028);
   }
   for(const [x,y,z,s] of [[0,.98,.01,.73],[-.23,.53,-.04,.7],[.19,.16,-.08,.65]]){
    add(rodGeo,p.white,x,y-.015,z,.14,.024,.14);
    rod([0,.04,0],[x,y-.03,z],.01,p.white);finalPlant(x,z,y,s);
   }
  });
  collider(-.4,0,10.63,.28,1.6,11.47);
  for(const v of [10.65,11.08,11.52])finalPlant(.49,v,.84,.6);
  finalMark('finalGroundWhitePlantStand',-.07,11.05,.68,.84,{pots:3,circular:true,wheels:true});
  finalMark('finalGroundWindowPlants',.17,11.05,1.05,2.3,{pots:finalPlantCount,racks:2});
  // Закрытые кабинеты: графитовые рамы, полосы матирования и круглые номера.
  function finalGroundDoor(d){
   const ry=d.v===9.8?Math.PI:0;
   at(d.u,d.v,ry,()=>{
    for(const [a,b] of [[-d.w/2-.13,-d.w/2],[d.w/2,d.w/2+.13]])box(a,0,-.02,b,3.3,.08,p.counter);
    box(-d.w/2,2.48,-.02,d.w/2,3.3,.08,p.counter);
    for(const x of [-d.w/2,d.w/2])box(x-.027,0,-.055,x+.027,2.48,.035,p.iron);
    for(const y of [.035,2.445])box(-d.w/2,y-.027,-.055,d.w/2,y+.027,.035,p.iron);
    const split=d.double?-d.w*.22:-d.w/2,mainA=split,mainB=d.w/2;
    if(d.utility){
     const metal=material(0x3b4344,null,{shininess:22});
     box(-d.w/2+.04,.07,-.04,d.w/2-.04,2.39,.02,metal);
     for(let x=-d.w/2+.07;x<d.w/2-.04;x+=.035)box(x,.085,-.046,x+.006,2.37,-.04,p.iron);
     label('ϟ',0,2.37,-.066,.22,.25,'#d3b445','#333b39',Math.PI);
    }else{
     box(-d.w/2,.04,.14,d.w/2,2.43,.22,d.dark?p.dark:p.cream);
     if(d.double){
      box(-d.w/2+.035,.075,-.028,split-.035,2.37,.005,finalFrost);
      box(split-.027,0,-.061,split+.027,2.48,.035,p.iron);
     }
     box(mainA+.035,.075,-.018,mainB-.035,2.37,.005,d.dark?finalDarkGlass:finalGlass);
     for(let y=.17;y<2.35;y+=.205)box(mainA+.035,y,-.035,mainB-.035,y+.082,-.018,d.dark?finalDarkFrost:finalFrost);
     const center=(mainA+mainB)/2;
     add(new THREE.CircleGeometry(1,28),p.gold,center,2.405,-.064,.14,.095,1,0,Math.PI);
     label(d.n,center,2.405,-.068,.23,.115,null,'#343a35',Math.PI);
     const brand=label('BQFQ',center,1.63,-.041,(mainB-mainA)*.75,.22,null,'#177caf',Math.PI);
     brand.name='office-brand-ground-after-stairs-'+d.n;
    }
    const handle=mainA+.12,hinge=mainB-.012;
    for(const y of [.35,1.21,2.17])box(hinge-.018,y-.06,-.068,hinge+.018,y+.06,-.038,p.iron);
    box(handle-.022,.98,-.084,handle+.022,1.2,-.067,p.iron);
    rod([handle,1.08,-.102],[handle+.14,1.08,-.102],.016,p.iron);
    add(ballGeo,p.gold,handle,1.015,-.097,.012,.018,.007);
    collider(-d.w/2,0,-.08,d.w/2,2.48,.08);
   });
   if(!d.utility){
    const c=new THREE.Vector3(d.u,0,d.v).applyMatrix4(pose);
    classroomDoors.push({number:d.n,brand:'BQFQ',x:c.x,z:c.z,width:d.w,level:0,wing:'ground-after-stairs',closed:true,open:false});
   }
   finalMark(d.utility?'finalGroundElectricalDoor':'finalGroundClassroomDoor',d.u,d.v,d.w,.16,{number:d.n,closed:true,open:false,dark:!!d.dark,asymmetric:!!d.double,interactive:false});
  }
  for(const d of finalDoors)finalGroundDoor(d);
  box(-6.2,0,9.8,-3.15,3.3,9.845,p.counter);
  // Остеклённое окно кабинета между 116 и 118, в светлой металлической раме.
  const staffView=texture(512,384,(g,w,h)=>{
   g.fillStyle='#a5b4ae';g.fillRect(0,0,w,h);g.fillStyle='#d9ddd0';g.fillRect(24,20,464,190);
   g.fillStyle='#697f85';g.fillRect(46,40,126,120);g.fillStyle='#e7e7d9';
   for(let x=50;x<170;x+=18)g.fillRect(x,40,7,120);
   g.fillStyle='#4c797b';g.fillRect(20,230,470,36);g.fillStyle='#d4d5c5';g.fillRect(20,266,470,98);
   g.fillStyle='#5f6d68';g.fillRect(282,118,114,70);g.fillRect(330,188,16,40);
  });
  at(-8.1,12.267,0,()=>{
   box(-.72,1.12,-.027,.72,2.4,.02,p.white);
   panel(0,1.76,-.032,1.33,1.16,new THREE.MeshBasicMaterial({map:staffView}),Math.PI);
   panel(0,1.76,-.04,1.33,1.16,p.glass,Math.PI);
   for(const x of [-.69,.69])box(x-.02,1.1,-.05,x+.02,2.42,-.015,p.steel);
   for(const y of [1.12,2.4])box(-.71,y-.02,-.05,.71,y+.02,-.015,p.steel);
  });finalMark('finalGroundOfficeWindow',-8.1,12.25,1.44,.08,{between:['116','118']});
  // Стенды «КОЛЛЕДЖ МАҚТАНЫШЫ»: золотой орнамент, портреты и нижние карманы.
  function prideBoard(u,width,title,group){
   const map=texture(1536,768,(g,w,h)=>{
    g.fillStyle='#f4f1e8';g.fillRect(0,0,w,h);
    g.strokeStyle='#bda35e';g.lineWidth=5;g.strokeRect(9,9,w-18,h-18);
    for(const x of [30,w-30]){
     g.strokeStyle='#b9a46a';g.lineWidth=3;
     for(let y=25;y<h-40;y+=44){g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x-19,y+5,x+19,y+28,x,y+40);g.stroke()}
    }
    g.fillStyle='#9b874d';g.textAlign='center';g.font='bold 52px Georgia';g.fillText(title,w/2,68,w-110);
    g.fillStyle='#dad0df';g.fillRect(52,97,w-104,h-143);
    g.fillStyle='#9a7a9d';g.fillRect(52,97,w-104,42);g.fillStyle='#f7f1e8';g.font='bold 25px Arial';
    g.fillText(group===1?'БІЛІМДІ ҰРПАҚ – ЕЛ БОЛАШАҒЫ':group===2?'БҮГІНГІ ІЗДЕНІС – ЕРТЕҢГІ ЖЕҢІС':'ҮЗДІК СТУДЕНТТЕР',w/2,127,w-150);
    const cols=width>3.8?8:6,cw=(w-154)/cols;
    for(let row=0;row<2;row++)for(let col=0;col<cols;col++){
     const x=77+col*cw,y=158+row*157,iw=cw-18,ih=139;
     g.fillStyle='#eee9e4';g.fillRect(x,y,iw,ih);g.strokeStyle='#aaa2ad';g.lineWidth=1.5;g.strokeRect(x,y,iw,ih);
     g.fillStyle=['#adc7d3','#b7c4d1','#a4bec5'][col%3];g.fillRect(x+8,y+7,iw-16,99);
     const cx=x+iw/2;
     g.fillStyle=col%3===0?'#2e3847':col%3===1?'#ebdfcf':'#56506a';
     g.beginPath();g.ellipse(cx,y+96,iw*.33,26,0,Math.PI,Math.PI*2);g.fill();
     g.fillStyle=['#4d3c32','#2d2e2c','#735a42'][col%3];g.beginPath();g.ellipse(cx,y+42,18,24,0,0,Math.PI*2);g.fill();
     g.fillStyle=['#c3a58b','#d3bba0','#bca38b'][(row+col)%3];g.beginPath();g.ellipse(cx,y+49,14,20,0,0,Math.PI*2);g.fill();
     g.fillStyle='#a39ca6';g.fillRect(x+14,y+115,iw-28,2);g.fillRect(x+22,y+123,iw-44,2);
    }
    for(let row=0;row<2;row++)for(let col=0;col<cols;col++){
     const x=77+col*cw,y=484+row*101;
     g.fillStyle='#e6dfe8';g.fillRect(x,y,cw-18,87);g.strokeStyle='#f4edf1';g.lineWidth=2;g.strokeRect(x,y,cw-18,87);
     g.strokeStyle='#c4b7c8';g.lineWidth=1;g.strokeRect(x+5,y+5,cw-28,77);
    }
    g.fillStyle='#ae9459';g.font='bold 45px Georgia';g.textAlign='left';g.fillText(String(group),70,744);
   });
   at(u,12.24,0,()=>{
    box(-width/2,1.18,-.025,width/2,2.94,.03,p.white);
    panel(0,2.06,-.031,width-.045,1.715,new THREE.MeshBasicMaterial({map}),Math.PI);
   });finalMark('finalGroundPrideBoard',u,12.23,width,.09,{title,portraits:true,goldOrnament:true});
  }
  prideBoard(-14.85,3.65,'КОЛЛЕДЖ МАҚТАНЫШЫ',1);
  prideBoard(-19.18,4.6,'КОЛЛЕДЖ МАҚТАНЫШЫ',2);
  prideBoard(-22.88,2.5,'КОЛЛЕДЖ МАҚТАНЫШЫ',3);
  // Дальняя дверь закрыта; над глухими створками — светлая фрамуга с осенними деревьями.
  const finalAutumnMap=texture(512,320,(g,w,h)=>{
   g.fillStyle='#e7e9dc';g.fillRect(0,0,w,h);
   g.strokeStyle='#817c67';g.lineWidth=6;
   for(let k=0;k<5;k++){
    const x=40+k*114;g.beginPath();g.moveTo(x,h);g.lineTo(x+32,140);g.lineTo(x-14,10);g.stroke();
    for(let j=0;j<4;j++){g.beginPath();g.moveTo(x+20,240-j*47);g.lineTo(x-67+j*22,120-j*35);g.stroke()}
   }
   for(let i=0;i<600;i++){
    g.fillStyle=['#b0b66a6c','#d3bb5c9c','#d7cf8190','#8e9d6475'][i%4];
    g.beginPath();g.ellipse(rand()*w,rand()*h,3+rand()*14,2+rand()*7,rand()*3,0,Math.PI*2);g.fill();
   }
  });
  const finalExitInset=material(0xd4dbd8,null,{shininess:28}),finalExitEdge=material(0xaeb7b2,null,{shininess:20});
  at(-29.98,11.05,-Math.PI/2,()=>{
   box(-1.25,0,-.025,1.25,3.3,.08,p.counter);
   box(-.82,.12,-.065,.82,2.42,.02,p.white);
   for(const side of [-1,1]){
    const x=side*.41;
    for(const [a,b] of [[.23,.82],[.96,2.29]]){
     box(x-.32,a,-.077,x+.32,b,-.066,finalExitInset);
     for(const xx of [x-.33,x+.32])box(xx,a-.012,-.087,xx+.012,b+.012,-.077,p.white);
     for(const xx of [x-.32,x+.313])box(xx,a,-.085,xx+.007,b,-.078,finalExitEdge);
     for(const yy of [a,b-.007])box(x-.32,yy,-.085,x+.32,yy+.007,-.078,finalExitEdge);
    }
    rod([side*.075,1.02,-.11],[side*.075,1.24,-.11],.013,p.steel);
   }
   rod([-.075,1.13,-.115],[-.23,1.13,-.115],.014,p.steel);
   for(const x of [-.85,0,.85])box(x-.025,.12,-.085,x+.025,3.14,-.04,p.white);
   panel(0,2.775,-.05,1.65,.69,new THREE.MeshBasicMaterial({map:finalAutumnMap}),Math.PI);
   for(const y of [2.4,3.13])box(-.875,y-.026,-.085,.875,y+.026,-.04,p.white);
   label('ШЫҒУ · ВЫХОД',0,3.24,-.08,.73,.16,'#4c8398','#fff',Math.PI);
   box(-.61,3.15,-.095,-.53,3.31,-.055,p.red);
   add(rodGeo,p.red,1.04,1.45,-.16,.085,.47,.085);
   rod([1.04,1.68,-.16],[1.13,1.79,-.16],.013,p.iron);
   label('1',.85,1.63,-.082,.16,.18,'#b73c36','#fff',Math.PI);
   label('↙',.85,1.31,-.082,.17,.17,'#4f805b','#fff',Math.PI);
   label('О',-.99,1.53,-.082,.17,.17,'#b73c36','#fff',Math.PI);
   box(-1.2,1.47,-.1,-1.08,1.6,-.045,p.red);
   collider(-.86,.12,-.09,.86,2.43,.05);
  });
  finalMark('finalGroundEndDoor',-29.98,11.05,.18,1.72,{closed:true,interactive:false,white:true,leaves:2,transom:true,threshold:.12});
  // Небольшой письменный стол стоит у левой стены перед последней ступенькой.
  const finalDeskMap=texture(512,256,(g,w,h)=>{
   g.fillStyle='#9a9381';g.fillRect(0,0,w,h);
   for(let i=0;i<600;i++){
    const x=rand()*w,y=rand()*h;g.strokeStyle=i%2?'#ddd6c934':'#5a554934';g.lineWidth=.5+rand();
    g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+90,y-2,x+170,y+3,x+260,y);g.stroke();
   }
  },1.0);
  const finalDeskMat=material(0xffffff,finalDeskMap,{shininess:18});
  at(-28.5,10.27,0,()=>{
   box(-.65,.735,-.35,.65,.78,.35,finalDeskMat);
   for(const x of [-.62,.59])box(x,.015,-.32,x+.03,.735,.31,finalDeskMat);
   box(-.6,.055,-.32,.6,.71,-.29,finalDeskMat);
   box(-.59,.055,-.29,-.11,.71,.29,finalDeskMat);
   for(const y of [.16,.34,.52]){
    box(-.575,y,-.302,-.125,y+.16,.31,finalDeskMat);
    rod([-.42,y+.08,.325],[-.28,y+.08,.325],.009,p.steel);
   }
   collider(-.65,0,-.35,.65,.78,.35);
  });finalMark('finalGroundDesk',-28.5,10.27,1.3,.7,{wood:true,beforeEndStep:true,againstWall:true});
  for(const u of [-.4,-3.8,-7.2,-10.6,-14,-17.4,-20.8,-24.2,-27.6])box(u-.295,3.276,10.755,u+.295,3.3,11.345,p.bulb);
  for(const u of [-2.3,-12.4,-22.5])add(ballGeo,p.white,u,3.25,11.05,.052,.026,.052);
  for(const u of [-7.7,-18.7])box(u-.09,3.01,12.17,u+.09,3.22,12.28,p.white);
  add(ballGeo,p.black,-29.7,3.17,9.98,.055,.04,.05);
  for(const [u,v,ry] of [[.17,12.275,0],[-2.8,9.825,Math.PI]])at(u,v,ry,()=>{
   label('←',0,1.54,-.055,.18,.18,'#b73c36','#fff',Math.PI);
   box(.23,1.46,-.08,.36,1.6,-.035,p.red);
   label('О',.5,1.54,-.055,.18,.18,'#b73c36','#fff',Math.PI);
  });
  add(rodGeo,p.red,.29,1.55,12.13,.078,.45,.078);
  for(const [u,v] of [[-7.2,11.05],[-17.4,11.05],[-27.6,11.05],[-.9,7.4]]){
   const light=new THREE.PointLight(0xfffcf2,.15,10,2);light.position.set(u,3,v).applyMatrix4(pose);scene.add(light);
  }
  finalMark('finalGroundCorridor',-14.625,11.05,30.75,2.5,{classrooms:6,doorsClosed:true,windowNearStairs:true,prideBoards:3,endDoorClosed:true});
  // END COLLEGE1_FINAL_GROUND_WING
  // Второй этаж за лестничным холлом: оконный торец справа, кабинеты влево.
  const afterStairSavedPose=pose;
  pose=new THREE.Matrix4().makeTranslation(0,3.74,0).premultiply(afterStairSavedPose);
  try{
   const afterMark=(kind,u,v,w,d,extra={})=>mark(kind,u,v,w,d,{level:3.74,...extra});
   const afterVinylMap=texture(384,384,(g,w,h)=>{
    g.fillStyle='#b4bbc0';g.fillRect(0,0,w,h);
    for(let i=0;i<24000;i++){
     g.fillStyle=i%3===0?'#f2f2ee85':i%3===1?'#616d7848':'#87919c65';
     g.fillRect(rand()*w,rand()*h,.4+rand()*.9,.4+rand()*.9);
    }
   },1.2);
   const afterVinyl=material(0xffffff,afterVinylMap,{shininess:70,specular:0x8b949b});
   const afterGlass=material(0xaabbb9,null,{transparent:true,opacity:.3,depthWrite:false,side:THREE.DoubleSide,shininess:80});
   const afterFrost=material(0xe3e6df,null,{shininess:35});
   const afterDoors=[
    {u:-.55,v:12.3,n:'',w:1.55,double:true},
    {u:-5,v:9.8,n:'',w:1.45,double:true,allFrost:true,narrowRight:true},
    {u:-9.7,v:12.3,n:'215',w:1.55,double:true},
    {u:-15.3,v:9.8,n:'',w:1.12},
    {u:-21,v:12.3,n:'',w:1.12},
    {u:-25.3,v:9.8,n:'',w:1.12},
    {u:-25.9,v:12.3,n:'221',w:1.12}
   ];
   stairFloor(-30,9.8,.75,12.3,0,afterVinyl);
   box(-30,3.3,9.8,.75,3.44,12.3,p.ceiling);
   box(.75,0,9.8,.9,3.4,12.45,p.cream,true);
   box(-30.15,0,9.65,-30,3.4,12.45,p.oak,true);
   // Стенные панели прорезаны только под закрытые двери и проход из лестницы.
   for(const side of [9.8,12.3]){
    const cuts=afterDoors.filter(d=>d.v===side).map(d=>({a:d.u-d.w/2,b:d.u+d.w/2,top:2.48}));
    if(side===9.8)cuts.push({a:-1.45,b:.15,top:2.7});
    cuts.sort((a,b)=>a.a-b.a);
    const z1=side===9.8?9.65:12.3,z2=side===9.8?9.8:12.45,face=side===9.8?9.81:12.29;
    let edge=-30;
    for(const cut of cuts){
     if(cut.a>edge)box(edge,0,z1,cut.a,3.3,z2,p.cream,true);
     box(cut.a,cut.top,z1,cut.b,3.3,z2,p.cream,true);edge=cut.b;
    }
    box(edge,0,z1,.75,3.3,z2,p.cream,true);
    for(let u=-29.8;u<.75;u+=.8){
     if(cuts.some(c=>u>c.a-.15&&u<c.b+.15))continue;
     box(u-.003,.08,face-.003,u+.003,3.3,face+.003,p.seam);
    }
    edge=-30;
    for(const cut of [...cuts,{a:.75,b:.75}]){
     box(edge,0,face-.012,cut.a,.08,face+.012,p.trim);
     box(edge,.56,face-.003,cut.a,.567,face+.003,p.seam);edge=cut.b;
    }
   }
   // Деревянный откос входа совпадает с торцом гранитной площадки.
   for(const u of [-1.45,.15])box(u-.035,0,9.58,u+.035,2.73,9.96,p.oak);
   box(-1.485,2.67,9.58,.185,2.75,9.96,p.oak);
   label('ШЫҒУ · ВЫХОД',-.65,2.95,9.825,.74,.17,'#4c8398','#fff',0);
   // Оконный торец: короткая рулонная штора, белые трубы, батарея и урна.
   panel(.732,1.9,11.05,2.06,2.16,outside,-Math.PI/2);
   for(const v of [10,11.05,12.1])box(.68,.79,v-.024,.745,3.02,v+.024,p.frame);
   for(const y of [.81,3])box(.68,y-.025,9.98,.745,y+.025,12.12,p.frame);
   for(let y=2.24;y<3;y+=.13){box(.655,y,10.02,.67,y+.073,12.08,p.blind);box(.653,y+.075,10.02,.668,y+.104,12.08,p.blindLight)}
   box(.32,.77,9.94,.78,.84,12.16,p.counter);
   box(.48,.14,10.28,.69,.71,11.82,p.white,true);
   for(let v=10.32;v<11.81;v+=.095)box(.44,.17,v,.49,.68,v+.035,p.trim);
   rod([.55,.16,10.17],[.55,.065,10.17],.012,p.white);
   rod([.55,.065,10.17],[.55,.065,12.08],.012,p.white);
   rod([.55,.065,12.08],[-.05,.065,12.08],.012,p.white);
   box(.29,0,11.99,.59,.43,12.3,guardWhite,true);box(.28,.43,11.98,.6,.48,12.31,p.trim);
   add(rodGeo,p.red,.4,1.45,9.91,.083,.47,.083);
   rod([.4,1.68,9.91],[.49,1.79,9.91],.014,p.iron);
   afterMark('afterStairWindow',.73,11.05,.15,2.16,{sillPlants:0,blindCoverage:'upper-third',radiator:true,pipes:true});
   // Асимметричные двери: узкая матовая вставка и основная створка с полосами.
   function afterDoor(d){
    const ry=d.v===9.8?Math.PI:0;
    at(d.u,d.v,ry,()=>{
     for(const [a,b] of [[-d.w/2-.13,-d.w/2],[d.w/2,d.w/2+.13]])box(a,0,-.02,b,3.3,.08,p.counter);
     box(-d.w/2,2.48,-.02,d.w/2,3.3,.08,p.counter);
     // Неглубокий светлый фон за стеклом не открывает проход в непостроенную комнату.
     box(-d.w/2,.04,.14,d.w/2,2.43,.22,p.cream);
     const inset=d.double?d.w*.28:0,split=d.narrowRight?d.w/2-inset:-d.w/2+inset;
     const mainA=d.narrowRight?-d.w/2:split,mainB=d.narrowRight?split:d.w/2;
     for(const x of [-d.w/2,d.w/2])box(x-.026,0,-.055,x+.026,2.48,.035,p.iron);
     for(const y of [.035,2.445])box(-d.w/2,y-.027,-.055,d.w/2,y+.027,.035,p.iron);
     if(d.double){
      const a=d.narrowRight?split:-d.w/2,b=d.narrowRight?d.w/2:split;
      box(a+.035,.075,-.028,b-.035,2.37,.005,afterFrost);
      box(split-.027,0,-.061,split+.027,2.48,.035,p.iron);
     }
     box(mainA+.035,.075,-.018,mainB-.035,2.37,.005,d.allFrost?afterFrost:afterGlass);
     if(!d.allFrost)for(let y=.17;y<2.35;y+=.205)box(mainA+.035,y,-.035,mainB-.035,y+.082,-.018,afterFrost);
     const handle=d.narrowRight?mainB-.12:mainA+.12,hinge=d.narrowRight?mainA+.012:mainB-.012;
     for(const y of [.35,1.21,2.17])box(hinge-.018,y-.06,-.068,hinge+.018,y+.06,-.038,p.iron);
     box(handle-.022,.98,-.084,handle+.022,1.2,-.067,p.iron);
     rod([handle,1.08,-.102],[handle+(d.narrowRight?-.14:.14),1.08,-.102],.016,p.iron);
     const center=(mainA+mainB)/2;
     if(d.n){
      add(new THREE.CircleGeometry(1,28),p.gold,center,2.405,-.064,.14,.095,1,0,Math.PI);
      label(d.n,center,2.405,-.068,.23,.115,null,'#343a35',Math.PI);
     }
     const brand=label('BQFQ',center,1.63,-.041,(mainB-mainA)*.75,.22,null,'#177caf',Math.PI);
     brand.name='office-brand-upper-after-stairs-'+(d.n||d.u);
     collider(-d.w/2,0,-.08,d.w/2,2.48,.08);
    });
    const c=new THREE.Vector3(d.u,0,d.v).applyMatrix4(pose);
    classroomDoors.push({number:d.n,brand:'BQFQ',x:c.x,z:c.z,width:d.w,level:3.74,wing:'upper-after-stairs',closed:true,open:false});
    afterMark('afterStairClassroomDoor',d.u,d.v,d.w,.16,{number:d.n,closed:true,allFrost:!!d.allFrost,asymmetric:!!d.double});
   }
   for(const d of afterDoors)afterDoor(d);
   // Белая металлическая скамейка с деревянным сиденьем и крестами на спинке.
   at(-7.85,12.02,0,()=>{
    box(-.68,.43,-.18,.68,.48,.18,p.counter);
    for(const x of [-.62,.62])for(const v of [-.14,.14])rod([x,0,v],[x,.46,v],.017,p.white);
    for(const x of [-.68,.68])rod([x,.05,.17],[x,1.0,.17],.018,p.white);
    for(const y of [.52,.98])rod([-.68,y,.17],[.68,y,.17],.016,p.white);
    for(const x of [-.68,0]){
     rod([x,.53,.17],[x+.68,.96,.17],.013,p.white);
     rod([x,.96,.17],[x+.68,.53,.17],.013,p.white);
    }
    collider(-.71,0,-.21,.71,1.02,.21);
   });afterMark('afterStairBench',-7.85,12.02,1.42,.42,{whiteMetal:true,woodSeat:true,crossBack:true,besideClassroom:'215'});
   // На стенах чередуются деревянные вставки и выступающие светлые панели.
   box(-2.9,0,9.8,-2.45,3.3,9.845,p.counter);
   for(const u of [-6.8,-18.5]){
    box(u-.15,0,12.12,u+.15,3.3,12.3,p.cream,true);
    box(u-.153,.08,12.115,u-.147,3.3,12.12,p.seam);
   }
   // Закрытая белая двустворчатая дверь под светлой фрамугой в дальнем торце.
   at(-29.97,11.05,-Math.PI/2,()=>{
    box(-1.1,0,-.025,1.1,3.3,.08,p.counter);
    box(-.8,0,-.055,.8,2.35,.02,p.white);
    for(const side of [-1,1]){
     const x=side*.4;
     for(const [a,b] of [[.15,.78],[.92,2.18]]){
      box(x-.31,a,-.069,x+.31,b,-.056,p.trim);
      for(const xx of [x-.32,x+.31])box(xx,a-.01,-.078,xx+.012,b+.01,-.069,p.white);
     }
     rod([side*.08,1.02,-.1],[side*.08,1.22,-.1],.014,p.iron);
    }
    for(const x of [-.83,0,.83])box(x-.023,0,-.08,x+.023,3.13,-.04,p.trim);
    panel(0,2.74,-.05,1.61,.7,outside,Math.PI);
    box(-.83,2.35,-.08,.83,2.4,-.04,p.trim);
    box(-.83,3.08,-.08,.83,3.14,-.04,p.trim);
    label('ШЫҒУ · ВЫХОД',0,3.23,-.08,.73,.16,'#4c8398','#fff',Math.PI);
   });afterMark('afterStairEndDoor',-29.97,11.05,.15,1.66,{closed:true,white:true,leaves:2,transom:true,interactive:false});
   for(const u of [-.4,-3.8,-7.2,-10.6,-14,-17.4,-20.8,-24.2,-27.6]){
    box(u-.295,3.276,10.755,u+.295,3.3,11.345,p.bulb);
    if(u===-7.2||u===-17.4){const light=new THREE.PointLight(0xfffcf2,.14,10,2);light.position.set(u,3,11.05).applyMatrix4(pose);scene.add(light)}
   }
   for(const u of [-2.2,-12.4,-22.6])add(ballGeo,p.white,u,3.25,11.05,.05,.025,.05);
   for(const u of [-7.7,-18.7])box(u-.09,3.01,12.17,u+.09,3.22,12.28,p.white);
   for(const [u,v,ry] of [[-2.3,9.825,Math.PI],[-29.0,12.275,0]])at(u,v,ry,()=>{
    label('→',0,1.53,-.055,.18,.18,'#b73c36','#fff',Math.PI);
    box(.23,1.44,-.08,.36,1.58,-.035,p.red);
    label('О',.5,1.53,-.055,.18,.18,'#b73c36','#fff',Math.PI);
    afterMark('afterStairWallSigns',0,-.055,.8,.04,{wallMounted:true});
   });
   add(rodGeo,p.red,-29.35,1.4,12.17,.082,.47,.082);
   afterMark('afterStairCorridor',-14.625,11.05,30.75,2.5,{classrooms:7,closedDoors:7,windowNearStairs:true,endDoorClosed:true});
  }finally{pose=afterStairSavedPose}
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
  if(Math.abs(feet)<.21&&x>=-45.4&&x<=-14.5&&z>=-3&&z<=-.34)return 'Корпус 1 · Правый коридор за лестницей';
  if(feet<-3.5&&x>=15.3&&x<=19.7&&z>=-.12&&z<=11.35)return 'Корпус 1 · Гардероб';
  if(feet>3.5&&x>=-45.4&&x<=-14.5&&z>=-3&&z<=-.34)return 'Корпус 1 · 2 этаж · Коридор за лестницей';
  if(x>=-23.1&&x<=-14.5&&z>=-.3&&z<9.45&&(feet>.2||feet<-.2||z<7.85))
   return feet<-.25?'Корпус 1 · Лестница к кухне':'Корпус 1 · Второй лестничный холл';
  if(feet>3.5){
   if(x>=14.1&&x<=44.75&&z>=-5.9&&z<=-.15)return 'Корпус 1 · 2 этаж · Правый коридор';
   if((x>=-17&&x<=16.3&&z>7.85&&z<=13.75)||(x>=-16.15&&x<=-14.65&&z>=7.05&&z<=9.45))return 'Корпус 1 · 2 этаж · Левый коридор';
  }
  if([continuationBounds,continuationEntryBounds].some(b=>x>=b.x1&&x<=b.x2&&z>=b.z1&&z<=b.z2))return 'Корпус 1 · Продолжение коридора';
  if(x>=stairBounds.x1&&x<=stairBounds.x2&&z>=stairBounds.z1&&z<7.85)
   return feet>3.5?'Корпус 1 · Площадка 2 этажа':feet<-.25?'Корпус 1 · Лестница вниз':'Корпус 1 · Лестничный холл';
  return x<=-6?'Корпус 1 · Правый коридор':x>=6?'Корпус 1 · Левый коридор':z<3.12?'Корпус 1 · Прихожая':z<6.2?'Корпус 1 · Открытые турникеты':'Корпус 1 · Входной холл';
 }
 scene.userData={building:1,stage:'entrance-corridors-and-stairs',layoutVersion:23,reference:'userPhotos-opposing-views',turnstilesOpen:true,waitingBenches:2,reception:true,certificateCabinet:true,
  hallWidth:12,hallDepth:7.98,corridorWidth:2.25,corridorLength:12.1,corridorAxis:'x',normalSizeFurniture:true,fixtures,classroomDoors,stairHall:stairInfo,stairSurfaces,areas:zones};
 return {name:'Корпус 1',scene,colliders,groundAt,roomAt,stairSurfaces,areas:zones,exitDoor:{x:0,z:.05,radius:1.35},spawn:[0,1.7,1.8],yaw:Math.PI,pitch:-.025,state:null};
}
