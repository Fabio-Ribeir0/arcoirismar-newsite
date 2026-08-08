"use client";

import { useActionState } from "react";
import { atualizarSobre, type SalvarConteudoState } from "./conteudo-actions";

export function SobreForm({
  defaultValues,
}: {
  defaultValues: {
    sobreTitulo: string;
    sobreDescricao: string;
    fundacaoData: string;
    stat2Valor: number;
    stat2Rotulo: string;
    stat3Valor: number;
    stat3Rotulo: string;
  };
}) {
  const [state, formAction, pending] = useActionState<SalvarConteudoState, FormData>(
    atualizarSobre,
    undefined
  );

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-line bg-white p-8">
      <div className="space-y-1.5">
        <label htmlFor="sobreTitulo" className="text-sm font-medium text-ink">
          Título
        </label>
        <input
          id="sobreTitulo"
          name="sobreTitulo"
          defaultValue={defaultValues.sobreTitulo}
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sobreDescricao" className="text-sm font-medium text-ink">
          Descrição
        </label>
        <textarea
          id="sobreDescricao"
          name="sobreDescricao"
          rows={4}
          defaultValue={defaultValues.sobreDescricao}
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="fundacaoData" className="text-sm font-medium text-ink">
          Mês de fundação
        </label>
        <input
          id="fundacaoData"
          name="fundacaoData"
          type="month"
          defaultValue={defaultValues.fundacaoData}
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary sm:w-48"
        />
        <p className="text-xs text-ink/50">
          O &quot;X anos de mercado&quot; exibido na home é calculado automaticamente a partir
          disso.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="stat2Valor" className="text-sm font-medium text-ink">
            Segundo dado — valor
          </label>
          <input
            id="stat2Valor"
            name="stat2Valor"
            type="number"
            min={0}
            defaultValue={defaultValues.stat2Valor}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="stat2Rotulo" className="text-sm font-medium text-ink">
            Segundo dado — rótulo
          </label>
          <input
            id="stat2Rotulo"
            name="stat2Rotulo"
            defaultValue={defaultValues.stat2Rotulo}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Ex.: empreendimentos entregues"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="stat3Valor" className="text-sm font-medium text-ink">
            Terceiro dado — valor
          </label>
          <input
            id="stat3Valor"
            name="stat3Valor"
            type="number"
            min={0}
            defaultValue={defaultValues.stat3Valor}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="stat3Rotulo" className="text-sm font-medium text-ink">
            Terceiro dado — rótulo
          </label>
          <input
            id="stat3Rotulo"
            name="stat3Rotulo"
            defaultValue={defaultValues.stat3Rotulo}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Ex.: unidades entregues"
          />
        </div>
      </div>

      {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
