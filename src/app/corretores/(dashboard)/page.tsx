import Link from "next/link";
import { requireCorretor } from "@/lib/dal";

export default async function CorretorPage() {
  const user = await requireCorretor();

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="font-display text-3xl font-medium text-primary">
          Bem-vindo, {user.name}
        </h1>
        <Link
          href="/corretores/empreendimentos"
          className="block rounded-xl border border-line bg-white p-6 transition hover:shadow-sm"
        >
          <p className="font-display text-lg font-medium text-primary">Empreendimentos</p>
          <p className="mt-1 text-sm text-ink/60">
            Tabela de preços, disponibilidade de unidades e simulação de financiamento.
          </p>
        </Link>
      </div>
    </main>
  );
}
