 // Лестничный холл за отмеченным проёмом левого крыла. Вход из коридора: (16.3, 7.85).
 const stairInfo={entry:{x:16.3,z:7.85},origin:{x:13.9,z:7.85},rise:.17,tread:.285,stepsPerFlight:11,
  halfFloor:1.87,upperFloor:3.74,stairStart:1.5,stairEnd:4.635,wardrobeDeferred:true,upperInteriorDeferred:true};
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
 const stairBounds={x1:12,x2:17.35,z1:1.5,z2:7.85};
 function stairSurface(x1,z1,x2,z2,y){
  const bounds=new THREE.Box3(new THREE.Vector3(x1,y,z1),new THREE.Vector3(x2,y,z2)).applyMatrix4(pose);
  stairSurfaces.push([bounds.min.x,bounds.min.z,bounds.max.x,bounds.max.z,y]);
 }
 function stairFloor(x1,z1,x2,z2,y){box(x1,y-.14,z1,x2,y,z2,granite);stairSurface(x1,z1,x2,z2,y)}
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
 function stairFlight(x1,x2,baseY,returning=false,descending=false){
  for(let i=0;i<11;i++){
   const za=returning?4.635-(i+1)*.285:1.5+i*.285,zb=za+.285,y=baseY+(descending?-1:1)*(i+1)*.17;
   box(x1,y-.17,za,x2,y,zb,granite);stairSurface(x1,za,x2,zb,y);
   const nose=returning?zb:za;box(x1,y+.001,nose-.008,x2,y+.012,nose+.008,p.steel);
  }
  const y0=baseY-.2,y1=baseY+(descending?-1:1)*1.87-.2,za=returning?4.635:1.5,zb=returning?1.5:4.635;
  stairQuad([x1,y0,za,x2,y0,za,x2,y1,zb,x1,y1,zb],stairWhite);
  for(const x of [x1,x2]){
   stairQuad([x,baseY-.16,za,x,baseY-.39,za,x,baseY+(descending?-1:1)*1.87-.39,zb,x,baseY+(descending?-1:1)*1.87-.16,zb],stairWhite);
   rod([x,baseY-.39,za],[x,baseY+(descending?-1:1)*1.87-.39,zb],.006,p.iron);
  }
 }
 at(-13.9,7.85,Math.PI,()=>{
  // Основная площадка и проход справа от лестничной шахты; в проёме вниз сплошного пола нет.
  stairFloor(-1.9,0,3.45,1.5,0);stairFloor(1.66,1.5,3.45,6.35,0);
  stairFloor(-1.65,4.635,1.5,6.35,1.87);stairFloor(-1.9,0,3.45,1.5,3.74);
  stairFloor(.05,4.635,1.5,6.35,-1.87);
  stairFlight(-1.65,-.2,0);stairFlight(.05,1.5,1.87,true);stairFlight(.05,1.5,0,false,true);
  mark('collegeStairHall',.775,3.175,5.35,6.35,{floors:[0,3.74],wardrobeDeferred:true});
  // Высокие стены с кремовыми полями, деревянным нижним поясом и узкими вертикальными планками.
  box(-2.05,-2.1,-.15,-1.9,7.15,6.5,p.cream,true);box(3.45,-2.1,-.15,3.6,7.15,6.5,p.oak,true);
  box(-1.9,-2.1,6.35,3.45,7.15,6.5,p.cream,true);
  box(-1.9,-2.1,-.15,1.58,7.15,0,p.cream,true);box(3.22,-2.1,-.15,3.45,7.15,0,p.cream,true);
  box(1.58,2.6,-.15,3.22,7.15,0,p.cream,true);
  box(-1.9,7.15,0,3.45,7.28,6.35,p.white);
  box(-1.9,3.57,0,3.45,3.6,1.5,p.white);
  for(const v of [0,2,4,6.28])box(-1.897,0,v-.045,-1.83,7.14,v+.045,p.oak);
  for(let v=0;v<6.35;v+=1.27){
   const end=Math.min(v+1.27,6.35),h1=1.0+v*.5,h2=1.0+end*.5;
   stairQuad([-1.88,0,v,-1.88,0,end,-1.88,h2,end,-1.88,h1,v],new THREE.MeshPhongMaterial({map:oakMap,side:THREE.DoubleSide,color:0xc2a586}));
  }
  box(-1.9,-2.05,6.31,3.45,3.1,6.35,p.oak);
  for(const x of [-1.75,-.2,1.5,3.35])box(x-.04,0,6.285,x+.04,7.14,6.32,p.oak);
  for(const x of [-1.885,3.435]){
   box(x-.012,0,0,x+.012,.09,6.3,granite);
   for(let v=.6;v<6.3;v+=.6)rod([x,.12,v],[x,7.1,v],.0025,p.seam);
  }
  // Перила у маршей, разворота и открытого спуска к гардеробу.
  stairRail([-.16,0,1.5],[-.16,1.87,4.635],true);
  stairRail([.03,3.74,1.5],[.03,1.87,4.635],true);stairRail([1.53,3.74,1.5],[1.53,1.87,4.635],true);
  stairRail([.03,0,1.5],[.03,-1.87,4.635],true);stairRail([1.64,0,1.5],[1.64,0,6.28]);
  stairRail([1.53,1.87,4.635],[1.53,1.87,6.28]);stairRail([1.53,-1.87,4.635],[1.53,-1.87,6.28]);
  stairRail([-1.86,3.74,1.5],[-.16,3.74,1.5]);stairRail([1.64,3.74,1.5],[3.4,3.74,1.5]);
  // Наклонный пристенный поручень слева и чёрные швы на светлой подшивке.
  rod([-1.83,1.01,1.5],[-1.83,2.88,4.635],.03,p.steel);
  for(const v of [2.0,3.05,4.1]){
   const y=(v-1.5)/3.135*1.87-.22;
   rod([-.18,y,v],[-1.64,y,v],.003,p.seam);
  }
  // Пара вертикально расположенных окон с жалюзи и радиаторами.
  for(const base of [0,3.74]){
   panel(3.43,base+1.91,3.58,1.7,2.12,outside,-Math.PI/2);
   for(const v of [2.70,4.46])box(3.38,base+.82,v-.025,3.45,base+3.01,v+.025,p.frame);
   for(const y of [.84,2.99])box(3.38,base+y-.025,2.67,3.45,base+y+.025,4.49,p.frame);
   for(let y=1.57;y<3;y+=.13){box(3.355,base+y,2.73,3.37,base+y+.073,4.43,p.blind);box(3.356,base+y+.075,2.73,3.368,base+y+.104,4.43,p.blindLight)}
   box(3.05,base+.82,2.62,3.45,base+.89,4.54,p.counter);
   box(3.23,base+.13,2.77,3.41,base+.73,4.39,p.white);
   for(let v=2.82;v<4.39;v+=.1)box(3.2,base+.17,v,3.245,base+.69,v+.035,p.trim);
   rod([3.3,base+.18,4.43],[3.3,base+.05,4.43],.013,p.white);
   pot(3.22,3.14,.5,base+.89,'broad',false);pot(3.22,4.03,.5,base+.89,'broad',false);
  }
  // Высокие белые горшки на промежуточной площадке.
  for(const x of [-1.25,1.14]){
   add(new THREE.CylinderGeometry(.18,.14,.52,14),p.white,x,2.13,5.84,1,1,1);
   for(let i=0;i<9;i++){
    const a=i*2.4,top=[x+Math.cos(a)*.08,2.46+i*.035,5.84+Math.sin(a)*.08];
    rod([x,2.35,5.84],top,.006,p.green);add(leafGeo,p.green,...top,.7,.7,.7,0,a,.3);
   }
   collider(x-.18,1.87,5.66,x+.18,2.4,6.02);
  }
  // Белая дверь под знаком выхода и пожарный щиток на первом этаже.
  box(2.02,0,6.27,3.14,2.39,6.34,p.trim);box(2.08,.035,6.245,3.08,2.32,6.27,guardWhite);
  rod([2.23,.96,6.22],[2.23,1.16,6.22],.011,p.iron);
  label('ВЫХОД',2.58,2.55,6.24,.66,.19,'#4c8398','#ffffff',Math.PI);
  add(rodGeo,p.red,1.83,1.2,6.23,.082,.41,.082);rod([1.83,1.4,6.23],[1.91,1.51,6.23],.015,p.iron);
  label('1',1.65,1.52,6.25,.14,.19,'#b73735','#fff',Math.PI);label('→',1.49,1.0,6.25,.22,.15,'#4f805b','#fff',Math.PI);
  // Подставка у нижнего окна не закрывает дорожку к выходу.
  for(const [x,v,y,size] of [[3.16,5.38,.52,.65],[3.05,5.64,.18,.7],[3.01,5.21,.86,.6]]){
   rod([3.2,.03,v],[x,y,v],.012,p.white);add(rodGeo,p.white,x,y-.015,v,.14,.025,.14);pot(x,v,size,y,'broad',false);
  }
  collider(2.89,0,5.02,3.37,1.15,5.85);
  // Внизу только лестница и площадка: сам гардероб будет достроен позже.
  box(.16,-1.87,6.275,1.39,.43,6.33,p.oak);box(.24,-1.84,6.25,1.31,.35,6.275,p.cream);
  label('ГАРДЕРОБ',.775,.59,6.25,.82,.18,'#dedbd0','#515b53',Math.PI);
  // Наверху пока только площадка с закрытой дверью, без выдуманного интерьера второго этажа.
  box(1.85,3.74,.01,3.1,6.14,.075,p.trim);box(1.93,3.77,.078,3.02,6.06,.095,p.cream);
  // Небольшая урна у входа и круглые светильники.
  box(3.01,.015,.38,3.27,.48,.68,guardWhite,true);box(2.99,.48,.36,3.29,.53,.7,p.trim);
  box(3.06,.525,.41,3.22,.532,.57,p.dark);
  for(const [x,y,v] of [[2.25,3.55,.8],[.65,7.115,2.6],[.65,7.115,5.3],[2.75,3.1,5.75]])add(rodGeo,p.bulb,x,y,v,.14,.02,.14);
  const lamp=new THREE.PointLight(0xfff5df,.28,10,2);lamp.position.set(1,4.2,3.1).applyMatrix4(pose);scene.add(lamp);
 });
