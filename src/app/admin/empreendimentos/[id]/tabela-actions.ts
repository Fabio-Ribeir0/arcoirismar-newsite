"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { supabaseAdmin, EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-admin";
import { montarLinhasTabelaUnidades } from "@/lib/tabela-unidades";
import { gerarTabelaPdfCompleta } from "@/lib/pdf/gerar-tabela-pdf";
import { PERIODICIDADE_LABEL, PERIODICIDADES_ATO } from "@/lib/plano-pagamento";

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

export type PrepararUploadImagemTabelaResult =
  | { success: true; path: string; token: string }
  | { success: false; message: string };

/**
 * Upload de imagem inserida dentro do editor de texto rico (Cabeçalho/Descrição/
 * Rodapé). Só gera a URL assinada — o upload em si vai direto do navegador pro
 * Supabase Storage, o arquivo nunca passa pela função serverless da Vercel.
 */
export async function prepararUploadImagemTabela(
  empreendimentoId: string,
  contentType: string,
  size: number
): Promise<PrepararUploadImagemTabelaResult> {
  await requireAdmin();

  const extensao = TIPOS_IMAGEM_PERMITIDOS[contentType];
  if (!extensao) {
    return { success: false, message: "Formato inválido. Use PNG, JPEG ou WebP." };
  }
  if (size <= 0 || size > TAMANHO_MAXIMO_IMAGEM) {
    return { success: false, message: "Imagem muito grande (máximo 5MB)." };
  }

  const caminho = `${empreendimentoId}/tabela-conteudo-${Date.now()}.${extensao}`;

  const { data, error } = await supabaseAdmin.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .createSignedUploadUrl(caminho);

  if (error || !data) {
    return { success: false, message: `Falha ao preparar o upload: ${error?.message}` };
  }

  return { success: true, path: data.path, token: data.token };
}

export type ConfirmarUploadImagemTabelaResult =
  | { success: true; url: string }
  | { success: false; message: string };

/**
 * Chamada pelo navegador depois que o PUT direto pro Storage terminou — o
 * resultado só volta a URL pública, que o editor insere no HTML localmente.
 */
export async function confirmarUploadImagemTabela(
  empreendimentoId: string,
  path: string
): Promise<ConfirmarUploadImagemTabelaResult> {
  await requireAdmin();

  if (!path.startsWith(`${empreendimentoId}/tabela-conteudo-`)) {
    return { success: false, message: "Caminho de upload inválido." };
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).getPublicUrl(path);

  return { success: true, url: publicUrl };
}

const TAMANHO_MAXIMO_PDF = 15 * 1024 * 1024; // 15MB

export type PrepararUploadDocumentoResult =
  | { success: true; path: string; token: string }
  | { success: false; message: string };

/** Só gera a URL assinada — o upload em si vai direto do navegador pro Storage. */
export async function prepararUploadDocumento(
  empreendimentoId: string,
  contentType: string,
  size: number
): Promise<PrepararUploadDocumentoResult> {
  await requireAdmin();

  if (contentType !== "application/pdf") {
    return { success: false, message: "Formato inválido. Envie um arquivo PDF." };
  }
  if (size <= 0 || size > TAMANHO_MAXIMO_PDF) {
    return { success: false, message: "Arquivo muito grande (máximo 15MB)." };
  }

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id: empreendimentoId },
  });
  if (!empreendimento) {
    return { success: false, message: "Empreendimento não encontrado." };
  }

  const caminho = `${empreendimentoId}/documento-${Date.now()}.pdf`;

  const { data, error } = await supabaseAdmin.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .createSignedUploadUrl(caminho);

  if (error || !data) {
    return { success: false, message: `Falha ao preparar o upload: ${error?.message}` };
  }

  return { success: true, path: data.path, token: data.token };
}

export type ConfirmarUploadDocumentoResult =
  | { success: true }
  | { success: false; message: string };

export async function confirmarUploadDocumento(
  empreendimentoId: string,
  path: string,
  titulo: string
): Promise<ConfirmarUploadDocumentoResult> {
  await requireAdmin();

  const tituloLimpo = titulo.trim();
  if (!tituloLimpo) {
    return { success: false, message: "Informe um título para o documento." };
  }

  if (!path.startsWith(`${empreendimentoId}/documento-`)) {
    return { success: false, message: "Caminho de upload inválido." };
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).getPublicUrl(path);

  const ultimo = await prisma.documentoAdicional.findFirst({
    where: { empreendimentoId },
    orderBy: { ordem: "desc" },
  });

  await prisma.documentoAdicional.create({
    data: {
      empreendimentoId,
      titulo: tituloLimpo,
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
      condicoesPagamento: { orderBy: { ordem: "asc" } },
    },
  });

  if (!empreendimento) {
    return { success: false, message: "Empreendimento não encontrado." };
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
