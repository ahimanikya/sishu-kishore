// Administrative upload of editorial snapshots. No credentials are printed or stored.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url),{getGlobalDefaultAccount}=require('firebase-tools/lib/auth'),{requireAuth}=require('firebase-tools/lib/requireAuth'),{Client}=require('firebase-tools/lib/apiv2');
const account=getGlobalDefaultAccount();if(!account)throw Error('Firebase CLI sign-in required');
await requireAuth({...account,project:'sishu-kishore',nonInteractive:true});
const client=new Client({urlPrefix:'https://firestore.googleapis.com',apiVersion:'v1'});
for(const book of ['ketejami_loda','musha_mushi','forest']){
 const payload=fs.readFileSync(new URL(`../../editorial-private/book-review/${book}.json`,import.meta.url),'utf8');
 if(Buffer.byteLength(payload)>900000)throw Error('Review exceeds document limit');
 const digest=createHash('sha256').update(payload).digest('hex');
 await client.patch(`/projects/sishu-kishore/databases/(default)/documents/bookReviews/${book}`,{fields:{payload:{stringValue:payload},sourceSha256:{stringValue:digest}}});
 console.log(`Protected review uploaded: ${book}`);
}
