import "server-only";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin, EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-admin";
import { gerarRevendasPdf } from "@/lib/pdf/gerar-revendas-pdf";
import { linhas } from "@/lib/pdf/templates-revenda/helpers";

/**
 * Lógica de geração da tabela de revendas em PDF, sem `requireAdmin()` nem
 * `revalidatePath()` — usada tanto pela Server Action (`tabela-actions.ts`) quanto pela
 * rota da API de agente.
 */

const ID_CONFIG = "configuracao-revenda";

export type ResultadoTabelaRevendas =
  | { sucesso: true; url: string; geradoEm: string; avisos: string[] }
  | { sucesso: false; mensagem: string };

export async function gerarTabelaRevendasCore(): Promise<ResultadoTabelaRevendas> {
  // Vendidas ficam fora da tabela, mas continuam no cadastro.
  const unidades = await prisma.unidadeRevenda.findMany({
    where: { status: { in: ["DISPONIVEL", "RESERVADA"] } },
    orderBy: [{ ordem: "asc" }, { createdAt: "asc" }],
    include: { fotos: { orderBy: { ordem: "asc" } } },
  });

  const config = await prisma.configuracaoRevenda.findUnique({ where: { id: ID_CONFIG } });

  let pdf: Uint8Array;
  let avisos: string[];
  try {
    const resultado = await gerarRevendasPdf({
      capaUrl: config?.capaTabelaUrl ?? null,
      unidades: unidades.map((u) => ({
        nome: u.nome,
        numeroUnidade: u.numeroUnidade,
        torre: u.torre,
        tagline: u.tagline,
        bairro: u.bairro,
        cidade: u.cidade,
        estado: u.estado,
        endereco: u.endereco,
        numeroEndereco: u.numeroEndereco,
        localizacaoNota: u.localizacaoNota,
        valor: Number(u.valor),
        areaPrivativa: u.areaPrivativa === null ? null : Number(u.areaPrivativa),
        dormitorios: u.dormitorios,
        suites: u.suites,
        vagas: u.vagas,
        andar: u.andar,
        elevadores: u.elevadores,
        entregaPrevista: u.entregaPrevista,
        diferencial: u.diferencial,
        descricao: u.descricao,
        amenidades: linhas(u.amenidades),
        condicoesPagamento: linhas(u.condicoesPagamento),
        informacoes: u.informacoes,
        fotos: u.fotos.map((f) => ({ url: f.url, legenda: f.legenda })),
        template: u.template,
        reservada: u.status === "RESERVADA",
      })),
    });
    pdf = resultado.bytes;
    avisos = resultado.avisos;
  } catch (erro) {
    console.error("Falha ao gerar PDF de revendas:", erro);
    return { sucesso: false, mensagem: "Falha ao gerar o PDF. Tente novamente." };
  }

  const caminho = `revendas/tabela/tabela-gerada-${Date.now()}.pdf`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .upload(caminho, pdf, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return { sucesso: false, mensagem: `Falha ao salvar o PDF: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).getPublicUrl(caminho);

  // Best-effort: remove a versão anterior do PDF gerado.
  if (config?.tabelaPdfUrl) {
    const marcador = `/storage/v1/object/public/${EMPREENDIMENTOS_BUCKET}/`;
    const idx = config.tabelaPdfUrl.indexOf(marcador);
    if (idx !== -1) {
      await supabaseAdmin.storage
        .from(EMPREENDIMENTOS_BUCKET)
        .remove([config.tabelaPdfUrl.slice(idx + marcador.length)]);
    }
  }

  const geradoEm = new Date();

  await prisma.configuracaoRevenda.upsert({
    where: { id: ID_CONFIG },
    update: { tabelaPdfUrl: publicUrl, tabelaPdfGeradoEm: geradoEm },
    create: { id: ID_CONFIG, tabelaPdfUrl: publicUrl, tabelaPdfGeradoEm: geradoEm },
  });

  return { sucesso: true, url: publicUrl, geradoEm: geradoEm.toISOString(), avisos };
}
