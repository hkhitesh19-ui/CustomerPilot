#!/usr/bin/env bash
# ==============================================================================
# CustomerPilot Isolated Local Smoke Test Runner
# Matches PM2 execution (cwd: .next/standalone, interpreter: node server.js)
# Backs up live SQLite to /tmp/smoke.db with umask 077 and chmod 600.
# Runs Next.js on port 3100 with outbound integrations neutralized.
# Runs smoke tests with SMOKE_DB_COPY=1, then cleans up.
# ==============================================================================
set -euo pipefail

umask 077

LIVE_DB="/var/www/CustomerPilot/prisma/dev.db"
SMOKE_DB="/tmp/smoke.db"
APP_DIR="/var/www/CustomerPilot"
STANDALONE_DIR="${APP_DIR}/.next/standalone"
PORT=3100

echo "═══════════════════════════════════════════════════════════════════════"
echo "🧪 CUSTOMERPILOT ISOLATED LOCAL SMOKE TEST (PORT $PORT)"
echo "═══════════════════════════════════════════════════════════════════════"

# Check if port 3100 is already in use
if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1 || (which nc >/dev/null 2>&1 && nc -z 127.0.0.1 ${PORT} 2>/dev/null); then
    echo "ERROR: Port ${PORT} is already in use! Aborting." >&2
    exit 1
fi

cleanup() {
    echo ""
    echo "[Cleanup] Stopping isolated server on port $PORT..."
    if [ -n "${SERVER_PID:-}" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
    fuser -k "${PORT}/tcp" 2>/dev/null || true
    echo "[Cleanup] Removing temporary smoke database files..."
    rm -f "$SMOKE_DB" "${SMOKE_DB}-wal" "${SMOKE_DB}-shm" 2>/dev/null || true
    echo "[Cleanup] Complete."
}
trap cleanup EXIT

# 1. Safe SQLite snapshot to /tmp/smoke.db with chmod 600
echo "[1/4] Creating isolated SQLite snapshot from live DB..."
sqlite3 "$LIVE_DB" ".backup '$SMOKE_DB'"
chmod 600 "$SMOKE_DB"* 2>/dev/null || true
sqlite3 "$SMOKE_DB" "PRAGMA integrity_check;" >/dev/null

# 2. Start isolated Next.js server on port 3100 (matching PM2 describe)
echo "[2/4] Starting isolated server on port $PORT (outbound side-effects neutralized)..."
cd "$STANDALONE_DIR"
DATABASE_URL="file:${SMOKE_DB}" \
EVOLUTION_API_KEY="" \
EVOLUTION_API_URL="http://127.0.0.1:9999_disabled" \
WA_DISABLED=1 \
RAZORPAY_KEY_ID="" \
RAZORPAY_KEY_SECRET="" \
GEMINI_API_KEY="" \
GROQ_API_KEY="" \
RESEND_API_KEY="" \
CRON_SECRET="" \
PORT=$PORT \
node server.js > /tmp/smoke_server.log 2>&1 &
SERVER_PID=$!

echo "Waiting for server to become healthy on port $PORT..."
MAX_RETRIES=30
COUNT=0
while [ $COUNT -lt $MAX_RETRIES ]; do
    if curl -s "http://127.0.0.1:${PORT}/dashboard" -o /dev/null -w "%{http_code}" | grep -qE "200|302|307|401"; then
        echo "Isolated server is ready on http://localhost:$PORT (PID $SERVER_PID)"
        break
    fi
    sleep 1
    COUNT=$((COUNT + 1))
done

if [ $COUNT -ge $MAX_RETRIES ]; then
    echo "ERROR: Server failed to start on port $PORT within 30 seconds." >&2
    cat /tmp/smoke_server.log >&2
    exit 1
fi

# 3. Run smoke tests in safe copy mode
echo ""
echo "[3/4] Running automated smoke tests against isolated server..."
cd "$APP_DIR"
SMOKE_HOST="http://localhost:${PORT}" SMOKE_DB_COPY=1 node scripts/run_smoke_tests.js

echo ""
echo "[4/4] Isolated smoke testing finished successfully."
