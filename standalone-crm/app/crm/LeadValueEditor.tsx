'use client';
import {useState,type FormEvent} from 'react';

export default function LeadValueEditor({name,value,disabled,onSave}:{name:string;value:number;disabled:boolean;onSave:(value:number)=>Promise<void>}){
 const [draft,setDraft]=useState<string|null>(null);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 async function submit(event:FormEvent){
  event.preventDefault();if(disabled||saving||draft===null)return;
  const amount=Number(draft);
  if(!draft.trim()||!Number.isFinite(amount)||amount<0||amount>100000000){setError('Enter a value from AED 0 to AED 100,000,000.');return;}
  setSaving(true);setError('');
  try{await onSave(amount);setDraft(null);}catch(e){setError((e as Error).message);}finally{setSaving(false);}
 }
 return <form className="crm-value-editor" onSubmit={submit}>
  <div><span>AED</span><input aria-label={`Value for ${name} in AED`} type="number" required min="0" max="100000000" step="0.01" value={draft??value} disabled={disabled||saving} onChange={e=>{setDraft(e.target.value);setError('');}}/></div>
  {draft!==null&&<div><button className="crm-btn primary" disabled={disabled||saving}>{saving?'Saving…':'Save'}</button><button className="crm-text-btn" type="button" disabled={saving} onClick={()=>{setDraft(null);setError('');}}>Cancel</button></div>}
  {error&&<small role="alert">{error}</small>}
 </form>;
}
