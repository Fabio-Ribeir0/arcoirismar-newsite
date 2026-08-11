"use client";

import { useActionState } from "react";
import { gerarTabelaPdfAdmin, type GerarTabelaPdfState } from "./tabela-actions";

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export function GerarTabelaSection({
  empreendimentoId,
  urlAtual,
  geradoEmAtual,
}: {
  empreendimentoId: string;
  urlAtual: string | null;
  geradoEmAtual: string | null;
}) {
  const [state, formAction, pending] = useActionState<GerarTabelaPdfState, FormData>(
    (prevState) => gerarTabelaPdfAdmin(empreendimentoId, prevState),
    undefined
  );

  const url = state?.success ? state.url : urlAtual;
  const geradoEm = state?.success ? state.geradoEm : geradoEmAtual;

  return (
    <div className="space-y-4 rounded-xl border border-line bg-white p-8">
      <div>
        <h3 className="font-display text-lg font-medium text-primary">Gerar Tabela</h3>
        <p className="text-sm text-ink/60">
          Gera o PDF da tabela de unidades (capa, cabeçalho/descrição/rodapé, tabela e documentos
          adicionais) e disponibiliza para os corretores. Gere novamente sempre que alterar preços,
          status de unidades ou o conteúdo da tabela.
        </p>
      </div>

      {geradoEm && (
        <p className="text-sm text-ink/60">
          Última geração: <span className="font-medium text-ink">{formatarDataHora(geradoEm)}</span>
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <form action={formAction}>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
          >
            {pending ? "Gerando..." : "Gerar Tabela"}
          </button>
        </form>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-mist"
          >
            Visualizar tabela
          </a>
        )}
      </div>

      {state?.success === true && (
        <p className="text-sm text-green-700">Tabela gerada com sucesso.</p>
      )}
      {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}
    </div>
  );
}
