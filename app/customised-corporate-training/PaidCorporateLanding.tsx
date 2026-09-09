"use client";

import {FormEvent,useMemo,useRef,useState} from "react";
import Link from "next/link";

type Course={number:string;title:string;slug:string;category:string;categoryNo:string;categorySlug:string;duration:string;overview:string};
type Props={courses:Course[]};

const categories=["All training areas","Leadership & Management","Human Resources","AI - Artificial Intelligence","Skills Development","Finance & Compliance","Microsoft & IT Skills","Customer Service, Sales & Marketing","Procurement & Contracts","Aviation, Hospitality & Tourism","Quality Management & Process Improvement","Team Building"];
const categoryDescriptions:Record<string,string>={
  "Leadership & Management":"Strengthen leadership thinking, decision-making, change capability and high-performing teams.",
  "Human Resources":"Build practical HR, people analytics, performance and talent-management capability.",
  "AI - Artificial Intelligence":"Turn AI into responsible, practical productivity and decision-making capability.",
  "Skills Development":"Develop communication, resilience, collaboration, presentation and workplace effectiveness.",
  "Finance & Compliance":"Improve commercial awareness, reporting, compliance and financial decision-making.",
  "Microsoft & IT Skills":"Accelerate digital adoption through Excel, Power BI, Microsoft 365 and cybersecurity skills.",
  "Customer Service, Sales & Marketing":"Create stronger customer experiences, consultative sales and service excellence.",
  "Procurement & Contracts":"Advance sourcing, negotiation, contracts, logistics and supply-chain performance.",
  "Aviation, Hospitality & Tourism":"Build operational, safety, service and leadership capability in high-pressure environments.",
  "Quality Management & Process Improvement":"Embed continuous improvement, quality management and operational discipline.",
  "Team Building":"Create purposeful shared experiences that improve trust, alignment and team effectiveness."
};
const benefits=[
  ["01","Customised learning","Content, casework and activities aligned with your objectives, competency gaps and operating context."],
  ["02","Industry relevance","Practical scenarios and business-focused learning led by experienced practitioners."],
  ["03","Flexible delivery","In-house, classroom, live online and blended formats shaped around operational needs."],
  ["04","Measurable outcomes","Clear objectives and evaluation designed into the learning journey from the outset."],
  ["05","Expert facilitators","Subject specialists who connect robust frameworks with workplace application."]
];
const industries=[
  ["Aviation & Airports","Operations, ground handling, human factors, compliance and customer experience."],
  ["Banking & Financial Services","Leadership, AML, risk, finance, sales and service capability."],
  ["Logistics & Supply Chain","Procurement, contracts, warehousing, freight and supply-chain leadership."],
  ["Hospitality & Tourism","Service excellence, reservations, sales, professional etiquette and leadership."],
  ["Government & Professional Services","Leadership, performance, communication, compliance and digital capability."],
  ["Cross-industry Teams","HR, AI, Microsoft, quality, management and professional effectiveness."]
];
const trainers=[
  {name:"Sajeev Gulati",role:"Founder · Trainer · Mentor · Leader",image:"/images/trainer-sajeev-gulati.jpg",experience:"21+ years of experience · 5,000+ learners trained",focus:"Logistics, supply chain, airport operations and procurement"},
  {name:"Sheetal Murthy",role:"Trainer · Mentor · Leader",image:"/images/trainer-sheetal-murthy.jpg",experience:"20+ years of experience · 10,000+ training hours",focus:"Aviation, travel, supply chain and professional skills"},
  {name:"Aarti Khanna",role:"Corporate Trainer · L&D Professional",image:"/images/trainer-aarti-khanna.jpg",experience:"25+ years in banking and financial services",focus:"AML, compliance, credit, risk, sales and executive presence"},
  {name:"Thakur Ajit Singh",role:"Corporate Trainer · Business Consultant",image:"/images/trainer-thakur-ajit-singh.png",experience:"30+ years of experience · 5,000+ professionals trained",focus:"Leadership, communication, sales and productivity"}
];
const methods=[
  ["01","Diagnose","Clarify priorities, capability gaps, learner needs and meaningful measures of success."],
  ["02","Design","Shape content, cases, activities and delivery around your organisation and industry."],
  ["03","Deliver","Facilitate practical, engaging learning in the format that works for your people."],
  ["04","Evaluate","Review learning and application against the outcomes agreed at the outset."]
];
const outcomes=["Leadership capability","Workplace productivity","Digital and AI adoption","Customer experience","Compliance awareness","Team effectiveness","Commercial acumen","Operational excellence"];
const faqs=[
  ["Can the programme be customised to our organisation?","Yes. ETI can align programme content, cases, activities, duration and delivery with your business priorities, industry and learner profile."],
  ["Can training be delivered at our premises?","Yes. Programmes can be delivered in-house, at ETI, live online or through a blended format, subject to the engagement requirements."],
  ["Do you support teams with different experience levels?","Yes. The diagnostic stage helps establish audience needs so the learning level and application can be appropriately designed."],
  ["Can we combine topics from different training areas?","Yes. A customised learning journey can draw from multiple ETI training areas when that best supports the required capability."],
  ["How is training effectiveness evaluated?","Objectives and evaluation are agreed during design. ETI can review participation, learning and workplace application against those outcomes."],
  ["Are programmes available in English and Arabic?","Corporate programmes are available in English or Arabic where applicable and subject to facilitator availability."]
];

function LeadForm({compact=false}:{compact?:boolean}){
  const[status,setStatus]=useState<"idle"|"sending"|"sent"|"error">("idle");
  const busy=useRef(false);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy.current)return;busy.current=true;setStatus("sending");
    const form=event.currentTarget;const data=new FormData(form);data.append("Lead source","Customised Corporate Training paid landing page");data.append("_subject",`Paid landing page corporate lead — ${data.get("Training category")||"General"}`);data.append("_template","table");data.append("_captcha","false");
    try{const response=await fetch("https://formsubmit.co/ajax/courses@entrepot.ae",{method:"POST",headers:{Accept:"application/json"},body:data});if(!response.ok)throw new Error();const gtag=(window as typeof window&{gtag?:(a:string,b:string,c:Record<string,string|number>)=>void}).gtag;if(gtag)gtag("event","conversion",{send_to:"AW-18398125830/CaK1CIvS9-YcEIa-9MRE",value:1,currency:"AED"});form.reset();setStatus("sent")}catch{busy.current=false;setStatus("error")}
  }
  if(status==="sent")return <div className="pct-form-success" role="status"><span>Thank you</span><h3>Your enquiry has been received.</h3><p>Our corporate learning team will contact you shortly.</p></div>;
  return <form className={`pct-lead-form ${compact?"pct-lead-form-compact":""}`} onSubmit={submit}>
    <div className="pct-form-heading"><span>Corporate training enquiry</span><h2>{compact?"Start the conversation.":"Tell us what your team needs next."}</h2><p>Share a few details and our team will recommend the right approach.</p></div>
    <div className="pct-field-row"><label>Full name *<input name="Name" autoComplete="name" required placeholder="Your full name"/></label><label>Organisation *<input name="Organisation" autoComplete="organization" required placeholder="Company name"/></label></div>
    <div className="pct-field-row"><label>Business email *<input name="Email" type="email" autoComplete="email" required placeholder="you@company.com"/></label><label>Phone number *<input name="Phone" type="tel" autoComplete="tel" required placeholder="+971"/></label></div>
    <label>Training category *<select name="Training category" required defaultValue=""><option value="" disabled>Select a training area</option>{categories.slice(1).map(x=><option key={x}>{x}</option>)}</select></label>
    {!compact&&<label>What capability do you want to build?<textarea name="Requirements" rows={3} placeholder="Audience, business objective, preferred dates or delivery requirements"/></label>}
    <label className="pct-consent"><input name="Consent" type="checkbox" required value="Yes"/><span>I agree to be contacted about this corporate training enquiry.</span></label>
    {status==="error"&&<p className="pct-error" role="alert">We couldn&apos;t submit this enquiry. Please try again or contact us directly.</p>}
    <button type="submit" disabled={status==="sending"}>{status==="sending"?"Sending…":"Discuss your training needs"}<span>↗</span></button>
    <small>Your details are used only to respond to your enquiry.</small>
  </form>
}

export default function PaidCorporateLanding({courses}:Props){
  const[filter,setFilter]=useState(categories[0]);
  const[query,setQuery]=useState("");
  const filtered=useMemo(()=>courses.filter(course=>(filter===categories[0]||course.category===filter)&&course.title.toLowerCase().includes(query.toLowerCase())),[courses,filter,query]);
  const grouped=useMemo(()=>categories.slice(1).map(category=>({category,courses:filtered.filter(course=>course.category===category)})).filter(group=>group.courses.length),[filtered]);
  return <main className="pct-page">
    <header className="pct-header"><Link href="/" aria-label="Entrepôt Training Institute home"><img src="/entrepot-logo-transparent.png" alt="Entrepôt Training Institute"/></Link><div><a href="tel:+971544177480">+971 54 417 7480</a><a className="pct-header-cta" href="#enquire">Talk to an expert</a></div></header>
    <section className="pct-hero"><div className="pct-hero-image"/><div className="pct-hero-copy"><span>Customised corporate learning</span><h1>Training designed around your <em>business priorities.</em></h1><p>Build practical capability with focused programmes shaped around your people, industry and performance goals.</p><div className="pct-hero-actions"><a href="#enquire">Discuss your training needs <b>↗</b></a><a href="#catalogue">Explore 100+ programmes</a></div><div className="pct-hero-proof"><span>Dubai · Mumbai</span><span>English · Arabic</span><span>In-house · Online · Blended</span></div></div><aside id="enquire"><LeadForm compact/></aside></section>
    <section className="pct-trust"><div className="pct-trust-stats"><article><strong>100+</strong><span>Corporate programmes</span></article><article><strong>11</strong><span>Training categories</span></article><article><strong>2</strong><span>Commercial centres</span></article><article><strong>4</strong><span>Flexible delivery modes</span></article></div><div className="pct-logo-wall"><span>Affiliations &amp; accreditations</span><div><img src="/images/accreditation-iso-9001-transparent.png" alt="ISO 9001:2015"/><img src="/images/affiliation-dubai-knowledge-transparent.png" alt="Dubai Knowledge"/><img src="/images/accreditation-cpd-transparent.png" alt="CPD Standards Office"/><img src="/images/affiliation-cilt-transparent.png" alt="Chartered Institute of Logistics and Transport"/><img src="/images/affiliation-ifpsm-transparent.png" alt="International Federation of Purchasing and Supply Management"/></div></div></section>
    <section className="pct-section pct-why"><div className="pct-section-head"><span>Why organisations choose ETI</span><h2>Corporate learning with a clear line to <em>business value.</em></h2></div><div className="pct-benefit-grid">{benefits.map(([no,title,text])=><article key={no}><span>{no}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section id="catalogue" className="pct-section pct-catalogue"><div className="pct-section-head"><span>Full corporate catalogue</span><h2>Find the capability your organisation needs.</h2><p>Search every current ETI corporate programme or filter by training area.</p></div><div className="pct-catalogue-tools"><input aria-label="Search programmes" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search programmes…"/><div>{categories.map(category=><button className={filter===category?"active":""} onClick={()=>setFilter(category)} key={category}>{category}</button>)}</div></div><div className="pct-course-groups">{grouped.map(group=><details key={group.category} open={filter!==categories[0]}><summary><div><span>{String(categories.indexOf(group.category)).padStart(2,"0")}</span><strong>{group.category}</strong></div><small>{group.courses.length} programmes</small></summary><p>{categoryDescriptions[group.category]}</p><div>{group.courses.map(course=><a href={`/corporate-training/courses/${course.categorySlug}/${course.slug}`} key={course.slug}><span>{course.title}</span><small>{course.duration}</small><b>↗</b></a>)}</div></details>)}</div>{!grouped.length&&<p className="pct-no-results">No programme matched your search. Tell us the capability you need and we can design a customised solution.</p>}</section>
    <section className="pct-section pct-industries"><div className="pct-section-head"><span>Industries we serve</span><h2>Relevant to your operating environment.</h2><p>ETI adapts examples, exercises and delivery to the realities of your sector and people.</p></div><div>{industries.map(([title,text],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="pct-section pct-experts"><div className="pct-section-head"><span>Expert facilitators</span><h2>Experience beyond the classroom.</h2><p>Practitioners who turn proven frameworks into practical workplace insight.</p></div><div className="pct-expert-grid">{trainers.map(trainer=><article key={trainer.name}><img src={trainer.image} alt={`${trainer.name}, ${trainer.role}`} loading="lazy"/><div><span>{trainer.role}</span><h3>{trainer.name}</h3><strong>{trainer.experience}</strong><p>{trainer.focus}</p></div></article>)}</div></section>
    <section className="pct-method"><div className="pct-section-head"><span>Training methodology</span><h2>From business need to workplace application.</h2></div><div>{methods.map(([no,title,text])=><article key={no}><span>{no}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="pct-section pct-outcomes"><div className="pct-section-head"><span>Business outcomes</span><h2>Capability that supports performance.</h2></div><div>{outcomes.map((outcome,index)=><article key={outcome}><span>{String(index+1).padStart(2,"0")}</span><p>{outcome}</p></article>)}</div></section>
    <section className="pct-delivery"><div><span>Flexible delivery</span><h2>Built to work around your organisation.</h2></div><div className="pct-delivery-grid"><article><b>01</b><h3>In-house</h3><p>Instructor-led training delivered at your organisation.</p></article><article><b>02</b><h3>ETI classroom</h3><p>Focused learning in a professional classroom environment.</p></article><article><b>03</b><h3>Live online</h3><p>Interactive virtual facilitation for distributed teams.</p></article><article><b>04</b><h3>Blended</h3><p>A considered mix of face-to-face and digital learning.</p></article></div></section>
    <section className="pct-section pct-faq"><div className="pct-section-head"><span>Corporate training FAQ</span><h2>What decision-makers ask us.</h2></div><div>{faqs.map(([question,answer])=><details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>
    <section className="pct-final"><div><span>Build capability that lasts</span><h2>Let&apos;s design a programme around your priorities.</h2><p>Tell us about your organisation, audience and desired outcomes. Our corporate learning team will help you define the next step.</p><div><a href="tel:+971544177480">Call +971 54 417 7480</a><a href="mailto:courses@entrepot.ae">courses@entrepot.ae</a></div></div><LeadForm/></section>
    <footer className="pct-footer"><img src="/entrepot-logo-transparent.png" alt="Entrepôt Training Institute"/><div><span>Dubai · Mumbai</span><a href="mailto:courses@entrepot.ae">courses@entrepot.ae</a><span>© 2026 Entrepôt Training Institute</span></div></footer>
    <nav className="pct-mobile-contact" aria-label="Quick contact"><a href="https://wa.me/971544177480?text=Hi%2C%20I%20want%20to%20discuss%20customised%20corporate%20training" aria-label="WhatsApp ETI">WhatsApp</a><a href="tel:+971544177480" aria-label="Call ETI">Call</a><a href="mailto:courses@entrepot.ae?subject=Customised corporate training enquiry" aria-label="Email ETI">Email</a></nav>
  </main>
}
