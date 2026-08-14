"use client";

import { useActionState, useState } from "react";
import { importarEmpreendimentosCsv, type ImportarCsvState } from "./importar-csv-actions";

export function ImportarCsvModal() {
  const [aberto, setAberto] = useState(false);
  const [state, formAction, pending] = useActionState<ImportarCsvState, FormData>(
    importarEmpreendimentosCsv,
    undefined
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-accent-light"
      >
        Importar .csv
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-medium text-primary">
                Importar empreendimentos via CSV
              </h2>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="text-ink/40 transition hover:text-ink"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-sm text-ink/60">
              Cada linha do arquivo vira um novo empreendimento. Colunas: Nome, Status, Bairro,
              Cidade, Estado, Andares, Unidades por andar, Valor base.
            </p>

            <a
              href="/templates/empreendimentos-modelo.csv"
              download
              className="mt-3 inline-block text-sm font-medium text-primary underline hover:text-primary-light"
            >
              Baixar modelo (.csv)
            </a>

            <form action={formAction} className="mt-5 space-y-4">
              <input
                type="file"
                name="csv"
                accept=".csv,text/csv"
                required
                className="w-full text-sm text-ink/70 file:mr-4 file:rounded-md file:border-0 file:bg-mist file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-line"
              />

              {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}

              {state?.success === true && (
                <div className="rounded-md bg-mist p-3 text-sm">
                  <p className="font-medium text-primary">
                    {state.criados} empreendimento(s) importado(s) com sucesso.
                  </p>
                  {state.erros.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-red-600">
                      {state.erros.map((erro) => (
                        <li key={erro}>{erro}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-mist"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
                >
                  {pending ? "Importando..." : "Importar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
