// Gerador sem dependências: node scripts/build.mjs
// Variante IA — produz dist/ (ESM, UMD, React, tipos, SVG standalone, snippet HTML)
// e assets/logo.svg. A grade de 16 células é a do diamante S4E (branch main).
// As pontes internas formam as letras IA no lugar do 4 e da seta.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const COLOR = '#7C154D';
const T = 6; // duração do loop (s) em speed=1

// ---------- geometria (medida no PNG original, viewBox 910x910) ----------
const TOP = [454.5, 62.2], A = 130.75;
const lattice = (u, v) => [TOP[0] + (u - v) * A, TOP[1] + (u + v) * A];
const cells = [];
for (let u = 0; u < 4; u++) for (let v = 0; v < 4; v++) cells.push({ u, v });

// posição do ancestral da célula na geração g (0 = 1 célula, 4 = 16 células)
function genUV({ u, v }, g) {
  const half = (x) => (x < 2 ? 0.5 : 2.5);
  if (g === 0) return [1.5, 1.5];
  if (g === 1) return [half(u), 1.5];
  if (g === 2) return [half(u), half(v)];
  if (g === 3) return [u, half(v)];
  return [u, v];
}
const BASE_R = 60.5;
const R = [118, 100, 85, 71, BASE_R]; // raio por geração
function base(c, g) {
  let [x, y] = lattice(...genUV(c, g));
  let r = R[g];
  // a ponta direita do diamante (u=3,v=0) é mais estreita no logo real e fica solta
  if (g === 4 && c.u === 3 && c.v === 0) { x = 853; y = 455; r = 54; }
  return { x, y, r };
}
// estado entre a geração g-1 (frac=0) e g (frac=1)
function state(c, g, frac = 1, rMul = 1) {
  const b = base(c, g), a = g > 0 ? base(c, g - 1) : b;
  const L = (p, q) => p + (q - p) * frac;
  return { x: L(a.x, b.x), y: L(a.y, b.y), s: (L(a.r, b.r) * rMul) / BASE_R };
}
// fração em que as filhas formam um "amendoim" com pescoço (antes do estalo)
const NECK = [0, 0.58, 0.5, 0.8, 0.69];

// ---------- coreografia ----------
const E_STRETCH = 'cubic-bezier(.45,0,.4,1)';  // alongamento (anáfase)
const E_SNAP = 'cubic-bezier(.3,.6,.3,1.45)';   // citocinese: estalo + overshoot
const E_PULL = 'cubic-bezier(.6,0,.9,.5)';      // fusão: atração acelerando
const E_SOFT = 'cubic-bezier(.45,0,.55,1)';
// [tempo(s), geração, fração, multiplicador de raio, easing até o próximo]
const timeline = [[0.00, 1, 0, 0.97, E_SOFT]];
let t = 0.10;
for (let g = 1; g <= 4; g++) {
  timeline.push([t, g, 0, 1.04, E_STRETCH]);           // célula-mãe incha
  timeline.push([t + 0.26, g, NECK[g], 1.06, E_SNAP]); // alonga e estrangula
  timeline.push([t + 0.50, g, 1, 1, E_SOFT]);          // filhas assentam
  t += 0.52;
}
// t ≈ 2.18: 16 células assentadas -> pontes das letras IA crescem
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
const pct = (t) => +((t / T) * 100).toFixed(3) + '%';
const f = (n) => +n.toFixed(1);
// ---------- pontes (pseudópodes) ----------
// No main estas pontes fecham o anel do "4" e a seta da direita.
// Aqui ligam células que já existem no diamante e leem como I e A.
//
//   (0,0) ponta de cima, solta
//        (0,1) I          (1,0) ápice do A
//   (0,2)     (1,1) perna esq.  (2,0) perna dir.
//   (0,3) (1,2) I   (2,1) travessa   (3,0) ponta direita, solta
//        (1,3)  (2,2) pé esq.  (3,1) pé dir.
//             (2,3) I        (3,2)
//                  (3,3) ponta de baixo, solta
//
// O I é a coluna x≈324: (0,1)→(1,2)→(2,3). Sem serifa — os vizinhos
// são cantos do diamante ou células do A.
// O A: ápice (1,0); perna esq. (1,0)→(1,1)→(2,2); perna dir. (1,0)→(2,0)→(3,1);
// travessa horizontal na altura de (2,1), que fica no meio do traço e não no furo.
// A ponta (3,0) não entra em ponte nenhuma: o bico do diamante continua, sem seta.
const Pc = (u, v) => lattice(u, v).map((n) => +n.toFixed(1));
const iT = Pc(0, 1), iM = Pc(1, 2), iB = Pc(2, 3);
const aT = Pc(1, 0), aL = Pc(1, 1), aFL = Pc(2, 2);
const aR = Pc(2, 0), aFR = Pc(3, 1), aBar = Pc(2, 1);
const barL = [aL[0], aBar[1]], barR = [aR[0], aBar[1]];
const E_GROW = 'cubic-bezier(.5,0,.35,1)';   // estende e "agarra" a célula vizinha
const E_BACK = 'cubic-bezier(.5,0,.5,1)';
// Máscara: mesma largura do anel e da gota no main (90). A seta do main usa 70
// porque o traçado dela já é mais curto; aqui as pontes são do tamanho do anel.
// O que se vê não é esse traço: é a silhueta abaixo, com a cintura do main (~10px).
const MASK_W = 90;
// Largura cheia da ponte no viewBox, pela distância ao centro da célula mais próxima.
// Medida no anel vertical do 4 no frame final do main (cintura 10, célula 121).
const NECK_W = [[0, 121], [8, 120], [16, 118], [24, 112], [32, 103], [40, 91], [48, 77], [56, 64], [64, 52], [72, 42], [80, 33], [88, 25], [96, 19], [104, 14], [112, 11], [120, 10], [160, 10]];
function bridgeWidth(s) {
  if (s <= 0) return NECK_W[0][1];
  for (let i = 1; i < NECK_W.length; i++) {
    if (s <= NECK_W[i][0]) {
      const [s0, w0] = NECK_W[i - 1], [s1, w1] = NECK_W[i];
      return w0 + (w1 - w0) * ((s - s0) / (s1 - s0));
    }
  }
  return 10;
}
// Contorno preenchido. `bulbs` são os índices de pts que são centros de célula;
// a largura segue a cintura do main até essas células e fica fina nos outros fins
// (as pontas da travessa encontram a cintura da perna, não um disco).
function neckD(pts, bulbs) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const at = bulbs.map((i) => cum[i]);
  const left = [], right = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L;
    const n = Math.max(18, Math.round(L / 5));
    for (let k = 0; k <= n; k++) {
      if (i && k === 0) continue;
      const dist = cum[i] + (k / n) * L;
      let s = Infinity;
      for (const c of at) s = Math.min(s, Math.abs(dist - c));
      const hw = bridgeWidth(s) / 2;
      const x = a[0] + dx * (k / n), y = a[1] + dy * (k / n);
      left.push([+(x + nx * hw).toFixed(1), +(y + ny * hw).toFixed(1)]);
      right.push([+(x - nx * hw).toFixed(1), +(y - ny * hw).toFixed(1)]);
    }
  }
  return 'M' + left.concat(right.reverse()).map((p) => p.join(' ')).join('L') + 'Z';
}
// [pontos, largura da máscara, índices de célula, keyframes [t, fração, easing]]
// I primeiro; as pernas do A em paralelo; a travessa por último.
// Recolhem na ordem inversa, antes da fusão (t=4.5).
const BRIDGES = [
  { pts: [iT, iM, iB], w: MASK_W, bulbs: [0, 1, 2],
    kf: [[0, 0, E_GROW], [2.16, 0, E_GROW], [2.40, 0.5, E_SOFT], [2.46, 0.5, E_GROW], [2.72, 1, E_SOFT],
         [4.16, 1, E_BACK], [4.46, 0, E_SOFT], [T, 0, E_SOFT]] },
  { pts: [aT, aL, aFL], w: MASK_W, bulbs: [0, 1, 2],
    kf: [[0, 0, E_GROW], [2.66, 0, E_GROW], [2.92, 0.414, E_SOFT], [2.98, 0.414, E_GROW], [3.28, 1, E_SOFT],
         [4.00, 1, E_BACK], [4.30, 0, E_SOFT], [T, 0, E_SOFT]] },
  { pts: [aT, aR, aFR], w: MASK_W, bulbs: [0, 1, 2],
    kf: [[0, 0, E_GROW], [2.66, 0, E_GROW], [2.92, 0.414, E_SOFT], [2.98, 0.414, E_GROW], [3.28, 1, E_SOFT],
         [4.00, 1, E_BACK], [4.30, 0, E_SOFT], [T, 0, E_SOFT]] },
  { pts: [barL, aBar, barR], w: MASK_W, bulbs: [1],
    kf: [[0, 0, E_GROW], [3.20, 0, E_GROW], [3.40, 0.5, E_SOFT], [3.46, 0.5, E_GROW], [3.66, 1, E_SOFT],
         [3.92, 1, E_BACK], [4.14, 0, E_SOFT], [T, 0, E_SOFT]] },
];
// ponto ao longo da polilinha na fração f (por comprimento)
function along(pts, fr) {
  const seg = [];
  let tot = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; }
  let d = fr * tot;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) { const k = seg[i] ? Math.min(1, d / seg[i]) : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; }
    d -= seg[i];
  }
}
const DROP_R = 40;
// avaliador de cubic-bezier CSS (para amostrar a gota com o mesmo easing do traço)
function bezier(str) {
  const [x1, y1, x2, y2] = str.match(/-?[\d.]+/g).map(Number);
  const B = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x) => { let lo = 0, hi = 1; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; B(x1, x2, m) < x ? (lo = m) : (hi = m); } return B(y1, y2, (lo + hi) / 2); };
}
function bridgeKeyframes(prefix) {
  let out = '';
  BRIDGES.forEach((b, i) => {
    // traço da máscara
    out += `@keyframes ${prefix}b${i}{` + b.kf.map(([t, fr, e]) => `${pct(t)}{stroke-dashoffset:${+(1 - fr).toFixed(4)};animation-timing-function:${e}}`).join('') + '}';
    // gota na ponta: amostrada com o mesmo easing do traço, para andar colada à ponta
    const fr = [];
    for (let k = 0; k < b.kf.length - 1; k++) {
      const [t0, f0, e] = b.kf[k], [t1, f1] = b.kf[k + 1];
      const moving = f0 !== f1;
      const steps = moving ? 10 : 1;
      const ez = bezier(e);
      for (let s = 0; s < steps; s++) {
        const tt = t0 + ((t1 - t0) * s) / steps, ff = f0 + (f1 - f0) * ez(s / steps);
        const dp = b.drop || b.pts;
        const n = b.drop ? 1 : dp.length - 1, pos = ff * n, local = pos - Math.floor(pos);
        // escala: 0 dentro das células (vértices), máxima no meio do caminho
        const sc = moving ? Math.sin(Math.PI * Math.min(1, Math.max(0, local))) * 0.85 + 0.15 * (local > 0.02 && local < 0.98) : 0;
        const p = along(dp, ff);
        fr.push(`${pct(tt)}{transform:translate(${f(p[0])}px,${f(p[1])}px) scale(${+sc.toFixed(2)})}`);
      }
    }
    const pl = along(b.drop || b.pts, b.kf[b.kf.length - 1][1]);
    fr.push(`100%{transform:translate(${f(pl[0])}px,${f(pl[1])}px) scale(0)}`);
    out += `@keyframes ${prefix}d${i}{${fr.join('')}}`;
  });
  return out;
}
const LOGO_ON = 2.14, LOGO_OFF = 4.47;


function cellKeyframes(prefix) {
  return cells.map((c, i) => {
    const frames = timeline.map(([t, g, fr, m, ease]) => {
      const s = state(c, g, fr, m);
      return `${pct(t)}{transform:translate(${f(s.x)}px,${f(s.y)}px) scale(${+s.s.toFixed(3)});animation-timing-function:${ease}}`;
    }).join('');
    return `@keyframes ${prefix}c${i}{${frames}}`;
  }).join('\n');
}
// logo vetorizado aparece por cima das células (pontes metaball reais)
const logoKF = (prefix) =>
  `@keyframes ${prefix}logo{0%,${pct(LOGO_ON)}{opacity:0}${pct(LOGO_ON + 0.001)},${pct(LOGO_OFF)}{opacity:1}${pct(LOGO_OFF + 0.001)},100%{opacity:0}}` +
  `@keyframes ${prefix}breath{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.94)}}`;

function css(prefix, sel = '') {
  const per = cells.map((_, i) => `${sel}.${prefix}c${i}{animation-name:${prefix}c${i}}`).join('');
  return `${cellKeyframes(prefix)}
${logoKF(prefix)}
${bridgeKeyframes(prefix)}
${BRIDGES.map((_, i) => `${sel}.${prefix}b${i}{animation:${prefix}b${i} var(--s4e-duration,${T}s) infinite var(--s4e-play,running)}${sel}.${prefix}d${i}{animation:${prefix}d${i} var(--s4e-duration,${T}s) linear infinite var(--s4e-play,running)}`).join('')}
${sel}.${prefix}br{stroke-dasharray:1 1;stroke-dashoffset:1}
${sel}.${prefix}svg{display:block;width:100%;height:100%;overflow:visible}
${sel}.${prefix}cell,${sel}.${prefix}drop{transform-box:view-box;transform-origin:0 0;animation-duration:var(--s4e-duration,${T}s);animation-iteration-count:infinite;animation-play-state:var(--s4e-play,running)}
${per}
${sel}.${prefix}logo{opacity:0;animation:${prefix}logo var(--s4e-duration,${T}s) step-end infinite;animation-play-state:var(--s4e-play,running)}
@media (prefers-reduced-motion:reduce){${sel}.${prefix}goo{display:none}${sel}.${prefix}logo{mask:none!important;opacity:1;transform-origin:455px 455px;animation:${prefix}breath 1.8s ease-in-out infinite}}`;
}

// Marca estática: as 16 células do diamante + as pontes IA já completas.
// A máscara revela este desenho (não o traçado do 4/seta).
function logoShapes() {
  const dots = cells.map((c) => {
    if (c.u === 3 && c.v === 0) return `<circle cx="853" cy="455" r="54"/>`;
    const [x, y] = lattice(c.u, c.v);
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${BASE_R}"/>`;
  }).join('');
  const necks = BRIDGES.map((b) => `<path d="${neckD(b.pts, b.bulbs)}"/>`).join('');
  return dots + necks;
}
function svg(prefix, id, { color = `var(--s4e-color,${COLOR})`, title = '' } = {}) {
  const circles = cells.map((_, i) => `<circle class="${prefix}cell ${prefix}c${i}" r="${BASE_R}"/>`).join('');
  const drops = BRIDGES.map((_, i) => `<circle class="${prefix}drop ${prefix}d${i}" r="${DROP_R}"/>`).join('');
  const maskCircles = cells.map((c) => {
    const [x, y] = c.u === 3 && c.v === 0 ? [847, 455] : lattice(c.u, c.v);
    return `<circle cx="${f(x)}" cy="${f(y)}" r="64"/>`;
  }).join('');
  const strokes = BRIDGES.map((b, i) => `<path class="${prefix}br ${prefix}b${i}" pathLength="1" stroke-width="${b.w}" d="M${b.pts.map((p) => p.join(' ')).join('L')}"/>`).join('');
  return `<svg class="${prefix}svg" viewBox="0 0 910 910" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${title}` +
    `<defs><filter id="${id}" filterUnits="userSpaceOnUse" x="-80" y="-80" width="1070" height="1070" color-interpolation-filters="sRGB">` +
    `<feGaussianBlur in="SourceGraphic" stdDeviation="20" result="b"/>` +
    `<feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -6.4"/></filter>` +
    `<mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="910" height="910">` +
    `<g fill="#fff">${maskCircles}</g><g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">${strokes}</g></mask></defs>` +
    `<g class="${prefix}goo" filter="url(#${id})" style="fill:${color}">${circles}${drops}</g>` +
    `<g class="${prefix}logo" mask="url(#${id}m)" style="fill:${color}">${logoShapes()}</g></svg>`;
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

const banner = `/*! @s4e/mitosis-loader@${pkg.version} — variante IA: diamante S4E, pontes internas formam as letras IA */\n`;
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

/** <S4ELoader size={48} color="#7C154D" speed={1} /> — diamante S4E com as letras IA. */
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

// snippet HTML inline (copiar e colar, sem JS)
fs.writeFileSync(path.join(root, 'dist/snippet.html'), `<!-- Mitosis loader IA — snippet inline, sem JavaScript. Ajuste width/height e a cor em --s4e-color. Diamante S4E com as letras IA. -->
<div class="s4e-loader-inline" role="progressbar" aria-label="Carregando" style="width:64px;height:64px;--s4e-color:${COLOR}">
<style>${css(SP)}</style>
${svg(SP, 'mx-goo-inline')}
</div>
`);

fs.writeFileSync(path.join(root, 'assets/logo.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 910 910"><title>S4E · IA</title><g fill="${COLOR}">${logoShapes()}</g></svg>\n`);

const demoPath = path.join(root, 'demo.html');
if (fs.existsSync(demoPath)) {
  let demo = fs.readFileSync(demoPath, 'utf8');
  const start = demo.indexOf('<script>');
  const end = demo.lastIndexOf('</script>');
  if (start < 0 || end < start) throw new Error('demo.html sem <script>');
  demo = demo.slice(0, start) + '<script>\n' + umd.trim() + '\n</script>' + demo.slice(end + '</script>'.length);
  fs.writeFileSync(demoPath, demo);
}
console.log(`dist/ gerado (${pkg.version}). CSS: ${CSS.length} bytes. Pontes: ${BRIDGES.length}.`);
