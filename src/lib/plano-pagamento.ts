/** Plano de pagamento direto com a construtora (entrada + chaves + parcelas), sem juros. */
export function calcularParcelaPlanoDireto({
  preco,
  entradaPercentual,
  entregaChavesPercentual,
  parcelas,
}: {
  preco: number;
  entradaPercentual: number;
  entregaChavesPercentual: number;
  parcelas: number;
}): number {
  if (parcelas <= 0) return 0;
  const valorEntrada = preco * (entradaPercentual / 100);
  const valorChaves = preco * (entregaChavesPercentual / 100);
  const saldo = Math.max(0, preco - valorEntrada - valorChaves);
  return saldo / parcelas;
}
