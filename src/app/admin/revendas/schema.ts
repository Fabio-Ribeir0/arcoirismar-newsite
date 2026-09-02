import { z } from "zod";

export const REVENDA_STATUS = ["DISPONIVEL", "RESERVADA", "VENDIDA"] as const;

export const REVENDA_STATUS_LABEL: Record<(typeof REVENDA_STATUS)[number], string> = {
  DISPONIVEL: "Disponível",
  RESERVADA: "Reservada",
  VENDIDA: "Vendida",
};

/** Classes escritas por extenso — o Tailwind só gera CSS de classe que aparece literal no código. */
export const REVENDA_STATUS_STYLE: Record<string, string> = {
  DISPONIVEL: "bg-green-100 text-green-700",
  RESERVADA: "bg-blue-100 text-blue-700",
  VENDIDA: "bg-ink/10 text-ink/60",
};

export const TEMPLATE_REVENDA_OPCOES = [
  "EDITORIAL",
  "INFOGRAFICO",
  "BROCHURA",
  "CARTAZ",
  "MOSAICO",
  "DUPLA",
] as const;

export const TEMPLATE_REVENDA_LABEL: Record<(typeof TEMPLATE_REVENDA_OPCOES)[number], string> = {
  EDITORIAL: "Editorial",
  INFOGRAFICO: "Infográfico",
  BROCHURA: "Brochura",
  CARTAZ: "Cartaz",
  MOSAICO: "Mosaico",
  DUPLA: "Dupla (split)",
};

const opcional = z.string().trim().optional().or(z.literal(""));

const inteiroOpcional = z
  .string()
  .trim()
  .regex(/^\d+$/, { error: "Informe um número inteiro." })
  .optional()
  .or(z.literal(""));

const coordenada = z
  .string()
  .trim()
  .regex(/^-?\d+(\.\d+)?$/, { error: "Coordenada inválida." })
  .optional()
  .or(z.literal(""));

export const RevendaSchema = z.object({
  nome: z.string().min(2, { error: "Informe o empreendimento ou tipo de construção." }).trim(),
  numeroUnidade: opcional,
  valor: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, { error: "Informe um valor válido (ex.: 350000.00)." }),
  status: z.enum(REVENDA_STATUS, { error: "Selecione um status válido." }),
  template: z.enum(TEMPLATE_REVENDA_OPCOES, { error: "Selecione um template." }),

  endereco: opcional,
  numeroEndereco: opcional,
  cep: opcional,
  bairro: opcional,
  cidade: opcional,
  estado: opcional,
  latitude: coordenada,
  longitude: coordenada,

  torre: opcional,
  tagline: opcional,

  areaPrivativa: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, { error: "Informe uma área válida (ex.: 73.5)." })
    .optional()
    .or(z.literal("")),
  dormitorios: inteiroOpcional,
  suites: inteiroOpcional,
  vagas: inteiroOpcional,
  andar: opcional,
  elevadores: inteiroOpcional,
  entregaPrevista: opcional,
  diferencial: opcional,

  descricao: opcional,
  amenidades: opcional,
  condicoesPagamento: opcional,
  localizacaoNota: opcional,

  informacoes: opcional,
});

export type RevendaInput = z.infer<typeof RevendaSchema>;
