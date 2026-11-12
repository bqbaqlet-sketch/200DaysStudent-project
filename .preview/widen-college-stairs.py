from pathlib import Path
import shutil

root = Path.cwd()
preview = root / '.preview'
html_path = next(root.glob('*.html'))
html_before = html_path.read_text(encoding='utf-8')
shutil.copy2(html_path, root / '.backups' / 'Колледж — до расширения лестниц.html')
stair_path = preview / 'college1-stair-hall.js'
stairs_before = stair_path.read_text(encoding='utf-8')
shutil.copy2(stair_path, preview / 'college1-stair-hall-before-widening.js')

def once(s, old, new):
    assert s.count(old) == 1, old
    return s.replace(old, new, 1)

module_path = preview / 'college1-transverse-stairs.js'
module_before = module_path.read_text(encoding='utf-8')
module = once(module_before,
    'stairFloor(3.55,5.135,6.7,7.25,1.87);stairFloor(3.55,.75,6.7,2,3.74);',
    'stairFloor(3.55,5.135,7.5,7.25,1.87);stairFloor(3.55,.75,7.5,2,3.74);')
module = once(module, 'stairFloor(5.25,5.135,6.7,7.25,-1.87);', 'stairFloor(5.65,5.135,7.5,7.25,-1.87);')
module = once(module,
    'stairFlight(3.55,5,0);stairFlight(5.25,6.7,1.87,true);stairFlight(5.25,6.7,0,false,true);',
    '// Марши шириной 1.85 м; внешний край у деревянной стены сохранён.\n   stairFlight(3.55,5.4,0);stairFlight(5.65,7.5,1.87,true);stairFlight(5.65,7.5,0,false,true);')
for old, new in [('5.04','5.44'), ('5.21','5.61'), ('6.73','7.53'), ('6.84','7.64')]:
    module = module.replace('[' + old + ',', '[' + new + ',')
module = once(module, '[4.99,y,v]', '[5.39,y,v]')
module = once(module, 'for(const x of [6.3,3.91])', 'for(const x of [7.1,3.91])')
module = once(module, 'box(2.08,3.74,4.8,2.15,6.2,7.95,p.cream,true);',
    'box(2.08,3.74,4,2.15,6.2,7.95,p.cream,true);')
module = once(module, "mark('stairUpFlight',4.9675,7.225,3.135,1.45,", "mark('stairUpFlight',4.9675,7.025,3.135,1.85,")
module = once(module, "mark('stairDownFlight',4.9675,5.525,3.135,1.45,", "mark('stairDownFlight',4.9675,4.925,3.135,1.85,")
stairs = once(stairs_before, module_before.rstrip(), module.rstrip())
stairs = once(stairs, 'wallShift:2,wallClearance:.01,', 'wallShift:2,wallClearance:.01,flightWidth:1.85,')
stairs = once(stairs, 'stairFloor(0,0,8.8,4.45,0);stairFloor(0,4.45,3.4,8,0);',
    'stairFloor(0,0,8.8,3.65,0);stairFloor(0,3.65,3.4,8,0);')

# Preserve both corridor connections and all door positions.
marker = '  // Открытый проём прямо.'
assert stairs_before[stairs_before.index(marker):] == stairs[stairs.index(marker):]
start, end = '  // Аварийная дверь', "  mark('stairUpFlight'"
assert stairs_before[stairs_before.index(start):stairs_before.index(end)] == stairs[stairs.index(start):stairs.index(end)]
assert 'at(2.16,5.6,-Math.PI/2,()=>{' in stairs

builder_path = preview / 'college1-interior.js'
builder = once(builder_path.read_text(encoding='utf-8'), stairs_before.rstrip(), stairs.rstrip())
builder = once(builder, 'layoutVersion:9,', 'layoutVersion:10,')
a = html_before.index('// ---- Корпус 1: увеличенный холл')
b = html_before.index('const COLLEGE_MAIN_ENTRANCE=', a)
html = html_before[:a] + builder.rstrip() + '\n' + html_before[b:]
assert html[:a] == html_before[:a]
assert html[html.index('const COLLEGE_MAIN_ENTRANCE=', a):] == html_before[b:]
module_path.write_text(module, encoding='utf-8')
stair_path.write_text(stairs, encoding='utf-8')
builder_path.write_text(builder, encoding='utf-8')
html_path.write_text(html, encoding='utf-8')
(preview / 'college1-stair-hall-corrected-body.js').write_text(stairs[stairs.index(' at(-13.9,7.85'):], encoding='utf-8')
(preview / 'college1-layout-v2.js').write_text(builder[builder.index(' // Все координаты плана:'):], encoding='utf-8')

test_path = preview / 'check-college1.cjs'
test = once(test_path.read_text(encoding='utf-8'), 'assert.equal(layout.layoutVersion,9);', 'assert.equal(layout.layoutVersion,10);')
test = once(test, "assert(Math.abs(upFlight.z-.625)<1e-6,'Both stair lanes must shift toward the marked wall');",
    "assert(Math.abs(upFlight.z-.825)<1e-6,'The widened flight must remain against the marked wall');\nassert.equal(upFlight.depth,1.85);assert.equal(fixture('stairDownFlight').depth,1.85);")
a, b = test.index('// The hallway continues straight'), test.index('// A single straight walk')
test = test[:a] + test[a:b].replace('.625', '.825').replace('2.325', '2.925') + test[b:]
anchor = "assert(Math.abs(evaluate('feetY')-1.87)<1e-5);"
test = once(test, anchor, anchor + '''
// Exercise the added tread width with the actual player body and collision rules.
for(const laneZ of [.405,1.245]){
 const x=18.8,foot=college.groundAt(x,laneZ,1.02);
 assert(foot!==null&&foot>.8&&foot<1.3,'Added tread width must carry the player');
 assert.equal(evaluate(`hit(${x},${laneZ},${foot})`),false,'Railings must leave the added width walkable');
}
''')
test_path.write_text(test, encoding='utf-8')
render_path = preview / 'render-apartment.cjs'
render = render_path.read_text(encoding='utf-8')
render = render.replace('[3.65,1.87,7.225],[7.4,2.6,7.225]', '[3.65,1.87,7.025],[7.4,2.6,7.025]')
render = render.replace('[2.8,5.44,5.525],[6.5,.9,6.6]', '[2.8,5.44,4.925],[6.5,.9,6.2]')
render = render.replace('[3.1,1.7,5.525],[7.4,-.5,5.525]', '[3.1,1.7,4.925],[7.4,-.5,4.925]')
render_path.write_text(render, encoding='utf-8')
print('Flight width 1.45 -> 1.85 m. Landings, rails, walk surfaces and floor opening updated.')
