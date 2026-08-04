import { z } from "zod";

export const EMPREENDIMENTO_STATUS = [
  "EM_BREVE",
  "LANCAMENTO",
  "EM_OBRAS",
  "PRONTO",
] as const;

export const DESTAQUE_OPCOES = ["NENHUM", "PORTFOLIO", "CARROSSEL"] as const;

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
  destaque: z.enum(DESTAQUE_OPCOES, { error: "Selecione uma opção de destaque válida." }),
  slogan: z.string().trim().optional().or(z.literal("")),
  descricao: z.string().trim().optional().or(z.literal("")),
  endereco: z.string().trim().optional().or(z.literal("")),
  bairro: z.string().trim().optional().or(z.literal("")),
  cidade: z.string().trim().optional().or(z.literal("")),
  estado: z.string().trim().optional().or(z.literal("")),
  cep: z.string().trim().optional().or(z.literal("")),
  entregaPrevista: z.string().trim().optional().or(z.literal("")),

  // Geração de unidades em lote (todos opcionais — só exigidos ao clicar em "Gerar unidades")
  andares: z
    .string()
    .trim()
    .regex(/^\d+$/, { error: "Informe um número inteiro." })
    .optional()
    .or(z.literal("")),
  unidadesPorAndar: z
    .string()
    .trim()
    .regex(/^\d+$/, { error: "Informe um número inteiro." })
    .optional()
    .or(z.literal("")),
  valorBase: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, { error: "Informe um valor válido (ex.: 350000.00)." })
    .optional()
    .or(z.literal("")),
  entradaPercentual: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, { error: "Informe um percentual válido (ex.: 20.00)." })
    .optional()
    .or(z.literal("")),
  entregaChavesPercentual: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, { error: "Informe um percentual válido (ex.: 10.00)." })
    .optional()
    .or(z.literal("")),
  parcelas: z
    .string()
    .trim()
    .regex(/^\d+$/, { error: "Informe um número inteiro." })
    .optional()
    .or(z.literal("")),
  tipoPadrao: z.string().trim().optional().or(z.literal("")),
  areaPrivativaPadrao: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, { error: "Informe um valor válido (ex.: 65.00)." })
    .optional()
    .or(z.literal("")),
  vagasPadrao: z
    .string()
    .trim()
    .regex(/^\d+$/, { error: "Informe um número inteiro." })
    .optional()
    .or(z.literal("")),
});

export type EmpreendimentoInput = z.infer<typeof EmpreendimentoSchema>;
