import { notFound } from "next/navigation";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { EmpreendimentoForm } from "../empreendimento-form";
import { atualizarEmpreendimento } from "../actions";
import { GerarUnidadesButton } from "./unidades/gerar-unidades-button";
import { UnidadesTable, type UnidadeRow } from "./unidades-table";
import {
  calcularCondicoesPagamentoUnidade,
  PERIODICIDADE_ABREVIACAO,
  PERIODICIDADE_LABEL,
  PERIODICIDADES_ATO,
} from "@/lib/plano-pagamento";
import { CondicoesPagamentoSection, type CondicaoPagamentoRow } from "./condicoes-pagamento-section";
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
      condicoesPagamento: { orderBy: { ordem: "asc" } },
      midias: { orderBy: { ordem: "asc" } },
      documentosAdicionais: { orderBy: { ordem: "asc" } },
    },
  });

  if (!empreendimento) notFound();

  const fotos = empreendimento.midias.filter((m) => m.tipo === "FOTO");
  const plantas = empreendimento.midias.filter((m) => m.tipo === "PLANTA");
  const videos = empreendimento.midias.filter((m) => m.tipo === "VIDEO");

  const condicoesPagamento = empreendimento.condicoesPagamento.map((c) => ({
    id: c.id,
    rotulo: c.rotulo,
    periodicidade: c.periodicidade,
    quantidade: c.quantidade,
    valor: Number(c.valor),
    tipoValor: c.tipoValor,
  }));
  const condicaoRows: CondicaoPagamentoRow[] = empreendimento.condicoesPagamento.map((c) => ({
    id: c.id,
    rotulo: c.rotulo,
    periodicidade: c.periodicidade,
    quantidade: c.quantidade,
    valor: c.valor.toString(),
    tipoValor: c.tipoValor,
    ordem: c.ordem,
  }));

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function resumoCondicoesRecorrentes(preco: number): string | null {
    const partes = calcularCondicoesPagamentoUnidade(preco, condicoesPagamento)
      .filter((c) => !PERIODICIDADES_ATO.includes(c.periodicidade))
      .map((c) => `${formatCurrency(c.valorParcela)}/${PERIODICIDADE_ABREVIACAO[c.periodicidade]}`);
    return partes.length > 0 ? partes.join(" · ") : null;
  }

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
    condicoesResumo: resumoCondicoesRecorrentes(Number(unidade.preco)),
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
                <div className="space-y-8">
                  <EmpreendimentoForm
                    action={atualizarEmpreendimento.bind(null, empreendimento.id)}
                    submitLabel="Salvar alterações"
                    showMotivo
                    empreendimentoId={empreendimento.id}
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
                      dormitoriosPadrao: empreendimento.dormitoriosPadrao?.toString() ?? "",
                      suitesPadrao: empreendimento.suitesPadrao?.toString() ?? "",
                      areaPrivativaPadrao: empreendimento.areaPrivativaPadrao?.toString() ?? "",
                      vagasPadrao: empreendimento.vagasPadrao?.toString() ?? "",
                    }}
                  />
                  <CondicoesPagamentoSection empreendimentoId={empreendimento.id} condicoes={condicaoRows} />
                </div>
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
                    mostrarColunaCondicoes={condicoesPagamento.length > 0}
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

type CondicaoSnapshot = {
  id: string;
  rotulo: string | null;
  periodicidade: keyof typeof PERIODICIDADE_LABEL;
  quantidade: number;
  valor: string;
  tipoValor: "PERCENTUAL" | "FIXO";
};

function formatCondicaoValor(c: Pick<CondicaoSnapshot, "quantidade" | "valor" | "tipoValor">) {
  const valor =
    c.tipoValor === "FIXO"
      ? Number(c.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : `${Number(c.valor).toFixed(2)}%`;
  return `${c.quantidade}x ${valor}`;
}

/** Compara duas listas-snapshot de condições casando por id: o que sumiu, o que apareceu, o que mudou. */
function descricaoCondicoes(anteriores: unknown, novas: unknown): string[] {
  const lista = (v: unknown): CondicaoSnapshot[] => (Array.isArray(v) ? (v as CondicaoSnapshot[]) : []);
  const de = lista(anteriores);
  const para = lista(novas);
  const mapaDe = new Map(de.map((c) => [c.id, c]));
  const mapaPara = new Map(para.map((c) => [c.id, c]));
  const partes: string[] = [];

  for (const c of de) {
    if (!mapaPara.has(c.id)) {
      partes.push(`− ${c.rotulo ?? PERIODICIDADE_LABEL[c.periodicidade]}`);
    }
  }
  for (const c of para) {
    const anterior = mapaDe.get(c.id);
    const rotulo = c.rotulo ?? PERIODICIDADE_LABEL[c.periodicidade];
    if (!anterior) {
      partes.push(`+ ${rotulo}: ${formatCondicaoValor(c)}`);
    } else if (
      anterior.rotulo !== c.rotulo ||
      anterior.periodicidade !== c.periodicidade ||
      anterior.quantidade !== c.quantidade ||
      Number(anterior.valor) !== Number(c.valor) ||
      anterior.tipoValor !== c.tipoValor
    ) {
      partes.push(`${rotulo}: ${formatCondicaoValor(anterior)} → ${formatCondicaoValor(c)}`);
    }
  }

  return partes;
}

/** Só lista, na descrição, o que de fato mudou nessa linha do histórico. */
function descricaoPlanoPagamento(h: {
  valorBaseAnterior: Prisma.Decimal | null;
  valorBaseNovo: Prisma.Decimal | null;
  condicoesAnteriores: unknown;
  condicoesNovas: unknown;
}) {
  const partes: string[] = [];

  if (diferente(h.valorBaseAnterior, h.valorBaseNovo)) {
    partes.push(
      `Valor base: ${formatCurrencyOrNull(h.valorBaseAnterior)} → ${formatCurrencyOrNull(h.valorBaseNovo)}`
    );
  }
  partes.push(...descricaoCondicoes(h.condicoesAnteriores, h.condicoesNovas));

  return partes.join(" · ");
}
