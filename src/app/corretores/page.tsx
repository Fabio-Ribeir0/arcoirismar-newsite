import { requireCorretor } from "@/lib/dal";
import { LogoutButton } from "@/components/logout-button";

export default async function CorretorPage() {
  const user = await requireCorretor();

  return (
    <main className="flex-1 bg-mist px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-medium text-primary">
              Área do corretor
            </h1>
            <p className="mt-1 text-ink/70">Bem-vindo, {user.name}.</p>
          </div>
          <LogoutButton />
        </div>
        <p className="text-sm text-ink/60">
          Tabelas de preço, disponibilidade de unidades, simulação de
          financiamento e links de mídia dos empreendimentos entram nos
          próximos passos.
        </p>
      </div>
    </main>
  );
}
