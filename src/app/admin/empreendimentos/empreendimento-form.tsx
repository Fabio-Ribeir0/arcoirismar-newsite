"use client";

import { useActionState } from "react";
import { EMPREENDIMENTO_STATUS } from "./schema";
import type { EmpreendimentoFormState } from "./actions";

const STATUS_LABEL: Record<(typeof EMPREENDIMENTO_STATUS)[number], string> = {
  EM_BREVE: "Em breve",
  LANCAMENTO: "Lançamento",
  EM_OBRAS: "Em obras",
  PRONTO: "Pronto para morar",
};

type DefaultValues = {
  nome?: string;
  slug?: string;
  status?: string;
  descricao?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  entregaPrevista?: string | null;
};

export function EmpreendimentoForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (state: EmpreendimentoFormState, formData: FormData) => Promise<EmpreendimentoFormState>;
  defaultValues?: DefaultValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const errors = state?.success === false ? state.errors : undefined;
  const message = state?.success === false ? state.message : undefined;

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-line bg-white p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome" name="nome" defaultValue={defaultValues?.nome} errors={errors?.nome} />
        <Field label="Slug" name="slug" defaultValue={defaultValues?.slug} errors={errors?.slug} hint="Deixe em branco para gerar a partir do nome." />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="status" className="text-sm font-medium text-ink">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? "EM_BREVE"}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {EMPREENDIMENTO_STATUS.map((value) => (
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
        <Field
          label="Entrega prevista"
          name="entregaPrevista"
          type="date"
          defaultValue={defaultValues?.entregaPrevista ?? ""}
          errors={errors?.entregaPrevista}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="descricao" className="text-sm font-medium text-ink">
          Descrição
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={4}
          defaultValue={defaultValues?.descricao ?? ""}
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Endereço" name="endereco" defaultValue={defaultValues?.endereco} errors={errors?.endereco} />
        <Field label="Bairro" name="bairro" defaultValue={defaultValues?.bairro} errors={errors?.bairro} />
        <Field label="Cidade" name="cidade" defaultValue={defaultValues?.cidade} errors={errors?.cidade} />
        <div className="grid grid-cols-2 gap-5">
          <Field label="Estado" name="estado" defaultValue={defaultValues?.estado} errors={errors?.estado} />
          <Field label="CEP" name="cep" defaultValue={defaultValues?.cep} errors={errors?.cep} />
        </div>
      </div>

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
  defaultValue,
  errors,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | null;
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
