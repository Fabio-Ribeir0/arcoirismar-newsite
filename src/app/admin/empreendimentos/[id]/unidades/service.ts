import { Prisma, type UnidadeStatus } from "@/generated/prisma/client";

/**
 * Writes HistoricoPrecoUnidade/HistoricoStatusUnidade rows for whichever of
 * preço/status actually changed. Shared by the single-unit and bulk edit
 * actions so both stay in sync with the same "what counts as a change" rule.
 */
export async function registrarHistoricoUnidade(
  tx: Prisma.TransactionClient,
  params: {
    unidadeId: string;
    precoAnterior: Prisma.Decimal;
    precoNovo?: string;
    statusAnterior: UnidadeStatus;
    statusNovo?: UnidadeStatus;
    autorId: string;
    motivo: string | null;
  }
) {
  const { unidadeId, precoAnterior, precoNovo, statusAnterior, statusNovo, autorId, motivo } = params;

  // Compare numerically, not as strings — "350000" and "350000.00" are the
  // same price but would otherwise register as a spurious history entry.
  if (precoNovo !== undefined && Number(precoAnterior) !== Number(precoNovo)) {
    await tx.historicoPrecoUnidade.create({
      data: { unidadeId, precoAnterior, precoNovo, autorId, motivo },
    });
  }

  if (statusNovo !== undefined && statusAnterior !== statusNovo) {
    await tx.historicoStatusUnidade.create({
      data: { unidadeId, statusAnterior, statusNovo, autorId, motivo },
    });
  }
}

/**
 * Batch version for the "editar selecionadas" flow — writes history for many
 * units with 2 createMany calls total instead of up to 2 queries per unit.
 * A per-unit loop inside an interactive transaction was blowing past
 * Prisma's default 5s transaction timeout once a selection got into the
 * dozens of units (each round trip to the pooled connection adds up).
 */
export async function registrarHistoricoUnidadesEmLote(
  tx: Prisma.TransactionClient,
  params: {
    unidades: { id: string; preco: Prisma.Decimal; status: UnidadeStatus }[];
    precoNovo?: string;
    statusNovo?: UnidadeStatus;
    autorId: string;
    motivo: string | null;
  }
) {
  const { unidades, precoNovo, statusNovo, autorId, motivo } = params;

  const historicoPrecos = [];
  const historicoStatus = [];

  for (const unidade of unidades) {
    if (precoNovo !== undefined && Number(unidade.preco) !== Number(precoNovo)) {
      historicoPrecos.push({
        unidadeId: unidade.id,
        precoAnterior: unidade.preco,
        precoNovo,
        autorId,
        motivo,
      });
    }
    if (statusNovo !== undefined && unidade.status !== statusNovo) {
      historicoStatus.push({
        unidadeId: unidade.id,
        statusAnterior: unidade.status,
        statusNovo,
        autorId,
        motivo,
      });
    }
  }

  if (historicoPrecos.length > 0) {
    await tx.historicoPrecoUnidade.createMany({ data: historicoPrecos });
  }
  if (historicoStatus.length > 0) {
    await tx.historicoStatusUnidade.createMany({ data: historicoStatus });
  }
}
