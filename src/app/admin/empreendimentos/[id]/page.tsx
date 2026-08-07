import { notFound } from "next/navigation";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { EmpreendimentoForm } from "../empreendimento-form";
import { atualizarEmpreendimento } from "../actions";
import { GerarUnidadesButton } from "./unidades/gerar-unidades-button";
import { UnidadesTable, type UnidadeRow } from "./unidades-table";
import { calcularParcelaPlanoDireto } from "@/lib/plano-pagamento";
import { BannerUpload } from "./banner-upload";
import { VideoUpload } from "./video-upload";
import { CapaTabelaUpload } from "./capa-tabela-upload";
import { MidiaImagensSection } from "./midia-imagens-section";
import { MidiaVideoSection } from "./midia-video-section";
import { HistoryTable } from "@/components/admin/history-table";
import { diferente } from "../service";
import { Tabs } from "@/components/admin/tabs";
import { DeleteButton } from "@/components/delete-button";
import { excluirTodasUnidades } from "./unidades/actions";

export default async function EditarEmpreendimentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id },
    include: {
      unidades: { orderBy: [{ andar: "asc" }, { identificador: "asc" }] },
      historicoPlanoPagamento: { orderBy: { criadoEm: "desc" }, include: { autor: true } },
      midias: { orderBy: { ordem: "asc" } },
    },
  });

  if (!empreendimento) notFound();

  const fotos = empreendimento.midias.filter((m) => m.tipo === "FOTO");
  const plantas = empreendimento.midias.filter((m) => m.tipo === "PLANTA");
  const videos = empreendimento.midias.filter((m) => m.tipo === "VIDEO");

  const podeCalcularParcela =
    empreendimento.parcelas !== null &&
    empreendimento.entradaPercentual !== null &&
    empreendimento.entregaChavesPercentual !== null;

  const unidadeRows: UnidadeRow[] = empreendimento.unidades.map((unidade) => ({
    id: unidade.id,
    identificador: unidade.identificador,
    andar: unidade.andar,
    tipo: unidade.tipo,
    areaPrivativa: unidade.areaPrivativa,
    areaGaragem: unidade.areaGaragem,
    preco: Number(unidade.preco),
    parcela: podeCalcularParcela
      ? calcularParcelaPlanoDireto({
          preco: Number(unidade.preco),
          entradaPercentual: Number(empreendimento.entradaPercentual),
          entregaChavesPercentual: Number(empreendimento.entregaChavesPercentual),
          parcelas: empreendimento.parcelas!,
        })
      : null,
    status: unidade.status,
  }));

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-medium text-primary">
            {empreendimento.nome}
          </h1>
          <p className="mt-1 text-sm text-ink/60">/{empreendimento.slug}</p>
        </div>

        <Tabs
          tabs={[
            {
              id: "detalhes",
              label: "Detalhes",
              content: (
                <EmpreendimentoForm
                  action={atualizarEmpreendimento.bind(null, empreendimento.id)}
                  submitLabel="Salvar alterações"
                  showMotivo
                  defaultValues={{
                    nome: empreendimento.nome,
                    slug: empreendimento.slug,
                    status: empreendimento.status,
                    destaque: empreendimento.destaque,
                    slogan: empreendimento.slogan,
                    descricao: empreendimento.descricao,
                    endereco: empreendimento.endereco,
                    bairro: empreendimento.bairro,
                    cidade: empreendimento.cidade,
                    estado: empreendimento.estado,
                    cep: empreendimento.cep,
                    entregaPrevista: empreendimento.entregaPrevista
                      ? empreendimento.entregaPrevista.toISOString().slice(0, 10)
                      : "",
                    andares: empreendimento.andares?.toString() ?? "",
                    unidadesPorAndar: empreendimento.unidadesPorAndar?.toString() ?? "",
                    valorBase: empreendimento.valorBase?.toString() ?? "",
                    entradaPercentual: empreendimento.entradaPercentual?.toString() ?? "",
                    entregaChavesPercentual:
                      empreendimento.entregaChavesPercentual?.toString() ?? "",
                    parcelas: empreendimento.parcelas?.toString() ?? "",
                    tipoPadrao: empreendimento.tipoPadrao,
                    areaPrivativaPadrao: empreendimento.areaPrivativaPadrao?.toString() ?? "",
                    vagasPadrao: empreendimento.vagasPadrao?.toString() ?? "",
                  }}
                />
              ),
            },
            {
              id: "midia",
              label: "Mídia",
              content: (
                <>
                  <BannerUpload
                    empreendimentoId={empreendimento.id}
                    bannerAtual={empreendimento.bannerUrl}
                  />
                  <VideoUpload
                    empreendimentoId={empreendimento.id}
                    videoAtual={empreendimento.bannerVideoUrl}
                  />
                  <CapaTabelaUpload
                    empreendimentoId={empreendimento.id}
                    capaAtual={empreendimento.capaTabelaUrl}
                  />
                  <MidiaImagensSection
                    empreendimentoId={empreendimento.id}
                    tipo="FOTO"
                    titulo="Imagens"
                    descricao="Fotos gerais do empreendimento — aparecem na seção Galeria da página pública."
                    midias={fotos}
                  />
                  <MidiaImagensSection
                    empreendimentoId={empreendimento.id}
                    tipo="PLANTA"
                    titulo="Plantas"
                    descricao="Plantas humanizadas, com medidas etc. — aparecem na seção Plantas da página pública quando marcadas como 'Público'."
                    midias={plantas}
                  />
                  <MidiaVideoSection empreendimentoId={empreendimento.id} midias={videos} />
                </>
              ),
            },
            {
              id: "unidades",
              label: "Unidades",
              content: (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-medium text-primary">Unidades</h2>
                    <div className="flex items-center gap-3">
                      <GerarUnidadesButton empreendimentoId={empreendimento.id} />
                      <Link
                        href={`/admin/empreendimentos/${empreendimento.id}/unidades/novo`}
                        className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light"
                      >
                        Nova unidade
                      </Link>
                      {empreendimento.unidades.length > 0 && (
                        <DeleteButton
                          action={excluirTodasUnidades.bind(null, empreendimento.id)}
                          label="Excluir todas"
                          confirmMessage={`Excluir todas as ${empreendimento.unidades.length} unidades deste empreendimento? Essa ação não pode ser desfeita.`}
                        />
                      )}
                    </div>
                  </div>

                  <UnidadesTable
                    empreendimentoId={empreendimento.id}
                    unidades={unidadeRows}
                    parcelasLabel={
                      podeCalcularParcela && empreendimento.parcelas
                        ? `${empreendimento.parcelas}x`
                        : null
                    }
                  />
                </div>
              ),
            },
            {
              id: "log",
              label: "Log",
              content: (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-medium text-primary">
                    Histórico do plano de pagamento (somente admin)
                  </h2>
                  <HistoryTable
                    rows={empreendimento.historicoPlanoPagamento.map((h) => ({
                      id: h.id,
                      data: h.criadoEm,
                      autor: h.autor.name ?? h.autor.email,
                      descricao: descricaoPlanoPagamento(h),
                      motivo: h.motivo,
                    }))}
                    emptyMessage="Nenhuma alteração do plano de pagamento registrada."
                  />
                </div>
              ),
            },
          ]}
        />
      </div>
    </main>
  );
}

function formatCurrencyOrNull(value: unknown) {
  return value === null ? "—" : Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPercentOrNull(value: unknown) {
  return value === null ? "—" : `${Number(value).toFixed(2)}%`;
}

function formatIntOrNull(value: unknown) {
  return value === null ? "—" : `${value}x`;
}

/** Só lista, na descrição, os campos que de fato mudaram nessa linha do histórico. */
function descricaoPlanoPagamento(h: {
  valorBaseAnterior: Prisma.Decimal | null;
  valorBaseNovo: Prisma.Decimal | null;
  entradaPercentualAnterior: Prisma.Decimal | null;
  entradaPercentualNovo: Prisma.Decimal | null;
  entregaChavesPercentualAnterior: Prisma.Decimal | null;
  entregaChavesPercentualNovo: Prisma.Decimal | null;
  parcelasAnterior: number | null;
  parcelasNovo: number | null;
}) {
  const partes: string[] = [];

  if (diferente(h.valorBaseAnterior, h.valorBaseNovo)) {
    partes.push(
      `Valor base: ${formatCurrencyOrNull(h.valorBaseAnterior)} → ${formatCurrencyOrNull(h.valorBaseNovo)}`
    );
  }
  if (diferente(h.entradaPercentualAnterior, h.entradaPercentualNovo)) {
    partes.push(
      `Entrada: ${formatPercentOrNull(h.entradaPercentualAnterior)} → ${formatPercentOrNull(h.entradaPercentualNovo)}`
    );
  }
  if (diferente(h.entregaChavesPercentualAnterior, h.entregaChavesPercentualNovo)) {
    partes.push(
      `Entrega das chaves: ${formatPercentOrNull(h.entregaChavesPercentualAnterior)} → ${formatPercentOrNull(h.entregaChavesPercentualNovo)}`
    );
  }
  if (diferente(h.parcelasAnterior, h.parcelasNovo)) {
    partes.push(`Parcelas: ${formatIntOrNull(h.parcelasAnterior)} → ${formatIntOrNull(h.parcelasNovo)}`);
  }

  return partes.join(" · ");
}
