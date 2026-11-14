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
    label('ВЫХОД',0,3.24,-.075,.75,.17,'#4c8398','#fff',Math.PI);
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
   label('ВЫХОД',-29.3,2.9,-1.65,.72,.17,'#4c8398','#fff',Math.PI);
   upperMark('upperLeftFarStairPassage',-29.3,-1.6,1.5,.2,{open:true,stairInteriorDeferred:false});
   upperMark('upperLeftCorridor',-14.2,-2.85,33,2.5,{classrooms:10,closedDoors:10,crossBeams:2});
  }finally{pose=upperSavedPose}
 });
