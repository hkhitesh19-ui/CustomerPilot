import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://customerpilot.in"

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
    "/for-business",
    "/help",
    "/signup",
    "/login",
    "/privacy",
    "/terms",
    "/security",
    "/contact",
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/marketing" || route === "/pricing" ? "daily" : "weekly",
    priority:
      route === ""
        ? 1.0
        : [
            "/whatsapp-digital-loyalty-card",
            "/smart-digital-business-card",
            "/ai-google-review-qr-generator",
            "/ai-google-review-autoreply",
            "/customerpilot-complete",
            "/pricing",
          ].includes(route) ||
          route.startsWith("/features") ||
          route.endsWith("-loyalty")
        ? 0.9
        : 0.7,
  }))
}
