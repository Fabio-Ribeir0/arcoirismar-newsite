import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { EmpreendimentoStatus } from "@/generated/prisma/client";
import {
  EMPREENDIMENTO_STATUS_LABEL,
  subtituloEmpreendimento,
} from "@/lib/empreendimento-display";

const STATUS_VALIDOS = Object.keys(EMPREENDIMENTO_STATUS_LABEL) as EmpreendimentoStatus[];

export const dynamic = "force-dynamic";

export default async function EmpreendimentosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statusFiltro = STATUS_VALIDOS.includes(status as EmpreendimentoStatus)
    ? (status as EmpreendimentoStatus)
    : undefined;

  const empreendimentos = await prisma.empreendimento.findMany({
    where: statusFiltro ? { status: statusFiltro } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { unidades: true } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10">
        <p className="mb-3 text-xs font-semibold tracking-widest text-accent uppercase">
          Portfólio
        </p>
        <h1 className="font-display text-3xl font-medium text-primary md:text-4xl">
          Empreendimentos
        </h1>
      </div>

      <div className="mb-10 flex flex-wrap gap-3">
        <Link
          href="/empreendimentos"
          className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
            !statusFiltro
              ? "border-primary bg-primary text-white"
              : "border-line text-primary hover:bg-mist"
          }`}
        >
          Todos
        </Link>
        {Object.entries(EMPREENDIMENTO_STATUS_LABEL).map(([value, label]) => (
          <Link
            key={value}
            href={`/empreendimentos?status=${value}`}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
              statusFiltro === value
                ? "border-primary bg-primary text-white"
                : "border-line text-primary hover:bg-mist"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {empreendimentos.map((emp) => (
          <Link
            key={emp.id}
            href={`/empreendimentos/${emp.slug}`}
            className="group block overflow-hidden rounded-xl border border-line bg-white transition hover:shadow-lg"
          >
            <div className="h-56 bg-gradient-to-br from-primary-light to-primary" />
            <div className="p-6">
              <p className="mb-2 text-xs font-semibold tracking-wide text-accent uppercase">
                {EMPREENDIMENTO_STATUS_LABEL[emp.status]}
              </p>
              <h3 className="font-display mb-2 text-xl font-medium text-primary">
                {emp.nome}
              </h3>
              <p className="text-sm text-ink/70">
                {subtituloEmpreendimento({
                  totalUnidades: emp._count.unidades,
                  entregaPrevista: emp.entregaPrevista,
                })}
              </p>
            </div>
          </Link>
        ))}
        {empreendimentos.length === 0 && (
          <p className="text-ink/50">Nenhum empreendimento encontrado.</p>
        )}
      </div>
    </div>
  );
}
