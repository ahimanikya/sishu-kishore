// Public feed: only approved records, bounded requests, stable cursor pagination.
export async function fetchPublished({projectId,endpoint='https://firestore.googleapis.com',fetchImpl=fetch}){
 const parent=`projects/${projectId}/databases/(default)/documents`,records=[];
 let after;
 for(;;){
  const structuredQuery={from:[{collectionId:'publications'}],where:{fieldFilter:{field:{fieldPath:'state'},op:'EQUAL',value:{stringValue:'published'}}},orderBy:[{field:{fieldPath:'__name__'},direction:'ASCENDING'}],limit:100};
  if(after)structuredQuery.startAt={values:[{referenceValue:after}],before:false};
  const response=await fetchImpl(`${endpoint}/v1/${parent}:runQuery`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({structuredQuery}),signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error(`Publication fetch failed (${response.status}); preserving existing output.`);
  const rows=await response.json();if(!Array.isArray(rows))throw Error('Invalid publication response');
  const documents=rows.filter(r=>r.document).map(r=>r.document);
  for(const d of documents)records.push({id:d.name.split('/').pop(),...Object.fromEntries(Object.entries(d.fields||{}).map(([k,v])=>[k,v.stringValue??v.timestampValue??'']))});
  if(documents.length<100)return records;
  const next=documents.at(-1).name;if(next===after)throw Error('Publication cursor did not advance');after=next;
 }
}
