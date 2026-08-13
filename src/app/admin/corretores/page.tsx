import { prisma } from "@/lib/prisma";
import { atualizarStatusCorretor } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
};

const STATUS_STYLE: Record<string, string> = {
  PENDENTE: "bg-accent/20 text-accent",
  APROVADO: "bg-green-100 text-green-700",
  REJEITADO: "bg-red-100 text-red-700",
};

export default async function CorretoresPage() {
  const corretores = await prisma.user.findMany({
    where: { role: "CORRETOR" },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="font-display text-3xl font-medium text-primary">Corretores</h1>

        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#e9eaec] text-left text-ink/60">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">CRECI</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Cadastro</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {corretores.map((corretor) => (
                <tr key={corretor.id} className="border-t border-line align-top">
                  <td className="px-4 py-3 font-medium text-primary">{corretor.name}</td>
                  <td className="px-4 py-3 text-ink/70">
                    <div>{corretor.email}</div>
                    <div className="text-ink/50">{corretor.telefone}</div>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{corretor.creci}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[corretor.status]}`}
                    >
                      {STATUS_LABEL[corretor.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/60">
                    {corretor.createdAt.toLocaleDateString("pt-BR")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      {corretor.status !== "APROVADO" && (
                        <form action={atualizarStatusCorretor.bind(null, corretor.id, "APROVADO")}>
                          <button
                            type="submit"
                            className="text-sm font-medium text-green-700 hover:underline"
                          >
                            Aprovar
                          </button>
                        </form>
                      )}
                      {corretor.status !== "REJEITADO" && (
                        <form action={atualizarStatusCorretor.bind(null, corretor.id, "REJEITADO")}>
                          <button
                            type="submit"
                            className="text-sm font-medium text-red-600 hover:underline"
                          >
                            Rejeitar
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {corretores.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
                    Nenhum corretor cadastrado ainda.
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
