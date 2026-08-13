import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/delete-button";
import { excluirEmpreendimento } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  EM_BREVE: "Em breve",
  LANCAMENTO: "Lançamento",
  EM_OBRAS: "Em obras",
  PRONTO: "Pronto para morar",
};

export default async function EmpreendimentosPage() {
  const empreendimentos = await prisma.empreendimento.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { unidades: true } } },
  });

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-medium text-primary">
            Empreendimentos
          </h1>
          <Link
            href="/admin/empreendimentos/novo"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light"
          >
            Novo empreendimento
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#e9eaec] text-left text-ink/60">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Unidades</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {empreendimentos.map((emp) => (
                <tr key={emp.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/empreendimentos/${emp.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {emp.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{STATUS_LABEL[emp.status]}</td>
                  <td className="px-4 py-3 text-ink/70">{emp._count.unidades}</td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton
                      action={excluirEmpreendimento.bind(null, emp.id)}
                      confirmMessage={`Excluir "${emp.nome}" e todas as suas unidades? Essa ação não pode ser desfeita.`}
                    />
                  </td>
                </tr>
              ))}
              {empreendimentos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-ink/50">
                    Nenhum empreendimento cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
