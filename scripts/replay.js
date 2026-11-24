// Layer 3: replay messages missed during downtime. Idempotent via seen-ids file.
const fs = require('fs');
const BASE = process.env.EVO_URL || 'http://localhost:8080';
const KEY = process.env.EVO_KEY;
const HOOK = process.env.CP_WEBHOOK_URL || 'https://customerpilot.in/api/webhook/evolution';
const SEEN = process.env.WD_SEEN || '/var/lib/cp-watchdog/seen.json';

const load = () => { try { return new Set(JSON.parse(fs.readFileSync(SEEN))); } catch { return new Set(); } };
const save = (s) => fs.writeFileSync(SEEN, JSON.stringify([...s].slice(-5000)));

async function replay(name, sinceSec) {
  const r = await fetch(`${BASE}/chat/findMessages/${name}`, {
    method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ where: { key: { fromMe: false } }, limit: 200 }),
  });
  const j = await r.json();
  const list = Array.isArray(j) ? j : j?.messages?.records || j?.records || [];
  const seen = load(); let sent = 0;
  for (const m of list) {
    const id = m?.key?.id, jid = m?.key?.remoteJid || '';
    const ts = Number(m?.messageTimestamp || 0);
    if (!id || seen.has(id) || m.key.fromMe || jid.endsWith('@g.us') || jid === 'status@broadcast') continue;
    if (ts < sinceSec) continue;
    const res = await fetch(HOOK, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'messages.upsert', instance: name, data: m, replayed: true }),
    });
    if (res.ok) { seen.add(id); sent++; }
  }
  save(seen);
  return sent;
}
module.exports = { replay };
