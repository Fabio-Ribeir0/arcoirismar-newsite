import "server-only";
import { prisma } from "@/lib/prisma";
import type { UnidadeRevenda } from "@/generated/prisma/client";
import { RevendaSchema } from "./schema";

/**
 * Lógica de negócio de criar/atualizar uma UnidadeRevenda, sem `requireAdmin()` nem
 * `redirect()`/`revalidatePath()` — usada tanto pela Server Action quanto pela rota da API
 * de agente. Diferente das outras entidades, `UnidadeRevenda` não tinha histórico de status
 * até este módulo existir — `atualizarUnidadeRevendaCore` grava um `HistoricoStatusRevenda`
 * sempre que o status muda, seja a mudança feita por um admin na UI ou por um token de API.
 */

export type RevendaData = ReturnType<typeof RevendaSchema.parse>;

export type ResultadoRevenda =
  | { sucesso: true; unidade: UnidadeRevenda }
  | { sucesso: false; mensagem: string };

function montarDadosRevenda(data: RevendaData) {
  return {
    nome: data.nome,
    numeroUnidade: data.numeroUnidade || null,
    valor: data.valor,
    status: data.status,
    template: data.template,
    endereco: data.endereco || null,
    numeroEndereco: data.numeroEndereco || null,
    cep: data.cep || null,
    bairro: data.bairro || null,
    cidade: data.cidade || null,
    estado: data.estado || null,
    latitude: data.latitude ? Number(data.latitude) : null,
    longitude: data.longitude ? Number(data.longitude) : null,
    torre: data.torre || null,
    tagline: data.tagline || null,
    areaPrivativa: data.areaPrivativa || null,
    dormitorios: data.dormitorios ? Number(data.dormitorios) : null,
    suites: data.suites ? Number(data.suites) : null,
    vagas: data.vagas ? Number(data.vagas) : null,
    andar: data.andar || null,
    elevadores: data.elevadores ? Number(data.elevadores) : null,
    entregaPrevista: data.entregaPrevista || null,
    diferencial: data.diferencial || null,
    descricao: data.descricao || null,
    amenidades: data.amenidades || null,
    condicoesPagamento: data.condicoesPagamento || null,
    localizacaoNota: data.localizacaoNota || null,
    informacoes: data.informacoes || null,
  };
}

export async function criarUnidadeRevendaCore(data: RevendaData): Promise<ResultadoRevenda> {
  // Nova unidade entra no fim da ordem de páginas do PDF.
  const ultima = await prisma.unidadeRevenda.findFirst({ orderBy: { ordem: "desc" } });

  const unidade = await prisma.unidadeRevenda.create({
    data: { ...montarDadosRevenda(data), ordem: (ultima?.ordem ?? -1) + 1 },
  });

  return { sucesso: true, unidade };
}

export async function atualizarUnidadeRevendaCore(
  id: string,
  data: RevendaData,
  autorId: string,
  motivo: string | null = null
): Promise<ResultadoRevenda> {
  const atual = await prisma.unidadeRevenda.findUnique({ where: { id } });
  if (!atual) {
    return { sucesso: false, mensagem: "Unidade não encontrada." };
  }

  const novaData = montarDadosRevenda(data);

  const unidade = await prisma.$transaction(async (tx) => {
    const atualizada = await tx.unidadeRevenda.update({ where: { id }, data: novaData });

    if (novaData.status !== atual.status) {
      await tx.historicoStatusRevenda.create({
        data: {
          unidadeId: id,
          statusAnterior: atual.status,
          statusNovo: novaData.status,
          autorId,
          motivo,
        },
      });
    }

    return atualizada;
  });

  return { sucesso: true, unidade };
}
