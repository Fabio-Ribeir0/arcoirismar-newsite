/** Forma serializável de uma unidade de revenda, do server component para o cliente. */
export type UnidadeRevendaRow = {
  id: string;
  nome: string;
  numeroUnidade: string | null;
  valor: string;
  status: string;

  endereco: string | null;
  numeroEndereco: string | null;
  cep: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  latitude: string | null;
  longitude: string | null;

  cabecalhoHtml: string;
  sobreHtml: string;
  financeiroHtml: string;
  infoAdicionaisHtml: string;
  rodapeHtml: string;
};

export type ConfiguracaoRevendaRow = {
  capaTabelaUrl: string | null;
  linkMidiaPublica: string | null;
  tabelaPdfUrl: string | null;
  tabelaPdfGeradoEm: string | null;
};
