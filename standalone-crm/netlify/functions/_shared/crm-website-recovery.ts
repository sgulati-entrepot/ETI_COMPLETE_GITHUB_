import {applyIncoming,type State} from './crm-domain';
import {publicWebsiteIncoming} from './crm-public-website';
// Only active legacy records with multiple captured enquiries are considered.
// Retain original histories and assignments; stable recovery events make this repeatable.
export function recoverWebsiteEnquiries(state:State){
 let recovered=0;
 for(const lead of [...state.leads]){
  const submissions=[...(lead.submissions||[])].filter(s=>s.eventId.startsWith('website-formsubmit:')&&!s.eventId.endsWith(':recovered')).reverse();
  for(const submission of submissions.slice(1)){
   const eventId=`${submission.eventId}:recovered`;
   if(state.events.includes(eventId))continue;
   const incoming=publicWebsiteIncoming({form_data:submission.fields});if(!incoming)continue;
   const result=applyIncoming(state,{...incoming,eventId});
   if(result.id){const created=state.leads.find(l=>l.id===result.id)!;created.createdAt=submission.receivedAt;created.submissions![0].receivedAt=submission.receivedAt;recovered++;}
  }
 }
 return {recovered};
}
