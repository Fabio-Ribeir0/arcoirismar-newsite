"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Tabs } from "@/components/admin/tabs";
import { REVENDA_STATUS, REVENDA_STATUS_LABEL, TEMPLATE_REVENDA_OPCOES, TEMPLATE_REVENDA_LABEL } from "./schema";
import { criarUnidadeRevenda, atualizarUnidadeRevenda, type RevendaFormState } from "./actions";
import {
  atualizarFotoRevenda,
  confirmarUploadFotoRevenda,
  excluirFotoRevenda,
  prepararUploadFotoRevenda,
} from "./fotos-actions";
import { enviarArquivoDireto } from "@/lib/upload-direto";
import type { FotoRevendaRow, UnidadeRevendaRow } from "./tipos";

const MapaLocalizacao = dynamic(
  () => import("../empreendimentos/mapa-localizacao").then((mod) => mod.MapaLocalizacao),
  { ssr: false, loading: () => <div className="h-80 w-full animate-pulse rounded-lg bg-mist" /> }
);

// Prefixo dos ids dos campos de endereço lidos pelo botão "Buscar coordenadas".
const PREFIXO_IDS = "rev-";

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
    <form action={formAction} className="space-y-6">
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

      <div className="grid gap-4 sm:grid-cols-2">
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
          <p className="text-xs text-ink/50">Só unidades Disponíveis e Reservadas entram na tabela em PDF.</p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${PREFIXO_IDS}template`} className="text-sm font-medium text-ink">
            Template da página no PDF
          </label>
          <select
            id={`${PREFIXO_IDS}template`}
            name="template"
            defaultValue={unidade?.template ?? "EDITORIAL"}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {TEMPLATE_REVENDA_OPCOES.map((valor) => (
              <option key={valor} value={valor}>
                {TEMPLATE_REVENDA_LABEL[valor]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id={`${PREFIXO_IDS}torre`}
          name="torre"
          label="Torre / bloco (opcional)"
          defaultValue={unidade?.torre}
          errors={errors?.torre}
        />
        <Campo
          id={`${PREFIXO_IDS}tagline`}
          name="tagline"
          label="Frase de efeito (opcional)"
          defaultValue={unidade?.tagline}
          errors={errors?.tagline}
          hint="Nem todo template exibe."
        />
      </div>

      <fieldset className="space-y-4 rounded-lg border border-line p-4">
        <legend className="px-1 text-sm font-medium text-ink">Ficha técnica</legend>
        <div className="grid gap-4 sm:grid-cols-4">
          <Campo
            id={`${PREFIXO_IDS}areaPrivativa`}
            name="areaPrivativa"
            label="Área privativa (m²)"
            defaultValue={unidade?.areaPrivativa}
            errors={errors?.areaPrivativa}
          />
          <Campo
            id={`${PREFIXO_IDS}dormitorios`}
            name="dormitorios"
            label="Dormitórios"
            defaultValue={unidade?.dormitorios?.toString()}
            errors={errors?.dormitorios}
          />
          <Campo
            id={`${PREFIXO_IDS}suites`}
            name="suites"
            label="Suítes"
            defaultValue={unidade?.suites?.toString()}
            errors={errors?.suites}
          />
          <Campo
            id={`${PREFIXO_IDS}vagas`}
            name="vagas"
            label="Vagas de garagem"
            defaultValue={unidade?.vagas?.toString()}
            errors={errors?.vagas}
          />
          <Campo
            id={`${PREFIXO_IDS}andar`}
            name="andar"
            label="Andar"
            defaultValue={unidade?.andar}
            errors={errors?.andar}
          />
          <Campo
            id={`${PREFIXO_IDS}elevadores`}
            name="elevadores"
            label="Elevadores"
            defaultValue={unidade?.elevadores?.toString()}
            errors={errors?.elevadores}
          />
          <Campo
            id={`${PREFIXO_IDS}entregaPrevista`}
            name="entregaPrevista"
            label="Entrega prevista"
            defaultValue={unidade?.entregaPrevista}
            errors={errors?.entregaPrevista}
            hint='Ex.: "2028" ou "Pronto para morar"'
          />
          <Campo
            id={`${PREFIXO_IDS}diferencial`}
            name="diferencial"
            label="Diferencial"
            defaultValue={unidade?.diferencial}
            errors={errors?.diferencial}
            hint='Ex.: "Sacada gourmet"'
          />
        </div>
      </fieldset>

      <TextArea
        id={`${PREFIXO_IDS}descricao`}
        name="descricao"
        label="Descrição (opcional)"
        defaultValue={unidade?.descricao}
        errors={errors?.descricao}
        rows={4}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextArea
          id={`${PREFIXO_IDS}amenidades`}
          name="amenidades"
          label="Área de lazer (opcional)"
          defaultValue={unidade?.amenidades}
          errors={errors?.amenidades}
          hint="Um item por linha."
        />
        <TextArea
          id={`${PREFIXO_IDS}condicoesPagamento`}
          name="condicoesPagamento"
          label="Condições de pagamento (opcional)"
          defaultValue={unidade?.condicoesPagamento}
          errors={errors?.condicoesPagamento}
          hint="Um item por linha."
        />
      </div>

      <fieldset className="space-y-4 rounded-lg border border-line p-4">
        <legend className="px-1 text-sm font-medium text-ink">Localização</legend>
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

        <TextArea
          id={`${PREFIXO_IDS}localizacaoNota`}
          name="localizacaoNota"
          label="Nota sobre a região (opcional)"
          defaultValue={unidade?.localizacaoNota}
          errors={errors?.localizacaoNota}
          rows={2}
        />

        <MapaLocalizacao
          prefixoIds={PREFIXO_IDS}
          latitudeInicial={unidade?.latitude}
          longitudeInicial={unidade?.longitude}
          errosLatitude={errors?.latitude}
          errosLongitude={errors?.longitude}
        />
      </fieldset>

      <TextArea
        id={`${PREFIXO_IDS}informacoes`}
        name="informacoes"
        label="Informações (opcional)"
        defaultValue={unidade?.informacoes}
        errors={errors?.informacoes}
        hint='Substitui, no rodapé escuro da página, o "Interessado nesta unidade?" + contato do corretor + nome da construtora. Uma linha por informação (ex.: nome do corretor, telefone, e-mail).'
        rows={4}
      />

      {mensagem && <p className="text-sm text-red-600">{mensagem}</p>}
      {state?.success && (
        <p className="text-sm text-green-700">
          Dados salvos. {!unidade && "A aba Fotos já está liberada."}
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
    abas.push({ id: "fotos", label: "Fotos", content: <AbaFotos unidadeId={id} fotosIniciais={unidade?.fotos ?? []} /> });
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
                Salve os detalhes para liberar a aba Fotos — o envio de imagens precisa da
                unidade já criada.
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

function AbaFotos({ unidadeId, fotosIniciais }: { unidadeId: string; fotosIniciais: FotoRevendaRow[] }) {
  const [fotos, setFotos] = useState<FotoRevendaRow[]>(
    [...fotosIniciais].sort((a, b) => a.ordem - b.ordem)
  );
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function adicionarFoto(arquivo: File) {
    setErro(null);
    setEnviando(true);
    const envio = await enviarArquivoDireto(arquivo, () =>
      prepararUploadFotoRevenda(unidadeId, arquivo.type, arquivo.size)
    );
    if (!envio.ok) {
      setErro(envio.message);
      setEnviando(false);
      return;
    }
    const confirmacao = await confirmarUploadFotoRevenda(unidadeId, envio.path);
    setEnviando(false);
    if (!confirmacao.success) {
      setErro(confirmacao.message);
      return;
    }
    setFotos((prev) => [...prev, confirmacao.foto]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-medium text-primary">Galeria de fotos</h3>
        <p className="text-sm text-ink/60">
          Cada template usa uma quantidade de fotos diferente, sempre nesta ordem — posições
          sem foto ficam com um preenchimento decorativo no PDF.
        </p>
      </div>

      <div className="space-y-3">
        {fotos.map((foto) => (
          <FotoRow
            key={foto.id}
            foto={foto}
            onAtualizar={(atualizada) =>
              setFotos((prev) => prev.map((f) => (f.id === atualizada.id ? atualizada : f)))
            }
            onExcluir={(fotoId) => setFotos((prev) => prev.filter((f) => f.id !== fotoId))}
          />
        ))}
        {fotos.length === 0 && <p className="text-sm text-ink/50">Nenhuma foto enviada ainda.</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink">Adicionar foto</label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={enviando}
          onChange={(e) => {
            const arquivo = e.target.files?.[0];
            e.target.value = "";
            if (arquivo) void adicionarFoto(arquivo);
          }}
          className="block w-full text-sm text-ink/70 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-light"
        />
        {enviando && <p className="text-xs text-ink/50">Enviando...</p>}
        {erro && <p className="text-sm text-red-600">{erro}</p>}
      </div>
    </div>
  );
}

function FotoRow({
  foto,
  onAtualizar,
  onExcluir,
}: {
  foto: FotoRevendaRow;
  onAtualizar: (foto: FotoRevendaRow) => void;
  onExcluir: (fotoId: string) => void;
}) {
  const [legenda, setLegenda] = useState(foto.legenda ?? "");
  const [ordem, setOrdem] = useState(String(foto.ordem));
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const alterado = legenda !== (foto.legenda ?? "") || ordem !== String(foto.ordem);

  async function salvar() {
    setSalvando(true);
    const formData = new FormData();
    formData.set("legenda", legenda);
    formData.set("ordem", ordem);
    const resultado = await atualizarFotoRevenda(foto.id, undefined, formData);
    setSalvando(false);
    if (resultado?.success) {
      onAtualizar({ ...foto, legenda: legenda.trim() || null, ordem: Number(ordem) || foto.ordem });
    }
  }

  async function excluir() {
    if (!confirm("Excluir esta foto?")) return;
    setExcluindo(true);
    await excluirFotoRevenda(foto.id);
    onExcluir(foto.id);
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-line p-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- miniatura de arquivo já hospedado no Storage */}
      <img src={foto.url} alt="" className="h-16 w-16 flex-none rounded object-cover" />
      <input
        value={legenda}
        onChange={(e) => setLegenda(e.target.value)}
        placeholder="Legenda (opcional)"
        className="flex-1 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <input
        type="number"
        min={0}
        value={ordem}
        onChange={(e) => setOrdem(e.target.value)}
        className="w-16 rounded-md border border-line px-2 py-2 text-sm outline-none focus:border-primary"
      />
      <button
        type="button"
        onClick={salvar}
        disabled={!alterado || salvando}
        className="shrink-0 rounded-md border border-line px-3 py-2 text-sm font-medium text-ink transition hover:bg-mist disabled:opacity-40"
      >
        {salvando ? "Salvando..." : "Salvar"}
      </button>
      <button
        type="button"
        onClick={excluir}
        disabled={excluindo}
        className="shrink-0 text-sm font-medium text-red-600 hover:underline disabled:opacity-40"
      >
        Excluir
      </button>
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

function TextArea({
  id,
  name,
  label,
  defaultValue,
  errors,
  hint,
  rows = 3,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | null;
  errors?: string[];
  hint?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
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
