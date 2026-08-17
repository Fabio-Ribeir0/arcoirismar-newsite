"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import type { UnidadeStatus } from "@/generated/prisma/client";
import { registrarHistoricoUnidade } from "../empreendimentos/[id]/unidades/service";

export type AtualizarStatusEspelhoState =
  | { success: true }
  | { success: false; message: string };

export async function atualizarStatusUnidadeEspelho(
  unidadeId: string,
  novoStatus: UnidadeStatus,
  motivo: string
): Promise<AtualizarStatusEspelhoState> {
  const admin = await requireAdmin();

  const atual = await prisma.unidade.findUnique({ where: { id: unidadeId } });
  if (!atual) {
    return { success: false, message: "Unidade não encontrada." };
  }

  if (atual.status === novoStatus) {
    return {
      success: false,
      message: "Selecione um status diferente do atual para registrar a alteração.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.unidade.update({ where: { id: unidadeId }, data: { status: novoStatus } });

    await registrarHistoricoUnidade(tx, {
      unidadeId,
      precoAnterior: atual.preco,
      statusAnterior: atual.status,
      statusNovo: novoStatus,
      autorId: admin.id,
      motivo: motivo.trim() || null,
    });
  });

  revalidatePath("/admin/espelho-venda");
  return { success: true };
}
