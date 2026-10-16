"""Setup Evolution API PostgreSQL database and deploy via Docker Compose on VPS."""
import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.127.170.36', port=22, username='root', password='Nilsky@202627', timeout=60)

def run(cmd, desc=""):
    print(f"\n{'='*50}")
    if desc:
        print(f">> {desc}")
    print(f"CMD: {cmd[:100]}...")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=120)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    code = stdout.channel.recv_exit_status()
    if out:
        print("OUT:", out[:2000])
    if err:
        print("ERR:", err[:2000])
    print(f"Exit: {code}")
    return out, err, code

# Step 1: Create evolution_db in PostgreSQL
run("sudo -u postgres psql -c \"CREATE USER evolution WITH PASSWORD 'EvoDb_Secure_2026!';\" 2>&1 || true",
    "Create evolution PostgreSQL user")

run("sudo -u postgres psql -c \"CREATE DATABASE evolution_db OWNER evolution;\" 2>&1 || true",
    "Create evolution_db database")

run("sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE evolution_db TO evolution;\" 2>&1",
    "Grant privileges to evolution user")

run("sudo -u postgres psql -c \"ALTER USER evolution CREATEDB;\" 2>&1",
    "Allow evolution user to create DB")

# Step 2: Update pg_hba.conf to allow evolution user password auth
run("""grep -n "evolution" /etc/postgresql/14/main/pg_hba.conf || echo "No entry for evolution user" """,
    "Check pg_hba.conf for evolution user")

run("""echo "host    evolution_db    evolution    127.0.0.1/32    md5" >> /etc/postgresql/14/main/pg_hba.conf""",
    "Add evolution user to pg_hba.conf")

run("systemctl reload postgresql", "Reload PostgreSQL")

# Step 3: Test connection
run("""PGPASSWORD='EvoDb_Secure_2026!' psql -h 127.0.0.1 -U evolution -d evolution_db -c "\\l" 2>&1 | head -5""",
    "Test evolution DB connection")

# Step 4: Write docker-compose.yml for Evolution API
compose_content = """services:
  evolution-api:
    image: evoapicloud/evolution-api:latest
    container_name: evolution-api
    restart: always
    ports:
      - '8080:8080'
    environment:
      - SERVER_URL=http://187.127.170.36:8080
      - AUTHENTICATION_TYPE=apikey
      - AUTHENTICATION_API_KEY=Evo_Api_Key_Secure_998877!
      - AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true
      - DATABASE_ENABLED=true
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://evolution:EvoDb_Secure_2026!@172.17.0.1:5432/evolution_db?schema=public
      - DATABASE_CONNECTION_CLIENT_NAME=evolution_api
      - DATABASE_SAVE_DATA_INSTANCE=true
      - DATABASE_SAVE_DATA_NEW_MESSAGE=false
      - DATABASE_SAVE_MESSAGE_UPDATE=false
      - DATABASE_SAVE_DATA_CONTACTS=false
      - DATABASE_SAVE_DATA_CHATS=false
      - DATABASE_SAVE_DATA_LABELS=false
      - DATABASE_SAVE_DATA_HISTORIC=false
      - QRCODE_LIMIT=30
      - QRCODE_COLOR=#198754
      - CACHE_REDIS_ENABLED=false
      - CACHE_LOCAL_ENABLED=true
      - LOG_LEVEL=ERROR
      - LOG_COLOR=true
      - LOG_BAILEYS=error
      - DEL_INSTANCE=false
      - CHATWOOT_ENABLED=false
      - RABBITMQ_ENABLED=false
      - WEBSOCKET_ENABLED=false
      - SOCKET_IO_ENABLED=false
      - CONFIG_SESSION_PHONE_CLIENT=CustomerPilot
      - CONFIG_SESSION_PHONE_NAME=CustomerPilot
    volumes:
      - evolution_instances:/evolution/instances
volumes:
  evolution_instances:
"""

run(f"mkdir -p /opt/evolution-api && cat > /opt/evolution-api/docker-compose.yml << 'COMPOSEEOF'\n{compose_content}\nCOMPOSEEOF",
    "Write docker-compose.yml")

# Alternative: write directly via SFTP
sftp = ssh.open_sftp()
with sftp.file('/opt/evolution-api/docker-compose.yml', 'w') as f:
    f.write(compose_content)
sftp.close()
print("\n[SFTP] docker-compose.yml written via SFTP")

# Step 5: Allow Docker to connect to host PostgreSQL
run("""sudo -u postgres psql -c "ALTER SYSTEM SET listen_addresses = '*';" 2>&1""",
    "Allow PostgreSQL to listen on all interfaces")

run("systemctl restart postgresql", "Restart PostgreSQL with new listen_addresses")

# Step 6: Check docker bridge IP (usually 172.17.0.1)
run("ip addr show docker0 | grep 'inet ' | awk '{print $2}'", "Get Docker bridge IP")

# Step 7: Add Docker network to pg_hba.conf for evolution user
run("""echo "host    evolution_db    evolution    172.17.0.0/16    md5" >> /etc/postgresql/14/main/pg_hba.conf""",
    "Add Docker network to pg_hba.conf")

run("systemctl reload postgresql", "Reload PostgreSQL again")

# Step 8: Start Evolution API
run("cd /opt/evolution-api && docker compose down 2>&1 || true", "Stop any existing container")
run("cd /opt/evolution-api && docker compose up -d 2>&1", "Start Evolution API container")

# Step 9: Wait 10 seconds then check
import time
print("\n[Waiting 10s for Evolution API to start...]")
time.sleep(10)

run("docker ps | grep evolution", "Check container status")
run("docker logs evolution-api 2>&1 | tail -20", "Check container logs")

# Step 10: Test API
run("curl -s --connect-timeout 10 http://127.0.0.1:8080 2>&1 | head -3", "Test Evolution API HTTP")

ssh.close()
print("\n[Done]")
