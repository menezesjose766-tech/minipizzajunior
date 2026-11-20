/* Painel admin — aba Quiz (página oculta do e-book) */
(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  async function api(url, opts = {}) {
    const r = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' });
    if (r.status === 401) { location.reload(); throw new Error('Sessão expirada'); }
    const b = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(b.error || 'Erro ' + r.status);
    return b;
  }
  function toast(msg, err) { const t = $('#toast'); t.textContent = msg; t.classList.toggle('err', !!err); t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600); }

  let saved = null, Q = null, loaded = false;
  const dirty = () => JSON.stringify(Q) !== JSON.stringify(saved);
  const markDirty = () => { $('#qzDirty').textContent = dirty() ? 'Alterações não salvas' : 'Tudo salvo ✓'; };
  addEventListener('beforeunload', e => { if (Q && dirty()) { e.preventDefault(); e.returnValue = ''; } });
  const url = () => `${location.origin}/q/${Q.slug}`;

  async function load() {
    const { quiz, stats } = await api('/api/admin/quiz');
    saved = JSON.parse(JSON.stringify(quiz)); Q = quiz; loaded = true;
    render(); renderStats(stats);
  }

  function renderStats(s) {
    const pct = (a, b) => b ? Math.round(a / b * 100) + '%' : '—';
    const cards = [['Visitas', s.views], ['Começaram', s.starts], ['Terminaram', s.completes], ['Clicaram em comprar', s.checkout], ['Conversão', pct(s.checkout, s.views)]];
    $('#qzStats').innerHTML = cards.map(([l, v]) => `<div class="qz-stat"><b>${esc(v)}</b><span>${l}</span></div>`).join('');
    $('#qzSince').textContent = s.since ? '(desde ' + new Date(s.since).toLocaleDateString('pt-BR') + ')' : '';
    const rows = Q.profiles.map(p => { const x = (s.profiles || {})[p.id] || { completes: 0, checkout: 0 }; return `<tr><td>${esc(p.title)}</td><td>${x.completes}</td><td>${x.checkout}</td><td>${pct(x.checkout, x.completes)}</td></tr>`; }).join('');
    $('#qzProfStats').innerHTML = `<table class="qz-ptab"><thead><tr><th>Perfil</th><th>Terminaram</th><th>Clicaram em comprar</th><th>% de cliques</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function render() {
    $('#qzOn').checked = Q.enabled;
    $('#qzUrl').textContent = url(); $('#qzOpen').href = url();
    document.querySelectorAll('[data-q]').forEach(el => { el.value = Q[el.dataset.q] ?? ''; });
    const opts = sel => Q.profiles.map(p => `<option value="${esc(p.id)}"${p.id === sel ? ' selected' : ''}>${esc(p.title)}</option>`).join('');
    $('#qzProfiles').innerHTML = Q.profiles.map((p, i) => `
      <div class="qz-item" data-p="${i}">
        <div class="qz-item-top"><span>Perfil ${i + 1}</span>${Q.profiles.length > 1 ? `<button class="btn-ghost danger" type="button" data-delp="${i}">🗑 Remover</button>` : ''}</div>
        <label class="f"><span>Título</span><input type="text" data-pf="title" maxlength="80" value="${esc(p.title)}"></label>
        <label class="f"><span>Texto do resultado</span><textarea data-pf="text" maxlength="600" rows="3">${esc(p.text)}</textarea></label>
      </div>`).join('');
    $('#qzQuestions').innerHTML = Q.questions.map((q, i) => `
      <div class="qz-item" data-q-i="${i}">
        <div class="qz-item-top"><span>Pergunta ${i + 1}</span><span>
          <button class="btn-ghost" type="button" data-mvq="-1" aria-label="Subir">▲</button><button class="btn-ghost" type="button" data-mvq="1" aria-label="Descer">▼</button>
          ${Q.questions.length > 1 ? '<button class="btn-ghost danger" type="button" data-delq>🗑</button>' : ''}</span></div>
        <label class="f"><span>Pergunta</span><input type="text" data-qf="text" maxlength="160" value="${esc(q.text)}"></label>
        ${q.answers.map((a, k) => `<div class="qz-ans" data-a="${k}">
            <input type="text" data-af="text" maxlength="100" value="${esc(a.text)}" aria-label="Resposta ${k + 1}">
            <select data-af="profile" aria-label="Perfil da resposta ${k + 1}">${opts(a.profile)}</select>
            ${q.answers.length > 2 ? '<button class="btn-ghost danger" type="button" data-dela aria-label="Remover resposta">✕</button>' : '<span></span>'}
          </div>`).join('')}
        ${q.answers.length < 6 ? '<button class="btn-ghost" type="button" data-adda>+ resposta</button>' : ''}
      </div>`).join('');
    markDirty();
  }

  // edição
  $('#qzOn').addEventListener('change', e => { Q.enabled = e.target.checked; markDirty(); });
  document.querySelectorAll('[data-q]').forEach(el => el.addEventListener('input', () => { Q[el.dataset.q] = el.value; markDirty(); }));
  $('#qzProfiles').addEventListener('input', e => { const i = +e.target.closest('[data-p]').dataset.p; Q.profiles[i][e.target.dataset.pf] = e.target.value; markDirty(); });
  $('#qzProfiles').addEventListener('change', e => { if (e.target.dataset.pf === 'title') render(); }); // atualiza os nomes nos seletores
  $('#qzProfiles').addEventListener('click', e => {
    const b = e.target.closest('[data-delp]'); if (!b) return;
    const p = Q.profiles[+b.dataset.delp];
    if (!confirm(`Remover o perfil "${p.title}"? As respostas ligadas a ele passam para outro perfil.`)) return;
    Q.profiles.splice(+b.dataset.delp, 1);
    Q.questions.forEach(q => q.answers.forEach(a => { if (a.profile === p.id) a.profile = Q.profiles[0].id; }));
    render();
  });
  $('#qzAddProf').addEventListener('click', () => {
    if (Q.profiles.length >= 6) return toast('Máximo de 6 perfis', true);
    Q.profiles.push({ id: 'perfil-' + Math.random().toString(36).slice(2, 6), title: 'Novo perfil', text: '' }); render();
  });
  $('#qzQuestions').addEventListener('input', e => {
    const qi = +e.target.closest('[data-q-i]').dataset.qI, q = Q.questions[qi];
    if (e.target.dataset.qf) q.text = e.target.value;
    else if (e.target.dataset.af) q.answers[+e.target.closest('[data-a]').dataset.a][e.target.dataset.af] = e.target.value;
    markDirty();
  });
  $('#qzQuestions').addEventListener('change', e => { if (e.target.tagName === 'SELECT') e.target.dispatchEvent(new Event('input', { bubbles: true })); });
  $('#qzQuestions').addEventListener('click', e => {
    const box = e.target.closest('[data-q-i]'); if (!box) return;
    const qi = +box.dataset.qI, q = Q.questions[qi];
    const mv = e.target.closest('[data-mvq]');
    if (mv) { const j = qi + +mv.dataset.mvq; if (j < 0 || j >= Q.questions.length) return; [Q.questions[qi], Q.questions[j]] = [Q.questions[j], Q.questions[qi]]; return render(); }
    if (e.target.closest('[data-delq]')) { if (confirm('Remover esta pergunta?')) { Q.questions.splice(qi, 1); render(); } return; }
    if (e.target.closest('[data-dela]')) { q.answers.splice(+e.target.closest('[data-a]').dataset.a, 1); return render(); }
    if (e.target.closest('[data-adda]')) { q.answers.push({ text: 'Nova resposta', profile: Q.profiles[0].id }); return render(); }
  });
  $('#qzAddQ').addEventListener('click', () => {
    if (Q.questions.length >= 12) return toast('Máximo de 12 perguntas', true);
    Q.questions.push({ text: 'Nova pergunta', answers: Q.profiles.slice(0, 3).map(p => ({ text: 'Resposta', profile: p.id })).concat(Q.profiles.length < 2 ? [{ text: 'Resposta', profile: Q.profiles[0].id }] : []) });
    render();
  });

  // ações
  $('#qzSave').addEventListener('click', async () => {
    try { const q = await api('/api/admin/quiz', { method: 'PUT', body: JSON.stringify(Q) }); saved = JSON.parse(JSON.stringify(q)); Q = q; render(); toast('Quiz salvo ✓'); }
    catch (e) { toast(e.message, true); }
  });
  $('#qzCopy').addEventListener('click', () => navigator.clipboard.writeText(url()).then(() => toast('📋 Link copiado!'), () => toast('Não foi possível copiar', true)));
  $('#qzNew').addEventListener('click', async () => {
    if (dirty()) return toast('Salve as alterações antes de gerar um novo link', true);
    if (!confirm('Gerar um novo link? O link atual vai parar de funcionar (inclusive onde você já divulgou).')) return;
    try { const q = await api('/api/admin/quiz/slug', { method: 'POST', body: '{}' }); saved = JSON.parse(JSON.stringify(q)); Q = q; render(); toast('Novo link gerado ✓'); }
    catch (e) { toast(e.message, true); }
  });
  $('#qzReset').addEventListener('click', async () => {
    if (!confirm('Zerar todos os números do quiz?')) return;
    try { renderStats(await api('/api/admin/quiz/stats', { method: 'DELETE' })); toast('Números zerados'); } catch (e) { toast(e.message, true); }
  });

  // carrega quando a aba é aberta (e atualiza os números a cada abertura)
  document.addEventListener('click', e => {
    const t = e.target.closest('.tab[data-tab="quiz"]'); if (!t) return;
    if (!loaded) load().catch(err => toast(err.message, true));
    else api('/api/admin/quiz').then(d => renderStats(d.stats)).catch(() => {});
  });
})();
