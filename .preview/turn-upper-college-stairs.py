from pathlib import Path
import shutil

root=Path.cwd(); preview=root/'.preview'; html_path=next(root.glob('*.html'))
html_before=html_path.read_text(encoding='utf-8')
shutil.copy2(html_path,root/'.backups'/'Колледж — до маршрута лестницы прямо и вправо.html')
stair_path=preview/'college1-stair-hall.js'; stairs_before=stair_path.read_text(encoding='utf-8')
shutil.copy2(stair_path,preview/'college1-stair-hall-before-forward-turn.js')

def once(s,old,new):
    assert s.count(old)==1,old
    return s.replace(old,new,1)

old_module=(preview/'college1-transverse-stairs.js').read_text(encoding='utf-8')
door_start=old_module.index('  // Аварийная дверь')
new_geometry=(preview/'college1-forward-then-right-stairs.js').read_text(encoding='utf-8')
module=new_geometry.rstrip()+'\n'+old_module[door_start:]
module += "  mark('stairUpperFlight',7.725,4,1.85,4.2,{axis:'z',ascendingToward:'entry-wall',baseY:1.87,topY:3.74,turnAtTop:'right'});\n"
module += "  mark('stairUpperTurn',5.4,.95,6.5,1.9,{level:3.74,turn:'right',wall:'entry-wall'});\n"
stairs=once(stairs_before,old_module.rstrip(),module.rstrip())
stairs=once(stairs,'flightWidth:1.85,','flightWidth:1.85,upperRoute:\'forward-then-right\',upperRun:4.2,')
# Use a selectable run while retaining the same safe 17 cm risers on both lower flights.
stairs=once(stairs,'function stairFlight(x1,x2,baseY,returning=false,descending=false){',
    'function stairFlight(x1,x2,baseY,returning=false,descending=false,run=3.135){\n  const tread=run/11;')
stairs=once(stairs,'const za=returning?5.135-(i+1)*.285:2+i*.285,zb=za+.285,y=baseY+(descending?-1:1)*(i+1)*.17;',
    'const za=returning?2+run-(i+1)*tread:2+i*tread,zb=za+tread,y=baseY+(descending?-1:1)*(i+1)*.17;')
stairs=once(stairs,'za=returning?5.135:2,zb=returning?2:5.135;',
    'za=returning?2+run:2,zb=returning?2:2+run;')
marker='  // Открытый проём прямо.'
assert stairs_before[stairs_before.index(marker):]==stairs[stairs.index(marker):]
door_end="  mark('stairUpFlight'"
assert old_module[door_start:old_module.index(door_end)]==module[module.index('  // Аварийная дверь'):module.index(door_end)]
builder_path=preview/'college1-interior.js'
builder=once(builder_path.read_text(encoding='utf-8'),stairs_before.rstrip(),stairs.rstrip())
builder=once(builder,'layoutVersion:10,','layoutVersion:11,')
a=html_before.index('// ---- Корпус 1: увеличенный холл');b=html_before.index('const COLLEGE_MAIN_ENTRANCE=',a)
html=html_before[:a]+builder.rstrip()+'\n'+html_before[b:]
assert html[:a]==html_before[:a]
assert html[html.index('const COLLEGE_MAIN_ENTRANCE=',a):]==html_before[b:]
(preview/'college1-transverse-stairs.js').write_text(module,encoding='utf-8')
stair_path.write_text(stairs,encoding='utf-8');builder_path.write_text(builder,encoding='utf-8');html_path.write_text(html,encoding='utf-8')
(preview/'college1-stair-hall-corrected-body.js').write_text(stairs[stairs.index(' at(-13.9,7.85'):],encoding='utf-8')
(preview/'college1-layout-v2.js').write_text(builder[builder.index(' // Все координаты плана:'):],encoding='utf-8')

test_path=preview/'check-college1.cjs';test=test_path.read_text(encoding='utf-8')
test=once(test,'assert.equal(layout.layoutVersion,10);','assert.equal(layout.layoutVersion,11);')
test=once(test,"assert.equal(fixture('stairUpFlight').axis,'x');", "assert.equal(fixture('stairUpFlight').axis,'x');\nassert.equal(fixture('stairUpperFlight').axis,'z');\nassert.equal(fixture('stairUpperFlight').turnAtTop,'right');")
start=test.index('evaluate(`for(let z=.825;z<=2.925;z+=.025)if(!walkInterior(21.2,z))')
end=test.index("assert(Math.abs(evaluate('feetY'))<1e-5);",start)
test=test[:start]+'''// From the photographed landing: climb straight toward the wall, then turn right.
evaluate(`for(let x=21.2;x<=21.625;x+=.025)if(!walkInterior(x,.825))throw Error('Upper straight flight approach blocked');
 for(let z=.825;z<=6.875;z+=.025)if(!walkInterior(21.625,z))throw Error('Straight flight toward wall blocked at '+z);`);
assert(Math.abs(evaluate('feetY')-3.74)<1e-5);
assert.equal(evaluate('zone(C.position.x,C.position.z)'),'Корпус 1 · Площадка 2 этажа');
evaluate(`for(let x=21.625;x>=16.65;x-=.025)if(!walkInterior(x,6.875))throw Error('Right turn along the wall blocked at '+x);`);
assert(Math.abs(evaluate('feetY')-3.74)<1e-5);
// The old sideways upper flight must be gone; the new straight flight has usable width.
assert.equal(college.groundAt(18.8,2.925,2.89),null);
for(const laneX of [21.205,22.045]){
 const foot=college.groundAt(laneX,3.85,2.89);
 assert(foot!==null&&foot>2.6&&foot<3.1);
 assert.equal(evaluate(`hit(${laneX},3.85,${foot})`),false);
}
evaluate(`for(let x=16.65;x<=21.625;x+=.025)if(!walkInterior(x,6.875))throw Error('Return from right turn blocked');
 for(let z=6.875;z>=.825;z-=.025)if(!walkInterior(21.625,z))throw Error('Return from straight upper flight blocked');
 for(let x=21.625;x>=16.3;x-=.025)if(!walkInterior(x,.825))throw Error('Return first ascending flight blocked');`);
''' + test[end:]
test=test.replace('walkUpToSecondLanding:true,','walkUpToSecondLanding:true,upperFlightStraightThenRight:true,')
test_path.write_text(test,encoding='utf-8')
render_path=preview/'render-apartment.cjs';render=render_path.read_text(encoding='utf-8')
render=once(render," stairView('корпус-1-лестница-со-второго',[2.8,5.44,4.925],[6.5,.9,6.2]);",
    " stairView('корпус-1-лестница-со-второго',[7.725,5.44,.975],[7.725,2.5,6.4]);\n stairView('корпус-1-подъём-прямо',[7.725,3.57,7.35],[7.725,4.1,.4]);\n stairView('корпус-1-поворот-вправо',[7.725,5.44,.975],[2.2,5.3,.975]);")
render_path.write_text(render,encoding='utf-8')
print('Upper route: forward from the photographed landing, then right along the wall. Exit and corridors preserved.')
