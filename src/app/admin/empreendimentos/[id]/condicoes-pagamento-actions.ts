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
    quantidade: formData.get("quantidade"),
    valor: formData.get("valor"),
    tipoValor: formData.get("tipoValor"),
    ordem: formData.get("ordem"),
    motivo: formData.get("motivo") ?? "",
  });
}

const PERIODICIDADES_ATO = ["ATO_ASSINATURA", "ATO_ENTREGA_CHAVES"];

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
        valor: data.valor,
        tipoValor: data.tipoValor,
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
        valor: data.valor,
        tipoValor: data.tipoValor,
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
