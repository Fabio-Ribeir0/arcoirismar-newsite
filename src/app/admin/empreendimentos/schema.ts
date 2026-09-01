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
  espelhoVenda: z.string().optional().or(z.literal("")),
  slogan: z.string().trim().optional().or(z.literal("")),
  descricao: z.string().trim().optional().or(z.literal("")),
  endereco: z.string().trim().optional().or(z.literal("")),
  bairro: z.string().trim().optional().or(z.literal("")),
  cidade: z.string().trim().optional().or(z.literal("")),
  estado: z.string().trim().optional().or(z.literal("")),
  cep: z.string().trim().optional().or(z.literal("")),
  latitude: z
    .string()
    .trim()
    .regex(/^-?\d+(\.\d+)?$/, { error: "Coordenada inválida." })
    .optional()
    .or(z.literal("")),
  longitude: z
    .string()
    .trim()
    .regex(/^-?\d+(\.\d+)?$/, { error: "Coordenada inválida." })
    .optional()
    .or(z.literal("")),
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
  dormitoriosPadrao: z
    .string()
    .trim()
    .regex(/^\d+$/, { error: "Informe um número inteiro." })
    .optional()
    .or(z.literal("")),
  suitesPadrao: z
    .string()
    .trim()
    .regex(/^\d+$/, { error: "Informe um número inteiro." })
    .optional()
    .or(z.literal("")),
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

  motivo: z.string().trim().optional().or(z.literal("")),
})
  .refine(
    (data) =>
      !data.dormitoriosPadrao || !data.suitesPadrao || Number(data.suitesPadrao) <= Number(data.dormitoriosPadrao),
    {
      error: "O número de suítes não pode ser maior que o de dormitórios.",
      path: ["suitesPadrao"],
    }
  );

export type EmpreendimentoInput = z.infer<typeof EmpreendimentoSchema>;

export const PERIODICIDADE_OPCOES = [
  "ATO_ASSINATURA",
  "ATO_ENTREGA_CHAVES",
  "MENSAL",
  "BIMESTRAL",
  "TRIMESTRAL",
  "SEMESTRAL",
  "ANUAL",
] as const;

export const CondicaoPagamentoSchema = z.object({
  rotulo: z.string().trim().optional().or(z.literal("")),
  periodicidade: z.enum(PERIODICIDADE_OPCOES, { error: "Selecione quando esta condição é cobrada." }),
  quantidade: z
    .string()
    .trim()
    .regex(/^\d+$/, { error: "Informe um número inteiro." }),
  valor: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, { error: "Informe um valor válido (ex.: 20.00)." }),
  tipoValor: z.enum(["PERCENTUAL", "FIXO"]),
  ordem: z
    .string()
    .trim()
    .regex(/^\d+$/, { error: "Informe um número inteiro." })
    .optional()
    .or(z.literal("")),
  motivo: z.string().trim().optional().or(z.literal("")),
});

export type CondicaoPagamentoInput = z.infer<typeof CondicaoPagamentoSchema>;
