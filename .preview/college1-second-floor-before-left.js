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
   stairRail([2.2,0,1.94],[2.2,0,7.95]);
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
   // Два проёма на одной оси. Левое крыло пока ограничено коротким участком.
   for(const v of [0,8]){
    for(const u of [.35,2.15])box(u-.024,0,v-.04,u+.024,2.71,v+.14,p.iron);
    box(.326,2.67,v-.04,2.174,2.72,v+.14,p.iron);
    upperMark(v===8?'upperRightPortal':'upperLeftPortal',1.25,v,1.8,.2,{open:true,side:v===8?'right':'left'});
   }
   stairFloor(.35,-1.7,2.15,0,0,vinyl);
   box(.2,0,-1.85,.35,3.3,0,p.cream,true);box(2.15,0,-1.85,2.3,3.3,0,p.cream,true);
   box(.35,0,-1.85,2.15,3.3,-1.7,p.cream,true);box(.35,3.3,-1.7,2.15,3.43,0,p.ceiling);
   box(.96,3.275,-1.2,1.55,3.3,-.61,p.bulb);
   upperMark('upperLanding',1.1,4,2.1,8,{emptyRacks:6,leftWingDeferred:true});
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
   for(const d of doorPlan){
    const ry=d.v<10?Math.PI:0;
    at(d.u,d.v<10?9.6:12.1,ry,()=>{
     for(const [a,b] of [[-d.w/2-.14,-d.w/2],[d.w/2,d.w/2+.14]])box(a,0,-.015,b,3.3,.075,p.counter);
     box(-d.w/2,2.44,-.015,d.w/2,3.3,.075,p.counter);
     for(const x of [-d.w/2,d.w/2])box(x-.026,0,-.065,x+.026,2.45,.035,p.iron);
     box(-d.w/2,2.4,-.065,d.w/2,2.45,.035,p.iron);
     {
      // Только видимая часть кабинета за открытой дверью; основной маршрут — коридор.
      stairFloor(-1.25,0,1.25,1.6,0,upperWoodFloor);
      box(-1.4,0,0,-1.25,3.3,1.75,p.cream,true);box(1.25,0,0,1.4,3.3,1.75,p.cream,true);
      box(-1.25,0,1.6,1.25,3.3,1.75,p.cream,true);box(-1.25,3.3,0,1.25,3.43,1.6,p.ceiling);
      if(d.n==='207'){
       const alphabet=texture(512,512,(g,w,h)=>{
        g.fillStyle='#f2efe3';g.fillRect(0,0,w,h);g.fillStyle='#a64d56';g.fillRect(0,0,w,36);g.fillRect(0,h-30,w,30);
        g.fillStyle='#44678d';g.fillRect(0,36,24,h-66);g.fillRect(w-24,36,24,h-66);
        g.fillStyle='#324345';g.textAlign='center';g.font='bold 25px Arial';g.fillText('ENGLISH ALPHABET',w/2,76);
        for(let i=0;i<26;i++){
         const x=43+(i%5)*86,y=98+Math.floor(i/5)*62;
         g.strokeStyle='#869b9b';g.strokeRect(x,y,78,54);g.font='25px Arial';g.fillText(String.fromCharCode(65+i)+' '+String.fromCharCode(97+i),x+39,y+36);
        }
       });panel(0,1.75,1.595,1.15,1.2,new THREE.MeshBasicMaterial({map:alphabet}),Math.PI);
      }
      for(const x of [-.69,.69]){
       box(x-.32,.72,.79,x+.32,.76,1.25,p.trim,true);
       for(const a of [-.25,.25])rod([x+a,0,.91],[x+a,.72,.91],.014,p.steel);
       box(x-.2,.42,.38,x+.2,.47,.72,p.blue);
       box(x-.2,.48,.7,x+.2,.87,.735,p.blue);
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
      const brand=label('BQFQ',-leafWidth/2,1.65,-.028,leafWidth*.74,.22,null,'#177caf',Math.PI);brand.name='office-brand-upper-'+d.n;
      label('BQFQ',-leafWidth/2,1.65,.006,leafWidth*.74,.22,null,'#177caf',0).name='upper-door-back-'+d.n;
     });
    });
    const c=new THREE.Vector3(d.u,0,d.v).applyMatrix4(pose);
    classroomDoors.push({number:d.n,brand:'BQFQ',x:c.x,z:c.z,width:d.w,level:3.74,wing:'upper-right',open:d.open,facing:ry+Math.atan2(pose.elements[8],pose.elements[0])});
    upperMark('upperClassroomDoor',d.u,d.v,d.w,.15,{number:d.n,open:d.open,angle:d.open?68:0});
   }
   // Закрытая деревянная дверь в дальнем торце под высокой фрамугой.
   at(30.68,10.85,Math.PI/2,()=>{
    box(-.91,0,-.055,.91,2.35,.025,p.frame);
    for(const x of [-.88,0,.88])box(x-.03,0,-.065,x+.03,3.15,.035,p.frame);
    for(const side of [-1,1])for(const [a,b] of [[.18,.8],[.93,2.2]])box(side*.44-.34,a,-.07,side*.44+.34,b,-.055,p.oak);
    panel(0,2.75,-.054,1.71,.7,outside,Math.PI);box(-.91,3.1,-.065,.91,3.16,.035,p.frame);
    label('ШЫҒУ · ВЫХОД',0,3.24,-.075,.75,.17,'#4c8398','#fff',Math.PI);
    add(rodGeo,p.red,-1.04,1.24,-.08,.084,.48,.084);
   });upperMark('upperRightEndDoor',30.68,10.85,.16,1.82,{closed:true});
   upperMark('upperRightCorridor',15.45,10.85,30.5,2.5,{classrooms:8,openDoors:0});
  }finally{pose=upperSavedPose}
