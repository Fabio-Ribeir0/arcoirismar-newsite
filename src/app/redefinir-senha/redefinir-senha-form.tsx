"use client";

import { useActionState } from "react";
import Link from "next/link";
import { redefinirSenha } from "./actions";

export function RedefinirSenhaForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    (prevState: Awaited<ReturnType<typeof redefinirSenha>>, formData: FormData) =>
      redefinirSenha(token, prevState, formData),
    undefined
  );

  if (state?.success) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-green-700">Senha atualizada com sucesso.</p>
        <Link
          href="/login"
          className="block w-full rounded-md bg-primary px-4 py-2.5 text-center font-semibold text-white transition hover:bg-primary-light"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="senha" className="text-sm font-medium text-ink">
          Nova senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          minLength={8}
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <p className="text-xs text-ink/50">Mínimo de 8 caracteres.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmacao" className="text-sm font-medium text-ink">
          Confirmar senha
        </label>
        <input
          id="confirmacao"
          name="confirmacao"
          type="password"
          required
          minLength={8}
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-primary px-4 py-2.5 font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar nova senha"}
      </button>
    </form>
  );
}
