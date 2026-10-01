import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "../components";
import FeedbackForm from "./FeedbackForm";
import styles from "./feedback.module.css";

export const metadata: Metadata = {
  title: "Training Feedback | Entrepôt Training Institute",
  description: "Share your training experience with Entrepôt Training Institute. Your feedback helps us create better learning experiences.",
  alternates: { canonical: "https://etiworld.ae/feedback" },
};

export default function FeedbackPage() {
  return <main className={styles.page}>
    <SiteHeader />
    <header className={styles.hero}>
      <img src="/images/feedback-entrepot-logo.png" width="630" height="396" alt="Entrepôt Training Institute — Part of Entrepôt Group" />
      <span className={styles.eyebrow}>Your experience matters · Feedback form</span>
      <h1>Together, we create<br /><em>better learning experiences.</em></h1>
      <p>Thank you for participating in a training programme with Entrepôt Training Institute (ETI).</p>
      <p>Your feedback helps us understand what worked well, identify opportunities for improvement, and continuously enhance our training programmes, trainers, learning materials and overall participant experience.</p>
      <a href="#feedback-form">Share your experience <span aria-hidden="true">↓</span></a>
    </header>
    <section className={styles.photoStory} aria-label="Learning through connection">
      <figure className={styles.featurePhoto}>
        <img src="/images/home-learning-hero.png" width="1672" height="941" alt="Professionals sharing ideas around a table in an elegant, greenery-filled meeting room" decoding="async" />
        <figcaption><span>Learning through connection</span><p>Every experience.<br /><em>A chance to grow.</em></p></figcaption>
      </figure>
      <div className={styles.photoNote}><span>Reflect. Share. Inspire.</span><p>Your perspective helps shape the learning experiences of tomorrow.</p><a href="#feedback-form">Leave your feedback <span aria-hidden="true">↗</span></a></div>
    </section>
    <FeedbackForm />
    <section className={styles.closingPhoto} aria-label="Professional learning">
      <img src="/images/corporate-ai-data.png" width="1672" height="941" alt="A facilitator leading an interactive professional workshop in a warm, sophisticated training space" loading="lazy" decoding="async" />
      <div><span>Entrepôt Training Institute</span><h2>Better learning begins<br />with <em>your voice.</em></h2><a href="#feedback-form">Share your experience <span aria-hidden="true">↑</span></a></div>
    </section>
    <SiteFooter />
  </main>;
}
