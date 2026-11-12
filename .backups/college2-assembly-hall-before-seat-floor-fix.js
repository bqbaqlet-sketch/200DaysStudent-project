 // Third floor. The staircase opens inside the hall, beside the stage on the left.
 // Audience faces -X; the tall curtained windows are on its right (-Z).
 const hallLevel=floor2*2,hallCeiling=hallLevel+3.20,hallFloors=[];
 const hallBounds={x1:-2.60,x2:16.20,z1:-29.10,z2:-16.85};
 const carpet=mat(0xffffff,{map:texture(256,256,(ctx,w,h)=>{
  ctx.fillStyle='#777a76';ctx.fillRect(0,0,w,h);
  for(let i=0;i<22000;i++){
   const value=105+Math.floor(random()*45);
   ctx.fillStyle=`rgba(${value},${value+2},${value},${.15+random()*.26})`;
   ctx.fillRect(random()*w,random()*h,.4+random()*.6,1+random()*2);
  }
 }),roughness:.96});
 const teal=mat(0x1b6677,{roughness:.73,side:THREE.DoubleSide});
 const tealDark=mat(0x164f5e,{roughness:.8,side:THREE.DoubleSide});
 const cream=mat(0xe4e0ce,{roughness:.8,side:THREE.DoubleSide});
 const chrome=mat(0xaebbc0,{metalness:.72,roughness:.21});
 const seatCloth=mat(0x827f6f,{roughness:.75});
 const seatEdge=mat(0x6d6b5e,{roughness:.8});
 const screenBlack=mat(0x14191c,{roughness:.9});

 function hallFloor(x1,z1,x2,z2,level=hallLevel){
  box(x1,level-.17,z1,x2,level-.006,z2,white);
  surface(x2-x1,z2-z1,(x1+x2)/2,level,(z1+z2)/2,carpet,
   {rx:-Math.PI/2,u:(x2-x1)/.8,v:(z2-z1)/.8});
  hallFloors.push({x1,z1,x2,z2,level});
 }
 // One actual floor opening, shared by the stairs from the floor below.
 hallFloor(-2.60,-29.10,2.45,-16.85);
 hallFloor(6.66,-29.10,16.20,-16.85);
 hallFloor(2.45,-29.10,6.66,-21.24);
 hallFloor(2.45,-18.03,6.66,-16.85);
 surface(18.80,12.25,6.80,hallCeiling,-22.975,ceiling,
  {rx:Math.PI/2,u:18.8/.6,v:12.25/.6});
 wallsZ(-29.10,-16.85,-2.60,white,hallLevel,hallCeiling);
 wallsZ(-29.10,-16.85,16.20,white,hallLevel,hallCeiling);
 wallsX(-2.60,16.20,-29.10,white,hallLevel,hallCeiling);
 wallsX(-2.60,16.20,-16.85,white,hallLevel,hallCeiling);
 for(const z of [-29.003,-16.947])box(-2.51,hallLevel,z-.009,16.11,hallLevel+.09,z+.009,joint);
 for(const x of [-2.503,16.103])box(x-.009,hallLevel,-29.01,x+.009,hallLevel+.09,-16.94,joint);

 // Continue the same pair of flights, with white tiled treads below the carpet.
 const nextRunStart=stairRuns.length;
 tiledLanding(2.22,-21.24,2.45,-18.03,floor2);
 const hallLower=flight(2.45,1,-21.24,-19.72,floor2);
 tiledLanding(hallLower.end,-21.24,6.66,-18.02,hallLower.top);
 const hallUpper=flight(hallLower.end,-1,-19.55,-18.03,hallLower.top);
 for(const x of [6.75])wallsZ(-21.4,-17.8,x,white,ceiling2,hallLevel);
 for(const z of [-21.4,-17.8])wallsX(2.15,6.75,z,white,ceiling2,hallLevel);
 slopeRail(2.45,hallLower.end,-19.73,floor2,hallLower.rise,hallLower.run,hallLower.steps);
 slopeRail(hallLower.end,hallUpper.end,-19.54,hallLower.top,hallUpper.rise,hallUpper.run,hallUpper.steps);
 rod([2.49,floor2+1.13,-21.30],[hallLower.end,hallLower.top+.96,-21.30],.026,chrome);
 for(const y of [.96,.68,.42,.19])rod([hallLower.end,hallLower.top+y,-19.73],[hallLower.end,hallLower.top+y,-19.54],.013,chrome);
 for(const f of stairRuns.slice(nextRunStart))for(let i=0;i<f.steps;i++){
  const a=f.start+f.direction*i*f.run,b=a+f.direction*f.run,y=f.y0+(i+1)*f.rise;
  const inner=f===stairRuns[nextRunStart]?f.hi:f.lo;
  colliders.push([Math.min(a,b),inner-.027,Math.max(a,b),inner+.027,y-.2,y+.96]);
 }
 // The raised ledge and its two shallow steps follow the photographed stair well.
 hallFloor(2.45,-18.03,6.66,-16.85,hallLevel+.30);
 hallFloor(6.66,-18.03,6.96,-16.85,hallLevel+.30);
 hallFloor(6.96,-18.03,7.26,-16.85,hallLevel+.15);
 box(6.655,hallLevel,-18.04,6.67,hallLevel+.30,-16.86,white);
 box(6.95,hallLevel,-18.04,6.968,hallLevel+.30,-16.86,white);
 box(7.25,hallLevel,-18.04,7.267,hallLevel+.15,-16.86,white);
 for(const x of [6.965,7.265])box(x-.008,hallLevel+(x<7?.30:.15)-.005,-18.03,x+.008,hallLevel+(x<7?.30:.15)+.004,-16.85,chrome);
 rail(2.47,-18.03,6.65,-18.03,hallLevel+.30);
 rail(6.66,-18.03,6.66,-21.24,hallLevel);
 rail(6.66,-21.24,2.45,-21.24,hallLevel);
 rail(2.45,-21.24,2.45,-19.69,hallLevel);
 // Solid well linings hide adjacent rooms and slab edges without closing the stairs.
 box(2.44,hallLevel-.30,-21.31,6.74,hallLevel-.008,-21.24,white);
 box(6.66,hallLevel-.30,-21.24,6.74,hallLevel-.008,-18.03,white);
 box(2.45,hallLevel-.30,-18.03,6.66,hallLevel+.292,-17.97,white);
 sign(['↓'],.22,.16,6.65,hallLevel+1.38,-16.946,Math.PI,{bg:'#287054',fg:'#fff',size:100});

 // Soft pleats are real geometry, including the tied-back window curtains.
 function fabric(x,y,z,width,height,yaw,material=teal,{tied=false,fold=.038}={}){
  const nx=Math.max(18,Math.ceil(width*85)),ny=tied?18:4;
  const geo=new THREE.PlaneGeometry(width,height,nx,ny),p=geo.attributes.position;
  const folds=Math.max(5,Math.round(width/.095));
  for(let i=0;i<p.count;i++){
   const u=(p.getX(i)+width/2)/width,v=(p.getY(i)+height/2)/height;
   const pinch=tied?1-.64*Math.exp(-Math.pow((v-.27)/.19,2)):1;
   p.setXYZ(i,(u-.5)*width*pinch,p.getY(i),
    fold*(Math.cos(u*folds*Math.PI*2)+.23*Math.cos(u*folds*Math.PI*4))+.015*Math.sin(v*5+u*3));
  }
  geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo,material);mesh.position.set(x,y+height/2,z);mesh.rotation.y=yaw;scene.add(mesh);
  return mesh;
 }
 const valanceMap=texture(384,224,(ctx,w,h)=>{
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#236b7a';
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w,0);ctx.lineTo(w,h*.58);
  ctx.bezierCurveTo(w*.83,h*.95,w*.67,h*.95,w*.5,h*.68);
  ctx.bezierCurveTo(w*.33,h*.95,w*.17,h*.95,0,h*.58);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#eee9d6';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(0,h*.56);
  ctx.bezierCurveTo(w*.17,h*.93,w*.33,h*.93,w*.5,h*.66);
  ctx.bezierCurveTo(w*.67,h*.93,w*.83,h*.93,w,h*.56);ctx.stroke();
  ctx.lineWidth=5;ctx.lineCap='round';
  for(const [cx,d] of [[w*.25,1],[w*.75,-1]]){
   ctx.beginPath();ctx.moveTo(cx-d*72,65);ctx.bezierCurveTo(cx-d*30,63,cx-d*24,23,cx,25);
   ctx.bezierCurveTo(cx+d*65,20,cx+d*68,98,cx+d*8,103);
   ctx.bezierCurveTo(cx-d*34,106,cx-d*39,55,cx-d*2,55);
   ctx.bezierCurveTo(cx+d*26,55,cx+d*20,80,cx+d*6,76);ctx.stroke();
  }
  ctx.beginPath();ctx.moveTo(w/2-15,22);ctx.quadraticCurveTo(w/2,1,w/2+15,22);ctx.quadraticCurveTo(w/2,43,w/2-15,22);ctx.stroke();
 });
 const valanceMat=mat(0xffffff,{map:valanceMap,transparent:true,alphaTest:.2,side:THREE.DoubleSide,roughness:.8});
 const borderMap=texture(96,256,(ctx,w,h)=>{
  ctx.fillStyle='#236b7a';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='#eee9d6';ctx.lineWidth=5;ctx.beginPath();
  ctx.moveTo(14,0);ctx.lineTo(14,h);ctx.moveTo(w-14,0);ctx.lineTo(w-14,h);ctx.stroke();
  for(const cy of [64,192]){
   ctx.beginPath();ctx.moveTo(48,cy-62);ctx.bezierCurveTo(9,cy-24,14,cy+28,47,cy+28);
   ctx.bezierCurveTo(78,cy+28,81,cy-15,51,cy-15);ctx.bezierCurveTo(30,cy-15,30,cy+8,45,cy+8);ctx.stroke();
  }
 });
 const borderMat=mat(0xffffff,{map:borderMap,side:THREE.DoubleSide,roughness:.8});
 function valance(x,z,width,yaw=0){
  surface(width,.53,x,hallCeiling-.245,z,valanceMat,{yaw,u:width/.82});
  const ux=Math.cos(yaw),uz=-Math.sin(yaw);
  const count=Math.floor(width/.82);
  for(let i=0;i<=count;i++){
   const u=-width/2+.12+i*(width-.24)/count,px=x+u*ux,pz=z+u*uz;
   rod([px,hallCeiling-.41,pz],[px,hallCeiling-.61,pz],.011,cream);
   stamp(potGeo,cream,px,hallCeiling-.65,pz,.025,.12,.025);
   stamp(leafGeo,cream,px,hallCeiling-.59,pz,.022,.025,.022);
  }
 }

 // Broad, low stage with continuous gray carpet and bright edge strips.
 const stageFront=.60,stageHeight=.56;
 hallFloor(-2.51,-29.01,stageFront,-16.94,hallLevel+stageHeight);
 box(-2.51,hallLevel,-29.01,stageFront,hallLevel+stageHeight-.01,-16.94,carpet);
 for(let i=0;i<4;i++){
  const x1=stageFront+i*.30,x2=x1+.30,level=hallLevel+stageHeight-i*.14;
  hallFloor(x1,-29.01,x2,-16.94,level);
  box(x2-.012,hallLevel,-29.01,x2+.002,level-.004,-16.94,carpet);
  box(x2-.012,level-.004,-29.01,x2+.006,level+.003,-16.94,chrome);
 }
 // The screen sits at the back; cream inner drapes separate it from the teal wings.
 box(-2.50,hallLevel+stageHeight,-26.54,-2.40,hallCeiling-.43,-19.41,trim);
 box(-2.389,hallLevel+.79,-26.02,-2.362,hallCeiling-.70,-19.93,screenBlack);
 fabric(-2.33,hallLevel+stageHeight,-26.27,.43,2.25,Math.PI/2,cream,{fold:.025});
 fabric(-2.33,hallLevel+stageHeight,-19.67,.43,2.25,Math.PI/2,cream,{fold:.025});
 fabric(.39,hallLevel+stageHeight,-27.91,2.20,2.64,Math.PI/2,teal,{fold:.055});
 fabric(.39,hallLevel+stageHeight,-18.04,2.20,2.64,Math.PI/2,teal,{fold:.055});
 fabric(-1.15,hallLevel+stageHeight,-28.94,2.65,2.64,0,tealDark,{fold:.045});
 fabric(-1.15,hallLevel+stageHeight,-17.01,2.65,2.64,0,tealDark,{fold:.045});
 for(const z of [-26.76,-19.19])surface(.16,2.61,.46,hallLevel+stageHeight+1.305,z,borderMat,{yaw:Math.PI/2,v:3.9});
 for(const z of [-27.94,-18.05])surface(2.1,.18,.46,hallLevel+stageHeight+.22,z,borderMat,{yaw:Math.PI/2,u:4,v:.35});
 valance(.48,-22.975,12.06,Math.PI/2);

 // A quiet daytime view, white sheers, teal tiebacks, sills and radiators.
 const windowView=mat(0xffffff,{map:texture(256,384,(ctx,w,h)=>{
  const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#c2d5dd');g.addColorStop(.58,'#d9e1de');g.addColorStop(1,'#a7b69b');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#abb5a2';ctx.fillRect(0,h*.59,w,h*.41);
  for(let i=0;i<70;i++){
   ctx.fillStyle=['#718465','#8c9a73','#a9b48c','#bac2a4'][i%4];ctx.beginPath();
   ctx.ellipse(random()*w,h*.52+random()*h*.4,12+random()*30,9+random()*22,0,0,Math.PI*2);ctx.fill();
  }
 }),roughness:1});
 const sheer=mat(0xf0efe8,{transparent:true,opacity:.59,side:THREE.DoubleSide,roughness:.9,depthWrite:false});
 function hallRadiator(x,z,width,yaw=0){
  const ux=Math.cos(yaw),uz=-Math.sin(yaw),nx=Math.sin(yaw),nz=Math.cos(yaw);
  for(let i=0;i<Math.round(width/.072);i++){
   const u=-width/2+.035+i*.072,px=x+ux*u,pz=z+uz*u;
   stamp(boxGeo,trim,px,hallLevel+.41,pz,.051,.55,.10,new THREE.Quaternion().setFromAxisAngle(up,yaw));
  }
  for(const y of [.15,.67])rod([x-ux*width/2,hallLevel+y,z-uz*width/2],[x+ux*width/2,hallLevel+y,z+uz*width/2],.023,trim);
  rod([x+ux*(width/2+.06),hallLevel+.16,z+uz*(width/2+.06)],
   [x+ux*(width/2+.06),hallLevel+.08,z+uz*(width/2+.06)],.021,trim);
 }
 for(const x of [3.65,6.15,8.65,11.15,13.65]){
  const z=-28.992,bottom=hallLevel+.78,top=hallCeiling-.15,w=1.73;
  surface(w,top-bottom,x,(top+bottom)/2,z,windowView);
  for(const px of [x-w/2-.035,x+w/2+.007,x-.018])box(px,bottom-.04,z-.01,px+.04,top+.04,z+.035,trim);
  for(const y of [bottom-.04,top,bottom+1.21])box(x-w/2-.035,y,z-.01,x+w/2+.047,y+.04,z+.035,trim);
  box(x-w/2-.13,bottom-.071,z-.02,x+w/2+.13,bottom-.02,z+.17,trim);
  hallRadiator(x,z+.14,1.20);
  fabric(x,hallLevel+.07,z+.19,2.15,hallCeiling-hallLevel-.22,0,sheer,{fold:.02});
  for(const px of [x-1.02,x+1.02]){
   fabric(px,hallLevel+.08,z+.29,.51,hallCeiling-hallLevel-.22,0,teal,{tied:true,fold:.041});
   rod([px-.10,hallLevel+.83,z+.31],[px+.10,hallLevel+.83,z+.31],.022,cream);
   rod([px,hallLevel+.81,z+.34],[px,hallLevel+.57,z+.34],.009,cream);
   stamp(potGeo,cream,px,hallLevel+.53,z+.34,.025,.10,.025);
  }
 }
 valance(8.45,-28.61,15.30);
 for(const x of [9.00,12.20,14.95])hallRadiator(x,-16.976,1.08,Math.PI);
 hallRadiator(16.075,-23.2,1.42,-Math.PI/2);

 // Rounded upholstery and continuous chrome sled frames distinguish the chairs.
 function roundedUnit(){
  const s=new THREE.Shape(),r=.075;
  s.moveTo(-.5+r,-.5);s.lineTo(.5-r,-.5);s.quadraticCurveTo(.5,-.5,.5,-.5+r);
  s.lineTo(.5,.5-r);s.quadraticCurveTo(.5,.5,.5-r,.5);s.lineTo(-.5+r,.5);
  s.quadraticCurveTo(-.5,.5,-.5,.5-r);s.lineTo(-.5,-.5+r);s.quadraticCurveTo(-.5,-.5,-.5+r,-.5);
  const geo=new THREE.ExtrudeGeometry(s,{depth:.88,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:.055,bevelThickness:.06,curveSegments:3});
  geo.translate(0,0,-.44);return geo;
 }
 const cushionGeo=roundedUnit();
 const backRotation=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.PI/2,-.13));
 function chair(x,z){
  const y=hallLevel;
  stamp(cushionGeo,seatCloth,x-.015,y+.49,z,.55,.12,.57);
  stamp(cushionGeo,seatCloth,x+.285,y+.85,z,.57,.62,.105,backRotation);
  stamp(cushionGeo,seatEdge,x+.337,y+.85,z,.56,.61,.035,backRotation);
  for(const side of [-1,1]){
   const pz=z+side*.285;
   rod([x-.20,y+.47,pz],[x-.26,y+.065,pz],.014,chrome);
   rod([x-.26,y+.065,pz],[x+.32,y+.065,pz],.014,chrome);
   rod([x+.32,y+.065,pz],[x+.32,y+.44,pz],.014,chrome);
   rod([x+.32,y+.44,pz],[x+.30,y+.98,pz],.012,chrome);
   rod([x-.17,y+.47,pz],[x-.17,y+.69,pz],.013,chrome);
   rod([x-.17,y+.69,pz],[x+.24,y+.69,pz],.013,chrome);
   stamp(cushionGeo,seatEdge,x+.04,y+.713,pz,.44,.044,.075);
  }
  rod([x+.37,y+.85,z-.058],[x+.37,y+.91,z-.058],.008,chrome);
  rod([x+.37,y+.91,z-.058],[x+.37,y+.91,z+.058],.008,chrome);
  rod([x+.37,y+.91,z+.058],[x+.37,y+.85,z+.058],.008,chrome);
  rod([x+.37,y+.85,z+.058],[x+.37,y+.85,z-.058],.008,chrome);
  colliders.push([x-.27,z-.31,x+.37,z+.31,y,y+1.17]);
 }
 const seatRows=9,seatsPerBlock=4;
 for(let row=0;row<seatRows;row++)for(const z of [-28.02,-27.28,-26.54,-25.80,-24.02,-23.28,-22.54,-21.80])
  chair(3.55+row*1.18,z);

 // PA stacks on gray plinths, and seven overhead stage luminaires.
 const grille=mat(0xffffff,{map:texture(64,64,(ctx,w,h)=>{
  ctx.fillStyle='#23282a';ctx.fillRect(0,0,w,h);ctx.fillStyle='#101416';
  for(let y=1;y<h;y+=5)for(let x=1;x<w;x+=5){ctx.beginPath();ctx.arc(x,y,.9,0,Math.PI*2);ctx.fill()}
 }),roughness:.8});
 function speaker(x,z){
  const base=hallLevel+.14;
  box(x-.30,base,z-.36,x+.30,base+.29,z+.36,joint,true);
  box(x-.27,base+.29,z-.32,x+.27,base+.93,z+.32,black,true);
  box(x-.23,base+.93,z-.28,x+.23,base+1.55,z+.28,black,true);
  surface(.55,.60,x+.273,base+.62,z,grille,{yaw:Math.PI/2,u:3,v:3});
  surface(.48,.55,x+.233,base+1.25,z,grille,{yaw:Math.PI/2,u:3,v:3});
  for(const [cy,r] of [[base+.59,.215],[base+1.18,.165]]){
   stamp(leafGeo,screenBlack,x+.282,cy,z,.009,r,r);
   stamp(leafGeo,black,x+.29,cy,z,.008,r*.35,r*.35);
  }
  box(x+.287,base+1.00,z-.025,x+.294,base+1.035,z+.025,red);
 }
 speaker(1.12,-28.34);speaker(1.12,-19.06);
 rod([-1.92,hallCeiling-.36,-26.04],[-1.92,hallCeiling-.36,-19.92],.032,black);
 for(let i=0;i<7;i++){
  const z=-25.70+i*.90;
  rod([-1.92,hallCeiling-.35,z],[-1.92,hallCeiling-.49,z],.017,steel);
  rod([-1.98,hallCeiling-.48,z],[-1.75,hallCeiling-.63,z],.095,black);
  stamp(leafGeo,mat(0x89958b,{metalness:.25,roughness:.25}),-1.742,hallCeiling-.635,z,.012,.070,.070);
 }
 // White lectern on the window side, plus the small table visible in the wing.
 const lecternX=-.50,lecternZ=-26.95,stageY=hallLevel+stageHeight;
 box(lecternX-.29,stageY,lecternZ-.34,lecternX+.29,stageY+.055,lecternZ+.34,trim,true);
 box(lecternX-.10,stageY+.055,lecternZ-.20,lecternX+.13,stageY+1.01,lecternZ+.20,trim,true);
 const lecternTop=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),-.11);
 stamp(boxGeo,trim,lecternX,stageY+1.025,lecternZ,.54,.07,.67,lecternTop);
 box(lecternX-.26,stageY+1.04,lecternZ-.34,lecternX-.21,stageY+1.16,lecternZ+.34,trim);
 sign(['BQFQ'],.28,.18,lecternX+.137,stageY+.74,lecternZ,Math.PI/2,{bg:'#eceee9',fg:'#286580',size:52});
 box(-1.80,stageY+.70,-28.19,-.99,stageY+.75,-27.62,trim);
 for(const x of [-1.73,-1.08])for(const z of [-28.12,-27.69])box(x,stageY,z,x+.045,stageY+.70,z+.045,trim);

 function standingAC(x,z){
  box(x-.23,hallLevel,z-.21,x+.23,hallLevel+1.68,z+.21,trim,true);
  box(x-.195,hallLevel+1.29,z-.22,x+.195,hallLevel+1.54,z-.214,black);
  for(let i=0;i<6;i++)box(x-.19,hallLevel+1.30+i*.037,z-.225,x+.19,hallLevel+1.313+i*.037,z-.221,joint);
  box(x-.20,hallLevel+.43,z-.22,x+.20,hallLevel+.44,z-.211,joint);
 }
 standingAC(15.72,-28.44);standingAC(15.72,-17.54);
 // Regular ceiling lights keep the carpet and curtains visible without clipping white walls.
 for(const x of [2.8,5.2,7.6,10.0,12.4,14.8])for(const z of [-27.8,-24.8,-21.8,-18.8])pointLamp(x,z,hallCeiling);
 for(const [x,z] of [[3.8,-25.7],[8.8,-25.7],[13.8,-25.7],[8.8,-19.2],[-.8,-23]])roomLight(x,z,.11,hallCeiling-.22);

