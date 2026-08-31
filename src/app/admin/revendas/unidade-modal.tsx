"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Tabs } from "@/components/admin/tabs";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { REVENDA_STATUS, REVENDA_STATUS_LABEL } from "./schema";
import {
  criarUnidadeRevenda,
  atualizarUnidadeRevenda,
  salvarConteudoTabelaRevenda,
  type RevendaFormState,
  type ConteudoTabelaState,
} from "./actions";
import { criarUploadImagemRevenda } from "./upload-imagem-revenda";
import { FotoUpload } from "./foto-upload";
import type { SlotFoto } from "./upload-actions";
import type { UnidadeRevendaRow } from "./tipos";

const MapaLocalizacao = dynamic(
  () => import("../empreendimentos/mapa-localizacao").then((mod) => mod.MapaLocalizacao),
  { ssr: false, loading: () => <div className="h-80 w-full animate-pulse rounded-lg bg-mist" /> }
);

// Prefixo dos ids dos campos de endereço lidos pelo botão "Buscar coordenadas".
const PREFIXO_IDS = "rev-";

const BLOCOS_TABELA = [
  { name: "cabecalhoHtml", label: "Cabeçalho", campo: "cabecalhoHtml" },
  { name: "sobreHtml", label: "Sobre", campo: "sobreHtml" },
  { name: "financeiroHtml", label: "Financeiro", campo: "financeiroHtml" },
  { name: "infoAdicionaisHtml", label: "Informações adicionais", campo: "infoAdicionaisHtml" },
  { name: "rodapeHtml", label: "Rodapé", campo: "rodapeHtml" },
] as const;

const FOTOS: { slot: SlotFoto; rotulo: string }[] = [
  { slot: 1, rotulo: "Foto 1 (topo, maior)" },
  { slot: 2, rotulo: "Foto 2 (topo, menor)" },
  { slot: 3, rotulo: "Foto 3" },
  { slot: 4, rotulo: "Foto 4" },
  { slot: 5, rotulo: "Foto 5" },
];

export function UnidadeModal({
  unidade,
  onFechar,
}: {
  /** `null` abre em modo criação. */
  unidade: UnidadeRevendaRow | null;
  onFechar: () => void;
}) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState<RevendaFormState, FormData>(
    (prev, formData) => {
      // O id vem do registro existente ou do resultado do próprio "criar" que
      // já rodou nesta sessão do modal — assim não é preciso guardar em estado.
      const existente = unidade?.id ?? (prev?.success ? prev.id : null);
      return existente
        ? atualizarUnidadeRevenda(existente, prev, formData)
        : criarUnidadeRevenda(prev, formData);
    },
    undefined
  );

  const id = unidade?.id ?? (state?.success ? state.id : null);

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state, router]);

  const errors = state?.success === false ? state.errors : undefined;
  const mensagem = state?.success === false ? state.message : undefined;

  const detalhes = (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo
          id={`${PREFIXO_IDS}nome`}
          name="nome"
          label="Empreendimento / construção"
          defaultValue={unidade?.nome}
          errors={errors?.nome}
          hint='Ex.: "Ed. Personalité" ou "Sobrado"'
        />
        <Campo
          id={`${PREFIXO_IDS}numeroUnidade`}
          name="numeroUnidade"
          label="Nº da unidade (opcional)"
          defaultValue={unidade?.numeroUnidade}
          errors={errors?.numeroUnidade}
          hint="Deixe em branco se for uma casa."
        />
        <Campo
          id={`${PREFIXO_IDS}valor`}
          name="valor"
          label="Valor (R$)"
          defaultValue={unidade?.valor}
          errors={errors?.valor}
          hint="Ex.: 350000.00"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${PREFIXO_IDS}status`} className="text-sm font-medium text-ink">
          Status
        </label>
        <select
          id={`${PREFIXO_IDS}status`}
          name="status"
          defaultValue={unidade?.status ?? "DISPONIVEL"}
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {REVENDA_STATUS.map((valor) => (
            <option key={valor} value={valor}>
              {REVENDA_STATUS_LABEL[valor]}
            </option>
          ))}
        </select>
        <p className="text-xs text-ink/50">
          Só unidades Disponíveis e Reservadas entram na tabela em PDF.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id={`${PREFIXO_IDS}endereco`}
          name="endereco"
          label="Rua"
          defaultValue={unidade?.endereco}
          errors={errors?.endereco}
        />
        <div className="grid grid-cols-2 gap-4">
          <Campo
            id={`${PREFIXO_IDS}numeroEndereco`}
            name="numeroEndereco"
            label="Número"
            defaultValue={unidade?.numeroEndereco}
            errors={errors?.numeroEndereco}
          />
          <Campo
            id={`${PREFIXO_IDS}cep`}
            name="cep"
            label="CEP"
            defaultValue={unidade?.cep}
            errors={errors?.cep}
          />
        </div>
        <Campo
          id={`${PREFIXO_IDS}bairro`}
          name="bairro"
          label="Bairro"
          defaultValue={unidade?.bairro}
          errors={errors?.bairro}
        />
        <div className="grid grid-cols-2 gap-4">
          <Campo
            id={`${PREFIXO_IDS}cidade`}
            name="cidade"
            label="Cidade"
            defaultValue={unidade?.cidade}
            errors={errors?.cidade}
          />
          <Campo
            id={`${PREFIXO_IDS}estado`}
            name="estado"
            label="Estado"
            defaultValue={unidade?.estado}
            errors={errors?.estado}
          />
        </div>
      </div>

      <MapaLocalizacao
        prefixoIds={PREFIXO_IDS}
        latitudeInicial={unidade?.latitude}
        longitudeInicial={unidade?.longitude}
        errosLatitude={errors?.latitude}
        errosLongitude={errors?.longitude}
      />

      {mensagem && <p className="text-sm text-red-600">{mensagem}</p>}
      {state?.success && (
        <p className="text-sm text-green-700">
          Dados salvos.{" "}
          {!unidade && "A aba Tabela já está liberada para o conteúdo do PDF e as fotos."}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
      >
        {pending ? "Salvando..." : id ? "Salvar alterações" : "Criar unidade"}
      </button>
    </form>
  );

  const abas = [{ id: "detalhes", label: "Detalhes", content: detalhes }];

  if (id) {
    abas.push({
      id: "tabela",
      label: "Tabela",
      content: <AbaTabela unidadeId={id} unidade={unidade} />,
    });
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto my-4 w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-medium text-primary">
              {unidade ? unidade.nome : "Nova unidade de revenda"}
            </h2>
            {!id && (
              <p className="mt-1 text-sm text-ink/60">
                Salve os detalhes para liberar a aba Tabela — o conteúdo do PDF e as fotos
                precisam da unidade já criada.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="shrink-0 text-ink/40 transition hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="mt-5">
          <Tabs tabs={abas} />
        </div>

        <div className="mt-6 flex justify-end border-t border-line pt-4">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-mist"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function AbaTabela({
  unidadeId,
  unidade,
}: {
  unidadeId: string;
  unidade: UnidadeRevendaRow | null;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ConteudoTabelaState, FormData>(
    (prev, formData) => salvarConteudoTabelaRevenda(unidadeId, prev, formData),
    undefined
  );

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state, router]);

  const uploadImagem = criarUploadImagemRevenda(unidadeId);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-lg font-medium text-primary">Fotos</h3>
        <p className="text-sm text-ink/60">
          As fotos 1 e 2 ocupam a faixa do topo (o Cabeçalho aparece sobre elas); as fotos 3, 4 e 5
          formam a faixa seguinte. Slots vazios são simplesmente omitidos do PDF.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {FOTOS.map(({ slot, rotulo }) => (
            <FotoUpload
              key={slot}
              unidadeId={unidadeId}
              slot={slot}
              rotulo={rotulo}
              urlAtual={unidade?.fotos[slot - 1] ?? null}
            />
          ))}
        </div>
      </div>

      <form action={formAction} className="space-y-6 border-t border-line pt-6">
        <div>
          <h3 className="font-display text-lg font-medium text-primary">Conteúdo da página</h3>
          <p className="text-sm text-ink/60">
            Cada unidade ocupa uma página A4. Texto que não couber no espaço do bloco é cortado no
            PDF — a geração avisa quais blocos foram cortados.
          </p>
        </div>

        {BLOCOS_TABELA.map((bloco) => (
          <RichTextEditor
            key={bloco.name}
            name={bloco.name}
            label={bloco.label}
            defaultValueHtml={unidade?.[bloco.campo] ?? ""}
            onUploadImagem={uploadImagem}
          />
        ))}

        {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}
        {state?.success && <p className="text-sm text-green-700">Conteúdo salvo.</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar conteúdo"}
        </button>
      </form>
    </div>
  );
}

function Campo({
  id,
  name,
  label,
  defaultValue,
  errors,
  hint,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | null;
  errors?: string[];
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
      />
      {hint && <p className="text-xs text-ink/50">{hint}</p>}
      {errors?.map((erro) => (
        <p key={erro} className="text-sm text-red-600">
          {erro}
        </p>
      ))}
    </div>
  );
}
