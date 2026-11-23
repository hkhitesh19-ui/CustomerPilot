# CustomerPilot Off-VPS Encrypted Backup & Disaster Recovery Runbook

## Architecture Overview
- **Database Engine**: SQLite WAL mode (`prisma/dev.db`).
- **Backup Mechanism**: Native SQLite online `.backup` API (prevents WAL locks or corruption).
- **Integrity Gate**: Pre-packaging `PRAGMA integrity_check;` validation.
- **Bundle Contents**: Verified `dev.db` + `.env` + `public/uploads/` (merchant logos, QR codes, receipts).
- **Encryption**: AES-256 GPG symmetric cipher via isolated `/etc/cp_backup.key` (`chmod 600`, root:root).
- **Zero Plaintext Leak**: Isolated `mktemp -d` working directory with `umask 077` and `trap 'rm -rf "$WORKDIR"' EXIT`.
- **Dual Retention**:
  - **Local VPS**: 7 daily snapshots in `/var/backups/customerpilot/`.
  - **Remote Google Drive**: 30 daily snapshots in `CustomerPilot_Backups/` (with >=3 file safety guard).
- **Disaster Recovery Drill**: `scripts/restore_drill.sh` test-decrypts, unpacks, and compares all table row counts (`Merchant`, `Customer`, `Stamp`, `WhatsAppMessage`) against live DB without mutating live data.

---

## 2-Minute Google Drive Headless Rclone Setup

Because the production VPS has no GUI/browser, Google Drive OAuth requires a 1-time token generated from your PC:

### Step 1: On Your PC (Windows / Mac)
Run the following command in PowerShell / Terminal:
```powershell
winget install Rclone.Rclone
# Once installed, run:
rclone authorize "drive" --drive-scope drive.file
```
- A web browser will automatically open.
- Sign in to the Google account where CustomerPilot backups should be stored.
- Grant permission to allow Rclone access to its own dedicated folder.
- Terminal will print an authorization token JSON block:
```json
{"access_token":"ya29...","token_type":"Bearer","refresh_token":"1//...","expiry":"2026-..."}
```

### Step 2: On the VPS
Add the remote to `/root/.config/rclone/rclone.conf`:
```ini
[gdrive]
type = drive
scope = drive.file
token = {"access_token":"ya29...","token_type":"Bearer","refresh_token":"1//...","expiry":"..."}
```
Or run `rclone config` on the VPS and select `Google Drive` -> paste token.

Test connection:
```bash
rclone lsd gdrive:
```

---

## Operations & Verification Commands

### Run Manual Backup
```bash
bash /var/www/CustomerPilot/scripts/backup.sh
```

### Run Non-Destructive Restore Drill
```bash
bash /var/www/CustomerPilot/scripts/restore_drill.sh
```

### Cron Schedule (Installed after authorization)
VPS runs on UTC (`timedatectl`). 03:00 AM IST = **21:30 UTC**:
```crontab
30 21 * * * /bin/bash /var/www/CustomerPilot/scripts/backup.sh >> /var/log/cp-backup.log 2>&1
```
