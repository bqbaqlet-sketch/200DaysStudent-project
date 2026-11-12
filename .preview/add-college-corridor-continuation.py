from pathlib import Path
import shutil

root=Path.cwd();preview=root/'.preview';html_path=next(root.glob('*.html'))
html_before=html_path.read_text(encoding='utf-8')
shutil.copy2(html_path,root/'.backups'/'Колледж — до продолжения коридора со стендами.html')
stair_path=preview/'college1-stair-hall.js';stairs_before=stair_path.read_text(encoding='utf-8')
shutil.copy2(stair_path,preview/'college1-stair-hall-before-continuation.js')

def once(s,old,new):
    assert s.count(old)==1,old
    return s.replace(old,new,1)

a=stairs_before.index('  // Открытый проём прямо.');b=stairs_before.rindex(' });')
continuation=(preview/'college1-corridor-continuation.js').read_text(encoding='utf-8')
stairs=stairs_before[:a]+continuation.rstrip()+'\n'+stairs_before[b:]
stairs=once(stairs,'continuationDeferred:true','continuationDeferred:false')
stairs=once(stairs,'const continuationBounds={x1:15.42,x2:17.18,z1:-3.35,z2:-.15};',
    'const continuationBounds={x1:14.55,x2:44.6,z1:-4.25,z2:-1.75};\n const continuationEntryBounds={x1:15.42,x2:17.18,z1:-1.75,z2:-.15};')
builder_path=preview/'college1-interior.js';builder_before=builder_path.read_text(encoding='utf-8')
builder=once(builder_before,stairs_before.rstrip(),stairs.rstrip())
builder=once(builder,'layoutVersion:11,','layoutVersion:12,')
builder=once(builder,"if(x>=continuationBounds.x1&&x<=continuationBounds.x2&&z>=continuationBounds.z1&&z<continuationBounds.z2)return 'Корпус 1 · Продолжение коридора';",
    "if([continuationBounds,continuationEntryBounds].some(b=>x>=b.x1&&x<=b.x2&&z>=b.z1&&z<=b.z2))return 'Корпус 1 · Продолжение коридора';")
a=html_before.index('// ---- Корпус 1: увеличенный холл');b=html_before.index('const COLLEGE_MAIN_ENTRANCE=',a)
html=html_before[:a]+builder.rstrip()+'\n'+html_before[b:]
assert html[:a]==html_before[:a]
assert html[html.index('const COLLEGE_MAIN_ENTRANCE=',a):]==html_before[b:]
stair_path.write_text(stairs,encoding='utf-8');builder_path.write_text(builder,encoding='utf-8');html_path.write_text(html,encoding='utf-8')
(preview/'college1-stair-hall-corrected-body.js').write_text(stairs[stairs.index(' at(-13.9,7.85'):],encoding='utf-8')
(preview/'college1-layout-v2.js').write_text(builder[builder.index(' // Все координаты плана:'):],encoding='utf-8')

test_path=preview/'check-college1.cjs';test=test_path.read_text(encoding='utf-8')
test=once(test,'assert.equal(layout.layoutVersion,11);','assert.equal(layout.layoutVersion,12);')
test=once(test,'assert.equal(layout.classroomDoors.length,9);','assert.equal(layout.classroomDoors.length,14);')
test=once(test,'assert.equal(brands.length,9);','assert.equal(brands.length,14);')
anchor="assert.equal(fixture('stairUpperFlight').turnAtTop,'right');"
test=once(test,anchor,anchor+'''
assert.equal(layout.stairHall.continuationDeferred,false);
assert.equal(fixture('continuationHall').turnFromStairs,'right');
assert.equal(fixture('continuationEndExit').closed,true);
assert.equal(fixture('continuationEndExit').interactive,false);
assert.equal(fixture('continuationEndExit').leaves,2);
assert.equal(layout.fixtures.filter(f=>f.kind==='corridorNoticeBoard').length,7);
assert.equal(layout.classroomDoors.filter(d=>d.wing==='continuation'&&d.closed).length,5);
assert.equal(fixture('continuationPlantNiche').recessed,true);
assert(fixture('continuationPlantNiche').z<fixture('continuationHall').z,'Niche must be opposite the stair passage');
''')
anchor="assert.equal(evaluate('zone(C.position.x,C.position.z)'),'Корпус 1 · Продолжение коридора');"
test=once(test,anchor,anchor+'''
// Walk the new right turn and the full photographed corridor with the real player body.
evaluate(`for(let z=-2.8;z>=-3;z-=.02)if(!walkInterior(16.3,z))throw Error('New corridor turn blocked');
 for(let x=16.3;x<=44.1;x+=.025)if(!walkInterior(x,-3))throw Error('Long continuation blocked at '+x);`);
assert(Math.abs(evaluate('feetY')-.12)<1e-6,'Exit threshold must be walkable');
assert.equal(evaluate('getInteractionTarget()'),null,'The terminal exit must stay closed without an enter action');
assert.equal(evaluate('hit(44.7,-3,.12)'),true,'The closed end door must block passage');
assert.equal(college.groundAt(44.9,-3,.12),null,'There is no playable area behind the closed exit');
evaluate(`for(let x=44.1;x>=16.3;x-=.025)if(!walkInterior(x,-3))throw Error('Return along new corridor blocked at '+x);
 for(let z=-3;z<=-2.8;z+=.02)if(!walkInterior(16.3,z))throw Error('Return to stair passage blocked');`);
assert(Math.abs(evaluate('feetY'))<1e-6);
''')
test=once(test,"['forwardCorridor',16.3,-2.5],", "['forwardCorridor',16.3,-2.5],['continuationMiddle',31.9,-3],['continuationPlantNiche',17.7,-3.5],['continuationClosedExit',44.1,-3],")
test=test.replace('BQFQDoors:9,','BQFQDoors:14,continuationEndDoorClosed:true,longContinuationWalkable:true,continuationNoticeBoards:7,')
test_path.write_text(test,encoding='utf-8')

render_path=preview/'render-apartment.cjs';render=render_path.read_text(encoding='utf-8')
anchor="if(collegePreview&&process.argv.includes('--sketch'))"
a=render.index(anchor)
render=render[:a]+'''if(collegePreview&&process.argv.includes('--continuation-only')){
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
''' + render[a:]
render_path.write_text(render,encoding='utf-8')
print('Added the photographed corridor, seven boards, five BQFQ classroom doors and a closed terminal exit.')
