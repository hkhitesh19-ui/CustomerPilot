# CustomerPilot.in — VPS Server Technical Deployment & Operations Guide

> **Production Server**: Hostinger KVM 1 VPS  
> **Operating System**: Ubuntu 22.04 LTS (x86_64)  
> **Server IP**: `187.127.170.36`  
> **Domain**: `customerpilot.in` (and `www.customerpilot.in`)  
> **Co-Hosted Application**: `cakeconnection.in` (Port 3001)  
> **Last Updated**: 15 October 2026

---

## 1. System Architecture & Ecosystem Topology

```
                   Internet / Visitors
                           │
                           ▼
                  Cloudflare Anycast DNS
             (athena.ns / wilson.ns.cloudflare.com)
            [Edge SSL: Full / CDN & WAF / Proxied]
                           │
                           ▼
              Hostinger KVM 1 VPS (187.127.170.36)
               UFW Firewall (Ports 22, 80, 443)
                           │
                           ▼
                   Nginx Reverse Proxy
              (/etc/nginx/sites-available/)
              ├── customerpilot.in  ➔  127.0.0.1:3000
              └── cakeconnection.in  ➔  127.0.0.1:3001
                           │
            ┌──────────────┼──────────────┐
            ▼                             ▼
    PM2 Process Daemon            PM2 Process Daemon
  (customerpilot-web :3000)      (cakeconnection :3001)
  (customerpilot-cron)
            │                             │
    ┌───────┴───────┐                     │
    ▼               ▼                     ▼
SQLite DB      Evolution API v2     PostgreSQL 14 (Port 5432)
(dev.db)       (Docker :8080)       ├── Database: `cakeconnection`
11 Merchants   WhatsApp Gateway     └── Database: `evolution_db`
```

---

## 2. Server Specifications & Port Mapping

| Service | Technology | Port / Bind | Working Directory | Process Manager |
| :--- | :--- | :--- | :--- | :--- |
| **CustomerPilot Web** | Next.js 16 (Standalone) | `127.0.0.1:3000` | `/var/www/CustomerPilot/.next/standalone` | PM2 (`customerpilot-web`) |
| **CustomerPilot Cron** | Node.js Background Runner | Background | `/var/www/CustomerPilot` | PM2 (`customerpilot-cron`) |
| **CakeConnection Web** | Next.js Production | `127.0.0.1:3001` | `/var/www/CakeConnection/next-app` | PM2 (`cakeconnection`) |
| **Evolution API v2** | Docker (Baileys WhatsApp) | `0.0.0.0:8080` (Host Net) | `/opt/evolution-api` | Docker Compose (`restart: always`) |
| **PostgreSQL Database**| PostgreSQL 14 | `127.0.0.1:5432` | `/var/lib/postgresql/14/main` | Systemd (`postgresql`) |
| **CustomerPilot DB** | SQLite 3 (`dev.db`) | Local File | `prisma/dev.db` | Embedded Prisma Engine |
| **Nginx Reverse Proxy**| Nginx 1.18.0 | `0.0.0.0:80`, `:443` | `/etc/nginx` | Systemd (`nginx`) |
| **SSH Daemon** | OpenSSH | `0.0.0.0:22` | `/etc/ssh` | Systemd (`ssh`) |

---

## 3. Zero-to-One Server Provisioning Commands

When setting up a completely fresh Ubuntu 22.04 LTS server from scratch, execute the following commands as `root`:

### 3.1. System Update & Base Packages
```bash
apt-get update && apt-get upgrade -y
apt-get install -y curl wget git unzip build-essential ufw software-properties-common certbot python3-certbot-nginx
```

### 3.2. UFW Firewall Hardening
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose
```

### 3.3. Node.js 22 LTS & PM2 Installation
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
npm install -g pm2
node -v   # Output: v22.23.x+
npm -v    # Output: v10.x+
pm2 -v    # Output: v7.0.x+
```

### 3.4. PostgreSQL 14 Setup (For CakeConnection & Evolution API)
```bash
apt-get install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

# 1. Create CakeConnection Database and User
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'CakeConnectionStrongDbPassword2026!';"
sudo -u postgres psql -c "CREATE DATABASE cakeconnection;"

# 2. Create Evolution API Database and User (MANDATORY FOR WHATSAPP GATEWAY V2)
sudo -u postgres psql -c "CREATE USER evolution WITH PASSWORD 'EvoDb_Secure_2026!';"
sudo -u postgres psql -c "CREATE DATABASE evolution_db OWNER evolution;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE evolution_db TO evolution;"
sudo -u postgres psql -c "ALTER USER evolution CREATEDB;"

# 3. Configure pg_hba.conf for local password authentication
echo "host    evolution_db    evolution    127.0.0.1/32    md5" >> /etc/postgresql/14/main/pg_hba.conf
systemctl reload postgresql
```

### 3.5. Docker & Evolution API v2 Setup (WhatsApp Gateway)
```bash
# 1. Install Docker & Docker Compose Plugin
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 2. Setup Evolution API Directory & Docker Compose
mkdir -p /opt/evolution-api
cat << 'EOF' > /opt/evolution-api/docker-compose.yml
services:
  evolution-api:
    image: evoapicloud/evolution-api:latest
    container_name: evolution-api
    restart: always
    network_mode: host
    environment:
      - SERVER_URL=http://187.127.170.36:8080
      - AUTHENTICATION_TYPE=apikey
      - AUTHENTICATION_API_KEY=Evo_Api_Key_Secure_998877!
      - AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true
      - DATABASE_ENABLED=true
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://evolution:EvoDb_Secure_2026!@127.0.0.1:5432/evolution_db?schema=public
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
EOF

# 3. Pull & Launch Evolution API Container
cd /opt/evolution-api
docker compose pull
docker compose up -d

# 4. Verify Health Status
curl -s http://127.0.0.1:8080 | grep "Welcome to the Evolution API"
```

---

## 4. CustomerPilot.in Full Build & Deployment Workflow

### 4.1. Directory Structure
```bash
mkdir -p /var/www/CustomerPilot
cd /var/www/CustomerPilot
```

### 4.2. Platform Compatibility (`package.json`)
Ensure Windows-locked packages are NOT present in `package.json`:
- ❌ `@next/swc-win32-x64-msvc`
- ❌ `lightningcss-win32-x64-msvc`

Linux npm automatically downloads `linux-x64` equivalents when these platform-specific overrides are removed.

### 4.3. Installing Dependencies & PostCSS
```bash
cd /var/www/CustomerPilot
npm install --include=dev --no-audit

# Install Linux native sharp binary
npm install --os=linux --cpu=x64 sharp --save

# Ensure postcss.config.mjs exists (MANDATORY FOR TAILWIND CSS V4!)
cat << 'EOF' > postcss.config.mjs
const config = {
  plugins: ["@tailwindcss/postcss"],
};
export default config;
EOF
```

### 4.4. Prisma Client Generation
```bash
cd /var/www/CustomerPilot
npx prisma generate
```

### 4.5. Next.js Production Standalone Build
```bash
cd /var/www/CustomerPilot
npm run build
```
*Note*: `next.config.ts` must have `output: "standalone"` enabled.

### 4.6. Standalone Assets & SQLite Database Synchronization
Next.js standalone bundles require static assets and SQLite files to be copied into `.next/standalone`:
```bash
cd /var/www/CustomerPilot
# Static CSS, JS and Image Chunks
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# Live Merchants SQLite Database
mkdir -p .next/standalone/prisma
cp prisma/dev.db .next/standalone/prisma/dev.db
mkdir -p .next/standalone/prisma/prisma
cp prisma/dev.db .next/standalone/prisma/prisma/dev.db

# Environment Secrets (.env.production is the master credentials file)
cp .env.production .env
cp .env.production .next/standalone/.env
```

### 4.7. PM2 Services Configuration & Autostart
```bash
# 1. CustomerPilot Web App (Port 3000)
cd /var/www/CustomerPilot/.next/standalone
pm2 delete customerpilot-web 2>/dev/null || true
PORT=3000 HOSTNAME=0.0.0.0 pm2 start server.js --name customerpilot-web

# 2. CustomerPilot Cron Runner
cd /var/www/CustomerPilot
pm2 delete customerpilot-cron 2>/dev/null || true
pm2 start scripts/localCronRunner.js --name customerpilot-cron

# 3. Save Process List & Enable Reboot Persistence
pm2 save
pm2 startup systemd -u root --hp /root
```

---

## 5. Nginx Reverse Proxy & SSL Configuration

### 5.1. CustomerPilot Nginx Configuration
File: `/etc/nginx/sites-available/customerpilot.in`

```nginx
# CustomerPilot Nginx Configuration
server {
    listen 80;
    listen [::]:80;
    server_name customerpilot.in www.customerpilot.in;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name customerpilot.in www.customerpilot.in;

    ssl_certificate /etc/letsencrypt/live/customerpilot.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/customerpilot.in/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

### 5.2. Enable Site and Reload Nginx
```bash
ln -sf /etc/nginx/sites-available/customerpilot.in /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 5.3. Let's Encrypt SSL Installation (Certbot)
```bash
certbot --nginx -d customerpilot.in -d www.customerpilot.in --non-interactive --agree-tos -m admin@customerpilot.in
```

---

## 6. Cloudflare Integration & DNS Settings

### 6.1. Nameservers
- **Nameserver 1**: `athena.ns.cloudflare.com`
- **Nameserver 2**: `wilson.ns.cloudflare.com`

### 6.2. DNS A Records Table
| Type | Name | Content / IPv4 | Proxy Status | TTL |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `customerpilot.in` | `187.127.170.36` | **Proxied (Orange Cloud)** | Auto |
| **A** | `www` | `187.127.170.36` | **Proxied (Orange Cloud)** | Auto |
| **TXT**| `customerpilot.in` | `google-site-verification=...` | DNS only | Auto |

### 6.3. SSL/TLS Settings
- **Encryption Mode**: `Full` (Cloudflare connects to origin port 443 over valid SSL).
- **Edge Certificates**: Universal SSL (Automatic).
- **Always Use HTTPS**: `ON`.
- **Minimum TLS Version**: `TLS 1.2`.

---

## 7. Daily Operations & Maintenance Cheat-Sheet

| Task | Command Line |
| :--- | :--- |
| **View Live Status** | `pm2 status` |
| **View Web Logs** | `pm2 logs customerpilot-web --lines 50` |
| **View Cron Logs** | `pm2 logs customerpilot-cron --lines 50` |
| **Restart Web App** | `pm2 restart customerpilot-web` |
| **Reload Web App with Env Changes** | `pm2 restart customerpilot-web --update-env` |
| **Restart All Services** | `pm2 restart all` |
| **Test Nginx Config** | `nginx -t` |
| **Reload Nginx** | `systemctl reload nginx` |
| **Check SQLite Database Integrity** | `sqlite3 /var/www/CustomerPilot/prisma/dev.db "PRAGMA integrity_check;"` |
| **Backup SQLite Database** | `cp /var/www/CustomerPilot/prisma/dev.db /root/backups/dev_$(date +%Y%m%d_%H%M%S).db` |
| **Check System Memory & Disk** | `free -h && df -h` |

---

## 8. Rollback & Emergency Recovery Protocol

In the event of an unexpected build failure or regression:
1. **Restore Previous Standalone Artifacts**:
   ```bash
   cd /var/www/CustomerPilot
   # If backup bundle exists:
   tar -xzf customerpilot_backup.tar.gz
   pm2 restart customerpilot-web
   ```
2. **Database Rollback**:
   Restore SQLite from `/root/backups/dev_*.db`:
   ```bash
   cp /root/backups/dev_latest.db /var/www/CustomerPilot/prisma/dev.db
   cp /root/backups/dev_latest.db /var/www/CustomerPilot/.next/standalone/prisma/dev.db
   pm2 restart all
   ```
3. **Emergency Reboot**:
   `reboot` — systemd `pm2-root.service` automatically revives all apps, Nginx, and databases upon boot.

---

## 9. Master VPS Migration SOP (From Old VPS to Fresh VPS)

Whenever migrating CustomerPilot & CakeConnection from an old VPS to a brand-new Hostinger VPS instance, execute this strict 12-step Standard Operating Procedure (SOP):

### **Step 1: Backup & Export Everything from Old VPS**
Before terminating or disconnecting the old VPS:
1. **SQLite Database**: Backup `/var/www/CustomerPilot/prisma/dev.db` (contains all 11+ live merchants, stamp cards, customers, reports).
2. **PostgreSQL Database**: Export CakeConnection data via `pg_dump -U postgres cakeconnection > cakeconnection_backup.sql`.
3. **Environment Secrets**: Copy `/var/www/CustomerPilot/.env.production` and `/var/www/CakeConnection/next-app/.env`.
4. **Evolution API Sessions (Optional/Recommended)**: Archive Docker volume `/evolution/instances` or `/var/lib/docker/volumes/evolution_instances` if active WhatsApp sessions need to be preserved without merchant re-scan.

### **Step 2: Provision Fresh VPS Base System**
1. Install base utilities: `apt-get update && apt-get install -y curl wget git unzip build-essential ufw certbot python3-certbot-nginx`.
2. Configure UFW Firewall: Allow 22 (SSH), 80 (HTTP), 443 (HTTPS), then enable UFW.

### **Step 3: Setup Node.js 22 LTS & PM2**
1. Install Node.js v22 LTS via NodeSource (`setup_22.x`).
2. Install PM2 globally (`npm install -g pm2`).
3. Enable systemd boot persistence (`pm2 startup systemd -u root --hp /root`).

### **Step 4: Provision PostgreSQL 14 with Dual Databases**
1. Install `postgresql postgresql-contrib` and enable systemd service.
2. Create `cakeconnection` database for CakeConnection Next.js application.
3. Create `evolution_db` database and `evolution` user with password `EvoDb_Secure_2026!` for Evolution API v2.
4. Update `pg_hba.conf` and `listen_addresses` to permit local password authentication.

### **Step 5: Deploy Official Evolution API v2 via Docker**
1. Install Docker CE and Docker Compose plugin.
2. Create `/opt/evolution-api/docker-compose.yml` with:
   - Image: `evoapicloud/evolution-api:latest`
   - `network_mode: host` (zero-latency direct localhost:5432 PostgreSQL connection)
   - Expose port: `8080`
   - `DATABASE_ENABLED=true`, `DATABASE_PROVIDER=postgresql`
   - `restart: always`
3. Launch container (`docker compose up -d`) and assert HTTP 200 on `http://127.0.0.1:8080`.

### **Step 6: Deploy CustomerPilot Application Stack**
1. Sync repository to `/var/www/CustomerPilot` (ensuring platform-locked SWC/LightningCSS windows packages are excluded).
2. Install dependencies (`npm install --include=dev --no-audit`).
3. Mandatory: Verify `postcss.config.mjs` exists with `@tailwindcss/postcss` plugin (prevents unstyled raw HTML).
4. Restore SQLite database into `prisma/dev.db`.
5. Execute `npx prisma generate` to build Prisma client.
6. Run `npm run build` to generate Next.js 16 standalone bundle.
7. Sync `.next/static`, `public`, `prisma/dev.db`, and `.env.production` into `.next/standalone`.

### **Step 7: Deploy CakeConnection Application Stack**
1. Sync repository to `/var/www/CakeConnection`.
2. Run database migration (`npx prisma migrate deploy` or restore SQL dump).
3. Build production application (`npm run build`).

### **Step 8: Configure PM2 Process Daemons**
1. Start `customerpilot-web` on port 3000 (`PORT=3000 HOSTNAME=0.0.0.0 pm2 start server.js --name customerpilot-web`).
2. Start `customerpilot-cron` (`pm2 start scripts/localCronRunner.js --name customerpilot-cron`).
3. Start `cakeconnection` on port 3001 (`pm2 start npm --name cakeconnection -- start -- -p 3001`).
4. Save PM2 state: `pm2 save`.

### **Step 9: Configure Nginx Virtual Hosts & SSL**
1. Create `/etc/nginx/sites-available/customerpilot.in` proxying to `http://127.0.0.1:3000`.
2. Create `/etc/nginx/sites-available/cakeconnection.in` proxying to `http://127.0.0.1:3001`.
3. Enable sites, test config (`nginx -t`), and reload Nginx.
4. Issue Let's Encrypt certificates using Certbot.

### **Step 10: Switch Cloudflare DNS A-Records**
1. Update A record for `customerpilot.in` to point to the new VPS IP (`187.127.170.36`).
2. Update A record for `cakeconnection.in` to point to the new VPS IP (`187.127.170.36`).
3. Set SSL/TLS encryption mode to **Full** in Cloudflare dashboard.

### **Step 11: End-to-End Ground-Truth Testing Pipeline**
1. Verify live HTTP 200 on both domains:
   - `curl -I https://customerpilot.in`
   - `curl -I https://cakeconnection.in`
2. Run Playwright real-browser verification for:
   - Onboarding Step 2: WhatsApp QR code generation (`https://customerpilot.in/signup`).
   - Tailwind CSS bundle delivery (>350 KB).
   - Digital Business Cards (`/c/cake-connection`).
   - SuperAdmin and Merchant Dashboard authentication.

### **Step 12: Sync Deployment Tracker & Issues Log**
1. Update `Git Commit on VPS Live.txt` with active commit hash, new VPS IP, branch, and timestamp.
2. Append all technical findings and fixes to `RESOLVED_ISSUES_LOG.md`.

---

## 10. WhatsApp Session Migration & Reconnection Reality Protocol

### **The Technical Reality of WhatsApp Web / Baileys on a Fresh VPS**
WhatsApp connections are governed by the Signal Protocol (end-to-end encrypted cryptographic keys). In Evolution API v2:
- WhatsApp session keys (`creds.json`, noise keys, pre-keys) are stored inside the Evolution instance volume (`/evolution/instances`).
- CustomerPilot's database stores the merchant reference (`whatsappPhone`, `whatsappInstanceName`).

### **What Happens When Migrating to a Fresh VPS?**
1. **If `/evolution/instances` is NOT transferred**:
   - The newly deployed Evolution API instance has an empty keystore.
   - For all previous merchants (e.g. Pizza Da Dabha, Deep Pharmacy, Cake Connection), Evolution API returns:
     `{"ok": true, "status": "disconnected", "connected": false}`.
   - Existing WhatsApp sessions **DO NOT** carry over automatically without the session keystore files.
2. **Reconnection Process (Instant 10-Second Fix)**:
   - Merchant logs into `https://customerpilot.in/login`.
   - Navigates to **Dashboard ➔ Settings ➔ WhatsApp Connect** (or `/onboarding?step=2`).
   - Scans the newly generated QR code once using their store WhatsApp (Settings ➔ Linked Devices ➔ Link a Device).
   - Once scanned, Evolution API generates fresh cryptographic tokens, connects immediately (`connectionStatus: "open"`), and restores all automated WhatsApp messaging and stamp rewards.
3. **Seamless Migration Alternative (For Zero-Scan Migration)**:
   - If zero merchant re-scan is strictly required, the administrator must tar and transfer the entire `/evolution/instances` directory from the old VPS:
     ```bash
     # On Old VPS:
     tar -czf /tmp/evolution_instances.tar.gz -C /var/lib/docker/volumes/evolution_instances/_data .
     
     # On New VPS:
     tar -xzf /tmp/evolution_instances.tar.gz -C /var/lib/docker/volumes/evolution_api_evolution_instances/_data
     docker compose restart evolution-api
     ```
   - This restores active cryptographic sessions without requiring any merchant to scan again.

