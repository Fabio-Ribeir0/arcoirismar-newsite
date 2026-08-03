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
