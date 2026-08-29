import type { TipoValorPlano } from "@/generated/prisma/client";

type PlanoPagamentoInput = {
  preco: number;
  entradaValor: number;
  entradaTipo: TipoValorPlano;
  entregaChavesValor: number;
  entregaChavesTipo: TipoValorPlano;
  parcelas: number;
};

/** Percentual do preço, ou o próprio valor quando já é um valor fixo em R$. */
function valorAbsoluto(preco: number, valor: number, tipo: TipoValorPlano): number {
  return tipo === "PERCENTUAL" ? preco * (valor / 100) : valor;
}

/** Plano de pagamento direto com a construtora (entrada + chaves + parcelas), sem juros. */
export function calcularParcelaPlanoDireto({
  preco,
  entradaValor,
  entradaTipo,
  entregaChavesValor,
  entregaChavesTipo,
  parcelas,
}: PlanoPagamentoInput): number {
  if (parcelas <= 0) return 0;
  const valorEntrada = valorAbsoluto(preco, entradaValor, entradaTipo);
  const valorChaves = valorAbsoluto(preco, entregaChavesValor, entregaChavesTipo);
  const saldo = Math.max(0, preco - valorEntrada - valorChaves);
  return saldo / parcelas;
}

/** Mesmo cálculo, mas retornando o valor de entrada e de chaves também (não só a parcela). */
export function calcularPlanoPagamentoUnidade(input: PlanoPagamentoInput) {
  return {
    valorEntrada: valorAbsoluto(input.preco, input.entradaValor, input.entradaTipo),
    valorChaves: valorAbsoluto(input.preco, input.entregaChavesValor, input.entregaChavesTipo),
    valorParcela: calcularParcelaPlanoDireto(input),
  };
}
