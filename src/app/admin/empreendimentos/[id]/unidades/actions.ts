"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { gerarIdentificadorUnidade } from "@/lib/numeracao-unidade";
import { UnidadeSchema } from "./schema";
import { criarUnidadeCore, atualizarUnidadeCore } from "./core";

export type UnidadeFormState =
  | { success: true }
  | { success: false; errors?: Record<string, string[] | undefined>; message?: string }
  | undefined;

function parseForm(formData: FormData) {
  return UnidadeSchema.safeParse({
    identificador: formData.get("identificador"),
    dormitorios: formData.get("dormitorios"),
    suites: formData.get("suites"),
    areaPrivativa: formData.get("areaPrivativa"),
    vagas: formData.get("vagas"),
    areaGaragem: formData.get("areaGaragem"),
    areaComum: formData.get("areaComum"),
    andar: formData.get("andar"),
    preco: formData.get("preco"),
    status: formData.get("status"),
    // The "motivo" input only exists on the edit form (showMotivo); when
    // absent, FormData.get returns null, which z.optional() rejects (it
    // only allows undefined) — coalesce to "" so create still validates.
    motivo: formData.get("motivo") ?? "",
  });
}

export async function criarUnidade(
  empreendimentoId: string,
  _prevState: UnidadeFormState,
  formData: FormData
): Promise<UnidadeFormState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const resultado = await criarUnidadeCore(empreendimentoId, parsed.data);
  if (!resultado.sucesso) {
    return { success: false, message: resultado.mensagem };
  }

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  redirect(`/admin/empreendimentos/${empreendimentoId}`);
}

export async function atualizarUnidade(
  empreendimentoId: string,
  unidadeId: string,
  _prevState: UnidadeFormState,
  formData: FormData
): Promise<UnidadeFormState> {
  const admin = await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const resultado = await atualizarUnidadeCore(empreendimentoId, unidadeId, parsed.data, admin.id);
  if (!resultado.sucesso) {
    return { success: false, message: resultado.mensagem };
  }

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  redirect(`/admin/empreendimentos/${empreendimentoId}`);
}

export async function excluirUnidade(empreendimentoId: string, unidadeId: string) {
  await requireAdmin();
  await prisma.unidade.delete({ where: { id: unidadeId } });
  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
}

export async function excluirTodasUnidades(empreendimentoId: string) {
  await requireAdmin();
  await prisma.unidade.deleteMany({ where: { empreendimentoId } });
  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
}

export type GerarUnidadesState =
  | { success: true; criadas: number }
  | { success: false; message: string }
  | undefined;

/**
 * Idempotent: only creates the units that don't exist yet for the expected
 * andar x unidadesPorAndar grid, so re-running after raising "andares" only
 * adds the new floors — it never touches/overwrites existing units.
 */
export async function gerarUnidades(
  empreendimentoId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept to match useActionState's action signature
  _prevState: GerarUnidadesState
): Promise<GerarUnidadesState> {
  await requireAdmin();

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id: empreendimentoId },
  });
  if (!empreendimento) {
    return { success: false, message: "Empreendimento não encontrado." };
  }

  const {
    andares,
    unidadesPorAndar,
    valorBase,
    dormitoriosPadrao,
    suitesPadrao,
    areaPrivativaPadrao,
    vagasPadrao,
  } = empreendimento;

  if (!andares || !unidadesPorAndar || !valorBase) {
    return {
      success: false,
      message:
        'Preencha "Andares", "Unidades por andar" e "Valor base" no formulário acima e clique em "Salvar alterações" antes de gerar as unidades.',
    };
  }

  const existentes = await prisma.unidade.findMany({
    where: { empreendimentoId },
    select: { identificador: true },
  });
  const identificadoresExistentes = new Set(existentes.map((u) => u.identificador));

  const novasUnidades = [];
  for (let andar = 1; andar <= andares; andar++) {
    for (let posicao = 1; posicao <= unidadesPorAndar; posicao++) {
      const identificador = gerarIdentificadorUnidade(andar, posicao);
      if (identificadoresExistentes.has(identificador)) continue;
      novasUnidades.push({
        empreendimentoId,
        identificador,
        dormitorios: dormitoriosPadrao ?? 0,
        suites: suitesPadrao ?? 0,
        areaPrivativa: areaPrivativaPadrao ?? 0,
        vagas: vagasPadrao ?? 0,
        areaGaragem: 0,
        areaComum: 0,
        andar,
        preco: valorBase,
        status: "DISPONIVEL" as const,
      });
    }
  }

  if (novasUnidades.length === 0) {
    return { success: false, message: "Todas as unidades esperadas já existem — nada para gerar." };
  }

  await prisma.unidade.createMany({ data: novasUnidades });

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  return { success: true, criadas: novasUnidades.length };
}
