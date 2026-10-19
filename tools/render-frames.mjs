import { chromium } from 'playwright-core';
import fs from 'node:fs';
const [,, outDir='frames', fps='25', size='240', bg='#ffffff', only=''] = process.argv;
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync('/workspace/mitosis-tools/page.html', `<html><body style="margin:0;background:${bg};display:grid;place-items:center;height:100vh">
<script src="../mitosis-loader/dist/mitosis-loader.umd.js"></script>
<s4e-loader id="l" size="${size}"></s4e-loader></body></html>`);
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: +size + 20, height: +size + 20 } });
await p.goto('file:///workspace/mitosis-tools/page.html');
await p.waitForTimeout(200);
const n = await p.evaluate(() => { const a = document.getElementById('l').shadowRoot.getAnimations(); a.forEach(x => x.pause()); return a.length; });
console.log('animations', n);
const T = 6000, step = 1000 / +fps;
const times = only ? only.split(',').map(Number) : Array.from({ length: Math.round(T / step) }, (_, i) => i * step);
let i = 0;
for (const t of times) {
  await p.evaluate((t) => document.getElementById('l').shadowRoot.getAnimations().forEach(x => x.currentTime = t), t);
  await p.screenshot({ path: `${outDir}/f${String(i++).padStart(4, '0')}.png`, clip: { x: 10, y: 10, width: +size, height: +size } });
}
await b.close();
