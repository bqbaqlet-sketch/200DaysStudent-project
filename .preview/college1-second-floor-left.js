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
   label('ШЫҒУ · ВЫХОД',-29.3,2.9,-1.65,.72,.17,'#4c8398','#fff',Math.PI);
   upperMark('upperLeftFarStairPassage',-29.3,-1.6,1.5,.2,{open:true,stairInteriorDeferred:false});
   upperMark('upperLeftCorridor',-14.2,-2.85,33,2.5,{classrooms:10,closedDoors:10,crossBeams:2});
