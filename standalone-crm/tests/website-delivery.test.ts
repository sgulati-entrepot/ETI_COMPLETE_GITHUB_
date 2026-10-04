import test from 'node:test';
import assert from 'node:assert/strict';
import {submitLead} from '../../app/lib/submitLead';
test('website preserves accepted email when CRM fails, retries same ID and never copies rejected emails',async()=>{
 const originalFetch=globalThis.fetch;
 Object.defineProperty(globalThis,'window',{configurable:true,value:{location:{hostname:'etiworld.ae',origin:'https://etiworld.ae',pathname:'/contact'}}});
 const form=new FormData();form.set('Name','Test');form.set('Email','test@example.com');
 const calls:{url:string;body:any}[]=[];
 try{
  globalThis.fetch=async(input,init)=>{calls.push({url:String(input),body:JSON.parse(String(init?.body))});if(String(input).includes('formsubmit.co'))return Response.json({success:true});throw Error('CRM unavailable');};
  await submitLead(form);assert.equal(calls.length,3);assert.equal(calls[0].url,'https://formsubmit.co/ajax/courses@entrepot.ae');assert.equal(calls[0].body._webhook,undefined);assert.equal(calls[1].body.form_data['CRM Submission ID'],calls[2].body.form_data['CRM Submission ID']);
  calls.length=0;globalThis.fetch=async(input)=>{calls.push({url:String(input),body:null});return new Response('Unavailable',{status:503});};
  await assert.rejects(()=>submitLead(form));assert.equal(calls.length,1);
 }finally{globalThis.fetch=originalFetch;Reflect.deleteProperty(globalThis,'window');}
});
