"use client";

import { useMemo, useState } from "react";
import { HistoryTable, formatarDataHoraBR, type HistoryRow } from "./history-table";

const TAMANHOS_PAGINA = [25, 50, 100] as const;

function escaparCsv(valor: string): string {
  if (/[",\n;]/.test(valor)) {
    return `"${valor.replaceAll('"', '""')}"`;
  }
  return valor;
}

function exportarCsv(nomeArquivo: string, rows: HistoryRow[]) {
  const cabecalho = ["Data", "Alteração", "Por", "Motivo"];
  const linhas = rows.map((row) => [
    formatarDataHoraBR(row.data),
    row.descricao,
    row.autor,
    row.motivo ?? "",
  ]);
  const csv = [cabecalho, ...linhas].map((linha) => linha.map(escaparCsv).join(";")).join("\n");
  // BOM no início — Excel abre CSV com acentos corretamente.
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}

export function LogBloco({
  titulo,
  rows,
  emptyMessage,
  nomeArquivoCsv,
}: {
  titulo: string;
  rows: HistoryRow[];
  emptyMessage: string;
  nomeArquivoCsv: string;
}) {
  const [minimizado, setMinimizado] = useState(false);
  const [tamanhoPagina, setTamanhoPagina] = useState<number>(25);
  const [pagina, setPagina] = useState(1);

  const totalPaginas = Math.max(1, Math.ceil(rows.length / tamanhoPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const rowsPagina = useMemo(
    () => rows.slice((paginaAtual - 1) * tamanhoPagina, paginaAtual * tamanhoPagina),
    [rows, paginaAtual, tamanhoPagina]
  );

  function mudarTamanhoPagina(novoTamanho: number) {
    setTamanhoPagina(novoTamanho);
    setPagina(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-medium text-primary">{titulo}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportarCsv(nomeArquivoCsv, rows)}
            disabled={rows.length === 0}
            className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink transition bg-primary hover:bg-primary-light disabled:opacity-40"
          >
            Exportar .csv
          </button>
          <button
            type="button"
            onClick={() => setMinimizado((v) => !v)}
            className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink transition bg-accent hover:bg-accent-light"
          >
            {minimizado ? "Expandir" : "Minimizar"}
          </button>
        </div>
      </div>

      {!minimizado && (
        <>
          <HistoryTable rows={rowsPagina} emptyMessage={emptyMessage} />

          {rows.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink/60">
              <div className="flex items-center gap-2">
                <span>Por página:</span>
                {TAMANHOS_PAGINA.map((tamanho) => (
                  <button
                    key={tamanho}
                    type="button"
                    onClick={() => mudarTamanhoPagina(tamanho)}
                    className={`rounded-md border px-2.5 py-1 font-medium transition ${
                      tamanhoPagina === tamanho
                        ? "border-primary bg-primary text-white"
                        : "border-line text-ink hover:bg-mist"
                    }`}
                  >
                    {tamanho}
                  </button>
                ))}
              </div>

              {totalPaginas > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={paginaAtual === 1}
                    className="rounded-md border border-line px-2.5 py-1 font-medium text-ink transition hover:bg-mist disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span>
                    Página {paginaAtual} de {totalPaginas}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaAtual === totalPaginas}
                    className="rounded-md border border-line px-2.5 py-1 font-medium text-ink transition hover:bg-mist disabled:opacity-40"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
