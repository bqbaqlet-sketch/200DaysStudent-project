// BEGIN GUARD_POST_EXTERIOR
// The gatehouse uses the same panel module and muted blue trim as the college facades.
function buildGuardPost(){
 const root=new THREE.Group();root.name='college-guard-post';root.position.set(7.2,0,38);S.add(root);
 const palette={
  wall:0xaab2b8,blue:0x135b8e,deep:0x173e59,metal:0xb4bec3,rubber:0x293740,
  base:0x8b8b83,step:0xa8a9a1,edge:0x626d72,roof:0x6b7a85,glass:0x9eb7c5
 };
 const material=(color,extra={})=>new THREE.MeshPhongMaterial({color,shininess:22,...extra});
 const p={wall:material(palette.wall),blue:material(palette.blue),deep:material(palette.deep),
  metal:material(palette.metal,{shininess:74,specular:0x778d99}),rubber:material(palette.rubber),
  base:material(palette.base),step:material(palette.step),edge:material(palette.edge),roof:material(palette.roof),
  panel:material(0x79909b),white:material(0xd9e0e0),vent:material(0x455762)};
 const unit=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,10),batches=new Map(),dummy=new THREE.Object3D();
 function instance(geometry,mt,position,scale,quaternion){
  dummy.position.copy(position);dummy.scale.copy(scale);dummy.quaternion.copy(quaternion??new THREE.Quaternion());dummy.updateMatrix();
  const key=geometry.uuid+':'+mt.uuid;if(!batches.has(key))batches.set(key,{geometry,mt,matrices:[]});batches.get(key).matrices.push(dummy.matrix.clone());
 }
 function box(x1,y1,z1,x2,y2,z2,mt){instance(unit,mt,new THREE.Vector3((x1+x2)/2,(y1+y2)/2,(z1+z2)/2),new THREE.Vector3(x2-x1,y2-y1,z2-z1));}
 function tube(a,b,r,mt=p.metal){const start=new THREE.Vector3(...a),axis=new THREE.Vector3(...b).sub(start);instance(cylinder,mt,start.addScaledVector(axis,.5),new THREE.Vector3(r,axis.length(),r),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),axis.normalize()));}
 const canvas=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c};
 const map=(image,repeat=false)=>{const t=new THREE.CanvasTexture(image);t.anisotropy=4;if(repeat)t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;};
 const claddingMap=map(canvas(256,64,(g,w,h)=>{
  const color=g.createLinearGradient(0,0,0,h);color.addColorStop(0,'#c0c7cb');color.addColorStop(.15,'#b5bdc2');color.addColorStop(1,'#a5afb7');
  g.fillStyle=color;g.fillRect(0,0,w,h);g.fillStyle='#5f6e795c';g.fillRect(0,h-3,w,3);g.fillRect(w-2,0,2,h);
  g.fillStyle='#e4e9e756';g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);
 }),true);
 const cladding=material(0xffffff,{map:claddingMap,shininess:16});
 const glassMap=map(canvas(256,256,(g,w,h)=>{
  const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#8daec2');sky.addColorStop(.48,'#afc3c9');sky.addColorStop(.65,'#788d96');sky.addColorStop(1,'#3f5c6c');
  g.fillStyle=sky;g.fillRect(0,0,w,h);
  g.fillStyle='#5d737b';g.beginPath();g.moveTo(0,162);g.lineTo(63,145);g.lineTo(118,158);g.lineTo(178,143);g.lineTo(256,151);g.lineTo(256,256);g.lineTo(0,256);g.fill();
  g.fillStyle='#adc1c5';g.fillRect(0,169,w,48);g.fillStyle='#31698b';g.fillRect(0,169,w,6);
  for(let x=9;x<w;x+=41){g.fillStyle='#315467';g.fillRect(x,184,24,25);g.fillStyle='#7799a5';g.fillRect(x+11,184,2,25)}
  g.fillStyle='#e6f0ed17';g.beginPath();g.moveTo(15,0);g.lineTo(39,0);g.lineTo(189,h);g.lineTo(156,h);g.fill();
 }));
 const glass=material(0xffffff,{map:glassMap,shininess:85,specular:0x688e9e,transparent:true,opacity:.36,depthWrite:false,side:THREE.DoubleSide});
 const doorGlass=material(0xb2c5ce,{map:glassMap,shininess:85,specular:0x6d8c9c,transparent:true,opacity:.42,depthWrite:false,side:THREE.DoubleSide});
 const floorMap=map(canvas(256,256,(g,w,h)=>{
  g.fillStyle='#969a97';g.fillRect(0,0,w,h);g.strokeStyle='#67716d';g.lineWidth=2;
  for(let y=0;y<=h;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();for(let x=(y/64)%2?32:0;x<w;x+=64){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+64);g.stroke();}}
  g.fillStyle='#ccd0ca22';for(let i=0;i<130;i++)g.fillRect((i*73)%w,(i*47)%h,2,1);
 }),true);
 const apron=new THREE.Mesh(new THREE.PlaneGeometry(1.55,3.5),material(0xffffff,{map:floorMap,shininess:9}));
 apron.rotation.x=-Math.PI/2;apron.position.set(-2.45,.011,.15);apron.geometry.attributes.uv.array.forEach((v,i,a)=>a[i]=v*(i%2?3.5:1.55));root.add(apron);
 box(-2.18,0,-2.18,2.18,.32,2.18,p.base);
 box(-1.84,.32,-1.84,1.84,.335,1.84,p.step);
 box(-2,3.24,-2,2,3.32,2,p.wall);
 box(-2.035,.32,-2.035,-1.98,.47,-.30,p.edge);
 box(-2.035,.32,.80,-1.98,.47,2.035,p.edge);
 box(1.98,.32,-2.035,2.035,.47,2.035,p.edge);
 box(-1.98,.32,-2.035,1.98,.47,-1.98,p.edge);
 box(-1.98,.32,1.98,1.98,.47,2.035,p.edge);
 // Preserve the existing footprint, leaving the driveway and barrier pedestal clear.
 cols.push([5,35.8,9.4,40.2]);collegeFlightObstacles.push([5,35.8,9.4,40.2,3.57]);

 function face(x,z,ry,width=4,holes=[]){
  const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=ry;root.add(group);
  const xs=[...new Set([-width/2,width/2,...holes.flatMap(h=>[h[0],h[2]])])].sort((a,b)=>a-b);
  const ys=[...new Set([.32,3.32,...holes.flatMap(h=>[h[1],h[3]])])].sort((a,b)=>a-b);
  for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){
   const a=xs[i],b=xs[i+1],bottom=ys[j],top=ys[j+1],cx=(a+b)/2,cy=(bottom+top)/2;
   if(holes.some(h=>cx>h[0]&&cx<h[2]&&cy>h[1]&&cy<h[3]))continue;
   part(group,a,bottom,-.16,b,top,0,p.wall);
   const geometry=new THREE.PlaneGeometry(b-a,top-bottom),uv=geometry.attributes.uv;
   for(let k=0;k<uv.count;k++)uv.setXY(k,(a+uv.getX(k)*(b-a)+width/2)/1.15,(bottom+uv.getY(k)*(top-bottom)-.47)/.29);
   const panel=new THREE.Mesh(geometry,cladding);panel.position.set(cx,cy,.006);group.add(panel);
  }
  return group;
 }
 const front=face(-2,0,-Math.PI/2,4,[[-1.70,1.08,-.67,2.43],[-.30,.335,.80,2.61]]),road=face(0,2,0,4,[[-1.46,1.10,1.48,2.43]]),rear=face(2,0,Math.PI/2),north=face(0,-2,Math.PI,4,[[-.95,1.14,.95,2.43]]);
 function part(face,x1,y1,z1,x2,y2,z2,mt){
  const position=new THREE.Vector3((x1+x2)/2,(y1+y2)/2,(z1+z2)/2).applyEuler(face.rotation).add(face.position);
  instance(unit,mt,position,new THREE.Vector3(x2-x1,y2-y1,z2-z1),face.quaternion);
 }
 function pane(face,x1,y1,x2,y2,mt,z=.062){const plane=new THREE.Mesh(new THREE.PlaneGeometry(x2-x1,y2-y1),mt);plane.position.set((x1+x2)/2,(y1+y2)/2,z);face.add(plane);return plane;}
 function window(face,left,right,bottom,top,divisions,name){

  const paneMesh=pane(face,left+.05,bottom+.05,right-.05,top-.05,glass);paneMesh.name=name;
  for(const x of [left,right-.048])part(face,x,bottom,.054,x+.048,top,.10,p.metal);
  for(const y of [bottom,top-.048])part(face,left,y,.054,right,y+.048,.10,p.metal);
  for(let i=1;i<divisions;i++){const x=left+(right-left)*i/divisions;part(face,x-.021,bottom+.048,.064,x+.021,top-.048,.103,p.metal);}
  const vent=top-.29;part(face,left+.048,vent,.065,right-.048,vent+.028,.105,p.metal);
  part(face,left-.055,bottom-.058,.022,right+.055,bottom-.018,.17,p.metal);
 }
 window(front,-1.70,-.67,1.08,2.43,1,'guard-window-entry');
 window(road,-1.46,1.48,1.10,2.43,3,'guard-window-driveway');
 window(north,-.95,.95,1.14,2.43,2,'guard-window-campus');
 // Real hinged leaf over a real opening; only the guard uses this service entrance.
 const doorLeft=-.30,doorRight=.80,bottom=.335,top=2.61;
 for(const x of [doorLeft-.055,doorRight])part(front,x,bottom,.012,x+.055,top+.055,.070,p.blue);
 part(front,doorLeft-.055,top,.012,doorRight+.055,top+.055,.070,p.blue);
 part(front,doorLeft-.025,.32,.02,doorRight+.025,.342,.22,p.metal);
 const hinge=new THREE.Group();hinge.name='guard-post-door';hinge.position.set(doorLeft,bottom,.078);front.add(hinge);
 const leafBox=(x1,y1,z1,x2,y2,z2,mt)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(x2-x1,y2-y1,z2-z1),mt);mesh.position.set((x1+x2)/2,(y1+y2)/2,(z1+z2)/2);hinge.add(mesh);return mesh};
 const width=doorRight-doorLeft,height=top-bottom;
 for(const x of [0,width-.055])leafBox(x,0,0,x+.055,height,.051,p.white);
 for(const y of [0,.815,height-.055])leafBox(0,y,0,width,y+.055,.051,p.white);
 leafBox(.055,.055,.004,width-.055,.325,.018,p.panel);
 leafBox(.055,.325,.008,width-.055,.815,.023,doorGlass);
 leafBox(.055,.870,.008,width-.055,height-.055,.023,doorGlass);
 leafBox(width-.17,.68,.053,width-.11,1.145,.066,p.panel);
 leafBox(width-.15,.72,.066,width-.125,1.10,.094,p.metal);
 leafBox(width-.15,.68,-.052,width-.125,1.10,-.026,p.metal);
 for(const y of [.425,1.135,1.885])leafBox(-.006,y,.022,.025,y+.071,.067,p.metal);
 root.setDoorOpen=amount=>{hinge.rotation.y=1.47*characterEase(amount);root.userData.closed=amount<.001;root.userData.doorOpen=amount;};

 // A simple private work area, visible through the observation windows.
 const wood=material(0x756555),seat=material(0x354c57);
 box(.75,1.075,.33,1.65,1.125,1.47,wood);
 for(const x of [.80,1.60])for(const z of [.38,1.42])box(x-.025,.335,z-.025,x+.025,1.075,z+.025,p.metal);
 box(-.65,.785,.66,-.15,.83,1.14,seat);
 box(-.68,.79,.66,-.63,1.30,1.14,seat);
 for(const x of [-.62,-.18])for(const z of [.69,1.11])box(x-.02,.335,z-.02,x+.02,.79,z+.02,p.metal);
 box(.94,1.126,.57,1.27,1.143,1.06,p.white);
 box(1.38,1.125,1.10,1.49,1.26,1.21,p.white);

 // Two low stone steps with thin dark nosings, instead of one oversize plain block.
 box(-2.64,.005,-.73,-2.18,.32,1.23,p.step);
 box(-3.05,.005,-.80,-2.64,.16,1.30,p.step);
 box(-2.66,.301,-.73,-2.63,.322,1.23,p.edge);
 box(-3.065,.141,-.80,-3.04,.163,1.30,p.edge);
 box(-2.17,.321,-.60,-1.995,.328,1.10,p.deep);

 // A small metal canopy and a warm, unshadowed entry light add depth without extra lights.
 box(-2.64,2.765,-.58,-1.98,2.805,1.08,p.roof);
 box(-2.66,2.782,-.60,-2.62,2.83,1.10,p.metal);
 for(const z of [-.44,.94])tube([-2.50,2.765,z],[-2.015,2.56,z],.013,p.metal);
 box(-2.32,2.748,.06,-2.05,2.766,.45,new THREE.MeshBasicMaterial({color:0xf5edd4}));
 const signMap=map(canvas(640,96,(g,w,h)=>{
  g.fillStyle='#193f59';g.fillRect(0,0,w,h);g.strokeStyle='#9eafb8';g.lineWidth=3;g.strokeRect(3,3,w-6,h-6);
  g.fillStyle='#edf1ef';g.textAlign='center';g.textBaseline='middle';g.font='600 43px Arial';g.fillText('КПП · ОХРАНА',w/2,h/2+2,w-38);
 }));
 part(front,-.78,2.94,.016,1.28,3.19,.065,p.metal);
 pane(front,-.765,2.955,1.265,3.175,new THREE.MeshBasicMaterial({map:signMap}),.067).name='guard-post-sign';

 // Thin corner trims and a layered roof cap match the nearby college buildings.
 for(const face of [front,road,rear,north])for(const u of [-2,1.88])part(face,u,.47,.012,u+.12,3.31,.062,p.blue);
 box(-2.10,3.30,-2.10,2.10,3.345,2.10,p.deep);
 box(-2.12,3.345,-2.12,2.12,3.49,2.12,p.blue);
 box(-2.16,3.49,-2.16,2.16,3.545,2.16,p.metal);
 box(-2.025,3.505,-2.025,2.025,3.53,2.025,p.roof);
 tube([-2.08,3.39,-2.105],[2.10,3.39,-2.105],.036,p.roof);
 tube([2.10,3.39,-2.105],[2.10,3.30,-1.82],.036,p.roof);
 tube([2.10,3.30,-1.82],[2.10,.39,-1.82],.036,p.roof);
 tube([2.10,.39,-1.82],[2.23,.28,-1.82],.036,p.roof);
 for(const y of [.66,1.75,2.86])box(2.03,y-.025,-1.87,2.15,y+.025,-1.77,p.metal);
 // Small service grille on the rear face.
 part(rear,-.35,1.61,.012,.35,2.12,.042,p.metal);
 part(rear,-.31,1.65,.043,.31,2.08,.052,p.vent);
 for(let y=1.675;y<2.08;y+=.055)part(rear,-.29,y,.054,.29,y+.023,.071,p.roof);
 let parts=0;for(const {geometry,mt,matrices} of batches.values()){
  const mesh=new THREE.InstancedMesh(geometry,mt,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;root.add(mesh);parts+=matrices.length;
 }
 root.userData={kind:'guard-post',facade:'college-panel-cladding',panelModule:[1.15,.29],doorFacing:'-X',closed:true,steps:2,windowFaces:3,batchedParts:parts,collider:[5,35.8,9.4,40.2]};
 return root;
}
const guardPost=buildGuardPost();
// END GUARD_POST_EXTERIOR
