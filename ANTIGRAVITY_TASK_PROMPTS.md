# Antigravity Task Prompts Reference

## Which Task Prompt to Use When

| What you want to do | Paste |
| :--- | :--- |
| Add a new feature | Part 3C |
| Fix a bug | Part 3D |
| Run tests only (no edits) | Part 3B |
| Review Antigravity's diff before merge | Part 3E |
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
│ 4. Paste Part 3C / 3D / 3B / 3E (your task)     │
│ 5. Wait for Antigravity's plan                  │
│ 6. Review the plan                              │
│ 7. Reply "go" if clean, else correct it         │
│ 8. Wait for Antigravity's delivery + diff       │
│ 9. Run tests yourself locally                   │
│ 10. If green → merge to main yourself           │
│ 11. If not green → use the STOP recovery prompt │
└─────────────────────────────────────────────────┘
```
