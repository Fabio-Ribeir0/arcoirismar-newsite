import { z } from "zod";

export const SISTEMA_AMORTIZACAO = ["SAC", "PRICE"] as const;

export const ConfiguracaoSimulacaoSchema = z.object({
  taxaJurosAnual: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    error: "Informe uma taxa válida (ex.: 10.50).",
  }),
  prazoMaximoMeses: z.coerce
    .number({ error: "Informe o prazo máximo em meses." })
    .int()
    .positive({ error: "O prazo deve ser maior que zero." }),
  entradaMinimaPercentual: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    error: "Informe um percentual válido (ex.: 20.00).",
  }),
  sistemaAmortizacao: z.enum(SISTEMA_AMORTIZACAO, {
    error: "Selecione um sistema válido.",
  }),
});

export type ConfiguracaoSimulacaoInput = z.infer<typeof ConfiguracaoSimulacaoSchema>;
