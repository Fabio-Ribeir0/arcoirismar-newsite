import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { montarLinhasTabelaUnidades } from "@/lib/tabela-unidades";
import { gerarTabelaPdfCompleta } from "@/lib/pdf/gerar-tabela-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "CORRETOR" && session.user.role !== "ADMIN")) {
    return new Response("Não autorizado", { status: 401 });
  }

  const { id } = await params;

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id },
    include: {
      unidades: { orderBy: [{ andar: "asc" }, { identificador: "asc" }] },
      documentosAdicionais: { orderBy: { ordem: "asc" } },
    },
  });

  if (!empreendimento) {
    return new Response("Empreendimento não encontrado", { status: 404 });
  }

  const linhas = montarLinhasTabelaUnidades(empreendimento, empreendimento.unidades);
  const podeCalcularPlano =
    empreendimento.parcelas !== null &&
    empreendimento.entradaPercentual !== null &&
    empreendimento.entregaChavesPercentual !== null;
  const prestacoesLabel = podeCalcularPlano ? `${empreendimento.parcelas}x` : "Prestações";

  const pdf = await gerarTabelaPdfCompleta(
    {
      cabecalhoHtml: empreendimento.tabelaCabecalhoHtml ?? "",
      descricaoHtml: empreendimento.tabelaDescricaoHtml ?? "",
      rodapeHtml: empreendimento.tabelaRodapeHtml ?? "",
      capaUrl: empreendimento.capaTabelaUrl,
      prestacoesLabel,
      linhas,
    },
    empreendimento.documentosAdicionais.map((d) => ({ titulo: d.titulo, url: d.url }))
  );

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="tabela-${empreendimento.slug}.pdf"`,
    },
  });
}
