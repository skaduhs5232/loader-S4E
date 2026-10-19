// Captura frames do <s4e-loader> com Chrome. Requer playwright-core no NODE_PATH
// (não é dependência do pacote) e o dist/ já gerado.
//   node tools/render-frames.mjs [outDir] [fps] [size] [bg] [times]
// times vazio = o ciclo inteiro (6s). Caso contrário, lista em ms: "600,2160,3900"
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [,, outDir = 'frames', fps = '25', size = '240', bg = '#ffffff', only = ''] = process.argv;
const absOut = path.resolve(outDir);
fs.mkdirSync(absOut, { recursive: true });
const pagePath = path.join(absOut, 'page.html');
fs.writeFileSync(pagePath, `<!doctype html><html><body style="margin:0;background:${bg};display:grid;place-items:center;height:100vh">
<script src="${path.join(root, 'dist/mitosis-loader.umd.js')}"></script>
<s4e-loader id="l" size="${size}"></s4e-loader></body></html>`);
const executablePath = ['/usr/local/bin/google-chrome', '/usr/bin/google-chrome'].find((p) => fs.existsSync(p));
const b = await chromium.launch({ executablePath, args: ['--no-sandbox', '--disable-gpu'] });
const p = await b.newPage({ viewport: { width: +size + 20, height: +size + 20 } });
await p.goto(pathToFileURL(pagePath));
await p.waitForTimeout(200);
const n = await p.evaluate(() => {
  const a = document.getElementById('l').shadowRoot.getAnimations();
  a.forEach((x) => x.pause());
  return a.length;
});
console.log('animations', n);
const T = 6000, step = 1000 / +fps;
const times = only ? only.split(',').map(Number) : Array.from({ length: Math.round(T / step) }, (_, i) => i * step);
let i = 0;
for (const time of times) {
  await p.evaluate((t) => document.getElementById('l').shadowRoot.getAnimations().forEach((x) => { x.currentTime = t; }), time);
  await p.screenshot({ path: path.join(absOut, `f${String(i++).padStart(4, '0')}.png`), clip: { x: 10, y: 10, width: +size, height: +size } });
}
await b.close();

function pathToFileURL(file) {
  return 'file://' + file;
}
