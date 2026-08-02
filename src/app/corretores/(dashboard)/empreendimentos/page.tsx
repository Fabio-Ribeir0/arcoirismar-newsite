import Link from "next/link";
import { prisma } from "@/lib/prisma";

const STATUS_LABEL: Record<string, string> = {
  EM_BREVE: "Em breve",
  LANCAMENTO: "Lançamento",
  EM_OBRAS: "Em obras",
  PRONTO: "Pronto para morar",
};

export default async function EmpreendimentosCorretorPage() {
  const empreendimentos = await prisma.empreendimento.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { unidades: true } } },
  });

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="font-display text-3xl font-medium text-primary">Empreendimentos</h1>

        <div className="grid gap-4 sm:grid-cols-2">
          {empreendimentos.map((emp) => (
            <Link
              key={emp.id}
              href={`/corretores/empreendimentos/${emp.id}`}
              className="rounded-xl border border-line bg-white p-6 transition hover:shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                {STATUS_LABEL[emp.status]}
              </p>
              <p className="mt-1 font-display text-lg font-medium text-primary">{emp.nome}</p>
              <p className="mt-1 text-sm text-ink/60">{emp._count.unidades} unidade(s)</p>
            </Link>
          ))}
          {empreendimentos.length === 0 && (
            <p className="text-ink/50">Nenhum empreendimento cadastrado ainda.</p>
          )}
        </div>
      </div>
    </main>
  );
}
