import { requireAdmin } from "@/lib/dal";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <main className="flex-1 bg-mist px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-medium text-primary">
              Painel administrativo
            </h1>
            <p className="mt-1 text-ink/70">Bem-vindo, {user.name}.</p>
          </div>
          <LogoutButton />
        </div>
        <p className="text-sm text-ink/60">
          Gestão de empreendimentos, unidades, tabelas de preço, simulações,
          aprovação de corretores e reservas entra nos próximos passos.
        </p>
      </div>
    </main>
  );
}
