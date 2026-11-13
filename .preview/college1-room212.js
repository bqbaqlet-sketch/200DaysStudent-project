// BEGIN COLLEGE1_ROOM212
function buildRoom212(doorWidth){
 // Door at the right end of the long wall: enter toward +Z, turn left toward -X.
 const left=-5.70,right=.85,depth=3.55,height=3.18,halfDoor=doorWidth/2;
 const frame=new THREE.Object3D();frame.name='room212-frame';frame.applyMatrix4(pose);scene.add(frame);
 const white=material(0xf3f2ec,null,{emissive:0x242422,shininess:19});
 const wall=material(0xf0f0e9,null,{emissive:0x292827,shininess:8});
 const lowerWall=material(0xe6e2d5,null,{emissive:0x24231f,shininess:10});
 const oak=material(0xcf8d48,oakMap,{shininess:31}),edge=material(0x996a37);
 const black=material(0x171d21,null,{shininess:42}),plastic=material(0x2f3539,null,{shininess:25});
 const cushion=material(0x3d4245,null,{shininess:6}),steel=material(0x8c969c,null,{shininess:80});
 const woodFrame=material(0x67452d,null,{shininess:45}),rubber=material(0x12181d);
 const glass=material(0xb1ccd3,null,{transparent:true,opacity:.11,depthWrite:false,side:THREE.DoubleSide,shininess:80});
 const green=new THREE.MeshBasicMaterial({color:0x61c78c}),blue=new THREE.MeshBasicMaterial({color:0x72b5e7});
 let roomSeed=212;const random=()=>{roomSeed=(Math.imul(roomSeed,1664525)+1013904223)>>>0;return roomSeed/4294967296};
 const floorMap=texture(512,1024,(g,w,h)=>{
  g.fillStyle='#b7b0a3';g.fillRect(0,0,w,h);
  for(let row=0;row<8;row++){
   const x=row*w/8;g.fillStyle=['#b7afa2','#c0b9ad','#afa899','#c8c0b4'][row%4];g.fillRect(x,0,w/8,h);
   for(let i=0;i<180;i++){g.strokeStyle=i%2?'#e9e8da35':'#555c5720';g.lineWidth=.5+random();const xx=x+random()*w/8,y=random()*h;g.beginPath();g.moveTo(xx,y);g.bezierCurveTo(xx+4,y+40,xx-4,y+90,xx+2,y+150);g.stroke();}
   g.strokeStyle='#7c84776b';g.lineWidth=1;g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();
   for(let y=(row%3)*170;y<h;y+=510){g.beginPath();g.moveTo(x,y);g.lineTo(x+w/8,y);g.stroke();}
  }
 },1.44);
 const floorMaterial=material(0xaaa49b,floorMap,{emissive:0x181612,shininess:12,specular:0x282521});
 room212Floor=stairFloor(left,0,right,depth,0,floorMaterial);
 box(left-.13,0,.15,left,height,depth+.13,wall,true);
 box(left,height,.15,right,height+.12,depth,white);
 box(right,0,.15,right+.13,height,depth+.13,wall,true);
 box(right-.008,.075,.15,right+.005,.94,depth,lowerWall);
 for(const [a,b] of [[left,-halfDoor],[halfDoor,right]]){
  box(a,0,.15,b,height,.165,wall);box(a,0,.168,b,.94,.18,lowerWall);
  box(a,.005,.18,b,.075,.205,woodFrame);
 }
 box(-halfDoor,2.44,.15,halfDoor,height,.165,wall);
 box(left,.004,depth-.028,right,.08,depth,woodFrame);
 box(left,.004,.15,left+.027,.08,depth,woodFrame);
 box(left,.075,.15,left+.008,.94,depth,lowerWall);
 for(const z of [.18,depth-.045]){
  box(left,height-.11,z-.025,right,height-.055,z+.025,white);
  box(left,height-.055,z-.055,right,height-.015,z+.055,white);
 }
 for(const x of [left+.035,right-.035])box(x-.035,height-.08,.15,x+.035,height-.015,depth,white);
 // A working door on the existing corridor opening, with the original BQFQ mark.
 buildClassroomLeaf({number:'212',x:0,z:0,hingeX:halfDoor-.036,hingeZ:-.024,width:doorWidth-.072,height:2.435,
  frame:black,glazing:material(0x8fa5a7,null,{transparent:true,opacity:.40,depthWrite:false}),bands:white,brandName:'office-brand-upper-left-212'});
 const door=interactiveClassroomDoors.at(-1);door.name='Кабинет 212 · Информатика';
 add(new THREE.CircleGeometry(1,28),p.gold,0,2.59,-.042,.17,.105,1,0,Math.PI);
 label('212',0,2.59,-.046,.28,.14,null,'#343a35',Math.PI);
 label('ИНФОРМАТИКА',0,2.84,-.043,1.1,.13,'#eeeee6','#46544f',Math.PI);
 // Clean desks and usable equipment; the reference's boxes, packaging and scrap
 // towers are deliberately absent from the room and window sills.
 const desktop=material(0xd59b5c,oakMap,{shininess:48});
 const keyboard=material(0x252b31,null,{shininess:22}),keycap=material(0x59616a);
 const screenMaterials=['code','desktop','code','network'].map((mode,index)=>new THREE.MeshBasicMaterial({map:texture(512,320,(g,w,h)=>{
  g.fillStyle=mode==='desktop'?'#225a82':'#172633';g.fillRect(0,0,w,h);
  g.fillStyle='#253e52';g.fillRect(0,0,w,22);g.fillStyle='#d5e6ef';g.font='13px monospace';g.fillText(mode==='network'?'NETWORK · 212':mode==='code'?'INFORMATICS · CODE':'WORKSPACE · 212',13,16);
  if(mode==='code'){
   g.fillStyle='#203342';g.fillRect(0,24,96,h-44);g.font='12px monospace';
   for(let i=0;i<13;i++){g.fillStyle=i%3?'#8fa9b6':'#c9dce5';g.fillText((i%3?'  ':'> ')+'lesson_'+(i+1),7,45+i*19);}
   for(let i=0;i<14;i++){g.fillStyle=['#72aeda','#87c39b','#c9b0d1','#e0bd87'][i%4];g.fillRect(117+(i%3)*16,43+i*17,95+(i*29%220),3);}
  }else if(mode==='network'){
   for(let i=0;i<6;i++){const x=55+(i%3)*175,y=76+Math.floor(i/3)*145;g.strokeStyle='#5c9cbd';g.lineWidth=2;g.beginPath();g.moveTo(w/2,160);g.lineTo(x,y);g.stroke();g.fillStyle='#4a96af';g.fillRect(x-23,y-16,46,32);g.fillStyle='#8de0af';g.fillRect(x+13,y+9,5,4);}
   g.fillStyle='#9dd3b6';g.font='13px monospace';g.fillText('All workstations online',159,302);
  }else{
   g.fillStyle='#327aa4';g.beginPath();g.moveTo(0,250);g.lineTo(170,110);g.lineTo(380,285);g.lineTo(512,180);g.lineTo(512,320);g.lineTo(0,320);g.fill();
   for(let i=0;i<5;i++){g.fillStyle=['#dce1d9','#74b4d7','#e1c46d'][i%3];g.fillRect(17,42+i*46,22,24);g.fillStyle='#c4dcea';g.fillRect(15,71+i*46,39,2);}
  }
  g.fillStyle='#14212a';g.fillRect(0,h-17,w,17);g.fillStyle='#73b3cf';for(let i=0;i<8;i++)g.fillRect(12+i*24,h-12,10,8);
 })}));
 function monitor(x,y,z,screen,width=.54){
  box(x-.13,y,z-.07,x+.13,y+.017,z+.11,plastic);
  box(x-.025,y+.017,z-.016,x+.025,y+.18,z+.024,black);
  box(x-width/2,y+.12,z-.044,x+width/2,y+.47,z+.014,black);
  panel(x,y+.299,z+.016,width-.037,.304,screen);
  add(ballGeo,green,x+width*.38,y+.135,z+.02,.006,.004,.003);
 }
 function officeChair(x,z){
  at(x,z,Math.PI,()=>{
   box(-.23,.428,-.23,.23,.492,.23,cushion);
   box(-.227,.51,-.258,.227,.91,-.204,cushion);
   for(const side of [-1,1]){
    for(const zz of [-.20,.19])rod([side*.217,.012,zz],[side*.196,.443,zz],.014,black);
    rod([side*.196,.443,-.20],[side*.22,.91,-.235],.014,black);
    rod([side*.217,.20,-.20],[side*.217,.20,.19],.010,black);
   }
   collider(-.244,0,-.28,.244,.94,.244);
  });
 }
 const topShape=new THREE.Shape();topShape.moveTo(-.51,.35);topShape.lineTo(.51,.35);topShape.lineTo(.51,-.35);topShape.lineTo(.27,-.35);topShape.quadraticCurveTo(0,-.19,-.27,-.35);topShape.lineTo(-.51,-.35);topShape.closePath();
 const topGeometry=new THREE.ExtrudeGeometry(topShape,{depth:.035,bevelEnabled:true,bevelSize:.009,bevelThickness:.004,bevelSegments:1,steps:1});topGeometry.rotateX(-Math.PI/2);
 const workstationCenters=[-1.40,-2.66,-3.92],deskZ=.56;
 for(let index=0;index<workstationCenters.length;index++){
  const x=workstationCenters[index];
  at(x,deskZ,0,()=>{
   add(topGeometry,desktop,0,.735,0,1,1,1);
   for(const x of [-.46,.46])box(x-.018,.02,-.30,x+.018,.735,.29,oak);
   box(-.46,.32,-.30,.46,.72,-.275,edge);
   box(.27,.06,-.26,.45,.71,.17,oak);
   box(.293,.115,-.22,.426,.59,.115,black);
   box(.31,.48,.116,.41,.50,.125,plastic);
   for(let i=0;i<6;i++)box(.31,.16+i*.035,.116,.41,.169+i*.035,.122,plastic);
   add(ballGeo,blue,.405,.53,.128,.008,.008,.004);
   monitor(-.04,.775,-.13,screenMaterials[index]);
   box(-.28,.777,.17,.16,.796,.31,keyboard);
   for(let row=0;row<4;row++)for(let key=0;key<12;key++)box(-.26+key*.033,.797,.178+row*.027,-.237+key*.033,.801,.197+row*.027,keycap);
   box(-.16,.797,.294,.048,.801,.307,keycap);
   box(.20,.776,.15,.39,.780,.32,plastic);add(ballGeo,keyboard,.29,.798,.23,.035,.023,.057);
   // Cable tray and short leads stay beneath the desktop rather than in the aisle.
   box(-.43,.65,-.28,.43,.70,-.22,plastic);
   rod([-.04,.80,-.11],[-.04,.67,-.22],.005,black);rod([-.04,.67,-.22],[.35,.67,-.22],.005,black);
   officeChair(0,.82);
   collider(-.52,0,-.35,.52,.78,.35);
  });
  mark('room212Workstation',x,deskZ,1.04,.72,{number:index+1,room:'212',computer:true,chairOnFloor:true,cablesManaged:true});
 }
 // Brown window frames, clear sills and sectional radiators from the photographs.
 const windows=[{a:-3.52,b:-2.40},{a:-.72,b:.62}],bottom=.86,top=2.85;
 let last=left;
 for(const opening of [...windows,{a:right,b:right}]){
  box(last,0,depth,opening.a,height,depth+.13,wall,true);
  box(last,.075,depth-.008,opening.a,.94,depth+.005,lowerWall);
  if(opening.a!==right){box(opening.a,0,depth,opening.b,bottom,depth+.13,wall,true);box(opening.a,top,depth,opening.b,height,depth+.13,wall,true);collider(opening.a,bottom,depth,opening.b,top,depth+.13);}
  last=opening.b;
 }
 const panorama=new THREE.MeshBasicMaterial({map:texture(768,512,(g,w,h)=>{
  g.fillStyle='#c3dbe5';g.fillRect(0,0,w,h);g.fillStyle='#c7bfa4';g.fillRect(0,100,w,h);g.fillStyle='#a7bec5';g.fillRect(0,132,w,18);
  for(const x of [18,157,296,435,574,713]){g.fillStyle='#e0dfce';g.fillRect(x,185,108,221);g.fillStyle='#85694a';g.fillRect(x+9,194,90,203);g.fillStyle='#a7cad1';g.fillRect(x+15,200,78,191);g.fillStyle='#e1e3d7';g.fillRect(x+50,200,5,191);g.fillRect(x+15,277,78,5);}
  g.fillStyle='#3995b5';g.fillRect(0,414,w,66);g.fillStyle='#dcd5bf';g.fillRect(0,480,w,32);
 })});
 for(const {a,b} of windows){
  const middle=(a+b)/2;
  const view=panel(middle,(bottom+top)/2,depth+.104,b-a,top-bottom,panorama,Math.PI);
  view.userData={kind:'room212WindowView',room:'212',oppositeEntry:a<0&&b>0};
  panel(middle,(bottom+top)/2,depth+.012,b-a-.04,top-bottom-.04,glass,Math.PI);
  for(const x of [a,middle,b])box(x-.025,bottom-.02,depth-.06,x+.025,top+.02,depth+.065,woodFrame);
  for(const y of [bottom,2.22,top])box(a-.025,y-.025,depth-.06,b+.025,y+.025,depth+.065,woodFrame);
  box(a-.08,bottom-.068,depth-.22,b+.08,bottom-.012,depth+.13,oak);
  for(const x of [a+.16,b-.16])rod([x,1.80,depth-.075],[x,1.94,depth-.075],.006,steel);
  for(let i=0;i<11;i++){const x=a+.13+i*(b-a-.26)/10;box(x-.032,.19,depth-.14,x+.032,.65,depth-.035,white);}
  for(const y of [.235,.60])rod([a+.08,y,depth-.085],[b-.08,y,depth-.085],.020,white);
  rod([b-.04,.235,depth-.06],[b+.17,.09,depth-.06],.014,white);
  mark('room212Window',middle,depth,b-a,.22,{room:'212',clearSill:true,radiator:true,wall:'opposite-entry',oppositeEntry:a<0&&b>0});
 }
 // Wall-mounted air conditioner in the pier between the two windows.
 const acX=(windows[0].b+windows[1].a)/2;
 at(acX,depth-.11,Math.PI,()=>{
  box(-.45,2.39,-.10,.45,2.69,.07,white);
  box(-.40,2.405,.071,.40,2.455,.080,plastic);
  for(let i=0;i<3;i++)box(-.39,2.413+i*.012,.081,.39,2.417+i*.012,.088,white);
  box(.29,2.58,.073,.33,2.59,.079,green);
 });mark('room212AirConditioner',acX,depth-.11,.90,.22,{room:'212',wallMounted:true});
 // Enclosed oak storage by the entry and an organised open bookcase.
 at(right-.22,depth-.68,-Math.PI/2,()=>{
  box(-.56,.02,-.23,.56,2.22,.22,oak,true);
  for(const x of [-.545,0]){
   box(x,.06,.223,x+.527,2.18,.245,desktop);
   rod([x+.475,.99,.26],[x+.475,1.15,.26],.008,steel);
  }
 });
 at(right-.22,1.62,-Math.PI/2,()=>{
  const shelfX=-.42,shelfW=.84,shelfBack=-.23,shelfFront=.17;
  box(shelfX,.025,shelfBack,shelfX+shelfW,1.91,shelfBack+.018,oak);
  for(const x of [shelfX,shelfX+shelfW-.025])box(x,.025,shelfBack,x+.025,1.93,shelfFront,oak);
  for(const y of [.03,.43,.86,1.30,1.89])box(shelfX,y,shelfBack,shelfX+shelfW,y+.026,shelfFront,oak);
  for(let i=0;i<6;i++)box(shelfX+.07+i*.063,1.328,-.20,shelfX+.117+i*.063,1.65+(i%3)*.025,.10,i%2?p.green:p.blue);
  for(const y of [.485,.92]){box(shelfX+.07,y,-.18,shelfX+.68,y+.20,.12,plastic);label('212',shelfX+.38,y+.10,.124,.20,.075,'#dfe4df','#385047');}
  box(shelfX+.04,.10,.175,shelfX+shelfW-.04,.41,.19,desktop);
  monitor(0,1.93,-.02,new THREE.MeshBasicMaterial({color:0x202a31}),.49);
  collider(shelfX,0,shelfBack,shelfX+shelfW,2.40,.19);
 });
 mark('room212Storage',right-.22,2.30,.48,2.28,{room:'212',wardrobe:1,bookcase:1,organised:true,side:'right-of-entry'});
 // One rack in the far left corner, with closed glass and dressed patch leads.
 const rackX=left+.50,rackZ=2.27;
 at(rackX,rackZ,-Math.PI/2,()=>{
  const rackW=.83,rackD=.88;
  box(-rackW/2,.035,-rackD/2,rackW/2,2.02,rackD/2,black,true);
  // Recess the front equipment visually inside the frame.
  box(-.353,.12,-.454,.353,1.94,-.447,plastic);
  for(const x of [-.369,.349]){
   box(x,.13,-.475,x+.020,1.94,-.454,steel);
   for(let i=0;i<32;i++)box(x+.006,.15+i*.054,-.478,x+.014,.166+i*.054,-.475,black);
  }
  for(const y of [.23,.45,.67,.89,1.11]){
   box(-.326,y,-.490,.326,y+.17,-.458,black);
   for(let vent=0;vent<12;vent++)box(-.27+vent*.040,y+.037,-.496,-.25+vent*.040,y+.125,-.490,plastic);
   for(const x of [-.31,.29])rod([x,y+.034,-.514],[x,y+.14,-.514],.005,steel);
   add(ballGeo,green,.259,y+.045,-.502,.005,.005,.003);
  }
  for(const y of [1.42,1.63]){
   box(-.33,y,-.49,.33,y+.105,-.456,steel);
   for(let port=0;port<16;port++){const x=-.30+port*.038;box(x,y+.03,-.497,x+.027,y+.071,-.491,black);box(x+.005,y+.077,-.5,x+.010,y+.082,-.496,green);}
  }
  const cableMaterial=[material(0x607f9e),material(0xbda562),material(0x5c8976)];
  for(let i=0;i<8;i++){
   const x=-.27+i*.073,curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x,1.46,-.512),new THREE.Vector3(x,1.30,-.55),new THREE.Vector3(.28,1.25-i*.012,-.55),new THREE.Vector3(.30,.98-i*.04,-.51)]);
   add(new THREE.TubeGeometry(curve,18,.004,5,false),cableMaterial[i%3],0,0,0,1,1,1);
  }
  // Closed glazing leaves the equipment visible without blocking the walkway.
  const rackGlass=material(0x9bb7bf,null,{transparent:true,opacity:.13,depthWrite:false,shininess:80});
  box(-.405,.10,-.535,-.377,1.97,-.50,black);box(.377,.10,-.535,.405,1.97,-.50,black);
  for(const y of [.10,1.94])box(-.405,y,-.535,.405,y+.03,-.50,black);
  box(-.377,.13,-.520,.377,1.94,-.512,rackGlass);
  rod([.337,.93,-.55],[.337,1.11,-.55],.008,steel);
  box(-.43,.015,-.46,.43,.04,.46,plastic);
 });mark('room212ServerRack',rackX,rackZ,.86,.92,{room:'212',closedGlass:true,managedCables:true});
 const rackScreen=new THREE.MeshBasicMaterial({map:texture(576,384,(g,w,h)=>{
  g.fillStyle='#142028';g.fillRect(0,0,w,h);
  for(let i=0;i<9;i++){
   const x=(i%3)*192+3,y=Math.floor(i/3)*128+3;g.fillStyle=['#8a998c','#a69a80','#758e9e'][i%3];g.fillRect(x,y,186,122);
   g.strokeStyle='#d5e2db';g.lineWidth=2;g.beginPath();g.moveTo(x+15,y+120);g.lineTo(x+75,y+46);g.lineTo(x+126,y+46);g.lineTo(x+177,y+120);g.stroke();
   g.fillStyle='#3f5052';g.fillRect(x+20,y+27,32,65);g.fillStyle='#dcece8';g.font='11px monospace';g.fillText('CAM '+String(i+1).padStart(2,'0'),x+7,y+15);
  }
 })});
 // Monitoring display beside the rack, on a proper equipment stand.
 at(left+.51,.76,Math.PI/2,()=>{
  box(-.31,.035,-.24,.31,.69,.24,oak,true);box(-.35,.69,-.28,.35,.727,.28,desktop);
  box(-.24,.11,.245,-.06,.60,.265,black);for(let i=0;i<5;i++)box(-.21,.17+i*.055,.266,-.09,.178+i*.055,.271,plastic);
  monitor(0,.73,-.03,rackScreen,.58);
 });
 // Printer on its own sideboard, with a clear front and no loose cases below.
 const printerX=left+.50,printerZ=3.12;
 at(printerX,printerZ,-Math.PI/2,()=>{
  box(-.36,.025,-.27,.36,.75,.27,oak,true);
  box(-.38,.75,-.29,.38,.785,.29,desktop);
  box(-.25,.785,-.20,.25,1.06,.20,white);
  box(-.21,.82,-.212,.21,.92,-.204,plastic);
  box(-.23,1.06,-.18,.23,1.10,.18,white);
  box(-.14,1.10,-.12,.14,1.104,.11,p.white);
 });
 mark('room212Printer',printerX,printerZ,.76,.58,{room:'212',onSideboard:true});
 // Tidy wall trunking, sockets, switch and ceiling lights.
 box(left+.90,.96,.18,-.82,1.005,.205,white);
 for(const x of workstationCenters){box(x-.08,.93,.208,x+.08,1.03,.233,white);for(const xx of [x-.035,x+.035])add(ballGeo,plastic,xx,.976,.236,.006,.006,.003);}
 box(acX+.34,1.08,depth-.025,acX+.46,1.24,depth-.012,white);
 box(-.72,1.05,.186,-.61,1.17,.205,white);
 for(const x of [-1.40,-4.40]){
  box(x-.55,height-.055,1.67,x+.55,height-.01,1.89,white);
  box(x-.52,height-.06,1.69,x+.52,height-.054,1.87,p.bulb);
 }
 for(const x of [-1.40,-4.40]){const light=new THREE.PointLight(0xf4fbff,.24,6,2);light.position.set(x,height-.28,1.78).applyMatrix4(pose);scene.add(light);}
 mark('room212', (left+right)/2,depth/2,right-left,depth,{number:'212',subject:'Информатика',level:3.74,computers:4,windows:2,serverRacks:1,printer:1,clutter:false,clearAisle:true,layoutRevision:2,extendsLeft:true,windowWall:'opposite-entry'});
 room212={frame,door,floor:room212Floor,bounds:{left,right,depth,height},workstationCenters,workstationPositions:workstationCenters.map(x=>({x,z:deskZ})),workstationAxis:'x',workstations:workstationCenters.length,windows,rack:{x:rackX,z:rackZ},printer:{x:printerX,z:printerZ},subject:'Информатика',clean:true,layoutRevision:2,extendsLeft:true};
}
// END COLLEGE1_ROOM212
