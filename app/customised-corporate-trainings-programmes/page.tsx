import type {Metadata} from "next";
import ComplianceCorporateLanding from "./ComplianceCorporateLanding";
import "../customised-corporate-training/paid-corporate.css";
import "./compliance-corporate.css";

const title="Customised Corporate AML & Compliance Training Programmes | ETI";
const description="Explore customised corporate AML and compliance training programmes for banks, FinTechs, exchange houses, real estate, insurance, trading companies and other regulated businesses.";

export const metadata:Metadata={
  title,
  description,
  alternates:{canonical:"https://www.etiworld.ae/customised-corporate-trainings-programmes"},
  openGraph:{title,description,url:"https://www.etiworld.ae/customised-corporate-trainings-programmes",siteName:"Entrepôt Training Institute",type:"website",images:["/images/corporate-training-hero.png"]},
  twitter:{card:"summary_large_image",title,description,images:["/images/corporate-training-hero.png"]},
};

export default function CustomisedCorporateTrainingsProgrammesPage(){return <ComplianceCorporateLanding/>}
