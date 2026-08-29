import { notFound } from "next/navigation";
import Link from "next/link";
import type { Prisma, TipoValorPlano } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { EmpreendimentoForm } from "../empreendimento-form";
import { atualizarEmpreendimento } from "../actions";
import { GerarUnidadesButton } from "./unidades/gerar-unidades-button";
import { UnidadesTable, type UnidadeRow } from "./unidades-table";
import { calcularParcelaPlanoDireto } from "@/lib/plano-pagamento";
import { LogoUpload } from "./logo-upload";
import { BannerUpload } from "./banner-upload";
import { VideoUpload } from "./video-upload";
import { CapaTabelaUpload } from "./capa-tabela-upload";
import { MidiaImagensSection } from "./midia-imagens-section";
import { MidiaVideoSection } from "./midia-video-section";
import { LinkMidiaPublicaForm } from "./link-midia-publica-form";
import { TabelaConteudoForm } from "./tabela-conteudo-form";
import { DocumentosAdicionaisSection } from "./documentos-adicionais-section";
import { GerarTabelaSection } from "./gerar-tabela-section";
import type { HistoryRow } from "@/components/admin/history-table";
import { LogBloco } from "@/components/admin/log-bloco";
import { UNIDADE_STATUS_LABEL } from "@/lib/tabela-unidades";
import { diferente } from "../service";
import { Tabs } from "@/components/admin/tabs";
import { DeleteButton } from "@/components/delete-button";
import { excluirTodasUnidades } from "./unidades/actions";

// A geração da tabela em PDF (Puppeteer) pode passar do timeout padrão da
// plataforma — Server Actions usados nesta página herdam este valor.
export const maxDuration = 60;

export default async function EditarEmpreendimentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id },
    include: {
      unidades: {
        orderBy: [{ andar: "asc" }, { identificador: "asc" }],
        include: {
          historicoPrecos: { include: { autor: true } },
          historicoStatus: { include: { autor: true } },
        },
      },
      historicoPlanoPagamento: { orderBy: { criadoEm: "desc" }, include: { autor: true } },
      midias: { orderBy: { ordem: "asc" } },
      documentosAdicionais: { orderBy: { ordem: "asc" } },
    },
  });

  if (!empreendimento) notFound();

  const fotos = empreendimento.midias.filter((m) => m.tipo === "FOTO");
  const plantas = empreendimento.midias.filter((m) => m.tipo === "PLANTA");
  const videos = empreendimento.midias.filter((m) => m.tipo === "VIDEO");

  const podeCalcularParcela =
    empreendimento.parcelas !== null &&
    empreendimento.entradaValor !== null &&
    empreendimento.entregaChavesValor !== null;

  const unidadeRows: UnidadeRow[] = empreendimento.unidades.map((unidade) => ({
    id: unidade.id,
    identificador: unidade.identificador,
    andar: unidade.andar,
    dormitorios: unidade.dormitorios,
    suites: unidade.suites,
    areaPrivativa: unidade.areaPrivativa,
    areaGaragem: unidade.areaGaragem,
    areaComum: unidade.areaComum,
    preco: Number(unidade.preco),
    parcela: podeCalcularParcela
      ? calcularParcelaPlanoDireto({
          preco: Number(unidade.preco),
          entradaValor: Number(empreendimento.entradaValor),
          entradaTipo: empreendimento.entradaTipo,
          entregaChavesValor: Number(empreendimento.entregaChavesValor),
          entregaChavesTipo: empreendimento.entregaChavesTipo,
          parcelas: empreendimento.parcelas!,
        })
      : null,
    status: unidade.status,
  }));

  const logUnidades: HistoryRow[] = empreendimento.unidades
    .flatMap((unidade) => [
      ...unidade.historicoPrecos.map((h) => ({
        id: h.id,
        data: h.criadoEm,
        autor: h.autor.name ?? h.autor.email,
        descricao: `Unidade ${unidade.identificador}: Preço ${formatCurrencyOrNull(h.precoAnterior)} → ${formatCurrencyOrNull(h.precoNovo)}`,
        motivo: h.motivo,
      })),
      ...unidade.historicoStatus.map((h) => ({
        id: h.id,
        data: h.criadoEm,
        autor: h.autor.name ?? h.autor.email,
        descricao: `Unidade ${unidade.identificador}: Status ${UNIDADE_STATUS_LABEL[h.statusAnterior] ?? h.statusAnterior} → ${UNIDADE_STATUS_LABEL[h.statusNovo] ?? h.statusNovo}`,
        motivo: h.motivo,
      })),
    ])
    .sort((a, b) => b.data.getTime() - a.data.getTime());

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
                    espelhoVenda: empreendimento.espelhoVenda,
                    slogan: empreendimento.slogan,
                    descricao: empreendimento.descricao,
                    endereco: empreendimento.endereco,
                    bairro: empreendimento.bairro,
                    cidade: empreendimento.cidade,
                    estado: empreendimento.estado,
                    cep: empreendimento.cep,
                    latitude: empreendimento.latitude?.toString() ?? "",
                    longitude: empreendimento.longitude?.toString() ?? "",
                    entregaPrevista: empreendimento.entregaPrevista
                      ? empreendimento.entregaPrevista.toISOString().slice(0, 10)
                      : "",
                    andares: empreendimento.andares?.toString() ?? "",
                    unidadesPorAndar: empreendimento.unidadesPorAndar?.toString() ?? "",
                    valorBase: empreendimento.valorBase?.toString() ?? "",
                    entradaValor: empreendimento.entradaValor?.toString() ?? "",
                    entradaTipo: empreendimento.entradaTipo,
                    entregaChavesValor: empreendimento.entregaChavesValor?.toString() ?? "",
                    entregaChavesTipo: empreendimento.entregaChavesTipo,
                    parcelas: empreendimento.parcelas?.toString() ?? "",
                    dormitoriosPadrao: empreendimento.dormitoriosPadrao?.toString() ?? "",
                    suitesPadrao: empreendimento.suitesPadrao?.toString() ?? "",
                    areaPrivativaPadrao: empreendimento.areaPrivativaPadrao?.toString() ?? "",
                    vagasPadrao: empreendimento.vagasPadrao?.toString() ?? "",
                  }}
                />
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
              id: "midia",
              label: "Mídia",
              content: (
                <>
                  <LogoUpload
                    empreendimentoId={empreendimento.id}
                    logoAtual={empreendimento.logoUrl}
                  />
                  <BannerUpload
                    empreendimentoId={empreendimento.id}
                    bannerAtual={empreendimento.bannerUrl}
                  />
                  <VideoUpload
                    empreendimentoId={empreendimento.id}
                    videoAtual={empreendimento.bannerVideoUrl}
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
                  <LinkMidiaPublicaForm
                    empreendimentoId={empreendimento.id}
                    linkAtual={empreendimento.linkMidiaPublica}
                  />
                </>
              ),
            },
            {
              id: "tabela",
              label: "Tabela",
              content: (
                <>
                  <CapaTabelaUpload
                    empreendimentoId={empreendimento.id}
                    capaAtual={empreendimento.capaTabelaUrl}
                  />
                  <TabelaConteudoForm
                    empreendimentoId={empreendimento.id}
                    defaultValues={{
                      cabecalhoHtml: empreendimento.tabelaCabecalhoHtml ?? "",
                      descricaoHtml: empreendimento.tabelaDescricaoHtml ?? "",
                      rodapeHtml: empreendimento.tabelaRodapeHtml ?? "",
                    }}
                  />
                  <DocumentosAdicionaisSection
                    empreendimentoId={empreendimento.id}
                    documentos={empreendimento.documentosAdicionais}
                  />
                  <GerarTabelaSection
                    empreendimentoId={empreendimento.id}
                    urlAtual={empreendimento.tabelaPdfUrl}
                    geradoEmAtual={empreendimento.tabelaPdfGeradoEm?.toISOString() ?? null}
                  />
                </>
              ),
            },
            {
              id: "log",
              label: "Log",
              content: (
                <div className="space-y-8">
                  <LogBloco
                    titulo="Histórico de unidades (somente admin)"
                    rows={logUnidades}
                    emptyMessage="Nenhuma alteração de preço ou status de unidade registrada."
                    nomeArquivoCsv={`historico-unidades-${empreendimento.slug}.csv`}
                  />

                  <LogBloco
                    titulo="Histórico do plano de pagamento (somente admin)"
                    rows={empreendimento.historicoPlanoPagamento.map((h) => ({
                      id: h.id,
                      data: h.criadoEm,
                      autor: h.autor.name ?? h.autor.email,
                      descricao: descricaoPlanoPagamento(h),
                      motivo: h.motivo,
                    }))}
                    emptyMessage="Nenhuma alteração do plano de pagamento registrada."
                    nomeArquivoCsv={`historico-pagamento-${empreendimento.slug}.csv`}
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

/** Formata conforme o tipo salvo junto do valor: "R$ 20.000,00" (fixo) ou "20.00%" (percentual). */
function formatValorPlano(value: unknown, tipo: TipoValorPlano) {
  if (value === null) return "—";
  return tipo === "FIXO"
    ? Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : `${Number(value).toFixed(2)}%`;
}

function formatIntOrNull(value: unknown) {
  return value === null ? "—" : `${value}x`;
}

/** Só lista, na descrição, os campos que de fato mudaram nessa linha do histórico. */
function descricaoPlanoPagamento(h: {
  valorBaseAnterior: Prisma.Decimal | null;
  valorBaseNovo: Prisma.Decimal | null;
  entradaValorAnterior: Prisma.Decimal | null;
  entradaValorNovo: Prisma.Decimal | null;
  entradaTipoAnterior: TipoValorPlano;
  entradaTipoNovo: TipoValorPlano;
  entregaChavesValorAnterior: Prisma.Decimal | null;
  entregaChavesValorNovo: Prisma.Decimal | null;
  entregaChavesTipoAnterior: TipoValorPlano;
  entregaChavesTipoNovo: TipoValorPlano;
  parcelasAnterior: number | null;
  parcelasNovo: number | null;
}) {
  const partes: string[] = [];

  if (diferente(h.valorBaseAnterior, h.valorBaseNovo)) {
    partes.push(
      `Valor base: ${formatCurrencyOrNull(h.valorBaseAnterior)} → ${formatCurrencyOrNull(h.valorBaseNovo)}`
    );
  }
  if (diferente(h.entradaValorAnterior, h.entradaValorNovo) || h.entradaTipoAnterior !== h.entradaTipoNovo) {
    partes.push(
      `Entrada: ${formatValorPlano(h.entradaValorAnterior, h.entradaTipoAnterior)} → ${formatValorPlano(h.entradaValorNovo, h.entradaTipoNovo)}`
    );
  }
  if (
    diferente(h.entregaChavesValorAnterior, h.entregaChavesValorNovo) ||
    h.entregaChavesTipoAnterior !== h.entregaChavesTipoNovo
  ) {
    partes.push(
      `Entrega das chaves: ${formatValorPlano(h.entregaChavesValorAnterior, h.entregaChavesTipoAnterior)} → ${formatValorPlano(h.entregaChavesValorNovo, h.entregaChavesTipoNovo)}`
    );
  }
  if (diferente(h.parcelasAnterior, h.parcelasNovo)) {
    partes.push(`Parcelas: ${formatIntOrNull(h.parcelasAnterior)} → ${formatIntOrNull(h.parcelasNovo)}`);
  }

  return partes.join(" · ");
}
