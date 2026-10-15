import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../public/shishu-magazine.js',import.meta.url),'utf8');
const ids=Array.from({length:25},(_,i)=>`/shishu/article-${i}.html`);
function visit({storage=new Map(),state=null,random=()=>0.25,blocked=false,home=true,articles=ids}={}){
 const cards=articles.map(id=>({id,querySelector:()=>({getAttribute:()=>id})}));
 const list={children:[...cards],append(...nodes){this.children=nodes;}};
 const history={state,replaceState(value){this.state=value;}};
 vm.runInNewContext(source,{
  document:{querySelector:s=>home&&s==='.mag-home-articles #issue-articles'?list:null,querySelectorAll:()=>[]},
  sessionStorage:{getItem:k=>{if(blocked)throw Error('storage disabled');return storage.get(k)??null;},setItem(k,v){if(blocked)throw Error('storage disabled');storage.set(k,v);}},
  history,Math:Object.assign(Object.create(Math),{random})
 });
 return {order:list.children.map(c=>c.id),cards,list,storage,state:history.state};
}

test('a fresh visit shuffles every original card exactly once, retaining its link and identity',()=>{
 const a=visit(),b=visit({random:()=>0.75});
 assert.equal(a.order.length,25);assert.deepEqual([...a.order].sort(),[...ids].sort());
 assert.notDeepEqual(a.order,ids);assert.notDeepEqual(a.order,b.order);
 assert.ok(a.list.children.every(c=>a.cards.includes(c)));
});
test('reload and returning via a homepage link retain the session order',()=>{
 const a=visit();
 const b=visit({storage:a.storage,random:()=>{throw Error('must not reshuffle');}});
 const c=visit({state:a.state,random:()=>{throw Error('must not reshuffle');}});
 assert.deepEqual(b.order,a.order);assert.deepEqual(c.order,a.order);
});
test('history preserves return order when session storage is disabled and keeps other state',()=>{
 const a=visit({blocked:true,state:{readerOrigin:'kept'}});
 assert.equal(a.state.readerOrigin,'kept');
 const b=visit({blocked:true,state:a.state,random:()=>{throw Error('must not reshuffle');}});
 assert.deepEqual(b.order,a.order);
});
test('changed contents and corrupt or duplicate saved IDs cannot omit or duplicate an article',()=>{
 for(const saved of ['bad json',JSON.stringify(ids.slice(1)),JSON.stringify(ids.map(()=>ids[0])),JSON.stringify([...ids.slice(1),'/old-issue.html'])]){
  const a=visit({storage:new Map([['sishu-home-article-order-v1',saved]])});
  assert.deepEqual([...a.order].sort(),[...ids].sort());
 }
 const first=visit();const next=visit({storage:first.storage,articles:[...ids,'/shishu/new.html']});
 assert.equal(next.order.length,26);assert.equal(new Set(next.order).size,26);
 assert.ok(next.order.includes('/shishu/new.html'));
});
test('issue and other non-home pages do not reorder or write session state',()=>{
 const a=visit({home:false,random:()=>{throw Error('must not shuffle');}});
 assert.deepEqual(a.order,ids);assert.equal(a.storage.size,0);assert.equal(a.state,null);
});
