"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { supabaseAdmin, EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-admin";

// Reusa o bucket dos empreendimentos com prefixo próprio, em vez de criar e
// configurar um bucket público novo no Supabase só para as revendas.
const PREFIXO = "revendas";

const TIPOS_IMAGEM: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024; // 5MB

export type PrepararUploadResult =
  | { success: true; path: string; token: string }
  | { success: false; message: string };

export type ConfirmarUploadResult =
  | { success: true; url: string }
  | { success: false; message: string };

async function urlAssinada(caminho: string): Promise<PrepararUploadResult> {
  const { data, error } = await supabaseAdmin.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .createSignedUploadUrl(caminho);

  if (error || !data) {
    return { success: false, message: `Falha ao preparar o upload: ${error?.message}` };
  }
  return { success: true, path: data.path, token: data.token };
}

function urlPublica(caminho: string): string {
  return supabaseAdmin.storage.from(EMPREENDIMENTOS_BUCKET).getPublicUrl(caminho).data.publicUrl;
}

/** Best-effort: apaga do Storage o arquivo apontado por uma URL pública nossa. */
async function removerPorUrl(url: string | null): Promise<void> {
  if (!url) return;
  const marcador = `/storage/v1/object/public/${EMPREENDIMENTOS_BUCKET}/`;
  const idx = url.indexOf(marcador);
  if (idx === -1) return;
  await supabaseAdmin.storage
    .from(EMPREENDIMENTOS_BUCKET)
    .remove([url.slice(idx + marcador.length)]);
}

function validarImagem(contentType: string, size: number): string | null {
  if (!TIPOS_IMAGEM[contentType]) return null;
  if (size <= 0 || size > TAMANHO_MAXIMO_IMAGEM) return null;
  return TIPOS_IMAGEM[contentType];
}

// ---------------------------------------------------------------------------
// Imagem inserida dentro dos blocos rich text
// ---------------------------------------------------------------------------

export async function prepararUploadImagemRevenda(
  unidadeId: string,
  contentType: string,
  size: number
): Promise<PrepararUploadResult> {
  await requireAdmin();

  const extensao = validarImagem(contentType, size);
  if (!extensao) {
    return { success: false, message: "Use PNG, JPEG ou WebP de até 5MB." };
  }

  return urlAssinada(`${PREFIXO}/${unidadeId}/conteudo-${Date.now()}.${extensao}`);
}

export async function confirmarUploadImagemRevenda(
  unidadeId: string,
  path: string
): Promise<ConfirmarUploadResult> {
  await requireAdmin();

  if (!path.startsWith(`${PREFIXO}/${unidadeId}/conteudo-`)) {
    return { success: false, message: "Caminho de upload inválido." };
  }

  return { success: true, url: urlPublica(path) };
}

// ---------------------------------------------------------------------------
// Capa da tabela (vale para a tabela inteira, não por unidade)
// ---------------------------------------------------------------------------

export async function prepararUploadCapaRevenda(
  contentType: string,
  size: number
): Promise<PrepararUploadResult> {
  await requireAdmin();

  const extensao = validarImagem(contentType, size);
  if (!extensao) {
    return { success: false, message: "Use PNG, JPEG ou WebP de até 5MB." };
  }

  return urlAssinada(`${PREFIXO}/tabela/capa-${Date.now()}.${extensao}`);
}

export async function confirmarUploadCapaRevenda(path: string): Promise<ConfirmarUploadResult> {
  await requireAdmin();

  if (!path.startsWith(`${PREFIXO}/tabela/capa-`)) {
    return { success: false, message: "Caminho de upload inválido." };
  }

  const config = await prisma.configuracaoRevenda.findUnique({
    where: { id: "configuracao-revenda" },
  });

  const url = urlPublica(path);
  await removerPorUrl(config?.capaTabelaUrl ?? null);
  await prisma.configuracaoRevenda.upsert({
    where: { id: "configuracao-revenda" },
    update: { capaTabelaUrl: url },
    create: { id: "configuracao-revenda", capaTabelaUrl: url },
  });

  revalidatePath("/admin/revendas");
  return { success: true, url };
}
