// BEGIN COLLEGE2_COURTYARD
// Вид из первого корпуса: галерея и три объёма противоположного фасада.
function buildCollege2Courtyard(){
 const group=new THREE.Group();
 group.name='college2-courtyard';
 S.add(group);
 const west=8,east=24,north=-30,south=10,canopy=3.4;
 const recessEdge=-24,recessFront=4.68;
 const blue=M(0x135f9b),deepBlue=M(0x123957),white=M(0xe1e5e4);
 const frame=M(0x243946),base=M(0x756b60),stone=M(0x8d8478),roof=M(0x787e80);
 const shell=M(0xa5aaad),shadowShell=M(0x797f82),metal=M(0xaab4b7);
 const unit=new THREE.BoxGeometry(1,1,1),batches=new Map(),matrix=new THREE.Matrix4();
 const position=new THREE.Vector3(),size=new THREE.Vector3(),rotation=new THREE.Quaternion();
 function box(x1,y1,z1,x2,y2,z2,material,solid=false){
  if(!batches.has(material))batches.set(material,[]);
  position.set((x1+x2)/2,(y1+y2)/2,(z1+z2)/2);
  size.set(x2-x1,y2-y1,z2-z1);
  batches.get(material).push(matrix.compose(position,rotation,size).clone());
  if(solid)cols.push([x1,z1,x2,z2]);
 }
 let seed=51923;
 function random(){seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296}
 function texture(w,h,draw){
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  draw(canvas.getContext('2d'),w,h);
  const map=new THREE.CanvasTexture(canvas);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;
  return map;
 }
 function grain(g,w,h,light,dark,count){
  for(let i=0;i<count;i++){
   g.fillStyle=random()<.5?light:dark;
   g.fillRect(random()*w,random()*h,.6+random()*2,.6+random()*1.6);
  }
 }
 const panelMap=texture(256,128,(g,w,h)=>{
  g.fillStyle='#b3b7b9';g.fillRect(0,0,w,h);
  grain(g,w,h,'#ffffff12','#23364212',3900);
  g.fillStyle='#58626b';g.fillRect(0,h-6,w,6);g.fillRect(w-3,0,3,h);
  g.fillStyle='#c9cdcd';g.fillRect(0,0,w,1);
 });
 const cladding=new THREE.MeshLambertMaterial({map:panelMap});
 const underCanopy=new THREE.MeshLambertMaterial({map:panelMap,color:0xb1b5b8});
 function surface(w,h,material,uPeriod,vPeriod,x,y,z,ry=0,rx=0,uOffset=0,vOffset=0,shade){
  const geometry=new THREE.PlaneGeometry(w,h,shade?Math.ceil(w/.45):1,1);
  const uv=geometry.attributes.uv,colors=[];
  for(let i=0;i<uv.count;i++){
   const u=uv.getX(i),v=uv.getY(i);
   if(shade){const light=shade(u,v);colors.push(light,light,light)}
   uv.setXY(i,uOffset+u*w/uPeriod,vOffset+v*h/vPeriod);
  }
  if(shade){
   geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
   material=material.clone();material.vertexColors=true;
  }
  const mesh=new THREE.Mesh(geometry,material);
  mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,0);group.add(mesh);return mesh;
 }
 function westWall(x,z1,z2,y1,y2,material=cladding,shade){
  return surface(z2-z1,y2-y1,material,1.15,.29,x-.011,(y1+y2)/2,(z1+z2)/2,-Math.PI/2,0,z1/1.15,y1/.29,shade);
 }
 const glassMap=texture(256,256,(g,w,h)=>{
  const shade=g.createLinearGradient(0,0,0,h);
  shade.addColorStop(0,'#b6c5ca');shade.addColorStop(.6,'#9ba8a9');shade.addColorStop(1,'#4f5e5e');
  g.fillStyle=shade;g.fillRect(0,0,w,h);
  g.fillStyle='#5f6c6e';g.beginPath();g.moveTo(0,220);g.lineTo(77,171);g.lineTo(172,202);g.lineTo(w,186);g.lineTo(w,h);g.lineTo(0,h);g.fill();
  g.fillStyle='#d8e2df38';g.beginPath();g.moveTo(22,0);g.lineTo(58,0);g.lineTo(156,h);g.lineTo(118,h);g.fill();
 });
 const brightGlass=new THREE.MeshPhongMaterial({map:glassMap,shininess:58,specular:0x9ca7ab});
 const shadedGlass=new THREE.MeshPhongMaterial({map:glassMap,color:0x7e8e92,shininess:45});
 const doorGlass=new THREE.MeshPhongMaterial({map:glassMap,color:0x6d7e80,shininess:54});
 function opening(z,bottom,width,height,{x=west,columns=1,transom=0,glass=brightGlass,trim=white,surround=blue,door=false,southZ=null}={}){
  const southFacing=southZ!==null;
  const part=southFacing?(a,y,b,c,top,d,material)=>box(b,y,southZ+x-c,d,top,southZ+x-a,material):box;
  const left=z-width/2,right=z+width/2,top=bottom+height;
  part(x-.125,bottom-.10,left-.10,x,bottom+height+.10,right+.10,surround);
  part(x-.137,bottom,left,x-.125,top,right,frame);
  const pane=surface(width-.10,height-.10,glass,width-.10,height-.10,
   southFacing?z:x-.141,bottom+height/2,southFacing?southZ+.141:z,southFacing?0:-Math.PI/2);
  if(door)pane.name='college2-closed-door';
  const bar=door?.057:.039;
  for(let i=0;i<=columns;i++){
   const at=left+.038+(width-.076)*i/columns;
   part(x-.177,bottom+.02,at-bar/2,x-.142,top-.02,at+bar/2,trim);
  }
  for(const y of [bottom+.028,top-.03,...(transom?[bottom+height*transom]:[])]){
   part(x-.175,y-bar/2,left+.017,x-.142,y+bar/2,right-.017,trim);
  }
  if(!door)part(x-.20,bottom-.067,left-.035,x-.125,bottom-.024,right+.035,blue);
  else for(const dz of [-.13,.13])part(x-.213,bottom+.92,z+dz-.022,x-.178,bottom+1.17,z+dz+.022,trim);
 }
 const sections=[
  {start:north,end:-10.5,height:7.36},
  {start:-10.5,end:-.7,height:6.64},
  {start:-.7,end:6.65,height:10.75},
  {start:6.65,end:south,height:7.88}
 ];
 const towerLeft=12.35,towerRight=19.78,towerTop=10.75,lowRoof=7.88;
 // Общая нижняя часть и выступ слева образуют нишу перед боковым входом.
 const entryWall=8.72,entryRight=13.8;
 box(west,0,north,east,4.33,entryWall,shell,true);
 box(entryRight,0,entryWall,east,4.33,south,shell,true);
 box(west,3.46,entryWall,entryRight,4.33,south,shell);
 box(west-.028,0,north,east+.015,.34,south,base);
 westWall(west,recessEdge,entryWall,.34,3.58,underCanopy,(u,v)=>{
  const fade=THREE.MathUtils.smoothstep(recessEdge+u*(entryWall-recessEdge),-17.5,-14.6);
  return .60+.32*fade+.07*(1-v);
 });
 box(recessFront,0,north,west,3.58,recessEdge,shadowShell,true);
 westWall(recessFront,north,recessEdge,.34,3.57,underCanopy);
 surface(west-recessFront,3.23,underCanopy,1.15,.29,(west+recessFront)/2,1.955,recessEdge+.011,0,0,0,0,u=>.83-.26*u);
 box(recessFront-.05,0,north,west,.34,recessEdge+.01,base);
 box(recessFront-.075,.34,recessEdge-.19,recessFront,3.58,recessEdge+.015,blue);
 box(recessFront-.075,.34,recessEdge,recessFront+.12,3.58,recessEdge+.022,deepBlue);
 for(const {start,end,height} of sections){
  const tall=height===towerTop,extent=tall?towerRight:east,eastHeight=tall?lowRoof:height;
  box(west,4.33,start,extent,height,end,shell);
  westWall(west,start,end,4.33,height-.25);
  surface(end-start,eastHeight-.34,cladding,1.15,.29,east+.012,(eastHeight+.34)/2,(start+end)/2,Math.PI/2);
  if(tall){
   box(towerRight,4.33,start,east,lowRoof,end,shell);
   box(towerRight,lowRoof-.18,start,east+.17,lowRoof+.085,end,roof);
   surface(end-start,towerTop-lowRoof-.25,cladding,1.15,.29,towerRight+.013,(towerTop+lowRoof-.25)/2,(start+end)/2,Math.PI/2);
  }
  const panelTop=height-.25;
  const roofSpans=end===south?[[west-.23,towerLeft],[towerRight,east+.22]]:[[west-.23,extent+.22]];
  for(const [x1,x2] of roofSpans){
   box(x1,panelTop,start,x2,height+.045,end,blue);
   box(x1,height,start-.13,x2,height+.085,end+.13,roof);
  }
  box(west-.235,height-.028,start-.13,west-.17,height+.036,end+.13,deepBlue);
 }
 // Высокая секция обшита и с торцов, которые видны с обоих краёв двора.
 surface(towerRight-west,10.50-6.64,cladding,1.15,.29,(towerRight+west)/2,8.57,-.713,Math.PI);
 surface(towerLeft-west,10.50-lowRoof,cladding,1.15,.29,(towerLeft+west)/2,9.19,6.663);
 box(towerLeft,lowRoof,6.65,towerRight,towerTop,10,shell);
 for(const [x,rotation] of [[towerLeft-.013,-Math.PI/2],[towerRight+.013,Math.PI/2]]){
  surface(3.35,10.5-lowRoof,cladding,1.15,.29,x,9.19,8.325,rotation);
 }
 surface(towerRight-towerLeft,10.50-lowRoof,cladding,1.15,.29,(towerLeft+towerRight)/2,9.19,10.014);
 for(const x of [towerLeft,towerRight]){
  box(x-.15,lowRoof,9.91,x+.15,10.54,10.095,blue);
 }
 box(towerLeft-.16,10.50,6.65,towerRight+.16,towerTop,10.10,deepBlue);
 box(towerLeft-.24,towerTop,6.65,towerRight+.24,towerTop+.085,10.24,roof);
 for(let z=6.76;z<9.94;z+=.23)box(8.11,7.966,z-.012,8.144,8.77,z+.012,white);
 box(8.095,8.76,6.75,8.16,8.808,9.98,metal);
 box(8.095,8.04,6.75,8.16,8.082,9.98,metal);
 surface(16,7.02,cladding,1.15,.29,16,3.85,north-.011,Math.PI);
 surface(16,4.40,cladding,1.15,.29,16,5.68,south+.011,0,0,west/1.15,3.48/.29);
 for(const z of [north,-.7,6.65,south]){
  const top=z===-.7||z===6.65?10.75:z===south?7.88:z===north?7.36:3.58;
  box(west-.084,z===south?3.48:.34,z-.12,west+.018,top,z+.12,blue);
 }
 // Слева широкая полоса остекления. Над главным входом две группы узких окон.
 for(let i=0;i<7;i++)opening(-28.56+i*2.59,4.93,2.28,1.94,{columns:5});
 for(const z of [-9.52,-8.30,-7.08,-4.34,-3.12,-1.90])opening(z,5.03,.63,1.17,{transom:.72});
 for(const z of [.56,2.39])opening(z,5.56,.56,.51);
 for(const z of [3.93,4.94,5.97,7.14,8.26,9.39])opening(z,5.11,.53,1.18,{transom:.69});
 // Окна со стороны сада продолжают прежний ритм заднего фасада.
 for(let z=-28.25;z<south-.8;z+=3.42)for(const y of [1.04,4.73]){
  box(east,y-.095,z-.91,east+.102,y+1.68,z+.91,blue);
  surface(1.58,1.55,brightGlass,1.58,1.55,east+.108,y+.775,z,Math.PI/2);
  box(east+.106,y,z-.025,east+.142,y+1.55,z+.025,white);
  box(east+.104,y-.064,z-.82,east+.185,y-.018,z+.82,white);
 }
 for(const z of [-29.1,-28.15,-27.2,-25.82,-24.87])opening(z,1.04,.52,1.76,{x:recessFront,glass:shadedGlass});
 for(const z of [-3.68,-1.84,4.12,5.83,7.73])opening(z,.85,.64,1.56,{transom:.56,glass:shadedGlass});
 for(const z of [.53,2.37])opening(z,1.86,.61,.51,{glass:shadedGlass});
 function stairs(z,width,level,count=3){
  for(let i=0;i<count;i++){
   const height=level*(count-i)/count,edge=west-1.02-.28*i;
   box(edge,.055,z-width/2,i===0?west:edge+.28,height,z+width/2,stone);
   box(edge-.003,height-.024,z-width/2,edge+.022,height+.002,z+width/2,base);
  }
 }
 const recessedTrim=M(0x858e88),recessedGlass=new THREE.MeshPhongMaterial({map:glassMap,color:0x485953,shininess:40});
 opening(-20.93,.51,2.04,2.28,{columns:3,transom:.77,glass:recessedGlass,trim:recessedTrim,surround:deepBlue,door:true});
 opening(-7,.42,2.22,1.96,{columns:3,glass:doorGlass,door:true});
 stairs(-7,3.44,.42);
 // Ступени огибают общую площадку у обеих дверей.
 const porchMap=texture(256,256,(g,w,h)=>{
  g.fillStyle='#817e76';g.fillRect(0,0,w,h);
  grain(g,w,h,'#e0ddd440','#36393350',14500);
  g.fillStyle='#53564f';g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);
 });
 const porchStone=new THREE.MeshLambertMaterial({map:porchMap});
 const porchNose=new THREE.MeshLambertMaterial({map:porchMap,color:0xbfc0ba});
 function stoneUV(mesh){
  mesh.updateMatrix();
  const geometry=mesh.geometry,vertices=geometry.attributes.position,normals=geometry.attributes.normal,uv=geometry.attributes.uv;
  const point=new THREE.Vector3(),normal=new THREE.Vector3(),period=.72;
  for(let i=0;i<vertices.count;i++){
   point.fromBufferAttribute(vertices,i).applyMatrix4(mesh.matrix);
   normal.fromBufferAttribute(normals,i).transformDirection(mesh.matrix);
   if(Math.abs(normal.y)>.7)uv.setXY(i,point.x/period,-point.z/period);
   else if(Math.abs(normal.x)>.7)uv.setXY(i,point.z/period,point.y/period);
   else uv.setXY(i,point.x/period,point.y/period);
  }
  uv.needsUpdate=true;group.add(mesh);return mesh;
 }
 function stoneBlock(x1,y1,z1,x2,y2,z2,material=porchStone){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(x2-x1,y2-y1,z2-z1),material);
  mesh.position.set((x1+x2)/2,(y1+y2)/2,(z1+z2)/2);return stoneUV(mesh);
 }
 const porchLeft=-22.72,porchRight=-16.85;
 let innerX=west,innerZ=porchRight;
 for(let i=0;i<4;i++){
  const edge=6.79-.29*i,right=porchRight+.26*i,top=.51-.104*i;
  stoneBlock(edge,.078,porchLeft,innerX,top,right);
  stoneBlock(edge-.004,top-.023,porchLeft,edge+.021,top+.002,right,porchNose);
  if(i>0){
   stoneBlock(innerX,.078,innerZ,west,top,right);
   stoneBlock(innerX,top-.023,right-.021,west,top+.002,right+.004,porchNose);
  }
  innerX=edge;innerZ=right;
 }
 box(7.86,.51,-18.09,8,2.38,-17.12,deepBlue);
 box(7.837,.53,-18.01,7.86,2.28,-17.20,M(0x848780));
 box(7.80,1.32,-17.31,7.837,1.47,-17.28,recessedTrim);
 // Южный вход под общим навесом. Дверь в глубине, справа выступ и высокий витраж.
 function southPanels(x1,x2,bottom,top,z,material=cladding,shade){
  surface(x2-x1,top-bottom,material,1.15,.29,(x1+x2)/2,(bottom+top)/2,z,0,0,x1/1.15,bottom/.29,shade);
 }
 southPanels(entryRight,east,.34,3.48,south+.011,underCanopy,u=>.82+.18*u);
 southPanels(west,entryRight,.54,3.48,entryWall+.011,underCanopy,u=>.68+.14*u);
 for(const [x,angle] of [[entryRight-.012,-Math.PI/2]]){
  surface(south-entryWall,3.14,underCanopy,1.15,.29,x,1.91,(south+entryWall)/2,angle,0,0,.34/.29,u=>.75+.13*u);
 }
 box(entryRight-.032,.34,9.77,entryRight+.37,3.49,10.112,deepBlue);
 box(entryRight-.013,.34,9.7,entryRight+.27,3.49,10.126,blue);
 box(20.25,.34,9.99,20.49,7.48,10.105,blue);
 box(23.68,.34,9.99,23.96,7.49,10.105,blue);
 const entryX=11.55,landingY=.54;
 opening(entryX,landingY,1.92,2.51,{southZ:entryWall,columns:2,transom:.76,door:true,glass:doorGlass});
 opening(22.06,.46,2.9,2.81,{southZ:south,columns:4,transom:.77,door:true,glass:brightGlass});
 opening(22.06,4.36,2.91,2.94,{southZ:south,columns:3,transom:.20,glass:brightGlass});
 for(let x=20.04;x<23.7;x+=.24)box(x,7.94,9.96,x+.027,8.76,10.017,white);
 for(const y of [8.04,8.74])box(20.03,y,9.936,23.76,y+.049,10.05,metal);
 const noticeMap=texture(128,192,(g,w,h)=>{
  g.fillStyle='#e1b738';g.fillRect(0,0,w,h);
  g.strokeStyle='#8e6d25';g.lineWidth=2;g.strokeRect(7,7,w-14,h-14);
  g.fillStyle='#645023';g.font='bold 15px Arial';g.textAlign='center';g.fillText('КОРПУС 2',w/2,38);
  for(let y=60;y<165;y+=13)g.fillRect(16,y,84-(y%5)*5,2);
 });
 surface(.31,.45,new THREE.MeshLambertMaterial({map:noticeMap}),.31,.45,entryX-.43,1.50,entryWall+.18);
 box(entryX-1.27,2.99,entryWall,entryX-1.16,3.08,entryWall+.078,M(0xa64032));
 const rampLeft=4.61,rampRight=6.24,rampStart=15.27,landingFront=11.04;
 stoneBlock(rampLeft,.082,entryWall,entryRight,landingY,landingFront);
 for(let i=0;i<4;i++){
  const edge=landingFront+.33*(i+1),top=landingY-.112*(i+1);
  stoneBlock(9.55,.077,edge-.33,entryRight,top,edge);
  stoneBlock(9.55,top-.017,edge-.024,entryRight,top+.002,edge+.006,porchNose);
 }
 const rampShape=new THREE.Shape();
 rampShape.moveTo(0,0);rampShape.lineTo(rampStart-landingFront,0);
 rampShape.lineTo(rampStart-landingFront,landingY-.034);rampShape.closePath();
 const ramp=new THREE.Mesh(new THREE.ExtrudeGeometry(rampShape,{depth:rampRight-rampLeft,bevelEnabled:false}),porchStone);
 ramp.rotation.y=Math.PI/2;ramp.position.set(rampLeft,.034,rampStart);stoneUV(ramp);
 const railSteel=new THREE.MeshPhongMaterial({color:0xb8bfc2,shininess:85,specular:0xbfc7ca});
 const rodGeometry=new THREE.CylinderGeometry(1,1,1,10);
 const railMatrices=[],rodTransform=new THREE.Object3D();
 function rod(a,b,r){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),direction=end.clone().sub(start);
  rodTransform.position.copy(start).lerp(end,.5);rodTransform.scale.set(r,direction.length(),r);
  rodTransform.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
  rodTransform.updateMatrix();railMatrices.push(rodTransform.matrix.clone());
 }
 function rail(a,b){
  for(const [h,r] of [[.85,.024],[.63,.012],[.42,.012],[.22,.012]]){
   rod([a[0],a[1]+h,a[2]],[b[0],b[1]+h,b[2]],r);
  }
  const spans=Math.ceil(Math.hypot(a[0]-b[0],a[2]-b[2])/1.16);
  for(let i=0;i<=spans;i++){
   const [x,y,z]=a.map((v,j)=>THREE.MathUtils.lerp(v,b[j],i/spans));
   rod([x,y,z],[x,y+.85,z],.023);rod([x,y+.012,z],[x,y+.033,z],.051);
  }
  cols.push([Math.min(a[0],b[0])-.028,Math.min(a[2],b[2])-.028,Math.max(a[0],b[0])+.028,Math.max(a[2],b[2])+.028]);
 }
 rail([rampLeft+.065,.054,15.10],[rampLeft+.065,landingY,landingFront]);
 rail([rampRight-.068,.054,15.10],[rampRight-.068,landingY,landingFront]);
 rail([rampRight-.068,landingY,landingFront],[9.55,landingY,landingFront]);
 rail([9.55,landingY,landingFront],[9.55,.105,12.28]);
 const rails=new THREE.InstancedMesh(rodGeometry,railSteel,railMatrices.length);
 railMatrices.forEach((value,i)=>rails.setMatrixAt(i,value));group.add(rails);
 box(9.02,.077,11.16,9.32,.47,11.49,frame);
 box(8.98,.465,11.13,9.36,.505,11.52,deepBlue);
 // Непрерывный навес: три горизонтальных ряда, тонкие стойки и светлый реечный потолок.
 const fasciaMap=texture(256,128,(g,w,h)=>{
  const fade=g.createLinearGradient(0,0,0,h);fade.addColorStop(0,'#2875a9');fade.addColorStop(1,'#084b81');
  g.fillStyle=fade;g.fillRect(0,0,w,h);
  g.fillStyle='#144366';g.fillRect(0,h-5,w,5);g.fillRect(w-2,0,2,h);
  g.fillStyle='#5785a3';g.fillRect(0,0,2,h);
 });
 const fascia=new THREE.MeshLambertMaterial({map:fasciaMap});
 box(canopy,3.48,north,west+.08,4.27,south,blue);
 surface(40,.68,fascia,1.4,.68/3,canopy-.018,3.925,-10,-Math.PI/2);
 box(canopy-.06,3.48,north-.015,canopy+.045,3.585,south+.015,deepBlue);
 box(canopy-.043,4.255,north-.03,canopy+.04,4.289,south+.03,metal);
 const soffitMap=texture(128,128,(g,w,h)=>{
  g.fillStyle='#c7c7be';g.fillRect(0,0,w,h);g.fillStyle='#9ca29d';g.fillRect(0,0,4,h);
 });
 const soffit=new THREE.MeshLambertMaterial({map:soffitMap,side:THREE.DoubleSide});
 surface(west-canopy,40,soffit,.135,1,(canopy+west)/2,3.474,-10,0,Math.PI/2);
 const returnEnd=22.46,returnFront=14.69,returnWidth=returnEnd-canopy;
 box(canopy,3.48,south,returnEnd,4.27,returnFront,blue);
 surface(returnWidth,.68,fascia,1.4,.68/3,(canopy+returnEnd)/2,3.925,returnFront+.018);
 surface(returnFront-south,.68,fascia,1.4,.68/3,canopy-.018,3.925,(returnFront+south)/2,-Math.PI/2,0,40/1.4);
 box(canopy-.06,3.48,returnFront-.045,returnEnd+.018,3.585,returnFront+.06,deepBlue);
 box(canopy-.06,3.48,south,canopy+.045,3.585,returnFront,deepBlue);
 box(canopy-.043,4.255,south,canopy+.04,4.289,returnFront+.03,metal);
 box(canopy-.043,4.255,returnFront-.04,returnEnd+.04,4.289,returnFront+.043,metal);
 surface(returnWidth,returnFront-south,soffit,.135,1,(canopy+returnEnd)/2,3.474,(returnFront+south)/2,0,Math.PI/2);
 surface(entryRight-west,south-entryWall,soffit,.135,1,(west+entryRight)/2,3.451,(entryWall+south)/2,0,Math.PI/2);
 for(const x of [3.56,15.49,21.82]){
  box(x-.053,.03,14.46,x+.053,3.48,14.566,white,true);
  box(x-.088,.036,14.427,x+.088,.072,14.60,metal);
 }
 for(const x of [7.25,11.6,17.33,20.45])box(x-.21,3.427,11.9,x+.21,3.474,12.14,white);
 for(const z of [-28.6,-23.84,-19.32,-14.82,-10.31,-5.80,-1.30,3.21,7.72]){
  box(canopy+.055,.073,z-.048,canopy+.151,3.48,z+.048,white,true);
  box(canopy+.01,.065,z-.085,canopy+.195,.113,z+.085,metal);
  box(5.16,3.419,z+.65,5.49,3.474,z+.88,white);
 }
 for(const [z,top,x] of [[-10.55,7.30,7.78],[-.78,6.62,7.78],[14.41,4.24,3.36]]){
  const bottom=top>4.3?4.24:.16;
  box(x,bottom+.18,z-.046,x+.092,top,z+.046,white);
  box(x-.17,bottom,z-.046,x+.071,bottom+.19,z+.046,white);
 }
 // Парные водостоки перед синей угловой накладкой ниши.
 const pipeGeo=new THREE.CylinderGeometry(.044,.044,1,10);
 function pipe(a,b,z){
  const mesh=new THREE.Mesh(pipeGeo,white);
  const direction=new THREE.Vector3(b[0]-a[0],b[1]-a[1],0);
  mesh.scale.y=direction.length();mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
  mesh.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,z);group.add(mesh);
 }
 for(const z of [recessEdge-.18,recessEdge-.035]){
  pipe([recessFront-.11,.38],[recessFront-.11,3.25],z);
  pipe([recessFront-.11,3.25],[recessFront+.025,3.58],z);
  pipe([recessFront-.11,.38],[recessFront-.22,.19],z);
  pipe([recessFront-.22,.19],[recessFront-.22,.115],z);
 }
 // Блоки кондиционеров и маленькие круглые вытяжки над окнами.
 const fanMap=texture(128,128,(g,w,h)=>{
  g.fillStyle='#d1d4cf';g.fillRect(0,0,w,h);g.fillStyle='#5d686a';g.beginPath();g.arc(53,64,42,0,7);g.fill();
  g.fillStyle='#a2aaa7';for(let i=9;i<110;i+=5){g.fillRect(i,12,2,104);g.fillRect(8,i,102,2)}
 });
 const fan=new THREE.MeshLambertMaterial({map:fanMap});
 for(const [z,y] of [[.22,5.06],[6.37,4.95],[9.83,4.89]]){
  box(7.54,y,z-.35,7.94,y+.49,z+.35,white);
  surface(.66,.45,fan,.66,.45,7.535,y+.245,z,-Math.PI/2);
  for(const dz of [-.23,.23])box(7.54,y-.085,z+dz-.02,8,y,z+dz+.02,metal);
 }
 for(const [z,y] of [[.15,2.65],[2.21,2.68],[.12,6.32],[2,6.32]]){
  const vent=new THREE.Mesh(new THREE.CylinderGeometry(.11,.12,.095,10),metal);
  vent.rotation.z=Math.PI/2;vent.position.set(7.934,y,z);group.add(vent);
  const hole=new THREE.Mesh(new THREE.CircleGeometry(.063,10),frame);
  hole.rotation.y=-Math.PI/2;hole.position.set(7.883,y,z);group.add(hole);
 }
 for(const z of [-8.9,-5.1]){
  box(7.05,.066,z-.115,7.28,.50,z+.115,frame);
  box(7.032,.50,z-.133,7.30,.55,z+.133,deepBlue);
 }
 // Проезд вдоль корпуса, мощение под навесом и узкие газоны вдоль крыльев.
 const asphaltMap=texture(256,256,(g,w,h)=>{
  g.fillStyle='#6e706c';g.fillRect(0,0,w,h);grain(g,w,h,'#aeb2ac30','#4247442d',22000);
 });
 const pavingMap=texture(256,256,(g,w,h)=>{
  g.fillStyle='#8e8c82';g.fillRect(0,0,w,h);
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){
   g.fillStyle=(i+j)%3?'#b9b2a3':'#a69d8e';g.fillRect(i*64+2,j*64+2,61,61);
  }
  grain(g,w,h,'#e7e0ce2e','#65615521',4500);
 });
 const asphalt=new THREE.MeshLambertMaterial({map:asphaltMap});
 function groundPatch(x1,z1,x2,z2,y,material,period){
  return surface(x2-x1,z2-z1,material,period,period,(x1+x2)/2,y,(z1+z2)/2,0,-Math.PI/2,x1/period,-z2/period);
 }
 groundPatch(-4.9,-36.7,3.4,22,.062,asphalt,2.1);
 groundPatch(-19.25,22,3.4,41.8,.035,asphalt,2.1);
 groundPatch(3.4,10,26,41.8,.009,asphalt,2.1);
 const repairedAsphalt=new THREE.MeshLambertMaterial({map:asphaltMap,color:0xe1e3e1});
 for(const [x1,z1,x2,z2] of [[14,17,17.5,18.3],[21.5,21,26,22.4],[11,22.5,14,23.7]]){
  groundPatch(x1,z1,x2,z2,.011,repairedAsphalt,2.1);
 }
 surface(4.69,40,new THREE.MeshLambertMaterial({map:pavingMap}),1.5,1.5,5.66,.079,-10,0,-Math.PI/2,0,0,u=>.93-.20*u);
 const entryPavingMap=texture(256,256,(g,w,h)=>{
  g.fillStyle='#a59b89';g.fillRect(0,0,w,h);
  for(let x=0;x<w;x+=64)for(let y=0;y<h;y+=64){
   g.fillStyle=(x+y)%128?'#b9af9d':'#c7bdab';g.fillRect(x+1,y+1,62,62);
   g.fillStyle='#716b60';g.fillRect(x+18,y+24,28,15);
  }
  grain(g,w,h,'#e8dfca34','#5c514325',4800);
 });
 const entryPaving=new THREE.MeshLambertMaterial({map:entryPavingMap});
 groundPatch(6.24,south,24.38,14.27,.075,entryPaving,1.38);
 box(6.24,.009,14.23,24.38,.072,14.28,base);
 stoneBlock(20.45,.074,10,23.72,.46,10.78);
 const tactileMap=texture(128,128,(g,w,h)=>{
  g.fillStyle='#bca25b';g.fillRect(0,0,w,h);
  g.fillStyle='#dfc781';g.fillRect(2,2,w-4,h-4);
  for(let y=11;y<h-9;y+=15){
   g.fillStyle='#ae9555';g.fillRect(10,y,w-20,4);
   g.fillStyle='#ead18c';g.fillRect(10,y-1,w-20,2);
  }
 });
 const tactile=new THREE.MeshLambertMaterial({map:tactileMap});
 groundPatch(3.4,15.15,entryX+.19,15.52,.017,tactile,.37);
 function turnTactile(z1,z2,y){
  surface(z2-z1,.37,tactile,.37,.37,entryX+.005,y,(z1+z2)/2,0,-Math.PI/2).rotateZ(Math.PI/2);
 }
 turnTactile(14.28,15.15,.018);
 turnTactile(12.48,14.28,.079);
 box(3.31,.06,north,3.40,.09,south,base);
 for(const z of [-27.1,-20.7,-13.3,-5.7,1.3,8.5,15.7,21.2,28.5,35.5]){
  const y=z>22?.036:.063;
  box(1.2,y,z-.035,1.76,y+.004,z+.035,white);
 }
 const lawnMap=texture(256,256,(g,w,h)=>{
  g.fillStyle='#40592a';g.fillRect(0,0,w,h);grain(g,w,h,'#91a45c55','#243c2255',14000);
  for(let i=0;i<125;i++){
   const x=random()*w,y=random()*h,r=2+random()*12;
   const patch=g.createRadialGradient(x,y,0,x,y,r);patch.addColorStop(0,i%3?'#8b9a5936':'#2235224d');patch.addColorStop(1,'#55653300');
   g.fillStyle=patch;g.fillRect(x-r,y-r,r*2,r*2);
  }
 });
 const lawn=new THREE.MeshLambertMaterial({map:lawnMap});
 const curb=M(0x939088),trunk=M(0x55493c);
 const needleMap=texture(96,96,(g,w,h)=>{
  g.fillStyle='#e1e5e3';g.fillRect(0,0,w,h);
  for(let i=0;i<1700;i++){
   const x=random()*w,y=random()*h;
   g.strokeStyle=i%3?'#53665844':'#ffffff99';g.lineWidth=.65;
   g.beginPath();g.moveTo(x,y);g.lineTo(x+(x%2<1?-1:1)*(1+random()*4),y-2-random()*5);g.stroke();
  }
 });
 const needles=[0x455b52,0x5b7267,0x6b8075,0x81928a].map(color=>new THREE.MeshLambertMaterial({color,map:needleMap}));
 const branch=new THREE.ConeGeometry(1,1,6),twig=new THREE.Object3D(),twigMatrices=needles.map(()=>[]);
 function foliage(x,y,z,a,width,length,thickness,tint,tilt){
  twig.position.set(x,y,z);
  twig.scale.set(width,length,thickness);
  twig.rotation.set(0,-a,tilt,'YXZ');
  twig.updateMatrix();
  twigMatrices[tint].push(twig.matrix.clone());
 }
 function spruce(x,z,h){
  box(x-.039,.116,z-.04,x+.039,.116+h*.91,z+.04,trunk,true);
  const phase=random()*Math.PI*2;
  for(let tier=0;tier<12;tier++){
   const t=tier/11,y=.116+h*(.17+.73*t),r=h*(.37*Math.pow(1-t,.75)+.03);
   foliage(x,y+h*.045,z,phase+tier*.39,r*.58,h*.23,r*.55,tier%2,0);
   for(let j=0;j<7;j++){
    const a=phase+j*Math.PI*2/7+tier*.45+(random()-.5)*.35;
    const radius=r*(.79+.21*random()),dx=Math.cos(a),dz=Math.sin(a);
    const center=radius*.43;
    foliage(x+dx*center,y,z+dz*center,a,radius*.28,radius*1.15,radius*.23,(tier+j)%3,-1.21);
    for(const turn of [-1,1]){
     const twigAngle=a+turn*.64,tip=radius*.63;
     foliage(x+dx*tip,y+radius*.08,z+dz*tip,twigAngle,radius*.145,radius*.58,radius*.12,1+(tier+j)%3,-1.18);
    }
   }
  }
  foliage(x,.116+h*.924,z,phase,h*.095,h*.19,h*.085,2,0);
 }
 function lawnOutline(x1,x2,z1,z2,cut){
  const shape=new THREE.Shape();
  shape.moveTo(x1,-z1);shape.lineTo(x2,-z1);shape.lineTo(x2,-z2+cut);
  shape.lineTo(x2-cut,-z2);shape.lineTo(x1,-z2);shape.closePath();
  return shape;
 }
 for(const [z1,z2,cut,trees] of [
  [-32.04,-18,.08,[[-30.8,1.7],[-28.2,1.95],[-25.65,1.7],[-23.0,2.22],[-20.3,1.95]]],
  [4,22.04,.52,[[5.58,2.17],[8.52,1.85],[11.65,2.18],[14.7,1.95],[17.8,2.04],[20.6,1.79]]]
 ]){
  const x1=-4.88,x2=-2.79;
  const border=new THREE.Mesh(new THREE.ExtrudeGeometry(lawnOutline(x1,x2,z1,z2,cut),{depth:.06,bevelEnabled:false}),curb);
  border.rotation.x=-Math.PI/2;border.position.y=.054;group.add(border);
  const sod=new THREE.ShapeGeometry(lawnOutline(x1+.064,x2-.064,z1+.066,z2-.066,cut));
  const uv=sod.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/1.55,uv.getY(i)/1.55);
  const grass=new THREE.Mesh(sod,lawn);
  grass.rotation.x=-Math.PI/2;grass.position.y=.116;group.add(grass);
  trees.forEach(([z,h],i)=>spruce(-3.83+(i%3-1)*.065,z,h));
 }
 const coverMap=texture(128,128,(g,w,h)=>{
  g.fillStyle='#665e57';g.fillRect(0,0,w,h);
  for(const [radius,width,color] of [[61,4,'#403d39'],[55,2,'#999085'],[50,2,'#493f3b']]){
   g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.arc(64,64,radius,0,Math.PI*2);g.stroke();
  }
  for(let x=22;x<=106;x+=9)for(let y=22;y<=106;y+=9){
   if(Math.hypot(x-64,y-64)<46){g.fillStyle='#514a44';g.fillRect(x,y,5,3);g.fillStyle='#82796f';g.fillRect(x,y+3,5,1)}
  }
 });
 const cover=new THREE.MeshPhongMaterial({map:coverMap,shininess:14});
 for(const [x,y,z,r] of [[-5.6,.129,-16.35,.32],[-2.17,.064,16.35,.33],[-4.48,.038,25.7,.34]]){
  const lid=new THREE.Mesh(new THREE.CircleGeometry(r,28),cover);
  lid.rotation.x=-Math.PI/2;lid.position.set(x,y,z);group.add(lid);
 }
 for(const [material,matrices] of batches){
  const mesh=new THREE.InstancedMesh(unit,material,matrices.length);
  matrices.forEach((value,i)=>mesh.setMatrixAt(i,value));mesh.frustumCulled=false;group.add(mesh);
 }
 for(const [i,matrices] of twigMatrices.entries()){
  const mesh=new THREE.InstancedMesh(branch,needles[i],matrices.length);
  matrices.forEach((value,j)=>mesh.setMatrixAt(j,value));mesh.frustumCulled=false;group.add(mesh);
 }
}
buildCollege2Courtyard();
// END COLLEGE2_COURTYARD
