import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Evolution API / WhatsApp Webhook Payload Simulator
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Log for debugging
    console.log("================= WHATSAPP WEBHOOK RECEIVED =================\n", JSON.stringify(payload, null, 2));

    // Handle Evolution API structure (simplified for prototype)
    // Structure: payload.data.message OR payload.message
    const messageData = payload.data?.message || payload.message || payload;
    let text = '';
    if (typeof messageData === 'string') {
      text = messageData;
    } else {
      text = messageData?.extendedTextMessage?.text || messageData?.text || messageData?.body || '';
    }
    const fromPhone = messageData?.key?.remoteJid?.split('@')[0] || messageData?.from || payload.fromPhone;
    
    // Pass the merchantId in the webhook URL or extract from the number
    // For this prototype, we'll accept merchantId in the payload if provided, 
    // or fallback to the first active merchant.
    let merchantId = payload.merchantId;
    if (!merchantId) {
      const firstMerchant = await db.merchant.findFirst();
      merchantId = firstMerchant?.id;
    }

    if (!merchantId || !fromPhone || !text) {
      return NextResponse.json({ success: false, error: 'Missing essential data' }, { status: 400 });
    }

    // SCENARIO 1: Customer scans QR code (wa.me link text)
    if (text.toLowerCase().includes('join cake connection vip club') || text.toLowerCase().includes('join')) {
      // 1. Find or create Customer
      let customer = await db.customer.findFirst({
        where: { merchantId, phone: fromPhone }
      });

      if (!customer) {
        // Attempt to extract name from pushName if available, else default to 'Guest'
        const pushName = messageData?.pushName || payload.pushName || 'Guest';
        customer = await db.customer.create({
          data: {
            merchantId,
            phone: fromPhone,
            name: pushName,
            whatsappOptIn: true
          }
        });
        console.log(`[WHATSAPP] Created new customer: ${customer.name} (${fromPhone})`);
      }

      // Simulate sending back the Interactive Message via Evolution API
      console.log(`[EVOLUTION API MOCK] Sending to ${fromPhone}:`);
      console.log(`"🎉 You're invited to join the VIP Club. Is your name ${customer.name}?" [Yes] / [Edit]`);
      
      return NextResponse.json({ success: true, action: 'join_prompt_sent' });
    }

    // SCENARIO 2: Customer confirms name (e.g., clicks "Yes" or types "Yes")
    if (text.toLowerCase() === 'yes' || text.toLowerCase() === 'confirm') {
      const customer = await db.customer.findFirst({
        where: { merchantId, phone: fromPhone }
      });

      if (!customer) {
        return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
      }

      // Add to WaitingCustomer Live Queue
      // First check if they are already in the queue to avoid duplicates
      const existingWait = await db.waitingCustomer.findFirst({
        where: { merchantId, customerId: customer.id, status: 'waiting' }
      });

      if (!existingWait) {
        await db.waitingCustomer.create({
          data: {
            merchantId,
            customerId: customer.id,
            status: 'waiting',
            scanSource: 'QR',
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // Expires in 2 hours
          }
        });
        console.log(`[WHATSAPP] Added ${customer.name} to Live Queue!`);
      }

      return NextResponse.json({ success: true, action: 'added_to_queue' });
    }

    // SCENARIO 3: Customer edits name
    if (text.toLowerCase().startsWith('name is ') || text.toLowerCase().startsWith('my name is ')) {
      const newName = text.replace(/name is /i, '').replace(/my name is /i, '').trim();
      
      const customer = await db.customer.findFirst({
        where: { merchantId, phone: fromPhone }
      });

      if (customer) {
        await db.customer.update({
          where: { id: customer.id },
          data: { name: newName }
        });

        // Add to queue
        const existingWait = await db.waitingCustomer.findFirst({
          where: { merchantId, customerId: customer.id, status: 'waiting' }
        });

        if (!existingWait) {
          await db.waitingCustomer.create({
            data: {
              merchantId,
              customerId: customer.id,
              status: 'waiting',
              scanSource: 'QR',
              expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
            }
          });
        }
        
        console.log(`[WHATSAPP] Updated name to ${newName} and added to Live Queue!`);
      }
      return NextResponse.json({ success: true, action: 'name_updated_and_queued' });
    }

    return NextResponse.json({ success: true, action: 'ignored' });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
