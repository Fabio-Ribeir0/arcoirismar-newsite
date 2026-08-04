"use client";

import { useActionState } from "react";
import { enviarCapaTabelaEmpreendimento, type CapaTabelaUploadState } from "./capa-tabela-actions";

export function CapaTabelaUpload({
  empreendimentoId,
  capaAtual,
}: {
  empreendimentoId: string;
  capaAtual: string | null;
}) {
  const [state, formAction, pending] = useActionState<CapaTabelaUploadState, FormData>(
    (prevState, formData) => enviarCapaTabelaEmpreendimento(empreendimentoId, prevState, formData),
    undefined
  );

  const capaExibida = state?.success ? state.url : capaAtual;

  return (
    <div className="space-y-4 rounded-xl border border-line bg-white p-8">
      <div>
        <h3 className="font-display text-lg font-medium text-primary">Capa da tabela</h3>
        <p className="text-sm text-ink/60">
          Opcional. Usada como página de capa (preenchendo a folha inteira, respeitando as
          margens) quando um corretor exporta a tabela de unidades para PDF. PNG, JPEG ou WebP,
          até 5MB.
        </p>
      </div>

      {capaExibida && (
        // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL, not a local asset
        <img
          src={capaExibida}
          alt="Capa da tabela atual"
          className="h-48 w-full rounded-lg border border-line object-cover"
        />
      )}

      <form action={formAction} className="flex flex-wrap items-center gap-4">
        <input
          type="file"
          name="capaTabela"
          accept="image/png,image/jpeg,image/webp"
          required
          className="text-sm text-ink/70 file:mr-4 file:rounded-md file:border-0 file:bg-[#f9fafc] file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-line"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
        >
          {pending ? "Enviando..." : "Enviar imagem"}
        </button>
      </form>

      {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}
    </div>
  );
}
