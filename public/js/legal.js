/* Preenche os dados da empresa (configurados no painel) nas páginas legais */
(async () => {
  let S = {};
  try { S = (await (await fetch('/api/public')).json()).settings || {}; } catch {}
  const fmtDoc = d => !d ? '' : d.length === 14
    ? d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
    : d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  const fone = w => { const n = String(w || '').replace(/^55/, ''); return n.length >= 10 ? `(${n.slice(0, 2)}) ${n.slice(2, -4)}-${n.slice(-4)}` : w; };
  const vals = {
    razaoSocial: S.razaoSocial || 'Mini Pizza Junior',
    documento: S.documento ? (S.documento.length === 14 ? 'CNPJ ' : 'CPF ') + fmtDoc(S.documento) : '',
    endereco: S.endereco || '',
    emailContato: S.emailContato || '',
    whatsapp: S.whatsapp ? fone(S.whatsapp) : '',
    regiao: S.regiao || 'Nanuque e região',
  };
  document.querySelectorAll('[data-legal]').forEach(el => {
    const v = vals[el.dataset.legal];
    if (v) { el.textContent = v; el.classList.remove('miss'); }
    else { el.textContent = '(a informar)'; el.classList.add('miss'); }
  });
  document.querySelectorAll('[data-legal-mail]').forEach(a => { if (vals.emailContato) a.href = 'mailto:' + vals.emailContato; else a.removeAttribute('href'); });
  document.querySelectorAll('[data-legal-wpp]').forEach(a => { if (S.whatsapp) { a.href = 'https://wa.me/' + S.whatsapp; a.target = '_blank'; a.rel = 'noopener'; } });
})();
