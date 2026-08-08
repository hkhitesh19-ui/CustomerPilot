import React from "react"

export function SoftwareApplicationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CustomerPilot",
    "operatingSystem": "All",
    "applicationCategory": "BusinessApplication",
    "description": "Autonomous Merchant Customer Retention SaaS powering WhatsApp stamp cards, Google Review automation, and live queue check-ins.",
    "offers": {
      "@type": "Offer",
      "price": "2999",
      "priceCurrency": "INR",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CustomerPilot Inc.",
    "url": "https://customerpilot.ai",
    "logo": "https://customerpilot.ai/cplogo_horizontal.png",
    "sameAs": [
      "https://twitter.com/customerpilot",
      "https://linkedin.com/company/customerpilot"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@customerpilot.ai",
      "contactType": "customer service"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQPageJsonLd({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
