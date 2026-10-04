import type {Config} from '@netlify/functions';
import {mutate,readState} from './_shared/crm-store';
import {planUnassignedAlert,unassignedEmail} from './_shared/crm-unassigned-alerts';
export const config:Config={schedule:'*/5 * * * *'};
export default async function handler(){
 const key=Netlify.env.get('CRM_RESEND_API_KEY'),from=Netlify.env.get('CRM_REMINDER_FROM');
 if(!key||!from)return new Response('Unassigned alerts require an email API key and verified sender.',{status:503});
 const job=await mutate(s=>{const next=planUnassignedAlert(s);if(!next)return null;next.email=next.email||unassignedEmail(s,next)||undefined;s.unassignedAlerts=[...(s.unassignedAlerts||[]).filter(j=>j.id!==next.id),next];return next;});
 if(!job)return new Response('No new unassigned leads.');
 const stillUnassigned=unassignedEmail(await readState(),job);
 const email=stillUnassigned?job.email:null;
 let status:'accepted'|'failed'|'unknown'|'cancelled'='cancelled';
 if(email){status='unknown';try{const result=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(8000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':job.id},body:JSON.stringify({...email,from})});status=result.ok?'accepted':result.status>=500||result.status===429?'unknown':'failed';}catch{/* Retry with the same provider idempotency key within its retention window. */}}
 await mutate(s=>{const record=s.unassignedAlerts?.find(j=>j.id===job.id);if(record)record.status=status;});
 return new Response(`Unassigned email alert: ${status}`,{status:status==='failed'||status==='unknown'?502:200});
}
