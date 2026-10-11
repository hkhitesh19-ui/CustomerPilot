import { MetadataRoute } from "next"

const DIGITAL_CARD_ROUTES = [
  "/c/cake-connection",
  "/c/gujarat-photo-goods",
  "/c/tasty-vadapav",
  "/c/tasty-vadapav-atladara",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://customerpilot.in"
  const now = new Date()

  const routes = [
    "",
    "/marketing",
    "/pricing",
    "/bakery-loyalty",
    "/restaurant-loyalty",
    "/cafe-loyalty",
    "/salon-loyalty",
    "/fastfood-loyalty",
    "/car-wash-loyalty",
    "/whatsapp-digital-loyalty-card",
    "/smart-digital-business-card",
    "/ai-google-review-qr-generator",
    "/smart-ai-google-review",
    "/free-ai-google-review-generator",
    "/ai-google-review-autoreply",
    "/customerpilot-complete",
    "/features/whatsapp-stamp-card",
    "/features/google-review-automation",
    "/case-studies/cake-connection",
    "/compare/vs-traditional-pos",
    "/vs/reelo",
    "/vs/birdeye",
    "/vs/bingage",
    "/vs/stamp-me",
    "/customerpilot-vs-stamp-me",
    // Industry-specific programmatic SEO pages
    "/industry/cafe-loyalty-program",
    "/industry/salon-loyalty-program",
    "/industry/restaurant-loyalty-program",
    "/industry/bakery-loyalty-program",
    "/industry/dental-clinic-loyalty-program",
    // Competitor alternatives pages
    "/alternatives/stamp-me",
    // Setup & Operations Guides
    "/guide/5-minute-setup-guide",
    "/guide/operations",
    // Official Live Smart Digital Business Cards
    ...DIGITAL_CARD_ROUTES,
    // Tools & Business Pages
    "/roi-calculator",
    "/for-business",
    "/help",
    "/signup",
    "/register",
    "/login",
    "/privacy",
    "/terms",
    "/security",
    "/contact",
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency:
      route === "" || route === "/marketing" || route === "/pricing"
        ? "daily"
        : "weekly",
    priority:
      route === ""
        ? 1.0
        : [
            "/whatsapp-digital-loyalty-card",
            "/smart-digital-business-card",
            "/ai-google-review-qr-generator",
            "/smart-ai-google-review",
            "/free-ai-google-review-generator",
            "/ai-google-review-autoreply",
            "/customerpilot-complete",
            "/pricing",
            "/roi-calculator",
          ].includes(route) ||
          route.startsWith("/features") ||
          route.endsWith("-loyalty")
        ? 0.9
        : route.startsWith("/industry/") ||
          route.startsWith("/alternatives/") ||
          route.startsWith("/guide/") ||
          route.startsWith("/c/") ||
          route === "/customerpilot-vs-stamp-me"
        ? 0.8
        : 0.7,
  }))
}


