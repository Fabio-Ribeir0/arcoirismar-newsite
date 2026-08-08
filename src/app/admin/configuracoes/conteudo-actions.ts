"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { supabaseAdmin, SITE_BUCKET } from "@/lib/supabase-admin";

const CONTEUDO_SITE_ID = "conteudo-site";

export type SalvarConteudoState =
  | { success: true }
  | { success: false; message: string }
  | undefined;

export async function atualizarSobre(
  _prevState: SalvarConteudoState,
  formData: FormData
): Promise<SalvarConteudoState> {
  await requireAdmin();

  const sobreTitulo = String(formData.get("sobreTitulo") ?? "").trim();
  const sobreDescricao = String(formData.get("sobreDescricao") ?? "").trim();
  const fundacaoMes = String(formData.get("fundacaoData") ?? "").trim();
  const stat2Valor = Number(formData.get("stat2Valor"));
  const stat2Rotulo = String(formData.get("stat2Rotulo") ?? "").trim();
  const stat3Valor = Number(formData.get("stat3Valor"));
  const stat3Rotulo = String(formData.get("stat3Rotulo") ?? "").trim();

  if (!sobreTitulo) return { success: false, message: "Informe o título." };
  if (!sobreDescricao) return { success: false, message: "Informe a descrição." };
  if (!/^\d{4}-\d{2}$/.test(fundacaoMes)) {
    return { success: false, message: "Informe o mês de fundação." };
  }
  if (!Number.isInteger(stat2Valor) || stat2Valor < 0) {
    return { success: false, message: "Valor inválido para o segundo dado." };
  }
  if (!stat2Rotulo) return { success: false, message: "Informe o rótulo do segundo dado." };
  if (!Number.isInteger(stat3Valor) || stat3Valor < 0) {
    return { success: false, message: "Valor inválido para o terceiro dado." };
  }
  if (!stat3Rotulo) return { success: false, message: "Informe o rótulo do terceiro dado." };

  await prisma.conteudoSite.update({
    where: { id: CONTEUDO_SITE_ID },
    data: {
      sobreTitulo,
      sobreDescricao,
      fundacaoData: new Date(`${fundacaoMes}-01`),
      stat2Valor,
      stat2Rotulo,
      stat3Valor,
      stat3Rotulo,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/configuracoes");
  return { success: true };
}

type Pilar = "missao" | "visao" | "valores";

export async function atualizarPilar(
  pilar: Pilar,
  _prevState: SalvarConteudoState,
  formData: FormData
): Promise<SalvarConteudoState> {
  await requireAdmin();

  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();

  if (!titulo) return { success: false, message: "Informe o título." };
  if (!descricao) return { success: false, message: "Informe a descrição." };

  await prisma.conteudoSite.update({
    where: { id: CONTEUDO_SITE_ID },
    data: {
      [`${pilar}Titulo`]: titulo,
      [`${pilar}Descricao`]: descricao,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/configuracoes");
  return { success: true };
}

type CampoImagem = "sobre" | "missao" | "visao" | "valores";

export type EnviarImagemConteudoState =
  | { success: true; url: string }
  | { success: false; message: string }
  | undefined;

const TIPOS_PERMITIDOS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5MB

export async function enviarImagemConteudo(
  campo: CampoImagem,
  _prevState: EnviarImagemConteudoState,
  formData: FormData
): Promise<EnviarImagemConteudoState> {
  await requireAdmin();

  const arquivo = formData.get("arquivo");
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

  const atual = await prisma.conteudoSite.findUnique({ where: { id: CONTEUDO_SITE_ID } });
  if (!atual) {
    return { success: false, message: "Conteúdo do site não encontrado." };
  }

  const caminho = `${campo}-${Date.now()}.${extensao}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(SITE_BUCKET)
    .upload(caminho, arquivo, { contentType: arquivo.type, upsert: false });

  if (uploadError) {
    return { success: false, message: `Falha ao enviar a imagem: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(SITE_BUCKET).getPublicUrl(caminho);

  const campoUrl = `${campo}ImagemUrl` as const;
  const urlAntiga = atual[campoUrl];

  if (urlAntiga) {
    const prefixo = `/storage/v1/object/public/${SITE_BUCKET}/`;
    const idx = urlAntiga.indexOf(prefixo);
    if (idx !== -1) {
      const caminhoAntigo = urlAntiga.slice(idx + prefixo.length);
      await supabaseAdmin.storage.from(SITE_BUCKET).remove([caminhoAntigo]);
    }
  }

  await prisma.conteudoSite.update({
    where: { id: CONTEUDO_SITE_ID },
    data: { [campoUrl]: publicUrl },
  });

  revalidatePath("/");
  revalidatePath("/admin/configuracoes");

  return { success: true, url: publicUrl };
}
