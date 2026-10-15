# CustomerPilot & CakeConnection — Master Credentials & Secrets Vault

> ⚠️ **CONFIDENTIAL & SENSITIVE**: This vault contains production infrastructure credentials, database passwords, API keys, and secret tokens. Keep this file secure and never commit it to public repositories.

---

## 1. Hostinger VPS Production Server (Ubuntu 22.04 LTS)

| Property | Value / Credential | Purpose / Notes |
| :--- | :--- | :--- |
| **Server Hostname** | `srv2064145.hstgr.cloud` | Hostinger KVM 1 VPS |
| **Public IP Address** | **`187.127.170.36`** | Live Production Server IP |
| **Data Center Location** | Mumbai 2, India | Low latency for Indian merchants |
| **SSH Username** | `root` | Root administrator account |
| **SSH Port** | `22` | Open on UFW |
| **SSH Password** | `Nilsky@202627` | Production root access password |
| **SSH Command** | `ssh root@187.127.170.36` | Direct terminal connection |

---

## 2. Cloudflare Global Network & DNS Management

| Property | Value / Credential | Purpose / Notes |
| :--- | :--- | :--- |
| **Cloudflare Account ID** | `300bb7f3583a8ade508c64eabd1d1f1c` | Account identifier |
| **Account Email** | `hk.hitesh19@gmail.com` | Primary admin email |
| **Nameserver 1** | `athena.ns.cloudflare.com` | Primary Anycast DNS |
| **Nameserver 2** | `wilson.ns.cloudflare.com` | Secondary Anycast DNS |
| **SSL/TLS Mode** | `Full` | Encrypts end-to-end with VPS Let's Encrypt |
| **Universal SSL** | Active (Issued) | Edge SSL certificate for `*.customerpilot.in` |

---

## 3. Domain Registrars

| Domain | Purchased From | Management Dashboard | Active Nameservers |
| :--- | :--- | :--- | :--- |
| **`customerpilot.in`** | **HostingRaja.com** | `clients.hostingraja.in` | `athena.ns.cloudflare.com`, `wilson.ns.cloudflare.com` |
| **`cakeconnection.in`** | **BigRock.com** | BigRock Domain Control Panel | `athena.ns.cloudflare.com`, `wilson.ns.cloudflare.com` |

---

## 4. Databases & Storage

### 4.1. CustomerPilot Database (SQLite 3)
| Property | Value | Notes |
| :--- | :--- | :--- |
| **Engine** | SQLite 3 via Prisma ORM | Embedded high-performance DB |
| **Live Database Path** | `/var/www/CustomerPilot/prisma/dev.db` | Contains 11 live merchants data |
| **Standalone Path** | `/var/www/CustomerPilot/.next/standalone/prisma/dev.db` | Synchronized for Next.js runtime |
| **Environment Variable** | `DATABASE_URL="file:./dev.db"` | Defined in `.env` and `.env.production` |

### 4.2. CakeConnection Database (PostgreSQL 14)
| Property | Value | Notes |
| :--- | :--- | :--- |
| **Engine** | PostgreSQL 14 | Native systemd service |
| **Database Host / Port** | `127.0.0.1:5432` | Local Unix socket / TCP |
| **Database Name** | `cakeconnection` | 10 tables + initial catalog seed |
| **Database User** | `postgres` | Superuser |
| **Database Password** | `CakeConnectionStrongDbPassword2026!` | Production DB password |
| **Connection String** | `postgresql://postgres:CakeConnectionStrongDbPassword2026!@localhost:5432/cakeconnection` | Production connection string |

---

## 5. Application Secrets & Authentication

| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `NEXTAUTH_SECRET` | `f8a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6` | Session encryption & token signing |
| `NEXTAUTH_URL` | `https://customerpilot.in` | Canonical auth base URL |
| `JWT_SECRET` | `cp_build_secret_key_2026_jwt_auth_token_secure` | Custom JWT token authentication |
| `CRON_SECRET` | `cron_secret_customerpilot_2026` | Authorization header for cron triggers |

---

## 6. WhatsApp Gateway (Evolution API)

| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `EVOLUTION_API_URL` | `http://187.127.170.36:8080` | Evolution API server gateway |
| `EVOLUTION_API_KEY` | `Evo_Api_Key_Secure_998877!` | Global Evolution API manager key |
| `EVOLUTION_INSTANCE`| `cp_default` | Default instance identifier |
| `EVOLUTION_WEBHOOK_SECRET` | `webhook_secret_customerpilot_v22` | Webhook verification signature |
| `WHATSAPP_BOT_NUMBER` | `919033304707` | Central CustomerPilot bot number |

---

## 7. Google OAuth & Google Cloud Console

| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `GOOGLE_CLIENT_ID` | `391546314644-o8ep4jj3v9icce1fd1h7reu6a55lsui5.apps.googleusercontent.com` | Google Sign-In OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | `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` | Google OAuth secret |
| `GOOGLE_PLACES_API_KEY` | *(Set in GCP Console)* | Google Places & Maps API |

---

## 8. Artificial Intelligence Engines

| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `AI_API_URL` | `https://api.groq.com/openai/v1/chat/completions` | Groq High-Speed Inference API |
| `AI_API_KEY` | `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` | Production Groq API key |
| `AI_MODEL` | `llama-3.3-70b-versatile` | Ultra-fast Llama 3.3 70B model |
| `GEMINI_API_KEY` | *(Optional Fallback)* | Google Gemini AI |

---

## 9. Transactional Email (Resend SMTP)

| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `SMTP_HOST` | `smtp.resend.com` | Resend SMTP endpoint |
| `SMTP_PORT` | `587` | TLS port |
| `SMTP_USER` | `resend` | SMTP username |
| `SMTP_PASS` | `re_f3D1dUTp_EiKsvTf7HzCxuyhJ87t5xXbZ` | Resend API / SMTP password |
| `SMTP_FROM` | `noreply@customerpilot.in` | Verified sending address |

---

## 10. Payment Gateway (Razorpay Live)

| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `RAZORPAY_KEY_ID` | `rzp_live_TaCvfqvIMOML9j` | Razorpay Live API Key ID |
| `RAZORPAY_KEY_SECRET` | `hzNqzfbb93IWPdYN1154yBzB` | Razorpay Live Secret Key |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_live_TaCvfqvIMOML9j` | Frontend checkout client key |
