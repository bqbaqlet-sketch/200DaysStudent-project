from pathlib import Path
import shutil

root = Path.cwd()
html_path = next(root.glob('*.html'))
preview = root / '.preview'
html_before = html_path.read_text(encoding='utf-8')
stair_path = preview / 'college1-stair-hall.js'
stairs_before = stair_path.read_text(encoding='utf-8')
shutil.copy2(html_path, root / '.backups' / 'Колледж — до сдвига лестничного блока к стене.html')
shutil.copy2(stair_path, preview / 'college1-stair-hall-before-wall-shift.js')

def replace_once(source, old, new):
    assert source.count(old) == 1, old
    return source.replace(old, new, 1)

module_path = preview / 'college1-transverse-stairs.js'
module_before = module_path.read_text(encoding='utf-8')
module = replace_once(module_before, 'at(1.4,9.5,Math.PI/2,()=>{', 'at(1.4,11.5,Math.PI/2,()=>{')
module = replace_once(module, '// Поворот касается только лестничного блока; ось коридора X=2.4 сохранена.',
    '// Весь блок сдвинут на 2 м к деревянной стене: край ступеней V=7.95, стена V=7.96.')
# Keep the wall-side rails just inside the treads so their posts do not clip the wall.
module = replace_once(module, 'stairRail([3.52,0,2],[3.52,1.87,5.135],true);',
    'stairRail([3.64,0,2],[3.64,1.87,5.135],true);')
module = replace_once(module, 'stairRail([3.57,3.74,2],[5.04,3.74,2]);',
    'stairRail([3.64,3.74,2],[5.04,3.74,2]);')
module = replace_once(module, 'stairRail([3.57,3.74,.78],[3.57,3.74,2]);',
    'stairRail([3.64,3.74,.78],[3.64,3.74,2]);')
module = replace_once(module, 'box(2.08,3.74,2.8,2.15,6.2,5.95,p.cream,true);',
    'box(2.08,3.74,4.8,2.15,6.2,7.95,p.cream,true);')
module = replace_once(module, 'at(2.16,3.6,-Math.PI/2,()=>{', 'at(2.16,5.6,-Math.PI/2,()=>{')
module = replace_once(module, "mark('stairUpFlight',4.9675,5.225,", "mark('stairUpFlight',4.9675,7.225,")
module = replace_once(module, "mark('stairDownFlight',4.9675,3.525,", "mark('stairDownFlight',4.9675,5.525,")

stairs = replace_once(stairs_before, module_before.rstrip(), module.rstrip())
stairs = replace_once(stairs, "flightTurnDegrees:90,forwardCorridor:true", "flightTurnDegrees:90,wallShift:2,wallClearance:.01,forwardCorridor:true")
stairs = replace_once(stairs,
    'stairFloor(0,0,8.8,2.45,0);stairFloor(0,2.45,3.4,8,0);stairFloor(0,6.3,8.8,8,0);',
    'stairFloor(0,0,8.8,4.45,0);stairFloor(0,4.45,3.4,8,0);')

# The emergency exit, its signs and the forward corridor must be byte-for-byte unchanged.
exit_start = '  // Аварийная дверь'
exit_end = "  mark('stairUpFlight'"
def between(s, a, b):
    return s[s.index(a):s.index(b, s.index(a))]
assert between(stairs_before, exit_start, exit_end) == between(stairs, exit_start, exit_end)
corridor_marker = '  // Открытый проём прямо.'
assert stairs_before[stairs_before.index(corridor_marker):] == stairs[stairs.index(corridor_marker):]

builder_path = preview / 'college1-interior.js'
builder_before = builder_path.read_text(encoding='utf-8')
builder = replace_once(builder_before, stairs_before.rstrip(), stairs.rstrip())
builder = replace_once(builder, 'layoutVersion:8,', 'layoutVersion:9,')
start = html_before.index('// ---- Корпус 1: увеличенный холл')
end = html_before.index('const COLLEGE_MAIN_ENTRANCE=', start)
html = html_before[:start] + builder.rstrip() + '\n' + html_before[end:]
assert html[:start] == html_before[:start]
assert html[html.index('const COLLEGE_MAIN_ENTRANCE=', start):] == html_before[end:]

module_path.write_text(module, encoding='utf-8')
stair_path.write_text(stairs, encoding='utf-8')
builder_path.write_text(builder, encoding='utf-8')
html_path.write_text(html, encoding='utf-8')
(preview / 'college1-stair-hall-corrected-body.js').write_text(stairs[stairs.index(' at(-13.9,7.85'):], encoding='utf-8')
(preview / 'college1-layout-v2.js').write_text(builder[builder.index(' // Все координаты плана:'):], encoding='utf-8')

test_path = preview / 'check-college1.cjs'
test = test_path.read_text(encoding='utf-8')
test = replace_once(test, 'assert.equal(layout.layoutVersion,8);', 'assert.equal(layout.layoutVersion,9);')
a = test.index('// The hallway continues straight')
b = test.index('// A single straight walk', a)
test = test[:a] + test[a:b].replace('2.625', '.625').replace('4.325', '2.325') + test[b:]
anchor = "assert.equal(fixture('stairEmergencyExit').level,0);"
test = replace_once(test, anchor, anchor + '''
assert(Math.abs(fixture('stairEmergencyExit').x-18.5)<1e-6);
assert(Math.abs(fixture('stairEmergencyExit').z-7.815)<1e-6,'The exit must stay in its accepted position');
const upFlight=fixture('stairUpFlight');
assert(Math.abs(upFlight.z-.625)<1e-6,'Both stair lanes must shift toward the marked wall');
const wallEdge=layout.stairHall.origin.z-7.96;
const treadEdge=upFlight.z-upFlight.depth/2;
assert(Math.abs(treadEdge-wallEdge-.01)<1e-6,'The treads must meet the wood wall with only fitting clearance');
assert(layout.stairSurfaces.some(s=>Math.abs(s[1]-.1)<1e-5&&s[4]>.15),'Actual tread surfaces must move with the geometry');
''')
test_path.write_text(test, encoding='utf-8')

render_path = preview / 'render-apartment.cjs'
render = render_path.read_text(encoding='utf-8')
render = render.replace('[3.65,1.87,5.225],[7.4,2.6,5.225]', '[3.65,1.87,7.225],[7.4,2.6,7.225]')
render = render.replace('[2.8,5.44,3.525],[6.5,.9,4.6]', '[2.8,5.44,5.525],[6.5,.9,6.6]')
render = render.replace('[3.1,1.7,3.525],[7.4,-.5,3.525]', '[3.1,1.7,5.525],[7.4,-.5,5.525]')
anchor = " stairView('корпус-1-продолжение-прямо'"
render = replace_once(render, anchor, " stairView('корпус-1-лестница-у-стены',[1.6,1.7,5.95],[6,1.6,6.5]);\n" + anchor)
render_path.write_text(render, encoding='utf-8')
print('Shifted stairs by 2 m. Emergency exit and forward corridor preserved.')
