import type { Metadata } from "next"
import { RestaurantLoyaltyClient } from "@/components/restaurant-loyalty-client"

export const metadata: Metadata = {
  title: "Restaurant Loyalty Program WhatsApp & Google Review Automation — CustomerPilot",
  description: "Eliminate 25% Zomato/Swiggy commissions, own 100% customer data, and convert dine-in guests into repeat buyers with table QR codes and automated 5-star Google reviews.",
  keywords: [
    "google review automation for restaurant in india",
    "whatsapp loyalty program for punjabi gujarati restaurant",
    "how to increase repeat customers in restaurant without app",
    "customer retention software for south indian kathiyawadi restaurant",
    "restaurant customer retention software india",
    "table qr code loyalty",
    "diner rewards whatsapp"
  ],
  alternates: {
    canonical: "/restaurant-loyalty",
  },
  openGraph: {
    title: "Restaurant WhatsApp Loyalty & Google Review Automation — CustomerPilot",
    description: "Convert walk-in diners into repeat customers with digital WhatsApp stamp cards and collect 5-star Google reviews post-dining.",
    url: "https://customerpilot.in/restaurant-loyalty",
  },
}

export default function RestaurantLoyaltyPage() {
  return <RestaurantLoyaltyClient />
}
