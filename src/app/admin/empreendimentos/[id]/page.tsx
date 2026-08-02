import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EmpreendimentoForm } from "../empreendimento-form";
import { atualizarEmpreendimento } from "../actions";
import { excluirUnidade } from "./unidades/actions";
import { DeleteButton } from "@/components/delete-button";

const UNIDADE_STATUS_LABEL: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  BLOQUEADO: "Bloqueado",
};

export default async function EditarEmpreendimentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id },
    include: { unidades: { orderBy: { identificador: "asc" } } },
  });

  if (!empreendimento) notFound();

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-10">
        <div>
          <h1 className="font-display text-3xl font-medium text-primary">
            {empreendimento.nome}
          </h1>
          <p className="mt-1 text-sm text-ink/60">/{empreendimento.slug}</p>
        </div>

        <EmpreendimentoForm
          action={atualizarEmpreendimento.bind(null, empreendimento.id)}
          submitLabel="Salvar alterações"
          defaultValues={{
            nome: empreendimento.nome,
            slug: empreendimento.slug,
            status: empreendimento.status,
            descricao: empreendimento.descricao,
            endereco: empreendimento.endereco,
            bairro: empreendimento.bairro,
            cidade: empreendimento.cidade,
            estado: empreendimento.estado,
            cep: empreendimento.cep,
            entregaPrevista: empreendimento.entregaPrevista
              ? empreendimento.entregaPrevista.toISOString().slice(0, 10)
              : "",
          }}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-medium text-primary">Unidades</h2>
            <Link
              href={`/admin/empreendimentos/${empreendimento.id}/unidades/novo`}
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light"
            >
              Nova unidade
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-white">
            <table className="w-full text-sm">
              <thead className="bg-mist text-left text-ink/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Unidade</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Preço</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {empreendimento.unidades.map((unidade) => (
                  <tr key={unidade.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/empreendimentos/${empreendimento.id}/unidades/${unidade.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {unidade.identificador}
                      </Link>
                      {unidade.isDecorado && (
                        <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">
                          Decorado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink/70">{unidade.tipo}</td>
                    <td className="px-4 py-3 text-ink/70">
                      {Number(unidade.preco).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="px-4 py-3 text-ink/70">
                      {UNIDADE_STATUS_LABEL[unidade.status]}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteButton
                        action={excluirUnidade.bind(null, empreendimento.id, unidade.id)}
                        confirmMessage={`Excluir a unidade "${unidade.identificador}"?`}
                      />
                    </td>
                  </tr>
                ))}
                {empreendimento.unidades.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-ink/50">
                      Nenhuma unidade cadastrada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
