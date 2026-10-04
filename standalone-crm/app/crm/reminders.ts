import type {Lead} from './model';
export type FollowUpReminder={id:string;lead:Lead;label:'Tomorrow'|'Today'|'Overdue'};
// Calendar days use the same local timezone as the follow-up editor.
export function followUpReminders(leads:Lead[],now:Date,ownerId?:string):FollowUpReminder[]{
 const day=(d:Date)=>Date.UTC(d.getFullYear(),d.getMonth(),d.getDate());
 return leads.filter(l=>l.followUpAt&&(!ownerId||l.ownerId===ownerId)&&!['Enrolled','Lost'].includes(l.stage)).flatMap(lead=>{
  const due=new Date(lead.followUpAt!);if(!Number.isFinite(due.getTime()))return [];
  const offset=(day(due)-day(now))/86400000;
  if(offset>1)return [];
  const label=offset===1?'Tomorrow':offset===0?'Today':'Overdue';
  return [{id:`${lead.id}:${lead.followUpAt}:${label}`,lead,label} as FollowUpReminder];
 }).sort((a,b)=>a.lead.followUpAt!.localeCompare(b.lead.followUpAt!));
}
