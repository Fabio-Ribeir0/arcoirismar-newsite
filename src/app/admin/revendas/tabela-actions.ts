"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { supabaseAdmin, EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-admin";
import { gerarRevendasPdf } from "@/lib/pdf/gerar-revendas-pdf";
import { linhas } from "@/lib/pdf/templates-revenda/helpers";

const ID_CONFIG = "configuracao-revenda";

export type SalvarLinkMidiaState =
  | { success: true }
  | { success: false; message: string }
  | undefined;

export async function salvarLinkMidiaRevenda(
  _prevState: SalvarLinkMidiaState,
  formData: FormData
): Promise<SalvarLinkMidiaState> {
  await requireAdmin();

  const link = String(formData.get("linkMidiaPublica") ?? "").trim() || null;

  await prisma.configuracaoRevenda.upsert({
    where: { id: ID_CONFIG },
    update: { linkMidiaPublica: link },
    create: { id: ID_CONFIG, linkMidiaPublica: link },
  });

  revalidatePath("/admin/revendas");
  revalidatePath("/corretores/empreendimentos");

  return { success: true };
}

export type GerarTabelaRevendasState =
  | { success: true; url: string; geradoEm: string; avisos: string[] }
  | { success: false; message: string }
  | undefined;

export async function gerarTabelaRevendas(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- mantido pra casar com a assinatura do useActionState
  _prevState: GerarTabelaRevendasState
): Promise<GerarTabelaRevendasState> {
  await requireAdmin();

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
        corretorNome: u.corretorNome,
        corretorTelefone: u.corretorTelefone,
        corretorEmail: u.corretorEmail,
        fotos: u.fotos.map((f) => ({ url: f.url, legenda: f.legenda })),
        template: u.template,
        reservada: u.status === "RESERVADA",
      })),
    });
    pdf = resultado.bytes;
    avisos = resultado.avisos;
  } catch (erro) {
    console.error("Falha ao gerar PDF de revendas:", erro);
    return { success: false, message: "Falha ao gerar o PDF. Tente novamente." };
  }

  const caminho = `revendas/tabela/tabela-gerada-${Date.now()}.pdf`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .upload(caminho, pdf, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return { success: false, message: `Falha ao salvar o PDF: ${uploadError.message}` };
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

  revalidatePath("/admin/revendas");
  revalidatePath("/corretores/empreendimentos");

  return { success: true, url: publicUrl, geradoEm: geradoEm.toISOString(), avisos };
}
