// Renders the link preview images (public/og-de.png, public/og-en.png) in the editor look.
// Run after changing name, tagline or colors:  npm run og
// Needs a local Chrome; set CHROME_PATH if it is not in the default Windows location.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const font = pathToFileURL(
  path.join(root, 'node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2'),
).href;
const chrome = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const variants = {
  de: {
    tree: ['README.md', 'über-mich.md', '▾ projekte/', '  ▾ live-urls/', '  ▾ side-projects/', 'kontakt.md'],
    hi: 'Hi, ich bin',
    tagline: 'Fullstack-Entwickler in Graz.',
    sub: 'Websites, Shops und Web-Apps.',
  },
  en: {
    tree: ['README.md', 'about.md', '▾ projects/', '  ▾ live-urls/', '  ▾ side-projects/', 'contact.md'],
    hi: "Hi, I'm",
    tagline: 'Full-stack developer in Graz.',
    sub: 'Websites, shops and web apps.',
  },
};

// same palette as the dark theme in src/styles/global.css
const html = (lang, v) => `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><style>
@font-face { font-family: JBM; src: url(${font}) format('woff2'); font-weight: 100 800; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #1a2224; color: #cdd6d2; font: 22px/1.7 JBM, monospace;
  display: grid; grid-template-columns: 300px 1fr; grid-template-rows: 1fr 44px; overflow: hidden; }
.tree { background: #141b1d; border-right: 1px solid #2b383b; padding: 28px 18px; font-size: 19px; }
.root { color: #e3b063; font-weight: 700; margin-bottom: 14px; }
.tree div { padding: 1px 10px; white-space: pre; }
.tree .dir { color: #6cc4cf; }
.tree .on { background: #e3b063; color: #1a2224; }
.buf { position: relative; display: flex; align-items: center; padding: 0 40px 0 30px; }
.lines { position: relative; z-index: 1; display: grid; grid-template-columns: 44px 1fr; column-gap: 26px; align-items: baseline; }
.ln { text-align: right; color: #8a9898; font-size: 19px; }
.dim { color: #8a9898; }
h1 { color: #e3b063; font-size: 56px; line-height: 1.3; font-weight: 800; white-space: nowrap; }
h1 span { color: #8a9898; font-weight: 400; }
.cur { display: inline-block; width: 0.55em; height: 0.95em; background: #e3b063; vertical-align: -0.1em; margin-left: 6px; }
.tag { font-size: 30px; }
.ascii { position: absolute; right: 0; bottom: 0; width: 560px; height: 586px; color: #8a9898; opacity: 0.4;
  font-size: 13px; line-height: 1.1; white-space: pre; overflow: hidden;
  -webkit-mask-image: linear-gradient(to left, #000, transparent); }
.status { grid-column: 1 / -1; display: flex; gap: 18px; align-items: center; background: #141b1d;
  border-top: 1px solid #2b383b; font-size: 18px; }
.mode { background: #e3b063; color: #1a2224; font-weight: 800; padding: 0 16px; line-height: 44px; }
.sp { flex: 1; }
.lang { padding-right: 18px; color: #8a9898; }
</style></head><body>
<nav class="tree"><div class="root">~/noah-edelsbrunner</div>
${v.tree.map((f, i) => `<div class="${i === 0 ? 'on' : f.trim().startsWith('▾') ? 'dir' : ''}">${f}</div>`).join('')}
</nav>
<main class="buf">
  <div class="ascii" id="ascii"></div>
  <div class="lines">
    <span class="ln">1</span><div class="dim">${v.hi}<span class="cur"></span></div>
    <span class="ln">2</span><div>&nbsp;</div>
    <span class="ln">3</span><h1><span># </span>Noah Edelsbrunner</h1>
    <span class="ln">4</span><div>&nbsp;</div>
    <span class="ln">5</span><div class="tag">${v.tagline}</div>
    <span class="ln">6</span><div class="dim">${v.sub}</div>
    <span class="ln">7</span><div>&nbsp;</div>
    <span class="ln">8</span><div class="dim">github.com/noahe99</div>
  </div>
</main>
<footer class="status"><span class="mode">NORMAL</span><span>README.md</span><span class="sp"></span><span class="lang">utf-8 · ${lang.toUpperCase()}</span></footer>
<script>
  // a frozen frame of the home page wallpaper
  const C = ' .,:;+*#', cols = 80, rows = 48; let s = '';
  for (let y = 0; y < rows; y++) { const d = 0.25 + (y / rows) * 0.9;
    for (let x = 0; x < cols; x++) { const w = Math.sin(x * 0.08 + 2.1 + Math.sin(y * 0.13 + 1.2) * 1.8) + Math.sin(y * 0.2 - 1.5 + x * 0.04);
      s += C[Math.min(C.length - 1, Math.floor(((w + 2) / 4) * d * C.length))]; } s += '\\n'; }
  document.getElementById('ascii').textContent = s;
</script>
</body></html>`;

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630 });
for (const [lang, v] of Object.entries(variants)) {
  const tmp = path.join(root, `tools/.og-${lang}.html`);
  fs.writeFileSync(tmp, html(lang, v));
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(root, `public/og-${lang}.png`);
  await page.screenshot({ path: out });
  fs.rmSync(tmp);
  console.log('wrote', path.relative(root, out));
}
await browser.close();
