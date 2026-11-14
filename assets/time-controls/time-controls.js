function createTimeControls(){
 const button=document.getElementById('gameClock'),panel=document.getElementById('timeControls'),
  form=document.getElementById('timeForm'),dayInput=document.getElementById('timeDay'),timeInput=document.getElementById('timeValue'),
  readout=document.getElementById('timeReadout'),message=document.getElementById('timeMessage'),closeButton=document.getElementById('timeClose');
 const changes=panel.querySelectorAll('[data-time-shift],#timeDay,#timeValue,#timeApply');
 let opened=false,previousFocus=null;
 const editing=target=>target instanceof Element&&!!target.closest('input,textarea,select,[contenteditable="true"]');
 function refresh(){
  const state=gameTime.get(),display=String(state.hour).padStart(2,'0')+':'+String(state.minute).padStart(2,'0');
  dayInput.value=state.day;timeInput.value=display;readout.textContent='День '+state.day+' · '+display;
  const riding=!!busTransit?.aboard;
  changes.forEach(control=>control.disabled=riding);
  message.textContent=riding?'Чтобы перемотать время, сначала выйдите из автобуса.':state.absoluteMinute===0?'Начало первого дня. Дальше назад перемотать нельзя.':'';
  if(!riding)for(const control of panel.querySelectorAll('[data-time-shift]'))control.disabled=state.absoluteMinute===0&&Number(control.dataset.timeShift)<0;
 }
 function open(){
  if(opened||document.hidden||sh>sw||document.getElementById('start').style.display!=='none')return;
  previousFocus=document.activeElement;resetInput();doorPointer=transitionPointer=null;closeDoorChoices();
  // Home's pauseMedia also advances ride physics on resume; keep those frozen here.
  if(!activeWorld.playground)activeWorld.pauseMedia?.();
  clockFrame=null;opened=true;refresh();panel.hidden=false;button.setAttribute('aria-expanded','true');document.documentElement.classList.add('timeControlsOpen');
  closeButton.focus({preventScroll:true});
 }
 function close(){
  if(!opened)return;
  opened=false;panel.hidden=true;button.setAttribute('aria-expanded','false');document.documentElement.classList.remove('timeControlsOpen');clockFrame=null;resetInput();
  const focus=previousFocus instanceof HTMLElement&&previousFocus.isConnected&&previousFocus!==document.body?previousFocus:button;
  focus.focus({preventScroll:true});
 }
 function change(action){
  if(busTransit?.aboard){refresh();return;}
  try{action();refresh();R.render(activeWorld.scene,C);}
  catch(error){message.textContent=error instanceof RangeError?'Введите день от 1 и время от 00:00 до 23:59.':error.message;}
 }
 button.addEventListener('click',()=>opened?close():open());
 closeButton.addEventListener('click',close);document.getElementById('timeResume').addEventListener('click',close);
 panel.addEventListener('click',event=>{if(event.target===panel)close();});
 for(const control of panel.querySelectorAll('[data-time-shift]'))control.addEventListener('click',()=>change(()=>gameTime.shift(Number(control.dataset.timeShift))));
 form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  change(()=>{const [hour,minute]=timeInput.value.split(':').map(Number);return gameTime.set(dayInput.valueAsNumber,hour,minute);});
 });
 // UI gestures must never start camera dragging or the mobile movement stick.
 for(const type of ['pointerdown','pointermove','pointerup','pointercancel']){
  panel.addEventListener(type,event=>event.stopPropagation());button.addEventListener(type,event=>event.stopPropagation());
 }
 addEventListener('keydown',event=>{
  if(event.code==='KeyT'&&!editing(event.target)&&!event.ctrlKey&&!event.altKey&&!event.metaKey){
   event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)(opened?close:open)();return;
  }
  if(!opened)return;
  event.stopImmediatePropagation();
  if(event.code==='Escape'){event.preventDefault();if(!event.repeat)close();return;}
  if(event.code==='Tab'){
   const focusable=Array.from(panel.querySelectorAll('button,input')).filter(control=>!control.disabled),first=focusable[0],last=focusable.at(-1);
   if(event.shiftKey&&(document.activeElement===first||!panel.contains(document.activeElement))){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&(document.activeElement===last||!panel.contains(document.activeElement))){event.preventDefault();first.focus();}
  }
 },true);
 addEventListener('keyup',event=>{if(opened)event.stopImmediatePropagation();},true);
 return {open,close,get opened(){return opened;}};
}
