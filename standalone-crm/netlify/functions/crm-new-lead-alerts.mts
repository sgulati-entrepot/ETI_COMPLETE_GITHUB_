import type {Config} from '@netlify/functions';
import {mutate} from './_shared/crm-store';
import {claimNewLeadAlert} from './_shared/crm-new-lead-alerts';
export const config:Config={schedule:'* * * * *'};
export default async function handler(){
 const key=Netlify.env.get('CRM_RESEND_API_KEY'),from=Netlify.env.get('CRM_REMINDER_FROM');
 if(!key||!from)return new Response('New lead alerts require an email API key and verified sender.',{status:503});
 let processed=0;
 // Bound each run; remaining queued alerts are handled on the next run.
 for(let i=0;i<10;i++){
  const job=await mutate(s=>claimNewLeadAlert(s));if(!job)break;
  let status:'accepted'|'unknown'|'failed'='unknown';
  try{const result=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(4000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':job.id},body:JSON.stringify({...job.email,from})});status=result.ok?'accepted':result.status>=500||result.status===429?'unknown':'failed';}catch{/* Retry the frozen message with the same idempotency key. */}
  await mutate(s=>{const saved=s.newLeadAlerts?.find(j=>j.id===job.id);if(saved)saved.status=status;});processed++;
  if(status==='unknown')break;
  await new Promise(resolve=>setTimeout(resolve,600));
 }
 return Response.json({processed});
}
