import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EmpreendimentoForm } from "../empreendimento-form";
import { atualizarEmpreendimento } from "../actions";
import { GerarUnidadesButton } from "./unidades/gerar-unidades-button";
import { UnidadesTable, type UnidadeRow } from "./unidades-table";
import { calcularParcelaPlanoDireto } from "@/lib/plano-pagamento";
import { BannerUpload } from "./banner-upload";

export default async function EditarEmpreendimentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id },
    include: { unidades: { orderBy: [{ andar: "asc" }, { identificador: "asc" }] } },
  });

  if (!empreendimento) notFound();

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
    isDecorado: unidade.isDecorado,
  }));

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-10">
        <div>
          <h1 className="font-display text-3xl font-medium text-primary">
            {empreendimento.nome}
          </h1>
          <p className="mt-1 text-sm text-ink/60">/{empreendimento.slug}</p>
        </div>

        <BannerUpload empreendimentoId={empreendimento.id} bannerAtual={empreendimento.bannerUrl} />

        <EmpreendimentoForm
          action={atualizarEmpreendimento.bind(null, empreendimento.id)}
          submitLabel="Salvar alterações"
          defaultValues={{
            nome: empreendimento.nome,
            slug: empreendimento.slug,
            status: empreendimento.status,
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
            entregaChavesPercentual: empreendimento.entregaChavesPercentual?.toString() ?? "",
            parcelas: empreendimento.parcelas?.toString() ?? "",
            tipoPadrao: empreendimento.tipoPadrao,
            areaPrivativaPadrao: empreendimento.areaPrivativaPadrao?.toString() ?? "",
            vagasPadrao: empreendimento.vagasPadrao?.toString() ?? "",
          }}
        />

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
            </div>
          </div>

          <UnidadesTable
            empreendimentoId={empreendimento.id}
            unidades={unidadeRows}
            parcelasLabel={
              podeCalcularParcela && empreendimento.parcelas ? `${empreendimento.parcelas}x` : null
            }
          />
        </div>
      </div>
    </main>
  );
}
