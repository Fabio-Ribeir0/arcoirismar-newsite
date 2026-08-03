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
