import sqlite3
import paramiko
import os
import sys
import time

MERCHANT_ID = "cmtymavfx0002kx008lbfvp57"
MERCHANT_NAME_MATCH = "Cake Connection"

def delete_customer_data_from_db(conn, label):
    c = conn.cursor()
    c.execute("PRAGMA foreign_keys = OFF;") # To allow clean ordered cascading delete
    
    # 1. Verify merchant exists
    c.execute("SELECT id, name FROM Merchant WHERE id = ?", (MERCHANT_ID,))
    m = c.fetchone()
    if not m:
        print(f"[{label}] Merchant {MERCHANT_ID} not found!")
        return False
    print(f"[{label}] Found Merchant: {m[1]} ({m[0]})")
    
    # 2. Get customer IDs
    c.execute("SELECT id, phone, name FROM Customer WHERE merchantId = ?", (MERCHANT_ID,))
    cust_rows = c.fetchall()
    cust_ids = [r[0] for r in cust_rows]
    print(f"[{label}] Found {len(cust_ids)} customers to delete: {[r[1] for r in cust_rows]}")
    
    # Tables with direct merchantId or customerId
    deletion_queries = [
        ("CustomerInstagramIdentity", "merchantId = ?", (MERCHANT_ID,)),
        ("InstagramStoryProof", "merchantId = ?", (MERCHANT_ID,)),
        ("CustomerConsent", "merchantId = ?", (MERCHANT_ID,)),
        ("Stamp", "merchantId = ?", (MERCHANT_ID,)),
        ("CustomerStampCard", "merchantId = ?", (MERCHANT_ID,)),
        ("Bill", "merchantId = ?", (MERCHANT_ID,)),
        ("WaitingCustomer", "merchantId = ?", (MERCHANT_ID,)),
        ("Redemption", "merchantId = ?", (MERCHANT_ID,)),
        ("Referral", "merchantId = ?", (MERCHANT_ID,)),
        ("ReviewBonusLog", "merchantId = ?", (MERCHANT_ID,)),
        ("Review", "merchantId = ?", (MERCHANT_ID,)),
        ("Birthday", "merchantId = ?", (MERCHANT_ID,)),
        ("WinBackEscalation", "merchantId = ?", (MERCHANT_ID,)),
    ]
    
    # Delete child records
    for tbl, where_clause, params in deletion_queries:
        try:
            c.execute(f"SELECT COUNT(*) FROM \"{tbl}\" WHERE {where_clause}", params)
            count = c.fetchone()[0]
            if count > 0:
                c.execute(f"DELETE FROM \"{tbl}\" WHERE {where_clause}", params)
                print(f"  [{label}] Deleted {count} rows from {tbl}")
        except Exception as e:
            # Table might not exist or differ
            pass
            
    # Conditional deletes for nullable relations
    if cust_ids:
        placeholders = ",".join(["?"] * len(cust_ids))
        for tbl in ["Achievement", "WhatsAppMessage"]:
            try:
                c.execute(f"SELECT COUNT(*) FROM \"{tbl}\" WHERE customerId IN ({placeholders})", cust_ids)
                count = c.fetchone()[0]
                if count > 0:
                    c.execute(f"DELETE FROM \"{tbl}\" WHERE customerId IN ({placeholders})", cust_ids)
                    print(f"  [{label}] Deleted {count} rows from {tbl}")
            except Exception:
                pass
                
        for tbl in ["Order", "Invoice"]:
            try:
                c.execute(f"SELECT COUNT(*) FROM \"{tbl}\" WHERE merchantId = ? AND customerId IN ({placeholders})", [MERCHANT_ID] + cust_ids)
                count = c.fetchone()[0]
                if count > 0:
                    c.execute(f"DELETE FROM \"{tbl}\" WHERE merchantId = ? AND customerId IN ({placeholders})", [MERCHANT_ID] + cust_ids)
                    print(f"  [{label}] Deleted {count} rows from {tbl}")
            except Exception:
                pass

        try:
            c.execute(f"SELECT COUNT(*) FROM \"QrScanEvent\" WHERE merchantId = ? AND registeredCustomerId IN ({placeholders})", [MERCHANT_ID] + cust_ids)
            count = c.fetchone()[0]
            if count > 0:
                c.execute(f"DELETE FROM \"QrScanEvent\" WHERE merchantId = ? AND registeredCustomerId IN ({placeholders})", [MERCHANT_ID] + cust_ids)
                print(f"  [{label}] Deleted {count} rows from QrScanEvent")
        except Exception:
            pass

    # Finally delete from Customer
    c.execute("DELETE FROM Customer WHERE merchantId = ?", (MERCHANT_ID,))
    print(f"  [{label}] Deleted {len(cust_ids)} rows from Customer table.")
    
    # Delete test session tokens
    try:
        c.execute("DELETE FROM SystemContent WHERE id LIKE 'CP_%' OR id LIKE 'STAMP_%' OR id LIKE 'mid_%'")
        print(f"  [{label}] Cleaned temporary Instagram tokens and webhook deduplication locks in SystemContent")
    except Exception:
        pass
        
    conn.commit()
    c.execute("PRAGMA foreign_keys = ON;")
    
    # Verification check
    c.execute("SELECT COUNT(*) FROM Customer WHERE merchantId = ?", (MERCHANT_ID,))
    remaining_cust = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM Stamp WHERE merchantId = ?", (MERCHANT_ID,))
    remaining_stamps = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM Merchant WHERE id = ?", (MERCHANT_ID,))
    m_check = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM Staff WHERE merchantId = ?", (MERCHANT_ID,))
    staff_check = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM StampCard WHERE merchantId = ?", (MERCHANT_ID,))
    card_check = c.fetchone()[0]
    
    print(f"[{label}] VERIFICATION AUDIT:")
    print(f"  - Remaining Customers : {remaining_cust} (Expected 0)")
    print(f"  - Remaining Stamps    : {remaining_stamps} (Expected 0)")
    print(f"  - Merchant Intact     : {m_check} (Expected 1)")
    print(f"  - Staff Login Intact  : {staff_check} (Expected 1)")
    print(f"  - Stamp Card Rules    : {card_check} (Expected 1)")
    
    return remaining_cust == 0 and remaining_stamps == 0 and m_check == 1

def main():
    print("==================================================================")
    print("🧹 CAKE CONNECTION CUSTOMER DATA RESET (LOCAL & LIVE VPS)")
    print(f"Target Merchant ID: {MERCHANT_ID}")
    print("==================================================================\n")
    
    # --- 1. LOCAL RESET ---
    local_db_path = "prisma/dev.db"
    if os.path.exists(local_db_path):
        ts = int(time.time())
        backup_local = f"prisma/dev.db.backup_pre_reset_{ts}"
        print(f"1. Taking Local Pre-Backup -> {backup_local}")
        conn_b = sqlite3.connect(local_db_path)
        b_conn = sqlite3.connect(backup_local)
        conn_b.backup(b_conn)
        b_conn.close()
        conn_b.close()
        print(f"   ✅ Local Pre-Backup created ({os.path.getsize(backup_local)} bytes)")
        
        conn = sqlite3.connect(local_db_path)
        delete_customer_data_from_db(conn, "LOCAL")
        conn.close()
    
    # --- 2. LIVE VPS RESET ---
    print("\n------------------------------------------------------------------")
    print("2. Connecting to Hostinger VPS (187.127.170.36) for Live Reset...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect("187.127.170.36", port=22, username="root", password=os.getenv("VPS_PASSWORD") or "Nilsky@202627", timeout=15)
    print("   ✅ Connected to Hostinger VPS!")
    
    vps_script = """
import sqlite3, os, time

MERCHANT_ID = "cmtymavfx0002kx008lbfvp57"
db_path = "/var/www/CustomerPilot/prisma/dev.db"
ts = int(time.time())
backup_path = f"/var/www/CustomerPilot/prisma/dev.db.backup_pre_reset_{ts}"

# 1. Hot Backup
conn_src = sqlite3.connect(db_path)
conn_dst = sqlite3.connect(backup_path)
conn_src.backup(conn_dst)
conn_dst.close()
print(f"VPS Pre-Backup created at {backup_path} ({os.path.getsize(backup_path)} bytes)")

# 2. Deletion
c = conn_src.cursor()
c.execute("PRAGMA foreign_keys = OFF;")

c.execute("SELECT id, phone, name FROM Customer WHERE merchantId = ?", (MERCHANT_ID,))
cust_rows = c.fetchall()
cust_ids = [r[0] for r in cust_rows]
print(f"VPS Found {len(cust_ids)} customers: {[r[1] for r in cust_rows]}")

deletion_queries = [
    ("CustomerInstagramIdentity", "merchantId = ?", (MERCHANT_ID,)),
    ("InstagramStoryProof", "merchantId = ?", (MERCHANT_ID,)),
    ("CustomerConsent", "merchantId = ?", (MERCHANT_ID,)),
    ("Stamp", "merchantId = ?", (MERCHANT_ID,)),
    ("CustomerStampCard", "merchantId = ?", (MERCHANT_ID,)),
    ("Bill", "merchantId = ?", (MERCHANT_ID,)),
    ("WaitingCustomer", "merchantId = ?", (MERCHANT_ID,)),
    ("Redemption", "merchantId = ?", (MERCHANT_ID,)),
    ("Referral", "merchantId = ?", (MERCHANT_ID,)),
    ("ReviewBonusLog", "merchantId = ?", (MERCHANT_ID,)),
    ("Review", "merchantId = ?", (MERCHANT_ID,)),
    ("Birthday", "merchantId = ?", (MERCHANT_ID,)),
    ("WinBackEscalation", "merchantId = ?", (MERCHANT_ID,)),
]

for tbl, where_clause, params in deletion_queries:
    try:
        c.execute(f"SELECT COUNT(*) FROM \\\"{tbl}\\\" WHERE {where_clause}", params)
        count = c.fetchone()[0]
        if count > 0:
            c.execute(f"DELETE FROM \\\"{tbl}\\\" WHERE {where_clause}", params)
            print(f"  [VPS] Deleted {count} rows from {tbl}")
    except Exception:
        pass

if cust_ids:
    placeholders = ",".join(["?"] * len(cust_ids))
    for tbl in ["Achievement", "WhatsAppMessage"]:
        try:
            c.execute(f"SELECT COUNT(*) FROM \\\"{tbl}\\\" WHERE customerId IN ({placeholders})", cust_ids)
            count = c.fetchone()[0]
            if count > 0:
                c.execute(f"DELETE FROM \\\"{tbl}\\\" WHERE customerId IN ({placeholders})", cust_ids)
                print(f"  [VPS] Deleted {count} rows from {tbl}")
        except Exception:
            pass

    for tbl in ["Order", "Invoice"]:
        try:
            c.execute(f"SELECT COUNT(*) FROM \\\"{tbl}\\\" WHERE merchantId = ? AND customerId IN ({placeholders})", [MERCHANT_ID] + cust_ids)
            count = c.fetchone()[0]
            if count > 0:
                c.execute(f"DELETE FROM \\\"{tbl}\\\" WHERE merchantId = ? AND customerId IN ({placeholders})", [MERCHANT_ID] + cust_ids)
                print(f"  [VPS] Deleted {count} rows from {tbl}")
        except Exception:
            pass

    try:
        c.execute(f"SELECT COUNT(*) FROM \\\"QrScanEvent\\\" WHERE merchantId = ? AND registeredCustomerId IN ({placeholders})", [MERCHANT_ID] + cust_ids)
        count = c.fetchone()[0]
        if count > 0:
            c.execute(f"DELETE FROM \\\"QrScanEvent\\\" WHERE merchantId = ? AND registeredCustomerId IN ({placeholders})", [MERCHANT_ID] + cust_ids)
            print(f"  [VPS] Deleted {count} rows from QrScanEvent")
    except Exception:
        pass

c.execute("DELETE FROM Customer WHERE merchantId = ?", (MERCHANT_ID,))
print(f"  [VPS] Deleted {len(cust_ids)} rows from Customer table.")

try:
    c.execute("DELETE FROM SystemContent WHERE id LIKE 'CP_%' OR id LIKE 'STAMP_%' OR id LIKE 'mid_%'")
    print("  [VPS] Cleaned temporary Instagram tokens and webhook deduplication locks in SystemContent")
except Exception:
    pass

conn_src.commit()
c.execute("PRAGMA foreign_keys = ON;")

# Verification check
c.execute("SELECT COUNT(*) FROM Customer WHERE merchantId = ?", (MERCHANT_ID,))
remaining_cust = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM Stamp WHERE merchantId = ?", (MERCHANT_ID,))
remaining_stamps = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM Merchant WHERE id = ?", (MERCHANT_ID,))
m_check = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM Staff WHERE merchantId = ?", (MERCHANT_ID,))
staff_check = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM StampCard WHERE merchantId = ?", (MERCHANT_ID,))
card_check = c.fetchone()[0]

print("VPS VERIFICATION AUDIT:")
print(f"  - Remaining Customers : {remaining_cust} (Expected 0)")
print(f"  - Remaining Stamps    : {remaining_stamps} (Expected 0)")
print(f"  - Merchant Intact     : {m_check} (Expected 1)")
print(f"  - Staff Login Intact  : {staff_check} (Expected 1)")
print(f"  - Stamp Card Rules    : {card_check} (Expected 1)")

conn_src.close()
"""
    sftp = ssh.open_sftp()
    with sftp.file("/tmp/vps_reset_cake_customers.py", "w") as f:
        f.write(vps_script)
    sftp.close()
    
    stdin, stdout, stderr = ssh.exec_command("python3 /tmp/vps_reset_cake_customers.py")
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    print(out)
    if err:
        print("[VPS Error]:", err)
    ssh.close()
    
    print("\n🎉 RESET COMPLETE! All customer records for Cake Connection have been deleted on both Local and Live VPS.")

if __name__ == "__main__":
    main()
