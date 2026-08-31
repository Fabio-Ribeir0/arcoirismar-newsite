"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { RevendaSchema } from "./schema";

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
    endereco: formData.get("endereco"),
    numeroEndereco: formData.get("numeroEndereco"),
    cep: formData.get("cep"),
    bairro: formData.get("bairro"),
    cidade: formData.get("cidade"),
    estado: formData.get("estado"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
  });
}

function montarDados(data: ReturnType<typeof RevendaSchema.parse>) {
  return {
    nome: data.nome,
    numeroUnidade: data.numeroUnidade || null,
    valor: data.valor,
    status: data.status,
    endereco: data.endereco || null,
    numeroEndereco: data.numeroEndereco || null,
    cep: data.cep || null,
    bairro: data.bairro || null,
    cidade: data.cidade || null,
    estado: data.estado || null,
    latitude: data.latitude ? Number(data.latitude) : null,
    longitude: data.longitude ? Number(data.longitude) : null,
  };
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

  // Nova unidade entra no fim da ordem de páginas do PDF.
  const ultima = await prisma.unidadeRevenda.findFirst({ orderBy: { ordem: "desc" } });

  const unidade = await prisma.unidadeRevenda.create({
    data: { ...montarDados(parsed.data), ordem: (ultima?.ordem ?? -1) + 1 },
  });

  revalidatePath("/admin/revendas");
  revalidatePath("/corretores/empreendimentos");

  return { success: true, id: unidade.id };
}

export async function atualizarUnidadeRevenda(
  id: string,
  _prevState: RevendaFormState,
  formData: FormData
): Promise<RevendaFormState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const atual = await prisma.unidadeRevenda.findUnique({ where: { id } });
  if (!atual) {
    return { success: false, message: "Unidade não encontrada." };
  }

  await prisma.unidadeRevenda.update({ where: { id }, data: montarDados(parsed.data) });

  revalidatePath("/admin/revendas");
  revalidatePath("/corretores/empreendimentos");

  return { success: true, id };
}

export type ConteudoTabelaState =
  | { success: true }
  | { success: false; message: string }
  | undefined;

/** Os 5 blocos rich text que compõem a página desta unidade no PDF. */
export async function salvarConteudoTabelaRevenda(
  id: string,
  _prevState: ConteudoTabelaState,
  formData: FormData
): Promise<ConteudoTabelaState> {
  await requireAdmin();

  const atual = await prisma.unidadeRevenda.findUnique({ where: { id } });
  if (!atual) {
    return { success: false, message: "Unidade não encontrada." };
  }

  const texto = (campo: string) => String(formData.get(campo) ?? "") || null;

  await prisma.unidadeRevenda.update({
    where: { id },
    data: {
      cabecalhoHtml: texto("cabecalhoHtml"),
      sobreHtml: texto("sobreHtml"),
      financeiroHtml: texto("financeiroHtml"),
      infoAdicionaisHtml: texto("infoAdicionaisHtml"),
      rodapeHtml: texto("rodapeHtml"),
    },
  });

  revalidatePath("/admin/revendas");
  return { success: true };
}

export async function excluirUnidadeRevenda(id: string) {
  await requireAdmin();
  await prisma.unidadeRevenda.delete({ where: { id } });
  revalidatePath("/admin/revendas");
  revalidatePath("/corretores/empreendimentos");
}
