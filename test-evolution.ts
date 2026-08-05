import { POST } from "./src/app/api/webhook/evolution/route"
import { NextRequest } from "next/server"
import { db } from "./src/lib/db"

async function runWebhookTests() {
  console.log("=== Evolution Webhook E2E Testing ===")
  
  // Ensure we have a merchant
  let merchant = await db.merchant.findFirst()
  if (!merchant) {
    merchant = await db.merchant.create({
      data: { name: "Test Merchant", status: "active" }
    })
  }

  // Helper to construct a NextRequest mock
  const createMockRequest = (body: any, secret: string = "") => {
    return new NextRequest(`http://localhost:3000/api/webhook/evolution?secret=${secret}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
  }

  // Test 1: Invalid Secret (should fail if NODE_ENV=production, but we are in dev so it passes. Let's force NODE_ENV for test)
  (process.env as any).NODE_ENV = "production"
  process.env.EVOLUTION_WEBHOOK_SECRET = "supersecret"
  
  const req1 = createMockRequest({ event: "messages.upsert" }, "wrongsecret")
  const res1 = await POST(req1)
  console.log(`Test 1 (Invalid Secret): Status ${res1.status} (Expected 401)`)
  if (res1.status !== 401) throw new (Error as any)("Security verification failed")

  // Test 2: Valid Secret, Incoming Message
  const req2 = createMockRequest({
    event: "messages.upsert",
    instance: `merchant_${merchant.id}`,
    data: {
      messages: [{
        key: { fromMe: false, remoteJid: "919876543210@s.whatsapp.net", id: "msg_12345" },
        message: { conversation: "Hello!" }
      }]
    }
  }, "supersecret")
  
  const res2 = await POST(req2)
  console.log(`Test 2 (Incoming Msg): Status ${res2.status} (Expected 200)`)
  if (res2.status !== 200) throw new Error("Failed to process valid message")

  // Verify in DB
  let msgInDb = await db.whatsAppMessage.findFirst({ where: { metaMessageId: "msg_12345" } })
  if (!msgInDb || msgInDb.body !== "Hello!") throw new Error("Message not saved to DB properly")
  console.log("Test 2 (Incoming Msg): Verified in Database.")

  // Test 3: Idempotency (Same Message ID)
  const req3 = createMockRequest({
    event: "messages.upsert",
    instance: `merchant_${merchant.id}`,
    data: {
      messages: [{
        key: { fromMe: false, remoteJid: "919876543210@s.whatsapp.net", id: "msg_12345" },
        message: { conversation: "Hello Again! (Should be ignored)" }
      }]
    }
  }, "supersecret")
  await POST(req3)
  
  const duplicateCheck = await db.whatsAppMessage.count({ where: { metaMessageId: "msg_12345" } })
  console.log(`Test 3 (Idempotency): Found ${duplicateCheck} messages (Expected 1)`)
  if (duplicateCheck !== 1) throw new Error("Idempotency check failed")

  // Test 4: Message Status Update (Delivered)
  const req4 = createMockRequest({
    event: "messages.update",
    instance: `merchant_${merchant.id}`,
    data: [{
      key: { id: "msg_12345" },
      update: { status: 4 } // 4 = Delivered
    }]
  }, "supersecret")
  await POST(req4)
  
  msgInDb = await db.whatsAppMessage.findFirst({ where: { metaMessageId: "msg_12345" } })
  console.log(`Test 4 (Status Update): Status is ${msgInDb?.status} (Expected delivered)`)
  if (msgInDb?.status !== "delivered") throw new (Error as any)("Status update failed")

  // Restore NODE_ENV
  (process.env as any).NODE_ENV = "development"
  console.log("All webhook tests passed successfully.")
}

runWebhookTests().catch(e => {
  console.error("Test failed:", e)
  process.exit(1)
})
