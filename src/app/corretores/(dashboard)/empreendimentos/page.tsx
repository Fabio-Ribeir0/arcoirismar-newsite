import { prisma } from "@/lib/prisma";

const STATUS_LABEL: Record<string, string> = {
  EM_BREVE: "Em breve",
  LANCAMENTO: "Lançamento",
  EM_OBRAS: "Em obras",
  PRONTO: "Pronto para morar",
};

export default async function EmpreendimentosCorretorPage() {
  const revendasDisponiveis = await prisma.unidadeRevenda.count({
    where: { status: { in: ["DISPONIVEL", "RESERVADA"] } },
  });
  const configRevenda = await prisma.configuracaoRevenda.findUnique({
    where: { id: "configuracao-revenda" },
  });

  const empreendimentos = await prisma.empreendimento.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { unidades: true } },
      unidades: { select: { status: true } },
    },
  });

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="font-display text-3xl font-medium text-primary">Empreendimentos</h1>

        <div className="grid gap-4 sm:grid-cols-2">
          {empreendimentos.map((emp) => {
            const disponiveis = emp.unidades.filter((u) => u.status === "DISPONIVEL").length;
            return (
              <div
                key={emp.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white p-6"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    {STATUS_LABEL[emp.status]}
                  </p>
                  <p className="mt-1 font-display text-lg font-medium text-primary">{emp.nome}</p>
                  <p className="mt-1 text-sm text-ink/60">
                    {emp._count.unidades} unidade(s) | {disponiveis} disponíveis
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  {emp.tabelaPdfUrl ? (
                    <a
                      href={emp.tabelaPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-light"
                    >
                      Abrir tabela
                    </a>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-md bg-mist px-4 py-2 text-sm font-semibold text-ink/40">
                      Abrir tabela
                    </span>
                  )}
                  {emp.linkMidiaPublica ? (
                    <a
                      href={emp.linkMidiaPublica}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-primary transition hover:bg-accent-light"
                    >
                      Acessar mídia
                    </a>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-md bg-mist px-4 py-2 text-sm font-semibold text-ink/40">
                      Acessar mídia
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {/* Revendas: unidades de terceiros recebidas como pagamento. Aparece
              como mais um card, mas é uma tabela única, não um empreendimento. */}
          {revendasDisponiveis > 0 && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  Unidades de terceiros
                </p>
                <p className="mt-1 font-display text-lg font-medium text-primary">Revendas</p>
                <p className="mt-1 text-sm text-ink/60">
                  {revendasDisponiveis} unidade(s) disponíveis
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                {configRevenda?.tabelaPdfUrl ? (
                  <a
                    href={configRevenda.tabelaPdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-light"
                  >
                    Abrir tabela
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-md bg-mist px-4 py-2 text-sm font-semibold text-ink/40">
                    Abrir tabela
                  </span>
                )}
                {configRevenda?.linkMidiaPublica ? (
                  <a
                    href={configRevenda.linkMidiaPublica}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-primary transition hover:bg-accent-light"
                  >
                    Acessar mídia
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-md bg-mist px-4 py-2 text-sm font-semibold text-ink/40">
                    Acessar mídia
                  </span>
                )}
              </div>
            </div>
          )}

          {empreendimentos.length === 0 && (
            <p className="text-ink/50">Nenhum empreendimento cadastrado ainda.</p>
          )}
        </div>
      </div>
    </main>
  );
}
