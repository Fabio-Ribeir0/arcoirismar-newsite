"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <main className="flex flex-1 items-center justify-center bg-mist px-6 py-24">
      <form
        action={action}
        className="w-full max-w-sm space-y-5 rounded-xl border border-line bg-white p-8"
      >
        <div>
          <h1 className="font-display text-2xl font-medium text-primary">Entrar</h1>
          <p className="mt-1 text-sm text-ink/60">
            Acesso de corretores e administradores.
          </p>
        </div>

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

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-ink">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-primary px-4 py-2.5 font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
        >
          {pending ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-center text-sm text-ink/60">
          É corretor e ainda não tem conta?{" "}
          <Link href="/corretores/cadastro" className="font-medium text-primary underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </main>
  );
}
