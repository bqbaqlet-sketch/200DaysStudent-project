// Single-frame CPU previews of the actual scene; no browser, WebGL, or animation loop.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dep = name => require(name);
const THREE=dep('three'),{createCanvas,ImageData}=dep('@napi-rs/canvas');
const file=fs.readdirSync('.').find(f=>f.endsWith('.html')),source=fs.readFileSync(file,'utf8');
const entrancePreview=process.argv.includes('--entrance');
const homePreview=process.argv.includes('--benches'),yardPreview=process.argv.includes('--yard');
const bathroomPreview=process.argv.includes('--bath-closed')||process.argv.includes('--bath-open');
const collegePreview=process.argv.includes('--college1');
const college2Interior=process.argv.includes('--college2-interior');
const exitView=process.argv.includes('--college-exit-view');
const sidePassages=process.argv.includes('--college-side-passages');
const college2Entrance=process.argv.includes('--college2-entrance');
const exteriorPreview=exitView||sidePassages||college2Entrance||process.argv.includes('--college-exterior');
const builder=college2Interior?'buildCollege2Interior':collegePreview?'buildCollegeEntranceInterior':homePreview||yardPreview?'buildHomeLocation':entrancePreview?'buildEntranceInterior':'buildApartmentInterior';
const begin=exteriorPreview?source.indexOf('const S=new THREE.Scene()'):source.indexOf('function '+builder+'()'),
 end=exteriorPreview?source.indexOf('// ---- Локация «Дом».'):source.indexOf(homePreview||yardPreview?'// ---- Интерьер четвёртого подъезда.':entrancePreview?'// ---- Квартира по фотографиям пользователя.':'const locations={college:',begin);
const world=vm.runInNewContext(source.slice(begin,end)+(exteriorPreview?'\n({scene:S})':'\n'+builder+'()'),{
 THREE,window:{},document:{createElement:()=>createCanvas(1,1)},APARTMENT_DOOR:{id:'apartment-2-right'}
});
if(process.argv.includes('--bath-open')){world.bathroomDoor.target=1;world.bathroomDoor.update(1,null)}
const W=exteriorPreview?1920:process.argv.includes('--sketch')?1120:960,H=exteriorPreview?1280:process.argv.includes('--sketch')?630:640,textureCache=new Map(),triangles=[];
const previewBounds=college2Entrance?new THREE.Box3(new THREE.Vector3(-25,-.3,-35),new THREE.Vector3(39,13,43)):sidePassages?new THREE.Box3(new THREE.Vector3(-37,-.3,-40),new THREE.Vector3(25,14,44)):exitView?new THREE.Box3(new THREE.Vector3(-9,-.3,-33),new THREE.Vector3(25,12,16)):exteriorPreview?new THREE.Box3(new THREE.Vector3(-25,-.3,-33),new THREE.Vector3(3.3,11,23)):homePreview?new THREE.Box3(new THREE.Vector3(23.5,-.2,-.4),new THREE.Vector3(35.7,5,8)):
 yardPreview?new THREE.Box3(new THREE.Vector3(3,-.2,14),new THREE.Vector3(58,16,57)):null;
world.scene.updateMatrixWorld(true);
function texInfo(mt){
 if(!mt.map)return null;
 if(!textureCache.has(mt.map.uuid)){
  const cv=mt.map.image;textureCache.set(mt.map.uuid,{width:cv.width,height:cv.height,data:cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data});
 }
 return textureCache.get(mt.map.uuid);
}
const vertex=new THREE.Vector3(),normal=new THREE.Vector3(),aa=new THREE.Vector3(),bb=new THREE.Vector3(),matrix=new THREE.Matrix4();
const renderMeshes=[];world.scene.traverse(object=>{if(object.isMesh)renderMeshes.push(object)});
for(const mesh of renderMeshes){
 if(!mesh.isMesh||!mesh.geometry)continue;
 const g=mesh.geometry,pos=g.attributes.position,uv=g.attributes.uv,idx=g.index,mt=mesh.material;
 const color=mt.vertexColors&&g.attributes.color;
 const count=mesh.isInstancedMesh?mesh.count:1;
 for(let instance=0;instance<count;instance++){
  if(mesh.isInstancedMesh){mesh.getMatrixAt(instance,matrix);matrix.premultiply(mesh.matrixWorld)}else matrix.copy(mesh.matrixWorld);
  if(previewBounds){g.computeBoundingBox();if(!g.boundingBox.clone().applyMatrix4(matrix).intersectsBox(previewBounds))continue}
  for(let i=0;i<(idx?idx.count:pos.count);i+=3){
   const vertices=[];
   for(let k=0;k<3;k++){
    const n=idx?idx.getX(i+k):i+k;vertex.fromBufferAttribute(pos,n).applyMatrix4(matrix);
    vertices.push({x:vertex.x,y:vertex.y,z:vertex.z,u:uv?uv.getX(n):0,v:uv?uv.getY(n):0,r:color?color.getX(n):1,g:color?color.getY(n):1,b:color?color.getZ(n):1});
   }
   const [a,b,c]=vertices;aa.set(b.x-a.x,b.y-a.y,b.z-a.z);bb.set(c.x-a.x,c.y-a.y,c.z-a.z);normal.crossVectors(aa,bb).normalize().multiplyScalar(matrix.determinant()<0?-1:1);
   const dir=new THREE.Vector3(-.3,.6,-.8).normalize();
   triangles.push({vertices,normal:normal.clone(),mt,texture:texInfo(mt),vertexColor:!!color,shade:mt.isMeshBasicMaterial?1:.8+.2*Math.max(0,normal.dot(dir))});
  }
 }
}
function render(name,position,target){
 const floorScale=world.scene.userData.floorScale||1;
 position=position.map((value,axis)=>axis===1?value:value*floorScale);
 target=target.map((value,axis)=>axis===1?value:value*floorScale);
 const camera=new THREE.PerspectiveCamera(exteriorPreview?80:70,W/H,.035,60);camera.position.set(...position);camera.lookAt(...target);camera.updateMatrixWorld(true);
 const view=camera.matrixWorldInverse,project=1/Math.tan((exteriorPreview?40:35)*Math.PI/180),pixels=new Uint8ClampedArray(W*H*4),depth=new Float32Array(W*H);depth.fill(Infinity);
 const backdrop=college2Entrance?[169,196,238]:[214,214,204];
 for(let i=0;i<W*H;i++){pixels[i*4]=backdrop[0];pixels[i*4+1]=backdrop[1];pixels[i*4+2]=backdrop[2];pixels[i*4+3]=255}
 const opaque=[],transparent=[];
 for(const tri of triangles){
  const a=tri.vertices[0];
  if(tri.mt.side!==THREE.DoubleSide&&tri.normal.dot(new THREE.Vector3(position[0]-a.x,position[1]-a.y,position[2]-a.z))<=0)continue;
  let polygon=tri.vertices.map(v=>{vertex.set(v.x,v.y,v.z).applyMatrix4(view);return{...v,x:vertex.x,y:vertex.y,d:-vertex.z}});
  const clipped=[];
  for(let i=0;i<polygon.length;i++){
   const a=polygon[i],b=polygon[(i+1)%polygon.length],aIn=a.d>=.035,bIn=b.d>=.035;
   if(aIn)clipped.push(a);
   if(aIn!==bIn){const t=(.035-a.d)/(b.d-a.d),v={};for(const k of ['x','y','d','u','v','r','g','b'])v[k]=a[k]+(b[k]-a[k])*t;clipped.push(v)}
  }
  if(clipped.length<3)continue;
  for(let i=1;i<clipped.length-1;i++){
   const pts=[clipped[0],clipped[i],clipped[i+1]].map(v=>({...v,x:(v.x/v.d*project/(W/H)+1)*W/2,y:(1-v.y/v.d*project)*H/2}));
   (tri.mt.transparent?transparent:opaque).push({...tri,pts,avg:pts.reduce((s,v)=>s+v.d,0)/3});
  }
 }
 transparent.sort((a,b)=>b.avg-a.avg);
 function raster(tri){
  const [a,b,c]=tri.pts,den=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);if(Math.abs(den)<.00001)return;
  const x0=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),x1=Math.min(W-1,Math.ceil(Math.max(a.x,b.x,c.x))),
   y0=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),y1=Math.min(H-1,Math.ceil(Math.max(a.y,b.y,c.y)));
  const mt=tri.mt,tex=tri.texture,color=[mt.color.r,mt.color.g,mt.color.b],shade=tri.shade;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   const xx=x+.5,yy=y+.5,l0=((b.y-c.y)*(xx-c.x)+(c.x-b.x)*(yy-c.y))/den,
    l1=((c.y-a.y)*(xx-c.x)+(a.x-c.x)*(yy-c.y))/den,l2=1-l0-l1;
   if(l0<-.00001||l1<-.00001||l2<-.00001)continue;
   const inv=l0/a.d+l1/b.d+l2/c.d,z=1/inv,index=y*W+x;if(z>=depth[index])continue;
   let r=255,g=255,bl=255,alpha=mt.opacity;
   if(tex){
    let u=(l0*a.u/a.d+l1*b.u/b.d+l2*c.u/c.d)/inv,v=(l0*a.v/a.d+l1*b.v/b.d+l2*c.v/c.d)/inv;
    u=u*mt.map.repeat.x+mt.map.offset.x;v=v*mt.map.repeat.y+mt.map.offset.y;
    u=u-Math.floor(u);v=v-Math.floor(v);
    const tx=Math.min(tex.width-1,Math.floor(u*tex.width)),ty=Math.min(tex.height-1,Math.floor((1-v)*tex.height)),i=(ty*tex.width+tx)*4;
    r=tex.data[i];g=tex.data[i+1];bl=tex.data[i+2];if(mt.transparent)alpha*=tex.data[i+3]/255;
   }
   if(tri.vertexColor){
    r*=(l0*a.r/a.d+l1*b.r/b.d+l2*c.r/c.d)/inv;
    g*=(l0*a.g/a.d+l1*b.g/b.d+l2*c.g/c.d)/inv;
    bl*=(l0*a.b/a.d+l1*b.b/b.d+l2*c.b/c.d)/inv;
   }
   const j=index*4;pixels[j]=r*color[0]*shade*alpha+pixels[j]*(1-alpha);
   pixels[j+1]=g*color[1]*shade*alpha+pixels[j+1]*(1-alpha);pixels[j+2]=bl*color[2]*shade*alpha+pixels[j+2]*(1-alpha);
   if(mt.depthWrite&&alpha>.03)depth[index]=z;
  }
 }
 for(const tri of opaque)raster(tri);for(const tri of transparent)raster(tri);
 const cv=createCanvas(W,H);cv.getContext('2d').putImageData(new ImageData(pixels,W,H),0,0);
 const output=exteriorPreview?createCanvas(960,640):cv;if(exteriorPreview)output.getContext('2d').drawImage(cv,0,0,960,640);
 fs.writeFileSync('.preview/'+name+'.png',output.toBuffer('image/png'));console.log(name);
}
if(college2Interior){
 render('корпус-2-холл',[.05,1.68,-1.02],[-.44,1.42,-7]);
 render('корпус-2-вид-на-вход',[.10,1.68,-5.15],[0,1.42,0]);
 render('корпус-2-зона-ожидания',[1.66,1.68,-4.52],[4.19,1.32,-4.33]);
 render('корпус-2-фотовыставка',[.45,1.68,-7.64],[-3.32,1.23,-9.73]);
 render('корпус-2-коридор',[.53,1.68,-12.49],[1.04,1.45,-31.6]);
 render('корпус-2-зал-достижений',[-2.38,1.68,-31.78],[.85,1.40,-33.45]);
 process.exit(0);
}
if(college2Entrance){
 render('корпус-2-южный-вход',[4.25,1.74,21.1],[13.65,3.9,10.5]);
 render('корпус-2-южный-вход-прямо',[13.5,2.6,25.8],[13.7,4.06,10.9]);
 render('корпуса-2-и-3-проезд',[3.15,8.9,17.9],[20.8,0,20.8]);
 process.exit(0);
}
if(sidePassages){
 render('корпус-1-проезд-слева',[-3.35,1.7,-12.1],[-1.8,1.62,-29.2]);
 render('корпус-1-проезд-справа',[-1.8,1.7,-3.4],[-1.6,1.55,17.5]);
 render('корпус-1-фасад-вдоль-елей',[2.35,2.1,15.65],[-6,3.42,11.4]);
 render('корпус-1-выход-к-спортплощадке',[-2.13,1.7,23],[-12,1.59,33.25]);
 process.exit(0);
}
if(exitView){
 const entrance=source.match(/returnPosition:\[([^\]]+)\]/)[1].split(',').map(Number);
 render('корпус-1-вид-с-выхода',entrance,[8,entrance[1],entrance[2]]);
 render('корпус-1-вид-на-галерею-слева',[-5.45,1.7,-7],[8,2,-17]);
 render('корпус-1-вид-на-галерею-справа',[.35,1.7,-7.5],[8,3.05,1.4]);
 render('корпус-2-вход-под-навесом',[-.6,2.08,-16],[7.65,1.66,-21.1]);
 render('корпус-2-правый-край-галереи',[.8,2.3,5.75],[8,2,7.55]);
 console.log('CPU exit view previews:',triangles.length,'triangles');process.exit(0);
}
if(exteriorPreview){
 const suffix=process.argv.includes('--before')?'-до':'-после';
 render('корпус-1-фасад-общий'+suffix,[2.4,2.3,-7],[-8.8,3.8,-7]);
 render('корпус-1-фасад-вход'+suffix,[-1.3,1.7,-6.8],[-8.8,3.1,-7]);
 render('корпус-1-фасад-пандус'+suffix,[-1.5,1.7,-11.5],[-8.8,2,-7.9]);
 console.log('CPU exterior previews:',triangles.length,'triangles');process.exit(0);
}
if(collegePreview&&process.argv.includes('--wardrobe-closure-only')){
 const mv=(name,e,t)=>render(name,[13.9+e[0],e[1],7.85-e[2]],[13.9+t[0],t[1],7.85-t[2]]);
 const suffix=process.argv.includes('--before')?'-до':'-после';
 mv('гардероб-закрытие-общий-вид'+suffix,[7.7,-.17,5.35],[2.4,-.3,4.8]);
 mv('гардероб-закрытие-крыша-слева'+suffix,[6.9,-.17,4.925],[3.2,-.7,3.8]);
 mv('гардероб-закрытие-над-спуском'+suffix,[7.7,-.17,6.2],[1.8,-.7,7.05]);
 mv('гардероб-закрытие-под-потолком'+suffix,[2.5,-2.04,6.95],[2.5,-1.55,3.9]);
 console.log('CPU wardrobe enclosure previews complete:',triangles.length,'triangles');process.exit(0);
}
if(collegePreview&&process.argv.includes('--final-ground-only')){
 const cv=(name,e,t)=>render(name,[-15.4+e[0],e[1],9.45-e[2]],[-15.4+t[0],t[1],9.45-t[2]]);
 cv('первый-этаж-финал-гранитный-переход',[-.9,1.7,2.8],[-.9,1.5,10.8]);
 cv('первый-этаж-финал-проём',[-.9,1.7,8.7],[-.9,1.5,12]);
 cv('первый-этаж-финал-114',[-1.85,1.7,10.95],[-.45,1.45,12.3]);
 cv('первый-этаж-финал-окно',[-4.2,1.7,11.05],[.75,1.5,11.05]);
 cv('первый-этаж-финал-длинный-коридор',[-2.5,1.7,11.05],[-29.8,1.5,11.05]);
 cv('первый-этаж-финал-116-окно-кабинета',[-5.8,1.7,10.6],[-8.1,1.6,12.3]);
 cv('первый-этаж-финал-118-стенды',[-9.5,1.7,11.05],[-27,1.6,11.05]);
 cv('первый-этаж-финал-электрощитовая',[-6.9,1.7,11.1],[-6.9,1.5,9.8]);
 cv('первый-этаж-финал-портреты',[-18,1.7,10.7],[-19.5,2,12.3]);
 cv('первый-этаж-финал-119-120',[-24.4,1.7,11.05],[-29.8,1.5,11.05]);
 cv('первый-этаж-финал-выход-и-стол',[-27.5,1.7,11.05],[-30,1.5,11.05]);
 cv('первый-этаж-финал-обратно',[-24,1.7,11.05],[.5,1.6,11.05]);
 console.log('CPU final ground wing complete:',triangles.length,'triangles');process.exit(0);
}
if(collegePreview&&process.argv.includes('--wardrobe-only')){
 const mv=(name,e,t)=>render(name,[13.9+e[0],e[1],7.85-e[2]],[13.9+t[0],t[1],7.85-t[2]]);
 mv('гардероб-спуск-первый',[3.0,1.5,4.925],[7.5,-.9,4.925]);
 mv('гардероб-разворот',[7.8,-.17,4.925],[4.3,-2.5,7.025]);
 mv('гардероб-лестница-вниз',[6.6,-.17,7.025],[2.4,-2.1,7.025]);
 mv('гардероб-нижняя-площадка',[3.1,-2.04,7.0],[1.4,-2.2,6.6]);
 mv('гардероб-свободный-вход',[2.5,-2.04,6.95],[2.5,-2.12,3.5]);
 mv('гардероб-проход',[2.5,-2.04,4.6],[2.5,-2.1,-3]);
 mv('гардероб-секция-первая',[2.4,-2.04,2.0],[5.7,-2.2,2.0]);
 mv('гардероб-крючки-и-куртки',[4.0,-2.04,2.8],[5.7,-2.2,1.3]);
 mv('гардероб-дальняя-секция',[3.6,-2.04,-2.6],[5.6,-2.3,-3.4]);
 mv('гардероб-обратно-к-лестнице',[2.5,-2.04,-2.7],[2.5,-2.1,6.5]);
 console.log('CPU wardrobe previews complete:',triangles.length,'triangles');process.exit(0);
}
if(collegePreview&&process.argv.includes('--photo-fixes-only')){
 const sv=(name,e,t)=>render(name,[-15.4+e[0],e[1],9.45-e[2]],[-15.4+t[0],t[1],9.45-t[2]]);
 const mv=(name,e,t)=>render(name,[13.9+e[0],e[1],7.85-e[2]],[13.9+t[0],t[1],7.85-t[2]]);
 sv('правки-знаки-на-стене',[-.05,5.44,10.9],[-.65,5.3,8.7]);
 sv('правки-поручень-второй',[-4.625,5.44,4.4],[-5.1,3.5,7.4]);
 sv('правки-стык-площадки',[-2.7,5.44,3.9],[.1,3.5,3.9]);
 mv('правки-поручень-первый',[7.725,5.44,.975],[7.725,2.5,6.4]);
 mv('правки-стена-без-мерцания',[7.5,5.44,.9],[6.6,4.2,8]);
 mv('правки-откос',[2.4,1.7,10.5],[2.4,1.55,7.5]);
 mv('правки-стойки-на-полу',[7.4,-.17,4.925],[6.2,.3,3.56]);
 mv('правки-стойки-на-ступенях',[7.6,-.17,4.925],[3.4,.8,4.925]);
 mv('правки-выход-слева',[5.9,1.7,2.2],[6.2,1.2,.05]);
 render('правки-кубки',[3.8,1.7,6.1],[5.76,1.3,6.1]);
 sv('правки-пальмы',[-3.1,1.7,3.7],[-3.8,1.55,2.6]);
 console.log('CPU photo-fix previews complete:',triangles.length,'triangles');process.exit(0);
}
if(collegePreview&&process.argv.includes('--after-stairs-only')){
 const cv=(name,eye,target)=>render(name,[-15.4+eye[0],3.74+eye[1],9.45-eye[2]],[-15.4+target[0],3.74+target[1],9.45-target[2]]);
 cv('после-лестницы-площадка',[0,1.7,.35],[-.65,1.55,9.9]);
 cv('после-лестницы-вход',[-.65,1.7,8.9],[-.65,1.6,11.5]);
 cv('после-лестницы-длинный-коридор',[-.65,1.7,11.05],[-29.8,1.5,11.05]);
 cv('после-лестницы-к-окну',[-5,1.7,11.05],[.75,1.65,11.05]);
 cv('после-лестницы-215-скамейка',[-9.2,1.7,10.45],[-9.2,1.45,12.3]);
 cv('после-лестницы-матовая-дверь',[-5,1.7,11.5],[-5,1.4,9.8]);
 cv('после-лестницы-221-торец',[-24,1.7,11.05],[-30,1.5,11.05]);
 console.log('CPU continuation complete:',triangles.length,'triangles');process.exit(0);
}
if(collegePreview&&process.argv.includes('--second-stairs-only')){
 const cv=(name,eye,target)=>render(name,[-15.4+eye[0],eye[1],9.45-eye[2]],[-15.4+target[0],target[1],9.45-target[2]]);
 cv('корпус-1-вторая-лестница-проход',[-.9,1.7,1.9],[-.9,1.6,8.8]);
 cv('корпус-1-вторая-лестница-вход',[-.9,1.7,3.8],[-5.4,1.3,3.8]);
 cv('корпус-1-вторая-лестница-площадка',[-3,1.7,3.4],[-3,2.2,7.5]);
 cv('корпус-1-вторая-лестница-наверх',[-2.725,1.7,4.3],[-2.725,2.6,8.8]);
 cv('корпус-1-вторая-лестница-сверху',[-3.85,5.44,4.15],[-3.675,.85,7.35]);
 cv('корпус-1-вторая-лестница-мост',[0,5.44,.5],[0,5.3,8.8]);
 cv('корпус-1-вторая-лестница-верхний-вход',[-.5,5.44,3.8],[-4.625,4.3,5.1]);
 cv('корпус-1-вторая-лестница-закрытая-стена',[0,5.44,1.6],[-3.8,4.9,2]);
 cv('корпус-1-вторая-лестница-кухня',[-2.725,-2.04,5.9],[-2.725,-2.1,4.85]);
 cv('корпус-1-вторая-лестница-спуск',[-4.625,1.7,4.2],[-4.625,-.2,8.9]);
 cv('корпус-1-вторая-лестница-разворот-вниз',[-4.625,-.17,8.7],[-2.725,-2,5.5]);
 cv('корпус-1-вторая-лестница-верхние-окна',[-4.625,5.44,4.3],[-4.625,2.2,9.2]);
 console.log('CPU second staircase complete:',triangles.length,'triangles');process.exit(0);
}
if(collegePreview&&process.argv.includes('--upper-left-only')){
 const cv=(name,eye,target)=>render(name,[13.9+eye[0],3.74+eye[1],7.85-eye[2]],[13.9+target[0],3.74+target[1],7.85-target[2]]);
 cv('корпус-1-2-этаж-левый-проём',[1.25,1.7,.7],[.9,1.5,-3.9]);
 cv('корпус-1-2-этаж-левый-к-окну',[-3.6,1.7,-2.85],[2.3,1.55,-2.85]);
 cv('корпус-1-2-этаж-левый-длинный',[.4,1.7,-2.85],[-30.7,1.6,-2.85]);
 cv('корпус-1-2-этаж-левый-балки',[-5,1.7,-2.85],[-23,1.55,-2.85]);
 cv('корпус-1-2-этаж-левый-214',[-16,1.7,-3.3],[-19,1.5,-1.6]);
 cv('корпус-1-2-этаж-левый-дальний-торец',[-27.1,1.7,-2.85],[-30.7,1.5,-2.5]);
 cv('корпус-1-2-этаж-левый-дальний-проход',[-29.1,1.7,-3],[-29.3,1.3,.4]);
 cv('корпус-1-2-этаж-левый-обратно',[-26.2,1.7,-2.85],[2.3,1.55,-2.85]);
 console.log('CPU left-wing preview complete:',triangles.length,'triangles');process.exit(0);
}
if(collegePreview&&process.argv.includes('--upper-only')){
 const cv=(name,eye,target)=>render(name,[13.9+eye[0],3.74+eye[1],7.85-eye[2]],[13.9+target[0],3.74+target[1],7.85-target[2]]);
 cv('корпус-1-2-этаж-площадка',[4.8,1.7,1.1],[.2,1.4,4]);
 cv('корпус-1-2-этаж-стеллажи',[2.8,1.7,4],[.2,1.35,4]);
 cv('корпус-1-2-этаж-правый-проём',[1.25,1.7,7],[1.25,1.55,11.5]);
 cv('корпус-1-2-этаж-к-окну',[5.5,1.7,10.85],[.2,1.6,10.85]);
 cv('корпус-1-2-этаж-длинный-коридор',[3.5,1.7,10.85],[30.7,1.6,10.85]);
 cv('корпус-1-2-этаж-открытые-двери',[17,1.7,10.85],[28.5,1.5,10.85]);
 cv('корпус-1-2-этаж-обратно',[24,1.7,10.85],[.2,1.55,10.85]);
 cv('корпус-1-2-этаж-вид-на-лестницу',[7.5,1.7,.9],[7.5,-.4,6]);
 console.log('CPU upper-floor preview complete:',triangles.length,'triangles');process.exit(0);
}
if(collegePreview&&process.argv.includes('--continuation-only')){
 const cv=(name,eye,target)=>render(name,[13.9+eye[0],eye[1],7.85-eye[2]],[13.9+target[0],target[1],7.85-target[2]]);
 cv('корпус-1-продолжение-вход',[2.4,1.7,7.2],[2.4,1.55,11.7]);
 cv('корпус-1-продолжение-к-окну',[7.2,1.7,10.85],[.7,1.55,10.85]);
 cv('корпус-1-продолжение-длинный',[2.35,1.7,10.85],[30.7,1.55,10.85]);
 cv('корпус-1-продолжение-ниша',[3.8,1.6,9.9],[3.8,1.5,12.5]);
 cv('корпус-1-продолжение-кабинеты',[11.5,1.7,10.5],[14,1.5,12.1]);
 cv('корпус-1-продолжение-закрытый-выход',[28.2,1.7,10.85],[30.7,1.65,10.85]);
 cv('корпус-1-продолжение-обратно',[29,1.7,10.85],[1,1.5,10.85]);
 console.log('CPU continuation preview complete:',triangles.length,'triangles');process.exit(0);
}
if(collegePreview&&process.argv.includes('--sketch')){render('корпус-1-поворот-по-наброску',[14.5,1.7,4.75],[19.9,1.4,4.85]);process.exit(0)}
if(collegePreview){
 if(!process.argv.includes('--stairs-only')){
 render('корпус-1-прихожая',[0,1.7,1.425],[5.7,2.35,1.425]);
 render('корпус-1-вход',[0,1.7,2],[0,1.8,0]);
 render('корпус-1-турникеты',[0,1.7,3.9],[0,1.6,11.05]);
 render('корпус-1-стойка',[-.3,1.7,8.0],[-4.25,1.2,4.4]);
 render('корпус-1-пост-фасад',[-1.3,1.7,6.1],[-3.45,1.0,4.6]);
 render('корпус-1-пост-изнутри',[-5.4,1.7,5.8],[-3.9,1.05,3.7]);
 render('корпус-1-пост-вход',[-5.5,1.7,6.9],[-4.4,.9,4.3]);
 render('корпус-1-короткое-ограждение',[1.1,1.7,7.3],[3.1,.95,4.75]);
 render('корпус-1-витрина',[2.6,1.7,7.0],[5.8,1.5,6.1]);
 render('корпус-1-обратный-ракурс',[0,1.7,8.3],[0,1.6,3.1]);
 render('корпус-1-двери-BQFQ',[0,1.7,7.6],[.3,1.65,11.1]);
 render('корпус-1-правый-коридор',[-6.6,1.7,8.975],[-17.8,1.55,8.975]);
 render('корпус-1-коридор-обратно',[-16.3,1.7,8.975],[-6.2,1.6,8.975]);
 render('корпус-1-проём-исправлен',[-3.4,1.7,9.05],[-6.1,1.6,8.6]);
 render('корпус-1-левый-проход',[2.7,1.7,8.975],[6.2,1.6,8.975]);
 render('корпус-1-левый-коридор',[6.6,1.7,8.975],[17.8,1.55,8.975]);
 render('корпус-1-левое-окно-растения',[15.7,1.7,8.975],[18.05,1.4,8.975]);
 render('корпус-1-левый-коридор-обратно',[16.2,1.7,8.975],[5.8,1.6,8.975]);
 }
 render('корпус-1-лестничный-проём',[16.3,1.7,9.1],[16.3,1.45,6.0]);
 const stairView=(name,eye,target)=>render(name,[13.9+eye[0],eye[1],7.85-eye[2]],[13.9+target[0],target[1],7.85-target[2]]);
 stairView('корпус-1-лестничный-холл',[2.4,1.7,.65],[4.0,1.7,4.4]);
 stairView('корпус-1-лестница-вид-на-вход',[2.5,1.7,7.2],[4.5,1.55,.7]);
 stairView('корпус-1-лестница-снизу',[3.65,1.87,7.025],[7.4,2.6,7.025]);
 stairView('корпус-1-лестница-со-второго',[7.725,5.44,.975],[7.725,2.5,6.4]);
 stairView('корпус-1-подъём-прямо',[7.725,3.57,7.35],[7.725,4.1,.4]);
 stairView('корпус-1-поворот-вправо',[7.725,5.44,.975],[2.2,5.3,.975]);
 stairView('корпус-1-лестница-вниз',[3.1,1.7,4.925],[7.4,-.5,4.925]);
 stairView('корпус-1-лестница-у-стены',[1.6,1.7,5.95],[6,1.6,6.5]);
 stairView('корпус-1-продолжение-прямо',[2.4,1.7,6.3],[2.4,1.6,10.7]);
 stairView('корпус-1-аварийный-выход-слева',[3.1,1.7,2],[4.6,1.2,.05]);
 console.log('CPU college preview complete:',triangles.length,'triangles');process.exit(0);
}
if(entrancePreview){render('дверь-квартиры-для-превью',[-1.6,4.7,1.32],[-2.94,4.45,1.32]);process.exit(0)}
if(homePreview){
 render('скамейки-исправлены',[29.6,1.7,7],[29.6,1.15,2.2]);
 render('скамейки-исправлены-сбоку',[25.9,1.6,6.3],[28.4,.8,3.5]);process.exit(0);
}
if(yardPreview){render('площадка-без-деревьев',[55,22,16],[27,.1,36]);process.exit(0)}
if(bathroomPreview){render(process.argv.includes('--bath-open')?'туалет-дверь-открыта':'туалет-дверь-закрыта',[.1,1.6,1.32],[-1.1,1.05,1.32]);process.exit(0)}
render('квартира-гостиная',[-1.95,1.6,-.92],[-2.1,1.3,-4.7]);
render('квартира-гостиная-обратно',[-2.08,1.6,-4.25],[-2.1,1.25,-.2]);
render('квартира-комната',[1.91,1.6,-1.2],[2,1.32,-4.8]);
render('квартира-кухня',[1.14,1.58,1.12],[3.1,1.12,1.55]);
render('квартира-ванная',[-1.03,1.6,1.23],[-2.4,1.12,1.1]);
render('квартира-коридор',[.32,1.6,1.75],[.22,1.25,-1.4]);
render('цветок-исправлен',[2.65,1.4,1.8],[1.62,.5,2.43]);
console.log('CPU preview complete:',triangles.length,'triangles');
