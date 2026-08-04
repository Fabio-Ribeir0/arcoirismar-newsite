import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UnidadeForm } from "../unidade-form";
import { atualizarUnidade } from "../actions";
import { HistoryTable } from "@/components/admin/history-table";

const STATUS_LABEL: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  BLOQUEADO: "Bloqueado",
};

export default async function EditarUnidadePage({
  params,
}: {
  params: Promise<{ id: string; unidadeId: string }>;
}) {
  const { id, unidadeId } = await params;

  const unidade = await prisma.unidade.findUnique({
    where: { id: unidadeId },
    include: {
      empreendimento: true,
      historicoPrecos: { orderBy: { criadoEm: "desc" }, include: { autor: true } },
      historicoStatus: { orderBy: { criadoEm: "desc" }, include: { autor: true } },
    },
  });

  if (!unidade || unidade.empreendimentoId !== id) notFound();

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-10">
        <div>
          <h1 className="font-display text-3xl font-medium text-primary">
            Unidade {unidade.identificador}
          </h1>
          <p className="mt-1 text-sm text-ink/60">{unidade.empreendimento.nome}</p>
        </div>

        <UnidadeForm
          action={atualizarUnidade.bind(null, id, unidadeId)}
          submitLabel="Salvar alterações"
          showMotivo
          defaultValues={{
            identificador: unidade.identificador,
            tipo: unidade.tipo,
            areaPrivativa: unidade.areaPrivativa,
            vagas: unidade.vagas,
            andar: unidade.andar,
            preco: unidade.preco.toString(),
            status: unidade.status,
            isDecorado: unidade.isDecorado,
            isTrocaArea: unidade.isTrocaArea,
          }}
        />

        <div className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-primary">
            Histórico (somente admin)
          </h2>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink/60">
              Alterações de preço
            </h3>
            <HistoryTable
              rows={unidade.historicoPrecos.map((h) => ({
                id: h.id,
                data: h.criadoEm,
                autor: h.autor.name ?? h.autor.email,
                descricao: `${formatCurrency(h.precoAnterior)} → ${formatCurrency(h.precoNovo)}`,
                motivo: h.motivo,
              }))}
              emptyMessage="Nenhuma alteração de preço registrada."
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink/60">
              Alterações de status
            </h3>
            <HistoryTable
              rows={unidade.historicoStatus.map((h) => ({
                id: h.id,
                data: h.criadoEm,
                autor: h.autor.name ?? h.autor.email,
                descricao: `${STATUS_LABEL[h.statusAnterior]} → ${STATUS_LABEL[h.statusNovo]}`,
                motivo: h.motivo,
              }))}
              emptyMessage="Nenhuma alteração de status registrada."
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function formatCurrency(value: unknown) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
