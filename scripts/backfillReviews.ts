import { db } from '../src/lib/db';
import { scheduleGoogleReviewRequest } from '../src/lib/review-scheduler';

async function backfillReviews() {
  console.log('Starting Google Review Backfill...');
  
  // Find all customers with at least one confirmed/paid bill
  const customers = await db.customer.findMany({
    where: {
      bills: {
        some: { status: { in: ['paid', 'confirmed'] } }
      },
      whatsappOptIn: true
    }
  });

  console.log(`Found ${customers.length} customers with approved purchases.`);

  let triggeredCount = 0;
  let skippedCount = 0;

  for (const customer of customers) {
    if (!customer.phone) continue;
    
    try {
      // The scheduleGoogleReviewRequest function natively checks for:
      // 1. Existing review
      // 2. Pending review_request message
      const res = await scheduleGoogleReviewRequest({
        merchantId: customer.merchantId,
        customerId: customer.id
      });
      
      if (res.scheduled) {
        console.log(`✅ Scheduled for ${customer.name} (${customer.phone})`);
        triggeredCount++;
      } else {
        console.log(`⏭️ Skipped ${customer.name}: ${res.reason}`);
        skippedCount++;
      }
    } catch (e) {
      console.error(`❌ Error scheduling for ${customer.name}:`, e);
    }
  }

  console.log('-------------------------');
  console.log(`Backfill Complete! Triggered: ${triggeredCount}, Skipped: ${skippedCount}`);
}

backfillReviews().finally(() => db.$disconnect());
