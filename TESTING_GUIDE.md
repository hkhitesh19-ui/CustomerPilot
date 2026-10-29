# CustomerPilot - Local Manual Testing Guide

Jab bhi aap apna laptop chalu karke manually CustomerPilot ka End-to-End test karna chahe (QR scan se lekar Google Review tak), to aapko in **4 Servers** ko background me chalana zaroori hai.

In chaaro commands ko alag-alag terminal (PowerShell/CMD) me run karein:

### 1. Main Next.js Server (Frontend & Backend)
Ye aapka main application server hai.
```bash
npm run dev
```
*(Access at: http://localhost:3000)*

### 2. Pinggy Tunnel (Evolution API Webhook Bridge)
Ye script Pinggy ko connect karti hai taaki WhatsApp (Evolution API) ke messages aapke local PC par aa sakein.
```bash
node scripts/autoPinggySync.js
```
*(Ye script har 55 minutes me naya URL banayegi aur automatically Evolution me update kar degi. Isko bas chalu karke chod dijiye.)*

### 3. Local Cron Runner (For Delayed Messages like Google Review)
Production me Vercel apne aap Cron jobs run karta hai (jaise 5 min baad Review link bhejna). Local testing me is script ko chalana zaroori hai taaki wo pending messages ko har minute check karke bhej sake.
```bash
node scripts/localCronRunner.js
```

### 4. Prisma Studio (Database Viewer)
Ye aapko live Database dekhne me madad karta hai (jaise customers, waiting list, aur messages). Testing ke doran live records verify karne ke liye isko hamesha chalu rakhein.
```bash
npx prisma studio
```
*(Access at: http://localhost:5555)*
