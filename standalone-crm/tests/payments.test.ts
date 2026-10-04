import test from 'node:test';
import assert from 'node:assert/strict';
import {saveRecord} from '../netlify/functions/_shared/crm-save';
import {seedData,type Lead} from '../app/crm/model';
import {paymentMethods} from '../app/crm/payments';
import type {State} from '../netlify/functions/_shared/crm-domain';
const actor={id:'a',name:'Sales A',email:'a@example.com',role:'sales' as const};
function fixture(){const lead={...seedData().leads[0],ownerId:'a'};const state:State={leads:[lead],tasks:[],events:[],team:[{...actor,status:'Active',createdAt:''}]};return {state,lead};}
test('payment methods persist with dates and old clients do not erase recorded payments',()=>{
 for(const paymentMethod of paymentMethods){const {state,lead}=fixture();const saved=saveRecord(state,actor,'leads',{...lead,paymentMethod,paymentDate:'2026-10-03'}) as Lead;assert.equal(saved.paymentMethod,paymentMethod);assert.equal(saved.paymentDate,'2026-10-03');const next=saveRecord(state,actor,'leads',{...saved,paymentMethod:undefined,paymentDate:undefined}) as Lead;assert.equal(next.paymentMethod,paymentMethod);}
});
test('payments reject invalid dates, unsupported methods and incomplete details; assignment protection remains',()=>{
 const {state,lead}=fixture();
 for(const payment of [{paymentMethod:'TABBY',paymentDate:'2026-02-30'},{paymentMethod:'unsupported',paymentDate:'2026-10-03'},{paymentMethod:'Cash',paymentDate:''}])assert.throws(()=>saveRecord(state,actor,'leads',{...lead,...payment}));
 state.team!.push({...actor,id:'b',status:'Active',createdAt:''});assert.throws(()=>saveRecord(state,{...actor,id:'b'},'leads',{...lead,paymentMethod:'Cash',paymentDate:'2026-10-03'}),/assigned/);
});
test('EMI schedule persists through old-client updates, sorts dates, and can be changed to full payment',()=>{
 const {state,lead}=fixture();
 const saved=saveRecord(state,actor,'leads',{...lead,paymentPlan:'EMI',emiDates:['2026-12-03','2026-11-03'],paymentMethod:'TABBY',paymentDate:'2026-10-03'}) as Lead;
 assert.deepEqual(saved.emiDates,['2026-11-03','2026-12-03']);
 const next=saveRecord(state,actor,'leads',{...saved,paymentPlan:undefined,emiDates:undefined}) as Lead;
 assert.equal(next.paymentPlan,'EMI');assert.deepEqual(next.emiDates,saved.emiDates);
 const full=saveRecord(state,actor,'leads',{...next,paymentPlan:'Full',emiDates:[]}) as Lead;
 assert.equal(full.paymentPlan,'Full');assert.deepEqual(full.emiDates,[]);
});
test('EMI dates must be valid and distinct; only EMI can carry a schedule',()=>{
 const {state,lead}=fixture();
 for(const fields of [{paymentPlan:'EMI',emiDates:[]},{paymentPlan:'EMI',emiDates:['2026-02-30']},{paymentPlan:'EMI',emiDates:['2026-11-03','2026-11-03']},{paymentPlan:'Full',emiDates:['2026-11-03']}])assert.throws(()=>saveRecord(state,actor,'leads',{...lead,...fields}));
});
test('sales and all super admins can record part payments and total received',()=>{
 for(const editor of [actor,{...actor,id:'admin',role:'super_admin' as const,email:'fly@entrepot.ae'}]){
 const {state,lead}=fixture();const saved=saveRecord(state,editor,'leads',{...lead,paymentPlan:'Part',amountPaid:1250.50,paymentMethod:'Cash',paymentDate:'2026-10-03'}) as Lead;
 assert.equal(saved.amountPaid,1250.50);assert.equal(saved.paymentPlan,'Part');
 const preserved=saveRecord(state,editor,'leads',{...saved,amountPaid:undefined}) as Lead;assert.equal(preserved.amountPaid,1250.50);
 const updated=saveRecord(state,editor,'leads',{...preserved,amountPaid:1500}) as Lead;assert.equal(updated.amountPaid,1500);
 }
});
test('payment amounts reject negative, nonfinite, excessive precision, and missing receipt details',()=>{
 const {state,lead}=fixture();for(const amountPaid of [-1,NaN,Infinity,1.234,100000001])assert.throws(()=>saveRecord(state,actor,'leads',{...lead,amountPaid}));
 assert.throws(()=>saveRecord(state,actor,'leads',{...lead,paymentPlan:'Part',amountPaid:0}));
 assert.throws(()=>saveRecord(state,actor,'leads',{...lead,amountPaid:100}));
});

test('next payment date persists and is preserved on unrelated edits',()=>{
 const {state,lead}=fixture();const saved=saveRecord(state,actor,'leads',{...lead,paymentPlan:'Part',amountPaid:500,paymentMethod:'Cash',paymentDate:'2026-10-03',nextPaymentDate:'2026-11-03'}) as Lead;
 assert.equal(saved.nextPaymentDate,'2026-11-03');
 const edited=saveRecord(state,actor,'leads',{...saved,nextPaymentDate:undefined}) as Lead;assert.equal(edited.nextPaymentDate,'2026-11-03');
 assert.throws(()=>saveRecord(state,actor,'leads',{...edited,nextPaymentDate:'2026-02-30'}));
 const cleared=saveRecord(state,actor,'leads',{...edited,nextPaymentDate:''}) as Lead;assert.equal(cleared.nextPaymentDate,'');
});
import {paymentBalance} from '../app/crm/payments';
test('balance derives from total value and paid amount with cent precision',()=>{
 assert.equal(paymentBalance(3000,500),2500);assert.equal(paymentBalance(3000,3000),0);assert.equal(paymentBalance(3000,3100),-100);assert.equal(paymentBalance(0.3,0.1),0.2);assert.equal(paymentBalance(3000,null),null);
});
import {equalEmiSchedule} from '../app/crm/payments';
test('EMIs divide the outstanding balance equally and show dated running balances',()=>{
 assert.deepEqual(equalEmiSchedule(4000,1000,['2026-12-03','2026-10-03','2026-11-03']),[{date:'2026-10-03',amount:1000,balanceAfter:2000},{date:'2026-11-03',amount:1000,balanceAfter:1000},{date:'2026-12-03',amount:1000,balanceAfter:0}]);
 const dates=['2026-10-03','2026-11-03','2026-12-03'];
 assert.deepEqual(equalEmiSchedule(100,0,dates).map(r=>r.amount),[33.33,33.33,33.34]);
 assert.deepEqual(equalEmiSchedule(0.01,0,dates).map(r=>r.amount),[0,0,0.01]);
 assert.equal(equalEmiSchedule(100,110,dates)[0].amount,0);
 assert.deepEqual(equalEmiSchedule(100,null,dates),[]);
 assert.deepEqual(equalEmiSchedule(100,0,['']),[]);
 assert.deepEqual(equalEmiSchedule(100,0,[dates[0],dates[0]]),[]);
});
