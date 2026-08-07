import { z } from "zod";

export const UNIDADE_STATUS = ["DISPONIVEL", "RESERVADO", "VENDIDO", "BLOQUEADO"] as const;

export const UnidadeSchema = z.object({
  identificador: z.string().min(1, { error: "Informe o identificador da unidade." }).trim(),
  tipo: z.string().min(1, { error: "Informe o tipo (ex.: 2 dormitórios)." }).trim(),
  areaPrivativa: z.coerce
    .number({ error: "Informe a área privativa." })
    .positive({ error: "A área deve ser maior que zero." }),
  vagas: z.coerce.number({ error: "Informe o número de vagas." }).int().min(0),
  areaGaragem: z.coerce
    .number({ error: "Informe a área da garagem." })
    .min(0, { error: "A área da garagem não pode ser negativa." }),
  andar: z.string().trim().optional().or(z.literal("")),
  preco: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    error: "Informe um preço válido (ex.: 350000.00).",
  }),
  status: z.enum(UNIDADE_STATUS, { error: "Selecione um status válido." }),
  motivo: z.string().trim().optional().or(z.literal("")),
});

export type UnidadeInput = z.infer<typeof UnidadeSchema>;
