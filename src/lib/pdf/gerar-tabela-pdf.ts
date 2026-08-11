import "server-only";
import { PDFDocument } from "pdf-lib";
import { abrirNavegador } from "./browser";
import { UNIDADE_STATUS_CORES, UNIDADE_STATUS_LABEL, type LinhaTabelaUnidade } from "../tabela-unidades";

// A4 (210x297mm) menos 1cm de margem no topo/rodapé e 0,5cm nas laterais.
const MARGEM_VERTICAL_MM = 10;
const MARGEM_LATERAL_MM = 5;
const LARGURA_MM = 210 - MARGEM_LATERAL_MM * 2;
const ALTURA_MM = 297 - MARGEM_VERTICAL_MM * 2;
const MM_POR_PX = 25.4 / 96;
const MARGEM_SEGURANCA_MM = 2;

function escapeHtml(valor: string): string {
  return valor
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ESTILOS = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #3c3f40; }
  .capa { width: ${LARGURA_MM}mm; height: ${ALTURA_MM}mm; break-after: page; }
  .capa img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .pagina { width: ${LARGURA_MM}mm; height: ${ALTURA_MM}mm; display: flex; flex-direction: column; break-after: page; overflow: hidden; }
  .pagina:last-child { break-after: auto; }
  .bloco-rico { padding: 3mm 0; font-size: 12px; line-height: 1.5; }
  .bloco-rico:empty { padding: 0; }
  .bloco-rico img { max-width: 100%; }
  .bloco-rico ul { margin: 0; padding-left: 18px; }
  .bloco-rico ol { margin: 0; padding-left: 18px; }
  .bloco-rico a { color: #c2a558; text-decoration: underline; }
  .bloco-rico blockquote { margin: 0; padding-left: 8px; border-left: 2px solid #c2a558; font-style: italic; color: rgba(60, 63, 64, 0.7); }
  .bloco-rico hr { border: none; border-top: 1px solid #e4e0d8; margin: 2mm 0; }
  .tabela-area { flex: 1 1 auto; overflow: hidden; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #e4e0d8; }
  thead { background: #f4f2ee; color: rgba(60, 63, 64, 0.6); }
  th, td { padding: 5px 7px; text-align: left; vertical-align: middle; }
  th { font-weight: 600; }
  th.sub { font-size: 9px; font-weight: 400; color: rgba(60, 63, 64, 0.5); }
  .bl { border-left: 1px solid #e4e0d8; }
  tbody tr, thead tr:last-child { border-top: 1px solid #e4e0d8; }
  thead tr:first-child { border-top: none; }
  .apto { font-weight: 600; }
  .badge { display: inline-block; border-radius: 9999px; padding: 1px 8px; font-size: 9px; font-weight: 600; }
  .vazio { padding: 12mm; text-align: center; color: rgba(60, 63, 64, 0.5); }
`;

function theadHtml(prestacoesLabel: string, idExtra = "") {
  return `
    <thead${idExtra}>
      <tr>
        <th rowspan="2">Apto</th>
        <th class="bl" rowspan="2">Área Priv.</th>
        <th class="bl" colspan="2" style="text-align:center;">Garagem</th>
        <th class="bl" rowspan="2">Área Total</th>
        <th class="bl" rowspan="2">Preço</th>
        <th class="bl" rowspan="2">Entrada</th>
        <th class="bl" rowspan="2">Entrega</th>
        <th class="bl" rowspan="2">${escapeHtml(prestacoesLabel)}</th>
      </tr>
      <tr>
        <th class="bl sub">Vagas</th>
        <th class="bl sub">Área (m²)</th>
      </tr>
    </thead>`;
}

function valorOuBadge(linha: LinhaTabelaUnidade, valor: number | null): string {
  if (linha.oculto) {
    const cores = UNIDADE_STATUS_CORES[linha.status] ?? { fundo: "#eee", texto: "#333" };
    const label = UNIDADE_STATUS_LABEL[linha.status] ?? linha.status;
    return `<span class="badge" style="background:${cores.fundo};color:${cores.texto};">${escapeHtml(label)}</span>`;
  }
  return valor === null ? "—" : escapeHtml(formatCurrency(valor));
}

function linhaHtml(linha: LinhaTabelaUnidade): string {
  return `
    <tr>
      <td class="apto">${escapeHtml(linha.identificador)}</td>
      <td class="bl">${linha.areaPrivativa} m²</td>
      <td class="bl">${linha.vagas}</td>
      <td class="bl">${linha.areaGaragem} m²</td>
      <td class="bl">${linha.areaTotal} m²</td>
      <td class="bl">${escapeHtml(formatCurrency(linha.preco))}</td>
      <td class="bl">${valorOuBadge(linha, linha.valorEntrada)}</td>
      <td class="bl">${valorOuBadge(linha, linha.valorChaves)}</td>
      <td class="bl">${valorOuBadge(linha, linha.valorParcela)}</td>
    </tr>`;
}

export type DadosPdfTabela = {
  cabecalhoHtml: string;
  descricaoHtml: string;
  rodapeHtml: string;
  capaUrl: string | null;
  prestacoesLabel: string;
  linhas: LinhaTabelaUnidade[];
};

/**
 * page.setContent() não aceita "networkidle" (só setContent — goto aceita) —
 * as imagens do cabeçalho/descrição/rodapé/capa (URLs do Storage) carregam
 * de forma assíncrona, então espera explicitamente cada <img> terminar antes
 * de medir alturas ou gerar o PDF.
 */
async function esperarImagens(page: import("puppeteer-core").Page): Promise<void> {
  await page.evaluate(async () => {
    const imagens = Array.from(document.images);
    await Promise.all(
      imagens.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
      )
    );
  });
}

async function gerarPdfCapaETabela(dados: DadosPdfTabela): Promise<Uint8Array> {
  const browser = await abrirNavegador();

  try {
    const page = await browser.newPage();

    // 1) Passo de medição: renderiza cabeçalho/descrição/rodapé/cabeçalho-da-
    // tabela reais (mesmo HTML que vai se repetir em cada página) pra saber
    // quanto espaço sobra pra área da tabela — as proporções são "aprox."
    // porque dependem do conteúdo real cadastrado pelo admin.
    const linhaAmostra = dados.linhas[0];
    const amostraHtml = linhaAmostra
      ? linhaHtml(linhaAmostra)
      : linhaHtml({
          id: "amostra",
          identificador: "000",
          areaPrivativa: 100,
          vagas: 2,
          areaGaragem: 20,
          areaTotal: 120,
          preco: 1000000,
          status: "DISPONIVEL",
          oculto: false,
          valorEntrada: 100000,
          valorChaves: 100000,
          valorParcela: 10000,
        });

    const htmlMedicao = `<!doctype html>
<html><head><meta charset="utf-8"><style>${ESTILOS}</style></head>
<body>
  <div style="width:${LARGURA_MM}mm; position:absolute; visibility:hidden;">
    <div id="m-cabecalho" class="bloco-rico">${dados.cabecalhoHtml}</div>
    <div id="m-descricao" class="bloco-rico">${dados.descricaoHtml}</div>
    <div id="m-rodape" class="bloco-rico">${dados.rodapeHtml}</div>
    <table>
      ${theadHtml(dados.prestacoesLabel, ' id="m-thead"')}
      <tbody>${amostraHtml}</tbody>
    </table>
  </div>
</body></html>`;

    await page.setContent(htmlMedicao, { waitUntil: "load" });
    await esperarImagens(page);

    const alturasPx = await page.evaluate(() => {
      const altura = (id: string) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().height : 0;
      };
      const thead = document.getElementById("m-thead");
      const linha = document.querySelector("#m-thead + tbody tr");
      return {
        cabecalho: altura("m-cabecalho"),
        descricao: altura("m-descricao"),
        rodape: altura("m-rodape"),
        thead: thead ? thead.getBoundingClientRect().height : 0,
        linha: linha ? linha.getBoundingClientRect().height : 0,
      };
    });

    const cabecalhoMm = alturasPx.cabecalho * MM_POR_PX;
    const descricaoMm = alturasPx.descricao * MM_POR_PX;
    const rodapeMm = alturasPx.rodape * MM_POR_PX;
    const theadMm = alturasPx.thead * MM_POR_PX;
    const linhaMm = Math.max(alturasPx.linha * MM_POR_PX, 1);

    const disponivelParaLinhasMm =
      ALTURA_MM - cabecalhoMm - descricaoMm - rodapeMm - theadMm - MARGEM_SEGURANCA_MM;
    const linhasPorPagina = Math.max(1, Math.floor(disponivelParaLinhasMm / linhaMm));

    // 2) Monta o HTML final: capa (opcional) + N páginas da tabela, repetindo
    // cabeçalho/descrição/rodapé em cada uma.
    const blocosPagina: string[] = [];

    if (dados.linhas.length === 0) {
      blocosPagina.push(`
        <section class="pagina">
          <div class="bloco-rico">${dados.cabecalhoHtml}</div>
          <div class="bloco-rico">${dados.descricaoHtml}</div>
          <div class="tabela-area"><p class="vazio">Nenhuma unidade disponível no momento.</p></div>
          <div class="bloco-rico">${dados.rodapeHtml}</div>
        </section>`);
    } else {
      for (let i = 0; i < dados.linhas.length; i += linhasPorPagina) {
        const chunk = dados.linhas.slice(i, i + linhasPorPagina);
        blocosPagina.push(`
          <section class="pagina">
            <div class="bloco-rico">${dados.cabecalhoHtml}</div>
            <div class="bloco-rico">${dados.descricaoHtml}</div>
            <div class="tabela-area">
              <table>
                ${theadHtml(dados.prestacoesLabel)}
                <tbody>${chunk.map(linhaHtml).join("")}</tbody>
              </table>
            </div>
            <div class="bloco-rico">${dados.rodapeHtml}</div>
          </section>`);
      }
    }

    const capaHtml = dados.capaUrl
      ? `<div class="capa"><img src="${dados.capaUrl.replaceAll('"', "&quot;")}" alt="" /></div>`
      : "";

    const htmlFinal = `<!doctype html>
<html><head><meta charset="utf-8"><style>${ESTILOS}</style></head>
<body>${capaHtml}${blocosPagina.join("")}</body></html>`;

    await page.setContent(htmlFinal, { waitUntil: "load" });
    await esperarImagens(page);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: `${MARGEM_VERTICAL_MM}mm`,
        right: `${MARGEM_LATERAL_MM}mm`,
        bottom: `${MARGEM_VERTICAL_MM}mm`,
        left: `${MARGEM_LATERAL_MM}mm`,
      },
    });

    return pdf;
  } finally {
    await browser.close();
  }
}

async function baixarBytes(url: string): Promise<Uint8Array | null> {
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) return null;
    return new Uint8Array(await resposta.arrayBuffer());
  } catch {
    return null;
  }
}

export async function gerarTabelaPdfCompleta(
  dados: DadosPdfTabela,
  documentosAdicionais: { titulo: string; url: string }[]
): Promise<Uint8Array> {
  const pdfPrincipal = await gerarPdfCapaETabela(dados);

  if (documentosAdicionais.length === 0) {
    return pdfPrincipal;
  }

  const documentoFinal = await PDFDocument.load(pdfPrincipal);

  for (const documento of documentosAdicionais) {
    const bytes = await baixarBytes(documento.url);
    if (!bytes) continue;

    try {
      const doador = await PDFDocument.load(bytes);
      const paginas = await documentoFinal.copyPages(doador, doador.getPageIndices());
      for (const pagina of paginas) {
        documentoFinal.addPage(pagina);
      }
    } catch {
      // PDF inválido/corrompido — pula esse documento em vez de derrubar a exportação inteira.
      continue;
    }
  }

  return documentoFinal.save();
}
