// Physical surfaces and solids are derived once from the actual static geometry.
function installCollegeCollision(world){
 if(world.collisionMapping)return;
 const surfaces=[],obstacles=[],seen=new Set(),matrix=new THREE.Matrix4(),local=new THREE.Matrix4();
 const bounds=new THREE.Box3(),surfaceGroups=new Set(['college1-photo-exterior','college2-courtyard']);
 const collisionGroups=new Set([...surfaceGroups,'college-sports-courtyard']);
 const addSolid=(box,name)=>{
  const {min:a,max:b}=box,key=[a.x,a.y,a.z,b.x,b.y,b.z].map(v=>v.toFixed(3)).join(',');
  if(seen.has(key))return;seen.add(key);
  const item=[a.x,a.z,b.x,b.z,a.y,b.y];item.label=name;obstacles.push(item);world.colliders.push(item);
 };
 function inspect(object,transform,stairs){
  const geometry=object.geometry;
  if(!geometry.boundingBox)geometry.computeBoundingBox();
  bounds.copy(geometry.boundingBox).applyMatrix4(transform);
  const a=bounds.min,b=bounds.max,dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z;
  // Overhead roof, lights, shallow trim and purely visual wall panels stay visual.
  if(a.y>2.12||b.y<.025||dy<.005)return;
  if(geometry.type==='BoxGeometry'){
   if((stairs&&b.y<=.65&&dx>.19&&dz>.19)||(!stairs&&b.y<=.235&&dx>.02&&dz>.02)){
    surfaces.push({x1:a.x,z1:a.z,x2:b.x,z2:b.z,height:b.y,name:object.name||'stone-step'});
    // surfaceAt rejects inaccessible sides; padded AABBs would block stair noses.
   }else if(b.y>.18&&dy>.10)addSolid(bounds,object.userData.collisionKind||'static-object');
  }else if(geometry.type==='CylinderGeometry'&&dy>.10){addSolid(bounds,'rail-or-post');}
 }
 world.scene.updateMatrixWorld(true);
 world.scene.traverse(object=>{
  if(!object.isMesh)return;
  let parent=object,group=null,physical=object.userData.collegePhysical;
  while(parent){physical ||= parent.userData.collegePhysical;if(collisionGroups.has(parent.name)){group=parent.name;break;}parent=parent.parent;}
  if(!group&&!physical)return;
  if(object.userData.collegePhysical==='existing')return;
  const stairs=surfaceGroups.has(group);
  if(object.isInstancedMesh){
   for(let i=0;i<object.count;i++){object.getMatrixAt(i,local);matrix.multiplyMatrices(object.matrixWorld,local);inspect(object,matrix,stairs);}
  }else inspect(object,object.matrixWorld,stairs);
 });
 const facade=world.scene.getObjectByName('college1-photo-exterior');
 function localSurface(root,x1,z1,x2,z2,height,name){
  const inverse=root.matrixWorld.clone().invert();
  const points=[[x1,z1],[x1,z2],[x2,z1],[x2,z2]].map(([x,z])=>new THREE.Vector3(x,0,z).applyMatrix4(root.matrixWorld));
  const box=new THREE.Box3().setFromPoints(points);
  surfaces.push({x1:box.min.x,z1:box.min.z,x2:box.max.x,z2:box.max.z,name,
   height(x,z){const p=new THREE.Vector3(x,0,z).applyMatrix4(inverse);return height(p.x,p.z);}});
 }
 if(facade)localSurface(facade,3.7,1.15,7.1,2.10,(x)=>.35-(x-3.7)*.225/3.4,'college1-ramp');
 // Second building's ramp is an extruded triangular prism, not a rectangular box.
 surfaces.push({x1:4.61,z1:11.04,x2:6.24,z2:15.27,
  height:(_x,z)=>.034+(15.27-z)*(.54-.034)/(15.27-11.04),name:'college2-ramp'});
 const previous=world.walkGroundAt;
 function surfaceAt(x,z,feet=null){
  let level=previous?.(x,z,null)??0;
  for(const surface of surfaces){
   if(x<surface.x1-1e-5||x>surface.x2+1e-5||z<surface.z1-1e-5||z>surface.z2+1e-5)continue;
   const height=typeof surface.height==='function'?surface.height(x,z):surface.height;
   level=Math.max(level,height);
  }
  // Only normal step-sized rises; a player cannot teleport onto a landing from its side.
  return feet===null||level-feet<=.235+1e-5?level:null;
 }
 world.walkGroundAt=surfaceAt;
 const previousDynamic=world.dynamicHit;
 function barrierHit(x,z,feet){
  const start=barG.position,endX=start.x-4*Math.cos(barAng),endY=start.y-4*Math.sin(barAng);
  const along=THREE.MathUtils.clamp((x-start.x)/(endX-start.x||-1e-6),0,1);
  const nearest=start.x+(endX-start.x)*along,height=start.y+(endY-start.y)*along;
  return Math.hypot(x-nearest,z-start.z)<.42&&height>feet+.03&&height<feet+1.65;
 }
 world.dynamicHit=(x,z,feet)=>!!previousDynamic?.(x,z,feet)||barrierHit(x,z,feet);
 world.collisionMapping={surfaces,obstacles,surfaceAt,barrierHit};
}
