import type {State} from './crm-domain';
import {normEmail} from './crm-domain';
// Only these user-requested invitees may bootstrap a staff record after verifying an invitation.
const invitees=[{name:'Ali',email:'adanish@entrepot.ae'},{name:'cnair',email:'cnair@entrepot.ae'}];
export function registerInvitedStaff(user:{id:string;email?:string;confirmedAt?:string;invitedAt?:string}|null,state:State){
 if(!user?.email||!user.confirmedAt||!user.invitedAt)return false;
 const email=normEmail(user.email),staff=invitees.find(s=>s.email===email);if(!staff)return false;
 // Never reactivate disabled staff or rebind an existing identity by matching its email.
 if(state.team?.some(m=>m.id===user.id||normEmail(m.email)===email))return false;
 state.team=[...(state.team||[]),{...staff,id:user.id,role:'sales',status:'Active',createdAt:new Date().toISOString()}];return true;
}
