"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DeleteButton } from "@/components/delete-button";
import { excluirUnidade } from "./unidades/actions";

const UNIDADE_STATUS_LABEL: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  BLOQUEADO: "Bloqueado",
};

export type UnidadeRow = {
  id: string;
  identificador: string;
  andar: number | null;
  tipo: string;
  areaPrivativa: number;
  preco: number;
  parcela: number | null;
  status: string;
  isDecorado: boolean;
};

export function UnidadesTable({
  empreendimentoId,
  unidades,
  parcelasLabel,
}: {
  empreendimentoId: string;
  unidades: UnidadeRow[];
  parcelasLabel: string | null;
}) {
  const router = useRouter();
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [andarDe, setAndarDe] = useState("");
  const [andarAte, setAndarAte] = useState("");
  const [finalUnidade, setFinalUnidade] = useState("");

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function alternar(id: string) {
    setSelecionadas((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function selecionarTodas() {
    setSelecionadas(new Set(unidades.map((u) => u.id)));
  }

  function limparSelecao() {
    setSelecionadas(new Set());
  }

  function selecionarPorPadrao() {
    const de = andarDe ? Number(andarDe) : null;
    const ate = andarAte ? Number(andarAte) : null;
    setSelecionadas((prev) => {
      const novo = new Set(prev);
      unidades.forEach((u) => {
        if (u.andar === null) return;
        const dentroDoIntervalo = (de === null || u.andar >= de) && (ate === null || u.andar <= ate);
        const bateComFinal = !finalUnidade || u.identificador.endsWith(finalUnidade);
        if (dentroDoIntervalo && bateComFinal) novo.add(u.id);
      });
      return novo;
    });
  }

  const todasSelecionadas = useMemo(
    () => unidades.length > 0 && selecionadas.size === unidades.length,
    [unidades, selecionadas]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-white p-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-ink/60">Andar de</label>
          <input
            type="number"
            value={andarDe}
            onChange={(e) => setAndarDe(e.target.value)}
            className="w-24 rounded-md border border-line px-2 py-1.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-ink/60">Andar até</label>
          <input
            type="number"
            value={andarAte}
            onChange={(e) => setAndarAte(e.target.value)}
            className="w-24 rounded-md border border-line px-2 py-1.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-ink/60">Final da unidade</label>
          <input
            type="text"
            value={finalUnidade}
            onChange={(e) => setFinalUnidade(e.target.value)}
            placeholder="ex.: 01"
            className="w-28 rounded-md border border-line px-2 py-1.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="button"
          onClick={selecionarPorPadrao}
          className="rounded-md border border-line px-4 py-2 text-sm font-medium text-primary hover:bg-mist"
        >
          Selecionar por padrão
        </button>
        <button
          type="button"
          onClick={selecionarTodas}
          className="rounded-md border border-line px-4 py-2 text-sm font-medium text-primary hover:bg-mist"
        >
          Selecionar todas
        </button>
        <button
          type="button"
          onClick={limparSelecao}
          className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink/60 hover:bg-mist"
        >
          Limpar seleção
        </button>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-ink/60">{selecionadas.size} selecionada(s)</span>
          <button
            type="button"
            disabled={selecionadas.size === 0}
            onClick={() =>
              router.push(
                `/admin/empreendimentos/${empreendimentoId}/unidades/lote?ids=${Array.from(selecionadas).join(",")}`
              )
            }
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-40"
          >
            Editar selecionadas
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">
                <input
                  type="checkbox"
                  checked={todasSelecionadas}
                  onChange={(e) => (e.target.checked ? selecionarTodas() : limparSelecao())}
                  className="size-4 rounded border-line"
                />
              </th>
              <th className="px-4 py-3 font-medium">Unidade</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              {parcelasLabel && <th className="px-4 py-3 font-medium">{parcelasLabel}</th>}
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {unidades.map((unidade) => (
              <tr key={unidade.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selecionadas.has(unidade.id)}
                    onChange={() => alternar(unidade.id)}
                    className="size-4 rounded border-line"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/empreendimentos/${empreendimentoId}/unidades/${unidade.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {unidade.identificador}
                  </Link>
                  {unidade.isDecorado && (
                    <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">
                      Decorado
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink/70">{unidade.tipo}</td>
                <td className="px-4 py-3 text-ink/70">{formatCurrency(unidade.preco)}</td>
                {parcelasLabel && (
                  <td className="px-4 py-3 text-ink/70">
                    {unidade.parcela !== null ? formatCurrency(unidade.parcela) : "—"}
                  </td>
                )}
                <td className="px-4 py-3 text-ink/70">{UNIDADE_STATUS_LABEL[unidade.status]}</td>
                <td className="px-4 py-3 text-right">
                  <DeleteButton
                    action={excluirUnidade.bind(null, empreendimentoId, unidade.id)}
                    confirmMessage={`Excluir a unidade "${unidade.identificador}"?`}
                  />
                </td>
              </tr>
            ))}
            {unidades.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink/50">
                  Nenhuma unidade cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
