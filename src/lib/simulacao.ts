export type SistemaAmortizacao = "SAC" | "PRICE";

export interface ResultadoSimulacao {
  sistema: SistemaAmortizacao;
  valorFinanciado: number;
  taxaMensal: number;
  numeroParcelas: number;
  primeiraParcela: number;
  ultimaParcela: number;
  valorTotal: number;
}

export function taxaAnualParaMensal(taxaAnualPercentual: number): number {
  const taxaAnual = taxaAnualPercentual / 100;
  return Math.pow(1 + taxaAnual, 1 / 12) - 1;
}

export function simularFinanciamento({
  valorImovel,
  entradaPercentual,
  numeroParcelas,
  taxaJurosAnual,
  sistema,
}: {
  valorImovel: number;
  entradaPercentual: number;
  numeroParcelas: number;
  taxaJurosAnual: number;
  sistema: SistemaAmortizacao;
}): ResultadoSimulacao {
  const valorEntrada = valorImovel * (entradaPercentual / 100);
  const valorFinanciado = Math.max(0, valorImovel - valorEntrada);
  const taxaMensal = taxaAnualParaMensal(taxaJurosAnual);

  if (sistema === "PRICE") {
    const parcela =
      taxaMensal === 0
        ? valorFinanciado / numeroParcelas
        : (valorFinanciado * taxaMensal * Math.pow(1 + taxaMensal, numeroParcelas)) /
          (Math.pow(1 + taxaMensal, numeroParcelas) - 1);

    return {
      sistema,
      valorFinanciado,
      taxaMensal,
      numeroParcelas,
      primeiraParcela: parcela,
      ultimaParcela: parcela,
      valorTotal: parcela * numeroParcelas,
    };
  }

  // SAC: amortização constante, parcela decrescente.
  const amortizacao = valorFinanciado / numeroParcelas;
  let saldoDevedor = valorFinanciado;
  let total = 0;
  let primeiraParcela = 0;
  let ultimaParcela = 0;

  for (let mes = 1; mes <= numeroParcelas; mes++) {
    const juros = saldoDevedor * taxaMensal;
    const parcela = amortizacao + juros;
    if (mes === 1) primeiraParcela = parcela;
    if (mes === numeroParcelas) ultimaParcela = parcela;
    total += parcela;
    saldoDevedor -= amortizacao;
  }

  return {
    sistema,
    valorFinanciado,
    taxaMensal,
    numeroParcelas,
    primeiraParcela,
    ultimaParcela,
    valorTotal: total,
  };
}
