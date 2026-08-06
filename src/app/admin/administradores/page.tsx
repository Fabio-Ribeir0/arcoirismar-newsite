import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { ConvidarAdminForm } from "./convidar-admin-form";
import { DeleteButton } from "@/components/delete-button";
import { cancelarConviteAdmin } from "./actions";

export default async function AdministradoresPage() {
  const admin = await requireAdmin();

  const administradores = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="font-display text-3xl font-medium text-primary">Administradores</h1>

        <ConvidarAdminForm />

        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#e9eaec] text-left text-ink/60">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Desde</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {administradores.map((a) => {
                const ativo = a.password !== null;
                return (
                  <tr key={a.id} className="border-t border-line">
                    <td className="px-4 py-3 font-medium text-primary">
                      {a.name}
                      {a.id === admin.id && <span className="ml-2 text-xs text-ink/40">(você)</span>}
                    </td>
                    <td className="px-4 py-3 text-ink/70">{a.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          ativo ? "bg-green-100 text-green-700" : "bg-accent/20 text-accent"
                        }`}
                      >
                        {ativo ? "Ativo" : "Convite pendente"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink/60">
                      {a.createdAt.toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!ativo && a.id !== admin.id && (
                        <DeleteButton
                          action={cancelarConviteAdmin.bind(null, a.id)}
                          label="Cancelar convite"
                          confirmMessage={`Cancelar o convite pendente para ${a.email}?`}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
