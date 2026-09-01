import { Prisma, type CondicaoPagamentoEmpreendimento } from "@/generated/prisma/client";

type Numerico = Prisma.Decimal | string | number | null;

/** Compara numericamente (não como string), tratando null como "sem valor". */
export function diferente(a: Numerico, b: Numerico) {
  const numA = a === null ? null : Number(a);
  const numB = b === null ? null : Number(b);
  return numA !== numB;
}

/** Serializa uma lista de condições de forma estável (ordenada por id), pra comparar sem falso positivo por ordem de array. */
function normalizarCondicoes(condicoes: CondicaoPagamentoEmpreendimento[]) {
  return JSON.stringify(
    [...condicoes]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((c) => ({
        id: c.id,
        rotulo: c.rotulo,
        periodicidade: c.periodicidade,
        quantidade: c.quantidade,
        valor: c.valor.toString(),
        tipoValor: c.tipoValor,
      }))
  );
}

/**
 * Grava um snapshot completo do plano de pagamento (valor base + lista de condições de
 * pagamento) quando pelo menos um dos dois muda — uma linha por salvamento, não uma por
 * campo. Cada chamador (form principal do empreendimento ou as actions de condições)
 * passa inalterado o lado que ele não mexeu, buscado fresco do banco.
 */
export async function registrarHistoricoPlanoPagamento(
  tx: Prisma.TransactionClient,
  params: {
    empreendimentoId: string;
    valorBaseAnterior: Numerico;
    valorBaseNovo: Numerico;
    condicoesAnteriores: CondicaoPagamentoEmpreendimento[];
    condicoesNovas: CondicaoPagamentoEmpreendimento[];
    autorId: string;
    motivo: string | null;
  }
) {
  const { empreendimentoId, valorBaseAnterior, valorBaseNovo, condicoesAnteriores, condicoesNovas, autorId, motivo } =
    params;

  const mudou =
    diferente(valorBaseAnterior, valorBaseNovo) ||
    normalizarCondicoes(condicoesAnteriores) !== normalizarCondicoes(condicoesNovas);

  if (!mudou) return;

  await tx.historicoPlanoPagamentoEmpreendimento.create({
    data: {
      empreendimentoId,
      valorBaseAnterior,
      valorBaseNovo,
      condicoesAnteriores: condicoesAnteriores.map((c) => ({
        id: c.id,
        rotulo: c.rotulo,
        periodicidade: c.periodicidade,
        quantidade: c.quantidade,
        valor: c.valor.toString(),
        tipoValor: c.tipoValor,
      })),
      condicoesNovas: condicoesNovas.map((c) => ({
        id: c.id,
        rotulo: c.rotulo,
        periodicidade: c.periodicidade,
        quantidade: c.quantidade,
        valor: c.valor.toString(),
        tipoValor: c.tipoValor,
      })),
      autorId,
      motivo,
    },
  });
}
