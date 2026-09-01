export type FotoRevendaTemplate = {
  url: string;
  legenda: string | null;
};

/** Dados já normalizados (sem `Decimal`/`null` do Prisma cru) que qualquer um dos 6 templates consome. */
export type UnidadeRevendaTemplateData = {
  nome: string;
  numeroUnidade: string | null;
  torre: string | null;
  tagline: string | null;

  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  endereco: string | null;
  numeroEndereco: string | null;
  localizacaoNota: string | null;

  valor: number;

  areaPrivativa: number | null;
  dormitorios: number | null;
  suites: number | null;
  vagas: number | null;
  andar: string | null;
  elevadores: number | null;
  entregaPrevista: string | null;
  diferencial: string | null;

  descricao: string | null;
  /// Já quebrado em linhas — uma amenidade/condição por item.
  amenidades: string[];
  condicoesPagamento: string[];

  corretorNome: string | null;
  corretorTelefone: string | null;
  corretorEmail: string | null;

  fotos: FotoRevendaTemplate[];
};
