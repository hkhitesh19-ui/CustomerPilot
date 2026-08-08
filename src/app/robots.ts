import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://customerpilot.ai"

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/marketing",
          "/pricing",
          "/bakery-loyalty",
          "/cafe-loyalty",
          "/restaurant-loyalty",
          "/salon-loyalty",
          "/features/",
          "/compare/",
          "/help",
          "/privacy",
          "/terms",
          "/security",
          "/contact",
          "/signup",
          "/login",
          "/llms.txt",
        ],
        disallow: [
          "/api/",
          "/dashboard/",
          "/super-admin/",
          "/onboarding/",
          "/review",
          "/q/",
        ],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "Google-Extended", "AnthropicBot", "PerplexityBot", "ClaudeBot"],
        allow: [
          "/",
          "/marketing",
          "/pricing",
          "/bakery-loyalty",
          "/cafe-loyalty",
          "/restaurant-loyalty",
          "/salon-loyalty",
          "/features/",
          "/compare/",
          "/help",
          "/privacy",
          "/terms",
          "/security",
          "/contact",
          "/llms.txt",
        ],
        disallow: [
          "/api/",
          "/dashboard/",
          "/super-admin/",
          "/onboarding/",
          "/review",
          "/q/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
