/* Painel admin — aba Pedidos */
(() => {
  const css = `
  .tab-n{display:inline-grid;place-items:center;min-width:22px;height:22px;border-radius:99px;background:var(--laranja);color:#fff;font-size:.75rem;padding:0 6px;margin-left:4px;animation:pulseN 1.6s infinite}
  @keyframes pulseN{50%{transform:scale(1.15)}}
  .ord-bar{display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-bottom:16px}
  .ord-filtros{display:flex;gap:8px;flex-wrap:wrap}
  .ord-filtros button{padding:7px 14px;border-radius:99px;border:2px solid var(--borda);background:#fff;font-weight:800;cursor:pointer;font-size:.88rem}
  .ord-filtros button[aria-pressed="true"]{background:var(--escuro);color:#fff;border-color:var(--escuro)}
  .ord-filtros b{opacity:.65;margin-left:4px}
  #ordBusca{width:100%;max-width:320px;padding:10px 14px;border:2px solid var(--borda);border-radius:12px;background:#fff;outline:none}
  #ordBusca:focus{border-color:var(--laranja)}
  .ord-grid{display:grid;grid-template-columns:minmax(280px,380px) 1fr;gap:22px;align-items:start}
  .ord-lista{display:grid;gap:10px;max-height:calc(100vh - 240px);overflow:auto;padding:2px 6px 6px 2px}
  .oc{border:2px solid var(--borda);border-radius:16px;padding:12px 14px;background:#fff;cursor:pointer;text-align:left;display:grid;gap:4px;transition:border-color .2s, transform .15s;width:100%}
  .oc:hover{border-color:var(--amarelo)}
  .oc[aria-current="true"]{border-color:var(--escuro);box-shadow:4px 4px 0 var(--laranja)}
  .oc .l1{display:flex;justify-content:space-between;align-items:center;gap:8px}
  .oc .no{font-family:'Bagel Fat One';font-size:1.15rem;color:var(--laranja)}
  .oc .nm{font-weight:800}
  .oc .l3{display:flex;justify-content:space-between;font-size:.85rem;opacity:.75;font-weight:700}
  .oc.fresh{animation:fresh 1.2s ease-in-out 3}
  @keyframes fresh{50%{background:#FFF0C2}}
  .pill{display:inline-block;padding:3px 10px;border-radius:99px;font-weight:900;font-size:.75rem;white-space:nowrap}
  .s-novo{background:#FFE08A;color:#6B4A00}.s-confirmado{background:#D7E8FF;color:#123D7A}.s-preparo{background:#FFD9C2;color:#8A3A10}.s-saiu{background:#E5D9FF;color:#45207F}.s-entregue{background:#CFF3DA;color:#14532D}.s-cancelado{background:#EEE;color:#666;text-decoration:line-through}
  .ord-det{border:2px solid var(--escuro);border-radius:20px;padding:22px;background:#fff;min-height:300px}
  .ord-det .vazio{margin-top:40px}
  .od-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:14px}
  .od-head h2{font-size:2rem;color:var(--laranja)}
  .od-head small{display:block;font-weight:700;opacity:.65}
  .od-acts{display:flex;gap:8px;flex-wrap:wrap}
  .flow{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 18px}
  .flow button{padding:8px 12px;border-radius:12px;border:2px solid var(--borda);background:#fff;font-weight:800;cursor:pointer;font-size:.85rem}
  .flow button.on{border-color:var(--escuro);box-shadow:3px 3px 0 var(--escuro)}
  .flow button.done{opacity:.55}
  .flow .cancel{margin-left:auto;color:var(--vermelho)}
  .od-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .box{background:var(--creme);border-radius:16px;padding:14px 16px}
  .box h4{font-family:'Bagel Fat One';font-weight:400;color:var(--laranja);font-size:1.05rem;margin-bottom:8px}
  .box p{margin:2px 0}
  .box .links{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
  .box .links a{font-weight:900;font-size:.85rem;padding:6px 12px;border-radius:99px;border:2px solid var(--escuro);background:#fff;text-decoration:none;color:var(--escuro)}
  .box .links a.wa{background:var(--verde);color:#fff}
  table.itens{width:100%;border-collapse:collapse;margin-top:4px}
  .itens th{text-align:left;font-size:.75rem;text-transform:uppercase;letter-spacing:1px;opacity:.6;padding:6px 4px;border-bottom:2px solid var(--creme-2)}
  .itens td{padding:8px 4px;border-bottom:1px solid var(--creme-2);font-weight:700}
  .itens td.q{font-family:'Bagel Fat One';font-weight:400;color:var(--laranja);font-size:1.15rem;width:50px}
  .itens .r{text-align:right}
  .itens .pz-ic{width:34px;height:34px;display:inline-block;vertical-align:middle;margin-right:8px}
  .itens tfoot td{border:0;padding:4px}
  .itens tfoot .tot td{font-family:'Bagel Fat One';font-weight:400;font-size:1.3rem;padding-top:8px}
  .obs{background:#FFF7D6;border-left:5px solid var(--amarelo)}
  .hist{list-style:none;font-size:.85rem;font-weight:700;opacity:.8}
  .hist li{padding:2px 0}
  .full{grid-column:1/-1}
  @media (max-width:900px){.ord-grid{grid-template-columns:1fr}.ord-lista{max-height:none}.od-cols{grid-template-columns:1fr}}
  @media print{
    body *{visibility:hidden!important}
    .ord-det,.ord-det *{visibility:visible!important}
    .ord-det{position:absolute;left:0;top:0;width:100%;border:0;padding:0}
    .no-print{display:none!important}
    .box{background:#fff;border:1px solid #999}
  }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const brl = v => 'R$ ' + (+v).toFixed(2).replace('.', ',');
  const fone = p => String(p).replace(/^55/, '').replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');
  const STATUS = ['novo', 'confirmado', 'preparo', 'saiu', 'entregue'];
  const label = (s, o) => ({ novo: 'Novo', confirmado: 'Confirmado', preparo: 'Em preparo', saiu: o && o.delivery === 'retirada' ? 'Pronto p/ retirada' : 'Saiu p/ entrega', entregue: 'Entregue', cancelado: 'Cancelado' }[s]);
  const PAG = { pix: 'Pix', dinheiro: 'Dinheiro', cartao: 'Cartão na entrega' };
  const FILTROS = { ativos: ['Em aberto', o => !['entregue', 'cancelado'].includes(o.status)], novo: ['Novos', o => o.status === 'novo'], entregue: ['Entregues', o => o.status === 'entregue'], cancelado: ['Cancelados', o => o.status === 'cancelado'], todos: ['Todos', () => true] };

  let orders = [], filtro = 'ativos', busca = '', sel = null, lastMax = null, fresh = new Set(), timer;

  async function api(url, opts = {}) {
    const r = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' });
    if (r.status === 401) { location.reload(); throw new Error('Sessão expirada'); }
    const b = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(b.error || 'Erro ' + r.status);
    return b;
  }
  function toast(msg, err) { const t = $('#toast'); t.textContent = msg; t.classList.toggle('err', !!err); t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 3000); }
  function ago(iso) {
    const m = Math.round((Date.now() - new Date(iso)) / 60000);
    if (m < 1) return 'agora'; if (m < 60) return `há ${m} min`; const h = Math.round(m / 60); if (h < 24) return `há ${h} h`;
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
  const dt = iso => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  function beep() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      [0, .18, .36].forEach((t, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = [660, 880, 1100][i]; g.gain.setValueAtTime(.18, ac.currentTime + t); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + t + .16); o.connect(g).connect(ac.destination); o.start(ac.currentTime + t); o.stop(ac.currentTime + t + .17); });
    } catch {}
  }

  async function load(initial) {
    try { orders = await api('/api/admin/orders'); } catch { return; }
    const max = orders.reduce((m, o) => Math.max(m, o.number), 0);
    if (lastMax !== null && max > lastMax) {
      const novos = orders.filter(o => o.number > lastMax);
      novos.forEach(o => fresh.add(o.number));
      beep(); toast(`🛒 Novo pedido #${novos[0].number} — ${novos[0].customer.name}`);
    }
    lastMax = max;
    const n = orders.filter(o => o.status === 'novo').length;
    $('#tabN').hidden = !n; $('#tabN').textContent = n;
    document.title = (n ? `(${n}) ` : '') + 'Painel Mini Pizza Junior';
    if (initial && sel === null && orders[0]) sel = orders[0].number;
    renderFiltros(); renderLista();
    if (initial || !document.activeElement || !$('#ordDet').contains(document.activeElement)) renderDet();
  }

  function renderFiltros() {
    $('#ordFiltros').innerHTML = Object.entries(FILTROS).map(([k, [l, fn]]) => `<button data-f="${k}" aria-pressed="${k === filtro}">${l}<b>${orders.filter(fn).length}</b></button>`).join('');
  }
  function visiveis() {
    const q = busca.trim().toLowerCase(), qd = q.replace(/\D/g, '');
    return orders.filter(FILTROS[filtro][1]).filter(o => !q || o.customer.name.toLowerCase().includes(q) || String(o.number).includes(q) || (qd && o.customer.phone.includes(qd)));
  }
  function renderLista() {
    const list = visiveis();
    $('#ordLista').innerHTML = list.length ? list.map(o => `
      <button class="oc ${fresh.has(o.number) ? 'fresh' : ''}" data-n="${o.number}" aria-current="${o.number === sel}">
        <div class="l1"><span class="no">#${o.number}</span><span class="pill s-${o.status}">${label(o.status, o)}</span></div>
        <div class="nm">${esc(o.customer.name)}</div>
        <div class="l3"><span>${o.delivery === 'entrega' ? '🛵 Entrega' : '🏠 Retirada'} · ${o.units} un.</span><span>${o.total != null ? brl(o.total) : ago(o.createdAt)}</span></div>
        ${o.total != null ? `<div class="l3"><span></span><span>${ago(o.createdAt)}</span></div>` : ''}
      </button>`).join('') : `<div class="vazio">${orders.length ? 'Nenhum pedido neste filtro.' : 'Ainda não chegou nenhum pedido. Eles aparecem aqui automaticamente. 🍕'}</div>`;
  }

  function renderDet() {
    const o = orders.find(x => x.number === sel), box = $('#ordDet');
    if (!o) { box.innerHTML = `<div class="vazio">Selecione um pedido para ver os detalhes.</div>`; return; }
    const FL = (window.__adminFlavors && window.__adminFlavors()) || [];
    const a = o.address;
    const endTxt = a ? `${a.rua}, ${a.numero}${a.complemento ? ' — ' + a.complemento : ''}, ${a.bairro}, ${a.cidade}` : '';
    const firstName = o.customer.name.split(' ')[0];
    const msg = `Olá, ${firstName}! Aqui é da Mini Pizza Junior 🍕 Recebemos o seu pedido #${o.number}.`;
    const idx = STATUS.indexOf(o.status);
    box.innerHTML = `
      <div class="od-head">
        <div><h2>Pedido #${o.number}</h2><small>${dt(o.createdAt)} · ${ago(o.createdAt)}</small></div>
        <div class="od-acts no-print"><button class="btn btn-sm" id="odPrint">🖨 Imprimir</button><button class="btn btn-sm" id="odCopy">📋 Copiar</button><button class="btn btn-sm danger" id="odDel">🗑</button></div>
      </div>
      <div class="flow no-print">${STATUS.map((s, i) => `<button data-s="${s}" class="${s === o.status ? 'on' : ''} ${o.status !== 'cancelado' && i < idx ? 'done' : ''}"><span class="pill s-${s}">${label(s, o)}</span></button>`).join('')}<button class="cancel ${o.status === 'cancelado' ? 'on' : ''}" data-s="cancelado">✕ Cancelar</button></div>
      <div class="od-cols">
        <div class="box full">
          <h4>Itens</h4>
          <table class="itens"><thead><tr><th>Qtd</th><th>Sabor</th>${o.subtotal != null ? '<th class="r">Unit.</th><th class="r">Subtotal</th>' : ''}</tr></thead><tbody>
            ${o.items.map(i => { const f = FL.find(x => x.id === i.id); return `<tr><td class="q">${i.qty}×</td><td>${f ? `<span class="pz-ic">${window.PizzaKit.pizzaSVG(f)}</span>` : ''}${esc(i.name)}</td>${o.subtotal != null ? `<td class="r">${brl(i.price)}</td><td class="r">${brl(i.price * i.qty)}</td>` : ''}</tr>`; }).join('')}
          </tbody><tfoot>
            ${o.subtotal != null ? `<tr><td colspan="3" class="r">Subtotal</td><td class="r">${brl(o.subtotal)}</td></tr>${o.delivery === 'entrega' ? `<tr><td colspan="3" class="r">Entrega</td><td class="r">${o.fee ? brl(o.fee) : 'Grátis'}</td></tr>` : ''}<tr class="tot"><td colspan="3" class="r">Total</td><td class="r">${brl(o.total)}</td></tr>`
              : `<tr class="tot"><td colspan="2">${o.units} mini pizzas ${o.fee ? `<small style="font-family:Nunito;font-size:.85rem">+ entrega ${brl(o.fee)}</small>` : ''}</td></tr><tr><td colspan="2" style="font-weight:700;opacity:.7">Valor a combinar com o cliente</td></tr>`}
          </tfoot></table>
        </div>
        <div class="box">
          <h4>👤 Cliente</h4>
          <p><b>${esc(o.customer.name)}</b></p>
          <p>${fone(o.customer.phone)}</p>
          <div class="links no-print"><a class="wa" target="_blank" rel="noopener" href="https://wa.me/${esc(o.customer.phone)}?text=${encodeURIComponent(msg)}">WhatsApp</a><a href="tel:+${esc(o.customer.phone)}">Ligar</a></div>
        </div>
        <div class="box">
          <h4>${o.delivery === 'entrega' ? '🛵 Entrega' : '🏠 Retirada no local'}</h4>
          ${a ? `<p><b>${esc(a.rua)}, ${esc(a.numero)}</b>${a.complemento ? ` — ${esc(a.complemento)}` : ''}</p><p>${esc(a.bairro)} · ${esc(a.cidade)}</p>${a.referencia ? `<p>Ref.: ${esc(a.referencia)}</p>` : ''}
            <div class="links no-print"><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endTxt)}">📍 Abrir no mapa</a></div>` : '<p>O cliente vai retirar o pedido.</p>'}
        </div>
        <div class="box">
          <h4>💳 Pagamento</h4>
          <p><b>${PAG[o.payment] || o.payment}</b></p>
          ${o.change ? `<p>Troco para: ${esc(o.change)}</p>` : ''}
        </div>
        <div class="box ${o.notes ? 'obs' : ''}">
          <h4>📝 Observações do cliente</h4>
          <p>${o.notes ? esc(o.notes) : '<span style="opacity:.6">Nenhuma.</span>'}</p>
        </div>
        <div class="box full no-print">
          <h4>🔒 Nota interna (só você vê)</h4>
          <textarea id="odNote" maxlength="400" placeholder="Ex.: cliente pagou via Pix às 18h">${esc(o.adminNote)}</textarea>
        </div>
        <div class="box full no-print">
          <h4>Histórico</h4>
          <ul class="hist">${o.history.map(h => `<li>${dt(h.at)} — ${label(h.status, o)}</li>`).join('')}</ul>
        </div>
      </div>`;

    box.querySelectorAll('.flow [data-s]').forEach(b => b.addEventListener('click', () => setStatus(o, b.dataset.s)));
    $('#odPrint').addEventListener('click', () => print());
    $('#odCopy').addEventListener('click', () => {
      const txt = [`Pedido #${o.number} — ${dt(o.createdAt)}`, ...o.items.map(i => `${i.qty}× ${i.name}`), `Cliente: ${o.customer.name} — ${fone(o.customer.phone)}`,
        o.delivery === 'entrega' ? `Entrega: ${endTxt}${a.referencia ? ' (Ref.: ' + a.referencia + ')' : ''}` : 'Retirada no local',
        `Pagamento: ${PAG[o.payment]}${o.change ? ' — troco para ' + o.change : ''}`, o.total != null ? `Total: ${brl(o.total)}` : '', o.notes ? `Obs.: ${o.notes}` : ''].filter(Boolean).join('\n');
      navigator.clipboard.writeText(txt).then(() => toast('📋 Pedido copiado!'), () => toast('Não foi possível copiar', true));
    });
    $('#odDel').addEventListener('click', async () => {
      if (!confirm(`Apagar definitivamente o pedido #${o.number}? Isso não pode ser desfeito.`)) return;
      try { await api(`/api/admin/orders/${o.number}`, { method: 'DELETE' }); sel = null; await load(); renderDet(); toast('Pedido apagado.'); } catch (e) { toast(e.message, true); }
    });
    const note = $('#odNote');
    note.addEventListener('change', async () => {
      try { Object.assign(o, await api(`/api/admin/orders/${o.number}`, { method: 'PATCH', body: JSON.stringify({ adminNote: note.value }) })); toast('Nota salva'); } catch (e) { toast(e.message, true); }
    });
  }

  async function setStatus(o, s) {
    if (s === o.status) return;
    if (s === 'cancelado' && !confirm(`Cancelar o pedido #${o.number}?`)) return;
    try {
      Object.assign(o, await api(`/api/admin/orders/${o.number}`, { method: 'PATCH', body: JSON.stringify({ status: s }) }));
      fresh.delete(o.number); toast(`Pedido #${o.number}: ${label(s, o)}`);
      load();
    } catch (e) { toast(e.message, true); }
  }

  $('#ordFiltros').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b) return; filtro = b.dataset.f; renderFiltros(); renderLista(); });
  $('#ordBusca').addEventListener('input', e => { busca = e.target.value; renderLista(); });
  $('#ordLista').addEventListener('click', e => {
    const c = e.target.closest('.oc'); if (!c) return;
    sel = +c.dataset.n; fresh.delete(sel); renderLista(); renderDet();
    if (innerWidth < 900) $('#ordDet').scrollIntoView({ behavior: 'smooth' });
  });

  document.addEventListener('admin:ready', () => {
    load(true);
    clearInterval(timer); timer = setInterval(() => load(), 15000);
  });
})();
