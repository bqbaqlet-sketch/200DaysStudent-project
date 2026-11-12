from pathlib import Path
import shutil

r=Path.cwd();p=r/'.preview';h=next(r.glob('*.html'));html_before=h.read_text(encoding='utf-8')
shutil.copy2(h,r/'.backups'/'Колледж — до исправления кухни под лестницей и верхних окон.html')
f=p/'college1-second-stair-hall.js';old=f.read_text(encoding='utf-8')
shutil.copy2(f,p/'college1-second-stair-hall-before-kitchen-correction.js')
def once(s,a,b):
    assert s.count(a)==1,a
    return s.replace(a,b,1)
new=old
new=once(new,'stairFloor(-7.1,5.135,-5.45,6.9,-1.87);','stairFloor(-7.1,5.135,-3.55,6.9,-1.87);')
anchor='   stairFlight(-7.1,-5.45,0,false,true);'
new=once(new,anchor,anchor+'''
   // После первой части спуска — разворот на площадке и второй марш
   // под первым подъёмным маршем, а не дверь в торцевой стене.
   at(0,.285,0,()=>stairFlight(-5.2,-3.55,-1.87,true,true,2.85));
   stairRail([-5.23,-1.87,5.135],[-5.23,-3.74,2.285],true);
   stairRail([-3.61,-1.87,5.135],[-3.61,-3.74,2.285],true);
   stairRail([-3.61,-1.87,5.135],[-3.61,-1.87,6.82]);''')
new=new.replace('box(-7.65,-2.15,','box(-7.65,-4.05,').replace('box(-7.5,-2.15,','box(-7.5,-4.05,')
new=once(new,'  stairFloor(-2.6,2.4,-.75,5.85,3.74);','  stairFloor(-2.6,4.2,-.75,5.85,3.74);')
new=once(new,'''  stairFloor(-7.5,2.4,-2.6,4.05,3.74);
  box(-7.5,3.57,2.4,-2.6,3.6,4.05,p.trim);box(-2.6,3.57,2.4,-.75,3.6,5.85,p.trim);''', '''  // У окон нет отдельной галереи: стена и батареи стоят у края верхнего марша.
  box(-2.6,3.57,4.2,-.75,3.6,5.85,p.trim);
  box(-7.5,3.74,3.92,-2.6,7.1,4.05,p.cream,true);
  box(-2.6,3.74,2.4,-2.45,7.1,4.2,p.oak,true);''')
new=once(new,'  stairRail([-7.42,3.74,4.08],[-2.64,3.74,4.08]);','  stairRail([-2.63,3.74,4.16],[-.78,3.74,4.16]);')
# Window positions are parameterized so the upper windows sit at the stair edge.
a=new.index('  function serviceStairWindow(');b=new.index('  // Закрытый выход',a)
windows=new[a:b]
windows=windows.replace('width=1.7,plants=false){\n   const v=2.415;', 'width=1.7,plants=false,v=2.415){')
for old_z,new_z in [('2.41,','v-.005,'),('2.47,','v+.055,'),('2.48,','v+.065,'),('2.495,','v+.08,'),('2.493,','v+.078,'),('2.39,','v-.025,'),('2.85,','v+.435,'),('2.46,','v+.045,'),('2.64,','v+.225,'),('2.635,','v+.22,'),('2.675,','v+.26,'),('2.62,','v+.205,')]:
    windows=windows.replace(old_z,new_z)
# Coordinate literals immediately followed by a closing parenthesis need the same offsets.
for old_z,new_z in [('2.47,','v+.055,'),('2.85,','v+.435,'),('2.64,','v+.225,')]:
    windows=windows.replace(old_z,new_z)
windows=windows.replace('base+3,2.47,p.frame','base+3,v+.055,p.frame').replace('base+y+.025,2.47,p.frame','base+y+.025,v+.055,p.frame')
windows=windows.replace('base+y+.073,2.495,p.blind','base+y+.073,v+.08,p.blind').replace('base+y+.104,2.493,p.blindLight','base+y+.104,v+.078,p.blindLight')
windows=windows.replace('base+.84,2.85,p.counter','base+.84,v+.435,p.counter').replace('base+.71,2.64,p.white','base+.71,v+.225,p.white').replace('base+.68,2.675,p.trim','base+.68,v+.26,p.trim')
windows=windows.replace('serviceStairWindow(-5.85,3.74,1.7);serviceStairWindow(-2.95,3.74,1.7);','serviceStairWindow(-5.85,3.74,1.7,false,4.065);serviceStairWindow(-3.6,3.74,1.7,false,4.065);')
new=new[:a]+windows+new[b:]
# Kitchen doorway lies inside the upward flight footprint, at the end of the turned descent.
a=new.index('  // Кухня внизу:');b=new.index('  // Оранжевый стул',a)
new=new[:a]+'''  // Кухня под подъёмным маршем: вниз, разворот, ещё вниз к закрытой двери.
  stairFloor(-3.14,6.1,-2.55,7.75,-3.74);
  box(-2.57,-4.05,6,-2.4,-.9,7.85,p.oak,true);
  at(-2.65,6.925,Math.PI/2,()=>{
   box(-.59,-3.74,-.065,.59,-1.34,.035,p.frame,true);
   box(-.52,-3.7,-.082,.52,-1.42,-.066,p.oak);
   label('не заходить',0,-2.12,-.09,.92,.23,'#e7dfce','#9d342f',Math.PI);
   rod([-.36,-2.81,-.12],[-.36,-2.63,-.12],.012,p.iron);
  });
  mark('kitchenRestrictedDoor',-2.65,6.925,.14,1.18,{level:-3.74,closed:true,text:'не заходить',interactive:false,underUpFlight:true});
  mark('secondStairKitchenTurn',-6.4,6,1.3,3.55,{level:-1.87,turnDegrees:180});
  mark('secondStairUpFootprint',-4.1675,6.925,3.135,1.65,{level:0});
''' +new[b:]
new=once(new,'levels:[-1.87,0,1.87,3.74]','levels:[-3.74,-1.87,0,1.87,3.74],kitchenUnderUpFlight:true,windowGallery:false')
builder_path=p/'college1-interior.js';builder=builder_path.read_text(encoding='utf-8');builder=once(builder,old.rstrip(),new.rstrip())
builder=once(builder,'layoutVersion:16,','layoutVersion:17,')
a=html_before.index('// ---- Корпус 1: увеличенный холл');b=html_before.index('const COLLEGE_MAIN_ENTRANCE=',a)
h.write_text(html_before[:a]+builder.rstrip()+'\n'+html_before[b:],encoding='utf-8')
f.write_text(new,encoding='utf-8');builder_path.write_text(builder,encoding='utf-8')
(p/'college1-layout-v2.js').write_text(builder[builder.index(' // Все координаты плана:'):],encoding='utf-8')

t=p/'check-college1.cjs';test=t.read_text(encoding='utf-8');test=once(test,'layout.layoutVersion,16','layout.layoutVersion,17')
test=once(test,"assert.equal(fixture('kitchenRestrictedDoor').text,'не заходить');assert.equal(fixture('kitchenRestrictedDoor').closed,true);", """assert.equal(fixture('kitchenRestrictedDoor').text,'не заходить');assert.equal(fixture('kitchenRestrictedDoor').closed,true);
const kitchenDoor=fixture('kitchenRestrictedDoor'),upFootprint=fixture('secondStairUpFootprint');
assert(kitchenDoor.x>=upFootprint.x-upFootprint.width/2&&kitchenDoor.x<=upFootprint.x+upFootprint.width/2,'Kitchen must be under the upward flight in plan');
assert(kitchenDoor.z>=upFootprint.z-upFootprint.depth/2&&kitchenDoor.z<=upFootprint.z+upFootprint.depth/2);
assert.equal(kitchenDoor.level,-3.74);assert.equal(fixture('secondStairHall').windowGallery,false);
assert.equal(college.groundAt(-20,6.2,3.74),null,'No walkable gallery may remain in front of the upper windows');""")
test=once(test,"assert.equal(evaluate('getInteractionTarget()'),null,'Kitchen must not have an enter action');", """walkSecondStair([[-6.4,5.025],[-6.4,6.925],[-3.06,6.925]]);
assert(Math.abs(evaluate('feetY')+3.74)<1e-5);
assert.equal(evaluate('getInteractionTarget()'),null,'Kitchen must not have an enter action');""")
test=once(test,"evaluate('hit(-22.86,4.425,-1.87)')", "evaluate('hit(-18.04,2.525,-3.74)')")
test=once(test,'walkSecondStair([[-6.4,5.025],[-2.15,5.025],[-.9,5.025],[-.9,.475]]);','walkSecondStair([[-3.06,6.925],[-6.4,6.925],[-6.4,5.025],[-2.15,5.025],[-.9,5.025],[-.9,.475]]);')
t.write_text(test,encoding='utf-8')
render_path=p/'render-apartment.cjs';render=render_path.read_text(encoding='utf-8')
render=once(render,"cv('корпус-1-вторая-лестница-кухня',[-6.25,-.17,5.025],[-7.5,-.55,5.025]);", "cv('корпус-1-вторая-лестница-кухня',[-3.7,-2.04,6.925],[-2.6,-2.15,6.925]);\n cv('корпус-1-вторая-лестница-разворот-вниз',[-6.4,-.17,5.025],[-3.1,-2.5,6.925]);\n cv('корпус-1-вторая-лестница-верхние-окна',[-1.9,5.44,5.1],[-6.5,3.3,5.1]);")
render_path.write_text(render,encoding='utf-8')
print('Removed the upper window gallery; basement descends with a U turn to a kitchen door beneath the upward flight.')
