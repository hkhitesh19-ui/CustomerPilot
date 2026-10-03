import type { Metadata } from "next"
import { WhatsAppDigitalLoyaltyClient } from "@/components/whatsapp-digital-loyalty-client"
import { FAQPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "WhatsApp Digital Loyalty Card & Rewards Software",
  description: "Replace paper punch cards with CustomerPilot's automated WhatsApp loyalty program. Track digital stamps, send reward points, and increase retail walk-ins instantly.",
  keywords: [
    "WhatsApp loyalty program for retail",
    "Digital loyalty stamp card app",
    "Customer loyalty program software India",
    "Automated customer rewards system",
    "Digital punch card system kaise chalaye",
    "Shop ke liye digital loyalty card kaise banaye",
    "Grahak ko discount dene wala app",
  ],
  alternates: {
    canonical: "/whatsapp-digital-loyalty-card",
  },
  openGraph: {
    title: "WhatsApp Digital Loyalty Card & Rewards Software | CustomerPilot",
    description: "Replace paper punch cards with CustomerPilot's automated WhatsApp loyalty program. Track digital stamps, send reward points, and increase retail walk-ins instantly.",
    url: "https://customerpilot.in/whatsapp-digital-loyalty-card",
    type: "website",
  },
}

const FAQS = [
  {
    question: "Shop ke liye digital loyalty card kaise banaye?",
    answer: "CustomerPilot par signup karein, apni business details dalein, aur apna unique WhatsApp QR code generate karke counter par print karein. Grahak sirf ek scan me aapke loyalty club se jud jate hain."
  },
  {
    question: "Customer ko reward points dene wala software kaise set up karein?",
    answer: "Apne POS ya manual entry ke through points assign karein. CustomerPilot ka CRM automatically customer ke WhatsApp par digital stamps aur reward points update kar deta hai bina kisi app download ke."
  },
  {
    question: "Grahak ko discount aur points dene wala app kaunsa best hai?",
    answer: "Indian retail stores, cafes, salons, aur bakeries ke liye CustomerPilot sabse best hai kyunki ye without app download, direct WhatsApp par chalta hai aur 34%+ repeat walk-ins boost karta hai."
  },
  {
    question: "Do customers need to download an application to collect stamps?",
    answer: "No. Unlike Stamp Me or traditional loyalty apps that lose 80%+ customers at download, CustomerPilot operates 100% inside WhatsApp. Customers scan your counter QR and receive digital stamps instantly."
  },
  {
    question: "How does CustomerPilot prevent cashier fraud or duplicate stamp claims?",
    answer: "CustomerPilot includes configurable scan cooldown timers (e.g., 1 stamp per 24 hours), minimum bill validation, and secure cashier authorization PINs to completely eliminate staff cheating."
  }
]

export default function WhatsAppDigitalLoyaltyPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://customerpilot.in" },
          { name: "WhatsApp Digital Loyalty Card", url: "https://customerpilot.in/whatsapp-digital-loyalty-card" }
        ]}
      />
      <FAQPageJsonLd faqs={FAQS} />
      <WhatsAppDigitalLoyaltyClient />
    </>
  )
}
