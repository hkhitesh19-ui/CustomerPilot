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
    "/whatsapp-digital-loyalty-card",
    "/smart-digital-business-card",
    "/ai-google-review-qr-generator",
    "/smart-ai-google-review",
    "/free-ai-google-review-generator",
    "/ai-google-review-autoreply",
    "/customerpilot-complete",
    "/customerpilot-vs-stamp-me",
    "/features/",
    "/compare/",
    "/vs/",
    "/industry/",
    "/alternatives/",
    "/case-studies/",
    "/guide/",
    "/c/",
    "/roi-calculator",
    "/for-business",
    "/help",
    "/privacy",
    "/terms",
    "/security",
    "/contact",
    "/signup",
    "/register",
    "/login",
    "/llms.txt",
    "/sitemap.xml",
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

