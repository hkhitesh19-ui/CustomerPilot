import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Prevent MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer policy
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Permissions policy — explicitly deny unused APIs
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // HSTS — 1 year (production standard; covers subdomains)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  // Content Security Policy — tightened after full browser-vs-server domain audit
  {
    key: "Content-Security-Policy",
    value: [
      // Default: only self
      "default-src 'self'",
      // Scripts: self + Next.js inline hydration + Razorpay checkout modal
      // Note: 'unsafe-eval' required for Next.js dev mode; consider removing in prod
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
      // Styles: self + inline (Next.js CSS-in-JS) + Google Fonts CSS
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts: Google Fonts static assets only
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + data URIs (base64) + blob URIs (file previews) + known CDNs only
      // Removed broad 'https:' — only allow our own domain and known image hosts
      "img-src 'self' data: blob: https://lh3.googleusercontent.com https://customerpilot.ai",
      // Fetch/XHR: self + Razorpay checkout API (payment initiation from browser)
      // Note: all googleapis.com calls (OAuth, GBP, Places) are SERVER-SIDE — not needed here
      "connect-src 'self' https://checkout.razorpay.com https://api.razorpay.com",
      // Frames: Razorpay payment modal only
      "frame-src https://checkout.razorpay.com",
      // Plugins: blocked entirely
      "object-src 'none'",
      // Restrict base URL to prevent base-tag injection
      "base-uri 'self'",
      // Block form submissions to external domains
      "form-action 'self'",
      // No web workers or service workers (app doesn't use them)
      "worker-src 'none'",
      // PWA manifest
      "manifest-src 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.0.200:3001", "192.168.0.200", "localhost:3001", "localhost:3000"],
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

