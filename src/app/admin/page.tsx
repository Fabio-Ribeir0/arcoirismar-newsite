import Link from "next/link";
import { requireAdmin } from "@/lib/dal";

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="font-display text-3xl font-medium text-primary">
          Painel administrativo
        </h1>
        {user.paginasPermitidas.includes("empreendimentos") && (
          <Link
            href="/admin/empreendimentos"
            className="block rounded-xl border border-line bg-white p-6 transition hover:shadow-sm"
          >
            <p className="font-display text-lg font-medium text-primary">
              Empreendimentos
            </p>
            <p className="mt-1 text-sm text-ink/60">
              Cadastrar e gerenciar empreendimentos e suas unidades.
            </p>
          </Link>
        )}
      </div>
    </main>
  );
}
