"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { CondicaoPagamentoSchema } from "../schema";
import { registrarHistoricoPlanoPagamento } from "../service";

export type CondicaoPagamentoFormState =
  | { success: true }
  | { success: false; errors?: Record<string, string[] | undefined>; message?: string }
  | undefined;

function parseForm(formData: FormData) {
  return CondicaoPagamentoSchema.safeParse({
    rotulo: formData.get("rotulo"),
    periodicidade: formData.get("periodicidade"),
    // Campo fica desabilitado (travado em 1) pras periodicidades ATO_* — um input
    // disabled não entra no FormData, então cai aqui como null em vez de "1".
    quantidade: formData.get("quantidade") ?? "1",
    // Campos de valor somem do FormData quando a UI esconde o CampoValorTipo (condição
    // marcada como "Saldo restante" — não disabled, unmounted, mas o efeito é o mesmo).
    valor: formData.get("valor") ?? "",
    tipoValor: formData.get("tipoValor") ?? "PERCENTUAL",
    // Checkbox: ausente no FormData quando desmarcado.
    restante: formData.get("restante") ?? "",
    ordem: formData.get("ordem"),
    motivo: formData.get("motivo") ?? "",
  });
}

const PERIODICIDADES_ATO = ["ATO_ASSINATURA", "ATO_ENTREGA_CHAVES"];

/** No máximo uma condição "saldo restante" por empreendimento — não há regra pra dividir o saldo entre duas séries distintas. */
function outraCondicaoJaERestante(
  condicoes: { id: string; restante: boolean }[],
  idAtual: string | null
): boolean {
  return condicoes.some((c) => c.restante && c.id !== idAtual);
}

export async function criarCondicaoPagamento(
  empreendimentoId: string,
  _prevState: CondicaoPagamentoFormState,
  formData: FormData
): Promise<CondicaoPagamentoFormState> {
  const admin = await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const empreendimento = await prisma.empreendimento.findUnique({ where: { id: empreendimentoId } });
  if (!empreendimento) {
    return { success: false, message: "Empreendimento não encontrado." };
  }

  // Sempre 1x para pagamento único, mesmo que o campo Quantidade venha preenchido.
  const quantidade = PERIODICIDADES_ATO.includes(data.periodicidade) ? 1 : Number(data.quantidade);
  const restante = data.restante === "on";

  const condicoesExistentes = await prisma.condicaoPagamentoEmpreendimento.findMany({
    where: { empreendimentoId },
    select: { id: true, restante: true },
  });
  if (restante && outraCondicaoJaERestante(condicoesExistentes, null)) {
    return {
      success: false,
      message: 'Já existe uma condição marcada como "Saldo restante" — desmarque a outra antes.',
    };
  }

  await prisma.$transaction(async (tx) => {
    const anteriores = await tx.condicaoPagamentoEmpreendimento.findMany({
      where: { empreendimentoId },
      orderBy: { ordem: "asc" },
    });

    await tx.condicaoPagamentoEmpreendimento.create({
      data: {
        empreendimentoId,
        rotulo: data.rotulo || null,
        periodicidade: data.periodicidade,
        quantidade,
        valor: restante ? null : data.valor,
        tipoValor: data.tipoValor,
        restante,
        ordem: data.ordem ? Number(data.ordem) : anteriores.length,
      },
    });

    const novas = await tx.condicaoPagamentoEmpreendimento.findMany({
      where: { empreendimentoId },
      orderBy: { ordem: "asc" },
    });

    await registrarHistoricoPlanoPagamento(tx, {
      empreendimentoId,
      valorBaseAnterior: empreendimento.valorBase,
      valorBaseNovo: empreendimento.valorBase,
      condicoesAnteriores: anteriores,
      condicoesNovas: novas,
      autorId: admin.id,
      motivo: data.motivo || null,
    });
  });

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  return { success: true };
}

export async function atualizarCondicaoPagamento(
  empreendimentoId: string,
  condicaoId: string,
  _prevState: CondicaoPagamentoFormState,
  formData: FormData
): Promise<CondicaoPagamentoFormState> {
  const admin = await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const empreendimento = await prisma.empreendimento.findUnique({ where: { id: empreendimentoId } });
  if (!empreendimento) {
    return { success: false, message: "Empreendimento não encontrado." };
  }

  const quantidade = PERIODICIDADES_ATO.includes(data.periodicidade) ? 1 : Number(data.quantidade);
  const restante = data.restante === "on";

  const condicoesExistentes = await prisma.condicaoPagamentoEmpreendimento.findMany({
    where: { empreendimentoId },
    select: { id: true, restante: true },
  });
  if (restante && outraCondicaoJaERestante(condicoesExistentes, condicaoId)) {
    return {
      success: false,
      message: 'Já existe uma condição marcada como "Saldo restante" — desmarque a outra antes.',
    };
  }

  await prisma.$transaction(async (tx) => {
    const anteriores = await tx.condicaoPagamentoEmpreendimento.findMany({
      where: { empreendimentoId },
      orderBy: { ordem: "asc" },
    });

    await tx.condicaoPagamentoEmpreendimento.update({
      where: { id: condicaoId },
      data: {
        rotulo: data.rotulo || null,
        periodicidade: data.periodicidade,
        quantidade,
        valor: restante ? null : data.valor,
        tipoValor: data.tipoValor,
        restante,
        ordem: data.ordem ? Number(data.ordem) : undefined,
      },
    });

    const novas = await tx.condicaoPagamentoEmpreendimento.findMany({
      where: { empreendimentoId },
      orderBy: { ordem: "asc" },
    });

    await registrarHistoricoPlanoPagamento(tx, {
      empreendimentoId,
      valorBaseAnterior: empreendimento.valorBase,
      valorBaseNovo: empreendimento.valorBase,
      condicoesAnteriores: anteriores,
      condicoesNovas: novas,
      autorId: admin.id,
      motivo: data.motivo || null,
    });
  });

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  return { success: true };
}

export async function excluirCondicaoPagamento(empreendimentoId: string, condicaoId: string): Promise<void> {
  const admin = await requireAdmin();

  const empreendimento = await prisma.empreendimento.findUnique({ where: { id: empreendimentoId } });
  if (!empreendimento) return;

  await prisma.$transaction(async (tx) => {
    const anteriores = await tx.condicaoPagamentoEmpreendimento.findMany({
      where: { empreendimentoId },
      orderBy: { ordem: "asc" },
    });

    await tx.condicaoPagamentoEmpreendimento.delete({ where: { id: condicaoId } });

    const novas = await tx.condicaoPagamentoEmpreendimento.findMany({
      where: { empreendimentoId },
      orderBy: { ordem: "asc" },
    });

    await registrarHistoricoPlanoPagamento(tx, {
      empreendimentoId,
      valorBaseAnterior: empreendimento.valorBase,
      valorBaseNovo: empreendimento.valorBase,
      condicoesAnteriores: anteriores,
      condicoesNovas: novas,
      autorId: admin.id,
      motivo: null,
    });
  });

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
}
