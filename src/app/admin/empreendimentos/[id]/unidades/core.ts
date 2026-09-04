import "server-only";
import { prisma } from "@/lib/prisma";
import type { Unidade, UnidadeStatus } from "@/generated/prisma/client";
import { UnidadeSchema } from "./schema";
import { registrarHistoricoUnidade } from "./service";

/**
 * Lógica de negócio de criar/atualizar uma Unidade, sem `requireAdmin()` nem
 * `redirect()`/`revalidatePath()` — usada tanto pela Server Action quanto pela rota da API
 * de agente.
 */

export type UnidadeData = ReturnType<typeof UnidadeSchema.parse>;

export type ResultadoUnidade =
  | { sucesso: true; unidade: Unidade }
  | { sucesso: false; mensagem: string };

export async function criarUnidadeCore(empreendimentoId: string, data: UnidadeData): Promise<ResultadoUnidade> {
  const existente = await prisma.unidade.findUnique({
    where: { empreendimentoId_identificador: { empreendimentoId, identificador: data.identificador } },
  });
  if (existente) {
    return { sucesso: false, mensagem: "Já existe uma unidade com esse identificador neste empreendimento." };
  }

  const unidade = await prisma.unidade.create({
    data: {
      empreendimentoId,
      identificador: data.identificador,
      dormitorios: data.dormitorios,
      suites: data.suites,
      areaPrivativa: data.areaPrivativa,
      vagas: data.vagas,
      areaGaragem: data.areaGaragem,
      areaComum: data.areaComum,
      andar: data.andar ? Number(data.andar) : null,
      preco: data.preco,
      status: data.status,
    },
  });

  return { sucesso: true, unidade };
}

/**
 * Muda só o status, sem exigir o restante dos campos da unidade — usada pela rota "atalho"
 * `/status` da API de agente, pensada pra um agente de IA chamar com o menor número
 * possível de parâmetros.
 */
export async function atualizarStatusUnidadeCore(
  empreendimentoId: string,
  unidadeId: string,
  novoStatus: UnidadeStatus,
  autorId: string,
  motivo: string | null = null
): Promise<ResultadoUnidade> {
  const atual = await prisma.unidade.findUnique({ where: { id: unidadeId } });
  if (!atual || atual.empreendimentoId !== empreendimentoId) {
    return { sucesso: false, mensagem: "Unidade não encontrada." };
  }

  const unidade = await prisma.$transaction(async (tx) => {
    const atualizada = await tx.unidade.update({ where: { id: unidadeId }, data: { status: novoStatus } });

    await registrarHistoricoUnidade(tx, {
      unidadeId,
      precoAnterior: atual.preco,
      statusAnterior: atual.status,
      statusNovo: novoStatus,
      autorId,
      motivo,
    });

    return atualizada;
  });

  return { sucesso: true, unidade };
}

export async function atualizarUnidadeCore(
  empreendimentoId: string,
  unidadeId: string,
  data: UnidadeData,
  autorId: string
): Promise<ResultadoUnidade> {
  const atual = await prisma.unidade.findUnique({ where: { id: unidadeId } });
  if (!atual || atual.empreendimentoId !== empreendimentoId) {
    return { sucesso: false, mensagem: "Unidade não encontrada." };
  }

  const conflito = await prisma.unidade.findFirst({
    where: { empreendimentoId, identificador: data.identificador, NOT: { id: unidadeId } },
  });
  if (conflito) {
    return { sucesso: false, mensagem: "Já existe outra unidade com esse identificador neste empreendimento." };
  }

  const motivo = data.motivo || null;

  const unidade = await prisma.$transaction(async (tx) => {
    const atualizada = await tx.unidade.update({
      where: { id: unidadeId },
      data: {
        identificador: data.identificador,
        dormitorios: data.dormitorios,
        suites: data.suites,
        areaPrivativa: data.areaPrivativa,
        vagas: data.vagas,
        areaGaragem: data.areaGaragem,
        areaComum: data.areaComum,
        andar: data.andar ? Number(data.andar) : null,
        preco: data.preco,
        status: data.status,
      },
    });

    await registrarHistoricoUnidade(tx, {
      unidadeId,
      precoAnterior: atual.preco,
      precoNovo: data.preco,
      statusAnterior: atual.status,
      statusNovo: data.status,
      autorId,
      motivo,
    });

    return atualizada;
  });

  return { sucesso: true, unidade };
}
