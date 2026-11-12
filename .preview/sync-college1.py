from pathlib import Path

root = Path(__file__).resolve().parent.parent
preview = root / '.preview'
stair_path = preview / 'college1-second-stair-hall.js'
stair = stair_path.read_text(encoding='utf-8')
ground_path = preview / 'college1-ground-after-stairs.js'
if ground_path.exists():
    ground = ground_path.read_text(encoding='utf-8').rstrip()
    a_marker = '  // BEGIN COLLEGE1_FINAL_GROUND_WING'
    b_marker = '  // END COLLEGE1_FINAL_GROUND_WING'
    if a_marker in stair:
        a = stair.index(a_marker)
        b = stair.index(b_marker, a) + len(b_marker)
        stair = stair[:a] + ground + stair[b:]
    else:
        a = stair.index('  // Второй этаж за лестничным холлом:')
        stair = stair[:a] + ground + '\n' + stair[a:]
extension = (preview / 'college1-after-second-stairs.js').read_text(encoding='utf-8')
start = '  const afterStairSavedPose=pose;'
finish = '  }finally{pose=afterStairSavedPose}'
left, right = stair.index(start), stair.index(finish) + len(finish)
stair = stair[:left] + extension[extension.index(start):].rstrip() + stair[right:]
stair_path.write_text(stair, encoding='utf-8')
(preview / 'college1-second-stair-hall-v2.js').write_text(stair, encoding='utf-8')
builder_path = preview / 'college1-interior.js'
builder = builder_path.read_text(encoding='utf-8')
wardrobe_path = preview / 'college1-wardrobe.js'
if wardrobe_path.exists():
    wardrobe = wardrobe_path.read_text(encoding='utf-8').rstrip()
    wardrobe_start = '  // BEGIN COLLEGE1_WARDROBE'
    wardrobe_end = '  // END COLLEGE1_WARDROBE'
    if wardrobe_start in builder:
        a = builder.index(wardrobe_start)
        b = builder.index(wardrobe_end, a) + len(wardrobe_end)
        builder = builder[:a] + wardrobe + builder[b:]
    else:
        a = builder.index('  // Продолжение первого этажа по новым фотографиям:')
        builder = builder[:a] + wardrobe + '\n' + builder[a:]
start = ' at(15.4,9.45,Math.PI,()=>{'
left = builder.index(start)
anchor = builder.index(' box(.95,1.45,3.13', left)
right = builder.rfind('\n label(', left, anchor)
assert right > left
builder = builder[:left] + stair[stair.index(start):].rstrip() + '\n\n' + builder[right + 1:]
builder_path.write_text(builder, encoding='utf-8')
(preview / 'college1-layout-v2.js').write_text(builder[builder.index(' // Все координаты плана:'):], encoding='utf-8')
main_stair = builder.index(' const stairInfo=')
main_start = builder.rfind('\n', 0, main_stair - 1) + 1
main_body = builder.index(' at(-13.9,7.85,Math.PI,()=>{', main_stair)
second_stair = builder.index(' at(15.4,9.45,Math.PI,()=>{', main_body)
main_end = builder.rfind('\n });', main_body, second_stair) + len('\n });')
(preview / 'college1-stair-hall.js').write_text(builder[main_start:main_end] + '\n', encoding='utf-8')
(preview / 'college1-stair-hall-corrected-body.js').write_text(builder[main_body:main_end] + '\n', encoding='utf-8')
html_path = next(root.glob('*.html'))
html = html_path.read_text(encoding='utf-8')
left = html.index('function buildCollegeEntranceInterior()')
right = html.index('const COLLEGE_MAIN_ENTRANCE=', left)
updated = html[:left] + builder[builder.index('function buildCollegeEntranceInterior()'):].rstrip() + '\n' + html[right:]
assert updated[:left] == html[:left]
assert updated[updated.index('const COLLEGE_MAIN_ENTRANCE=', left):] == html[right:]
html_path.write_text(updated, encoding='utf-8')
print('College builder synchronized; unrelated HTML preserved.')
