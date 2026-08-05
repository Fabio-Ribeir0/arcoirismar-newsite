"use client";

import { useActionState } from "react";
import { enviarMidiaImagem, excluirMidia, alternarPublicoMidia } from "./midia-actions";
import type { MidiaImagemUploadState } from "./midia-actions";
import { DeleteButton } from "@/components/delete-button";

export type MidiaImagemRow = {
  id: string;
  url: string;
  titulo: string | null;
  publico: boolean;
};

export function MidiaImagensSection({
  empreendimentoId,
  tipo,
  titulo,
  descricao,
  midias,
}: {
  empreendimentoId: string;
  tipo: "FOTO" | "PLANTA";
  titulo: string;
  descricao: string;
  midias: MidiaImagemRow[];
}) {
  const [state, formAction, pending] = useActionState<MidiaImagemUploadState, FormData>(
    (prevState, formData) => enviarMidiaImagem(empreendimentoId, tipo, prevState, formData),
    undefined
  );

  return (
    <div className="space-y-4 rounded-xl border border-line bg-white p-8">
      <div>
        <h3 className="font-display text-lg font-medium text-primary">{titulo}</h3>
        <p className="text-sm text-ink/60">{descricao}</p>
      </div>

      {midias.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {midias.map((midia) => (
            <div key={midia.id} className="space-y-2 rounded-lg border border-line p-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL */}
              <img
                src={midia.url}
                alt={midia.titulo ?? titulo}
                className="h-28 w-full rounded-md object-cover"
              />
              {midia.titulo && <p className="truncate text-xs text-ink/70">{midia.titulo}</p>}
              <div className="flex items-center justify-between gap-2">
                <form action={alternarPublicoMidia.bind(null, empreendimentoId, midia.id, midia.publico)}>
                  <button
                    type="submit"
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      midia.publico ? "bg-green-100 text-green-700" : "bg-ink/10 text-ink/60"
                    }`}
                  >
                    {midia.publico ? "Público" : "Só corretores"}
                  </button>
                </form>
                <DeleteButton
                  action={excluirMidia.bind(null, empreendimentoId, midia.id)}
                  confirmMessage="Excluir esta imagem?"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <form action={formAction} className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink/60">Imagem</label>
          <input
            type="file"
            name="arquivo"
            accept="image/png,image/jpeg,image/webp"
            required
            className="block text-sm text-ink/70 file:mr-4 file:rounded-md file:border-0 file:bg-[#f9fafc] file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-line"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink/60">Título (opcional)</label>
          <input
            type="text"
            name="titulo"
            className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <label className="flex items-center gap-2 pb-2.5 text-sm font-medium text-ink">
          <input type="checkbox" name="publico" defaultChecked className="size-4 rounded border-line" />
          Público
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
        >
          {pending ? "Enviando..." : "Adicionar"}
        </button>
      </form>

      {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}
    </div>
  );
}
