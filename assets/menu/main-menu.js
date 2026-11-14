function createGameFrontEnd(){
 const root=document.documentElement,start=document.getElementById('start'),intro=document.getElementById('studioIntro'),logo=document.getElementById('studioLogo');
 const panel=document.getElementById('menuPanel'),panelTitle=document.getElementById('menuPanelTitle'),closeButton=document.getElementById('menuPanelClose');
 const music=document.getElementById('menuMusic'),volumeInput=document.getElementById('menuMusicVolume'),volumeValue=document.getElementById('menuMusicValue'),soundButton=document.getElementById('menuSound'),soundLabel=document.getElementById('menuSoundLabel');
 const objective=document.getElementById('storyObjective'),objectiveText=document.getElementById('storyObjectiveText');
 const introTiming=Object.freeze({black:2000,fadeIn:1100,hold:1500,fadeOut:1000});
 const introEnd=introTiming.black+introTiming.fadeIn+introTiming.hold+introTiming.fadeOut;
 let phase='intro',elapsed=0,previousFrame=null,previews=null,currentPanel=null,panelOrigin='menu',previousFocus=null;
 let volume=.35,lastVolume=.35,audioBlocked=true,story=null,started=false,priming=false,musicAttempt=null,musicRetry=false;
 try{const stored=JSON.parse(localStorage.getItem('200daysstudent.settings')||'null');if(stored&&Number.isFinite(stored.menuMusicVolume))volume=THREE.MathUtils.clamp(stored.menuMusicVolume,0,1);}catch{}
 music.volume=volume;
 function saveVolume(){try{localStorage.setItem('200daysstudent.settings',JSON.stringify({...JSON.parse(localStorage.getItem('200daysstudent.settings')||'{}'),menuMusicVolume:volume}));}catch{}}
 function audioUI(){
  volumeInput.value=String(Math.round(volume*100));volumeValue.value=volumeValue.textContent=Math.round(volume*100)+'%';
  soundLabel.textContent=volume===0?'Без музыки':'Музыка меню';
  soundButton.setAttribute('aria-label',volume===0?'Включить музыку меню':'Выключить музыку меню');
  soundButton.setAttribute('aria-pressed',String(volume>0));soundButton.dataset.blocked=String(audioBlocked);
 }
 function canPlayMusic(){return phase==='menu'&&!document.hidden&&volume>0;}
 function stopMusic(rewind=false){music.autoplay=false;if(!music.paused)music.pause();if(rewind)try{music.currentTime=0;}catch{}audioUI();}
 function playMusic(){
  if(!canPlayMusic())return;
  if(musicAttempt){musicRetry=true;return;}
  musicRetry=false;music.volume=volume;music.autoplay=true;
  try{const result=music.play();if(result?.then)musicAttempt=result.then(()=>{audioBlocked=false;if(!canPlayMusic())stopMusic();else audioUI();}).catch(()=>{audioBlocked=true;audioUI();}).finally(()=>{musicAttempt=null;const retry=musicRetry;musicRetry=false;if(retry&&canPlayMusic())playMusic();});}catch{audioBlocked=true;audioUI();}
 }
 function setVolume(value){volume=THREE.MathUtils.clamp(Number(value)||0,0,1);if(volume>0)lastVolume=volume;music.volume=volume;saveVolume();if(volume===0)stopMusic();else playMusic();audioUI();}
 volumeInput.addEventListener('input',()=>setVolume(Number(volumeInput.value)/100));
 soundButton.addEventListener('click',()=>setVolume(volume===0?lastVolume:0));
 // Any normal input unlocks audio; the player never needs a dedicated play-music action.
 // A gesture during the logo primes this same media element silently for menu entry.
 function wakeMusic(){
  if(volume===0)return;
  if(phase!=='intro'){playMusic();return;}
  if(priming)return;priming=true;music.muted=true;
  try{Promise.resolve(music.play()).then(()=>{
   if(!canPlayMusic()){music.pause();try{music.currentTime=0;}catch{}}
   music.muted=false;audioBlocked=false;if(canPlayMusic())playMusic();
  }).catch(()=>{music.muted=false;}).finally(()=>{priming=false;});}catch{music.muted=false;priming=false;}
 }
 addEventListener('pointerdown',wakeMusic,true);addEventListener('keydown',wakeMusic,true);
 music.addEventListener('playing',audioUI);music.addEventListener('pause',audioUI);audioUI();

 function createPreview(outfit,background,cameraPosition,heading,warm){
  const avatar=createPlayerAvatar();avatar.setOutfit(outfit);
  const model=avatar.model;model.root.scale.set(1,1,1);model.root.position.set(0,0,0);model.root.rotation.y=heading;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x14202c);scene.add(model.root);
  scene.add(new THREE.HemisphereLight(warm?0xfff5e8:0xf0f5ff,0x6a655f,.95));
  const light=new THREE.DirectionalLight(warm?0xffe5c3:0xf0f4ff,.65);light.position.set(-1.5,3,4);scene.add(light);
  const camera=new THREE.PerspectiveCamera(43,1,.04,15);camera.layers.enable(1);camera.position.set(...cameraPosition);camera.lookAt(0,1.12,0);
  const image=document.createElement('img'),texture=new THREE.Texture(image);texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
  image.onload=()=>{texture.needsUpdate=true;scene.background=texture;};image.src=background;
  return {avatar,model,scene,camera,texture,image,heading};
 }
 function ensurePreviews(){
  if(previews)return;
  // Still frames come directly from the game. Only the two foreground models
  // need rendering each frame; the full apartment and college stay unloaded.
  previews=[createPreview('casual',MAIN_MENU_BACKGROUNDS.home,[1.2,1.42,3.1],Math.atan2(1.2,3.1),true),
   createPreview('uniform',MAIN_MENU_BACKGROUNDS.college,[-2.0125,1.42,2.645],Math.atan2(-1.75,2.3),false)];
 }
 function renderMenu(t){
  ensurePreviews();
  const left=Math.floor(sw/2),seconds=t/1000;
  R.setScissorTest(true);
  previews.forEach((view,index)=>{
   const width=index?sw-left:left,aspect=width/Math.max(sh,1),sourceAspect=1600/1200;
   view.camera.aspect=aspect;view.camera.updateProjectionMatrix();
   view.texture.repeat.set(Math.min(1,aspect/sourceAspect),1);view.texture.offset.set((1-view.texture.repeat.x)/2,0);view.texture.updateMatrix();
   // The shared skeleton moves the shirt/cardigan, shoulders, head and hands.
   view.model.pose({height:view.model.standingHeight,time:seconds,lean:.003*Math.sin(seconds*.43+index),look:.014*Math.sin(seconds*.27+index)});
   const breath=.5+.5*Math.sin(seconds*1.65+index*.4);
   view.model.names.body.scale.x=1+.009*breath;view.model.names.body.scale.z=1+.012*breath;
   view.model.root.rotation.y=view.heading+.006*Math.sin(seconds*.34+index);view.avatar.eyes.sample(seconds);
   R.setViewport(index?left:0,0,width,sh);R.setScissor(index?left:0,0,width,sh);R.render(view.scene,view.camera);
  });
  R.setScissorTest(false);R.setViewport(0,0,sw,sh);
 }
 function enterMenu(){
  phase='menu';root.dataset.screen='menu';intro.hidden=true;logo.style.opacity='0';start.style.display='flex';
  panel.hidden=true;currentPanel=null;objective.hidden=true;resetInput();clockFrame=null;previousFrame=null;
  document.getElementById('play').focus({preventScroll:true});music.autoplay=true;playMusic();
 }
 function render(t){
  if(document.hidden){previousFrame=null;return;}
  if(phase==='intro'){
   ensurePreviews();
   if(previousFrame!==null)elapsed+=Math.max(0,t-previousFrame);previousFrame=t;
   const fade=elapsed-introTiming.black;
   const opacity=fade<0?0:fade<introTiming.fadeIn?fade/introTiming.fadeIn:fade<introTiming.fadeIn+introTiming.hold?1:Math.max(0,1-(fade-introTiming.fadeIn-introTiming.hold)/introTiming.fadeOut);
   logo.style.opacity=String(opacity);
   if(elapsed>=introEnd)enterMenu();
   else return;
  }
  if(phase==='menu')renderMenu(t);
  else if(phase!=='game')R.render(activeWorld.scene,C);
 }
 const titles={settings:'Настройки',support:'Поддержка',advertising:'Реклама',donation:'Пожертвование',pause:'Пауза',chapter:'Первое утро'};
 function showPanel(name,origin=phase){
  previousFocus=document.activeElement;panelOrigin=origin;currentPanel=name;panelTitle.textContent=titles[name];
  for(const content of panel.querySelectorAll('[data-menu-panel]'))content.hidden=content.dataset.menuPanel!==name;
  panel.hidden=false;closeButton.hidden=name==='chapter';(name==='chapter'?document.getElementById('beginChapter'):closeButton).focus({preventScroll:true});
 }
 function closePanel(){
  if(currentPanel==='chapter'){returnToMenu();return;}
  if(currentPanel==='settings'&&panelOrigin==='pause'){showPanel('pause','game');return;}
  if(currentPanel==='pause'){resume();return;}
  panel.hidden=true;currentPanel=null;
  if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
 }
 closeButton.addEventListener('click',closePanel);panel.addEventListener('click',event=>{if(event.target===panel&&currentPanel!=='chapter')closePanel();});
 document.getElementById('menuSettings').onclick=()=>showPanel('settings','menu');
 document.getElementById('menuSupport').onclick=()=>showPanel('support','menu');
 document.getElementById('menuAdvertising').onclick=()=>showPanel('advertising','menu');
 document.getElementById('menuDonation').onclick=()=>showPanel('donation','menu');
 document.getElementById('pauseSettings').onclick=()=>showPanel('settings','pause');
 function requestLandscape(){const element=document.documentElement;try{element.requestFullscreen?.().then(()=>screen.orientation?.lock?.('landscape')).catch(()=>{});}catch{}}
 function resume(){phase='game';root.dataset.screen='game';panel.hidden=true;currentPanel=null;start.style.display='none';clockFrame=null;last=performance.now();resetInput();}
 function pause(){
  if(phase!=='game')return;
  timeControls.close();phase='pause';root.dataset.screen='pause';resetInput();clockFrame=null;gameAudio?.pause();
  if(!activeWorld.playground)activeWorld.pauseMedia?.();showPanel('pause','game');
 }
 function returnToMenu(){
  if(!activeWorld.playground)activeWorld.pauseMedia?.();timeControls.close();gameAudio?.pause();stopMusic(true);enterMenu();
 }
 document.getElementById('gameMenu').onclick=pause;document.getElementById('resumeGame').onclick=resume;document.getElementById('returnMainMenu').onclick=returnToMenu;
 function resetTrip(){
  for(const bus of busTransit.fleet.values())bus.root.parent?.remove(bus.root);
  busTransit=createBusTransit();busTransit.attach(activeWorld,currentLocation);busTransit.update(0,true);
 }
 function startGame(mode){
  if(!['story','tester'].includes(mode))throw Error('Unknown game mode');
  stopMusic(true);resetInput();timeControls.close();panel.hidden=true;currentPanel=null;intro.hidden=true;start.style.display='none';
  phase='launching';gameMode=mode;root.dataset.mode=mode;root.dataset.screen='chapter';
  playerClothing.equipped='casual';playerClothing.stored='uniform';playerAvatar.setOutfit('casual');
  resetTrip();for(const world of Object.values(locations))if(world)world.state=null;
  gameTime.set(1,mode==='story'?6:7,mode==='story'?55:30);
  const location=mode==='story'?'apartment':'college';
  if(currentLocation!==location)switchLocation(location,{fresh:true,exitingCollege:true,fromApartment:true,exiting:true});
  else{C.position.set(...activeWorld.spawn);yaw=activeWorld.yaw||0;pitch=activeWorld.pitch||0;feetY=0;fly=0;}
  C.rotation.set(pitch,yaw,0);updateFlyUI();
  document.getElementById('gameClock').disabled=mode==='story';
  document.getElementById('gameClock').setAttribute('aria-label',mode==='story'?'Игровое время':'Игровое время — перемотать');
  story=mode==='story'?{chapter:1,step:'dress',rodeBus:false,completed:false}:null;started=true;requestLandscape();
  if(story){phase='chapter';showPanel('chapter','game');updateStory();}
  else{objective.hidden=true;resume();}
 }
 document.getElementById('play').onclick=()=>startGame('story');document.getElementById('testerMode').onclick=()=>startGame('tester');
 document.getElementById('beginChapter').onclick=()=>{objective.hidden=false;resume();};
 const goals={dress:'Переоденься в форму: открой шкаф в комнате и удерживай E на одежде.',leave:'Выйди из квартиры и спустись во двор.',bus:'Доберись до колледжа на автобусе №1.',college:'Войди в первый корпус колледжа.',classroom:'Найди кабинет 108 и войди в него.',complete:'Первое утро завершено. Ты в кабинете 108.'};
 function storyStep(next){const previous=story.step;story.step=next;objectiveText.textContent=goals[next];dispatchEvent(new CustomEvent('game:story-step',{detail:{chapter:1,previous,current:next}}));}
 function updateStory(){
  if(!story)return;
  objectiveText.textContent=goals[story.step];
  if(story.step==='dress'&&playerClothing.equipped==='uniform')storyStep('leave');
  if(story.step==='leave'&&currentLocation==='home')storyStep('bus');
  if(story.step==='bus'){
   if(busTransit.aboard&&busTransit.rider?.origin==='home')story.rodeBus=true;
   if(story.rodeBus&&!busTransit.aboard&&currentLocation==='college')storyStep('college');
  }
  if(story.step==='college'&&currentLocation==='college1')storyStep('classroom');
  if(story.step==='classroom'&&currentLocation==='college1'&&/108/.test(activeWorld.roomAt(C.position.x,C.position.z,feetY))){story.completed=true;storyStep('complete');showNotice('Ты добрался до кабинета 108. Первое утро завершено.',6000);}
 }
 function focusable(){return Array.from((panel.hidden?start:panel).querySelectorAll('button,input,a')).filter(element=>!element.disabled&&!element.hidden&&element.getClientRects().length);}
 addEventListener('keydown',event=>{
  if(phase==='game'){
   if(gameMode==='story'&&['KeyF','KeyL','KeyT'].includes(event.code)){event.preventDefault();event.stopImmediatePropagation();return;}
   if(event.code==='Escape'&&!event.repeat&&!timeControls.opened&&!choicesOpen()&&!activeWorld.playground?.occupied){event.preventDefault();event.stopImmediatePropagation();pause();}return;
  }
  // Let form controls receive their native keyboard actions. Their bubbling
  // events stop at the panel, before the game's movement listeners on window.
  if(event.target.closest?.('input,textarea,select')&&!['Escape','Tab'].includes(event.code))return;
  event.stopImmediatePropagation();
  if(phase==='intro'){event.preventDefault();return;}
  if(event.code==='Escape'){event.preventDefault();if(!panel.hidden)closePanel();return;}
  if(['Enter','Space'].includes(event.code)&&event.target.closest?.('button,a')){event.preventDefault();if(!event.repeat)event.target.closest('button,a').click();return;}
  const targets=focusable(),index=targets.indexOf(document.activeElement);
  if(event.code==='Tab'&&targets.length){const next=(index+(event.shiftKey?-1:1)+targets.length)%targets.length;event.preventDefault();targets[next].focus();}
  else if(['ArrowDown','ArrowUp'].includes(event.code)&&event.target.tagName!=='INPUT'&&targets.length){event.preventDefault();targets[(index+(event.code==='ArrowDown'?1:-1)+targets.length)%targets.length].focus();}
 },true);
 addEventListener('keyup',event=>{if(phase!=='game'&&!event.target.closest?.('input,textarea,select'))event.stopImmediatePropagation();},true);
 for(const surface of [start,panel])for(const type of ['keydown','keyup'])surface.addEventListener(type,event=>event.stopPropagation());
 for(const surface of [start,panel,intro])for(const type of ['pointerdown','pointermove','pointerup','pointercancel'])surface.addEventListener(type,event=>{event.stopPropagation();if(type==='pointerdown'&&phase==='menu')playMusic();});
 document.addEventListener('visibilitychange',()=>{previousFrame=null;if(document.hidden)stopMusic();else playMusic();});
 return {render,start:startGame,pause,resume,returnToMenu,updateStory,setMusicVolume:setVolume,
  get blocking(){return phase!=='game';},get phase(){return phase;},get mode(){return gameMode;},get introElapsed(){return elapsed;},get introTiming(){return introTiming;},
  get previews(){return previews;},get story(){return story?{...story}:null;},get musicVolume(){return volume;},get started(){return started;}};
}
