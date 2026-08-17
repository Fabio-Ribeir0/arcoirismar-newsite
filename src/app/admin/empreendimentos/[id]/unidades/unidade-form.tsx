"use client";

import { useActionState } from "react";
import { UNIDADE_STATUS } from "./schema";
import type { UnidadeFormState } from "./actions";

const STATUS_LABEL: Record<(typeof UNIDADE_STATUS)[number], string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  BLOQUEADO: "Bloqueado",
  DECORADO: "Decorado",
  TROCA_AREA: "Troca de área",
};

type DefaultValues = {
  identificador?: string;
  dormitorios?: number;
  suites?: number;
  areaPrivativa?: number;
  vagas?: number;
  areaGaragem?: number;
  areaComum?: number;
  andar?: number | null;
  preco?: string;
  status?: string;
};

export function UnidadeForm({
  action,
  defaultValues,
  submitLabel,
  showMotivo,
}: {
  action: (state: UnidadeFormState, formData: FormData) => Promise<UnidadeFormState>;
  defaultValues?: DefaultValues;
  submitLabel: string;
  showMotivo?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const errors = state?.success === false ? state.errors : undefined;
  const message = state?.success === false ? state.message : undefined;

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-line bg-white p-8">
      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label="Identificador"
          name="identificador"
          defaultValue={defaultValues?.identificador}
          errors={errors?.identificador}
          hint='Ex.: "302" ou "Bloco A - 1201"'
        />
        <Field
          label="Dormitórios"
          name="dormitorios"
          type="number"
          defaultValue={defaultValues?.dormitorios?.toString()}
          errors={errors?.dormitorios}
        />
        <Field
          label="Suítes"
          name="suites"
          type="number"
          defaultValue={defaultValues?.suites?.toString() ?? "0"}
          errors={errors?.suites}
          hint="Quantos dos dormitórios têm banheiro privativo."
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <Field
          label="Área privativa (m²)"
          name="areaPrivativa"
          type="number"
          step="0.01"
          defaultValue={defaultValues?.areaPrivativa?.toString()}
          errors={errors?.areaPrivativa}
        />
        <Field
          label="Área da garagem (m²)"
          name="areaGaragem"
          type="number"
          step="0.01"
          defaultValue={defaultValues?.areaGaragem?.toString() ?? "0"}
          errors={errors?.areaGaragem}
        />
        <Field
          label="Área comum (m²)"
          name="areaComum"
          type="number"
          step="0.01"
          defaultValue={defaultValues?.areaComum?.toString() ?? "0"}
          errors={errors?.areaComum}
        />
        <Field
          label="Vagas"
          name="vagas"
          type="number"
          defaultValue={defaultValues?.vagas?.toString() ?? "0"}
          errors={errors?.vagas}
        />
        <Field
          label="Andar"
          name="andar"
          type="number"
          defaultValue={defaultValues?.andar?.toString()}
          errors={errors?.andar}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Preço (R$)"
          name="preco"
          defaultValue={defaultValues?.preco}
          errors={errors?.preco}
          hint="Ex.: 350000.00"
        />
        <div className="space-y-1.5">
          <label htmlFor="status" className="text-sm font-medium text-ink">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? "DISPONIVEL"}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {UNIDADE_STATUS.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABEL[value]}
              </option>
            ))}
          </select>
          {errors?.status?.map((error) => (
            <p key={error} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      </div>

      {showMotivo && (
        <Field
          label="Motivo da alteração (opcional)"
          name="motivo"
          errors={errors?.motivo}
          hint="Registrado no histórico se o preço ou status forem alterados."
        />
      )}

      {message && <p className="text-sm text-red-600">{message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
      >
        {pending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  step,
  defaultValue,
  errors,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
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
        step={step}
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
