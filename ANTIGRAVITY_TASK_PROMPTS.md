# Antigravity Task Prompts Reference

## Which Task Prompt to Use When

| What you want to do | Paste |
| :--- | :--- |
| Add a new feature | Part 3C |
| Fix a bug | Part 3D |
| Run tests only (no edits) | Part 3B |
| Review Antigravity's diff before merge | Part 3E |
| Adversarial Red-Team & Production QA Hardening | Part 3F |
| Build test framework (only if tests don't exist yet) | Part 3A |

---

## Part 2 — Paste This at the Start of Every New Session
```markdown
You are working on CustomerPilot. Before doing ANYTHING else:

1. Read ./AGENTS.md from the project root, end to end.
2. Read ./FROZEN_FILES.md (if it exists) to see the exact frozen list.
3. Run `git branch --show-current` and report the branch name.
   - If you are on `main`, `stable`, `prod`, or `live` → STOP.
     Create a feature branch first:
       git checkout -b feature/session-<YYYYMMDD>
   - Report the new branch name in your reply. Do not proceed
     without an explicit feature branch.
4. Run `ls -la __tests__/ tests/ e2e/ 2>/dev/null` and confirm
   whether an automated test suite exists.
   - If NO test suite exists → propose building one. Do NOT
     start any feature task until I confirm.
   - If a test suite exists → run it once, report the result,
     wait for the next task.
5. Confirm in your reply:
     "Contract read. Frozen list acknowledged.
 Branch: <name>. Test suite status: <exists | missing>.
      Ready for task."

After acknowledging, wait for me to give you the task. Do not
start scanning the codebase, do not propose improvements, do
not list "things I noticed" — just acknowledge and wait.

For every task I give you:
  - First output: Branch / Scope / Files / Frozen-modules-affected / New tests / Plan / Risks
  - Then wait for my "go"
  - After editing: Changes / Tests added / Test results / Files NOT touched
  - Then STOP — do not declare done until I approve the diff and merge to main myself
```

---

## Part 3 Prompts

### Part 3A — Build Test Framework
```markdown
Build test framework for CustomerPilot. 
Do not add feature code. Set up Jest/Playwright, create initial test structure, and run baseline test pass.
```

### Part 3B — Run Tests Only
```markdown
Run existing automated test suite for CustomerPilot and report results without making code edits.
```

### Part 3C — Add New Feature
```markdown
Feature Task: [Describe feature here]
Output your plan first (Branch / Scope / Files / Frozen-modules / Tests / Plan / Risks) and WAIT for my "go".
```

### Part 3D — Fix a Bug
```markdown
Bug Fix Task: [Describe bug here]
Output your plan first (Branch / Scope / Files / Frozen-modules / Tests / Plan / Risks) and WAIT for my "go".
```

### Part 3E — Review Diff Before Merge
```markdown
Review current git diff and test output for CustomerPilot before merging to main.
```

### Part 3F — Adversarial Red-Team & Production QA Hardening (Claude AI Standard)
```markdown
Execute an exhaustive, single-pass Adversarial Red-Team QA & Architecture Hardening on CustomerPilot.
Do NOT patch reactively or report prematurely. You MUST enforce all 9 hard gates in a single synchronous turn:

1. Gate 1 — Origin & Boundary Enclosure Gate:
   - Ensure `hardened-test.ts` traps foreign origins even if paths match allowlists (no SSRF / origin bypass).
   - Enforce exact origin and pathname matching; do not use dynamic wildcard ports in production origins.

2. Gate 2 — Negative Mutation & Adversarial Fault-Injection Gate:
   - Run a 6-vector mutation suite proving that traps actively fail and generate `scratch/qa_debug_trace.json` on:
     (a) console.error, (b) HTTP 500, (c) 401 near-miss query probe, (d) uncaught window event loop throw (pageerror),
     (e) aborted/dropped network requests (requestfailed), and (f) foreign host allowlist escape probe.
   - Run positive controls proving all allowlist endpoints pass cleanly without false positives.

3. Gate 3 — Mathematical Formula & DB-Independence Gate:
   - Extract scoring and diagnostic logic into a pure module (`src/lib/gbp-audit-engine.ts`) with zero network/DB side effects.
   - Prove scoring determinism on an empty database (0 merchants, 0 users) with table-driven boundary unit tests covering all step-up edges (e.g. 14/15, 39/40, 49/50/51, 99/100 reviews).
   - Document the exact mathematical breakdown for all scores.

4. Gate 4 — Sensitive Token & Secret Redaction Gate:
   - Verify multi-vector sanitization across Bearer tokens, raw 3-segment JWTs, session cookies, query params, and JSON secrets.

5. Gate 5 — Production Standalone Build & CI Pipeline Gate:
   - Synchronize static assets (.next/static -> .next/standalone/.next/static, public -> .next/standalone/public).
   - Configure webServer with retries: 0 and standalone production start.
   - Validate that GitHub Actions CI (`.github/workflows/qa.yml`) includes spec import linting, typechecks, Prisma binaryTargets, and trace artifact uploads on failure only.

6. Gate 6 — External Dependency & 0-Env Gate:
   - Ensure all automated test suites and diagnostic engines execute cleanly without requiring live third-party APIs (e.g. Google Places API, WhatsApp Evolution API) or local `.env` secrets.
   - Provide explicit bypass flags (e.g. `GBP_PLACES_ENABLED=false`) in test/CI configurations to guarantee 100% offline determinism.

7. Gate 7 — Git Hygiene & Zero-Database/PII Gate:
   - Enforce that `.env`, `*.db`, `*.sqlite`, `test-results/`, and `backups/*.db` are NEVER tracked in Git.
   - Audit tracked files (`git ls-files | grep -E "\.(db|sqlite)$|\.env"`) and commit history for token/PII exposure.
   - Fresh databases must strictly be created via `prisma db push --skip-generate` in CI and clean tests.

8. Gate 8 — Full-App Type-Safety & Legacy Exception Reporting:
   - Run full-app `npx tsc --noEmit`.
   - For any legacy unrefactored routes (e.g. webhooks, cron, payments), never silently ignore or mask errors; explicitly document their exact file:line error output and root cause in the report.

9. Gate 9 — Critical Financial & Auth Route Defense Gate:
   - Any route handling payments, billing subscriptions, or authentication (e.g. `/api/payments/verify`, `/api/auth/*`) MUST have dedicated regression unit tests that execute with 0 ReferenceErrors and assert HTTP 400/401/200 behaviors.
   - Never rely on `ignoreBuildErrors: true` to mask runtime crashes; ensure full-app typecheck ratchet guards (`scripts/verify_typecheck_ratchet.js`) prevent new TypeScript error regressions.

10. Gate 10 — Mandatory "Jo maine verify nahi kiya (Unverified List)" Section:
   - In your final response, you MUST include a dedicated section titled "Jo maine verify nahi kiya (Unverified List)".
   - Explicitly list any environments, live CI runs, external webhooks, or platform boundaries that were not executed or verified in the current pass. Never hide or assume unverified items.

Execute end-to-end autonomously in one single turn without interim messages. Output final verified evidence, Commit ID, and wait for my confirmation before git push.
```

---

## Recovery Prompt — Paste This If Antigravity Ever Slips
If Antigravity starts editing without waiting for "go", proposes unauthorized deps, modifies a frozen file, or skips the branch check:

```markdown
STOP. Contract violation. You are bound by AGENTS.md which you re-read at the start of this session.

Required actions RIGHT NOW:
  1. Revert any partial changes: `git checkout -- .`
  2. Confirm clean state with: `git status`
  3. Re-run: `git branch --show-current` and report
  4. If on main → create feature branch now
  5. Re-output your plan in the format specified and STOP. Do not edit until I reply "go".

The Operating Contract is non-negotiable. Do not resume work without an explicit "go" from me after I have seen your plan.
```

---

## Daily Workflow Summary
```markdown
┌─────────────────────────────────────────────────┐
│ 1. Open Antigravity                            │
│ 2. Paste Part 2 (session-start)                 │
│ 3. Wait for Antigravity's contract ack          │
│ 4. Paste Part 3C / 3D / 3B / 3E / 3F (task)     │
│ 5. Wait for Antigravity's plan                  │
│ 6. Review the plan                              │
│ 7. Reply "go" if clean, else correct it         │
│ 8. Wait for Antigravity's delivery + diff       │
│ 9. Run tests yourself locally                   │
│ 10. If green → merge to main yourself           │
│ 11. If not green → use the STOP recovery prompt │
└─────────────────────────────────────────────────┘
```
