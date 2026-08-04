"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { supabaseAdmin, EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-admin";

const TIPOS_PERMITIDOS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const TAMANHO_MAXIMO = 50 * 1024 * 1024; // 50MB

export type PrepararUploadVideoResult =
  | { success: true; path: string; token: string }
  | { success: false; message: string };

/**
 * Só gera a URL assinada — o upload em si vai direto do navegador para o
 * Supabase Storage (o arquivo nunca passa pela função serverless da Vercel).
 */
export async function prepararUploadVideoBanner(
  empreendimentoId: string,
  contentType: string,
  size: number
): Promise<PrepararUploadVideoResult> {
  await requireAdmin();

  const extensao = TIPOS_PERMITIDOS[contentType];
  if (!extensao) {
    return { success: false, message: "Formato inválido. Use MP4 ou WebM." };
  }
  if (size <= 0 || size > TAMANHO_MAXIMO) {
    return { success: false, message: "Vídeo muito grande (máximo 50MB)." };
  }

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id: empreendimentoId },
  });
  if (!empreendimento) {
    return { success: false, message: "Empreendimento não encontrado." };
  }

  const caminho = `${empreendimentoId}/banner-video-${Date.now()}.${extensao}`;

  const { data, error } = await supabaseAdmin.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .createSignedUploadUrl(caminho);

  if (error || !data) {
    return { success: false, message: `Falha ao preparar o upload: ${error?.message}` };
  }

  return { success: true, path: data.path, token: data.token };
}

export type ConfirmarUploadVideoResult =
  | { success: true; url: string }
  | { success: false; message: string };

/**
 * Chamada pelo navegador depois que o PUT direto pro Storage terminou —
 * só então gravamos a URL no banco e limpamos o vídeo antigo.
 */
export async function confirmarUploadVideoBanner(
  empreendimentoId: string,
  path: string
): Promise<ConfirmarUploadVideoResult> {
  await requireAdmin();

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id: empreendimentoId },
  });
  if (!empreendimento) {
    return { success: false, message: "Empreendimento não encontrado." };
  }

  // O caminho é previsível (`${empreendimentoId}/banner-video-...`), então validamos
  // que o admin autenticado só está confirmando um upload feito pra este empreendimento.
  if (!path.startsWith(`${empreendimentoId}/banner-video-`)) {
    return { success: false, message: "Caminho de upload inválido." };
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).getPublicUrl(path);

  if (empreendimento.bannerVideoUrl) {
    const prefixo = `/storage/v1/object/public/${EMPREENDIMENTOS_BUCKET}/`;
    const idx = empreendimento.bannerVideoUrl.indexOf(prefixo);
    if (idx !== -1) {
      const caminhoAntigo = empreendimento.bannerVideoUrl.slice(idx + prefixo.length);
      await supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).remove([caminhoAntigo]);
    }
  }

  await prisma.empreendimento.update({
    where: { id: empreendimentoId },
    data: { bannerVideoUrl: publicUrl },
  });

  revalidatePath("/admin/empreendimentos");
  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);

  return { success: true, url: publicUrl };
}

export async function removerVideoBanner(
  empreendimentoId: string
): Promise<ConfirmarUploadVideoResult> {
  await requireAdmin();

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id: empreendimentoId },
  });
  if (!empreendimento) {
    return { success: false, message: "Empreendimento não encontrado." };
  }

  if (empreendimento.bannerVideoUrl) {
    const prefixo = `/storage/v1/object/public/${EMPREENDIMENTOS_BUCKET}/`;
    const idx = empreendimento.bannerVideoUrl.indexOf(prefixo);
    if (idx !== -1) {
      const caminhoAntigo = empreendimento.bannerVideoUrl.slice(idx + prefixo.length);
      await supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).remove([caminhoAntigo]);
    }
  }

  await prisma.empreendimento.update({
    where: { id: empreendimentoId },
    data: { bannerVideoUrl: null },
  });

  revalidatePath("/admin/empreendimentos");
  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);

  return { success: true, url: "" };
}
