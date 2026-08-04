"use client";

import { useActionState, useState } from "react";
import { UNIDADE_STATUS } from "../schema";
import type { LoteFormState } from "./actions";

const STATUS_LABEL: Record<(typeof UNIDADE_STATUS)[number], string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  BLOQUEADO: "Bloqueado",
};

export function LoteForm({
  action,
}: {
  action: (state: LoteFormState, formData: FormData) => Promise<LoteFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-line bg-white p-8">
      <p className="text-sm text-ink/60">
        Marque &quot;aplicar&quot; nos campos que você quer alterar. Os campos não marcados
        permanecem como estão em cada unidade.
      </p>

      <CampoTexto name="preco" aplicarName="aplicarPreco" label="Preço (R$)" hint="Ex.: 350000.00" />
      <CampoSelect name="status" aplicarName="aplicarStatus" label="Status" />
      <CampoTexto name="tipo" aplicarName="aplicarTipo" label="Tipo" hint="Ex.: 2 dormitórios" />
      <CampoTexto name="vagas" aplicarName="aplicarVagas" label="Vagas" type="number" />
      <CampoTexto
        name="areaPrivativa"
        aplicarName="aplicarArea"
        label="Área privativa (m²)"
        type="number"
        step="0.01"
      />
      <CampoDecorado />

      <div className="space-y-1.5">
        <label htmlFor="motivo" className="text-sm font-medium text-ink">
          Motivo da alteração (opcional)
        </label>
        <input
          id="motivo"
          name="motivo"
          type="text"
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <p className="text-xs text-ink/50">
          Registrado no histórico de preço/status de cada unidade alterada.
        </p>
      </div>

      {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
      >
        {pending ? "Aplicando..." : "Aplicar às unidades selecionadas"}
      </button>
    </form>
  );
}

function CampoTexto({
  name,
  aplicarName,
  label,
  hint,
  type = "text",
  step,
}: {
  name: string;
  aplicarName: string;
  label: string;
  hint?: string;
  type?: string;
  step?: string;
}) {
  const [ativo, setAtivo] = useState(false);

  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        name={aplicarName}
        checked={ativo}
        onChange={(e) => setAtivo(e.target.checked)}
        className="mt-2.5 size-4 rounded border-line"
      />
      <div className="flex-1 space-y-1.5">
        <label className="text-sm font-medium text-ink">{label}</label>
        <input
          name={name}
          type={type}
          step={step}
          disabled={!ativo}
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-[#f9fafc] disabled:text-ink/40"
        />
        {hint && <p className="text-xs text-ink/50">{hint}</p>}
      </div>
    </div>
  );
}

function CampoSelect({
  name,
  aplicarName,
  label,
}: {
  name: string;
  aplicarName: string;
  label: string;
}) {
  const [ativo, setAtivo] = useState(false);

  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        name={aplicarName}
        checked={ativo}
        onChange={(e) => setAtivo(e.target.checked)}
        className="mt-2.5 size-4 rounded border-line"
      />
      <div className="flex-1 space-y-1.5">
        <label className="text-sm font-medium text-ink">{label}</label>
        <select
          name={name}
          disabled={!ativo}
          defaultValue="DISPONIVEL"
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-[#f9fafc] disabled:text-ink/40"
        >
          {UNIDADE_STATUS.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABEL[value]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function CampoDecorado() {
  const [ativo, setAtivo] = useState(false);

  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        name="aplicarDecorado"
        checked={ativo}
        onChange={(e) => setAtivo(e.target.checked)}
        className="mt-2.5 size-4 rounded border-line"
      />
      <div className="flex-1 space-y-1.5">
        <label className="text-sm font-medium text-ink">Marca &quot;decorado&quot; (showroom)</label>
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            name="isDecorado"
            disabled={!ativo}
            className="size-4 rounded border-line"
          />
          Definir todas as selecionadas como decoradas
        </label>
      </div>
    </div>
  );
}
