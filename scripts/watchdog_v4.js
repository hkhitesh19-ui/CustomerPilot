#!/usr/bin/env node
// CustomerPilot Evolution Watchdog v4 (Anti-Conflict Guard Edition)
// Node >= 18, zero deps.
const fs = require('fs');

// Auto-load .env if running standalone or under PM2 without dotenv
for (const envPath of ['/opt/cp-watchdog/.env', '/etc/cp-watchdog/cp-watchdog.env', '.env']) {
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.trim().match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
      }
    }
  }
}

const { replay } = require('./replay');
const BASE = process.env.EVO_URL || 'http://localhost:8080';
const KEY = process.env.EVO_KEY;
const INTERVAL = +process.env.WD_INTERVAL || 60000;
const TIMEOUT = +process.env.WD_TIMEOUT || 15000;
const FAILS = +process.env.WD_FAILS || 2;
const COOLDOWN = +process.env.WD_COOLDOWN || 3600000; // 1 hour cooldown between restarts to prevent flapping
const STATE = process.env.WD_STATE || '/var/lib/cp-watchdog/state.json';
const DRYRUN = process.env.WD_DRYRUN !== '0';   // default ON: alert only, never restart
const REPLAY = process.env.WD_REPLAY === '1';   // default OFF until webhook dedup confirmed
const TG_TOKEN = process.env.TG_TOKEN, TG_CHAT = process.env.TG_CHAT;
if (!KEY) { console.error('EVO_KEY required'); process.exit(1); }

const log = (...a) => console.log(new Date().toISOString(), ...a);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let state = {}; try { state = JSON.parse(fs.readFileSync(STATE)); } catch {}
const persist = () => { try { fs.mkdirSync(require('path').dirname(STATE), { recursive: true }); fs.writeFileSync(STATE, JSON.stringify(state)); } catch (e) { log('state save fail', e.message); } };

async function api(method, path, body) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), TIMEOUT);
  try {
    const r = await fetch(BASE + path, { method, signal: ac.signal,
      headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const txt = await r.text(); let j; try { j = JSON.parse(txt); } catch { j = txt; }
    return { ok: r.ok, j };
  } finally { clearTimeout(t); }
}

async function alert(msg) {
  log('ALERT', msg);
  if (!TG_TOKEN || !TG_CHAT) return;
  try { await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: TG_CHAT, text: 'CP Watchdog v4: ' + msg }) }); } catch {}
}

async function instances() {
  const { ok, j } = await api('GET', '/instance/fetchInstances');
  if (!ok || !Array.isArray(j)) throw new Error('fetchInstances failed');
  return j.map(i => ({
    name: i.name || i.instance?.instanceName,
    status: i.connectionStatus || i.instance?.status,
    num: String(i.ownerJid || i.instance?.owner || '').split('@')[0].split(':')[0],
    disconnectionCode: i.disconnectionReasonCode ?? i.instance?.disconnectionReasonCode,
    disconnectionReason: i.disconnectionObject ?? i.instance?.disconnectionObject,
  })).filter(i => i.name);
}

// Active probe: a zombie socket still reports "open", so exercise it.
async function probe(i) {
  if (!i.num) return i.status === 'open';
  try {
    const { ok, j } = await api('POST', `/chat/whatsappNumbers/${i.name}`, { numbers: [i.num] });
    return ok && Array.isArray(j);
  } catch { return false; }
}

const fails = { _api: 0 };
async function check(i) {
  const s = (state[i.name] ||= {});

  // ── [Anti-Conflict Guard: Session Replacement Trap (Code 440 & 401)] ──
  const isConflict = i.disconnectionCode === 440 || 
                     i.disconnectionCode === 401 ||
                     (typeof i.disconnectionReason === 'string' && i.disconnectionReason.toLowerCase().includes('conflict')) ||
                     (typeof i.disconnectionReason === 'object' && JSON.stringify(i.disconnectionReason).toLowerCase().includes('conflict'));

  if (isConflict) {
    if (!s.conflictLocked) {
      s.conflictLocked = true;
      s.conflictLockTime = Date.now();
      await alert(`🛑 [WATCHDOG v4 ANTI-CONFLICT GUARD] ${i.name} was disconnected due to Session Conflict (Code: ${i.disconnectionCode}). Auto-reconnect aborted to prevent socket battle with merchant device.`);
    }
    log(i.name, 'conflict-locked: auto-reconnect permanently suppressed until manual re-pair.');
    return;
  }

  // Clear conflict lock if merchant successfully reconnected and instance is open
  if (i.status === 'open' && s.conflictLocked) {
    delete s.conflictLocked;
    delete s.conflictLockTime;
    log(i.name, 'conflict lock cleared: instance is now open');
  }

  if (i.status === 'close') {
    if (s.conflictLocked) return;
    if (Date.now() - (s.lastCloseAlert || 0) > COOLDOWN) {
      s.lastCloseAlert = Date.now();
      await alert(`${i.name} status=close (unspecified reason)` + (DRYRUN ? ' [DRYRUN: no reconnect]' : ' -> trying connect'));
      if (!DRYRUN) await api('GET', `/instance/connect/${i.name}`).catch(() => {});
    }
    return;
  }

  if (i.status && i.status !== 'open' && i.status !== 'connecting') return;

  if (await probe(i)) {
    fails[i.name] = 0; s.lastOk = Math.floor(Date.now() / 1000); delete s.downSince; return;
  }

  fails[i.name] = (fails[i.name] || 0) + 1;
  s.downSince ||= s.lastOk || Math.floor(Date.now() / 1000) - 600;
  log(i.name, 'probe fail', fails[i.name]);
  if (fails[i.name] < FAILS) return;
  if (Date.now() - (s.lastRestart || 0) < COOLDOWN) return;
  s.lastRestart = Date.now();

  if (DRYRUN) { await alert(`[DRYRUN] ${i.name} zombie detected, would restart (no action taken)`); return; }
  if (s.conflictLocked) {
    log(i.name, 'restart aborted: conflict lock active');
    return;
  }

  await alert(`${i.name} zombie -> restarting instance`);
  await api('POST', `/instance/restart/${i.name}`);
  await sleep(20000);
  const fresh = (await instances()).find(x => x.name === i.name) || i;
  if (await probe(fresh)) {
    const n = REPLAY ? await replay(i.name, s.downSince).catch(e => { log('replay err', e.message); return -1; }) : 'skipped (WD_REPLAY=0)';
    await alert(`${i.name} recovered. Replay: ${n}`);
    fails[i.name] = 0; delete s.downSince;
  } else {
    await alert(`${i.name} STILL DOWN after restart. Backing off for 1 hour`);
  }
}

(async function main() {
  log('watchdog v4 start', { DRYRUN, REPLAY, COOLDOWN });
  for (;;) {
    try {
      for (const i of await instances()) await check(i).catch(e => log(i.name, 'err', e.message));
      fails._api = 0; persist();
    } catch (e) {
      log('loop err', e.message);
      if (++fails._api >= 5) { await alert('Evolution API unreachable'); fails._api = 0; }
    }
    await sleep(INTERVAL);
  }
})();
