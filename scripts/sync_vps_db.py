import paramiko
import os
import sys
import shutil
import sqlite3
import bcrypt
import io

# Ensure UTF-8 output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

HOST = "200.97.170.53"
PORT = 22
USER = "root"
PASSWORD = "Nilsky@202627"

# VPS Live DB path used by Next.js standalone PM2 process
REMOTE_DB_PATH = "/var/www/CustomerPilot/.next/standalone/prisma/prisma/dev.db"

LOCAL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRISMA_DIR = os.path.join(LOCAL_DIR, "prisma")
LOCAL_BACKUP_PATH = os.path.join(PRISMA_DIR, "prod_standalone_dev.db")
LOCAL_DB_PATH = os.path.join(PRISMA_DIR, "dev.db")

print(f"Connecting to Hostinger VPS ({HOST})...")

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=30)
    print("SSH Connected OK")

    sftp = ssh.open_sftp()
    stat = sftp.stat(REMOTE_DB_PATH)
    size_mb = stat.st_size / (1024 * 1024)
    print(f"Remote DB size: {size_mb:.2f} MB")

    print(f"Downloading {REMOTE_DB_PATH} -> {LOCAL_BACKUP_PATH} ...")
    sftp.get(REMOTE_DB_PATH, LOCAL_BACKUP_PATH)
    print("Download complete!")

    sftp.close()
    ssh.close()

    # Step 2: Open and migrate schema on downloaded DB
    conn = sqlite3.connect(LOCAL_BACKUP_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("PRAGMA table_info(Merchant)")
    cols = {r["name"] for r in cur.fetchall()}

    new_cols = [
        ("city", "TEXT"),
        ("googleReviewLink", "TEXT"),
        ("baselineReviewCount", "INTEGER"),
        ("baselineRating", "REAL"),
        ("baselineScreenshotUrl", "TEXT"),
        ("baselineCapturedAt", "DATETIME"),
    ]
    for col, dt in new_cols:
        if col not in cols:
            cur.execute(f"ALTER TABLE Merchant ADD COLUMN {col} {dt}")
            print(f"  Added column: {col}")

    # Ensure SuperAdmins exist
    admins = [
        ("customerpilot1@gmail.com", "Admin@CustomerPilot2026!", "super_admin", "Founder / Super Admin"),
        ("admin@customerpilot.in",   "Admin@CustomerPilot2026!", "super_admin", "Founder / Super Admin"),
    ]
    for email, password, role, name in admins:
        pwd_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(10)).decode()
        cur.execute("SELECT id FROM User WHERE email = ?", (email,))
        existing = cur.fetchone()
        if existing:
            cur.execute("UPDATE User SET password = ?, role = ?, name = ? WHERE email = ?",
                        (pwd_hash, role, name, email))
        else:
            import time
            uid = f"cust{int(time.time()*1000)}"
            cur.execute("INSERT INTO User (id, email, name, password, role, createdAt, updatedAt) VALUES (?,?,?,?,?,datetime('now'),datetime('now'))",
                        (uid, email, name, pwd_hash, role))

    # Set distinct GBP links & cities if null
    known_merchants = {
        "Cake Connection": {
            "city": "Vadodara",
            "googleReviewLink": "https://g.page/r/CfA2zsVxH2jOEBM/review",
            "rating": 4.6,
            "reviews": 689,
            "proof": "/proofs/proof_cakeconnection.svg"
        },
        "Pizza Da Dabha ": {
            "city": "Vadodara",
            "googleReviewLink": "https://www.google.com/maps/search/?api=1&query=Pizza+Da+Dhaba+Waghodia+Road+Vadodara",
            "rating": 4.1,
            "reviews": 3042,
            "proof": "/proofs/proof_pizzadadabha.svg"
        },
        "M/S DEEP PHARMACY ": {
            "city": "Purulia",
            "googleReviewLink": "https://www.google.com/maps/search/?api=1&query=Deep+Pharmacy+Purulia",
            "rating": 3.6,
            "reviews": 12,
            "proof": "/proofs/proof_deeppharmacy.svg"
        },
        "Home Style Furnitech": {
            "city": "Thrissur",
            "googleReviewLink": "https://www.google.com/maps/search/?api=1&query=Home+Style+Furniture+Chevoor+Thrissur+Kerala",
            "rating": 4.8,
            "reviews": 26,
            "proof": "/proofs/proof_homestylefurnitech.svg"
        }
    }

    for m_name, data in known_merchants.items():
        cur.execute("""
            UPDATE Merchant
            SET city = COALESCE(city, ?),
                googleReviewLink = COALESCE(googleReviewLink, ?),
                baselineRating = COALESCE(baselineRating, ?),
                baselineReviewCount = COALESCE(baselineReviewCount, ?),
                baselineScreenshotUrl = COALESCE(baselineScreenshotUrl, ?)
            WHERE name = ?
        """, (data["city"], data["googleReviewLink"], data["rating"], data["reviews"], data["proof"], m_name))

    # Remove wrong Cake Connection link from Home Style Furnitech Google Connection if present
    cur.execute("""
        DELETE FROM MerchantGoogleConnection
        WHERE googleReviewUrl = 'https://g.page/r/CfA2zsVxH2jOEBM/review'
        AND merchantId IN (SELECT id FROM Merchant WHERE name = 'Home Style Furnitech')
    """)

    conn.commit()

    cur.execute("SELECT count(*) as count FROM Merchant")
    merchant_count = cur.fetchone()["count"]

    conn.close()

    # Step 3: Atomic copy to dev.db
    # VERY IMPORTANT: Delete existing WAL and SHM files to prevent "database disk image is malformed"
    wal_path = LOCAL_DB_PATH + "-wal"
    shm_path = LOCAL_DB_PATH + "-shm"
    if os.path.exists(wal_path):
        try: os.remove(wal_path)
        except: pass
    if os.path.exists(shm_path):
        try: os.remove(shm_path)
        except: pass

    shutil.copy2(LOCAL_BACKUP_PATH, LOCAL_DB_PATH)
    print(f"\n✅ SUCCESS! Synced {merchant_count} merchants from Live VPS to local dev.db.")
    sys.exit(0)

except Exception as e:
    print(f"\n❌ Sync Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
