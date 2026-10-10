import {serverTimestamp} from 'firebase/firestore';
export function nextQuota(previous,fields){
 const started=previous?.startedAt?.toMillis?.();
 const reset=!started||Date.now()-started>=3600000;
 return {...fields,at:serverTimestamp(),startedAt:reset?serverTimestamp():previous.startedAt,count:reset?1:previous.count+1};
}
