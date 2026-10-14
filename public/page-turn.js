(()=>{
 let active=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const duration=460,easing='cubic-bezier(.32,.05,.2,1)';
 const box=node=>node.getBoundingClientRect();
 function snapshot(surface){
  const copy=surface.cloneNode(true),rect=box(surface),appearance=getComputedStyle(surface);
  copy.removeAttribute('id');copy.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
  // Preserve the theme and text measure without freezing inherited text-fill
  // properties: those would override the headings' and cover's own colours.
  for(const property of appearance)if(property.startsWith('--'))copy.style.setProperty(property,appearance.getPropertyValue(property));
  for(const property of ['font-family','font-size','font-weight','font-style','line-height','letter-spacing','color','padding','border','border-radius','box-shadow','overflow','background'])copy.style.setProperty(property,appearance.getPropertyValue(property));
  copy.style.setProperty('background',appearance.getPropertyValue('background'),'important');
  // Cover navigation hides the live paper furniture. Its outgoing copy must
  // retain the visibility it had when captured.
  const furniture='.quiet-page,.quiet-print-header,.quiet-folios,.quiet-corner';
  const originals=surface.querySelectorAll(furniture),copies=copy.querySelectorAll(furniture);
  originals.forEach((node,index)=>copies[index].style.setProperty('visibility',getComputedStyle(node).visibility,'important'));
  Object.assign(copy.style,{position:'absolute',inset:'auto',left:'0',top:'0',margin:'0',width:rect.width+'px',height:rect.height+'px',minWidth:'0',minHeight:'0',maxWidth:'none',maxHeight:'none',flex:'none',boxSizing:'border-box',pointerEvents:'none',transform:'none'});
  copy.style.setProperty('visibility','visible','important');
  copy.style.setProperty('display',appearance.display==='none'?'block':appearance.display,'important');
  copy.inert=true;copy.setAttribute('aria-hidden','true');
  const scrolls=[surface,...surface.querySelectorAll('*')].flatMap((node,index)=>node.scrollLeft||node.scrollTop?[{index,left:node.scrollLeft,top:node.scrollTop}]:[]);
  return {copy,rect,scrolls};
 }
 function mount(parent,shot,left=0,top=0){
  shot.copy.style.left=left+'px';shot.copy.style.top=top+'px';parent.append(shot.copy);
  // Assign scroll offsets only after insertion: detached clones cannot retain them.
  const nodes=[shot.copy,...shot.copy.querySelectorAll('*')];
  shot.scrolls.forEach(({index,left,top})=>{nodes[index].scrollLeft=left;nodes[index].scrollTop=top;});
  return shot.copy;
 }
 function layer(parent,styles){const node=document.createElement('div');Object.assign(node.style,styles);parent.append(node);return node;}
 window.SishuPageTurn={
  get busy(){return Boolean(active);},
  play(surface,direction,update,options={}){
   if(active)return false;
   if(reduced.matches||!surface||!box(surface).width||!surface.animate){update();return true;}
   const host=options.host||surface.parentElement,animations=[];
   let root;
   const clean=()=>{animations.forEach(animation=>animation.cancel());root?.remove();if(active===clean)active=null;};
   const animate=(node,frames)=>{const animation=node.animate(frames,{duration,easing,fill:'both'});animations.push(animation);return animation;};
   let updated=false;
   try{
    const old=snapshot(surface);
    // Keep the overlay outside the element that may be scrolled, hidden or replaced.
    root=layer(host,{position:'fixed',inset:'0',zIndex:'20',pointerEvents:'none',overflow:'hidden'});
    root.dataset.pageTurn=options.mode||'slide';root.inert=true;root.setAttribute('aria-hidden','true');
    active=clean;
    updated=true;update();
    const destination=options.resolveSurface?.()||surface;
    const paper=getComputedStyle(destination).getPropertyValue('--paper').trim()||getComputedStyle(destination).getPropertyValue('--reader-paper').trim()||'#fffaf0';
    if(options.mode==='spread'){
     const next=snapshot(destination),width=old.rect.width,height=old.rect.height,half=width/2;
     const stage=layer(root,{position:'absolute',left:old.rect.left+'px',top:old.rect.top+'px',width:width+'px',height:height+'px',perspective:width*6+'px',perspectiveOrigin:'50% 50%'});
     // The stationary old half remains until the reverse side of the turning leaf covers it.
     const stationary=layer(stage,{position:'absolute',inset:'0',overflow:'hidden',background:paper,clipPath:direction>0?'inset(0 50% 0 0)':'inset(0 0 0 50%)'});
     mount(stationary,old);
     const leaf=layer(stage,{position:'absolute',top:'0',left:direction>0?half+'px':'0',width:half+'px',height:height+'px',transformOrigin:direction>0?'left center':'right center',transformStyle:'preserve-3d',willChange:'transform'});
     const face=layer(leaf,{position:'absolute',inset:'0',overflow:'hidden',backfaceVisibility:'hidden',background:paper,transform:'translateZ(.1px)'});
     const frontShot={...old,copy:old.copy.cloneNode(true)};
     mount(face,frontShot,direction>0?-half:0);
     const reverse=layer(leaf,{position:'absolute',inset:'0',overflow:'hidden',backfaceVisibility:'hidden',background:paper,transform:'rotateY(180deg) translateZ(.1px)'});
     mount(reverse,next,direction>0?0:-half);
     const frontShade=layer(face,{position:'absolute',inset:'0',background:direction>0?'linear-gradient(90deg,#0003,transparent 35%)':'linear-gradient(270deg,#0003,transparent 35%)'});
     const backShade=layer(reverse,{position:'absolute',inset:'0',background:direction>0?'linear-gradient(270deg,#0003,transparent 35%)':'linear-gradient(90deg,#0003,transparent 35%)'});
     animate(frontShade,[{opacity:0},{opacity:.7,offset:.5},{opacity:0}]);
     animate(backShade,[{opacity:0},{opacity:.7,offset:.5},{opacity:0}]);
     animate(leaf,[{transform:'rotateY(0deg)',boxShadow:'0 0 0 #0000'},{transform:`rotateY(${direction>0?-90:90}deg)`,boxShadow:'0 3px 22px #0002',offset:.5},{transform:`rotateY(${direction>0?-180:180}deg)`,boxShadow:'0 0 0 #0000'}]);
    }else if(options.mode==='cover'){
     const entering=options.destinationIsCover?.();
     const stage=layer(root,{position:'absolute',left:old.rect.left+'px',top:old.rect.top+'px',width:old.rect.width+'px',height:old.rect.height+'px',perspective:'1600px',overflow:entering?'hidden':'visible'});
     const cover=mount(stage,old);cover.style.transformOrigin=direction>0?'left center':'right center';cover.style.backfaceVisibility='hidden';cover.style.willChange='transform';
     // Reveal the closing cover beneath opaque paper, avoiding a crossfade
     // that would show the final article's lettering through the cover.
     animate(cover,entering?[{transform:'translateX(0)'},{transform:`translateX(${-direction*100}%)`}]:[{transform:'rotateY(0deg)'},{transform:`rotateY(${direction>0?-105:105}deg)`}]);
    }else{
     // A single reading page slides over the next with a soft moving paper edge.
     // Text remains upright and full-sized throughout, including on narrow phones.
     const viewport=layer(root,{position:'absolute',left:old.rect.left+'px',top:old.rect.top+'px',width:old.rect.width+'px',height:old.rect.height+'px',overflow:'hidden',background:paper});
     const next=snapshot(destination);const incoming=mount(viewport,next);const outgoing=mount(viewport,old);
     for(const node of [incoming,outgoing]){node.style.setProperty('background',paper,'important');node.style.willChange='transform';}
     outgoing.style.boxShadow=direction>0?'10px 0 22px #0002':'-10px 0 22px #0002';
     animate(incoming,[{transform:`translateX(${direction*16}%)`},{transform:'translateX(0)'}]);
     animate(outgoing,[{transform:'translateX(0)'},{transform:`translateX(${-direction*100}%)`}]);
    }
    Promise.all(animations.map(animation=>animation.finished)).then(clean,clean);
   }catch(error){
    console.warn('Page turn effect unavailable:',error);
    clean();if(!updated)update();
   }
   return true;
  },
  stop(){active?.();}
 };
 reduced.addEventListener('change',()=>{if(reduced.matches)active?.();});
 window.addEventListener('resize',()=>active?.());
 window.addEventListener('pagehide',()=>active?.());
})();
