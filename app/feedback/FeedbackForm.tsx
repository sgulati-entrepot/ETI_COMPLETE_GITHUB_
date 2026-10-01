"use client";

import { useRef, useState, type FormEvent } from "react";
import { submitLead } from "../lib/submitLead";
import styles from "./feedback.module.css";

const sections = [
  { title: "Training content & relevance", questions: [
    ["How relevant was the training content to your current role and professional responsibilities?", "Not relevant", "Highly relevant"],
    ["How would you rate the overall quality and structure of the training content?", "Poor", "Excellent"],
    ["The training content was practical and applicable to real workplace situations.", "Strongly disagree", "Strongly agree"],
    ["How useful were the practical examples, case studies, scenarios and exercises?", "Not useful", "Very useful"],
    ["The training content was appropriate for my level of knowledge and experience.", "Strongly disagree", "Strongly agree"],
  ]},
  { title: "Trainer evaluation", questions: [
    ["How would you rate the trainer’s subject-matter knowledge and expertise?", "Poor", "Excellent"],
    ["How clearly did the trainer explain the concepts and topics?", "Not clearly", "Very clearly"],
    ["How engaging and interactive was the trainer?", "Not engaging", "Very engaging"],
    ["How effectively did the trainer relate the subject to real-world workplace situations?", "Not effectively", "Very effectively"],
    ["How effectively did the trainer answer questions and address participant queries?", "Not effectively", "Very effectively"],
    ["How would you rate the trainer’s communication and presentation style?", "Poor", "Excellent"],
  ]},
  { title: "Learning experience", questions: [
    ["The training encouraged active participation, discussion and interaction.", "Strongly disagree", "Strongly agree"],
    ["The duration of the training was appropriate for the topics covered.", "Strongly disagree", "Strongly agree"],
  ]},
  { title: "Learning impact", questions: [
    ["I have gained useful knowledge and/or skills from this training programme.", "Strongly disagree", "Strongly agree"],
    ["I feel confident applying the knowledge and skills gained from this training in my workplace.", "Strongly disagree", "Strongly agree"],
  ]},
];

function Rating({ question, low, high }: { question: string; low: string; high: string }) {
  return <fieldset className={styles.rating}>
    <legend>{question}</legend>
    <div className={styles.choices}>{[1, 2, 3, 4, 5].map(value => <label key={value}>
      <input type="radio" name={question} value={String(value)} aria-label={`${value}${value === 1 ? ` — ${low}` : value === 5 ? ` — ${high}` : ""}`} />
      <span>{value}</span>
    </label>)}</div>
    <div className={styles.scale}><span>1 — {low}</span><span>5 — {high}</span></div>
  </fieldset>;
}

export default function FeedbackForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const sending = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const data = new FormData(event.currentTarget);
    data.set("Form", "Training feedback");
    data.set("Lead source", "ETI feedback page");
    data.set("_subject", "Training feedback — Entrepôt Training Institute");
    sending.current = true;
    setStatus("sending");
    try { await submitLead(data); setStatus("sent"); }
    catch { setStatus("error"); }
    finally { sending.current = false; }
  }

  return <section id="feedback-form" className={styles.shell}>
    {status === "sent" ? <div className={styles.success} role="status">
      <span className={styles.check} aria-hidden="true">✓</span>
      <span className={styles.eyebrow}>Feedback received</span>
      <h2>Thank you.</h2>
      <p>We appreciate your participation and look forward to learning with you again.</p>
      <p>Entrepôt Training Institute (ETI), Dubai</p>
      <a className={styles.submit} href="/">Back to Home <span aria-hidden="true">↗</span></a>
    </div> : <form onSubmit={submit} className={styles.form} aria-busy={status === "sending"}>
      <div className={styles.intro}><span className={styles.eyebrow}>A few moments. A lasting difference.</span><h2>Tell us about your experience.</h2><p>Please take a few minutes to share your experience. Fields marked * are required. Ratings use a scale of 1 to 5.</p></div>
      <fieldset className={styles.section}><legend><span>01</span>Participant & programme details</legend>
        <div className={styles.grid}>
          <label>Participant name<input name="Participant name" autoComplete="name" /></label>
          <label>Organization name<input name="Organization name" autoComplete="organization" /></label>
          <label>Training programme / course name<input name="Training programme / course name" /></label>
          <label>Training date(s)<input name="Training dates" placeholder="e.g. 1–2 October 2026" /></label>
          <label>Trainer name<input name="Trainer name" /></label>
          <label>Training delivery mode *<select name="Training delivery mode" required defaultValue=""><option value="" disabled>Select delivery mode</option><option>Live Online</option><option>In-House / Classroom</option><option>Other</option></select></label>
        </div>
      </fieldset>
      {sections.map((section, i) => <fieldset className={styles.section} key={section.title}>
        <legend><span>{String(i + 2).padStart(2, "0")}</span>{section.title}</legend>
        {section.questions.map(([question, low, high]) => <Rating key={question} question={question} low={low} high={high} />)}
      </fieldset>)}
      <fieldset className={styles.section}><legend><span>06</span>Overall programme evaluation</legend>
        <Rating question="How satisfied are you with the overall training programme?" low="Very dissatisfied" high="Very satisfied" />
        <label className={styles.field}>Would you recommend this training programme to a colleague or professional?<select name="Would you recommend this training programme?" defaultValue=""><option value="">Choose from list</option><option>Definitely Yes</option><option>Yes</option><option>Maybe</option><option>No</option></select></label>
        <label className={styles.field}>Do you have any additional comments or suggestions for the trainer or ETI team? <small>Optional</small><textarea name="Additional comments or suggestions" rows={4} /></label>
      </fieldset>
      <fieldset className={styles.section}><legend><span>07</span>Testimonial & communication permission</legend>
        <label className={styles.field}>Would you like to share a short testimonial about your experience with Entrepôt Training Institute? <small>Optional</small><textarea name="Testimonial" rows={4} placeholder="Share your experience…" /></label>
        <label className={styles.consent}><input type="checkbox" required name="Permission to use feedback or testimonial" value="Accepted" /><span><strong>Permission to use feedback / testimonial *</strong>By submitting this form, I understand that Entrepôt Training Institute (ETI) may use the feedback or testimonial I voluntarily provide for training improvement, marketing and communication purposes, including ETI&apos;s website, social media channels, presentations and other official promotional materials.</span></label>
      </fieldset>
      <div className={styles.actions}>
        <div role="status" aria-live="polite">{status === "error" && <p className={styles.error}>Your feedback could not be sent. Your answers are still here — please try again, or contact courses@entrepot.ae.</p>}</div>
        <button className={styles.submit} disabled={status === "sending"} type="submit">{status === "sending" ? "Sending your feedback…" : "Submit feedback"}<span aria-hidden="true">↗</span></button>
        <p>Your feedback helps us create better learning experiences.</p>
      </div>
    </form>}
  </section>;
}
