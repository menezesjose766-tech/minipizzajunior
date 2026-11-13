/*
 * Mini Pizza Junior — servidor do site + painel admin.
 *   node server.js   →  site em http://localhost:3000  |  painel em /admin
 * Os dados ficam em data/db.json (criado a partir dos dados padrão na 1ª execução).
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PizzaKit = require('./public/js/pizza.js');

/* ---------- .env simples (sem dependências) ---------- */
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const PORT = +process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const PROD = process.env.NODE_ENV === 'production';
if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.error('⚠️  Defina ADMIN_PASSWORD (mín. 8 caracteres) no arquivo .env — veja .env.example');
  process.exit(1);
}

/* ---------- "banco" em JSON ---------- */
const DB_FILE = path.join(__dirname, 'data', 'db.json');
function readDB() {
  if (!fs.existsSync(DB_FILE)) writeDB(PizzaKit.DEFAULT_DATA);
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
function writeDB(data) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DB_FILE); // escrita atômica
}

/* ---------- validação ---------- */
const str = (v, max) => String(v ?? '').trim().slice(0, max);
const num = (v, min, max, def) => { const n = Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def; };
function cleanSettings(s = {}) {
  return {
    whatsapp: str(s.whatsapp, 20).replace(/\D/g, ''),
    instagram: str(s.instagram, 40).replace(/[^a-zA-Z0-9._]/g, ''),
    endereco: str(s.endereco, 200),
    heroTitle: str(s.heroTitle, 120) || PizzaKit.DEFAULT_DATA.settings.heroTitle,
    heroSubtitle: str(s.heroSubtitle, 400),
    heroFlavor: str(s.heroFlavor, 40),
    mostrarPrecos: !!s.mostrarPrecos,
    margemPadrao: num(s.margemPadrao, 0.5, 50, 3),
    aceitarPedidos: s.aceitarPedidos !== false,
    taxaEntrega: Math.round(num(s.taxaEntrega, 0, 500, 0) * 100) / 100,
    pedidoMinimo: Math.round(num(s.pedidoMinimo, 1, 1000, 1)),
    regiao: str(s.regiao, 80) || 'Nanuque e região',
    encomenda: str(s.encomenda ?? PizzaKit.DEFAULT_DATA.settings.encomenda, 1000),
    ebookLink: /^https:\/\/[^\s"'<>]+$/.test(str(s.ebookLink, 300)) ? str(s.ebookLink, 300) : '',
    brotinho1: Math.round(num(s.brotinho1, 0, 100, 2.5) * 100) / 100,
    brotinho60: Math.round(num(s.brotinho60, 0, 100, 2) * 100) / 100,
    brotinho100: Math.round(num(s.brotinho100, 0, 100, 1.9) * 100) / 100,
    eventoLocal: Math.round(num(s.eventoLocal, 0, 1000, 40) * 100) / 100,
  };
}

/* ---------- pedidos (data/orders.json) ---------- */
const ORD_FILE = path.join(__dirname, 'data', 'orders.json');
const STATUS = ['novo', 'confirmado', 'preparo', 'saiu', 'entregue', 'cancelado'];
const PAGAMENTOS = { combinar: 'A combinar no WhatsApp', pix: 'Pix', dinheiro: 'Dinheiro', cartao: 'Cartão na entrega' };
function readOrders() {
  if (!fs.existsSync(ORD_FILE)) return { next: 1001, list: [] };
  return JSON.parse(fs.readFileSync(ORD_FILE, 'utf8'));
}
function writeOrders(o) {
  fs.mkdirSync(path.dirname(ORD_FILE), { recursive: true });
  fs.writeFileSync(ORD_FILE + '.tmp', JSON.stringify(o, null, 2));
  fs.renameSync(ORD_FILE + '.tmp', ORD_FILE);
}
function buildOrder(b, db) {
  const S = cleanSettings(db.settings);
  if (!S.aceitarPedidos) throw new Error('No momento não estamos recebendo pedidos pelo site. Chame no WhatsApp!');
  const items = [];
  for (const it of Array.isArray(b.items) ? b.items.slice(0, 30) : []) {
    const f = db.flavors.find(x => x.id === (it && it.id) && x.active);
    const qty = Math.round(num(it && it.qty, 0, 1000, 0));
    if (!f || qty < 1) continue;
    const ex = items.find(x => x.id === f.id);
    if (ex) ex.qty += qty; else items.push({ id: f.id, name: f.name, qty, price: f.price || 0 });
  }
  if (!items.length) throw new Error('Seu carrinho está vazio.');
  const units = items.reduce((s, i) => s + i.qty, 0);
  if (units < S.pedidoMinimo) throw new Error(`O pedido mínimo é de ${S.pedidoMinimo} mini pizzas.`);
  const c = b.customer || {};
  const name = str(c.name, 60), phone = str(c.phone, 20).replace(/\D/g, '');
  if (name.length < 2) throw new Error('Informe seu nome.');
  if (phone.length < 10 || phone.length > 13) throw new Error('Informe um WhatsApp válido com DDD.');
  const delivery = b.delivery === 'retirada' ? 'retirada' : 'entrega';
  let address = null;
  if (delivery === 'entrega') {
    const a = b.address || {};
    address = { rua: str(a.rua, 120), numero: str(a.numero, 20), bairro: str(a.bairro, 80), cidade: str(a.cidade, 80), complemento: str(a.complemento, 80), referencia: str(a.referencia, 120) };
    if (!address.rua || !address.numero || !address.bairro || !address.cidade) throw new Error('Preencha rua, número, bairro e cidade.');
  }
  const payment = PAGAMENTOS[b.payment] ? b.payment : 'combinar';
  const priced = items.every(i => i.price > 0);
  const subtotal = priced ? Math.round(items.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100 : null;
  const fee = delivery === 'entrega' ? S.taxaEntrega : 0;
  return {
    items, units, subtotal, fee, total: subtotal === null ? null : Math.round((subtotal + fee) * 100) / 100,
    customer: { name, phone }, delivery, address,
    payment, change: payment === 'dinheiro' ? str(b.change, 20) : '',
    notes: str(b.notes, 400),
    status: 'novo', adminNote: '', createdAt: new Date().toISOString(), history: [{ status: 'novo', at: new Date().toISOString() }],
  };
}
const orderHits = new Map(); // limite: 5 pedidos a cada 10 min por IP
function cleanFlavor(f = {}, used) {
  let id = str(f.id, 40).toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!id || used.has(id)) id = 'sabor-' + crypto.randomBytes(3).toString('hex');
  used.add(id);
  const toppings = [];
  for (const t of Array.isArray(f.toppings) ? f.toppings.slice(0, 12) : []) {
    const T = PizzaKit.TOPPINGS[t && t.k];
    if (T && !toppings.some(x => x.k === t.k)) toppings.push({ k: t.k, n: Math.round(num(t.n, 1, T.max, T.def)) });
  }
  return {
    id,
    name: str(f.name, 40) || 'Novo sabor',
    short: str(f.short, 40),
    badge: str(f.badge, 40),
    desc: str(f.desc, 300),
    price: Math.round(num(f.price, 0, 9999, 0) * 100) / 100,
    active: f.active !== false,
    base: PizzaKit.BASES[f.base] ? f.base : 'tomate',
    cheese: f.cheese !== false,
    toppings,
    drizzle: PizzaKit.DRIZZLES[f.drizzle] ? f.drizzle : null,
    center: PizzaKit.CENTERS[f.center] ? f.center : null,
    oregano: !!f.oregano,
  };
}
const cleanTestimonial = t => ({ name: str(t && t.name, 40) || 'Cliente', role: str(t && t.role, 40), text: str(t && t.text, 300) });

/* ---------- sessão com cookie assinado ---------- */
// token = expiração.época.assinatura — "sair" aumenta a época (derruba cookies copiados);
// a chave mistura a senha, então trocar ADMIN_PASSWORD invalida todas as sessões.
const COOKIE = 'mpj_admin';
const KEY = crypto.createHmac('sha256', SECRET).update(ADMIN_PASSWORD).digest();
let epoch = 1;
const sign = v => crypto.createHmac('sha256', KEY).update(v).digest('base64url');
function makeToken() { const v = `${Date.now() + 8 * 3600e3}.${epoch}`; return v + '.' + sign(v); }
function validToken(tok) {
  if (typeof tok !== 'string') return false;
  const [exp, ep, sig, extra] = tok.split('.');
  if (!exp || !ep || !sig || extra !== undefined) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(`${exp}.${ep}`));
  return a.length === b.length && crypto.timingSafeEqual(a, b) && Date.now() < +exp && +ep === epoch;
}
function getCookie(req, name) {
  const m = (req.headers.cookie || '').split(/;\s*/).find(c => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
}
function setCookie(res, value, maxAge) {
  res.setHeader('Set-Cookie', `${COOKIE}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${PROD ? '; Secure' : ''}`);
}
const requireAdmin = (req, res, next) => validToken(getCookie(req, COOKIE)) ? next() : res.status(401).json({ error: 'Não autorizado' });

// limite de tentativas de login (5 a cada 15 min por IP)
const attempts = new Map();
function tooMany(ip) {
  const now = Date.now(), a = attempts.get(ip) || { n: 0, t: now };
  if (now - a.t > 15 * 60e3) { a.n = 0; a.t = now; }
  attempts.set(ip, a);
  return a.n >= 5 ? a : (a.n++, null);
}
// tetos gerais (contra ataques vindos de muitos IPs) e limpeza dos mapas para não crescerem sem fim
const globalHits = { login: [], order: [] };
function globalLimit(kind, max, windowMs, count) {
  const now = Date.now(); globalHits[kind] = globalHits[kind].filter(t => now - t < windowMs);
  if (globalHits[kind].length >= max) return true;
  if (count) globalHits[kind].push(now);
  return false;
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, a] of attempts) if (now - a.t > 15 * 60e3) attempts.delete(ip);
  for (const [ip, h] of orderHits) if (!h.some(t => now - t < 10 * 60e3)) orderHits.delete(ip);
}, 10 * 60e3).unref();

/* ---------- app ---------- */
const app = express();
app.disable('x-powered-by');
if (PROD) app.set('trust proxy', 1); // atrás do proxy do hosting: req.ip = IP real do visitante
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'");
  if (PROD) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});
app.use(express.json({ limit: '200kb' }));
// as rotas que alteram dados só aceitam JSON (proteção extra contra CSRF)
app.use(['/api/admin', '/api/orders'], (req, res, next) => (req.method === 'GET' || req.method === 'DELETE' || req.is('application/json')) ? next() : res.status(415).json({ error: 'Use JSON' }));

app.post('/api/orders', (req, res) => {
  const now = Date.now(), hits = (orderHits.get(req.ip) || []).filter(t => now - t < 10 * 60e3);
  if (hits.length >= 5) return res.status(429).json({ error: 'Muitos pedidos seguidos. Aguarde alguns minutos ou chame no WhatsApp.' });
  if (globalLimit('order', 60, 3600e3, false)) return res.status(429).json({ error: 'Estamos recebendo muitos pedidos agora. Chame a gente no WhatsApp!' });
  if (readOrders().list.length >= 5000) return res.status(503).json({ error: 'Não foi possível registrar o pedido agora. Chame a gente no WhatsApp!' });
  if (req.body && req.body.website) return res.json({ ok: true, number: 0 }); // armadilha para robôs
  let order;
  try { order = buildOrder(req.body || {}, readDB()); }
  catch (e) { return res.status(400).json({ error: e.message }); }
  const o = readOrders();
  order.number = o.next++;
  o.list.push(order);
  writeOrders(o);
  hits.push(now); orderHits.set(req.ip, hits); globalLimit('order', 60, 3600e3, true);
  console.log(`🛒 Novo pedido #${order.number} — ${order.customer.name} (${order.units} un.)`);
  res.json({ ok: true, number: order.number, total: order.total, fee: order.fee, subtotal: order.subtotal });
});

app.get('/api/admin/orders', requireAdmin, (req, res) => res.json(readOrders().list.slice().reverse()));
app.patch('/api/admin/orders/:n', requireAdmin, (req, res) => {
  const o = readOrders(), ord = o.list.find(x => x.number === +req.params.n);
  if (!ord) return res.status(404).json({ error: 'Pedido não encontrado' });
  if (req.body.status !== undefined) {
    if (!STATUS.includes(req.body.status)) return res.status(400).json({ error: 'Status inválido' });
    if (req.body.status !== ord.status) { ord.status = req.body.status; ord.history.push({ status: ord.status, at: new Date().toISOString() }); }
  }
  if (req.body.adminNote !== undefined) ord.adminNote = str(req.body.adminNote, 400);
  writeOrders(o); res.json(ord);
});
app.delete('/api/admin/orders/:n', requireAdmin, (req, res) => {
  const o = readOrders(), i = o.list.findIndex(x => x.number === +req.params.n);
  if (i < 0) return res.status(404).json({ error: 'Pedido não encontrado' });
  o.list.splice(i, 1); writeOrders(o); res.json({ ok: true });
});

app.get('/api/public', (req, res) => {
  const db = readDB();
  res.json({ settings: cleanSettings(db.settings), flavors: db.flavors.filter(f => f.active), testimonials: db.testimonials });
});

app.post('/api/login', (req, res) => {
  const lock = tooMany(req.ip);
  if (lock || globalLimit('login', 30, 15 * 60e3, false)) return res.status(429).json({ error: 'Muitas tentativas. Tente de novo em alguns minutos.' });
  const pw = req.body && req.body.password;
  const given = crypto.createHash('sha256').update(typeof pw === 'string' ? pw : '').digest();
  const real = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
  if (typeof pw !== 'string' || !crypto.timingSafeEqual(given, real)) {
    globalLimit('login', 30, 15 * 60e3, true);
    return setTimeout(() => res.status(401).json({ error: 'Senha incorreta' }), 200 + Math.random() * 200);
  }
  attempts.delete(req.ip);
  setCookie(res, makeToken(), 8 * 3600);
  res.json({ ok: true });
});
app.post('/api/logout', (req, res) => {
  if (validToken(getCookie(req, COOKIE))) epoch++; // derruba todas as sessões abertas
  setCookie(res, '', 0); res.json({ ok: true });
});
app.get('/api/me', (req, res) => res.json({ admin: validToken(getCookie(req, COOKIE)) }));

app.get('/api/admin/data', requireAdmin, (req, res) => { const db = readDB(); res.json({ ...db, settings: cleanSettings(db.settings) }); });
app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const db = readDB(); db.settings = cleanSettings(req.body); writeDB(db); res.json(db.settings);
});
app.put('/api/admin/flavors', requireAdmin, (req, res) => {
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Lista inválida' });
  const used = new Set(), db = readDB();
  db.flavors = req.body.slice(0, 40).map(f => cleanFlavor(f, used));
  writeDB(db); res.json(db.flavors);
});
app.put('/api/admin/testimonials', requireAdmin, (req, res) => {
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Lista inválida' });
  const db = readDB(); db.testimonials = req.body.slice(0, 30).map(cleanTestimonial); writeDB(db); res.json(db.testimonials);
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Rota não encontrada' })); // não expõe public/api (versão PHP)
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html')));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.listen(PORT, () => {
  readDB();
  console.log(`🍕 Site:   http://localhost:${PORT}`);
  console.log(`🔐 Painel: http://localhost:${PORT}/admin`);
});
