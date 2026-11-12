from pathlib import Path
import shutil

root=Path.cwd(); preview=root/'.preview'; html_path=next(root.glob('*.html'))
html_before=html_path.read_text(encoding='utf-8')
shutil.copy2(html_path,root/'.backups'/'Колледж — до правого крыла второго этажа.html')
stair_path=preview/'college1-stair-hall.js'; old=stair_path.read_text(encoding='utf-8')
shutil.copy2(stair_path,preview/'college1-stair-hall-before-second-floor.js')
def once(s,a,b):
    assert s.count(a)==1,a
    return s.replace(a,b,1)
stairs=once(old,'upperInteriorDeferred:true','upperInteriorDeferred:false,upperLeftDeferred:true')
stairs=once(stairs,'bounds.max.x,bounds.max.z,y]);','bounds.max.x,bounds.max.z,bounds.min.y]);')
# Keep the ground-floor openings and their lintels exactly as built, and cut
# independent openings on the upper floor in the same two end walls.
for a,b in [
('box(0,-2.1,8,1.52,7.15,8.15,p.cream,true);box(3.28,-2.1,8,8.8,7.15,8.15,p.cream,true);','box(0,-2.1,8,1.52,3.74,8.15,p.cream,true);box(3.28,-2.1,8,8.8,3.74,8.15,p.cream,true);'),
('box(1.52,2.65,8,3.28,7.15,8.15,p.cream,true);','box(1.52,2.65,8,3.28,3.74,8.15,p.cream,true);'),
('box(0,-2.1,-.15,1.58,7.15,0,p.cream,true);box(3.22,-2.1,-.15,8.8,7.15,0,p.cream,true);','box(0,-2.1,-.15,1.58,3.74,0,p.cream,true);box(3.22,-2.1,-.15,8.8,3.74,0,p.cream,true);'),
('box(1.58,2.6,-.15,3.22,7.15,0,p.cream,true);','box(1.58,2.6,-.15,3.22,3.74,0,p.cream,true);\n  for(const [v1,v2] of [[-.15,0],[8,8.15]]){\n   box(0,3.74,v1,.35,7.15,v2,p.cream,true);box(2.15,3.74,v1,8.8,7.15,v2,p.cream,true);\n   box(.35,6.44,v1,2.15,7.15,v2,p.cream,true);\n  }'),
('for(const x of [.08,1.5,3.3,5.1,6.8,8.7])box(x-.04,0,7.935,x+.04,7.14,7.97,p.oak);','for(const x of [.08,1.5,3.3,5.1,6.8,8.7]){\n   box(x-.04,0,7.935,x+.04,x===1.5?3.74:7.14,7.97,p.oak);\n   if(x===1.5)box(x-.04,6.44,7.935,x+.04,7.14,7.97,p.oak);\n  }'),
('for(const base of [0,3.74]){','for(const base of [0]){')]:
    stairs=once(stairs,a,b)
partition='''  box(2.08,3.74,0,2.15,6.2,1.9,p.cream,true);
  at(2.16,.975,-Math.PI/2,()=>{
   box(-.61,3.74,-.015,.61,6.14,.04,p.trim);box(-.54,3.77,-.035,.54,6.06,-.015,p.cream);
  });
'''
stairs=once(stairs,partition,'')
window='''  // Парные окна справа от лестницы на уровнях верхнего марша и площадки.
  for(const [v,base] of [[2.95,3.74],[6.1,1.87]]){
   panel(8.715,base+1.91,v,1.7,2.12,outside,-Math.PI/2);
   for(const z of [v-.88,v+.88])box(8.66,base+.82,z-.025,8.73,base+3.01,z+.025,p.frame);
   for(const y of [.84,2.99])box(8.66,base+y-.025,v-.91,8.73,base+y+.025,v+.91,p.frame);
   for(let y=1.57;y<3;y+=.13){box(8.64,base+y,v-.85,8.655,base+y+.073,v+.85,p.blind);box(8.638,base+y+.075,v-.85,8.652,base+y+.104,v+.85,p.blindLight)}
   box(8.35,base+.82,v-.96,8.75,base+.89,v+.96,p.counter);
   box(8.52,base+.13,v-.81,8.7,base+.73,v+.81,p.white);
   for(let z=v-.76;z<v+.81;z+=.1)box(8.49,base+.17,z,8.54,base+.69,z+.035,p.trim);
  }
'''
upper=(preview/'college1-second-floor.js').read_text(encoding='utf-8')
end=stairs.rindex(' });')
stairs=stairs[:end]+window+upper.rstrip()+'\n'+stairs[end:]
builder_path=preview/'college1-interior.js';builder_before=builder_path.read_text(encoding='utf-8')
builder=once(builder_before,old.rstrip(),stairs.rstrip())
builder=once(builder,'layoutVersion:12,','layoutVersion:13,')
builder=once(builder,'function roomAt(x,z,feet=0){','''function roomAt(x,z,feet=0){
  if(feet>3.5){
   if(x>=14.1&&x<=44.75&&z>=-5.9&&z<=-.15)return 'Корпус 1 · 2 этаж · Правый коридор';
   if(x>=14.25&&x<=16.05&&z>7.85&&z<=9.55)return 'Корпус 1 · 2 этаж · Левый проход';
  }''')
a=html_before.index('// ---- Корпус 1: увеличенный холл');b=html_before.index('const COLLEGE_MAIN_ENTRANCE=',a)
html=html_before[:a]+builder.rstrip()+'\n'+html_before[b:]
assert html[:a]==html_before[:a] and html[html.index('const COLLEGE_MAIN_ENTRANCE=',a):]==html_before[b:]
# The long first-floor corridor is preserved verbatim.
marker='  // Продолжение первого этажа по новым фотографиям:'
end_marker="  mark('stairForwardPassage',2.4,8.06,1.76,.24,{open:true,direction:'straight',furtherReferencePending:false});"
assert old[old.index(marker):old.index(end_marker)+len(end_marker)]==stairs[stairs.index(marker):stairs.index(end_marker)+len(end_marker)]
stair_path.write_text(stairs,encoding='utf-8');builder_path.write_text(builder,encoding='utf-8');html_path.write_text(html,encoding='utf-8')
(preview/'college1-stair-hall-corrected-body.js').write_text(stairs[stairs.index(' at(-13.9,7.85'):],encoding='utf-8')
(preview/'college1-layout-v2.js').write_text(builder[builder.index(' // Все координаты плана:'):],encoding='utf-8')

test_path=preview/'check-college1.cjs';test=test_path.read_text(encoding='utf-8')
for a,b in [('layout.layoutVersion,12','layout.layoutVersion,13'),('layout.stairHall.upperInteriorDeferred,true','layout.stairHall.upperInteriorDeferred,false'),('layout.classroomDoors.length,14','layout.classroomDoors.length,22'),('brands.length,14','brands.length,22'),('BQFQDoors:14,','BQFQDoors:22,secondFloorRightWing:true,')]:test=once(test,a,b)
anchor="// The old sideways upper flight must be gone; the new straight flight has usable width."
extra='''// Explore and walk the upper floor independently of the ground floor underneath it.
assert.equal(layout.fixtures.filter(f=>f.kind==='upperLandingEmptyRack'&&f.empty).length,6);
assert.equal(layout.fixtures.filter(f=>f.kind==='upperWindowEmptyRack'&&f.empty).length,2);
assert.equal(layout.classroomDoors.filter(f=>f.wing==='upper-right').length,8);
assert.equal(layout.classroomDoors.filter(f=>f.wing==='upper-right'&&f.open).length,4);
assert(Math.abs(fixture('upperLeftPortal').x-fixture('upperRightPortal').x)<1e-5);
const upperStep=.06,upperGrid=(x,z)=>[Math.round(x/upperStep),Math.round(z/upperStep)];
const upperStart=upperGrid(16.65,6.875),upperKey=(a,b)=>a+','+b,upperQueue=[upperStart],upperParents=new Map([[upperKey(...upperStart),null]]);
const upperBlocked=(x,z)=>college.colliders.some(b=>x>b[0]-.35&&x<b[2]+.35&&z>b[1]-.35&&z<b[3]+.35&&5.39>b[4]+.02&&3.74<b[5]-.02);
for(let i=0;i<upperQueue.length;i++){
 const [a,b]=upperQueue[i];
 for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const aa=a+dx,bb=b+dz,k=upperKey(aa,bb),x=aa*upperStep,z=bb*upperStep;
  const y=college.groundAt(x,z,3.74);
  if(!upperParents.has(k)&&y!==null&&Math.abs(y-3.74)<1e-5&&!upperBlocked(x,z)){
   upperParents.set(k,[a,b]);upperQueue.push([aa,bb]);
  }
 }
}
for(const [name,x,z] of [['racks',15.15,3.8],['leftPortal',15.15,8.7],['rightPortal',15.15,-.8],['window',15.35,-3],['208',17.4,-3.5],['207',21,-2.5],['206',24.6,-2.2],['205',28.3,-3.8],['204',32,-3],['203',35.7,-3.8],['202',39.5,-3],['201',42.5,-3.8],['end',44.05,-3]] ){
 const cell=upperGrid(x,z),key=upperKey(...cell);assert(upperParents.has(key),'Upper '+name+' is unreachable');
 const route=[];let c=cell;
 while(c){route.push([c[0]*upperStep,c[1]*upperStep]);c=upperParents.get(upperKey(...c));}
 route.reverse();
 evaluate(`for(const [x,z] of ${JSON.stringify(route)})if(!walkInterior(x,z))throw Error('Upper route to ${name} blocked at '+x+','+z);`);
 assert(Math.abs(evaluate('feetY')-3.74)<1e-6,'Upper movement must never snap to the ground floor');
 evaluate(`for(const [x,z] of ${JSON.stringify(route.reverse())})if(!walkInterior(x,z))throw Error('Upper return blocked');`);
}
assert.equal(college.roomAt(30,-3,3.74),'Корпус 1 · 2 этаж · Правый коридор');
assert.equal(college.roomAt(30,-3,0),'Корпус 1 · Продолжение коридора');
assert.equal(upperBlocked(44.7,-3),true,'Upper end door must remain solid');
evaluate('walkInterior(16.65,6.875)');
'''
test=once(test,anchor,extra+anchor)
test_path.write_text(test,encoding='utf-8')

render_path=preview/'render-apartment.cjs';render=render_path.read_text(encoding='utf-8');marker="if(collegePreview&&process.argv.includes('--continuation-only')){"
views='''if(collegePreview&&process.argv.includes('--upper-only')){
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
'''
render=once(render,marker,views+marker);render_path.write_text(render,encoding='utf-8')
print('Second floor built: landing, opposing passages, eight empty racks, window, eight classrooms, four open leaves.')
