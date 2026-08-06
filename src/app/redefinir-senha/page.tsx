import Link from "next/link";
import { RedefinirSenhaForm } from "./redefinir-senha-form";

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center bg-mist px-6 py-24">
      <div className="w-full max-w-sm space-y-5 rounded-xl border border-line bg-white p-8">
        <div>
          <h1 className="font-display text-2xl font-medium text-primary">Nova senha</h1>
          <p className="mt-1 text-sm text-ink/60">Crie uma nova senha para sua conta.</p>
        </div>

        {token ? (
          <RedefinirSenhaForm token={token} />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-red-600">
              Link inválido. Solicite um novo link de redefinição de senha.
            </p>
            <Link
              href="/esqueci-senha"
              className="block w-full rounded-md bg-primary px-4 py-2.5 text-center font-semibold text-white transition hover:bg-primary-light"
            >
              Solicitar novo link
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
