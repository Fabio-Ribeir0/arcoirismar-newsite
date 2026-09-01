import "server-only";
import { PDFDocument } from "pdf-lib";
import { abrirNavegador } from "./browser";
import { escapeAttr, esperarImagens, carimbarRodapePaginas } from "./comum";
import { renderizarUnidade, templatesCss, type UnidadeRevendaTemplateData } from "./templates-revenda";
import type { TemplateRevenda } from "@/generated/prisma/client";

// A4 retrato com 1cm em TODAS as margens — de propósito diferente do gerador da
// tabela de unidades (que usa 5mm nas laterais). As constantes ficam locais a
// este arquivo: compartilhá-las faria com que mexer num layout refluísse o outro.
const MARGEM_MM = 10;
const LARGURA_MM = 210 - MARGEM_MM * 2; // 190
// Colchão anti-arredondamento: 277mm = 1046.9px a 96dpi, e uma fração de pixel
// arredondada pra cima joga uma tira em branco na página seguinte.
const ALTURA_MM = 297 - MARGEM_MM * 2 - 0.5; // 276.5

const ESTILOS = `
  * { box-sizing: border-box; }
  body { margin: 0; color: #3c3f40; }

  .capa { width: ${LARGURA_MM}mm; height: ${ALTURA_MM}mm; break-after: page; }
  .capa img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .pagina {
    width: ${LARGURA_MM}mm;
    height: ${ALTURA_MM}mm;
    overflow: hidden;
    position: relative;
    background: #fff;
    break-after: page;
  }
  /* Sem isto o último break-after gera uma página em branco no fim. */
  body > *:last-child { break-after: auto; }

  .tpl-conteudo{ width: 100%; height: 100%; overflow: hidden; }

  .carimbo { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 10; }
  .carimbo > span {
    transform: rotate(-14deg);
    border: 0.9mm solid rgba(185, 28, 28, 0.5);
    color: rgba(185, 28, 28, 0.55);
    background: rgba(185, 28, 28, 0.06);
    font: 800 26px/1 Arial, Helvetica, sans-serif;
    letter-spacing: 3px;
    padding: 3mm 7mm;
    border-radius: 2mm;
  }

  .vazio { padding: 12mm; text-align: center; color: rgba(60, 63, 64, 0.5); font-size: 12px; }

  ${templatesCss()}
`;

export type UnidadeRevendaPdf = UnidadeRevendaTemplateData & {
  template: TemplateRevenda;
  reservada: boolean;
};

export type DadosPdfRevendas = {
  capaUrl: string | null;
  unidades: UnidadeRevendaPdf[];
};

export type ResultadoPdfRevendas = {
  bytes: Uint8Array;
  /** Unidades cujo conteúdo não coube na página e saiu cortado no PDF. */
  avisos: string[];
};

function paginaHtml(u: UnidadeRevendaPdf): string {
  const carimbo = u.reservada ? `<div class="carimbo"><span>RESERVADO</span></div>` : "";
  const identificador = [u.nome, u.numeroUnidade].filter(Boolean).join(" — ");
  return `<section class="pagina" data-unidade="${escapeAttr(identificador)}">${renderizarUnidade(u.template, u)}${carimbo}</section>`;
}

/**
 * Imagens com URL válida mas download quebrado ficariam com o ícone de imagem
 * quebrada impresso no PDF — remove o <img> em vez de imprimir o ícone.
 */
async function ocultarImagensQuebradas(page: import("puppeteer-core").Page): Promise<void> {
  await page.evaluate(() => {
    for (const img of Array.from(document.images)) {
      if (img.naturalWidth === 0) img.remove();
    }
  });
}

/**
 * Detecta (não conserta) unidades cujo conteúdo estourou a altura da página e saiu
 * cortado pelo overflow:hidden de `.pagina`. Roda no DOM já renderizado, numa única
 * chamada — não é um segundo passo de renderização.
 */
async function detectarUnidadesCortadas(page: import("puppeteer-core").Page): Promise<string[]> {
  return page.evaluate(() => {
    const cortadas: string[] = [];
    for (const pagina of Array.from(document.querySelectorAll<HTMLElement>(".pagina"))) {
      const conteudo = pagina.querySelector<HTMLElement>(".tpl-conteudo");
      if (conteudo && conteudo.scrollHeight > pagina.clientHeight + 1) {
        cortadas.push(pagina.dataset.unidade ?? "?");
      }
    }
    return cortadas;
  });
}

export async function gerarRevendasPdf(dados: DadosPdfRevendas): Promise<ResultadoPdfRevendas> {
  const browser = await abrirNavegador();

  try {
    const page = await browser.newPage();

    const capaHtml = dados.capaUrl
      ? `<div class="capa"><img src="${escapeAttr(dados.capaUrl)}" alt="" /></div>`
      : "";

    const paginas =
      dados.unidades.length > 0
        ? dados.unidades.map(paginaHtml).join("")
        : `<section class="pagina"><p class="vazio">Nenhuma unidade de revenda disponível no momento.</p></section>`;

    const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>${ESTILOS}</style></head>
<body>${capaHtml}${paginas}</body></html>`;

    await page.setContent(html, { waitUntil: "load" });
    await esperarImagens(page);
    await ocultarImagensQuebradas(page);
    const avisos = await detectarUnidadesCortadas(page);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: `${MARGEM_MM}mm`,
        right: `${MARGEM_MM}mm`,
        bottom: `${MARGEM_MM}mm`,
        left: `${MARGEM_MM}mm`,
      },
    });

    const documento = await PDFDocument.load(pdf);
    await carimbarRodapePaginas(documento, new Date());

    return { bytes: await documento.save(), avisos };
  } finally {
    await browser.close();
  }
}
