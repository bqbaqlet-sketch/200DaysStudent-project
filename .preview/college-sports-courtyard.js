// BEGIN COLLEGE_SPORTS_COURTYARD
function buildCollegeSportsCourtyard(){
 const root=new THREE.Group();root.name='college-sports-courtyard';S.add(root);
 let seed=131126;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
 const mat=(color,extra={})=>new THREE.MeshPhongMaterial({color,shininess:15,...extra});
 const p={blue:mat(0x165d81),deep:mat(0x234651),metal:mat(0x8d9da1,{shininess:65,specular:0x536b75}),white:mat(0xe2e6df),stone:mat(0x959b96),dark:mat(0x34454a),soil:mat(0x4e4736),wood:mat(0x8b7256),trim:mat(0xb7c1bc),leaf:mat(0x457453),leafLight:mat(0x63815b),mulch:mat(0x6b6555)};
 const cube=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,10),shrubGeometry=new THREE.IcosahedronGeometry(1,1),batches=new Map(),dummy=new THREE.Object3D();
 function instance(geo,material,position,scale,quaternion=new THREE.Quaternion()){
  dummy.position.copy(position);dummy.scale.copy(scale);dummy.quaternion.copy(quaternion);dummy.updateMatrix();
  const key=geo.uuid+material.uuid;if(!batches.has(key))batches.set(key,{geo,material,matrices:[]});batches.get(key).matrices.push(dummy.matrix.clone());
 }
 const solid=(x1,z1,x2,z2,bottom=0,top=2)=>cols.push([x1,z1,x2,z2,bottom,top]);
 const flyBlock=(x1,z1,x2,z2,top)=>collegeFlightObstacles.push([x1,z1,x2,z2,top]);
 function box(x1,y1,z1,x2,y2,z2,material){instance(cube,material,new THREE.Vector3((x1+x2)/2,(y1+y2)/2,(z1+z2)/2),new THREE.Vector3(x2-x1,y2-y1,z2-z1));}
 function tube(a,b,r,material=p.metal){const from=new THREE.Vector3(...a),v=new THREE.Vector3(...b).sub(from);instance(cylinder,material,from.addScaledVector(v,.5),new THREE.Vector3(r,v.length(),r),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize()));}
 function canvas(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c;}
 function texture(image,repeat=true){const t=new THREE.CanvasTexture(image);t.anisotropy=4;if(repeat)t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
 function horizontal(x1,z1,x2,z2,y,material,module=1){
  const geometry=new THREE.PlaneGeometry(x2-x1,z2-z1),uv=geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(x1+uv.getX(i)*(x2-x1))/module,(-z2+uv.getY(i)*(z2-z1))/module);
  const mesh=new THREE.Mesh(geometry,material);mesh.rotation.x=-Math.PI/2;mesh.position.set((x1+x2)/2,y,(z1+z2)/2);root.add(mesh);return mesh;
 }
 function panel(x,y,z,w,h,material,ry=0){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);mesh.position.set(x,y,z);mesh.rotation.y=ry;root.add(mesh);return mesh;}

 // Connected paving replaces the unfinished asphalt and the old checkerboard strip.
 const pavingMap=texture(canvas(256,256,(g,w,h)=>{
  g.fillStyle='#7b8381';g.fillRect(0,0,w,h);
  for(let j=0;j<2;j++)for(let i=0;i<2;i++){
   g.fillStyle=['#b9bdb6','#c3c6bd','#b3b9b3','#c1c4bb'][j*2+i];g.fillRect(i*128+1.5,j*128+1.5,125,125);
   g.fillStyle='#dde0d426';g.fillRect(i*128+3,j*128+3,122,1);g.fillRect(i*128+3,j*128+3,1,122);
  }
  for(let i=0;i<6500;i++){g.fillStyle=rnd()>.5?'#ffffff16':'#3a443c13';g.fillRect(rnd()*w,rnd()*h,.6+rnd()*1.4,.6+rnd()*1.4);}
 }));
 const pavingMaterial=mat(0xc7cec8,{map:pavingMap,shininess:5});
 const paved=[[-36.0,6.45,-25.35,7.94],[-25.35,4.035,-14.065,7.94],[-19.38,7.94,-14.065,33.98]];
 for(const r of paved)horizontal(...r,.047,pavingMaterial,1.20).name='sports-court-paving';
 box(-36.0,.012,6.40,-25.35,.10,6.48,p.trim);
 box(-25.40,.012,4.03,-25.31,.10,6.48,p.trim);
 box(-36.0,.012,7.88,-23.02,.105,7.96,p.deep);
 box(-21.39,.012,7.88,-19.39,.105,7.96,p.deep);
 box(-19.42,.012,7.96,-19.34,.11,18.48,p.deep);box(-19.42,.012,24.52,-19.34,.11,33.98,p.deep);
 box(-14.15,.012,4.05,-14.06,.10,21.90,p.trim);
 const grateMap=texture(canvas(128,128,(g,w,h)=>{g.fillStyle='#344342';g.fillRect(0,0,w,h);g.fillStyle='#899590';for(let y=3;y<h;y+=12)g.fillRect(5,y,w-10,3);g.strokeStyle='#b0b8b0';g.lineWidth=2;g.strokeRect(1,1,w-2,h-2);}));
 const grate=mat(0xffffff,{map:grateMap,shininess:30});
 horizontal(-24.02,4.08,-20.90,4.30,.054,grate,.25);horizontal(-18.10,4.08,-14.14,4.30,.054,grate,.25);
 horizontal(-14.40,4.31,-14.16,21.88,.054,grate,.25);

 function planter(x1,z1,x2,z2){
  box(x1,.047,z1,x2,.34,z2,p.stone);box(x1+.07,.335,z1+.07,x2-.07,.36,z2-.07,p.soil);
  for(const x of [x1,x2-.065])box(x,.32,z1,x+.065,.39,z2,p.trim);
  for(const z of [z1,z2-.065])box(x1,.32,z,x2,.39,z+.065,p.trim);
  const n=Math.max(4,Math.ceil((x2-x1)*(z2-z1)*6));
  for(let i=0;i<n;i++){
   const s=.18+rnd()*.13;instance(shrubGeometry,i%3?p.leaf:p.leafLight,new THREE.Vector3(x1+.19+rnd()*(x2-x1-.38),.40+s*.45,z1+.18+rnd()*(z2-z1-.36)),new THREE.Vector3(s*1.2,s*.75,s));
  }
  solid(x1,z1,x2,z2,0,.62);
 }
 planter(-23.65,4.48,-21.95,5.19);planter(-17.15,4.48,-15.15,5.19);
 planter(-15.15,8.20,-14.38,10.30);planter(-15.15,12.22,-14.38,14.35);
 // Bicycle stands stay to the side of the route from the garden to the entrance.
 for(const x of [-24.85,-24.28,-23.71]){
  tube([x,.06,5.48],[x,.75,5.48],.024);tube([x,.75,5.48],[x,.86,5.59],.024);tube([x,.86,5.59],[x,.86,6.03],.024);tube([x,.86,6.03],[x,.75,6.14],.024);tube([x,.75,6.14],[x,.06,6.14],.024);
 }
 solid(-25.0,5.36,-23.55,6.26,0,.88);

 function benchAtWall(x,z,length=1.65){
  for(let i=0;i<4;i++)box(x-.27+i*.13,.46,z-length/2,x-.16+i*.13,.51,z+length/2,p.wood);
  for(let i=0;i<3;i++)box(x+.23,.63+i*.12,z-length/2,x+.27,.72+i*.12,z+length/2,p.wood);
  for(const dz of [-length*.39,length*.39]){tube([x-.20,.055,z+dz],[x-.20,.46,z+dz],.025,p.deep);tube([x+.20,.055,z+dz],[x+.20,.99,z+dz],.025,p.deep);tube([x-.20,.44,z+dz],[x+.20,.44,z+dz],.022,p.deep);}
  solid(x-.29,z-length/2,x+.29,z+length/2,0,1.02);
 }
 benchAtWall(-14.77,16.14,1.72);
 const binBody=mat(0x3e5962);box(-15.10,.055,10.94,-14.63,.72,11.41,binBody);box(-15.14,.72,10.90,-14.59,.77,11.45,p.deep);box(-15.07,.60,10.91,-14.66,.69,10.94,p.dark);solid(-15.14,10.90,-14.59,11.45,0,.78);

 // The former brown slab becomes a framed service entrance with a threshold and canopy.
 const doorCenter=-19.50,doorBottom=.18,doorTop=2.48,doorLeft=doorCenter-.61,doorRight=doorCenter+.61;
 const doorPaint=mat(0x214b62,{shininess:34}),doorSeal=mat(0x28383c);
 box(-20.93,.025,4.02,-18.07,.18,5.12,p.stone);
 const rampGeometry=new THREE.BufferGeometry();rampGeometry.setAttribute('position',new THREE.Float32BufferAttribute([-20.93,.18,5.12,-18.07,.18,5.12,-18.07,.047,6.26,-20.93,.047,6.26],3));rampGeometry.setIndex([0,2,1,0,3,2]);rampGeometry.computeVertexNormals();root.add(new THREE.Mesh(rampGeometry,p.stone));
 box(-20.94,.16,5.08,-18.06,.185,5.13,p.deep);
 for(const x of [doorLeft-.055,doorRight])box(x,doorBottom,4.045,x+.055,doorTop+.06,4.16,p.metal);
 box(doorLeft-.055,doorTop,4.045,doorRight+.055,doorTop+.06,4.16,p.metal);
 box(doorLeft,doorBottom,4.055,doorRight,doorTop,4.095,doorSeal);
 box(doorLeft+.035,doorBottom+.035,4.095,doorRight-.035,doorTop-.035,4.135,doorPaint);
 box(doorLeft+.08,doorBottom+.04,4.136,doorRight-.08,.48,4.15,p.metal);
 const doorGlass=mat(0x7997a4,{shininess:78,specular:0x6e8590,map:texture(canvas(128,256,(g,w,h)=>{const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#9eb9c3');sky.addColorStop(.45,'#a9bec1');sky.addColorStop(1,'#476778');g.fillStyle=sky;g.fillRect(0,0,w,h);g.fillStyle='#d3e0db55';for(let y=15;y<h;y+=16)g.fillRect(0,y,w,3);}),false)});
 panel(doorCenter,1.69,4.142,.79,1.17,doorGlass);
 for(const x of [doorCenter-.425,doorCenter+.395])box(x,1.07,4.14,x+.03,2.31,4.17,p.metal);
 for(const y of [1.07,2.28])box(doorCenter-.425,y,4.14,doorCenter+.425,y+.03,4.17,p.metal);
 tube([doorRight-.17,.95,4.19],[doorRight-.17,1.35,4.19],.015);tube([doorRight-.17,.95,4.14],[doorRight-.17,.95,4.19],.012);tube([doorRight-.17,1.35,4.14],[doorRight-.17,1.35,4.19],.012);
 box(doorRight-.20,.89,4.145,doorRight-.14,.93,4.18,p.dark);
 for(const y of [.48,1.33,2.10])box(doorLeft-.008,y,4.16,doorLeft+.024,y+.08,4.19,p.metal);
 box(doorCenter-1.15,2.76,4.025,doorCenter+1.15,2.83,5.05,p.deep);box(doorCenter-1.17,2.80,5.02,doorCenter+1.17,2.88,5.08,p.blue);
 for(const x of [doorCenter-.94,doorCenter+.94])tube([x,2.76,4.86],[x,2.39,4.08],.018,p.metal);
 box(doorCenter-.23,2.744,4.48,doorCenter+.23,2.76,4.70,new THREE.MeshBasicMaterial({color:0xf1ecd7}));
 const entranceSign=texture(canvas(768,96,(g,w,h)=>{g.fillStyle='#21465e';g.fillRect(0,0,w,h);g.strokeStyle='#a8babf';g.lineWidth=3;g.strokeRect(3,3,w-6,h-6);g.fillStyle='#e5eae5';g.font='600 36px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('СЛУЖЕБНЫЙ ВХОД',w/2,h/2,w-35);}),false);
 panel(doorCenter,2.62,4.115,1.92,.24,new THREE.MeshBasicMaterial({map:entranceSign})).name='college1-service-entry-sign';
 collegeLamps.push([doorCenter,.14,5.2,3.8]);

 // A compact artificial-turf pitch: fine grain, alternating strips and complete markings.
 const field={x1:-35.5,z1:8,x2:-19.5,z2:34},play={left:-34.75,right:-20.25,north:9.05,south:32.95},cx=-27.5,cz=21;
 const turfMap=texture(canvas(1024,2048,(g,w,h)=>{
  for(let i=0;i<10;i++){g.fillStyle=i%2?'#386f40':'#32663a';g.fillRect(0,i*h/10,w,h/10+1);}
  for(let i=0;i<105000;i++){g.fillStyle=rnd()>.50?'#bdd29d1c':'#153f281d';g.fillRect(rnd()*w,rnd()*h,.7+rnd()*1.2,1+rnd()*2.4);}
  g.save();g.setTransform(w/16,0,0,h/26,-field.x1*w/16,-field.z1*h/26);g.strokeStyle='#e5ebdc';g.fillStyle='#e5ebdc';g.lineWidth=.070;
  g.strokeRect(play.left,play.north,play.right-play.left,play.south-play.north);g.beginPath();g.moveTo(play.left,cz);g.lineTo(play.right,cz);g.stroke();g.beginPath();g.arc(cx,cz,2.20,0,Math.PI*2);g.stroke();g.beginPath();g.arc(cx,cz,.10,0,Math.PI*2);g.fill();
  for(const [front,d] of [[play.north,1],[play.south,-1]]){
   const end=front+d*4.0;g.strokeRect(cx-3.4,Math.min(front,end),6.8,4.0);g.strokeRect(cx-2.25,Math.min(front,front+d*1.65),4.5,1.65);
   const spot=front+d*3.0;g.beginPath();g.arc(cx,spot,.105,0,Math.PI*2);g.fill();
   g.save();g.beginPath();g.rect(play.left,d>0?end:field.z1,play.right-play.left,d>0?field.z2-end:end-field.z1);g.clip();g.beginPath();g.arc(cx,spot,1.8,0,Math.PI*2);g.stroke();g.restore();
  }
  for(const [x,z,start,end] of [[play.left,play.north,0,Math.PI/2],[play.right,play.north,Math.PI/2,Math.PI],[play.left,play.south,-Math.PI/2,0],[play.right,play.south,Math.PI,Math.PI*1.5]]){g.beginPath();g.arc(x,z,.32,start,end);g.stroke();}
  g.restore();
 }),false);
 box(field.x1,.006,field.z1,field.x2,.050,field.z2,p.deep);
 const turf=new THREE.Mesh(new THREE.PlaneGeometry(16,26),mat(0xffffff,{map:turfMap,shininess:2,specular:0x15351f}));turf.rotation.x=-Math.PI/2;turf.position.set(cx,.055,cz);turf.name='college-football-turf';root.add(turf);
 const goalMap=texture(canvas(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='#eeeedecc';g.lineWidth=1.3;for(let i=0;i<=8;i++){const q=i*16;g.beginPath();g.moveTo(q,0);g.lineTo(q,h);g.moveTo(0,q);g.lineTo(w,q);g.stroke();}}));
 const goalNet=new THREE.MeshBasicMaterial({map:goalMap,color:0xedeedb,transparent:true,alphaTest:.12,depthWrite:false,side:THREE.DoubleSide});
 function netQuad(points,width,height,material,name){
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,width,0,width,height,0,height],2));geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,material);mesh.name=name;root.add(mesh);return mesh;
 }
 const goals=[];
 for(const [front,d] of [[play.north,-1],[play.south,1]]){
  const left=cx-1.5,right=cx+1.5,back=front+d*.78,y=.055,top=2.08,backTop=1.83;
  for(const x of [left,right]){tube([x,y,front],[x,top,front],.045,p.white);tube([x,y,back],[x,backTop,back],.025,p.white);tube([x,y,front],[x,y,back],.025,p.white);tube([x,top,front],[x,backTop,back],.023,p.white);solid(x-.06,front-.06,x+.06,front+.06,0,top+.05);}
  tube([left,top,front],[right,top,front],.045,p.white);tube([left,backTop,back],[right,backTop,back],.025,p.white);
  netQuad([[left,y,back],[right,y,back],[right,backTop,back],[left,backTop,back]],3,1.78,goalNet,'football-goal-back-net');
  for(const x of [left,right])netQuad([[x,y,front],[x,y,back],[x,backTop,back],[x,top,front]],.78,2.025,goalNet,'football-goal-side-net');
  netQuad([[left,top,front],[right,top,front],[right,backTop,back],[left,backTop,back]],3,.82,goalNet,'football-goal-roof-net');
  solid(left-.02,back-.035,right+.02,back+.035,0,backTop);goals.push({front,back,width:3,height:top-y});
 }

 // Welded mesh is see-through; its segments have solid physical boundaries.
 const fenceMap=texture(canvas(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='#4b626edb';g.lineWidth=1.15;for(let i=0;i<=8;i++){const q=i*32;g.beginPath();g.moveTo(q,0);g.lineTo(q,h);g.moveTo(0,q);g.lineTo(w,q);g.stroke();}}));
 const fenceMaterial=mat(0x66818b,{map:fenceMap,transparent:true,alphaTest:.14,depthWrite:false,side:THREE.DoubleSide,shininess:12});
 function fence(a,b,height=3.3,collision=true){
  const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),geometry=new THREE.PlaneGeometry(length,height-.19),uv=geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*length/1.6,uv.getY(i)*(height-.19)/1.6);
  const mesh=new THREE.Mesh(geometry,fenceMaterial);mesh.name='sports-perimeter-mesh';mesh.position.set((a[0]+b[0])/2,(height+.19)/2,(a[1]+b[1])/2);mesh.rotation.y=Math.atan2(-dz,dx);root.add(mesh);
  const count=Math.max(1,Math.ceil(length/2.6));for(let i=0;i<=count;i++){const t=i/count,x=a[0]+dx*t,z=a[1]+dz*t;tube([x,.05,z],[x,height+.06,z],.033,p.blue);box(x-.065,.02,z-.065,x+.065,.11,z+.065,p.metal);}
  tube([a[0],.19,a[1]],[b[0],.19,b[1]],.026,p.deep);tube([a[0],height,a[1]],[b[0],height,b[1]],.026,p.blue);
  box(Math.min(a[0],b[0])-.045,.05,Math.min(a[1],b[1])-.045,Math.max(a[0],b[0])+.045,.17,Math.max(a[1],b[1])+.045,p.trim);
  if(collision){solid(Math.min(a[0],b[0])-.055,Math.min(a[1],b[1])-.055,Math.max(a[0],b[0])+.055,Math.max(a[1],b[1])+.055,0,height);flyBlock(Math.min(a[0],b[0])-.055,Math.min(a[1],b[1])-.055,Math.max(a[0],b[0])+.055,Math.max(a[1],b[1])+.055,height);}
 }
 fence([-35.55,7.98],[-23.00,7.98],3.8);fence([-21.40,7.98],[-19.45,7.98],3.8);
 fence([-35.55,34.02],[-19.45,34.02],3.8);fence([-35.55,7.98],[-35.55,34.02],3.3);
 fence([-19.45,7.98],[-19.45,18.50],3.3);fence([-19.45,24.50],[-19.45,34.02],3.3);
 // The north gate is folded flat along the fence, leaving its whole opening clear.
 fence([-21.40,7.86],[-19.86,7.86],2.25,false);
 for(const x of [-23.00,-21.40])tube([x,.05,7.98],[x,2.42,7.98],.045,p.deep);
 tube([-21.31,1.02,7.84],[-21.31,1.30,7.84],.014,p.metal);

 // Sheltered team benches retain the old footprint with a clear passage through the middle.
 const canopy=mat(0x6e858d),soffit=mat(0xbfc9c5);
 horizontal(-19.40,18.50,-16.73,24.50,.054,pavingMaterial,1.2);
 fence([-19.45,18.50],[-16.78,18.50],2.38);fence([-19.45,24.50],[-16.78,24.50],2.38);
 fence([-16.78,18.50],[-16.78,20.40],2.38);fence([-16.78,22.60],[-16.78,24.50],2.38);
 for(const [x,z] of [[-19.42,18.50],[-16.78,18.50],[-19.42,24.50],[-16.78,24.50]])tube([x,.06,z],[x,2.57,z],.045,p.deep);
 box(-19.68,2.55,18.25,-16.52,2.61,24.75,soffit);box(-19.72,2.61,18.20,-16.49,2.67,24.80,canopy);box(-16.54,2.59,18.20,-16.48,2.72,24.80,p.metal);
 for(const z of [18.53,24.47])tube([-19.42,2.52,z],[-16.78,2.52,z],.04,p.blue);
 benchAtWall(-17.12,19.40,1.35);benchAtWall(-17.12,23.60,1.35);
 flyBlock(-19.72,18.20,-16.49,24.80,2.72);
 const sign=texture(canvas(768,128,(g,w,h)=>{g.fillStyle='#21485e';g.fillRect(0,0,w,h);g.fillStyle='#e5ebe3';g.font='600 42px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('МИНИ-ФУТБОЛ',w/2,h/2,w-30);}),false);
 panel(-16.72,2.35,21.50,1.84,.30,new THREE.MeshBasicMaterial({map:sign}),Math.PI/2);
 const topics=[['ПЕРЕД ИГРОЙ','Разминка и удобная обувь'],['НА ПЛОЩАДКЕ','Уважайте друг друга'],['ПОСЛЕ ИГРЫ','Оставьте площадку чистой']];
 topics.forEach(([title,subtitle],i)=>{
  const map=texture(canvas(512,320,(g,w,h)=>{g.fillStyle='#e1e6db';g.fillRect(0,0,w,h);g.fillStyle='#254b60';g.fillRect(0,0,w,66);g.fillStyle='#f0f3e8';g.font='600 29px Arial';g.textAlign='center';g.fillText(title,w/2,44,w-20);g.fillStyle='#31594c';g.font='24px Arial';g.fillText(subtitle,w/2,278,w-30);g.strokeStyle='#638a72';g.lineWidth=5;g.strokeRect(131,100,250,125);g.beginPath();g.moveTo(256,100);g.lineTo(256,225);g.stroke();g.beginPath();g.arc(256,163,30,0,7);g.stroke();}),false);
  const z=26.5+i*2.72;box(-19.37,1.03,z-.87,-19.29,2.15,z+.87,p.deep);panel(-19.285,1.59,z,1.64,1.025,new THREE.MeshBasicMaterial({map}),Math.PI/2);
 });
 function light(x,z){tube([x,.05,z],[x,3.57,z],.047,p.deep);tube([x,3.57,z],[x+.48,3.57,z],.036,p.deep);box(x+.27,3.52,z-.12,x+.64,3.59,z+.12,p.deep);box(x+.30,3.505,z-.095,x+.61,3.523,z+.095,new THREE.MeshBasicMaterial({color:0xe8e8d5}));solid(x-.08,z-.08,x+.08,z+.08,0,3.6);collegeLamps.push([x+.45,.14,z,5.0]);}
 light(-25.02,4.45);light(-18.90,25.13);
 let parts=0;for(const {geo,material,matrices} of batches.values()){const mesh=new THREE.InstancedMesh(geo,material,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;root.add(mesh);parts+=matrices.length;}
 root.userData={kind:'college-sports-courtyard',pavedAreas:paved,pitch:{bounds:[field.x1,field.z1,field.x2,field.z2],playBounds:[play.left,play.north,play.right,play.south],goals,grassStrips:10},serviceEntrance:{position:[doorCenter,doorBottom,4.14],closed:true,canopy:true,replacedBrownSlab:true},gates:[{x:-22.20,z:7.98,width:1.60,open:true},{x:-16.78,z:21.50,width:2.20,open:true}],benches:3,planters:4,bicycleStands:3,batchedParts:parts};
 return root;
}
const collegeSportsCourtyard=buildCollegeSportsCourtyard();
// END COLLEGE_SPORTS_COURTYARD
