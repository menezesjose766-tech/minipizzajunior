/*
 * Gera public/api/catalog.json a partir de public/js/pizza.js.
 * A API em PHP usa esse arquivo para validar ingredientes e criar os dados iniciais.
 * Rode sempre que mudar ingredientes ou os dados padrão:  node tools/export-catalog.js
 */
const fs = require('fs');
const path = require('path');
const PK = require('../public/js/pizza.js');

const catalog = {
  toppings: Object.fromEntries(Object.entries(PK.TOPPINGS).map(([k, t]) => [k, { max: t.max, def: t.def }])),
  bases: Object.keys(PK.BASES),
  drizzles: Object.keys(PK.DRIZZLES),
  centers: Object.keys(PK.CENTERS),
  defaults: PK.DEFAULT_DATA,
};
const out = path.join(__dirname, '..', 'public', 'api', 'catalog.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(catalog, null, 2));
console.log('✅', out, '—', Object.keys(catalog.toppings).length, 'ingredientes');
