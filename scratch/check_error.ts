import { db } from '../src/lib/db';

async function checkError() {
  const failedMsg = await db.whatsAppMessage.findFirst({
    where: { template: 'STAMP_AWARDED', status: 'failed' },
    orderBy: { createdAt: 'desc' }
  });
  console.log('Failed WhatsApp Message Detail:');
  console.log(JSON.stringify(failedMsg, null, 2));
}

checkError().catch(console.error);
