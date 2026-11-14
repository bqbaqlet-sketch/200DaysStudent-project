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
  label('ВЫХОД',-.9,2.98,9.825,.71,.17,'#4c8398','#fff',0);
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
  // Стенды «ГОРДОСТЬ КОЛЛЕДЖА»: золотой орнамент, портреты и нижние карманы.
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
    g.fillText(group===1?'ОБРАЗОВАННОЕ ПОКОЛЕНИЕ — БУДУЩЕЕ СТРАНЫ':group===2?'СЕГОДНЯШНИЕ СТАРАНИЯ — ЗАВТРАШНИЕ ПОБЕДЫ':'ЛУЧШИЕ СТУДЕНТЫ',w/2,127,w-150);
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
  prideBoard(-14.85,3.65,'ГОРДОСТЬ КОЛЛЕДЖА',1);
  prideBoard(-19.18,4.6,'ГОРДОСТЬ КОЛЛЕДЖА',2);
  prideBoard(-22.88,2.5,'ГОРДОСТЬ КОЛЛЕДЖА',3);
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
   label('ВЫХОД',0,3.24,-.08,.73,.16,'#4c8398','#fff',Math.PI);
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
