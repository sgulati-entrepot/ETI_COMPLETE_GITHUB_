"use client";
import {FormEvent,useState} from "react";

export default function ContactLeadForm(){
  const[status,setStatus]=useState<"idle"|"sending"|"sent"|"error">("idle");
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setStatus("sending");
    const form=event.currentTarget;const data=new FormData(form);
    data.append("_subject","New lead from ETI Contact Us page");data.append("_template","table");data.append("_captcha","false");
    try{const response=await fetch("https://formsubmit.co/ajax/courses@entrepot.ae",{method:"POST",headers:{Accept:"application/json"},body:data});if(!response.ok)throw new Error("Submission failed");form.reset();setStatus("sent");}
    catch{setStatus("error")}
  }
  return <section id="lead-capture" className="contact-lead-section section-pad">
    <div className="contact-lead-intro">
      <span>Programme enquiry</span>
      <h2>Tell us where you want to go next.</h2>
      <p>Share your interests and our learning consultant will recommend the right programme, delivery format and next available cohort.</p>
      <div><strong>Quick response</strong><small>Our programme team will contact you shortly.</small></div>
      <div><strong>Personal guidance</strong><small>Receive recommendations aligned with your career goals.</small></div>
    </div>
    {status==="sent"?<div className="contact-lead-success" role="status"><span>Thank you</span><h3>Your enquiry has been received.</h3><p>Our learning consultant will contact you shortly.</p><button className="btn-gold" type="button" onClick={()=>setStatus("idle")}>Send another enquiry <b>↗</b></button></div>:
    <form className="contact-lead-form" onSubmit={submit}>
      <div className="contact-lead-row"><label>Full name *<input name="Name" type="text" autoComplete="name" required placeholder="Your full name"/></label><label>Phone number *<input name="Phone" type="tel" autoComplete="tel" required placeholder="+971"/></label></div>
      <div className="contact-lead-row"><label>Email address *<input name="Email" type="email" autoComplete="email" required placeholder="you@company.com"/></label><label>Current location<select name="Location" defaultValue=""><option value="" disabled>Select location</option><option>United Arab Emirates</option><option>India</option><option>Other</option></select></label></div>
      <label>Programme or training interest *<input name="Programme interest" type="text" required placeholder="Course, certification or corporate training"/></label>
      <div className="contact-lead-row"><label>Preferred learning mode<select name="Learning mode" defaultValue=""><option value="" disabled>Select mode</option><option>Classroom</option><option>Virtual instructor-led</option><option>Corporate / In-house</option><option>Not sure yet</option></select></label><label>Best time to contact<select name="Best contact time" defaultValue=""><option value="" disabled>Select time</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label></div>
      <label>How can we help?<textarea name="Message" rows={4} placeholder="Tell us briefly about your goals or training requirements"/></label>
      <label className="contact-lead-consent"><input name="Consent" type="checkbox" value="Yes" required/><span>I agree to be contacted by Entrepôt Training Institute regarding this enquiry.</span></label>
      {status==="error"&&<p className="contact-lead-error" role="alert">We couldn&apos;t submit your enquiry. Please check your connection and try again.</p>}
      <button className="btn-gold contact-lead-submit" type="submit" disabled={status==="sending"}>{status==="sending"?"Sending…":"Submit enquiry"}<span>↗</span></button>
      <small>Your details are sent securely to courses@entrepot.ae and used only to respond to your enquiry.</small>
    </form>}
  </section>
}
