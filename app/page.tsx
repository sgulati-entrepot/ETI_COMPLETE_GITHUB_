import type { Metadata } from "next";
import HomeClient from "./HomeClient";

const title = "Leading Training Institute in UAE | Entrepot Training Institute";
const description = "ETI World is a premier training institute in the UAE offering leadership, management, and professional development programs designed for career growth.";

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
