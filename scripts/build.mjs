// Gerador sem dependências: node scripts/build.mjs
// Variante IA — produz dist/ (ESM, UMD, React, tipos, SVG, snippet) e assets/logo.svg.
// A forma final são as letras "I A" (não a marca S4E do branch main).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const COLOR = '#7C154D';
const T = 6; // duração do loop (s) em speed=1

// ---------- geometria: letras I e A em viewBox largo ----------
// 16 células. O I (8) é uma haste com serifas em bloco; o A (8) é perna + travessa.
// A primeira mitose separa a linhagem do I (esquerda) da linhagem do A (direita).
const VB_W = 1320;
const VB_H = 760;
const BASE_R = 64;
const BRIDGE_W = 100;
const MASK_R = 68;
const DROP_R = 40;
const Y0 = 140;
const Y3 = 620;
const stemX = 248;
const serif = 108;
const aCX = 890;
const aHalf = 300;
const yAt = (t) => +(Y0 + (Y3 - Y0) * t).toFixed(1);
const xAt = (sign, t) => +(aCX + sign * aHalf * t).toFixed(1);
const cell = (id, x, y, letter, g2, g3) => ({ id, x, y, letter, g2, g3 });

const cells = [
  // I — serifa de cima, haste, serifa de baixo
  cell('iTL', stemX - serif, Y0, 'I', 'It', 'ItSer'),
  cell('iTR', stemX + serif, Y0, 'I', 'It', 'ItSer'),
  cell('iTM', stemX, Y0, 'I', 'It', 'ItStem'),
  cell('iS1', stemX, yAt(1 / 3), 'I', 'It', 'ItStem'),
  cell('iS2', stemX, yAt(2 / 3), 'I', 'Ib', 'IbStem'),
  cell('iBM', stemX, Y3, 'I', 'Ib', 'IbStem'),
  cell('iBL', stemX - serif, Y3, 'I', 'Ib', 'IbSer'),
  cell('iBR', stemX + serif, Y3, 'I', 'Ib', 'IbSer'),
  // A — perna esquerda, perna direita, centro da travessa
  cell('aT', aCX, Y0, 'A', 'Al', 'AlUp'),
  cell('aUL', xAt(-1, 1 / 3), yAt(1 / 3), 'A', 'Al', 'AlUp'),
  cell('aCL', xAt(-1, 2 / 3), yAt(2 / 3), 'A', 'Al', 'AlLo'),
  cell('aFL', xAt(-1, 1), Y3, 'A', 'Al', 'AlLo'),
  cell('aUR', xAt(1, 1 / 3), yAt(1 / 3), 'A', 'Ar', 'ArUp'),
  cell('aCR', xAt(1, 2 / 3), yAt(2 / 3), 'A', 'Ar', 'ArUp'),
  cell('aFR', xAt(1, 1), Y3, 'A', 'Ar', 'ArLo'),
  cell('aCM', aCX, yAt(2 / 3), 'A', 'Ar', 'ArLo'),
];
if (cells.length !== 16) throw new Error('a mitose IA precisa de 16 células');

const keyAt = (c, g) => (g === 0 ? 'all' : g === 1 ? c.letter : g === 2 ? c.g2 : g === 3 ? c.g3 : c.id);
const centroid = (list) => {
  let x = 0, y = 0;
  for (const c of list) { x += c.x; y += c.y; }
  return [x / list.length, y / list.length];
};
// Distância entre filhas e quanto o par caminha em direção à letra.
// Mantém o estrangulamento gooey: as filhas nascem perto e só no fim pousam na grade.
const SEP = [0, 246, 196, 156];
const ALPHA = [0, 0, 0.62, 0.78];
const R = [118, 100, 85, 71, BASE_R];

function buildPositions() {
  const pos = new Map();
  pos.set(0, new Map([['all', centroid(cells)]]));
  for (let g = 1; g <= 3; g++) {
    const parents = new Map();
    for (const c of cells) {
      const pk = keyAt(c, g - 1);
      const ck = keyAt(c, g);
      if (!parents.has(pk)) parents.set(pk, new Map());
      if (!parents.get(pk).has(ck)) parents.get(pk).set(ck, []);
      parents.get(pk).get(ck).push(c);
    }
    const map = new Map();
    for (const [pk, kids] of parents) {
      const entries = [...kids.entries()];
      if (entries.length !== 2) throw new Error(`geração ${g}: grupo ${pk} não é binário`);
      const [[k1, l1], [k2, l2]] = entries;
      const F1 = centroid(l1);
      const F2 = centroid(l2);
      let dx = F2[0] - F1[0];
      let dy = F2[1] - F1[1];
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      const midF = [(F1[0] + F2[0]) / 2, (F1[1] + F2[1]) / 2];
      const P = pos.get(g - 1).get(pk);
      const a = ALPHA[g];
      const center = [P[0] + (midF[0] - P[0]) * a, P[1] + (midF[1] - P[1]) * a];
      const h = SEP[g] / 2;
      map.set(k1, [center[0] - dx * h, center[1] - dy * h]);
      map.set(k2, [center[0] + dx * h, center[1] + dy * h]);
    }
    pos.set(g, map);
  }
  pos.set(4, new Map(cells.map((c) => [c.id, [c.x, c.y]])));
  for (const [g, map] of pos) {
    const expect = 2 ** g;
    if (map.size !== expect) throw new Error(`geração ${g}: ${map.size} grupos, esperado ${expect}`);
  }
  return pos;
}
const POS = buildPositions();

function base(c, g) {
  const p = POS.get(g).get(keyAt(c, g));
  return { x: p[0], y: p[1], r: R[g] };
}
function state(c, g, frac = 1, rMul = 1) {
  const b = base(c, g), a = g > 0 ? base(c, g - 1) : b;
  const L = (p, q) => p + (q - p) * frac;
  return { x: L(a.x, b.x), y: L(a.y, b.y), s: (L(a.r, b.r) * rMul) / BASE_R };
}
const NECK = [0, 0.58, 0.5, 0.8, 0.69];

// ---------- coreografia da mitose (igual à do main: 1→2→4→8→16) ----------
const E_STRETCH = 'cubic-bezier(.45,0,.4,1)';
const E_SNAP = 'cubic-bezier(.3,.6,.3,1.45)';
const E_PULL = 'cubic-bezier(.6,0,.9,.5)';
const E_SOFT = 'cubic-bezier(.45,0,.55,1)';
const timeline = [[0.00, 1, 0, 0.97, E_SOFT]];
let t = 0.10;
for (let g = 1; g <= 4; g++) {
  timeline.push([t, g, 0, 1.04, E_STRETCH]);
  timeline.push([t + 0.26, g, NECK[g], 1.06, E_SNAP]);
  timeline.push([t + 0.50, g, 1, 1, E_SOFT]);
  t += 0.52;
}
t = 4.5;
timeline.push([t, 4, 1, 1, E_PULL]);
for (let g = 4; g >= 1; g--) {
  const d = g === 1 ? 0.36 : 0.28;
  timeline.push([t + d * 0.7, g, NECK[g] * 1.1, 1.05, E_SOFT]);
  timeline.push([t + d, g, 0, g === 1 ? 1.07 : 1.02, E_PULL]);
  t += d;
}
timeline[timeline.length - 1][4] = E_SOFT;
timeline.push([T, 1, 0, 0.97, E_SOFT]);
const pct = (time) => +((time / T) * 100).toFixed(3) + '%';
const f = (n) => +n.toFixed(1);

// ---------- pontes: o I fecha primeiro, depois as pernas do A, depois a travessa ----------
const E_GROW = 'cubic-bezier(.5,0,.35,1)';
const E_BACK = 'cubic-bezier(.5,0,.5,1)';
const round3 = (n) => +n.toFixed(3);
// Cresce célula a célula (pausa curta em cada nó) e recolhe antes da fusão.
function chain(tStart, segDur, pause, nSeg, retractAt, retractDur) {
  const kf = [[0, 0, E_GROW], [round3(tStart), 0, E_GROW]];
  let cursor = tStart;
  for (let s = 1; s <= nSeg; s++) {
    cursor = round3(cursor + segDur);
    const last = s === nSeg;
    if (!last && pause > 0) {
      kf.push([cursor, s / nSeg, E_SOFT]);
      cursor = round3(cursor + pause);
      kf.push([cursor, s / nSeg, E_GROW]);
    } else {
      kf.push([cursor, s / nSeg, last ? E_SOFT : E_GROW]);
    }
  }
  if (!(retractAt > cursor)) throw new Error(`recolhimento sobrepõe o crescimento (${retractAt} <= ${cursor})`);
  kf.push([retractAt, 1, E_BACK]);
  kf.push([round3(retractAt + retractDur), 0, E_SOFT]);
  kf.push([T, 0, E_SOFT]);
  return kf;
}
const Pt = (id) => {
  const c = cells.find((item) => item.id === id);
  return [f(c.x), f(c.y)];
};
const BRIDGES = [
  // haste do I, de cima para baixo
  { pts: [Pt('iTM'), Pt('iS1'), Pt('iS2'), Pt('iBM')], w: BRIDGE_W, kf: chain(2.16, 0.20, 0.06, 3, 4.42, 0.14) },
  // serifas saem da haste
  { pts: [Pt('iTM'), Pt('iTL')], w: BRIDGE_W, kf: chain(2.18, 0.34, 0, 1, 4.36, 0.12) },
  { pts: [Pt('iTM'), Pt('iTR')], w: BRIDGE_W, kf: chain(2.18, 0.34, 0, 1, 4.36, 0.12) },
  { pts: [Pt('iBM'), Pt('iBL')], w: BRIDGE_W, kf: chain(2.72, 0.30, 0, 1, 4.38, 0.12) },
  { pts: [Pt('iBM'), Pt('iBR')], w: BRIDGE_W, kf: chain(2.72, 0.30, 0, 1, 4.38, 0.12) },
  // pernas do A, em paralelo, do ápice até o pé
  { pts: [Pt('aT'), Pt('aUL'), Pt('aCL'), Pt('aFL')], w: BRIDGE_W, kf: chain(2.96, 0.18, 0.06, 3, 4.28, 0.14) },
  { pts: [Pt('aT'), Pt('aUR'), Pt('aCR'), Pt('aFR')], w: BRIDGE_W, kf: chain(2.96, 0.18, 0.06, 3, 4.28, 0.14) },
  // travessa fecha o A quando as pernas chegam na junta
  { pts: [Pt('aCM'), Pt('aCL')], w: BRIDGE_W, kf: chain(3.36, 0.32, 0, 1, 4.20, 0.14) },
  { pts: [Pt('aCM'), Pt('aCR')], w: BRIDGE_W, kf: chain(3.36, 0.32, 0, 1, 4.20, 0.14) },
];

function along(pts, fr) {
  const seg = [];
  let tot = 0;
  for (let i = 1; i < pts.length; i++) {
    const len = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(len);
    tot += len;
  }
  let d = fr * tot;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? Math.min(1, d / seg[i]) : 0;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
    }
    d -= seg[i];
  }
}
function bezier(str) {
  const [x1, y1, x2, y2] = str.match(/-?[\d.]+/g).map(Number);
  const B = (a, b, u) => 3 * a * u * (1 - u) ** 2 + 3 * b * u * u * (1 - u) + u ** 3;
  return (x) => {
    let lo = 0, hi = 1;
    for (let i = 0; i < 40; i++) {
      const m = (lo + hi) / 2;
      B(x1, x2, m) < x ? (lo = m) : (hi = m);
    }
    return B(y1, y2, (lo + hi) / 2);
  };
}
function bridgeKeyframes(prefix) {
  let out = '';
  BRIDGES.forEach((b, i) => {
    out += `@keyframes ${prefix}b${i}{` + b.kf.map(([time, fr, e]) => `${pct(time)}{stroke-dashoffset:${+(1 - fr).toFixed(4)};animation-timing-function:${e}}`).join('') + '}';
    const fr = [];
    for (let k = 0; k < b.kf.length - 1; k++) {
      const [t0, f0, e] = b.kf[k], [t1, f1] = b.kf[k + 1];
      const moving = f0 !== f1;
      const steps = moving ? 8 : 1;
      const ez = bezier(e);
      for (let s = 0; s < steps; s++) {
        const tt = t0 + ((t1 - t0) * s) / steps;
        const ff = f0 + (f1 - f0) * ez(s / steps);
        const n = b.pts.length - 1;
        const pos = ff * n;
        const local = pos - Math.floor(pos);
        const sc = moving ? Math.sin(Math.PI * Math.min(1, Math.max(0, local))) * 0.85 + 0.15 * (local > 0.02 && local < 0.98) : 0;
        const p = along(b.pts, ff);
        fr.push(`${pct(tt)}{transform:translate(${f(p[0])}px,${f(p[1])}px) scale(${+sc.toFixed(2)})}`);
      }
    }
    const pl = along(b.pts, b.kf[b.kf.length - 1][1]);
    fr.push(`100%{transform:translate(${f(pl[0])}px,${f(pl[1])}px) scale(0)}`);
    out += `@keyframes ${prefix}d${i}{${fr.join('')}}`;
  });
  return out;
}
const LOGO_ON = 2.14, LOGO_OFF = 4.50;
const CELLS_OFF = 2.24;
// No meio da pausa as gotas estão em scale(0) e as células em opacity 0.
// Um filtro gooey sem pixels visíveis desenha um retângulo preto; escondemos o grupo.
const GOO_HIDE = 3.70, GOO_SHOW = 4.19;

function cellKeyframes(prefix) {
  return cells.map((c, i) => {
    const frames = timeline.map(([time, g, fr, m, ease]) => {
      const s = state(c, g, fr, m);
      return `${pct(time)}{transform:translate(${f(s.x)}px,${f(s.y)}px) scale(${+s.s.toFixed(3)});animation-timing-function:${ease}}`;
    }).join('');
    return `@keyframes ${prefix}c${i}{${frames}}`;
  }).join('\n');
}
const logoKF = (prefix) =>
  `@keyframes ${prefix}logo{0%,${pct(LOGO_ON)}{opacity:0}${pct(LOGO_ON + 0.001)},${pct(LOGO_OFF)}{opacity:1}${pct(LOGO_OFF + 0.001)},100%{opacity:0}}` +
  `@keyframes ${prefix}breath{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.94)}}`;

// Enquanto as letras estão formadas, as células gooey somem: o buraco do A
// ficaria tapado pelo desfoque. As gotas continuam no filtro, sobre as pontes.
const cellsFadeKF = (prefix) =>
  `@keyframes ${prefix}cells{0%,${pct(CELLS_OFF)}{opacity:1}${pct(CELLS_OFF + 0.001)},${pct(LOGO_OFF)}{opacity:0}${pct(LOGO_OFF + 0.001)},100%{opacity:1}}` +
  `@keyframes ${prefix}goov{0%,${pct(GOO_HIDE)}{opacity:1}${pct(GOO_HIDE + 0.001)},${pct(GOO_SHOW)}{opacity:0}${pct(GOO_SHOW + 0.001)},100%{opacity:1}}`;

function css(prefix, sel = '') {
  const per = cells.map((_, i) => `${sel}.${prefix}c${i}{animation-name:${prefix}c${i}}`).join('');
  const origin = `${f(VB_W / 2)}px ${f(VB_H / 2)}px`;
  return `${cellKeyframes(prefix)}
${logoKF(prefix)}
${cellsFadeKF(prefix)}
${bridgeKeyframes(prefix)}
${BRIDGES.map((_, i) => `${sel}.${prefix}b${i}{animation:${prefix}b${i} var(--s4e-duration,${T}s) infinite var(--s4e-play,running)}${sel}.${prefix}d${i}{animation:${prefix}d${i} var(--s4e-duration,${T}s) linear infinite var(--s4e-play,running)}`).join('')}
${sel}.${prefix}br{stroke-dasharray:1 1;stroke-dashoffset:1}
${sel}.${prefix}svg{display:block;width:100%;height:100%;overflow:visible}
${sel}.${prefix}cell,${sel}.${prefix}drop{transform-box:view-box;transform-origin:0 0;animation-duration:var(--s4e-duration,${T}s);animation-iteration-count:infinite;animation-play-state:var(--s4e-play,running)}
${sel}.${prefix}cells{animation:${prefix}cells var(--s4e-duration,${T}s) step-end infinite;animation-play-state:var(--s4e-play,running)}
${sel}.${prefix}goo{animation:${prefix}goov var(--s4e-duration,${T}s) step-end infinite;animation-play-state:var(--s4e-play,running)}
${per}
${sel}.${prefix}logo{opacity:0;animation:${prefix}logo var(--s4e-duration,${T}s) step-end infinite;animation-play-state:var(--s4e-play,running)}
@media (prefers-reduced-motion:reduce){${sel}.${prefix}goo{display:none}${sel}.${prefix}logo{mask:none!important;opacity:1;transform-origin:${origin};animation:${prefix}breath 1.8s ease-in-out infinite}}`;
}

function letterShapes() {
  const circles = cells.map((c) => `<circle cx="${f(c.x)}" cy="${f(c.y)}" r="${BASE_R}"/>`).join('');
  const strokes = BRIDGES.map((b) => `<path fill="none" stroke-width="${b.w}" stroke-linecap="round" stroke-linejoin="round" d="M${b.pts.map((p) => p.join(' ')).join('L')}"/>`).join('');
  return circles + strokes;
}

function svg(prefix, id, { color = `var(--s4e-color,${COLOR})`, title = '' } = {}) {
  const circles = cells.map((_, i) => `<circle class="${prefix}cell ${prefix}c${i}" r="${BASE_R}"/>`).join('');
  const drops = BRIDGES.map((_, i) => `<circle class="${prefix}drop ${prefix}d${i}" r="${DROP_R}"/>`).join('');
  const maskCircles = cells.map((c) => `<circle cx="${f(c.x)}" cy="${f(c.y)}" r="${MASK_R}"/>`).join('');
  const strokes = BRIDGES.map((b, i) => `<path class="${prefix}br ${prefix}b${i}" pathLength="1" stroke-width="${b.w}" d="M${b.pts.map((p) => p.join(' ')).join('L')}"/>`).join('');
  return `<svg class="${prefix}svg" viewBox="0 0 ${VB_W} ${VB_H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${title}` +
    `<defs><filter id="${id}" filterUnits="userSpaceOnUse" x="-80" y="-80" width="${VB_W + 160}" height="${VB_H + 160}" color-interpolation-filters="sRGB">` +
    `<feGaussianBlur in="SourceGraphic" stdDeviation="20" result="b"/>` +
    `<feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -6.4"/></filter>` +
    `<mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="${VB_W}" height="${VB_H}">` +
    `<g fill="#fff">${maskCircles}</g><g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">${strokes}</g></mask></defs>` +
    `<g class="${prefix}goo" filter="url(#${id})" style="fill:${color}"><g class="${prefix}cells">${circles}</g>${drops}</g>` +
    `<g class="${prefix}logo" mask="url(#${id}m)" style="fill:${color};stroke:${color}">${letterShapes()}</g></svg>`;
}

// ---------- Web Component ----------
const P = 'ml-';
const CSS = css(P);
const componentSrc = `
const LOOP = ${T};
const CSS = ${JSON.stringify(CSS)};
const svgMarkup = (id) => ${JSON.stringify(svg(P, '__ID__'))}.split('__ID__').join(id);
let uid = 0;
let sheet = null;
const canAdopt = typeof ShadowRoot !== 'undefined' && 'adoptedStyleSheets' in ShadowRoot.prototype && typeof CSSStyleSheet !== 'undefined' && 'replaceSync' in CSSStyleSheet.prototype;
const Base = typeof HTMLElement !== 'undefined' ? HTMLElement : class {};

export class MitosisLoader extends Base {
  static get observedAttributes() { return ['size', 'color', 'speed', 'label', 'paused']; }
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const id = 's4e-goo-' + (++uid);
    const hostCSS = ':host{display:inline-block;width:var(--s4e-size,64px);height:var(--s4e-size,64px);line-height:0;vertical-align:middle;contain:layout style}:host([hidden]){display:none}' + CSS;
    if (canAdopt) {
      if (!sheet) { sheet = new CSSStyleSheet(); sheet.replaceSync(hostCSS); }
      root.adoptedStyleSheets = [sheet];
      root.innerHTML = svgMarkup(id);
    } else {
      root.innerHTML = '<style>' + hostCSS + '</style>' + svgMarkup(id);
    }
  }
  connectedCallback() {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'progressbar');
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.getAttribute('label') || 'Carregando');
    this.setAttribute('aria-busy', 'true');
    for (const a of MitosisLoader.observedAttributes) this.attributeChangedCallback(a, null, this.getAttribute(a));
  }
  attributeChangedCallback(name, _old, val) {
    const s = this.style;
    if (name === 'size') {
      if (val == null || val === '') s.removeProperty('--s4e-size');
      else s.setProperty('--s4e-size', /^\\d+(\\.\\d+)?$/.test(val) ? val + 'px' : val);
    } else if (name === 'color') {
      val ? s.setProperty('--s4e-color', val) : s.removeProperty('--s4e-color');
    } else if (name === 'speed') {
      const sp = parseFloat(val);
      sp > 0 ? s.setProperty('--s4e-duration', (LOOP / sp) + 's') : s.removeProperty('--s4e-duration');
    } else if (name === 'label' && val) {
      this.setAttribute('aria-label', val);
    } else if (name === 'paused') {
      val != null ? s.setProperty('--s4e-play', 'paused') : s.removeProperty('--s4e-play');
    }
  }
}

export function defineMitosisLoader(tag = 's4e-loader') {
  if (typeof customElements !== 'undefined' && !customElements.get(tag)) {
    customElements.define(tag, tag === 's4e-loader' ? MitosisLoader : class extends MitosisLoader {});
  }
}
defineMitosisLoader();
export const MITOSIS_COLOR = '${COLOR}';
export default MitosisLoader;
`;

const banner = `/*! @s4e/mitosis-loader@${pkg.version} — variante IA: mitose até formar as letras I A */\n`;
fs.writeFileSync(path.join(root, 'dist/mitosis-loader.mjs'), banner + componentSrc.trim() + '\n');

const umd = banner + `(function (g, f) {
  if (typeof exports === 'object' && typeof module !== 'undefined') f(module.exports);
  else if (typeof define === 'function' && define.amd) define(['exports'], f);
  else f((g = typeof globalThis !== 'undefined' ? globalThis : g || self).MitosisLoader = {});
})(this, function (exports) {
'use strict';
${componentSrc.replace(/^export (class|function|const) /gm, '$1 ').replace(/^export default .*$/m, '')
  .trim()}
exports.MitosisLoader = MitosisLoader;
exports.defineMitosisLoader = defineMitosisLoader;
exports.MITOSIS_COLOR = MITOSIS_COLOR;
exports.default = MitosisLoader;
});
`;
fs.writeFileSync(path.join(root, 'dist/mitosis-loader.umd.js'), umd);

// ---------- React ----------
fs.writeFileSync(path.join(root, 'dist/react.mjs'), banner + `import { createElement } from 'react';
import './mitosis-loader.mjs';

/** <S4ELoader size={48} color="#7C154D" speed={1} /> — variante IA, forma as letras I A. */
export function MitosisLoader({ size = 64, color, speed, label, paused, className, style, ...rest }) {
  return createElement('s4e-loader', {
    size: String(size),
    color,
    speed: speed != null ? String(speed) : undefined,
    label,
    paused: paused ? '' : undefined,
    className,
    style,
    ...rest,
  });
}
export { MitosisLoader as S4ELoader };
export default MitosisLoader;
`);

// ---------- Tipos ----------
fs.writeFileSync(path.join(root, 'dist/index.d.ts'), `export interface MitosisLoaderAttributes {
  /** Tamanho em px (número) ou qualquer unidade CSS. Padrão: 64 */
  size?: number | string;
  /** Cor de preenchimento. Padrão: ${COLOR} (ou var(--s4e-color)) */
  color?: string;
  /** Multiplicador de velocidade. 1 = loop de ${T}s. */
  speed?: number | string;
  /** Texto acessível (aria-label). Padrão: "Carregando" */
  label?: string;
  /** Presente = animação pausada */
  paused?: boolean | '';
}
export declare class MitosisLoader extends HTMLElement {
  static readonly observedAttributes: string[];
}
export declare function defineMitosisLoader(tag?: string): void;
export declare const MITOSIS_COLOR: string;
export default MitosisLoader;

declare global {
  interface HTMLElementTagNameMap { 's4e-loader': MitosisLoader; }
}
`);
fs.writeFileSync(path.join(root, 'dist/react.d.ts'), `import type { CSSProperties, HTMLAttributes } from 'react';
export interface MitosisLoaderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  size?: number | string;
  color?: string;
  speed?: number;
  label?: string;
  paused?: boolean;
  className?: string;
  style?: CSSProperties;
}
export declare function MitosisLoader(props: MitosisLoaderProps): JSX.Element;
export { MitosisLoader as S4ELoader };
export default MitosisLoader;
`);

// ---------- SVG standalone (funciona em <img>, background-image, inline) ----------
const SP = 'mx-';
const standalone = svg(SP, 'mx-goo', { color: COLOR, title: '<title>Carregando</title>' })
  .replace('aria-hidden="true" focusable="false"', 'role="img" width="64" height="64"')
  .replace('<defs>', `<style>${css(SP)}</style><defs>`);
fs.writeFileSync(path.join(root, 'dist/mitosis-loader.svg'), standalone + '\n');

fs.writeFileSync(path.join(root, 'dist/snippet.html'), `<!-- Mitosis loader IA — snippet inline, sem JavaScript. Ajuste width/height e a cor em --s4e-color. Forma as letras I A. -->
<div class="s4e-loader-inline" role="progressbar" aria-label="Carregando" style="width:64px;height:64px;--s4e-color:${COLOR}">
<style>${css(SP)}</style>
${svg(SP, 'mx-goo-inline')}
</div>
`);

// Marca estática da variante (letras I A), sem animação.
fs.writeFileSync(path.join(root, 'assets/logo.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}"><title>I A</title><g fill="${COLOR}" stroke="${COLOR}">${letterShapes()}</g></svg>\n`);

// demo.html embute o UMD para abrir offline (file://).
const demoPath = path.join(root, 'demo.html');
if (fs.existsSync(demoPath)) {
  let demo = fs.readFileSync(demoPath, 'utf8');
  const start = demo.indexOf('<script>');
  const end = demo.lastIndexOf('</script>');
  if (start < 0 || end < start) throw new Error('demo.html sem <script>');
  demo = demo.slice(0, start) + '<script>\n' + umd.trim() + '\n</script>' + demo.slice(end + '</script>'.length);
  fs.writeFileSync(demoPath, demo);
}

console.log(`dist/ gerado (${pkg.version}). CSS: ${CSS.length} bytes. Células: ${cells.length}. Pontes: ${BRIDGES.length}. viewBox ${VB_W}x${VB_H}.`);
