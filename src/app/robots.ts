import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://customerpilot.in"

  const publicAllowedRoutes = [
    "/",
    "/marketing",
    "/pricing",
    "/bakery-loyalty",
    "/cafe-loyalty",
    "/restaurant-loyalty",
    "/salon-loyalty",
    "/fastfood-loyalty",
    "/car-wash-loyalty",
    "/features/",
    "/compare/",
    "/vs/",
    "/case-studies/",
    "/for-business",
    "/help",
    "/privacy",
    "/terms",
    "/security",
    "/contact",
    "/signup",
    "/login",
    "/llms.txt",
  ]

  const privateDisallowedRoutes = [
    "/api/",
    "/dashboard/",
    "/super-admin/",
    "/onboarding/",
    "/review",
    "/q/",
  ]

  return {
    rules: [
      {
        userAgent: "*",
        allow: publicAllowedRoutes,
        disallow: privateDisallowedRoutes,
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "Google-Extended", "AnthropicBot", "PerplexityBot", "ClaudeBot"],
        allow: publicAllowedRoutes,
        disallow: privateDisallowedRoutes,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
