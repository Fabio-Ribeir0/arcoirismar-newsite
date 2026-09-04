"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { RevendaSchema } from "./schema";
import { criarUnidadeRevendaCore, atualizarUnidadeRevendaCore } from "./core";

export type RevendaFormState =
  | { success: true; id: string }
  | { success: false; errors?: Record<string, string[] | undefined>; message?: string }
  | undefined;

function parseForm(formData: FormData) {
  return RevendaSchema.safeParse({
    nome: formData.get("nome"),
    numeroUnidade: formData.get("numeroUnidade"),
    valor: formData.get("valor"),
    status: formData.get("status"),
    template: formData.get("template"),
    endereco: formData.get("endereco"),
    numeroEndereco: formData.get("numeroEndereco"),
    cep: formData.get("cep"),
    bairro: formData.get("bairro"),
    cidade: formData.get("cidade"),
    estado: formData.get("estado"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    torre: formData.get("torre"),
    tagline: formData.get("tagline"),
    areaPrivativa: formData.get("areaPrivativa"),
    dormitorios: formData.get("dormitorios"),
    suites: formData.get("suites"),
    vagas: formData.get("vagas"),
    andar: formData.get("andar"),
    elevadores: formData.get("elevadores"),
    entregaPrevista: formData.get("entregaPrevista"),
    diferencial: formData.get("diferencial"),
    descricao: formData.get("descricao"),
    amenidades: formData.get("amenidades"),
    condicoesPagamento: formData.get("condicoesPagamento"),
    localizacaoNota: formData.get("localizacaoNota"),
    informacoes: formData.get("informacoes"),
  });
}

export async function criarUnidadeRevenda(
  _prevState: RevendaFormState,
  formData: FormData
): Promise<RevendaFormState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const resultado = await criarUnidadeRevendaCore(parsed.data);
  if (!resultado.sucesso) {
    return { success: false, message: resultado.mensagem };
  }

  revalidatePath("/admin/revendas");
  revalidatePath("/corretores/empreendimentos");

  return { success: true, id: resultado.unidade.id };
}

export async function atualizarUnidadeRevenda(
  id: string,
  _prevState: RevendaFormState,
  formData: FormData
): Promise<RevendaFormState> {
  const admin = await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const resultado = await atualizarUnidadeRevendaCore(id, parsed.data, admin.id);
  if (!resultado.sucesso) {
    return { success: false, message: resultado.mensagem };
  }

  revalidatePath("/admin/revendas");
  revalidatePath("/corretores/empreendimentos");

  return { success: true, id };
}

export async function excluirUnidadeRevenda(id: string) {
  await requireAdmin();
  await prisma.unidadeRevenda.delete({ where: { id } });
  revalidatePath("/admin/revendas");
  revalidatePath("/corretores/empreendimentos");
}
