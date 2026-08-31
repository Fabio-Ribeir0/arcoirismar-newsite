import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Helpers compartilhados pelos geradores de PDF (tabela de unidades dos
 * empreendimentos e tabela de revendas). Ficam aqui porque o carimbo de
 * página/data precisa ser idêntico nos dois documentos — duplicar garantiria
 * divergência com o tempo.
 *
 * O que NÃO fica aqui, de propósito: as constantes de margem. Os dois PDFs
 * usam margens diferentes (5mm nas laterais no dos empreendimentos, 10mm em
 * todas no de revendas) e compartilhá-las criaria uma armadilha em que mexer
 * num layout reflui o outro silenciosamente.
 */

export function escapeHtml(valor: string): string {
  return valor
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Como escapeHtml, mas também cobre a aspa simples — para interpolar em atributos. */
export function escapeAttr(valor: string): string {
  return escapeHtml(valor).replaceAll("'", "&#39;");
}

/**
 * page.setContent() não aceita "networkidle" (só setContent — goto aceita) —
 * as imagens (URLs do Storage) carregam de forma assíncrona, então espera
 * explicitamente cada <img> terminar antes de medir alturas ou gerar o PDF.
 *
 * Atenção: percorre `document.images`, que só enxerga elementos <img>. Foto
 * aplicada como `background-image` no CSS não é esperada aqui e sai em branco
 * no PDF — por isso os geradores renderizam fotos como <img> de verdade.
 */
export async function esperarImagens(page: import("puppeteer-core").Page): Promise<void> {
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

/** "dd/mm/aaaa | hh:mm", sempre no horário de Brasília independente do fuso do servidor. */
export function formatarDataHoraBR(data: Date): string {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(data);
  const obter = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  return `${obter("day")}/${obter("month")}/${obter("year")} | ${obter("hour")}:${obter("minute")}`;
}

/**
 * "Pág. n/t" (canto esquerdo) e a data/hora de geração (canto direito) em toda
 * página do documento final — inclusive capa e documentos adicionais mesclados,
 * já que "t" só fica correto depois que tudo foi mesclado.
 */
export async function carimbarRodapePaginas(
  documento: PDFDocument,
  geradoEm: Date
): Promise<void> {
  const fonte = await documento.embedFont(StandardFonts.Helvetica);
  const paginas = documento.getPages();
  const total = paginas.length;
  const dataHoraTexto = `Data de atualização: ${formatarDataHoraBR(geradoEm)}`;
  const tamanhoFonte = 7;
  const cor = rgb(0.5, 0.5, 0.5);
  const y = 10;

  paginas.forEach((pagina, indice) => {
    const { width } = pagina.getSize();

    pagina.drawText(`Pág. ${indice + 1}/${total}`, {
      x: 12,
      y,
      size: tamanhoFonte,
      font: fonte,
      color: cor,
    });

    const larguraData = fonte.widthOfTextAtSize(dataHoraTexto, tamanhoFonte);
    pagina.drawText(dataHoraTexto, {
      x: width - 12 - larguraData,
      y,
      size: tamanhoFonte,
      font: fonte,
      color: cor,
    });
  });
}
