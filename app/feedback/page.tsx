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
      <div className={styles.heroCopy}>
      <img src="/images/feedback-entrepot-logo.png" width="630" height="396" alt="Entrepôt Training Institute — Part of Entrepôt Group" />
      <span className={styles.eyebrow}>Your experience matters · Feedback form</span>
      <h1>Together, we create<br /><em>better learning experiences.</em></h1>
      <p>Thank you for participating in a training programme with Entrepôt Training Institute (ETI).</p>
      <p>Your feedback helps us understand what worked well, identify opportunities for improvement, and continuously enhance our training programmes, trainers, learning materials and overall participant experience.</p>
      <a href="#feedback-form">Share your experience <span aria-hidden="true">↓</span></a>
      </div>
      <figure className={styles.heroVisual}>
        <img src="/images/feedback-conversation.jpg" width="1024" height="1536" alt="Two professionals sharing a thoughtful conversation in an elegant, greenery-filled lounge" fetchPriority="high" />
        <figcaption><span>Reflect. Share. Inspire.</span><p>Every experience.<br /><em>A chance to grow.</em></p></figcaption>
      </figure>
    </header>
    <div className={styles.editorialNote}><span>01 / Your perspective</span><p>Thoughtful feedback.<br /><em>Meaningful progress.</em></p><span>Shaping better learning, together.</span></div>
    <FeedbackForm />
    <section className={styles.closingPhoto} aria-label="Professional learning">
      <img src="/images/feedback-learning-lounge.jpg" width="1536" height="864" alt="An elegant executive learning lounge with ivory seating, brass accents and lush indoor trees" loading="lazy" decoding="async" />
      <div><span>Entrepôt Training Institute</span><h2>Better learning begins<br />with <em>your voice.</em></h2><a href="#feedback-form">Share your experience <span aria-hidden="true">↑</span></a></div>
    </section>
    <SiteFooter />
  </main>;
}
