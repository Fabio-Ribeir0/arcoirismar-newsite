import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SimuladorFinanciamento } from "./simulador";
import { calcularParcelaPlanoDireto } from "@/lib/plano-pagamento";

const UNIDADE_STATUS_LABEL: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  BLOQUEADO: "Bloqueado",
};

const UNIDADE_STATUS_STYLE: Record<string, string> = {
  DISPONIVEL: "bg-green-100 text-green-700",
  RESERVADO: "bg-accent/20 text-accent",
  VENDIDO: "bg-ink/10 text-ink/60",
  BLOQUEADO: "bg-red-100 text-red-700",
};

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

  const unidadesDisponiveis = empreendimento.unidades.filter((u) => u.status !== "VENDIDO");

  const podeCalcularParcela =
    empreendimento.parcelas !== null &&
    empreendimento.entradaPercentual !== null &&
    empreendimento.entregaChavesPercentual !== null;
  const parcelasLabel = podeCalcularParcela ? `${empreendimento.parcelas}x` : null;

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-medium text-primary">
            {empreendimento.nome}
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            {[empreendimento.bairro, empreendimento.cidade].filter(Boolean).join(", ")}
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-mist text-left text-ink/60">
              <tr>
                <th className="px-4 py-3 font-medium">Unidade</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Área</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                {parcelasLabel && <th className="px-4 py-3 font-medium">{parcelasLabel}</th>}
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {empreendimento.unidades.map((unidade) => (
                <tr key={unidade.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium text-primary">
                    {unidade.identificador}
                    {unidade.isDecorado && (
                      <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">
                        Decorado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink/70">{unidade.tipo}</td>
                  <td className="px-4 py-3 text-ink/70">{unidade.areaPrivativa} m²</td>
                  <td className="px-4 py-3 text-ink/70">
                    {Number(unidade.preco).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  {parcelasLabel && (
                    <td className="px-4 py-3 text-ink/70">
                      {calcularParcelaPlanoDireto({
                        preco: Number(unidade.preco),
                        entradaPercentual: Number(empreendimento.entradaPercentual),
                        entregaChavesPercentual: Number(empreendimento.entregaChavesPercentual),
                        parcelas: empreendimento.parcelas!,
                      }).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${UNIDADE_STATUS_STYLE[unidade.status]}`}
                    >
                      {UNIDADE_STATUS_LABEL[unidade.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {empreendimento.unidades.length === 0 && (
                <tr>
                  <td colSpan={parcelasLabel ? 6 : 5} className="px-4 py-8 text-center text-ink/50">
                    Nenhuma unidade cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {configuracao && unidadesDisponiveis.length > 0 ? (
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
        ) : (
          <p className="text-sm text-ink/50">
            {configuracao
              ? "Nenhuma unidade disponível para simulação neste empreendimento."
              : "Simulação de financiamento ainda não configurada pelo admin."}
          </p>
        )}
      </div>
    </main>
  );
}
