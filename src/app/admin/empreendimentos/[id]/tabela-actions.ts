"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { supabaseAdmin, EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-admin";
import { montarLinhasTabelaUnidades } from "@/lib/tabela-unidades";
import { gerarTabelaPdfCompleta } from "@/lib/pdf/gerar-tabela-pdf";

export type SalvarTabelaConteudoState =
  | { success: true }
  | { success: false; message: string }
  | undefined;

export async function atualizarTabelaConteudo(
  empreendimentoId: string,
  _prevState: SalvarTabelaConteudoState,
  formData: FormData
): Promise<SalvarTabelaConteudoState> {
  await requireAdmin();

  const cabecalhoHtml = String(formData.get("cabecalhoHtml") ?? "");
  const descricaoHtml = String(formData.get("descricaoHtml") ?? "");
  const rodapeHtml = String(formData.get("rodapeHtml") ?? "");

  await prisma.empreendimento.update({
    where: { id: empreendimentoId },
    data: {
      tabelaCabecalhoHtml: cabecalhoHtml || null,
      tabelaDescricaoHtml: descricaoHtml || null,
      tabelaRodapeHtml: rodapeHtml || null,
    },
  });

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  revalidatePath(`/corretores/empreendimentos/${empreendimentoId}`);

  return { success: true };
}

const TIPOS_IMAGEM_PERMITIDOS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024; // 5MB

export type EnviarImagemTabelaResult =
  | { success: true; url: string }
  | { success: false; message: string };

/**
 * Upload de imagem inserida dentro do editor de texto rico (Cabeçalho/Descrição/
 * Rodapé). Chamada diretamente pelo componente cliente, fora de um <form> — o
 * resultado só volta a URL pública, que o editor insere no HTML localmente.
 */
export async function enviarImagemTabela(
  empreendimentoId: string,
  formData: FormData
): Promise<EnviarImagemTabelaResult> {
  await requireAdmin();

  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { success: false, message: "Selecione uma imagem." };
  }

  const extensao = TIPOS_IMAGEM_PERMITIDOS[arquivo.type];
  if (!extensao) {
    return { success: false, message: "Formato inválido. Use PNG, JPEG ou WebP." };
  }

  if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
    return { success: false, message: "Imagem muito grande (máximo 5MB)." };
  }

  const caminho = `${empreendimentoId}/tabela-conteudo-${Date.now()}.${extensao}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .upload(caminho, arquivo, { contentType: arquivo.type, upsert: false });

  if (uploadError) {
    return { success: false, message: `Falha ao enviar a imagem: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).getPublicUrl(caminho);

  return { success: true, url: publicUrl };
}

export type EnviarDocumentoAdicionalState =
  | { success: true }
  | { success: false; message: string }
  | undefined;

const TAMANHO_MAXIMO_PDF = 15 * 1024 * 1024; // 15MB

export async function enviarDocumentoAdicional(
  empreendimentoId: string,
  _prevState: EnviarDocumentoAdicionalState,
  formData: FormData
): Promise<EnviarDocumentoAdicionalState> {
  await requireAdmin();

  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { success: false, message: "Selecione um arquivo PDF." };
  }

  if (arquivo.type !== "application/pdf") {
    return { success: false, message: "Formato inválido. Envie um arquivo PDF." };
  }

  if (arquivo.size > TAMANHO_MAXIMO_PDF) {
    return { success: false, message: "Arquivo muito grande (máximo 15MB)." };
  }

  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!titulo) {
    return { success: false, message: "Informe um título para o documento." };
  }

  const caminho = `${empreendimentoId}/documento-${Date.now()}.pdf`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .upload(caminho, arquivo, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return { success: false, message: `Falha ao enviar o arquivo: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).getPublicUrl(caminho);

  const ultimo = await prisma.documentoAdicional.findFirst({
    where: { empreendimentoId },
    orderBy: { ordem: "desc" },
  });

  await prisma.documentoAdicional.create({
    data: {
      empreendimentoId,
      titulo,
      url: publicUrl,
      ordem: (ultimo?.ordem ?? -1) + 1,
    },
  });

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  revalidatePath(`/corretores/empreendimentos/${empreendimentoId}`);

  return { success: true };
}

export type GerarTabelaPdfState =
  | { success: true; url: string; geradoEm: string }
  | { success: false; message: string }
  | undefined;

export async function gerarTabelaPdfAdmin(
  empreendimentoId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept to match useActionState's action signature
  _prevState: GerarTabelaPdfState
): Promise<GerarTabelaPdfState> {
  await requireAdmin();

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id: empreendimentoId },
    include: {
      unidades: { orderBy: [{ andar: "asc" }, { identificador: "asc" }] },
      documentosAdicionais: { orderBy: { ordem: "asc" } },
    },
  });

  if (!empreendimento) {
    return { success: false, message: "Empreendimento não encontrado." };
  }

  const linhas = montarLinhasTabelaUnidades(empreendimento, empreendimento.unidades);
  const podeCalcularPlano =
    empreendimento.parcelas !== null &&
    empreendimento.entradaPercentual !== null &&
    empreendimento.entregaChavesPercentual !== null;
  const prestacoesLabel = podeCalcularPlano ? `${empreendimento.parcelas}x` : "Prestações";

  let pdf: Uint8Array;
  try {
    pdf = await gerarTabelaPdfCompleta(
      {
        cabecalhoHtml: empreendimento.tabelaCabecalhoHtml ?? "",
        descricaoHtml: empreendimento.tabelaDescricaoHtml ?? "",
        rodapeHtml: empreendimento.tabelaRodapeHtml ?? "",
        capaUrl: empreendimento.capaTabelaUrl,
        prestacoesLabel,
        linhas,
      },
      empreendimento.documentosAdicionais.map((d) => ({ titulo: d.titulo, url: d.url }))
    );
  } catch (erro) {
    console.error("Falha ao gerar PDF da tabela:", erro);
    return { success: false, message: "Falha ao gerar o PDF. Tente novamente." };
  }

  const caminho = `${empreendimentoId}/tabela-gerada-${Date.now()}.pdf`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .upload(caminho, pdf, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return { success: false, message: `Falha ao salvar o PDF: ${uploadError.message}` };
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

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  revalidatePath(`/corretores/empreendimentos/${empreendimentoId}`);

  return { success: true, url: publicUrl, geradoEm: geradoEm.toISOString() };
}

export async function excluirDocumentoAdicional(empreendimentoId: string, documentoId: string) {
  await requireAdmin();

  const documento = await prisma.documentoAdicional.findUnique({ where: { id: documentoId } });
  if (!documento || documento.empreendimentoId !== empreendimentoId) return;

  const prefixo = `/storage/v1/object/public/${EMPREENDIMENTOS_BUCKET}/`;
  const idx = documento.url.indexOf(prefixo);
  if (idx !== -1) {
    const caminho = documento.url.slice(idx + prefixo.length);
    await supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).remove([caminho]);
  }

  await prisma.documentoAdicional.delete({ where: { id: documentoId } });

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  revalidatePath(`/corretores/empreendimentos/${empreendimentoId}`);
}
