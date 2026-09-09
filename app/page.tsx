import type { Metadata } from "next";
import HomeClient from "./HomeClient";

const title = "Corporate Training for L&D Leaders in UAE | Entrepôt";
const description = "Turn workforce capability priorities into practical corporate training aligned to your people, business context and rollout needs. Request a tailored ETI recommendation.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://www.etiworld.ae",
  },
  openGraph: {
    title,
    description,
    url: "https://www.etiworld.ae",
    siteName: "Entrepot Training Institute",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function Home(){
  return <HomeClient/>;
}
