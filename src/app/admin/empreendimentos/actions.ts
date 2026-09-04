"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { EmpreendimentoSchema } from "./schema";
import { criarEmpreendimentoCore, atualizarEmpreendimentoCore } from "./core";

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
    // Checkbox: ausente no FormData quando desmarcado, o que z.optional() (só
    // aceita undefined, não null) rejeitaria — normaliza pra "" como "motivo".
    espelhoVenda: formData.get("espelhoVenda") ?? "",
    slogan: formData.get("slogan"),
    descricao: formData.get("descricao"),
    endereco: formData.get("endereco"),
    bairro: formData.get("bairro"),
    cidade: formData.get("cidade"),
    estado: formData.get("estado"),
    cep: formData.get("cep"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    entregaPrevista: formData.get("entregaPrevista"),
    andares: formData.get("andares"),
    unidadesPorAndar: formData.get("unidadesPorAndar"),
    valorBase: formData.get("valorBase"),
    dormitoriosPadrao: formData.get("dormitoriosPadrao"),
    suitesPadrao: formData.get("suitesPadrao"),
    areaPrivativaPadrao: formData.get("areaPrivativaPadrao"),
    vagasPadrao: formData.get("vagasPadrao"),
    // O campo "motivo" só existe no form de edição (showMotivo); quando ausente,
    // FormData.get retorna null, que z.optional() rejeita — normaliza para "".
    motivo: formData.get("motivo") ?? "",
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

  const resultado = await criarEmpreendimentoCore(parsed.data);
  if (!resultado.sucesso) {
    return { success: false, message: resultado.mensagem };
  }

  revalidatePath("/admin/empreendimentos");
  redirect(`/admin/empreendimentos/${resultado.empreendimento.id}`);
}

export async function atualizarEmpreendimento(
  id: string,
  _prevState: EmpreendimentoFormState,
  formData: FormData
): Promise<EmpreendimentoFormState> {
  const admin = await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const resultado = await atualizarEmpreendimentoCore(id, parsed.data, admin.id);
  if (!resultado.sucesso) {
    return { success: false, message: resultado.mensagem };
  }

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
