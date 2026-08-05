import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://customerpilot.ai"

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/marketing", "/join", "/login", "/register", "/llms.txt"],
        disallow: ["/api/", "/dashboard/", "/super-admin/"],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "Google-Extended", "AnthropicBot", "PerplexityBot", "ClaudeBot"],
        allow: ["/", "/marketing", "/join", "/llms.txt"],
        disallow: ["/api/", "/dashboard/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
