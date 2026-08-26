"use client";

import {FormEvent,useState} from "react";

type Props={categories:string[]};

export default function CorporateLeadForm({categories}:Props){
  const[status,setStatus]=useState<"idle"|"sending"|"sent"|"error">("idle");

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setStatus("sending");
    const form=event.currentTarget;const data=new FormData(form);
    data.append("Lead source","Corporate Training landing page");
    data.append("_subject",`New corporate training lead - ${data.get("Training category")||"General enquiry"}`);
    data.append("_template","table");data.append("_captcha","false");
    try{
      const response=await fetch("https://formsubmit.co/ajax/courses@entrepot.ae",{method:"POST",headers:{Accept:"application/json"},body:data});
      if(!response.ok)throw new Error("Submission failed");
      form.reset();setStatus("sent");
    }catch{setStatus("error")}
  }

  return <section id="corporate-lead-capture" className="contact-lead-section corporate-lead-section section-pad">
    <div className="contact-lead-intro">
      <span>Corporate training enquiry</span>
      <h2>Tell us what capability your team needs next.</h2>
      <p>Select a training category and share your organisation&apos;s requirements. Our corporate learning team will recommend a focused course or shape a customised programme.</p>
      <div><strong>Category-led guidance</strong><small>Route your enquiry to the most relevant training specialist.</small></div>
      <div><strong>Designed around your business</strong><small>Align content, delivery and outcomes with your team and industry.</small></div>
    </div>
    {status==="sent"?<div className="contact-lead-success" role="status"><span>Thank you</span><h3>Your corporate training enquiry has been received.</h3><p>Our corporate learning team will contact you shortly.</p><button className="btn-gold" type="button" onClick={()=>setStatus("idle")}>Send another enquiry <b>↗</b></button></div>:
    <form className="contact-lead-form" onSubmit={submit}>
      <div className="contact-lead-row"><label>Full name *<input name="Name" type="text" autoComplete="name" required placeholder="Your full name"/></label><label>Organisation *<input name="Organisation" type="text" autoComplete="organization" required placeholder="Company or organisation"/></label></div>
      <div className="contact-lead-row"><label>Business email *<input name="Email" type="email" autoComplete="email" required placeholder="you@company.com"/></label><label>Phone number *<input name="Phone" type="tel" autoComplete="tel" required placeholder="+971"/></label></div>
      <label>Training category *<select name="Training category" defaultValue="" required><option value="" disabled>Select a category</option>{categories.map(category=><option value={category} key={category}>{category}</option>)}</select></label>
      <label>Course or capability required<input name="Course or capability" type="text" placeholder="Specific course, skill gap or business objective"/></label>
      <div className="contact-lead-row"><label>Approximate group size<select name="Group size" defaultValue=""><option value="" disabled>Select group size</option><option>1-10 participants</option><option>11-25 participants</option><option>26-50 participants</option><option>51-100 participants</option><option>More than 100 participants</option></select></label><label>Preferred delivery<select name="Preferred delivery" defaultValue=""><option value="" disabled>Select delivery mode</option><option>In-person at our organisation</option><option>Classroom at ETI</option><option>Live online instructor-led</option><option>Hybrid</option><option>Not sure yet</option></select></label></div>
      <label>Training requirements<textarea name="Message" rows={4} placeholder="Tell us about your audience, objectives, preferred dates or customisation needs"/></label>
      <label className="contact-lead-consent"><input name="Consent" type="checkbox" value="Yes" required/><span>I agree to be contacted by Entrepôt Training Institute regarding this corporate training enquiry.</span></label>
      {status==="error"&&<p className="contact-lead-error" role="alert">We couldn&apos;t submit your enquiry. Please check your connection and try again.</p>}
      <button className="btn-gold contact-lead-submit" type="submit" disabled={status==="sending"}>{status==="sending"?"Sending…":"Submit corporate enquiry"}<span>↗</span></button>
      <small>Your details are sent securely to courses@entrepot.ae and used only to respond to your enquiry.</small>
    </form>}
  </section>
}
