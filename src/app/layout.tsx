import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { SoftwareApplicationJsonLd, OrganizationJsonLd } from "@/components/seo/json-ld";

// Inter font is loaded via globals.css @import to ensure offline build resilience
const inter = {
  variable: "--font-inter",
  className: "font-sans",
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://customerpilot.in";
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-TDR2SKTL";
const GOOGLE_VERIFICATION_TOKEN = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "3GA2acCHJSCk7exs73s6teQ6MCcR88yMYwU5sWaw1YU";

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  manifest: "/manifest.json",
  verification: {
    google: GOOGLE_VERIFICATION_TOKEN,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CustomerPilot",
  },
  title: {
    default: "CustomerPilot — Autonomous WhatsApp Loyalty & Customer Retention SaaS",
    template: "%s | CustomerPilot"
  },
  description: "CustomerPilot is an autonomous AI customer retention platform for bakeries, restaurants, cafes, salons & retail. WhatsApp stamp cards, live queue check-ins, and 5-star Google review automation.",
  keywords: [
    "Customer Retention SaaS",
    "WhatsApp Loyalty Card",
    "Digital Stamp Card",
    "Google Review Automation",
    "Merchant Retention Platform",
    "AI Customer Pilot",
    "Bakery Loyalty System",
    "Restaurant Live Queue"
  ],
  authors: [{ name: "CustomerPilot Growth Team" }],
  creator: "CustomerPilot",
  publisher: "CustomerPilot",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CustomerPilot — Autonomous WhatsApp Loyalty & Retention SaaS",
    description: "Automate repeat visits, digital stamp cards, and Google review responses for your store without complex POS hardware.",
    url: baseUrl,
    siteName: "CustomerPilot",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "CustomerPilot Autonomous Merchant Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "CustomerPilot — Autonomous Retention SaaS",
    description: "WhatsApp Digital Stamp Cards & Google Review Automation for Merchants.",
    creator: "@customerpilot",
    images: [`${baseUrl}/og-image.png`]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { WhatsAppFloatingWidget } from "@/components/whatsapp-widget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <SoftwareApplicationJsonLd />
        <OrganizationJsonLd />
        {/* Google Tag (Google Analytics GA4 & Google Tag Manager) */}
        <script
          async
          src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
        />
        <script
          id="google-tag-manager"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GTM_ID}');
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${inter.className} font-sans antialiased bg-background text-foreground`}
      >
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Providers>
          {children}
          <WhatsAppFloatingWidget />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
