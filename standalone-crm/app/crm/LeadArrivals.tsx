'use client';
import {useEffect,useState} from 'react';
import type {Lead} from './model';
import {dailyArrivals} from './lead-arrivals';
export default function LeadArrivals({leads,corporate,selectedDay,onSelectDay}:{leads:Lead[];corporate:boolean;selectedDay:string;onSelectDay:(day:string)=>void}){
 const [now,setNow]=useState(()=>new Date());
 useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),60000);return()=>clearInterval(timer);},[]);
 const days=dailyArrivals(leads,now);
 return <section className="crm-arrivals crm-panel" aria-label="Daily new enquiries"><div className="crm-arrivals-heading"><div role="status" aria-live="polite"><strong>{days[0].count}</strong><span>new {corporate?'corporate leads':'leads'} today</span></div><small>Newest enquiries first · Days measured in UAE time</small></div><div className="crm-arrivals-days">{days.map(day=><button type="button" key={day.day} aria-pressed={selectedDay===day.day} aria-label={`Show ${day.count} ${corporate?'corporate leads':'leads'} received on ${day.day}`} onClick={()=>onSelectDay(day.day)}><span>{day.label}</span><b>{day.count}</b></button>)}</div><p>Counts leads by received date (original generation date for imports), across this section before filters. Editing an existing lead does not count as a new enquiry.</p></section>;
}
