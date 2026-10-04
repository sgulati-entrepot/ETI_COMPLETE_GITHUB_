import {configuredSuperAdmins} from '../../../app/crm/admin-config';
import {configuredSalesStaff} from '../../../app/crm/staff-config';
import {normEmail,type State} from './crm-domain';
import type {User} from '@netlify/identity';
// Reconcile only the explicitly invited accounts or accounts created by this CRM.
// Preserve disabled status and never bind another Identity ID to an existing email.
export function reconcileDirectory(state:State,users:User[]){
 let count=0;
 for(const user of users){
  if(!user.email||(!user.invitedAt&&!user.confirmedAt))continue;
  const email=normEmail(user.email);
  const root=configuredSuperAdmins.find(m=>m.email===email),sales=configuredSalesStaff.find(m=>m.email===email);
  const managed=user.appMetadata?.crm_managed===true&&(user.roles?.includes('crm_sales')||user.roles?.includes('crm_super_admin'));
  if(!root&&!sales&&!managed)continue;
  // Approved email change on the same Identity ID preserves lead ownership/history.
  const previous=state.team?.find(m=>m.id===user.id);
  if(root&&email==='rdsouza@entrepot.ae'&&previous?.email.toLowerCase()==='reena@entrepot.ae'){
   previous.email=email;previous.name=root.name;count++;continue;
  }
  if(state.team?.some(m=>m.id===user.id||normEmail(m.email)===email))continue;
  state.team=[...(state.team||[]),{id:user.id,email,name:root?.name||sales?.name||user.name||email,role:root||(managed&&user.roles?.includes('crm_super_admin'))?'super_admin':'sales',status:'Active',createdAt:new Date().toISOString()}];count++;
 }
 return count;
}
