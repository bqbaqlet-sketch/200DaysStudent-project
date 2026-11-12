from pathlib import Path

root=Path.cwd();p=root/'.preview';part=p/'college1-second-floor.js';old=part.read_text(encoding='utf-8')
new=old.replace('const upperGlass=material(0xc6d1c8,null,{shininess:75});','const upperGlass=material(0xb9d3ce,null,{shininess:75,transparent:true,opacity:.17,depthWrite:false,side:THREE.DoubleSide});')
new=new.replace("     if(d.open){\n      // Только видимая часть кабинета", "     {\n      // Только видимая часть кабинета")
new=new.replace('     }else collider(-d.w/2,0,-.08,d.w/2,2.43,.08);','     }\n     if(!d.open)collider(-d.w/2,0,-.08,d.w/2,2.43,.08);')
new=new.replace('      box(-leafWidth+.035,.07,-.017,-.035,2.36,.004,upperGlass);','      box(-leafWidth,2.265,-.045,0,2.43,.02,p.iron);\n      box(-leafWidth+.035,.07,-.017,-.035,2.265,.004,upperGlass);')
new=new.replace('for(let y=.19;y<2.31;y+=.205)', 'for(let y=.19;y<2.2;y+=.205)')
new=new.replace('p.gold,-leafWidth/2,2.29,-.05', 'p.gold,-leafWidth/2,2.345,-.05').replace("label(d.n,-leafWidth/2,2.29,-.054", "label(d.n,-leafWidth/2,2.345,-.054")
anchor='      for(const x of [-.69,.69]){'
poster='''      if(d.n==='207'){
       const alphabet=texture(512,512,(g,w,h)=>{
        g.fillStyle='#f2efe3';g.fillRect(0,0,w,h);g.fillStyle='#a64d56';g.fillRect(0,0,w,36);g.fillRect(0,h-30,w,30);
        g.fillStyle='#44678d';g.fillRect(0,36,24,h-66);g.fillRect(w-24,36,24,h-66);
        g.fillStyle='#324345';g.textAlign='center';g.font='bold 25px Arial';g.fillText('ENGLISH ALPHABET',w/2,76);
        for(let i=0;i<26;i++){
         const x=43+(i%5)*86,y=98+Math.floor(i/5)*62;
         g.strokeStyle='#869b9b';g.strokeRect(x,y,78,54);g.font='25px Arial';g.fillText(String.fromCharCode(65+i)+' '+String.fromCharCode(97+i),x+39,y+36);
        }
       });panel(0,1.75,1.595,1.15,1.2,new THREE.MeshBasicMaterial({map:alphabet}),Math.PI);
      }
'''
assert new.count(anchor)==1;new=new.replace(anchor,poster+anchor)
assert new!=old
stair_path=p/'college1-stair-hall.js';stairs_old=stair_path.read_text(encoding='utf-8');assert stairs_old.count(old.rstrip())==1
stairs=stairs_old.replace(old.rstrip(),new.rstrip(),1)
builder_path=p/'college1-interior.js';builder_old=builder_path.read_text(encoding='utf-8');assert builder_old.count(stairs_old.rstrip())==1
builder=builder_old.replace(stairs_old.rstrip(),stairs.rstrip(),1)
html_path=next(root.glob('*.html'));html_old=html_path.read_text(encoding='utf-8');a=html_old.index('// ---- Корпус 1: увеличенный холл');b=html_old.index('const COLLEGE_MAIN_ENTRANCE=',a)
html=html_old[:a]+builder.rstrip()+'\n'+html_old[b:]
part.write_text(new,encoding='utf-8');stair_path.write_text(stairs,encoding='utf-8');builder_path.write_text(builder,encoding='utf-8');html_path.write_text(html,encoding='utf-8')
(p/'college1-stair-hall-corrected-body.js').write_text(stairs[stairs.index(' at(-13.9,7.85'):],encoding='utf-8')
(p/'college1-layout-v2.js').write_text(builder[builder.index(' // Все координаты плана:'):],encoding='utf-8')
print('Glass now transmits the scene between the frosted bands. Door plaques sit on the dark top rail.')
