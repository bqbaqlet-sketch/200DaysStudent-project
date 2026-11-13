function createApartmentTelevision(screen){
 const audio=new Audio(apartmentTelevisionGuitar);audio.id='apartment-tv-guitar';audio.preload='metadata';audio.loop=true;
 const image=new Image(),canvas=document.createElement('canvas');canvas.width=1080;canvas.height=640;
 const ctx=canvas.getContext('2d'),map=new THREE.CanvasTexture(canvas),off=screen.material.color.clone(),position=new THREE.Vector3();
 map.encoding=THREE.sRGBEncoding;map.minFilter=THREE.LinearFilter;map.generateMipmaps=false;
 function paint(){
  ctx.fillStyle='#0d1114';ctx.fillRect(0,0,canvas.width,canvas.height);
  if(image.naturalWidth){const scale=Math.min(canvas.width/image.naturalWidth,canvas.height/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,(canvas.width-w)/2,(canvas.height-h)/2,w,h)}
  map.needsUpdate=true;
 }
 image.onload=paint;image.src=apartmentTelevisionPicture;paint();
 const soundButton=document.createElement('button');soundButton.className='fb';soundButton.id='tvSound';soundButton.textContent='Включить звук ТВ';
 soundButton.style.cssText='display:none;right:16px;bottom:76px;font-size:13px;z-index:7';document.body.append(soundButton);
 let watching=false,session=null,contentSeconds=0,context=null,gain=null,pending=false,blocked=false,active=false,targetVolume=0,distance=Infinity;
 const Context=window.AudioContext||window.webkitAudioContext;
 function prepareAudio(){
  if(!context&&Context){context=new Context();if(context.createMediaElementSource){const source=context.createMediaElementSource(audio);gain=context.createGain();gain.gain.value=0;source.connect(gain);gain.connect(context.destination)}}
  if(context?.state==='suspended')context.resume()?.catch(()=>{});
 }
 function stop(){active=false;if(!audio.paused)audio.pause();targetVolume=0;if(gain)gain.gain.setValueAtTime(0,context.currentTime);soundButton.style.display='none'}
 function start(){
  if(!active||!audio.paused||pending||blocked)return;pending=true;
  const promise=audio.play();if(!promise){pending=false;return}
  promise.then(()=>{pending=false;if(!active){audio.pause();return}blocked=false}).catch(error=>{pending=false;if(error.name==='AbortError')return;blocked=true;if(active)soundButton.style.display='block'});
 }
 function canPlay(){return watching&&currentLocation==='apartment'&&!document.hidden&&sh<=sw&&document.getElementById('start').style.display==='none'}
 function unlock(){if(!canPlay())return;active=true;prepareAudio();blocked=false;start()}
 soundButton.onclick=unlock;window.addEventListener('pointerdown',unlock);window.addEventListener('keydown',unlock);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(canPlay()){active=true;start()}});
 audio.addEventListener('loadedmetadata',()=>{if(watching&&Number.isFinite(audio.duration))audio.currentTime=Math.max(0,contentSeconds)%audio.duration});
 function update(requested,seconds,sessionId,sync=false){
  contentSeconds=seconds;const newSession=session!==sessionId;if(requested)session=sessionId;watching=requested;
  if(requested){
   if(screen.material.map!==map){screen.material.map=map;screen.material.color.set(0xffffff);screen.material.needsUpdate=true}
   if((newSession||sync)&&Number.isFinite(audio.duration)){const target=Math.max(0,seconds)%audio.duration;if(Math.abs(audio.currentTime-target)>.5)audio.currentTime=target}
  }else if(screen.material.map){screen.material.map=null;screen.material.color.copy(off);screen.material.needsUpdate=true}
  active=canPlay();if(!active){stop();return}prepareAudio();screen.getWorldPosition(position);distance=position.distanceTo(C.position);
  const room=activeWorld.roomAt?.(C.position.x,C.position.z),muffle=room==='Гостиная'?1:room==='Коридор'?.34:.17;
  targetVolume=.75/(1+(distance/2.2)**2)*muffle;
  if(gain)gain.gain.setTargetAtTime(targetVolume,context.currentTime,.18);else audio.volume=targetVolume;
  soundButton.style.display=blocked||context&&context.state!=='running'?'block':'none';start();
 }
 return {audio,image,screen,canvas,update,pause:stop,get playing(){return active&&!audio.paused},get audible(){return active&&!audio.paused&&(!context||context.state==='running')},
  get state(){return {watching,active,volume:targetVolume,distance,imageReady:!!image.naturalWidth,audioTime:audio.currentTime,blocked,context:context?.state??null}}};
}
