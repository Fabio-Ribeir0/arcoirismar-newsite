"use client";

import { useActionState } from "react";
import {
  atualizarLinkMidiaPublica,
  type SalvarLinkMidiaPublicaState,
} from "./link-midia-publica-actions";

export function LinkMidiaPublicaForm({
  empreendimentoId,
  linkAtual,
}: {
  empreendimentoId: string;
  linkAtual: string | null;
}) {
  const [state, formAction, pending] = useActionState<SalvarLinkMidiaPublicaState, FormData>(
    (prevState, formData) => atualizarLinkMidiaPublica(empreendimentoId, prevState, formData),
    undefined
  );

  return (
    <div className="space-y-4 rounded-xl border border-line bg-white p-8">
      <div>
        <h3 className="font-display text-lg font-medium text-primary">Link público</h3>
        <p className="text-sm text-ink/60">
          Link de um repositório público de mídia (ex.: Google Drive, OneDrive). Visível somente
          para os corretores, na página do empreendimento.
        </p>
      </div>

      <form action={formAction} className="flex flex-wrap items-end gap-4">
        <div className="min-w-64 flex-1 space-y-1.5">
          <label htmlFor="linkMidiaPublica" className="text-xs font-medium text-ink/60">
            URL
          </label>
          <input
            id="linkMidiaPublica"
            type="url"
            name="linkMidiaPublica"
            placeholder="https://drive.google.com/..."
            defaultValue={linkAtual ?? ""}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
      </form>

      {state?.success === true && <p className="text-sm text-green-700">Link salvo.</p>}
      {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}
    </div>
  );
}
