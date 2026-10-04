import type {State} from './crm-domain';
import {unassignedRecipients,type AlertEmail} from './crm-unassigned-alerts';
export type NewLeadAlert={id:string;email:AlertEmail;status:'queued'|'sending'|'accepted'|'unknown'|'failed';attempts:number;firstAttempt?:string;attemptedAt?:string};
export function queueNewLeadAlerts(state:State,existing:Set<string>){
 state.newLeadAlerts ||= [];
 for(const lead of state.leads){
  const id=`new-lead-${lead.id}`;
  if(existing.has(lead.id)||state.newLeadAlerts.some(j=>j.id===id))continue;
  state.newLeadAlerts.push({id,status:'queued',attempts:0,email:{to:[...unassignedRecipients],subject:`ETI CRM: New ${lead.leadType==='corporate'?'corporate':'individual'} lead`,text:`A new ${lead.leadType==='corporate'?'corporate':'individual'} lead has arrived in ETI CRM.\n\nSign in at https://crm.etiworld.ae/ to view the lead and take action.`}});
 }
}
export function claimNewLeadAlert(state:State,now=new Date()){
 for(const job of state.newLeadAlerts||[]){
  if(['accepted','failed'].includes(job.status))continue;
  if(job.firstAttempt&&(now.getTime()-Date.parse(job.firstAttempt)>=23*3600000||job.attempts>=5)){job.status='failed';continue;}
  if(job.attemptedAt&&now.getTime()-Date.parse(job.attemptedAt)<5*60000)continue;
  job.status='sending';job.attempts++;job.firstAttempt ||= now.toISOString();job.attemptedAt=now.toISOString();return job;
 }
 return null;
}
