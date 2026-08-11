const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const template = await prisma.messageTemplate.findFirst({
    where: { templateKey: 'STAMP_EARNED', merchantId: null }
  });

  if (template) {
    // Replace {{stampCount}} with {{totalStamps}} ONLY where it says "Total stamps:"
    // Original: "... Total stamps: *{{stampCount}}/{{requiredStamp}}*. ..."
    const updatedBody = template.messageBody.replace('Total stamps: *{{stampCount}}/', 'Total stamps: *{{totalStamps}}/');
    
    // Also, if the variables array doesn't include totalStamps, add it.
    let vars = [];
    try {
      vars = JSON.parse(template.variables);
    } catch(e) {}
    if (!vars.includes('totalStamps')) {
      vars.push('totalStamps');
    }

    await prisma.messageTemplate.update({
      where: { id: template.id },
      data: {
        messageBody: updatedBody,
        variables: JSON.stringify(vars)
      }
    });

    console.log("Template updated successfully!");
    console.log("New body:", updatedBody);
  } else {
    console.log("Template not found");
  }
}

main().finally(() => prisma.$disconnect());
