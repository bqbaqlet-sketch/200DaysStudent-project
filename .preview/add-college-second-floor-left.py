from pathlib import Path
import shutil

r=Path.cwd();p=r/'.preview';h=next(r.glob('*.html'));html_before=h.read_text(encoding='utf-8')
shutil.copy2(h,r/'.backups'/'Колледж — до левого крыла второго этажа.html')
part=p/'college1-second-floor.js';old=part.read_text(encoding='utf-8')
shutil.copy2(part,p/'college1-second-floor-before-left.js')
def once(s,a,b):
    assert s.count(a)==1,a
    return s.replace(a,b,1)

stub='''   stairFloor(.35,-1.7,2.15,0,0,vinyl);
   box(.2,0,-1.85,.35,3.3,0,p.cream,true);box(2.15,0,-1.85,2.3,3.3,0,p.cream,true);
   box(.35,0,-1.85,2.15,3.3,-1.7,p.cream,true);box(.35,3.3,-1.7,2.15,3.43,0,p.ceiling);
   box(.96,3.275,-1.2,1.55,3.3,-.61,p.bulb);
'''
new=once(old,stub,'')
new=once(new,'// Два проёма на одной оси. Левое крыло пока ограничено коротким участком.','// Два проёма на одной оси соединяют площадку с левым и правым крыльями.')
new=once(new,'leftWingDeferred:true','leftWingDeferred:false')
# Reuse exactly the same closed glass door construction on both upper wings.
a=new.index('   // Каркасы и полосы матового стекла');b=new.index('   // Закрытая деревянная дверь',a)
old_doors=new[a:b];doors=old_doors
doors=once(doors,'for(const d of doorPlan){',"function upperClassroom(d,wing='upper-right'){")
doors=once(doors,'const ry=d.v<10?Math.PI:0;','const ry=d.ry??(d.v<10?Math.PI:0);')
doors=once(doors,'at(d.u,d.v<10?9.6:12.1,ry,()=>{','at(d.u,d.v,ry,()=>{')
doors=once(doors,"if(d.n==='207'){","if(d.n==='207'&&wing==='upper-right'){")
doors=once(doors,"brand.name='office-brand-upper-'+d.n;","brand.name='office-brand-'+wing+'-'+d.n;")
doors=once(doors,".name='upper-door-back-'+d.n;",".name=wing+'-door-back-'+d.n;")
doors=once(doors,"wing:'upper-right',open:d.open",'wing,open:d.open')
doors=once(doors,"upperMark('upperClassroomDoor',d.u,d.v,d.w,.15,{number:d.n,open:d.open,angle:d.open?68:0});", "upperMark(wing==='upper-left'?'upperLeftClassroomDoor':'upperClassroomDoor',d.u,d.v,d.w,.15,{number:d.n,open:d.open,angle:d.open?68:0});")
doors += '   for(const d of doorPlan)upperClassroom(d);\n'
new=new[:a]+doors+new[b:]
left=(p/'college1-second-floor-left.js').read_text(encoding='utf-8')
new=once(new,'  }finally{pose=upperSavedPose}',left.rstrip()+'\n  }finally{pose=upperSavedPose}')
stair_path=p/'college1-stair-hall.js';stairs_before=stair_path.read_text(encoding='utf-8')
stairs=once(stairs_before,old.rstrip(),new.rstrip())
stairs=once(stairs,'upperLeftDeferred:true','upperLeftDeferred:false')
builder_path=p/'college1-interior.js';builder_before=builder_path.read_text(encoding='utf-8')
builder=once(builder_before,stairs_before.rstrip(),stairs.rstrip())
builder=once(builder,'layoutVersion:14,','layoutVersion:15,')
builder=once(builder,"if(x>=14.25&&x<=16.05&&z>7.85&&z<=9.55)return 'Корпус 1 · 2 этаж · Левый проход';", "if((x>=-17&&x<=16.3&&z>7.85&&z<=13.75)||(x>=-16.15&&x<=-14.65&&z>=7.05&&z<=9.45))return 'Корпус 1 · 2 этаж · Левый коридор';")
a=html_before.index('// ---- Корпус 1: увеличенный холл');b=html_before.index('const COLLEGE_MAIN_ENTRANCE=',a)
html=html_before[:a]+builder.rstrip()+'\n'+html_before[b:]
assert html[:a]==html_before[:a] and html[html.index('const COLLEGE_MAIN_ENTRANCE=',a):]==html_before[b:]
part.write_text(new,encoding='utf-8');stair_path.write_text(stairs,encoding='utf-8');builder_path.write_text(builder,encoding='utf-8');h.write_text(html,encoding='utf-8')
(p/'college1-stair-hall-corrected-body.js').write_text(stairs[stairs.index(' at(-13.9,7.85'):],encoding='utf-8')
(p/'college1-layout-v2.js').write_text(builder[builder.index(' // Все координаты плана:'):],encoding='utf-8')

t=p/'check-college1.cjs';test=t.read_text(encoding='utf-8')
for a,b in [('layout.layoutVersion,14','layout.layoutVersion,15'),('layout.classroomDoors.length,22','layout.classroomDoors.length,32'),('brands.length,22','brands.length,32'),('BQFQDoors:22,','BQFQDoors:32,secondFloorLeftWing:true,')]:test=once(test,a,b)
test=once(test,"['end',44.05,-3]", "['end',44.05,-3],['leftNearWindow',14.6,10.7],['left205',13.95,11.25],['left207',8.1,11.25],['left210',5.5,10.1],['left209',2.8,11.25],['left212',.2,10.1],['left211',-2.2,11.25],['left214',-4.6,10.1],['left213',-7.1,11.25],['left216',-11.8,10.1],['left215',-14.4,11.25],['leftFarWindow',-15.7,10.7],['leftFarStairPassage',-15.4,8.7]")
anchor="assert(layout.fixtures.filter(f=>f.kind==='upperClassroomDoor').every(f=>!f.open&&f.angle===0));"
test=once(test,anchor,anchor+'''
assert.equal(layout.stairHall.upperLeftDeferred,false);
const leftDoors=layout.classroomDoors.filter(d=>d.wing==='upper-left');assert.equal(leftDoors.length,10);
for(const door of leftDoors){assert.equal(door.open,false);assert(upperBlocked(door.x,door.z),'Closed left classroom '+door.number+' must block entry');}
assert.equal(layout.fixtures.filter(f=>f.kind==='upperLeftCrossBeam').length,2);
assert.equal(layout.fixtures.filter(f=>f.kind==='upperLeftWindow').length,2);
assert.equal(fixture('upperLeftPlantStand').pots,3);
assert.equal(college.roomAt(-2,10.7,3.74),'Корпус 1 · 2 этаж · Левый коридор');
''')
t.write_text(test,encoding='utf-8')
render_path=p/'render-apartment.cjs';render=render_path.read_text(encoding='utf-8')
marker="if(collegePreview&&process.argv.includes('--upper-only')){"
views='''if(collegePreview&&process.argv.includes('--upper-left-only')){
 const cv=(name,eye,target)=>render(name,[13.9+eye[0],3.74+eye[1],7.85-eye[2]],[13.9+target[0],3.74+target[1],7.85-target[2]]);
 cv('корпус-1-2-этаж-левый-проём',[1.25,1.7,.7],[.9,1.5,-3.9]);
 cv('корпус-1-2-этаж-левый-к-окну',[-3.6,1.7,-2.85],[2.3,1.55,-2.85]);
 cv('корпус-1-2-этаж-левый-длинный',[.4,1.7,-2.85],[-30.7,1.6,-2.85]);
 cv('корпус-1-2-этаж-левый-балки',[-5,1.7,-2.85],[-23,1.55,-2.85]);
 cv('корпус-1-2-этаж-левый-214',[-16,1.7,-3.3],[-19,1.5,-1.6]);
 cv('корпус-1-2-этаж-левый-дальний-торец',[-27.1,1.7,-2.85],[-30.7,1.5,-2.5]);
 cv('корпус-1-2-этаж-левый-обратно',[-26.2,1.7,-2.85],[2.3,1.55,-2.85]);
 console.log('CPU left-wing preview complete:',triangles.length,'triangles');process.exit(0);
}
'''
render=once(render,marker,views+marker);render_path.write_text(render,encoding='utf-8')
print('Upper left wing built: entrance window, plant stand, ten closed doors, two beams, far window and stair passage.')
