import paramiko
import os

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.127.170.36', username='root', password=os.getenv('VPS_PASSWORD') or 'Nilsky@202627')
cmd = """python3 -c "import sqlite3; c = sqlite3.connect('/var/www/CustomerPilot/prisma/dev.db').cursor(); c.execute('SELECT id, name FROM Merchant'); print(c.fetchall())" """
stdin, stdout, stderr = ssh.exec_command(cmd)
print("Merchants on VPS:")
for row in eval(stdout.read().decode()):
    print(" -", row)
ssh.close()
