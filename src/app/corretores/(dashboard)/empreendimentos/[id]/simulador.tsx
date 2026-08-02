"use client";

import { useMemo, useState } from "react";
import { simularFinanciamento, type SistemaAmortizacao } from "@/lib/simulacao";

type Unidade = { id: string; identificador: string; preco: number };

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function SimuladorFinanciamento({
  unidades,
  configuracao,
}: {
  unidades: Unidade[];
  configuracao: {
    taxaJurosAnual: number;
    prazoMaximoMeses: number;
    entradaMinimaPercentual: number;
    sistemaAmortizacao: SistemaAmortizacao;
  };
}) {
  const [unidadeId, setUnidadeId] = useState(unidades[0]?.id ?? "");
  const [entrada, setEntrada] = useState(configuracao.entradaMinimaPercentual);
  const [prazo, setPrazo] = useState(configuracao.prazoMaximoMeses);

  const unidade = unidades.find((u) => u.id === unidadeId) ?? unidades[0];

  const resultado = useMemo(() => {
    if (!unidade) return null;
    return simularFinanciamento({
      valorImovel: unidade.preco,
      entradaPercentual: entrada,
      numeroParcelas: prazo,
      taxaJurosAnual: configuracao.taxaJurosAnual,
      sistema: configuracao.sistemaAmortizacao,
    });
  }, [unidade, entrada, prazo, configuracao]);

  return (
    <div className="space-y-5 rounded-xl border border-line bg-white p-8">
      <div>
        <h2 className="font-display text-xl font-medium text-primary">
          Simulação de financiamento
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          Taxa {configuracao.taxaJurosAnual.toFixed(2)}% a.a. · Sistema{" "}
          {configuracao.sistemaAmortizacao === "SAC" ? "SAC" : "Tabela Price"} · Entrada
          mínima {configuracao.entradaMinimaPercentual.toFixed(2)}%
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink">Unidade</label>
          <select
            value={unidadeId}
            onChange={(event) => setUnidadeId(event.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.identificador} — {formatCurrency(u.preco)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink">Entrada (%)</label>
          <input
            type="number"
            min={configuracao.entradaMinimaPercentual}
            max={100}
            step="0.5"
            value={entrada}
            onChange={(event) =>
              setEntrada(Math.max(configuracao.entradaMinimaPercentual, Number(event.target.value)))
            }
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink">Prazo (meses)</label>
          <input
            type="number"
            min={1}
            max={configuracao.prazoMaximoMeses}
            value={prazo}
            onChange={(event) =>
              setPrazo(Math.min(configuracao.prazoMaximoMeses, Math.max(1, Number(event.target.value))))
            }
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {resultado && (
        <div className="grid gap-4 rounded-lg bg-mist p-6 sm:grid-cols-4">
          <div>
            <p className="text-xs text-ink/60">Valor financiado</p>
            <p className="font-display text-lg font-semibold text-primary">
              {formatCurrency(resultado.valorFinanciado)}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink/60">
              {resultado.sistema === "PRICE" ? "Parcela fixa" : "1ª parcela"}
            </p>
            <p className="font-display text-lg font-semibold text-primary">
              {formatCurrency(resultado.primeiraParcela)}
            </p>
          </div>
          {resultado.sistema === "SAC" && (
            <div>
              <p className="text-xs text-ink/60">Última parcela</p>
              <p className="font-display text-lg font-semibold text-primary">
                {formatCurrency(resultado.ultimaParcela)}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-ink/60">Total do financiamento</p>
            <p className="font-display text-lg font-semibold text-primary">
              {formatCurrency(resultado.valorTotal)}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-ink/40">
        Simulação estimada, sem caráter contratual. Sujeita a análise de crédito e às
        condições do agente financeiro.
      </p>
    </div>
  );
}
