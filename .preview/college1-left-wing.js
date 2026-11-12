// Левое крыло стоит напротив правого: общая ось проёмов Z=8.975.
 inLeftCorridor(()=>{
  box(3.15,-.14,10.3,5.4,0,22.4,p.corridor);
  box(3.0,0,10.45,3.15,3.35,19.78,p.cream,true);box(3.0,0,21.42,3.15,3.35,22.55,p.cream,true);
  box(3.0,2.6,19.78,3.15,3.35,21.42,p.cream,true);box(5.4,0,10.45,5.55,3.35,22.55,p.cream,true);
  box(3.15,0,22.4,5.4,3.35,22.55,p.cream,true);box(3.15,3.3,10.3,5.4,3.43,22.4,p.ceiling);
  for(const x of [3.165,5.385]){
   for(let z=10.45;z<=22.4;z+=.6)if(x>4||z<19.73||z>21.47)box(x-.007,.07,z-.003,x+.007,3.3,z+.003,p.seam);
   for(const [z1,z2] of x>4?[[10.45,22.4]]:[[10.45,19.73],[21.47,22.4]])box(x-.018,0,z1,x+.018,.09,z2,p.trim);
  }
  for(const z of [11.5,14.5,17.5,20.5])box(3.98,3.278,z-.295,4.57,3.3,z+.295,p.bulb);
  for(const z of [13.5,19.5]){const light=new THREE.PointLight(0xfffcf2,.18,8,2);light.position.set(4.25,3,z).applyMatrix4(pose);scene.add(light)}
  for(const x of [3.15,5.4])box(x-.055,0,10.25,x+.055,3.02,10.47,p.oak);
  box(3.1,2.95,10.25,5.45,3.05,10.47,p.oak);
  mark('leftCorridorPortal',4.275,10.36,2.25,.22,{open:true,wall:'left-side',direction:'left',axis:'x'});
  // На фотографиях в ближней паре 106 и 107, дальше справа ещё один кабинет.
  officeDoor(3.166,12.4,1.4,'106',-Math.PI/2);officeDoor(5.384,12.5,1.4,'107',Math.PI/2);
  officeDoor(5.384,17.3,1.4,'108',Math.PI/2);
  // Вместо временной двери — настоящий проём в лестничный холл.
  for(const z of [19.78,21.42])box(2.98,0,z-.035,3.18,2.63,z+.035,p.oak);
  box(2.98,2.56,19.745,3.18,2.64,21.455,p.oak);
  mark('stairHallPortal',3.075,20.6,.2,1.64,{open:true,replaces:'leftServiceDoor'});
  // Окно с жалюзи, чёрный ступенчатый стеллаж и белые горшки, как на крупном плане.
  panel(4.275,1.84,22.38,1.78,2.15,outside,Math.PI);
  for(const x of [3.36,4.275,5.19])box(x-.025,.75,22.29,x+.025,3.0,22.4,p.white);
  for(const y of [.76,2.98])box(3.33,y-.025,22.29,5.22,y+.025,22.4,p.white);
  for(let y=1.76;y<3;y+=.13){box(3.38,y,22.265,5.17,y+.073,22.28,p.blind);box(3.38,y+.075,22.265,5.17,y+.105,22.28,p.blindLight)}
  box(3.3,.72,22.12,5.25,.79,22.4,p.white);
  box(3.57,.025,21.46,5.04,.055,22.15,p.counter);
  for(const x of [3.67,4.275,4.9]){
   for(const z of [21.78,22.09])rod([x,0,z],[x,1.46,z],.012,p.iron);
   for(let row=0;row<3;row++){
    const y=.28+row*.47+(x===4.275?.1:0);
    box(x-.205,y,21.7,x+.205,y+.035,22.12,p.counter);
    pot(x,21.91,.53+(row%2)*.05,y+.036,'broad',false);
   }
  }
  pot(3.96,21.57,.5,.055,'broad',false);pot(4.5,21.57,.5,.055,'broad',false);
  collider(3.57,0,21.46,5.04,1.8,22.15);mark('leftPlantDisplay',4.305,21.805,1.47,.69,{shelves:9,pots:11});
  // Высокий фикус слева. Листья соединены с ветвями, крона помещается перед стеной.
  pot(3.39,21.8,.85,0,'empty');
  rod([3.39,.28,21.8],[3.41,1.62,21.8],.018,p.frame);
  for(let i=0;i<18;i++){
   const a=i*2.4,top=[3.39+Math.cos(a)*.065,.72+i*.06,21.8+Math.sin(a)*.13];
   rod([3.4,top[1]-.14,21.8],top,.006,p.frame);
   for(let j=0;j<3;j++)add(leafGeo,p.green,...top,.44,.44,.44,0,a+j*.7,.2);
  }
  // Пальма и два прямоугольных кашпо с длинными листьями у правой стены.
  pot(4.83,21.36,.92,0,'empty');rod([4.83,.28,21.36],[4.83,2.02,21.36],.02,p.frame);
  for(let j=0;j<16;j++)add(strapGeo,p.green,4.83,1.88+(j%3)*.08,21.36,.85,1.5,.85,0,j*Math.PI/8,.2+(j%3)*.16);
  const bladeGeo=new THREE.BufferGeometry(),vertices=[],indices=[];
  for(let row=0;row<=9;row++){
   const t=row/9,width=Math.sin(Math.PI*t)*.045;
   for(const side of [-1,0,1])vertices.push(Math.sin(t*Math.PI/2)*.09,t,side*width);
  }
  for(let row=0;row<9;row++)for(let side=0;side<2;side++){const n=row*3+side;indices.push(n,n+3,n+1,n+1,n+3,n+4)}
  bladeGeo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));bladeGeo.setIndex(indices);bladeGeo.computeVertexNormals();
  for(const z of [19.95,20.78]){
   box(4.9,.03,z-.3,5.26,.48,z+.3,p.white,true);box(4.925,.48,z-.275,5.235,.49,z+.275,p.soil);
   for(let i=0;i<10;i++)add(bladeGeo,p.green,5.08+(i%2?-.055:.055),.49,z-.23+(i/10)*.46,1,.7+(i%4)*.12,1,0,i*2.4);
   mark('leftRectangularPlanter',5.08,z,.36,.6);
  }
  at(3.177,18.4,-Math.PI/2,()=>{
   label('→',0,1.53,-.03,.22,.22,'#ae4140','#fff',Math.PI);box(-.32,1.41,-.055,-.18,1.57,-.02,p.red);
  });
  for(const z of [11.7,15.5,19.3])add(ballGeo,p.white,4.275,3.25,z,.055,.026,.055);
 });
