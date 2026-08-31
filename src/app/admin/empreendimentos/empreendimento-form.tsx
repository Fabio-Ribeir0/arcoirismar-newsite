"use client";

import { useActionState, useState } from "react";
import dynamic from "next/dynamic";
import { DESTAQUE_OPCOES, EMPREENDIMENTO_STATUS } from "./schema";
import type { EmpreendimentoFormState } from "./actions";
import { RichTextEditor } from "./[id]/rich-text-editor";

const MapaLocalizacao = dynamic(
  () => import("./mapa-localizacao").then((mod) => mod.MapaLocalizacao),
  { ssr: false, loading: () => <div className="h-80 w-full animate-pulse rounded-lg bg-mist" /> }
);

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
  espelhoVenda?: boolean;
  slogan?: string | null;
  descricao?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  entregaPrevista?: string | null;
  andares?: string | null;
  unidadesPorAndar?: string | null;
  valorBase?: string | null;
  entradaValor?: string | null;
  entradaTipo?: string | null;
  entregaChavesValor?: string | null;
  entregaChavesTipo?: string | null;
  parcelas?: string | null;
  dormitoriosPadrao?: string | null;
  suitesPadrao?: string | null;
  areaPrivativaPadrao?: string | null;
  vagasPadrao?: string | null;
};

export function EmpreendimentoForm({
  action,
  defaultValues,
  submitLabel,
  showMotivo,
  empreendimentoId,
}: {
  action: (state: EmpreendimentoFormState, formData: FormData) => Promise<EmpreendimentoFormState>;
  defaultValues?: DefaultValues;
  submitLabel: string;
  showMotivo?: boolean;
  /** Só disponível ao editar (não existe ainda ao criar) — habilita a edição em rich text da descrição, que precisa de um id pra permitir inserir imagens. */
  empreendimentoId?: string;
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

      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            name="espelhoVenda"
            defaultChecked={defaultValues?.espelhoVenda ?? false}
            className="size-4 rounded border-line"
          />
          Espelho de Venda
        </label>
        <p className="text-xs text-ink/50">
          Exibe este empreendimento na página Espelho de Venda (/admin/espelho-venda).
        </p>
      </div>

      <Field
        label="Slogan"
        name="slogan"
        defaultValue={defaultValues?.slogan}
        errors={errors?.slogan}
        hint='Usado no banner/hero. Ex.: "Um novo conceito de morar frente ao mar"'
      />

      {empreendimentoId ? (
        <RichTextEditor
          empreendimentoId={empreendimentoId}
          name="descricao"
          label="Descrição"
          defaultValueHtml={defaultValues?.descricao ?? ""}
        />
      ) : (
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
          <p className="text-xs text-ink/50">
            A formatação (negrito, listas, imagens etc.) fica disponível depois de criar o
            empreendimento.
          </p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Endereço" name="endereco" defaultValue={defaultValues?.endereco} errors={errors?.endereco} />
        <Field label="Bairro" name="bairro" defaultValue={defaultValues?.bairro} errors={errors?.bairro} />
        <Field label="Cidade" name="cidade" defaultValue={defaultValues?.cidade} errors={errors?.cidade} />
        <div className="grid grid-cols-2 gap-5">
          <Field label="Estado" name="estado" defaultValue={defaultValues?.estado} errors={errors?.estado} />
          <Field label="CEP" name="cep" defaultValue={defaultValues?.cep} errors={errors?.cep} />
        </div>
      </div>

      <MapaLocalizacao
        latitudeInicial={defaultValues?.latitude}
        longitudeInicial={defaultValues?.longitude}
        errosLatitude={errors?.latitude}
        errosLongitude={errors?.longitude}
      />

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
          <CampoValorTipo
            label="Entrada"
            nomeValor="entradaValor"
            nomeTipo="entradaTipo"
            defaultValue={defaultValues?.entradaValor}
            defaultTipo={defaultValues?.entradaTipo}
            errosValor={errors?.entradaValor}
            hintPercentual="Percentual do preço da unidade. Ex.: 20.00"
            hintFixo="Valor fixo em R$, igual para todas as unidades. Ex.: 20000.00"
          />
          <CampoValorTipo
            label="Entrega das chaves"
            nomeValor="entregaChavesValor"
            nomeTipo="entregaChavesTipo"
            defaultValue={defaultValues?.entregaChavesValor}
            defaultTipo={defaultValues?.entregaChavesTipo}
            errosValor={errors?.entregaChavesValor}
            hintPercentual="Percentual do preço da unidade. Ex.: 10.00"
            hintFixo="Valor fixo em R$, igual para todas as unidades. Ex.: 10000.00"
          />
          <Field
            label="Parcelas"
            name="parcelas"
            type="number"
            defaultValue={defaultValues?.parcelas}
            errors={errors?.parcelas}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-4">
          <Field
            label="Dormitórios padrão (opcional)"
            name="dormitoriosPadrao"
            type="number"
            defaultValue={defaultValues?.dormitoriosPadrao}
            errors={errors?.dormitoriosPadrao}
          />
          <Field
            label="Suítes padrão (opcional)"
            name="suitesPadrao"
            type="number"
            defaultValue={defaultValues?.suitesPadrao}
            errors={errors?.suitesPadrao}
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

/** Valor com um switch % / R$ ao lado — o campo de texto aceita o mesmo formato nos dois casos. */
function CampoValorTipo({
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
