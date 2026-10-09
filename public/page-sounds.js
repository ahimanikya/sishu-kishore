/* Small original synthesized cues; no recordings, downloads or autoplay. */
(()=>{
 let context,enabled=true,last=-1,lastAt=-Infinity,voices=[];
 try{enabled=localStorage.getItem('sishu-page-sound')!=='off';}catch{}
 const buttons=new Set();
 // [delay, frequency, end frequency, duration, waveform]
 const tunes=[
  [[0,330,520,.16,'sine'],[.12,520,390,.14,'sine']], // little spring
  [[0,660,660,.10,'sine'],[.09,880,880,.14,'sine']], // two wooden bells
  [[0,250,490,.11,'sine'],[.10,370,740,.12,'sine'],[.20,490,650,.10,'sine']], // bubbles
  [[0,440,660,.22,'triangle'],[.17,660,550,.12,'sine']], // tiny slide whistle
  [[0,784,784,.09,'sine'],[.09,659,659,.09,'sine'],[.18,523,523,.13,'sine']] // tumbling notes
 ];
 function stop(){for(const voice of voices){try{voice.stop();}catch{}}voices=[];}
 function paint(){buttons.forEach(b=>{b.textContent=enabled?'♪ ଶବ୍ଦ':'♪ ନିଃଶବ୍ଦ';b.setAttribute('aria-pressed',String(enabled));b.setAttribute('aria-label',enabled?'ପୃଷ୍ଠା ଶବ୍ଦ ବନ୍ଦ କରନ୍ତୁ':'ପୃଷ୍ଠା ଶବ୍ଦ ଚାଲୁ କରନ୍ତୁ');});}
 function mount(parent){const b=document.createElement('button');b.type='button';b.className='page-sound-toggle';b.onclick=()=>{enabled=!enabled;if(!enabled)stop();try{localStorage.setItem('sishu-page-sound',enabled?'on':'off');}catch{}paint();};buttons.add(b);parent.append(b);paint();return b;}
 function play(){if(!enabled||document.hidden)return;const now=performance.now();if(now-lastAt<180)return;lastAt=now;
 try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;context??=new Audio();if(context.state==='suspended')context.resume().catch(()=>{});stop();
 // Exclude the previous tune so consecutive flips always sound different.
 const pick=(last+1+Math.floor(Math.random()*(tunes.length-1)))%tunes.length;last=pick;
 for(const [delay,from,to,duration,type] of tunes[pick]){const o=context.createOscillator(),g=context.createGain(),t=context.currentTime+delay;o.type=type;o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(to,t+duration);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(context.destination);voices.push(o);o.onended=()=>{o.disconnect();g.disconnect();voices=voices.filter(v=>v!==o);};o.start(t);o.stop(t+duration+.02);}
 }catch{/* Reading remains available when audio is unsupported. */}}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 window.SishuPageSound={mount,play,stop};
})();
