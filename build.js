#!/usr/bin/env node
/**
 * Génère une version mono-fichier de l'application (HTML + CSS + JS inlinés),
 * pratique à envoyer ou à ouvrir directement depuis le bureau.
 *
 *   npm run build       (ou : node build.js)
 *   → quatre.html
 */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

const html = read('index.html');
const css = read('styles.css');
const js = read('app.js');

const out = html
  .replace('<link rel="stylesheet" href="styles.css">', () => '<style>\n' + css + '\n</style>')
  .replace('<script src="app.js"></script>', () => '<script>\n' + js + '\n</script>');

if (out.includes('href="styles.css"') || out.includes('src="app.js"')) {
  console.error('Inlining incomplet : vérifiez index.html.');
  process.exit(1);
}

fs.writeFileSync(path.join(root, 'quatre.html'), out);
const kb = (Buffer.byteLength(out) / 1024).toFixed(1);
console.log('✓ quatre.html généré (' + kb + ' Ko) — application autonome en un seul fichier.');
