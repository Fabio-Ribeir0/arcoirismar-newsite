"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { supabaseAdmin, EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-admin";

const TIPOS_PERMITIDOS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5MB

export type PrepararUploadLogoResult =
  | { success: true; path: string; token: string }
  | { success: false; message: string };

/**
 * Só gera a URL assinada — o upload em si vai direto do navegador para o
 * Supabase Storage (o arquivo nunca passa pela função serverless da Vercel,
 * que rejeita corpos de requisição grandes antes mesmo de chegar no código).
 */
export async function prepararUploadLogo(
  empreendimentoId: string,
  contentType: string,
  size: number
): Promise<PrepararUploadLogoResult> {
  await requireAdmin();

  const extensao = TIPOS_PERMITIDOS[contentType];
  if (!extensao) {
    return { success: false, message: "Formato inválido. Use PNG, JPEG ou WebP." };
  }
  if (size <= 0 || size > TAMANHO_MAXIMO) {
    return { success: false, message: "Imagem muito grande (máximo 5MB)." };
  }

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id: empreendimentoId },
  });
  if (!empreendimento) {
    return { success: false, message: "Empreendimento não encontrado." };
  }

  const caminho = `${empreendimentoId}/logo-${Date.now()}.${extensao}`;

  const { data, error } = await supabaseAdmin.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .createSignedUploadUrl(caminho);

  if (error || !data) {
    return { success: false, message: `Falha ao preparar o upload: ${error?.message}` };
  }

  return { success: true, path: data.path, token: data.token };
}

export type ConfirmarUploadLogoResult =
  | { success: true; url: string }
  | { success: false; message: string };

/** Chamada pelo navegador depois que o PUT direto pro Storage terminou. */
export async function confirmarUploadLogo(
  empreendimentoId: string,
  path: string
): Promise<ConfirmarUploadLogoResult> {
  await requireAdmin();

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id: empreendimentoId },
  });
  if (!empreendimento) {
    return { success: false, message: "Empreendimento não encontrado." };
  }

  // O caminho é previsível (`${empreendimentoId}/logo-...`), então validamos que
  // o admin autenticado só está confirmando um upload feito pra este empreendimento.
  if (!path.startsWith(`${empreendimentoId}/logo-`)) {
    return { success: false, message: "Caminho de upload inválido." };
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).getPublicUrl(path);

  // Best-effort cleanup of the previous logo file, if any.
  if (empreendimento.logoUrl) {
    const prefixo = `/storage/v1/object/public/${EMPREENDIMENTOS_BUCKET}/`;
    const idx = empreendimento.logoUrl.indexOf(prefixo);
    if (idx !== -1) {
      const caminhoAntigo = empreendimento.logoUrl.slice(idx + prefixo.length);
      await supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).remove([caminhoAntigo]);
    }
  }

  await prisma.empreendimento.update({
    where: { id: empreendimentoId },
    data: { logoUrl: publicUrl },
  });

  revalidatePath("/");
  revalidatePath("/admin/empreendimentos");
  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);

  return { success: true, url: publicUrl };
}
