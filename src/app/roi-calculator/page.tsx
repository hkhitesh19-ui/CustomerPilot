import type { Metadata } from "next"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"
import { RoiCalculatorClient } from "@/components/roi-calculator-client"

export const metadata: Metadata = {
  title: "Live ROI Calculator for Loyalty Program | CustomerPilot",
  description:
    "Calculate your exact return on investment with CustomerPilot's loyalty program. Enter your customers/day, average bill, and repeat rate — get live projections for extra sales, referrals, and Google review impact.",
  keywords: [
    "loyalty program ROI calculator",
    "customer retention ROI India",
    "repeat customer calculator",
    "bakery loyalty ROI",
    "restaurant loyalty program return",
    "CustomerPilot ROI",
    "WhatsApp loyalty stamp card ROI",
    "how much can I earn with loyalty program",
  ],
  alternates: {
    canonical: "https://customerpilot.in/roi-calculator",
  },
  openGraph: {
    title: "Live ROI Calculator — How Much Can a Loyalty Program Earn You?",
    description:
      "Enter your business numbers and instantly see your projected extra sales, repeat customer growth, and profit opportunity with CustomerPilot.",
    url: "https://customerpilot.in/roi-calculator",
    type: "website",
  },
}

const ROI_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://customerpilot.in/roi-calculator#app",
      name: "CustomerPilot Live ROI Calculator",
      url: "https://customerpilot.in/roi-calculator",
      applicationCategory: "BusinessApplication",
      operatingSystem: "All (Web Browser)",
      description:
        "Interactive ROI calculator for Indian retail businesses to estimate extra sales, repeat customer uplift, referral revenue and Google review impact from a WhatsApp loyalty stamp card program.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How does the CustomerPilot ROI Calculator work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Enter your customers per day, average bill, current repeat rate, and loyalty reward details. The calculator instantly projects how many lost customers you can recover, the extra sales per year, reward costs, referral revenue, Google review impact, and your net profit opportunity — all live, as you type.",
          },
        },
        {
          "@type": "Question",
          name: "How many extra customers can a loyalty program bring back?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "CustomerPilot's WhatsApp-based loyalty program typically helps Indian retail businesses recover 20–35% of customers who previously didn't return. For a business with 30 customers per day and 50% repeat rate, winning back just 30% of lapsed customers can generate ₹2–5 lakh extra sales per year.",
          },
        },
        {
          "@type": "Question",
          name: "Is the ROI calculation accurate for Indian bakeries, restaurants, and salons?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The calculator uses standard Indian retail assumptions — ₹300 average bill, 30 customers/day, 50% current repeat rate. All numbers are editable so bakeries, cafes, salons, and restaurants can enter their real figures for accurate projections.",
          },
        },
      ],
    },
  ],
}

export default function RoiCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(ROI_SCHEMA).replace(/</g, "\\u003c"),
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://customerpilot.in" },
          { name: "ROI Calculator", url: "https://customerpilot.in/roi-calculator" },
        ]}
      />
      <RoiCalculatorClient />
    </>
  )
}
