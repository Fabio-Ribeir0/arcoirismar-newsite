import { Prisma, type TipoValorPlano } from "@/generated/prisma/client";

type Numerico = Prisma.Decimal | string | number | null;

type PlanoPagamentoValores = {
  valorBase: Numerico;
  entradaValor: Numerico;
  entradaTipo: TipoValorPlano;
  entregaChavesValor: Numerico;
  entregaChavesTipo: TipoValorPlano;
  parcelas: Numerico;
};

/** Compara numericamente (não como string), tratando null como "sem valor". */
export function diferente(a: Numerico, b: Numerico) {
  const numA = a === null ? null : Number(a);
  const numB = b === null ? null : Number(b);
  return numA !== numB;
}

/**
 * Grava um snapshot completo do plano de pagamento (valor base, entrada,
 * entrega das chaves, parcelas) quando pelo menos um desses campos muda —
 * uma linha por salvamento, não uma por campo, porque os 4 juntos formam o
 * plano usado por calcularParcelaPlanoDireto. Trocar entre % e R$ fixo conta
 * como mudança mesmo que o número digitado seja o mesmo.
 */
export async function registrarHistoricoPlanoPagamento(
  tx: Prisma.TransactionClient,
  params: {
    empreendimentoId: string;
    anterior: PlanoPagamentoValores;
    novo: PlanoPagamentoValores;
    autorId: string;
    motivo: string | null;
  }
) {
  const { empreendimentoId, anterior, novo, autorId, motivo } = params;

  const mudou =
    diferente(anterior.valorBase, novo.valorBase) ||
    diferente(anterior.entradaValor, novo.entradaValor) ||
    anterior.entradaTipo !== novo.entradaTipo ||
    diferente(anterior.entregaChavesValor, novo.entregaChavesValor) ||
    anterior.entregaChavesTipo !== novo.entregaChavesTipo ||
    diferente(anterior.parcelas, novo.parcelas);

  if (!mudou) return;

  await tx.historicoPlanoPagamentoEmpreendimento.create({
    data: {
      empreendimentoId,
      valorBaseAnterior: anterior.valorBase,
      valorBaseNovo: novo.valorBase,
      entradaValorAnterior: anterior.entradaValor,
      entradaValorNovo: novo.entradaValor,
      entradaTipoAnterior: anterior.entradaTipo,
      entradaTipoNovo: novo.entradaTipo,
      entregaChavesValorAnterior: anterior.entregaChavesValor,
      entregaChavesValorNovo: novo.entregaChavesValor,
      entregaChavesTipoAnterior: anterior.entregaChavesTipo,
      entregaChavesTipoNovo: novo.entregaChavesTipo,
      parcelasAnterior: anterior.parcelas === null ? null : Number(anterior.parcelas),
      parcelasNovo: novo.parcelas === null ? null : Number(novo.parcelas),
      autorId,
      motivo,
    },
  });
}
