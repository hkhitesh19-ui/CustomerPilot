# CustomerPilot Agent Rules

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
3. **STOP. Do NOT push yet.**
4. Inform the user: "Fix is committed locally. Please test it manually and confirm it's working."
5. Wait for the user's explicit confirmation (e.g., "haan kaam kar raha hai", "confirmed", "working").
6. ONLY AFTER user confirmation: run `git push`.

Violation of this rule (pushing before user confirmation) is a breach of the project workflow.

## VPS Live Deployment Tracking (MANDATORY)
Whenever you deploy code to the live Hostinger VPS server (200.97.170.53), you MUST immediately update `Git Commit on VPS Live.txt` in the project root with the active Git commit hash, branch, timestamp, and commit message. 
Never complete a deployment without keeping `Git Commit on VPS Live.txt` 100% synchronized with the live server.

## Mandatory Dual-Engine Protocol: GSD Planning + CodeRabbit Quality & Security Audit
For EVERY new task, feature request, or significant bugfix, you MUST systematically execute through this dual-engine pipeline:

1. **Stage 1 — GSD Structured Planning (Break Down)**:
   - Break down the user's requirement into clear structured phases (Plan ➔ Break Down ➔ Execute ➔ Verify).
   - Lay out the architecture, impacted files, and step-by-step roadmap before coding.

2. **Stage 2 — Disciplined Execution**:
   - Implement the code changes phase-by-phase without breaking existing modules.

3. **Stage 3 — CodeRabbit Deep Review & Security Audit**:
   - Perform an automated code review and security audit on all changed files:
     - Bug & Edge Case Detection (null safety, async race conditions, state desync)
     - Security Audit (SQL/ORM injection, unauthorized access, secret exposure)
     - Performance & Efficiency Check (unnecessary re-renders, DB query optimization)
   - Summarize findings by severity (Critical / Major / Minor / Clean).

4. **Stage 4 — Autofix & Local Commit**:
   - Automatically fix any Critical/Major audit findings.
   - Run `git add` and `git commit` locally.

5. **Stage 5 — User Permission Gate (Strict Rule)**:
   - Present the completed work along with the CodeRabbit Audit Verdict.
   - **STOP. Do NOT push or deploy.**
   - Wait for the user's explicit confirmation and permission before any `git push` or VPS deployment.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
