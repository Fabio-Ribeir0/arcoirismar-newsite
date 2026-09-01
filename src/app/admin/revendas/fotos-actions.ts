"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { supabaseAdmin, EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-admin";

const PREFIXO = "revendas";

const TIPOS_IMAGEM: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024; // 5MB

export type PrepararUploadFotoResult =
  | { success: true; path: string; token: string }
  | { success: false; message: string };

export async function prepararUploadFotoRevenda(
  unidadeId: string,
  contentType: string,
  size: number
): Promise<PrepararUploadFotoResult> {
  await requireAdmin();

  const extensao = TIPOS_IMAGEM[contentType];
  if (!extensao || size <= 0 || size > TAMANHO_MAXIMO_IMAGEM) {
    return { success: false, message: "Use PNG, JPEG ou WebP de até 5MB." };
  }

  const caminho = `${PREFIXO}/${unidadeId}/foto-${Date.now()}.${extensao}`;

  const { data, error } = await supabaseAdmin.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .createSignedUploadUrl(caminho);

  if (error || !data) {
    return { success: false, message: `Falha ao preparar o upload: ${error?.message}` };
  }
  return { success: true, path: data.path, token: data.token };
}

export type ConfirmarUploadFotoResult =
  | { success: true; foto: { id: string; url: string; legenda: string | null; ordem: number } }
  | { success: false; message: string };

export async function confirmarUploadFotoRevenda(
  unidadeId: string,
  path: string
): Promise<ConfirmarUploadFotoResult> {
  await requireAdmin();

  if (!path.startsWith(`${PREFIXO}/${unidadeId}/foto-`)) {
    return { success: false, message: "Caminho de upload inválido." };
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).getPublicUrl(path);

  const ultima = await prisma.fotoRevenda.findFirst({
    where: { unidadeId },
    orderBy: { ordem: "desc" },
  });

  const foto = await prisma.fotoRevenda.create({
    data: { unidadeId, url: publicUrl, ordem: (ultima?.ordem ?? -1) + 1 },
  });

  revalidatePath("/admin/revendas");
  return {
    success: true,
    foto: { id: foto.id, url: foto.url, legenda: foto.legenda, ordem: foto.ordem },
  };
}

export type AtualizarFotoState =
  | { success: true }
  | { success: false; message: string }
  | undefined;

export async function atualizarFotoRevenda(
  fotoId: string,
  _prevState: AtualizarFotoState,
  formData: FormData
): Promise<AtualizarFotoState> {
  await requireAdmin();

  const legenda = String(formData.get("legenda") ?? "").trim() || null;
  const ordemRaw = String(formData.get("ordem") ?? "").trim();
  const ordem = ordemRaw && /^\d+$/.test(ordemRaw) ? Number(ordemRaw) : undefined;

  await prisma.fotoRevenda.update({
    where: { id: fotoId },
    data: { legenda, ordem },
  });

  revalidatePath("/admin/revendas");
  return { success: true };
}

export async function excluirFotoRevenda(fotoId: string): Promise<void> {
  await requireAdmin();

  const foto = await prisma.fotoRevenda.findUnique({ where: { id: fotoId } });
  if (!foto) return;

  const marcador = `/storage/v1/object/public/${EMPREENDIMENTOS_BUCKET}/`;
  const idx = foto.url.indexOf(marcador);
  if (idx !== -1) {
    await supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).remove([foto.url.slice(idx + marcador.length)]);
  }

  await prisma.fotoRevenda.delete({ where: { id: fotoId } });
  revalidatePath("/admin/revendas");
}
