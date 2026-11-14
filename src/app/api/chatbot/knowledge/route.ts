import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedMerchant } from "@/lib/api"
import { db } from "@/lib/db"

// Default Knowledge Base items for Cake Connection & local retail
const DEFAULT_KNOWLEDGE = [
  {
    id: "kb-1",
    category: "Store Timings & Location",
    question: "What are your shop opening and closing hours?",
    answer: "We are open Monday to Sunday from 10:00 AM to 10:30 PM. We are open on all public holidays.",
    status: "APPROVED"
  },
  {
    id: "kb-2",
    category: "Store Timings & Location",
    question: "Where is your store located?",
    answer: "We are located at Ground Floor, Alkapuri Arcade, Near Railway Station, Alkapuri, Vadodara, Gujarat 390007.",
    status: "APPROVED"
  },
  {
    id: "kb-3",
    category: "Delivery & Ordering",
    question: "Do you deliver cakes to home?",
    answer: "Yes, we provide same-day doorstep cake delivery across Vadodara within 5 km radius. Free delivery on orders above Rs 500.",
    status: "APPROVED"
  },
  {
    id: "kb-4",
    category: "Product & Pricing",
    question: "What are your cake sizes and starting prices?",
    answer: "Our 500g cakes start from Rs 350 (Pineapple) and Rs 380 (Black Forest). 1 kg Special Chocolate Truffle Cake is Rs 650. Custom photo cakes start from Rs 750/kg.",
    status: "APPROVED"
  },
  {
    id: "kb-5",
    category: "Customization & Flavors",
    question: "Are your cakes 100% eggless?",
    answer: "Yes! All our cakes and pastries are 100% pure vegetarian (eggless) and freshly baked daily.",
    status: "APPROVED"
  },
  {
    id: "kb-6",
    category: "Payments",
    question: "What payment methods do you accept?",
    answer: "We accept Cash, all UPI apps (Google Pay, PhonePe, Paytm), and Credit/Debit Cards.",
    status: "APPROVED"
  }
]

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      knowledge: DEFAULT_KNOWLEDGE,
      totalItems: DEFAULT_KNOWLEDGE.length,
      publishedVersion: "v1.2",
      lastPublishedAt: "14 Nov 2026, 08:30 AM"
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch knowledge base" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { question, answer, category } = body

    if (!question || !answer) {
      return NextResponse.json({ error: "Question and Answer are required" }, { status: 400 })
    }

    const newItem = {
      id: `kb-${Date.now()}`,
      category: category || "General FAQ",
      question: question.trim(),
      answer: answer.trim(),
      status: "APPROVED"
    }

    return NextResponse.json({
      success: true,
      item: newItem,
      message: "Knowledge base item added and approved"
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to add knowledge item" }, { status: 500 })
  }
}
