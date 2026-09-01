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
  valor: number;
  tipoValor: TipoValorPlano;
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

/** Aplica a lista de condições de pagamento do empreendimento ao preço de uma unidade. */
export function calcularCondicoesPagamentoUnidade(
  preco: number,
  condicoes: CondicaoPagamento[]
): CondicaoPagamentoCalculada[] {
  return condicoes.map((c) => {
    const valorParcela = valorAbsoluto(preco, c.valor, c.tipoValor);
    return {
      ...c,
      rotuloExibicao: c.rotulo ?? PERIODICIDADE_LABEL[c.periodicidade],
      valorParcela,
      valorTotal: valorParcela * c.quantidade,
    };
  });
}
