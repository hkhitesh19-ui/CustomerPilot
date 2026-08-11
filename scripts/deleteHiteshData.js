const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const customerPhone = '919033304707';

  const customer = await prisma.customer.findFirst({
    where: { phone: customerPhone }
  });

  if (!customer) {
    console.log(`Customer with phone ${customerPhone} not found.`);
    return;
  }

  const customerId = customer.id;
  console.log(`Found Customer Hitesh (ID: ${customerId}). Proceeding with deletion...`);

  const modelsToClean = [
    'waitingCustomer',
    'achievement',
    'winBackEscalation',
    'birthdaysList',
    'review',
    'whatsAppMessage',
    'referral',
    'bill',
    'stamp',
    'customerStampCard',
  ];

  for (const model of modelsToClean) {
    if (prisma[model]) {
      try {
        let count = 0;
        if (model === 'referral') {
          const res = await prisma.referral.deleteMany({
            where: {
              OR: [{ referrerId: customerId }, { friendCustomerId: customerId }]
            }
          });
          count = res.count;
        } else if (model === 'whatsAppMessage') {
          const res = await prisma.whatsAppMessage.deleteMany({
            where: { toPhone: customerPhone }
          });
          count = res.count;
        } else if (model === 'birthdaysList') {
          // just in case model name differs
          const bModel = prisma.birthdaysList || prisma.birthdayList;
          if (bModel) {
            const res = await bModel.deleteMany({
              where: { customerId: customerId }
            });
            count = res.count;
          }
        } else {
          const res = await prisma[model].deleteMany({
            where: { customerId: customerId }
          });
          count = res.count;
        }
        console.log(`Deleted ${count} records from ${model}.`);
      } catch (err) {
        console.log(`Error deleting from ${model}: ${err.message}`);
      }
    }
  }

  // Finally delete the Customer
  await prisma.customer.delete({
    where: { id: customerId }
  });
  console.log(`Deleted Customer Hitesh successfully.`);
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
