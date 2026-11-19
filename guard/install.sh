#!/usr/bin/env bash
# One-time setup, run from repo root.
set -e
chmod +x guard/*.sh guard/pre-commit
ALLOW_CORE_CHANGE=1 ./guard/core-guard.sh update
cp guard/pre-commit .git/hooks/pre-commit
# Read-only for AI agent sandbox (owner: chmod u+w when approving a change)
chmod 444 src/lib/queue-engine.ts src/components/dashboard/RewardModal.tsx \
  src/app/api/webhook/evolution/route.ts src/app/api/rewards/award/route.ts guard/core.sha256
echo "Done. Commit guard/ and .github/ files."
