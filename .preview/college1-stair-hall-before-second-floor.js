 // Лестничный холл за отмеченным проёмом левого крыла. Вход из коридора: (16.3, 7.85).
 const stairInfo={entry:{x:16.3,z:7.85},origin:{x:13.9,z:7.85},rise:.17,tread:.285,stepsPerFlight:11,
  halfFloor:1.87,upperFloor:3.74,stairStart:2,stairEnd:5.135,width:8.8,depth:8,stairsSide:'right',stairAxis:'x',flightTurnDegrees:90,wallShift:2,wallClearance:.01,flightWidth:1.85,upperRoute:'forward-then-right',upperRun:4.2,forwardCorridor:true,lowerInteriorDeferred:true,upperInteriorDeferred:true,continuationDeferred:false};
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
  box(2.08,3.74,0,2.15,6.2,1.9,p.cream,true);
  at(2.16,.975,-Math.PI/2,()=>{
   box(-.61,3.74,-.015,.61,6.14,.04,p.trim);box(-.54,3.77,-.035,.54,6.06,-.015,p.cream);
  });
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
 });
