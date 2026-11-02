// Create-only administrative import into editor-only Studio storage. Dry-run by default.
// Never writes the publications feed, catalog, public assets, or an existing draft.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateWorkspace} from '../../public/editorial/studio-model.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const args=process.argv.slice(2),file=args.shift(),options={};
for(let i=0;i<args.length;i++){
 if(args[i]==='--write')options.write=true;
 else if(['--id','--uid'].includes(args[i])&&args[i+1])options[args[i].slice(2)]=args[++i];
 else throw Error('Use: seed-studio-draft.mjs editorial-private/file.json --id workspace-id [--uid verified-editor-uid --write]');
}
if(!file||!options.id||!/^[a-zA-Z0-9_-]{1,80}$/.test(options.id))throw Error('Provide a private payload and valid workspace ID.');
const filename=fs.realpathSync(path.resolve(root,file)),privateRoot=fs.realpathSync(path.join(root,'editorial-private'))+path.sep;
if(!filename.startsWith(privateRoot))throw Error('The seed payload must remain inside editorial-private.');
const payload=validateWorkspace(JSON.parse(fs.readFileSync(filename,'utf8')));
if(payload.state!=='draft'||!payload.title.trim())throw Error('Only a titled draft may be seeded.');
if(payload.cover.reviewed||payload.editorial.reviewed||payload.entries.some(e=>Object.values(e.checks).some(Boolean)))throw Error('Imported drafts must start with editorial checks unapproved.');
const encoded=JSON.stringify(payload),sha256=createHash('sha256').update(encoded).digest('hex');
console.log(JSON.stringify({mode:options.write?'create-only':'dry-run',project:'sishu-kishore',workspace:options.id,kind:payload.kind,month:payload.month,entries:payload.entries.length,state:payload.state,payloadSha256:sha256}));
if(!options.write)process.exit(0);
if(!options.uid||options.uid.length>128)throw Error('A verified editor UID is required for the import credit.');
const require=createRequire(import.meta.url),{getGlobalDefaultAccount}=require('firebase-tools/lib/auth'),{requireAuth}=require('firebase-tools/lib/requireAuth'),{Client}=require('firebase-tools/lib/apiv2');
const account=getGlobalDefaultAccount();if(!account)throw Error('Firebase CLI administrator sign-in required.');
await requireAuth({...account,project:'sishu-kishore',nonInteractive:true});
const identity=new Client({urlPrefix:'https://identitytoolkit.googleapis.com',apiVersion:'v1'});
const found=await identity.post('/projects/sishu-kishore/accounts:lookup',{localId:[options.uid]});
const editor=found.body.users?.find(u=>u.localId===options.uid);
if(!editor||editor.disabled||editor.emailVerified!==true||JSON.parse(editor.customAttributes||'{}').editor!==true)throw Error('The import credit must identify an active verified editor.');
const client=new Client({urlPrefix:'https://firestore.googleapis.com',apiVersion:'v1'}),base='projects/sishu-kishore/databases/(default)/documents',name=`${base}/editorStudios/${options.id}`;
let existing;
try{existing=(await client.get('/'+name)).body;}catch(e){if(e.status!==404&&e.context?.response?.statusCode!==404)throw e;}
if(existing){
 if(existing.fields?.payload?.stringValue===encoded){
  const f=existing.fields,revision=Number(f.revision?.integerValue);
  if(!Number.isSafeInteger(revision)||revision<1||f.kind?.stringValue!==payload.kind||f.title?.stringValue!==payload.title||f.state?.stringValue!=='draft')throw Error('Existing draft envelope is inconsistent; no writes performed.');
  const history=(await client.get('/'+name+'/history/'+revision)).body.fields;
  if(history.payload?.stringValue!==encoded||history.revision?.integerValue!==String(revision))throw Error('Existing draft history is inconsistent; no writes performed.');
  console.log('Existing identical Studio draft and history verified; no writes performed.');process.exit(0);
 }
 throw Error('This workspace already exists. It was not changed. Open it in Studio to review differences.');
}
const fields={format:{stringValue:'sishu-studio-record-v1'},revision:{integerValue:'1'},kind:{stringValue:payload.kind},title:{stringValue:payload.title},state:{stringValue:'draft'},payload:{stringValue:encoded},updatedBy:{stringValue:options.uid}};
const write=document=>({update:{name:document,fields},updateTransforms:[{fieldPath:'updatedAt',setToServerValue:'REQUEST_TIME'}],currentDocument:{exists:false}});
await client.post('/projects/sishu-kishore/databases/(default)/documents:commit',{writes:[write(name),write(name+'/history/1')]});
for(const document of [name,name+'/history/1']){
 const saved=(await client.get('/'+document)).body.fields;
 if(saved.payload?.stringValue!==encoded||saved.revision?.integerValue!=='1'||saved.state?.stringValue!=='draft'||!saved.updatedAt?.timestampValue)throw Error('Read-back verification failed. Inspect the workspace before retrying.');
}
console.log('Private Studio draft and immutable first revision created and verified. Nothing was published.');
