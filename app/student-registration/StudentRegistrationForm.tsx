"use client";

import { FormEvent, useState } from "react";

const programmes = [
  "Certified Management Accountant (CMA)", "Certified Procurement International Manager (CPIM)",
  "Certified Procurement International Professional (CPIP)", "Certified International Supply Chain Manager (CISM)",
  "Certified International Supply Chain Professional (CISP)", "Certified Human Resource Professional (CHRP)",
  "UAE VAT Training", "UAE E-Invoicing Compliance Training", "Sales Professional with AI", "MLRO Training",
  "AI Prompt Engineering Course", "AI Generalist Course",
  "Letter of Credit (LC) Training", "Hotel and Hospitality Management", "Export and Import Management",
  "Executive Secretary / Office Administrator", "AML Compliance CPD for Exchange Houses",
  "Certified Quantity Surveyor Training", "PRO Training", "Corporate Training Programme", "Other / Not sure yet",
];

export default function StudentRegistrationForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("sending");
    const form = event.currentTarget; const data = new FormData(form);
    data.append("_subject", "New student registration — Entrepôt Training Institute");
    data.append("_template", "table"); data.append("_captcha", "false");
    try {
      const response = await fetch("https://formsubmit.co/ajax/courses@entrepot.ae", { method: "POST", headers: { Accept: "application/json" }, body: data });
      if (!response.ok) throw new Error("Submission failed");
      form.reset(); setStatus("success"); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch { setStatus("error"); }
  }

  if (status === "success") return <section className="registration-success" role="status"><span>Registration received</span><h2>Thank you for taking the next step.</h2><p>Your details have been sent to the Entrepôt admissions team. A Learning &amp; Career Consultant will contact you shortly.</p><button type="button" className="btn-gold" onClick={() => setStatus("idle")}>Submit another registration <b>↗</b></button></section>;

  return <form className="student-form" onSubmit={submit}>
    <input type="hidden" name="Form" value="Student Registration" />
    <fieldset><legend><span>01</span><div>Your details<small>Essential contact information.</small></div></legend><div className="registration-grid">
      <label className="wide">Full name<input name="Full name" type="text" autoComplete="name" required placeholder="Enter your full name" /></label>
      <label>Email address<input name="Email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
      <label>Mobile / WhatsApp number<input name="Mobile / WhatsApp" type="tel" autoComplete="tel" required placeholder="Include country code" /></label>
      <label>Nationality<input name="Nationality" type="text" required placeholder="Your nationality" /></label>
      <label>Country of residence<input name="Country" type="text" autoComplete="country-name" required placeholder="Where do you live?" /></label>
    </div></fieldset>
    <fieldset><legend><span>02</span><div>Your programme<small>Help us guide your next step.</small></div></legend><div className="registration-grid">
      <label className="wide">Programme<select name="Programme" required defaultValue=""><option value="" disabled>Select a programme</option>{programmes.map(programme => <option key={programme}>{programme}</option>)}</select></label>
      <label>Preferred learning mode<select name="Preferred learning mode" required defaultValue=""><option value="" disabled>Select</option><option>Classroom</option><option>Live virtual</option><option>Hybrid</option><option>Flexible / advise me</option></select></label>
      <label>Preferred start date<input name="Preferred start date" type="date" /></label>
      <label>Highest qualification<input name="Highest qualification" type="text" placeholder="Degree, diploma or certification" /></label>
      <label>Current role / organisation<input name="Current role or organisation" type="text" placeholder="Optional" /></label>
      <label className="wide">What would you like to achieve?<textarea name="Learning objective" rows={3} placeholder="Tell us briefly about your career goal (optional)" /></label>
    </div></fieldset>
    <div className="registration-consent"><label><input name="Declaration" type="checkbox" value="Accepted" required /><span>I confirm that the information provided is accurate and I agree to be contacted by Entrepôt Training Institute regarding my registration.</span></label>{status === "error" && <p role="alert">We couldn&apos;t submit the registration. Please check your connection and try again.</p>}<button className="btn-gold registration-submit" type="submit" disabled={status === "sending"}>{status === "sending" ? "Submitting registration…" : "Submit registration"}<b>↗</b></button><small>Your information is sent securely to courses@entrepot.ae and used only for admissions and programme communication.</small></div>
  </form>;
}
