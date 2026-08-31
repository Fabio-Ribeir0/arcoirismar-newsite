import { prisma } from "@/lib/prisma";
import { RevendasClient } from "./revendas-client";
import type { ConfiguracaoRevendaRow, UnidadeRevendaRow } from "./tipos";

// A geração do PDF (Puppeteer) passa do timeout padrão da plataforma — Server
// Actions usados nesta página herdam este valor.
export const maxDuration = 60;

export default async function RevendasPage() {
  const [unidades, config] = await Promise.all([
    prisma.unidadeRevenda.findMany({ orderBy: [{ ordem: "asc" }, { createdAt: "asc" }] }),
    prisma.configuracaoRevenda.findUnique({ where: { id: "configuracao-revenda" } }),
  ]);

  const rows: UnidadeRevendaRow[] = unidades.map((u) => ({
    id: u.id,
    nome: u.nome,
    numeroUnidade: u.numeroUnidade,
    valor: u.valor.toString(),
    status: u.status,
    endereco: u.endereco,
    numeroEndereco: u.numeroEndereco,
    cep: u.cep,
    bairro: u.bairro,
    cidade: u.cidade,
    estado: u.estado,
    latitude: u.latitude?.toString() ?? null,
    longitude: u.longitude?.toString() ?? null,
    cabecalhoHtml: u.cabecalhoHtml ?? "",
    sobreHtml: u.sobreHtml ?? "",
    financeiroHtml: u.financeiroHtml ?? "",
    infoAdicionaisHtml: u.infoAdicionaisHtml ?? "",
    rodapeHtml: u.rodapeHtml ?? "",
    fotos: [u.foto1Url, u.foto2Url, u.foto3Url, u.foto4Url, u.foto5Url],
  }));

  const configRow: ConfiguracaoRevendaRow = {
    capaTabelaUrl: config?.capaTabelaUrl ?? null,
    linkMidiaPublica: config?.linkMidiaPublica ?? null,
    tabelaPdfUrl: config?.tabelaPdfUrl ?? null,
    tabelaPdfGeradoEm: config?.tabelaPdfGeradoEm?.toISOString() ?? null,
  };

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <RevendasClient unidades={rows} config={configRow} />
      </div>
    </main>
  );
}
