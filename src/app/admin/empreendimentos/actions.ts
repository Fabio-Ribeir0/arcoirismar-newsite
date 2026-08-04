"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { slugify } from "@/lib/slug";
import { EmpreendimentoSchema } from "./schema";

export type EmpreendimentoFormState =
  | { success: true }
  | { success: false; errors?: Record<string, string[] | undefined>; message?: string }
  | undefined;

function parseForm(formData: FormData) {
  return EmpreendimentoSchema.safeParse({
    nome: formData.get("nome"),
    slug: formData.get("slug"),
    status: formData.get("status"),
    destaque: formData.get("destaque"),
    slogan: formData.get("slogan"),
    descricao: formData.get("descricao"),
    endereco: formData.get("endereco"),
    bairro: formData.get("bairro"),
    cidade: formData.get("cidade"),
    estado: formData.get("estado"),
    cep: formData.get("cep"),
    entregaPrevista: formData.get("entregaPrevista"),
    andares: formData.get("andares"),
    unidadesPorAndar: formData.get("unidadesPorAndar"),
    valorBase: formData.get("valorBase"),
    entradaPercentual: formData.get("entradaPercentual"),
    entregaChavesPercentual: formData.get("entregaChavesPercentual"),
    parcelas: formData.get("parcelas"),
    tipoPadrao: formData.get("tipoPadrao"),
    areaPrivativaPadrao: formData.get("areaPrivativaPadrao"),
    vagasPadrao: formData.get("vagasPadrao"),
  });
}

function buildEmpreendimentoData(data: ReturnType<typeof EmpreendimentoSchema.parse>, slug: string) {
  return {
    nome: data.nome,
    slug,
    status: data.status,
    destaque: data.destaque,
    slogan: data.slogan || null,
    descricao: data.descricao || null,
    endereco: data.endereco || null,
    bairro: data.bairro || null,
    cidade: data.cidade || null,
    estado: data.estado || null,
    cep: data.cep || null,
    entregaPrevista: data.entregaPrevista ? new Date(data.entregaPrevista) : null,
    andares: data.andares ? Number(data.andares) : null,
    unidadesPorAndar: data.unidadesPorAndar ? Number(data.unidadesPorAndar) : null,
    valorBase: data.valorBase || null,
    entradaPercentual: data.entradaPercentual || null,
    entregaChavesPercentual: data.entregaChavesPercentual || null,
    parcelas: data.parcelas ? Number(data.parcelas) : null,
    tipoPadrao: data.tipoPadrao || null,
    areaPrivativaPadrao: data.areaPrivativaPadrao ? Number(data.areaPrivativaPadrao) : null,
    vagasPadrao: data.vagasPadrao ? Number(data.vagasPadrao) : null,
  };
}

export async function criarEmpreendimento(
  _prevState: EmpreendimentoFormState,
  formData: FormData
): Promise<EmpreendimentoFormState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.nome);

  const existing = await prisma.empreendimento.findUnique({ where: { slug } });
  if (existing) {
    return { success: false, message: "Já existe um empreendimento com esse slug." };
  }

  const empreendimento = await prisma.empreendimento.create({
    data: buildEmpreendimentoData(data, slug),
  });

  revalidatePath("/admin/empreendimentos");
  redirect(`/admin/empreendimentos/${empreendimento.id}`);
}

export async function atualizarEmpreendimento(
  id: string,
  _prevState: EmpreendimentoFormState,
  formData: FormData
): Promise<EmpreendimentoFormState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.nome);

  const conflict = await prisma.empreendimento.findFirst({
    where: { slug, NOT: { id } },
  });
  if (conflict) {
    return { success: false, message: "Já existe outro empreendimento com esse slug." };
  }

  await prisma.empreendimento.update({
    where: { id },
    data: buildEmpreendimentoData(data, slug),
  });

  revalidatePath("/admin/empreendimentos");
  revalidatePath(`/admin/empreendimentos/${id}`);
  return { success: true };
}

export async function excluirEmpreendimento(id: string) {
  await requireAdmin();
  await prisma.empreendimento.delete({ where: { id } });
  revalidatePath("/admin/empreendimentos");
  redirect("/admin/empreendimentos");
}
