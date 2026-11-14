function buildEntranceInterior(){
 const scene=new THREE.Scene(),colliders=[],surfaces=[],batches=new Map(),interactionObjects=[];
 scene.background=new THREE.Color(0x2b2930);
 scene.add(new THREE.AmbientLight(0xf2eee8,.62));
 const daylight=new THREE.DirectionalLight(0xd6e2f5,.42);daylight.position.set(-2,16,-12);scene.add(daylight);
 const canvas=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'));return c};
 let seed=421;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const plaster=new THREE.CanvasTexture(canvas(128,128,g=>{
  g.fillStyle='#ededed';g.fillRect(0,0,128,128);
  for(let i=0;i<3600;i++){const v=216+Math.floor(rnd()*37);g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(rnd()*128,rnd()*128,1,2+rnd()*4)}
 }));plaster.wrapS=plaster.wrapT=THREE.RepeatWrapping;plaster.repeat.set(2,2);
 const floorMap=new THREE.CanvasTexture(canvas(256,256,g=>{
  g.fillStyle='#8c8986';g.fillRect(0,0,256,256);
  for(let i=0;i<3800;i++){g.fillStyle=i%2?'#aaa59c':'#747375';g.fillRect(rnd()*256,rnd()*256,1+rnd()*3,1+rnd()*2)}
  g.strokeStyle='#727175';g.lineWidth=2;for(let x=0;x<257;x+=64){g.beginPath();g.moveTo(x,0);g.lineTo(x,256);g.moveTo(0,x);g.lineTo(256,x);g.stroke()}
 }));floorMap.wrapS=floorMap.wrapT=THREE.RepeatWrapping;
 const material=(color,map=null)=>new THREE.MeshLambertMaterial({color,map,side:THREE.DoubleSide});
 const p={white:material(0xf0ece5,plaster),purple:material(0xa18ab8,plaster),darkPurple:material(0x665372),
  steps:material(0xb4abb9),riser:material(0x8f829e),floor:material(0xc8c4bd,floorMap),
  rail:material(0x665075),hand:material(0x57475e),frame:material(0xdddeda),glass:material(0x9aa9b0),
  dark:material(0x333235),door:material(0x574940),brown:material(0x716050),iron:material(0x8c8d88),
  yellow:material(0xd6b74d),scuff:material(0x85778e)};
 const windowSlots=[...Array.from({length:4},(_,floor)=>({y:2.7+floor*3,height:1.25,open:floor===3})),{y:14.25,height:.8,open:false}];
 const doorDesigns=[
  {id:'honey-panels',color:0x996b47,wood:true}, {id:'blue-steel',color:0x46616f},
  {id:'walnut-panels',color:0x4e3930,wood:true}, {id:'burgundy-diamonds',color:0x733c49},
  {id:'sage-slats',color:0x72806b}, {id:'graphite-lines',color:0x34393d},
  {id:'ivory-moulding',color:0xd7d0bb}, {id:'oak-squares',color:0xb89b6c,wood:true},
  {id:'navy-chevron',color:0x283f56}, {id:'sandstone-blocks',color:0x998d7e}
 ];
 const apartmentDoors=[],stairWindows=[],brass=material(0xbca16b),knocker=new THREE.TorusGeometry(.045,.006,6,16),buttonGeo=new THREE.SphereGeometry(1,8,6);
 const boxGeo=new THREE.BoxGeometry(1,1,1),mappedBoxes=new Map(),rodGeo=new THREE.CylinderGeometry(1,1,1,8),
  transform=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),s=new THREE.Vector3(),e=new THREE.Euler();
 function add(geo,mt,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){
  if(geo===boxGeo&&mt.map){
   const factor=mt.map===floorMap ? .5 : 1,key=[sx,sy,sz,factor].map(n=>n.toFixed(4)).join(':');
   if(!mappedBoxes.has(key)){
    const g=boxGeo.clone(),uv=g.attributes.uv,faces=[[sz,sy],[sz,sy],[sx,sz],[sx,sz],[sx,sy],[sx,sy]];
    faces.forEach(([w,h],f)=>{for(let i=f*4;i<f*4+4;i++)uv.setXY(i,uv.getX(i)*w*factor,uv.getY(i)*h*factor)});
    mappedBoxes.set(key,g);
   }
   geo=mappedBoxes.get(key);
  }
  const key=geo.uuid+':'+mt.id;if(!batches.has(key))batches.set(key,{geo,mt,list:[]});
  q.setFromEuler(e.set(rx,ry,rz));transform.compose(v.set(x,y,z),q,s.set(sx,sy,sz));batches.get(key).list.push(transform.clone());
 }
 function box(x1,y1,z1,x2,y2,z2,mt,solid=false){
  add(boxGeo,mt,(x1+x2)/2,(y1+y2)/2,(z1+z2)/2,x2-x1,y2-y1,z2-z1);
  if(solid)colliders.push([x1,z1,x2,z2,y1,y2]);
 }
 function rod(a,b,r,mt){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
  q.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());
  transform.compose(start.add(end).multiplyScalar(.5),q,s.set(r,delta.length(),r));
  const key=rodGeo.uuid+':'+mt.id;if(!batches.has(key))batches.set(key,{geo:rodGeo,mt,list:[]});batches.get(key).list.push(transform.clone());
 }
 function floor(x1,z1,x2,z2,y){box(x1,y-.17,z1,x2,y-.03,z2,p.white);box(x1,y-.03,z1,x2,y,z2,p.floor);surfaces.push([x1,z1,x2,z2,y])}
 function backWallBand(low,high,mt,z0=-4.85,z1=-4.65){
  box(-3,low,z0,-1.27,high,z1,mt);box(1.27,low,z0,3,high,z1,mt);
  let cursor=low;
  for(const window of windowSlots){
   const bottom=window.y-window.height/2-.025,top=window.y+window.height/2+.025;
   if(top<=cursor||bottom>=high)continue;
   if(bottom>cursor)box(-1.27,cursor,z0,1.27,Math.min(bottom,high),z1,mt);
   cursor=Math.max(cursor,Math.min(top,high));
  }
  if(cursor<high)box(-1.27,cursor,z0,1.27,high,z1,mt);
 }
 function sign(text,x,y,z,w=.8,h=.26,ry=0,bg='#e2dfd4',fg='#55465c'){
  const map=new THREE.CanvasTexture(canvas(256,96,g=>{g.fillStyle=bg;g.fillRect(0,0,256,96);g.fillStyle=fg;g.font='bold 40px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,128,49,242)}));
  const ink=material(0xffffff,map);ink.side=THREE.FrontSide;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),ink);mesh.position.set(x,y,z);mesh.rotation.y=ry;scene.add(mesh);return mesh;
 }
 function purpleSlope(x,z0,z1,y0,y1){
  const verts=[x,y0-.1,z0,x,y1-.1,z1,x,y1+1.35,z1,x,y0-.1,z0,x,y1+1.35,z1,x,y0+1.35,z0];
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,3,0,3,1,0,0,3,1,0,1],2));geo.computeVertexNormals();
  scene.add(new THREE.Mesh(geo,p.purple));
 }
 // Непрерывные стены и настоящие площадки; в центре остаётся лестничный колодец.
 box(-3.2,-.2,-4.85,-3,15.1,2.85,p.white,true);box(3,-.2,-4.85,3.2,15.1,2.85,p.white,true);
 backWallBand(-.2,15.1,p.white);colliders.push([-3,-4.85,3,-4.65,-.2,15.1]);box(-3,14.92,-4.65,3,15.12,2.85,p.white);
 box(-3,-.3,-4.65,3,-.18,0,p.floor);
 // Нижняя ниша под обратным маршем имеет настоящий пол и закрытый низкий торец.
 floor(.85,-2.18,2.65,0,0);box(.85,0,-2.24,2.65,1.70,-2.18,p.white,true);box(.85,0,-2.17,2.65,1.35,-2.155,p.purple);
 function apartmentDoor(f,side){
  const index=f*2+(side<0?0:1),design=doorDesigns[index],number=31+index,y=f*3,x=side*2.94,z=1.32,ry=side<0?Math.PI/2:-Math.PI/2;
  const surface=new THREE.CanvasTexture(canvas(256,512,g=>{
   g.fillStyle='#'+design.color.toString(16).padStart(6,'0');g.fillRect(0,0,256,512);
   for(let i=0;i<(design.wood?520:1400);i++){
    g.strokeStyle=i%2?'#ffffff16':'#00000012';g.fillStyle=g.strokeStyle;
    if(design.wood){const u=rnd()*256;g.beginPath();g.moveTo(u,0);g.bezierCurveTo(u+8,180,u-8,330,u,512);g.stroke();}
    else g.fillRect(rnd()*256,rnd()*512,1,1);
   }
  }));surface.wrapS=surface.wrapT=THREE.RepeatWrapping;
  const mt=new THREE.MeshPhongMaterial({color:design.color,map:surface,shininess:design.wood?16:36,specular:design.wood?0x3c3025:0x65717b});
  // The diffuse map already contains the finish color.
  mt.color.set(0xffffff);mt.userData.finishColor=design.color;
  const detail=material(new THREE.Color(design.color).multiplyScalar(design.wood?1.12:.82)),hardware=index%3===0?brass:p.iron;
  add(boxGeo,p.dark,x,y+1.08,z,.09,2.16,1.03);
  const leaf=new THREE.Mesh(new THREE.BoxGeometry(.045,2.03,.9),mt);leaf.position.set(x-side*.055,y+1.04,z);leaf.name=f===1&&side===-1?APARTMENT_DOOR.id:'entrance-apartment-'+number;scene.add(leaf);
  if(leaf.name===APARTMENT_DOOR.id)interactionObjects.push(leaf);
  let panels=0;
  const part=(u,yy,w,h,depth=.018,mat=detail)=>add(boxGeo,mat,x-side*(.082+depth/2),y+yy,z+u,depth,h,w);
  const panel=(u,yy,w,h)=>{part(u,yy,w,h);for(const edge of [-1,1]){part(u+edge*w/2,yy,.018,h+.02,.025,p.frame);part(u,yy+edge*h/2,w,.018,.025,p.frame);}panels++;};
  if(index===0)for(const yy of [.4,.99,1.58])panel(0,yy,.67,.42);
  if(index===1)for(const yy of [.38,.78,1.18,1.58]){part(0,yy,.72,.018,.01,p.iron);panels++;}
  if(index===2){panel(0,.60,.65,.72);panel(0,1.46,.65,.62);}
  if(index===3){
   for(const yy of [.45,.85,1.25,1.65])for(const u of [-.23,0,.23])add(buttonGeo,brass,x-side*.115,y+yy,z+u,.009,.012,.012);
   for(const u of [-.32,-.1,.12])for(const yy of [.34,.78,1.22]){rod([x-side*.10,y+yy,z+u],[x-side*.10,y+yy+.40,z+u+.20],.0035,detail);rod([x-side*.10,y+yy+.40,z+u],[x-side*.10,y+yy,z+u+.20],.0035,detail);}panels=9;
  }
  if(index===4)for(let i=0;i<6;i++){part(0,.27+i*.28,.73,.21,.022);panels++;}
  if(index===5)for(const u of [-.29,-.11,.11,.29]){part(u,1.05,.025,1.66,.015,p.iron);panels++;}
  if(index===6){panel(0,.62,.66,.76);panel(0,1.49,.66,.62);part(0,1.06,.56,.025,.029,p.white);}
  if(index===7)for(const u of [-.19,.19])for(const yy of [.42,.99,1.56])panel(u,yy,.29,.40);
  if(index===8)for(const yy of [.60,1.12,1.64]){rod([x-side*.10,y+yy-.17,z-.30],[x-side*.10,y+yy,z],.009,brass);rod([x-side*.10,y+yy,z],[x-side*.10,y+yy-.17,z+.30],.009,brass);panels++;}
  if(index===9){for(const yy of [.41,1.08,1.73]){part(0,yy,.70,.035,.025,p.iron);panels++;}part(-.24,1.08,.055,1.58,.022,p.dark);}
  const handle=index%2?-.28:.28;part(handle,.95,.15,.05,.048,hardware);
  add(rodGeo,hardware,x-side*.125,y+1.52,z,.026,.035,.026,0,0,Math.PI/2);add(rodGeo,p.dark,x-side*.148,y+1.52,z,.013,.012,.013,0,0,Math.PI/2);
  if(index===0||index===3||index===8)add(knocker,hardware,x-side*.13,y+1.23,z,1,1,1,0,ry);
  if(index===4||index===7)part(0,.45,.29,.055,.027,p.dark);
  const light=index===6||index===7||index===9;
  sign(String(number),x-side*.15,y+1.84,z,.24,.15,ry,light?'#ece7d9':'#292d30',light?'#343437':'#efdfae');
  apartmentDoors.push({number,floor:f+1,side,style:design.id,leaf,panels,color:design.color});
 }
 for(let f=0;f<5;f++){
  const y=f*3;
  floor(-3,0,3,2.65,y);
  for(const x of [-2.988,2.988])purpleSlope(x,0,2.65,y,y);
  backWallBand(y,y+1.35,p.purple,-4.64,-4.61);
  if(f===0){
   box(-3,y,2.65,-1.12,y+2.9,2.85,p.white,true);box(1.12,y,2.65,3,y+2.9,2.85,p.white,true);
   box(-1.12,2.32,2.65,1.12,2.9,2.85,p.white,true);
   box(-3,0,2.61,-1.12,1.35,2.65,p.purple);box(1.12,0,2.61,3,1.35,2.65,p.purple);
  }else{
   box(-3,y,2.65,3,y+2.9,2.85,p.white,true);box(-3,y,2.61,3,y+1.35,2.65,p.purple);
  }
  const floorSign=sign((f+1)+' ЭТАЖ',0,y+(f===0?2.58:2.24),2.595,1.05,.32,Math.PI);floorSign.name='entrance-floor-sign-'+(f+1);
  // По две квартиры на этаж: четвёртый подъезд продолжает нумерацию 31–40.
  for(const side of [-1,1])apartmentDoor(f,side);
  box(-2.98,y+1.35,.18,-2.85,y+2.05,.7,p.iron);
  box(-2.84,y+1.43,.25,-2.825,y+1.75,.52,p.dark);
  rod([-2.91,y+2.06,.45],[-2.91,y+2.8,.45],.018,p.iron);
  // Светильник на потолке над площадкой.
  box(-.25,y+2.75,1.03,.25,y+2.82,1.57,p.iron);
  add(boxGeo,new THREE.MeshBasicMaterial({color:0xf4e9cb}),0,y+2.725,1.3,.36,.04,.42);
  const lamp=new THREE.PointLight(0xffe8c5,.25,6,2);lamp.position.set(0,y+2.55,1.1);scene.add(lamp);
  // Ограждение проёма перед площадкой; вход на оба марша остаётся свободным.
  colliders.push([-.85,-.045,.85,.045,y+.08,y+1.02]);
  box(-.85,y,.0,.85,y+.12,.07,p.riser);
  rod([-.85,y+1.03,0],[.85,y+1.03,0],.04,p.hand);
  for(let x=-.8;x<=.85;x+=.2)rod([x,y+.12,0],[x,y+1.02,0],.018,p.rail);
  if(f===4){
   // На последнем этаже нет следующего левого марша: закрываем весь его край.
   box(-2.98,y,-.015,-.85,y+.12,.07,p.riser);rod([-2.98,y+1.03,.02],[-.85,y+1.03,.02],.04,p.hand);
   for(let x=-2.92;x<-.84;x+=.18)rod([x,y+.12,.02],[x,y+1.02,.02],.018,p.rail);
   colliders.push([-2.98,-.035,-.85,.075,y,y+1.06]);
  }
  if(f<4){
   floor(-3,-4.65,3,-3,y+1.5);
   backWallBand(y+1.5,y+2.85,p.purple,-4.61,-4.58);
   purpleSlope(-2.989,0,-3,y,y+1.5);purpleSlope(2.989,-3,0,y+1.5,y+3);
   for(let i=0;i<10;i++){
    const z0=-(i+1)*.3,z1=-i*.3,h=y+(i+1)*.15;
    box(-2.65,h-.17,z0,-.85,h,z1,p.riser);box(-2.65,h-.035,z0,-.85,h,z1,p.steps);
    surfaces.push([-2.65,z0,-.85,z1,h]);
    const rz0=-3+i*.3,rz1=rz0+.3,rh=y+1.5+(i+1)*.15;
    box(.85,rh-.17,rz0,2.65,rh,rz1,p.riser);box(.85,rh-.035,rz0,2.65,rh,rz1,p.steps);
    surfaces.push([.85,rz0,2.65,rz1,rh]);
    // Линия носика ступени хорошо видна в приглушённом освещении.
    box(-2.65,h-.01,z1-.025,-.85,h+.003,z1,p.scuff);
    box(.85,rh-.01,rz0,2.65,rh+.003,rz0+.025,p.scuff);
   }
   const angle=Math.atan2(1.5,3),length=Math.hypot(1.5,3);
   add(boxGeo,p.white,-1.75,y+.56,-1.5,1.8,.18,length,angle);
   add(boxGeo,p.white,1.75,y+2.06,-1.5,1.8,.18,length,-angle);
   for(const [x,a,b] of [[-.8,y,y+1.5],[.8,y+3,y+1.5]]){
    rod([x,a+1,0],[x,b+1,-3],.045,p.hand);
    rod([x,a+.16,0],[x,b+.16,-3],.025,p.rail);
    for(let i=0;i<=10;i++){
     const t=i/10,h=a+(b-a)*t;rod([x,h+.06,-3*t],[x,h+1,-3*t],.018,p.rail);
    }
    colliders.push([x-.035,-3,x+.035,0,Math.min(a,b),Math.max(a,b)+1.05]);
   }
   rod([-.85,y+2.52,-3],[.85,y+2.52,-3],.04,p.hand);
   for(let x=-.8;x<.86;x+=.2)rod([x,y+1.56,-3],[x,y+2.52,-3],.018,p.rail);
   colliders.push([-.85,-3.045,.85,-2.955,y+1.5,y+2.55]);
  }
 }
 // Белые окна на разворотных площадках; у верхнего окна правая створка приоткрыта.
 const windowView=new THREE.CanvasTexture(canvas(256,256,g=>{
  const sky=g.createLinearGradient(0,0,0,256);sky.addColorStop(0,'#8da6bd');sky.addColorStop(1,'#c3c9ba');g.fillStyle=sky;g.fillRect(0,0,256,256);
  g.fillStyle='#7b877b';g.fillRect(0,194,256,62);g.fillStyle='#77868b';g.fillRect(136,126,120,73);
  for(let i=0;i<12;i++){g.fillStyle=i%2?'#899f8a':'#607763';g.beginPath();g.ellipse(rnd()*256,189-rnd()*25,12+rnd()*28,27+rnd()*35,0,0,Math.PI*2);g.fill();}
 }));const viewMaterial=material(0xffffff,windowView),glassMaterial=new THREE.MeshPhongMaterial({color:0xb5c7ce,transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide,shininess:54});
 function stairWindow(y,h=1.25,open=false){
  const group=new THREE.Group();group.name='entrance-window-'+(stairWindows.length+1);scene.add(group);
  const view=new THREE.Mesh(new THREE.PlaneGeometry(2.46,h),viewMaterial);view.position.set(0,y,-4.87);group.add(view);
  for(const x of [-1.27,1.27])box(x-.04,y-h/2-.08,-4.67,x+.04,y+h/2+.08,-4.42,p.dark);
  for(const yy of [y-h/2-.04,y+h/2+.04])box(-1.23,yy-.04,-4.67,1.23,yy+.04,-4.42,p.dark);
  let fixedPanes=0;
  for(const x of open?[-.62]:[-.62,.62]){const pane=new THREE.Mesh(new THREE.BoxGeometry(1.18,h-.04,.022),glassMaterial);pane.position.set(x,y,-4.405);group.add(pane);fixedPanes++;}
  for(const x of [-1.29,0,1.29])box(x-.038,y-h/2-.07,-4.43,x+.038,y+h/2+.07,-4.35,p.frame);
  for(const yy of [y-h/2,y+h/2])box(-1.29,yy-.035,-4.43,1.29,yy+.035,-4.35,p.frame);
  box(-1.43,y-h/2-.13,-4.6,1.43,y-h/2-.06,-4.19,p.frame);
  if(open){
   const wing=new THREE.Group(),glass=new THREE.Mesh(new THREE.BoxGeometry(1.1,h-.08,.025),glassMaterial);
   glass.position.x=-.55;wing.add(glass);
   for(const [x,yy,w,hh] of [[0,0,.045,h],[-1.1,0,.045,h],[-.55,-h/2,1.1,.045],[-.55,h/2,1.1,.045]]){
    const frame=new THREE.Mesh(new THREE.BoxGeometry(w,hh,.05),p.frame);frame.position.set(x,yy,0);wing.add(frame);
   }
   wing.position.set(1.22,y,-4.31);wing.rotation.y=.75;group.add(wing);
  }
  stairWindows.push({group,open,fixedPanes,openingClear:!open||fixedPanes===1});
 }
 for(const window of windowSlots)stairWindow(window.y,window.height,window.open);
 // Небольшая записка на пятом этаже — точное присланное изображение, без растяжения.
 const memeImage=new Image(),memeMap=new THREE.Texture(memeImage);memeMap.anisotropy=4;memeImage.onload=()=>{memeMap.needsUpdate=true};memeImage.src=entranceEasterEggImage;
 const memeWidth=.78,memeHeight=memeWidth*320/398,meme=new THREE.Mesh(new THREE.PlaneGeometry(memeWidth,memeHeight),new THREE.MeshBasicMaterial({map:memeMap}));
 meme.name='fifth-floor-spongebob-easter-egg';meme.position.set(1.65,13.45,2.59);meme.rotation.y=Math.PI;scene.add(meme);
 box(1.65-memeWidth/2-.018,13.45-memeHeight/2-.018,2.596,1.65+memeWidth/2+.018,13.45+memeHeight/2+.018,2.61,p.frame);
 const easterEgg={floor:5,mesh:meme,image:memeImage};
 // Тамбур первого этажа: тёмная дверь, низкий потолок и жёлтые трубы, как на фото.
 floor(-1.12,2.65,1.12,5.1,0);
 box(-1.32,0,2.65,-1.12,2.43,5.2,p.white,true);box(1.12,0,2.65,1.32,2.43,5.2,p.white,true);
 box(-1.11,0,2.65,-1.085,1.38,5.2,p.purple);box(1.085,0,2.65,1.11,1.38,5.2,p.purple);
 box(-1.32,2.43,2.65,1.32,2.63,5.2,p.white);box(-1.32,0,5.1,1.32,2.45,5.3,p.dark,true);
 box(-1.02,.04,5.02,1.02,2.22,5.08,p.dark);box(-.94,.06,4.98,.94,1.38,5.025,p.door);
 box(-.94,1.38,4.98,.94,2.16,5.025,p.dark);
 box(-.08,.06,4.965,-.045,2.15,4.985,p.iron);
 box(.66,.87,4.91,.72,1.24,4.98,p.iron);
 box(-.84,2.06,4.92,-.38,2.15,4.99,p.iron);rod([-.38,2.1,4.94],[-.05,2.26,4.96],.022,p.iron);
 sign('ВЫХОД',0,2.32,5,.74,.22,Math.PI,'#526450','#e8eadf');
 sign('КВ. 31–40',1.95,2.18,2.595,.9,.20,Math.PI,'#e2dfd4','#55465c');
 for(const y of [1.86,2.06]){
  rod([-1.02,y,5],[-1.02,y,2.4],.045,p.yellow);
  rod([-1.02,y,2.4],[-2.86,y,2.4],.045,p.yellow);
  rod([-2.86,y,2.4],[-2.86,y,-.1],.045,p.yellow);
  for(const z of [3.2,4.2])add(rodGeo,p.yellow,-1.02,y,z,.072,.055,.072,Math.PI/2);
 }
 rod([-1.02,1.7,4.1],[-1.02,2.25,4.1],.025,p.yellow);
 box(-1.1,2.28,3.1,1.1,2.42,3.4,p.white);
 // Отдельные меши только для надписей и створки; повторяющиеся детали сгруппированы.
 for(const {geo,mt,list} of batches.values()){
  const mesh=new THREE.InstancedMesh(geo,mt,list.length);list.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;scene.add(mesh);
 }
 function groundAt(x,z,feet){
  let ground=null,best=Infinity;
  for(const [x1,z1,x2,z2,y] of surfaces){
   const delta=Math.abs(y-feet);
   if(x>=x1-.001&&x<=x2+.001&&z>=z1-.001&&z<=z2+.001&&delta<=.205&&delta<best){ground=y;best=delta}
  }
  return ground;
 }
 scene.userData={floors:5,flights:8,steps:80,entrance:4,apartmentRange:[31,40],topLandingGuard:true,underStairNook:true,apartmentDoor:{floor:2,number:33,side:'rightFromStairs',id:APARTMENT_DOOR.id}};
 return {name:'Подъезд 4',scene,colliders,surfaces,groundAt,interactionObjects,apartmentDoors,stairWindows,easterEgg,spawn:[0,1.7,3.2],yaw:0,pitch:-.08,state:null};
}
