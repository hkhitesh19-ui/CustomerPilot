import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://customerpilot.ai"

  const routes = [
    "",
    "/marketing",
    "/bakery-loyalty",
    "/restaurant-loyalty",
    "/cafe-loyalty",
    "/salon-loyalty",
    "/features/whatsapp-stamp-card",
    "/features/google-review-automation",
    "/compare/vs-traditional-pos",
    "/help",
    "/join",
    "/login",
    "/register",
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/marketing" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/features") || route.endsWith("-loyalty") ? 0.9 : 0.7,
  }))
}
