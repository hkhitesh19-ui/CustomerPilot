import type { Metadata } from "next"
import { SmartDigitalBusinessCardClient } from "@/components/smart-digital-business-card-client"
import { FAQPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "Smart Digital Business Card — NFC QR vCard for Indian Shops | CustomerPilot",
  description: "Create a smart digital business card with NFC + QR code for your shop in India. 1-tap vCard save, WhatsApp connect, Google Reviews, and digital menu — all in one shareable link.",
  keywords: [
    "nfc business card india",
    "digital vcard qr india",
    "digital business card with qr code india",
    "smart digital visiting card india",
    "bio link qr code generator",
    "contactless digital business card",
    "smart digital business card software",
    "google review digital business card",
    "Dukan ke liye digital visiting card",
    "digital namecard whatsapp india",
  ],
  alternates: {
    canonical: "https://customerpilot.in/smart-digital-business-card",
  },
  openGraph: {
    title: "Smart Digital Business Card — NFC QR vCard India | CustomerPilot",
    description: "NFC + QR Code digital visiting card for Indian shops. 1-tap contact save, WhatsApp chat, Google Reviews, and digital menu — all in one smart card.",
    url: "https://customerpilot.in/smart-digital-business-card",
    type: "website",
  },
}

const DIGITAL_CARD_FAQS = [
  {
    question: "Dukan ya business ke liye digital visiting card kaise banaye?",
    answer: "CustomerPilot dashboard par jayein, apni dukan ka naam, phone number, Google Place ID, aur digital menu link enter karein. System 2 minute me aapka unique digital card aur printable QR code tayyar kar deta hai."
  },
  {
    question: "CustomerPilot digital card me kya kya features hote hain?",
    answer: "CustomerPilot digital card me 1-Tap Save Contact (VCF vCard), Direct Google Reviews submission modal, WhatsApp quick chat, Phone calling, Google Maps turn-by-turn navigation, and Online Ordering (Zomato/Swiggy/Menu) shamil hain."
  },
  {
    question: "Digital visiting card se Google Reviews kaise badhte hain?",
    answer: "Humara card Google ke official direct review modal (search.google.com/local/writereview?placeid=...) se judha hota hai. Customer ke tap karte hi seedha 5-star rating dialog khulta hai, jisse review conversion 5X ho jata hai."
  },
  {
    question: "Can I print the QR code on my counter QR displays, packaging boxes, and stickers?",
    answer: "Yes. CustomerPilot provides high-resolution printable QR codes in SVG and PNG formats, ready for counter QR codes, carry bags, delivery boxes, and custom cards."
  },
  {
    question: "What happens when I change my phone number or business hours?",
    answer: "Your card updates instantly in real-time on the cloud. You never need to re-print paper cards or re-distribute QR codes."
  }
]

export default function SmartDigitalBusinessCardPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://customerpilot.in" },
          { name: "Smart Digital Business Card", url: "https://customerpilot.in/smart-digital-business-card" }
        ]}
      />
      <FAQPageJsonLd faqs={DIGITAL_CARD_FAQS} />
      <SmartDigitalBusinessCardClient />
    </>
  )
}
