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
     g.fillStyle='#3b7197';g.font='bold 20px Arial';g.fillText('БУДЬ ДРУГОМ',w/2,h*.54+82);
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
  for(const [u,w,title,theme] of [[5.5,3.4,'БЕЗОПАСНАЯ СРЕДА','friendship'],[13.4,3.6,'БУДЬ ДРУГОМ','friendship'],[18.1,3.8,'ЧЕСТНЫЙ ГРАЖДАНИН','friendship'],[22.7,2.4,'ЗДОРОВЬЕ','health']])corridorBoard(u,9.635,w,title,theme,Math.PI);
  for(const [u,w,title,theme] of [[10.7,2.5,'ЗДОРОВЬЕ','health'],[18.6,3.8,'БУДЬ ДРУГОМ','friendship'],[22,1.7,'БЕЗОПАСНОСТЬ','friendship']])corridorBoard(u,12.065,w,title,theme,0);

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
   label('ВЫХОД',0,3.24,-.09,.78,.18,'#4c8398','#ffffff',Math.PI);
   add(rodGeo,p.red,-1.02,1.16,-.1,.095,.52,.095);
   rod([-1.02,1.42,-.1],[-.94,1.52,-.1],.016,p.iron);
   label('←',-1.02,1.63,-.13,.2,.18,'#4f805b','#fff',Math.PI);
   box(.99,1.32,-.095,1.15,1.48,-.04,p.red);
  });
  mark('continuationEndExit',30.68,10.85,.18,1.84,{closed:true,interactive:false,leaves:2,threshold:.12});
  mark('continuationHall',15.675,10.85,30.05,2.5,{turnFromStairs:'right',endDoorClosed:true,noticeBoards:7});
  mark('stairForwardPassage',2.4,8.06,1.76,.24,{open:true,direction:'straight',furtherReferencePending:false});
