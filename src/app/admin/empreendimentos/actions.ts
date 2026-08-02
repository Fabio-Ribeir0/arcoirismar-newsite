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
    descricao: formData.get("descricao"),
    endereco: formData.get("endereco"),
    bairro: formData.get("bairro"),
    cidade: formData.get("cidade"),
    estado: formData.get("estado"),
    cep: formData.get("cep"),
    entregaPrevista: formData.get("entregaPrevista"),
  });
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
    data: {
      nome: data.nome,
      slug,
      status: data.status,
      descricao: data.descricao || null,
      endereco: data.endereco || null,
      bairro: data.bairro || null,
      cidade: data.cidade || null,
      estado: data.estado || null,
      cep: data.cep || null,
      entregaPrevista: data.entregaPrevista ? new Date(data.entregaPrevista) : null,
    },
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
    data: {
      nome: data.nome,
      slug,
      status: data.status,
      descricao: data.descricao || null,
      endereco: data.endereco || null,
      bairro: data.bairro || null,
      cidade: data.cidade || null,
      estado: data.estado || null,
      cep: data.cep || null,
      entregaPrevista: data.entregaPrevista ? new Date(data.entregaPrevista) : null,
    },
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
