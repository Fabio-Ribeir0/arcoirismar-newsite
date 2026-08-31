export const PAGINAS_ADMIN = [
  { chave: "empreendimentos", label: "Empreendimentos" },
  { chave: "revendas", label: "Revendas" },
  { chave: "corretores", label: "Corretores" },
  { chave: "configuracoes", label: "Empresa" },
  { chave: "administradores", label: "Administradores" },
  { chave: "espelho-venda", label: "Espelho de Venda" },
] as const;

export type PaginaAdmin = (typeof PAGINAS_ADMIN)[number]["chave"];
