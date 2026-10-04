import test from 'node:test';
import assert from 'node:assert/strict';
import {blankLead} from '../app/crm/model';
import type {State} from '../netlify/functions/_shared/crm-domain';
import {queueNewLeadAlerts,claimNewLeadAlert} from '../netlify/functions/_shared/crm-new-lead-alerts';
test('one email per new lead, assigned or unassigned, no emails for existing records',()=>{
 const s:State={leads:[{...blankLead(),id:'old'},{...blankLead(),id:'new',ownerId:'sales'},{...blankLead(),id:'corp',leadType:'corporate'}],tasks:[],events:[]};
 queueNewLeadAlerts(s,new Set(['old']));queueNewLeadAlerts(s,new Set(['old']));assert.equal(s.newLeadAlerts!.length,2);assert.deepEqual(s.newLeadAlerts![0].email.to,['sgulati@entrepot.ae','smurthy@entrepot.ae','rdsouza@entrepot.ae']);
 const now=new Date('2026-10-03T12:00:00Z');const first=claimNewLeadAlert(s,now)!;first.status='unknown';const second=claimNewLeadAlert(s,now)!;assert.notEqual(second.id,first.id);second.status='accepted';assert.equal(claimNewLeadAlert(s,now),null);assert.equal(claimNewLeadAlert(s,new Date('2026-10-03T12:06:00Z'))!.id,first.id);assert.equal(claimNewLeadAlert(s,new Date('2026-10-04T12:00:00Z')),null);
});
