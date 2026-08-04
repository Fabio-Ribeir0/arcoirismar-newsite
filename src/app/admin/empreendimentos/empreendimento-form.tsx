"use client";

import { useActionState } from "react";
import { DESTAQUE_OPCOES, EMPREENDIMENTO_STATUS } from "./schema";
import type { EmpreendimentoFormState } from "./actions";

const STATUS_LABEL: Record<(typeof EMPREENDIMENTO_STATUS)[number], string> = {
  EM_BREVE: "Em breve",
  LANCAMENTO: "Lançamento",
  EM_OBRAS: "Em obras",
  PRONTO: "Pronto para morar",
};

const DESTAQUE_LABEL: Record<(typeof DESTAQUE_OPCOES)[number], string> = {
  NENHUM: "Não destacar na home",
  PORTFOLIO: "Destacar só no Portfólio",
  CARROSSEL: "Destacar no carrossel (+ Portfólio)",
};

type DefaultValues = {
  nome?: string;
  slug?: string;
  status?: string;
  destaque?: string;
  slogan?: string | null;
  descricao?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  entregaPrevista?: string | null;
  andares?: string | null;
  unidadesPorAndar?: string | null;
  valorBase?: string | null;
  entradaPercentual?: string | null;
  entregaChavesPercentual?: string | null;
  parcelas?: string | null;
  tipoPadrao?: string | null;
  areaPrivativaPadrao?: string | null;
  vagasPadrao?: string | null;
};

export function EmpreendimentoForm({
  action,
  defaultValues,
  submitLabel,
  showMotivo,
}: {
  action: (state: EmpreendimentoFormState, formData: FormData) => Promise<EmpreendimentoFormState>;
  defaultValues?: DefaultValues;
  submitLabel: string;
  showMotivo?: boolean;
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
        <label htmlFor="destaque" className="text-sm font-medium text-ink">
          Destaque na home
        </label>
        <select
          id="destaque"
          name="destaque"
          defaultValue={defaultValues?.destaque ?? "NENHUM"}
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {DESTAQUE_OPCOES.map((value) => (
            <option key={value} value={value}>
              {DESTAQUE_LABEL[value]}
            </option>
          ))}
        </select>
        {errors?.destaque?.map((error) => (
          <p key={error} className="text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      <Field
        label="Slogan"
        name="slogan"
        defaultValue={defaultValues?.slogan}
        errors={errors?.slogan}
        hint='Usado no banner/hero. Ex.: "Um novo conceito de morar frente ao mar"'
      />

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

      <div className="space-y-4 border-t border-line pt-6">
        <div>
          <h3 className="font-display text-lg font-medium text-primary">Geração de unidades</h3>
          <p className="text-sm text-ink/60">
            Preencha estes campos e use o botão &quot;Gerar unidades&quot; (na página do
            empreendimento) para criar automaticamente todas as unidades. Também definem a
            coluna de parcelas na tabela de unidades.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="Andares"
            name="andares"
            type="number"
            defaultValue={defaultValues?.andares}
            errors={errors?.andares}
          />
          <Field
            label="Unidades por andar"
            name="unidadesPorAndar"
            type="number"
            defaultValue={defaultValues?.unidadesPorAndar}
            errors={errors?.unidadesPorAndar}
          />
          <Field
            label="Valor base (R$)"
            name="valorBase"
            defaultValue={defaultValues?.valorBase}
            errors={errors?.valorBase}
            hint="Ex.: 350000.00"
          />
          <Field
            label="Entrada (%)"
            name="entradaPercentual"
            defaultValue={defaultValues?.entradaPercentual}
            errors={errors?.entradaPercentual}
            hint="Ex.: 20.00"
          />
          <Field
            label="Entrega das chaves (%)"
            name="entregaChavesPercentual"
            defaultValue={defaultValues?.entregaChavesPercentual}
            errors={errors?.entregaChavesPercentual}
            hint="Ex.: 10.00"
          />
          <Field
            label="Parcelas"
            name="parcelas"
            type="number"
            defaultValue={defaultValues?.parcelas}
            errors={errors?.parcelas}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="Tipo padrão (opcional)"
            name="tipoPadrao"
            defaultValue={defaultValues?.tipoPadrao}
            errors={errors?.tipoPadrao}
            hint="Ex.: 2 dormitórios"
          />
          <Field
            label="Área privativa padrão (m², opcional)"
            name="areaPrivativaPadrao"
            defaultValue={defaultValues?.areaPrivativaPadrao}
            errors={errors?.areaPrivativaPadrao}
          />
          <Field
            label="Vagas padrão (opcional)"
            name="vagasPadrao"
            type="number"
            defaultValue={defaultValues?.vagasPadrao}
            errors={errors?.vagasPadrao}
          />
        </div>

        {showMotivo && (
          <Field
            label="Motivo da alteração (opcional)"
            name="motivo"
            errors={errors?.motivo}
            hint="Registrado no histórico se o plano de pagamento (valor base, entrada, entrega das chaves ou parcelas) for alterado."
          />
        )}
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
