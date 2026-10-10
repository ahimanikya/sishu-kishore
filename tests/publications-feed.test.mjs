import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fetchPublished} from '../scripts/lib/publications-feed.mjs';
test('public feed pages over 100 records with a published-only query',async()=>{
 const calls=[];
 const records=await fetchPublished({projectId:'demo',fetchImpl:async(url,options)=>{
  const q=JSON.parse(options.body).structuredQuery;calls.push(q);
  assert.equal(q.limit,100);assert.equal(q.where.fieldFilter.value.stringValue,'published');
  const n=calls.length===1?100:3,offset=calls.length===1?0:100;
  return {ok:true,json:async()=>Array.from({length:n},(_,i)=>({document:{name:`projects/demo/databases/(default)/documents/publications/id${offset+i}`,fields:{state:{stringValue:'published'},body:{stringValue:'approved'}}}}))};
 }});
 assert.equal(records.length,103);assert.equal(calls.length,2);
 assert.equal(calls[1].startAt.values[0].referenceValue,'projects/demo/databases/(default)/documents/publications/id99');assert.equal(calls[1].startAt.before,false);
});
test('feed failure aborts instead of returning partial records',async()=>{
 await assert.rejects(fetchPublished({projectId:'demo',fetchImpl:async()=>({ok:false,status:403})}),/preserving existing output/);
});
