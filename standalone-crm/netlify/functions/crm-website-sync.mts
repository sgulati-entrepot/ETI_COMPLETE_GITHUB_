import type {Config} from '@netlify/functions';
import {mutate,readState} from './_shared/crm-store';
import {importFormSubmitRow,formSubmitIncoming} from './_shared/crm-formsubmit';
export const config:Config={schedule:'*/5 * * * *'};
export default async function handler(){
 if(['webhook','direct'].includes(Netlify.env.get('CRM_WEBSITE_MODE')||''))return new Response('Website webhook mode');
 const key=Netlify.env.get('CRM_FORMSUBMIT_API_KEY');
 if(!key)return new Response('Website sync requires configuration');
 const started=new Date().toISOString();
 await mutate(s=>{s.websiteSync={...s.websiteSync,since:s.websiteSync?.since||started,lastAttempt:started,status:'Checking provider'};});
 try{
  const response=await fetch(`https://formsubmit.co/api/get-submissions/${encodeURIComponent(key)}`,{headers:{Accept:'application/json','User-Agent':'ETI-CRM/1.0'},signal:AbortSignal.timeout(15000),redirect:'error'});
  if(!response.ok)throw Error(`Provider HTTP ${response.status}`);
  const raw=await response.text();if(raw.length>5000000)throw Error('Provider response too large');
  const body=JSON.parse(raw);
  if((body.success!==true&&body.success!=='true')||!Array.isArray(body.submissions))throw Error('Provider rejected request');
  const state=await readState(),since=state.websiteSync!.since;let errors=0,received=0;
  // Process oldest first; retries are safe and deleted leads are not resurrected.
  const pending:unknown[]=[];
  for(const row of body.submissions){try{const incoming=formSubmitIncoming(row,since);if(incoming&&!state.events.includes(incoming.eventId))pending.push(row);}catch{errors++;}}
  for(const row of pending.reverse().slice(0,100)){try{const result=await mutate(s=>importFormSubmitRow(s,row,since));if('duplicate' in result&&!result.duplicate)received++;}catch{errors++;}}
  await mutate(s=>{s.websiteSync={...s.websiteSync!,lastSuccess:errors?s.websiteSync?.lastSuccess:started,received:(s.websiteSync?.received||0)+received,errors,status:errors?'Some submissions need review':pending.length>100?'Importing backlog':'Up to date'};});
  return Response.json({received,errors});
 }catch(error){
  const reason=error instanceof Error&&/^(Provider HTTP [0-9]{3}|Provider rejected request|Provider response too large)$/.test(error.message)?error.message:'Provider connection or response error';
  await mutate(s=>{s.websiteSync={...s.websiteSync!,status:`${reason} — check API key and provider availability`};});
  // Never log the key-bearing provider URL or submission contents.
  return new Response('Website sync could not reach the provider',{status:503});
 }
}
