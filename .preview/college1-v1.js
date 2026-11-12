// ---- Корпус 1: прихожая и холл с открытыми турникетами по фотографиям.
function buildCollegeEntranceInterior(){
 const scene=new THREE.Scene(),colliders=[],batches=new Map(),geometryCache=new Map(),zones=[[-3.7,0,3.7,2.3],[-.85,2.3,.85,2.56],[-3.7,2.56,3.7,8.4]];
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
   const meters=mt.map.userData.tileMeters||1,key=[sx,sy,sz,meters].map(n=>n.toFixed(4)).join(':');
   if(!geometryCache.has(key)){
    const g=boxGeo.clone(),uv=g.attributes.uv;
    [[sz,sy],[sz,sy],[sx,sz],[sx,sz],[sx,sy],[sx,sy]].forEach(([w,h],face)=>{for(let i=face*4;i<face*4+4;i++)uv.setXY(i,uv.getX(i)*w/meters,uv.getY(i)*h/meters)});
    geometryCache.set(key,g);
   }geo=geometryCache.get(key);
  }
  const key=geo.uuid+':'+mt.id;if(!batches.has(key))batches.set(key,{geo,mt,list:[]});
  quat.setFromEuler(euler.set(rx,ry,rz));matrix.compose(v.set(x,y,z),quat,scale.set(sx,sy,sz));batches.get(key).list.push(matrix.clone());
 }
 function box(x1,y1,z1,x2,y2,z2,mt,solid=false){
  add(boxGeo,mt,(x1+x2)/2,(y1+y2)/2,(z1+z2)/2,x2-x1,y2-y1,z2-z1);
  if(solid)colliders.push([x1,z1,x2,z2,y1,y2]);
 }
 function rod(a,b,r,mt=p.steel){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
  quat.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());matrix.compose(start.add(end).multiplyScalar(.5),quat,scale.set(r,delta.length(),r));
  const key=rodGeo.uuid+':'+mt.id;if(!batches.has(key))batches.set(key,{geo:rodGeo,mt,list:[]});batches.get(key).list.push(matrix.clone());
 }
 function panel(x,y,z,w,h,mt,ry=0,rx=0){
  const geo=new THREE.PlaneGeometry(w,h),uv=geo.attributes.uv;
  // План развёрнут по X, надписи и фотографии сохраняют правильное направление.
  for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i));
  const mesh=new THREE.Mesh(geo,mt);mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,0);scene.add(mesh);return mesh;
 }
 function label(text,x,y,z,w,h,bg='#ebe8d9',fg='#4b544f',ry=0){
  const tx=new THREE.CanvasTexture(canvas(256,128,g=>{g.fillStyle=bg;g.fillRect(0,0,256,128);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';g.font='bold 44px sans-serif';g.fillText(text,128,68,236)}));
  panel(x,y,z,w,h,new THREE.MeshBasicMaterial({map:tx}),ry);
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
 // Прихожая: высокое остекление, светлая плитка, деревянные пилоны и арки.
 box(-3.7,-.14,0,3.7,0,2.3,p.floor);box(-.85,-.14,2.3,.85,0,2.56,p.floor);box(-3.7,-.14,2.56,3.7,0,8.4,p.floor);
 box(-3.82,0,-.12,-3.7,4.14,2.45,p.oak,true);box(3.7,0,-.12,3.82,4.14,2.45,p.oak,true);
 box(-3.7,4.1,0,3.7,4.23,2.3,p.white);
 box(-3.7,0,-.12,3.7,.08,0,p.trim,true);
 // Переднее остекление остаётся физической границей; выход выполняется у центральных дверей.
 colliders.push([-3.7,-.15,3.7,.015,0,4.14]);
 for(const [x1,x2] of [[-3.7,-1.08],[1.08,3.7]]){
  box(x1,0,-.1,x2,4.1,-.02,p.oak);
  panel((x1+x2)/2,2.22,-.011,x2-x1-.22,3.3,outside);
  for(const x of [x1+.08,x2-.08])box(x-.035,.55,-.005,x+.035,3.95,.075,p.frame);
  for(const y of [.58,2.3,3.15,3.95])box(x1+.05,y-.025,-.005,x2-.05,y+.025,.075,p.frame);
 }
 panel(0,2.06,-.095,2.06,4.02,outside);
 for(const x of [-1.02,0,1.02])box(x-.035,.03,-.04,x+.035,4.08,.075,p.frame);
 for(const y of [.04,2.3,2.9,3.5,4.05])box(-1.05,y-.035,-.04,1.05,y+.035,.075,p.frame);
 for(const side of [-1,1]){
  const x=side*.12;rod([x,1.02,.1],[x+side*.065,1.32,.15],.019,p.frame);rod([x+side*.065,1.32,.15],[x,1.62,.1],.019,p.frame);
  add(new THREE.CircleGeometry(.065,24),p.gold,side*.52,1.56,.08,1,1,1);
 }
 label('ВЫХОД',0,2.44,.08,.58,.16,'#e7dfaa','#544a31');
 for(const side of [-1,1]){
  box(side<0?-3.7:1.65,0,2.3,side<0?-1.65:3.7,4.1,2.45,p.cream,true);
  box(side<0?-1.65:.85,0,2.3,side<0?-.85:1.65,4.1,2.45,p.oak,true);
 }
 box(-.85,3.48,2.3,.85,4.1,2.45,p.oak,true);box(-.85,2.37,2.3,.85,3.48,2.37,p.glass);
 for(const x of [-.85,-.51,.85])box(x-.027,0,2.285,x+.027,3.52,2.37,p.frame);
 for(const y of [2.34,3.49])box(-.88,y-.035,2.285,.88,y+.035,2.37,p.frame);
 box(-.83,.03,2.31,-.53,2.32,2.34,p.glass);
 // Открытая внутренняя створка отведена в сторону от прохода.
 const innerDoor=new THREE.Group();innerDoor.position.set(.81,0,2.3);innerDoor.rotation.y=-Math.PI/2.2;scene.add(innerDoor);
 function doorPart(x,y,z,w,h,d,mt){const q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mt);q.position.set(x,y,z);innerDoor.add(q)}
 doorPart(-.65,1.17,0,1.3,2.3,.025,p.glass);
 for(const x of [-1.3,0])doorPart(x,1.17,0,.055,2.34,.055,p.frame);
 for(const y of [.03,2.32])doorPart(-.65,y,0,1.35,.055,.055,p.frame);
 doorPart(-1.12,1.25,-.06,.04,.55,.04,p.frame);
 colliders.push([.59,.96,.85,2.33,0,2.36]);
 // Арки прорезаны насквозь, поэтому ветви декора и дерево не закрывают проходы.
 function archPath(path,w,spring,top){path.moveTo(-w/2,0);path.lineTo(-w/2,spring);path.quadraticCurveTo(-w/2,top-.28,0,top);path.quadraticCurveTo(w/2,top-.28,w/2,spring);path.lineTo(w/2,0);path.closePath()}
 function arch(x){
  const shape=new THREE.Shape();archPath(shape,2.36,2.75,4.1);const hole=new THREE.Path();archPath(hole,1.94,2.62,3.84);shape.holes.push(hole);
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.14,bevelEnabled:false,curveSegments:18}),mesh=new THREE.Mesh(geo,p.oak);
  mesh.rotation.y=Math.PI/2;mesh.position.set(x,0,1.15);scene.add(mesh);
  for(const z of [.06,2.24])box(x-.025,0,z-.07,x+.17,.09,z+.07,p.trim);
 }
 for(const x of [-3.54,-1.74,1.6,3.4])arch(x);
 for(const x of [-3.69,3.69]){
  const shape=new THREE.Shape();archPath(shape,1.82,2.55,3.65);
  const niche=new THREE.Mesh(new THREE.ShapeGeometry(shape),p.cream);niche.rotation.y=x<0?Math.PI/2:-Math.PI/2;niche.position.set(x,0,1.15);scene.add(niche);
  for(const y of [1.5,2.65])rod([x+(x<0?.003:-.003),y,.24],[x+(x<0?.003:-.003),y,2.06],.003,p.seam);
 }
 function waitingBench(x,ry){
  const local=(a,y,c)=>[x+Math.cos(ry)*a+Math.sin(ry)*c,y,1.15-Math.sin(ry)*a+Math.cos(ry)*c];
  const part=(a,y,c,sx,sy,sz,mt)=>add(boxGeo,mt,...local(a,y,c),sx,sy,sz,0,ry);
  const pipe=(a,b,r=.015)=>rod(local(...a),local(...b),r,p.iron);
  for(const a of [-.67,.67]){
   for(const c of [-.19,.19])pipe([a,0,c],[a,.49,c]);pipe([a,.45,-.21],[a,.98,-.21]);
  }
  part(0,.45,0,1.48,.07,.45,p.red);pipe([-.7,.94,-.22],[.7,.94,-.22]);pipe([-.7,.58,-.22],[.7,.58,-.22]);
  for(let a=-.61;a<.6;a+=.22){pipe([a,.6,-.22],[a+.22,.93,-.22],.01);pipe([a,.93,-.22],[a+.22,.6,-.22],.01)}
  colliders.push([x-.25,.36,x+.25,1.94,0,1.02]);contact(x,1.15,.9,1.9);
 }
 waitingBench(-3.3,Math.PI/2);waitingBench(3.3,-Math.PI/2);
 // Окна и белые радиаторы вдоль внутренней стороны прихожей.
 for(const x of [-2.63,2.63]){
  panel(x,1.83,2.285,1.0,1.8,outside,Math.PI);
  for(const xx of [x-.52,x+.52])box(xx-.025,.9,2.26,xx+.025,2.77,2.3,p.frame);
  for(const y of [.92,2.74])box(x-.54,y-.025,2.26,x+.54,y+.025,2.3,p.frame);
  box(x-.5,.14,2.14,x+.5,.75,2.25,p.white);
  for(let xx=x-.45;xx<x+.5;xx+=.08)box(xx,.17,2.115,xx+.026,.7,2.16,p.trim);
 }
 for(const z of [.081,2.283])for(const x of [-1.4,1.4]){
  box(x-.003,.1,z-.002,x+.003,4,z+.002,p.seam);
  for(const y of [1.55,3.1])box(x-.28,y-.002,z-.002,x+.28,y+.002,z+.002,p.seam);
 }
 // Холл: светлые панели, дубовые вставки и подвесной потолок с квадратными светильниками.
 box(-3.84,0,2.45,-3.7,3,8.55,p.cream,true);box(3.7,0,2.45,3.84,3,8.55,p.cream,true);
 box(-3.7,0,8.4,3.7,3,8.54,p.cream,true);box(-3.7,2.95,2.45,3.7,3.08,8.4,p.ceiling);
 for(const x of [-3.69,3.69])for(let z=2.6;z<8.4;z+=.6)box(x-.008,.07,z-.003,x+.008,2.94,z+.003,p.seam);
 for(let x=-3.6;x<3.7;x+=.6)box(x-.003,.07,8.38,x+.003,2.95,8.4,p.seam);
 for(const x of [-3.7,3.7])box(x-.025,0,2.5,x+.025,.08,8.4,p.trim);
 for(const [x,z] of [[0,3.5],[0,5.3],[0,7.1],[-2.4,6.5],[2.4,5.3]]){
  box(x-.29,2.925,z-.29,x+.29,2.95,z+.29,p.bulb);
  const light=new THREE.PointLight(0xfffcf2,.18,6,2);light.position.set(x,2.65,z);scene.add(light);
 }
 // Стойка охраны справа: дубовый фасад с диагональной светлой вставкой и монитор.
 box(1.72,0,3.02,3.6,1.08,4.13,p.oak,true);box(1.68,1.08,2.98,3.64,1.15,4.17,p.white);
 const face=new THREE.BufferGeometry();face.setAttribute('position',new THREE.Float32BufferAttribute([1.74,1.065,3.012,3.58,1.065,3.012,3.58,.09,3.012],3));face.computeVertexNormals();
 scene.add(new THREE.Mesh(face,new THREE.MeshPhongMaterial({color:0xe9e6d7,side:THREE.DoubleSide})));
 rod([1.75,1.07,3.007],[3.58,.09,3.007],.006,p.iron);
 const publicFace=new THREE.BufferGeometry();publicFace.setAttribute('position',new THREE.Float32BufferAttribute([1.712,1.065,3.035,1.712,1.065,4.115,1.712,.09,4.115],3));publicFace.computeVertexNormals();
 scene.add(new THREE.Mesh(publicFace,new THREE.MeshPhongMaterial({color:0xe9e6d7,side:THREE.DoubleSide})));
 rod([1.707,1.07,3.035],[1.707,.09,4.115],.006,p.iron);
 box(2.93,1.15,3.57,3.01,1.35,3.7,p.iron);box(2.57,1.27,3.55,3.37,1.73,3.62,p.black);
 box(2.5,1.151,3.15,3.24,1.18,3.39,p.dark);
 const paperMap=texture(384,256,(g,w,h)=>{g.fillStyle='#efeee6';g.fillRect(0,0,w,h);for(let i=0;i<10;i++){g.fillStyle=i===0?'#8e4840':'#a7aaa2';g.fillRect(14,15+i*21,w-30,2+i%2)}});
 for(let i=0;i<5;i++)panel(3.677,1.73,3.25+i*.4,.32,.46,new THREE.MeshBasicMaterial({map:paperMap}),-Math.PI/2);
 box(3.63,1.5,4.56,3.69,1.66,4.75,material(0xa63437));label('ПЛАН',3.675,2.0,4.28,.38,.45,'#f2f1e7','#3c6952',-Math.PI/2);
 // Центральная тумба турникета. Все штанги опущены вдоль корпуса — оба прохода открыты.
 box(-.2,0,5.12,.2,.06,5.64,p.iron);box(-.145,.06,5.18,.145,1.03,5.58,p.oak,true);
 for(const side of [-1,1]){
  add(boxGeo,p.steel,side*.19,1.04,5.41,.075,.31,.28,0,0,side*.55);
  for(const z of [5.3,5.42,5.54])rod([side*.24,1.02,z],[side*.37,.16,z+.12],.016,p.steel);
  box(side<0?-.27:.17,1.08,5.24,side<0?-.17:.27,1.32,5.37,p.iron);
  box(side<0?-.25:.185,1.2,5.233,side<0?-.185:.25,1.25,5.24,material(0x7bb79b));
 }
 contact(0,5.4,.9,1.2);
 function barrier(x,z1,z2){
  for(const z of [z1,z2]){add(rodGeo,p.steel,x,.022,z,.07,.044,.07);rod([x,.02,z],[x,1.04,z],.026,p.steel)}
  for(const y of [.21,.47,.73,1.03])rod([x,y,z1],[x,y,z2],y===1.03?.031:.014,p.steel);
  colliders.push([x-.03,z1,x+.03,z2,0,1.07]);
 }
 barrier(-1.35,4.25,6.3);barrier(1.35,4.25,6.3);
 // Стальные секции по бокам, включая калитку слева, как на фотографии.
 for(const [x1,x2,z] of [[-3.65,-1.35,4.25],[1.35,3.65,4.25]]){
  for(const x of [x1,x2])rod([x,0,z],[x,1.04,z],.028,p.steel);
  for(const y of [.21,.47,.73,1.03])rod([x1,y,z],[x2,y,z],y===1.03?.03:.014,p.steel);
  colliders.push([x1,z-.03,x2,z+.03,0,1.07]);
 }
 // Закрытые двери дальше по корпусу ограничивают только текущую отснятую часть.
 function rearDoor(cx,width,number){
  box(cx-width/2-.12,0,8.26,cx+width/2+.12,2.93,8.37,p.oak);
  box(cx-width/2,0,8.19,cx+width/2,2.28,8.25,p.iron);
  for(const side of [-1,1]){
   const x=cx+side*width*.25;box(x-width*.22,.07,8.17,x+width*.22,2.2,8.185,p.frame);
   for(let y=.22;y<2.13;y+=.19)box(x-width*.21,y,8.16,x+width*.21,y+.065,8.17,p.cream);
   box(cx+side*.04,.98,8.11,cx+side*.07,1.3,8.16,p.steel);
  }
  label(number,cx,2.42,8.18,.25,.12,'#c7b471','#4b4734',Math.PI);
  label('КОЛЛЕДЖ',cx,1.63,8.15,width*.78,.2,'#d3c6a3','#30789b',Math.PI);
 }
 rearDoor(.6,1.27,'109');rearDoor(3.06,1.14,'110');
 // Неглубокое зеркало со светлой рамой и полосатой жалюзи сверху.
 const mirrorMap=texture(256,384,(g,w,h)=>{
  g.fillStyle='#a4b1a5';g.fillRect(0,0,w,h);g.fillStyle='#ddd9c4';g.fillRect(0,175,w,150);g.strokeStyle='#788b84';g.lineWidth=4;
  for(let y=200;y<330;y+=35){g.beginPath();g.moveTo(0,y);g.lineTo(w,y-40);g.stroke()}
  for(let y=0;y<160;y+=21){g.fillStyle=y%42?'#6b6b5d':'#ddd9c7';g.fillRect(0,y,w,14)}
 });
 panel(1.98,1.6,8.35,.91,1.73,new THREE.MeshBasicMaterial({map:mirrorMap}),Math.PI);
 for(const x of [1.5,2.46])box(x-.025,.7,8.31,x+.025,2.5,8.36,p.trim);
 for(const y of [.72,2.48])box(1.48,y-.025,8.31,2.48,y+.025,8.36,p.trim);
 // Витрина с грамотами, дипломами и несколькими кубками слева.
 box(-3.55,.06,7.91,-1.48,2.4,8.29,p.white,true);
 box(-3.5,.11,7.9,-1.53,2.35,7.92,p.dark);
 for(let col=0;col<5;col++){
  const x=-3.53+col*.414;box(x,.1,7.84,x+.026,2.4,7.94,p.white);
  for(let row=0;row<5;row++){
   const y=.24+row*.42;box(x+.04,y,7.86,x+.37,y+.012,8.25,p.white);
   if((row+col)%4===0){
    add(rodGeo,p.gold,x+.2,y+.13,8.02,.08,.16,.08);rod([x+.2,y+.02,8.02],[x+.2,y+.09,8.02],.025,p.gold);
   }else{
    panel(x+.2,y+.22,7.895,.27,.31,new THREE.MeshBasicMaterial({map:paperMap}),Math.PI);
    box(x+.052,y+.06,7.89,x+.345,y+.075,7.896,p.gold);
   }
  }
 }
 box(-1.5,.1,7.84,-1.475,2.4,7.94,p.white);box(-3.55,2.37,7.83,-1.47,2.42,8.28,p.white);
 panel(-2.51,1.25,7.825,2.02,2.23,p.glass,Math.PI);
 // Телевизор и информационный терминал рядом с витриной.
 box(-1.35,1.64,8.22,-.28,2.28,8.29,p.black);
 box(-.91,0,7.41,-.49,.91,7.8,p.white,true);add(boxGeo,p.iron,-.7,1.01,7.59,.57,.07,.43,-.45);
 add(boxGeo,p.black,-.7,1.045,7.565,.48,.012,.34,-.45);
 for(let y=.16;y<.8;y+=.11)box(-.76,y,7.403,-.65,y+.02,7.41,p.gold);
 // Кулер с голубой бутылью и подставка с цветами.
 box(-3.43,0,6.82,-2.99,.86,7.27,p.white,true);
 box(-3.38,.45,6.808,-3.04,.69,6.82,p.dark);add(rodGeo,material(0x6398b5,null,{transparent:true,opacity:.7}),-3.21,1.11,7.05,.2,.48,.2);
 add(rodGeo,p.blue,-3.21,.87,7.05,.12,.08,.12);
 const leafGeo=new THREE.BufferGeometry(),leafPositions=[],leafIndices=[];
 for(let row=0;row<=8;row++){
  const t=row/8,half=Math.sin(Math.PI*t)*.08;
  for(const side of [-1,0,1])leafPositions.push(t*.25,Math.sin(Math.PI*t)*.05-Math.abs(side)*half*.15,side*half);
 }
 for(let row=0;row<8;row++)for(let col=0;col<2;col++){const n=row*3+col;leafIndices.push(n,n+3,n+1,n+1,n+3,n+4)}
 leafGeo.setAttribute('position',new THREE.Float32BufferAttribute(leafPositions,3));leafGeo.setIndex(leafIndices);leafGeo.computeVertexNormals();
 function pot(x,z,size=1,y=0,solid=true){
  add(new THREE.CylinderGeometry(.19*size,.14*size,.38*size,14),p.white,x,y+.19*size,z,1,1,1);
  add(rodGeo,p.soil,x,y+.38*size,z,.17*size,.01,.17*size);
  for(let i=0;i<9;i++){
   const a=i*2.4,yy=y+(.5+i*.045)*size,base=[x+Math.cos(a)*.08*size,yy,z+Math.sin(a)*.08*size];
   rod([x,y+.32*size,z],base,.008*size,p.green);add(leafGeo,p.green,...base,size,size,size,0,-a,.25);
  }
  if(solid)colliders.push([x-.2*size,z-.2*size,x+.2*size,z+.2*size,y,y+.4*size]);
  contact(x,z,.65*size,.65*size);
 }
 pot(-2.74,7.31,.8);pot(-3.23,6.0,.75);pot(-3.08,3.35,.85);pot(3.19,4.95,.7,.56);
 for(const x of [2.88,3.5])for(const z of [4.7,5.22]){
  rod([x,0,z],[x,.63,z],.012,p.white);add(ballGeo,p.iron,x,.035,z,.035,.035,.035);
 }
 for(const y of [.22,.55])box(2.9,y,4.7,3.48,y+.025,5.2,p.white);
 pot(3.18,4.95,.66,.2,false);
 // Растения в прихожей и висящая зелень вокруг потолочных панелей.
 pot(-2.8,1.85,.75);pot(2.8,.4,.75);
 for(const cx of [-2.45,2.45]){
  box(cx-.3,4.035,.85,cx+.3,4.06,1.45,p.bulb);
  for(let i=0;i<62;i++){
   const side=i%4;let x,z;
   if(side===0){x=cx-.85+rand()*1.7;z=.46}else if(side===1){x=cx-.85+rand()*1.7;z=1.84}else{x=cx+(side===2?-.85:.85);z=.46+rand()*1.38}
   const drop=.16+rand()*.37;rod([x,4.08,z],[x,4.08-drop,z],.007,p.green);
   for(let j=0;j<3;j++)add(leafGeo,p.green,x,4.08-drop+j*.085,z,.65,.65,.65,0,i*2.4+j,.5+j*.2);
  }
 }
 // Финальная сборка повторяющихся деталей без тысяч отдельных draw calls.
 for(const {geo,mt,list} of batches.values()){
  const mesh=new THREE.InstancedMesh(geo,mt,list.length);list.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;scene.add(mesh);
 }
 const groundAt=(x,z,feet)=>Math.abs(feet)<.21&&zones.some(([x1,z1,x2,z2])=>x>=x1&&x<=x2&&z>=z1&&z<=z2)?0:null;
 const roomAt=(x,z)=>z<2.5?'Корпус 1 · Прихожая':z<6.7?'Корпус 1 · Открытые турникеты':'Корпус 1 · Входной холл';
 // При взгляде от наружных дверей стойка справа, витрина с кулером слева.
 scene.scale.x=-1;
 for(const b of colliders){const left=b[0];b[0]=-b[2];b[2]=-left}
 scene.userData={building:1,stage:'vestibule-and-turnstiles',turnstilesOpen:true,waitingBenches:2,reception:true,certificateCabinet:true,areas:zones};
 return {name:'Корпус 1',scene,colliders,groundAt,roomAt,areas:zones,exitDoor:{x:0,z:.05,radius:1.35},spawn:[0,1.7,1.65],yaw:Math.PI,pitch:-.025,state:null};
}
