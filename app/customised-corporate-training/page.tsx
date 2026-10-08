import type {Metadata} from "next";
import PaidCorporateLanding from "./PaidCorporateLanding";
import "./paid-corporate.css";
import "./corporate-updates.css";

const title="Customised Corporate Training in Dubai, Abu Dhabi & GCC | Entrepôt";
const description="Practical corporate training shaped around your organisation, people and business goals in Dubai, Abu Dhabi and across the GCC. Plan your programme with ETI.";

export const metadata:Metadata={
  title,
  description,
  alternates:{canonical:"https://www.etiworld.ae/customised-corporate-training"},
  openGraph:{title,description,url:"https://www.etiworld.ae/customised-corporate-training",siteName:"Entrepôt Training Institute",type:"website",images:["/images/corporate-training-hero.png"]},
  twitter:{card:"summary_large_image",title,description,images:["/images/corporate-training-hero.png"]},
};

export default function CustomisedCorporateTrainingPage(){return <><link rel="preload" as="image" href="/images/corporate-training-hero.png"/><PaidCorporateLanding/></>}
