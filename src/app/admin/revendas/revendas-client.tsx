"use client";

import { useActionState, useState } from "react";
import { DeleteButton } from "@/components/delete-button";
import { REVENDA_STATUS_LABEL, REVENDA_STATUS_STYLE } from "./schema";
import { excluirUnidadeRevenda } from "./actions";
import { gerarTabelaRevendas, type GerarTabelaRevendasState } from "./tabela-actions";
import { UnidadeModal } from "./unidade-modal";
import { ConfiguracoesModal } from "./configuracoes-modal";
import type { ConfiguracaoRevendaRow, UnidadeRevendaRow } from "./tipos";

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function formatarValor(valor: string): string {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function RevendasClient({
  unidades,
  config,
}: {
  unidades: UnidadeRevendaRow[];
  config: ConfiguracaoRevendaRow;
}) {
  // `undefined` = fechado; `null` = aberto em modo criação; string = id da unidade em edição.
  // Guarda só o id (não o objeto) e deriva `modalUnidade` do `unidades` atual a cada
  // render — assim, depois de salvar e o router.refresh() trazer dados novos, o modal
  // sempre enxerga a linha mais recente, sem precisar sincronizar estado manualmente.
  const [modalUnidadeId, setModalUnidadeId] = useState<string | null | undefined>(undefined);
  const [modalConfig, setModalConfig] = useState(false);

  const modalUnidade =
    modalUnidadeId === undefined
      ? undefined
      : modalUnidadeId === null
        ? null
        : (unidades.find((u) => u.id === modalUnidadeId) ?? undefined);

  const [state, formAction, pending] = useActionState<GerarTabelaRevendasState, FormData>(
    (prev) => gerarTabelaRevendas(prev),
    undefined
  );

  const url = state?.success ? state.url : config.tabelaPdfUrl;
  const geradoEm = state?.success ? state.geradoEm : config.tabelaPdfGeradoEm;
  const naTabela = unidades.filter((u) => u.status !== "VENDIDA").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-medium text-primary">Revendas</h1>
        <div className="flex flex-wrap items-center gap-3">
          <form action={formAction}>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-accent-light disabled:opacity-60"
            >
              {pending ? "Gerando..." : "Gerar tabela"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setModalUnidadeId(null)}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light"
          >
            Nova unidade
          </button>
          <button
            type="button"
            onClick={() => setModalConfig(true)}
            className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-mist"
          >
            Configurações da tabela
          </button>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-line bg-white p-6">
        <p className="text-sm text-ink/60">
          A tabela reúne, uma unidade por página A4, as {naTabela} unidade(s) com status Disponível
          ou Reservada. As vendidas continuam no cadastro, mas ficam fora do PDF.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {geradoEm && (
            <p className="text-sm text-ink/60">
              Última geração:{" "}
              <span className="font-medium text-ink">{formatarDataHora(geradoEm)}</span>
            </p>
          )}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mist"
            >
              Visualizar tabela
            </a>
          )}
        </div>

        {state?.success === true && (
          <div className="space-y-1">
            <p className="text-sm text-green-700">Tabela gerada com sucesso.</p>
            {state.avisos.length > 0 && (
              <div className="rounded-md bg-mist p-3 text-sm">
                <p className="font-medium text-primary">
                  Conteúdo cortado por não caber no espaço do bloco:
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-ink/70">
                  {state.avisos.map((aviso) => (
                    <li key={aviso}>{aviso}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#e9eaec] text-left text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Empreendimento / construção</th>
              <th className="px-4 py-3 font-medium">Unidade</th>
              <th className="px-4 py-3 font-medium">Localização</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {unidades.map((unidade) => (
              <tr key={unidade.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setModalUnidadeId(unidade.id)}
                    className="font-medium text-primary hover:underline"
                  >
                    {unidade.nome}
                  </button>
                </td>
                <td className="px-4 py-3 text-ink/70">{unidade.numeroUnidade ?? "—"}</td>
                <td className="px-4 py-3 text-ink/70">
                  {[unidade.bairro, unidade.cidade].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-ink/70">{formatarValor(unidade.valor)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${REVENDA_STATUS_STYLE[unidade.status]}`}
                  >
                    {REVENDA_STATUS_LABEL[unidade.status as keyof typeof REVENDA_STATUS_LABEL]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteButton
                    action={excluirUnidadeRevenda.bind(null, unidade.id)}
                    confirmMessage={`Excluir "${unidade.nome}"? Essa ação não pode ser desfeita.`}
                  />
                </td>
              </tr>
            ))}
            {unidades.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
                  Nenhuma unidade de revenda cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalUnidade !== undefined && (
        <UnidadeModal
          key={`${modalUnidade?.id ?? "novo"}-${modalUnidade?.updatedAt ?? "0"}`}
          unidade={modalUnidade}
          onFechar={() => setModalUnidadeId(undefined)}
        />
      )}

      {modalConfig && (
        <ConfiguracoesModal config={config} onFechar={() => setModalConfig(false)} />
      )}
    </div>
  );
}
