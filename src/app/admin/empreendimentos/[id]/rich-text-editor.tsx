"use client";

import { useRef, useState } from "react";
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

  const sync = () => {
    if (hiddenRef.current && editableRef.current) {
      hiddenRef.current.value = editableRef.current.innerHTML;
    }
  };

  const exec = (comando: string) => {
    editableRef.current?.focus();
    document.execCommand(comando);
    sync();
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
          className="rounded px-2.5 py-1 text-sm font-bold text-ink hover:bg-line"
        >
          N
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          className="rounded px-2.5 py-1 text-sm italic text-ink hover:bg-line"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          className="rounded px-2.5 py-1 text-sm text-ink hover:bg-line"
        >
          Lista
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={enviandoImagem}
          className="rounded px-2.5 py-1 text-sm text-ink hover:bg-line disabled:opacity-60"
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
      </div>

      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        className="min-h-32 rounded-b-md border border-line px-3 py-2 text-sm outline-none focus:border-primary [&_img]:my-2 [&_img]:max-w-full [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: defaultValueHtml }}
      />

      <input ref={hiddenRef} type="hidden" name={name} defaultValue={defaultValueHtml} />

      {erro && <p className="text-sm text-red-600">{erro}</p>}
    </div>
  );
}
