import type { Metadata } from "next";
import { AeLandingClient, AE_FAQS, AED_MONTHLY_PRICE } from "./AeLandingClient";

// Flip to false when ready for search indexing in UAE
export const AE_TEST_NOINDEX = true;

export const metadata: Metadata = {
  title: "CustomerPilot UAE | Policy-Safe AI Google Review System & Reply Drafts",
  description:
    "Free 14-Day Live Pilot for Dubai & Abu Dhabi clinics, salons, cafes, gyms, and auto detailing studios. Policy-safe Google review links with zero gating plus instant tailored AI reply drafts.",
  robots: AE_TEST_NOINDEX
    ? { index: false, follow: false }
    : { index: true, follow: true },
};

export default function AeLandingPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CustomerPilot UAE Pilot — Policy-Safe AI Google Review System",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Policy-safe Google review collection workflow and instant tailored AI reply drafts for UAE local service businesses in Dubai and Abu Dhabi.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "AED",
      description: `Free 14-Day Live Pilot, followed by optional ${AED_MONTHLY_PRICE}`,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: AE_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <AeLandingClient />
    </>
  );
}
