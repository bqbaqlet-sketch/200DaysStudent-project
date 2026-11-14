function createGameAudio(){
 const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
 let settings={sfxVolume:.65,ambienceVolume:.45};
 try{settings={...settings,...JSON.parse(localStorage.getItem('200daysstudent.settings')||'{}')};}catch{}
 let context=null,effects=null,ambience=null,master=null,echoSend=null,meter=null,unlocked=false,muted=true;
 let previous=null,lastLocation=null,distance=0,lastMinute=null,seconds=0,lastBird=0,focused=true;
 const buffers=new Map(),pending=new Map(),loops=new Map(),voices=new Set(),actors=new Map(),doors=new Map(),mechanisms=new Map(),lastSteps=new Map();
 const stats={played:{},errors:[],footsteps:0,npcSteps:0,decodedBytes:0,recentFootsteps:[]};
 const point=new THREE.Vector3(),scratch=new THREE.Vector3();
 function save(){try{localStorage.setItem('200daysstudent.settings',JSON.stringify({...JSON.parse(localStorage.getItem('200daysstudent.settings')||'{}'),sfxVolume:settings.sfxVolume,ambienceVolume:settings.ambienceVolume}));}catch{}}
 function setVolume(channel,value){
  if(!['sfxVolume','ambienceVolume'].includes(channel))return;
  settings[channel]=clamp(Number(value)||0);save();refreshUI();
  if(context){effects.gain.setTargetAtTime(settings.sfxVolume,context.currentTime,.035);ambience.gain.setTargetAtTime(settings.ambienceVolume,context.currentTime,.08);}
 }
 function refreshUI(){
  for(const [field,id]of [['sfxVolume','gameEffectsVolume'],['ambienceVolume','gameAmbienceVolume']]){
   const input=document.getElementById(id),output=document.getElementById(id+'Value');
   if(input)input.value=String(Math.round(clamp(settings[field])*100));
   if(output)output.value=output.textContent=Math.round(clamp(settings[field])*100)+'%';
  }
 }
 for(const [field,id]of [['sfxVolume','gameEffectsVolume'],['ambienceVolume','gameAmbienceVolume']])
  document.getElementById(id)?.addEventListener('input',event=>setVolume(field,Number(event.target.value)/100));
 refreshUI();
 function ensureContext(){
  if(context)return context;
  const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return null;
  context=new Context({latencyHint:'interactive'});
  master=context.createGain();master.gain.value=0;
  const compressor=context.createDynamicsCompressor();compressor.threshold.value=-18;compressor.knee.value=18;compressor.ratio.value=4;
  master.connect(compressor);compressor.connect(context.destination);
  meter=context.createAnalyser();meter.fftSize=1024;master.connect(meter);
  effects=context.createGain();effects.gain.value=clamp(settings.sfxVolume);effects.connect(master);
  ambience=context.createGain();ambience.gain.value=clamp(settings.ambienceVolume);ambience.connect(master);
  // Short, quiet reflections give tiled rooms a different sound without a long convolution.
  echoSend=context.createGain();echoSend.gain.value=0;effects.connect(echoSend);
  const delay=context.createDelay(.25),damping=context.createBiquadFilter(),tail=context.createGain();
  delay.delayTime.value=.075;damping.type='lowpass';damping.frequency.value=2100;tail.gain.value=.16;
  echoSend.connect(delay);delay.connect(damping);damping.connect(tail);tail.connect(master);
  return context;
 }
 async function unlock(){
  const ctx=ensureContext();if(!ctx)return;
  try{await ctx.resume();unlocked=ctx.state==='running';if(unlocked)update(0);}catch(error){stats.errors.push(error.message);}
 }
 function load(name){
  if(buffers.has(name))return Promise.resolve(buffers.get(name));if(pending.has(name))return pending.get(name);
  const data=GAME_AUDIO_ASSETS[name];if(!data||!context)return Promise.resolve(null);
  const task=(async()=>{
   try{const raw=atob(data.slice(data.indexOf(',')+1)),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    const buffer=await context.decodeAudioData(bytes.buffer);buffers.set(name,buffer);stats.decodedBytes+=buffer.length*buffer.numberOfChannels*4;return buffer;
   }catch(error){stats.errors.push(name+': '+error.message);return null;}
   finally{pending.delete(name);}
  })();pending.set(name,task);return task;
 }
 function spatial(position,range=12){
  if(!position)return {gain:1,pan:0};
  const dx=position.x-C.position.x,dz=position.z-C.position.z,dy=(position.y??1)-C.position.y,d=Math.hypot(dx,dz,dy);
  return {gain:1/(1+(d/(range*.28))**2)*clamp((range-d)/2),pan:clamp((dx*Math.cos(yaw)-dz*Math.sin(yaw))/Math.max(1,d),-1,1)};
 }
 function record(name){stats.played[name]=(stats.played[name]||0)+1;}
 function wire(source,volume,pan,bus){
  const gain=context.createGain();gain.gain.value=volume;source.connect(gain);
  let panner=null;if(context.createStereoPanner){panner=context.createStereoPanner();panner.pan.value=pan;gain.connect(panner);panner.connect(bus);}else gain.connect(bus);
  return {gain,panner,dispose(){source.disconnect();gain.disconnect();panner?.disconnect();}};
 }
 function isPlaying(){return focused&&!document.hidden&&sw>=sh&&frontEnd?.phase==='game'&&!timeControls.opened;}
 function play(name,{volume=.5,position=null,range=12,rate=1,ui=false}={}){
  if(!context||context.state!=='running'||(!ui&&!isPlaying())||settings.sfxVolume===0)return false;
  const buffer=buffers.get(name);if(!buffer){load(name);return false;}
  if(ui)master.gain.setTargetAtTime(1,context.currentTime,.01);
  const placement=spatial(position,range);if(placement.gain<.003)return false;
  if(voices.size>=24){const oldest=voices.values().next().value;voices.delete(oldest);try{oldest.stop();}catch{}}
  const source=context.createBufferSource();source.buffer=buffer;source.playbackRate.value=rate;
  const nodes=wire(source,volume*placement.gain,placement.pan,effects);voices.add(source);
  source.onended=()=>{voices.delete(source);nodes.dispose();};source.start();record(name);return true;
 }
 function loop(name,id,volume,position=null,range=25,rate=1,ambient=true){
  const placement=spatial(position,range);if(volume*placement.gain<.0005)return;
  let entry=loops.get(id);
  if(!entry){
   const buffer=buffers.get(name);if(!buffer){if(volume>.001)load(name);return;}
   if(volume<.001)return;
   const source=context.createBufferSource();source.buffer=buffer;source.loop=true;source.playbackRate.value=rate;
   const nodes=wire(source,0,0,ambient?ambience:effects);entry={source,...nodes,id,name,wanted:0};loops.set(id,entry);source.start(0,Math.random()*buffer.duration);record(name);
  }
  entry.wanted=volume*placement.gain;
  entry.gain.gain.setTargetAtTime(entry.wanted,context.currentTime,.16);
  entry.panner?.pan.setTargetAtTime(placement.pan,context.currentTime,.12);
  entry.source.playbackRate.setTargetAtTime(rate,context.currentTime,.12);entry.seen=true;
 }
 function stopLoops(){for(const entry of loops.values()){try{entry.source.stop();}catch{}entry.dispose();}loops.clear();}
 function pause(){
  previous=null;distance=0;lastMinute=null;actors.clear();doors.clear();mechanisms.clear();
  if(!context)return;master.gain.cancelScheduledValues(context.currentTime);master.gain.setValueAtTime(0,context.currentTime);
  for(const source of voices)try{source.stop();}catch{}stopLoops();muted=true;
 }
 function surface(){
  if(busTransit?.aboard)return 'concrete';
  if(currentLocation==='apartment')return 'wood';
  if(['college1','college2','entrance4'].includes(currentLocation))return 'concrete';
  const x=C.position.x,z=C.position.z;
  if(currentLocation==='home')return x>=5&&x<=51&&z>=21&&z<=51?'grass':'street';
  return ((x>25.5&&z>5.5)||(x<-24.5&&z<-14.4))?'grass':'street';
 }
 function footstep(kind,options={}){
  const outdoors=['street','grass'].includes(kind),previous=lastSteps.get(kind);
  const index=previous===undefined?Math.floor(Math.random()*4):(previous+1+Math.floor(Math.random()*3))%4;
  const played=play(`footstep_${kind}_00${index}`,{volume:outdoors?.42:.58,rate:outdoors?.985+Math.random()*.035:.94+Math.random()*.12,...options});
  if(played){lastSteps.set(kind,index);stats.recentFootsteps.push({kind,index});if(stats.recentFootsteps.length>16)stats.recentFootsteps.shift();}
  return played;
 }
 function steps(){
  const riding=busTransit?.aboard,ride=busTransit?.rider;
  const position=riding?ride.local:C.position;
  const locked=fly||activeWorld.playground?.occupied||(riding&&(ride.seated||ride.motion));
  if(!previous||lastLocation!==currentLocation||locked){previous=position.clone();distance=0;return;}
  const moved=Math.hypot(position.x-previous.x,position.z-previous.z);previous.copy(position);
  if(moved>1.1){distance=0;return;}
  const kind=surface(),outdoors=['street','grass'].includes(kind);
  // The outdoor controller moves faster than a real walking person; avoid machine-gun cadence.
  distance+=moved;const stride=outdoors?(keys.ShiftLeft?2.25:1.7):(keys.ShiftLeft?1.05:.78);
  if(distance>=stride){distance%=stride;if(footstep(kind,{volume:outdoors?(keys.ShiftLeft?.57:.42):(keys.ShiftLeft?.76:.58)}))stats.footsteps++;}
 }
 function npcSteps(){
  const world=activeWorld;
  const people=[world.frontStudent108,world.misha108,world.student108,world.sanya108,world.alexey108,world.teacher110,world.visitor110,world.director110,world.nvp110,world.medvedev,world.clothingSeller];
  for(const actor of people){
   const root=actor?.root??actor?.model?.root;if(!root?.visible)continue;
   root.getWorldPosition(point);const distanceToPlayer=point.distanceTo(C.position);if(distanceToPlayer>9)continue;
   const old=actors.get(root),position=point.clone();actors.set(root,{position,distance:old?.distance||0});
   if(!old)continue;const moved=Math.hypot(position.x-old.position.x,position.z-old.position.z);
   if(moved>0&&moved<.6){const entry=actors.get(root);entry.distance+=moved;if(entry.distance>.85){entry.distance%=.85;const outdoors=['college','home'].includes(currentLocation);if(footstep(outdoors?'street':'concrete',{volume:outdoors?.2:.26,position,range:9}))stats.npcSteps++;}}
  }
 }
 function doorSounds(){
  for(const door of [...(activeWorld.interactiveClassroomDoors||[]),activeWorld.bathroomDoor].filter(Boolean)){
   const state=!!door.open,old=doors.get(door);doors.set(door,state);
   if(old!==undefined&&state!==old){
    const position=door.handlePosition?door.handlePosition(scratch):Number.isFinite(door.x)&&Number.isFinite(door.z)?{x:door.x,y:(door.floorY||0)+1.1,z:door.z}:null;
    play(state?'door-open':'door-close',{volume:.42,position,range:10});
   }
  }
 }
 function busSounds(){
  const vehicle=busTransit?.aboard?busTransit.rider.bus:busTransit?.fleet.get(currentLocation);
  if(!vehicle?.root.visible)return;
  const aboard=!!busTransit.aboard,position=aboard?null:vehicle.root.position;
  loop('bus-engine','bus-engine',aboard?.27:.52,position,46,.82+vehicle.speed*.065,false);
  const old=mechanisms.get(vehicle);mechanisms.set(vehicle,{doors:vehicle.doors,speed:vehicle.speed});
  if(!old)return;
  if(Math.abs(vehicle.doors-old.doors)>.004&&Math.abs(vehicle.doors-old.doors)<.25&&!old.movingDoors){
   play('air-brake',{volume:aboard?.3:.48,position,range:22,rate:1.1});
  }
  const state=mechanisms.get(vehicle);state.movingDoors=Math.abs(vehicle.doors-old.doors)>.004;
  if(old.speed>.35&&vehicle.speed<=.35)play('air-brake',{volume:.56,position,range:30,rate:.78});
 }
 function playgroundSounds(){
  const playground=activeWorld.playground;if(!playground)return;
  for(const unit of playground.units){
   const position=unit.sample(0).seat??unit.part?.pivot;if(!position)continue;
   if(unit.kind==='carousel')loop('carousel','carousel-'+unit.id,clamp(Math.abs(unit.speed)*.4,0,.38),position,12,.75+Math.min(1,Math.abs(unit.speed))*.4,false);
   else if(['swing','swingBench'].includes(unit.kind)){
    const old=mechanisms.get(unit);mechanisms.set(unit,{speed:unit.speed,time:old?.time??-10});
    if(old&&Math.sign(old.speed)!==Math.sign(unit.speed)&&Math.abs(unit.theta)>.025&&seconds-old.time>.45){
     if(play(Math.random()>.5?'creak1':'creak2',{volume:clamp(Math.abs(unit.theta)*.8,.06,.3),position,range:12,rate:1.05+Math.random()*.17}))mechanisms.get(unit).time=seconds;
    }
   }
  }
 }
 function barrierSound(){
  if(currentLocation!=='college')return;
  const old=mechanisms.get(barG),moving=old&&Math.abs(barAng-old.angle)>.0006;
  mechanisms.set(barG,{angle:barAng,moving});
  if(moving)loop('carousel','barrier-motor',.18,barG.position,15,1.7,false);
  else if(old?.moving)play('door-close',{volume:.18,position:barG.position,range:15,rate:1.4});
 }
 function atmosphere(){
  const outdoor=['college','home'].includes(currentLocation),clock=gameTime.get(),day=clock.hour>=6&&clock.hour<21;
  if(outdoor){
   loop('nature','nature',day?.30:.025,null,25,1,true);
   loop('wind','wind',day?.09:.16,null,25,1,true);
   if(currentLocation==='college')loop('water','fountain',.32,{x:31.7,y:1,z:-25.1},20,1,true);
   if(!day&&seconds-lastBird>4+Math.random()*3){lastBird=seconds;play('cricket',{volume:.11,position:{x:C.position.x+8,y:0,z:C.position.z-5},range:18,rate:.8+Math.random()*.4});}
  }else{
   loop('room-tone','room-tone',currentLocation==='apartment'?.065:.10,null,25,currentLocation==='entrance4'?.85:1,true);
   // Life in the college: soft movement and chairs are local to occupied classrooms.
   if(['college1','college2'].includes(currentLocation)&&clock.hour>=7&&clock.hour<18){
    if(seconds-lastBird>7+Math.random()*6){lastBird=seconds;
     const actor=activeWorld.frontStudent108||activeWorld.nvp110;
     const root=actor?.root??actor?.model?.root;
     if(root){root.getWorldPosition(point);play('chair',{volume:.12,position:point,range:8,rate:.85+Math.random()*.25});}
    }
   }
  }
  const minute=clock.absoluteMinute;
  if(lastMinute!==null&&minute>lastMinute&&minute-lastMinute<3&&['college','college1','college2'].includes(currentLocation)){
   const bells=[480,525,535,580,590,635,660,705,715,760,770,815,825,870,880,925,935,980];
   if(bells.some(time=>Math.floor(minute/1440)*1440+time>lastMinute&&Math.floor(minute/1440)*1440+time<=minute))play('college-bell',{volume:outdoor?.18:.3});
  }
  lastMinute=minute;
 }
 function update(dt){
  if(!context||context.state!=='running')return;
  if(!isPlaying()){if(!muted)pause();return;}
  if(muted){muted=false;previous=null;master.gain.setTargetAtTime(1,context.currentTime,.08);}
  seconds+=Math.min(.1,dt||0);for(const entry of loops.values())entry.seen=false;
  echoSend.gain.setTargetAtTime(['college1','college2','entrance4'].includes(currentLocation)?.45:.05,context.currentTime,.1);
  if(lastLocation!==currentLocation){previous=null;distance=0;actors.clear();doors.clear();mechanisms.clear();lastMinute=null;}
  steps();npcSteps();doorSounds();busSounds();playgroundSounds();barrierSound();atmosphere();lastLocation=currentLocation;
  for(const [id,entry]of loops){if(entry.seen)continue;entry.source.stop();entry.dispose();loops.delete(id);}
 }
 function interact(target){
  if(target.allowed===false)return;
  const action=target.action;
  if(/College|^(enter|exit|exitApartment)$/.test(action))play('door-open',{volume:.44});
  else if(action==='wardrobe')play('wardrobe',{volume:.42});
  else if(action==='outfit')play('cloth',{volume:.65});
  else if(['busSeat','playUse','playExit'].includes(action))play('chair',{volume:.30});
 }
 function synthesize(){
  const makeNoise=(name,duration,filter,decay=0)=>{
   const rate=22050,buffer=context.createBuffer(1,Math.floor(duration*rate),rate),data=buffer.getChannelData(0);let value=0,seed=2401;
   for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;value=value*filter+noise*(1-filter);data[i]=value*(decay?Math.sin(Math.PI*i/data.length)*Math.exp(-decay*i/data.length):1);}
   buffers.set(name,buffer);stats.decodedBytes+=data.byteLength;
  };
  makeNoise('air-brake',.75,.3,2);makeNoise('wind',4,.992);makeNoise('cricket',.6,.05,1);
  const cricket=buffers.get('cricket').getChannelData(0);for(let i=0;i<cricket.length;i++)cricket[i]*=Math.sin(i*2*Math.PI*3400/22050)*Math.max(0,Math.sin(i*2*Math.PI*32/22050));
 }
 const unlockAndLoad=()=>{
  const first=!context;ensureContext();if(!context)return;
  if(first){synthesize();for(const name of Object.keys(GAME_AUDIO_ASSETS))load(name);}
  unlock();
 };
 addEventListener('pointerdown',unlockAndLoad,true);addEventListener('keydown',unlockAndLoad,true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(unlocked)unlock();});
 addEventListener('blur',()=>{focused=false;pause();});
 addEventListener('focus',()=>{focused=true;if(unlocked)unlock();});
 document.addEventListener('click',event=>{if(event.target.closest?.('button')&&frontEnd?.phase!=='intro')play('click1',{volume:.12,ui:true});});
 return {update,pause,interact,play,setVolume,unlock:unlockAndLoad,
  get debug(){return {unlocked,state:context?.state||'locked',muted,volumes:{sfx:settings.sfxVolume,ambience:settings.ambienceVolume},stats,
   decoded:Array.from(buffers.keys()),loops:Array.from(loops.values(),entry=>({id:entry.id,name:entry.name,gain:entry.wanted,rate:entry.source.playbackRate.value})),voices:voices.size};},
  measureLevel(){if(!meter)return 0;const data=new Float32Array(meter.fftSize);meter.getFloatTimeDomainData(data);return Math.sqrt(data.reduce((sum,x)=>sum+x*x,0)/data.length);},
  get context(){return context;}};
}
