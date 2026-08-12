import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LoteForm } from "./lote-form";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { atualizarUnidadesEmLote } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  BLOQUEADO: "Bloqueado",
};

export default async function EdicaoLotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ids?: string }>;
}) {
  const { id } = await params;
  const { ids } = await searchParams;
  const idList = ids ? ids.split(",").filter(Boolean) : [];

  if (idList.length === 0) redirect(`/admin/empreendimentos/${id}`);

  const unidades = await prisma.unidade.findMany({
    where: { id: { in: idList }, empreendimentoId: id },
    orderBy: [{ andar: "asc" }, { identificador: "asc" }],
  });

  if (unidades.length === 0) notFound();

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id },
    select: { nome: true },
  });

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <Breadcrumb
          items={[
            { label: "Empreendimentos", href: "/admin/empreendimentos" },
            { label: empreendimento?.nome ?? "Empreendimento", href: `/admin/empreendimentos/${id}` },
            { label: "Unidades", href: `/admin/empreendimentos/${id}` },
            { label: "Editar em lote" },
          ]}
        />
        <div>
          <h1 className="font-display text-3xl font-medium text-primary">
            Editar {unidades.length} unidade(s)
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {unidades.map((u) => (
              <span
                key={u.id}
                className="rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink/70"
              >
                {u.identificador} · {Number(u.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} ·{" "}
                {STATUS_LABEL[u.status]}
              </span>
            ))}
          </div>
        </div>

        <LoteForm action={atualizarUnidadesEmLote.bind(null, id, unidades.map((u) => u.id))} />
      </div>
    </main>
  );
}
