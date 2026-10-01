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
    <FeedbackForm />
    <SiteFooter />
  </main>;
}
