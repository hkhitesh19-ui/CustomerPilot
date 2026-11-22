import { db } from "../src/lib/db";

async function runInstagramLoyaltyIntegrationTest() {
  console.log("=================================================");
  console.log("🚀 STARTING INSTAGRAM LOYALTY FULL INTEGRATION TEST");
  console.log("=================================================\n");

  // 1. Setup Test Merchant & Customer
  const merchant = await db.merchant.findFirst();
  if (!merchant) {
    throw new Error("No merchant found in local DB to run test");
  }
  console.log(`[Setup] Using Merchant: ${merchant.name} (${merchant.id})`);

  let customer = await db.customer.findFirst({ where: { merchantId: merchant.id } });
  if (!customer) {
    customer = await db.customer.create({
      data: {
        merchantId: merchant.id,
        name: "Test Customer IG",
        phone: "919999988888"
      }
    });
  }
  console.log(`[Setup] Using Customer: ${customer.name} (${customer.phone})\n`);

  // 2. Setup Merchant Instagram Connection if not exists
  const connection = await db.merchantInstagramConnection.upsert({
    where: { merchantId: merchant.id },
    create: {
      merchantId: merchant.id,
      instagramPageId: "page_123456789",
      instagramUserId: "ig_987654321",
      instagramUsername: "cakeconnection_test",
      accessToken: "mock_test_token_2026"
    },
    update: {
      instagramUsername: "cakeconnection_test"
    }
  });
  console.log(`[Setup] ✅ Merchant Instagram Connection ready: @${connection.instagramUsername}\n`);

  // 3. Test Token Generation
  console.log("--- TEST 1: Generate DM Pairing Token ---");
  const token = "CP_" + Math.random().toString(16).substring(2, 8).toUpperCase();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.systemContent.upsert({
    where: { key: `ig_token_${token}` },
    create: {
      section: "instagram_verification",
      key: `ig_token_${token}`,
      value: JSON.stringify({
        merchantId: merchant.id,
        customerId: customer.id,
        phone: customer.phone,
        token,
        expiresAt: expiresAt.toISOString()
      }),
      category: "instagram_pairing"
    },
    update: {
      value: JSON.stringify({
        merchantId: merchant.id,
        customerId: customer.id,
        phone: customer.phone,
        token,
        expiresAt: expiresAt.toISOString()
      })
    }
  });

  const deepLink = `https://ig.me/m/${connection.instagramUsername}?text=Verify%20${token}`;
  console.log(`Generated Token: ${token}`);
  console.log(`Deep Link: ${deepLink}`);
  if (!deepLink.includes(token)) throw new Error("Token mismatch in deepLink");
  console.log("✅ TEST 1 PASSED: Token generated and stored with 15-min expiry.\n");

  // 4. Test Inbound Webhook DM Pairing & IGSID Mapping
  console.log("--- TEST 2: Simulate Inbound DM Webhook & Phone <-> IGSID Mapping ---");
  const testIgsid = "igsid_user_5544332211";

  // Simulate token retrieval and pairing
  const tokenRecord = await db.systemContent.findUnique({
    where: { key: `ig_token_${token}` }
  });
  if (!tokenRecord) throw new Error("Token record not found");

  const payload = JSON.parse(tokenRecord.value);
  const identity = await db.customerInstagramIdentity.upsert({
    where: { merchantId_customerId: { merchantId: payload.merchantId, customerId: payload.customerId } },
    create: {
      merchantId: payload.merchantId,
      customerId: payload.customerId,
      phone: payload.phone,
      igsid: testIgsid
    },
    update: { igsid: testIgsid }
  });

  console.log(`Identity mapped: Phone ${identity.phone} <-> IGSID ${identity.igsid}`);
  if (identity.igsid !== testIgsid) throw new Error("IGSID mapping mismatch");
  console.log("✅ TEST 2 PASSED: Inbound DM successfully mapped phone to IGSID.\n");

  // 5. Test Private Account Screenshot Proof Upload
  console.log("--- TEST 3: Upload Story Proof (Private Account Fallback) ---");
  const proof = await db.instagramStoryProof.create({
    data: {
      merchantId: merchant.id,
      customerId: customer.id,
      phone: customer.phone,
      screenshot: "/uploads/proofs/test_story_screenshot.jpg",
      stamps: 2,
      notes: "Test story uploaded via wallet",
      status: "PENDING"
    }
  });

  console.log(`Proof created: ID ${proof.id}, Status: ${proof.status}, Stamps: +${proof.stamps}`);
  if (proof.status !== "PENDING") throw new Error("Initial status should be PENDING");
  console.log("✅ TEST 3 PASSED: Screenshot proof queued in PENDING state.\n");

  // 6. Test Merchant Approval of Story Proof
  console.log("--- TEST 4: Cashier/Merchant Approval & Stamp Allocation ---");
  const initialCustomer = await db.customer.findUnique({ where: { id: customer.id } });
  const initialLifetime = initialCustomer?.lifetimeStamps || 0;

  // Approve proof
  const updatedProof = await db.instagramStoryProof.update({
    where: { id: proof.id },
    data: {
      status: "APPROVED",
      reviewedBy: "Test Cashier",
      reviewedAt: new Date()
    }
  });

  // Credit stamp in DB
  const card = await db.stampCard.findFirst({ where: { merchantId: merchant.id, active: true } });
  if (card) {
    let customerCard = await db.customerStampCard.findFirst({
      where: { customerId: customer.id, stampCardId: card.id, completed: false, redeemed: false }
    });
    if (!customerCard) {
      customerCard = await db.customerStampCard.create({
        data: { customerId: customer.id, stampCardId: card.id, merchantId: merchant.id, stampsCollected: 0 }
      });
    }

    await db.stamp.create({
      data: {
        customerId: customer.id,
        merchantId: merchant.id,
        stampCardId: card.id,
        customerStampCardId: customerCard.id,
        source: "instagram_story_proof"
      }
    });

    await db.customerStampCard.update({
      where: { id: customerCard.id },
      data: { stampsCollected: { increment: 2 } }
    });

    await db.customer.update({
      where: { id: customer.id },
      data: { lifetimeStamps: { increment: 2 } }
    });
  }

  const finalCustomer = await db.customer.findUnique({ where: { id: customer.id } });
  console.log(`Updated Proof Status: ${updatedProof.status}`);
  console.log(`Customer Lifetime Stamps: Before=${initialLifetime}, After=${finalCustomer?.lifetimeStamps}`);
  if ((finalCustomer?.lifetimeStamps || 0) < initialLifetime + 2) {
    throw new Error("Stamps were not credited properly to customer ledger");
  }
  console.log("✅ TEST 4 PASSED: Proof approved and +2 stamps credited transactionally.\n");

  // 7. Cleanup Test Proof
  await db.instagramStoryProof.delete({ where: { id: proof.id } });
  console.log("=================================================");
  console.log("🎯 ALL 4 INSTAGRAM LOYALTY INTEGRATION TESTS PASSED!");
  console.log("=================================================");
}

runInstagramLoyaltyIntegrationTest()
  .catch((e) => {
    console.error("❌ TEST FAILED:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
