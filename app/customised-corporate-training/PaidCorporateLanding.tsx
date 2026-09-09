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
  ["01","Built around the gap","Objectives, cases and activities shaped around the capability your organisation needs to strengthen."],
  ["02","Relevant to the business","Industry-aware scenarios help learners connect each concept to the decisions and challenges they face at work."],
  ["03","Easier to roll out","Choose in-house, classroom, live online or blended delivery to suit teams, locations and operational schedules."],
  ["04","Clearer evidence of value","Define learning objectives and evaluation measures early, so stakeholders know what success should look like."],
  ["05","Credible practitioners","Give learners access to specialists who translate proven frameworks into practical workplace application."]
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
  {name:"Reena Dsouza",role:"Trainer · Operations Head",image:"/images/trainer-reena-dsouza.jpg",experience:"6+ years of industry experience and 3+ years in cabin crew training",focus:"Cabin crew, aviation safety, customer service, communication and conflict resolution"},
  {name:"Aarti Khanna",role:"Corporate Trainer · L&D Professional",image:"/images/trainer-aarti-khanna.jpg",experience:"25+ years in banking and financial services",focus:"AML, compliance, credit, risk, sales and executive presence"},
  {name:"Thakur Ajit Singh",role:"Corporate Trainer · Business Consultant",image:"/images/trainer-thakur-ajit-singh.png",experience:"30+ years of experience · 5,000+ professionals trained",focus:"Leadership, communication, sales and productivity"}
];
const socialLinks=[
  ["Facebook","https://www.facebook.com/entrepottraininginstitute"],
  ["Instagram","https://www.instagram.com/entrepottraininginstitute/"],
  ["LinkedIn","https://www.linkedin.com/company/entrepot-training-institute/"],
  ["YouTube","https://www.youtube.com/@EntrepotTrainingInstitute"]
];
const clients=[
  ["Yenepoya University","/images/client-yenepoya-university.png"],
  ["Philips Healthcare","/images/client-philips-healthcare.png"],
  ["Kenya Civil Aviation Authority","/images/client-kenya-civil-aviation-authority.png"],
  ["Water Engineers","/images/client-water-engineers.png"],
  ["Trip Planners","/images/client-trip-planners.png"],
  ["Skyline","/images/client-skyline.png"],
  ["HSNC Board","/images/client-hsnc-board.png"]
];
const methods=[
  ["01","Diagnose","Align on the business priority, audience, capability gap and the evidence stakeholders need."],
  ["02","Design","Build the right mix of content, cases, activities and delivery around your organisation."],
  ["03","Deliver","Create an engaging learning experience focused on participation, practice and workplace relevance."],
  ["04","Evaluate","Review learning and application against the outcomes agreed at the start."]
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

function WhatsAppIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.4-4.2A8.5 8.5 0 1 1 20.5 11.7Z"/><path d="M8.1 7.6c.2-.5.5-.5.8-.5h.4c.2 0 .4.1.5.4l.8 1.9c.1.3 0 .5-.1.7l-.6.8c-.2.2-.2.4 0 .7.6 1.1 1.5 2 2.6 2.6.3.2.5.1.7-.1l.9-1.1c.2-.2.4-.3.7-.2l1.9.9c.3.1.4.3.4.5 0 .4-.2 1.5-.8 2-.6.5-1.3.8-2.2.6-1-.2-2.7-.8-4.5-2.4-1.5-1.4-2.6-3.1-2.9-4.2-.3-1-.1-1.9.3-2.4.3-.3.7-.6 1.1-.2Z"/></svg>}
function MailIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></svg>}
function SocialIcon({name}:{name:string}){
  if(name==="Instagram")return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.8" r=".8"/></svg>;
  if(name==="LinkedIn")return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M8 10v7M8 7.2v.2M11.5 17v-7m0 3c.7-2.2 4.5-2.4 4.5.9V17"/></svg>;
  if(name==="YouTube")return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="4"/><path d="m10 9 5 3-5 3Z"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 21v-8h3l.5-3H14V8.2c0-1 .4-1.7 1.8-1.7H18V3.8c-.7-.1-1.7-.3-3-.3-3 0-4.8 1.8-4.8 5.1V10H7v3h3.2v8"/></svg>;
}

function LeadForm({compact=false}:{compact?:boolean}){
  const[status,setStatus]=useState<"idle"|"sending"|"sent"|"error">("idle");
  const busy=useRef(false);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy.current)return;busy.current=true;setStatus("sending");
    const form=event.currentTarget;const data=new FormData(form);data.append("Lead source","Customised Corporate Training paid landing page");data.append("_subject",`Paid landing page corporate lead — ${data.get("Training category")||"General"}`);data.append("_template","table");data.append("_captcha","false");
    try{const response=await fetch("https://formsubmit.co/ajax/courses@entrepot.ae",{method:"POST",headers:{Accept:"application/json"},body:data});if(!response.ok)throw new Error();const gtag=(window as typeof window&{gtag?:(a:string,b:string,c:Record<string,string|number>)=>void}).gtag;if(gtag)gtag("event","conversion",{send_to:"AW-18398125830/CaK1CIvS9-YcEIa-9MRE",value:1,currency:"AED"});form.reset();setStatus("sent")}catch{busy.current=false;setStatus("error")}
  }
  if(status==="sent")return <div className="pct-form-success" role="status"><span>Thank you</span><h3>Your training brief is with us.</h3><p>Our corporate learning team will review your requirements and contact you to discuss the right next step.</p></div>;
  return <form className={`pct-lead-form ${compact?"pct-lead-form-compact":""}`} onSubmit={submit}>
    <div className="pct-form-heading"><span>Plan your corporate training</span><h2>{compact?"Get a tailored recommendation.":"Brief us on your capability priorities."}</h2><p>Share your priority and an ETI corporate learning specialist will help you identify a relevant programme, delivery format and next step.</p></div>
    <div className="pct-field-row"><label>Full name *<input name="Name" autoComplete="name" required placeholder="Your full name"/></label><label>Organisation *<input name="Organisation" autoComplete="organization" required placeholder="Company name"/></label></div>
    <div className="pct-field-row"><label>Business email *<input name="Email" type="email" autoComplete="email" required placeholder="you@company.com"/></label><label>Phone number *<input name="Phone" type="tel" autoComplete="tel" required placeholder="+971"/></label></div>
    <label>Priority training area *<select name="Training category" required defaultValue=""><option value="" disabled>Select a training area</option>{categories.slice(1).map(x=><option key={x}>{x}</option>)}</select></label>
    {!compact&&<label>What should this training help your people achieve?<textarea name="Requirements" rows={3} placeholder="Audience, capability gap, business objective, preferred dates or delivery format"/></label>}
    <label className="pct-consent"><input name="Consent" type="checkbox" required value="Yes"/><span>I agree to be contacted about this corporate training enquiry.</span></label>
    {status==="error"&&<p className="pct-error" role="alert">We couldn&apos;t submit this enquiry. Please try again or contact us directly.</p>}
    <button type="submit" disabled={status==="sending"}>{status==="sending"?"Sending…":"Request a tailored recommendation"}<span>↗</span></button>
    <small>No generic mailing lists. Your details are used only to respond to this training enquiry.</small>
  </form>
}

export default function PaidCorporateLanding({courses}:Props){
  const[filter,setFilter]=useState(categories[0]);
  const[query,setQuery]=useState("");
  const filtered=useMemo(()=>courses.filter(course=>(filter===categories[0]||course.category===filter)&&course.title.toLowerCase().includes(query.toLowerCase())),[courses,filter,query]);
  const grouped=useMemo(()=>categories.slice(1).map(category=>({category,courses:filtered.filter(course=>course.category===category)})).filter(group=>group.courses.length),[filtered]);
  return <main className="pct-page">
    <header className="pct-header"><Link href="/" aria-label="Entrepôt Training Institute home"><img src="/entrepot-logo-transparent.png" alt="Entrepôt Training Institute"/></Link><div className="pct-header-actions"><div className="pct-header-contact"><a href="https://wa.me/971544177480?text=Hi%2C%20I%20want%20to%20discuss%20customised%20corporate%20training" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp +971 544 177480"><WhatsAppIcon/><span>+971 544 177480</span></a><a href="https://wa.me/971545353558?text=Hi%2C%20I%20want%20to%20discuss%20customised%20corporate%20training" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp +971 545 353 558"><WhatsAppIcon/><span>+971 545 353 558</span></a></div><nav className="pct-header-socials" aria-label="Entrepôt social media">{socialLinks.map(([name,url])=><a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ETI on ${name}`} title={name} key={name}><SocialIcon name={name}/></a>)}</nav><a className="pct-header-cta" href="mailto:courses@entrepot.ae" aria-label="Email courses at Entrepôt Training Institute"><MailIcon/><span>courses@entrepot.ae</span></a></div></header>
    <section className="pct-hero"><div className="pct-hero-image"/><div className="pct-hero-copy"><span>For Learning &amp; Development leaders</span><h1>Turn capability priorities into training your people can <em>apply.</em></h1><p>Give your stakeholders a clear, practical learning solution—shaped around your capability gaps, business context and rollout requirements.</p><div className="pct-hero-actions"><a href="#enquire">Get a tailored recommendation <b>↗</b></a><a href="#catalogue">Review 100+ programme options</a></div><div className="pct-hero-proof"><span>Aligned to your objectives</span><span>English · Arabic</span><span>In-house · Online · Blended</span></div></div><aside id="enquire"><LeadForm compact/></aside></section>
    <section className="pct-trust"><div className="pct-trust-stats"><article><strong>100+</strong><span>Programme options</span></article><article><strong>11</strong><span>Capability areas</span></article><article><strong>2</strong><span>Regional offices</span></article><article><strong>4</strong><span>Flexible formats</span></article></div><div className="pct-client-wall"><div><span>Selected organisations</span><h2>Learning delivered. <em>Confidence earned.</em></h2><p>Selected organisations where ETI has successfully delivered professional learning—across education, healthcare, aviation, engineering and travel.</p></div><div>{clients.map(([name,image],index)=><figure key={name}><span>{String(index+1).padStart(2,"0")}</span><img src={image} alt={name} loading="lazy"/><figcaption>{name}</figcaption></figure>)}</div></div><div className="pct-logo-wall"><span>Affiliations &amp; accreditations</span><div><img src="/images/accreditation-iso-9001-transparent.png" alt="ISO 9001:2015"/><img src="/images/affiliation-dubai-knowledge-transparent.png" alt="Dubai Knowledge"/><img src="/images/accreditation-cpd-transparent.png" alt="CPD Standards Office"/><img src="/images/affiliation-cilt-transparent.png" alt="Chartered Institute of Logistics and Transport"/><img src="/images/affiliation-ifpsm-transparent.png" alt="International Federation of Purchasing and Supply Management"/></div></div></section>
    <section className="pct-section pct-why"><div className="pct-section-head"><span>A stronger L&amp;D partner</span><h2>Move from training request to a credible <em>capability plan.</em></h2><p>Bring us the business priority. We help you shape the learning response, engage the right expertise and choose a delivery model that works.</p></div><div className="pct-benefit-grid">{benefits.map(([no,title,text])=><article key={no}><span>{no}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section id="catalogue" className="pct-section pct-catalogue"><div className="pct-section-head"><span>Build your shortlist</span><h2>Find the right starting point for your learning brief.</h2><p>Explore ETI&apos;s current corporate programmes by capability area. Every engagement can be shaped around your audience and objectives.</p></div><div className="pct-catalogue-tools"><input aria-label="Search programmes" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by skill, topic or programme…"/><div>{categories.map(category=><button className={filter===category?"active":""} onClick={()=>setFilter(category)} key={category}>{category}</button>)}</div></div><div className="pct-course-groups">{grouped.map(group=><details key={group.category} open={filter!==categories[0]}><summary><div><span>{String(categories.indexOf(group.category)).padStart(2,"0")}</span><strong>{group.category}</strong></div><small>{group.courses.length} programmes</small></summary><p>{categoryDescriptions[group.category]}</p><div>{group.courses.map(course=><a href={`/corporate-training/courses/${course.categorySlug}/${course.slug}`} key={course.slug}><span>{course.title}</span><small>{course.duration}</small><b>↗</b></a>)}</div></details>)}</div>{!grouped.length&&<p className="pct-no-results">No exact match? Share your capability priority and we will help you identify or shape the right learning solution.</p>}</section>
    <section className="pct-section pct-industries"><div className="pct-section-head"><span>Industry-aware learning</span><h2>Training that speaks the language of your business.</h2><p>ETI adapts examples, exercises and delivery to the realities of your sector, roles and operating environment—helping learners see immediate relevance.</p></div><div>{industries.map(([title,text],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="pct-section pct-experts"><div className="pct-section-head"><span>Practitioner-led learning</span><h2>Give your people expertise they can use.</h2><p>ETI facilitators connect robust frameworks with the realities of the workplace, creating credible learning for experienced professionals.</p></div><div className="pct-expert-grid">{trainers.map(trainer=><article key={trainer.name}><img src={trainer.image} alt={`${trainer.name}, ${trainer.role}`} loading="lazy"/><div><span>{trainer.role}</span><h3>{trainer.name}</h3><strong>{trainer.experience}</strong><p>{trainer.focus}</p></div></article>)}</div></section>
    <section className="pct-method"><div className="pct-section-head"><span>A clear engagement process</span><h2>Make the learning plan easier to take to stakeholders.</h2><p>From the first brief to evaluation, each stage keeps the programme connected to the need it was designed to address.</p></div><div>{methods.map(([no,title,text])=><article key={no}><span>{no}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="pct-section pct-outcomes"><div className="pct-section-head"><span>Business-relevant outcomes</span><h2>Connect learning priorities to performance.</h2><p>Focus the engagement on capabilities that matter to your people, leaders and organisation.</p></div><div>{outcomes.map((outcome,index)=><article key={outcome}><span>{String(index+1).padStart(2,"0")}</span><p>{outcome}</p></article>)}</div></section>
    <section className="pct-delivery"><div><span>Flexible delivery</span><h2>Make rollout work across teams, locations and schedules.</h2></div><div className="pct-delivery-grid"><article><b>01</b><h3>In-house</h3><p>Bring focused, instructor-led learning directly to your organisation and team.</p></article><article><b>02</b><h3>ETI classroom</h3><p>Give learners a dedicated professional environment away from day-to-day demands.</p></article><article><b>03</b><h3>Live online</h3><p>Reach distributed teams through interactive virtual facilitation.</p></article><article><b>04</b><h3>Blended</h3><p>Combine face-to-face and digital learning around your audience and objectives.</p></article></div></section>
    <section className="pct-section pct-faq"><div className="pct-section-head"><span>Plan with confidence</span><h2>What L&amp;D leaders ask before they engage.</h2></div><div>{faqs.map(([question,answer])=><details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>
    <section className="pct-final"><div><span>Bring us your learning brief</span><h2>Have a capability priority on your agenda?</h2><p>Share your audience, business need and desired outcome. Our corporate learning team will help you turn it into a practical next step.</p><div><a href="https://wa.me/971544177480?text=Hi%2C%20I%20want%20to%20discuss%20customised%20corporate%20training" target="_blank" rel="noopener noreferrer">+971 544 177480</a><a href="https://wa.me/971545353558?text=Hi%2C%20I%20want%20to%20discuss%20customised%20corporate%20training" target="_blank" rel="noopener noreferrer">+971 545 353 558</a><a href="mailto:courses@entrepot.ae">courses@entrepot.ae</a></div></div><LeadForm/></section>
    <section className="pct-addresses"><div className="pct-addresses-head"><span>Speak with our corporate learning team</span><h2>Turn your next training request into a stronger brief.</h2><p>Email, call or WhatsApp ETI to discuss the audience, capability gap and outcome you need to address.</p><a href="mailto:courses@entrepot.ae"><MailIcon/><span>courses@entrepot.ae</span></a></div><div className="pct-office-grid"><article><span>01 / United Arab Emirates</span><h3>Dubai Office</h3><address>109, First Floor, Al Bannai Building,<br/>Plot No. 47, Al Nahda First,<br/>Dubai, United Arab Emirates</address><div><a href="https://wa.me/971544177480?text=Hi%2C%20I%20want%20to%20discuss%20customised%20corporate%20training" target="_blank" rel="noopener noreferrer"><WhatsAppIcon/>+971 544 177480</a><a href="https://wa.me/971545353558?text=Hi%2C%20I%20want%20to%20discuss%20customised%20corporate%20training" target="_blank" rel="noopener noreferrer"><WhatsAppIcon/>+971 545 353 558</a><a href="tel:+97143423009">Landline: 04 342 3009</a></div><a className="pct-map-link" href="https://www.google.com/maps/search/?api=1&query=Al%20Bannai%20Building%20Al%20Nahda%20First%20Dubai" target="_blank" rel="noopener noreferrer">View on Google Maps ↗</a></article><article><span>02 / India</span><h3>Mumbai Office</h3><address>910, 9th Floor, Hub Town Viva,<br/>Shankarwadi, Western Express Highway,<br/>Jogeshwari East, Mumbai 400 060</address><div><a href="tel:+919920656666">+91 99206 56666</a></div><a className="pct-map-link" href="https://www.google.com/maps/search/?api=1&query=Hubtown%20Viva%20Jogeshwari%20East%20Mumbai%20400060" target="_blank" rel="noopener noreferrer">View on Google Maps ↗</a></article></div></section>
    <footer className="pct-footer"><img src="/entrepot-logo-transparent.png" alt="Entrepôt Training Institute"/><div className="pct-footer-details"><div className="pct-footer-contact"><span>Dubai · Mumbai</span><a href="https://wa.me/971544177480?text=Hi%2C%20I%20want%20to%20discuss%20customised%20corporate%20training" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp +971 544 177480"><WhatsAppIcon/>+971 544 177480</a><a href="https://wa.me/971545353558?text=Hi%2C%20I%20want%20to%20discuss%20customised%20corporate%20training" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp +971 545 353 558"><WhatsAppIcon/>+971 545 353 558</a><a href="mailto:courses@entrepot.ae"><MailIcon/>courses@entrepot.ae</a></div><nav className="pct-socials" aria-label="Entrepôt social media">{socialLinks.map(([name,url])=><a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ETI on ${name}`} key={name}><SocialIcon name={name}/><span>{name}</span></a>)}</nav><span>© 2026 Entrepôt Training Institute</span></div></footer>
    <nav className="pct-mobile-contact" aria-label="Quick contact"><a href="https://wa.me/971544177480?text=Hi%2C%20I%20want%20to%20discuss%20customised%20corporate%20training" aria-label="WhatsApp ETI">WhatsApp</a><a href="tel:+971544177480" aria-label="Call ETI">Call</a><a href="mailto:courses@entrepot.ae?subject=Customised corporate training enquiry" aria-label="Email ETI">Email</a></nav>
  </main>
}
