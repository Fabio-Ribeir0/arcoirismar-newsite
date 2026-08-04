"use client";

import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-shared";
import {
  prepararUploadVideoBanner,
  confirmarUploadVideoBanner,
  removerVideoBanner,
} from "./video-actions";

const TIPOS_ACEITOS = "video/mp4,video/webm";
const TAMANHO_MAXIMO = 50 * 1024 * 1024; // 50MB

export function VideoUpload({
  empreendimentoId,
  videoAtual,
}: {
  empreendimentoId: string;
  videoAtual: string | null;
}) {
  const [video, setVideo] = useState(videoAtual);
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      const preparo = await prepararUploadVideoBanner(empreendimentoId, arquivo.type, arquivo.size);
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

      const confirmacao = await confirmarUploadVideoBanner(empreendimentoId, preparo.path);
      if (!confirmacao.success) {
        setErro(confirmacao.message);
        return;
      }

      setVideo(confirmacao.url);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setPending(false);
    }
  }

  async function handleRemover() {
    setErro(null);
    setPending(true);
    try {
      const resultado = await removerVideoBanner(empreendimentoId);
      if (!resultado.success) {
        setErro(resultado.message);
        return;
      }
      setVideo(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-line bg-white p-8">
      <div>
        <h3 className="font-display text-lg font-medium text-primary">Vídeo de banner (carrossel)</h3>
        <p className="text-sm text-ink/60">
          Opcional. Quando enviado, substitui a imagem de banner só no carrossel da home — a
          imagem continua sendo usada no card do Portfólio e na página do empreendimento. MP4 ou
          WebM, até 50MB.
        </p>
      </div>

      {video && (
        <video
          src={video}
          controls
          muted
          className="h-48 w-full rounded-lg border border-line object-cover"
        />
      )}

      <div className="flex flex-wrap items-center gap-4">
        <input
          ref={inputRef}
          type="file"
          accept={TIPOS_ACEITOS}
          className="text-sm text-ink/70 file:mr-4 file:rounded-md file:border-0 file:bg-mist file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-line"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={pending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
        >
          {pending ? "Enviando..." : "Enviar vídeo"}
        </button>
        {video && (
          <button
            type="button"
            onClick={handleRemover}
            disabled={pending}
            className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-mist disabled:opacity-60"
          >
            Remover vídeo
          </button>
        )}
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}
    </div>
  );
}
