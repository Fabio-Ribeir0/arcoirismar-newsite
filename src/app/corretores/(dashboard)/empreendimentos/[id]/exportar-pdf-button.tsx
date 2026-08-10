"use client";

import { useState } from "react";

export function ExportarPdfButton({ empreendimentoId, slug }: { empreendimentoId: string; slug: string }) {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const exportar = async () => {
    setErro(null);
    setGerando(true);
    try {
      const resposta = await fetch(`/api/corretores/empreendimentos/${empreendimentoId}/pdf`);
      if (!resposta.ok) {
        throw new Error("Falha ao gerar o PDF. Tente novamente.");
      }
      const blob = await resposta.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tabela-${slug}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErro("Não foi possível gerar o PDF agora. Tente novamente em instantes.");
    } finally {
      setGerando(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={exportar}
        disabled={gerando}
        className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mist disabled:opacity-60"
      >
        {gerando ? "Gerando PDF..." : "Exportar PDF"}
      </button>
      {erro && <p className="text-xs text-red-600">{erro}</p>}
    </div>
  );
}
