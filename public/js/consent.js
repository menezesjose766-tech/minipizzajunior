/*
 * Consentimento de cookies (LGPD + guia de cookies da ANPD)
 * - essenciais (carrinho, esta preferência): sempre ativos;
 * - análise (Google Analytics): só depois de "Aceitar"; "Recusar" tem o mesmo destaque.
 * Para rodar algo só com consentimento: (window.__onConsent = window.__onConsent || []).push(fn)
 * Links com [data-cookie-prefs] (ou o endereço #cookies) reabrem a escolha.
 */
(() => {
  const KEY = 'mpj_consent', MAX_AGE = 365 * 24 * 3600e3;
  const read = () => { try { const c = JSON.parse(localStorage.getItem(KEY)); return c && Date.now() - c.t < MAX_AGE ? c.v : null; } catch { return null; } };
  const write = v => { try { localStorage.setItem(KEY, JSON.stringify({ v, t: Date.now() })); } catch {} };
  let state = read();

  // fila de funções que só rodam com consentimento
  const queue = Array.isArray(window.__onConsent) ? window.__onConsent : [];
  const run = fn => { try { fn(); } catch {} };
  window.__onConsent = { push: fn => { if (state === 'granted') run(fn); else queue.push(fn); } };
  if (state === 'granted') queue.splice(0).forEach(run);

  function clearAnalyticsCookies() {
    const host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(n => /^_ga/.test(n)).forEach(n => {
      for (const d of ['', host, '.' + host]) document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? '; domain=' + d : ''}`;
    });
  }

  function choose(v) {
    const before = state;
    state = v; write(v); hide();
    if (v === 'granted') queue.splice(0).forEach(run);
    if (v === 'denied' && before === 'granted') { clearAnalyticsCookies(); location.reload(); }
  }

  let box;
  function build() {
    const st = document.createElement('style');
    st.textContent = `
      .ck-bar{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:620px;margin:0 auto;background:#fff;color:#2A1A12;border:2px solid #2A1A12;border-radius:20px;box-shadow:6px 6px 0 #F5A623;padding:18px 20px;font:600 .95rem/1.5 Nunito,system-ui,sans-serif;display:none}
      .ck-bar.on{display:block;animation:ckIn .35s ease-out}
      @keyframes ckIn{from{transform:translateY(30px);opacity:0}}
      .ck-bar b{font-weight:900;display:block;margin-bottom:4px;font-size:1.02rem}
      .ck-bar a{color:#B83F10;font-weight:800}
      .ck-acts{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
      .ck-acts button{flex:1;min-width:130px;padding:12px 18px;border-radius:99px;font:800 .95rem Nunito,system-ui,sans-serif;cursor:pointer;border:2px solid #2A1A12}
      .ck-yes{background:#E0521B;color:#fff;border-color:#E0521B!important}
      .ck-no{background:#fff;color:#2A1A12}
      .ck-acts button:focus-visible{outline:3px solid #F5A623;outline-offset:2px}`;
    document.head.appendChild(st);
    box = document.createElement('div');
    box.className = 'ck-bar'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-live', 'polite'); box.setAttribute('aria-label', 'Preferências de cookies');
    box.innerHTML = `<b>🍪 Cookies</b>Usamos cookies essenciais para o seu carrinho funcionar e, se você permitir, cookies de análise (Google Analytics) para entender como o site é usado e melhorá-lo. Saiba mais na <a href="/privacidade">Política de Privacidade</a>.
      <div class="ck-acts"><button type="button" class="ck-no">Recusar</button><button type="button" class="ck-yes">Aceitar</button></div>`;
    box.querySelector('.ck-yes').addEventListener('click', () => choose('granted'));
    box.querySelector('.ck-no').addEventListener('click', () => choose('denied'));
    document.body.appendChild(box);
  }
  function show() { if (!box) build(); box.classList.add('on'); setTimeout(() => box.querySelector('.ck-no').focus({ preventScroll: true }), 50); }
  function hide() { if (box) box.classList.remove('on'); }

  function init() {
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-cookie-prefs]'); if (!a) return;
      e.preventDefault(); show();
    });
    if (!state || location.hash === '#cookies') show();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.MPJConsent = { state: () => state, open: show };
})();
