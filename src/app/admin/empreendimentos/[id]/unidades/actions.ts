"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { UnidadeSchema } from "./schema";

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

  // Compare numerically, not as strings — "350000" and "350000.00" are the
  // same price but would otherwise register as a spurious history entry.
  const precoMudou = Number(atual.preco) !== Number(data.preco);
  const statusMudou = data.status !== atual.status;
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
      },
    });

    if (precoMudou) {
      await tx.historicoPrecoUnidade.create({
        data: {
          unidadeId,
          precoAnterior: atual.preco,
          precoNovo: data.preco,
          autorId: admin.id,
          motivo,
        },
      });
    }

    if (statusMudou) {
      await tx.historicoStatusUnidade.create({
        data: {
          unidadeId,
          statusAnterior: atual.status,
          statusNovo: data.status,
          autorId: admin.id,
          motivo,
        },
      });
    }
  });

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  redirect(`/admin/empreendimentos/${empreendimentoId}`);
}

export async function excluirUnidade(empreendimentoId: string, unidadeId: string) {
  await requireAdmin();
  await prisma.unidade.delete({ where: { id: unidadeId } });
  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
}
