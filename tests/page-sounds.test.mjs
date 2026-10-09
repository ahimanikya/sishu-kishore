import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../public/page-sounds.js',import.meta.url),'utf8');
function setup(saved){let now=0,contexts=0;const notes=[],storage=new Map(saved?[['sishu-page-sound',saved]]:[]),events={};const param=()=>({setValueAtTime(v){this.value=v;},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});class Audio{constructor(){contexts++;this.currentTime=0;this.state='running';}createOscillator(){const o={frequency:param(),connect(){},disconnect(){},start(){notes.push(this.frequency.value);},stop(){this.stopped=true;}};return o;}createGain(){return {gain:param(),connect(){},disconnect(){}};}}
const document={hidden:false,addEventListener(n,f){events[n]=f;},createElement(){return {setAttribute(k,v){this[k]=v;}};}};
const window={AudioContext:Audio};vm.runInNewContext(source,{window,document,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},performance:{now:()=>now},Math:{...Math,random:()=>0,floor:Math.floor}});
return {api:window.SishuPageSound,notes,storage,document,events,get contexts(){return contexts;},advance(){now+=400;}};}
test('silent on load; user turns vary and rapid turns are bounded',()=>{const s=setup();assert.equal(s.contexts,0);s.api.play();const first=[...s.notes];s.api.play();assert.deepEqual(s.notes,first);s.advance();s.api.play();assert.notDeepEqual(s.notes.slice(first.length),first);assert.equal(s.contexts,1);});
test('mute preference persists and disables sound',()=>{const s=setup('off');let b;s.api.mount({append(button){b=button;}});s.api.play();assert.equal(s.contexts,0);assert.equal(b['aria-pressed'],'false');b.onclick();s.api.play();assert.equal(s.contexts,1);b.onclick();assert.equal(s.storage.get('sishu-page-sound'),'off');s.advance();const count=s.notes.length;s.api.play();assert.equal(s.notes.length,count);});
test('hidden pages do not play',()=>{const s=setup();s.document.hidden=true;s.api.play();assert.equal(s.contexts,0);});
