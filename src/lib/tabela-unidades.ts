import type { Empreendimento, Unidade, UnidadeStatus } from "@/generated/prisma/client";
import { calcularPlanoPagamentoUnidade } from "./plano-pagamento";

export const UNIDADE_STATUS_LABEL: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  BLOQUEADO: "Bloqueado",
  DECORADO: "Decorado",
  TROCA_AREA: "Troca de área",
};

/** Equivalente hex dos badges Tailwind (bg/text) — usado na geração do PDF, fora do CSS do site. */
export const UNIDADE_STATUS_CORES: Record<string, { fundo: string; texto: string }> = {
  DISPONIVEL: { fundo: "#dcfce7", texto: "#15803d" },
  RESERVADO: { fundo: "#dbeafe", texto: "#1d4ed8" },
  VENDIDO: { fundo: "rgba(60,63,64,0.1)", texto: "rgba(60,63,64,0.6)" },
  BLOQUEADO: { fundo: "#fee2e2", texto: "#b91c1c" },
  DECORADO: { fundo: "rgba(194,165,88,0.2)", texto: "#c2a558" },
  TROCA_AREA: { fundo: "#f3e8ff", texto: "#7e22ce" },
};

/** Mesmas cores acima, como classes Tailwind — usado em telas do admin (fora do PDF). */
export const UNIDADE_STATUS_STYLE: Record<string, string> = {
  DISPONIVEL: "bg-green-100 text-green-700",
  RESERVADO: "bg-blue-100 text-blue-700",
  VENDIDO: "bg-ink/10 text-ink/60",
  BLOQUEADO: "bg-red-100 text-red-700",
  DECORADO: "bg-accent/20 text-accent",
  TROCA_AREA: "bg-purple-100 text-purple-700",
};

// Classes escritas por extenso (não construídas via .replace() em runtime) —
// o Tailwind só gera CSS pra classes que aparecem como substring literal no
// código-fonte; uma string montada dinamicamente (ex.: "border-" + cor) nunca
// bate com nenhum arquivo escaneado e a classe sai sem estilo nenhum.
export const UNIDADE_STATUS_BORDA: Record<string, string> = {
  DISPONIVEL: "border-green-700",
  RESERVADO: "border-blue-700",
  VENDIDO: "border-ink/60",
  BLOQUEADO: "border-red-700",
  DECORADO: "border-accent",
  TROCA_AREA: "border-purple-700",
};

/** Fundo "vivo" — mesma cor da borda acima, mas usada como preenchimento sólido do bloco. */
export const UNIDADE_STATUS_VIVIDO: Record<string, string> = {
  DISPONIVEL: "bg-green-700",
  RESERVADO: "bg-blue-700",
  VENDIDO: "bg-ink/60",
  BLOQUEADO: "bg-red-700",
  DECORADO: "bg-accent",
  TROCA_AREA: "bg-purple-700",
};

/**
 * "3 dormitórios/2 suítes" — suíte é subconjunto de dormitório (nunca somado),
 * seguindo a convenção já usada nos dados cadastrados: X dormitórios no total,
 * dos quais Y têm banheiro privativo.
 */
export function formatTipoUnidade(dormitorios: number, suites: number): string {
  const dormLabel = `${dormitorios} dormitório${dormitorios === 1 ? "" : "s"}`;
  const suiteLabel = `${suites} suíte${suites === 1 ? "" : "s"}`;
  return `${dormLabel}/${suiteLabel}`;
}

// A lista da área do corretor só mostra unidades que ainda estão em jogo —
// vendidas/bloqueadas/em troca de área não interessam pra quem está
// oferecendo ao cliente. Decorado aparece (sem valores, como Reservado).
const STATUS_VISIVEIS_NA_LISTA: UnidadeStatus[] = ["DISPONIVEL", "RESERVADO", "DECORADO"];

export type LinhaTabelaUnidade = {
  id: string;
  identificador: string;
  areaPrivativa: number;
  vagas: number;
  areaGaragem: number;
  areaTotal: number;
  preco: number;
  status: string;
  /** Reservado/Decorado: valores de plano ficam ocultos, mostra o status no lugar. */
  oculto: boolean;
  valorEntrada: number | null;
  valorChaves: number | null;
  valorParcela: number | null;
};

/** Mesma seleção/cálculo usados na visualização em tela e na exportação em PDF, pra nunca divergir. */
export function montarLinhasTabelaUnidades(
  empreendimento: Pick<
    Empreendimento,
    "parcelas" | "entradaValor" | "entradaTipo" | "entregaChavesValor" | "entregaChavesTipo"
  >,
  unidades: Unidade[]
): LinhaTabelaUnidade[] {
  const podeCalcularPlano =
    empreendimento.parcelas !== null &&
    empreendimento.entradaValor !== null &&
    empreendimento.entregaChavesValor !== null;

  return unidades
    .filter((u) => STATUS_VISIVEIS_NA_LISTA.includes(u.status))
    .map((unidade) => {
      const preco = Number(unidade.preco);
      const oculto = unidade.status === "RESERVADO" || unidade.status === "DECORADO";
      const plano =
        podeCalcularPlano && !oculto
          ? calcularPlanoPagamentoUnidade({
              preco,
              entradaValor: Number(empreendimento.entradaValor),
              entradaTipo: empreendimento.entradaTipo,
              entregaChavesValor: Number(empreendimento.entregaChavesValor),
              entregaChavesTipo: empreendimento.entregaChavesTipo,
              parcelas: empreendimento.parcelas!,
            })
          : null;

      return {
        id: unidade.id,
        identificador: unidade.identificador,
        areaPrivativa: unidade.areaPrivativa,
        vagas: unidade.vagas,
        areaGaragem: unidade.areaGaragem,
        areaTotal: unidade.areaPrivativa + unidade.areaGaragem + unidade.areaComum,
        preco,
        status: unidade.status,
        oculto,
        valorEntrada: plano?.valorEntrada ?? null,
        valorChaves: plano?.valorChaves ?? null,
        valorParcela: plano?.valorParcela ?? null,
      };
    });
}
