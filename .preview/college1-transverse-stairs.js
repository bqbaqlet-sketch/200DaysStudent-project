  // С промежуточной площадки — прямо к стене, затем вправо на верхнюю площадку.
  // Нижний марш и спуск сохраняют принятую привязку к деревянной стене.
  at(1.4,11.5,Math.PI/2,()=>{
   stairFloor(3.55,5.135,5.4,7.25,1.87);
   stairFloor(5.65,5.135,7.5,7.25,-1.87);
   stairFlight(3.55,5.4,0);stairFlight(5.65,7.5,0,false,true);
   stairRail([5.44,0,2],[5.44,1.87,5.135],true);
   stairRail([3.64,0,2],[3.64,1.87,5.135],true);
   stairRail([5.61,0,2],[5.61,-1.87,5.135],true);
   stairRail([7.64,0,2],[7.64,0,7.2]);
   stairRail([7.53,-1.87,5.135],[7.53,-1.87,7.2]);
   for(const v of [2.5,3.55,4.6]){
    const y=(v-2)/3.135*1.87-.22;rod([3.56,y,v],[5.39,y,v],.003,p.seam);
   }
  });
  // Второй марш идёт вперёд от места на снимке; ступени шириной 1.85 м.
  at(0,-.1,0,()=>stairFlight(6.8,8.65,1.87,true,false,4.2));
  stairRail([6.76,1.87,6.1],[6.76,3.74,1.9],true);
  stairRail([8.56,1.87,6.1],[8.56,3.74,1.9],true);
  // Площадка касается передней стены. Вправо при подъёме — в сторону убывания U.
  stairFloor(2.15,0,8.65,1.9,3.74);
  stairRail([8.56,3.74,.09],[8.56,3.74,1.9]);
  stairRail([2.2,3.74,.09],[8.56,3.74,.09]);
  stairRail([2.2,3.74,1.94],[6.76,3.74,1.94]);
  box(2.08,3.74,0,2.15,6.2,1.9,p.cream,true);
  at(2.16,.975,-Math.PI/2,()=>{
   box(-.61,3.74,-.015,.61,6.14,.04,p.trim);box(-.54,3.77,-.035,.54,6.06,-.015,p.cream);
  });
  for(const [x,v,base] of [[8.4,7.6,1.87],[8.35,.38,3.74]]){
   add(new THREE.CylinderGeometry(.16,.13,.48,14),p.white,x,base+.24,v,1,1,1);
   for(let i=0;i<9;i++){
    const a=i*2.4,top=[x+Math.cos(a)*.08,base+.59+i*.035,v+Math.sin(a)*.08];
    rod([x,base+.48,v],top,.006,p.green);add(leafGeo,p.green,...top,.7,.7,.7,0,a,.3);
   }
   collider(x-.16,base,v-.16,x+.16,base+.9,v+.16);
  }
  // Аварийная дверь — на отмеченной передней стене, рядом с входом из коридора.
  at(4.6,.035,0,()=>{
   box(-.59,0,-.015,.59,2.39,.055,p.trim);box(-.53,.035,.056,.53,2.32,.082,guardWhite);
   rod([-.37,.96,.095],[-.37,1.16,.095],.011,p.iron);
   label('ВЫХОД',0,2.55,.085,.66,.19,'#4c8398','#ffffff');
  });
  mark('stairEmergencyExit',4.6,.035,1.18,.12,{level:0,wall:'entry-wall',nearCorridorEntry:true});
  add(rodGeo,p.red,5.5,1.2,.16,.082,.41,.082);rod([5.5,1.4,.16],[5.58,1.51,.16],.015,p.iron);
  label('1',5.73,1.52,.17,.14,.19,'#b73735','#fff');
  label('←',3.75,1.0,.17,.22,.15,'#4f805b','#fff');
  mark('stairUpFlight',4.9675,7.025,3.135,1.85,{axis:'x',ascendingToward:'right-wall',footX:3.4,topX:6.535});
  mark('stairDownFlight',4.9675,4.925,3.135,1.85,{axis:'x',unlabelled:true});
  mark('stairUpperFlight',7.725,4,1.85,4.2,{axis:'z',ascendingToward:'entry-wall',baseY:1.87,topY:3.74,turnAtTop:'right'});
  mark('stairUpperTurn',5.4,.95,6.5,1.9,{level:3.74,turn:'right',wall:'entry-wall'});
