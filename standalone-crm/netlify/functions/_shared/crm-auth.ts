import {configuredSuperAdmins} from '../../../app/crm/admin-config';
import type {} from '@netlify/functions';
import {requestUser} from './crm-session';
import {readState,mutate} from './crm-store';
import {resolveActor,superAdminEmails} from './crm-access';
import {CRMError} from './crm-domain';
import {registerInvitedStaff} from './crm-invited-staff';
export async function access(req:Request){const user=await requestUser(req,Netlify.env.get('URL')||'https://crm.etiworld.ae');let state=await readState();const emails=superAdminEmails(Netlify.env.get('CRM_SUPER_ADMIN_EMAILS')??configuredSuperAdmins.map(a=>a.email).join(','));if(user?.invitedAt&&user.confirmedAt&&!state.team?.some(m=>m.id===user.id)){await mutate(s=>registerInvitedStaff(user,s));state=await readState();}const actor=resolveActor(user,state,emails);if(actor.role==='super_admin'&&!state.team?.some(m=>m.id===actor.id)){await mutate(s=>{s.team=[...(s.team||[]).filter(m=>m.id!==actor.id),{...actor,status:'Active',createdAt:new Date().toISOString()}];});state=await readState();}return {actor,state,emails};}
export function sameOrigin(req:Request){if(req.headers.get('origin')!==new URL(req.url).origin)throw new CRMError('Invalid request origin.',403);}
