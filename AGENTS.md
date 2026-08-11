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
