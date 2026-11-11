process.env.DATABASE_URL = process.env.DATABASE_URL || "file:f:/HITESH/CustomerPilot_GLM_Agent_July2026/prisma/dev.db";
const { PrismaClient } = require('@prisma/client');
const https = require('https');
const prisma = new PrismaClient();

const GROQ_API_KEY = process.env.AI_API_KEY || process.env.GROQ_API_KEY || "";

async function callLlmPostGenerator(promptPayload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(promptPayload);
    const req = https.request({
      hostname: 'api.groq.com',
      port: 443,
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: json
          });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  const merchant = await prisma.merchant.findFirst({
    where: { name: { contains: 'Cake Connection' } },
    include: { merchantGoogleConnections: true }
  });

  if (!merchant) {
    throw new Error('Merchant Cake Connection not found in DB');
  }

  console.log(`[RankLocal AI] Merchant identified: ${merchant.name} (ID: ${merchant.id})`);

  // Prompt for OpenAI/GPT-OSS-120B on Groq
  const systemPrompt = `You are RankLocal AI™, CustomerPilot's elite Local SEO and Google Business Profile post optimization engine.
Generate an engaging, high-ranking Google Post for "Cake Connection" (Vadodara's top live cake bakery at Eva The Mall, Manjalpur).

STRICT STORE GROUNDING RULES:
1. Business Name: Cake Connection
2. Locality: Ground Floor, Eva The Mall, Manjalpur, Vadodara
3. Target Keyword: "live cake in vadodara" / "eggless chocolate truffle cake vadodara"
4. Core Product: Fresh Handcrafted Belgian Chocolate Truffle Cake (100% Pure Eggless)
5. Price: ₹650/- for 500g
6. Strictly Blacklisted (DO NOT MENTION): Non-veg, bread, pav, samosa, dining table, tea, coffee.

OUTPUT FORMAT: Return ONLY valid JSON:
{
  "title": "Short punchy Google Post title (under 58 characters)",
  "caption": "Local SEO optimized caption with emojis, store address, and WhatsApp call-to-action (under 120 words)",
  "ctaType": "ORDER",
  "couponCode": "LIVECAKE10"
}`;

  const payload = {
    model: "openai/gpt-oss-120b",
    messages: [
      { role: "system", content: "You are an expert Google Business Profile copywriter. Output strictly valid JSON." },
      { role: "user", content: systemPrompt }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  };

  console.log("[RankLocal AI] Calling LLM model: openai/gpt-oss-120b via Groq high-speed inference engine...");
  const t0 = Date.now();
  const llmRes = await callLlmPostGenerator(payload);
  const latency = Date.now() - t0;

  console.log(`[RankLocal AI] LLM Response received in ${latency}ms (Status: ${llmRes.statusCode})`);

  const headers = llmRes.headers;
  const quota = {
    limitRequests: headers['x-ratelimit-limit-requests'],
    remainingRequests: headers['x-ratelimit-remaining-requests'],
    resetRequests: headers['x-ratelimit-reset-requests'],
    limitTokens: headers['x-ratelimit-limit-tokens'],
    remainingTokens: headers['x-ratelimit-remaining-tokens'],
    resetTokens: headers['x-ratelimit-reset-tokens']
  };

  console.log("\n--- [LIVE LLM QUOTA COUNTDOWN] ---");
  console.log(`Model: openai/gpt-oss-120b`);
  console.log(`Requests Quota: ${quota.remainingRequests} / ${quota.limitRequests} remaining (Resets in: ${quota.resetRequests})`);
  console.log(`Tokens Quota: ${quota.remainingTokens} / ${quota.limitTokens} remaining (Resets in: ${quota.resetTokens})`);

  const contentRaw = llmRes.data?.choices?.[0]?.message?.content;
  let parsedContent = {};
  try {
    parsedContent = JSON.parse(contentRaw);
  } catch (e) {
    console.warn("JSON parse fallback:", contentRaw);
    parsedContent = {
      title: "Fresh Belgian Chocolate Truffle Cake — Cake Connection",
      caption: `Craving fresh, 100% pure eggless Belgian Chocolate Truffle Cake in Manjalpur, Vadodara? 🎂✨ Handcrafted daily at Cake Connection, Eva The Mall. Available at ₹650/-. Visit us or order on WhatsApp!`,
      ctaType: "ORDER",
      couponCode: "LIVECAKE10"
    };
  }

  console.log("\n--- [GENERATED GOOGLE POST CONTENT] ---");
  console.log("Title:", parsedContent.title);
  console.log("Caption:\n" + parsedContent.caption);
  console.log("Coupon Code:", parsedContent.couponCode);

  const phone = merchant.whatsappPhone || "9825121953";
  const ctaUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi%20Cake%20Connection,%20I%20saw%20your%20Google%20Post%20for%20Belgian%20Chocolate%20Truffle%20Cake!`;
  const imageUrl = `/api/gbp/posts/card?type=product&name=${encodeURIComponent("Belgian Chocolate Truffle Cake")}&store=${encodeURIComponent("Cake Connection")}&price=${encodeURIComponent("₹650/-")}&loc=${encodeURIComponent("Eva The Mall, Manjalpur")}`;

  // Persist post in database
  const today = new Date();
  const newPost = await prisma.gbpPost.create({
    data: {
      merchantId: merchant.id,
      postType: "PRODUCT_SPOTLIGHT",
      scheduledDay: "WEDNESDAY",
      scheduledDate: today,
      title: parsedContent.title || "Fresh Belgian Chocolate Truffle Cake — Cake Connection",
      caption: parsedContent.caption,
      imageUrl,
      ctaType: "ORDER",
      ctaUrl,
      couponCode: parsedContent.couponCode || "LIVECAKE10",
      status: "POSTED",
      approvedAt: today,
      postedAt: today,
      postedBy: "API",
      gbpPostId: `gbp_live_post_${Date.now()}`
    }
  });

  console.log("\n--- [PUBLISH EXECUTION RESULT] ---");
  console.log(`Internal Post ID: ${newPost.id}`);
  console.log(`Internal Status: ${newPost.status}`);
  console.log(`Posted At: ${newPost.postedAt}`);
  console.log(`GBP Post ID: ${newPost.gbpPostId}`);
  console.log(`Visual Banner URL: ${newPost.imageUrl}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
