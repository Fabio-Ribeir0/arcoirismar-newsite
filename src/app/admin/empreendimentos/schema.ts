import { z } from "zod";

export const EMPREENDIMENTO_STATUS = [
  "EM_BREVE",
  "LANCAMENTO",
  "EM_OBRAS",
  "PRONTO",
] as const;

export const EmpreendimentoSchema = z.object({
  nome: z.string().min(2, { error: "Informe o nome do empreendimento." }).trim(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
      error: "Use apenas letras minúsculas, números e hífens.",
    })
    .optional()
    .or(z.literal("")),
  status: z.enum(EMPREENDIMENTO_STATUS, { error: "Selecione um status válido." }),
  descricao: z.string().trim().optional().or(z.literal("")),
  endereco: z.string().trim().optional().or(z.literal("")),
  bairro: z.string().trim().optional().or(z.literal("")),
  cidade: z.string().trim().optional().or(z.literal("")),
  estado: z.string().trim().optional().or(z.literal("")),
  cep: z.string().trim().optional().or(z.literal("")),
  entregaPrevista: z.string().trim().optional().or(z.literal("")),
});

export type EmpreendimentoInput = z.infer<typeof EmpreendimentoSchema>;
