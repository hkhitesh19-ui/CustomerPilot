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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://customerpilot.ai";

export const viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  manifest: "/manifest.json",
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
  creator: "CustomerPilot Inc.",
  publisher: "CustomerPilot SaaS",
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
      </head>
      <body
        className={`${inter.variable} ${inter.className} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <WhatsAppFloatingWidget />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
