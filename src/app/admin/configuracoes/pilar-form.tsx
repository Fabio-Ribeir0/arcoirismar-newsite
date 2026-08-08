"use client";

import { useActionState } from "react";
import { atualizarPilar, type SalvarConteudoState } from "./conteudo-actions";

export function PilarForm({
  pilar,
  defaultValues,
}: {
  pilar: "missao" | "visao" | "valores";
  defaultValues: { titulo: string; descricao: string };
}) {
  const [state, formAction, pending] = useActionState<SalvarConteudoState, FormData>(
    (prevState, formData) => atualizarPilar(pilar, prevState, formData),
    undefined
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor={`${pilar}-titulo`} className="text-sm font-medium text-ink">
          Título
        </label>
        <input
          id={`${pilar}-titulo`}
          name="titulo"
          defaultValue={defaultValues.titulo}
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${pilar}-descricao`} className="text-sm font-medium text-ink">
          Descrição
        </label>
        <textarea
          id={`${pilar}-descricao`}
          name="descricao"
          rows={4}
          defaultValue={defaultValues.descricao}
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
