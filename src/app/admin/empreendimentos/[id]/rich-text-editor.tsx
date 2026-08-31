"use client";

import { useCallback, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { EMPREENDIMENTOS_BUCKET } from "@/lib/supabase-shared";
import { prepararUploadImagemTabela, confirmarUploadImagemTabela } from "./tabela-actions";

export function RichTextEditor({
  empreendimentoId,
  name,
  label,
  defaultValueHtml,
}: {
  empreendimentoId: string;
  name: string;
  label: string;
  defaultValueHtml: string;
}) {
  const editableRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modoCodigo, setModoCodigo] = useState(false);
  const [htmlAtual, setHtmlAtual] = useState(defaultValueHtml);
  const [codigoHtml, setCodigoHtml] = useState(defaultValueHtml);

  // Espelho síncrono de htmlAtual — a callback ref abaixo precisa do valor
  // mais recente NO MOMENTO do mount (que acontece durante o commit, antes
  // de qualquer efeito rodar), então não dá pra confiar só no state.
  const htmlAtualRef = useRef(defaultValueHtml);
  const atualizarHtml = (novoHtml: string) => {
    htmlAtualRef.current = novoHtml;
    setHtmlAtual(novoHtml);
  };

  // Em vez de controlar o conteúdo via dangerouslySetInnerHTML (o que faz o
  // React reaplicar o HTML — e resetar o cursor — a cada re-render), o
  // conteúdo inicial é injetado imperativamente só no mount de fato. Depois
  // disso o DOM manda: React nunca mais toca nos filhos desse elemento.
  const setEditableNode = useCallback((node: HTMLDivElement | null) => {
    editableRef.current = node;
    if (node) node.innerHTML = htmlAtualRef.current;
  }, []);

  const sync = () => {
    if (editableRef.current) atualizarHtml(editableRef.current.innerHTML);
  };

  const exec = (comando: string, valor?: string) => {
    editableRef.current?.focus();
    document.execCommand(comando, false, valor);
    sync();
  };

  const inserirLink = () => {
    const url = window.prompt("Endereço do link (https://...)");
    if (!url) return;
    exec("createLink", url);
  };

  const alternarModoCodigo = () => {
    if (!modoCodigo) {
      setCodigoHtml(htmlAtual);
      setModoCodigo(true);
      return;
    }

    atualizarHtml(codigoHtml);
    setModoCodigo(false);
  };

  const inserirImagem = async (file: File) => {
    setErro(null);
    setEnviandoImagem(true);
    try {
      const preparo = await prepararUploadImagemTabela(empreendimentoId, file.type, file.size);
      if (!preparo.success) {
        setErro(preparo.message);
        return;
      }

      const { error: uploadError } = await supabaseBrowser.storage
        .from(EMPREENDIMENTOS_BUCKET)
        .uploadToSignedUrl(preparo.path, preparo.token, file, { contentType: file.type });

      if (uploadError) {
        setErro(`Falha ao enviar a imagem: ${uploadError.message}`);
        return;
      }

      const confirmacao = await confirmarUploadImagemTabela(empreendimentoId, preparo.path);
      if (!confirmacao.success) {
        setErro(confirmacao.message);
        return;
      }

      editableRef.current?.focus();
      document.execCommand("insertHTML", false, `<img src="${confirmacao.url}" style="max-width:100%" />`);
      sync();
    } finally {
      setEnviandoImagem(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-ink">{label}</label>

      <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 border-line bg-mist px-2 py-1.5">
        <button
          type="button"
          onClick={() => exec("bold")}
          disabled={modoCodigo}
          className="rounded px-2.5 py-1 text-sm font-bold text-ink hover:bg-line disabled:opacity-40"
        >
          N
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          disabled={modoCodigo}
          className="rounded px-2.5 py-1 text-sm italic text-ink hover:bg-line disabled:opacity-40"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => exec("underline")}
          disabled={modoCodigo}
          className="rounded px-2.5 py-1 text-sm text-ink underline hover:bg-line disabled:opacity-40"
        >
          S
        </button>

        <span className="mx-1 h-5 w-px bg-line" />

        <button
          type="button"
          onClick={inserirLink}
          disabled={modoCodigo}
          title="Inserir link"
          className="rounded px-2.5 py-1 text-sm text-ink hover:bg-line disabled:opacity-40"
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          disabled={modoCodigo}
          title="Lista com marcadores"
          className="rounded px-2.5 py-1 text-sm text-ink hover:bg-line disabled:opacity-40"
        >
          • Lista
        </button>
        <button
          type="button"
          onClick={() => exec("insertOrderedList")}
          disabled={modoCodigo}
          title="Lista numerada"
          className="rounded px-2.5 py-1 text-sm text-ink hover:bg-line disabled:opacity-40"
        >
          1. Lista
        </button>
        <button
          type="button"
          onClick={() => exec("formatBlock", "blockquote")}
          disabled={modoCodigo}
          title="Citação"
          className="rounded px-2.5 py-1 text-sm text-ink hover:bg-line disabled:opacity-40"
        >
          &ldquo; Citação
        </button>
        <button
          type="button"
          onClick={() => exec("insertHorizontalRule")}
          disabled={modoCodigo}
          title="Linha horizontal"
          className="rounded px-2.5 py-1 text-sm text-ink hover:bg-line disabled:opacity-40"
        >
          — Linha
        </button>

        <span className="mx-1 h-5 w-px bg-line" />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={enviandoImagem || modoCodigo}
          className="rounded px-2.5 py-1 text-sm text-ink hover:bg-line disabled:opacity-40"
        >
          {enviandoImagem ? "Enviando imagem..." : "Inserir imagem"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) inserirImagem(file);
          }}
        />

        <span className="mx-1 h-5 w-px bg-line" />

        <button
          type="button"
          onClick={alternarModoCodigo}
          title="Ver/editar HTML"
          className={`rounded px-2.5 py-1 font-mono text-sm text-ink hover:bg-line ${modoCodigo ? "bg-line" : ""}`}
        >
          {"<>"}
        </button>
      </div>

      {modoCodigo ? (
        <textarea
          value={codigoHtml}
          onChange={(event) => setCodigoHtml(event.target.value)}
          rows={6}
          className="w-full rounded-b-md border border-line px-3 py-2 font-mono text-xs outline-none focus:border-primary"
        />
      ) : (
        <div
          ref={setEditableNode}
          contentEditable
          suppressContentEditableWarning
          onInput={sync}
          onBlur={sync}
          className="min-h-32 rounded-b-md border border-line px-3 py-2 text-sm outline-none focus:border-primary [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-ink/70 [&_hr]:my-3 [&_hr]:border-line [&_img]:my-2 [&_img]:max-w-full [&_a]:text-accent [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
        />
      )}
      </div>

      <input type="hidden" name={name} value={htmlAtual} readOnly />

      {erro && <p className="text-sm text-red-600">{erro}</p>}
    </div>
  );
}
