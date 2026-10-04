import type {Lead} from './model';
export const isUnassigned=(lead:Lead)=>!lead.ownerId&&(!lead.owner||lead.owner==='Unassigned');
export function unassignedCounts(leads:Lead[]){const queue=leads.filter(isUnassigned);const corporate=queue.filter(l=>l.leadType==='corporate').length;return {total:queue.length,individual:queue.length-corporate,corporate};}
