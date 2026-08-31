"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { enviarArquivoDireto } from "@/lib/upload-direto";
import { prepararUploadCapaRevenda, confirmarUploadCapaRevenda } from "./upload-actions";
import { salvarLinkMidiaRevenda, type SalvarLinkMidiaState } from "./tabela-actions";
import type { ConfiguracaoRevendaRow } from "./tipos";

const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5MB

/** Capa e link de mídia valem para a tabela inteira de Revendas, não por unidade. */
export function ConfiguracoesModal({
  config,
  onFechar,
}: {
  config: ConfiguracaoRevendaRow;
  onFechar: () => void;
}) {
  const router = useRouter();
  const [capa, setCapa] = useState(config.capaTabelaUrl);
  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const [erroCapa, setErroCapa] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, pending] = useActionState<SalvarLinkMidiaState, FormData>(
    salvarLinkMidiaRevenda,
    undefined
  );

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state, router]);

  async function handleCapa(arquivo: File) {
    if (arquivo.size > TAMANHO_MAXIMO) {
      setErroCapa("Imagem muito grande (máximo 5MB).");
      return;
    }

    setErroCapa(null);
    setEnviandoCapa(true);
    try {
      const envio = await enviarArquivoDireto(arquivo, () =>
        prepararUploadCapaRevenda(arquivo.type, arquivo.size)
      );
      if (!envio.ok) {
        setErroCapa(envio.message);
        return;
      }

      const confirmacao = await confirmarUploadCapaRevenda(envio.path);
      if (!confirmacao.success) {
        setErroCapa(confirmacao.message);
        return;
      }

      setCapa(confirmacao.url);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } finally {
      setEnviandoCapa(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto my-4 w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-medium text-primary">
              Configurações da tabela
            </h2>
            <p className="mt-1 text-sm text-ink/60">
              Valem para a tabela de Revendas inteira, e não para uma unidade específica.
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="shrink-0 text-ink/40 transition hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <div>
              <h3 className="font-display text-lg font-medium text-primary">Capa da tabela</h3>
              <p className="text-sm text-ink/60">
                Opcional. Vira a primeira página do PDF, preenchendo a folha inteira. PNG, JPEG ou
                WebP, até 5MB.
              </p>
            </div>

            {capa && (
              // eslint-disable-next-line @next/next/no-img-element -- URL do Supabase Storage
              <img
                src={capa}
                alt="Capa atual da tabela de revendas"
                className="h-48 w-full rounded-lg border border-line object-cover"
              />
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={enviandoCapa}
              onChange={(event) => {
                const arquivo = event.target.files?.[0];
                if (arquivo) handleCapa(arquivo);
              }}
              className="block text-sm text-ink/70 file:mr-4 file:rounded-md file:border-0 file:bg-mist file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-line"
            />
            {enviandoCapa && <p className="text-sm text-ink/50">Enviando...</p>}
            {erroCapa && <p className="text-sm text-red-600">{erroCapa}</p>}
          </div>

          <form action={formAction} className="space-y-3 border-t border-line pt-6">
            <div>
              <h3 className="font-display text-lg font-medium text-primary">Link público</h3>
              <p className="text-sm text-ink/60">
                Repositório público de mídia (ex.: Google Drive, OneDrive). Aparece para o corretor
                no bloco Revendas.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-64 flex-1 space-y-1.5">
                <label htmlFor="linkMidiaPublica" className="text-xs font-medium text-ink/60">
                  URL
                </label>
                <input
                  id="linkMidiaPublica"
                  type="url"
                  name="linkMidiaPublica"
                  placeholder="https://drive.google.com/..."
                  defaultValue={config.linkMidiaPublica ?? ""}
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
            </div>

            {state?.success === true && <p className="text-sm text-green-700">Link salvo.</p>}
            {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}
          </form>
        </div>

        <div className="mt-6 flex justify-end border-t border-line pt-4">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-mist"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
