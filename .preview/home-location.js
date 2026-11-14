function buildHomeLocation(){
 const scene=new THREE.Scene(),colliders=[],trees=[],benches=[],walkSurfaces=[],streetLamps=[];
 let clothingSeller=null,clothingShop=null;
 scene.background=new THREE.Color(0xbad3e8);scene.fog=new THREE.Fog(0xbad3e8,72,185);
 scene.add(new THREE.HemisphereLight(0xfff6e8,0x89917b,.9));
 const light=new THREE.DirectionalLight(0xffe8c6,.7);light.position.set(-35,45,30);scene.add(light);
 let seed=51025;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const canvas=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c};
 const grain=new THREE.CanvasTexture(canvas(128,128,g=>{
  g.fillStyle='#e8e8e8';g.fillRect(0,0,128,128);
  for(let i=0;i<9000;i++){const v=170+Math.floor(rand()*80);g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(rand()*128,rand()*128,1+rand()*2,1+rand()*2)}
 }));grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(3,3);
 const mats={},mat=(c,rough=false)=>{
  const key=c+':'+rough;return mats[key]||(mats[key]=new THREE.MeshLambertMaterial({color:c,map:rough?grain:null}));
 };
 const p={peach:mat(0xf2a18b,true),coral:mat(0xe7a098,true),cream:mat(0xe0d5a0,true),
  base:mat(0x686970,true),joint:mat(0xf1c8ae),white:mat(0xe9e7da),metal:mat(0x48423a),
  gray:mat(0xb2b9b7),teal:mat(0x8ba5a2),rust:mat(0x897466),wood:mat(0x8e623e),
  glass:mat(0x7796a6),darkglass:mat(0x445b68),shadow:mat(0x2d3235),door:mat(0x38332e),
  roof:mat(0x666b66),soil:mat(0x80725b,true),grass:mat(0x92936a,true),asphalt:mat(0x727473,true),
  path:mat(0xb7b4a7,true),curb:mat(0xbabbb1),leaf:mat(0x61724d),leaf2:mat(0x87935e),
  leaf3:mat(0xaaa066),trunk:mat(0x75674e,true)};
 const unitBox=new THREE.BoxGeometry(1,1,1),roughBoxes=new Map(),unitBall=new THREE.IcosahedronGeometry(1,1),
  unitCylinder=new THREE.CylinderGeometry(1,1,1,8),batches=new Map(),lines=new Map();
 const matrix=new THREE.Matrix4(),quat=new THREE.Quaternion(),euler=new THREE.Euler(),vec=new THREE.Vector3(),scale=new THREE.Vector3();
 function instance(geo,material,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0,order='XYZ'){
  const key=geo.uuid+':'+material.id;
  if(!batches.has(key))batches.set(key,{geo,material,transforms:[]});
  quat.setFromEuler(euler.set(rx,ry,rz,order));matrix.compose(vec.set(x,y,z),quat,scale.set(sx,sy,sz));
  batches.get(key).transforms.push(matrix.clone());
 }
 function box(x1,y1,z1,x2,y2,z2,material,solid=false){
  const sx=Math.abs(x2-x1),sy=Math.abs(y2-y1),sz=Math.abs(z2-z1);let geometry=unitBox;
  // Масштаб текстуры в метрах: асфальт и штукатурка не растягиваются полосами на длинных поверхностях.
  if(material.map===grain){
   const key=[sx,sy,sz].map(v=>v.toFixed(4)).join(':');
   if(!roughBoxes.has(key)){
    const g=unitBox.clone(),uv=g.attributes.uv,faces=[[sz,sy],[sz,sy],[sx,sz],[sx,sz],[sx,sy],[sx,sy]];
    faces.forEach(([w,h],f)=>{for(let i=f*4;i<f*4+4;i++)uv.setXY(i,uv.getX(i)*w,uv.getY(i)*h)});
    roughBoxes.set(key,g);
   }
   geometry=roughBoxes.get(key);
  }
  instance(geometry,material,(x1+x2)/2,(y1+y2)/2,(z1+z2)/2,sx,sy,sz);
  if(solid)colliders.push([Math.min(x1,x2),Math.min(z1,z2),Math.max(x1,x2),Math.max(z1,z2)]);
 }
 function line(a,b,c=0x48423a){if(!lines.has(c))lines.set(c,[]);lines.get(c).push(...a,...b)}
 function rod(a,b,r,material){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
  quat.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());
  matrix.compose(start.add(end).multiplyScalar(.5),quat,scale.set(r,delta.length(),r));
  const key=unitCylinder.uuid+':'+material.id;
  if(!batches.has(key))batches.set(key,{geo:unitCylinder,material,transforms:[]});
  batches.get(key).transforms.push(matrix.clone());
 }
 function label(text,x,y,z,w,h,bg='#273a40',fg='#f4efdb',ry=0){
  const t=new THREE.CanvasTexture(canvas(256,96,g=>{g.fillStyle=bg;g.fillRect(0,0,256,96);g.strokeStyle=fg;g.lineWidth=3;g.strokeRect(5,5,246,86);g.fillStyle=fg;g.font='bold 40px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,128,49,234)}));
  const q=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:t}));q.position.set(x,y,z);q.rotation.y=ry;scene.add(q);
 }
 const playground=createHomePlayground({scene,colliders,batches,lines,unitCylinder});
 // Дом: 74 м, пять этажей. Лицевой фасад смотрит в сторону +Z.
 box(-78,-.22,-48,78,0,90,p.grass);
 box(-46,0,7.1,57,.025,14.2,p.asphalt);box(-45,0,-17,40,.06,-13,p.path);
 box(-38,0,-12.2,38,.08,1,p.path);
 box(-37,0,-12,37,.72,0,p.base,true);
 // Слои отделки не накладываются на боковые грани корпуса.
 box(-37,.72,-12.03,37,3.72,.035,p.peach);
 box(-37,3.72,-12,37,15.72,0,p.cream);
 box(-37,12.72,-12.04,37,15.72,-12,p.coral);
 box(-37,12.72,0,37,15.72,.04,p.coral);
 for(let floor=1;floor<=5;floor++){
  const y=.72+floor*3;box(-37,y-.045,.04,37,y+.045,.075,p.joint);
  box(37.01,y-.045,-12,37.06,y+.045,0,p.joint);
 }
 const centers=[-29.6,-14.8,0,14.8,29.6];
 // Оконные рамы на переднем, заднем фасадах и на торцах.
 function windowAt(x,y,z,w=1.65,h=1.55,ry=0,grille=false){
  const local=(px,py,pz)=>[x+Math.cos(ry)*px+Math.sin(ry)*pz,y+py,z-Math.sin(ry)*px+Math.cos(ry)*pz];
  const panel=(cx,cy,cz,sx,sy,sz,material)=>{const v=local(cx,cy,cz);instance(unitBox,material,...v,sx,sy,sz,0,ry)};
  panel(0,0,0,w+.14,h+.14,.08,p.shadow);panel(0,0,.05,w,h,.09,p.white);
  panel(0,0,.105,w-.15,h-.15,.025,rand()>.45?p.glass:p.darkglass);
  panel(-w*.12,0,.13,.05,h-.1,.035,p.white);
  panel(-w*.31,h*.22,.13,w*.34,.045,.035,p.white);
  panel(0,-h/2-.08,.12,w+.25,.09,.28,p.gray);
  if(grille){
   for(let dx=-w/2+.12;dx<w/2;dx+=.21)line(local(dx,-h/2,.29),local(dx,h/2,.29));
   for(const yy of [-h*.35,h*.35])line(local(-w/2,yy,.29),local(w/2,yy,.29));
   line(local(-w/2,-h/2,.29),local(w/2,h/2,.29));
  }
 }
 // Разные балконы: открытые, с металлической обшивкой, деревянные и застеклённые.
 function balcony(x,f,index){
  const y=.72+f*3,style=(index*3+f*5)%7,w=3.35,z=1.42;
  box(x-w/2-.1,y-.14,-.06,x+w/2+.1,y,z+.12,p.base);
  box(x-w/2,y,.04,x+w/2,y+2.7,.08,p.shadow);
  windowAt(x,y+1.4,.1,2.65,2.15);
  const skin=[p.gray,p.teal,p.rust,p.white,p.wood,p.gray,p.teal][style];
  box(x-w/2,y,.1,x-w/2+.07,y+1.03,z,skin);
  box(x+w/2-.07,y,.1,x+w/2,y+1.03,z,skin);
  box(x-w/2,y,z-.06,x+w/2,y+1.03,z+.02,skin);
  for(let dx=-w/2+.09;dx<w/2;dx+=.16)line([x+dx,y+.08,z+.035],[x+dx,y+.96,z+.035],0x696960);
  box(x-w/2-.03,y+1.03,z-.08,x+w/2+.03,y+1.1,z+.06,p.metal);
  if(style!==2&&style!==4){
   // Непрозрачное голубоватое стекло сохраняет читаемость фасада без дорогой прозрачности.
   box(x-w/2,y+1.1,z-.03,x+w/2,y+2.7,z+.015,style===6?p.darkglass:p.glass);
   box(x-w/2,y+1.1,.12,x-w/2+.035,y+2.7,z,p.glass);
   box(x+w/2-.035,y+1.1,.12,x+w/2,y+2.7,z,p.glass);
   for(let j=0;j<=4;j++)box(x-w/2+j*w/4-.026,y+1.08,z+.025,x-w/2+j*w/4+.026,y+2.73,z+.07,p.white);
   box(x-w/2,y+2.68,z+.025,x+w/2,y+2.75,z+.07,p.white);
   box(x-w/2,y+1.09,z+.025,x+w/2,y+1.15,z+.07,p.white);
   // Светлые полосы отражения на отдельных стёклах.
   if(style%2===0)box(x-.52,y+1.2,z+.023,x-.42,y+2.6,z+.026,p.gray);
  }else{
   for(const dx of [-w/2,w/2])box(x+dx-.035,y,.1,x+dx+.035,y+2.8,.17,p.metal);
   line([x-w/2,y+2.18,z-.12],[x+w/2,y+2.18,z-.12]);
   if((f+index)%3===0){
    box(x-.75,y+1.35,z-.16,x-.22,y+2.12,z-.12,p.white);
    box(x+.05,y+1.33,z-.16,x+.55,y+2.12,z-.12,p.darkglass);
   }
  }
  box(x-w/2-.09,y+2.85,-.04,x+w/2+.09,y+2.94,z+.15,p.roof);
 }
 centers.forEach((cx,entry)=>{
  box(cx-1.32,.72,.055,cx+1.32,15.72,.1,p.coral);
  for(const x of [cx-7.35,cx-1.4,cx+1.4,cx+7.35])box(x-.035,.72,.085,x+.035,15.72,.12,p.joint);
  for(let f=0;f<5;f++){
   const y=2.18+f*3;
   for(const dx of [-2.65,2.65])windowAt(cx+dx,y,.14,1.45,1.55,0,f===0);
   if(f===0){for(const dx of [-5.25,5.25])windowAt(cx+dx,y,.14,1.85,1.65,0,true)}
   else{balcony(cx-5.25,f,entry*2);balcony(cx+5.25,f,entry*2+1)}
   if(f>0){windowAt(cx,y-.8,.16,1.4,.66);if(f<4)windowAt(cx,y+.65,.16,1.4,.66)}
   for(const dx of [-5.2,-2.6,2.6,5.2])windowAt(cx+dx,y,-12.08,1.65,1.55,Math.PI,f===0);
  }
  // Подвальные продухи, кондиционеры и газовая труба.
  for(const dx of [-5.1,4.1]){box(cx+dx-.4,.15,.05,cx+dx+.4,.53,.12,p.shadow);for(let i=0;i<6;i++)line([cx+dx-.32+i*.13,.17,.14],[cx+dx-.32+i*.13,.5,.14])}
  for(const f of [1,2,3]){
   const x=cx+(f%2?-2.95:3.15),y=1.12+f*3;
   if((entry+f)%3===0)continue;
   box(x-.4,y-.26,.18,x+.4,y+.28,.58,p.gray);
   instance(unitCylinder,p.base,x-.05,y,.59,.22,.025,.22,Math.PI/2);
   for(let a=0;a<6;a++){const t=a*Math.PI/3;line([x-.05,y,.61],[x-.05+Math.cos(t)*.19,y+Math.sin(t)*.19,.61],0x525953)}
   line([x-.45,y-.35,.16],[x+.45,y-.35,.16]);
  }
 });
 // Пологое серое покрытие крыши с широким светлым карнизом.
 box(-37.55,15.68,-12.5,37.55,15.92,.55,p.white);
 const roofAngle=Math.atan2(.65,6.55);
 for(const front of [true,false])instance(unitBox,p.roof,0,16.2,front?-2.75:-9.25,75.8,.12,6.65,front?roofAngle:-roofAngle);
 for(let x=-37.7;x<38;x+=.42){line([x,15.96,.55],[x,16.6,-6],0x505b54);line([x,16.6,-6],[x,15.96,-12.55],0x505b54)}
 // Подъезды с двускатными козырьками, фонарями, домофонами и объявлениями.
 function seat(x,z,ry=0,groundY=.12){
  const local=(dx,y,dz)=>[x+Math.cos(ry)*dx+Math.sin(ry)*dz,y+groundY,z-Math.sin(ry)*dx+Math.cos(ry)*dz];
  // Наклон спинки задаётся в локальной системе скамейки, затем поворачивается вся скамейка.
  const part=(dx,y,dz,sx,sy,sz,material,rx=0)=>instance(unitBox,material,...local(dx,y,dz),sx,sy,sz,rx,ry,0,'YXZ');
  const rail=(a,b,r=.032)=>rod(local(...a),local(...b),r,p.metal);
  // Деревянная скамейка со спинкой на четырёх металлических ножках, как у подъезда.
  for(const dx of [-1.08,1.08]){
   for(const dz of [-.22,.22])rail([dx,0,dz],[dx,.45,dz],.04);
   rail([dx,.4,-.29],[dx,.4,.3]);rail([dx,.25,-.22],[dx,.25,.22]);
   rail([dx,.39,-.23],[dx,1.14,-.36]);
   rail([dx,.48,.22],[dx,.73,.22]);rail([dx,.73,.22],[dx,.76,-.28]);
  }
  rail([-1.08,.32,-.22],[1.08,.32,-.22]);
  for(let i=0;i<3;i++)part(0,.47,-.2+i*.2,2.65,.085,.17,p.wood);
  for(let i=0;i<3;i++){
   const y=.75+i*.17;part(0,y,-.29-(y-.68)*.18,2.65,.135,.075,p.wood,-.18);
  }
  const ex=Math.abs(Math.cos(ry))*1.37+Math.abs(Math.sin(ry))*.4,
   ez=Math.abs(Math.sin(ry))*1.37+Math.abs(Math.cos(ry))*.4;
  colliders.push([x-ex,z-ez,x+ex,z+ez]);
  benches.push({x,z,rotation:ry,groundY});
  playground.bench({id:'play-bench-'+benches.length,position:[x,0,z],yaw:ry,seatY:groundY+.5125});
 }
 function binAt(x,z){
  box(x-.22,.08,z-.22,x+.22,.7,z+.22,p.metal,true);box(x-.25,.7,z-.25,x+.25,.77,z+.25,p.gray);
 }
 centers.forEach((cx,i)=>{
  box(cx-2.9,0,.16,cx+2.9,.09,7.2,p.path);
  box(cx-1.13,.12,.12,cx+1.13,2.62,.36,p.shadow);
  box(cx-.98,.14,.37,cx+.98,2.48,.41,p.door);
  colliders.push([cx-1.15,.12,cx+1.15,.52]);
  box(cx-.96,.16,.42,cx-.41,2.43,.45,p.metal);
  box(cx-.02,.15,.42,cx+.02,2.45,.47,p.shadow);
  box(cx+.65,1.01,.46,cx+.7,1.4,.53,p.gray);
  box(cx-1.17,1.15,.32,cx-1.04,1.55,.39,p.base);
  for(let j=0;j<4;j++)box(cx-1.16,1.2+j*.07,.4,cx-1.13,1.23+j*.07,.42,p.white);
  for(const dx of [-1.52,1.52])box(cx+dx-.045,0,2.17,cx+dx+.045,2.8,2.26,p.metal,true);
  box(cx-1.52,2.59,.15,cx+1.52,2.72,2.4,p.white);
  const sh=new THREE.Shape();sh.moveTo(-1.77,0);sh.lineTo(1.77,0);sh.lineTo(0,.88);sh.closePath();
  const gable=new THREE.Mesh(new THREE.ShapeGeometry(sh),p.white);gable.position.set(cx,2.7,2.43);scene.add(gable);
  const a=Math.atan2(.88,1.77),len=Math.hypot(1.77,.88);
  for(const side of [-1,1])instance(unitBox,p.roof,cx+side*.89,3.14,1.2,len+.16,.11,2.75,0,0,-side*a);
  for(let dx=-1.5;dx<1.6;dx+=.16)line([cx+dx,2.72,2.445],[cx+dx,3.57-Math.abs(dx)*.5,2.445],0xb9b6a2);
  box(cx-.09,2.84,2.46,cx+.09,3.1,2.63,p.metal);
  box(cx-.06,2.88,2.64,cx+.06,3.04,2.68,p.white);
  streetLamps.push([cx,.106,2.91,3.5]);
  label('ПОДЪЕЗД '+(i+1),cx,2.31,.49,1.5,.36);
  box(cx+1.75,.8,.24,cx+2.6,2.08,.36,p.rust);
  for(let j=0;j<5;j++){
   const xx=cx+1.82+(j%2)*.36,yy=1.02+Math.floor(j/2)*.33;
   box(xx,yy,.365,xx+.29,yy+.25,.38,j%3?p.white:p.cream);
  }
  // Продольные оси обеих скамеек направлены от двери к проезду; сиденья обращены к проходу.
  seat(cx-2.18,3.48,Math.PI/2,.09);seat(cx+2.18,3.48,-Math.PI/2,.09);
 });
 // Газовая труба проходит над окнами первого этажа и огибает правый торец.
 rod([-37,3.25,.38],[37.3,3.25,.38],.045,p.cream);
 rod([37.3,3.25,.38],[37.3,3.25,-12],.045,p.cream);
 for(let x=-36;x<37;x+=3.2)line([x,3.1,.14],[x,3.25,.4],0x877d59);
 // Правый торец: розовая середина, жёлтые края, две колонки окон и лестница на крышу.
 box(37.025,3.73,-10,37.07,15.7,-2.8,p.coral);
 for(let f=0;f<5;f++)for(const z of [-4.1,-8.2])windowAt(37.12,2.18+f*3,z,1.42,1.55,Math.PI/2,f===0);
 for(let f=0;f<5;f++)for(const z of [-3.6,-8.5])windowAt(-37.1,2.18+f*3,z,1.42,1.55,-Math.PI/2,f===0);
 for(const z of [-1.1,-1.85])rod([37.47,3.8,z],[37.47,16.35,z],.032,p.metal);
 for(let y=3.8;y<16.45;y+=.33)rod([37.47,y,-1.1],[37.47,y,-1.85],.025,p.metal);
 for(let y=4;y<16;y+=2.2)for(const z of [-1.1,-1.85])rod([37.05,y,z],[37.47,y,z],.027,p.metal);
 // Спиральные узоры низкой кованой ограды. Проходы к пяти подъездам остаются открытыми.
 function gardenFence(x1,z1,x2,z2){
  const dx=x2-x1,dz=z2-z1,length=Math.hypot(dx,dz),ux=dx/length,uz=dz/length,n=Math.max(1,Math.round(length/1.65));
  for(let i=0;i<=n;i++){
   const x=x1+dx*i/n,z=z1+dz*i/n;
   box(x-.035,0,z-.035,x+.035,1.08,z+.035,p.metal);
  }
  for(const y of [.2,.97])rod([x1,y,z1],[x2,y,z2],.025,p.metal);
  for(let i=0;i<n;i++){
   const cx=x1+dx*(i+.5)/n,cz=z1+dz*(i+.5)/n;
   for(const side of [-1,1]){
    let prev=null;
    for(let k=0;k<=25;k++){
     const t=k/25,angle=t*Math.PI*3.2,r=.31*(1-t*.8),u=side*(.29+Math.cos(angle)*r),v=.57+Math.sin(angle)*r;
     const q=[cx+ux*u,v,cz+uz*u];if(prev)line(prev,q);prev=q;
    }
   }
  }
  if(Math.abs(dx)>Math.abs(dz))colliders.push([Math.min(x1,x2),z1-.045,Math.max(x1,x2),z1+.045]);
  else colliders.push([x1-.045,Math.min(z1,z2),x1+.045,Math.max(z1,z2)]);
 }
 function bushAt(x,z,size=1){
  for(let j=0;j<3;j++)instance(unitBall,j%2?p.leaf:p.leaf2,x+(rand()-.5)*.6*size,.32*size+rand()*.25,z+(rand()-.5)*size,.55*size,.44*size,.5*size);
 }
 function deciduous(x,z,h=8){
  const r=.16+h*.017;
  trees.push({x,z,radius:r,height:h});
  const trunkHeight=h*.73,washHeight=1.12;
  const washTop=[x+.15*washHeight/trunkHeight,washHeight,z];
  rod([x,0,z],washTop,r,p.white);
  rod(washTop,[x+.15,trunkHeight,z],r,p.trunk);
  for(let j=0;j<7;j++){
   const a=j*2.4,yy=h*(.57+(j%3)*.12),ex=x+Math.cos(a)*h*.23,ez=z+Math.sin(a)*h*.22;
   rod([x,h*.43,z],[ex,yy,ez],r*.37,p.trunk);
   instance(unitBall,[p.leaf,p.leaf2,p.leaf3][j%3],ex,yy+.65,ez,h*.18,h*.19,h*.16,0,a);
  }
  colliders.push([x-r,z-r,x+r,z+r]);
 }
 centers.forEach((cx,i)=>{
  for(const side of [-1,1]){
   const lo=side<0?cx-7.32:cx+3.1,hi=side<0?cx-3.1:cx+7.32;
   box(lo,.01,.9,hi,.075,6.1,p.soil);
   gardenFence(lo,6.15,hi,6.15);gardenFence(side<0?hi:lo,.8,side<0?hi:lo,6.15);
   if(i===centers.length-1&&side>0)gardenFence(hi,.05,hi,6.15);
   for(let j=0;j<10;j++)bushAt(lo+.4+rand()*(hi-lo-.8),3.9+rand()*1.4,.45+rand()*.65);
   // Мелкие цветы и сухая осенняя листва.
   for(let j=0;j<40;j++){
    const x=lo+.2+rand()*(hi-lo-.4),z=1+rand()*4.8;
    instance(unitBall,mat([0xc6a556,0xb3a474,0x8b9260,0x9b7b4f][j%4]),x,.09,z,.06,.015,.1,0,rand()*6.28);
    if(j<9)instance(unitBall,mat([0xb27369,0xe6d8ae,0xba9d4c][j%3]),x,.26,z,.055,.06,.055);
   }
  }
  deciduous(cx-5.3,4.6,7+(i%3)*.9);
  if(i%2===0)deciduous(cx+5.7,5,6.4);
 });
 // Двор по семи фотографиям. От выхода подъезда 5 (+Z): детская часть слева (+X),
 // тренажёры прямо, воркаут и соседнее футбольное поле справа (-X).
 const play={red:mat(0xb7353d),blue:mat(0x176899),yellow:mat(0xd6b940),
  turquoise:mat(0x319896),green:mat(0x2cba42),iron:mat(0x343b3e),
  steel:mat(0xa6b0b0),brown:mat(0x785340),sand:mat(0xa79b83,true),
  rubber:mat(0x566c70,true),orange:mat(0xc48042)};
 const roundCylinder=new THREE.CylinderGeometry(1,1,1,32);
 const post=(x,z,h,material=play.iron,r=.047)=>{
  rod([x,.14,z],[x,h,z],r,material);colliders.push([x-r,z-r,x+r,z+r]);
 };
 const plane=(x1,z1,x2,z2,y,texture)=>{
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(x2-x1,z2-z1),new THREE.MeshLambertMaterial({map:texture}));
  mesh.rotation.x=-Math.PI/2;mesh.position.set((x1+x2)/2,y,(z1+z2)/2);scene.add(mesh);return mesh;
 };
 // Серо-белая прямоугольная плитка: широкая полоса вдоль проезда и дорожка к полю.
 const pavingTexture=new THREE.CanvasTexture(canvas(256,256,g=>{
  g.fillStyle='#6c6f6d';g.fillRect(0,0,256,256);
  for(let row=0;row<8;row++)for(let col=0;col<4;col++){
   const x=col*64+(row%2)*32,y=row*32;
   for(const xx of [x,x-256]){
    g.fillStyle=['#999e9c','#707875','#b8bfbd','#535e5b'][(col+row*3)%4];g.fillRect(xx+1,y+1,62,30);
    g.fillStyle='rgba(255,255,255,.12)';g.fillRect(xx+2,y+2,60,1);
   }
  }
  for(let i=0;i<2600;i++){g.fillStyle=i%2?'#ffffff0a':'#0000000a';g.fillRect(rand()*256,rand()*256,1,1)}
 }));pavingTexture.wrapS=pavingTexture.wrapT=THREE.RepeatWrapping;pavingTexture.anisotropy=8;
 function paving(x1,z1,x2,z2){const t=pavingTexture.clone();t.needsUpdate=true;t.repeat.set((x2-x1)/1.28,(z2-z1)/1.28);plane(x1,z1,x2,z2,.12,t)}
 box(-46,0,14.2,57,.17,14.4,p.curb);
 paving(-49,14.4,55,21);paving(-3.5,21,5,56);paving(5,51,53,54);
 paving(51,21,54,51);paving(-49,49.2,5,52);
 // Лунки вокруг взрослых деревьев, низкая красная лавочка между двумя стволами.
 for(const [x,z,h,sx,sz] of [[39.4,17.2,10.4,1.35,1.3],[24.8,17.4,11.5,1.45,1.4],
  [20.3,17.6,10.8,1.3,1.45],[7.2,18.2,9.7,1.15,1.3],[-6,18,10.8,1.3,1.5]]){
  box(x-sx,.121,z-sz,x+sx,.14,z+sz,p.soil);deciduous(x,z,h);
 }
 for(let i=0;i<3;i++)box(20.8,.45,16.6+i*.13,24.25,.51,16.7+i*.13,play.red);
 for(const x of [21.1,23.95])box(x-.045,.14,16.6,x+.045,.45,16.96,p.gray);
 colliders.push([20.8,16.6,24.25,16.96]);
 // Спортивная площадка имеет цельное резиновое покрытие с плавными цветовыми границами.
 const rubberTexture=new THREE.CanvasTexture(canvas(1152,768,g=>{
  g.fillStyle='#77796e';g.fillRect(0,0,1152,768);
  g.save();g.scale(1152/46,768/30);g.translate(-5,-21);
  g.fillStyle='#566f78';g.beginPath();g.moveTo(16,21);g.lineTo(40,21);
  g.bezierCurveTo(36,25,40,29,34,33);g.bezierCurveTo(28,37,32,43,26,46);
  g.lineTo(26,51);g.lineTo(17,51);g.lineTo(17,30);g.closePath();g.fill();
  g.fillStyle='#7b4c58';g.beginPath();g.moveTo(34,21);g.lineTo(51,21);g.lineTo(51,36);
  g.bezierCurveTo(47,38,46,32,43,32);g.bezierCurveTo(40,31,37,34,34,31);
  g.bezierCurveTo(31,28,35,25,34,21);g.fill();
  g.fillStyle='#4c665f';g.beginPath();g.moveTo(17,21);g.lineTo(31,21);g.lineTo(31,27);
  g.bezierCurveTo(26,26,25,32,20,30);g.lineTo(17,30);g.fill();
  g.fillStyle='#79525b';g.fillRect(5,21,12,13);
  g.beginPath();g.ellipse(44,40.5,4.7,2.9,-.12,0,Math.PI*2);g.fill();
  g.restore();
  for(let i=0;i<65000;i++){
   g.fillStyle=i%3?'rgba(17,23,25,.10)':'rgba(232,222,202,.13)';g.fillRect(rand()*1152,rand()*768,1,1);
  }
 }));rubberTexture.anisotropy=8;plane(5,21,51,51,.145,rubberTexture);
 // Тонкий бордюр только по внешнему краю, без перегородок между игровыми зонами.
 box(5,0,50.95,51,.15,51.08,p.curb);box(50.95,0,21,51.08,.15,51,p.curb);
 // Парковые лавочки без спинок: деревянные рейки и тёмные тумбы с орнаментом.
 let parkBenchIndex=0;
 function parkBench(x,z,ry=0,length=2.8,interactive=true){
  const point=(dx,y,dz)=>[x+Math.cos(ry)*dx+Math.sin(ry)*dz,y,z-Math.sin(ry)*dx+Math.cos(ry)*dz];
  const part=(dx,y,dz,sx,sy,sz,mt)=>instance(unitBox,mt,...point(dx,y,dz),sx,sy,sz,0,ry);
  for(let i=0;i<5;i++)part(0,.63,-.28+i*.14,length,.085,.12,p.wood);
  for(const dx of [-length*.39,length*.39]){
   part(dx,.36,0,.17,.53,.7,play.brown);
   for(const side of [-1,1])for(let k=0;k<4;k++){
    const a=k*Math.PI/2;let prev=null;
    for(let j=0;j<=14;j++){
     const t=j/14*Math.PI*1.65,r=.12*(1-j/19),u=Math.cos(a)*.13+Math.cos(t+a)*r,v=.37+Math.sin(a)*.13+Math.sin(t+a)*r;
     const q=point(dx+side*.091,v,u);if(prev)line(prev,q,0xb6b4a2);prev=q;
    }
   }
  }
  const ex=Math.abs(Math.cos(ry))*length/2+Math.abs(Math.sin(ry))*.35,
   ez=Math.abs(Math.sin(ry))*length/2+Math.abs(Math.cos(ry))*.35;
  colliders.push([x-ex,z-ez,x+ex,z+ez]);
  if(interactive)playground.bench({id:'play-parkbench-'+(++parkBenchIndex),position:[x,0,z],yaw:ry,seatY:.6725});
 }
 function blackBin(x,z){
  box(x-.2,.15,z-.2,x+.2,.83,z+.2,play.iron,true);
  box(x-.15,.84,z-.15,x+.15,.845,z+.15,p.shadow);
  for(const dx of [-.23,.23])rod([x+dx,.14,z],[x+dx,.91,z],.022,play.iron);
 }
 // Три уличных тренажёра: серые стойки, ярко-зелёные рычаги, чёрные сиденья.
 function fitnessMachine(x,z,kind,ry=0){
  const point=(a,b,c)=>[x+Math.cos(ry)*a+Math.sin(ry)*c,b,z-Math.sin(ry)*a+Math.cos(ry)*c];
  const part=(a,b,c,sx,sy,sz,mt)=>instance(unitBox,mt,...point(a,b,c),sx,sy,sz,0,ry);
  const pipe=(a,b,r=.035,mt=play.green)=>rod(point(...a),point(...b),r,mt);
  const support=a=>{
   part(a,1.22,0,.21,2.16,.27,play.iron);part(a,.18,0,.49,.065,.5,play.steel);
   for(const dx of [-.17,.17])for(const dz of [-.17,.17])part(a+dx,.23,dz,.045,.045,.045,play.iron);
  };
  if(kind==='walker'){
   const legs=[];
   for(const a of [-.72,.72]){
    support(a);pipe([a,1.9,0],[a,1.9,.55]);
    legs.push(playground.moving('walker-leg-'+a,point(a,1.9,.55),()=>{pipe([a,1.9,.55],[a,.43,.68]);part(a*.53,.39,.68,.39,.075,.55,play.iron);pipe([a,.46,.68],[a*.53,.46,.68]);}));
   }
   pipe([-.72,2.28,0],[-.72,2.55,-.24],.035,play.steel);
   pipe([-.72,2.55,-.24],[.72,2.55,-.24],.035,play.steel);
   pipe([.72,2.55,-.24],[.72,2.28,0],.035,play.steel);
   pipe([-.72,1.75,.55],[-.4,1.6,.36]);pipe([.72,1.75,.55],[.4,1.6,.36]);pipe([-.4,1.6,.36],[.4,1.6,.36],.04,play.iron);
   playground.exercise({id:'play-air-walker',name:'Воздушный шагатель',kind:'walker',pumpLabel:'Шагать',entry:()=>new THREE.Vector3(x,.145,z+1.95),
    render(){legs.forEach((leg,i)=>{leg.group.rotation.x=(i?1:-1)*.34*this.amplitude*Math.sin(this.phase);leg.group.updateMatrixWorld(true);});},
    sample(){const feet=legs.map((leg,i)=>playground.local(leg,[(i?-.3384:.3384),-1.3725,.13]));const center=feet[0].clone().add(feet[1]).multiplyScalar(.5);return {position:new THREE.Vector3(center.x,center.y-.10,center.z),yaw:Math.PI,sitting:0,height:.88,hands:[-.32,.32].map(a=>new THREE.Vector3(x+a,1.6,z+.36)),feet};}
   });
  }else{
   support(0);part(0,1.6,0,.3,1.27,.33,play.iron);
   for(const side of [-1,1]){
    const a=side*.73;
    if(kind==='press'){
     pipe([0,.24,0],[a,.17,-.35],.05);part(a,.17,-.35,.2,.18,.2,play.steel);
     const seat=playground.moving('leg-press-seat-'+side,point(a,.17,-.35),()=>{
      part(a,.7,.47,.53,.075,.47,play.iron);part(a,1.02,.2,.45,.48,.07,play.iron);pipe([a,.17,-.35],[a,.66,.47],.048);
      for(const sign of [-1,1])pipe([a+sign*.30,.72,.4],[a+sign*.30,1.0,.55],.033,play.iron);
     });
     pipe([0,.25,.35],[a,.25,1.05],.045);part(a,.36,1.05,.48,.07,.35,play.iron);
     playground.exercise({id:'play-leg-press-'+side,name:'Жим ногами',pumpLabel:'Отталкиваться',entry:()=>new THREE.Vector3(x+a,.145,z+1.95),
      render(){seat.group.rotation.x=-.17*this.stroke;seat.group.updateMatrixWorld(true);},
      sample(){return {seat:playground.local(seat,[0,.5675,.82]),yaw:0,sitting:1,hands:[-.30,.30].map(offset=>playground.local(seat,[offset,.83,.90])),feet:[-.12,.12].map(offset=>new THREE.Vector3(x+a+offset,.495,z+1.05))};}
     });
    }else{
     part(a,.7,.47,.53,.075,.47,play.iron);part(a,1.02,.2,.45,.48,.07,play.iron);pipe([0,.47,0],[a,.47,.28],.047);pipe([a,.47,.28],[a,.69,.47],.047);pipe([0,1.95,0],[a,1.9,.18],.044);
     const arms=playground.moving('pull-machine-arms-'+side,point(a,1.9,.18),()=>{
      for(const offset of [-.26,.26]){pipe([a+offset,1.9,.18],[a+offset,1.4,.73],.04);pipe([a+offset,1.4,.73],[a+offset,1.22,.73],.045,play.iron);}pipe([a-.26,1.9,.18],[a+.26,1.9,.18],.045);
     });
     playground.exercise({id:'play-pull-machine-'+side,name:'Тяга рычагов',pumpLabel:'Тянуть',entry:()=>new THREE.Vector3(x+a,.145,z+1.95),
      render(){arms.group.rotation.x=-.25+.60*this.stroke;arms.group.updateMatrixWorld(true);},
      sample(){return {seat:new THREE.Vector3(x+a,.7375,z+.47),yaw:0,sitting:1,hands:[-.26,.26].map(offset=>playground.local(arms,[offset,-.58,.55]))};}
     });
    }
   }
  }
  const ex=kind==='walker'?1:1.35;
  colliders.push([x-ex,z-.35,x+ex,z+1.25]);
 }
 fitnessMachine(29,24,'walker');fitnessMachine(24.8,24.2,'pull');fitnessMachine(20.5,24.5,'press');
 // Чёрно-красный комплекс турников и лестниц справа от тренажёров.
 for(const [x,z,h] of [[7,23,2.6],[10,23,2.6],[13,23,2.6],[16,23,2.6],
  [7,27,2.25],[10,27,2.6],[13,27,2.6],[16,27,2.6],[7,31,2.3],[10,31,2.3]])post(x,z,h,play.iron,.055);
 for(const [a,b,y] of [[[7,23],[10,23],2.6],[[10,23],[13,23],2.3],[[13,23],[16,23],2.6],
  [[7,27],[10,27],2.25],[[10,27],[13,27],2.6],[[13,27],[16,27],2.6]])rod([a[0],y,a[1]],[b[0],y,b[1]],.035,play.red);
 for(let y=.45;y<2.65;y+=.32){rod([10,y,23],[10,y,27],.028,play.red);rod([16,y,23],[16,y,27],.028,play.iron)}
 for(const x of [7,10])rod([x,2.3,27],[x,2.3,31],.035,play.iron);
 for(let z=27;z<31.1;z+=.45)rod([7,2.3,z],[10,2.3,z],.028,play.red);
 for(const x of [11.5,12.3]){
  for(const z of [28.5,31.5])post(x,z,1.25,play.iron,.04);
  rod([x,1.25,28.5],[x,1.25,31.5],.035,play.red);
 }
 playground.exercise({id:'play-pullup-bar',name:'Турник',kind:'pullup',pumpLabel:'Подтягиваться',proxySize:[2.4,.5,.4],proxyLift:0,proxyPosition:()=>new THREE.Vector3(8.5,2.5,23),entry:()=>new THREE.Vector3(8.5,.145,24.3),
  sample(){return {position:new THREE.Vector3(8.5,.58+.45*this.stroke,23.05),yaw:Math.PI,sitting:0,hands:[-.29,.29].map(x=>new THREE.Vector3(8.5+x,2.6,23)),feet:[-.12,.12].map(x=>new THREE.Vector3(8.5+x,.78+.45*this.stroke,23.15))};}
 });
 // Чёрная пергола у плиточной дорожки. Ажурная боковина и подвесная скамья.
 for(const x of [.1,4.1])for(const z of [18.8,21.7])post(x,z,3.05,play.iron,.055);
 for(const z of [18.65,21.85])rod([-.1,3.05,z],[4.3,3.05,z],.065,play.iron);
 for(let x=0;x<4.3;x+=.31)rod([x,3.05,18.7],[x,3.05,21.8],.038,play.iron);
 for(let z=18.9;z<21.8;z+=.44)rod([0,3.06,z],[4.2,3.06,z],.025,play.iron);
 for(let z=19;z<21.7;z+=.44)for(let y=.5;y<2.9;y+=.48){
  const q=[.1,y,z];
  for(const dy of [-.18,.18])for(const dz of [-.17,.17])rod(q,[.1,y+dy,z+dz],.014,play.iron);
 }
 const pergolaSwing=playground.moving('pergola-swing',[2.1,2.95,20.15],()=>{
  for(const x of [.72,3.46])rod([x,2.95,20.15],[x,.8,20.15],.012,play.iron);
  parkBench(2.1,20.15,0,3.1,false);
 });
 playground.pendulum({id:'play-pergola-swing',name:'Подвесная скамья',part:pergolaSwing,seat:[0,-2.2775,0],length:2.2775,maxAngle:.22,yaw:0,entry:[2.1,.12,22.1],bench:true});
 colliders.push([.08,18.9,.12,21.7]); // Решётчатая стенка перголы.
 // Открытый проём карусели обращён к плиточной дорожке.
 const merryX=39.8,merryZ=25.2,merryRadius=1.65,merryDeck=.365,wheelRadius=.31;
 const carouselPart=playground.moving('carousel-rotor',[merryX,0,merryZ],()=>{
 instance(roundCylinder,play.iron,merryX,merryDeck-.075,merryZ,merryRadius,.15,merryRadius);
 instance(roundCylinder,play.blue,merryX,.2,merryZ,.18,.3,.18);
 box(merryX-.55,.145,merryZ-2.045,merryX+.55,.254,merryZ-1.57,play.iron);
 box(merryX-.51,.254,merryZ-2.01,merryX+.51,.264,merryZ-1.575,play.steel);
 for(let i=0;i<4;i++)
  box(merryX-.478,.264,merryZ-1.965+i*.084,merryX+.478,.269,merryZ-1.947+i*.084,play.iron);
 const railPoint=(i,y)=>[merryX+Math.cos(i*Math.PI/24)*1.64,y,merryZ+Math.sin(i*Math.PI/24)*1.64];
 for(let i=40;i<80;i++){
  const a=railPoint(i,.36),b=railPoint(i+1,.36);
  rod(a,b,.038,play.blue);
  rod(railPoint(i,1.12),railPoint(i+1,1.12),.035,play.blue);
  colliders.push([Math.min(a[0],b[0])-.038,Math.min(a[2],b[2])-.038,Math.max(a[0],b[0])+.038,Math.max(a[2],b[2])+.038]);
  if(i%6===0||i===40)rod(a,railPoint(i,1.12),.033,play.blue);
 }
 rod(railPoint(80,.36),railPoint(80,1.12),.035,play.blue);
 for(const a of [-.13,.99,2.15,Math.PI+.13]){
  const co=Math.cos(a),si=Math.sin(a),x=merryX+co*1.25,z=merryZ+si*1.25;
  instance(unitBox,play.orange,x,.63,z,.37,.085,.94,0,-a);
  for(const side of [-1,1]){
   const xx=x-side*si*.31,zz=z+side*co*.31;
   rod([xx,merryDeck,zz],[xx,.589,zz],.031,play.blue);
  }
  const ex=Math.abs(co)*.185+Math.abs(si)*.47,ez=Math.abs(si)*.185+Math.abs(co)*.47;
  colliders.push([x-ex,z-ez,x+ex,z+ez]);
  const forward=new THREE.Vector3(-co,0,-si),right=new THREE.Vector3(si,0,-co),center=new THREE.Vector3(x,1.1125,z).addScaledVector(forward,.48);
  rod(center.clone().addScaledVector(right,-.27).toArray(),center.clone().addScaledVector(right,.27).toArray(),.028,play.blue);
  for(const side of [-1,1]){const grip=center.clone().addScaledVector(right,side*.27);rod(grip.clone().setY(merryDeck).toArray(),grip.toArray(),.025,play.blue);}
 }
 rod([merryX,.33,merryZ],[merryX,1.1,merryZ],.09,play.blue);
 instance(new THREE.TorusGeometry(wheelRadius,.026,8,28),play.blue,merryX,1.1,merryZ,1,1,1,Math.PI/2);
 for(const a of [0,Math.PI*2/3,Math.PI*4/3])
  rod([merryX,1.1,merryZ],[merryX+Math.cos(a)*wheelRadius,1.1,merryZ+Math.sin(a)*wheelRadius],.021,play.blue);
 });
 const carousel=playground.carousel({part:carouselPart,x:merryX,z:merryZ,seats:[-.13,.99,2.15,Math.PI+.13]});
 // Большие А-образные качели слева: чёрные ноги и красные треугольные накладки.
 for(const x of [44,48]){
  for(const z of [28.2,31.8]){
   rod([x,.14,z],[x,3.1,30],.07,play.iron);colliders.push([x-.1,z-.1,x+.1,z+.1]);
  }
  rod([x,1.45,29],[x,1.45,31],.035,play.iron);
  instance(unitBox,play.red,x,2.95,30,.18,.5,.62,0,0,.08);
 }
 rod([43.8,3.15,30],[48.2,3.15,30],.07,play.iron);
 const mainSwing=playground.moving('main-swing-seat',[46,3.1,30],()=>{
  for(const dx of [-.3,.3])rod([46+dx,3.1,30],[46+dx,.58,30.08],.012,play.iron);
  box(45.6,.53,29.82,46.4,.62,30.33,play.iron,true);
 });
 playground.pendulum({id:'play-main-swing',name:'Большие качели',part:mainSwing,seat:[0,-2.48,.075],length:2.48,chainDrop:2.52,chainZ:.08,entry:[46,.145,31.95]});
 // Отдельная красная горка, бирюзовые бока на верхней площадке, металлический скат.
 const slideX=44,slideZ=36.4;
 for(const dx of [-.52,.52])for(const dz of [-.48,.48])post(slideX+dx,slideZ+dz,2.2,play.turquoise,.042);
 box(slideX-.6,1.55,slideZ-.55,slideX+.6,1.66,slideZ+.55,p.gray);
 walkSurfaces.push([slideX-.58,slideZ-.55,slideX+.58,slideZ+.55,1.66]);
 for(const dx of [-.59,.59])box(slideX+dx-.035,1.65,slideZ-.55,slideX+dx+.035,2.25,slideZ+.55,play.turquoise,true);
 const slideRise=1.42,slideRun=3.4,slideAngle=Math.atan2(slideRise,slideRun),slideLen=Math.hypot(slideRise,slideRun);
 instance(unitBox,p.gray,slideX,.92,slideZ+2.25,1.05,.065,slideLen,slideAngle);
 walkSurfaces.push([slideX-.525,slideZ+.55,slideX+.525,slideZ+3.95,(_x,z)=>1.66-(z-slideZ-.55)*slideRise/slideRun]);
 for(const dx of [-.57,.57]){
  instance(unitBox,play.red,slideX+dx,1.05,slideZ+2.25,.09,.26,slideLen,slideAngle);
  rod([slideX+dx,.17,slideZ-2.11],[slideX+dx,1.66,slideZ-.55],.035,play.turquoise);
  colliders.push([slideX+dx-.045,slideZ+.55,slideX+dx+.045,slideZ+3.95]);
  colliders.push([slideX+dx-.035,slideZ-2.11,slideX+dx+.035,slideZ-.55]);
 }
 for(let i=0;i<6;i++){
  const a=slideZ-2.11+i*.26,b=a+.26,y=.145+(i+1)*(1.66-.145)/7;
  box(slideX-.55,y-.039,a,slideX+.55,y,b,p.gray);
  walkSurfaces.push([slideX-.55,a,slideX+.55,b,y]);
 }
 playground.slide({id:'play-red-slide',name:'Красная горка',yaw:0,proxySize:[1.1,2.0,1.5],proxyLift:1,climb:[[44,.145,33.95],[44,.145,34.25],...Array.from({length:6},(_,i)=>[44,.145+(i+1)*(1.66-.145)/7,34.42+i*.26]),[44,1.66,36.4]],top:[44,1.66,36.95],bottom:[44,.24,40.35],after:[44,.145,41.0]});
 // Низкий оранжево-бирюзовый балансир рядом с горкой.
 rod([41.5,.15,33.1],[41.5,.65,33.5],.045,play.orange);
 rod([41.5,.15,33.9],[41.5,.65,33.5],.045,play.orange);
 const seesawPart=playground.moving('seesaw-beam',[41.5,.68,33.5],()=>{
 instance(unitBox,play.orange,41.5,.68,33.5,3.9,.1,.22,0,0,-.05);
 for(const dx of [-1.65,1.65]){
  const x=41.5+dx,y=.78-dx*.05;
  instance(unitBox,play.turquoise,x,y,33.5,.57,.1,.54);
  rod([x,y+.045,33.5],[x,y+.405,33.5],.025,play.turquoise);
  rod([x,y+.405,33.39],[x,y+.405,33.61],.03,play.turquoise);
 }
 colliders.push([39.45,33.2,43.55,33.8]);
 });playground.seesaw(seesawPart);
 // Задний детский городок: коричневые стойки, светлая крыша, цветные доски и низкая горка.
 const towerX=40,towerZ=46;
 for(const dx of [-.72,.72])for(const dz of [-.72,.72])post(towerX+dx,towerZ+dz,3.07,play.brown,.065);
 box(towerX-.8,1.28,towerZ-.8,towerX+.8,1.4,towerZ+.8,play.brown);
 walkSurfaces.push([towerX-.8,towerZ-.8,towerX+.8,towerZ+.8,1.4]);
 const roofShape=new THREE.ConeGeometry(1,1,4);roofShape.rotateY(Math.PI/4);
 instance(roofShape,mat(0xc0d8d5),towerX,3.25,towerZ,1.38,.7,1.38);
 for(const dz of [-.75,.75]){
  for(let i=0;i<5;i++)box(towerX-.68+i*.29,1.4,towerZ+dz-.045,towerX-.48+i*.29,2.25,towerZ+dz+.045,[play.red,p.white,play.yellow,play.blue,p.white][i]);
  colliders.push([towerX-.8,towerZ+dz-.045,towerX+.8,towerZ+dz+.045]);
 }
 const towerSlideRun=3.05,towerSlideRise=1.17,towerSlideLow=towerX-.8-towerSlideRun;
 const towerSlideAngle=Math.atan2(towerSlideRise,towerSlideRun),towerSlideLen=Math.hypot(towerSlideRise,towerSlideRun);
 const towerSlideX=towerSlideLow+towerSlideRun/2;
 instance(unitBox,p.gray,towerSlideX,.786,towerZ,towerSlideLen,.06,.82,0,0,towerSlideAngle);
 walkSurfaces.push([towerSlideLow,towerZ-.41,towerX-.8,towerZ+.41,x=>.23+(x-towerSlideLow)*towerSlideRise/towerSlideRun]);
 for(const dz of [-.45,.45]){
  instance(unitBox,play.brown,towerSlideX,.88,towerZ+dz,towerSlideLen,.22,.08,0,0,towerSlideAngle);
  colliders.push([towerSlideLow,towerZ+dz-.04,towerX-.8,towerZ+dz+.04]);
 }
 for(let i=0;i<6;i++){
  const a=towerX+.8+i*.26,b=a+.26,y=1.4-(i+1)*(1.4-.145)/7;
  box(a,y-.056,towerZ-.55,b,y,towerZ+.55,play.brown);
  walkSurfaces.push([a,towerZ-.55,b,towerZ+.55,y]);
 }
 for(const dz of [-.58,.58]){
  rod([towerX+2.36,.25,towerZ+dz],[towerX+.8,1.31,towerZ+dz],.058,play.brown);
  rod([towerX+2.36,.145,towerZ+dz],[towerX+2.36,.67,towerZ+dz],.038,play.brown);
  rod([towerX+2.36,.67,towerZ+dz],[towerX+.8,1.88,towerZ+dz],.034,play.brown);
  colliders.push([towerX+.8,towerZ+dz-.042,towerX+2.36,towerZ+dz+.042]);
 }
 for(const dz of [-.68,.68]){
  let prev=null;
  for(let i=0;i<=18;i++){
   const a=i*Math.PI/18,q=[towerX+.72+Math.sin(a)*1.25,.2+Math.cos(a/2)*1.9,towerZ+dz];
   if(prev)rod(prev,q,.028,play.red);prev=q;
  }
 }
 playground.slide({id:'play-tower-slide',name:'Горка в городке',yaw:-Math.PI/2,covered:true,proxySize:[1.1,2.0,1.5],proxyLift:1,climb:[[42.55,.145,46],...Array.from({length:6},(_,i)=>[42.23-i*.26,1.4-(6-i)*(1.4-.145)/7,46]),[40,1.4,46]],top:[39.2,1.4,46],bottom:[36.15,.23,46],after:[35.45,.145,46]});
 // Песочница с синими стенками, красной окантовкой и жёлтыми угловыми сиденьями.
 const sandX=31.5,sandZ=39;
 box(sandX-2,.08,sandZ-1.8,sandX+2,.17,sandZ+1.8,play.sand);
 for(const [a,b,z] of [[-2.2,-.59,sandZ-2],[.59,2.2,sandZ-2],[-2.2,2.2,sandZ+1.8]]){
  box(sandX+a,.14,z,sandX+b,.57,z+.2,play.blue,true);
  box(sandX+a-.045,.57,z-.05,sandX+b+.045,.65,z+.25,play.red);
 }
 box(sandX-.59,.145,sandZ-2.01,sandX+.59,.214,sandZ-1.79,play.blue);
 walkSurfaces.push([sandX-.59,sandZ-2.01,sandX+.59,sandZ-1.79,.214],[sandX-2,sandZ-1.8,sandX+2,sandZ+1.8,.17]);
 for(const x of [sandX-2.2,sandX+2]){
  box(x,.14,sandZ-1.8,x+.2,.57,sandZ+1.8,play.blue,true);
  box(x-.05,.57,sandZ-1.8,x+.25,.65,sandZ+1.8,play.red);
 }
 for(const x of [sandX-2.25,sandX+1.35])for(const z of [sandZ-2.05,sandZ+1.15])box(x,.65,z,x+.9,.71,z+.9,play.yellow);
 // Прямоугольные рамы восстановлены: у каждой два независимых подвеса.
 for(const [x,z,w] of [[28.5,32.5,3.5],[31,47.1,3.7]]){
  for(const dx of [-w/2,w/2])post(x+dx,z,2.8,play.iron,.055);
  rod([x-w/2,2.8,z],[x+w/2,2.8,z],.055,play.iron);
  for(const offset of [-.76,.76]){
   const sx=x+offset,part=playground.moving('restored-swing-'+sx+'-'+z,[sx,2.75,z],()=>{
    for(const side of [-.24,.24])rod([sx+side,2.75,z],[sx+side,.6,z],.012,play.iron);
    box(sx-.32,.54,z-.22,sx+.32,.63,z+.22,play.turquoise,true);
   });playground.pendulum({id:'play-swing-'+sx+'-'+z,name:'Качели',part,seat:[0,-2.12,0],length:2.12,chainX:.24,chainDrop:2.15,maxAngle:.48,entry:[sx,.145,z+1.7]});
  }
 }
 for(const [x,z,c] of [[30,26.6,play.iron],[45.15,41.25,play.red]]){
  const body=playground.moving('spring-seat-'+x,[x,0,z],()=>{
   box(x-.31,.12,z-.26,x+.31,.20,z+.26,play.orange);box(x-.20,.20,z+.17,x+.20,.43,z+.24,play.turquoise);
   for(const side of [-.19,.19]){rod([x+side,.20,z-.22],[x+side,.51,z-.22],.024,play.turquoise);rod([x+side,-.14,z-.22],[x+side,-.14,z-.08],.024,play.iron);}
   rod([x-.19,.51,z-.22],[x+.19,.51,z-.22],.025,play.iron);
  });
  playground.spring({id:'play-spring-'+x,name:'Пружинная качалка',group:body.group,center:[x,z],material:c});
  colliders.push([x-.123,z-.123,x+.123,z+.123]);
 }
 const castle=new THREE.Group();castle.name='sandbox-sandcastle';castle.position.set(31.5,.17,38.9);scene.add(castle);
 for(const [x,z] of [[-.25,-.25],[.25,-.25],[-.25,.25],[.25,.25]]){const tower=new THREE.Mesh(new THREE.CylinderGeometry(.11,.14,.42,14),play.sand);tower.position.set(x,.21,z);castle.add(tower);for(let i=0;i<5;i++){const block=new THREE.Mesh(new THREE.BoxGeometry(.055,.065,.055),play.sand),a=i*Math.PI*2/5;block.position.set(x+Math.cos(a)*.08,.44,z+Math.sin(a)*.08);castle.add(block);}}
 for(const [w,d] of [[.55,.12],[.12,.55]]){const wall=new THREE.Mesh(new THREE.BoxGeometry(w,.23,d),play.sand);wall.position.y=.115;castle.add(wall);}playground.sandbox(castle);
 // Лавочки идут по краям и под деревьями, середина площадки остаётся свободной.
 for(const [x,z,r] of [[49,25,Math.PI/2],[49.4,42,Math.PI/2],[45,50,0],
  [26.7,37,-Math.PI/2],[26.7,43.5,-Math.PI/2],[27,49,-Math.PI/2],[10,33.2,0]]){
  parkBench(x,z,r);blackBin(x+(r===0?1.9:0),z+(r===0?0:1.9));
 }
 // Стволы стоят на газоне за плиточной окантовкой, вне игрового покрытия и дорожек.
 for(const [x,z,h] of [[7,55.5,10],[20,55.5,10.5],[28.5,55.5,11],[37,55.5,10],[46,55.5,9.5],
  [55.5,31,10],[55.5,40,9.8],[55.5,48,10]])deciduous(x,z,h);
 // Соседнее поле на фото 6: розовато-серый утоптанный грунт без нарисованной разметки.
 const fieldTexture=new THREE.CanvasTexture(canvas(1024,640,g=>{
  g.fillStyle='#8f8586';g.fillRect(0,0,1024,640);
  for(let i=0;i<280;i++){
   g.fillStyle=['#bda59718','#806e6012','#d6c3ae15'][i%3];g.beginPath();
   g.ellipse(rand()*1024,rand()*640,12+rand()*70,4+rand()*28,rand()*3,0,Math.PI*2);g.fill();
  }
  for(let i=0;i<45000;i++){
   g.fillStyle=i%2?'#71695c35':'#e9dbbf48';g.fillRect(rand()*1024,rand()*640,1+rand()*2,1);
  }
 }));fieldTexture.anisotropy=8;plane(-44,21.05,-3.8,49,.065,fieldTexture);
 // Небольшие прямые ворота: чёрно-белые стойки и белые задние опоры, без высокого ограждения.
 function courtyardGoal(x,z,ry){
  const point=(a,y,b)=>[x+Math.cos(ry)*a+Math.sin(ry)*b,y,z-Math.sin(ry)*a+Math.cos(ry)*b];
  const pipe=(a,b,r=.047,mt=p.white)=>rod(point(...a),point(...b),r,mt);
  for(const a of [-1.8,1.8]){
   for(let i=0;i<7;i++)pipe([a,.08+i*.3,0],[a,.08+(i+1)*.3,0],.05,i%2?p.white:play.iron);
   pipe([a,.08,-1.25],[a,2.18,0],.034);pipe([a,.08,-1.25],[a,.08,0],.035);
   const q=point(a,0,0);colliders.push([q[0]-.07,q[2]-.07,q[0]+.07,q[2]+.07]);
  }
  for(let i=0;i<12;i++)pipe([-1.8+i*.3,2.18,0],[-1.5+i*.3,2.18,0],.05,i%2?p.white:play.iron);
  pipe([-1.8,.08,-1.25],[1.8,.08,-1.25],.03);
 }
 courtyardGoal(-41.3,36,Math.PI/2);courtyardGoal(-6.7,36,-Math.PI/2);
 // Скамейка со спинкой у поля стоит между деревьями на ближней плитке.
 seat(-12.5,19.6,Math.PI);deciduous(-15.5,19.4,10.3);deciduous(-9.7,19.7,10);
 for(const x of [-46,-35,-24,-12])deciduous(x,51.5,8.5+(Math.abs(x)%3));
 // Узкая дальняя парковка и соседний пятиэтажный дом за деревьями.
 box(-48,.005,54,-4,.035,61,p.asphalt);
 parkedCar(-35,57.6,0x63786d);parkedCar(-25,57.7,0xa4aaa7);parkedCar(-13,57.7,0x5d6b74);
 for(const [x,z,h] of [[-46,30,10],[-46,43,9],[-35,55,10],[-20,55,9],[-5,54,10]])deciduous(x,z,h);
 box(15,0,57,56,.64,68,p.base,true);box(15,.64,57,56,15.5,68,mat(0x969383,true));
 for(let f=0;f<5;f++){
  const y=2.1+f*3;box(15,y-1.47,56.94,56,y-1.43,56.99,p.base);
  for(let x=17;x<55;x+=3.5)windowAt(x,y,56.88,1.5,1.5,Math.PI,f===0);
 }
 box(14.7,15.5,56.7,56.3,15.75,68.3,p.roof);
 // Тонкие чёрные фонари, как вдоль кромки площадки.
 for(const [x,z] of [[49.7,22],[50.5,33],[18,20.5],[-4,27],[-42,50]]){
  post(x,z,5.3,play.iron,.045);rod([x,5.3,z],[x-.6,5.42,z],.035,play.iron);
  box(x-.8,5.37,z-.12,x-.4,5.43,z+.12,p.gray);
  streetLamps.push([x-.6,.166,z,7]);
 }
 // Опавшие листья на резине и плитке, с проходами вокруг оборудования.
 for(let i=0;i<650;i++){
  const x=-48+rand()*101,z=14.5+rand()*39;
  if(x< -3.8&&z>23&&z<49&&rand()>.15)continue;
  const y=x>=5&&x<=51&&z>=21&&z<=51?.16:.135;
  instance(unitBall,mat([0xc5b171,0xaca36b,0x918764,0xc4ba93][i%4]),x,y,z,.035+rand()*.04,.007,.055+rand()*.035,0,rand()*6.28);
 }
 // Правая парковка с выделенным тротуаром к торговой улице.
 const marketGate={x:57,z1:-12.45,z2:-5.28};
 box(39.2,.005,-14,53,.04,12,p.asphalt);box(37.3,.01,-13,39.1,.11,8,p.path);
 box(39.1,0,-14.2,53.3,.2,-14,p.curb);
 for(const [a,b] of [[-14,marketGate.z1],[marketGate.z2,12]])box(53,0,a,53.2,.2,b,p.curb);
 for(let i=1;i<=5;i++)box(46,.041,-10.7+i*3.35,51.8,.055,-10.63+i*3.35,p.white);
 box(51.75,.04,-7.35,51.82,.055,6.12,p.white);
 box(52.9,0,-14,53.05,1.8,-13.85,p.metal);label('P',52.89,2.3,-13.8,.72,.8,'#32628a');
 function parkedCar(x,z,color){
  const paint=mat(color);
  box(x-2,.35,z-.86,x+2,1.02,z+.86,paint,true);
  box(x-1.03,1.01,z-.75,x+.97,1.55,z+.75,p.darkglass);
  box(x-.95,1.55,z-.72,x+.9,1.62,z+.72,paint);
  for(const dx of [-1.3,1.3])for(const dz of [-.84,.84])instance(unitCylinder,p.shadow,x+dx,.35,z+dz,.32,.17,.32,Math.PI/2);
  for(const dz of [-.58,.58]){
   box(x+1.98,.56,z+dz-.16,x+2.025,.77,z+dz+.16,p.white);
   box(x-2.025,.56,z+dz-.16,x-1.98,.77,z+dz+.16,mat(0x9a4b40));
  }
  box(x-2.02,.36,z-.78,x+2.02,.45,z+.78,p.gray);
  box(x-.12,1.06,z-.78,x-.07,1.56,z+.78,paint);
 }
 parkedCar(49,-2.25,0x536978);parkedCar(49,4.45,0x8e5448);
 // Пятна и люк в асфальте у торца.
 const parkingMarkMap=new THREE.CanvasTexture(canvas(64,64,g=>{
  const shade=g.createRadialGradient(32,32,0,32,32,32);
  shade.addColorStop(0,'#46494670');shade.addColorStop(.62,'#46494648');shade.addColorStop(1,'#46494600');
  g.fillStyle=shade;g.fillRect(0,0,64,64);
 }));
 const parkingMark=new THREE.MeshLambertMaterial({map:parkingMarkMap,transparent:true,depthWrite:false,
  polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
 const markDisc=new THREE.CircleGeometry(1,20);
 for(let i=0;i<13;i++)instance(markDisc,parkingMark,40+rand()*10,.04,-11+rand()*21,.2+rand()*.5,.2+rand()*.45,1,-Math.PI/2);
 instance(unitCylinder,p.base,42,.06,4,.45,.025,.45);
 for(let i=0;i<6;i++)line([41.7+i*.12,.077,3.72],[41.7+i*.12,.077,4.28],0x40433f);
 // Проём и открытые створки на восточной стороне парковки.
 for(const [a,b] of [[-19,marketGate.z1],[marketGate.z2,11]]){
  box(marketGate.x+.04,.17,a,marketGate.x+.12,1.8,b,p.gray,true);
  for(let z=a;z<b-.1;z+=2.5)box(marketGate.x-.01,0,z-.07,marketGate.x+.18,1.94,z+.07,p.base);
  for(let y=.48;y<1.7;y+=.35)line([marketGate.x+.13,y,a],[marketGate.x+.13,y,b],0x92978e);
 }
 for(const z of [marketGate.z1,marketGate.z2]){
  box(56.91,0,z-.089,57.17,2.12,z+.089,p.metal,true);
  box(56.88,2.105,z-.117,57.2,2.174,z+.117,p.gray);
  for(const y of [.22,1.05,1.81])box(57.18,y-.023,z-.027,60.32,y+.023,z+.027,play.iron,true);
  for(let x=57.22;x<60.32;x+=.162)box(x,.23,z-.019,x+.028,1.82,z+.019,play.iron);
  box(60.30,.203,z-.029,60.37,1.86,z+.029,play.iron,true);
 }
 for(let x=37.5;x<57;x+=2.5){
  box(x,0,-16.15,x+.14,1.95,-15.95,p.base,true);
  box(x,.18,-16.08,x+2.5,1.8,-16,p.gray,true);
  for(let y=.48;y<1.7;y+=.35)line([x,y,-15.98],[x+2.5,y,-15.98],0x92978e);
 }
 for(const [x,z,h] of [[54,-17,8],[60,3,10],[-43,-8,8],[-32,-18,8],[-9,-18,7],[20,-19,9],[40,-20,8]])deciduous(x,z,h);
 // Торговая улица за правыми воротами. Входы всех четырёх зданий выходят на один тротуар.
 const market={roadNear:116,roadFar:134,crossZ1:-12.10,crossZ2:-9.37,stopZ1:-20.35,stopZ2:-13.05};
 const {roadNear,roadFar,crossZ1,crossZ2,stopZ1,stopZ2}=market;
 const roadMin=-238,roadMax=225,farWalk=roadFar+4.5;
 const marketSouth=-1.72,binCourt={x1:57.11,x2:62.4,z1:-25.7,z2:-14.63};
 const marketPavement=mat(0xa9a59a,true),asphalt=mat(0x53585c,true),curb=mat(0xc1c3bc);
 const marking=mat(0xe1e3d8),warmTile=mat(0xbfb8a9,true),darkTile=mat(0x817b70,true);
 box(-228,-.24,-258,300,-.044,243,p.grass);
 box(53.15,-.02,-27.45,112.25,.015,marketSouth+.075,marketPavement);
 box(roadFar+.05,-.021,-44,farWalk+.24,.021,31,marketPavement);
 box(60.53,.016,-28.9,112.25,.036,-14.62,p.asphalt);
 function marketWalk(a,b,c,d){
  box(a,0,b,c,.112,d,warmTile);
  paving(a,b,c,d);
  walkSurfaces.push([a,b,c,d,.12]);
 }
 function roadSurface(a,b,c,d){
  box(a,.006,b,c,.054,d,asphalt);
  walkSurfaces.push([a,b,c,d,.054]);
 }
 marketWalk(38.93,-11.97,60.53,-9.05);
 marketWalk(60.53,-14.63,112.25,-9.05);
 marketWalk(112.25,-45.5,roadNear,-9.05);
 marketWalk(112.25,-5.33,roadNear,32.5);
 marketWalk(roadFar,-45.5,farWalk,32.5);
 roadSurface(52.93,-9.05,roadNear,-5.33);
 roadSurface(roadNear,roadMin,roadFar,roadMax);
 for(const [a,b] of [[53.27,60.53],[60.53,112.25]])box(a,.055,-9.09,b,.143,-9.015,curb);
 for(const [a,b] of [[60.53,112.25],[112.25,roadNear-.45]])box(a,.014,-5.35,b,.135,-5.24,curb);
 for(const [x,cutA,cutB] of [[roadNear,crossZ1,-5.33],[roadFar,crossZ1,crossZ2]]){
  for(const [a,b] of [[-45.5,cutA],[cutB,32.5]])box(x-.065,.039,a,x+.065,.16,b,curb);
 }
 for(const x of [roadNear,roadFar]){
  const edge=x===roadNear?x-.61:x+.16;
  box(edge,.121,crossZ1+.075,edge+.45,.127,crossZ2-.075,mat(0xc2a665));
  for(let z=crossZ1+.16;z<crossZ2-.14;z+=.146)
   for(const dx of [.085,.208,.331])instance(unitCylinder,marking,edge+dx,.132,z,.021,.009,.021);
 }
 for(let x=roadNear+.19;x<roadFar-.47;x+=.79)box(x,.055,crossZ1,x+.44,.060,crossZ2,marking);
 for(let z=-8.86;z<-5.6;z+=.51)box(113.38,.055,z,115.67,.059,z+.28,marking);
 for(let z=roadMin+1;z<roadMax-2.28;z+=4.55){
  if(z<crossZ2+.45&&z+2.27>crossZ1-.45)continue;
  box((roadNear+roadFar)/2-.06,.055,z,(roadNear+roadFar)/2+.06,.060,z+2.27,marking);
 }
 for(const x of [roadNear+.29,roadFar-.29]){
  for(const [a,b] of [[roadMin+.2,crossZ1-.12],[(x<120?-5.2:crossZ2+.12),roadMax-.2]])box(x-.036,.055,a,x+.036,.059,b,marking);
 }
 // Карманы вдоль бордюров оставляют автобусам место у посадочных площадок.
 for(const x of [roadNear+3.12,roadFar-3.12]){
  for(let z=-29.2;z<crossZ1-1.36;z+=2.13)box(x-.054,.055,z,x+.054,.061,z+1.04,marking);
 }
 box(57.013,1.63,marketGate.z1-1.22,57.063,1.91,marketGate.z1-.16,p.metal);
 label('К МАГАЗИНАМ',57.01,1.77,marketGate.z1-.69,.99,.25,'#344b52','#ecebdc',-Math.PI/2);

 const marketShops=[
  {x1:62.4,x2:70.9,back:-23.65,height:4.37,wall:0xd7d6c9,accent:0x347c82,sign:'#2f6871',title:'КСЕРОКОПИЯ',sub:'ПЕЧАТЬ  •  СКАНИРОВАНИЕ',kind:'print',interior:'Ксерокопия'},
  {x1:71.68,x2:80.22,back:-24.62,height:4.65,wall:0xe2e1d3,accent:0x3b8c5f,sign:'#306f50',title:'АПТЕКА',sub:'ДЛЯ ЗДОРОВЬЯ',kind:'pharmacy'},
  {x1:81,x2:92.3,back:-25.55,height:5.15,wall:0xd9c8b0,accent:0x8e554d,sign:'#744541',title:'МАГАЗИН ОДЕЖДЫ',sub:'ОДЕЖДА  •  АКСЕССУАРЫ',kind:'clothes',interior:'Магазин одежды'},
  {x1:93.08,x2:107.45,back:-24.6,height:5.43,wall:0x8e9a9a,accent:0x344e65,sign:'#2d465c',title:'МАГАЗИН ТЕХНИКИ',sub:'ЭЛЕКТРОНИКА  •  АКСЕССУАРЫ',kind:'tech',interior:'Магазин техники'}
 ];
 const shopFront=-14.63,roof=mat(0x585c58,true),frame=mat(0x414d50),metalTrim=mat(0xa4adab);
 const printShop=marketShops[0],printMid=(printShop.x1+printShop.x2)/2,shopDoorHalf=1.08;
 const openShops=marketShops.filter(shop=>shop.interior);
 function interiorShopAt(x,z){
  if(z<shopFront)return openShops.find(shop=>x>=shop.x1&&x<=shop.x2&&z>=shop.back);
 }
 const clearGlass=new THREE.MeshPhongMaterial({color:0xaacbd0,transparent:true,opacity:.16,depthWrite:false});
 const windowMap=new THREE.CanvasTexture(canvas(256,256,(g,w,h)=>{
  const tint=g.createLinearGradient(0,0,w,h);
  tint.addColorStop(0,'#8ea9b5');tint.addColorStop(.52,'#567885');tint.addColorStop(1,'#334a53');
  g.fillStyle=tint;g.fillRect(0,0,w,h);
  g.fillStyle='#d3e0e21e';g.beginPath();g.moveTo(0,60);g.lineTo(w,8);g.lineTo(w,31);g.lineTo(0,93);g.closePath();g.fill();
  g.fillStyle='#dae4e61a';g.fillRect(31,0,15,h);g.fillRect(180,0,5,h);
  g.fillStyle='#253c473c';g.fillRect(0,182,w,74);
 }));
 const retailGlass=new THREE.MeshLambertMaterial({map:windowMap});
 function facadeSign(shop,x,y,z,w){
  const map=new THREE.CanvasTexture(canvas(1024,210,(g,w,h)=>{
   g.fillStyle=shop.sign;g.fillRect(0,0,w,h);
   g.strokeStyle='#ffffff40';g.lineWidth=2;g.strokeRect(13,13,w-26,h-26);
   g.fillStyle='#f5f2e8';g.textBaseline='middle';g.textAlign='left';g.font='bold 77px Arial';
   g.fillText(shop.title,207,86,w-245);
   g.fillStyle='#e0e6df';g.font='bold 25px Arial';g.fillText(shop.sub,211,157,w-250);
   g.fillStyle='#ffffff1c';g.fillRect(35,32,132,145);g.strokeStyle='#f2f3e7';g.fillStyle='#f2f3e7';g.lineWidth=5;
   if(shop.kind==='print'){
    g.strokeRect(75,50,50,73);g.strokeRect(57,80,86,56);g.fillRect(75,115,50,40);
    g.fillStyle=shop.sign;g.fillRect(82,125,36,3);g.fillRect(82,135,36,3);
   }else if(shop.kind==='pharmacy'){
    g.fillRect(86,59,29,91);g.fillRect(55,90,91,29);
   }else if(shop.kind==='clothes'){
    g.beginPath();g.moveTo(99,89);g.quadraticCurveTo(93,76,101,69);g.quadraticCurveTo(119,73,111,85);
    g.lineTo(100,99);g.lineTo(55,129);g.quadraticCurveTo(52,137,62,138);
    g.lineTo(140,138);g.quadraticCurveTo(148,135,141,129);g.lineTo(99,100);g.stroke();
   }else{
    g.strokeRect(55,67,91,61);g.fillRect(93,129,15,16);g.fillRect(75,145,51,6);
   }
  }));
  const face=new THREE.Mesh(new THREE.PlaneGeometry(w,.76),new THREE.MeshBasicMaterial({map}));
  face.position.set(x,y,z);scene.add(face);
 }
 function storefront(shop){
  const {x1,x2,back,height}=shop,w=x2-x1,mid=(x1+x2)/2,z=shopFront,accent=mat(shop.accent);
  const wall=mat(shop.wall,true),upper=height-.62,open=Boolean(shop.interior);
  if(open){
   box(x1,.12,back,x1+.18,height-.15,z,wall,true);
   box(x2-.18,.12,back,x2,height-.15,z,wall,true);
   box(x1+.18,.12,back,x2-.18,height-.15,back+.18,wall,true);
   box(x1,2.64,z-.16,x2,height-.15,z,wall);
  }else box(x1,.12,back,x2,height-.15,z,wall,true);
  if(open)box(x1-.095,0,back-.02,x2+.095,.12,z+.083,darkTile);
  else box(x1-.095,.124,back-.02,x2+.095,.44,z+.083,darkTile);
  box(x1-.15,height-.37,back-.14,x2+.15,height-.1,z+.15,accent);
  box(x1-.16,height-.17,back-.14,x2+.16,height,z+.16,roof);
  box(x1+.055,height-.04,back+.1,x2-.055,height+.032,z-.18,mat(0x666963));
  for(const x of [x1+.22,x2-.22])box(x-.078,.424,z-.013,x+.078,upper,z+.095,accent);
  for(const side of [-1,1]){
   const a=side<0?x1+.53:mid+1.25,b=side<0?mid-1.25:x2-.53;
   if(open){
    const left=side<0?x1:mid+shopDoorHalf,right=side<0?mid-shopDoorHalf:x2;
    box(left,.12,z-.16,right,.67,z,wall,true);
    box(left,.67,z-.16,a,2.64,z,wall);
    box(b,.67,z-.16,right,2.64,z,wall);
   }
   box(a,.67,z+.012,b,2.63,z+.045,open?clearGlass:retailGlass);
   for(const x of [a,(a+b)/2,b])box(x-.025,.633,z+.042,x+.025,2.663,z+.081,frame);
   for(const y of [.637,2.16,2.642])box(a,y,z+.041,b,y+.032,z+.081,frame);
   box(a-.07,.605,z+.01,b+.07,.668,z+.139,accent);
  }
  if(open){
   box(mid-shopDoorHalf,2.618,z-.13,mid+shopDoorHalf,2.66,z+.091,frame);
   for(const side of [-1,1]){
    const x=mid+side*shopDoorHalf;
    box(x-.033,.139,z-.13,x+.033,2.65,z+.092,frame);
    box(x-.017,.17,z-1.04,x+.017,2.6,z-.035,clearGlass);
    for(const d of [.04,1.04])box(x-.027,.15,z-d-.025,x+.027,2.63,z-d+.025,frame,true);
    for(const y of [.155,2.16,2.59])box(x-.027,y,z-1.04,x+.027,y+.041,z-.035,frame,true);
    rod([x-side*.066,.98,z-.92],[x-side*.066,1.34,z-.92],.018,metalTrim);
   }
  }else{
   box(mid-shopDoorHalf,.137,z+.004,mid+shopDoorHalf,2.63,z+.057,retailGlass);
   for(const x of [mid-shopDoorHalf,mid,mid+shopDoorHalf])box(x-.033,.139,z+.043,x+.033,2.65,z+.092,frame);
   for(const y of [.165,2.128,2.618])box(mid-shopDoorHalf,y,z+.045,mid+shopDoorHalf,y+.036,z+.091,frame);
   for(const x of [mid-.132,mid+.132])rod([x,.986,z+.111],[x,1.348,z+.111],.018,metalTrim);
  }
  box(mid-1.19,.118,z,mid+1.19,open ? .123 : .155,z+.48,darkTile);
  box(x1+.43,2.72,z-.015,x2-.43,2.933,z+.71,accent);
  box(x1+.43,2.697,z+.065,x2-.43,2.738,z+.69,metalTrim);
  for(const x of [mid-1.45,mid,mid+1.45])box(x-.102,2.684,z+.42,x+.102,2.699,z+.555,p.white);
  box(mid-Math.min(w-.84,9.55)/2,3.018,z+.015,mid+Math.min(w-.84,9.55)/2,3.866,z+.09,accent);
  facadeSign(shop,mid,3.446,z+.093,Math.min(w-.96,9.39));
  if(height>5){
   for(let x=x1+.88;x<x2-.65;x+=1.08)box(x,4.13,z+.012,x+.57,4.49,z+.038,retailGlass);
  }
 }
 function buildPrintShop(){
  const width=printShop.x2-printShop.x1,depth=shopFront-printShop.back;
  const side=width/2-.18,back=depth-.18,front=.16;
  const white=mat(0xe0e7ed),black=mat(0x24272b),red=mat(0x99302e),leather=mat(0xa83536);
  const leatherLight=mat(0xb74543),chrome=mat(0xadb7ba),gold=mat(0xc4a064),paper=mat(0xf4f0e3);
  const curtain=mat(0x262737),curtainFold=mat(0x343447),wood=mat(0xd4bf9b);
  const lamp=new THREE.MeshBasicMaterial({color:0xfff4dd});
  function part(a,y,d,b,top,end,material,solid=false){
   box(printMid+a,y,shopFront-end,printMid+b,top,shopFront-d,material,solid);
  }
  const tile=new THREE.CanvasTexture(canvas(256,256,(g,w,h)=>{
   g.fillStyle='#b9b8ae';g.fillRect(0,0,w,h);
   for(let row=0;row<4;row++)for(let col=0;col<4;col++){
    const x=col*64,y=row*64;
    g.fillStyle=['#e5e0d4','#e6e2d7','#e2ddd2','#e3dfd6'][(row*5+col*3+row*col)%4];
    g.fillRect(x+1,y+1,63,63);
    g.fillStyle='#ffffff30';g.fillRect(x+2,y+2,61,1);
   }
  }));
  tile.wrapS=tile.wrapT=THREE.RepeatWrapping;
  tile.repeat.set((side*2)/2.44,back/2.44);tile.anisotropy=8;
  plane(printMid-side,printShop.back+.18,printMid+side,shopFront,.121,tile);
  walkSurfaces.push([printMid-side,printShop.back+.18,printMid+side,shopFront,.12]);
  for(const s of [-1,1]){
   const x=s*side;
   part(x-.018,.12,front,x+.018,3.25,back,white);
   part(x-.04,.12,front,x+.04,.23,back,black);
  }
  part(-side,.12,back-.037,side,3.25,back,white);
  part(-side,.12,back-.065,side,.23,back,black);
  part(-side,3.24,front,side,3.29,back,new THREE.MeshBasicMaterial({color:0xd5d9dc}));
  for(const d of [2.12,4.54,7.35]){
   part(-.83,3.195,d-.27,.83,3.241,d+.27,white);
   part(-.78,3.181,d-.23,.78,3.198,d+.23,lamp);
  }

  // Фотографии на стенах и в рамках используют общий атлас с фрагментами референса.
  const atlas=new THREE.CanvasTexture(canvas(480,192,(g,w,h)=>{g.fillStyle='#a3acb0';g.fillRect(0,0,w,h)}));
  atlas.anisotropy=4;
  const reference=document.createElement('img');
  reference.onload=()=>{
   atlas.image.getContext('2d').drawImage(reference,0,0);
   atlas.needsUpdate=true;
  };
  reference.src='data:image/webp;base64,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';
  const photos=new THREE.MeshBasicMaterial({map:atlas});
  function photo(index,x,y,d,w,h,turn=0){
   const geometry=new THREE.PlaneGeometry(w,h),uv=geometry.attributes.uv;
   const col=index%5,row=Math.floor(index/5);
   for(let i=0;i<uv.count;i++)uv.setXY(i,(col*96+1+uv.getX(i)*94)/480,1-((row+1)*96-1-uv.getY(i)*94)/192);
   const mesh=new THREE.Mesh(geometry,photos);
   mesh.position.set(printMid+x,y,shopFront-d);mesh.rotation.y=turn;scene.add(mesh);
  }
  for(let i=0;i<5;i++)photo(i,(i-2)*1.46,2.82,back-.053,1.08,.74);
  for(let i=0;i<7;i++){
   const depth=1.01+i*.99;
   photo(5+i%4,-side+.025,2.78,depth,.81,.65,Math.PI/2);
   photo(5+(i+2)%4,-side+.025,1.96,depth,.72,.63,Math.PI/2);
  }
  for(let i=0;i<4;i++)photo(i===0?9:i,side-.025,2.75,1.38+i*1.04,.94,.77,-Math.PI/2);
  part(-1.31,1.87,back-.103,1.31,2.34,back-.04,black);
  label('ФОТО',printMid-.39,2.105,shopFront-back+.106,1.65,.39,'#23252b');
  label('ЦЕНТР',printMid+.88,2.105,shopFront-back+.107,.71,.36,'#a53138');
  label('ФОТО НА ДОКУМЕНТЫ',printMid-3.1,2.49,shopFront-back+.11,1.26,.23,'#a53138');
  for(const x of [-3.13,3.13]){
   part(x-.56,.12,back-.091,x+.56,2.33,back-.055,black);
   for(let i=0;i<11;i++){
    const fold=x-.51+i*.102;
    part(fold-.037,.14,back-.129,fold+.037,2.31,back-.085,i%2?curtain:curtainFold);
   }
   part(x-.6,2.3,back-.148,x+.6,2.36,back-.048,chrome);
  }
  part(1.42,1.3,back-.088,2.26,2.28,back-.04,gold);
  part(1.45,1.33,back-.095,2.23,2.25,back-.083,paper);
  for(let row=0;row<4;row++)for(let col=0;col<3;col++)
   photo((row*3+col)%10,1.58+col*.26,1.45+row*.22,back-.102,.19,.16);

  // Диван у левой стены, с отдельными подушками и округлыми подлокотниками.
  const shape=new THREE.Shape(),r=.11,a=.445;
  shape.moveTo(-a+r,-a);shape.lineTo(a-r,-a);shape.quadraticCurveTo(a,-a,a,-a+r);
  shape.lineTo(a,a-r);shape.quadraticCurveTo(a,a,a-r,a);shape.lineTo(-a+r,a);
  shape.quadraticCurveTo(-a,a,-a,a-r);shape.lineTo(-a,-a+r);shape.quadraticCurveTo(-a,-a,-a+r,-a);
  const cushion=new THREE.ExtrudeGeometry(shape,{depth:.89,bevelThickness:.055,bevelSize:.055,bevelSegments:3,curveSegments:5});
  cushion.center();
  function pad(x,y,d,w,h,l,material,tilt=0){
   instance(cushion,material,printMid+x,y,shopFront-d,w,h,l,0,0,tilt);
  }
  part(-3.96,.12,.96,-2.83,.4,3.62,leather,true);
  pad(-3.395,.35,2.29,1.14,.34,2.64,leather);
  for(const d of [1.58,2.3,3.02]){
   pad(-3.28,.52,d,.87,.19,.695,leatherLight);
   pad(-3.76,.78,d,.28,.8,.7,leatherLight,.13);
  }
  for(const d of [1.11,3.47])pad(-3.375,.59,d,1.13,.43,.29,leather);

  // Стойка фотосалона с высокой секцией, принтером, сканером и образцами услуг.
  part(-2.6,.12,5.04,.12,1.13,6.06,black,true);
  part(-.03,.12,5.26,2.55,.97,6.24,black,true);
  part(-2.66,1.13,4.98,.18,1.201,6.11,red);
  part(-.09,.97,5.19,2.62,1.043,6.3,red);
  part(-2.59,.124,5.031,.11,.206,5.09,red);
  part(-.02,.124,5.251,2.54,.206,5.31,red);
  label('КОПИИ  •  ПЕЧАТЬ',printMid-1.78,.9,shopFront-5.037,.92,.25,'#8d292f');
  label('ФОТО НА ДОКУМЕНТЫ',printMid-1.78,.62,shopFront-5.037,.92,.23,'#8d292f');
  for(let i=0;i<3;i++){
   label(['СКАНИРОВАНИЕ','ЦВЕТНАЯ ПЕЧАТЬ','ФОТОУСЛУГИ'][i],printMid+.63,.84-i*.19,shopFront-5.257,.87,.15,'#5e5554');
   photo(i+1,1.38,.84-i*.19,5.255,.25,.148);
  }
  for(let i=0;i<2;i++){
   const x=-2.18+i*.37;
   part(x-.16,1.2,5.44,x+.16,1.61,5.49,black);
   part(x-.144,1.214,5.432,x+.144,1.594,5.441,paper);
   for(let j=0;j<8;j++)part(x-.116,1.278+j*.033,5.426,x+.106-(j%3)*.025,1.284+j*.033,5.434,chrome);
  }
  part(-.64,1.201,5.64,-.07,1.62,6.07,mat(0xbdc6c9));
  part(-.59,1.51,5.63,-.12,1.557,5.647,black);
  part(-.51,1.621,5.75,-.13,1.631,6.02,paper);
  part(1.43,1.043,5.66,2.32,1.154,6.18,black);
  part(1.51,1.154,5.69,2.25,1.17,6.09,chrome);
  instance(unitBox,black,printMid+1.88,1.337,shopFront-6.05,.8,.057,.52,-.78);
  part(.54,1.043,5.72,1.12,1.077,5.99,black);
  part(.815,1.077,5.83,.862,1.28,5.91,black);
  part(.49,1.27,5.822,1.19,1.69,5.89,black);
  part(.52,1.303,5.891,1.16,1.658,5.9,mat(0x445e6b));
  part(.57,1.044,5.33,1.18,1.077,5.59,black);
  for(let i=0;i<3;i++)part(2.06,1.044+i*.021,5.29,2.48,1.063+i*.021,5.61,i%2?chrome:paper);

  // Правая витрина с фоторамками и островок с кружками оставляют центральный проход.
  part(3.37,.12,.94,side-.035,.42,4.58,wood,true);
  for(const d of [.94,2.15,3.37,4.58])part(3.36,.4,d-.025,3.415,2.34,d+.025,gold);
  for(let row=0;row<4;row++){
   const y=.43+row*.48;
   part(3.35,y,.94,side-.035,y+.035,4.58,clearGlass);
   part(3.345,y,.94,3.39,y+.032,4.58,gold);
   part(side-.08,y+.445,.94,side-.054,y+.467,4.58,lamp);
   for(let i=0;i<9;i++){
    const d=1.17+i*.39,w=.23+(i%3)*.031,h=.27+((i+row)%3)*.038;
    part(3.72,y+.036,d-w/2,3.779,y+.036+h,d+w/2,i%3===1?paper:gold);
    photo((row*4+i)%10,3.718,y+.036+h/2,d,w-.047,h-.048,-Math.PI/2);
   }
  }
  part(1.28,.12,1.64,2.62,.44,3.43,black,true);
  for(const x of [1.28,2.62])for(const d of [1.64,3.43])part(x-.025,.43,d-.025,x+.025,1.1,d+.025,chrome);
  for(const y of [.46,.75,1.075])part(1.275,y,1.64,2.625,y+.025,3.43,clearGlass);
  part(1.274,.46,1.65,1.289,1.073,3.42,clearGlass);
  const mugs=[mat(0xf7f2dd),mat(0x8e3b38),mat(0x3c676d),mat(0x9b723e)];
  for(let i=0;i<10;i++){
   const x=1.49+(i%2)*.35,d=1.85+Math.floor(i/2)*.315;
   instance(roundCylinder,mugs[i%4],printMid+x,.866,shopFront-d,.086,.174,.086);
   instance(roundCylinder,black,printMid+x,.954,shopFront-d,.068,.004,.068);
   instance(unitBall,mugs[i%4],printMid+x+.082,.865,shopFront-d,.05,.051,.024);
  }
  for(let i=0;i<5;i++){
   const d=1.89+i*.315;
   part(2.08,.775,d-.13,2.45,.821,d+.13,i%2?paper:red);
   photo(i,2.275,.877,d+.129,.28,.108);
  }
 }
 function buildClothingShop(shop){
  const mid=(shop.x1+shop.x2)/2,side=(shop.x2-shop.x1)/2-.18,back=shopFront-shop.back-.18,ceiling=3.56;
  const wallOffset=side-.025,wallBack=back-.025,front=.16;
  const steel=mat(0x272628),wood=mat(0xc2a78e),base=mat(0xb4afa8);
  const diffuser=new THREE.MeshBasicMaterial({color:0xfff2df});
  function part(a,y,d,b,top,end,material,solid=false){
   box(mid+a,y,shopFront-end,mid+b,top,shopFront-d,material,solid);
  }

  // Светлая штукатурка, гладкий бетон и встроенная подсветка.
  let textureSeed=2613;
  const textureRandom=()=>{
   textureSeed=(Math.imul(textureSeed,1664525)+1013904223)>>>0;return textureSeed/4294967296;
  };
  const stoneMap=new THREE.CanvasTexture(canvas(256,256,(g,w,h)=>{
   g.fillStyle='#dedbd4';g.fillRect(0,0,w,h);
   for(let i=0;i<9400;i++){
    const x=textureRandom()*w,y=textureRandom()*h,size=.4+textureRandom()*1.65;
    g.fillStyle=i%3?'#34312d15':'#fffef229';g.fillRect(x,y,size,size);
   }
  }));
  stoneMap.wrapS=stoneMap.wrapT=THREE.RepeatWrapping;stoneMap.anisotropy=8;
  const plaster=new THREE.MeshBasicMaterial({color:0xb8b1a7,map:stoneMap});
  const floor=new THREE.MeshBasicMaterial({color:0xd5d0c8,map:stoneMap});
  const overhead=new THREE.MeshBasicMaterial({color:0xaaa39b,map:stoneMap});
  const islands=new THREE.MeshLambertMaterial({color:0xacadb3,map:stoneMap});
  function panel(w,h,x,y,d,material,rx=0,ry=0){
   const geometry=new THREE.PlaneGeometry(w,h),uv=geometry.attributes.uv;
   for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/1.25,uv.getY(i)*h/1.25);
   const mesh=new THREE.Mesh(geometry,material);
   mesh.position.set(mid+x,y,shopFront-d);mesh.rotation.set(rx,ry,0);scene.add(mesh);
  }
  panel(side*2,back,0,.121,back/2,floor,-Math.PI/2);
  walkSurfaces.push([mid-side,shop.back+.18,mid+side,shopFront,.12]);
  panel(side*2,back-front,0,ceiling,(back+front)/2,overhead,Math.PI/2);
  panel(side*2,ceiling-.12,0,(ceiling+.12)/2,wallBack,plaster);
  for(const s of [-1,1]){
   panel(back-front,ceiling-.12,s*wallOffset,(ceiling+.12)/2,(back+front)/2,plaster,0,-s*Math.PI/2);
  }
  part(-side,.12,front,-side+.22,.3,back,base);
  part(side-.22,.12,front,side,.3,back,base);
  part(-side,.12,back-.26,side,.3,back,base);
  part(-3.97,.12,9.68,-3.49,ceiling,back,overhead,true);

  const glowMap=new THREE.CanvasTexture(canvas(128,128,(g,w,h)=>{
   const glow=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
   glow.addColorStop(0,'#fff1d3a0');glow.addColorStop(.43,'#fff0d34d');glow.addColorStop(1,'#fff0d300');
   g.fillStyle=glow;g.fillRect(0,0,w,h);
  }));
  const glow=new THREE.MeshBasicMaterial({map:glowMap,transparent:true,opacity:.57,depthWrite:false});
  function projection(w,h,x,y,d,material,rx=0,ry=0){
   const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);
   mesh.position.set(mid+x,y,shopFront-d);mesh.rotation.set(rx,ry,0);scene.add(mesh);
  }
  for(const s of [-1,1]){
   for(const d of [2.35,4.7,7.05,9.45]){
    for(const delta of [-.16,.16]){
     instance(roundCylinder,steel,mid+s*3.77,ceiling-.012,shopFront-d+delta,.074,.026,.074);
     instance(roundCylinder,diffuser,mid+s*3.77,ceiling-.028,shopFront-d+delta,.057,.011,.057);
    }
    projection(3.8,3.02,s*(wallOffset-.004),1.73,d,glow,0,-s*Math.PI/2);
    projection(2.85,2.95,s*3.98,.125,d,glow,-Math.PI/2);
   }
  }
  projection(7.3,3.18,0,1.74,wallBack-.005,glow);
  projection(5.2,5.6,0,.126,5.15,glow,-Math.PI/2);
  const contactMap=new THREE.CanvasTexture(canvas(128,128,(g,w,h)=>{
   const shade=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
   shade.addColorStop(0,'#332d268a');shade.addColorStop(.53,'#332d2656');shade.addColorStop(1,'#332d2600');
   g.fillStyle=shade;g.fillRect(0,0,w,h);
  }));
  const contact=new THREE.MeshBasicMaterial({map:contactMap,transparent:true,depthWrite:false});
  for(const [w,l,x,d] of [[4.66,2.25,-.32,4.53],[4.79,2.28,1.09,6.97],[1.44,7.24,-4.43,4.63],
   [1.44,7.24,4.42,4.66],[6.62,1.47,.04,9.57]])projection(w,l,x,.132,d,contact,-Math.PI/2);

  const cove={left:-1.75,right:2.57,near:3.77,far:7.25,lip:2.96,rim:.13};
  const {left,right,near,far,lip,rim}=cove;
  for(const x of [left,right-rim])part(x,lip,near,x+rim,ceiling,far,overhead);
  for(const d of [near,far-rim])part(left+rim,lip,d,right-rim,ceiling,d+rim,overhead);
  part(left+rim,lip+.14,near+rim,right-rim,lip+.16,far-rim,diffuser);
  const coveTrim=new THREE.MeshBasicMaterial({color:0xd6ccbd,side:THREE.DoubleSide});
  const outline=[[left+rim,near+rim],[right-rim,near+rim],[right-rim,far-rim],[left+rim,far-rim]];
  const recess=[[left+.33,near+.33],[right-.33,near+.33],[right-.33,far-.33],[left+.33,far-.33]];
  for(let i=0;i<4;i++){
   const j=(i+1)%4;
   const points=[[outline[i],lip],[outline[j],lip],[recess[j],lip+.139],[recess[i],lip+.139]]
    .flatMap(([[x,d],y])=>[mid+x,y,shopFront-d]);
   const geometry=new THREE.BufferGeometry();
   geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geometry.setIndex([0,1,2,0,2,3]);
   scene.add(new THREE.Mesh(geometry,coveTrim));
  }

  // Подвесные рейлы с деревянными плечиками и одеждой разного кроя.
  const clothMap=new THREE.CanvasTexture(canvas(128,128,(g,w,h)=>{
   g.fillStyle='#e1dfdc';g.fillRect(0,0,w,h);
   for(let x=0;x<w;x++){
    const shade=Math.round(218+15*Math.sin(x*.275)+6*Math.cos(x*.83));
    g.fillStyle='rgb('+shade+','+shade+','+shade+')';g.fillRect(x,0,1,h);
   }
   g.fillStyle='#ffffff34';
   for(let y=0;y<h;y+=3)g.fillRect(0,y,w,1);
  }));
  clothMap.wrapS=clothMap.wrapT=THREE.RepeatWrapping;
  const fabric=[0xeee4d5,0xb59780,0x738e9b,0x45657f,0x253641,0x313034,0x9c4746,0xc07470,0xe1ded9,0x847f7c]
   .map(color=>new THREE.MeshLambertMaterial({color,map:clothMap}));
  function contour(points){
   const shape=new THREE.Shape();shape.moveTo(...points[0]);
   for(const point of points.slice(1))shape.lineTo(...point);
   shape.closePath();return shape;
  }
  function garment(points){
   const geometry=new THREE.ExtrudeGeometry(contour(points),{depth:.035,bevelThickness:.007,bevelSize:.009,bevelSegments:2});
   const pos=geometry.attributes.position,uv=geometry.attributes.uv;
   for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
    const drape=(.016*Math.sin(29*x+3*y)+.009*Math.cos(41*x-6*y))*Math.min(1,.24-y);
    pos.setZ(i,z+drape-.0175);uv.setXY(i,(x+.43)/.86,(y+1.32)/1.32);
   }
   geometry.computeVertexNormals();return geometry;
  }
  const garments=[
   garment([[-.11,0],[-.245,-.041],[-.376,-.223],[-.272,-.298],[-.201,-.223],[-.22,-.695],[.225,-.707],[.20,-.222],[.274,-.298],[.378,-.218],[.244,-.038],[.11,0],[.08,-.065],[0,-.096],[-.078,-.065]]),
   garment([[-.105,0],[-.235,-.053],[-.298,-.26],[-.356,-.652],[-.237,-.682],[-.185,-.343],[-.196,-.779],[.204,-.786],[.185,-.344],[.244,-.683],[.358,-.651],[.289,-.258],[.229,-.052],[.104,0],[.067,-.11],[0,-.15],[-.064,-.11]]),
   garment([[-.208,-.024],[.209,-.024],[.222,-.31],[.194,-1.103],[.051,-1.109],[.006,-.425],[-.045,-1.104],[-.201,-1.119],[-.219,-.31]]),
   garment([[-.12,0],[-.23,-.044],[-.31,-.188],[-.21,-.266],[-.165,-.194],[-.15,-.432],[-.288,-1.078],[.305,-1.087],[.145,-.436],[.166,-.194],[.218,-.26],[.311,-.185],[.229,-.043],[.116,0],[.071,-.079],[0,-.107],[-.077,-.078]])
  ];
  const hangerShape=contour([[0,.013],[.244,-.115],[.254,-.142],[-.254,-.142],[-.244,-.115]]);
  const hangerHole=new THREE.Path();
  hangerHole.moveTo(0,-.02);hangerHole.lineTo(-.186,-.112);hangerHole.lineTo(.186,-.112);hangerHole.closePath();
  hangerShape.holes.push(hangerHole);
  const hanger=new THREE.ExtrudeGeometry(hangerShape,{depth:.021,bevelThickness:.006,bevelSize:.005,bevelSegments:2});
  const hook=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
   new THREE.Vector3(.034,-.029,0),new THREE.Vector3(.035,.023,0),new THREE.Vector3(0,.044,0),
   new THREE.Vector3(-.035,.018,0),new THREE.Vector3(-.026,-.025,0),new THREE.Vector3(0,-.064,0),
   new THREE.Vector3(0,-.123,0)
  ]),14,.008,6,false);
  function rack(x,d,length,turn,palette){
   const cos=Math.cos(turn),sin=Math.sin(turn),rail=1.94,half=length/2,bend=.19;
   const at=(u,y)=>new THREE.Vector3(mid+x+cos*u,y,shopFront-d-sin*u);
   const path=new THREE.CurvePath();
   path.add(new THREE.LineCurve3(at(-half,ceiling),at(-half,rail+bend)));
   path.add(new THREE.QuadraticBezierCurve3(at(-half,rail+bend),at(-half,rail),at(-half+bend,rail)));
   path.add(new THREE.LineCurve3(at(-half+bend,rail),at(half-bend,rail)));
   path.add(new THREE.QuadraticBezierCurve3(at(half-bend,rail),at(half,rail),at(half,rail+bend)));
   path.add(new THREE.LineCurve3(at(half,rail+bend),at(half,ceiling)));
   scene.add(new THREE.Mesh(new THREE.TubeGeometry(path,72,.023,8,false),steel));
   const extentX=Math.abs(cos)*half+Math.abs(sin)*.44,extentZ=Math.abs(sin)*half+Math.abs(cos)*.44;
   colliders.push([mid+x-extentX,shopFront-d-extentZ,mid+x+extentX,shopFront-d+extentZ]);
   const spacing=.192,count=Math.floor((length-.61)/spacing);
   for(let i=0;i<count;i++){
    const point=at(-half+.34+i*spacing+((i%4)-1.5)*.012,rail);
    const angle=turn+Math.PI/2+.16+((i%7)-3)*.081;
    const kind=[0,1,0,2,0,3,1,0,2,1,0,3][i%12],color=fabric[palette[i%palette.length]];
    instance(hook,steel,point.x,rail,point.z,1,1,1,0,angle);
    instance(hanger,wood,point.x,rail-.128,point.z,1,1,1,0,angle);
    instance(garments[kind],color,point.x,rail-.239,point.z,.89+(i%5)*.039,.88+(i%4)*.042,1,0,angle);
   }
  }
  rack(-4.47,4.63,6.55,Math.PI/2,[0,8,2,1,4,8,3,2,1,0,5,8]);
  rack(4.48,4.66,6.51,Math.PI/2,[8,4,3,5,2,8,0,4,8,5,3,9]);
  rack(.04,9.57,6.01,0,[0,8,9,4,6,7,2,8,3,6,4,0,5,8,7,0]);

  function roundedBlock(x,d,y,w,l,h,r,material,solid=false){
   const a=w/2,b=l/2,shape=new THREE.Shape();
   shape.moveTo(-a+r,-b);shape.lineTo(a-r,-b);shape.quadraticCurveTo(a,-b,a,-b+r);
   shape.lineTo(a,b-r);shape.quadraticCurveTo(a,b,a-r,b);shape.lineTo(-a+r,b);
   shape.quadraticCurveTo(-a,b,-a,b-r);shape.lineTo(-a,-b+r);shape.quadraticCurveTo(-a,-b,-a+r,-b);
   const bevel=Math.min(.027,h*.19);
   const geometry=new THREE.ExtrudeGeometry(shape,{depth:h-2*bevel,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:8});
   const uv=geometry.attributes.uv;
   for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/1.25,uv.getY(i)/1.25);
   const mesh=new THREE.Mesh(geometry,material);mesh.rotation.x=-Math.PI/2;
   mesh.position.set(mid+x,y+bevel,shopFront-d);scene.add(mesh);
   if(solid)colliders.push([mid+x-a-bevel,shopFront-d-b-bevel,mid+x+a+bevel,shopFront-d+b+bevel]);
  }
  roundedBlock(-.42,4.49,.12,3.49,1.27,.56,.24,islands,true);
  roundedBlock(.98,6.92,.12,3.5,1.36,1.11,.22,islands,true);
  // Отдельная кассовая стойка у входа; за ней оставлен проход для продавца.
  part(-3.65,.12,1.72,-1.45,1.08,2.35,wood,true);
  part(-3.70,1.08,1.68,-1.40,1.15,2.39,mat(0xeee8dc));
  part(-3.62,.15,1.713,-1.48,.23,1.724,steel);
  label('КАССА',mid-2.55,.72,shopFront-1.708,.76,.23,'#9d8370','#f8f0df');
  label('06:00–22:00',mid-2.55,.43,shopFront-1.707,.85,.18,'#9d8370','#f8f0df');
  part(-2.15,1.15,2.03,-1.78,1.18,2.27,steel);
  part(-2.01,1.18,2.10,-1.94,1.38,2.17,steel);
  part(-2.25,1.34,2.13,-1.70,1.68,2.18,steel);
  projection(.49,.27,-1.975,1.51,2.185,new THREE.MeshBasicMaterial({color:0x253b43}),0,Math.PI);
  part(-1.83,1.15,1.82,-1.62,1.22,1.99,steel);
  clothingShop={mid,front:shopFront,counter:{x:mid-2.55,z:shopFront-2.035,height:1.15},stand:[mid-2.55,.12,shopFront-2.93],
   doorway:[mid,shopFront],leaveRoute:[[mid-2.55,shopFront-3.03],[mid-.90,shopFront-3.03],[mid,shopFront-.60],[mid,shopFront+1.30],
    [60.90,shopFront+1.30],[60.90,-10.6],[54.8,-10.6],[54.8,6.85],[14.8,6.85],[14.8,1.05]]};
  for(const [x,d,y,color,count] of [[-1.43,4.62,.68,0,3],[.47,4.44,.68,8,2],[1.8,7.09,1.23,3,3]]){
   for(let i=0;i<count;i++)roundedBlock(x+(i%2)*.025,d,y+i*.047,.46-i*.023,.31-i*.014,.048,.058,fabric[color]);
  }
  part(-.52,.68,4.45,-.36,.83,4.488,mat(0xe9e2d3));

  const planter=new THREE.CylinderGeometry(1,.83,1,24);
  const leaf=new THREE.BufferGeometry();
  leaf.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,-.105,.38,0,0,.44,.052,.105,.38,0,0,1,-.045],3));
  leaf.setIndex([0,1,2,0,2,3,1,4,2,2,4,3]);leaf.computeVertexNormals();
  const leaves=[0x365443,0x4d6548,0x657754].map(color=>new THREE.MeshLambertMaterial({color,side:THREE.DoubleSide}));
  for(const [x,d,h,r] of [[4.39,9.21,1.75,.35],[3.87,9.87,1.14,.27]]){
   const z=shopFront-d;
   instance(planter,base,mid+x,.35,z,r,.46,r);
   instance(roundCylinder,p.soil,mid+x,.582,z,r*.91,.013,r*.91);
   colliders.push([mid+x-r,z-r,mid+x+r,z+r]);
   for(let i=0;i<6;i++){
    const angle=i*2.4,tx=mid+x+Math.cos(angle)*.16,tz=z+Math.sin(angle)*.16,top=.57+h*(.6+i%3*.12);
    rod([mid+x,.57,z],[tx,top,tz],.013,steel);
    for(let j=0;j<5;j++){
     const y=top-(j%3)*.16,turn=angle+j*1.27;
     instance(leaf,leaves[(i+j)%3],tx,y,tz,.93,.38+j%2*.16,1,.53+(j%3)*.3,turn,.07,'YXZ');
    }
   }
  }
 }
 function buildTechShop(shop){
  const mid=(shop.x1+shop.x2)/2,side=(shop.x2-shop.x1)/2-.18,back=shopFront-shop.back-.18,ceiling=3.97;
  const white=mat(0xe0e0dd),silver=mat(0xb8c0c5),charcoal=mat(0x292c30),leather=mat(0x242528);
  const light=new THREE.MeshBasicMaterial({color:0xfff5e2});
  const glass=new THREE.MeshPhongMaterial({color:0xdce8ea,transparent:true,opacity:.13,depthWrite:false});
  const unitFace=new THREE.PlaneGeometry(1,1);
  function part(a,y,d,b,top,end,material,solid=false){
   box(mid+a,y,shopFront-end,mid+b,top,shopFront-d,material,solid);
  }
  function panel(x,y,d,w,h,material,rx=0,ry=0){
   const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);
   mesh.position.set(mid+x,y,shopFront-d);mesh.rotation.set(rx,ry,0);scene.add(mesh);
   return mesh;
  }
  function profile(w,h,r){
   const a=w/2,b=h/2,s=new THREE.Shape();
   s.moveTo(-a+r,-b);s.lineTo(a-r,-b);s.quadraticCurveTo(a,-b,a,-b+r);
   s.lineTo(a,b-r);s.quadraticCurveTo(a,b,a-r,b);s.lineTo(-a+r,b);
   s.quadraticCurveTo(-a,b,-a,b-r);s.lineTo(-a,-b+r);s.quadraticCurveTo(-a,-b,-a+r,-b);s.closePath();
   return s;
  }

  // Графитовая плитка, дерево и перфорированный потолок с трековыми светильниками.
  let textureSeed=78623;
  const textureRandom=()=>{
   textureSeed=(Math.imul(textureSeed,1664525)+1013904223)>>>0;return textureSeed/4294967296;
  };
  function repeatMap(size,repeatX,repeatY,draw){
   const texture=new THREE.CanvasTexture(canvas(size,size,draw));
   texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
   texture.repeat.set(repeatX,repeatY);texture.anisotropy=8;return texture;
  }
  const tile=repeatMap(256,side*2/2.56,back/2.56,(g,w,h)=>{
   for(let row=0;row<4;row++)for(let col=0;col<4;col++){
    g.fillStyle=['#6a6b70','#717277','#696a6f','#6f7074'][(row*5+col*3+row*col)%4];
    g.fillRect(col*64,row*64,64,64);
   }
   for(let i=0;i<8500;i++){
    g.fillStyle=i%2?'#d3d5da10':'#22242c12';
    g.fillRect(textureRandom()*w,textureRandom()*h,1+textureRandom()*6,1+textureRandom()*3);
   }
   g.strokeStyle='#55575d76';g.lineWidth=1;
   for(let t=0;t<w;t+=64){g.strokeRect(t+.5,.5,64,h);g.strokeRect(.5,t+.5,w,64)}
  });
  const ceilingMap=repeatMap(128,side*2/1.08,back/1.08,(g,w,h)=>{
   g.fillStyle='#e7e6e3';g.fillRect(0,0,w,h);
   for(let y=4;y<h;y+=8)for(let x=4;x<w;x+=8){
    g.fillStyle='#999995';g.fillRect(x-1,y-1,3,3);
    g.fillStyle='#f4f2eb';g.fillRect(x-1,y+2,3,1);
   }
   g.strokeStyle='#c6c6c4';g.strokeRect(.5,.5,w-1,h-1);
  });
  const timber=repeatMap(256,1,1,(g,w,h)=>{
   for(let i=0;i<8;i++){
    g.fillStyle=['#8a532d','#a76b3a','#b17b49','#96603b','#a96c3c'][i%5];
    g.fillRect(i*32,0,32,h);
    g.fillStyle='#42251980';g.fillRect(i*32,0,1,h);
   }
   for(let i=0;i<400;i++){
    const x=textureRandom()*w,phase=textureRandom()*6.3;
    g.strokeStyle=i%3?'#eec18b3f':'#4326174b';g.lineWidth=.3+textureRandom()*1.3;
    g.beginPath();g.moveTo(x,0);
    for(let y=8;y<=h;y+=8)g.lineTo(x+1.7*Math.sin(y*.024+phase)+.65*Math.cos(y*.089+phase),y);
    g.stroke();
   }
  });
  const timberWall=new THREE.MeshBasicMaterial({map:timber});
  const timberTop=new THREE.MeshLambertMaterial({color:0xd0c4b9,map:timber});
  panel(0,.121,back/2,side*2,back,new THREE.MeshBasicMaterial({map:tile}),-Math.PI/2);
  panel(0,ceiling,back/2,side*2,back,new THREE.MeshBasicMaterial({map:ceilingMap}),Math.PI/2);
  walkSurfaces.push([mid-side,shop.back+.18,mid+side,shopFront,.12]);
  const plaster=new THREE.MeshBasicMaterial({color:0xe6e6e3});
  panel(0,(ceiling+.12)/2,back-.014,side*2,ceiling-.12,plaster);
  for(const s of [-1,1]){
   panel(s*(side-.014),(ceiling+.12)/2,back/2,back,ceiling-.12,plaster,0,-s*Math.PI/2);
  }
  panel(side-.033,2.045,5.55,7.28,3.85,timberWall,0,-Math.PI/2);
  panel(-side+.033,2.045,7.44,3.37,3.85,timberWall,0,Math.PI/2);
  part(-side,.12,.16,-side+.09,.24,back,charcoal);
  part(side-.09,.12,.16,side,.24,back,charcoal);
  for(const x of [-4.81,0,4.81]){
   part(x-.026,ceiling-.066,1.28,x+.026,ceiling-.037,9.31,silver);
   for(let i=0;i<4;i++){
    const d=1.82+i*2.22,z=shopFront-d,xx=mid+x;
    const dx=x===0?(i%2?.12:-.12):-Math.sign(x)*.15,dz=i===3?-.12:.085;
    rod([xx,ceiling-.055,z],[xx,ceiling-.19,z],.023,silver);
    rod([xx,ceiling-.155,z],[xx+dx,ceiling-.34,z+dz],.071,white);
    rod([xx+dx,ceiling-.34,z+dz],[xx+dx*1.045,ceiling-.348,z+dz*1.045],.061,light);
   }
  }

  // Световые панели используют две композиции с фотографии.
  const bannerMap=new THREE.CanvasTexture(canvas(512,104,(g,w,h)=>{g.fillStyle='#f6f5f0';g.fillRect(0,0,w,h)}));
  const bannerImage=document.createElement('img');
  bannerImage.onload=()=>{bannerMap.image.getContext('2d').drawImage(bannerImage,0,0);bannerMap.needsUpdate=true};
  bannerImage.src='data:image/webp;base64,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';
  const banner=new THREE.MeshBasicMaterial({map:bannerMap});
  for(const [index,x] of [[0,-3.22],[1,3.22]]){
   part(x-1.9,2.86,back-.072,x+1.9,3.91,back-.028,white);
   const mesh=panel(x,3.385,back-.074,3.77,1.025,banner),uv=mesh.geometry.attributes.uv;
   for(let i=0;i<uv.count;i++)uv.setX(i,(index*256+1+uv.getX(i)*254)/512);
  }

  const screens=['aurora','sky','apps','idle'].map(style=>new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas(256,160,(g,w,h)=>{
   const bg=g.createLinearGradient(0,0,w,h);
   const colors={aurora:['#1b2658','#8544a5','#f5a8df'],sky:['#397bc6','#72caff','#dcf2e7'],apps:['#322d50','#273254','#121921'],idle:['#20262d','#59636d','#212831']}[style];
   for(let i=0;i<colors.length;i++)bg.addColorStop(i/2,colors[i]);
   g.fillStyle=bg;g.fillRect(0,0,w,h);
   if(style==='aurora'){
    for(let i=0;i<6;i++){
     g.strokeStyle=i%2?'#ffc1dc59':'#b8eaff73';g.lineWidth=2+i;
     g.beginPath();g.moveTo(0,108+i*4);g.bezierCurveTo(87,114-i*14,179,13+i*8,256,45+i*6);g.stroke();
    }
   }
   if(style==='sky'){
    g.fillStyle='#95c3b8';g.beginPath();g.moveTo(0,127);g.lineTo(83,57);g.lineTo(121,108);g.lineTo(171,60);g.lineTo(256,121);g.lineTo(256,160);g.lineTo(0,160);g.fill();
   }
   if(style==='apps'){
    const colors=['#6ec9a1','#ec9c51','#88a5e8','#df7184','#9d83cc','#82cbd9'];
    for(let row=0;row<4;row++)for(let col=0;col<5;col++){
     const x=31+col*45,y=19+row*32;
     g.fillStyle=colors[(row*3+col)%colors.length];g.fillRect(x,y,16,16);
     g.fillStyle='#ffffffce';g.fillRect(x+5,y+5,6,5);
    }
   }else if(style!=='idle'){
    g.fillStyle='#13284482';g.fillRect(61,138,134,18);
    for(let i=0;i<10;i++){
     g.fillStyle=['#80bdf0','#f7c9aa','#c3dc7d','#e6e7ef','#bd91d6'][i%5];g.fillRect(67+i*13,141,9,10);
    }
   }
  }))}));
  function display(x,y,d,w,h,t,material,screen,tilt=0,turn=0){
   const z=shopFront-d,edge=t/2+.003;
   instance(unitBox,material,mid+x,y,z,w,h,t,tilt,turn,0,'YXZ');
   instance(unitFace,screens[screen],mid+x+Math.sin(turn)*Math.cos(tilt)*edge,y-Math.sin(tilt)*edge,
    z+Math.cos(turn)*Math.cos(tilt)*edge,w*.878,h*.836,1,tilt,turn,0,'YXZ');
  }

  // Сплошная задняя витрина, разбитая на семь стеклянных секций.
  const caseBack=back-.15,caseFront=back-1.22,caseMidY=1.5,caseWidth=12.68;
  const casing=profile(caseWidth,2.50,.28),aperture=new THREE.Path();
  aperture.moveTo(-6.16,-.66);aperture.lineTo(-6.16,1.015);aperture.lineTo(6.16,1.015);
  aperture.lineTo(6.16,-.66);aperture.closePath();casing.holes.push(aperture);
  const surround=new THREE.Mesh(new THREE.ExtrudeGeometry(casing,{depth:caseBack-caseFront,bevelEnabled:false,curveSegments:10}),charcoal);
  surround.position.set(mid,caseMidY,shopFront-caseBack);scene.add(surround);
  colliders.push([mid-caseWidth/2,shopFront-caseBack,mid+caseWidth/2,shopFront-caseFront]);
  part(-6.17,.82,caseBack-.04,6.17,2.52,caseBack+.03,mat(0x95989b));
  part(-6.14,.157,caseFront+.055,6.14,.214,caseFront+.14,light);
  const bayWidth=12.32/7;
  for(let bay=0;bay<7;bay++){
   const a=-6.16+bay*bayWidth,b=a+bayWidth,c=(a+b)/2;
   part(a-.018,.84,caseFront-.011,a+.019,2.52,caseFront+.055,silver);
   panel(c,1.683,caseFront-.016,bayWidth-.042,1.655,glass);
   for(let row=0;row<5;row++){
    const y=.86+row*.323;
    part(a+.018,y-.024,caseFront+.062,b-.021,y,caseBack-.04,silver);
    if((bay+row*2)%3===0){
     for(const offset of [-.4,.32]){
      part(c+offset-.21,y,caseFront+.51,c+offset+.21,y+.028,caseFront+.72,charcoal);
      display(c+offset,y+.119,caseFront+.56,.374,.229,.025,silver,3,-.17);
     }
    }else{
     for(let i=0;i<6;i++){
      const x=a+.18+i*.278,d=caseFront+.53+(i%2)*.071;
      part(x-.064,y,d-.048,x+.064,y+.018,d+.071,i%2?white:silver);
      display(x,y+.098,d,.094,.165,.022,(i+bay)%3?charcoal:white,(i+bay+row)%9===0?2:3,-.13);
     }
    }
   }
  }
  part(6.142,.84,caseFront-.01,6.177,2.52,caseFront+.054,silver);
  part(-6.18,2.478,caseFront+.09,6.18,2.514,caseFront+.14,light);

  const leatherTan=mat(0x6d5848),binding=mat(0xb49c7e),cushion=profile(1,1,.11);
  const padded=new THREE.ExtrudeGeometry(cushion,{depth:.94,bevelSize:.03,bevelThickness:.03,bevelSegments:3,curveSegments:6});
  padded.center();
  const handle=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
   new THREE.Vector3(-.13,0,0),new THREE.Vector3(-.11,.104,0),new THREE.Vector3(0,.142,0),
   new THREE.Vector3(.11,.104,0),new THREE.Vector3(.13,0,0)
  ]),14,.013,7,false);
  function bag(x,y,d,turn,color,trim){
   const z=shopFront-d,normalX=Math.sin(turn),normalZ=Math.cos(turn);
   instance(padded,trim,mid+x,y,z,.63,.48,.152,0,turn);
   instance(padded,color,mid+x+normalX*.035,y,z+normalZ*.035,.606,.451,.154,0,turn);
   instance(handle,trim,mid+x,y+.226,z,1,1,1,0,turn);
  }
  function table(x,d,w,l){
   const a=x-w/2,b=x+w/2;
   part(x-w*.325,.12,d-l*.325,x+w*.325,1.01,d+l*.325,white);
   colliders.push([mid+a,shopFront-d-l/2,mid+b,shopFront-d+l/2]);
   const geometry=new THREE.ExtrudeGeometry(profile(w,l,.145),{depth:.087,bevelThickness:.009,bevelSize:.01,bevelSegments:2});
   const uv=geometry.attributes.uv;
   for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)+w/2)/w,(uv.getY(i)+l/2)/l);
   const top=new THREE.Mesh(geometry,timberTop);top.rotation.x=-Math.PI/2;
   top.position.set(mid+x,1.032,shopFront-d);scene.add(top);
   part(a+.08,1.004,d-l/2+.06,b-.08,1.031,d+l/2-.06,white);
  }
  table(-3.29,4.83,2.6,2.13);
  table(2.87,5.04,3.72,1.55);
  part(-3.69,1.128,4.74,-2.91,1.157,5.14,silver);
  part(-3.415,1.157,4.97,-3.245,1.415,5.073,silver);
  display(-3.32,1.639,5.03,1.17,.717,.064,silver,0,-.09);
  part(-3.69,1.129,4.225,-2.96,1.163,4.493,white);
  part(-2.842,1.131,4.285,-2.706,1.182,4.44,white);
  part(1.39,1.129,4.69,2.45,1.166,5.29,silver);
  part(1.46,1.168,4.824,2.38,1.179,5.249,charcoal);
  const keySilver=mat(0xb6babe),keyGray=mat(0x5c6269);
  for(let row=0;row<4;row++)for(let col=0;col<12;col++){
   const x=-3.651+col*.055,d=4.254+row*.052;
   part(x,1.163,d,x+.043,1.172,d+.038,keySilver);
   const laptopX=1.527+col*.068,laptopD=5.035+row*.045;
   part(laptopX,1.178,laptopD,laptopX+.052,1.188,laptopD+.035,keyGray);
  }
  part(1.779,1.179,4.865,2.066,1.183,5.011,silver);
  display(1.92,1.442,5.268,1.032,.557,.039,silver,1,-.20);
  for(const [x,d,angle] of [[2.99,5.06,-.105],[3.88,4.96,.095]]){
   part(x-.33,1.129,d-.149,x+.33,1.185,d+.159,charcoal);
   display(x,1.38,d,.694,.474,.053,charcoal,2,-.21,angle);
  }
  bag(2.23,.622,4.502,0,leatherTan,binding);
  bag(3.44,.622,4.502,0,charcoal,mat(0x48494b));
  bag(-2.362,.673,4.86,Math.PI/2,leatherTan,binding);

  // Боковая касса, полки с аксессуарами и диван у деревянной стены.
  part(-side,.12,2.48,-5.81,1.071,4.64,white,true);
  part(-side,1.071,2.41,-5.72,1.135,4.71,white);
  part(-6.42,1.135,3.62,-6.12,1.171,3.884,charcoal);
  display(-6.27,1.301,3.835,.221,.286,.046,charcoal,3,-.26);
  for(const y of [1.05,1.59,2.13]){
   part(-side+.033,y-.032,5.88,-side+.54,y,9.05,silver,true);
   for(let i=0;i<7;i++){
    const d=6.09+i*.423;
    display(-side+.287,y+.135,d,.255,.218,.032,i%3?charcoal:white,i%3?3:2,-.18,Math.PI/2);
   }
  }
  bag(-side+.3,.558,6.18,Math.PI/2,leatherTan,binding);
  bag(-side+.3,.558,6.91,Math.PI/2,charcoal,mat(0x48494b));
  for(const [text,y,d] of [['iPod',2.86,3.13],['iPhone',2.2,4.93],['iPad',1.6,6.62]]){
   const map=new THREE.CanvasTexture(canvas(256,72,(g,w,h)=>{
    g.fillStyle='#fcf6e8';g.font='bold 43px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('• '+text,w/2,h/2,w-12);
   }));
   panel(side-.041,y,d,1.91,.53,new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false}),0,-Math.PI/2);
  }
  part(5.82,.12,6.13,side-.052,.48,8.74,charcoal,true);
  for(const d of [6.34,8.53]){
   part(5.88,.12,d-.026,5.944,.29,d+.026,silver);
   part(side-.232,.12,d-.026,side-.172,.29,d+.026,silver);
  }
  instance(padded,leather,mid+6.38,.38,shopFront-7.435,1.08,.355,2.6);
  for(const d of [6.72,7.44,8.16]){
   instance(padded,mat(0x343538),mid+6.303,.534,shopFront-d,.821,.146,.685);
   instance(padded,leather,mid+6.749,.763,shopFront-d,.248,.643,.687,0,0,-.1);
  }
  for(const d of [6.27,8.6])instance(padded,leather,mid+6.372,.62,shopFront-d,1.065,.363,.233);

  const shadeMap=new THREE.CanvasTexture(canvas(128,128,(g,w,h)=>{
   const shade=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
   shade.addColorStop(0,'#14171aa4');shade.addColorStop(.56,'#14171a73');shade.addColorStop(1,'#14171a00');
   g.fillStyle=shade;g.fillRect(0,0,w,h);
  }));
  const shade=new THREE.MeshBasicMaterial({map:shadeMap,transparent:true,depthWrite:false});
  for(const [x,d,w,l] of [[-3.24,4.89,3.33,2.83],[2.93,5.12,4.35,2.45],[0,caseFront+.29,13.3,2.22],[6.2,7.42,1.92,3.34]])
   panel(x,.128,d,w,l,shade,-Math.PI/2);
 }
 for(const shop of marketShops)storefront(shop);
 buildPrintShop();
 buildClothingShop(marketShops[2]);
 buildTechShop(marketShops[3]);
 for(const x of [63.55,70.95,80.28,92.37,107.67]){
  box(x-.265,.12,-12.97,x+.265,.46,-12.38,darkTile,true);
  box(x-.218,.454,-12.92,x+.218,.474,-12.43,p.soil);
  bushAt(x,-12.65,.34);
 }
 for(const x of [68.65,78.04,88.68,101.96])parkBench(x,-12.22,0,1.92);
 for(const [x,z,h] of [[62.4,-3.18,6],[74,-3.25,6.8],[87.7,-3.25,7],[101,-3.25,6.7],[107.8,-27.8,7],
  [farWalk+1.62,-28.5,7],[farWalk+2.17,-1.9,6.6],[farWalk+2.02,13.9,7.6],[farWalk+2.3,24.7,6.9]]){
  box(x-.85,.019,z-.66,x+.85,.121,z+.66,darkTile);
  box(x-.73,.121,z-.55,x+.73,.141,z+.55,p.soil);
  deciduous(x,z,h);
 }
 for(const [x,z,side] of [[112.87,-34,1],[112.87,-24.25,1],[112.87,1.3,1],[112.87,14.3,1],
  [farWalk-.57,-39.5,-1],[farWalk-.57,-23.9,-1],[farWalk-.57,4.6,-1],[farWalk-.57,21.8,-1]]){
  post(x,z,4.64,play.iron,.043);
  rod([x,4.57,z],[x+side*.71,4.82,z],.034,play.iron);
  instance(unitBox,frame,x+side*.82,4.818,z,.26,.088,.22);
  instance(unitBox,p.white,x+side*.82,4.77,z,.207,.012,.165);
  streetLamps.push([x+side*.82,.139,z,7]);
 }
 const stopFrame=mat(0x394c51),stopBand=mat(0x397e81);
 const stopGlass=new THREE.MeshPhongMaterial({color:0x91c4cb,transparent:true,opacity:.22,depthWrite:false,shininess:65});
 const stopIcon=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas(128,128,(g,w,h)=>{
  g.fillStyle='#2674a8';g.fillRect(0,0,w,h);g.fillStyle='#f6f6ef';g.fillRect(10,10,w-20,h-20);
  g.fillStyle='#314e60';g.fillRect(31,28,66,66);g.fillRect(33,88,14,14);g.fillRect(81,88,14,14);
  g.fillStyle='#e2e8e7';g.fillRect(38,39,52,30);g.fillRect(40,77,9,6);g.fillRect(79,77,9,6);
 }))});
 const marketStops=[{front:roadNear-1.38,facing:1},{front:roadFar+1.38,facing:-1}];
 function roadsideShelter({front,facing}){
  const back=front-facing*1.83,angle=facing*Math.PI/2,centerZ=(stopZ1+stopZ2)/2;
  function part(a,b,y1,y2,z1,z2,material,solid=false){
   const x1=front-facing*a,x2=front-facing*b;
   box(Math.min(x1,x2),y1,z1,Math.max(x1,x2),y2,z2,material,solid);
  }
  for(const x of [front,back])for(const z of [stopZ1,stopZ2]){
   box(x-.048,.12,z-.047,x+.048,2.68,z+.047,stopFrame,true);
   box(x-.085,.119,z-.087,x+.085,.179,z+.087,darkTile);
  }
  part(-.28,2.04,2.57,2.76,stopZ1-.21,stopZ2+.21,stopFrame);
  part(-.302,-.21,2.444,2.618,stopZ1-.21,stopZ2+.21,stopBand);
  part(1.817,1.847,.275,2.468,stopZ1,stopZ2,stopGlass,true);
  for(const y of [.74,1.25,1.92])part(1.802,1.82,y,y+.027,stopZ1+.08,stopZ2-.08,metalTrim);
  for(const z of [stopZ1+2.42,stopZ1+4.83])part(1.79,1.864,.24,2.57,z-.027,z+.027,stopFrame);
  for(const z of [stopZ1,stopZ2])part(.58,1.82,.23,2.46,z-.016,z+.016,stopGlass,true);
  for(const z of [stopZ1+1.22,stopZ2-1.23])part(1.27,1.67,.12,.525,z-.041,z+.041,stopFrame);
  for(let i=0;i<4;i++)part(1.11+i*.131,1.221+i*.131,.492,.563,stopZ1+.64,stopZ2-.64,p.wood,true);
  for(const y of [.75,.884])part(1.64,1.73,y,y+.102,stopZ1+.64,stopZ2-.64,p.wood);
  label('ОСТАНОВКА',front+facing*.308,2.531,centerZ,2.42,.143,'#356b70','#eef1e9',angle);
  label('ТОРГОВАЯ УЛИЦА',front-facing*1.798,1.982,centerZ,2.56,.285,'#3d626a','#f0f3ee',angle);
  const signX=front+facing*.12,signZ=stopZ2+.51;
  box(signX-.041,.12,signZ-.04,signX+.041,2.4,signZ+.04,stopFrame,true);
  box(signX-.042,1.915,signZ-.295,signX+.042,2.5,signZ+.295,stopBand);
  for(const side of [-1,1]){
   const face=new THREE.Mesh(new THREE.PlaneGeometry(.55,.55),stopIcon);
   face.position.set(signX+side*.045,2.207,signZ);face.rotation.y=side*Math.PI/2;scene.add(face);
  }
 }
 for(const stop of marketStops)roadsideShelter(stop);
 const crossingMark=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas(128,128,(g,w,h)=>{
  g.fillStyle='#d5e17a';g.fillRect(0,0,w,h);g.fillStyle='#2673a6';g.fillRect(7,7,114,114);
  g.fillStyle='#f7f7ec';g.beginPath();g.moveTo(64,18);g.lineTo(108,106);g.lineTo(20,106);g.closePath();g.fill();
  g.fillStyle='#293039';g.beginPath();g.arc(68,47,6,0,Math.PI*2);g.fill();
  g.strokeStyle='#293039';g.lineWidth=5;g.lineCap='round';g.beginPath();
  g.moveTo(48,74);g.lineTo(63,58);g.lineTo(73,67);g.lineTo(82,71);
  g.moveTo(63,58);g.lineTo(60,78);g.lineTo(51,94);g.moveTo(60,78);g.lineTo(75,93);g.stroke();
 }))});
 for(const [x,z] of [[roadNear-.22,crossZ1-.49],[roadFar+.50,crossZ2+.48]]){
  box(x-.034,.12,z-.033,x+.034,2.53,z+.033,stopFrame,true);
  for(const side of [-1,1]){
   const face=new THREE.Mesh(new THREE.PlaneGeometry(.49,.49),crossingMark);
   face.position.set(x,2.31,z+side*.038);face.rotation.y=side>0?0:Math.PI;scene.add(face);
  }
 }
 const boundaryPanel=mat(0x727e73),boundaryPost=mat(0x4a5952);
 const yardFence={startX:marketGate.x+.11,startZ:11.02,turnZ:18,outerX:60.6,wallZ:57.06,wallX:56};
 function marketFence(x1,z1,x2,z2,height=1.58){
  const length=Math.hypot(x2-x1,z2-z1),n=Math.ceil(length/2.55);
  const a=Math.min(x1,x2),b=Math.max(x1,x2),c=Math.min(z1,z2),d=Math.max(z1,z2);
  box(a-.037,.12,c-.037,b+.037,height,d+.037,boundaryPanel,true);
  for(const y of [.24,height-.025])box(a-.052,y-.016,c-.052,b+.052,y+.017,d+.052,boundaryPost);
  for(let i=0;i<=n;i++){
   const x=x1+(x2-x1)*i/n,z=z1+(z2-z1)*i/n;
   box(x-.059,.04,z-.059,x+.059,height+.066,z+.059,boundaryPost);
  }
 }
 // Продлеваем забор за деревьями от парковки до соседнего дома и закрываем щель у торца.
 marketFence(yardFence.startX,yardFence.startZ,yardFence.startX,yardFence.turnZ);
 marketFence(yardFence.startX,yardFence.turnZ,yardFence.outerX,yardFence.turnZ);
 marketFence(yardFence.outerX,yardFence.turnZ,yardFence.outerX,yardFence.wallZ);
 marketFence(yardFence.outerX,yardFence.wallZ,yardFence.wallX,yardFence.wallZ);
 marketFence(37.56,-16.04,37.56,-11.98,1.8);
 marketFence(37.56,-11.98,37,-11.98,1.8);
 // Закрываем дворовые полосы за магазинами, сохраняя доступ к витринам и остановкам.
 marketFence(57.11,marketSouth,112.25,marketSouth);
 marketFence(yardFence.startX,yardFence.startZ,63.61,yardFence.startZ);
 marketFence(62.4,-27.37,112.25,-27.37);
 marketFence(112.25,-27.37,112.25,shopFront);
 marketFence(marketShops[marketShops.length-1].x2,shopFront,112.25,shopFront);
 for(let i=1;i<marketShops.length;i++)
  marketFence(marketShops[i-1].x2,shopFront-.018,marketShops[i].x1,shopFront-.018);
 marketFence(farWalk+.078,-43,farWalk+.078,27);
 for(const z of [-43,27]){
  marketFence(112.25,z,roadNear-.11,z,1.14);
  marketFence(roadFar+.1,z,farWalk+.078,z,1.14);
 }
 for(const x of [65,73.5,82,91,100.3,108.2]){
  deciduous(x,-31.4,6.2+(x%3)*.42);
  bushAt(x+1.65,-28.26,.65);
 }
 for(const x of [65.5,81.2,95.7,109.6])bushAt(x,-.85,.68);
 for(const z of [-39,-32,-25,-18,-11,-4,4,11,18,25])bushAt(farWalk+.88,z,.67);
 // Небольшая площадка для контейнеров в кармане у торца старого забора.
 marketFence(binCourt.x1,-19,binCourt.x1,binCourt.z1);
 marketFence(binCourt.x1,binCourt.z1,binCourt.x2,binCourt.z1);
 marketFence(binCourt.x2,binCourt.z1,binCourt.x2,marketShops[0].back);
 marketWalk(57.53,-25.3,61.97,-20.45);
 marketWalk(58.73,-20.45,61.96,-14.63);
 const dumpsterLid=mat(0x414a45),dumpsterWheel=mat(0x303530);
 function dumpster(x,z,color){
  const body=mat(color),w=.525,d=.416;
  box(x-w,.248,z-d,x+w,1.151,z+d,body,true);
  box(x-w-.037,1.097,z-d-.028,x+w+.037,1.162,z+d+.028,dumpsterLid);
  box(x-w+.016,1.158,z-d+.017,x+w-.016,1.202,z+d-.017,dumpsterLid);
  for(const a of [-.31,-.155,0,.155,.31])box(x+a-.011,1.201,z-d+.078,x+a+.011,1.224,z+d-.075,metalTrim);
  for(const a of [-.397,.397])for(const b of [-.283,.283]){
   box(x+a-.028,.202,z+b-.034,x+a+.028,.309,z+b+.034,frame);
   instance(unitCylinder,dumpsterWheel,x+a,.21,z+b,.077,.046,.077,0,0,Math.PI/2);
  }
  for(const a of [-.31,0,.31])box(x+a-.014,.335,z+d-.007,x+a+.014,1.091,z+d+.022,body);
  rod([x-.34,1.181,z+d+.05],[x+.34,1.181,z+d+.05],.019,metalTrim);
  label('♻',x,.736,z+d+.026,.22,.23,'#374941','#e9ecdf',0);
 }
 for(const [x,color] of [[58.37,0x4d6b47],[59.76,0x496472],[61.15,0x666a61]])dumpster(x,-24.17,color);
 label('КОНТЕЙНЕРЫ',59.76,1.36,binCourt.z1+.061,1.13,.21,'#49574e','#eff0e4',0);
 // Мягкая контактная тень под домом и балконами, без тяжёлых карт теней.
 const shade=new THREE.CanvasTexture(canvas(64,64,g=>{const a=g.createLinearGradient(0,0,0,64);a.addColorStop(0,'rgba(36,35,29,.34)');a.addColorStop(1,'rgba(36,35,29,0)');g.fillStyle=a;g.fillRect(0,0,64,64)}));
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(74,2.8),new THREE.MeshBasicMaterial({map:shade,transparent:true,depthWrite:false}));
 shadow.rotation.x=-Math.PI/2;shadow.position.set(0,.14,1.4);scene.add(shadow);
 function contains(x,z){
  const yardEdge=z<yardFence.turnZ?yardFence.startX:z<yardFence.wallZ?yardFence.outerX:yardFence.wallX;
  return (x>=-63.65&&x<=yardEdge&&z>=-30.65&&z<=82.65)||
   (x>=marketGate.x&&x<=112.25&&z>=shopFront&&z<=marketSouth)||
   !!interiorShopAt(x,z)||
   (x>=binCourt.x1&&x<=binCourt.x2&&z>=binCourt.z1&&z<=binCourt.z2)||
   (x>=112.25&&x<=farWalk&&z>=-43&&z<=27);
 }
 function streetZone(x,z){
  const shop=interiorShopAt(x,z);
  if(shop)return shop.interior;
  if(z>=crossZ1&&z<=crossZ2&&x>=roadNear-.7&&x<=roadFar+.7)return 'Пешеходный переход';
  if(z>=stopZ1-.25&&z<=stopZ2+.82&&((x>=112.25&&x<roadNear)||(x>roadFar&&x<=farWalk)))
   return 'Автобусная остановка';
  if(x>=roadNear&&x<=roadFar)return 'Дорога у магазинов';
  if(x>=marketGate.x&&x<roadNear&&z>=-9.05&&z<=-5.33)return 'Проезд к магазинам';
  if(x>=marketGate.x&&x<roadNear&&z>=shopFront&&z<=-9.05)return 'Торговая улица';
  return x>=63.65?'Торговая улица':null;
 }
 // Финальная сборка: один draw call на материал/геометрию вместо тысяч отдельных объектов.
 for(const {geo,material,transforms} of batches.values()){
  const mesh=new THREE.InstancedMesh(geo,material,transforms.length);
  transforms.forEach((t,i)=>mesh.setMatrixAt(i,t));mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;scene.add(mesh);
 }
 for(const [color,positions] of lines){
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  scene.add(new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color})));
 }
 scene.userData={entrances:5,floors:5,parkingSpaces:4,balconies:40,footballGoals:2,
  playground:['slide','playTower','swings','restoredSwings','springRiders','seesaw','carousel','sandbox','fitnessMachines','workout','pergola'],
  courtyardReference:{entrance:5,viewDirection:'+Z',childrenSide:'+X',footballSide:'-X'},fitnessMachines:3,trees,benches,
  market:{...market,gate:marketGate,binCourt,roadMin,roadMax,shops:marketShops.map(({title,x1,x2})=>({title,x1,x2,front:shopFront})),stops:marketStops}};
 function walkGroundAt(x,z,feet){
  let level=x>=5&&x<=51&&z>=21&&z<=51?.145:0;
  if(Math.hypot(x-merryX,z-merryZ)<=merryRadius)level=merryDeck;
  const co=Math.cos(carousel.theta),si=Math.sin(carousel.theta),dx=x-merryX,dz=z-merryZ,mx=co*dx-si*dz,mz=si*dx+co*dz;
  if(Math.abs(mx)<=.55&&mz>=-2.045&&mz<=-1.57)level=Math.max(level,.269);
  for(const [x1,z1,x2,z2,height] of walkSurfaces){
   if(x>=x1-.00001&&x<=x2+.00001&&z>=z1-.00001&&z<=z2+.00001)
    level=Math.max(level,typeof height==='number'?height:height(x,z));
  }
  return feet===null||Math.abs(feet-level)<=.24?level:null;
 }
 function ensureClothingSeller(){if(!clothingSeller&&typeof buildClothingSeller==='function')clothingSeller=buildClothingSeller(scene,clothingShop,world);return clothingSeller;}
 const world={name:'Дом',scene,colliders,contains,walkGroundAt,streetZone,streetLamps,playground,clothingShop,
  get clothingSeller(){return ensureClothingSeller()},
  update(dt,player){playground.update(dt);ensureClothingSeller()?.update(clockElapsedMs,player);},
  updateCharacters(player,sync=false){playground.resume();ensureClothingSeller()?.update(clockElapsedMs,player,sync);},pauseMedia:()=>playground.pause(),
  dynamicHit:(x,z,feet=0)=>Math.hypot(x-merryX,z-merryZ)<wheelRadius+.376||playground.blocks(x,z,feet)||Boolean(clothingSeller?.blocks(x,z,feet)),
  flyHit:(x,_y,z)=>!contains(x,z)&&!(x>=marketGate.x&&x<=farWalk+1.8&&z>=-32&&z<=marketSouth),
  spawn:[29.6,1.7,7.8],yaw:Math.PI,pitch:-.025,state:null};
 playground.setWorld(world);scene.userData.interactivePlayground=playground.units.map(({id,kind})=>({id,kind}));return world;
}
