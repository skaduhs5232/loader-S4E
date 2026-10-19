# @s4e/mitosis-loader · variante I A

![Loader: uma célula se divide até formar as letras I A](./preview.gif)

Variante **IA** do loader de mitose. Uma célula no centro se divide — **1 → 2 → 4 → 8 → 16** — e as pontes crescem de célula em célula até formar as letras **I A** (a letra I, um espaço, a letra A). O I fecha primeiro; em seguida as pernas do A e, por último, a travessa. As pontes seguram, recolhem e as células se fundem de volta. O ciclo dura **6 segundos**, na cor **`#7C154D`**.

O branch `main` é a outra variante: a mesma mitose termina na **marca S4E**, não nestas letras. Instalar sem `#IA` acompanha o `main`.

É um Web Component `<s4e-loader>`, sem dependências. O `dist/` já vem pronto neste repositório: instalar não exige build.

## Instalação

Um comando, sem publicar no npm. Esta variante está no branch `IA`:

```bash
npm install github:skaduhs5232/loader-S4E#IA
```

O mesmo commit, com a URL explícita:

```bash
npm install git+https://github.com/skaduhs5232/loader-S4E.git#IA
yarn add github:skaduhs5232/loader-S4E#IA
pnpm add github:skaduhs5232/loader-S4E#IA
```

No Yarn 4 o nome do pacote entra antes da tag:

```bash
yarn add @s4e/mitosis-loader@github:skaduhs5232/loader-S4E#IA
```

A versão deste branch é `1.1.0-ia` (campo `version` do `package.json`). Não é uma tag git: o seletor que entrega este código é `#IA`.

O pacote instalado se chama `@s4e/mitosis-loader`. Não há script `prepare`: o git install não instala devDependencies e não roda build.

Para a marca S4E, use o `main` (sem sufixo) ou uma tag daquele branch, por exemplo `#v1.0.0`.

## HTML puro (tag `<script>`)

Pelo jsDelivr, apontando para o branch `IA`. **O repositório precisa estar público** para esta URL responder:

```html
<script src="https://cdn.jsdelivr.net/gh/skaduhs5232/loader-S4E@IA/dist/mitosis-loader.umd.js"></script>

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

Sem JavaScript. A cor fica fixa em `#7C154D` (edite o `fill` do arquivo se precisar de outra). O desenho é o ciclo inteiro, e o quadro estável mostra **I A**.

```html
<img
  src="https://cdn.jsdelivr.net/gh/skaduhs5232/loader-S4E@IA/dist/mitosis-loader.svg"
  width="64"
  alt="Carregando"
>
```

O arquivo local é `dist/mitosis-loader.svg` (também em `node_modules/@s4e/mitosis-loader/dist/mitosis-loader.svg`). `dist/snippet.html` é o mesmo desenho em um bloco `<div>` + `<style>` + `<svg>` para colar numa página. A URL do jsDelivr só funciona com o repositório público. `assets/logo.svg` é a forma estática, sem animação.

## Atributos e variáveis CSS

| Atributo | Padrão | Descrição |
| --- | --- | --- |
| `size` | `64` | Tamanho em px (número) ou qualquer unidade CSS (`2rem`, `100%`). |
| `color` | `#7C154D` | Cor das letras e das células. |
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

Com `prefers-reduced-motion: reduce`, a mitose não roda: as letras I A aparecem inteiras, com uma pulsação suave.

## O que este branch desenha

As 16 células pousam numa grade de dois blocos, com um vão entre eles.

O **I** usa 8 células: três na serifa de cima, duas no meio da haste e três na serifa de baixo. A ponte da haste liga o centro das serifas de cima para baixo; as serifas crescem a partir desses centros.

O **A** usa as outras 8: ápice, dois ombros, dois nós na altura da travessa, o centro da travessa e dois pés. As pernas crescem juntas, do ápice até o pé; a travessa liga os nós do meio e deixa o contador aberto, com a base aberta entre os pés.

A primeira divisão manda metade das células para o lado do I e metade para o lado do A. As divisões seguintes separam topo e base, depois os pares, até cada célula chegar no seu nó. O filtro gooey (desfoque + limiar) continua responsável pelo alongamento e pelo estrangulamento de cada mitose.

## Atualizar

Sem `#IA`, a instalação acompanha o `main` e volta a formar a marca S4E. Para continuar nesta variante, mantenha `#IA` no comando e na URL do jsDelivr (`...@IA/dist/mitosis-loader.umd.js`).

## Como gerar de novo

`dist/` já está commitado. Para regenerar depois de mudar timing ou geometria (Node 18+, sem dependências):

```bash
npm run build
```

A grade das letras e o tempo das pontes estão em `scripts/build.mjs`. A demo local é o `demo.html` (abra no navegador; o script já vai dentro do arquivo).
