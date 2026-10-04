import {createHash} from 'node:crypto';
import {isUnassigned,unassignedCounts} from '../../../app/crm/unassigned';
import type {State} from './crm-domain';
export const unassignedRecipients=['sgulati@entrepot.ae','smurthy@entrepot.ae','rdsouza@entrepot.ae'];
export type AlertEmail={to:string[];subject:string;text:string};
export type UnassignedAlert={email?:AlertEmail;id:string;leadIds:string[];status:'sending'|'accepted'|'failed'|'unknown'|'cancelled';createdAt:string;attemptedAt:string;attempts:number};
export function planUnassignedAlert(state:State,now=new Date()):UnassignedAlert|null{
 const records=state.unassignedAlerts||[];
 const pending=records.find(j=>j.status==='sending'||j.status==='unknown');
 if(pending){const age=now.getTime()-Date.parse(pending.createdAt),since=now.getTime()-Date.parse(pending.attemptedAt);if(age>=23*3600000||pending.attempts>=3){pending.status='failed';return planUnassignedAlert(state,now);}if(since<5*60000)return null;return {...pending,status:'sending',attemptedAt:now.toISOString(),attempts:pending.attempts+1};}
 const seen=new Set(records.flatMap(j=>j.leadIds));const ids=state.leads.filter(l=>isUnassigned(l)&&!seen.has(l.id)).map(l=>l.id).sort();
 if(!ids.length)return null;
 return {id:'unassigned-'+createHash('sha256').update(JSON.stringify(ids)).digest('hex'),leadIds:ids,status:'sending',createdAt:now.toISOString(),attemptedAt:now.toISOString(),attempts:1};
}
export function unassignedEmail(state:State,job:UnassignedAlert){
 const outstanding=unassignedCounts(state.leads);const ids=new Set(job.leadIds);const added=unassignedCounts(state.leads.filter(l=>ids.has(l.id)));
 if(!added.total)return null;
 return {to:unassignedRecipients,subject:`ETI CRM: ${added.total} leads need assignment`,text:`${added.total} newly detected unassigned leads need attention.\nIndividual: ${added.individual}\nCorporate: ${added.corporate}\n\nTotal currently unassigned: ${outstanding.total}\nIndividual: ${outstanding.individual}\nCorporate: ${outstanding.corporate}\n\nOpen https://crm.etiworld.ae/ and select Lead assignment to assign these enquiries.\n\nThis alert groups new unassigned leads. Previously notified leads are not sent again.`};
}
