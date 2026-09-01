"use client";

import { useState } from "react";

/** Valor com um switch % / R$ ao lado — o campo de texto aceita o mesmo formato nos dois casos. */
export function CampoValorTipo({
  label,
  nomeValor,
  nomeTipo,
  defaultValue,
  defaultTipo,
  errosValor,
  hintPercentual,
  hintFixo,
}: {
  label: string;
  nomeValor: string;
  nomeTipo: string;
  defaultValue?: string | null;
  defaultTipo?: string | null;
  errosValor?: string[];
  hintPercentual: string;
  hintFixo: string;
}) {
  const [fixo, setFixo] = useState((defaultTipo ?? "PERCENTUAL") === "FIXO");

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={nomeValor} className="text-sm font-medium text-ink">
          {label}
        </label>
        <button
          type="button"
          role="switch"
          aria-checked={fixo}
          aria-label={`${label}: alternar entre percentual e valor fixo em R$`}
          onClick={() => setFixo((valor) => !valor)}
          className="flex shrink-0 items-center gap-1.5 text-xs font-semibold"
        >
          <span className={fixo ? "text-ink/40" : "text-primary"}>%</span>
          <span
            className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${fixo ? "bg-primary" : "bg-line"}`}
          >
            <span
              className={`size-4 rounded-full bg-white shadow transition-transform ${
                fixo ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </span>
          <span className={fixo ? "text-primary" : "text-ink/40"}>R$</span>
        </button>
      </div>

      <input type="hidden" name={nomeTipo} value={fixo ? "FIXO" : "PERCENTUAL"} />
      <input
        id={nomeValor}
        name={nomeValor}
        type="text"
        inputMode="decimal"
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <p className="text-xs text-ink/50">{fixo ? hintFixo : hintPercentual}</p>
      {errosValor?.map((error) => (
        <p key={error} className="text-sm text-red-600">
          {error}
        </p>
      ))}
    </div>
  );
}
