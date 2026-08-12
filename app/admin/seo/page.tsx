import type { Metadata } from "next";
import SeoDashboard from "./SeoDashboard";

export const metadata: Metadata = {
  title: "SEO Administration | Entrepôt Training Institute",
  robots: { index: false, follow: false },
};

export default function SeoAdminPage(){
  return <SeoDashboard/>;
}
