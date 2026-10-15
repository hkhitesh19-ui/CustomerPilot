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
            ┌──────────────┴──────────────┐
            ▼                             ▼
    PM2 Process Daemon            PM2 Process Daemon
  (customerpilot-web :3000)      (cakeconnection :3001)
  (customerpilot-cron)
            │                             │
            ▼                             ▼
   SQLite Database (dev.db)      PostgreSQL 14 (Port 5432)
   11 Live Merchants Data        Database: `cakeconnection`
```

---

## 2. Server Specifications & Port Mapping

| Service | Technology | Port / Bind | Working Directory | Process Manager |
| :--- | :--- | :--- | :--- | :--- |
| **CustomerPilot Web** | Next.js 16 (Standalone) | `127.0.0.1:3000` | `/var/www/CustomerPilot/.next/standalone` | PM2 (`customerpilot-web`) |
| **CustomerPilot Cron** | Node.js Background Runner | Background | `/var/www/CustomerPilot` | PM2 (`customerpilot-cron`) |
| **CakeConnection Web** | Next.js Production | `127.0.0.1:3001` | `/var/www/CakeConnection/next-app` | PM2 (`cakeconnection`) |
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

### 3.4. PostgreSQL 14 Setup (For CakeConnection)
```bash
apt-get install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

# Create Database and Set Password
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'CakeConnectionStrongDbPassword2026!';"
sudo -u postgres psql -c "CREATE DATABASE cakeconnection;"
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

# Environment Secrets
cp .env .next/standalone/.env
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
