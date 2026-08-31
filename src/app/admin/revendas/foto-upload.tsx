"use client";

import { useRef, useState } from "react";
import { enviarArquivoDireto } from "@/lib/upload-direto";
import {
  prepararUploadFotoRevenda,
  confirmarUploadFotoRevenda,
  removerFotoRevenda,
  type SlotFoto,
} from "./upload-actions";

const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5MB

/** Um dos 5 slots fixos de foto do template — a posição importa no PDF. */
export function FotoUpload({
  unidadeId,
  slot,
  rotulo,
  urlAtual,
}: {
  unidadeId: string;
  slot: SlotFoto;
  rotulo: string;
  urlAtual: string | null;
}) {
  const [url, setUrl] = useState(urlAtual);
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleArquivo(arquivo: File) {
    if (arquivo.size > TAMANHO_MAXIMO) {
      setErro("Imagem muito grande (máximo 5MB).");
      return;
    }

    setErro(null);
    setPending(true);
    try {
      const envio = await enviarArquivoDireto(arquivo, () =>
        prepararUploadFotoRevenda(unidadeId, slot, arquivo.type, arquivo.size)
      );
      if (!envio.ok) {
        setErro(envio.message);
        return;
      }

      const confirmacao = await confirmarUploadFotoRevenda(unidadeId, slot, envio.path);
      if (!confirmacao.success) {
        setErro(confirmacao.message);
        return;
      }

      setUrl(confirmacao.url);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setPending(false);
    }
  }

  async function handleRemover() {
    setErro(null);
    setPending(true);
    try {
      const resultado = await removerFotoRevenda(unidadeId, slot);
      if (!resultado.success) {
        setErro(resultado.message);
        return;
      }
      setUrl(null);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-line p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-ink/70">{rotulo}</p>
        {url && (
          <button
            type="button"
            onClick={handleRemover}
            disabled={pending}
            className="text-xs font-medium text-red-600 hover:underline disabled:opacity-60"
          >
            Remover
          </button>
        )}
      </div>

      <div className="flex h-24 items-center justify-center overflow-hidden rounded-md bg-mist">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL do Supabase Storage
          <img src={url} alt={rotulo} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-ink/40">Sem foto</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={pending}
        onChange={(event) => {
          const arquivo = event.target.files?.[0];
          if (arquivo) handleArquivo(arquivo);
        }}
        className="block w-full text-xs text-ink/70 file:mr-2 file:rounded-md file:border-0 file:bg-[#f9fafc] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary hover:file:bg-line"
      />

      {pending && <p className="text-xs text-ink/50">Enviando...</p>}
      {erro && <p className="text-xs text-red-600">{erro}</p>}
    </div>
  );
}
