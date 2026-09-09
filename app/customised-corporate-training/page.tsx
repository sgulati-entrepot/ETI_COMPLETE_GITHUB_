import type {Metadata} from "next";
import PaidCorporateLanding from "./PaidCorporateLanding";
import courseData from "../corporate-training/course-data.json";
import "./paid-corporate.css";

const title="Customised Corporate Training for L&D Leaders | Entrepôt";
const description="Turn capability priorities into practical corporate training shaped around your people, business context and rollout needs. Request a tailored recommendation from ETI.";

export const metadata:Metadata={
  title,
  description,
  alternates:{canonical:"https://www.etiworld.ae/customised-corporate-training"},
  openGraph:{title,description,url:"https://www.etiworld.ae/customised-corporate-training",siteName:"Entrepôt Training Institute",type:"website",images:["/images/corporate-training-hero.png"]},
  twitter:{card:"summary_large_image",title,description,images:["/images/corporate-training-hero.png"]},
};

export default function CustomisedCorporateTrainingPage(){return <PaidCorporateLanding courses={courseData}/>}
