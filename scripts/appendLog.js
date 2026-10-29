const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '..', 'RESOLVED_ISSUES_LOG.md');
const contentToAppend = `
---
## [11 Aug 2026] Issue: Incorrect WhatsApp Message Template Triggered (REWARD_UNLOCKED)
- **Symptom**: Customer received "REWARD_UNLOCKED" message (saying they completed the card) when they were actually just earning their 1st stamp on a brand new card (Card #2). Additionally, the coupon code displayed as \`**\` instead of a real code.
- **Root Cause**: The API endpoint (\`/api/rewards/award/route.ts\`) was fetching the customer's stamp card using \`findFirst\` without sorting or filtering for active status. This caused it to fetch their very first (already completed) stamp card, making the system think they had full stamps. The coupon code was rendering as \`**\` because the \`couponCode\` variable was not being passed to the template engine for the \`REWARD_UNLOCKED\` template.
- **Resolution**: Updated the \`findFirst\` query for the \`customerStampCard\` in the notification section of \`/api/rewards/award/route.ts\` to use \`orderBy: { createdAt: 'desc' }\`, ensuring the most recently active/updated card is fetched. Also added random alphanumeric coupon generation in the \`getCompiledTemplate\` call for \`REWARD_UNLOCKED\`.
- **Status**: ✅ Resolved and Verified.
`;

fs.appendFileSync(logPath, contentToAppend, 'utf8');
console.log('Successfully appended to RESOLVED_ISSUES_LOG.md');
