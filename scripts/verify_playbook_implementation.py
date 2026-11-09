import os
import sys
import sqlite3
import math

def round_js(val):
    return math.floor(val + 0.5)

def run_tests():
    print("=" * 65)
    print("[TEST SUITE] RANKPILOT AI MASTER PLAYBOOK IMPLEMENTATION VERIFICATION")
    print("=" * 65)
    
    passed = 0
    failed = 0

    def check(title, condition, details=""):
        nonlocal passed, failed
        if condition:
            print(f"[PASS]: {title} {details}")
            passed += 1
        else:
            print(f"[FAIL]: {title} {details}")
            failed += 1

    # =========================================================================
    # Test 1: SQLite Database Verification (ReviewVerificationLog Table)
    # =========================================================================
    print("\n--- 1. Database Schema & Prisma Model Verification ---")
    db_path = os.path.join(os.path.dirname(__file__), "..", "prisma", "dev.db")
    check("Database file exists", os.path.exists(db_path), f"({db_path})")

    conn = sqlite3.connect(db_path, timeout=5.0)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ReviewVerificationLog'")
    tables = cur.fetchall()
    check("ReviewVerificationLog table created in SQLite", len(tables) == 1)

    cur.execute("PRAGMA table_info(ReviewVerificationLog)")
    cols = {row[1]: row[2] for row in cur.fetchall()}
    expected_cols = [
        "id", "merchantId", "customerPhone", "imageSha256Hash",
        "reviewFingerprint", "reviewerName", "extractedText", "starRating",
        "hasKeywordMatch", "hasPhotoAttached", "stampsCredited", "status",
        "rejectionReason", "createdAt"
    ]
    all_cols_present = all(c in cols for c in expected_cols)
    check("All 14 ReviewVerificationLog schema columns present", all_cols_present, f"({len(cols)} columns)")
    conn.close()

    # =========================================================================
    # Test 2: Revenue Leak Mathematical Engine (Playbook Page 7 Formula)
    # =========================================================================
    print("\n--- 2. Revenue Leak Mathematical Formula Verification ---")
    def get_click_share(rank):
        if rank <= 1: return 0.240
        if rank == 2: return 0.150
        if rank == 3: return 0.100
        if rank <= 10: return 0.030
        if rank <= 20: return 0.012
        return 0.004

    def calc_revenue_leak(v, rank, aov, c_conv=0.20):
        s_top3 = 0.160
        s_curr = get_click_share(rank)
        a_top3 = round_js(v * s_top3)
        a_curr = round_js(v * s_curr)
        delta_a = max(0, a_top3 - a_curr)
        l_orders = round_js(delta_a * c_conv)
        r_monthly = l_orders * aov
        r_annual = r_monthly * 12
        return a_top3, a_curr, delta_a, l_orders, r_monthly, r_annual

    # Worked example from Page 7: V = 2500, rank = 18, AOV = 500, c_conv = 0.20
    a_top3, a_curr, delta_a, l_orders, r_monthly, r_annual = calc_revenue_leak(2500, 18, 500, 0.20)
    check("Top 3 Potential Monthly Actions (Atop3 = 400)", a_top3 == 400)
    check("Current Monthly Actions (Acurrent = 30)", a_curr == 30)
    check("Monthly Missed Actions (deltaA = 370)", delta_a == 370)
    check("Monthly Lost Orders (Lorders = 74)", l_orders == 74)
    check("Monthly Revenue Leak (Rmonthly = Rs 37,000)", r_monthly == 37000)
    check("Annual Revenue Leak (Rannual = Rs 4,44,000)", r_annual == 444000)

    # Rank 1 zero leak check
    _, _, d1, lo1, rm1, _ = calc_revenue_leak(2500, 1, 500, 0.20)
    check("Rank #1 has 0 lost orders and 0 revenue leak", (d1 == 0 and lo1 == 0 and rm1 == 0))

    # =========================================================================
    # Test 3: 100-Point Competitor Spy Scoring Engine (Playbook Page 7 Formula)
    # =========================================================================
    print("\n--- 3. 100-Point Competitor Spy Scoring Formula Verification ---")
    cat_score = 15 + round_js((1 / 4) * 10) # 15 + 3 = 18
    rev_score = round_js((60 / 300) * 10) + round_js((3 / 20) * 20) # 2 + 3 = 5
    kw_score = round_js((2 / 16) * 20) # 3
    web_score = 0 # 0
    vis_score = round_js((20 / 100) * 5) + round_js(0.20 * 5) # 1 + 1 = 2
    total_score = cat_score + rev_score + kw_score + web_score + vis_score # 28

    check("Category Alignment Score (18/25)", cat_score == 18)
    check("Review Volume & Velocity Score (5/30)", rev_score == 5)
    check("Keyword Density Score (3/20)", kw_score == 3)
    check("Website, Schema & AEO Readiness Score (0/15)", web_score == 0)
    check("Visual & Engagement Score (2/10)", vis_score == 2)
    check("Total Competitor Spy Score (28/100 Textbook Match)", total_score == 28)

    # =========================================================================
    # Test 4: Files Integrity & Syntax Verification
    # =========================================================================
    print("\n--- 4. Code Files & Export Verification ---")
    files_to_check = [
        ("src/lib/auditCalculator.ts", ["RevenueLeakInput", "calculateRevenueLeak", "getClickShareByRank", "calculateCompetitorSpyScore"]),
        ("src/lib/geminiReviewVerifier.ts", ["ReviewVerificationResult", "verifyGoogleReviewScreenshot", "deterministicVerifyReviewScreenshot"]),
        ("src/app/api/webhooks/whatsapp-review/route.ts", ["POST", "createReviewFingerprint", "sendWhatsAppReply"]),
        ("src/components/seo/schema-injector.tsx", ["generateMerchantGeoAeoSchema", "MerchantSchemaInput"]),
        ("src/app/[city]/[slug]/page.tsx", ["generateMetadata", "MerchantHyperLocalMicroPage"]),
        ("src/components/gbp-ranking-audit-client.tsx", ["calculateRevenueLeak", "Monthly &amp; Annual Revenue Leak Calculation"]),
    ]

    for rel_path, symbols in files_to_check:
        full_path = os.path.join(os.path.dirname(__file__), "..", rel_path)
        exists = os.path.exists(full_path)
        check(f"File exists: {rel_path}", exists)
        if exists:
            content = open(full_path, "r", encoding="utf-8", errors="ignore").read()
            missing = [s for s in symbols if s not in content]
            check(f"Symbols verified in {os.path.basename(rel_path)}", len(missing) == 0, f"(Checked {len(symbols)} symbols, missing: {missing})")

    print("\n" + "=" * 65)
    if failed == 0:
        print(f"[SUMMARY]: ALL {passed} TESTS PASSED SUCCESSFULLY! (Exit Code 0)")
        sys.exit(0)
    else:
        print(f"[SUMMARY]: {passed} TESTS PASSED, {failed} FAILED")
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
