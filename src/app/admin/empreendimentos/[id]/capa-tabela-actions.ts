"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { supabaseAdmin, EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-admin";

export type CapaTabelaUploadState =
  | { success: true; url: string }
  | { success: false; message: string }
  | undefined;

const TIPOS_PERMITIDOS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5MB

export async function enviarCapaTabelaEmpreendimento(
  empreendimentoId: string,
  _prevState: CapaTabelaUploadState,
  formData: FormData
): Promise<CapaTabelaUploadState> {
  await requireAdmin();

  const arquivo = formData.get("capaTabela");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { success: false, message: "Selecione uma imagem." };
  }

  const extensao = TIPOS_PERMITIDOS[arquivo.type];
  if (!extensao) {
    return { success: false, message: "Formato inválido. Use PNG, JPEG ou WebP." };
  }

  if (arquivo.size > TAMANHO_MAXIMO) {
    return { success: false, message: "Imagem muito grande (máximo 5MB)." };
  }

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id: empreendimentoId },
  });
  if (!empreendimento) {
    return { success: false, message: "Empreendimento não encontrado." };
  }

  const caminho = `${empreendimentoId}/capa-tabela-${Date.now()}.${extensao}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .upload(caminho, arquivo, { contentType: arquivo.type, upsert: false });

  if (uploadError) {
    return { success: false, message: `Falha ao enviar a imagem: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).getPublicUrl(caminho);

  // Best-effort cleanup of the previous cover file, if any.
  if (empreendimento.capaTabelaUrl) {
    const prefixo = `/storage/v1/object/public/${EMPREENDIMENTOS_BUCKET}/`;
    const idx = empreendimento.capaTabelaUrl.indexOf(prefixo);
    if (idx !== -1) {
      const caminhoAntigo = empreendimento.capaTabelaUrl.slice(idx + prefixo.length);
      await supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).remove([caminhoAntigo]);
    }
  }

  await prisma.empreendimento.update({
    where: { id: empreendimentoId },
    data: { capaTabelaUrl: publicUrl },
  });

  revalidatePath("/admin/empreendimentos");
  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);

  return { success: true, url: publicUrl };
}
