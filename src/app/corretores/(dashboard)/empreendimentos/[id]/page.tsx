import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { SimuladorFinanciamento } from "./simulador";

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

  const tabelaAtualizadaEm = empreendimento.tabelaPdfGeradoEm
    ? empreendimento.tabelaPdfGeradoEm.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
    : null;

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <Breadcrumb
          items={[
            { label: "Empreendimentos", href: "/corretores/empreendimentos" },
            { label: empreendimento.nome },
          ]}
        />
        <div>
          <h1 className="font-display text-3xl font-medium text-primary">
            {empreendimento.nome}
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            {[empreendimento.bairro, empreendimento.cidade].filter(Boolean).join(", ")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-xl border border-line bg-white p-6">
            <div>
              <h2 className="font-display text-lg font-medium text-primary">Tabela</h2>
              <p className="mt-1 text-sm text-ink/60">
                {empreendimento.tabelaPdfUrl
                  ? `Tabela de unidades em PDF${tabelaAtualizadaEm ? ` — atualizada em ${tabelaAtualizadaEm}` : ""}.`
                  : "Ainda não disponível — aguarde o admin gerar a tabela."}
              </p>
            </div>
            {empreendimento.tabelaPdfUrl ? (
              <a
                href={empreendimento.tabelaPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light"
              >
                Abrir tabela
              </a>
            ) : (
              <span className="inline-flex w-fit items-center justify-center rounded-md bg-mist px-5 py-2.5 text-sm font-semibold text-ink/40">
                Abrir tabela
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-line bg-white p-6">
            <div>
              <h2 className="font-display text-lg font-medium text-primary">Mídia</h2>
              <p className="mt-1 text-sm text-ink/60">
                {empreendimento.linkMidiaPublica
                  ? "Biblioteca pública com fotos, vídeos e materiais em alta resolução."
                  : "Ainda não disponível — aguarde o admin cadastrar o link."}
              </p>
            </div>
            {empreendimento.linkMidiaPublica ? (
              <a
                href={empreendimento.linkMidiaPublica}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light"
              >
                Acessar mídia
              </a>
            ) : (
              <span className="inline-flex w-fit items-center justify-center rounded-md bg-mist px-5 py-2.5 text-sm font-semibold text-ink/40">
                Acessar mídia
              </span>
            )}
          </div>
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
