#!/usr/bin/env bash
# ==============================================================================
# CustomerPilot Production Automated Encrypted Daily Backup Script
# Rules: Isolated WORKDIR (umask 077), AES256 GPG, SQLite .backup API,
#        Integrity Checks, Dual Retention (7d local, 30d remote), Zero Plaintext.
# ==============================================================================
set -euo pipefail

LOG_FILE="/var/log/cp-backup.log"
APP_DIR="/var/www/CustomerPilot"
DB_PATH="${APP_DIR}/prisma/dev.db"
KEY_FILE="/etc/cp_backup.key"
LOCAL_BACKUP_DIR="/var/backups/customerpilot"
REMOTE_DEST="gdrive:CustomerPilot_Backups"

log() {
    local msg="[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] $*"
    echo "$msg"
    echo "$msg" >> "$LOG_FILE" 2>/dev/null || true
}

log "=== CustomerPilot Backup Started ==="

# 1. Pre-flight Checks
if [ ! -f "$DB_PATH" ]; then
    log "ERROR: Database file not found at $DB_PATH"
    exit 1
fi

if [ ! -f "$KEY_FILE" ]; then
    log "ERROR: Encryption key not found at $KEY_FILE"
    exit 1
fi

# Check free disk space (> 2x DB size)
DB_SIZE=$(stat -c%s "$DB_PATH" 2>/dev/null || wc -c < "$DB_PATH")
FREE_SPACE=$(df -B1 /var/tmp | awk 'NR==2 {print $4}')
REQUIRED_SPACE=$((DB_SIZE * 3))

if [ "$FREE_SPACE" -lt "$REQUIRED_SPACE" ]; then
    log "ERROR: Insufficient disk space. Free: ${FREE_SPACE} bytes, Required: ${REQUIRED_SPACE} bytes"
    exit 1
fi

# 2. Isolated Secure Working Directory (Trap cleans all plaintext on EXIT)
WORKDIR=$(mktemp -d)
chmod 700 "$WORKDIR"
umask 077
trap 'rm -rf "$WORKDIR"' EXIT

TS=$(date -u +"%Y%m%d_%H%M%S")
TEMP_DB="$WORKDIR/dev.db"
BUNDLE="$WORKDIR/cp_backup_${TS}.tar.gz"
ENCRYPTED_FILE="$WORKDIR/cp_backup_${TS}.tar.gz.gpg"

# 3. Online WAL SQLite Backup via .backup API
log "Performing online SQLite .backup..."
sqlite3 "$DB_PATH" ".backup '$TEMP_DB'"

# 4. Mandatory SQLite Integrity Gate
INTEGRITY=$(sqlite3 "$TEMP_DB" "PRAGMA integrity_check;")
if [ "$INTEGRITY" != "ok" ]; then
    log "CRITICAL: Database integrity check failed: $INTEGRITY"
    exit 1
fi
log "SQLite integrity check passed: ok"

# 5. Archive DB, .env, and uploads directory
log "Creating archive bundle..."
tar -czf "$BUNDLE" \
    -C "$WORKDIR" dev.db \
    -C "$APP_DIR" .env \
    -C "${APP_DIR}/public" uploads

# 6. GPG Symmetric AES256 Encryption
log "Encrypting archive with AES256..."
gpg --batch --yes --pinentry-mode loopback \
    --passphrase-file "$KEY_FILE" \
    --cipher-algo AES256 \
    -c -o "$ENCRYPTED_FILE" "$BUNDLE"

# 7. Local Retention Storage (/var/backups/customerpilot/)
mkdir -p "$LOCAL_BACKUP_DIR"
chmod 700 "$LOCAL_BACKUP_DIR"
cp "$ENCRYPTED_FILE" "${LOCAL_BACKUP_DIR}/cp_backup_${TS}.tar.gz.gpg"
chmod 600 "${LOCAL_BACKUP_DIR}/cp_backup_${TS}.tar.gz.gpg"
log "Local backup saved: ${LOCAL_BACKUP_DIR}/cp_backup_${TS}.tar.gz.gpg"

# Local Retention: Purge older than 7 days
find "$LOCAL_BACKUP_DIR" -name "cp_backup_*.tar.gz.gpg" -type f -mtime +7 -delete

# 8. Off-VPS Remote Upload via Rclone
if rclone listremotes 2>/dev/null | grep -q "^gdrive:"; then
    log "Uploading encrypted backup to $REMOTE_DEST..."
    rclone copyto "$ENCRYPTED_FILE" "${REMOTE_DEST}/cp_backup_${TS}.tar.gz.gpg"

    # Verification: Verify size match between local and remote
    LOCAL_SIZE=$(stat -c%s "$ENCRYPTED_FILE" 2>/dev/null || wc -c < "$ENCRYPTED_FILE")
    REMOTE_SIZE=$(rclone size "${REMOTE_DEST}/cp_backup_${TS}.tar.gz.gpg" --json 2>/dev/null | jq -r '.bytes // empty' || true)

    if [ -n "$REMOTE_SIZE" ] && [ "$LOCAL_SIZE" -eq "$REMOTE_SIZE" ]; then
        log "Remote verification successful: ${LOCAL_SIZE} bytes match."

        # Remote Retention (30 Days) - Safety guard: never delete if fewer than 3 remote files exist
        REMOTE_COUNT=$(rclone ls "$REMOTE_DEST" 2>/dev/null | wc -l)
        if [ "$REMOTE_COUNT" -ge 3 ]; then
            rclone delete --min-age 30d "$REMOTE_DEST"
            log "Remote retention applied (purged >30d, preserved ${REMOTE_COUNT} archives)."
        else
            log "Remote files count (${REMOTE_COUNT} < 3). Skipping retention purge for safety."
        fi
    else
        log "ERROR: Remote size mismatch! Local: $LOCAL_SIZE, Remote: $REMOTE_SIZE"
        exit 1
    fi
else
    log "NOTICE: rclone remote 'gdrive:' not yet configured. Local encrypted backup retained safely."
fi

# 9. Healthcheck Notification (if configured)
if [ -n "${BACKUP_HC_URL:-}" ]; then
    log "Notifying healthcheck URL..."
    curl -fsS --retry 3 "$BACKUP_HC_URL" || true
fi

log "=== CustomerPilot Backup Finished Successfully: cp_backup_${TS}.tar.gz.gpg ==="
