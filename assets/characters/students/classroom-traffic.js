const classroomTrafficByScene=new WeakMap();
function classroomTrafficFor(anchor){
 let scene=anchor;while(scene.parent)scene=scene.parent;
 if(classroomTrafficByScene.has(scene))return classroomTrafficByScene.get(scene);
 const actors=new Set(),candidate=new THREE.Vector3(),current=new THREE.Vector3(),otherPoint=new THREE.Vector3();
 const traffic={
  register(root){actors.add(root);},
  blocked(root,anchor,state,spawning=false){
   candidate.set(state.x,0,state.z);anchor.localToWorld(candidate);root.getWorldPosition(current);
   for(const other of actors){
    if(other===root||!other.visible)continue;other.getWorldPosition(otherPoint);
    if(Math.abs(candidate.y-otherPoint.y)>.75)continue;
    const radius=other.userData.routinePhase==='seated'?.53:.64;
    const distance=Math.hypot(candidate.x-otherPoint.x,candidate.z-otherPoint.z),before=Math.hypot(current.x-otherPoint.x,current.z-otherPoint.z);
    if(distance<radius&&(spawning||distance<before-.00001))return other.name;
   }
   return null;
  }
 };
 classroomTrafficByScene.set(scene,traffic);return traffic;
}
