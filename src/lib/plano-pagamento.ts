type PlanoPagamentoInput = {
  preco: number;
  entradaPercentual: number;
  entregaChavesPercentual: number;
  parcelas: number;
};

/** Plano de pagamento direto com a construtora (entrada + chaves + parcelas), sem juros. */
export function calcularParcelaPlanoDireto({
  preco,
  entradaPercentual,
  entregaChavesPercentual,
  parcelas,
}: PlanoPagamentoInput): number {
  if (parcelas <= 0) return 0;
  const valorEntrada = preco * (entradaPercentual / 100);
  const valorChaves = preco * (entregaChavesPercentual / 100);
  const saldo = Math.max(0, preco - valorEntrada - valorChaves);
  return saldo / parcelas;
}

/** Mesmo cálculo, mas retornando o valor de entrada e de chaves também (não só a parcela). */
export function calcularPlanoPagamentoUnidade({
  preco,
  entradaPercentual,
  entregaChavesPercentual,
  parcelas,
}: PlanoPagamentoInput) {
  return {
    valorEntrada: preco * (entradaPercentual / 100),
    valorChaves: preco * (entregaChavesPercentual / 100),
    valorParcela: calcularParcelaPlanoDireto({
      preco,
      entradaPercentual,
      entregaChavesPercentual,
      parcelas,
    }),
  };
}
