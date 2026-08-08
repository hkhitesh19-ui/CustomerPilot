import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://customerpilot.ai"

  const routes = [
    "",
    "/marketing",
    "/pricing",
    "/bakery-loyalty",
    "/restaurant-loyalty",
    "/cafe-loyalty",
    "/salon-loyalty",
    "/features/whatsapp-stamp-card",
    "/features/google-review-automation",
    "/compare/vs-traditional-pos",
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
