import type { PeriodicidadeCondicao, TipoValorPlano } from "@/generated/prisma/client";

export const PERIODICIDADE_LABEL: Record<PeriodicidadeCondicao, string> = {
  ATO_ASSINATURA: "Entrada",
  ATO_ENTREGA_CHAVES: "Entrega das chaves",
  MENSAL: "Parcelas mensais",
  BIMESTRAL: "Parcelas bimestrais",
  TRIMESTRAL: "Parcelas trimestrais",
  SEMESTRAL: "Parcelas semestrais",
  ANUAL: "Parcelas anuais",
};

/** As duas periodicidades de pagamento único — sempre 1x, não são séries recorrentes. */
export const PERIODICIDADES_ATO: PeriodicidadeCondicao[] = ["ATO_ASSINATURA", "ATO_ENTREGA_CHAVES"];

/** Abreviação curta das periodicidades recorrentes, pra resumos compactos em tela. */
export const PERIODICIDADE_ABREVIACAO: Partial<Record<PeriodicidadeCondicao, string>> = {
  MENSAL: "mês",
  BIMESTRAL: "bim.",
  TRIMESTRAL: "trim.",
  SEMESTRAL: "sem.",
  ANUAL: "ano",
};

export type CondicaoPagamento = {
  id: string;
  rotulo: string | null;
  periodicidade: PeriodicidadeCondicao;
  quantidade: number;
  /** Nulo quando `restante` é true — nesse caso o valor é sempre calculado. */
  valor: number | null;
  tipoValor: TipoValorPlano;
  /** Quando true, ignora `valor`/`tipoValor`: o valor de cada parcela vira o que sobrar
   *  do preço depois de todas as outras condições, dividido pela quantidade. */
  restante: boolean;
};

/** Percentual do preço, ou o próprio valor quando já é um valor fixo em R$. */
export function valorAbsoluto(preco: number, valor: number, tipo: TipoValorPlano): number {
  return tipo === "PERCENTUAL" ? preco * (valor / 100) : valor;
}

export type CondicaoPagamentoCalculada = CondicaoPagamento & {
  rotuloExibicao: string;
  /** Valor de cada parcela desta condição, já convertido pro preço da unidade. */
  valorParcela: number;
  /** valorParcela × quantidade. */
  valorTotal: number;
};

/**
 * Aplica a lista de condições de pagamento do empreendimento ao preço de uma unidade.
 * Duas passadas: primeiro soma o comprometido pelas condições com valor explícito, depois
 * divide o que sobrar do preço entre as condições marcadas como `restante` (se houver mais
 * de uma, cada uma recebe uma fração do saldo proporcional à sua própria quantidade — o caso
 * comum é ter só uma).
 */
export function calcularCondicoesPagamentoUnidade(
  preco: number,
  condicoes: CondicaoPagamento[]
): CondicaoPagamentoCalculada[] {
  const explicitas = condicoes.filter((c) => !c.restante);
  const comprometido = explicitas.reduce(
    (soma, c) => soma + valorAbsoluto(preco, c.valor ?? 0, c.tipoValor) * c.quantidade,
    0
  );
  const quantidadeTotalRestante = condicoes
    .filter((c) => c.restante)
    .reduce((soma, c) => soma + c.quantidade, 0);
  const saldo = Math.max(0, preco - comprometido);
  const valorParcelaRestante = quantidadeTotalRestante > 0 ? saldo / quantidadeTotalRestante : 0;

  return condicoes.map((c) => {
    const valorParcela = c.restante ? valorParcelaRestante : valorAbsoluto(preco, c.valor ?? 0, c.tipoValor);
    return {
      ...c,
      rotuloExibicao: c.rotulo ?? PERIODICIDADE_LABEL[c.periodicidade],
      valorParcela,
      valorTotal: valorParcela * c.quantidade,
    };
  });
}
