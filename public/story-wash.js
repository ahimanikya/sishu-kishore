(()=>{
 const palettes=[['#f6e6b9','#fffdf5'],['#f4d5c5','#fffaf6'],['#cfe6d2','#f9fdf9'],['#cde2ed','#f8fcff']];
 const enabled=()=>{try{return localStorage.getItem('sishu-colour-paper')!=='false';}catch{return true;}};
 window.SishuStoryWash={enabled,set(value){try{localStorage.setItem('sishu-colour-paper',String(value));}catch{}window.dispatchEvent(new Event('sishu-paper-change'));},paint(surface,path){const key=path.replace(/\.html$|\/$/g,'');let hash=0;for(const char of key)hash=(hash*31+char.charCodeAt(0))>>>0;const [tint,paper]=palettes[hash%palettes.length];surface.style.setProperty('--story-tint',tint);surface.style.setProperty('--story-paper',paper);surface.dataset.storyWash=String(enabled());}};
})();
