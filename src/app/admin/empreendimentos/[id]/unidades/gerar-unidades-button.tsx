"use client";

import { useActionState } from "react";
import { gerarUnidades, type GerarUnidadesState } from "./actions";

export function GerarUnidadesButton({ empreendimentoId }: { empreendimentoId: string }) {
  const [state, action, pending] = useActionState(
    (prevState: GerarUnidadesState) => gerarUnidades(empreendimentoId, prevState),
    undefined
  );

  return (
    <div className="space-y-2">
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-accent-light disabled:opacity-60"
        >
          {pending ? "Gerando..." : "Gerar unidades"}
        </button>
      </form>
      {state?.success === true && (
        <p className="text-sm text-green-700">{state.criadas} unidade(s) criada(s).</p>
      )}
      {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}
    </div>
  );
}
