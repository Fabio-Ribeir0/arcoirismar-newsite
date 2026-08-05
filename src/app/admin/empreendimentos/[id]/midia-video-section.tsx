"use client";

import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-shared";
import { prepararUploadVideoMidia, confirmarUploadVideoMidia } from "./midia-video-actions";
import { excluirMidia, alternarPublicoMidia } from "./midia-actions";
import { DeleteButton } from "@/components/delete-button";

const TIPOS_ACEITOS = "video/mp4,video/webm";
const TAMANHO_MAXIMO = 50 * 1024 * 1024; // 50MB

export type MidiaVideoRow = {
  id: string;
  url: string;
  titulo: string | null;
  publico: boolean;
};

export function MidiaVideoSection({
  empreendimentoId,
  midias,
}: {
  empreendimentoId: string;
  midias: MidiaVideoRow[];
}) {
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tituloRef = useRef<HTMLInputElement>(null);
  const publicoRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const arquivo = inputRef.current?.files?.[0];
    if (!arquivo) {
      setErro("Selecione um vídeo.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      setErro("Vídeo muito grande (máximo 50MB).");
      return;
    }

    setErro(null);
    setPending(true);
    try {
      const preparo = await prepararUploadVideoMidia(empreendimentoId, arquivo.type, arquivo.size);
      if (!preparo.success) {
        setErro(preparo.message);
        return;
      }

      const { error: uploadError } = await supabaseBrowser.storage
        .from(EMPREENDIMENTOS_BUCKET)
        .uploadToSignedUrl(preparo.path, preparo.token, arquivo, { contentType: arquivo.type });

      if (uploadError) {
        setErro(`Falha ao enviar o vídeo: ${uploadError.message}`);
        return;
      }

      const confirmacao = await confirmarUploadVideoMidia(
        empreendimentoId,
        preparo.path,
        tituloRef.current?.value.trim() ?? "",
        publicoRef.current?.checked ?? true
      );
      if (!confirmacao.success) {
        setErro(confirmacao.message);
        return;
      }

      if (inputRef.current) inputRef.current.value = "";
      if (tituloRef.current) tituloRef.current.value = "";
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-line bg-white p-8">
      <div>
        <h3 className="font-display text-lg font-medium text-primary">Vídeo institucional</h3>
        <p className="text-sm text-ink/60">
          Opcional. Aparece na página pública do empreendimento. MP4 ou WebM, até 50MB.
        </p>
      </div>

      {midias.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {midias.map((midia) => (
            <div key={midia.id} className="space-y-2 rounded-lg border border-line p-2">
              <video src={midia.url} controls muted className="h-40 w-full rounded-md object-cover" />
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
                  confirmMessage="Excluir este vídeo?"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink/60">Vídeo</label>
          <input
            ref={inputRef}
            type="file"
            accept={TIPOS_ACEITOS}
            className="block text-sm text-ink/70 file:mr-4 file:rounded-md file:border-0 file:bg-[#f9fafc] file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-line"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink/60">Título (opcional)</label>
          <input
            ref={tituloRef}
            type="text"
            className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <label className="flex items-center gap-2 pb-2.5 text-sm font-medium text-ink">
          <input ref={publicoRef} type="checkbox" defaultChecked className="size-4 rounded border-line" />
          Público
        </label>
        <button
          type="button"
          onClick={handleUpload}
          disabled={pending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
        >
          {pending ? "Enviando..." : "Adicionar"}
        </button>
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}
    </div>
  );
}
