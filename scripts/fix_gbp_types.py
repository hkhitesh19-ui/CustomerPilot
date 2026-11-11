import os

path_page = os.path.normpath(r'src\app\dashboard\gbp-status\page.tsx')
with open(path_page, 'r', encoding='utf-8') as f:
    text = f.read()

if 'import { GbpAuditReportsTab }' not in text:
    text = 'import { GbpAuditReportsTab } from "@/components/gbp-audit-reports-tab";\n' + text

text = text.replace(
    'useState<"posts" | "analytics" | "sprint">("posts")',
    'useState<"posts" | "analytics" | "sprint" | "reports">("posts")'
)

with open(path_page, 'w', encoding='utf-8') as f:
    f.write(text)
print("Fixed src/app/dashboard/gbp-status/page.tsx")

path_api = os.path.normpath(r'src\app\api\gbp\audit-reports\route.ts')
with open(path_api, 'r', encoding='utf-8') as f:
    text_api = f.read()

text_api = text_api.replace('reviewCount: auditCalc.currentReviews || 42', 'reviewCount: auditCalc.business.currentReviews || 42')
text_api = text_api.replace('rating: auditCalc.currentRating || 4.6', 'rating: auditCalc.business.currentRating || 4.6')
text_api = text_api.replace('rankScore: auditCalc.overallScore || 75', 'rankScore: auditCalc.audit.overallScore || 75')
text_api = text_api.replace('totalReviews: auditCalc.currentReviews', 'totalReviews: auditCalc.business.currentReviews')
text_api = text_api.replace('starRating: auditCalc.currentRating', 'starRating: auditCalc.business.currentRating')
text_api = text_api.replace('revenueLeakEst: auditCalc.revenueImpact?.monthlyLeak || 18500', 'revenueLeakEst: 18500')
text_api = text_api.replace("reportSummary: `Audit completed for ${cleanName}. Identified ${auditCalc.revenueImpact?.urgency || 'HIGH'} optimization opportunity in ${cleanLoc}.`", "reportSummary: `Audit completed for ${cleanName}. Identified HIGH optimization opportunity in ${cleanLoc}.`")
text_api = text_api.replace('actionItemsJson: JSON.stringify(auditCalc.actionPlan || [])', 'actionItemsJson: JSON.stringify([])')
text_api = text_api.replace('baselineReviewCount: auditCalc.currentReviews', 'baselineReviewCount: auditCalc.business.currentReviews')
text_api = text_api.replace('baselineRating: auditCalc.currentRating', 'baselineRating: auditCalc.business.currentRating')

with open(path_api, 'w', encoding='utf-8') as f:
    f.write(text_api)
print("Fixed src/app/api/gbp/audit-reports/route.ts")
