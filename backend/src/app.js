import {getApp,getApps,initializeApp} from 'firebase/app';
import {initializeAppCheck,ReCaptchaEnterpriseProvider} from 'firebase/app-check';
import {firebaseConfig,appCheckConfig} from './config.js';
let ready;
export function getMagazineApp(){
 if(ready)return ready;
 const app=getApps().length?getApp():initializeApp(firebaseConfig);
 // Enable only after registering the production site key and reviewing metrics.
 // Reading static pages does not initialize Firebase or load reCAPTCHA.
 if(appCheckConfig.enabled){
  if(!appCheckConfig.siteKey)throw new Error('App Check requires a registered site key.');
  initializeAppCheck(app,{provider:new ReCaptchaEnterpriseProvider(appCheckConfig.siteKey),isTokenAutoRefreshEnabled:true});
 }
 ready=app;return app;
}
