import type {State} from './crm-domain';
export type InteraktAlert={id:string;leadId:string;status:'queued'|'sending'|'accepted'|'failed'|'unknown'|'cancelled';at:string;attemptedAt?:string;messageId?:string;httpStatus?:number};
// Only newly created Meta records qualify; updates and archived restores are excluded.
export function queueInteraktAlerts(state:State,existing:Set<string>,now=new Date()){
 state.interaktAlerts ||= [];
 for(const lead of state.leads){
  const id=`meta-whatsapp-${lead.id}`;
  if(lead.source!=='Meta Ads'||existing.has(lead.id)||state.interaktAlerts.some(j=>j.id===id))continue;
  state.interaktAlerts.push({id,leadId:lead.id,status:'queued',at:now.toISOString()});
 }
}
export function claimInteraktAlert(state:State,now=new Date()){
 for(const job of state.interaktAlerts||[]){
  // The provider does not document idempotent sending. Never blindly resend uncertain requests.
  if(job.status==='sending'&&job.attemptedAt&&now.getTime()-Date.parse(job.attemptedAt)>60000)job.status='unknown';
  if(job.status!=='queued')continue;
  if(!state.leads.some(l=>l.id===job.leadId)||now.getTime()-Date.parse(job.at)>86400000){job.status='cancelled';continue;}
  job.status='sending';job.attemptedAt=now.toISOString();return job;
 }
 return null;
}
export function interaktPayload(id:string,template:string,language:string){
 return {countryCode:'+971',phoneNumber:'544177480',callbackData:id,type:'Template',template:{name:template,languageCode:language,bodyValues:[]}};
}
export async function sendInteraktAlert(job:InteraktAlert,key:string,template:string,language:string,send:typeof fetch=fetch):Promise<Pick<InteraktAlert,'status'|'messageId'|'httpStatus'>>{
 try{
  const response=await send('https://api.interakt.ai/v1/public/message/',{method:'POST',signal:AbortSignal.timeout(4000),headers:{Authorization:`Basic ${key}`,'Content-Type':'application/json'},body:JSON.stringify(interaktPayload(job.id,template,language))});
  if(!response.ok)return {status:response.status>=500||response.status===429?'unknown':'failed',httpStatus:response.status};
  const result=await response.json();
  return result.result===true&&typeof result.id==='string'?{status:'accepted',messageId:result.id,httpStatus:response.status}:{status:'unknown',httpStatus:response.status};
 }catch{return {status:'unknown'};}
}
