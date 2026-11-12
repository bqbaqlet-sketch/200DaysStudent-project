 // Лестничный холл за отмеченным проёмом левого крыла. Вход из коридора: (16.3, 7.85).
 const stairInfo={entry:{x:16.3,z:7.85},origin:{x:13.9,z:7.85},rise:.17,tread:.285,stepsPerFlight:11,
  halfFloor:1.87,upperFloor:3.74,stairStart:2,stairEnd:5.135,width:8.8,depth:8,stairsSide:'right',stairAxis:'x',flightTurnDegrees:90,wallShift:2,wallClearance:.01,forwardCorridor:true,lowerInteriorDeferred:true,upperInteriorDeferred:true,continuationDeferred:true};
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
 const continuationBounds={x1:15.42,x2:17.18,z1:-3.35,z2:-.15};
 function stairSurface(x1,z1,x2,z2,y){
  const bounds=new THREE.Box3(new THREE.Vector3(x1,y,z1),new THREE.Vector3(x2,y,z2)).applyMatrix4(pose);
  stairSurfaces.push([bounds.min.x,bounds.min.z,bounds.max.x,bounds.max.z,y]);
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
 function stairFlight(x1,x2,baseY,returning=false,descending=false){
  for(let i=0;i<11;i++){
   const za=returning?5.135-(i+1)*.285:2+i*.285,zb=za+.285,y=baseY+(descending?-1:1)*(i+1)*.17;
   box(x1,y-.17,za,x2,y,zb,granite);stairSurface(x1,za,x2,zb,y);
   const nose=returning?zb:za;box(x1,y+.001,nose-.008,x2,y+.012,nose+.008,p.steel);
  }
  const y0=baseY-.2,y1=baseY+(descending?-1:1)*1.87-.2,za=returning?5.135:2,zb=returning?2:5.135;
  stairQuad([x1,y0,za,x2,y0,za,x2,y1,zb,x1,y1,zb],stairWhite);
  for(const x of [x1,x2]){
   stairQuad([x,baseY-.16,za,x,baseY-.39,za,x,baseY+(descending?-1:1)*1.87-.39,zb,x,baseY+(descending?-1:1)*1.87-.16,zb],stairWhite);
   rod([x,baseY-.39,za],[x,baseY+(descending?-1:1)*1.87-.39,zb],.006,p.iron);
  }
 }
 at(-13.9,7.85,Math.PI,()=>{
  // Коридор не сдвигается. Справа открыт доступ к поперечным маршам.
  stairFloor(0,0,8.8,4.45,0);stairFloor(0,4.45,3.4,8,0);
  mark('collegeStairHall',4.4,4,8.8,8,{floors:[0,3.74],stairsSide:'right',stairAxis:'x',openForward:true});
  // Стены увеличенного объёма. На дальней стене открыт проход продолжения, а не дверь выхода.
  box(-.15,-2.1,-.15,0,7.15,8.15,p.oak,true);box(8.8,-2.1,-.15,8.95,7.15,8.15,p.cream,true);
  box(0,-2.1,8,1.52,7.15,8.15,p.cream,true);box(3.28,-2.1,8,8.8,7.15,8.15,p.cream,true);
  box(1.52,2.65,8,3.28,7.15,8.15,p.cream,true);
  box(0,-2.1,-.15,1.58,7.15,0,p.cream,true);box(3.22,-2.1,-.15,8.8,7.15,0,p.cream,true);
  box(1.58,2.6,-.15,3.22,7.15,0,p.cream,true);
  box(0,7.15,0,8.8,7.28,8,p.white);
  for(const v of [0,2,4,6,7.95])box(8.73,0,v-.045,8.797,7.14,v+.045,p.oak);
  for(let v=0;v<8;v+=1.6){
   const end=Math.min(v+1.6,8),h1=1+v*.43,h2=1+end*.43;
   stairQuad([8.78,0,v,8.78,0,end,8.78,h2,end,8.78,h1,v],new THREE.MeshPhongMaterial({map:oakMap,side:THREE.DoubleSide,color:0xc2a586}));
  }
  for(const [x1,x2] of [[0,1.52],[3.28,8.8]])box(x1,-2.05,7.96,x2,3.1,8,p.oak);
  for(const x of [.08,1.5,3.3,5.1,6.8,8.7])box(x-.04,0,7.935,x+.04,7.14,7.97,p.oak);
  for(const x of [.015,8.785]){
   box(x-.012,0,0,x+.012,.09,7.95,granite);
   for(let v=.8;v<7.95;v+=.8)rod([x,.12,v],[x,7.1,v],.0025,p.seam);
  }
  // Марши поперёк холла по наброску: начало у ближнего края, подъём к правой стене.
  // Весь блок сдвинут на 2 м к деревянной стене: край ступеней V=7.95, стена V=7.96.
  at(1.4,11.5,Math.PI/2,()=>{
   stairFloor(3.55,5.135,6.7,7.25,1.87);stairFloor(3.55,.75,6.7,2,3.74);
   stairFloor(5.25,5.135,6.7,7.25,-1.87);
   stairFlight(3.55,5,0);stairFlight(5.25,6.7,1.87,true);stairFlight(5.25,6.7,0,false,true);
   stairRail([5.04,0,2],[5.04,1.87,5.135],true);
   stairRail([5.21,3.74,2],[5.21,1.87,5.135],true);stairRail([6.73,3.74,2],[6.73,1.87,5.135],true);
   stairRail([5.21,0,2],[5.21,-1.87,5.135],true);stairRail([6.84,0,2],[6.84,0,7.2]);
   stairRail([6.73,1.87,5.135],[6.73,1.87,7.2]);stairRail([6.73,-1.87,5.135],[6.73,-1.87,7.2]);
   stairRail([3.64,3.74,2],[5.04,3.74,2]);
   stairRail([3.64,3.74,.78],[3.64,3.74,2]);stairRail([6.73,3.74,.78],[6.73,3.74,2]);
   stairRail([3.64,0,2],[3.64,1.87,5.135],true);
   for(const v of [2.5,3.55,4.6]){
    const y=(v-2)/3.135*1.87-.22;rod([3.56,y,v],[4.99,y,v],.003,p.seam);
   }
   for(const x of [6.3,3.91]){
    add(new THREE.CylinderGeometry(.18,.14,.52,14),p.white,x,2.13,6.75,1,1,1);
    for(let i=0;i<9;i++){
     const a=i*2.4,top=[x+Math.cos(a)*.08,2.46+i*.035,6.75+Math.sin(a)*.08];
     rod([x,2.35,6.75],top,.006,p.green);add(leafGeo,p.green,...top,.7,.7,.7,0,a,.3);
    }
    collider(x-.18,1.87,6.57,x+.18,2.4,6.93);
   }
  });
  // Площадка второго этажа над проходом, с закрытым выходом до следующих фотографий.
  box(2.08,3.74,4.8,2.15,6.2,7.95,p.cream,true);
  at(2.16,5.6,-Math.PI/2,()=>{
   box(-.61,3.74,-.015,.61,6.14,.04,p.trim);box(-.54,3.77,-.035,.54,6.06,-.015,p.cream);
  });
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
  mark('stairUpFlight',4.9675,7.225,3.135,1.45,{axis:'x',ascendingToward:'right-wall',footX:3.4,topX:6.535});
  mark('stairDownFlight',4.9675,5.525,3.135,1.45,{axis:'x',unlabelled:true});

  // Окна расположены дальше вдоль левой стены: аварийный выход перед ними.
  for(const base of [0,3.74]){
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
  // Открытый проём прямо. Пока только короткий нейтральный участок, остальное — по будущим фото.
  for(const x of [1.52,3.28])box(x-.035,0,7.94,x+.035,2.69,8.18,p.oak);
  box(1.485,2.62,7.94,3.315,2.7,8.18,p.oak);
  stairFloor(1.52,8,3.28,11.2,0,p.corridor);
  box(1.37,0,8.15,1.52,3.3,11.35,p.cream,true);box(3.28,0,8.15,3.43,3.3,11.35,p.cream,true);
  box(1.52,0,11.2,3.28,3.3,11.35,p.cream,true);box(1.52,3.3,8.15,3.28,3.43,11.2,p.ceiling);
  box(2.1,3.275,9.25,2.69,3.3,9.84,p.bulb);
  mark('stairForwardPassage',2.4,8.06,1.76,.24,{open:true,direction:'straight',furtherReferencePending:true});
 });
