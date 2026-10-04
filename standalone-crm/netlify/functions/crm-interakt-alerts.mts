import type {Config} from '@netlify/functions';
import {mutate} from './_shared/crm-store';
import {claimInteraktAlert,sendInteraktAlert} from './_shared/crm-interakt-alerts';
export const config:Config={schedule:'* * * * *'};
export default async function handler(){
 const get=(name:string)=>Netlify.env.get(name)||'';
 if(get('CRM_INTERAKT_ENABLED')!=='true')return new Response('Interakt alerts disabled');
 const key=get('CRM_INTERAKT_API_KEY'),template=get('CRM_INTERAKT_TEMPLATE'),language=get('CRM_INTERAKT_LANGUAGE')||'en';
 if(!key||!template)return new Response('Interakt configuration required',{status:503});
 let processed=0;const started=Date.now();
 for(let i=0;i<8&&Date.now()-started<20000;i++){
  const job=await mutate(s=>claimInteraktAlert(s));if(!job)break;
  const result=await sendInteraktAlert(job,key,template,language);
  await mutate(s=>{const saved=s.interaktAlerts?.find(j=>j.id===job.id);if(saved)Object.assign(saved,result);});
  processed++;if(result.status!=='accepted')break;
  await new Promise(resolve=>setTimeout(resolve,1600));
 }
 return Response.json({processed});
}
