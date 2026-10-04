import test from 'node:test';
import assert from 'node:assert/strict';
import {canCreateSuperAdmin} from '../app/crm/admin-config';
import {resolveActor} from '../netlify/functions/_shared/crm-access';
import {reconcileDirectory} from '../netlify/functions/_shared/crm-directory';
import type {State} from '../netlify/functions/_shared/crm-domain';
import type {User} from '@netlify/identity';

test('only Sajeev with super admin access can create admins',()=>{
 assert.equal(canCreateSuperAdmin({email:'sgulati@entrepot.ae',role:'super_admin'}),true);
 for(const actor of [null,{email:'sgulati@entrepot.ae',role:'sales'},{email:'smurthy@entrepot.ae',role:'super_admin'},{email:'sgulati@entrepot.in',role:'super_admin'}])assert.equal(canCreateSuperAdmin(actor),false);
});
test('a CRM-created admin can sign in, but unregistered and disabled accounts cannot',()=>{
 const member={id:'new-admin',email:'new@example.com',name:'New admin',role:'super_admin' as const,status:'Active' as const,createdAt:new Date().toISOString()};
 const state:State={leads:[],tasks:[],events:[],team:[member]};
 const user={id:member.id,email:member.email,confirmedAt:new Date().toISOString()};
 assert.equal(resolveActor(user,state,[]).role,'super_admin');
 assert.throws(()=>resolveActor({...user,id:'another-id'},state,[]));
 assert.throws(()=>resolveActor({...user,email:'other@example.com'},state,[]));
 assert.throws(()=>resolveActor({...user,confirmedAt:undefined},state,[]));
 member.status='Disabled' as typeof member.status;
 assert.throws(()=>resolveActor(user,state,[]));
});
test('directory recovers managed admin registrations without elevating sales or unmanaged users',()=>{
 const state:State={leads:[],tasks:[],events:[]};
 const users=[{id:'admin',email:'admin@example.com',roles:['crm_super_admin'],appMetadata:{crm_managed:true}}, {id:'sales',email:'staff@example.com',roles:['crm_sales'],appMetadata:{crm_managed:true}}, {id:'unmanaged',email:'unmanaged@example.com',roles:['crm_super_admin'],appMetadata:{}}].map(u=>({...u,confirmedAt:new Date().toISOString()} as User));
 assert.equal(reconcileDirectory(state,users),2);
 assert.equal(state.team?.find(m=>m.id==='admin')?.role,'super_admin');
 assert.equal(state.team?.find(m=>m.id==='sales')?.role,'sales');
 assert.equal(state.team?.find(m=>m.id==='unmanaged'),undefined);
 assert.equal(reconcileDirectory(state,users),0);
});
