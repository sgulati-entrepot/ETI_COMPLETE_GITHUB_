import {createHash} from 'node:crypto';
import type {State} from './crm-domain';
export type Delivery={id:string;leadId:string;ownerId:string;followUpAt:string;channel:'email'|'whatsapp';to:string;cc:string[];text:string;parameters:string[];status:'sending'|'accepted'|'failed'|'unknown';at:string};
export function planDeliveries(state:State,now:Date,admins:string[],phones:Record<string,string>,timezone='Asia/Dubai'):Delivery[]{
 const format=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'});
 const day=(d:Date)=>{const p=format.formatToParts(d);return Date.UTC(Number(p.find(x=>x.type==='year')!.value),Number(p.find(x=>x.type==='month')!.value)-1,Number(p.find(x=>x.type==='day')!.value));};
 const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:timezone,hour:'2-digit',hourCycle:'h23'}).format(now));if(hour<9)return [];
 return state.leads.flatMap(lead=>{
  if(!lead.followUpAt||['Enrolled','Lost'].includes(lead.stage))return [];
  const due=new Date(lead.followUpAt);if(!Number.isFinite(due.getTime()))return [];
  const offset=(day(due)-day(now))/86400000;if(offset!==0&&offset!==1)return [];
  const staff=state.team?.find(m=>m.id===lead.ownerId&&m.role==='sales'&&m.status==='Active');if(!staff)return [];
  const when=new Intl.DateTimeFormat('en-GB',{timeZone:timezone,dateStyle:'medium',timeStyle:'short'}).format(due)+' '+timezone;
  const label=offset===1?'Tomorrow':'Today';const parameters=[label,lead.name,staff.name,when];
  const text=`ETI follow-up reminder: ${label}\nLead: ${lead.name}\nAssigned salesperson: ${staff.name}\nFollow-up: ${when}\nOpen the CRM for details.`;
  const base={leadId:lead.id,ownerId:staff.id,followUpAt:lead.followUpAt,text,parameters,status:'sending' as const,at:now.toISOString()};
  const recipients=[...new Set([staff.email.toLowerCase(),...admins])];
  const jobs=[{...base,channel:'email' as const,to:staff.email,cc:admins.filter(e=>e!==staff.email.toLowerCase())},...recipients.filter(e=>/^\+[1-9]\d{7,14}$/.test(phones[e]||'')).map(e=>({...base,channel:'whatsapp' as const,to:phones[e],cc:[]}))];
  return jobs.map(job=>({...job,id:createHash('sha256').update(JSON.stringify([lead.id,staff.id,lead.followUpAt,label,job.channel,job.to,job.cc])).digest('hex')}));
 });
}
