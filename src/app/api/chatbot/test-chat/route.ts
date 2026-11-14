import { NextRequest, NextResponse } from "next/server"

interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const query = message.trim().toLowerCase()

    // 1. Hard Prohibitions Check (PRD v2.0 Section 2.4 Rule 11 & Section 2.9.1)
    // Never issue, modify or approve loyalty stamps, rewards, tiers, bonus stamps, or Live Queue entries
    if (
      query.includes("stamp") ||
      query.includes("add stamp") ||
      query.includes("reward") ||
      query.includes("give reward") ||
      query.includes("bonus")
    ) {
      return NextResponse.json({
        success: true,
        reply: "Loyalty stamps and rewards can only be verified and issued in-person at our cash counter upon showing your physical bill. Our store manager will gladly stamp your digital card at checkout!",
        intent: "loyalty_inquiry",
        evidenceIds: ["policy-hard-prohibition"],
        needsHuman: false
      })
    }

    // 2. Knowledge Grounding Engine
    // Check Timings
    if (
      query.includes("time") ||
      query.includes("timing") ||
      query.includes("open") ||
      query.includes("close") ||
      query.includes("kitne baje") ||
      query.includes("band") ||
      query.includes("chalu") ||
      query.includes("hours")
    ) {
      return NextResponse.json({
        success: true,
        reply: "We are open Monday to Sunday from 10:00 AM to 10:30 PM. We are open on all 7 days including public holidays! Would you like to place a pickup or delivery order?",
        intent: "store_timings",
        evidenceIds: ["kb-1: Store Timings"],
        needsHuman: false
      })
    }

    // Check Location / Address
    if (
      query.includes("location") ||
      query.includes("address") ||
      query.includes("kaha") ||
      query.includes("where") ||
      query.includes("near") ||
      query.includes("reach") ||
      query.includes("map")
    ) {
      return NextResponse.json({
        success: true,
        reply: "Our store is located at Ground Floor, Alkapuri Arcade, Near Railway Station, Alkapuri, Vadodara, Gujarat 390007. We look forward to your visit!",
        intent: "store_location",
        evidenceIds: ["kb-2: Store Location"],
        needsHuman: false
      })
    }

    // Check Delivery
    if (
      query.includes("deliver") ||
      query.includes("home delivery") ||
      query.includes("delivery milega") ||
      query.includes("swiggy") ||
      query.includes("zomato") ||
      query.includes("doorstep")
    ) {
      return NextResponse.json({
        success: true,
        reply: "Yes, we provide same-day doorstep cake delivery across Vadodara within a 5 km radius! Delivery is completely free on orders above Rs 500. Please let me know your delivery address or flavor preference.",
        intent: "delivery_inquiry",
        evidenceIds: ["kb-3: Home Delivery"],
        needsHuman: false
      })
    }

    // Check Cake Price / Flavors / Products
    if (
      query.includes("price") ||
      query.includes("rate") ||
      query.includes("cost") ||
      query.includes("menu") ||
      query.includes("kitne ka") ||
      query.includes("truffle") ||
      query.includes("chocolate") ||
      query.includes("black forest") ||
      query.includes("cake") ||
      query.includes("pastry")
    ) {
      return NextResponse.json({
        success: true,
        reply: "Here are our popular freshly-baked eggless cakes:\n• 1 kg Special Chocolate Truffle Cake: Rs 650\n• 500g Black Forest Cake: Rs 380\n• 500g Pineapple Delight Cake: Rs 350\n• Red Velvet Pastry: Rs 90\n• Custom Photo Cakes: Rs 750/kg\nAll cakes are 100% pure vegetarian. What flavor would you like?",
        intent: "product_pricing",
        evidenceIds: ["kb-4: Product & Pricing"],
        needsHuman: false
      })
    }

    // Check Eggless / Pure Veg
    if (
      query.includes("egg") ||
      query.includes("eggless") ||
      query.includes("veg") ||
      query.includes("vegetarian") ||
      query.includes("jain")
    ) {
      return NextResponse.json({
        success: true,
        reply: "Yes, 100%! All our cakes, pastries, and bakery items are 100% pure vegetarian (eggless) and baked fresh every morning in a clean, hygienic facility.",
        intent: "dietary_inquiry",
        evidenceIds: ["kb-5: 100% Eggless"],
        needsHuman: false
      })
    }

    // Check Payment Options
    if (
      query.includes("pay") ||
      query.includes("payment") ||
      query.includes("upi") ||
      query.includes("gpay") ||
      query.includes("phonepe") ||
      query.includes("card") ||
      query.includes("cash")
    ) {
      return NextResponse.json({
        success: true,
        reply: "We accept Cash, all UPI apps (Google Pay, PhonePe, Paytm, BHIM), and Credit/Debit Cards at our counter.",
        intent: "payment_options",
        evidenceIds: ["kb-6: Payment Methods"],
        needsHuman: false
      })
    }

    // Check Human / Manager Request
    if (
      query.includes("human") ||
      query.includes("agent") ||
      query.includes("manager") ||
      query.includes("call") ||
      query.includes("talk to") ||
      query.includes("baat karni") ||
      query.includes("person")
    ) {
      return NextResponse.json({
        success: true,
        reply: "Sure! I have paused automated replies and notified our store manager. You can also reach our manager directly on WhatsApp at +91 7203824012.",
        intent: "human_handover",
        evidenceIds: ["policy-handover"],
        needsHuman: true
      })
    }

    // Fallback for unconfirmed queries
    return NextResponse.json({
      success: true,
      reply: "I don't have confirmed information for that specific query in our store knowledge base. Would you like me to connect you directly with our store manager on WhatsApp?",
      intent: "unconfirmed_fallback",
      evidenceIds: ["policy-fallback"],
      needsHuman: true
    })
  } catch (err: any) {
    console.error("[Chatbot Test-Chat Error]:", err)
    return NextResponse.json({ error: "Failed to generate reply" }, { status: 500 })
  }
}
