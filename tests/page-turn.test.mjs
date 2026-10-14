import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../public/page-turn.js',import.meta.url),'utf8');
function setup({reduced=false,unsupported=false,failAnimation=false}={}){
 const animations=[],events={},mediaEvents={};
 const style=()=>({setProperty(k,v){this[k]=v;}});
 class Node{
  constructor(){this.style=style();this.dataset={};this.children=[];this.attributes={};this.scrollLeft=0;this.scrollTop=0;}
  append(node){this.children.push(node);node.parentElement=this;}
  remove(){this.parentElement.children=this.parentElement.children.filter(n=>n!==this);}
  setAttribute(k,v){this.attributes[k]=v;}
  removeAttribute(k){delete this.attributes[k];}
  querySelectorAll(selector){const all=this.children.flatMap(n=>[n,...n.querySelectorAll('*')]);return selector==='[id]'?all.filter(n=>'id' in n.attributes):all;}
  getBoundingClientRect(){return {left:24,top:72,width:1000,height:640};}
  cloneNode(){const n=new Node();Object.assign(n.style,this.style);Object.assign(n.attributes,this.attributes);this.children.forEach(child=>n.append(child.cloneNode()));return n;}
  animate(frames,options){if(failAnimation)throw Error('unavailable');let finish,reject;const finished=new Promise((a,b)=>{finish=a;reject=b;});const a={frames,options,finished,finish,cancel(){this.cancelled=true;reject(Error('cancelled'));}};animations.push(a);return a;}
 }
 const host=new Node(),surface=new Node(),scrolling=new Node();surface.append(scrolling);host.append(surface);scrolling.scrollLeft=1048;
 if(unsupported)surface.animate=null;
 const media={matches:reduced,addEventListener(n,f){mediaEvents[n]=f;}};
 const window={addEventListener(n,f){events[n]=f;}};
 const appearance={display:'block',getPropertyValue:p=>p==='--paper'?'#fffaf0':p==='--ink'?'#234955':'',*[Symbol.iterator](){yield '--paper';yield '--ink';yield '-webkit-text-fill-color';}};
 vm.runInNewContext(source,{window,matchMedia:()=>media,getComputedStyle:()=>appearance,document:{createElement:()=>new Node()},console:{warn(){}}});
 return {api:window.SishuPageTurn,host,surface,scrolling,animations,events,media,mediaEvents,finish:async()=>{animations.forEach(a=>a.finish());await new Promise(resolve=>setImmediate(resolve));}};
}
for(const option of ['reduced','unsupported'])test(`${option} navigation updates once without an overlay`,()=>{
 const s=setup({[option]:true});let calls=0;s.api.play(s.surface,1,()=>calls++);assert.equal(calls,1);assert.equal(s.api.busy,false);assert.equal(s.host.children.length,1);
});
test('rapid input does not interrupt a turn or skip a page; next turn works after completion',async()=>{
 const s=setup();let calls=0;s.api.play(s.surface,1,()=>calls++,{mode:'spread'});assert.equal(s.api.busy,true);
 assert.equal(s.api.play(s.surface,1,()=>calls++),false);assert.equal(calls,1);assert.equal(s.host.children.length,2);
 await s.finish();assert.equal(s.api.busy,false);assert.equal(s.host.children.length,1);
 s.api.play(s.surface,-1,()=>calls++);await s.finish();assert.equal(calls,2);
});
test('outgoing and incoming snapshots keep their own nested reading positions and omit duplicate IDs',async()=>{
 const s=setup();s.scrolling.setAttribute('id','reading-pane');s.api.play(s.surface,1,()=>{s.scrolling.scrollLeft=2096;},{mode:'spread'});
 const overlay=s.host.children[1],copies=overlay.querySelectorAll('*');
 assert.ok(copies.some(n=>n.scrollLeft===1048));assert.ok(copies.some(n=>n.scrollLeft===2096));
 assert.equal(overlay.querySelectorAll('[id]').length,0);assert.equal(overlay.attributes['aria-hidden'],'true');assert.equal(overlay.inert,true);
 assert.ok(copies.every(n=>!('-webkit-text-fill-color' in n.style)));await s.finish();
});
for(const interruption of ['stop','resize','pagehide','reduced motion'])test(`${interruption} removes transient pages without another navigation`,async()=>{
 const s=setup();let calls=0;s.api.play(s.surface,1,()=>calls++);
 if(interruption==='stop')s.api.stop();else if(interruption==='reduced motion'){s.media.matches=true;s.mediaEvents.change();}else s.events[interruption]();
 await s.finish();assert.equal(calls,1);assert.equal(s.api.busy,false);assert.equal(s.host.children.length,1);assert.ok(s.animations.every(a=>a.cancelled));
});
test('an animation failure preserves the completed navigation and clears the lock',()=>{
 const s=setup({failAnimation:true});let calls=0;s.api.play(s.surface,1,()=>calls++);assert.equal(calls,1);assert.equal(s.api.busy,false);assert.equal(s.host.children.length,1);
});
