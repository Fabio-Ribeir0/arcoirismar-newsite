"use client";

import { useActionState } from "react";
import {
  enviarDocumentoAdicional,
  excluirDocumentoAdicional,
  type EnviarDocumentoAdicionalState,
} from "./tabela-actions";
import { DeleteButton } from "@/components/delete-button";

export type DocumentoAdicionalRow = { id: string; titulo: string; url: string };

export function DocumentosAdicionaisSection({
  empreendimentoId,
  documentos,
}: {
  empreendimentoId: string;
  documentos: DocumentoAdicionalRow[];
}) {
  const [state, formAction, pending] = useActionState<EnviarDocumentoAdicionalState, FormData>(
    (prevState, formData) => enviarDocumentoAdicional(empreendimentoId, prevState, formData),
    undefined
  );

  return (
    <div className="space-y-4 rounded-xl border border-line bg-white p-8">
      <div>
        <h3 className="font-display text-lg font-medium text-primary">Documentos adicionais</h3>
        <p className="text-sm text-ink/60">
          PDFs anexados à tabela (ex.: memorial descritivo, tabela de acabamentos) — cada um vira
          páginas extras ao final do PDF exportado pelo corretor, uma por documento.
        </p>
      </div>

      {documentos.length > 0 && (
        <ul className="divide-y divide-line rounded-lg border border-line">
          {documentos.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                {doc.titulo}
              </a>
              <DeleteButton
                action={excluirDocumentoAdicional.bind(null, empreendimentoId, doc.id)}
                confirmMessage={`Excluir o documento "${doc.titulo}"?`}
              />
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink/60">Título</label>
          <input
            type="text"
            name="titulo"
            required
            className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink/60">Arquivo PDF</label>
          <input
            type="file"
            name="arquivo"
            accept="application/pdf"
            required
            className="block text-sm text-ink/70 file:mr-4 file:rounded-md file:border-0 file:bg-[#f9fafc] file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-line"
          />
        </div>
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
