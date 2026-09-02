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

function montarDados(data: ReturnType<typeof RevendaSchema.parse>) {
  return {
    nome: data.nome,
    numeroUnidade: data.numeroUnidade || null,
    valor: data.valor,
    status: data.status,
    template: data.template,
    endereco: data.endereco || null,
    numeroEndereco: data.numeroEndereco || null,
    cep: data.cep || null,
    bairro: data.bairro || null,
    cidade: data.cidade || null,
    estado: data.estado || null,
    latitude: data.latitude ? Number(data.latitude) : null,
    longitude: data.longitude ? Number(data.longitude) : null,
    torre: data.torre || null,
    tagline: data.tagline || null,
    areaPrivativa: data.areaPrivativa || null,
    dormitorios: data.dormitorios ? Number(data.dormitorios) : null,
    suites: data.suites ? Number(data.suites) : null,
    vagas: data.vagas ? Number(data.vagas) : null,
    andar: data.andar || null,
    elevadores: data.elevadores ? Number(data.elevadores) : null,
    entregaPrevista: data.entregaPrevista || null,
    diferencial: data.diferencial || null,
    descricao: data.descricao || null,
    amenidades: data.amenidades || null,
    condicoesPagamento: data.condicoesPagamento || null,
    localizacaoNota: data.localizacaoNota || null,
    informacoes: data.informacoes || null,
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

export async function excluirUnidadeRevenda(id: string) {
  await requireAdmin();
  await prisma.unidadeRevenda.delete({ where: { id } });
  revalidatePath("/admin/revendas");
  revalidatePath("/corretores/empreendimentos");
}
