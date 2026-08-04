"use client";

export function ExportarPdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#f9fafc]"
    >
      Exportar PDF
    </button>
  );
}
