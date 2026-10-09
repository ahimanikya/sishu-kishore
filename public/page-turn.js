(()=>{
 let active;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 window.SishuPageTurn={play(surface,direction,update){
  active?.();
  if(reduced.matches||!surface||!surface.getBoundingClientRect().width){update();return;}
  const rect=surface.getBoundingClientRect(),copy=surface.cloneNode(true),sheet=document.createElement('div');
  sheet.setAttribute('aria-hidden','true');sheet.inert=true;
  sheet.style.cssText=`position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;overflow:hidden;pointer-events:none;z-index:20;transform-origin:${direction>0?'left':'right'} center;backface-visibility:hidden;box-shadow:0 4px 18px #0002;background:var(--paper,var(--reader-paper,#fffaf0));`;
  copy.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));copy.removeAttribute('id');
  const appearance=getComputedStyle(surface);for(const property of appearance)copy.style.setProperty(property,appearance.getPropertyValue(property));
  copy.style.margin='0';copy.style.width=rect.width+'px';copy.style.height=rect.height+'px';copy.style.boxSizing='border-box';
  sheet.append(copy);surface.parentElement.append(sheet);copy.scrollLeft=surface.scrollLeft;copy.scrollTop=surface.scrollTop;
  update();
  let animation;const clean=()=>{animation?.cancel();sheet.remove();if(active===clean)active=null;};active=clean;
  try{animation=sheet.animate([{transform:'perspective(1600px) rotateY(0deg)',opacity:1},{transform:`perspective(1600px) rotateY(${direction>0?-85:85}deg)`,opacity:0}],{duration:360,easing:'cubic-bezier(.25,.65,.3,1)'});animation.onfinish=clean;}catch{clean();}
 },stop(){active?.();}};
 reduced.addEventListener('change',()=>{if(reduced.matches)active?.();});
 window.addEventListener('pagehide',()=>active?.());
})();
