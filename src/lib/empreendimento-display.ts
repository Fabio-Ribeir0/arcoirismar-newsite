export const EMPREENDIMENTO_STATUS_LABEL: Record<string, string> = {
  EM_BREVE: "Em breve",
  LANCAMENTO: "Lançamento",
  EM_OBRAS: "Em obras",
  PRONTO: "Pronto para morar",
};

export function subtituloEmpreendimento(params: {
  totalUnidades: number;
  entregaPrevista: Date | null;
}): string {
  const { totalUnidades, entregaPrevista } = params;
  const partes: string[] = [];

  if (totalUnidades > 0) {
    partes.push(`${totalUnidades} unidade${totalUnidades > 1 ? "s" : ""}`);
  }

  if (entregaPrevista) {
    partes.push(`Entrega ${entregaPrevista.getFullYear()}`);
  }

  return partes.join(" · ") || "Em breve mais informações";
}

/** "BAIRRO | CIDADE" para o eyebrow do banner/hero — cai para o status se nenhum dos dois estiver preenchido. */
export function eyebrowEmpreendimento(params: {
  bairro: string | null;
  cidade: string | null;
  status: string;
}): string {
  const { bairro, cidade, status } = params;
  const partes = [bairro, cidade].filter(Boolean);
  if (partes.length === 0) return EMPREENDIMENTO_STATUS_LABEL[status].toUpperCase();
  return partes.join(" | ").toUpperCase();
}
