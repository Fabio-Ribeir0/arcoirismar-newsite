"use client";

import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-shared";
import { prepararUploadLogo, confirmarUploadLogo } from "./logo-actions";

const TIPOS_ACEITOS = "image/png,image/jpeg,image/webp";
const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5MB

export function LogoUpload({
  empreendimentoId,
  logoAtual,
}: {
  empreendimentoId: string;
  logoAtual: string | null;
}) {
  const [logo, setLogo] = useState(logoAtual);
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const arquivo = inputRef.current?.files?.[0];
    if (!arquivo) {
      setErro("Selecione uma imagem.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      setErro("Imagem muito grande (máximo 5MB).");
      return;
    }

    setErro(null);
    setPending(true);
    try {
      const preparo = await prepararUploadLogo(empreendimentoId, arquivo.type, arquivo.size);
      if (!preparo.success) {
        setErro(preparo.message);
        return;
      }

      const { error: uploadError } = await supabaseBrowser.storage
        .from(EMPREENDIMENTOS_BUCKET)
        .uploadToSignedUrl(preparo.path, preparo.token, arquivo, { contentType: arquivo.type });

      if (uploadError) {
        setErro(`Falha ao enviar a imagem: ${uploadError.message}`);
        return;
      }

      const confirmacao = await confirmarUploadLogo(empreendimentoId, preparo.path);
      if (!confirmacao.success) {
        setErro(confirmacao.message);
        return;
      }

      setLogo(confirmacao.url);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-line bg-white p-8">
      <div>
        <h3 className="font-display text-lg font-medium text-primary">Logo do empreendimento</h3>
        <p className="text-sm text-ink/60">
          Ainda sem uso definido no site. PNG, JPEG ou WebP, até 5MB.
        </p>
      </div>

      {logo && (
        <div className="flex h-24 w-fit items-center rounded-lg border border-line bg-mist px-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL, not a local asset */}
          <img src={logo} alt="Logo atual" className="h-16 w-auto object-contain" />
        </div>
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
          {pending ? "Enviando..." : "Enviar imagem"}
        </button>
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}
    </div>
  );
}
