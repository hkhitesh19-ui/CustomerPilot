const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '..', 'RESOLVED_ISSUES_LOG.md');
const contentToAppend = `
---
## [11 Aug 2026] Issue: AI Draft Google Review Webhook Not Triggering
- **Symptom**: Customer replied "Yes" to the Google Review request, but the system did not generate or send the \`REVIEW_DRAFT\` link.
- **Root Cause**: The Evolution Webhook (\`api/webhook/evolution/route.ts\`) identifies context by fetching the customer's \`lastSentMsg\` using \`orderBy: { sentAt: "desc" }\`. However, the \`STAMP_AWARDED\` message (which was created back-to-back with the \`review_request\`) did not have its \`sentAt\` timestamp populated. In SQLite, \`NULL\` values sort *first* in \`DESC\` order, causing the webhook to mistakenly believe \`STAMP_AWARDED\` was the most recently sent message instead of \`review_request\`. Thus, the "Yes" reply was ignored.
- **Resolution**: 
  1. Updated the webhook query in \`/api/webhook/evolution/route.ts\` to use \`orderBy: { createdAt: "desc" }\` which is strictly guaranteed by Prisma upon record creation, preventing sorting bugs related to \`NULL\` fields.
  2. Updated \`/api/rewards/award/route.ts\` to correctly populate \`sentAt: new Date()\` when saving outgoing \`STAMP_AWARDED\` messages.
- **Status**: ✅ Resolved and Verified.
`;

fs.appendFileSync(logPath, contentToAppend, 'utf8');
console.log('Successfully appended AI Draft fix to RESOLVED_ISSUES_LOG.md');
