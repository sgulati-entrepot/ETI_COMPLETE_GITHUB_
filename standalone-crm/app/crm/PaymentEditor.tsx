import {useState} from 'react';
import PaymentFields,{type PaymentDetails} from './PaymentFields';
import type {Lead} from './model';
export default function PaymentEditor({lead,disabled,onSave}:{lead:Lead;disabled:boolean;onSave:(record:Lead)=>Promise<void>}){
 const [draft,setDraft]=useState<PaymentDetails|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const values=draft||{nextPaymentDate:lead.nextPaymentDate||'',amountPaid:lead.amountPaid??null,paymentMethod:lead.paymentMethod||'',paymentDate:lead.paymentDate||'',paymentPlan:lead.paymentPlan||'',emiDates:lead.emiDates||[]};
 return <div className="crm-detail-section"><h3>Student payment</h3><form className="crm-payment-form" onSubmit={async e=>{e.preventDefault();if(!draft)return;setBusy(true);setError('');try{await onSave({...lead,...draft});setDraft(null);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}><PaymentFields dealValue={lead.value} value={values} disabled={disabled||busy} onChange={setDraft}/>{draft&&<div><button className="crm-btn primary" disabled={disabled||busy}>{busy?'Saving…':'Save payment details'}</button><button className="crm-text-btn" type="button" disabled={busy} onClick={()=>{setDraft(null);setError('');}}>Cancel</button></div>}{error&&<p role="alert">{error}</p>}</form></div>;
}
