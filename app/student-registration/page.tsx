import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";
import StudentRegistrationForm from "./StudentRegistrationForm";

export const metadata: Metadata = { title: "Student Registration | Entrepôt Training Institute", description: "Register your interest in an Entrepôt Training Institute professional or corporate training programme." };

export default function StudentRegistrationPage() { return <main className="student-registration-page"><SiteHeader /><section className="registration-hero registration-hero-photo"><div><p className="eyebrow"><i />Admissions · Student registration</p><h1>Start your <em>next chapter.</em></h1><p>Share a few details and our Learning &amp; Career Consultant will guide you to the right programme and next available cohort.</p></div></section><section className="registration-shell"><div className="registration-intro"><span>Application form</span><h2>A simple first step.</h2><p>Complete the essentials below. It takes about two minutes.</p></div><StudentRegistrationForm /></section><SiteFooter /></main>; }
