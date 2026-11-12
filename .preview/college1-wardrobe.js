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
