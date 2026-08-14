"use client";

export type CorretorCsvRow = {
  nome: string;
  email: string;
  telefone: string | null;
  creci: string | null;
  status: string;
  criadoEm: string;
};

function escaparCsv(valor: string): string {
  if (/[",\n;]/.test(valor)) {
    return `"${valor.replaceAll('"', '""')}"`;
  }
  return valor;
}

export function ExportarCorretoresCsvButton({ rows }: { rows: CorretorCsvRow[] }) {
  function exportar() {
    const cabecalho = ["Nome", "E-mail", "Telefone", "CRECI", "Status", "Cadastro"];
    const linhas = rows.map((row) => [
      row.nome,
      row.email,
      row.telefone ?? "",
      row.creci ?? "",
      row.status,
      row.criadoEm,
    ]);
    const csv = [cabecalho, ...linhas].map((linha) => linha.map(escaparCsv).join(";")).join("\n");
    // BOM no início — Excel abre CSV com acentos corretamente.
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "corretores.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportar}
      disabled={rows.length === 0}
      className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-accent-light disabled:opacity-40"
    >
      Exportar .csv
    </button>
  );
}
