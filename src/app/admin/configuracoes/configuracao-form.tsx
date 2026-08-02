"use client";

import { useActionState } from "react";
import { SISTEMA_AMORTIZACAO } from "./schema";
import type { ConfiguracaoFormState } from "./actions";

const SISTEMA_LABEL: Record<(typeof SISTEMA_AMORTIZACAO)[number], string> = {
  SAC: "SAC",
  PRICE: "Tabela Price",
};

type DefaultValues = {
  taxaJurosAnual?: string;
  prazoMaximoMeses?: number;
  entradaMinimaPercentual?: string;
  sistemaAmortizacao?: string;
};

export function ConfiguracaoForm({
  action,
  defaultValues,
}: {
  action: (state: ConfiguracaoFormState, formData: FormData) => Promise<ConfiguracaoFormState>;
  defaultValues?: DefaultValues;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const errors = state?.success === false ? state.errors : undefined;
  const message = state?.success === false ? state.message : undefined;

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-line bg-white p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Taxa de juros anual (%)"
          name="taxaJurosAnual"
          defaultValue={defaultValues?.taxaJurosAnual}
          errors={errors?.taxaJurosAnual}
          hint="Ex.: 10.50"
        />
        <Field
          label="Prazo máximo (meses)"
          name="prazoMaximoMeses"
          type="number"
          defaultValue={defaultValues?.prazoMaximoMeses?.toString()}
          errors={errors?.prazoMaximoMeses}
        />
        <Field
          label="Entrada mínima (%)"
          name="entradaMinimaPercentual"
          defaultValue={defaultValues?.entradaMinimaPercentual}
          errors={errors?.entradaMinimaPercentual}
          hint="Ex.: 20.00"
        />
        <div className="space-y-1.5">
          <label htmlFor="sistemaAmortizacao" className="text-sm font-medium text-ink">
            Sistema de amortização
          </label>
          <select
            id="sistemaAmortizacao"
            name="sistemaAmortizacao"
            defaultValue={defaultValues?.sistemaAmortizacao ?? "SAC"}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {SISTEMA_AMORTIZACAO.map((value) => (
              <option key={value} value={value}>
                {SISTEMA_LABEL[value]}
              </option>
            ))}
          </select>
          {errors?.sistemaAmortizacao?.map((error) => (
            <p key={error} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      </div>

      {message && <p className="text-sm text-red-600">{message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar nova configuração"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  errors,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  errors?: string[];
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
      />
      {hint && <p className="text-xs text-ink/50">{hint}</p>}
      {errors?.map((error) => (
        <p key={error} className="text-sm text-red-600">
          {error}
        </p>
      ))}
    </div>
  );
}
