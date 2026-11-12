 // Второй лестничный узел связывает правое крыло первого этажа и торец
 // левого крыла второго этажа возле 216. Мировые координаты: X=-15.4+u, Z=9.45-v.
 at(15.4,9.45,Math.PI,()=>{
  // Светлый проход с боковым входом в деревянный лестничный зал.
  stairFloor(-1.8,1.6,0,9.6,0);
  box(-.15,0,1.6,0,3.35,9.75,p.cream,true);
  box(-1.95,-2.15,2.4,-1.8,3.74,4.05,p.cream,true);
  // Подход к маршам открыт на всю ширину: без перегородки у нижнего ограждения.
  box(-1.95,2.7,5.85,-1.8,3.74,8.15,p.cream);
  box(-1.95,2.7,4.05,-1.8,3.74,5.85,p.cream,true);
  for(const v of [4.05,5.85])box(-1.98,0,v-.025,-1.77,2.73,v+.025,p.oak);
  box(-1.98,2.67,4.025,-1.77,2.74,5.875,p.oak);
  for(let v=1.8;v<9.6;v+=.65)box(-.158,.08,v-.003,-.15,3.3,v+.003,p.seam);
  box(-.175,0,1.6,-.15,.09,9.6,p.trim);
  box(-1.8,3.3,1.6,-.15,3.43,9.6,p.ceiling);
  for(const v of [2.4,6.3,8.8])box(-1.27,3.276,v-.29,-.68,3.3,v+.29,p.bulb);
  box(-1.8,0,9.6,0,3.35,9.75,p.cream,true);
  panel(-.9,1.7,9.595,1.05,1.65,outside,Math.PI);
  pot(-1.38,9.15,.63,0,'broad');
  // В зале — серый гранит и деревянные стены; марши прижаты к дальней стене.
  stairFloor(-7.5,2.4,-1.8,4.05,0);
  stairFloor(-2.6,4.05,-1.8,8.0,0);
  box(-7.65,-2.15,2.25,-7.5,7.15,8.15,p.oak,true);
  box(-7.5,-2.15,2.25,-1.8,7.15,2.4,p.oak,true);
  box(-7.5,-2.15,8,-1.8,7.15,8.15,p.oak,true);
  box(-7.5,7.1,2.4,.75,7.24,8,p.white);
  // Белые высокие панели с наклонной нижней кромкой и деревянными стойками.
  const secondStairPanel=p.cream.clone();secondStairPanel.side=THREE.DoubleSide;
  for(const [a,b] of [[2.45,3.72],[3.84,5.11],[5.23,6.5],[6.62,7.95]]){
   stairQuad([-7.48,3.0,a,-7.48,3.55,b,-7.48,7.08,b,-7.48,7.08,a],secondStairPanel);
   box(-7.485,0,b,-7.43,7.08,b+.065,p.oak);
  }
  for(const u of [-7.4,-5.8,-4.2,-2.6]){
   stairQuad([u,3.2,7.98,u+1.45,3.65,7.98,u+1.45,7.08,7.98,u,7.08,7.98],secondStairPanel);
   box(u-.04,0,7.925,u+.04,7.08,7.98,p.oak);
  }
  // Два подъёмных марша по 11 ступеней и отдельный спуск к двери кухни.
  at(-.6,11.3,-Math.PI/2,()=>{
   stairFloor(-7.1,5.135,-3.55,6.9,1.87);
   stairFloor(-7.1,5.135,-5.45,6.9,-1.87);
   stairFlight(-5.2,-3.55,0);
   stairFlight(-7.1,-5.45,1.87,true);
   stairFlight(-7.1,-5.45,0,false,true);
   stairRail([-5.23,0,2],[-5.23,1.87,5.135],true);
   stairRail([-3.61,0,2],[-3.61,1.87,5.135],true);
   stairRail([-7.07,3.74,2],[-7.07,1.87,5.135],true);
   stairRail([-5.42,3.74,2],[-5.42,1.87,5.135],true);
   stairRail([-7.07,0,2],[-7.07,-1.87,5.135],true);
   stairRail([-5.42,0,2],[-5.42,-1.87,5.135],true);
   stairRail([-3.61,1.87,5.135],[-3.61,1.87,6.82]);
   stairRail([-7.07,1.87,6.82],[-3.61,1.87,6.82]);
   stairRail([-7.23,0,2],[-7.23,0,6.82]);
  });
  // Верхняя галерея: слева ограждённый лестничный проём, справа светлая стена.
  stairFloor(-.75,0,.75,9.6,3.74);
  stairFloor(-2.6,2.4,-.75,5.85,3.74);
  stairFloor(-7.5,2.4,-2.6,4.05,3.74);
  box(-7.5,3.57,2.4,-2.6,3.6,4.05,p.trim);box(-2.6,3.57,2.4,-.75,3.6,5.85,p.trim);
  stairRail([-.78,3.74,.05],[-.78,3.74,2.38]);
  stairRail([-.78,3.74,5.9],[-.78,3.74,9.5]);
  stairRail([-7.42,3.74,4.08],[-2.64,3.74,4.08]);
  stairRail([-2.63,3.74,5.9],[-.78,3.74,5.9]);
  box(.75,3.74,0,.9,7.1,9.75,p.cream,true);
  box(-.75,7.04,0,.75,7.17,9.6,p.ceiling);
  box(-.75,3.74,9.6,.75,7.1,9.75,p.cream,true);
  for(let v=.1;v<9.6;v+=.7)box(.74,3.82,v-.003,.75,7.04,v+.003,p.seam);
  box(.72,3.74,0,.75,3.83,9.6,granite);
  for(const v of [1.0,4.4,8.2])box(-.29,7.016,v-.29,.3,7.04,v+.3,p.bulb);
  // Окна в одном направлении на нижней и верхней площадках.
  function serviceStairWindow(u,base,width=1.7,plants=false){
   const v=2.415;
   panel(u,base+1.9,v,width,2.1,outside);
   for(const x of [u-width/2-.035,u,u+width/2+.035])box(x-.024,base+.8,2.41,x+.024,base+3,2.47,p.frame);
   for(const y of [.82,2.98])box(u-width/2-.06,base+y-.025,2.41,u+width/2+.06,base+y+.025,2.47,p.frame);
   for(let y=1.6;y<3;y+=.13){box(u-width/2,base+y,2.48,u+width/2,base+y+.073,2.495,p.blind);box(u-width/2,base+y+.075,2.48,u+width/2,base+y+.104,2.493,p.blindLight)}
   box(u-width/2-.11,base+.77,2.39,u+width/2+.11,base+.84,2.85,p.counter);
   box(u-width/2+.07,base+.15,2.46,u+width/2-.07,base+.71,2.64,p.white);
   for(let x=u-width/2+.12;x<u+width/2-.06;x+=.095)box(x,base+.18,2.635,x+.035,base+.68,2.675,p.trim);
   if(plants)for(const x of [u-.45,u+.45])pot(x,2.62,.75,base+.84,'strap',false);
  }
  serviceStairWindow(-4.7,0,1.7,true);
  serviceStairWindow(-5.85,3.74,1.7);serviceStairWindow(-2.95,3.74,1.7);
  // Закрытый выход рядом с окном и огнетушитель на деревянной стене.
  at(-2.75,2.44,Math.PI,()=>{
   box(-.48,0,-.035,.48,2.38,.04,p.frame);box(-.41,.07,-.045,.41,2.3,-.036,guardWhite);
   label('ШЫҒУ · ВЫХОД',0,2.57,-.055,.68,.16,'#4c8398','#fff',Math.PI);
   rod([-.3,1.05,-.085],[-.3,1.22,-.085],.012,p.iron);
  });
  add(rodGeo,p.red,-6.32,1.5,2.57,.085,.49,.085);
  label('1',-6.08,1.8,2.57,.17,.19,'#b73735','#fff');
  // Синий бак, чёрный вкладыш и две сетчатые клетки, как на фотографиях.
  const binBlue=material(0x176cb0,null,{shininess:45});
  box(-7.27,.12,3.02,-6.63,1.08,3.63,binBlue,true);
  box(-7.31,1.08,2.99,-6.59,1.16,3.66,binBlue);
  box(-7.25,1.155,3.05,-6.65,1.17,3.6,p.black);
  for(const x of [-7.16,-6.74])add(rodGeo,p.iron,x,.085,3.55,.065,.05,.065,Math.PI/2);
  label('♻',-6.94,.75,3.665,.22,.27,null,'#dce6e5');
  function cage(x,y,v,w,h,d,mt){
   box(x-w/2,y,v-d/2,x+w/2,y+.04,v+d/2,mt);
   for(const a of [-w/2,w/2])for(const b of [-d/2,d/2])rod([x+a,y,v+b],[x+a,y+h,v+b],.006,p.steel);
   for(let a=-w/2;a<=w/2+.001;a+=.065)for(const b of [-d/2,d/2])rod([x+a,y,v+b],[x+a,y+h,v+b],.003,p.steel);
   for(let b=-d/2;b<=d/2+.001;b+=.065)for(const a of [-w/2,w/2])rod([x+a,y,v+b],[x+a,y+h,v+b],.003,p.steel);
   for(const yy of [y+h*.45,y+h])for(const b of [-d/2,d/2])rod([x-w/2,yy,v+b],[x+w/2,yy,v+b],.004,p.steel);
  }
  cage(-6.9,.03,2.67,.65,.42,.38,p.trim);cage(-6.9,.47,2.67,.35,.36,.28,binBlue);
  collider(-7.23,0,2.48,-6.57,.85,2.88);
  add(ballGeo,p.white,-6.91,.71,2.67,.035,.06,.035);
  box(-7.3,.03,3.85,-6.91,.12,4.05,p.black);
  rod([-2.12,.08,2.73],[-2.16,1.5,2.71],.012,binBlue);box(-2.3,.025,2.7,-2.02,.07,2.98,binBlue);
  // Кухня внизу: только дверь, без дальнейшего интерьера и перехода.
  at(-7.46,5.025,-Math.PI/2,()=>{
   box(-.59,-1.87,-.065,.59,.53,.035,p.frame,true);
   box(-.52,-1.83,-.082,.52,.45,-.066,p.oak);
   label('не заходить',0,-.25,-.09,.92,.23,'#e7dfce','#9d342f',Math.PI);
   rod([-.36,-.94,-.12],[-.36,-.76,-.12],.012,p.iron);
  });
  mark('kitchenRestrictedDoor',-7.46,5.025,.14,1.18,{level:-1.87,closed:true,text:'не заходить',interactive:false});
  // Оранжевый стул у ограждения спуска, не перекрывающий ступени.
  const orange=material(0xb86e35,null,{shininess:12});
  box(-7.17,.43,4.02,-6.76,.48,4.38,orange);
  box(-7.17,.49,4.34,-6.76,.91,4.37,orange);
  for(const u of [-7.13,-6.8])for(const v of [4.06,4.34])rod([u,0,v],[u,.43,v],.01,p.iron);
  collider(-7.18,0,4.01,-6.75,.93,4.39);
  for(const [u,y,v] of [[-4.5,3.56,3.22],[-.9,3.27,4.9],[-4.7,6.99,6.8]])add(rodGeo,p.bulb,u,y,v,.14,.022,.14);
  mark('secondStairHall',-3.38,4.8,8.25,9.6,{levels:[-1.87,0,1.87,3.74],connects:'ground-right-to-upper-left',upFlights:2});
  mark('secondStairGroundEntry',-.9,1.6,1.64,.2,{level:0,open:true});
  mark('secondStairUpperEntry',0,0,1.5,.2,{level:3.74,open:true,nearClassroom:'216'});
 });
