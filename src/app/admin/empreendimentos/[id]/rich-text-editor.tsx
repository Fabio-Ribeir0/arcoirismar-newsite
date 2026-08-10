"use client";

import { useEffect, useRef, useState } from "react";
import { enviarImagemTabela } from "./tabela-actions";

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
  const editableRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modoCodigo, setModoCodigo] = useState(false);
  const [htmlAtual, setHtmlAtual] = useState(defaultValueHtml);
  const [codigoHtml, setCodigoHtml] = useState(defaultValueHtml);

  // O input hidden fica fora do <div>/<textarea> condicional pra sobreviver
  // à troca de modo — mas alternar o irmão condicional (contentEditable <->
  // textarea) faz o React reaplicar o defaultValue original nele. Este
  // effect reforça o valor atual depois de cada commit, vencendo esse reset.
  useEffect(() => {
    if (hiddenRef.current) hiddenRef.current.value = htmlAtual;
  }, [htmlAtual, modoCodigo]);

  const sync = () => {
    if (hiddenRef.current && editableRef.current) {
      hiddenRef.current.value = editableRef.current.innerHTML;
    }
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
      if (editableRef.current) setCodigoHtml(editableRef.current.innerHTML);
      setModoCodigo(true);
      return;
    }

    if (hiddenRef.current) hiddenRef.current.value = codigoHtml;
    setHtmlAtual(codigoHtml);
    setModoCodigo(false);
  };

  const inserirImagem = async (file: File) => {
    setErro(null);
    setEnviandoImagem(true);
    const formData = new FormData();
    formData.set("arquivo", file);
    const resultado = await enviarImagemTabela(empreendimentoId, formData);
    setEnviandoImagem(false);

    if (!resultado.success) {
      setErro(resultado.message);
      return;
    }

    editableRef.current?.focus();
    document.execCommand("insertHTML", false, `<img src="${resultado.url}" style="max-width:100%" />`);
    sync();
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-ink">{label}</label>

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
          ref={editableRef}
          contentEditable
          suppressContentEditableWarning
          onInput={sync}
          onBlur={sync}
          className="min-h-32 rounded-b-md border border-line px-3 py-2 text-sm outline-none focus:border-primary [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-ink/70 [&_hr]:my-3 [&_hr]:border-line [&_img]:my-2 [&_img]:max-w-full [&_a]:text-accent [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: htmlAtual }}
        />
      )}

      <input ref={hiddenRef} type="hidden" name={name} defaultValue={defaultValueHtml} />

      {erro && <p className="text-sm text-red-600">{erro}</p>}
    </div>
  );
}
