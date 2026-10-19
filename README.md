# @s4e/mitosis-loader

![Loader S4E: uma célula se divide até formar a marca](./preview.gif)

Loader oficial da S4E. Uma célula no centro se divide por mitose — **1 → 2 → 4 → 8 → 16** — até formar a marca. As pontes da logo crescem de célula em célula, seguram, recolhem e as células se fundem de volta. O ciclo dura **6 segundos**, na cor **`#7C154D`**.

É um Web Component `<s4e-loader>`, sem dependências. O `dist/` já vem pronto neste repositório: instalar não exige build.

## Instalação

Um comando, sem publicar no npm. Sem tag, a instalação acompanha o branch `main`:

```bash
npm install github:skaduhs5232/loader-S4E
```

Para fixar a versão, acrescente a tag no final (`#v1.0.0`):

```bash
npm install github:skaduhs5232/loader-S4E#v1.0.0
npm install git+https://github.com/skaduhs5232/loader-S4E.git#v1.0.0
yarn add github:skaduhs5232/loader-S4E#v1.0.0
pnpm add github:skaduhs5232/loader-S4E#v1.0.0
```

No Yarn 4 o nome do pacote entra antes da tag:

```bash
yarn add @s4e/mitosis-loader@github:skaduhs5232/loader-S4E#v1.0.0
```

O pacote instalado se chama `@s4e/mitosis-loader`. Não há script `prepare`: o git install não instala devDependencies e não roda build.

## HTML puro (tag `<script>`)

Pelo jsDelivr, com a versão fixada na tag `v1.0.0`. **O repositório precisa estar público** para esta URL responder:

```html
<script src="https://cdn.jsdelivr.net/gh/skaduhs5232/loader-S4E@v1.0.0/dist/mitosis-loader.umd.js"></script>

<s4e-loader></s4e-loader>
<s4e-loader size="48" color="#ffffff" speed="1.5" label="Enviando arquivo"></s4e-loader>
```

O arquivo UMD também expõe `window.MitosisLoader` (`MitosisLoader`, `defineMitosisLoader`, `MITOSIS_COLOR`).

Depois de instalar via git, o mesmo arquivo está em `node_modules/@s4e/mitosis-loader/dist/mitosis-loader.umd.js`.

## Módulo ES

```html
<script type="module">
  import '@s4e/mitosis-loader';
</script>

<s4e-loader size="32" color="#7C154D" speed="1" label="Carregando"></s4e-loader>
```

```js
import '@s4e/mitosis-loader';
import { defineMitosisLoader, MITOSIS_COLOR } from '@s4e/mitosis-loader';

defineMitosisLoader('meu-loader');
```

Importar o módulo registra a tag `<s4e-loader>`. No servidor (sem `customElements`) o import não quebra; o elemento só é registrado no navegador.

## React

React 17 ou mais novo é peer dependency **opcional** — só é necessário se você usar o wrapper.

```jsx
import { S4ELoader } from '@s4e/mitosis-loader/react';

export function Carregando() {
  return <S4ELoader size={48} speed={1} label="Carregando dados" />;
}
```

No Next.js (App Router), coloque o componente em um arquivo com `'use client'`.

Para usar a tag direto no JSX com TypeScript:

```ts
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      's4e-loader': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: string | number;
        color?: string;
        speed?: string | number;
        label?: string;
        paused?: boolean | '';
      };
    }
  }
}
```

## Vue e Angular

O loader é um custom element. Importe `@s4e/mitosis-loader` uma vez e avise o framework para não tratar `<s4e-loader>` como componente próprio.

**Vue 3** (`main.ts`):

```ts
import { createApp } from 'vue';
import '@s4e/mitosis-loader';
import App from './App.vue';

const app = createApp(App);
app.config.compilerOptions.isCustomElement = (tag) => tag === 's4e-loader';
app.mount('#app');
```

**Angular** (`main.ts` e o componente que usa a tag):

```ts
import '@s4e/mitosis-loader';
```

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-root',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: '<s4e-loader size="48" label="Carregando"></s4e-loader>',
})
export class AppComponent {}
```

## SVG puro (`<img>`)

Sem JavaScript. A cor fica fixa em `#7C154D` (edite o `fill` do arquivo se precisar de outra).

```html
<img
  src="https://cdn.jsdelivr.net/gh/skaduhs5232/loader-S4E@v1.0.0/dist/mitosis-loader.svg"
  width="64"
  alt="Carregando"
>
```

O arquivo local é `dist/mitosis-loader.svg` (também em `node_modules/@s4e/mitosis-loader/dist/mitosis-loader.svg`). `dist/snippet.html` é o mesmo desenho em um bloco `<div>` + `<style>` + `<svg>` para colar numa página. A URL do jsDelivr só funciona com o repositório público.

## Atributos e variáveis CSS

| Atributo | Padrão | Descrição |
| --- | --- | --- |
| `size` | `64` | Tamanho em px (número) ou qualquer unidade CSS (`2rem`, `100%`). |
| `color` | `#7C154D` | Cor da marca e das células. |
| `speed` | `1` | Multiplicador de velocidade. `1` = ciclo de 6s. |
| `label` | `Carregando` | Texto do `aria-label`. |
| `paused` | — | Presente = animação pausada. |

As variáveis atravessam o Shadow DOM:

```css
s4e-loader {
  --s4e-size: 40px;
  --s4e-color: currentColor;
  --s4e-duration: 4.5s;
}
```

| Variável | Equivale a | Padrão |
| --- | --- | --- |
| `--s4e-size` | `size` | `64px` |
| `--s4e-color` | `color` | `#7C154D` |
| `--s4e-duration` | `speed` (duração do ciclo) | `6s` |

## Acessibilidade e movimento reduzido

O elemento recebe `role="progressbar"`, `aria-busy="true"` e `aria-label` (`label`, padrão `"Carregando"`).

Com `prefers-reduced-motion: reduce`, a mitose não roda: a marca aparece inteira, com uma pulsação suave.

## Atualizar para uma versão nova

As versões são tags git (`v1.0.0`, `v1.1.0`, …). Troque `v1.0.0` nos comandos acima e na URL do jsDelivr (`...@v1.1.0/dist/mitosis-loader.umd.js`). Sem `#tag`, a instalação volta a acompanhar o `main`.

## Como gerar de novo

`dist/` já está commitado. Para regenerar depois de mudar timing ou geometria (Node 18+, sem dependências):

```bash
npm run build
```

O traçado da marca está em `build/logo.d`. A demo local é o `demo.html` (abra no navegador; o script já vai dentro do arquivo).
