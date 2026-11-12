from pathlib import Path
import shutil

r=Path.cwd();p=r/'.preview';h=next(r.glob('*.html'));html_before=h.read_text(encoding='utf-8')
shutil.copy2(h,r/'.backups'/'Колледж — до второй лестницы и закрытого входа в кухню.html')
builder_path=p/'college1-interior.js';builder_before=builder_path.read_text(encoding='utf-8')
shutil.copy2(builder_path,p/'college1-before-second-stair-link.js')
def once(s,a,b):
    assert s.count(a)==1,a
    return s.replace(a,b,1)

# Remove the temporary upper recess, preserving its opening and timber trim.
left_path=p/'college1-second-floor-left.js';left_before=left_path.read_text(encoding='utf-8')
a=left_before.index('   // Дальний проход с деревянными откосами')
b=left_before.index('   for(const u of [-30.05,-28.55])',a)
left=left_before[:a]+'   // Открытый проход в общий лестничный холл, соединённый с первым этажом.\n'+left_before[b:]
left=once(left,'   stairRail([-29.9,0,-.55],[-29.9,0,.55]);stairRail([-29.9,0,.55],[-28.7,0,.55]);\n   box(-29.6,3.275,-.5,-29.01,3.3,.09,p.bulb);\n','')
left=once(left,'stairInteriorDeferred:true','stairInteriorDeferred:false')
upper_path=p/'college1-second-floor.js';upper_before=upper_path.read_text(encoding='utf-8');upper=once(upper_before,left_before.rstrip(),left.rstrip())
stair_path=p/'college1-stair-hall.js';stair_before=stair_path.read_text(encoding='utf-8');stairs=once(stair_before,upper_before.rstrip(),upper.rstrip())
builder=once(builder_before,stair_before.rstrip(),stairs.rstrip())
# Open the wall marked on the user's ground-floor screenshot (beside the end window).
builder=once(builder,
 'box(3.0,0,10.45,3.15,3.35,22.55,p.cream,true);box(5.4,0,10.45,5.55,3.35,22.55,p.cream,true);',
 'box(3.0,0,10.45,3.15,3.35,22.55,p.cream,true);\n  box(5.4,0,10.45,5.55,3.35,19.78,p.cream,true);box(5.4,0,21.42,5.55,3.35,22.55,p.cream,true);\n  box(5.4,2.7,19.78,5.55,3.35,21.42,p.cream,true);')
builder=once(builder,
 '''for(let z=10.45;z<=22.4;z+=.6)box(x-.007,.07,z-.003,x+.007,3.3,z+.003,p.seam);
   box(x-.018,0,10.45,x+.018,.09,22.4,p.trim);''',
 '''for(let z=10.45;z<=22.4;z+=.6)if(x<4||z<19.73||z>21.47)box(x-.007,.07,z-.003,x+.007,3.3,z+.003,p.seam);
   for(const [a,b] of x<4?[[10.45,22.4]]:[[10.45,19.73],[21.47,22.4]])box(x-.018,0,a,x+.018,.09,b,p.trim);''')
builder=once(builder,' // Большое окно в конце, рулонные жалюзи и белые подставки с горшками.',
 ''' for(const z of [19.78,21.42])box(5.37,0,z-.025,5.57,2.73,z+.025,p.iron);
 box(5.37,2.68,19.755,5.57,2.74,21.445,p.iron);
 mark('rightCorridorSecondStairPortal',5.475,20.6,.2,1.64,{open:true,level:0});
 // Большое окно в конце, рулонные жалюзи и белые подставки с горшками.''')
new_stairs=(p/'college1-second-stair-hall.js').read_text(encoding='utf-8')
builder=once(builder," label('ВЫХОД',0,3.2,3.13,.72,.2,'#2f715b','#f1f2df');",new_stairs.rstrip()+"\n\n label('ВЫХОД',0,3.2,3.13,.72,.2,'#2f715b','#f1f2df');")
builder=once(builder,'layoutVersion:15,','layoutVersion:16,')
builder=once(builder,'function roomAt(x,z,feet=0){', '''function roomAt(x,z,feet=0){
  if(x>=-23.1&&x<=-14.5&&z>=-.3&&z<9.45&&(feet>.2||feet<-.2||z<7.85))
   return feet<-.25?'Корпус 1 · Лестница к кухне':'Корпус 1 · Второй лестничный холл';''')
a=html_before.index('// ---- Корпус 1: увеличенный холл');b=html_before.index('const COLLEGE_MAIN_ENTRANCE=',a)
html=html_before[:a]+builder.rstrip()+'\n'+html_before[b:]
assert html[:a]==html_before[:a] and html[html.index('const COLLEGE_MAIN_ENTRANCE=',a):]==html_before[b:]
left_path.write_text(left,encoding='utf-8');upper_path.write_text(upper,encoding='utf-8');stair_path.write_text(stairs,encoding='utf-8');builder_path.write_text(builder,encoding='utf-8');h.write_text(html,encoding='utf-8')
(p/'college1-stair-hall-corrected-body.js').write_text(stairs[stairs.index(' at(-13.9,7.85'):],encoding='utf-8')
(p/'college1-layout-v2.js').write_text(builder[builder.index(' // Все координаты плана:'):],encoding='utf-8')

t=p/'check-college1.cjs';test=t.read_text(encoding='utf-8');test=once(test,'layout.layoutVersion,15','layout.layoutVersion,16')
anchor='// Explore the actual floor with player radius .35, including the side of the trophy cabinet.'
checks='''// Walk the second staircase from the marked ground-floor door to classroom 216.
assert.equal(fixture('upperLeftFarStairPassage').stairInteriorDeferred,false);
assert.equal(fixture('kitchenRestrictedDoor').text,'не заходить');assert.equal(fixture('kitchenRestrictedDoor').closed,true);
function walkSecondStair(points){
 const route=points.map(([u,v])=>[-15.4+u,9.45-v]);
 for(let i=1;i<route.length;i++){
  const [ax,az]=route[i-1],[bx,bz]=route[i],n=Math.ceil(Math.hypot(bx-ax,bz-az)/.025);
  const path=Array.from({length:n+1},(_,j)=>[ax+(bx-ax)*j/n,az+(bz-az)*j/n]);
  evaluate(`for(const [x,z] of ${JSON.stringify(path)})if(!walkInterior(x,z))throw Error('Second staircase blocked at '+x+','+z+' feet '+feetY);`);
 }
}
evaluate('C.position.set(-16.3,1.7,8.975);feetY=0');
walkSecondStair([[-.9,.475],[-.9,4.95],[-2.15,4.95],[-2.15,6.925],[-6.4,6.925]]);
assert(Math.abs(evaluate('feetY')-1.87)<1e-5);
walkSecondStair([[-6.4,6.925],[-6.4,5.025],[-1,5.025],[0,5.025],[0,-1.25]]);
assert(Math.abs(evaluate('feetY')-3.74)<1e-5);
assert.equal(evaluate('zone(C.position.x,C.position.z)'),'Корпус 1 · 2 этаж · Левый коридор');
walkSecondStair([[0,-1.25],[0,5.025],[-6.4,5.025],[-6.4,6.925],[-2.15,6.925],[-2.15,5.025],[-6.4,5.025]]);
assert(Math.abs(evaluate('feetY')+1.87)<1e-5);
assert.equal(evaluate('getInteractionTarget()'),null,'Kitchen must not have an enter action');
assert.equal(evaluate('hit(-22.86,4.425,-1.87)'),true,'Restricted kitchen door must block entry');
walkSecondStair([[-6.4,5.025],[-2.15,5.025],[-.9,5.025],[-.9,.475]]);
assert(Math.abs(evaluate('feetY'))<1e-5);
'''
test=once(test,anchor,checks+'\n'+anchor)
test=test.replace('secondFloorLeftWing:true,','secondFloorLeftWing:true,secondStaircaseConnected:true,kitchenDoorClosed:true,')
t.write_text(test,encoding='utf-8')

render_path=p/'render-apartment.cjs';render=render_path.read_text(encoding='utf-8');marker="if(collegePreview&&process.argv.includes('--upper-left-only')){"
views='''if(collegePreview&&process.argv.includes('--second-stairs-only')){
 const cv=(name,eye,target)=>render(name,[-15.4+eye[0],eye[1],9.45-eye[2]],[-15.4+target[0],target[1],9.45-target[2]]);
 cv('корпус-1-вторая-лестница-проход',[-.9,1.7,.8],[-.9,1.6,8.8]);
 cv('корпус-1-вторая-лестница-вход',[-.8,1.7,4.9],[-6.6,1.25,4.4]);
 cv('корпус-1-вторая-лестница-площадка',[-2.1,1.7,5.5],[-6.9,1,3.3]);
 cv('корпус-1-вторая-лестница-наверх',[-2.1,1.7,6.925],[-6.8,2.7,6.925]);
 cv('корпус-1-вторая-лестница-сверху',[-2.2,5.44,5.025],[-6.7,.5,6.1]);
 cv('корпус-1-вторая-лестница-мост',[0,5.44,.5],[0,5.3,8.8]);
 cv('корпус-1-вторая-лестница-кухня',[-6.25,-.17,5.025],[-7.5,-.55,5.025]);
 console.log('CPU second staircase complete:',triangles.length,'triangles');process.exit(0);
}
'''
render=once(render,marker,views+marker);render_path.write_text(render,encoding='utf-8')
print('Second staircase links both marked openings; the kitchen door is closed and labelled.')
