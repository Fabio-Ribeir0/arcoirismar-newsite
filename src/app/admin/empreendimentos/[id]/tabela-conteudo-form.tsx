"use client";

import { useActionState } from "react";
import { atualizarTabelaConteudo, type SalvarTabelaConteudoState } from "./tabela-actions";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { criarUploadImagemTabela } from "./upload-imagem-tabela";

export function TabelaConteudoForm({
  empreendimentoId,
  defaultValues,
}: {
  empreendimentoId: string;
  defaultValues: { cabecalhoHtml: string; descricaoHtml: string; rodapeHtml: string };
}) {
  const [state, formAction, pending] = useActionState<SalvarTabelaConteudoState, FormData>(
    (prevState, formData) => atualizarTabelaConteudo(empreendimentoId, prevState, formData),
    undefined
  );

  const uploadImagem = criarUploadImagemTabela(empreendimentoId);

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-line bg-white p-8">
      <div>
        <h3 className="font-display text-lg font-medium text-primary">Conteúdo da tabela (PDF)</h3>
        <p className="text-sm text-ink/60">
          Exibidos em toda página da tabela exportada em PDF pelo corretor: cabeçalho e descrição
          no topo, rodapé ao final de cada página.
        </p>
      </div>

      <RichTextEditor
        onUploadImagem={uploadImagem}
        name="cabecalhoHtml"
        label="Cabeçalho"
        defaultValueHtml={defaultValues.cabecalhoHtml}
      />
      <RichTextEditor
        onUploadImagem={uploadImagem}
        name="descricaoHtml"
        label="Descrição"
        defaultValueHtml={defaultValues.descricaoHtml}
      />
      <RichTextEditor
        onUploadImagem={uploadImagem}
        name="rodapeHtml"
        label="Rodapé"
        defaultValueHtml={defaultValues.rodapeHtml}
      />

      {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
