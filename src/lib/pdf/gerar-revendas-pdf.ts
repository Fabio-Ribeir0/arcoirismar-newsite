import "server-only";
import { PDFDocument } from "pdf-lib";
import { abrirNavegador } from "./browser";
import { escapeAttr, esperarImagens, carimbarRodapePaginas } from "./comum";

// A4 retrato com 1cm em TODAS as margens — de propósito diferente do gerador da
// tabela de unidades (que usa 5mm nas laterais). As constantes ficam locais a
// este arquivo: compartilhá-las faria com que mexer num layout refluísse o outro.
const MARGEM_MM = 10;
const LARGURA_MM = 210 - MARGEM_MM * 2; // 190
// Colchão anti-arredondamento: 277mm = 1046.9px a 96dpi, e uma fração de pixel
// arredondada pra cima joga uma tira em branco na página seguinte.
const ALTURA_MM = 297 - MARGEM_MM * 2 - 0.5; // 276.5

// Alturas fixas das faixas (mm). O bloco "Sobre" é a única track `1fr`: ele
// absorve toda a sobra, então a soma das tracks fecha a altura da página
// qualquer que seja a combinação de faixas presentes. É essa invariante que
// garante "uma unidade = exatamente uma página".
const H_FAIXA_FOTOS = 64;
const H_FAIXA_SO_CABECALHO = 22;
const H_TRIO = 50;
const H_DUO = 58;
const H_RODAPE = 18;
const GAP_MM = 3;

const ESTILOS = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #3c3f40; }

  .capa { width: ${LARGURA_MM}mm; height: ${ALTURA_MM}mm; break-after: page; }
  .capa img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .pagina {
    width: ${LARGURA_MM}mm;
    height: ${ALTURA_MM}mm;
    display: grid;
    gap: ${GAP_MM}mm;
    overflow: hidden;
    break-after: page;
  }
  /* Sem isto o último break-after gera uma página em branco no fim. */
  body > *:last-child { break-after: auto; }

  /* A regra mais importante do arquivo: itens de grid têm min-height:auto por
     padrão, então um bloco com texto demais empurraria a própria track e
     estouraria a página. */
  .pagina > * { min-height: 0; min-width: 0; overflow: hidden; }

  .faixa { position: relative; display: grid; gap: ${GAP_MM}mm; }
  .faixa-dupla { grid-template-columns: 6fr 4fr; }
  .faixa-unica { grid-template-columns: 1fr; }

  /* O cabeçalho fica fora do fluxo, sobreposto às fotos 1 e 2 — por construção
     ele é incapaz de alterar a altura da página. O véu quase opaco é o que
     mantém o texto legível sobre uma foto qualquer (céu claro, interior escuro). */
  .cabecalho-sobreposto {
    position: absolute;
    top: 0; left: 0; right: 0;
    max-height: 62%;
    overflow: hidden;
    background: linear-gradient(to bottom, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.90) 70%, rgba(255,255,255,0.74) 100%);
    border-radius: 1.5mm 1.5mm 0 0;
  }
  .cabecalho-simples { background: #f4f2ee; border-radius: 1.5mm; overflow: hidden; }

  .trio { display: grid; gap: ${GAP_MM}mm; }

  .duo { display: grid; grid-template-columns: 6fr 4fr; gap: ${GAP_MM}mm; }
  .painel { position: relative; overflow: hidden; border: 0.3mm solid #e4e0d8; border-radius: 1.5mm; }

  /* object-fit:cover numa caixa de tamanho fixo: as dimensões da imagem de
     origem nunca influenciam o layout. */
  .foto { overflow: hidden; border-radius: 1.5mm; background: #ece9e3; }
  .foto img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .caixa { overflow: hidden; }
  .bloco-rico { padding: 3mm; font-size: 11px; line-height: 1.45; }
  .bloco-rico > :first-child { margin-top: 0; }
  .bloco-rico > :last-child { margin-bottom: 0; }
  .bloco-rico img { max-width: 100%; max-height: 25mm; height: auto; object-fit: contain; }
  .bloco-rico ul { margin: 0; padding-left: 18px; }
  .bloco-rico ol { margin: 0; padding-left: 18px; }
  .bloco-rico a { color: #c2a558; text-decoration: underline; }
  .bloco-rico blockquote { margin: 0; padding-left: 8px; border-left: 2px solid #c2a558; font-style: italic; color: rgba(60, 63, 64, 0.7); }
  .bloco-rico hr { border: none; border-top: 1px solid #e4e0d8; margin: 2mm 0; }

  .carimbo { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
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
`;

export type UnidadeRevendaPdf = {
  nome: string;
  reservada: boolean;
  cabecalhoHtml: string;
  sobreHtml: string;
  financeiroHtml: string;
  infoAdicionaisHtml: string;
  rodapeHtml: string;
  /** Exatamente 5 posições — a ordem importa, `null` para slot vazio. */
  fotos: (string | null)[];
};

export type DadosPdfRevendas = {
  capaUrl: string | null;
  unidades: UnidadeRevendaPdf[];
};

export type ResultadoPdfRevendas = {
  bytes: Uint8Array;
  /** Blocos cujo conteúdo não coube na caixa e saiu cortado no PDF. */
  avisos: string[];
};

/** Rich text "vazio" pode vir como "<p><br></p>" — checa se sobra conteúdo de fato. */
function temConteudo(html: string | null | undefined): boolean {
  if (!html) return false;
  if (/<img\b/i.test(html)) return true;
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim().length > 0;
}

function fotoHtml(url: string | null): string {
  return url
    ? `<div class="foto"><img src="${escapeAttr(url)}" alt="" /></div>`
    : `<div class="foto"></div>`;
}

function caixaHtml(unidade: string, bloco: string, html: string, classe = ""): string {
  return `<div class="caixa ${classe}" data-unidade="${escapeAttr(unidade)}" data-bloco="${escapeAttr(bloco)}"><div class="bloco-rico">${html}</div></div>`;
}

function paginaHtml(u: UnidadeRevendaPdf): string {
  const [f1, f2, f3, f4, f5] = u.fotos;
  const fotosTopo = [f1, f2].filter(Boolean) as string[];
  const fotosTrio = [f3, f4, f5].filter(Boolean) as string[];
  const temCabecalho = temConteudo(u.cabecalhoHtml);

  // Constrói tracks e blocos em lockstep: só entra na grade a faixa que existe,
  // e o `gap` só se aplica entre faixas presentes.
  const tracks: string[] = [];
  const blocos: string[] = [];

  if (fotosTopo.length > 0) {
    tracks.push(`${H_FAIXA_FOTOS}mm`);
    const colunas = fotosTopo.length === 2 ? "faixa-dupla" : "faixa-unica";
    const celulas = fotosTopo.map((url) => fotoHtml(url)).join("");
    blocos.push(
      `<div class="faixa ${colunas}">${celulas}${
        temCabecalho ? caixaHtml(u.nome, "Cabeçalho", u.cabecalhoHtml, "cabecalho-sobreposto") : ""
      }</div>`
    );
  } else if (temCabecalho) {
    // Sem fotos no topo o cabeçalho não pode sumir — vira faixa normal, menor.
    tracks.push(`${H_FAIXA_SO_CABECALHO}mm`);
    blocos.push(caixaHtml(u.nome, "Cabeçalho", u.cabecalhoHtml, "cabecalho-simples"));
  }

  if (fotosTrio.length > 0) {
    tracks.push(`${H_TRIO}mm`);
    blocos.push(
      `<div class="trio" style="grid-template-columns:repeat(${fotosTrio.length},1fr)">${fotosTrio
        .map((url) => fotoHtml(url))
        .join("")}</div>`
    );
  }

  // "Sobre" é sempre emitido e é a única track 1fr — é ele que absorve a sobra.
  tracks.push("1fr");
  blocos.push(caixaHtml(u.nome, "Sobre", u.sobreHtml));

  tracks.push(`${H_DUO}mm`);
  const carimbo = u.reservada ? `<div class="carimbo"><span>RESERVADO</span></div>` : "";
  blocos.push(
    `<div class="duo">` +
      `<div class="painel">${caixaHtml(u.nome, "Financeiro", u.financeiroHtml)}${carimbo}</div>` +
      `<div class="painel">${caixaHtml(u.nome, "Informações adicionais", u.infoAdicionaisHtml)}</div>` +
      `</div>`
  );

  if (temConteudo(u.rodapeHtml)) {
    tracks.push(`${H_RODAPE}mm`);
    blocos.push(caixaHtml(u.nome, "Rodapé", u.rodapeHtml));
  }

  return `<section class="pagina" style="grid-template-rows:${tracks.join(" ")}">${blocos.join("")}</section>`;
}

/**
 * Fotos com URL válida mas download quebrado ficariam com o ícone de imagem
 * quebrada impresso no PDF — remove o <img> e deixa só o fundo neutro da célula.
 */
async function ocultarImagensQuebradas(page: import("puppeteer-core").Page): Promise<void> {
  await page.evaluate(() => {
    for (const img of Array.from(document.images)) {
      if (img.naturalWidth === 0) img.remove();
    }
  });
}

/**
 * Detecta (não conserta) blocos cujo conteúdo estourou a caixa de altura fixa e
 * saiu cortado pelo overflow:hidden. Roda no DOM já renderizado, numa única
 * chamada — não é um segundo passo de renderização.
 */
async function detectarBlocosCortados(page: import("puppeteer-core").Page): Promise<string[]> {
  return page.evaluate(() => {
    const cortados: string[] = [];
    for (const caixa of Array.from(document.querySelectorAll<HTMLElement>(".caixa"))) {
      if (caixa.scrollHeight > caixa.clientHeight + 1) {
        cortados.push(`${caixa.dataset.unidade ?? "?"} — ${caixa.dataset.bloco ?? "?"}`);
      }
    }
    return cortados;
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
        : `<section class="pagina" style="grid-template-rows:1fr"><p class="vazio">Nenhuma unidade de revenda disponível no momento.</p></section>`;

    const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>${ESTILOS}</style></head>
<body>${capaHtml}${paginas}</body></html>`;

    // Sem passo de medição: ao contrário da tabela de unidades (que precisa
    // descobrir quantas linhas cabem por página), aqui a estrutura é fixa e a
    // contagem de páginas é conhecida antes de renderizar.
    await page.setContent(html, { waitUntil: "load" });
    await esperarImagens(page);
    await ocultarImagensQuebradas(page);
    const avisos = await detectarBlocosCortados(page);

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
