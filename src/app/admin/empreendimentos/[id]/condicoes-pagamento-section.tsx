"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/delete-button";
import { CampoValorTipo } from "@/components/admin/campo-valor-tipo";
import { PERIODICIDADE_LABEL, PERIODICIDADES_ATO } from "@/lib/plano-pagamento";
import { PERIODICIDADE_OPCOES } from "../schema";
import {
  criarCondicaoPagamento,
  atualizarCondicaoPagamento,
  excluirCondicaoPagamento,
  type CondicaoPagamentoFormState,
} from "./condicoes-pagamento-actions";

export type CondicaoPagamentoRow = {
  id: string;
  rotulo: string | null;
  periodicidade: (typeof PERIODICIDADE_OPCOES)[number];
  quantidade: number;
  valor: string;
  tipoValor: "PERCENTUAL" | "FIXO";
  ordem: number;
};

const formatCurrency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function resumoSoma(condicoes: CondicaoPagamentoRow[]) {
  let somaPercentual = 0;
  let somaFixa = 0;
  for (const c of condicoes) {
    const total = Number(c.valor) * c.quantidade;
    if (c.tipoValor === "PERCENTUAL") somaPercentual += total;
    else somaFixa += total;
  }
  return { somaPercentual, somaFixa };
}

export function CondicoesPagamentoSection({
  empreendimentoId,
  condicoes,
}: {
  empreendimentoId: string;
  condicoes: CondicaoPagamentoRow[];
}) {
  const { somaPercentual, somaFixa } = resumoSoma(condicoes);
  const somaDestoante = condicoes.length > 0 && Math.abs(somaPercentual - 100) > 0.5;

  return (
    <div className="space-y-4 rounded-xl border border-line bg-white p-8">
      <div>
        <h3 className="font-display text-lg font-medium text-primary">Condições de pagamento</h3>
        <p className="text-sm text-ink/60">
          Cada linha é uma tranche do plano direto (entrada, entrega das chaves, parcelas mensais,
          semestrais etc.) — o valor de cada uma é o que o cliente paga por parcela, em % do preço
          da unidade ou R$ fixo.
        </p>
      </div>

      {condicoes.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead className="bg-[#f9fafc] text-xs font-medium text-ink/50">
              <tr>
                <th className="px-4 py-2 text-left">Rótulo</th>
                <th className="px-4 py-2 text-left">Quando</th>
                <th className="px-4 py-2 text-left">Qtd</th>
                <th className="px-4 py-2 text-left">Valor</th>
                <th className="px-4 py-2 text-left">Ordem</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {condicoes.map((condicao) => (
                <CondicaoItemRow key={condicao.id} empreendimentoId={empreendimentoId} condicao={condicao} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {condicoes.length > 0 && (
        <p className={`text-sm ${somaDestoante ? "text-accent" : "text-ink/50"}`}>
          Soma dos percentuais: {somaPercentual.toFixed(2)}%
          {somaFixa > 0 && ` · valores fixos: ${formatCurrency(somaFixa)}`}
          {somaDestoante && " — parece incompleta ou passar do preço, confira."}
        </p>
      )}

      <div className="border-t border-line pt-4">
        <h4 className="mb-3 text-sm font-medium text-ink">Adicionar condição</h4>
        <CondicaoForm
          formAction={criarCondicaoPagamento.bind(null, empreendimentoId)}
          submitLabel="Adicionar"
        />
      </div>
    </div>
  );
}

function CondicaoItemRow({
  empreendimentoId,
  condicao,
}: {
  empreendimentoId: string;
  condicao: CondicaoPagamentoRow;
}) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <tr>
        <td colSpan={6} className="px-4 py-4">
          <CondicaoForm
            formAction={atualizarCondicaoPagamento.bind(null, empreendimentoId, condicao.id)}
            defaultValues={condicao}
            submitLabel="Salvar"
            onSucesso={() => setEditando(false)}
            onCancelar={() => setEditando(false)}
          />
        </td>
      </tr>
    );
  }

  const ehAto = PERIODICIDADES_ATO.includes(condicao.periodicidade);

  return (
    <tr>
      <td className="px-4 py-2">{condicao.rotulo || PERIODICIDADE_LABEL[condicao.periodicidade]}</td>
      <td className="px-4 py-2 text-ink/70">{PERIODICIDADE_LABEL[condicao.periodicidade]}</td>
      <td className="px-4 py-2 text-ink/70">{ehAto ? "—" : condicao.quantidade}</td>
      <td className="px-4 py-2 text-ink/70">
        {condicao.tipoValor === "PERCENTUAL" ? `${Number(condicao.valor).toFixed(2)}%` : formatCurrency(Number(condicao.valor))}
      </td>
      <td className="px-4 py-2 text-ink/70">{condicao.ordem}</td>
      <td className="px-4 py-2 text-right">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="text-sm font-medium text-primary hover:underline"
          >
            Editar
          </button>
          <DeleteButton
            action={excluirCondicaoPagamento.bind(null, empreendimentoId, condicao.id)}
            confirmMessage={`Excluir a condição "${condicao.rotulo || PERIODICIDADE_LABEL[condicao.periodicidade]}"?`}
          />
        </div>
      </td>
    </tr>
  );
}

function CondicaoForm({
  formAction,
  defaultValues,
  submitLabel,
  onSucesso,
  onCancelar,
}: {
  formAction: (prevState: CondicaoPagamentoFormState, formData: FormData) => Promise<CondicaoPagamentoFormState>;
  defaultValues?: CondicaoPagamentoRow;
  submitLabel: string;
  onSucesso?: () => void;
  onCancelar?: () => void;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<CondicaoPagamentoFormState, FormData>(formAction, undefined);
  const [periodicidade, setPeriodicidade] = useState(defaultValues?.periodicidade ?? "ATO_ASSINATURA");
  const ehAto = PERIODICIDADES_ATO.includes(periodicidade);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
      onSucesso?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reage a mudanças de `state`
  }, [state]);

  const errors = state?.success === false ? state.errors : undefined;

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1.5 lg:col-span-2">
          <label className="text-xs font-medium text-ink/60">Rótulo (opcional)</label>
          <input
            name="rotulo"
            type="text"
            defaultValue={defaultValues?.rotulo ?? ""}
            placeholder={PERIODICIDADE_LABEL[periodicidade]}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink/60">Quando</label>
          <select
            name="periodicidade"
            value={periodicidade}
            onChange={(e) => setPeriodicidade(e.target.value as typeof periodicidade)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {PERIODICIDADE_OPCOES.map((opcao) => (
              <option key={opcao} value={opcao}>
                {PERIODICIDADE_LABEL[opcao]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink/60">Quantidade</label>
          <input
            name="quantidade"
            type="number"
            min={1}
            disabled={ehAto}
            defaultValue={ehAto ? 1 : (defaultValues?.quantidade ?? "")}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-mist disabled:text-ink/40"
          />
          {errors?.quantidade?.map((e) => (
            <p key={e} className="text-xs text-red-600">
              {e}
            </p>
          ))}
        </div>
        <CampoValorTipo
          label="Valor"
          nomeValor="valor"
          nomeTipo="tipoValor"
          defaultValue={defaultValues?.valor}
          defaultTipo={defaultValues?.tipoValor}
          errosValor={errors?.valor}
          hintPercentual="% do preço da unidade, por parcela."
          hintFixo="Valor fixo em R$, por parcela."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink/60">Ordem (opcional)</label>
          <input
            name="ordem"
            type="number"
            min={0}
            defaultValue={defaultValues?.ordem ?? ""}
            placeholder="Posição da coluna na tabela"
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink/60">Motivo da alteração (opcional)</label>
          <input
            name="motivo"
            type="text"
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {state?.success === false && state.message && <p className="text-sm text-red-600">{state.message}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
        >
          {pending ? "Salvando..." : submitLabel}
        </button>
        {onCancelar && (
          <button type="button" onClick={onCancelar} className="text-sm font-medium text-ink/60 hover:underline">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
