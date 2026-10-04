import type {Lead} from './model';
import {uaeDate} from './lead-received';
export const enrolmentDay=(lead:Lead)=>lead.enrolmentDate||(lead.enrolledAt?uaeDate(lead.enrolledAt):'');
export function inDateRange(value:string|undefined,from:string,through:string){
 if(!from&&!through)return true;
 if(!value)return false;
 return (!from||value>=from)&&(!through||value<=through);
}
