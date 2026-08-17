import { z } from "zod";

export const UNIDADE_STATUS = [
  "DISPONIVEL",
  "RESERVADO",
  "VENDIDO",
  "BLOQUEADO",
  "DECORADO",
  "TROCA_AREA",
] as const;

export const UnidadeSchema = z
  .object({
    identificador: z.string().min(1, { error: "Informe o identificador da unidade." }).trim(),
    dormitorios: z.coerce.number({ error: "Informe o número de dormitórios." }).int().min(0),
    suites: z.coerce.number({ error: "Informe o número de suítes." }).int().min(0),
    areaPrivativa: z.coerce
      .number({ error: "Informe a área privativa." })
      .positive({ error: "A área deve ser maior que zero." }),
    vagas: z.coerce.number({ error: "Informe o número de vagas." }).int().min(0),
    areaGaragem: z.coerce
      .number({ error: "Informe a área da garagem." })
      .min(0, { error: "A área da garagem não pode ser negativa." }),
    areaComum: z.coerce
      .number({ error: "Informe a área comum." })
      .min(0, { error: "A área comum não pode ser negativa." }),
    andar: z.string().trim().optional().or(z.literal("")),
    preco: z.string().regex(/^\d+(\.\d{1,2})?$/, {
      error: "Informe um preço válido (ex.: 350000.00).",
    }),
    status: z.enum(UNIDADE_STATUS, { error: "Selecione um status válido." }),
    motivo: z.string().trim().optional().or(z.literal("")),
  })
  .refine((data) => data.suites <= data.dormitorios, {
    error: "O número de suítes não pode ser maior que o de dormitórios.",
    path: ["suites"],
  });

export type UnidadeInput = z.infer<typeof UnidadeSchema>;
