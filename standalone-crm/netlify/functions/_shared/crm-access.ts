import {configuredSuperAdmins,canEditLeadValue} from '../../../app/crm/admin-config';
import type {Lead,Task,TeamMember} from '../../../app/crm/model';
import {CRMError,normEmail,type State} from './crm-domain';
export function superAdminEmails(value:string|undefined):string[]{const emails=(value||'').split(',').map(normEmail).filter(Boolean);if(emails.length!==configuredSuperAdmins.length||new Set(emails).size!==configuredSuperAdmins.length||emails.some(e=>! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)))return [];return emails;}
export type Actor={id:string;name:string;email:string;role:'super_admin'|'sales'};
export function resolveActor(user:{id:string;email?:string;confirmedAt?:string;name?:string}|null,state:State,superEmails:string[]):Actor{
 if(!user||!user.email||!user.confirmedAt)throw new CRMError('Sign in with your verified individual account.',401);
 if(superEmails.includes(normEmail(user.email)))return {id:user.id,name:user.name||user.email,email:user.email,role:'super_admin'};
 const member=state.team?.find(m=>m.id===user.id&&normEmail(m.email)===normEmail(user.email!)&&(m.role==='sales'||m.role==='super_admin')&&m.status==='Active');
 if(!member)throw new CRMError('Your account does not have active CRM access. Contact a super admin.',403);
 return {id:member.id,name:member.name,email:member.email,role:member.role};
}
export function visibleData(state:State,actor:Actor){const leads=actor.role==='super_admin'?state.leads:state.leads.filter(l=>l.ownerId===actor.id);const ids=new Set(leads.map(l=>l.id));const tasks=actor.role==='super_admin'?state.tasks:state.tasks.filter(t=>t.ownerId===actor.id&&(!t.leadId||ids.has(t.leadId)));return {leads,tasks};}
export function enforceWrite(actor:Actor,record:Lead|Task,previous:Lead|Task|undefined,state:State){
 if(!('leadId' in record)&&record.value!==(previous&&'value' in previous?previous.value:0)&&!canEditLeadValue(actor))throw new CRMError('Only salespeople and super admins can set or change lead values.',403);
 if(actor.role==='sales'){
  if(!state.team?.some(m=>m.id===actor.id&&m.status==='Active'&&m.role==='sales'))throw new CRMError('Sales access has been disabled.',403);
  if(previous&&previous.ownerId!==actor.id)throw new CRMError('You can only edit your assigned records.',403);
  if(!('leadId' in record)){
   if((record.ownerId||undefined)!==(previous?.ownerId||undefined))throw new CRMError('Only super admins can assign or reassign leads.',403);
   record.ownerId=previous?.ownerId;record.owner=previous?.owner||'Unassigned';
  }else{
   if(record.ownerId&&record.ownerId!==actor.id)throw new CRMError('Only super admins can reassign records.',403);
   record.ownerId=actor.id;record.owner=actor.name;
  }
 }else if(record.ownerId){const member=state.team?.find(m=>m.id===record.ownerId&&m.status==='Active');if(!member&&record.ownerId!==actor.id)throw new CRMError('Choose an active staff member.');record.owner=member?.name||actor.name;}else record.owner='Unassigned';
 if('leadId'in record&&record.leadId){const lead=state.leads.find(l=>l.id===record.leadId);if(!lead)throw new CRMError('Related lead does not exist.');if(actor.role==='sales'&&lead.ownerId!==actor.id)throw new CRMError('You cannot access this lead.',403);if(record.ownerId!==lead.ownerId)throw new CRMError('Activity owner must match its related lead owner.');}
}
export function safeMember(member:TeamMember){return {id:member.id,name:member.name,email:member.email,role:member.role,status:member.status,createdAt:member.createdAt};}
