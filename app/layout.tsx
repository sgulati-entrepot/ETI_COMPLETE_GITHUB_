import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const META_PIXEL_ID = "1976753683143225";
const GOOGLE_ANALYTICS_ID = "G-HXL51X2GTS";
const GOOGLE_ADS_ID = "AW-18398125830";
const ZOHO_SALESIQ_WIDGET = "https://salesiq.zohopublic.in/widget?wc=siq575bcf63317e6897cf385d77a97ed68f06ea585966d085a30022929035fea5e3bdc27d7bb244c497498f653c230c3f0d";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.etiworld.ae"),
  title: "Entrepôt Training Institute | Gateway to Excellence",
  description: "Gateway to Excellence through job-ready aviation, logistics, supply chain and professional training.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0e1b0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="google-tag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GOOGLE_ANALYTICS_ID}');gtag('config','${GOOGLE_ADS_ID}');`,
          }}
        />
        <Script
          id="meta-pixel"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`,
          }}
        />
        <Script
          id="zoho-salesiq-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: "window.$zoho=window.$zoho||{};$zoho.salesiq=$zoho.salesiq||{ready:function(){}};",
          }}
        />
        <Script
          id="zsiqscript"
          src={ZOHO_SALESIQ_WIDGET}
          strategy="afterInteractive"
        />
        <noscript><img height="1" width="1" style={{display:"none"}} src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} alt=""/></noscript>
        {children}
      </body>
    </html>
  );
}
