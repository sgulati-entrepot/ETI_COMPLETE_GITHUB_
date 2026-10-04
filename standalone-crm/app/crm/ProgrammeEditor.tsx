import {useState} from 'react';
import {programs} from './catalogue';
import {corporateCourses} from './corporate-courses';

// Individual course categories are derived from the catalogue; corporate courses use their published categories.
export function programmeCategory(title:string){
 if(/supply|procurement|freight|logistics|export|import management/i.test(title))return 'Procurement & Supply Chain';
 if(/airline|airport|aviation|travel|tourism|hospitality/i.test(title))return 'Aviation, Hospitality & Tourism';
 if(/human resource|labour|immigration|\bPRO\b/i.test(title))return 'Human Resources & UAE Labour Law';
 if(/account|financial|finance|tax|VAT|invoicing|AML|compliance|laundering|MLRO|credit|GRC|auditor/i.test(title))return 'Finance & Compliance';
 if(/\bAI\b|power bi|microsoft|data|IT /i.test(title))return 'AI & Technology';
 if(/quantity|FIDIC|project|PMP|facility|engineering|construction/i.test(title))return 'Projects, Engineering & Facilities';
 return 'Business & Professional Skills';
}
const individualCourses=programs.map(title=>({title,category:programmeCategory(title)}));
export default function ProgrammeEditor({value,corporate,disabled,onSave}:{value:string;corporate:boolean;disabled:boolean;onSave:(program:string,category:string)=>Promise<void>}){
 const items=corporate?corporateCourses:individualCourses;
 const currentCategory=items.find(c=>c.title===value)?.category||'';
 const [draft,setDraft]=useState<{program:string;category:string}|null>(null);
 const [saving,setSaving]=useState(false);const [error,setError]=useState('');
 const category=draft?.category??currentCategory;const program=draft?.program??value;
 const categories=Array.from(new Set(items.map(c=>c.category)));
 return <form className="crm-programme-editor" onSubmit={async e=>{e.preventDefault();if(!draft||disabled||saving)return;if(!items.some(c=>c.title===program&&c.category===category)){setError('Choose a programme from the selected category.');return;}setSaving(true);setError('');try{await onSave(program,corporate?category:'');setDraft(null);}catch(e){setError((e as Error).message);}finally{setSaving(false);}}}>
  <label>Category<select aria-label="Programme category" value={category} disabled={disabled||saving} required onChange={e=>{setDraft({category:e.target.value,program:''});setError('');}}><option value="" disabled>Choose a category</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
  <label>Programme<select aria-label="Lead programme" value={program} disabled={disabled||saving} required onChange={e=>{const match=items.find(c=>c.title===e.target.value);setDraft({program:e.target.value,category:match?.category||category});setError('');}}><option value="" disabled>Choose a programme</option>{program&&!items.some(c=>c.title===program)&&<option value={program}>{program} (current)</option>}{items.filter(c=>!category||c.category===category).map(c=><option key={c.title} value={c.title}>{c.title}</option>)}</select></label>
  {draft&&<div><button className="crm-btn primary" disabled={disabled||saving||!program}>{saving?'Saving…':'Save programme'}</button><button className="crm-text-btn" type="button" disabled={saving} onClick={()=>{setDraft(null);setError('');}}>Cancel</button></div>}
  {error&&<small role="alert">{error}</small>}
 </form>;
}
