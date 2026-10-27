// =====================================================================
//   𝗗𝗘𝗩𝗜𝗟𝗫𝗦 — WhatsApp Bot | Single File
//   Bot By HironiLN
// =====================================================================
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  downloadMediaMessage,
  normalizeMessageContent,
  getContentType,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execFile } = require('child_process');
const crypto = require('crypto');

// ============ NODE VERSION CHECK + FETCH POLYFILL ============
const NODE_MAJOR = parseInt(process.versions.node.split('.')[0], 10);
if (NODE_MAJOR < 18) {
  try {
    const nf = require('node-fetch');
    global.fetch = nf;
    global.Headers = nf.Headers;
    global.Request = nf.Request;
    global.Response = nf.Response;
  } catch {
    console.error('\x1b[31m❌ Butuh Node.js 18+ atau install: npm i node-fetch@2\x1b[0m');
    process.exit(1);
  }
}

function safeRequire(name, hint) {
  try { return require(name); }
  catch { throw new Error(`❌ Modul "${name}" belum terinstall.\n💡 Jalankan: ${hint || 'npm i ' + name}`); }
}

// ================= KONFIGURASI | Jangan di sentuh kecuali nomor owner =================
const BOT_NAME = '𝗗𝗘𝗩𝗜𝗟𝗫𝗦';// jangan di ubah jika tidak mau lihat error
const PREFIX = '.';
const OWNER_NUMBER = '6285119654305'; 
const STICKER_PACK = 'DEVILXS';// jangan di ubah jika tidak mau lihat error
const STICKER_AUTHOR = 'Bot By HironiLN';
const SURVEY_EXPIRE_MS = 24 * 60 * 60 * 1000;// jangan di ubah jika tidak mau lihat error
const FOOTER_TEXT = '\n\n_🤖 Bot By HironiLN_';
const BANNER_URL = 'https://i.ibb.co/1GZ2TD5N/Chat-GPT-Image-19-Okt-2026-23-19-31.png';// Boleh diubah upload gamba mu di web terus salin link gambar nya

//PERINGATAN KERAS - Jangan di ubah code di bawah ini misal kamu nuub coding jika error berati lu nya ubah///

const DEFAULT_LIMIT = 20;
const TZ_OFFSET_MS = 7 * 60 * 60 * 1000; // WIB
const COOLDOWN_MS = 1500;                // jeda antar perintah per user
const META_TTL = 5 * 60 * 1000;          // cache data grup (5 menit)

// ---- Ucapan otomatis ----
const AUTO_GREET_GROUP = true;           // kirim ucapan terjadwal ke grup
const AUTO_GREET_PRIVATE = true;         // sapa user di chat pribadi (1x sehari)
const GREET_WINDOW_MIN = 15;             // toleransi telat kirim (menit) jika bot baru nyala
const GREET_SLOTS = [                    // jam dalam WIB
  { id: 'pagi',  h: 6,  m: 0,  icon: '🌅', word: 'Selamat Pagi',
    lines: ['Semangat memulai hari! Jangan lupa sarapan ya 🍞', 'Awali hari dengan doa & senyuman 😊', 'Yuk berangkat sekolah/kuliah dengan semangat 📚'] },
  { id: 'siang', h: 12, m: 0,  icon: '☀️', word: 'Selamat Siang',
    lines: ['Waktunya istirahat & makan siang 🍛', 'Jangan lupa sholat Dzuhur ya 🕌', 'Setengah hari sudah terlewati, tetap semangat! 💪'] },
  { id: 'sore',  h: 15, m: 30, icon: '🌇', word: 'Selamat Sore',
    lines: ['Jangan lupa sholat Ashar & minum air putih 💧', 'Sore yang tenang, saatnya santai sejenak ☕', 'Sudah cek tugas hari ini? Yuk dicicil 📝'] },
  { id: 'malam', h: 19, m: 0,  icon: '🌙', word: 'Selamat Malam',
    lines: ['Waktunya istirahat, jangan begadang ya 😴', 'Jangan lupa sholat Isya & siapkan buku untuk besok 🎒', 'Terima kasih sudah berjuang hari ini ✨'] }
];

const VIP_INFO = [
  '💎 *Keuntungan VIP:* Limit tanpa batas',
  '💰 *Harga:* 7 hari = Rp5.000 | 30 hari = Rp15.000',
  `📩 *Beli VIP:* wa.me/${OWNER_NUMBER}`
];
// ===============================================

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sleepAnim = delay;
const logger = P({ level: 'silent' });
const c = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m',
  cyan: '\x1b[36m', magenta: '\x1b[35m', white: '\x1b[37m', bright: '\x1b[1m', dim: '\x1b[2m'
};
const rgb = (n) => `\x1b[38;5;${n}m`;
const GRAD = [45, 39, 33, 63, 99, 135, 171, 207, 171, 135, 99, 63, 33, 39];
const rainbow = (text) => [...text].map((ch, i) => rgb(GRAD[i % GRAD.length]) + ch).join('') + c.reset;

let spinTimer = null;
const log = (color, text) => {
  if (spinTimer) process.stdout.write('\r\x1b[K');
  const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
  console.log(`${c.dim}[${time}]${c.reset} ${color}${text}${c.reset}`);
};

// ================= TERMINAL ANIMASI (TERMUX) =================
const BANNER_BIG = [
  '  ██████╗ ███████╗██╗   ██╗██╗██╗     ██╗  ██╗███████╗',
  '  ██╔══██╗██╔════╝██║   ██║██║██║     ╚██╗██╔╝██╔════╝',
  '  ██║  ██║█████╗  ██║   ██║██║██║      ╚███╔╝ ███████╗',
  '  ██║  ██║██╔══╝  ╚██╗ ██╔╝██║██║      ██╔██╗ ╚════██║',
  '  ██████╔╝███████╗ ╚████╔╝ ██║███████╗██╔╝ ██╗███████║',
  '  ╚═════╝ ╚══════╝  ╚═══╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝'
];
const BANNER_SMALL = [
  '  █▀▄ █▀▀ █ █ █ █   ▀▄▀ █▀',
  '  █▄▀ ██▄ ▀▄▀ █ █▄▄ ▄▀▄ ▄█'
];

async function typeWriter(text, speed = 20, color = c.cyan) {
  process.stdout.write(color);
  for (let i = 0; i < text.length; i++) {
    process.stdout.write(text.charAt(i));
    if (speed) await sleepAnim(speed);
  }
  process.stdout.write(c.reset + '\n');
}

async function animateBanner() {
  const wide = (process.stdout.columns || 0) >= 60;
  const lines = wide ? BANNER_BIG : BANNER_SMALL;
  const pal = [196, 202, 208, 214, 220, 226, 46, 51, 45, 39, 201, 207];
  // efek glitch singkat
  for (let f = 0; f < 6; f++) {
    lines.forEach((l) => console.log(rgb(pal[Math.floor(Math.random() * pal.length)]) + c.bright + l + c.reset));
    await sleepAnim(90);
    process.stdout.write(`\x1b[${lines.length}A`);
  }
  // hasil akhir: gradient
  for (let i = 0; i < lines.length; i++) {
    process.stdout.write('\x1b[2K');
    console.log(rgb(GRAD[(i * 2) % GRAD.length]) + c.bright + lines[i] + c.reset);
    await sleepAnim(60);
  }
}

async function cyberLoading(text, duration = 1000) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const width = 20, delayTime = duration / width;
  console.log(`${rgb(214)}${text}${c.reset}`);
  for (let i = 0; i <= width; i++) {
    const pct = Math.round((i * 100) / width);
    const bar = rainbow('█'.repeat(i)) + c.dim + '░'.repeat(width - i) + c.reset;
    process.stdout.write(`\r${rgb(51)}${frames[i % frames.length]}${c.reset} ${bar} ${c.bright}${String(pct).padStart(3)}%${c.reset}`);
    await sleepAnim(delayTime);
  }
  process.stdout.write('\n');
}

async function bootStep(label, fn = () => sleepAnim(350)) {
  const f = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  const t = setInterval(() => process.stdout.write(`\r${rgb(51)}${f[i++ % f.length]}${c.reset} ${label}...`), 80);
  try {
    const out = await fn();
    clearInterval(t);
    process.stdout.write(`\r\x1b[K${c.green}✔${c.reset} ${label}${out ? c.dim + ' (' + out + ')' + c.reset : ''}\n`);
  } catch (e) {
    clearInterval(t);
    process.stdout.write(`\r\x1b[K${c.yellow}⚠${c.reset} ${label} ${c.dim}(${e.message})${c.reset}\n`);
  }
}

const startSpinner = (text) => {
  if (spinTimer) return;
  const f = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  let i = 0;
  spinTimer = setInterval(() => {
    process.stdout.write(`\r${c.magenta}${f[(i = (i + 1) % f.length)]} ${c.cyan}${text}${c.reset}   `);
  }, 100);
};
const stopSpinner = () => {
  if (!spinTimer) return;
  clearInterval(spinTimer);
  spinTimer = null;
  process.stdout.write('\r\x1b[K');
};

async function showPairing(code) {
  const pretty = (code.match(/.{1,4}/g) || [code]).join('-');
  console.log(`\n${c.green}╭─ 🔑 ${c.bright}PAIRING CODE${c.reset}`);
  process.stdout.write(`${c.green}│  ${c.reset}`);
  for (const ch of pretty) { process.stdout.write(c.yellow + c.bright + ch + c.reset); await sleepAnim(80); }
  console.log(`\n${c.green}╰─ ${c.cyan}WhatsApp > Perangkat Tertaut > Tautkan dengan Nomor Telepon Bot By HironiLn${c.reset}`);
  console.log(`${c.yellow}   ⚡ Masukkan kode di atas dengan cepat!${c.reset}\n`);
}

const stats = { cmd: 0, start: Date.now() };
async function showDashboard(me) {
  const rows = [
    `${rgb(46)}╭─ ✅ ${c.bright}BOT ONLINE${c.reset}`,
    `${rgb(46)}│${c.reset} ➤ Bot     : ${BOT_NAME}`,
    `${rgb(46)}│${c.reset} ➤ Nomor   : ${c.yellow}${num(me.user.id)}${c.reset}`,
    `${rgb(46)}│${c.reset} ➤ Prefix  : ${c.yellow}${PREFIX}${c.reset}`,
    `${rgb(46)}│${c.reset} ➤ Perintah: ${c.yellow}${new Set([...commands.values()]).size}${c.reset}`,
    `${rgb(46)}│${c.reset} ➤ Ucapan  : ${AUTO_GREET_GROUP ? c.green + 'AKTIF' : c.red + 'MATI'}${c.reset}`,
    `${rgb(46)}│${c.reset} ➤ RAM     : ${(process.memoryUsage().rss / 1048576).toFixed(0)} MB • Node ${process.versions.node}`,
    `${rgb(46)}╰─ ${c.cyan}Menunggu pesan...${c.reset}`
  ];
  console.log('');
  for (const r of rows) { console.log(r); await sleepAnim(60); }
  console.log('');
}

// ---------- Database ----------
const DB_FILE = path.join(__dirname, 'database.json');
let db = { groups: {}, pending: {}, users: {}, greeted: {} };
try { if (fs.existsSync(DB_FILE)) db = { ...db, ...JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) }; } catch {}
if (!db.users) db.users = {};
if (!db.greeted) db.greeted = {};
const writeDB = () => { try { fs.writeFileSync(DB_FILE, JSON.stringify(db)); } catch (e) { log(c.red, 'Gagal simpan DB: ' + e.message); } };
let saveTimer = null;
// Disimpan tertunda (debounce) agar respon bot tidak lambat karena tulis file terus-menerus
const saveDB = () => { if (saveTimer) return; saveTimer = setTimeout(() => { saveTimer = null; writeDB(); }, 800); };
process.on('exit', writeDB);
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

const groupDefaults = { welcome: true, goodbye: true, survey: true, antilink: false, greeting: true, welcomeText: null, byeText: null };
const getGroup = (id) => (db.groups[id] = { ...groupDefaults, warns: {}, ...(db.groups[id] || {}) });

// ---------- Waktu / Ucapan ----------
const wibNow = () => new Date(Date.now() + TZ_OFFSET_MS);
const today = () => wibNow().toISOString().slice(0, 10);
const clock = () => { const d = wibNow(); return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`; };
const dateID = () => wibNow().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const greetOf = () => {
  const h = wibNow().getUTCHours();
  if (h >= 4 && h < 11) return { w: 'Selamat pagi', i: '🌅' };
  if (h >= 11 && h < 15) return { w: 'Selamat siang', i: '☀️' };
  if (h >= 15 && h < 18) return { w: 'Selamat sore', i: '🌇' };
  return { w: 'Selamat malam', i: '🌙' };
};
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------- Limit & VIP ----------
const getUser = (key) => {
  let u = db.users[key];
  if (!u) u = db.users[key] = { limit: DEFAULT_LIMIT, day: today(), vip: 0 };
  if (u.day !== today()) { u.day = today(); u.limit = DEFAULT_LIMIT; }
  return u;
};
const isVip = (u) => u.vip > Date.now();
const resetIn = () => {
  const now = Date.now() + TZ_OFFSET_MS;
  const next = (Math.floor(now / 86400000) + 1) * 86400000;
  const s = Math.floor((next - now) / 1000);
  return `${Math.floor(s / 3600)}j ${Math.floor((s % 3600) / 60)}m`;
};
const fmtDate = (ms) => new Date(ms + TZ_OFFSET_MS).toISOString().slice(0, 16).replace('T', ' ') + ' WIB';

const TMP = path.join(__dirname, 'tmp');
fs.mkdirSync(TMP, { recursive: true });

const askQuestion = (q) => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(q, (a) => { rl.close(); resolve(a); });
});

// ============ LOGIN VERIFIKASI FREE BY HIRONI ============
const STARTUP_VERIFY_CODE = 'BTDEVIL';
const INTEGRITY_FILE = path.join(__dirname, '.hironi-integrity.sha256');

function getProtectedScriptHash() {
  const source = fs.readFileSync(__filename, 'utf8')
    // Mengizinkan perubahan nomor owner saja tanpa membatalkan integritas.
    .replace(/const OWNER_NUMBER = ['"][^'"]*['"];?/, "const OWNER_NUMBER = '<OWNER_NUMBER>'; ");
  return crypto.createHash('sha256').update(source).digest('hex');
}

function verifyScriptIntegrity() {
  if (!fs.existsSync(INTEGRITY_FILE)) {
    console.log(`${c.red}⛔ File integritas tidak ditemukan. Letakkan .hironi-integrity.sha256 di folder yang sama.${c.reset}`);
    process.exit(1);
  }
  const expected = fs.readFileSync(INTEGRITY_FILE, 'utf8').trim();
  const actual = getProtectedScriptHash();
  if (!/^[a-f0-9]{64}$/i.test(expected) || actual !== expected) {
    console.log(`\n${c.red}${c.bright}⛔ SCRIPT TELAH DIUBAH / INTEGRITAS GAGAL${c.reset}`);
    console.log(`${c.yellow}Script Free By Hironi tidak dijalankan. Jangan edit script; perubahan nomor owner saja diperbolehkan.${c.reset}\n`);
    process.exit(1);
  }
}

async function startupVerification() {
  console.clear();
  console.log(`${c.red}${c.bright}╔══════════════════════════════════════╗${c.reset}`);
  console.log(`${c.red}${c.bright}║        FREE BY HIRONI • DEVIL        ║${c.reset}`);
  console.log(`${c.red}${c.bright}╚══════════════════════════════════════╝${c.reset}`);
  console.log(`${c.yellow}Masukkan kode verifikasi dari owner script untuk membuka dashboard bot.${c.reset}`);
  for (let attempt = 1; attempt <= 3; attempt++) {
    const code = (await askQuestion(`${c.red}🔐 Kode Verifikasi: ${c.reset}`)).trim();
    if (code === STARTUP_VERIFY_CODE) {
      console.log(`${c.green}✅ Verifikasi berhasil. Selamat datang!${c.reset}\n`);
      return;
    }
    const remaining = 3 - attempt;
    if (remaining > 0) console.log(`${c.red}❌ Kode salah. Sisa percobaan: ${remaining}${c.reset}`);
  }
  console.log(`${c.red}⛔ Akses ditolak. Hubungi owner script By HironiLN.${c.reset}`);
  process.exit(1);
}


// ---------- Helper UI WhatsApp ----------
const num = (jid) => (jid || '').split('@')[0].split(':')[0];
const toJid = (n) => n.replace(/\D/g, '') + '@s.whatsapp.net';
const pj = (p) => (typeof p === 'string' ? p : (p.phoneNumber || p.id));
const pIds = (p) => (typeof p === 'string' ? [p] : [p.id, p.phoneNumber, p.lid]).filter(Boolean);
const box = (title, lines) => `╭───「 *${title}* 」───\n${lines.map(l => `│  ${l}`).join('\n')}\n╰──────────────────────`;
const runtime = () => {
  const s = Math.floor(process.uptime());
  return `${Math.floor(s / 86400)}h ${Math.floor((s % 86400) / 3600)}j ${Math.floor((s % 3600) / 60)}m ${s % 60}d`;
};
const isHttpUrl = (u) => { try { const x = new URL(u); return ['http:', 'https:'].includes(x.protocol); } catch { return false; } };
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const nf = (n, d = 6) => Number(n).toLocaleString('id-ID', { maximumFractionDigits: d });

const phoneKey = (jid, meta, alts = []) => {
  const cands = [jid, ...alts].filter(Boolean);
  const phoneJid = cands.find(j => j.endsWith('@s.whatsapp.net'));
  if (phoneJid) return num(phoneJid);
  if (meta) {
    const ids = cands.map(num);
    const p = meta.participants.find(pp => pIds(pp).map(num).some(i => ids.includes(i)));
    if (p && p.phoneNumber) return num(p.phoneNumber);
  }
  return num(cands[0]);
};

let sock;
let connected = false;

// Cache metadata grup + anti-dobel request (bikin menu & perintah grup lebih ngebut)
const metaCache = new Map();
const metaInflight = new Map();
async function getMeta(id, fresh = false) {
  const hit = metaCache.get(id);
  if (!fresh && hit && Date.now() - hit.t < META_TTL) return hit.v;
  if (metaInflight.has(id)) return metaInflight.get(id);
  const p = sock.groupMetadata(id)
    .then((v) => { metaCache.set(id, { v, t: Date.now() }); return v; })
    .catch((e) => { if (hit) return hit.v; throw e; })
    .finally(() => metaInflight.delete(id));
  metaInflight.set(id, p);
  return p;
}
const isAdminIn = (meta, jid) => {
  const n = num(jid);
  return meta.participants.some(p => p.admin && pIds(p).map(num).includes(n));
};
const isBotAdmin = (meta) => {
  const bots = [sock.user?.id, sock.user?.lid].filter(Boolean).map(num);
  return meta.participants.some(p => p.admin && pIds(p).map(num).some(i => bots.includes(i)));
};

function getContext(msg) {
  const content = normalizeMessageContent(msg.message);
  const t = getContentType(content);
  return content?.[t]?.contextInfo;
}
function getTargets(msg, args) {
  const ci = getContext(msg);
  if (ci?.mentionedJid?.length) return ci.mentionedJid;
  if (ci?.participant) return [ci.participant];
  const n = args.join('').replace(/\D/g, '');
  return n.length >= 8 ? [toJid(n)] : [];
}
function getQuotedText(msg) {
  const q = getContext(msg)?.quotedMessage;
  const n = q && normalizeMessageContent(q);
  return n?.conversation || n?.extendedTextMessage?.text || n?.imageMessage?.caption || n?.videoMessage?.caption || '';
}

async function getMedia(msg, wanted = ['imageMessage', 'videoMessage', 'stickerMessage']) {
  const content = normalizeMessageContent(msg.message);
  const type = getContentType(content);
  const opts = { logger, reuploadRequest: sock.updateMediaMessage };
  if (wanted.includes(type)) {
    return { type, buffer: await downloadMediaMessage(msg, 'buffer', {}, opts) };
  }
  const ci = content?.[type]?.contextInfo;
  if (!ci) return null;
  const q = ci.quotedMessage && normalizeMessageContent(ci.quotedMessage);
  const qt = q && getContentType(q);
  if (qt && wanted.includes(qt)) {
    const fake = {
      key: { remoteJid: msg.key.remoteJid, id: ci.stanzaId, fromMe: false, participant: ci.participant || msg.key.remoteJid },
      message: q
    };
    return { type: qt, buffer: await downloadMediaMessage(fake, 'buffer', {}, opts) };
  }
  return null;
}

async function withProgress(ctx, label, task) {
  const sent = await sock.sendMessage(ctx.from, { text: `⏳ ${label}...` }, { quoted: ctx.msg });
  try { return await task(); }
  finally { await sock.sendMessage(ctx.from, { delete: sent.key }).catch(() => {}); }
}

// ---------- Banner menu (di-cache agar menu cepat) ----------
let bannerBuf = null;
let bannerMime = 'image/jpeg';
async function prepareBanner() {
  const file = path.join(TMP, 'banner_' + crypto.createHash('md5').update(BANNER_URL).digest('hex').slice(0, 8) + '.img');
  let buf;
  if (fs.existsSync(file)) {
    buf = fs.readFileSync(file);
  } else {
    const r = await fetch(BANNER_URL, { headers: { 'user-agent': 'Mozilla/5.0' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    buf = Buffer.from(await r.arrayBuffer());
    try { // perkecil ukuran bila jimp tersedia -> upload ke WhatsApp jauh lebih cepat
      const jm = require('jimp');
      const Jimp = jm.Jimp || jm;
      const img = await Jimp.read(buf);
      if (jm.Jimp) {
        img.resize({ w: Math.min(720, img.width) });
        buf = await img.getBuffer('image/jpeg', { quality: 72 });
      } else {
        img.resize(Math.min(720, img.bitmap.width), Jimp.AUTO).quality(72);
        buf = await img.getBufferAsync('image/jpeg');
      }
    } catch {}
    fs.writeFileSync(file, buf);
  }
  bannerMime = buf[0] === 0x89 ? 'image/png' : 'image/jpeg';
  bannerBuf = buf;
  return (buf.length / 1024).toFixed(0) + ' KB';
}

// ---------- Downloader helpers ----------
function ytdlp(args) {
  return new Promise((resolve, reject) => {
    execFile(path.join(__dirname, 'yt-dlp'), ['--no-warnings', ...args], { timeout: 180000, maxBuffer: 1 << 24 }, (err, so, se) => {
      if (err) return reject(new Error((se || '').split('\n').filter(Boolean).pop() || err.message));
      resolve(so);
    });
  });
}
async function downloadWithYtdlp(url, audio) {
  if (!isHttpUrl(url)) throw new Error('URL tidak valid.');
  const id = String(Date.now());
  const out = path.join(TMP, `${id}.%(ext)s`);
  const mode = audio ? ['-x', '--audio-format', 'mp3', '--audio-quality', '5'] : ['-f', 'bv*[height<=720]+ba/b[height<=720]/b', '--merge-output-format', 'mp4'];
  await ytdlp([...mode, '--no-playlist', '--max-filesize', '80M', '-o', out, '--', url]);
  const f = fs.readdirSync(TMP).find(x => x.startsWith(id + '.'));
  if (!f) throw new Error('File tidak ditemukan / melebihi 80MB.');
  return path.join(TMP, f);
}
async function sendAndClean(from, file, kind, quoted, extra = {}) {
  try { await sock.sendMessage(from, { [kind]: fs.readFileSync(file), ...extra }, { quoted }); }
  finally { fs.unlink(file, () => {}); }
}
async function getJSON(url, opts) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' }, ...opts });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

// ================= REGISTRY PERINTAH =================
const commands = new Map();
const cmd = (names, opts, fn) => { for (const n of [].concat(names)) commands.set(n, { opts, fn }); };
const P_ = PREFIX;
const limitText = (x) => (x.unlimited ? '∞ Unlimited' : `${x.user.limit}/${DEFAULT_LIMIT}`);
const statusOf = (x) => (x.isOwner ? '👑 Owner' : isVip(x.user) ? '💎 VIP' : '👤 Free');

// ================= MENU (DATA-DRIVEN, CEPAT) =================
const MENU = [
  { k: 'download', a: ['dl', 'downloader'], icon: '📥', name: 'ᴅᴏᴡɴʟᴏᴀᴅᴇʀ', items: [
    'tiktok <url>', 'play <judul>', 'ytmp3 <url>', 'ytmp4 <url>', 'dl <url>  (IG/FB/X)'] },
  { k: 'sticker', a: ['stiker'], icon: '🎨', name: 'sᴛɪᴄᴋᴇʀ', items: [
    'sticker  /  s', 'toimg  (balas stiker)'] },
  { k: 'sekolah', a: ['belajar', 'kuliah', 'pelajar', 'edu'], icon: '📚', name: 'sᴇᴋᴏʟᴀʜ & ᴋᴜʟɪᴀʜ', items: [
    'rumus <topik>', 'unsur <nama/no/simbol>', 'konversi <jml> <dari> <ke>', 'ipk <A:3 B+:2 ...>',
    'rata <angka...>', 'kuadrat <a> <b> <c>', 'fpb <angka...>', 'kpk <angka...>', 'prima <angka>',
    'basis <angka> <dari> <ke>', 'romawi <angka/romawi>', 'persen <a> <b>', 'hitungkata <teks>',
    'apa <buku/web/jurnal> <data>', 'kamus <kata>', 'todo <add/list/done/del>',
    'pomodoro [fokus] [rehat]', 'hitungmundur <tgl> [nama]', 'motivasi'] },
  { k: 'tools', a: ['alat'], icon: '🧰', name: 'ᴛᴏᴏʟs', items: [
    'qr <teks>', 'tts <bhs> <teks>', 'tr <bhs> <teks>', 'cuaca <kota>', 'short <url>', 'ssweb <url>', 'calc <hitungan>'] },
  { k: 'tools2', a: ['toolsplus', 'plus'], icon: '🛠️', name: 'ᴛᴏᴏʟs ᴘʟᴜs', items: [
    'wiki <topik>', 'kurs <jml> <dari> <ke>', 'sholat <kota>', 'gempa', 'ip <ip/domain>', 'dns <domain>',
    'pass <panjang>', 'hash <algo> <teks>', 'base64 enc/dec', 'binary enc/dec', 'morse enc/dec',
    'fancy <teks>', 'reverse <teks>', 'jam [zona]', 'umur <tgl lahir>', 'zodiak <dd-mm>',
    'ytsearch <judul>', 'getpp [@user]'] },
  { k: 'game', a: ['games', 'permainan'], icon: '🎮', name: 'ɢᴀᴍᴇ', items: [
    'tebakangka', 'tebak <angka>', 'math [mudah/sedang/susah]', 'jawab <jawaban>', 'nyerah',
    'suit <batu/gunting/kertas>', 'slot', 'dadu [jml]', 'koin [kepala/ekor]', '8ball <tanya>', 'truth', 'dare', 'jodoh @a @b'] },
  { k: 'grup', a: ['group', 'admin'], icon: '👥', name: 'ɢʀᴜᴘ & ᴀᴅᴍɪɴ', items: [
    'tagall', 'hidetag <teks>', 'kick', 'add', 'promote', 'demote', 'open', 'close', 'linkgc', 'revoke',
    'setname', 'setdesc', 'groupinfo', 'warn', 'resetwarn'] },
  { k: 'atur', a: ['setting', 'pengaturan'], icon: '⚙️', name: 'ᴘᴇɴɢᴀᴛᴜʀᴀɴ ɢʀᴜᴘ', items: [
    'welcome on/off', 'goodbye on/off', 'survey on/off', 'antilink on/off', 'greeting on/off',
    'setwelcome <teks>', 'setbye <teks>', 'settings'] },
  { k: 'owner', a: ['own'], icon: '👑', name: 'ᴏᴡɴᴇʀ ᴏɴʟʏ', items: [
    'addvip <nomor/@tag> <hari>', 'delvip <nomor/@tag>', 'listvip', 'resetlimit <nomor/@tag/all>'] },
  { k: 'info', a: ['informasi'], icon: 'ℹ️', name: 'ɪɴғᴏ', items: [
    'limit', 'vip', 'ping', 'runtime', 'owner', 'sapa'] }
];
const renderCat = (m) => `╭─❮ ${m.icon} ${m.name} ❯\n${m.items.map(i => `│ ◦ ${P_}${i}`).join('\n')}\n╰──────────────────`;

const menuHeader = (x) => {
  const g = greetOf();
  return `┏━━━━━━━━━━━━━━━━━━━━━┓
┃   ✦ *${BOT_NAME}* ✦
┃   ᴘʀᴇᴍɪᴜᴍ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ By Hironi Ln
┗━━━━━━━━━━━━━━━━━━━━━┛
${g.i} *${g.w}, ${x.pushName}!*

╭─「 ✨ ɪɴꜰᴏ ᴜsᴇʀ 」
│ 🎟️ Limit   : ${limitText(x)}
│ 🏷️ Status  : ${statusOf(x)}
│ 📅 Tanggal : ${dateID()}
│ 🕒 Waktu   : ${clock()} WIB
│ ⏱️ Uptime  : ${runtime()}
│ 🔰 Prefix  : [ ${P_} ]
╰──────────────────`;
};
const menuIndex = () => `╭─「 📂 ᴅᴀꜰᴛᴀʀ ᴍᴇɴᴜ 」
${MENU.map((m, i) => `│ ${String(i + 1).padStart(2, '0')} ➜ ${m.icon} ${P_}menu ${m.k}`).join('\n')}
│ ──────────────
│ ✦ ${P_}menu all ➜ semua fitur
╰──────────────────

💡 _Ketik_ *${P_}menu <nama/nomor>* _untuk detail._
_Limit reset otomatis tiap 00:00 WIB._`;

// ---------- Umum ----------
cmd(['menu', 'help', 'start', 'allmenu'], { fast: true }, async (x) => {
  const q = (x.args[0] || '').toLowerCase();
  if (x.command === 'allmenu' || q === 'all' || q === 'semua') {
    return x.reply(menuHeader(x) + '\n\n' + MENU.map(renderCat).join('\n\n') + '\n\n_Limit reset otomatis tiap 00:00 WIB._');
  }
  if (q) {
    const m = MENU.find((e, i) => e.k === q || e.a.includes(q) || String(i + 1) === q);
    if (!m) return x.reply(`❌ Kategori tidak ada. Ketik *${P_}menu* untuk melihat daftar.`);
    return x.reply(renderCat(m) + `\n\n_Kembali: ${P_}menu_`);
  }
  const caption = menuHeader(x) + '\n\n' + menuIndex();
  if (bannerBuf) {
    try { return await sock.sendMessage(x.from, { image: bannerBuf, mimetype: bannerMime, caption }, { quoted: x.msg }); } catch {}
  }
  return x.reply(caption);
});
cmd('ping', { fast: true }, async (x) => {
  const t = Date.now() - ((x.msg.messageTimestamp ? Number(x.msg.messageTimestamp) : 0) * 1000);
  x.reply(box('PONG 🏓', [`⚡ Respon : ${t > 0 && t < 60000 ? t + ' ms' : '-'}`, `⏱️ Uptime : ${runtime()}`, `💾 RAM    : ${(process.memoryUsage().rss / 1048576).toFixed(0)} MB`]));
});
cmd('runtime', { fast: true }, (x) => x.reply(box('RUNTIME', [`⏱️ ${runtime()}`])));
cmd('owner', { fast: true }, (x) => x.reply(box('OWNER', [`👑 wa.me/${OWNER_NUMBER}`])));
cmd('tes', { fast: true }, (x) => x.reply(`Halo! Bot ${BOT_NAME} aktif.`));
cmd('sapa', { fast: true }, (x) => {
  const g = greetOf();
  x.reply(`${g.i} *${g.w}, ${x.pushName}!*\n💡 _${pick(MOTIVASI)}_`);
});

// ---------- Limit & VIP ----------
cmd(['limit', 'ceklimit', 'cekvip'], { fast: true }, (x) => {
  const lines = [`🎟️ Limit  : ${limitText(x)}`];
  if (x.isOwner) lines.push('👑 Status : Owner');
  else if (isVip(x.user)) lines.push('💎 Status : VIP', `📅 Berakhir : ${fmtDate(x.user.vip)}`);
  else lines.push('👤 Status : Free', `🔄 Reset dalam : ${resetIn()}`, `💎 Mau tanpa limit? ketik ${P_}vip`);
  x.reply(box('CEK LIMIT 🎟️', lines));
});
cmd(['vip', 'buyvip'], { fast: true }, (x) => x.reply(box('BELI VIP 💎', VIP_INFO)));

// ---------- Owner ----------
const parseTarget = (x) => {
  const ci = getContext(x.msg);
  const j = ci?.mentionedJid?.[0] || ci?.participant;
  if (j) return { key: phoneKey(j, x.meta), rest: x.args };
  return { key: (x.args[0] || '').replace(/\D/g, ''), rest: x.args.slice(1) };
};
cmd('addvip', { owner: true }, async (x) => {
  const { key, rest } = parseTarget(x);
  if (!key || key.length < 8) return x.usage(`Contoh: ${P_}addvip 628xxxxxxxx 30`);
  const d = parseInt(rest[rest.length - 1], 10);
  const days = Number.isFinite(d) && d > 0 ? d : 30;
  const u = getUser(key);
  u.vip = Math.max(u.vip, Date.now()) + days * 86400000;
  saveDB();
  x.reply(box('VIP DITAMBAH 💎', [`👤 ${key}`, `⏳ +${days} hari`, `📅 Berakhir : ${fmtDate(u.vip)}`]));
});
cmd('delvip', { owner: true }, async (x) => {
  const { key } = parseTarget(x);
  if (!key || key.length < 8) return x.usage(`Contoh: ${P_}delvip 628xxxxxxxx`);
  getUser(key).vip = 0; saveDB();
  x.reply(`✅ VIP milik ${key} dicabut.`);
});
cmd('listvip', { owner: true }, async (x) => {
  const list = Object.entries(db.users).filter(([, u]) => isVip(u));
  if (!list.length) return x.reply('Belum ada user VIP aktif.');
  x.reply(box(`LIST VIP 💎 (${list.length})`, list.map(([k, u], i) => `${i + 1}. ${k} → ${fmtDate(u.vip)}`)));
});
cmd('resetlimit', { owner: true }, async (x) => {
  if ((x.args[0] || '').toLowerCase() === 'all') {
    Object.values(db.users).forEach(u => { u.limit = DEFAULT_LIMIT; u.day = today(); });
    saveDB();
    return x.reply('✅ Limit semua user direset.');
  }
  const { key } = parseTarget(x);
  if (!key || key.length < 8) return x.usage(`Contoh: ${P_}resetlimit 628xxxxxxxx  atau  ${P_}resetlimit all`);
  const u = getUser(key); u.limit = DEFAULT_LIMIT; saveDB();
  x.reply(`✅ Limit ${key} direset menjadi ${DEFAULT_LIMIT}.`);
});

// ---------- Downloader ----------
cmd('tiktok', { limit: 1 }, async (x) => {
  if (!isHttpUrl(x.text)) return x.usage(`Contoh: ${P_}tiktok https://vt.tiktok.com/xxxx`);
  await withProgress(x, 'Mengunduh TikTok', async () => {
    const r = await fetch('https://www.tikwm.com/api/', {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ url: x.text, hd: '1' })
    });
    const j = await r.json();
    if (!j?.data) throw new Error('Video tidak ditemukan.');
    const d = j.data;
    const caption = box('TIKTOK 🎵', [`👤 ${d.author?.nickname || '-'}`, `📝 ${(d.title || '-').slice(0, 120)}`]);
    if (Array.isArray(d.images) && d.images.length) {
      for (const [i, img] of d.images.slice(0, 10).entries()) await sock.sendMessage(x.from, { image: { url: img }, caption: i === 0 ? caption : '' }, { quoted: x.msg });
    } else {
      await sock.sendMessage(x.from, { video: { url: d.hdplay || d.play }, caption }, { quoted: x.msg });
    }
  });
});
cmd('play', { limit: 1 }, async (x) => {
  if (!x.text) return x.usage(`Contoh: ${P_}play judul lagu`);
  const yts = safeRequire('yt-search', 'npm i yt-search');
  await withProgress(x, 'Mencari & mengunduh lagu', async () => {
    const v = (await yts(x.text)).videos?.[0];
    if (!v) throw new Error('Lagu tidak ditemukan.');
    if (v.seconds > 900) throw new Error('Durasi maks 15 menit.');
    await sock.sendMessage(x.from, { image: { url: v.thumbnail }, caption: box('PLAY 🎧', [`🎵 ${v.title}`, `👤 ${v.author?.name}`, `⏱️ ${v.timestamp}`]) }, { quoted: x.msg });
    const file = await downloadWithYtdlp(v.url, true);
    await sendAndClean(x.from, file, 'audio', x.msg, { mimetype: 'audio/mpeg' });
  });
});
cmd('ytmp3', { limit: 1 }, async (x) => {
  if (!isHttpUrl(x.text)) return x.usage(`Contoh: ${P_}ytmp3 https://youtu.be/xxxx`);
  await withProgress(x, 'Mengunduh audio', async () => {
    const file = await downloadWithYtdlp(x.text, true);
    await sendAndClean(x.from, file, 'audio', x.msg, { mimetype: 'audio/mpeg' });
  });
});
cmd(['ytmp4', 'dl', 'ig', 'fb', 'twitter'], { limit: 1 }, async (x) => {
  if (!isHttpUrl(x.text)) return x.usage(`Contoh: ${P_}${x.command} https://link-video`);
  await withProgress(x, 'Mengunduh video', async () => {
    const file = await downloadWithYtdlp(x.text, false);
    await sendAndClean(x.from, file, 'video', x.msg, { caption: '✅ Selesai diunduh' });
  });
});

// ---------- Sticker ----------
cmd(['sticker', 's', 'stiker'], { limit: 1 }, async (x) => {
  const media = await getMedia(x.msg, ['imageMessage', 'videoMessage']);
  if (!media) return x.usage(`Kirim/balas foto/video dengan *${P_}sticker*`);
  const { Sticker, StickerTypes } = safeRequire('wa-sticker-formatter', 'npm i wa-sticker-formatter');
  const [pack, author] = x.text.includes('|') ? x.text.split('|').map(s => s.trim()) : [STICKER_PACK, STICKER_AUTHOR];
  await withProgress(x, 'Membuat stiker', async () => {
    const buf = await new Sticker(media.buffer, { pack, author, type: StickerTypes.FULL, quality: 60 }).toBuffer();
    await sock.sendMessage(x.from, { sticker: buf }, { quoted: x.msg });
  });
});
cmd('toimg', { limit: 1 }, async (x) => {
  const media = await getMedia(x.msg, ['stickerMessage']);
  if (!media) return x.usage(`Balas stiker dengan *${P_}toimg*`);
  const jimpModule = safeRequire('jimp', 'npm i jimp');
  const Jimp = jimpModule.Jimp || jimpModule;
  await withProgress(x, 'Mengubah stiker', async () => {
    const image = Jimp.read ? await Jimp.read(media.buffer) : await Jimp.fromBuffer(media.buffer);
    const png = await image.getBuffer(Jimp.MIME_PNG || 'image/png');
    await sock.sendMessage(x.from, { image: png, caption: '✅ Stiker → Gambar' }, { quoted: x.msg });
  });
});

// ---------- Tools Base ----------
cmd('qr', { limit: 1 }, async (x) => {
  if (!x.text) return x.usage(`Contoh: ${P_}qr https://google.com`);
  await sock.sendMessage(x.from, { image: { url: `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(x.text)}` }, caption: '✅ QR Code' }, { quoted: x.msg });
});
cmd(['tr', 'translate'], { limit: 1 }, async (x) => {
  let lang = x.args[0], text = x.args.slice(1).join(' ') || getQuotedText(x.msg);
  if (!lang || !text) return x.usage(`Contoh: ${P_}tr en selamat pagi`);
  const j = await getJSON(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(lang)}&dt=t&q=${encodeURIComponent(text)}`);
  x.reply(box('TRANSLATE 🌐', [`➡️ ${lang}`, j[0].map(s => s[0]).join('')]));
});
cmd('tts', { limit: 1 }, async (x) => {
  let lang = 'id', text = x.text;
  if (/^[a-z]{2}(-[A-Za-z]{2})?$/.test(x.args[0] || '') && x.args.length > 1) { lang = x.args[0]; text = x.args.slice(1).join(' '); }
  if (!text) return x.usage(`Contoh: ${P_}tts id halo`);
  if (text.length > 200) return x.usage('Maks 200 karakter.');
  const r = await fetch(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error('Gagal membuat suara.');
  await sock.sendMessage(x.from, { audio: Buffer.from(await r.arrayBuffer()), mimetype: 'audio/mpeg', ptt: true }, { quoted: x.msg });
});
cmd('cuaca', { limit: 1 }, async (x) => {
  if (!x.text) return x.usage(`Contoh: ${P_}cuaca Batam`);
  const j = await getJSON(`https://wttr.in/${encodeURIComponent(x.text)}?format=j1`);
  const cur = j.current_condition[0];
  x.reply(box(`CUACA ${x.text.toUpperCase()} 🌤️`, [`🌡️ ${cur.temp_C}°C`, `☁️ ${cur.weatherDesc[0].value}`, `💧 ${cur.humidity}%`, `💨 ${cur.windspeedKmph} km/j`]));
});
cmd('short', { limit: 1 }, async (x) => {
  if (!isHttpUrl(x.text)) return x.usage(`Contoh: ${P_}short https://link`);
  const r = await fetch('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(x.text));
  x.reply(box('SHORTLINK 🔗', [await r.text()]));
});
cmd('ssweb', { limit: 1 }, async (x) => {
  if (!isHttpUrl(x.text)) return x.usage(`Contoh: ${P_}ssweb https://google.com`);
  await withProgress(x, 'Screenshot', async () => {
    await sock.sendMessage(x.from, { image: { url: `https://image.thum.io/get/width/1280/crop/720/${x.text}` }, caption: '📸 ' + x.text }, { quoted: x.msg });
  });
});
cmd(['calc', 'hitung'], { limit: 1 }, async (x) => {
  const expr = x.text.replace(/x/gi, '*').replace(/\^/g, '**');
  if (!expr || !/^[0-9+\-*/().%\s]+$/.test(expr)) return x.usage(`Contoh: ${P_}calc (12+8)*3`);
  const res = Function(`"use strict"; return (${expr})`)();
  x.reply(box('KALKULATOR 🧮', [`${x.text} = *${res}*`]));
});

// ---------- Tools Plus ----------
cmd('wiki', { limit: 1 }, async (x) => {
  if (!x.text) return x.usage(`Contoh: ${P_}wiki Soekarno`);
  const j = await getJSON(`https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(x.text)}`);
  if (!j.extract) throw new Error('Artikel tidak ditemukan.');
  x.reply(box(`WIKIPEDIA 📖`, [`📝 *${j.title}*`, ``, j.extract]));
});
cmd('kurs', { limit: 1 }, async (x) => {
  const [jml, dari, ke] = x.args;
  if (!jml || !dari || !ke) return x.usage(`Contoh: ${P_}kurs 100 USD IDR`);
  const j = await getJSON(`https://open.er-api.com/v6/latest/${dari.toUpperCase()}`);
  if (!j.rates || !j.rates[ke.toUpperCase()]) throw new Error('Mata uang tidak valid.');
  const hasil = (parseFloat(jml) * j.rates[ke.toUpperCase()]).toLocaleString('id-ID');
  x.reply(box('KURS MATA UANG 💵', [`${jml} ${dari.toUpperCase()} = *${hasil} ${ke.toUpperCase()}*`]));
});
cmd('sholat', { limit: 1 }, async (x) => {
  const kota = x.text || 'Jakarta';
  const j = await getJSON(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(kota)}&country=Indonesia&method=11`);
  const t = j.data.timings;
  x.reply(box(`JADWAL SHOLAT ${kota.toUpperCase()} 🕌`, [`Subuh: ${t.Fajr}`, `Dzuhur: ${t.Dhuhr}`, `Ashar: ${t.Asr}`, `Maghrib: ${t.Maghrib}`, `Isya: ${t.Isha}`]));
});
cmd('gempa', { limit: 1 }, async (x) => {
  const j = await getJSON('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
  const g = j.Infogempa.gempa;
  x.reply(box('INFO GEMPA TERKINI 🌋', [`📍 ${g.Wilayah}`, `📅 ${g.Tanggal} ${g.Jam}`, `💥 Magnitudo: ${g.Magnitude} SR`, `🌊 Potensi: ${g.Potensi}`]));
});
cmd('ip', { limit: 1 }, async (x) => {
  if (!x.text) return x.usage(`Contoh: ${P_}ip 8.8.8.8`);
  const j = await getJSON(`http://ip-api.com/json/${x.text}`);
  if (j.status === 'fail') throw new Error('IP tidak valid.');
  x.reply(box('IP LOOKUP 🌐', [`🌍 Negara: ${j.country}`, `🏙️ Kota: ${j.city}`, `📡 ISP: ${j.isp}`, `🕒 Zona: ${j.timezone}`]));
});
cmd('dns', { limit: 1 }, async (x) => {
  if (!x.text) return x.usage(`Contoh: ${P_}dns google.com`);
  const j = await getJSON(`https://dns.google/resolve?name=${encodeURIComponent(x.text)}&type=A`);
  if (!j.Answer) throw new Error('DNS tidak ditemukan.');
  x.reply(box('DNS LOOKUP 📡', j.Answer.map(a => `IP: ${a.data}`)));
});
cmd('base64', { limit: 1 }, async (x) => {
  const [mode, ...txt] = x.args; const text = txt.join(' ');
  if (!mode || !text) return x.usage(`Contoh: ${P_}base64 enc halo / ${P_}base64 dec aGFsbG8=`);
  if (mode === 'enc') x.reply(box('BASE64 ENCODE', [Buffer.from(text).toString('base64')]));
  else x.reply(box('BASE64 DECODE', [Buffer.from(text, 'base64').toString('utf-8')]));
});
cmd('binary', { limit: 1 }, async (x) => {
  const [mode, ...txt] = x.args; const text = txt.join(' ');
  if (!mode || !text) return x.usage(`Contoh: ${P_}binary enc halo / ${P_}binary dec 01101000`);
  if (mode === 'enc') x.reply(box('BINARY ENCODE', [text.split('').map(ch => ch.charCodeAt(0).toString(2).padStart(8, '0')).join(' ')]));
  else x.reply(box('BINARY DECODE', [text.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('')]));
});
cmd('morse', { limit: 1 }, async (x) => {
  const [mode, ...txt] = x.args; const text = txt.join(' ');
  if (!mode || !text) return x.usage(`Contoh: ${P_}morse enc halo`);
  const mc = { a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..', ' ': '/' };
  if (mode === 'enc') x.reply(box('MORSE ENCODE', [text.toLowerCase().split('').map(ch => mc[ch] || '').join(' ')]));
  else {
    const rev = Object.fromEntries(Object.entries(mc).map(([k, v]) => [v, k]));
    x.reply(box('MORSE DECODE', [text.split(' ').map(ch => rev[ch] || '').join('')]));
  }
});
cmd('fancy', { limit: 1 }, async (x) => {
  if (!x.text) return x.usage(`Contoh: ${P_}fancy halo`);
  const map = { a: '𝗮', b: '𝗯', c: '𝗰', d: '𝗱', e: '𝗲', f: '𝗳', g: '𝗴', h: '𝗵', i: '𝗶', j: '𝗷', k: '𝗸', l: '𝗹', m: '𝗺', n: '𝗻', o: '𝗼', p: '𝗽', q: '𝗾', r: '𝗿', s: '𝘀', t: '𝘁', u: '𝘂', v: '𝘃', w: '𝘄', x: '𝘅', y: '𝘆', z: '𝘇', A: '𝗔', B: '𝗕', C: '𝗖', D: '𝗗', E: '𝗘', F: '𝗙', G: '𝗚', H: '𝗛', I: '𝗜', J: '𝗝', K: '𝗞', L: '𝗟', M: '𝗠', N: '𝗡', O: '𝗢', P: '𝗣', Q: '𝗤', R: '𝗥', S: '𝗦', T: '𝗧', U: '𝗨', V: '𝗩', W: '𝗪', X: '𝗫', Y: '𝗬', Z: '𝗭' };
  x.reply(box('FANCY TEXT', [x.text.split('').map(ch => map[ch] || ch).join('')]));
});
cmd('reverse', { limit: 1 }, async (x) => {
  if (!x.text) return x.usage(`Contoh: ${P_}reverse halo`);
  x.reply(box('REVERSE TEXT', [x.text.split('').reverse().join('')]));
});
cmd('pass', { limit: 1 }, async (x) => {
  const len = parseInt(x.args[0]) || 12;
  if (len < 6 || len > 50) return x.usage('Panjang password 6 - 50');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let pass = '';
  for (let i = 0; i < len; i++) pass += chars.charAt(crypto.randomInt(chars.length));
  x.reply(box('PASSWORD GENERATOR', [`🔑 ${pass}`]));
});
cmd('hash', { limit: 1 }, async (x) => {
  const [algo, ...txt] = x.args; const text = txt.join(' ');
  if (!algo || !text) return x.usage(`Contoh: ${P_}hash md5 halo`);
  try { x.reply(box(`HASH ${algo.toUpperCase()}`, [crypto.createHash(algo).update(text).digest('hex')])); }
  catch { x.reply('❌ Algo tidak valid (md5, sha1, sha256, sha512).'); }
});
cmd('jam', { limit: 1 }, async (x) => {
  const zone = x.args[0] || 'Asia/Jakarta';
  try {
    const time = new Date().toLocaleString('id-ID', { timeZone: zone, dateStyle: 'full', timeStyle: 'long' });
    x.reply(box('WAKTU SEKARANG', [`🌍 ${zone}`, `🕒 ${time}`]));
  } catch { x.reply('❌ Zona waktu tidak valid. (Contoh: Asia/Jakarta)'); }
});
cmd('umur', { limit: 1 }, async (x) => {
  if (!x.text) return x.usage(`Contoh: ${P_}umur 2000-01-01`);
  const birth = new Date(x.text);
  if (isNaN(birth.getTime())) return x.reply('❌ Format tanggal salah (YYYY-MM-DD).');
  const now = new Date();
  let y = now.getFullYear() - birth.getFullYear();
  let m = now.getMonth() - birth.getMonth();
  let d = now.getDate() - birth.getDate();
  if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  x.reply(box('HITUNG UMUR 🎂', [`Umur: *${y} Tahun, ${m} Bulan, ${d} Hari*`]));
});
cmd('zodiak', { limit: 1 }, async (x) => {
  if (!x.text) return x.usage(`Contoh: ${P_}zodiak 19-10`);
  const [dd, mm] = x.text.split('-').map(Number);
  if (!dd || !mm || mm > 12 || dd > 31) return x.usage(`Format DD-MM (contoh: 19-10)`);
  const z = ['Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn'];
  const cutoff = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
  const result = z[dd < cutoff[mm - 1] ? mm - 1 : mm];
  x.reply(box('ZODIAK ♈', [`Tanggal: ${dd}-${mm}`, `Zodiak: *${result}*`]));
});
cmd('ytsearch', { limit: 1 }, async (x) => {
  if (!x.text) return x.usage(`Contoh: ${P_}ytsearch alan walker`);
  const yts = safeRequire('yt-search', 'npm i yt-search');
  const v = (await yts(x.text)).videos?.[0];
  if (!v) throw new Error('Tidak ditemukan.');
  x.reply(box('YT SEARCH 🔍', [`🎵 ${v.title}`, `👤 ${v.author.name}`, `⏱️ ${v.timestamp}`, `🔗 ${v.url}`]));
});
cmd('getpp', { limit: 1 }, async (x) => {
  const t = getTargets(x.msg, x.args)[0] || x.sender;
  try {
    const pp = await sock.profilePictureUrl(t, 'image');
    await sock.sendMessage(x.from, { image: { url: pp }, caption: `✅ Foto profil @${num(t)}`, mentions: [t] }, { quoted: x.msg });
  } catch { x.reply('❌ PP diprivasi.'); }
});

// =====================================================================
//   📚 SEKOLAH & KULIAH  (alat bantu pelajar / mahasiswa)
//   Perintah lokal (tanpa internet) tidak memakai limit.
// =====================================================================
const MOTIVASI = [
  'Belajar hari ini adalah investasi untuk dirimu di masa depan.',
  'Jangan menunggu termotivasi — mulai saja 5 menit dulu, sisanya akan mengalir.',
  'Satu halaman setiap hari lebih baik daripada sepuluh halaman sekali setahun.',
  'Salah itu bagian dari belajar. Yang penting kamu tidak berhenti.',
  'Istirahat bukan tanda menyerah, tapi cara mengisi tenaga.',
  'Bandingkan dirimu hari ini dengan dirimu kemarin, bukan dengan orang lain.',
  'Tugas yang dicicil sedikit demi sedikit tidak akan terasa berat.',
  'Fokus pada proses, hasil akan menyusul.',
  'Bertanya itu keren. Tidak tahu bukan aib, tidak mau belajar itu yang rugi.',
  'Nilai bukan segalanya, tapi usaha yang jujur selalu berarti.'
];
cmd(['motivasi', 'quote'], { fast: true }, (x) => x.reply(box('MOTIVASI 💡', [pick(MOTIVASI)])));

// ---------- Rumus cepat ----------
const RUMUS = {
  fisika: [
    'Kecepatan: v = s / t', 'GLBB: vt = v0 + a·t', 'GLBB: s = v0·t + ½·a·t²', 'GLBB: vt² = v0² + 2·a·s',
    'Hukum II Newton: ΣF = m·a', 'Berat: w = m·g', 'Gaya gesek: f = μ·N', 'Usaha: W = F·s·cos θ',
    'Energi kinetik: Ek = ½·m·v²', 'Energi potensial: Ep = m·g·h', 'Daya: P = W / t', 'Momentum: p = m·v',
    'Tekanan: P = F / A', 'Tekanan hidrostatis: P = ρ·g·h', 'Archimedes: Fa = ρ·g·V', 'Hooke: F = k·Δx',
    'Gelombang: v = λ·f ; f = 1/T', 'Hukum Ohm: V = I·R', 'Daya listrik: P = V·I', 'Kalor: Q = m·c·ΔT',
    'Gravitasi: F = G·m1·m2 / r²'],
  matematika: [
    'Akar kuadrat: x = (−b ± √(b² − 4ac)) / 2a', 'Diskriminan: D = b² − 4ac',
    'Aritmetika: Un = a + (n−1)b ; Sn = n/2·(2a + (n−1)b)', 'Geometri: Un = a·r^(n−1) ; Sn = a(rⁿ − 1)/(r − 1)',
    'Logaritma: ᵃlog(bc) = ᵃlog b + ᵃlog c', 'sin²x + cos²x = 1', 'sin 2x = 2·sin x·cos x', 'cos 2x = cos²x − sin²x',
    'Aturan sinus: a/sin A = b/sin B = c/sin C', 'Aturan cosinus: c² = a² + b² − 2ab·cos C',
    'Turunan: d/dx xⁿ = n·xⁿ⁻¹', 'Integral: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C',
    'Permutasi: P(n,r) = n! / (n−r)!', 'Kombinasi: C(n,r) = n! / (r!·(n−r)!)'],
  geometri: [
    'Persegi: L = s² ; K = 4s', 'Persegi panjang: L = p·l ; K = 2(p+l)', 'Segitiga: L = ½·a·t',
    'Lingkaran: L = πr² ; K = 2πr', 'Trapesium: L = ½(a+b)·t', 'Jajar genjang: L = a·t',
    'Belah ketupat/layang: L = ½·d1·d2', 'Pythagoras: c² = a² + b²', 'Kubus: V = s³ ; LP = 6s²',
    'Balok: V = p·l·t ; LP = 2(pl+pt+lt)', 'Tabung: V = πr²t ; LP = 2πr(r+t)',
    'Kerucut: V = ⅓πr²t ; LP = πr(r+s)', 'Bola: V = 4/3·πr³ ; L = 4πr²', 'Limas: V = ⅓·La·t'],
  kimia: [
    'Mol: n = massa / Mr', 'Mol gas STP: n = V / 22,4', 'Partikel: n = N / 6,02×10²³', 'Molaritas: M = n / V',
    'Pengenceran: M1·V1 = M2·V2', 'pH = −log [H⁺]', 'pOH = −log [OH⁻]', 'pH + pOH = 14',
    'Gas ideal: PV = nRT (R = 0,082)', 'Lavoisier: massa sebelum = massa sesudah'],
  statistika: [
    'Mean: x̄ = Σx / n', 'Median: nilai tengah data terurut', 'Modus: nilai paling sering muncul',
    'Jangkauan: R = x maks − x min', 'Varians: s² = Σ(x − x̄)² / n', 'Simpangan baku: s = √varians',
    'Peluang: P(A) = n(A) / n(S)'],
  ekonomi: [
    'Laba = Pendapatan − Biaya', 'Persentase laba = Laba / Modal × 100%', 'Bunga tunggal: I = P·r·t',
    'Bunga majemuk: A = P(1 + r)ⁿ', 'BEP (unit) = Biaya tetap / (Harga − Biaya variabel)', 'Elastisitas: E = %ΔQ / %ΔP']
};
cmd(['rumus', 'formula'], { fast: true }, async (x) => {
  const k = (x.args[0] || '').toLowerCase();
  if (!has(RUMUS, k)) return x.usage(box('RUMUS CEPAT 📐', ['Pilih topik:', ...Object.keys(RUMUS).map(n => `➥ ${P_}rumus ${n}`)]));
  x.reply(box(`RUMUS ${k.toUpperCase()} 📐`, RUMUS[k]));
});

// ---------- Tabel periodik ----------
const SYM = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
const NAMA = 'Hidrogen Helium Litium Berilium Boron Karbon Nitrogen Oksigen Fluor Neon Natrium Magnesium Aluminium Silikon Fosfor Belerang Klor Argon Kalium Kalsium Skandium Titanium Vanadium Kromium Mangan Besi Kobalt Nikel Tembaga Seng Galium Germanium Arsen Selenium Brom Kripton Rubidium Stronsium Itrium Zirkonium Niobium Molibdenum Teknesium Rutenium Rodium Paladium Perak Kadmium Indium Timah Antimon Telurium Iodium Xenon Sesium Barium Lantanum Serium Praseodimium Neodimium Prometium Samarium Europium Gadolinium Terbium Disprosium Holmium Erbium Tulium Iterbium Lutetium Hafnium Tantalum Wolfram Renium Osmium Iridium Platina Emas Raksa Talium Timbal Bismut Polonium Astatin Radon Fransium Radium Aktinium Torium Protaktinium Uranium Neptunium Plutonium Amerisium Kurium Berkelium Kalifornium Einsteinium Fermium Mendelevium Nobelium Lawrensium Rutherfordium Dubnium Seaborgium Bohrium Hasium Meitnerium Darmstadtium Roentgenium Kopernisium Nihonium Flerovium Moskovium Livermorium Tenesin Oganeson'.split(' ');
const AR = '1.008 4.0026 6.94 9.0122 10.81 12.011 14.007 15.999 18.998 20.180 22.990 24.305 26.982 28.085 30.974 32.06 35.45 39.948 39.098 40.078 44.956 47.867 50.942 51.996 54.938 55.845 58.933 58.693 63.546 65.38 69.723 72.630 74.922 78.971 79.904 83.798 85.468 87.62 88.906 91.224 92.906 95.95 98 101.07 102.91 106.42 107.87 112.41 114.82 118.71 121.76 127.60 126.90 131.29 132.91 137.33'.split(' ');
const AR_EXTRA = { 79: '196.97', 80: '200.59', 82: '207.2', 92: '238.03' };
cmd(['unsur', 'element', 'tabel'], { fast: true }, async (x) => {
  const q = x.text.toLowerCase();
  if (!q) return x.usage(`Contoh: ${P_}unsur Fe  |  ${P_}unsur 8  |  ${P_}unsur oksigen`);
  let i = /^\d+$/.test(q) ? parseInt(q, 10) - 1 : SYM.findIndex(s => s.toLowerCase() === q);
  if (i < 0 || Number.isNaN(i)) i = NAMA.findIndex(n => n.toLowerCase() === q);
  if (i < 0) i = NAMA.findIndex(n => n.toLowerCase().startsWith(q));
  if (i < 0 || i >= SYM.length) return x.reply('❌ Unsur tidak ditemukan.');
  const z = i + 1;
  const periode = z <= 2 ? 1 : z <= 10 ? 2 : z <= 18 ? 3 : z <= 36 ? 4 : z <= 54 ? 5 : z <= 86 ? 6 : 7;
  x.reply(box('UNSUR KIMIA ⚗️', [`🔢 Nomor atom : ${z}`, `🔤 Simbol     : *${SYM[i]}*`, `📛 Nama       : ${NAMA[i]}`, `⚖️ Massa atom : ${AR[i] || AR_EXTRA[z] || '-'}`, `📏 Periode    : ${periode}`]));
});

// ---------- Konversi satuan ----------
const UNITS = {
  panjang: { mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, ft: 0.3048, yard: 0.9144, mil: 1609.344 },
  massa: { mg: 1e-6, g: 0.001, kg: 1, ton: 1000, oz: 0.028349523125, lb: 0.45359237 },
  waktu: { detik: 1, s: 1, menit: 60, min: 60, jam: 3600, h: 3600, hari: 86400, minggu: 604800 },
  data: { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3, tb: 1024 ** 4 },
  volume: { ml: 0.001, l: 1, m3: 1000 }
};
cmd(['konversi', 'convert', 'conv'], { fast: true }, async (x) => {
  const v = Number((x.args[0] || '').replace(',', '.'));
  const a = (x.args[1] || '').toLowerCase(), b = (x.args[2] || '').toLowerCase();
  const list = Object.entries(UNITS).map(([k, g]) => `${k}: ${Object.keys(g).join(', ')}`).concat('suhu: c, f, k');
  if (!Number.isFinite(v) || !a || !b) return x.usage(box('KONVERSI 🔄', [`Contoh: ${P_}konversi 100 cm m`, ...list]));
  let res;
  const T = ['c', 'f', 'k'];
  if (T.includes(a) && T.includes(b)) {
    const cel = a === 'c' ? v : a === 'f' ? (v - 32) * 5 / 9 : v - 273.15;
    res = b === 'c' ? cel : b === 'f' ? cel * 9 / 5 + 32 : cel + 273.15;
  } else {
    const g = Object.values(UNITS).find(gr => has(gr, a) && has(gr, b));
    if (!g) return x.usage(box('SATUAN TIDAK COCOK ❌', list));
    res = v * g[a] / g[b];
  }
  x.reply(box('KONVERSI 🔄', [`${nf(v)} ${a} = *${nf(res, 8)} ${b}*`]));
});

// ---------- IPK / IPS ----------
const GRADE = { 'A': 4, 'A-': 3.7, 'B+': 3.3, 'B': 3, 'B-': 2.7, 'C+': 2.3, 'C': 2, 'D': 1, 'E': 0 };
cmd(['ipk', 'ips', 'gpa'], { fast: true }, async (x) => {
  const usage = `Format: nilai:sks (huruf atau angka 0-4)\nContoh: ${P_}ipk A:3 B+:2 3.5:4 C:2`;
  if (!x.args.length) return x.usage(usage);
  const rows = [];
  for (const tok of x.args) {
    const [g, s] = tok.split(/[:/]/);
    const key = (g || '').toUpperCase().replace(',', '.');
    const val = has(GRADE, key) ? GRADE[key] : Number(key);
    const sks = Number((s || '').replace(',', '.'));
    if (!key || !s || !Number.isFinite(val) || val < 0 || val > 4 || !Number.isFinite(sks) || sks <= 0) return x.usage(`❌ Format salah: "${tok}"\n${usage}`);
    rows.push({ key, val, sks });
  }
  const totalSks = rows.reduce((a, r) => a + r.sks, 0);
  const totalBobot = rows.reduce((a, r) => a + r.val * r.sks, 0);
  const ipk = totalBobot / totalSks;
  const predikat = ipk >= 3.51 ? 'Cum Laude / Dengan Pujian 🏆' : ipk >= 2.76 ? 'Sangat Memuaskan 🎉' : ipk >= 2.0 ? 'Memuaskan 👍' : 'Perlu ditingkatkan 💪';
  x.reply(box('HITUNG IPK 🎓', [
    ...rows.map((r, i) => `${i + 1}. ${r.key} (${r.val}) × ${r.sks} sks = ${nf(r.val * r.sks, 2)}`),
    '', `Total SKS   : ${nf(totalSks, 2)}`, `Total Bobot : ${nf(totalBobot, 2)}`, `🎯 IPK/IPS   : *${ipk.toFixed(2)}*`, `🏅 ${predikat}`
  ]));
});

// ---------- Statistik ----------
const parseNums = (text) => {
  const t = (text || '').trim();
  if (!t) return null;
  const parts = /[\s;]/.test(t) ? t.split(/[\s;]+/).map(s => s.replace(',', '.')) : t.split(',');
  const n = parts.map(s => s.trim()).filter(Boolean).map(Number);
  return n.length && !n.some(Number.isNaN) ? n : null;
};
cmd(['rata', 'statistik', 'stat'], { fast: true }, async (x) => {
  const n = parseNums(x.text);
  if (!n || n.length < 2) return x.usage(`Contoh: ${P_}rata 80 75 90 85`);
  const s = [...n].sort((a, b) => a - b);
  const sum = n.reduce((a, b) => a + b, 0), mean = sum / n.length;
  const median = s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
  const freq = new Map(); n.forEach(v => freq.set(v, (freq.get(v) || 0) + 1));
  const maxF = Math.max(...freq.values());
  const modus = maxF === 1 ? 'Tidak ada' : [...freq].filter(([, f]) => f === maxF).map(([v]) => nf(v)).join(', ');
  const ss = n.reduce((a, b) => a + (b - mean) ** 2, 0);
  x.reply(box('STATISTIK 📊', [
    `Data       : ${n.length} angka`, `Jumlah     : ${nf(sum)}`, `Rata-rata  : *${nf(mean)}*`, `Median     : ${nf(median)}`, `Modus      : ${modus}`,
    `Min / Maks : ${nf(s[0])} / ${nf(s[s.length - 1])}`, `Jangkauan  : ${nf(s[s.length - 1] - s[0])}`,
    `Varians    : ${nf(ss / n.length)}`, `Std Dev (populasi) : ${nf(Math.sqrt(ss / n.length))}`, `Std Dev (sampel)   : ${nf(Math.sqrt(ss / (n.length - 1)))}`
  ]));
});

// ---------- Persamaan kuadrat ----------
cmd(['kuadrat', 'abc'], { fast: true }, async (x) => {
  const [a, b, cc] = x.args.map(s => Number(s.replace(',', '.')));
  if (x.args.length < 3 || [a, b, cc].some(v => !Number.isFinite(v))) return x.usage(`Contoh: ${P_}kuadrat 1 -3 2   (x² − 3x + 2 = 0)`);
  if (a === 0) {
    if (b === 0) return x.reply('❌ Bukan persamaan (a dan b = 0).');
    return x.reply(box('PERSAMAAN LINEAR', [`${nf(b)}x + ${nf(cc)} = 0`, `x = *${nf(-cc / b)}*`]));
  }
  const D = b * b - 4 * a * cc;
  const lines = [`${nf(a)}x² + ${nf(b)}x + ${nf(cc)} = 0`, `D = b² − 4ac = ${nf(D)}`];
  if (D > 0) lines.push('D > 0 → 2 akar real berbeda', `x₁ = *${nf((-b + Math.sqrt(D)) / (2 * a))}*`, `x₂ = *${nf((-b - Math.sqrt(D)) / (2 * a))}*`);
  else if (D === 0) lines.push('D = 0 → 1 akar kembar', `x = *${nf(-b / (2 * a))}*`);
  else {
    const re = -b / (2 * a), im = Math.sqrt(-D) / (2 * Math.abs(a));
    lines.push('D < 0 → akar imajiner', `x₁ = ${nf(re)} + ${nf(im)}i`, `x₂ = ${nf(re)} − ${nf(im)}i`);
  }
  lines.push(`Titik puncak: (${nf(-b / (2 * a))}, ${nf(-D / (4 * a))})`);
  x.reply(box('PERSAMAAN KUADRAT 📈', lines));
});

// ---------- FPB / KPK / Prima ----------
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const lcm = (a, b) => (a / gcd(a, b)) * b;
cmd(['fpb', 'kpk'], { fast: true }, async (x) => {
  const n = parseNums(x.text);
  if (!n || n.length < 2 || n.some(v => !Number.isInteger(v) || v <= 0)) return x.usage(`Contoh: ${P_}${x.command} 12 18 24`);
  const r = x.command === 'fpb' ? n.reduce(gcd) : n.reduce(lcm);
  x.reply(box(`${x.command.toUpperCase()} 🔢`, [`Bilangan: ${n.join(', ')}`, `Hasil   : *${nf(r, 0)}*`]));
});
cmd(['prima', 'faktor'], { fast: true }, async (x) => {
  const n = parseInt(x.args[0], 10);
  if (!Number.isInteger(n) || n < 2 || n > 1e12) return x.usage(`Contoh: ${P_}prima 360  (2 - 1.000.000.000.000)`);
  let m = n; const f = new Map();
  for (let d = 2; d * d <= m; d++) while (m % d === 0) { f.set(d, (f.get(d) || 0) + 1); m /= d; }
  if (m > 1) f.set(m, (f.get(m) || 0) + 1);
  const isPrime = f.size === 1 && [...f.values()][0] === 1;
  const sup = (e) => String(e).split('').map(ch => '⁰¹²³⁴⁵⁶⁷⁸⁹'[ch]).join('');
  const fz = [...f].map(([p, e]) => (e > 1 ? `${p}${sup(e)}` : `${p}`)).join(' × ');
  x.reply(box('BILANGAN PRIMA 🔍', [`Angka : ${nf(n, 0)}`, isPrime ? '✅ *Bilangan prima*' : '❌ *Bukan bilangan prima*', ...(isPrime ? [] : [`Faktorisasi prima: ${fz}`])]));
});

// ---------- Konversi basis bilangan ----------
cmd(['basis', 'base'], { fast: true }, async (x) => {
  const [val, f, t] = x.args;
  const from = parseInt(f, 10), to = parseInt(t, 10);
  if (!val || !(from >= 2 && from <= 36) || !(to >= 2 && to <= 36)) return x.usage(`Contoh: ${P_}basis 255 10 2   (desimal → biner)\nBasis 2 - 36 (hex = 16)`);
  const n = parseInt(val, from);
  if (Number.isNaN(n) || n.toString(from) !== val.toLowerCase().replace(/^0+(?=.)/, '')) return x.reply(`❌ "${val}" bukan bilangan basis ${from} yang valid.`);
  if (n > Number.MAX_SAFE_INTEGER) return x.reply('❌ Angka terlalu besar.');
  x.reply(box('KONVERSI BASIS 💻', [`${val} (basis ${from})`, `= *${n.toString(to).toUpperCase()}* (basis ${to})`]));
});

// ---------- Angka romawi ----------
const ROM = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
const toRoman = (n) => ROM.reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, '');
const fromRoman = (s) => {
  const m = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }; let t = 0;
  for (let i = 0; i < s.length; i++) { const a = m[s[i]], b = m[s[i + 1]] || 0; t += a < b ? -a : a; }
  return t;
};
cmd(['romawi', 'roman'], { fast: true }, async (x) => {
  const q = (x.args[0] || '').toUpperCase();
  if (/^\d+$/.test(q)) {
    const n = parseInt(q, 10);
    if (n < 1 || n > 3999) return x.usage('Rentang 1 - 3999');
    return x.reply(box('ANGKA ROMAWI 🏛️', [`${n} = *${toRoman(n)}*`]));
  }
  if (/^[IVXLCDM]+$/.test(q) && toRoman(fromRoman(q)) === q) return x.reply(box('ANGKA ROMAWI 🏛️', [`${q} = *${fromRoman(q)}*`]));
  x.usage(`Contoh: ${P_}romawi 2026  atau  ${P_}romawi MMXXVI`);
});

// ---------- Persen ----------
cmd(['persen', 'percent'], { fast: true }, async (x) => {
  const a = Number((x.args[0] || '').replace(',', '.')), b = Number((x.args[1] || '').replace(',', '.'));
  if (x.args.length < 2 || !Number.isFinite(a) || !Number.isFinite(b)) return x.usage(`Contoh: ${P_}persen 20 500`);
  const lines = [`${nf(a)}% dari ${nf(b)} = *${nf(a * b / 100)}*`];
  if (b !== 0) lines.push(`${nf(a)} adalah *${nf(a / b * 100)}%* dari ${nf(b)}`);
  lines.push(`${nf(b)} + ${nf(a)}% = ${nf(b * (1 + a / 100))}`, `${nf(b)} − ${nf(a)}% = ${nf(b * (1 - a / 100))}`);
  x.reply(box('HITUNG PERSEN ％', lines));
});

// ---------- Hitung kata ----------
cmd(['hitungkata', 'wordcount', 'wc'], { fast: true }, async (x) => {
  const text = x.text || getQuotedText(x.msg);
  if (!text.trim()) return x.usage(`Ketik teks atau balas pesan dengan *${P_}hitungkata*`);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const sentences = (text.match(/[.!?]+(\s|$)/g) || []).length || 1;
  const paragraphs = text.split(/\n\s*\n/).filter(s => s.trim()).length;
  x.reply(box('HITUNG KATA ✍️', [
    `Kata      : *${words}*`, `Karakter  : ${text.length}`, `Tanpa spasi: ${text.replace(/\s/g, '').length}`,
    `Kalimat   : ${sentences}`, `Paragraf  : ${paragraphs}`, `Baca      : ± ${Math.max(1, Math.ceil(words / 200))} menit`
  ]));
});

// ---------- Generator daftar pustaka (APA 7) ----------
cmd(['apa', 'sitasi', 'dapus'], { fast: true }, async (x) => {
  const type = (x.args[0] || '').toLowerCase();
  const p = x.args.slice(1).join(' ').split('|').map(s => s.trim());
  const help = box('DAFTAR PUSTAKA (APA 7) 📖', [
    `${P_}apa buku Penulis | Tahun | Judul | Penerbit`,
    `${P_}apa web Penulis | Tahun | Judul | Situs | URL`,
    `${P_}apa jurnal Penulis | Tahun | Judul | Jurnal | Volume | Edisi | Halaman`,
    '', 'Contoh:', `${P_}apa buku Tanjung, A. | 2023 | Dasar Statistika | Erlangga`
  ]);
  let out;
  if (type === 'buku' && p.length >= 4 && p.every(Boolean)) out = `${p[0]}. (${p[1]}). _${p[2]}_. ${p[3]}.`;
  else if (type === 'web' && p.length >= 5 && p.every(Boolean)) out = `${p[0]}. (${p[1]}). _${p[2]}_. ${p[3]}. ${p[4]}`;
  else if (type === 'jurnal' && p.length >= 7 && p.every(Boolean)) out = `${p[0]}. (${p[1]}). ${p[2]}. _${p[3]}, ${p[4]}_(${p[5]}), ${p[6]}.`;
  else return x.usage(help);
  x.reply(box('DAFTAR PUSTAKA 📖', [out]));
});

// ---------- Kamus (Inggris) ----------
cmd(['kamus', 'dict', 'dictionary'], { limit: 1 }, async (x) => {
  const w = x.args[0];
  if (!w) return x.usage(`Contoh: ${P_}kamus resilient  (kamus bahasa Inggris)`);
  const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (r.status === 404) throw new Error('Kata tidak ditemukan.');
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const e = (await r.json())[0];
  const lines = [`📖 *${e.word}*${e.phonetic ? '  ' + e.phonetic : ''}`];
  for (const m of e.meanings.slice(0, 3)) {
    const d = m.definitions[0];
    lines.push('', `▪️ _${m.partOfSpeech}_`, d.definition);
    if (d.example) lines.push(`↳ "${d.example}"`);
  }
  lines.push('', `💡 Terjemahkan: ${P_}tr id ${e.word}`);
  x.reply(box('KAMUS EN 📚', lines));
});

// ---------- To-Do list ----------
cmd(['todo', 'tugas', 'catat'], { fast: true }, async (x) => {
  const u = getUser(x.userKey);
  u.todo = u.todo || [];
  const known = ['add', 'tambah', 'list', 'lihat', 'done', 'selesai', 'ok', 'del', 'hapus', 'clear', 'bersih'];
  let sub = (x.args[0] || 'list').toLowerCase();
  let rest = x.args.slice(1).join(' ').trim();
  if (!known.includes(sub)) { rest = x.text.trim(); sub = 'add'; } // ".todo kerjakan makalah" langsung ditambah
  const show = () => x.reply(box('DAFTAR TUGAS 📝', u.todo.length
    ? u.todo.map((t, i) => `${i + 1}. ${t.d ? '✅ ~' + t.t + '~' : '⬜ ' + t.t}`)
    : [`Kosong. Tambah: ${P_}todo add <tugas>`]));
  const idx = parseInt(rest, 10) - 1;
  if (sub === 'add' || sub === 'tambah') {
    if (!rest) return x.usage(`Contoh: ${P_}todo add Kerjakan makalah`);
    if (u.todo.length >= 30) return x.reply('❌ Maksimal 30 tugas. Hapus dulu yang lama.');
    u.todo.push({ t: rest.slice(0, 150), d: false }); saveDB(); return show();
  }
  if (['done', 'selesai', 'ok'].includes(sub)) {
    if (!u.todo[idx]) return x.usage(`Contoh: ${P_}todo done 1`);
    u.todo[idx].d = true; saveDB(); return show();
  }
  if (['del', 'hapus'].includes(sub)) {
    if (!u.todo[idx]) return x.usage(`Contoh: ${P_}todo del 1`);
    u.todo.splice(idx, 1); saveDB(); return show();
  }
  if (['clear', 'bersih'].includes(sub)) { u.todo = u.todo.filter(t => !t.d); saveDB(); return show(); }
  return show();
});

// ---------- Pomodoro ----------
const pomodoro = new Map();
cmd(['pomodoro', 'belajar', 'fokus'], { fast: true }, async (x) => {
  const sub = (x.args[0] || '').toLowerCase();
  if (sub === 'stop' || sub === 'batal') {
    const t = pomodoro.get(x.sender);
    if (!t) return x.reply('❌ Tidak ada timer aktif.');
    clearTimeout(t.handle); pomodoro.delete(x.sender);
    return x.reply('🛑 Timer dihentikan.');
  }
  if (pomodoro.has(x.sender)) return x.reply(`⏳ Timer masih berjalan. Hentikan dengan *${P_}pomodoro stop*`);
  const fokus = Math.min(Math.max(parseInt(x.args[0], 10) || 25, 1), 120);
  const rehat = Math.min(Math.max(parseInt(x.args[1], 10) || 5, 1), 60);
  const state = { handle: null };
  pomodoro.set(x.sender, state);
  state.handle = setTimeout(async () => {
    await sock.sendMessage(x.from, { text: `⏰ @${num(x.sender)} Fokus ${fokus} menit selesai! Istirahat ${rehat} menit dulu 🧘`, mentions: [x.sender] }).catch(() => {});
    state.handle = setTimeout(async () => {
      pomodoro.delete(x.sender);
      await sock.sendMessage(x.from, { text: `🔔 @${num(x.sender)} Istirahat selesai! Siap lanjut belajar? 📚🔥`, mentions: [x.sender] }).catch(() => {});
    }, rehat * 60000);
  }, fokus * 60000);
  x.reply(box('POMODORO 🍅', [`📚 Fokus   : ${fokus} menit`, `☕ Istirahat: ${rehat} menit`, 'Aku akan mengingatkanmu. Selamat belajar!', `_Berhenti: ${P_}pomodoro stop_`]));
});

// ---------- Hitung mundur (ujian / deadline) ----------
cmd(['hitungmundur', 'countdown', 'deadline'], { fast: true }, async (x) => {
  const raw = x.args[0] || '';
  let y, mo, d, mt;
  if ((mt = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/))) { y = +mt[1]; mo = +mt[2]; d = +mt[3]; }
  else if ((mt = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/))) { d = +mt[1]; mo = +mt[2]; y = +mt[3]; }
  else return x.usage(`Contoh: ${P_}hitungmundur 2026-12-15 UAS\natau  ${P_}hitungmundur 15-12-2026 UAS`);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return x.reply('❌ Tanggal tidak valid.');
  const label = x.args.slice(1).join(' ') || 'Target';
  const diff = Math.floor(dt.getTime() / 86400000) - Math.floor((Date.now() + TZ_OFFSET_MS) / 86400000);
  const status = diff > 0 ? `⏳ *H-${diff}* (${Math.floor(diff / 7)} minggu ${diff % 7} hari lagi)` : diff === 0 ? '🔥 *HARI INI!*' : `✅ Sudah lewat ${-diff} hari`;
  x.reply(box('HITUNG MUNDUR ⏰', [`🎯 ${label}`, `📅 ${d}-${mo}-${y}`, status]));
});

// ---------- GAME ----------
const activeGames = new Map();
cmd('tebakangka', { limit: 1 }, async (x) => {
  const angka = Math.floor(Math.random() * 100) + 1;
  activeGames.set(x.sender, { type: 'angka', answer: angka, tries: 0 });
  x.reply(box('TEBAK ANGKA 🎲', ['Saya memilih angka 1-100.', `Ketik *${P_}tebak <angka>*`, `Ketik *${P_}nyerah* untuk menyerah.`]));
});
cmd('tebak', { limit: 1 }, async (x) => {
  const game = activeGames.get(x.sender);
  if (!game || game.type !== 'angka') return x.reply('❌ Ketik .tebakangka dulu.');
  const guess = parseInt(x.args[0]);
  if (isNaN(guess)) return x.reply('Masukkan angka valid.');
  game.tries++;
  if (guess === game.answer) {
    activeGames.delete(x.sender);
    x.reply(box('BENAR! 🎉', [`Angka: *${game.answer}*`, `Percobaan: ${game.tries}`]));
  } else x.reply(guess < game.answer ? `📈 KECIL! (${game.tries})` : `📉 BESAR! (${game.tries})`);
});
cmd('math', { limit: 1 }, async (x) => {
  const level = x.args[0] || 'mudah';
  let a, b, op, ans;
  if (level === 'mudah') { a = Math.floor(Math.random() * 10) + 1; b = Math.floor(Math.random() * 10) + 1; op = '+'; ans = a + b; }
  else if (level === 'sedang') { a = Math.floor(Math.random() * 20) + 5; b = Math.floor(Math.random() * 10) + 2; op = '-'; ans = a - b; }
  else { a = Math.floor(Math.random() * 10) + 2; b = Math.floor(Math.random() * 10) + 2; op = '*'; ans = a * b; }
  activeGames.set(x.sender, { type: 'math', answer: ans });
  x.reply(box('MATH GAME 🧮', [`Berapakah ${a} ${op} ${b} ?`, `Jawab: *${P_}jawab <angka>*`]));
});
cmd('jawab', { limit: 1 }, async (x) => {
  const game = activeGames.get(x.sender);
  if (!game) return x.reply('❌ Tidak ada game aktif.');
  if (x.args[0] == game.answer) { activeGames.delete(x.sender); x.reply('🎉 BENAR!'); }
  else x.reply('❌ SALAH! Coba lagi.');
});
cmd('nyerah', {}, async (x) => {
  const game = activeGames.get(x.sender);
  if (!game) return x.reply('❌ Tidak ada game aktif.');
  activeGames.delete(x.sender);
  x.reply(`🏳️ Menyerah! Jawaban: *${game.answer}*`);
});
cmd('suit', { limit: 1 }, async (x) => {
  const pilih = (x.args[0] || '').toLowerCase();
  if (!['batu', 'gunting', 'kertas'].includes(pilih)) return x.usage(`Contoh: ${P_}suit batu`);
  const bot = ['batu', 'gunting', 'kertas'][Math.floor(Math.random() * 3)];
  let hasil = pilih === bot ? '🤝 SERI!' : ((pilih === 'batu' && bot === 'gunting') || (pilih === 'gunting' && bot === 'kertas') || (pilih === 'kertas' && bot === 'batu')) ? '🎉 MENANG!' : '😭 KALAH!';
  x.reply(box('SUIT PvC ✌️', [`👤 Kamu: ${pilih}`, `🤖 Bot: ${bot}`, `🏆 ${hasil}`]));
});
cmd('slot', { limit: 1 }, async (x) => {
  const icons = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
  const res = [0, 0, 0].map(() => icons[Math.floor(Math.random() * icons.length)]);
  const win = res[0] === res[1] && res[1] === res[2] ? '🎉 JACKPOT!' : '😭 Coba lagi.';
  x.reply(box('SLOT MACHINE 🎰', [`[ ${res.join(' | ')} ]`, `Hasil: ${win}`]));
});
cmd('dadu', { limit: 1 }, async (x) => {
  const jml = Math.min(parseInt(x.args[0]) || 1, 5);
  let res = []; for (let i = 0; i < jml; i++) res.push(Math.floor(Math.random() * 6) + 1);
  x.reply(box('LEMPAR DADU 🎲', [`Jumlah: ${jml}`, `Hasil: ${res.join(', ')}`, `Total: ${res.reduce((a, b) => a + b, 0)}`]));
});
cmd('koin', { limit: 1 }, async (x) => {
  const pilih = (x.args[0] || '').toLowerCase();
  if (!['kepala', 'ekor'].includes(pilih)) return x.usage(`Contoh: ${P_}koin kepala`);
  const bot = Math.random() < 0.5 ? 'kepala' : 'ekor';
  x.reply(box('LEMPAR KOIN 🪙', [`👤 ${pilih}`, `🪙 ${bot}`, `🏆 ${pilih === bot ? 'MENANG!' : 'KALAH!'}`]));
});
cmd('8ball', { limit: 1 }, async (x) => {
  if (!x.text) return x.usage(`Contoh: ${P_}8ball apakah saya ganteng?`);
  const jwb = ['Ya.', 'Tidak.', 'Mungkin.', 'Tentu!', 'Tidak yakin.', '100% Ya.', 'Tidak mungkin.'];
  x.reply(box('MAGIC 8 BALL 🎱', [`❓ ${x.text}`, `💬 ${pick(jwb)}`]));
});
cmd('truth', { limit: 1 }, async (x) => {
  const t = ['Apa kebohongan terbesarmu?', 'Siapa yang terakhir kamu stalking?', 'Hal paling memalukan?', 'Pernah mencuri?'];
  x.reply(box('TRUTH 🫣', [pick(t)]));
});
cmd('dare', { limit: 1 }, async (x) => {
  const d = ['Tirukan suara hewan!', 'Kirim "Aku sayang kamu" ke mantan!', 'Push up 10x!', 'Screenshot chat terakhirmu!'];
  x.reply(box('DARE 😈', [pick(d)]));
});
cmd('jodoh', { limit: 1 }, async (x) => {
  const targets = getTargets(x.msg, x.args);
  if (targets.length < 2) return x.usage(`Tag 2 orang: ${P_}jodoh @a @b`);
  const persen = Math.floor(Math.random() * 100) + 1;
  const kata = persen > 80 ? 'Jodoh banget! ❤️' : persen > 50 ? 'Lumayan cocok. 😊' : 'Mending jomblo. 💔';
  await sock.sendMessage(x.from, { text: box('CEK JODOH 💘', [`👤 @${num(targets[0])} ❤️ @${num(targets[1])}`, `📊 Kecocokan: ${persen}%`, `💬 ${kata}`]), mentions: targets }, { quoted: x.msg });
});

// ---------- Grup (khusus owner) ----------
cmd('tagall', { group: true, owner: true }, async (x) => {
  const ids = x.meta.participants.map(p => pj(p));
  const list = ids.map((j, i) => `${i + 1}. @${num(j)}`).join('\n');
  await sock.sendMessage(x.from, { text: `📢 *TAG ALL*\n${x.text ? '💬 ' + x.text + '\n' : ''}\n${list}`, mentions: ids }, { quoted: x.msg });
});
cmd('hidetag', { group: true, owner: true }, async (x) => {
  await sock.sendMessage(x.from, { text: x.text || '📢', mentions: x.meta.participants.map(p => pj(p)) });
});
cmd('kick', { group: true, owner: true, botAdmin: true }, async (x) => {
  const t = getTargets(x.msg, x.args);
  if (!t.length) return x.reply(`Tag member: ${P_}kick @user`);
  await sock.groupParticipantsUpdate(x.from, t, 'remove');
});
cmd('add', { group: true, owner: true, botAdmin: true }, async (x) => {
  const n = x.args.join('').replace(/\D/g, '');
  if (n.length < 8) return x.reply(`Contoh: ${P_}add 628xxxxxxxx`);
  const r = await sock.groupParticipantsUpdate(x.from, [toJid(n)], 'add');
  x.reply(r?.[0]?.status === '200' ? '✅ Berhasil.' : `⚠️ Gagal (privasi).`);
});
cmd('promote', { group: true, owner: true, botAdmin: true }, async (x) => {
  const t = getTargets(x.msg, x.args);
  if (!t.length) return x.reply(`Tag member: ${P_}promote @user`);
  await sock.groupParticipantsUpdate(x.from, t, 'promote');
});
cmd('demote', { group: true, owner: true, botAdmin: true }, async (x) => {
  const t = getTargets(x.msg, x.args);
  if (!t.length) return x.reply(`Tag admin: ${P_}demote @user`);
  await sock.groupParticipantsUpdate(x.from, t, 'demote');
});
cmd('open', { group: true, owner: true, botAdmin: true }, async (x) => { await sock.groupSettingUpdate(x.from, 'not_announcement'); x.reply('🔓 Grup dibuka.'); });
cmd('close', { group: true, owner: true, botAdmin: true }, async (x) => { await sock.groupSettingUpdate(x.from, 'announcement'); x.reply('🔒 Grup ditutup.'); });
cmd('linkgc', { group: true, owner: true, botAdmin: true }, async (x) => x.reply('🔗 https://chat.whatsapp.com/' + await sock.groupInviteCode(x.from)));
cmd('revoke', { group: true, owner: true, botAdmin: true }, async (x) => { await sock.groupRevokeInvite(x.from); x.reply('♻️ Link direset.'); });
cmd('setname', { group: true, owner: true, botAdmin: true }, async (x) => { if (!x.text) return x.reply('Isi nama.'); await sock.groupUpdateSubject(x.from, x.text); metaCache.delete(x.from); });
cmd('setdesc', { group: true, owner: true, botAdmin: true }, async (x) => { if (!x.text) return x.reply('Isi desc.'); await sock.groupUpdateDescription(x.from, x.text); metaCache.delete(x.from); });
cmd('groupinfo', { group: true }, async (x) => {
  const admins = x.meta.participants.filter(p => p.admin);
  x.reply(box('INFO GRUP 👥', [`📛 ${x.meta.subject}`, `👤 Member : ${x.meta.participants.length}`, `🛡️ Admin  : ${admins.length}`]));
});
cmd('warn', { group: true, owner: true }, async (x) => {
  const t = getTargets(x.msg, x.args)[0];
  if (!t) return x.reply(`Tag member: ${P_}warn @user`);
  const g = getGroup(x.from);
  g.warns[num(t)] = (g.warns[num(t)] || 0) + 1;
  saveDB();
  await sock.sendMessage(x.from, { text: `⚠️ @${num(t)} diperingatkan (${g.warns[num(t)]}/3)`, mentions: [t] });
  if (g.warns[num(t)] >= 3 && x.botAdmin) { await sock.groupParticipantsUpdate(x.from, [t], 'remove'); delete g.warns[num(t)]; saveDB(); }
});
cmd('resetwarn', { group: true, owner: true }, async (x) => {
  const t = getTargets(x.msg, x.args)[0];
  if (!t) return x.reply(`Tag member: ${P_}resetwarn @user`);
  delete getGroup(x.from).warns[num(t)]; saveDB(); x.reply('✅ Peringatan direset.');
});

// ---------- Pengaturan grup ----------
for (const key of ['welcome', 'goodbye', 'survey', 'antilink', 'greeting']) {
  cmd(key, { group: true, owner: true }, async (x) => {
    const v = (x.args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(v)) return x.reply(`Contoh: ${P_}${key} on`);
    getGroup(x.from)[key] = v === 'on'; saveDB();
    x.reply(`✅ Fitur *${key}* *${v.toUpperCase()}*`);
  });
}
cmd('setwelcome', { group: true, owner: true }, async (x) => {
  if (!x.text) return x.reply('Isi teks. Variabel: @user {group} {count}');
  getGroup(x.from).welcomeText = x.text; saveDB(); x.reply('✅ Disimpan.');
});
cmd('setbye', { group: true, owner: true }, async (x) => {
  if (!x.text) return x.reply('Isi teks. Variabel: @user {group} {count}');
  getGroup(x.from).byeText = x.text; saveDB(); x.reply('✅ Disimpan.');
});
cmd('settings', { group: true }, async (x) => {
  const g = getGroup(x.from), s = (v) => (v ? '🟢 ON' : '🔴 OFF');
  x.reply(box('PENGATURAN GRUP ⚙️', [`Welcome  : ${s(g.welcome)}`, `Goodbye  : ${s(g.goodbye)}`, `Survey   : ${s(g.survey)}`, `Antilink : ${s(g.antilink)}`, `Ucapan   : ${s(g.greeting)}`]));
});

// ================= UCAPAN OTOMATIS (PAGI / SIANG / SORE / MALAM) =================
function buildGreeting(slot) {
  return box(`${slot.icon} ${slot.word.toUpperCase()}`, [`Halo semuanya! ${pick(slot.lines)}`, '', `💡 _${pick(MOTIVASI)}_`, `🕒 ${clock()} WIB`]);
}
let greetBusy = false;
async function greetTick() {
  if (!AUTO_GREET_GROUP || !connected || greetBusy) return;
  const w = wibNow();
  const nowMin = w.getUTCHours() * 60 + w.getUTCMinutes();
  const day = today();
  for (const k of Object.keys(db.greeted)) if (!k.startsWith(day)) delete db.greeted[k];
  const slot = GREET_SLOTS.find(s => { const at = s.h * 60 + s.m; return nowMin >= at && nowMin < at + GREET_WINDOW_MIN; });
  if (!slot) return;
  const mark = `${day}:${slot.id}`;
  if (db.greeted[mark]) return;
  db.greeted[mark] = true; saveDB();
  greetBusy = true;
  try {
    const all = await sock.groupFetchAllParticipating();
    const ids = Object.keys(all).filter(id => getGroup(id).greeting);
    log(c.green, `${slot.icon} Ucapan "${slot.word}" → ${ids.length} grup`);
    for (const id of ids) {
      await sock.sendMessage(id, { text: buildGreeting(slot) }).catch(() => {});
      await delay(2500 + Math.random() * 3500); // jeda acak biar aman dari spam
    }
  } catch (e) { log(c.red, 'Ucapan error: ' + e.message); }
  finally { greetBusy = false; }
}
let greetTimer = null, beatTimer = null;
function startSchedulers() {
  if (!greetTimer) greetTimer = setInterval(() => greetTick().catch(() => {}), 30000);
  if (!beatTimer) beatTimer = setInterval(() => {
    log(c.dim, `💓 hidup • uptime ${runtime()} • RAM ${(process.memoryUsage().rss / 1048576).toFixed(0)}MB • ${stats.cmd} perintah`);
  }, 30 * 60 * 1000);
  greetTick().catch(() => {});
}

// ================= WELCOME / GOODBYE / SURVEY =================
const fill = (tpl, o) => tpl.replace(/@user/g, `@${o.user}`).replace(/{group}/g, o.group).replace(/{count}/g, o.count).replace(/{desc}/g, o.desc || '');
const WELCOME_TPL = `╭━━━❰ ✨ *SELAMAT DATANG* ✨ ❱━━━╮
┃ 👋 Halo @user!
┃ 🏠 Grup  : *{group}*
┃ 👥 Member ke-{count}
╰━━━━━━━━━━━━━━━━━━━━╯
{desc}

📜 Baca deskripsi & patuhi aturan ya. Semoga betah! 🎉`;
const BYE_TPL = `🍂 *SAMPAI JUMPA* 🍂
@user telah meninggalkan *{group}*.
👥 Sisa member: {count}`;

async function sendCard(groupId, jid, caption) {
  let pp; try { pp = await sock.profilePictureUrl(jid, 'image'); } catch {}
  const content = pp ? { image: { url: pp }, caption, mentions: [jid] } : { text: caption, mentions: [jid] };
  await sock.sendMessage(groupId, content);
}

function startSurvey(groupId, groupName, p) {
  const keys = pIds(p).map(num);
  const allJids = typeof p === 'string' ? [p] : pIds(p);
  const userJid = allJids.find(j => j.endsWith('@s.whatsapp.net')) || allJids[0] || (p.phoneNumber || p.id);
  const rec = { groupId, groupName, userJid, keys, expires: Date.now() + SURVEY_EXPIRE_MS };
  keys.forEach(k => (db.pending[k] = rec));
  saveDB();
  const text = `Halo kak 👋\n\nKami melihat kamu baru saja keluar dari grup *${groupName}*.\nBoleh kami tahu alasannya? Balas pesan ini dengan alasanmu 🙏\n\nℹ️ *Penting:*\n• Jawabanmu akan *dibagikan ke grup ${groupName}*.\n• Mau tanpa nama? Awali jawabanmu dengan *anonim:*\n• Tidak mau menjawab? Ketik *${PREFIX}skip*\n\n_Berlaku 24 jam._`;
  setTimeout(() => sock.sendMessage(userJid, { text }).catch(e => log(c.red, 'Gagal kirim survey: ' + e.message)), 3000 + Math.random() * 3000);
}

function findPending(keys) {
  for (const k of keys) {
    const p = db.pending[k];
    if (!p) continue;
    if (Date.now() > p.expires) { p.keys.forEach(x => delete db.pending[x]); saveDB(); continue; }
    return p;
  }
  return null;
}
const clearPending = (p) => { p.keys.forEach(k => delete db.pending[k]); saveDB(); };

async function handleSurveyReply(p, raw, from) {
  let anon = false, reason = raw.trim();
  const m = reason.match(/^anonim\s*[:\-]?\s*/i);
  if (m) { anon = true; reason = reason.slice(m[0].length); }
  reason = reason.replace(/https?:\/\/\S+/gi, '[link dihapus]').slice(0, 500).trim();
  if (reason.length < 2) { await sock.sendMessage(from, { text: 'Alasan terlalu singkat.' }); return; }
  clearPending(p);
  const who = anon ? '*Anonim*' : `@${num(p.userJid)}`;
  const caption = `🚪 *ALASAN KELUAR GRUP*\n━━━━━━━━━━━━━━\n👤 Dari : ${who}\n💬 "${reason}"\n━━━━━━━━━━━━━━\n_Terima kasih._`;
  try {
    await sock.sendMessage(p.groupId, { text: caption, mentions: anon ? [] : [p.userJid] });
    await sock.sendMessage(from, { text: `✅ Terima kasih! Jawaban dibagikan ke grup *${p.groupName}*.` });
  } catch { await sock.sendMessage(from, { text: '⚠️ Bot tidak bisa kirim ke grup tsb.' }); }
}

async function onParticipants(update) {
  const { id, participants, action, author } = update;
  const g = getGroup(id);
  let meta; try { meta = await getMeta(id, true); } catch { return; }
  const base = { group: meta.subject, count: String(meta.participants.length), desc: (meta.desc || '').slice(0, 300) };

  for (const p of participants) {
    const jid = pj(p);
    if (num(jid) === num(sock.user?.id)) continue;
    const o = { ...base, user: num(jid) };

    if (action === 'add' && g.welcome) {
      log(c.green, `[JOIN] ${o.user} masuk ke ${meta.subject}`);
      await sendCard(id, jid, fill(g.welcomeText || WELCOME_TPL, o)).catch(() => {});
    }
    if (action === 'remove') {
      log(c.yellow, `[KELUAR] ${o.user} keluar dari ${meta.subject}`);
      if (g.goodbye) await sendCard(id, jid, fill(g.byeText || BYE_TPL, o)).catch(() => {});
      const leftBySelf = !author || pIds(p).map(num).includes(num(author));
      if (g.survey && leftBySelf) startSurvey(id, meta.subject, p);
    }
    if (action === 'promote') await sock.sendMessage(id, { text: `🎖️ @${o.user} menjadi *admin*.`, mentions: [jid] }).catch(() => {});
    if (action === 'demote') await sock.sendMessage(id, { text: `📉 @${o.user} bukan admin lagi.`, mentions: [jid] }).catch(() => {});
  }
}

// ================= BOT =================
const cooldown = new Map();

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  let version; try { ({ version } = await fetchLatestBaileysVersion()); } catch {}

  sock = makeWASocket({
    auth: state,
    version,
    logger,
    syncFullHistory: false,
    downloadHistory: false,
    markOnlineOnConnect: false,
    browser: ['Ubuntu', 'Chrome', '20.0.0'],
  });
  const me = sock;
  me.ev.on('creds.update', saveCreds);

  // Footer otomatis
  const originalSendMessage = sock.sendMessage.bind(sock);
  sock.sendMessage = async (jid, content, options) => {
    if (content && typeof content === 'object' && !content.react && !content.delete) {
      if (typeof content.text === 'string' && !content.text.endsWith(FOOTER_TEXT)) content.text += FOOTER_TEXT;
      if (typeof content.caption === 'string' && !content.caption.endsWith(FOOTER_TEXT)) content.caption += FOOTER_TEXT;
    }
    return originalSendMessage(jid, content, options);
  };

  if (!me.authState.creds.registered) {
    console.log('');
    const phoneInput = await askQuestion(`${c.yellow}📱 Masukkan nomor WhatsApp bot (contoh: 628xxx): ${c.reset}`);
    const cleanPhone = phoneInput.trim().replace(/\D/g, '');
    if (!/^\d{10,15}$/.test(cleanPhone)) { log(c.red, '❌ Format tidak valid.'); process.exit(1); }
    await delay(2000);
    try {
      const code = await me.requestPairingCode(cleanPhone);
      await showPairing(code);
    } catch (err) { log(c.red, `❌ Gagal: ${err.message}`); process.exit(1); }
  }

  me.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'connecting') startSpinner('Menghubungkan ke Server WhatsApp');
    if (connection === 'open') {
      stopSpinner();
      connected = true;
      await showDashboard(me);
      startSchedulers();
    }
    if (connection === 'close') {
      stopSpinner();
      connected = false;
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode === DisconnectReason.restartRequired) return startBot();
      if (!me.authState.creds.registered) { log(c.red, '❌ Koneksi putus sebelum login.'); process.exit(1); }
      if (statusCode !== DisconnectReason.loggedOut) {
        log(c.red, '🔄 Menyambung ulang...'); setTimeout(startBot, 3000);
      } else {
        log(c.red, '❌ Sesi tidak valid (Logout). Hapus folder auth_info lalu jalankan ulang.');
      }
    }
  });

  me.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;
    const msg = m.messages[0];
    if (!msg?.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    if (!from || from === 'status@broadcast' || from.endsWith('@newsletter')) return;

    const isGroup = from.endsWith('@g.us');
    const sender = isGroup ? (msg.key.participant || msg.participant) : from;
    const content = normalizeMessageContent(msg.message);
    const text = (content?.conversation || content?.extendedTextMessage?.text || content?.imageMessage?.caption || content?.videoMessage?.caption || '').trim();
    const pushName = msg.pushName || 'Kak';
    const reply = (t) => me.sendMessage(from, { text: t }, { quoted: msg });
    const alts = [msg.key.remoteJidAlt, msg.key.senderPn, msg.key.senderLid, msg.key.participantAlt, msg.key.participantPn, msg.key.participantLid].filter(Boolean);

    try {
      if (!isGroup) {
        const keys = [from, msg.key.remoteJidAlt, msg.key.senderPn].filter(Boolean).map(num);
        const pend = findPending(keys);
        if (pend) {
          if (text.toLowerCase() === `${PREFIX}skip`) { clearPending(pend); return reply('Baik, terima kasih 🙏'); }
          if (text && !text.startsWith(PREFIX)) return handleSurveyReply(pend, text, from);
        }
      }

      const isCmd = text.startsWith(PREFIX);

      // Data grup hanya diambil bila perlu (perintah / antilink) -> lebih ringan & cepat
      let meta = null;
      if (isGroup) {
        const g = getGroup(from);
        if (isCmd || g.antilink) meta = await getMeta(from).catch(() => null);
        if (meta && g.antilink && /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i.test(text) && !isAdminIn(meta, sender) && isBotAdmin(meta)) {
          await me.sendMessage(from, { delete: msg.key });
          g.warns[num(sender)] = (g.warns[num(sender)] || 0) + 1; saveDB();
          const n = g.warns[num(sender)];
          await me.sendMessage(from, { text: `🚫 @${num(sender)} dilarang kirim link grup! (${n}/3)`, mentions: [sender] });
          if (n >= 3) { await me.groupParticipantsUpdate(from, [sender], 'remove'); delete g.warns[num(sender)]; saveDB(); }
          return;
        }
      }

      // Sapaan otomatis di chat pribadi (1x per hari per user)
      if (!isCmd) {
        if (!isGroup && AUTO_GREET_PRIVATE && text) {
          const u = getUser(phoneKey(from, null, alts));
          if (u.greetDay !== today()) {
            u.greetDay = today(); saveDB();
            const g = greetOf();
            await reply(`${g.i} *${g.w}, kak ${pushName}!*\nAda yang bisa dibantu? Ketik *${PREFIX}menu* untuk melihat semua fitur 😊`);
          }
        }
        return;
      }

      const args = text.slice(PREFIX.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();
      const entry = commands.get(command);
      if (!entry) return;

      const userKey = phoneKey(sender, meta, alts);
      const isOwner = userKey === OWNER_NUMBER || num(sender) === OWNER_NUMBER || alts.some(j => num(j) === OWNER_NUMBER);

      const last = cooldown.get(sender) || 0;
      if (!isOwner && Date.now() - last < COOLDOWN_MS) return;
      cooldown.set(sender, Date.now());

      const isAdmin = isGroup && meta ? (isAdminIn(meta, sender) || isOwner) : false;
      const botAdmin = isGroup && meta ? isBotAdmin(meta) : false;
      const { opts, fn } = entry;

      if (opts.owner && !isOwner) return reply('❌ Perintah ini khusus *owner bot*.');
      if (opts.group && !isGroup) return reply('❌ Perintah ini khusus di dalam grup.');
      if (opts.admin && !isAdmin) return reply('❌ Perintah ini khusus admin grup.');
      if (opts.botAdmin && !botAdmin) return reply('❌ Jadikan bot sebagai admin terlebih dahulu.');

      const user = getUser(userKey);
      const unlimited = isOwner || isVip(user);
      const cost = opts.limit || 0;
      if (cost && !unlimited && user.limit < cost) {
        return reply(box('LIMIT HABIS 🎟️', ['Limit harianmu sudah habis.', `🔄 Reset otomatis dalam *${resetIn()}* (00:00 WIB)`, `💎 Beli VIP → ketik ${PREFIX}vip`]));
      }

      stats.cmd++;
      log(c.magenta, `⌨ ${PREFIX}${command} ← ${userKey}${isGroup ? ' (grup)' : ' (pribadi)'}`);

      // Perintah "fast" (menu, kalkulator, dll) tidak memakai presence & reaksi -> respon instan
      const fast = !!opts.fast;
      if (!fast) {
        me.sendPresenceUpdate('composing', from).catch(() => {});
        me.sendMessage(from, { react: { text: '⏳', key: msg.key } }).catch(() => {});
      }

      const ctx = { msg, from, sender, isGroup, args, text: args.join(' '), command, reply, meta, isAdmin, botAdmin, pushName, userKey, isOwner, user, unlimited, free: false };
      ctx.usage = (t) => { ctx.free = true; return reply(t); };

      try {
        await fn(ctx);
        if (cost && !unlimited && !ctx.free) { user.limit = Math.max(0, user.limit - cost); saveDB(); }
        if (!fast) me.sendMessage(from, { react: { text: ctx.free ? 'ℹ️' : '✅', key: msg.key } }).catch(() => {});
      } catch (err) {
        log(c.red, `Error ${command}: ${err.message}`);
        me.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        await reply(`❌ Gagal: ${err.message}`);
      }
    } catch (err) { log(c.red, 'Handler error: ' + err.message); }
  });

  me.ev.on('group-participants.update', (u) => onParticipants(u).catch(e => log(c.red, 'Participants error: ' + e.message)));
  me.ev.on('groups.update', (u) => u.forEach(g => g.id && metaCache.delete(g.id)));
}

process.on('unhandledRejection', (e) => log(c.red, 'Unhandled: ' + (e?.message || e)));
process.on('uncaughtException', (e) => log(c.red, 'Exception: ' + (e?.message || e)));
process.setMaxListeners(50);

// ================= JALANKAN (ANIMASI TERMUX) =================
(async () => {
  console.clear();
  process.stdout.write('\x1b[?25l'); // sembunyikan kursor selama animasi
  process.on('exit', () => process.stdout.write('\x1b[?25h'));
  console.log('');
  await animateBanner();
  await startupVerification();
  verifyScriptIntegrity();
  console.log('  ' + rainbow('━'.repeat(Math.min(36, (process.stdout.columns || 40) - 4))));
  await typeWriter('       ✦ Premium Edition ✦', 18, rgb(220) + c.bright);
  await typeWriter('        Mini Bot By HironiLN', 18, rgb(120));
  console.log('');

  await cyberLoading('Memuat sistem inti...', 700);
  console.log('');
  await bootStep('Memuat konfigurasi');
  await bootStep(`Membaca database (${Object.keys(db.users).length} user, ${Object.keys(db.groups).length} grup)`);
  await bootStep(`Mendaftarkan ${new Set([...commands.values()]).size} perintah`);
  await bootStep('Menyiapkan banner menu (cache)', prepareBanner);
  await bootStep('Menyiapkan ucapan otomatis', async () => AUTO_GREET_GROUP ? GREET_SLOTS.map(s => `${String(s.h).padStart(2, '0')}:${String(s.m).padStart(2, '0')}`).join(' ') : 'nonaktif');

  console.log(`\n${c.green}✅ Sistem siap! Menjalankan bot...${c.reset}\n`);
  process.stdout.write('\x1b[?25h');
  await sleepAnim(400);
  startBot();
})();