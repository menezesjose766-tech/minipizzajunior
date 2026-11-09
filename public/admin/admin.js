/* Painel admin — Mini Pizza Junior */
(() => {
  const PK = window.PizzaKit; PK.injectDefs();
  const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  $$('[data-logo]').forEach(el => el.innerHTML = PK.logoSVG());

  /* ---------- API ---------- */
  async function api(url, opts = {}) {
    const r = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' });
    if (r.status === 401 && url !== '/api/login') { showLogin(); throw new Error('Sessão expirada'); }
    const body = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(body.error || 'Erro ' + r.status);
    return body;
  }
  function toast(msg, err) { const t = $('#toast'); t.textContent = msg; t.classList.toggle('err', !!err); t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600); }

  /* ---------- estado ---------- */
  let saved = null, state = null, sel = 0;
  const dirty = () => ({
    flavors: JSON.stringify(state.flavors) !== JSON.stringify(saved.flavors),
    testimonials: JSON.stringify(state.testimonials) !== JSON.stringify(saved.testimonials),
    settings: JSON.stringify(state.settings) !== JSON.stringify(saved.settings),
  });
  function refreshSavebar() { const d = dirty(); $('#savebar').classList.toggle('show', d.flavors || d.testimonials || d.settings); }
  addEventListener('beforeunload', e => { if (state && Object.values(dirty()).some(Boolean)) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- login ---------- */
  function showLogin() { $('#app').hidden = true; $('#login').hidden = false; $('#senha').focus(); }
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault(); $('#loginErro').textContent = '';
    try { await api('/api/login', { method: 'POST', body: JSON.stringify({ password: $('#senha').value }) }); $('#senha').value = ''; start(); }
    catch (err) { $('#loginErro').textContent = err.message; }
  });
  $('#sair').addEventListener('click', async () => { await api('/api/logout', { method: 'POST', body: '{}' }); location.reload(); });

  async function start() {
    const data = await api('/api/admin/data');
    saved = clone(data); state = clone(data); sel = 0;
    $('#login').hidden = true; $('#app').hidden = false;
    renderList(); renderEditor(true); renderDeps(); fillConfig(); refreshSavebar();
    window.__adminFlavors = () => state.flavors;
    document.dispatchEvent(new Event('admin:ready'));
  }

  /* ---------- abas ---------- */
  $$('.tab').forEach(t => t.addEventListener('click', () => {
    $$('.tab').forEach(x => x.setAttribute('aria-selected', x === t));
    $$('[data-panel]').forEach(p => p.hidden = p.dataset.panel !== t.dataset.tab);
    if (t.dataset.tab === 'config') fillHeroSelect();
    if (t.dataset.tab === 'sabores') replay();
  }));

  /* =================== SABORES =================== */
  const cur = () => state.flavors[sel];

  function renderList() {
    $('#listaSab').innerHTML = state.flavors.map((f, i) => `
      <div class="item ${f.active ? '' : 'off'}" data-i="${i}" aria-current="${i === sel}">
        <div class="mini">${PK.pizzaSVG(f)}</div>
        <div class="nm"><b>${esc(f.name)}</b><small>${f.active ? 'Visível' : 'Oculto'}</small></div>
        <div class="ord"><button data-mv="-1" title="Subir" aria-label="Subir">▲</button><button data-mv="1" title="Descer" aria-label="Descer">▼</button></div>
      </div>`).join('');
    $('#editor').hidden = !state.flavors.length;
  }
  $('#listaSab').addEventListener('click', e => {
    const it = e.target.closest('.item'); if (!it) return;
    const i = +it.dataset.i, mv = e.target.closest('[data-mv]');
    if (mv) {
      const j = i + +mv.dataset.mv; if (j < 0 || j >= state.flavors.length) return;
      [state.flavors[i], state.flavors[j]] = [state.flavors[j], state.flavors[i]];
      if (sel === i) sel = j; else if (sel === j) sel = i;
      renderList(); refreshSavebar(); return;
    }
    if (i !== sel) { sel = i; renderList(); renderEditor(true); }
  });
  $('#novoSab').addEventListener('click', () => {
    const id = 'sabor-' + Math.random().toString(36).slice(2, 8);
    state.flavors.push({ id, name: 'Novo sabor', short: '', badge: '', desc: '', price: 0, active: false, base: 'tomate', cheese: true, toppings: [], drizzle: null, center: null, oregano: false });
    sel = state.flavors.length - 1; renderList(); renderEditor(true); refreshSavebar();
    const nm = $('[data-f="name"]'); nm.focus(); nm.select();
  });
  $('#apagarSab').addEventListener('click', () => {
    if (!confirm(`Apagar o sabor “${cur().name}”? (Só será definitivo quando você salvar.)`)) return;
    state.flavors.splice(sel, 1); sel = Math.max(0, sel - 1); renderList(); renderEditor(true); refreshSavebar();
  });

  // campos simples
  $$('#editor [data-f]').forEach(inp => inp.addEventListener('input', () => {
    const f = cur(), k = inp.dataset.f;
    f[k] = inp.type === 'checkbox' ? inp.checked : inp.type === 'number' ? (+inp.value || 0) : inp.value;
    if (k === 'cheese') drawPreview();
    if (['name', 'active', 'cheese'].includes(k)) updateListItem();
    updateMeta(); refreshSavebar();
  }));

  // botões segmentados
  function seg(el, options, key, onChange) {
    el.innerHTML = Object.entries(options).map(([v, l]) => `<button type="button" data-v="${v}">${esc(l)}</button>`).join('');
    el.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      cur()[key] = b.dataset.v === '' ? null : b.dataset.v;
      syncSeg(el, key); onChange(); updateListItem(); updateMeta(); refreshSavebar();
    });
  }
  const syncSeg = (el, key) => el.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', (cur()[key] ?? '') === b.dataset.v));
  seg($('#segBase'), PK.BASES, 'base', () => drawPreview());
  seg($('#segDrizzle'), { '': 'Nenhuma', ...Object.fromEntries(Object.entries(PK.DRIZZLES).map(([k, v]) => [k, v[0]])) }, 'drizzle', () => drawPreview('drizzle'));
  seg($('#segCenter'), { '': 'Nada', ...PK.CENTERS }, 'center', () => drawPreview('center'));

  // paleta de ingredientes
  const groups = {};
  Object.entries(PK.TOPPINGS).forEach(([k, t]) => (groups[t.group] = groups[t.group] || []).push(k));
  $('#paleta').innerHTML = Object.entries(groups).map(([g, ks]) => `<div><h4>${g}</h4><div class="pal">${ks.map(k => `<button type="button" data-k="${k}">${PK.iconSVG(PK.TOPPINGS[k].icon || k, true)}${esc(PK.TOPPINGS[k].label)}</button>`).join('')}</div></div>`).join('');
  $('#paleta').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const k = b.dataset.k, f = cur(), has = f.toppings.find(t => t.k === k);
    if (has) f.toppings = f.toppings.filter(t => t.k !== k);
    else f.toppings.push({ k, n: PK.TOPPINGS[k].def });
    renderChosen(); drawPreview(has ? null : k); updateListItem(); updateMeta(); refreshSavebar();
  });

  function renderChosen() {
    const f = cur();
    $$('#paleta button').forEach(b => b.classList.toggle('on', f.toppings.some(t => t.k === b.dataset.k)));
    $('#escolhidos').innerHTML = f.toppings.length ? f.toppings.map(t => {
      const T = PK.TOPPINGS[t.k];
      return `<div class="esc" data-k="${t.k}">${PK.iconSVG(T.icon || t.k, true)}<b>${esc(T.label)}</b><input type="range" min="1" max="${T.max}" value="${t.n}" aria-label="Quantidade de ${esc(T.label)}"><output>${t.n}</output><button type="button" title="Remover" aria-label="Remover ${esc(T.label)}">✕</button></div>`;
    }).join('') : `<div class="vazio">Toque nos ingredientes acima para colocar na pizza 👆</div>`;
  }
  let rangeTimer;
  $('#escolhidos').addEventListener('input', e => {
    if (e.target.type !== 'range') return;
    const row = e.target.closest('.esc'), t = cur().toppings.find(x => x.k === row.dataset.k);
    t.n = +e.target.value; row.querySelector('output').textContent = t.n;
    drawPreview(); clearTimeout(rangeTimer); rangeTimer = setTimeout(() => { updateListItem(); refreshSavebar(); }, 150);
  });
  $('#escolhidos').addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') return;
    const k = e.target.closest('.esc').dataset.k;
    cur().toppings = cur().toppings.filter(t => t.k !== k);
    renderChosen(); drawPreview(); updateListItem(); updateMeta(); refreshSavebar();
  });

  function renderEditor(animate) {
    if (!state.flavors.length) return;
    const f = cur();
    $$('#editor [data-f]').forEach(inp => { const v = f[inp.dataset.f]; if (inp.type === 'checkbox') inp.checked = inp.dataset.f === 'cheese' || inp.dataset.f === 'active' ? v !== false : !!v; else inp.value = v ?? ''; });
    syncSeg($('#segBase'), 'base'); syncSeg($('#segDrizzle'), 'drizzle'); syncSeg($('#segCenter'), 'center');
    renderChosen(); updateMeta();
    drawPreview(); if (animate) replay();
  }
  function drawPreview(animateOnly) {
    const pv = $('#pv'); pv.innerHTML = PK.pizzaSVG(cur());
    if (animateOnly) PK.assemble(pv, { only: animateOnly });
  }
  function replay() {
    const pv = $('#pv'); if (!state || !state.flavors.length) return;
    pv.innerHTML = PK.pizzaSVG(cur());
    if (window.gsap) gsap.fromTo(pv, { rotate: -180, scale: .5, opacity: 0 }, { rotate: 0, scale: 1, opacity: 1, duration: .6, ease: 'back.out(1.4)' });
    setTimeout(() => PK.assemble(pv), 350);
  }
  $('#replay').addEventListener('click', replay);
  function updateMeta() {
    const f = cur();
    $('#pvNome').textContent = f.name;
    $('#pvBadge').textContent = f.badge; $('#pvBadge').hidden = !f.badge;
    $('#pvChips').innerHTML = PK.ingredientNames(f).map(c => `<span class="chip">${esc(c)}</span>`).join('');
  }
  function updateListItem() {
    const it = $(`#listaSab .item[data-i="${sel}"]`); if (!it) return;
    const f = cur();
    it.querySelector('.mini').innerHTML = PK.pizzaSVG(f);
    it.querySelector('b').textContent = f.name;
    it.querySelector('small').textContent = f.active ? 'Visível' : 'Oculto';
    it.classList.toggle('off', !f.active);
  }

  /* =================== DEPOIMENTOS =================== */
  function renderDeps() {
    $('#deps').innerHTML = state.testimonials.map((d, i) => `
      <div class="dep" data-i="${i}">
        <label class="f"><span>Nome</span><input type="text" data-d="name" maxlength="40" value="${esc(d.name)}"></label>
        <label class="f"><span>Quem é</span><input type="text" data-d="role" maxlength="40" value="${esc(d.role)}" placeholder="Ex.: Revendedor parceiro"></label>
        <label class="f"><span>Depoimento</span><textarea data-d="text" maxlength="300">${esc(d.text)}</textarea></label>
        <div class="acts"><span><button class="btn-ghost" data-mv="-1" aria-label="Mover para cima">▲</button><button class="btn-ghost" data-mv="1" aria-label="Mover para baixo">▼</button></span><button class="btn-ghost danger" data-del>🗑 Remover</button></div>
      </div>`).join('') || '<div class="vazio">Nenhum depoimento. A seção some do site enquanto estiver vazia.</div>';
  }
  $('#deps').addEventListener('input', e => {
    const i = +e.target.closest('.dep').dataset.i; state.testimonials[i][e.target.dataset.d] = e.target.value; refreshSavebar();
  });
  $('#deps').addEventListener('click', e => {
    const card = e.target.closest('.dep'); if (!card) return; const i = +card.dataset.i;
    if (e.target.closest('[data-del]')) { if (!confirm('Remover este depoimento?')) return; state.testimonials.splice(i, 1); }
    else if (e.target.closest('[data-mv]')) { const j = i + +e.target.closest('[data-mv]').dataset.mv; if (j < 0 || j >= state.testimonials.length) return; [state.testimonials[i], state.testimonials[j]] = [state.testimonials[j], state.testimonials[i]]; }
    else return;
    renderDeps(); refreshSavebar();
  });
  $('#novoDep').addEventListener('click', () => { state.testimonials.push({ name: '', role: '', text: '' }); renderDeps(); refreshSavebar(); $('#deps .dep:last-child input').focus(); });

  /* =================== CONFIG =================== */
  const cfg = $('#cfg');
  function fillHeroSelect() {
    const sel = $('#heroFlavor'), v = state.settings.heroFlavor;
    sel.innerHTML = state.flavors.map(f => `<option value="${esc(f.id)}">${esc(f.name)}</option>`).join('');
    sel.value = state.flavors.some(f => f.id === v) ? v : (state.flavors[0] || {}).id || '';
  }
  function fillConfig() {
    fillHeroSelect();
    for (const el of cfg.elements) { if (!el.name) continue; const v = state.settings[el.name]; if (el.type === 'checkbox') el.checked = !!v; else if (el.tagName !== 'SELECT') el.value = v ?? ''; }
  }
  cfg.addEventListener('input', e => {
    const el = e.target; if (!el.name) return;
    state.settings[el.name] = el.type === 'checkbox' ? el.checked : el.type === 'number' ? (+el.value || 0) : el.value;
    refreshSavebar();
  });

  /* =================== SALVAR =================== */
  $('#salvar').addEventListener('click', async () => {
    const d = dirty(), btn = $('#salvar'); btn.disabled = true; btn.textContent = 'Salvando...';
    try {
      if (d.flavors) state.flavors = await api('/api/admin/flavors', { method: 'PUT', body: JSON.stringify(state.flavors) });
      if (d.testimonials) state.testimonials = await api('/api/admin/testimonials', { method: 'PUT', body: JSON.stringify(state.testimonials) });
      if (d.settings || d.flavors) state.settings = await api('/api/admin/settings', { method: 'PUT', body: JSON.stringify(state.settings) });
      saved = clone(state); sel = Math.min(sel, Math.max(0, state.flavors.length - 1));
      renderList(); renderEditor(false); renderDeps(); fillConfig(); refreshSavebar();
      toast('✅ Salvo! O site já está atualizado.');
    } catch (err) { toast('Não foi possível salvar: ' + err.message, true); }
    btn.disabled = false; btn.textContent = 'Salvar alterações';
  });
  $('#descartar').addEventListener('click', () => {
    if (!confirm('Descartar todas as alterações não salvas?')) return;
    state = clone(saved); sel = Math.min(sel, Math.max(0, state.flavors.length - 1));
    renderList(); renderEditor(true); renderDeps(); fillConfig(); refreshSavebar();
  });

  /* início */
  api('/api/me').then(r => r.admin ? start() : showLogin()).catch(showLogin);
})();
