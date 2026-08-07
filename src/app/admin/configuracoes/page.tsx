import { prisma } from "@/lib/prisma";
import { ConfiguracaoForm } from "./configuracao-form";
import { criarConfiguracaoSimulacao } from "./actions";

const SISTEMA_LABEL: Record<string, string> = { SAC: "SAC", PRICE: "Tabela Price" };

export default async function ConfiguracoesPage() {
  const historico = await prisma.configuracaoSimulacao.findMany({
    orderBy: { criadoEm: "desc" },
    include: { autor: true },
    take: 10,
  });
  const atual = historico[0];

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <div>
          <h1 className="font-display text-3xl font-medium text-primary">
            Simulação de financiamento
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Configuração usada no simulador exibido aos corretores. Salvar cria uma
            nova versão — a mais recente é a vigente.
          </p>
        </div>

        {atual && (
          <div className="rounded-xl border border-line bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              Configuração vigente
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-ink/50">Taxa a.a.</dt>
                <dd className="font-medium text-primary">
                  {Number(atual.taxaJurosAnual).toFixed(2)}%
                </dd>
              </div>
              <div>
                <dt className="text-ink/50">Prazo máx.</dt>
                <dd className="font-medium text-primary">{atual.prazoMaximoMeses} meses</dd>
              </div>
              <div>
                <dt className="text-ink/50">Entrada mín.</dt>
                <dd className="font-medium text-primary">
                  {Number(atual.entradaMinimaPercentual).toFixed(2)}%
                </dd>
              </div>
              <div>
                <dt className="text-ink/50">Sistema</dt>
                <dd className="font-medium text-primary">
                  {SISTEMA_LABEL[atual.sistemaAmortizacao]}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <ConfiguracaoForm
          action={criarConfiguracaoSimulacao}
          defaultValues={
            atual
              ? {
                  taxaJurosAnual: atual.taxaJurosAnual.toString(),
                  prazoMaximoMeses: atual.prazoMaximoMeses,
                  entradaMinimaPercentual: atual.entradaMinimaPercentual.toString(),
                  sistemaAmortizacao: atual.sistemaAmortizacao,
                }
              : undefined
          }
        />

        {historico.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-display text-xl font-medium text-primary">
              Histórico de alterações
            </h2>
            <div className="overflow-hidden rounded-xl border border-line bg-white">
              <table className="w-full text-sm">
                <thead className="bg-mist text-left text-ink/60">
                  <tr>
                    <th className="px-4 py-2 font-medium">Data</th>
                    <th className="px-4 py-2 font-medium">Taxa</th>
                    <th className="px-4 py-2 font-medium">Prazo</th>
                    <th className="px-4 py-2 font-medium">Entrada mín.</th>
                    <th className="px-4 py-2 font-medium">Sistema</th>
                    <th className="px-4 py-2 font-medium">Por</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((h) => (
                    <tr key={h.id} className="border-t border-line">
                      <td className="px-4 py-2 text-ink/70">
                        {h.criadoEm.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-2 text-ink/70">
                        {Number(h.taxaJurosAnual).toFixed(2)}%
                      </td>
                      <td className="px-4 py-2 text-ink/70">{h.prazoMaximoMeses}m</td>
                      <td className="px-4 py-2 text-ink/70">
                        {Number(h.entradaMinimaPercentual).toFixed(2)}%
                      </td>
                      <td className="px-4 py-2 text-ink/70">
                        {SISTEMA_LABEL[h.sistemaAmortizacao]}
                      </td>
                      <td className="px-4 py-2 text-ink/70">
                        {h.autor.name ?? h.autor.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
