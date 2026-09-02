import type { TEMPLATE_REVENDA_OPCOES } from "./schema";

export type FotoRevendaRow = {
  id: string;
  url: string;
  legenda: string | null;
  ordem: number;
};

/** Forma serializável de uma unidade de revenda, do server component para o cliente. */
export type UnidadeRevendaRow = {
  id: string;
  nome: string;
  numeroUnidade: string | null;
  valor: string;
  status: string;
  template: (typeof TEMPLATE_REVENDA_OPCOES)[number];

  endereco: string | null;
  numeroEndereco: string | null;
  cep: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  latitude: string | null;
  longitude: string | null;

  torre: string | null;
  tagline: string | null;

  areaPrivativa: string | null;
  dormitorios: number | null;
  suites: number | null;
  vagas: number | null;
  andar: string | null;
  elevadores: number | null;
  entregaPrevista: string | null;
  diferencial: string | null;

  descricao: string | null;
  amenidades: string | null;
  condicoesPagamento: string | null;
  localizacaoNota: string | null;

  informacoes: string | null;

  fotos: FotoRevendaRow[];
};

export type ConfiguracaoRevendaRow = {
  capaTabelaUrl: string | null;
  linkMidiaPublica: string | null;
  tabelaPdfUrl: string | null;
  tabelaPdfGeradoEm: string | null;
};
