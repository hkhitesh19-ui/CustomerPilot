import os
import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

def cleanup():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('187.127.170.36', port=22, username='root', password=os.getenv("VPS_PASSWORD"), timeout=30)

    clean_script = """
import sqlite3

for db_path in ['/var/www/CustomerPilot/.next/standalone/prisma/dev.db', '/var/www/CustomerPilot/prisma/dev.db']:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT id, userId, name FROM Merchant WHERE name LIKE 'Test Store %' OR email LIKE 'test_%@gmail.com'")
    rows = cur.fetchall()
    print(f"Database {db_path}: Found {len(rows)} test merchants to clean up.")
    for mid, uid, name in rows:
        print(f"Deleting merchant {mid} (uid={uid}) - {name}")
        cur.execute("DELETE FROM DigitalBusinessCard WHERE merchantId = ?", (mid,))
        cur.execute("DELETE FROM Merchant WHERE id = ?", (mid,))
        if uid:
            cur.execute("DELETE FROM User WHERE id = ?", (uid,))
    # Also clean orphaned test users if any
    cur.execute("DELETE FROM User WHERE email LIKE 'test_%@gmail.com'")
    conn.commit()
    conn.close()
print("Cleanup complete.")
"""
    sftp = ssh.open_sftp()
    with sftp.file('/var/www/CustomerPilot/cleanup_test_stores.py', 'w') as f:
        f.write(clean_script)
    sftp.close()

    stdin, stdout, stderr = ssh.exec_command('python3 /var/www/CustomerPilot/cleanup_test_stores.py')
    for line in stdout:
        print(line.strip())
    err = stderr.read().decode('utf-8', errors='replace')
    if err:
        print("STDERR:", err)

    ssh.exec_command('rm /var/www/CustomerPilot/cleanup_test_stores.py')
    ssh.close()

if __name__ == '__main__':
    cleanup()
