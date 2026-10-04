import {isUnassigned,unassignedCounts} from './unassigned';
import {useState} from 'react';
import type {Lead,TeamMember} from './model';

export default function AssignmentPanel({leads,team,busy,onAssign,onOpen}:{leads:Lead[];team:TeamMember[];busy:boolean;onAssign:(ids:string[])=>void;onOpen:(id:string)=>void}){
 const [filter,setFilter]=useState('Unassigned');
 const [search,setSearch]=useState('');
 const [selected,setSelected]=useState<string[]>([]);
 const unassigned=isUnassigned;const counts=unassignedCounts(leads);
 const rows=leads.filter(l=>(filter==='All leads'||(filter==='Unassigned'?unassigned(l):!unassigned(l)))&&`${l.name} ${l.email} ${l.phone} ${l.program} ${l.owner}`.toLowerCase().includes(search.toLowerCase()));
 const ids=selected.filter(id=>rows.some(l=>l.id===id));
 return <section className="crm-panel">
  <div className="crm-panel-head"><div><h2>Assign leads to your team</h2><p>Only super admins can assign, reassign or remove a lead owner. Related activities follow the assigned owner.</p></div></div>
  <div className="crm-unassigned-counts" role="status" aria-live="polite"><div><strong>{counts.total}</strong><span>Total unassigned</span></div><div><strong>{counts.individual}</strong><span>Individual leads</span></div><div><strong>{counts.corporate}</strong><span>Corporate leads</span></div></div><div className="crm-list-tabs">{['Unassigned','Assigned','All leads'].map(f=><button key={f} className={filter===f?'active':''} onClick={()=>{setFilter(f);setSelected([]);}}>{f} <span>{leads.filter(l=>f==='All leads'||(f==='Unassigned'?unassigned(l):!unassigned(l))).length}</span></button>)}</div>
  <div className="crm-toolbar"><input className="crm-select" aria-label="Search assignment queue" placeholder="Search name, programme or owner…" value={search} onChange={e=>{setSearch(e.target.value);setSelected([]);}}/><button className="crm-btn primary" disabled={busy||!ids.length} onClick={()=>onAssign(ids)}>Assign selected ({ids.length})</button></div>
  <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th><input type="checkbox" aria-label="Select all displayed leads" checked={rows.length>0&&ids.length===rows.length} onChange={e=>setSelected(e.target.checked?rows.map(l=>l.id):[])}/></th><th>Lead</th><th>Source</th><th>Temperature</th><th>Current owner</th><th>Assignment</th></tr></thead><tbody>{rows.map(l=><tr key={l.id}><td><input type="checkbox" aria-label={`Select ${l.name}`} checked={ids.includes(l.id)} onChange={e=>setSelected(e.target.checked?[...ids,l.id]:ids.filter(id=>id!==l.id))}/></td><td><button className="crm-text-btn" onClick={()=>onOpen(l.id)}>{l.name}</button><div className="crm-subtle">{l.program}</div></td><td>{l.source}</td><td><span className={`crm-badge crm-badge-${(l.temperature||'Warm').toLowerCase()}`}>{l.temperature||'Warm'}</span></td><td>{unassigned(l)?'Unassigned':l.owner}</td><td><button className="crm-btn" disabled={busy} onClick={()=>onAssign([l.id])}>{unassigned(l)?'Assign':'Reassign'}</button></td></tr>)}</tbody></table></div>
  {!rows.length&&<div className="crm-panel-head"><p>{search?'No leads match your search.':filter==='Unassigned'?'No leads are waiting for assignment. New unassigned enquiries will appear here.':'No leads in this queue.'}</p></div>}
  <div className="crm-panel-head"><div><h2>Salesperson workload</h2><p>Active staff and their currently assigned leads.</p>{team.filter(m=>m.status==='Active'&&m.role==='sales').map(m=><p key={m.id}><strong>{m.name}</strong> · {leads.filter(l=>l.ownerId===m.id).length} leads · {leads.filter(l=>l.ownerId===m.id&&!['Enrolled','Lost'].includes(l.stage)).length} open</p>)}</div></div>
 </section>;
}
