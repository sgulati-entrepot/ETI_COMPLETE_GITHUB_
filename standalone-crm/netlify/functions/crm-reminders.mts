import type {Config} from '@netlify/functions';
import {reminderWhatsAppNumbers,reminderAdminEmails} from './_shared/crm-reminder-contacts';
import {planDeliveries} from './_shared/crm-reminder-delivery';
import {mutate,readState} from './_shared/crm-store';
export const config:Config={schedule:'*/5 * * * *'};
export default async function handler(){
 if(Netlify.env.get('CRM_REMINDERS_ENABLED')!=='true')return new Response('Delivery disabled');
 const get=(key:string)=>Netlify.env.get(key)||'';
 const admins=reminderAdminEmails;
 const phones:Record<string,string>={...reminderWhatsAppNumbers,...JSON.parse(get('CRM_REMINDER_WHATSAPP_NUMBERS')||'{}')};
 const timezone=get('CRM_REMINDER_TIMEZONE')||'Asia/Dubai';
 const emailReady=!!get('CRM_RESEND_API_KEY')&&!!get('CRM_REMINDER_FROM');
 const whatsappReady=!!get('CRM_WHATSAPP_ACCESS_TOKEN')&&/^\d+$/.test(get('CRM_WHATSAPP_PHONE_ID'))&&/^v\d+\.\d+$/.test(get('CRM_META_GRAPH_VERSION'))&&!!get('CRM_REMINDER_TEMPLATE')&&!!get('CRM_REMINDER_TEMPLATE_LANGUAGE');
 const started=Date.now();
 for(let i=0;i<4&&Date.now()-started<18000;i++){
  const job=await mutate(state=>{const planned=planDeliveries(state,new Date(),admins,phones,timezone);const next=planned.find(j=>(j.channel==='email'?emailReady:whatsappReady)&&!state.deliveries?.some(d=>d.id===j.id));if(!next)return null;state.deliveries=[...(state.deliveries||[]),next];return next;});
  if(!job)break;
  // Recheck access and schedule immediately before sending; fail closed on stale jobs.
  const latest=await readState();if(!planDeliveries(latest,new Date(),admins,phones,timezone).some(j=>j.id===job.id)){await mutate(s=>{const d=s.deliveries?.find(d=>d.id===job.id);if(d)d.status='failed';});continue;}
  let status:'accepted'|'failed'|'unknown'='unknown';
  try{
   const email=job.channel==='email';
   const response=await fetch(email?'https://api.resend.com/emails':`https://graph.facebook.com/${get('CRM_META_GRAPH_VERSION')}/${get('CRM_WHATSAPP_PHONE_ID')}/messages`,{
    method:'POST',signal:AbortSignal.timeout(4000),headers:{'Content-Type':'application/json',Authorization:`Bearer ${get(email?'CRM_RESEND_API_KEY':'CRM_WHATSAPP_ACCESS_TOKEN')}`,...(email?{'Idempotency-Key':job.id}:{})},
    body:JSON.stringify(email?{from:get('CRM_REMINDER_FROM'),to:[job.to],cc:job.cc,subject:`ETI follow-up — ${job.parameters[0]}: ${job.parameters[1]}`,text:job.text}:{messaging_product:'whatsapp',to:job.to.replace('+',''),type:'template',template:{name:get('CRM_REMINDER_TEMPLATE'),language:{code:get('CRM_REMINDER_TEMPLATE_LANGUAGE')},components:[{type:'body',parameters:job.parameters.map(text=>({type:'text',text}))}]}})
   });status=response.ok?'accepted':response.status>=500?'unknown':'failed';
  }catch{/* Do not blindly retry an uncertain send and risk duplicate WhatsApp messages. */}
  await mutate(state=>{const d=state.deliveries?.find(d=>d.id===job.id);if(d)d.status=status;});
  await new Promise(resolve=>setTimeout(resolve,600));
 }
 return new Response('Reminder run complete');
}
