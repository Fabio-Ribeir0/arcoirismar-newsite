"use client";

import { useActionState } from "react";
import Link from "next/link";
import { solicitarRedefinicaoSenha } from "./actions";

export default function EsqueciSenhaPage() {
  const [state, action, pending] = useActionState(solicitarRedefinicaoSenha, undefined);

  return (
    <main className="flex flex-1 items-center justify-center bg-mist px-6 py-24">
      <form
        action={action}
        className="w-full max-w-sm space-y-5 rounded-xl border border-line bg-white p-8"
      >
        <div>
          <h1 className="font-display text-2xl font-medium text-primary">Esqueci minha senha</h1>
          <p className="mt-1 text-sm text-ink/60">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        {state?.success ? (
          <p className="text-sm text-green-700">{state.message}</p>
        ) : (
          <>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-ink">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-primary px-4 py-2.5 font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
            >
              {pending ? "Enviando..." : "Enviar link de redefinição"}
            </button>
          </>
        )}

        <p className="text-center text-sm text-ink/60">
          <Link href="/login" className="font-medium text-primary underline">
            Voltar para o login
          </Link>
        </p>
      </form>
    </main>
  );
}
