import "server-only";
import fs from "node:fs";
import path from "node:path";

// Fontes reais dos 6 templates (Red Hat Display + DM Sans), baixadas uma vez do Google
// Fonts e embutidas em base64 — a geração do PDF não pode depender de uma requisição de
// rede (mesmo princípio já seguido pelo resto do gerador, que usa só fontes de sistema).
// Cada arquivo é a variable font só do subset "latin" (cobre os acentos do português),
// por isso um único arquivo cobre todos os pesos usados via uma faixa de font-weight.
//
// `process.cwd()` (não `__dirname`) porque em produção esses arquivos só existem no
// bundle da função serverless via `outputFileTracingIncludes` (next.config.ts) — o
// mesmo motivo pelo qual o binário do Chromium também não é referenciado por caminho
// relativo ao módulo compilado.
const DIR = path.join(process.cwd(), "src/lib/pdf/templates-revenda/fonts");

let cache: string | null = null;

function base64(nomeArquivo: string): string {
  return fs.readFileSync(path.join(DIR, nomeArquivo)).toString("base64");
}

/** CSS `@font-face` das duas famílias usadas pelos templates, prontos para embutir no `<style>`. */
export function fontFacesCss(): string {
  if (cache) return cache;

  const redHat = base64("RedHatDisplay-Variable.woff2");
  const dmSans = base64("DMSans-Variable.woff2");
  const dmSansItalic = base64("DMSans-Italic-Variable.woff2");

  cache = `
    @font-face {
      font-family: 'Red Hat Display';
      font-style: normal;
      font-weight: 300 900;
      font-display: block;
      src: url(data:font/woff2;base64,${redHat}) format('woff2');
    }
    @font-face {
      font-family: 'DM Sans';
      font-style: normal;
      font-weight: 100 700;
      font-display: block;
      src: url(data:font/woff2;base64,${dmSans}) format('woff2');
    }
    @font-face {
      font-family: 'DM Sans';
      font-style: italic;
      font-weight: 400;
      font-display: block;
      src: url(data:font/woff2;base64,${dmSansItalic}) format('woff2');
    }
  `;

  return cache;
}
