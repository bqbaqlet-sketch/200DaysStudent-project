 // Пост охраны: открытая Г-образная перегородка, рабочий стол ниже борта и вход со стороны холла.
 const guardGray=material(0x777f80,null,{shininess:4}),guardEdge=material(0x3d4443),guardWhite=material(0xd9d6ca);
 function guardTriangle(points){
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo,new THREE.MeshPhongMaterial({color:0xe9e5d8,side:THREE.DoubleSide}));mesh.applyMatrix4(pose);scene.add(mesh);
 }
 // Длинный дубовый фасад перпендикулярен стене с окном. У окна находится короткий возврат.
 box(3.4,.025,3.45,3.48,1.155,5.9,p.white,true);
 box(3.385,.025,3.45,3.4,1.155,5.9,p.counter);
 box(3.4,.025,3.45,4.54,1.155,3.53,p.white,true);
 box(3.4,.025,3.435,4.54,1.155,3.45,p.counter);
 box(3.34,1.155,3.4,3.56,1.2,5.94,p.trim);box(3.34,1.155,3.4,4.59,1.2,3.6,p.trim);
 guardTriangle([3.377,.035,3.46,3.377,.035,5.89,3.377,.66,3.46]);
 rod([3.372,.66,3.46],[3.372,.035,5.89],.0045,p.iron);
 guardTriangle([3.405,1.15,3.427,4.53,1.15,3.427,4.53,.49,3.427]);
 for(const z of [3.45,5.9])rod([3.379,.03,z],[3.379,1.153,z],.004,p.iron);
 // Нижняя рабочая поверхность и две тумбы. В середине нет сплошного объёма.
 box(3.5,.728,3.55,4.16,.77,5.79,guardWhite,true);
 for(const z of [3.56,5.25]){
  box(3.54,.035,z,4.12,.716,z+.46,guardWhite,true);
  for(const y of [.24,.46])box(4.12,y, z+.012,4.128,y+.008,z+.448,guardEdge);
  for(const y of [.15,.37,.59])rod([4.137,y,z+.17],[4.137,y,z+.3],.008,p.iron);
 }
 const cctvMap=texture(576,384,(g,w,h)=>{
  g.fillStyle='#171d1d';g.fillRect(0,0,w,h);
  const colors=['#797d70','#8a8069','#6b777b','#a49c87','#747962','#716b60','#a0a59b','#8b8b81','#68716a'];
  for(let i=0;i<9;i++){
   const x=(i%3)*192+3,y=Math.floor(i/3)*128+3;
   g.fillStyle=colors[i];g.fillRect(x,y,186,122);g.fillStyle='#353d39';g.fillRect(x+9,y+22,37,72);g.fillRect(x+126,y+13,27,90);
   g.strokeStyle='#d9d5c375';g.lineWidth=2;g.beginPath();g.moveTo(x+51,y+122);g.lineTo(x+75,y+65);g.lineTo(x+112,y+65);g.lineTo(x+145,y+122);g.stroke();
   g.fillStyle='#e3e7d4';g.font='10px monospace';g.fillText('CAM '+String(i+1).padStart(2,'0'),x+5,y+12);
  }
 });
 const monitorScreen=new THREE.MeshBasicMaterial({map:cctvMap});
 for(const z of [3.99,4.63]){
  at(3.83,z,-Math.PI/2,()=>{
   box(-.13,.771,-.08,.13,.789,.12,p.black);box(-.022,.789,-.018,.022,.925,.024,p.iron);
   box(-.295,.878,-.033,.295,1.225,.025,p.black);panel(0,1.052,-.036,.55,.31,monitorScreen,Math.PI);
  });
  box(3.98,.772,z-.21,4.125,.79,z+.21,p.black);
  mark('guardMonitor',3.83,z,.11,.59,{inside:true,feeds:9});
 }
 function guardChair(x,z){
  at(x,z,-Math.PI/2,()=>{
   box(-.224,.43,-.22,.224,.492,.22,guardGray);box(-.218,.52,-.283,.218,.96,-.228,guardGray);
   for(const a of [-.195,.195]){
    rod([a,.025,-.19],[a,.45,-.19],.013,p.steel);rod([a,.025,.18],[a,.45,.18],.013,p.steel);
    rod([a,.45,-.215],[a,.93,-.26],.012,p.steel);
   }
   rod([-.2,.2,-.19],[.2,.2,-.19],.011,p.steel);collider(-.24,0,-.3,.24,.98,.235);
  });mark('guardChair',x,z,.535,.48,{inside:true,seatHeight:.43});
 }
 guardChair(4.61,4.08);guardChair(4.61,5.05);
 // Бутылка и бумаги лежат на рабочем столе, а не на верхнем бортике.
 const clearBottle=material(0xb9d7d7,null,{transparent:true,opacity:.44,shininess:90});
 add(rodGeo,clearBottle,3.91,.922,5.48,.057,.28,.057);add(rodGeo,p.blue,3.91,1.073,5.48,.025,.024,.025);
 box(3.62,.772,3.59,3.93,.777,3.87,p.white);box(3.65,.778,3.61,3.95,.782,3.87,p.white);
 mark('reception',4.0,4.67,1.2,2.5,{wall:'entry',side:'right',shape:'L',hollow:true,openSide:'hall',faceToward:'turnstile'});
 mark('guardWorktop',3.83,4.67,.66,2.24,{height:.77});
 // Объявления находятся на боковой стене рядом с окном, как на снимках изнутри поста.
 for(let i=0;i<6;i++)panel(5.978,1.72,3.75+i*.29,.24,.39,new THREE.MeshBasicMaterial({map:paperMap}),-Math.PI/2);
 box(5.87,1.54,3.28,5.96,1.86,3.63,p.white);box(5.86,1.63,3.31,5.87,1.69,3.53,p.red);
 panel(5.977,1.2,3.65,.41,.29,new THREE.MeshBasicMaterial({map:paperMap}),-Math.PI/2);
 // Компактная белая подставка с тремя горшками у наружного угла поста.
 for(const [x,z] of [[2.46,3.71],[2.46,4.18]]){
  rod([x,.035,z],[x,.78,z],.011,p.white);add(ballGeo,p.iron,x,.035,z,.025,.025,.025);
 }
 for(const [x,z,y,size] of [[2.66,3.92,.8,.66],[2.37,3.84,.49,.63],[2.68,4.12,.19,.7]]){
  add(rodGeo,p.white,x,y-.015,z,.15,.025,.15);pot(x,z,size,y,'broad',false);
  rod([2.46,.07,z],[x,y-.02,z],.011,p.white);
 }
 collider(2.2,0,3.56,2.93,1.12,4.35);mark('guardPlantStand',2.565,3.955,.73,.79,{pots:3});
