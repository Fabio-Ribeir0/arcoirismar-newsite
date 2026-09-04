import "server-only";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin, EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-admin";
import { montarLinhasTabelaUnidades } from "@/lib/tabela-unidades";
import { gerarTabelaPdfCompleta } from "@/lib/pdf/gerar-tabela-pdf";
import { PERIODICIDADE_LABEL, PERIODICIDADES_ATO } from "@/lib/plano-pagamento";

/**
 * Lógica de geração da tabela de unidades em PDF de um empreendimento, sem `requireAdmin()`
 * nem `revalidatePath()` — usada tanto pela Server Action (`tabela-actions.ts`) quanto pela
 * rota da API de agente.
 */

export type ResultadoTabelaEmpreendimento =
  | { sucesso: true; url: string; geradoEm: string }
  | { sucesso: false; mensagem: string };

export async function gerarTabelaEmpreendimentoCore(empreendimentoId: string): Promise<ResultadoTabelaEmpreendimento> {
  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id: empreendimentoId },
    include: {
      unidades: { orderBy: [{ andar: "asc" }, { identificador: "asc" }] },
      documentosAdicionais: { orderBy: { ordem: "asc" } },
      condicoesPagamento: { orderBy: { ordem: "asc" } },
    },
  });

  if (!empreendimento) {
    return { sucesso: false, mensagem: "Empreendimento não encontrado." };
  }

  const condicoesPagamento = empreendimento.condicoesPagamento.map((c) => ({
    id: c.id,
    rotulo: c.rotulo,
    periodicidade: c.periodicidade,
    quantidade: c.quantidade,
    valor: c.valor === null ? null : Number(c.valor),
    tipoValor: c.tipoValor,
    restante: c.restante,
  }));
  const linhas = montarLinhasTabelaUnidades(condicoesPagamento, empreendimento.unidades);
  const condicoesColunas = condicoesPagamento.map((c) => ({
    titulo: c.rotulo ?? PERIODICIDADE_LABEL[c.periodicidade],
    quantidade: PERIODICIDADES_ATO.includes(c.periodicidade) ? null : `${c.quantidade}x`,
  }));

  let pdf: Uint8Array;
  try {
    pdf = await gerarTabelaPdfCompleta(
      {
        cabecalhoHtml: empreendimento.tabelaCabecalhoHtml ?? "",
        descricaoHtml: empreendimento.tabelaDescricaoHtml ?? "",
        rodapeHtml: empreendimento.tabelaRodapeHtml ?? "",
        capaUrl: empreendimento.capaTabelaUrl,
        condicoesColunas,
        linhas,
      },
      empreendimento.documentosAdicionais.map((d) => ({ titulo: d.titulo, url: d.url }))
    );
  } catch (erro) {
    console.error("Falha ao gerar PDF da tabela:", erro);
    return { sucesso: false, mensagem: "Falha ao gerar o PDF. Tente novamente." };
  }

  const caminho = `${empreendimentoId}/tabela-gerada-${Date.now()}.pdf`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .upload(caminho, pdf, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return { sucesso: false, mensagem: `Falha ao salvar o PDF: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).getPublicUrl(caminho);

  // Best-effort: remove a versão anterior do PDF gerado, se houver.
  if (empreendimento.tabelaPdfUrl) {
    const prefixo = `/storage/v1/object/public/${EMPREENDIMENTOS_BUCKET}/`;
    const idx = empreendimento.tabelaPdfUrl.indexOf(prefixo);
    if (idx !== -1) {
      const caminhoAntigo = empreendimento.tabelaPdfUrl.slice(idx + prefixo.length);
      await supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).remove([caminhoAntigo]);
    }
  }

  const geradoEm = new Date();

  await prisma.empreendimento.update({
    where: { id: empreendimentoId },
    data: { tabelaPdfUrl: publicUrl, tabelaPdfGeradoEm: geradoEm },
  });

  return { sucesso: true, url: publicUrl, geradoEm: geradoEm.toISOString() };
}
