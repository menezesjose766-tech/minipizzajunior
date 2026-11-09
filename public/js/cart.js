/* Carrinho + checkout — Mini Pizza Junior */
(() => {
  const css = `
  .qty{display:inline-flex;align-items:center;border:2px solid var(--escuro);border-radius:99px;background:#fff;overflow:hidden}
  .qty button{width:38px;height:42px;border:0;background:none;font-size:1.3rem;font-weight:900;cursor:pointer;color:var(--laranja)}
  .qty button:hover{background:var(--creme-2)}
  .qty input{width:46px;text-align:center;border:0;font-weight:900;font-size:1.05rem;outline:none;-moz-appearance:textfield;background:none}
  .qty input::-webkit-inner-spin-button{-webkit-appearance:none}
  .qty.sm button{width:30px;height:32px;font-size:1.1rem}.qty.sm input{width:34px;font-size:.95rem}
  .add-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
  .cart-fab{position:fixed;left:20px;bottom:20px;z-index:60;display:flex;align-items:center;gap:10px;background:var(--laranja);color:#fff;border:3px solid var(--escuro);border-radius:99px;padding:12px 20px 12px 16px;font-weight:900;box-shadow:0 5px 0 var(--escuro);cursor:pointer;transform:translateY(160%);transition:transform .4s cubic-bezier(.3,1.6,.5,1)}
  .cart-fab.show{transform:none}
  .cart-fab .n{background:var(--amarelo);color:var(--escuro);border-radius:99px;min-width:28px;height:28px;display:grid;place-items:center;padding:0 6px;font-size:.95rem;border:2px solid var(--escuro)}
  .cart-fab.bump{animation:bump .5s}
  @keyframes bump{30%{transform:scale(1.18) rotate(-4deg)}60%{transform:scale(.95)}}
  .cart-ov{position:fixed;inset:0;background:rgba(42,26,18,.55);z-index:150;opacity:0;pointer-events:none;transition:opacity .3s}
  .cart-ov.open{opacity:1;pointer-events:auto}
  .drawer{position:fixed;top:0;right:0;height:100%;width:min(480px,100%);background:var(--creme);z-index:151;transform:translateX(105%);transition:transform .45s cubic-bezier(.7,0,.2,1);display:flex;flex-direction:column;border-left:3px solid var(--escuro)}
  .drawer.open{transform:none}
  .dr-head{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;background:var(--laranja);color:#fff}
  .dr-head h3{font-size:1.5rem}
  .dr-head button{background:none;border:0;color:#fff;font-size:1.8rem;cursor:pointer;line-height:1;width:40px;height:40px}
  .steps{display:flex;gap:6px;padding:12px 20px 0}
  .steps i{flex:1;height:6px;border-radius:9px;background:var(--creme-2)}
  .steps i.on{background:var(--laranja)}
  .dr-body{flex:1;overflow:auto;padding:18px 20px}
  .dr-foot{padding:16px 20px;border-top:2px solid var(--creme-2);background:#fff}
  .dr-foot .btn{width:100%}
  .dr-foot .back{display:block;margin:10px auto 0;background:none;border:0;font-weight:800;color:var(--laranja);cursor:pointer}
  .ci{display:grid;grid-template-columns:56px 1fr auto;gap:12px;align-items:center;background:#fff;border:2px solid var(--escuro);border-radius:18px;padding:10px 12px;margin-bottom:10px}
  .ci .pz{width:56px;height:56px}
  .ci b{font-family:'Bagel Fat One';font-weight:400;color:var(--laranja);font-size:1.1rem;display:block;line-height:1.1}
  .ci small{opacity:.65;font-weight:700}
  .ci .rm{background:none;border:0;color:#C62828;font-weight:800;cursor:pointer;font-size:.8rem;padding:0;margin-top:2px}
  .sum{background:#fff;border-radius:16px;padding:14px 16px;margin-top:14px;font-weight:700}
  .sum div{display:flex;justify-content:space-between;padding:3px 0}
  .sum .tot{font-family:'Bagel Fat One';font-weight:400;font-size:1.35rem;color:var(--escuro);border-top:2px dashed var(--creme-2);margin-top:6px;padding-top:8px}
  .sum p{font-size:.85rem;opacity:.7;margin-top:6px}
  .empty{text-align:center;padding:40px 10px}
  .empty .pzbig{width:140px;margin:0 auto 16px;opacity:.9}
  .fm label{display:block;font-weight:800;font-size:.9rem;margin-bottom:12px}
  .fm label span{display:block;margin-bottom:5px}
  .fm input,.fm textarea,.fm select{width:100%;padding:12px 14px;border:2px solid #E9D6BC;border-radius:12px;background:#fff;font:inherit;outline:none}
  .fm input:focus,.fm textarea:focus{border-color:var(--laranja)}
  .fm input.bad{border-color:#C62828;animation:shake .35s}
  @keyframes shake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
  .fm .g2{display:grid;grid-template-columns:2fr 1fr;gap:0 10px}
  .fm h4{font-family:'Bagel Fat One';font-weight:400;color:var(--laranja);font-size:1.15rem;margin:8px 0 10px}
  .opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
  .opts.three{grid-template-columns:1fr 1fr 1fr}
  .opts button{padding:12px 8px;border:2px solid #E9D6BC;border-radius:14px;background:#fff;font-weight:900;cursor:pointer;font-size:.9rem}
  .opts button[aria-pressed="true"]{border-color:var(--escuro);background:var(--amarelo);box-shadow:3px 3px 0 var(--escuro)}
  .ferr{background:#FDE2E2;color:#9B1C1C;font-weight:800;border-radius:12px;padding:10px 14px;margin-bottom:12px}
  .hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
  .done{text-align:center;padding:30px 6px}
  .done .big{font-size:4rem;line-height:1}
  .done h3{font-size:2rem;color:var(--laranja);margin:10px 0}
  .done .num{display:inline-block;background:var(--amarelo);border:3px solid var(--escuro);border-radius:16px;padding:6px 18px;font-family:'Bagel Fat One';font-size:1.8rem;margin:6px 0 14px;box-shadow:4px 4px 0 var(--escuro)}
  .done .btn{margin-top:16px}
  .flyer{position:fixed;z-index:200;width:70px;height:70px;pointer-events:none}
  .ctoast{position:fixed;left:50%;top:90px;transform:translate(-50%,-30px);opacity:0;z-index:160;background:var(--escuro);color:#fff;font-weight:800;padding:12px 20px;border-radius:99px;transition:all .3s;pointer-events:none;max-width:calc(100% - 32px);text-align:center}
  .ctoast.show{opacity:1;transform:translate(-50%,0)}
  @media (max-width:480px){.cart-fab{left:12px;bottom:14px}.fm .g2{grid-template-columns:1fr 1fr}}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const KEY = 'mpj-cart';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch {} };
  let cart = load(), M, step = 1, form = { delivery: 'entrega', payment: 'pix' };
  const brl = v => 'R$ ' + v.toFixed(2).replace('.', ',');

  function init() {
    M = window.MPJ; const { S, FL, esc } = M;
    cart = cart.filter(i => FL.some(f => f.id === i.id)); save();

    // pedidos pausados → tudo vai para o WhatsApp
    if (S.aceitarPedidos === false) {
      document.querySelectorAll('[data-order]').forEach(a => { a.href = M.wppLink('Olá! Quero fazer um pedido de mini pizzas 🍕'); a.target = '_blank'; a.rel = 'noopener'; });
      const b = document.getElementById('dBtn'); b.textContent = 'Pedir pelo WhatsApp';
      b.addEventListener('click', () => open(M.wppLink(`Olá! Quero pedir a mini pizza de ${M.current().name} 🍕`), '_blank'));
      return;
    }

    // seletor de quantidade ao lado do botão
    const dBtn = document.getElementById('dBtn');
    const wrap = document.createElement('div'); wrap.className = 'add-row';
    wrap.innerHTML = `<div class="qty" id="addQty"><button type="button" data-d="-1" aria-label="Menos">−</button><input type="number" min="1" max="500" value="1" aria-label="Quantidade"><button type="button" data-d="1" aria-label="Mais">+</button></div>`;
    dBtn.replaceWith(wrap); wrap.appendChild(dBtn);
    stepper(wrap.querySelector('#addQty'));
    dBtn.addEventListener('click', () => {
      const inp = wrap.querySelector('input'), q = Math.max(1, Math.min(500, +inp.value || 1));
      add(M.current().id, q); fly(document.getElementById('stagePizza')); inp.value = 1;
    });

    document.querySelectorAll('[data-order]').forEach(a => a.addEventListener('click', e => {
      if (cart.length) { e.preventDefault(); openDrawer(); }
      else toast('Escolha seus sabores e toque em “Adicionar ao pedido” 🍕');
    }));

    // DOM do carrinho
    document.body.insertAdjacentHTML('beforeend', `
      <button class="cart-fab" id="cartFab" aria-label="Abrir carrinho">🛒 Meu pedido <span class="n" id="cartN">0</span></button>
      <div class="cart-ov" id="cartOv"></div>
      <aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drTitle" aria-hidden="true">
        <div class="dr-head"><h3 id="drTitle">Seu pedido</h3><button id="drClose" aria-label="Fechar">×</button></div>
        <div class="steps"><i></i><i></i><i></i></div>
        <div class="dr-body" id="drBody"></div>
        <div class="dr-foot" id="drFoot"></div>
      </aside>
      <div class="ctoast" id="ctoast" role="status"></div>`);
    document.getElementById('cartFab').addEventListener('click', openDrawer);
    document.getElementById('cartOv').addEventListener('click', closeDrawer);
    document.getElementById('drClose').addEventListener('click', closeDrawer);
    addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
    updateFab();
  }
  if (window.MPJ) init(); else document.addEventListener('mpj:ready', init, { once: true });

  function stepper(el, onChange) {
    const inp = el.querySelector('input');
    el.addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b) return; inp.value = Math.max(+inp.min || 0, Math.min(+inp.max || 500, (+inp.value || 0) + +b.dataset.d)); onChange && onChange(+inp.value); });
    inp.addEventListener('change', () => { inp.value = Math.max(+inp.min || 0, Math.min(+inp.max || 500, Math.round(+inp.value || 0))); onChange && onChange(+inp.value); });
  }
  function toast(msg) { const t = document.getElementById('ctoast') || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'ctoast', id: 'ctoast' })); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600); }

  function add(id, q) {
    const ex = cart.find(i => i.id === id);
    if (ex) ex.qty = Math.min(500, ex.qty + q); else cart.push({ id, qty: q });
    save(); updateFab(true);
    toast(`${q}× ${M.FL.find(f => f.id === id).name} no seu pedido! 🍕`);
  }
  const units = () => cart.reduce((s, i) => s + i.qty, 0);
  function updateFab(bump) {
    const fab = document.getElementById('cartFab'); if (!fab) return;
    document.getElementById('cartN').textContent = units();
    fab.classList.toggle('show', cart.length > 0);
    if (bump) { fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump'); }
  }
  function fly(fromEl) {
    if (!window.gsap || !fromEl) return;
    const r = fromEl.getBoundingClientRect(), fab = document.getElementById('cartFab').getBoundingClientRect();
    const fl = document.createElement('div'); fl.className = 'flyer'; fl.innerHTML = window.PizzaKit.pizzaSVG(M.current());
    document.body.appendChild(fl);
    const x0 = r.left + r.width / 2 - 35, y0 = r.top + r.height / 2 - 35;
    const x1 = (fab.width ? fab.left + 20 : 30), y1 = (fab.height ? fab.top : innerHeight - 60);
    gsap.set(fl, { x: x0, y: y0, scale: 2.4 });
    gsap.to(fl, { x: x1, duration: .8, ease: 'power1.in' });
    gsap.to(fl, { y: y1, duration: .8, ease: 'back.in(1.6)', onComplete: () => fl.remove() });
    gsap.to(fl, { scale: .4, rotate: 540, duration: .8 });
  }

  /* ---------- gaveta ---------- */
  function openDrawer() { step = 1; render(); document.getElementById('cartOv').classList.add('open'); const d = document.getElementById('drawer'); d.classList.add('open'); d.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
  function closeDrawer() { const d = document.getElementById('drawer'); if (!d) return; d.classList.remove('open'); d.setAttribute('aria-hidden', 'true'); document.getElementById('cartOv').classList.remove('open'); document.body.style.overflow = ''; }

  function totals() {
    const { S, FL } = M;
    const lines = cart.map(i => ({ ...i, f: FL.find(f => f.id === i.id) })).filter(l => l.f);
    const priced = S.mostrarPrecos && lines.every(l => l.f.price > 0);
    const sub = priced ? lines.reduce((s, l) => s + l.f.price * l.qty, 0) : null;
    const fee = form.delivery === 'entrega' ? (+S.taxaEntrega || 0) : 0;
    return { lines, sub, fee, total: sub === null ? null : sub + fee };
  }
  function summaryHTML() {
    const t = totals(), S = M.S;
    if (t.sub === null) return `<div class="sum"><div><span>Total de mini pizzas</span><span>${units()} un.</span></div>${form.delivery === 'entrega' && S.taxaEntrega > 0 ? `<div><span>Taxa de entrega</span><span>${brl(S.taxaEntrega)}</span></div>` : ''}<p>💬 O valor final é confirmado com você pelo WhatsApp.</p></div>`;
    return `<div class="sum"><div><span>Subtotal (${units()} un.)</span><span>${brl(t.sub)}</span></div>${form.delivery === 'entrega' ? `<div><span>Entrega</span><span>${t.fee ? brl(t.fee) : 'Grátis'}</span></div>` : ''}<div class="tot"><span>Total</span><span>${brl(t.total)}</span></div></div>`;
  }

  function render() {
    const body = document.getElementById('drBody'), foot = document.getElementById('drFoot'), { esc, S } = M;
    document.querySelectorAll('.steps i').forEach((el, i) => el.classList.toggle('on', i < step));
    document.getElementById('drTitle').textContent = ['Seu pedido', 'Seus dados', 'Pedido enviado!'][step - 1];
    if (step === 1) {
      const t = totals();
      if (!t.lines.length) {
        body.innerHTML = `<div class="empty"><div class="pzbig">${window.PizzaKit.pizzaSVG(M.FL[0])}</div><b>Seu carrinho está vazio</b><p>Escolha seus sabores no cardápio.</p></div>`;
        foot.innerHTML = `<a class="btn btn-lar" href="#sabores" id="goMenu">Ver sabores</a>`;
        document.getElementById('goMenu').addEventListener('click', closeDrawer); return;
      }
      body.innerHTML = t.lines.map(l => `<div class="ci" data-id="${esc(l.id)}">${window.PizzaKit.pizzaSVG(l.f)}<div><b>${esc(l.f.name)}</b><small>${S.mostrarPrecos && l.f.price > 0 ? brl(l.f.price) + ' / un.' : esc(l.f.short)}</small><br><button class="rm" type="button">Remover</button></div><div class="qty sm"><button type="button" data-d="-1" aria-label="Menos">−</button><input type="number" min="0" max="500" value="${l.qty}" aria-label="Quantidade"><button type="button" data-d="1" aria-label="Mais">+</button></div></div>`).join('') + summaryHTML() +
        (units() < S.pedidoMinimo ? `<div class="ferr" style="margin-top:12px">Pedido mínimo: ${S.pedidoMinimo} mini pizzas. Faltam ${S.pedidoMinimo - units()}.</div>` : '');
      body.querySelectorAll('.ci').forEach(row => {
        const id = row.dataset.id;
        stepper(row.querySelector('.qty'), v => { const it = cart.find(i => i.id === id); if (v <= 0) cart = cart.filter(i => i.id !== id); else it.qty = v; save(); updateFab(); render(); });
        row.querySelector('.rm').addEventListener('click', () => { cart = cart.filter(i => i.id !== id); save(); updateFab(); render(); });
      });
      foot.innerHTML = `<button class="btn btn-lar" id="toStep2" ${units() < S.pedidoMinimo ? 'disabled style="opacity:.5"' : ''}>Continuar →</button>`;
      document.getElementById('toStep2').addEventListener('click', () => { if (units() >= S.pedidoMinimo) { step = 2; render(); } });
    }
    if (step === 2) {
      const v = k => esc(form[k] || ''), a = form.address || {}, av = k => esc(a[k] || '');
      body.innerHTML = `<form class="fm" id="ckForm" novalidate>
        <div id="ckErr"></div>
        <h4>Quem está pedindo?</h4>
        <label><span>Nome *</span><input name="name" autocomplete="name" value="${v('name')}" required></label>
        <label><span>WhatsApp *</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(33) 99999-9999" value="${v('phone')}" required></label>
        <h4>Como você quer receber?</h4>
        <div class="opts" data-opt="delivery"><button type="button" data-v="entrega">🛵 Entrega</button><button type="button" data-v="retirada">🏠 Retirar no local</button></div>
        <div id="addrBox">
          <div class="g2"><label><span>Rua *</span><input name="rua" autocomplete="address-line1" value="${av('rua')}"></label><label><span>Número *</span><input name="numero" value="${av('numero')}"></label></div>
          <div class="g2"><label><span>Bairro *</span><input name="bairro" value="${av('bairro')}"></label><label><span>Cidade *</span><input name="cidade" autocomplete="address-level2" value="${av('cidade')}"></label></div>
          <label><span>Complemento</span><input name="complemento" placeholder="Apto, bloco, casa..." value="${av('complemento')}"></label>
          <label><span>Ponto de referência</span><input name="referencia" value="${av('referencia')}"></label>
        </div>
        ${S.endereco ? `<p id="pickupInfo" style="font-weight:700;margin:-4px 0 14px">📍 Retirada em: ${esc(S.endereco)}</p>` : '<p id="pickupInfo" style="font-weight:700;margin:-4px 0 14px">📍 Combinamos o local de retirada pelo WhatsApp.</p>'}
        <h4>Pagamento</h4>
        <div class="opts three" data-opt="payment"><button type="button" data-v="pix">Pix</button><button type="button" data-v="dinheiro">Dinheiro</button><button type="button" data-v="cartao">Cartão</button></div>
        <label id="trocoBox"><span>Troco para quanto?</span><input name="change" inputmode="decimal" placeholder="Ex.: R$ 100" value="${v('change')}"></label>
        <label><span>Observações</span><textarea name="notes" rows="3" placeholder="Ex.: entregar depois das 18h">${v('notes')}</textarea></label>
        <div class="hp" aria-hidden="true"><label>Não preencha<input name="website" tabindex="-1" autocomplete="off"></label></div>
        ${summaryHTML()}
      </form>`;
      const fm = document.getElementById('ckForm');
      const sync = () => {
        fm.querySelectorAll('[data-opt]').forEach(g => g.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', form[g.dataset.opt] === b.dataset.v)));
        document.getElementById('addrBox').hidden = form.delivery !== 'entrega';
        document.getElementById('pickupInfo').hidden = form.delivery !== 'retirada';
        document.getElementById('trocoBox').hidden = form.payment !== 'dinheiro';
        const s = fm.querySelector('.sum'); if (s) s.outerHTML = summaryHTML();
      };
      fm.addEventListener('click', e => { const b = e.target.closest('[data-opt] button'); if (!b) return; form[b.closest('[data-opt]').dataset.opt] = b.dataset.v; sync(); });
      fm.addEventListener('input', e => {
        const el = e.target; el.classList.remove('bad');
        if (el.name === 'phone') { const d = el.value.replace(/\D/g, '').slice(0, 11); el.value = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d; }
        if (['rua', 'numero', 'bairro', 'cidade', 'complemento', 'referencia'].includes(el.name)) form.address = { ...(form.address || {}), [el.name]: el.value };
        else if (el.name !== 'website') form[el.name] = el.value;
      });
      fm.addEventListener('submit', e => { e.preventDefault(); submit(); });
      sync();
      foot.innerHTML = `<button class="btn btn-wpp" id="ckSend">✅ Confirmar pedido</button><button class="back" id="ckBack">← Voltar ao carrinho</button>`;
      document.getElementById('ckSend').addEventListener('click', submit);
      document.getElementById('ckBack').addEventListener('click', () => { step = 1; render(); });
    }
  }

  async function submit() {
    const fm = document.getElementById('ckForm'), err = document.getElementById('ckErr'), btn = document.getElementById('ckSend');
    const need = ['name', 'phone', ...(form.delivery === 'entrega' ? ['rua', 'numero', 'bairro', 'cidade'] : [])];
    const bad = need.map(n => fm.elements[n]).filter(el => !el.value.trim() || (el.name === 'phone' && el.value.replace(/\D/g, '').length < 10));
    if (bad.length) { bad.forEach(el => el.classList.add('bad')); bad[0].focus(); err.innerHTML = `<div class="ferr">Preencha os campos marcados.</div>`; return; }
    btn.disabled = true; btn.textContent = 'Enviando...'; err.innerHTML = '';
    const phone = '55' + form.phone.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
    const payload = { items: cart, customer: { name: form.name, phone }, delivery: form.delivery, address: form.delivery === 'entrega' ? form.address : null, payment: form.payment, change: form.change, notes: form.notes, website: fm.elements.website.value };
    try {
      const r = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const res = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(res.error || 'Não foi possível enviar.');
      done(res, payload);
    } catch (e) {
      err.innerHTML = `<div class="ferr">${M.esc(e.message)}</div>`; err.scrollIntoView({ behavior: 'smooth' });
      btn.disabled = false; btn.textContent = '✅ Confirmar pedido';
    }
  }

  function done(res, p) {
    const lines = totals().lines;
    const msg = [`Olá! Acabei de fazer o pedido *#${res.number}* pelo site 🍕`, '', ...lines.map(l => `• ${l.qty}× ${l.f.name}`), '',
      `Nome: ${p.customer.name}`, p.delivery === 'entrega' ? `Entrega: ${p.address.rua}, ${p.address.numero} — ${p.address.bairro}, ${p.address.cidade}` : 'Retirada no local',
      `Pagamento: ${{ pix: 'Pix', dinheiro: 'Dinheiro', cartao: 'Cartão' }[p.payment]}`].join('\n');
    cart = []; save(); updateFab();
    step = 3;
    document.querySelectorAll('.steps i').forEach(el => el.classList.add('on'));
    document.getElementById('drTitle').textContent = 'Pedido enviado!';
    document.getElementById('drBody').innerHTML = `<div class="done"><div class="big">🎉</div><h3>Pedido recebido!</h3><div class="num">#${res.number}</div><p>Já estamos com o seu pedido. Em breve chamamos você no WhatsApp para confirmar${res.total ? ` o total de <b>${brl(res.total)}</b>` : ' os valores'} e combinar a ${p.delivery === 'entrega' ? 'entrega' : 'retirada'}.</p>
      <a class="btn btn-wpp" target="_blank" rel="noopener" href="${M.wppLink(msg)}">Avisar também no WhatsApp</a></div>`;
    document.getElementById('drFoot').innerHTML = `<button class="btn btn-lar" id="ckClose">Voltar ao site</button>`;
    document.getElementById('ckClose').addEventListener('click', closeDrawer);
    form = { delivery: form.delivery, payment: form.payment, name: form.name, phone: form.phone, address: form.address };
    if (window.gsap) {
      gsap.from('.done .big', { scale: 0, rotate: -180, duration: .8, ease: 'back.out(2.5)' });
      gsap.from('.done .num', { scale: 0, duration: .6, delay: .3, ease: 'elastic.out(1,.5)' });
      const box = document.getElementById('drawer');
      for (let i = 0; i < 40; i++) {
        const c = document.createElement('div');
        c.style.cssText = `position:absolute;top:30%;left:50%;width:10px;height:10px;background:${['#E0521B', '#F5A623', '#25D366', '#FFD27A'][i % 4]};clip-path:polygon(50% 0,100% 100%,0 100%);pointer-events:none;z-index:5`;
        box.appendChild(c);
        gsap.to(c, { x: (Math.random() - .5) * 420, y: (Math.random() - .2) * 500, rotate: Math.random() * 720, opacity: 0, duration: 1.6 + Math.random(), ease: 'power2.out', onComplete: () => c.remove() });
      }
    }
  }
})();
