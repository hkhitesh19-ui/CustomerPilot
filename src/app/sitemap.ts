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
    "/features/whatsapp-stamp-card",
    "/features/google-review-automation",
    "/case-studies/cake-connection",
    "/compare/vs-traditional-pos",
    "/vs/reelo",
    "/vs/birdeye",
    "/vs/bingage",
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
    priority: route === "" ? 1.0 : route.startsWith("/features") || route.endsWith("-loyalty") || route === "/pricing" ? 0.9 : 0.7,
  }))
}
