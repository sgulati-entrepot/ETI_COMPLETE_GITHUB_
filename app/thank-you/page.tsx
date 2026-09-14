import type {Metadata} from "next";
import Link from "next/link";
import {SiteFooter,SiteHeader} from "../components";

export const metadata:Metadata={
  title:"Thank You | Entrepôt Training Institute",
  description:"Your form has been submitted successfully to Entrepôt Training Institute.",
  robots:{index:false,follow:false},
};

export default function ThankYouPage(){
  return <main className="thank-you-page">
    <SiteHeader/>
    <section className="thank-you-hero" aria-labelledby="thank-you-title">
      <div className="thank-you-card">
        <div className="thank-you-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29"/><path d="m19 32 8 8 18-19"/></svg>
        </div>
        <span>Submission received</span>
        <h1 id="thank-you-title">Thank You!</h1>
        <p>Your form has been submitted successfully. We’ve received your information and will get back to you soon.</p>
        <Link className="btn-gold thank-you-home" href="/">Back to Home <b>↗</b></Link>
      </div>
    </section>
    <SiteFooter/>
  </main>;
}
