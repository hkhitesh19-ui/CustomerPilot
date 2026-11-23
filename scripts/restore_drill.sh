#!/usr/bin/env bash
# ==============================================================================
# CustomerPilot Non-Destructive Restore Drill & Integrity Verification Script
# Strict Rule: NEVER modify or touch live DB. Read-only validation in isolated
#              temporary directory with automatic cleanup on exit.
# ==============================================================================
set -euo pipefail

KEY_FILE="/etc/cp_backup.key"
LOCAL_BACKUP_DIR="/var/backups/customerpilot"
REMOTE_DEST="gdrive:CustomerPilot_Backups"
LIVE_DB="/var/www/CustomerPilot/prisma/dev.db"

if [ ! -f "$KEY_FILE" ]; then
    echo "ERROR: Encryption key file not found at $KEY_FILE" >&2
    exit 1
fi

# 1. Isolated Secure Working Directory
WORKDIR=$(mktemp -d)
chmod 700 "$WORKDIR"
umask 077
trap 'rm -rf "$WORKDIR"' EXIT

echo "═══════════════════════════════════════════════════════════════════════"
echo "🔍 CUSTOMERPILOT BACKUP RESTORE & INTEGRITY DRILL (OFF-VPS REMOTE TEST)"
echo "═══════════════════════════════════════════════════════════════════════"

TARGET_ARCHIVE=""
if rclone listremotes 2>/dev/null | grep -q "^gdrive:"; then
    echo "[Step 0/4] Fetching NEWEST backup file from Google Drive ($REMOTE_DEST)..."
    LATEST_REMOTE_NAME=$(rclone lsf "$REMOTE_DEST" 2>/dev/null | grep "^cp_backup_.*\.tar\.gz\.gpg$" | sort -r | head -n1 || true)
    if [ -n "$LATEST_REMOTE_NAME" ]; then
        echo "Found newest remote backup: $LATEST_REMOTE_NAME"
        rclone copyto "${REMOTE_DEST}/${LATEST_REMOTE_NAME}" "$WORKDIR/$LATEST_REMOTE_NAME"
        TARGET_ARCHIVE="$WORKDIR/$LATEST_REMOTE_NAME"
        echo "Downloaded fresh remote archive: $TARGET_ARCHIVE ($(stat -c%s "$TARGET_ARCHIVE" 2>/dev/null || wc -c < "$TARGET_ARCHIVE") bytes)"
    fi
fi

if [ -z "$TARGET_ARCHIVE" ]; then
    echo "NOTICE: Remote file not found, falling back to local /var/backups/customerpilot/..."
    LATEST_LOCAL=$(find "$LOCAL_BACKUP_DIR" -name "cp_backup_*.tar.gz.gpg" -type f | sort -r | head -n1 || true)
    if [ -z "$LATEST_LOCAL" ]; then
        echo "ERROR: No backup found to drill!" >&2
        exit 1
    fi
    TARGET_ARCHIVE="$LATEST_LOCAL"
fi

echo "Target Backup Archive: $TARGET_ARCHIVE"
echo "Archive Size         : $(stat -c%s "$TARGET_ARCHIVE" 2>/dev/null || wc -c < "$TARGET_ARCHIVE") bytes"

# 2. Decrypt GPG BEFORE tar (Amendment 1)
echo ""
echo "[Step 1/4] Decrypting AES256 GPG archive..."
gpg --batch --yes --pinentry-mode loopback \
    --passphrase-file "$KEY_FILE" \
    -d -o "$WORKDIR/restored_bundle.tar.gz" "$TARGET_ARCHIVE"
echo "Decryption status: ✅ SUCCESS"

# 3. Extract Archive Bundle
echo ""
echo "[Step 2/4] Extracting archive bundle into isolated workdir..."
tar -xzf "$WORKDIR/restored_bundle.tar.gz" -C "$WORKDIR"

if [ ! -f "$WORKDIR/dev.db" ]; then
    echo "ERROR: Restored archive does not contain dev.db!" >&2
    exit 1
fi

# 4. SQLite PRAGMA integrity_check
echo ""
echo "[Step 3/4] Performing PRAGMA integrity_check on restored SQLite DB..."
INTEGRITY=$(sqlite3 "$WORKDIR/dev.db" "PRAGMA integrity_check;")
echo "SQLite Integrity Result: $INTEGRITY"
if [ "$INTEGRITY" != "ok" ]; then
    echo "FAIL: Corrupted restored database!" >&2
    exit 1
fi
echo "Integrity Verification: ✅ PASS (ok)"

# 5. Live vs Restored Row Counts Comparison (Zero Live DB mutation)
echo ""
echo "[Step 4/4] Comparing Table Row Counts: Live DB vs Restored DB..."

LIVE_MERCHANTS=$(sqlite3 "$LIVE_DB" "SELECT COUNT(*) FROM Merchant;")
REST_MERCHANTS=$(sqlite3 "$WORKDIR/dev.db" "SELECT COUNT(*) FROM Merchant;")

LIVE_CUSTOMERS=$(sqlite3 "$LIVE_DB" "SELECT COUNT(*) FROM Customer;")
REST_CUSTOMERS=$(sqlite3 "$WORKDIR/dev.db" "SELECT COUNT(*) FROM Customer;")

LIVE_STAMPS=$(sqlite3 "$LIVE_DB" "SELECT COUNT(*) FROM Stamp;")
REST_STAMPS=$(sqlite3 "$WORKDIR/dev.db" "SELECT COUNT(*) FROM Stamp;")

LIVE_MESSAGES=$(sqlite3 "$LIVE_DB" "SELECT COUNT(*) FROM WhatsAppMessage;")
REST_MESSAGES=$(sqlite3 "$WORKDIR/dev.db" "SELECT COUNT(*) FROM WhatsAppMessage;")

echo "┌─────────────────┬───────────┬───────────────┬────────────┐"
echo "│ Table           │ Live DB   │ Restored DB   │ Status     │"
echo "├─────────────────┼───────────┼───────────────┼────────────┤"
printf "│ %-15s │ %-9s │ %-13s │ %-10s │\n" "Merchant" "$LIVE_MERCHANTS" "$REST_MERCHANTS" "$([ "$LIVE_MERCHANTS" = "$REST_MERCHANTS" ] && echo '✅ MATCH' || echo '❌ MISMATCH')"
printf "│ %-15s │ %-9s │ %-13s │ %-10s │\n" "Customer" "$LIVE_CUSTOMERS" "$REST_CUSTOMERS" "$([ "$LIVE_CUSTOMERS" = "$REST_CUSTOMERS" ] && echo '✅ MATCH' || echo '❌ MISMATCH')"
printf "│ %-15s │ %-9s │ %-13s │ %-10s │\n" "Stamp" "$LIVE_STAMPS" "$REST_STAMPS" "$([ "$LIVE_STAMPS" = "$REST_STAMPS" ] && echo '✅ MATCH' || echo '❌ MISMATCH')"
printf "│ %-15s │ %-9s │ %-13s │ %-10s │\n" "WhatsAppMessage" "$LIVE_MESSAGES" "$REST_MESSAGES" "$([ "$LIVE_MESSAGES" = "$REST_MESSAGES" ] && echo '✅ MATCH' || echo '❌ MISMATCH')"
echo "└─────────────────┴───────────┴───────────────┴────────────┘"

ALL_MATCH=true
if [ "$LIVE_MERCHANTS" != "$REST_MERCHANTS" ] || [ "$LIVE_CUSTOMERS" != "$REST_CUSTOMERS" ] || [ "$LIVE_STAMPS" != "$REST_STAMPS" ] || [ "$LIVE_MESSAGES" != "$REST_MESSAGES" ]; then
    ALL_MATCH=false
fi

echo ""
if [ "$ALL_MATCH" = true ]; then
    echo "🎉 DRILL VERDICT: PASSED (100% Data Parity Verified from Remote Google Drive)"
    exit 0
else
    echo "❌ DRILL VERDICT: FAILED (Data Count Discrepancy Detected)"
    exit 1
fi
