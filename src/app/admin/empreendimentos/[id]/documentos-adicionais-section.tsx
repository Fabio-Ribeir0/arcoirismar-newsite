"use client";

import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-shared";
import {
  prepararUploadDocumento,
  confirmarUploadDocumento,
  excluirDocumentoAdicional,
} from "./tabela-actions";
import { DeleteButton } from "@/components/delete-button";

const TAMANHO_MAXIMO = 15 * 1024 * 1024; // 15MB

export type DocumentoAdicionalRow = { id: string; titulo: string; url: string };

export function DocumentosAdicionaisSection({
  empreendimentoId,
  documentos,
}: {
  empreendimentoId: string;
  documentos: DocumentoAdicionalRow[];
}) {
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tituloRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const titulo = tituloRef.current?.value.trim() ?? "";
    if (!titulo) {
      setErro("Informe um título para o documento.");
      return;
    }
    const arquivo = inputRef.current?.files?.[0];
    if (!arquivo) {
      setErro("Selecione um arquivo PDF.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      setErro("Arquivo muito grande (máximo 15MB).");
      return;
    }

    setErro(null);
    setPending(true);
    try {
      const preparo = await prepararUploadDocumento(empreendimentoId, arquivo.type, arquivo.size);
      if (!preparo.success) {
        setErro(preparo.message);
        return;
      }

      const { error: uploadError } = await supabaseBrowser.storage
        .from(EMPREENDIMENTOS_BUCKET)
        .uploadToSignedUrl(preparo.path, preparo.token, arquivo, { contentType: "application/pdf" });

      if (uploadError) {
        setErro(`Falha ao enviar o arquivo: ${uploadError.message}`);
        return;
      }

      const confirmacao = await confirmarUploadDocumento(empreendimentoId, preparo.path, titulo);
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

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink/60">Título</label>
          <input
            ref={tituloRef}
            type="text"
            className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink/60">Arquivo PDF</label>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="block text-sm text-ink/70 file:mr-4 file:rounded-md file:border-0 file:bg-[#f9fafc] file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-line"
          />
        </div>
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
