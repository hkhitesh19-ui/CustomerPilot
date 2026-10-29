# CustomerPilot Agent Rules

## Universal Autonomous Execution & Zero-Premature-Turn Protocol (MANDATORY FOR ALL TASKS)
1. **Strict Prohibition of Interim Messages & Premature Turn Ending**:
   - For ANY task (coding, debugging, testing, building, database scripts, migrations, deployments), you are STRICTLY FORBIDDEN from posting interim progress text (e.g. "I am checking...", "Tests are running...", "I will notify you once done") and ending your turn while work is still in progress.
   - Root Cause Safeguard: Outputting conversational text ends the agent's active turn, putting the platform into an idle state that requires a new user prompt to resume. 
2. **Mandatory Single-Turn Autonomous Completion**:
   - Once the user gives an objective, you MUST execute the entire end-to-end pipeline (Code ➔ Audit ➔ Test/Verify ➔ Local Commit) synchronously within the SAME active turn.
   - If any command, build, script, or test is running in the background, you MUST keep checking and waiting using tool calls (`manage_task`) in that same turn without emitting chat text until the operation completely terminates.
   - Never stop midway to ask trivial permission (e.g. "Should I proceed to step 2?"). Proceed autonomously until the entire objective is achieved.
3. **Single Conclusive Final Response**:
   - Keep all intermediate thoughts and actions inside tool calls.
   - Output conversational text to the user ONLY ONCE at the very end, delivering the final, 100% verified result and status report.

## Automated Bug Documentation (MANDATORY)
Whenever you successfully resolve a bug, issue, or error in this repository, you MUST automatically append a full technical report of the resolution to `RESOLVED_ISSUES_LOG.md`. 
Do NOT wait for the user to remind you or ask you to document it.

The report format must strictly follow:
```markdown
---
## [DD MMM YYYY] Issue: [Brief Title]
- **Symptom**: [What was happening from the user's perspective]
- **Root Cause**: [Deep technical reason for the failure]
- **Resolution**: [Step-by-step technical details of what you changed/fixed]
- **Status**: ✅ Resolved and Verified.
```

Failure to log resolved issues is a violation of the project workflow.

## New Session Start Protocol (MANDATORY)
At the very beginning of any new session or conversation, before executing any tasks, you MUST silently read the following files to establish your context:
1. `InstructionFlow.md` (to understand the architectural blueprint and non-technical journeys)
2. `RESOLVED_ISSUES_LOG.md` (to understand recent bug fixes and avoid reverting them)
3. `ANTIGRAVITY_TASK_PROMPTS.md` (to understand the user's workflow rules)

## Git Push Protocol (MANDATORY)
You are STRICTLY FORBIDDEN from running `git push` after fixing a bug or issue UNLESS the user has explicitly confirmed in the current conversation that the fix has been manually tested and verified by them.

The correct workflow is:
1. Make the code fix/changes locally.
2. Run `git add` and `git commit` to save the fix locally.
3. **Mandatory Commit ID Reporting (STRICT RULE)**: In every single user response where a local commit is performed or reported, you MUST explicitly and prominently display the **Local Git Commit ID** (both the short hash e.g. `460dd94` and full 40-character SHA e.g. `460dd94e21024142367e222ef0e2ed0ced6827f7`), branch name, and commit message in a dedicated highlighted block. Never omit or hide the commit ID.
4. **STOP. Do NOT push yet.**
5. Inform the user: "Fix is committed locally (Commit ID: <short_hash>). Please test it manually and confirm it's working."
6. Wait for the user's explicit confirmation (e.g., "haan kaam kar raha hai", "confirmed", "working").
7. ONLY AFTER user confirmation: run `git push`.

Violation of this rule (pushing before user confirmation or omitting the Commit ID) is a breach of the project workflow.

## VPS Live Deployment & Long-Running Execution Protocol (MANDATORY)
1. **Never End Turn on In-Progress Deployments (Strict Prohibition)**:
   - When running Live VPS deployments (200.97.170.53) or Next.js production builds, you are STRICTLY FORBIDDEN from posting an interim text message (e.g. "Deploying... I will notify you once finished") and ending your turn while the task is still running in the background.
   - Root Cause Safeguard: In this platform, if the agent outputs text and ends its turn, the system goes into an idle state waiting for the user's next message. A completing background task does NOT wake the agent up autonomously to generate an unprompted reply.
2. **Mandatory Single-Turn Synchronous Execution**:
   - You MUST keep deployment execution completely within the current active turn:
     - Keep polling the running task status using `manage_task` in a loop across tool calls WITHOUT outputting premature text to the user.
     - Do NOT output conversational text until the deployment script finishes, PM2 reloads, and live curl health checks pass (HTTP 200).
   - ONLY send your message to the user once the entire deployment is 100% finished and verified, delivering the final success report in that single turn.
3. **VPS Tracking File Sync (Mandatory)**:
   - Whenever you deploy code to the live Hostinger VPS server (200.97.170.53), you MUST immediately update `Git Commit on VPS Live.txt` in the project root with the active Git commit hash, branch, timestamp, and commit message.
   - Never complete a deployment without keeping `Git Commit on VPS Live.txt` 100% synchronized with the live server.

## Mandatory Triple-Engine Protocol: GSD Planning + Deep Code & Security Audit + Playwright Visual & Data Ground-Truth Verification
For EVERY new task, feature request, or bugfix, you MUST systematically execute through this triple-engine pipeline:

> [!IMPORTANT]
> **Permanent Default (Zero User Prompting Required)**: The 10 Hard Gates of Part 3F (Adversarial Red-Team QA) are active by DEFAULT on EVERY task. The user is NEVER required to type 'Run strictly under Part 3F' or remind the agent. You must execute this pipeline unconditionally.

1. **Stage 1 — GSD Structured Planning (Break Down)**:
   - Break down the user's requirement into clear structured phases (Plan ➔ Break Down ➔ Execute ➔ Verify).
   - Lay out the architecture, impacted files, and step-by-step roadmap before coding.

2. **Stage 2 — Disciplined Execution**:
   - Implement the code changes phase-by-phase without breaking existing modules.

3. **Stage 3 — Deep Code & Security Audit (Code/AST Level - MANDATORY)**:
   - Run Master Adversarial Guard: `node scripts/run_adversarial_guard.js`
     - Gate 1: Spec Import Linter (Zero error-trap bypasses)
     - Gate 2: Full-App TypeScript Ratchet Guard (Baseline <= 36)
     - Gate 3: Sensitive Token & Secret Redaction (5 sanitization vectors)
     - Gate 4: Scoring Engine Mathematical Boundaries (12 boundary tests)
     - Gate 5: Critical Financial & Auth Payments Regression (Session guard, 409 replay attack lock, order validation)
     - Gate 6: Git Hygiene & Database Untracking (0 SQLite .db files tracked)
   - Perform automated static code review on all changed files:
     - Bug & Edge Case Detection (null safety, async race conditions, state desync)
     - Security Audit (SQL/ORM injection, unauthorized access, SSRF, secret exposure)
     - Internal Red-Team Cross-Examination (Claude-Style Audit): Silently verify missing imports, arithmetic component sums, and unique DB constraints.
   - Classify findings (Critical / Major / Minor / Clean) and autofix Critical/Major findings immediately.

4. **Stage 4 — Playwright Deterministic Autonomous QA & Ground-Truth Verification (Runtime & Error Trap Level - MANDATORY)**:
   - *Deterministic Self-Debug Loop*: For any UI, route, or button change, you MUST execute `node scripts/run_autonomous_qa.js` <spec-path>.
   - *Strict Console & Network Failure Trap*: The test uses e2e/fixtures/hardened-test.ts to trap any uncaught page crashes, console errors, or unexpected 4xx/5xx network responses (with allowlist).
   - *Auto-Debug Loop Directive*: IF `run_autonomous_qa.js` exits with non-zero code:
     - You are STRICTLY FORBIDDEN from reporting to the Admin.
     - Silently inspect scratch/qa_debug_trace.json, identify the root cause, fix the code/proxy, and re-run until Exit Code 0 is achieved.
   - *Ground-Truth Data Assertion*: Real store data, 0 dummy placeholders, no truncated text (...), and visual snapshots.
   - *Why this is mandatory*: Static code review only checks code syntax; it CANNOT see if rendered data on the screen is dummy/incorrect or if UI text is cut off (`...`). You MUST perform real output verification:
     - **Live Headless Execution**: Load the live page in a real browser (Playwright/Puppeteer/Fetch DOM).
     - **Ground-Truth Data Assertion**: Verify 100% real business data (Real Store Name, Real Address, Real Phone, Real Hours, Real Rating).
     - **Zero Dummy Data Check**: Strictly verify ZERO instances of dummy placeholders (`98765`, `12345`, `example.com`, `lorem ipsum`).
     - **Visual Truncation Check**: Verify no button or status pill text is clipped with ellipsis (`...`).
     - **Visual Snapshot**: Capture screenshot/DOM state to visually audit the final rendered product.
   - *Mandatory Dual-Reality External Platform Truth Protocol (Zero-Assumption Rule)*:
     - **Strict Prohibition of Conflating Internal DB with External Platforms**: Setting a row in `prisma.gbpPost` to `status: "POSTED"` or generating an image card URL does NOT mean the post is live on Google Maps. The Master Adversarial Guard (`scripts/run_adversarial_guard.js`) verifies ONLY internal TypeScript/AST syntax, secret leaks, and mathematical boundaries; it CANNOT verify whether Google Maps or WhatsApp received the data.
     - **Absolute Prohibition of Unverified External Claims**: You are STRICTLY FORBIDDEN from claiming "Live on Maps", "Google par publish ho gaya", "Review posted on Google", or "WhatsApp delivered" without physical external proof: either a live Playwright screenshot captured directly from `google.com` / `maps.google.com` showing the post, or a direct HTTP 200 payload with Google's post ID from Google's official API.
     - **Mandatory 2-Tier Reality Reporting**: Any response involving Google Posts, Reviews, or WhatsApp MUST explicitly report:
       1. **Tier 1 (CustomerPilot Internal Queue)**: Internal state, DB ID, banner link, approval status.
       2. **Tier 2 (External Platform - Google Maps)**: Real Google Maps status: [✅ Confirmed Live with Screenshot Proof] OR [❌ Pending Google Submission (Google API 0 QPM / Manual or Agency Manager Action Required)]. Never present Tier 1 as Tier 2!

5. **Stage 5 — Autofix & Local Commit**:
   - Automatically fix any discrepancies found in Code Audit or Output Verification.
   - Run `git add` and `git commit` locally.

6. **Stage 6 — User Permission Gate (Strict Rule)**:
   - Present the completed work along with:
     1. Code Security & Quality Verdict
     2. Output & Ground-Truth Verification Report (Screenshots + Real Data Confirmation)
   - **STOP. Do NOT push or deploy.**
   - Wait for the user's explicit confirmation and permission before any `git push` or VPS deployment.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
