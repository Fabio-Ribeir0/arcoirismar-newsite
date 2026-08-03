/** Padrão "aauu": aa = andar (sem zero à esquerda), uu = unidade no andar (2 dígitos). */
export function gerarIdentificadorUnidade(andar: number, unidadeNoAndar: number): string {
  return `${andar}${String(unidadeNoAndar).padStart(2, "0")}`;
}
