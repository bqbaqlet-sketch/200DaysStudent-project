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
