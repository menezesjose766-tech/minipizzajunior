/*
 * PizzaKit — gera ilustrações de mini pizzas a partir de uma lista de ingredientes.
 * Usado pelo site, pelo painel admin e pelo servidor (validação dos ingredientes).
 *
 * Um sabor é descrito assim:
 * { id, name, base: 'tomate'|'branca'|'chocolate', cheese: true,
 *   toppings: [{ k: 'tomate', n: 8 }, ...], drizzle: 'catupiry'|null,
 *   center: 'azeitona_verde'|null, oregano: true }
 */
(function (global) {
  const f = n => (+n).toFixed(1);
  function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function scatter(R, n, maxR, minD, avoid = 0) {
    const pts = []; let tries = 0, d = minD;
    while (pts.length < n && tries++ < 4000) {
      if (tries % 800 === 0) d *= 0.85; // relaxa a distância se não couber
      const a = R() * Math.PI * 2, r = Math.sqrt(R()) * maxR;
      if (r < avoid) continue;
      const p = [Math.cos(a) * r, Math.sin(a) * r];
      if (pts.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) >= d)) pts.push(p);
    }
    return pts;
  }
  const item = (x, y, rot, s, inner) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${s})"><g class="t">${inner}</g></g>`;

  /* ---------- formas individuais ---------- */
  const SHAPE = {
    tomate: () => `<circle r="14" fill="#B8231A"/><circle r="12" fill="url(#pkTom)"/><g fill="#FBD3B0">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="1.8" ry="2.8" transform="rotate(${a}) translate(0 -6.5)"/>`).join('')}</g><circle r="2.6" fill="#FF8C78"/>`,
    manjericao: () => `<path d="M0,-17 C11,-10 11,9 0,17 C-11,9 -11,-10 0,-17Z" fill="#3E8E3A"/><path d="M0,-14 L0,14" stroke="#2C6B2A" stroke-width="1.6" stroke-linecap="round"/><path d="M0,-4 L5,-8 M0,3 L-5,-1 M0,8 L5,4" stroke="#2C6B2A" stroke-width="1" stroke-linecap="round"/>`,
    azeitona_verde: () => `<circle r="7" fill="#5C7A2B"/><circle r="6" fill="#6E8F34"/><circle r="2.8" fill="#C0392B"/><circle cx="-2.6" cy="-2.8" r="1.4" fill="#A9C26A" opacity=".8"/>`,
    azeitona_preta: () => `<circle r="7" fill="#1E1A1A"/><circle r="6" fill="#2E2828"/><circle r="2.6" fill="#0E0B0B"/><circle cx="-2.6" cy="-2.8" r="1.3" fill="#6A6060" opacity=".8"/>`,
    milho: () => `<rect x="-4.2" y="-3.6" width="8.4" height="7.2" rx="3.2" fill="#F7C531" stroke="#DB9B12" stroke-width="1"/><circle cx="-1.4" cy="-1.2" r="1.2" fill="#FFE68A"/>`,
    presunto: () => `<circle r="28" fill="#D9767E"/><circle r="25.5" fill="url(#pkHam)"/><path d="M-12,-8 C-4,-14 8,-10 12,-2" stroke="#FFE1E1" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>`,
    calabresa: () => `<circle r="13" fill="#8E1F1A"/><circle r="11.5" fill="#B8322A"/><circle cx="-4" cy="-3" r="2" fill="#F2C2A0"/><circle cx="4" cy="2" r="1.6" fill="#F2C2A0"/><circle cx="-1" cy="5" r="1.4" fill="#F2C2A0"/><circle cx="5" cy="-5" r="1.2" fill="#F2C2A0"/>`,
    bacon: () => `<path d="M-16,-4 C-10,-9 -4,1 2,-4 S12,-9 16,-4 L16,4 C10,-1 6,9 0,4 S-10,-1 -16,4Z" fill="#B8432F"/><path d="M-15,0 C-10,-4 -4,4 2,0 S12,-4 15,0" stroke="#F6D2C0" stroke-width="2" fill="none"/>`,
    champignon: () => `<path d="M-11,0 A11,10 0 0 1 11,0 L5,0 L5,9 L-5,9 L-5,0Z" fill="#E8D9C2" stroke="#B49B7A" stroke-width="1.5"/><path d="M-8,-2 A8,7 0 0 1 8,-2" stroke="#CDB696" stroke-width="1.2" fill="none"/>`,
    pimentao: () => `<path d="M-12,4 C-12,-12 12,-12 12,4" stroke="#2F8F3A" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-10,3 C-10,-9 10,-9 10,3" stroke="#57B85C" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
    cebola: () => `<ellipse rx="27" ry="23" fill="none" stroke="#7E2867" stroke-width="5.5"/><ellipse rx="27" ry="23" fill="none" stroke="#C25BA8" stroke-width="2"/>`,
    palmito: () => `<circle r="9" fill="#F6F0DA" stroke="#D9CFA8" stroke-width="2"/><circle r="5" fill="none" stroke="#E2D8B4" stroke-width="1.4"/>`,
    brocolis: () => `<rect x="-2" y="2" width="4" height="9" rx="2" fill="#7FB65A"/><circle cx="-5" cy="-2" r="5" fill="#2F7A2F"/><circle cx="5" cy="-2" r="5" fill="#2F7A2F"/><circle cy="-6" r="5.5" fill="#3B8F3A"/>`,
    morango: () => `<path d="M0,12 C-12,2 -11,-9 -4,-10 C-2,-10 -1,-9 0,-8 C1,-9 2,-10 4,-10 C11,-9 12,2 0,12Z" fill="#E0303A"/><path d="M-5,-10 L0,-6 L5,-10 L0,-13Z" fill="#3E8E3A"/><g fill="#FCE38A">${[[-4, -3], [3, -4], [-1, 2], [5, 2], [-5, 3], [1, 7]].map(p => `<ellipse cx="${p[0]}" cy="${p[1]}" rx=".8" ry="1.2"/>`).join('')}</g>`,
    banana: () => `<circle r="9" fill="#F7E7A6" stroke="#E2C66A" stroke-width="1.5"/><circle r="2.4" fill="#D9B95A" opacity=".6"/>`,
    queijo: () => `<path d="M-14,-10 L14,-14 L16,10 L-12,14Z" fill="#FFE08A" stroke="#E8B64A" stroke-width="2" stroke-linejoin="round"/><circle cx="-4" cy="-2" r="3" fill="#F2C35C"/><circle cx="7" cy="5" r="2.2" fill="#F2C35C"/>`,
    lombo: () => `<ellipse rx="16" ry="11.5" fill="#B9675A"/><ellipse rx="13.5" ry="9.2" fill="#E5A08F"/><path d="M-9,-3 C-4,-6 4,-6 9,-2" stroke="#F7D2C6" stroke-width="2.2" fill="none" stroke-linecap="round"/><ellipse cx="3" cy="3" rx="4" ry="2.4" fill="#D9887A" opacity=".7"/>`,
    abacaxi: () => `<path d="M-8,-7 L9,-6 L5,8 L-8,5Z" fill="#F8D44C" stroke="#C7862A" stroke-width="2.4" stroke-linejoin="round"/><path d="M-4,-3 L5,-2 M-5,2 L3,3" stroke="#FCE88E" stroke-width="1.4" stroke-linecap="round"/>`,
    camarao: () => `<path d="M7,-9 C-6,-12 -13,-2 -9,7 C-6,12 2,12 6,7" fill="none" stroke="#E8734A" stroke-width="7.5" stroke-linecap="round"/><path d="M7,-9 C-6,-12 -13,-2 -9,7 C-6,12 2,12 6,7" fill="none" stroke="#F7A07A" stroke-width="3.5" stroke-linecap="round"/><path d="M-1,-8 L1,-3 M-8,-2 L-3,0 M-7,7 L-2,4" stroke="#FFE1D2" stroke-width="1.2" stroke-linecap="round"/><path d="M6,7 L11,4 L10,10Z" fill="#E8734A"/>`,
  };

  function strands(R, n, colors, w) {
    return scatter(R, n, 62, 17).map(([cx, cy]) => {
      let s = '';
      for (let i = 0; i < 14; i++) {
        const x = cx + (R() - .5) * 26, y = cy + (R() - .5) * 26, a = R() * Math.PI * 2, L = 7 + R() * 9;
        const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L, mx = (x + ex) / 2 + (R() - .5) * 8, my = (y + ey) / 2 + (R() - .5) * 8;
        s += `<path d="M${f(x)},${f(y)} Q${f(mx)},${f(my)} ${f(ex)},${f(ey)}" stroke="${colors[i % colors.length]}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
      }
      return `<g><g class="t">${s}</g></g>`;
    }).join('');
  }
  function flakes(R, n, maker) {
    let out = '';
    for (let c = 0; c < n; c++) {
      let s = '';
      for (let i = 0; i < 12; i++) { const a = R() * 6.28, r = Math.sqrt(R()) * 74, x = Math.cos(a) * r, y = Math.sin(a) * r; s += maker(R, x, y, i); }
      out += `<g><g class="t">${s}</g></g>`;
    }
    return out;
  }
  const spread = (shape, maxR, minD, scale = 1, avoid = 0) => (R, n) => scatter(R, n, maxR, minD, avoid).map(p => item(p[0], p[1], R() * 360, scale, SHAPE[shape]())).join('');

  /* ---------- catálogo de ingredientes ----------
   * layer: ordem de desenho (1 = embaixo, 3 = em cima)
   * max/def: limites e valor padrão da quantidade no painel */
  const TOPPINGS = {
    carne:          { label: 'Carne desfiada', group: 'Carnes',   layer: 1, max: 14, def: 12, icon: 'carne', place: (R, n) => strands(R, n, ['#6E3418', '#8A4722', '#5A2A12'], 4) },
    frango:         { label: 'Frango desfiado', group: 'Carnes',  layer: 1, max: 14, def: 13, icon: 'frango', place: (R, n) => strands(R, n, ['#E57E26', '#F29A3F', '#D2691E'], 3.2) },
    presunto:       { label: 'Presunto',     group: 'Carnes',     layer: 1, max: 4,  def: 3,  place: (R, n) => scatter(R, n, 38, 36).map(p => item(p[0], p[1], R() * 90, 1.1, SHAPE.presunto())).join('') },
    calabresa:      { label: 'Calabresa',    group: 'Carnes',     layer: 1, max: 14, def: 10, place: spread('calabresa', 62, 24, 1.15) },
    bacon:          { label: 'Bacon',        group: 'Carnes',     layer: 1, max: 12, def: 8,  place: spread('bacon', 60, 22) },
    lombo:          { label: 'Lombinho',     group: 'Carnes',     layer: 1, max: 10, def: 7,  place: spread('lombo', 58, 28, 1.15) },
    camarao:        { label: 'Camarão',      group: 'Carnes',     layer: 2, max: 14, def: 9,  place: spread('camarao', 60, 24, 1.1) },
    tomate:         { label: 'Tomate',       group: 'Vegetais',   layer: 2, max: 12, def: 9,  place: spread('tomate', 60, 30, 1.05, 18) },
    cebola:         { label: 'Cebola roxa',  group: 'Vegetais',   layer: 2, max: 3,  def: 1,  place: (R, n) => (n === 1 ? [[0, 0]] : scatter(R, n, 34, 34)).map(p => item(p[0], p[1], R() * 40, n === 1 ? 1 : .8, SHAPE.cebola())).join('') },
    champignon:     { label: 'Champignon',   group: 'Vegetais',   layer: 2, max: 14, def: 9,  place: spread('champignon', 62, 22, 1.1) },
    pimentao:       { label: 'Pimentão',     group: 'Vegetais',   layer: 2, max: 12, def: 8,  place: spread('pimentao', 62, 22) },
    palmito:        { label: 'Palmito',      group: 'Vegetais',   layer: 2, max: 12, def: 8,  place: spread('palmito', 62, 22) },
    brocolis:       { label: 'Brócolis',     group: 'Vegetais',   layer: 2, max: 12, def: 8,  place: spread('brocolis', 62, 24, 1.1) },
    manjericao:     { label: 'Manjericão',   group: 'Vegetais',   layer: 3, max: 6,  def: 2,  place: spread('manjericao', 50, 30, 1.1) },
    cebolinha:      { label: 'Cebolinha',    group: 'Vegetais',   layer: 3, max: 6,  def: 4,  icon: 'cebolinha', place: (R, n) => flakes(R, n, (R, x, y, i) => `<circle cx="${f(x)}" cy="${f(y)}" r="2.6" fill="none" stroke="${i % 2 ? '#3E9B47' : '#5DBB5F'}" stroke-width="1.7"/>`) },
    abacaxi:        { label: 'Abacaxi caramelizado', group: 'Doces', layer: 2, max: 14, def: 9, place: spread('abacaxi', 62, 20, 1.05) },
    milho:          { label: 'Milho',        group: 'Extras',     layer: 3, max: 16, def: 8,  place: spread('milho', 66, 18, 1, 16) },
    azeitona_verde: { label: 'Azeitona verde', group: 'Extras',   layer: 3, max: 10, def: 5,  place: spread('azeitona_verde', 64, 20) },
    azeitona_preta: { label: 'Azeitona preta', group: 'Extras',   layer: 3, max: 10, def: 5,  place: spread('azeitona_preta', 64, 20) },
    parmesao:       { label: 'Parmesão ralado', group: 'Extras',  layer: 3, max: 6,  def: 3,  icon: 'queijo', place: (R, n) => flakes(R, n, (R, x, y) => `<rect x="${f(x)}" y="${f(y)}" width="4" height="2.4" rx="1" fill="#FFF8E6" stroke="#E9D9B0" stroke-width=".5" transform="rotate(${f(R() * 180)} ${f(x)} ${f(y)})"/>`) },
    morango:        { label: 'Morango',      group: 'Doces',      layer: 2, max: 12, def: 8,  place: spread('morango', 60, 26, 1.1) },
    banana:         { label: 'Banana',       group: 'Doces',      layer: 2, max: 14, def: 10, place: spread('banana', 62, 22, 1.1) },
    granulado:      { label: 'Granulado',    group: 'Doces',      layer: 3, max: 8,  def: 4,  icon: 'granulado', place: (R, n) => flakes(R, n, (R, x, y, i) => `<rect x="${f(x)}" y="${f(y)}" width="5" height="1.8" rx=".9" fill="${['#5A2E1A', '#3B1E10', '#7A3E1C'][i % 3]}" transform="rotate(${f(R() * 180)} ${f(x)} ${f(y)})"/>`) },
  };
  const BASES = { tomate: 'Molho de tomate', branca: 'Massa branca', chocolate: 'Chocolate' };
  const DRIZZLES = { catupiry: ['Catupiry', '#FFFCF2', '#E6D7B5'], cheddar: ['Cheddar', '#F5A623', '#C97F10'], chocolate: ['Chocolate', '#4A2412', '#2A1408'], doce_de_leite: ['Doce de leite', '#C98A3E', '#9A6526'] };
  const CENTERS = { azeitona_verde: 'Azeitona verde', azeitona_preta: 'Azeitona preta', tomate: 'Tomate', morango: 'Morango' };

  /* ícone pequeno (para paleta e ingredientes flutuantes) */
  const TIGHT = { milho: 7, azeitona_verde: 9, azeitona_preta: 9, palmito: 11, banana: 11, tomate: 16, calabresa: 15, champignon: 13, pimentao: 15, morango: 15, brocolis: 13, bacon: 18, manjericao: 19, queijo: 18, lombo: 18, abacaxi: 12, camarao: 15 };
  function iconSVG(k, tight) {
    const v = tight && TIGHT[k] ? TIGHT[k] : 30;
    if (SHAPE[k]) return `<svg viewBox="${-v} ${-v} ${v * 2} ${v * 2}">${SHAPE[k]()}</svg>`;
    if (k === 'carne' || k === 'frango') { const R = rng(hash(k)); const c = k === 'carne' ? ['#6E3418', '#8A4722'] : ['#E57E26', '#F29A3F']; let s = ''; for (let i = 0; i < 9; i++) { const x = (R() - .5) * 26, y = (R() - .5) * 26, a = R() * 6.28; s += `<path d="M${f(x)},${f(y)} q${f(Math.cos(a) * 6 + 3)},${f(Math.sin(a) * 6 - 3)} ${f(Math.cos(a) * 12)},${f(Math.sin(a) * 12)}" stroke="${c[i % 2]}" stroke-width="4" fill="none" stroke-linecap="round"/>`; } return `<svg viewBox="-30 -30 60 60">${s}</svg>`; }
    if (k === 'cebolinha') return `<svg viewBox="-16 -16 32 32">${[[-6, -5], [5, -6], [0, 2], [-7, 7], [7, 6]].map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.4" fill="none" stroke="${i % 2 ? '#3E9B47' : '#5DBB5F'}" stroke-width="2.2"/>`).join('')}</svg>`;
    if (k === 'granulado') return `<svg viewBox="-30 -30 60 60">${[[-10, -8, 30], [6, -10, 120], [-4, 6, 70], [10, 6, 10], [0, -2, 150]].map(p => `<rect x="${p[0]}" y="${p[1]}" width="10" height="3.6" rx="1.8" fill="#5A2E1A" transform="rotate(${p[2]} ${p[0]} ${p[1]})"/>`).join('')}</svg>`;
    return `<svg viewBox="-30 -30 60 60">${SHAPE.queijo()}</svg>`;
  }

  function drizzleSVG(kind) {
    const d = DRIZZLES[kind]; if (!d) return '';
    const path = 'M-54,-42 C-54,62 -27,62 -27,0 S0,-62 0,0 S27,62 27,0 S54,-62 54,42';
    return `<g class="dz" data-k="drizzle" transform="scale(1.15)"><path d="${path}" stroke="${d[2]}" stroke-width="9" fill="none" stroke-linecap="round" transform="translate(1.5 2.5)"/><path class="dzp" d="${path}" stroke="${d[1]}" stroke-width="7" fill="none" stroke-linecap="round"/></g>`;
  }

  function pizzaSVG(def) {
    def = def || {};
    const seed = def.id || def.name || 'pizza';
    const R = rng(hash(seed));
    const name = String(def.name || 'Mini pizza').replace(/[<>&"]/g, '');
    let s = `<svg viewBox="-100 -100 200 200" class="pz" role="img" aria-label="Mini pizza ${name}">`;
    s += `<circle r="98" fill="url(#pkCrust)"/>`;
    for (let i = 0; i < 14; i++) { const a = R() * 6.28, x = Math.cos(a) * 91, y = Math.sin(a) * 91; s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(3 + R() * 4)}" ry="${f(2 + R() * 2)}" fill="#D99A4E" opacity=".45" transform="rotate(${f(a * 57.3)} ${f(x)} ${f(y)})"/>`; }
    const base = def.base || 'tomate';
    s += `<circle r="83" fill="${base === 'chocolate' ? '#3A1C0E' : base === 'branca' ? '#EBD4A8' : '#D8462B'}"/>`;
    if (base === 'chocolate') {
      s += `<circle r="80" fill="#5A2E1A"/>`;
      for (let i = 0; i < 26; i++) { const a = R() * 6.28, r = Math.sqrt(R()) * 72; s += `<ellipse cx="${f(Math.cos(a) * r)}" cy="${f(Math.sin(a) * r)}" rx="${f(4 + R() * 8)}" ry="${f(2 + R() * 3)}" fill="#7A4326" opacity=".55"/>`; }
    } else if (def.cheese !== false) {
      s += `<circle r="80" fill="url(#pkCheese)"/><g opacity=".9">`;
      for (let i = 0; i < 70; i++) { const a = R() * 6.28, r = Math.sqrt(R()) * 76; s += `<circle cx="${f(Math.cos(a) * r)}" cy="${f(Math.sin(a) * r)}" r="${f(3 + R() * 5)}" fill="${R() > .3 ? '#FFFBEA' : '#F7D27A'}"/>`; }
      s += `</g>`;
    } else {
      s += `<circle r="80" fill="${base === 'branca' ? '#F6E7C6' : '#E0573A'}"/>`;
    }
    s += `<g class="tops">`;
    const tops = (def.toppings || []).filter(t => TOPPINGS[t.k]).slice().sort((a, b) => TOPPINGS[a.k].layer - TOPPINGS[b.k].layer);
    for (const t of tops) {
      const T = TOPPINGS[t.k], n = Math.max(1, Math.min(T.max, Math.round(t.n || T.def)));
      s += `<g data-k="${t.k}">${T.place(rng(hash(seed + ':' + t.k)), n)}</g>`;
    }
    s += drizzleSVG(def.drizzle);
    if (def.oregano) {
      const Ro = rng(hash(seed + ':ore')); let o = '';
      for (let i = 0; i < 36; i++) { const a = Ro() * 6.28, r = Math.sqrt(Ro()) * 74, x = Math.cos(a) * r, y = Math.sin(a) * r; o += `<rect x="${f(x)}" y="${f(y)}" width="2.4" height="1.6" rx=".6" fill="${i % 2 ? '#4C6B2A' : '#6B8A3A'}" transform="rotate(${f(Ro() * 180)} ${f(x)} ${f(y)})"/>`; }
      s += `<g class="ore" data-k="oregano">${o}</g>`;
    }
    if (def.center && SHAPE[def.center]) s += `<g data-k="center">${item(0, 0, 0, def.center === 'tomate' ? 1 : 1.1, SHAPE[def.center]())}</g>`;
    return s + `</g></svg>`;
  }

  function ingredientNames(def) {
    const out = [];
    if ((def.base || 'tomate') === 'chocolate') out.push('Chocolate');
    else if (def.cheese !== false) out.push('Muçarela');
    (def.toppings || []).forEach(t => TOPPINGS[t.k] && out.push(TOPPINGS[t.k].label));
    if (DRIZZLES[def.drizzle]) out.push(DRIZZLES[def.drizzle][0]);
    if (CENTERS[def.center] && !out.includes(CENTERS[def.center])) out.push(CENTERS[def.center]);
    if (def.oregano) out.push('Orégano');
    return out;
  }

  function injectDefs() {
    if (typeof document === 'undefined' || document.getElementById('pk-defs')) return;
    const d = document.createElement('div');
    d.innerHTML = `<svg id="pk-defs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
      <radialGradient id="pkCrust" cx="50%" cy="45%" r="55%"><stop offset="78%" stop-color="#F7D49A"/><stop offset="92%" stop-color="#E9AE62"/><stop offset="100%" stop-color="#C98339"/></radialGradient>
      <radialGradient id="pkCheese" cx="45%" cy="40%" r="60%"><stop offset="0%" stop-color="#FFF4D2"/><stop offset="100%" stop-color="#FBD98A"/></radialGradient>
      <radialGradient id="pkTom" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#FF6B55"/><stop offset="100%" stop-color="#C9281E"/></radialGradient>
      <radialGradient id="pkHam" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#FAC6C6"/><stop offset="100%" stop-color="#E6898F"/></radialGradient>
    </defs></svg>`;
    document.body.prepend(d.firstChild);
  }

  /* animação de montagem: ingredientes caem, cobertura se desenha.
   * opts.only = chave do ingrediente para animar só ele (usado no painel) */
  function assemble(root, opts = {}) {
    const g = global.gsap; if (!g || !root) return;
    const scope = opts.only ? root.querySelectorAll(`[data-k="${opts.only}"]`) : [root];
    const tops = [], dz = [], ore = [];
    scope.forEach(el => { el.querySelectorAll('.t').forEach(t => tops.push(t)); el.querySelectorAll('.dzp').forEach(p => dz.push(p)); if (el.matches && el.matches('.ore')) ore.push(el); el.querySelectorAll('.ore').forEach(o => ore.push(o)); });
    if (tops.length) g.fromTo(tops, { y: -70, scale: 1.8, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .55, ease: 'back.out(2.2)', stagger: { each: Math.min(.035, 1.2 / tops.length), from: 'random' }, transformOrigin: '50% 50%' });
    const delay = opts.only ? 0 : .45;
    dz.forEach(p => { const L = p.getTotalLength(); g.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.1, delay, ease: 'power2.inOut' }); g.fromTo(p.previousElementSibling, { opacity: 0 }, { opacity: 1, delay: delay + .45, duration: .5 }); });
    ore.forEach(o => g.fromTo(o, { opacity: 0 }, { opacity: 1, delay: opts.only ? 0 : .8, duration: .6 }));
  }

  /* dados iniciais (usados se a API não responder) */
  const DEFAULT_DATA = {
    settings: {
      whatsapp: '5533991315562', instagram: 'minipizzajunior', endereco: '',
      heroTitle: 'Mais *sabor* e praticidade pro seu dia a dia!',
      heroSubtitle: 'Mini pizzas artesanais, feitas com massa caseira e recheio generoso. Congeladas e prontas pro forno — perfeitas pro lanche, pras festas e pra você revender.',
      heroFlavor: 'marguerita', mostrarPrecos: true, margemPadrao: 3,
      aceitarPedidos: true, taxaEntrega: 0, pedidoMinimo: 1,
      regiao: 'Nanuque e região',
      encomenda: 'Frango com bacon\nMilho com bacon\nLombo canadense\nRomeu e Julieta\nBanana com canela\nNutella',
      ebookLink: '',
      brotinho1: 2.5, brotinho60: 2, brotinho100: 1.9, eventoLocal: 40,
    },
    flavors: [
      { id: 'marguerita', name: 'Marguerita', short: 'A clássica', badge: '', price: 10.99, active: true, desc: 'Molho, queijo, tomate cereja, manjericão e azeitona.', base: 'tomate', cheese: true, toppings: [{ k: 'tomate', n: 9 }, { k: 'manjericao', n: 2 }], drizzle: null, center: 'azeitona_verde', oregano: true },
      { id: 'nordestina', name: 'Nordestina', short: 'Carne com catupiry', badge: '', price: 14.99, active: true, desc: 'Molho, queijo, carne, catupiry, milho, azeitona e cebola roxa.', base: 'tomate', cheese: true, toppings: [{ k: 'carne', n: 12 }, { k: 'cebola', n: 1 }, { k: 'milho', n: 8 }], drizzle: 'catupiry', center: 'azeitona_verde', oregano: false },
      { id: 'frango', name: 'Frango c/ Catupiry', short: 'Com catupiry', badge: '', price: 12.99, active: true, desc: 'Molho, queijo, frango, catupiry, milho e azeitona.', base: 'tomate', cheese: true, toppings: [{ k: 'frango', n: 13 }, { k: 'milho', n: 8 }], drizzle: 'catupiry', center: 'azeitona_verde', oregano: true },
      { id: 'calabresa', name: 'Calabresa', short: 'Clássica brasileira', badge: '', price: 10.99, active: true, desc: 'Molho, queijo, calabresa, milho e azeitona.', base: 'tomate', cheese: true, toppings: [{ k: 'calabresa', n: 10 }, { k: 'milho', n: 8 }], drizzle: null, center: 'azeitona_verde', oregano: true },
      { id: 'lombo-abacaxi', name: 'Lombo c/ Abacaxi', short: 'Doce e salgado', badge: '', price: 12.99, active: true, desc: 'Molho, queijo, lombinho, catupiry, abacaxi caramelizado e azeitona.', base: 'tomate', cheese: true, toppings: [{ k: 'lombo', n: 7 }, { k: 'abacaxi', n: 9 }], drizzle: 'catupiry', center: 'azeitona_verde', oregano: false },
      { id: 'camarao', name: 'Camarão', short: 'Com catupiry e cebolinha', badge: '', price: 14.99, active: true, desc: 'Molho, queijo, camarão, catupiry, cebolinha, milho e azeitona.', base: 'tomate', cheese: true, toppings: [{ k: 'camarao', n: 9 }, { k: 'cebolinha', n: 4 }, { k: 'milho', n: 6 }], drizzle: 'catupiry', center: 'azeitona_verde', oregano: false },
      { id: 'bandeja-brotinho', name: 'Bandeja Brotinho', short: '10 unidades pré-assadas', badge: '🍕 10 unidades', price: 25, active: true, desc: 'Bandeja com 10 mini pizzas brotinho pré-assadas, selada a vácuo.', base: 'tomate', cheese: true, toppings: [{ k: 'calabresa', n: 6 }, { k: 'frango', n: 6 }, { k: 'milho', n: 6 }], drizzle: null, center: null, oregano: true },
    ],
    testimonials: [
      { name: 'Cliente', role: 'Depoimento exemplo', text: 'A massa é macia e o recheio vem caprichado. Meus filhos pedem toda semana!' },
      { name: 'Revendedor parceiro', role: 'Depoimento exemplo', text: 'Comecei a revender na minha lanchonete e esgota rápido. Entrega sempre certinha.' },
      { name: 'Cliente de festa', role: 'Depoimento exemplo', text: 'Encomendei pra festa de aniversário e foi o maior sucesso. Recomendo demais!' },
      { name: 'Cliente', role: 'Depoimento exemplo', text: 'Prático demais: tiro do freezer, 8 minutinhos no forno e pronto.' },
      { name: 'Cantina escolar', role: 'Depoimento exemplo', text: 'Os clientes da cantina amam. Virou item fixo no nosso cardápio.' },
    ],
  };

  // logo oficial (imagem do cliente)
  function logoSVG() {
    return `<img src="/img/logo-512.png" alt="Logo Mini Pizza Junior" width="512" height="512" style="width:100%;height:auto;display:block">`;
  }
  // versão desenhada antiga (reserva)
  function logoSVGDesenhado() {
    const R = rng(7); let tri = '';
    for (let i = 0; i < 46; i++) {
      const a = R() * 6.28, r = 18 + Math.sqrt(R()) * 64, x = 100 + Math.cos(a) * r, y = 100 + Math.sin(a) * r, s = 3 + R() * 3;
      tri += `<path d="M${f(x)},${f(y - s)} L${f(x + s)},${f(y + s * .8)} L${f(x - s)},${f(y + s * .8)}Z" fill="${R() > .5 ? '#F5A623' : '#B83F10'}" transform="rotate(${f(R() * 120)} ${f(x)} ${f(y)})" opacity=".9"/>`;
    }
    return `<svg viewBox="0 0 200 200" role="img" aria-label="Logo Mini Pizza Junior"><circle cx="100" cy="100" r="99" fill="#F5A623"/><circle cx="100" cy="100" r="88" fill="#E0521B"/>${tri}<g font-family="'Bagel Fat One', cursive" text-anchor="middle" paint-order="stroke" stroke="#8E2E0A" stroke-linejoin="round"><text x="100" y="94" font-size="33" fill="#FFC93C" stroke-width="7" transform="rotate(-5 100 100)">MINI PIZZA</text><text x="100" y="138" font-size="47" fill="#FFF1D0" stroke-width="8" transform="rotate(-5 100 100)">JUNIOR</text></g></svg>`;
  }

  const PizzaKit = { pizzaSVG, iconSVG, logoSVG, assemble, injectDefs, ingredientNames, TOPPINGS, BASES, DRIZZLES, CENTERS, DEFAULT_DATA, hash, rng };
  if (typeof module !== 'undefined' && module.exports) module.exports = PizzaKit;
  else global.PizzaKit = PizzaKit;
})(typeof window !== 'undefined' ? window : globalThis);
