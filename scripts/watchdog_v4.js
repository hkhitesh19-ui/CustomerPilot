#!/usr/bin/env node
// CustomerPilot Evolution Watchdog v4.3 (Plan B & Per-Shop Auto-Heal Guard)
// Node >= 18, zero external dependencies.
const fs = require('fs');
const { spawn } = require('child_process');

// Auto-load .env
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
const BASE = process.env.EVO_URL || 'http://127.0.0.1:8080';
const KEY = process.env.EVO_KEY;
const INTERVAL = +process.env.WD_INTERVAL || 60000;
const TIMEOUT = +process.env.WD_TIMEOUT || 15000;
const FAILS = +process.env.WD_FAILS || 2;
const COOLDOWN = +process.env.WD_COOLDOWN || 300000; // 5 min cooldown
const STREAM_WAIT = +process.env.WD_STREAM_WAIT || 75000; // 75 seconds window
const STATE = process.env.WD_STATE || '/var/lib/cp-watchdog/state.json';
const TG_TOKEN = process.env.TG_TOKEN, TG_CHAT = process.env.TG_CHAT;

// Per-Shop Auto-Heal Control
const AUTO_HEAL_SHOPS = (process.env.WD_AUTO_HEAL_SHOPS || '').split(',').map(s => s.trim()).filter(Boolean);
const GLOBAL_DRYRUN = process.env.WD_DRYRUN !== '0';

function isInstanceLive(name) {
  if (!GLOBAL_DRYRUN) return true; // Global auto-heal active
  return AUTO_HEAL_SHOPS.includes(name); // Specific shop auto-heal active
}

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
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT, text: 'CP Watchdog v4.3: ' + msg })
    });
  } catch (err) {
    log('Telegram alert dispatch fail:', err.message);
  }
}

const idToName = {};
const nameToId = {};
const streamPending = {};

async function instances() {
  const { ok, j } = await api('GET', '/instance/fetchInstances');
  if (!ok || !Array.isArray(j)) throw new Error('fetchInstances failed');
  return j.map(i => {
    const name = i.name || i.instance?.instanceName;
    const id = i.id || i.instance?.instanceId;
    if (name && id) {
      idToName[id] = name;
      nameToId[name] = id;
    }
    return {
      id,
      name,
      status: i.connectionStatus || i.instance?.status,
      num: String(i.ownerJid || i.instance?.owner || '').split('@')[0].split(':')[0],
      disconnectionCode: i.disconnectionReasonCode ?? i.instance?.disconnectionReasonCode,
      disconnectionReason: i.disconnectionObject ?? i.instance?.disconnectionObject,
    };
  }).filter(i => i.name);
}

// Active probe
async function probe(i) {
  if (!i.num) return i.status === 'open';
  try {
    const { ok, j } = await api('POST', `/chat/whatsappNumbers/${i.name}`, { numbers: [i.num] });
    return ok && Array.isArray(j);
  } catch { return false; }
}

// ── [Plan B Deterministic Recovery Execution] ──
async function recoverInstanceWithPlanB(instName) {
  const isLive = isInstanceLive(instName);
  log(`[Plan B] 🛠️ Initiating Recovery for ${instName} (Mode: ${isLive ? 'LIVE AUTO-HEAL' : 'DRYRUN ALERT ONLY'})...`);

  if (!isLive) {
    await alert(`[DRYRUN] ${instName} would execute Plan B: restart -> connect (no mutation taken)`);
    return false;
  }

  // Step 1: Execute Targeted Graceful Restart
  log(`[Plan B] 🔄 Step 1: Calling /instance/restart/${instName}...`);
  await api('POST', `/instance/restart/${instName}`).catch(e => log('restart err', e.message));
  await sleep(15000);

  let freshList = await instances().catch(() => []);
  let fresh = freshList.find(x => x.name === instName);
  if (fresh && fresh.status === 'open') {
    log(`[Plan B] ✅ Step 1 SUCCESS: ${instName} revived to OPEN status via restart.`);
    await alert(`✅ [Watchdog Plan B] ${instName} successfully recovered and is now OPEN.`);
    return true;
  }

  // Step 2: Restart did not reach open, try /instance/connect
  log(`[Plan B] ⚠️ Step 1 did not reach open (Status: ${fresh?.status}). Attempting Step 2: /instance/connect/${instName}...`);
  await api('GET', `/instance/connect/${instName}`).catch(e => log('connect err', e.message));
  await sleep(10000);

  freshList = await instances().catch(() => []);
  fresh = freshList.find(x => x.name === instName);
  if (fresh && fresh.status === 'open') {
    log(`[Plan B] ✅ Step 2 SUCCESS: ${instName} revived to OPEN status via connect.`);
    await alert(`✅ [Watchdog Plan B] ${instName} successfully reconnected and is now OPEN.`);
    return true;
  }

  // Step 3: All auto-recovery failed -> Critical Alert for Admin/Merchant
  log(`[Plan B] 🚨 Step 2 FAILED: ${instName} remains in status: ${fresh?.status}. Dispatching CRITICAL ALERT.`);
  await alert(`🚨 [CRITICAL ALERT] ${instName} cannot auto-recover! Status: ${fresh?.status}. Action Required: Please re-link WhatsApp device in CustomerPilot dashboard.`);
  return false;
}

// ── [Stream-Guard: Real-Time Docker Log Monitor] ──
function initStreamGuard() {
  log('[Stream-Guard] Initializing real-time Docker log monitor on evolution-api...');
  let logProc = null;
  let crashCount = 0;

  function spawnLogTail() {
    try {
      logProc = spawn('docker', ['logs', '-f', '--tail', '0', 'evolution-api']);
      logProc.stdout.on('data', handleLogChunk);
      logProc.stderr.on('data', handleLogChunk);

      logProc.on('error', (err) => {
        log('[Stream-Guard] Docker log process error:', err.message);
        if (++crashCount >= 3) {
          alert(`🚨 [Stream-Guard] Docker log watcher failed to attach: ${err.message}`);
        }
      });

      logProc.on('close', (code) => {
        log('[Stream-Guard] ⚠️ Docker log stream closed (code ' + code + '), respawning in 5s...');
        if (++crashCount >= 3) {
          alert(`⚠️ [Stream-Guard] Docker log watcher exited repeatedly with code ${code}.`);
        }
        setTimeout(spawnLogTail, 5000);
      });
    } catch (e) {
      log('[Stream-Guard] Failed to spawn docker logs:', e.message);
      setTimeout(spawnLogTail, 10000);
    }
  }

  function handleLogChunk(buf) {
    const text = buf.toString('utf8');
    const lines = text.split('\n');

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // 1. Detect Stream Error (STRICT: stream errored out / stream:error only, Bad MAC excluded)
      if (line.includes('stream errored out') || line.includes('"tag":"stream:error"')) {
        let matchedName = null;
        for (const [id, name] of Object.entries(idToName)) {
          if (line.includes(id) || line.includes(name)) {
            matchedName = name;
            break;
          }
        }

        const targetInstances = matchedName ? [matchedName] : Object.values(idToName);
        for (const instName of targetInstances) {
          if (!streamPending[instName]) {
            log(`[Stream-Guard] ⚠️ Stream error detected affecting ${instName}. Starting ${STREAM_WAIT / 1000}s recovery window...`);
            streamPending[instName] = {
              at: Date.now(),
              healed: false
            };

            setTimeout(async () => {
              const pending = streamPending[instName];
              if (!pending) return;

              if (pending.healed) {
                log(`[Stream-Guard] ✅ ${instName} self-healed naturally within ${STREAM_WAIT / 1000}s. No action needed.`);
                delete streamPending[instName];
                return;
              }

              // Failed to self-heal within 75s (Zombie stream)
              const s = (state[instName] ||= {});
              if (s.conflictLocked) {
                log(`[Stream-Guard] ${instName} recovery suppressed: Anti-Conflict lock active.`);
                delete streamPending[instName];
                return;
              }

              if (Date.now() - (s.lastRestart || 0) < COOLDOWN) {
                log(`[Stream-Guard] ${instName} recovery suppressed: Cooldown active (${COOLDOWN / 1000}s).`);
                delete streamPending[instName];
                return;
              }

              s.lastRestart = Date.now();
              await alert(`🛑 [Stream-Guard] ${instName} stream did NOT recover after ${STREAM_WAIT / 1000}s (Zombie socket detected).`);
              await recoverInstanceWithPlanB(instName);

              delete streamPending[instName];
              persist();
            }, STREAM_WAIT);
          }
        }
      }

      // 2. Detect Activity & Self-Healing Signals (STRICT: per-store isolation only)
      for (const [id, name] of Object.entries(idToName)) {
        if (streamPending[name] && !streamPending[name].healed) {
          if (line.includes(id) || line.includes(name)) {
            streamPending[name].healed = true;
            log(`[Stream-Guard] Inbound activity received specifically for ${name} -> Stream verified healed.`);
          }
        }
      }
    }
  }

  spawnLogTail();
}

const fails = { _api: 0 };
async function check(i) {
  const s = (state[i.name] ||= {});

  // Anti-Conflict Guard (Code 440 & 401)
  const isConflict = i.disconnectionCode === 440 || 
                     i.disconnectionCode === 401 ||
                     (typeof i.disconnectionReason === 'string' && i.disconnectionReason.toLowerCase().includes('conflict')) ||
                     (typeof i.disconnectionReason === 'object' && JSON.stringify(i.disconnectionReason).toLowerCase().includes('conflict'));

  if (isConflict) {
    if (!s.conflictLocked) {
      s.conflictLocked = true;
      s.conflictLockTime = Date.now();
      await alert(`🛑 [ANTI-CONFLICT GUARD] ${i.name} was disconnected due to Session Conflict (Code: ${i.disconnectionCode}). Auto-reconnect aborted to protect merchant phone.`);
    }
    return;
  }

  if (i.status === 'open' && s.conflictLocked) {
    delete s.conflictLocked;
    delete s.conflictLockTime;
    log(i.name, 'conflict lock cleared: instance is now open');
  }

  if (i.status === 'close') {
    if (s.conflictLocked) return;
    if (Date.now() - (s.lastCloseAlert || 0) > COOLDOWN) {
      s.lastCloseAlert = Date.now();
      await alert(`${i.name} status=close (unspecified reason)`);
      if (isInstanceLive(i.name)) {
        await api('GET', `/instance/connect/${i.name}`).catch(() => {});
      }
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

  await alert(`${i.name} probe failed consecutively -> Triggering Plan B recovery`);
  await recoverInstanceWithPlanB(i.name);
}

(async function main() {
  log('watchdog v4.3 start', {
    GLOBAL_DRYRUN,
    AUTO_HEAL_SHOPS,
    COOLDOWN,
    STREAM_WAIT
  });
  initStreamGuard();

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
