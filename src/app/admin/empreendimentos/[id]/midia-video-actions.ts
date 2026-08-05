"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { supabaseAdmin, EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-admin";
import { criarMidia } from "./midia-actions";

const TIPOS_PERMITIDOS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const TAMANHO_MAXIMO = 50 * 1024 * 1024; // 50MB

export type PrepararUploadVideoMidiaResult =
  | { success: true; path: string; token: string }
  | { success: false; message: string };

/** Só gera a URL assinada — o upload em si vai direto do navegador pro Storage. */
export async function prepararUploadVideoMidia(
  empreendimentoId: string,
  contentType: string,
  size: number
): Promise<PrepararUploadVideoMidiaResult> {
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

  const caminho = `${empreendimentoId}/midia-video-${Date.now()}.${extensao}`;

  const { data, error } = await supabaseAdmin.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .createSignedUploadUrl(caminho);

  if (error || !data) {
    return { success: false, message: `Falha ao preparar o upload: ${error?.message}` };
  }

  return { success: true, path: data.path, token: data.token };
}

export type ConfirmarUploadVideoMidiaResult =
  | { success: true }
  | { success: false; message: string };

export async function confirmarUploadVideoMidia(
  empreendimentoId: string,
  path: string,
  titulo: string,
  publico: boolean
): Promise<ConfirmarUploadVideoMidiaResult> {
  await requireAdmin();

  if (!path.startsWith(`${empreendimentoId}/midia-video-`)) {
    return { success: false, message: "Caminho de upload inválido." };
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).getPublicUrl(path);

  const formData = new FormData();
  formData.set("titulo", titulo);
  if (publico) formData.set("publico", "on");

  await criarMidia(empreendimentoId, "VIDEO", publicUrl, formData);

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  revalidatePath("/empreendimentos");

  return { success: true };
}
