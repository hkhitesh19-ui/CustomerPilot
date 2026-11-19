#!/usr/bin/env bash
# Layer 5: frozen core integrity. Run from repo root.
#   ./guard/core-guard.sh check
#   ALLOW_CORE_CHANGE=1 ./guard/core-guard.sh update   (after approved change)
set -euo pipefail
FILES=(
  src/lib/queue-engine.ts
  src/components/dashboard/RewardModal.tsx
  src/app/api/webhook/evolution/route.ts
  src/app/api/rewards/award/route.ts
)
MANIFEST=guard/core.sha256
case "${1:-check}" in
  update)
    [ "${ALLOW_CORE_CHANGE:-0}" = "1" ] || { echo "Set ALLOW_CORE_CHANGE=1 (needs owner approval)"; exit 1; }
    [ -w "$MANIFEST" ] || [ ! -e "$MANIFEST" ] || chmod u+w "$MANIFEST"
    sha256sum "${FILES[@]}" > "$MANIFEST"; echo "Manifest updated";;
  check)
    sha256sum -c --quiet "$MANIFEST" || { echo "FROZEN CORE MODIFIED. Needs owner approval + manifest update."; exit 1; }
    echo "Core intact";;
esac
