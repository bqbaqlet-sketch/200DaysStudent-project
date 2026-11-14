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
  at(-1.77,3.8,-Math.PI/2,()=>label('ВЫХОД',0,2.94,-.02,.7,.17,'#4c8398','#fff',Math.PI));
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
   label('ВЫХОД',0,2.7,-.075,.77,.18,'#4c8398','#fff',Math.PI);
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
   label('ВЫХОД',-.65,2.95,9.825,.74,.17,'#4c8398','#fff',0);
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
    label('ВЫХОД',0,3.23,-.08,.73,.16,'#4c8398','#fff',Math.PI);
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
