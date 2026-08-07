import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SimuladorFinanciamento } from "./simulador";
import { calcularPlanoPagamentoUnidade } from "@/lib/plano-pagamento";
import { ExportarPdfButton } from "./exportar-pdf-button";
import type { UnidadeStatus } from "@/generated/prisma/client";

const UNIDADE_STATUS_LABEL: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  BLOQUEADO: "Bloqueado",
  DECORADO: "Decorado",
  TROCA_AREA: "Troca de área",
};

const UNIDADE_STATUS_STYLE: Record<string, string> = {
  DISPONIVEL: "bg-green-100 text-green-700",
  RESERVADO: "bg-blue-100 text-blue-700",
  VENDIDO: "bg-ink/10 text-ink/60",
  BLOQUEADO: "bg-red-100 text-red-700",
  DECORADO: "bg-accent/20 text-accent",
  TROCA_AREA: "bg-purple-100 text-purple-700",
};

// A lista da área do corretor só mostra unidades que ainda estão em jogo —
// vendidas/bloqueadas/em troca de área não interessam pra quem está
// oferecendo ao cliente. Decorado aparece (sem valores, como Reservado).
const STATUS_VISIVEIS_NA_LISTA: UnidadeStatus[] = ["DISPONIVEL", "RESERVADO", "DECORADO"];

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default async function EmpreendimentoCorretorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id },
    include: { unidades: { orderBy: [{ andar: "asc" }, { identificador: "asc" }] } },
  });

  if (!empreendimento) notFound();

  const configuracao = await prisma.configuracaoSimulacao.findFirst({
    orderBy: { criadoEm: "desc" },
  });

  const unidadesLista = empreendimento.unidades.filter((u) =>
    STATUS_VISIVEIS_NA_LISTA.includes(u.status)
  );
  const unidadesDisponiveis = empreendimento.unidades.filter((u) => u.status !== "VENDIDO");

  const podeCalcularPlano =
    empreendimento.parcelas !== null &&
    empreendimento.entradaPercentual !== null &&
    empreendimento.entregaChavesPercentual !== null;
  const prestacoesLabel = podeCalcularPlano ? `${empreendimento.parcelas}x` : null;

  return (
    <main className="px-6 py-16">
      {empreendimento.capaTabelaUrl && (
        <div className="print-cover">
          {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL, print-only cover */}
          <img src={empreendimento.capaTabelaUrl} alt="" />
        </div>
      )}
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-medium text-primary">
              {empreendimento.nome}
            </h1>
            <p className="mt-1 text-sm text-ink/60">
              {[empreendimento.bairro, empreendimento.cidade].filter(Boolean).join(", ")}
            </p>
          </div>
          <ExportarPdfButton />
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-mist text-left text-ink/60">
              <tr>
                <th rowSpan={2} className="px-4 py-3 align-middle font-medium">
                  Apto
                </th>
                <th rowSpan={2} className="border-l border-line px-4 py-3 align-middle font-medium">
                  Área Priv.
                </th>
                <th colSpan={2} className="border-l border-line px-4 py-1.5 text-center font-medium">
                  Garagem
                </th>
                <th rowSpan={2} className="border-l border-line px-4 py-3 align-middle font-medium">
                  Área Total
                </th>
                <th rowSpan={2} className="border-l border-line px-4 py-3 align-middle font-medium">
                  Preço
                </th>
                <th rowSpan={2} className="border-l border-line px-4 py-3 align-middle font-medium">
                  Entrada
                </th>
                <th rowSpan={2} className="border-l border-line px-4 py-3 align-middle font-medium">
                  Entrega
                </th>
                <th rowSpan={2} className="border-l border-line px-4 py-3 align-middle font-medium">
                  Prestações
                </th>
                <th rowSpan={2} className="border-l border-line px-4 py-3 align-middle font-medium">
                  Status
                </th>
              </tr>
              <tr>
                <th className="border-l border-line px-4 py-1.5 text-xs font-normal text-ink/50">
                  Vagas
                </th>
                <th className="border-l border-line px-4 py-1.5 text-xs font-normal text-ink/50">
                  Área (m²)
                </th>
              </tr>
            </thead>
            <tbody>
              {unidadesLista.map((unidade) => {
                const preco = Number(unidade.preco);
                const ocultarValores = unidade.status === "RESERVADO" || unidade.status === "DECORADO";
                const plano =
                  podeCalcularPlano && !ocultarValores
                    ? calcularPlanoPagamentoUnidade({
                        preco,
                        entradaPercentual: Number(empreendimento.entradaPercentual),
                        entregaChavesPercentual: Number(empreendimento.entregaChavesPercentual),
                        parcelas: empreendimento.parcelas!,
                      })
                    : null;
                const areaTotal = unidade.areaPrivativa + unidade.areaGaragem;

                return (
                  <tr key={unidade.id} className="border-t border-line">
                    <td className="px-4 py-3 font-medium text-primary">{unidade.identificador}</td>
                    <td className="border-l border-line px-4 py-3 text-ink/70">
                      {unidade.areaPrivativa} m²
                    </td>
                    <td className="border-l border-line px-4 py-3 text-ink/70">{unidade.vagas}</td>
                    <td className="border-l border-line px-4 py-3 text-ink/70">
                      {unidade.areaGaragem} m²
                    </td>
                    <td className="border-l border-line px-4 py-3 text-ink/70">{areaTotal} m²</td>
                    <td className="border-l border-line px-4 py-3 text-ink/70">
                      {ocultarValores ? "—" : formatCurrency(preco)}
                    </td>
                    <td className="border-l border-line px-4 py-3 text-ink/70">
                      {ocultarValores || !plano ? "—" : formatCurrency(plano.valorEntrada)}
                    </td>
                    <td className="border-l border-line px-4 py-3 text-ink/70">
                      {ocultarValores || !plano ? "—" : formatCurrency(plano.valorChaves)}
                    </td>
                    <td className="border-l border-line px-4 py-3 text-ink/70">
                      {ocultarValores || !prestacoesLabel ? "—" : prestacoesLabel}
                    </td>
                    <td className="border-l border-line px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${UNIDADE_STATUS_STYLE[unidade.status]}`}
                      >
                        {UNIDADE_STATUS_LABEL[unidade.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {unidadesLista.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-ink/50">
                    Nenhuma unidade disponível no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {configuracao && unidadesDisponiveis.length > 0 ? (
          <div className="no-print">
            <SimuladorFinanciamento
              unidades={unidadesDisponiveis.map((u) => ({
                id: u.id,
                identificador: u.identificador,
                preco: Number(u.preco),
              }))}
              configuracao={{
                taxaJurosAnual: Number(configuracao.taxaJurosAnual),
                prazoMaximoMeses: configuracao.prazoMaximoMeses,
                entradaMinimaPercentual: Number(configuracao.entradaMinimaPercentual),
                sistemaAmortizacao: configuracao.sistemaAmortizacao,
              }}
            />
          </div>
        ) : (
          <p className="no-print text-sm text-ink/50">
            {configuracao
              ? "Nenhuma unidade disponível para simulação neste empreendimento."
              : "Simulação de financiamento ainda não configurada pelo admin."}
          </p>
        )}
      </div>
    </main>
  );
}
