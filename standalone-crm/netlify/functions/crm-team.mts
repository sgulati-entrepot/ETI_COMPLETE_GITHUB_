import {canCreateSuperAdmin} from '../../app/crm/admin-config';
import type {} from '@netlify/functions';
import {admin,AuthError,type User} from '@netlify/identity';
import {access,sameOrigin} from './_shared/crm-auth';
import {mutate,fail} from './_shared/crm-store';
import {CRMError,text,normEmail} from './_shared/crm-domain';
import {audit} from './_shared/crm-audit';
import {reconcileDirectory} from './_shared/crm-directory';
import {readState} from './_shared/crm-store';
import type {TeamMember} from '../../app/crm/model';
export default async function handler(req:Request){try{
 const {actor,state,emails}=await access(req);if(actor.role!=='super_admin')throw new CRMError('Only super admins can manage sales staff.',403);
 if(req.method==='GET'){
  const users:User[]=[];for(let page=1;page<=100;page++){const batch=await admin.listUsers({page,perPage:100});users.push(...batch);if(batch.length<100)break;}
  const registrations=reconcileDirectory(structuredClone(state),users);if(registrations)await mutate(s=>reconcileDirectory(s,users));
  const latest=await readState();return Response.json({members:latest.team||[],superAdminSeats:emails},{headers:{'Cache-Control':'no-store'}});
 }
 sameOrigin(req);if(!['POST','PATCH'].includes(req.method))return new Response('Method not allowed',{status:405});
 const raw=await req.text();if(raw.length>10000)throw new CRMError('Request too large.',413);let body;try{body=JSON.parse(raw);}catch{throw new CRMError('Invalid request.');}
 if(req.method==='PATCH'){
  if(!['Active','Disabled'].includes(body.status))throw new CRMError('Invalid staff status.');
  const member=await mutate(s=>{const target=s.team?.find(m=>m.id===body.id);if(!target)throw new CRMError('Staff member not found.',404);if(target.role==='super_admin'||emails.includes(normEmail(target.email)))throw new CRMError('The super admin accounts cannot be disabled here.',403);target.status=body.status;audit(s,actor,'staff.status',target.id,`Staff access ${body.status.toLowerCase()}`);return target;});return Response.json(member,{headers:{'Cache-Control':'no-store'}});
 }
 const name=text(body.name),email=normEmail(text(body.email)),password=typeof body.password==='string'?body.password:'';
 if(!name||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<12||password.length>128)throw new CRMError('Name, valid email and a password of 12–128 characters are required.');
 const role=body.role==='super_admin'?'super_admin':body.role==='sales'?'sales':null;if(!role)throw new CRMError('Invalid role.');
 if(role==='super_admin'&&!canCreateSuperAdmin(actor))throw new CRMError('Only Sajeev can create super admin accounts.',403);if(role==='sales'&&emails.includes(email))throw new CRMError('This email is reserved for a super admin.');
 if(state.team?.some(m=>normEmail(m.email)===email))throw new CRMError('This account already exists.',409);
 // The initial password is sent only to Identity, never persisted in CRM data or returned.
 const created=await admin.createUser({email,password,data:{user_metadata:{full_name:name},app_metadata:{roles:[role==='super_admin'?'crm_super_admin':'crm_sales'],crm_managed:true}}});
 const member:TeamMember={id:created.id,name,email,role,status:'Active',createdAt:new Date().toISOString()};
 try{await mutate(s=>{s.team=[...(s.team||[]).filter(m=>m.id!==member.id),member];audit(s,actor,'staff.created',member.id,'Individual staff account created');return member;});}catch{throw new CRMError('Login created, but CRM registration failed. Contact your site administrator to reconcile this Identity account before retrying.',503);}
 return Response.json(member,{status:201,headers:{'Cache-Control':'no-store'}});
 }catch(error){if(error instanceof AuthError)return new Response(error.status===422?'An Identity account already exists or its details are invalid. Refresh the team directory before retrying.':'Account service unavailable. Please retry.',{status:error.status===422?409:503});return fail(error);}}
