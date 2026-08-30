"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { supabaseAdmin, EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-admin";
import type { MidiaTipo } from "@/generated/prisma/client";

const TIPOS_IMAGEM_PERMITIDOS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024; // 5MB

const PREFIXO_ARQUIVO: Record<"FOTO" | "PLANTA", string> = {
  FOTO: "foto",
  PLANTA: "planta",
};

export type PrepararUploadMidiaImagemResult =
  | { success: true; path: string; token: string }
  | { success: false; message: string };

/**
 * Só gera a URL assinada — o upload em si vai direto do navegador para o
 * Supabase Storage (o arquivo nunca passa pela função serverless da Vercel,
 * que rejeita corpos de requisição grandes antes mesmo de chegar no código).
 */
export async function prepararUploadMidiaImagem(
  empreendimentoId: string,
  tipo: "FOTO" | "PLANTA",
  contentType: string,
  size: number
): Promise<PrepararUploadMidiaImagemResult> {
  await requireAdmin();

  const extensao = TIPOS_IMAGEM_PERMITIDOS[contentType];
  if (!extensao) {
    return { success: false, message: "Formato inválido. Use PNG, JPEG ou WebP." };
  }
  if (size <= 0 || size > TAMANHO_MAXIMO_IMAGEM) {
    return { success: false, message: "Imagem muito grande (máximo 5MB)." };
  }

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id: empreendimentoId },
  });
  if (!empreendimento) {
    return { success: false, message: "Empreendimento não encontrado." };
  }

  const caminho = `${empreendimentoId}/${PREFIXO_ARQUIVO[tipo]}-${Date.now()}.${extensao}`;

  const { data, error } = await supabaseAdmin.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .createSignedUploadUrl(caminho);

  if (error || !data) {
    return { success: false, message: `Falha ao preparar o upload: ${error?.message}` };
  }

  return { success: true, path: data.path, token: data.token };
}

export type ConfirmarUploadMidiaImagemResult =
  | { success: true }
  | { success: false; message: string };

/** Chamada pelo navegador depois que o PUT direto pro Storage terminou. */
export async function confirmarUploadMidiaImagem(
  empreendimentoId: string,
  tipo: "FOTO" | "PLANTA",
  path: string,
  titulo: string,
  publico: boolean
): Promise<ConfirmarUploadMidiaImagemResult> {
  await requireAdmin();

  if (!path.startsWith(`${empreendimentoId}/${PREFIXO_ARQUIVO[tipo]}-`)) {
    return { success: false, message: "Caminho de upload inválido." };
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).getPublicUrl(path);

  const formData = new FormData();
  formData.set("titulo", titulo);
  if (publico) formData.set("publico", "on");

  await criarMidia(empreendimentoId, tipo, publicUrl, formData);

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  revalidatePath("/empreendimentos");

  return { success: true };
}

/**
 * Compartilhado pelas actions de imagem e de vídeo (após a confirmação do upload
 * direto). Exportado de um módulo "use server", então é um endpoint invocável por
 * conta própria — precisa checar admin aqui também, não só nos callers.
 */
export async function criarMidia(
  empreendimentoId: string,
  tipo: MidiaTipo,
  url: string,
  formData: FormData
) {
  await requireAdmin();

  const titulo = String(formData.get("titulo") ?? "").trim() || null;
  const publico = formData.get("publico") === "on";

  const ultima = await prisma.midia.findFirst({
    where: { empreendimentoId, tipo },
    orderBy: { ordem: "desc" },
  });

  return prisma.midia.create({
    data: {
      empreendimentoId,
      tipo,
      url,
      titulo,
      publico,
      ordem: (ultima?.ordem ?? -1) + 1,
    },
  });
}

export async function excluirMidia(empreendimentoId: string, midiaId: string) {
  await requireAdmin();

  const midia = await prisma.midia.findUnique({ where: { id: midiaId } });
  if (!midia || midia.empreendimentoId !== empreendimentoId) return;

  const prefixo = `/storage/v1/object/public/${EMPREENDIMENTOS_BUCKET}/`;
  const idx = midia.url.indexOf(prefixo);
  if (idx !== -1) {
    const caminho = midia.url.slice(idx + prefixo.length);
    await supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).remove([caminho]);
  }

  await prisma.midia.delete({ where: { id: midiaId } });

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  revalidatePath("/empreendimentos");
}

export async function alternarPublicoMidia(
  empreendimentoId: string,
  midiaId: string,
  publicoAtual: boolean
) {
  await requireAdmin();
  await prisma.midia.update({ where: { id: midiaId }, data: { publico: !publicoAtual } });
  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  revalidatePath("/empreendimentos");
}
