"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { gerarIdentificadorUnidade } from "@/lib/numeracao-unidade";
import { UnidadeSchema } from "./schema";
import { registrarHistoricoUnidade } from "./service";

export type UnidadeFormState =
  | { success: true }
  | { success: false; errors?: Record<string, string[] | undefined>; message?: string }
  | undefined;

function parseForm(formData: FormData) {
  return UnidadeSchema.safeParse({
    identificador: formData.get("identificador"),
    tipo: formData.get("tipo"),
    areaPrivativa: formData.get("areaPrivativa"),
    vagas: formData.get("vagas"),
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

  const data = parsed.data;
  const isDecorado = formData.get("isDecorado") === "on";
  const isTrocaArea = formData.get("isTrocaArea") === "on";

  const existing = await prisma.unidade.findUnique({
    where: {
      empreendimentoId_identificador: {
        empreendimentoId,
        identificador: data.identificador,
      },
    },
  });
  if (existing) {
    return {
      success: false,
      message: "Já existe uma unidade com esse identificador neste empreendimento.",
    };
  }

  await prisma.unidade.create({
    data: {
      empreendimentoId,
      identificador: data.identificador,
      tipo: data.tipo,
      areaPrivativa: data.areaPrivativa,
      vagas: data.vagas,
      andar: data.andar ? Number(data.andar) : null,
      preco: data.preco,
      status: data.status,
      isDecorado,
      isTrocaArea,
    },
  });

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

  const data = parsed.data;
  const isDecorado = formData.get("isDecorado") === "on";
  const isTrocaArea = formData.get("isTrocaArea") === "on";

  const atual = await prisma.unidade.findUnique({ where: { id: unidadeId } });
  if (!atual) {
    return { success: false, message: "Unidade não encontrada." };
  }

  const conflict = await prisma.unidade.findFirst({
    where: {
      empreendimentoId,
      identificador: data.identificador,
      NOT: { id: unidadeId },
    },
  });
  if (conflict) {
    return {
      success: false,
      message: "Já existe outra unidade com esse identificador neste empreendimento.",
    };
  }

  const motivo = data.motivo || null;

  await prisma.$transaction(async (tx) => {
    await tx.unidade.update({
      where: { id: unidadeId },
      data: {
        identificador: data.identificador,
        tipo: data.tipo,
        areaPrivativa: data.areaPrivativa,
        vagas: data.vagas,
        andar: data.andar ? Number(data.andar) : null,
        preco: data.preco,
        status: data.status,
        isDecorado,
        isTrocaArea,
      },
    });

    await registrarHistoricoUnidade(tx, {
      unidadeId,
      precoAnterior: atual.preco,
      precoNovo: data.preco,
      statusAnterior: atual.status,
      statusNovo: data.status,
      autorId: admin.id,
      motivo,
    });
  });

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

  const { andares, unidadesPorAndar, valorBase, tipoPadrao, areaPrivativaPadrao, vagasPadrao } =
    empreendimento;

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
        tipo: tipoPadrao ?? "",
        areaPrivativa: areaPrivativaPadrao ?? 0,
        vagas: vagasPadrao ?? 0,
        andar,
        preco: valorBase,
        status: "DISPONIVEL" as const,
        isDecorado: false,
        isTrocaArea: false,
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
