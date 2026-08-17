"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { UNIDADE_STATUS } from "../schema";
import { registrarHistoricoUnidadesEmLote } from "../service";

export type LoteFormState =
  | { success: true }
  | { success: false; message: string }
  | undefined;

export async function atualizarUnidadesEmLote(
  empreendimentoId: string,
  unidadeIds: string[],
  _prevState: LoteFormState,
  formData: FormData
): Promise<LoteFormState> {
  const admin = await requireAdmin();

  const aplicarPreco = formData.get("aplicarPreco") === "on";
  const aplicarStatus = formData.get("aplicarStatus") === "on";
  const aplicarDormitorios = formData.get("aplicarDormitorios") === "on";
  const aplicarSuites = formData.get("aplicarSuites") === "on";
  const aplicarVagas = formData.get("aplicarVagas") === "on";
  const aplicarArea = formData.get("aplicarArea") === "on";
  const aplicarAreaGaragem = formData.get("aplicarAreaGaragem") === "on";
  const aplicarAreaComum = formData.get("aplicarAreaComum") === "on";

  if (
    !aplicarPreco &&
    !aplicarStatus &&
    !aplicarDormitorios &&
    !aplicarSuites &&
    !aplicarVagas &&
    !aplicarArea &&
    !aplicarAreaGaragem &&
    !aplicarAreaComum
  ) {
    return { success: false, message: "Marque ao menos um campo para aplicar às unidades selecionadas." };
  }

  let novoPreco: string | undefined;
  if (aplicarPreco) {
    const raw = String(formData.get("preco") ?? "");
    if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
      return { success: false, message: "Preço inválido (ex.: 350000.00)." };
    }
    novoPreco = raw;
  }

  let novoStatus: (typeof UNIDADE_STATUS)[number] | undefined;
  if (aplicarStatus) {
    const raw = formData.get("status");
    if (typeof raw !== "string" || !UNIDADE_STATUS.includes(raw as (typeof UNIDADE_STATUS)[number])) {
      return { success: false, message: "Status inválido." };
    }
    novoStatus = raw as (typeof UNIDADE_STATUS)[number];
  }

  let novosDormitorios: number | undefined;
  if (aplicarDormitorios) {
    novosDormitorios = Number(formData.get("dormitorios"));
    if (!Number.isInteger(novosDormitorios) || novosDormitorios < 0) {
      return { success: false, message: "Número de dormitórios inválido." };
    }
  }

  let novasSuites: number | undefined;
  if (aplicarSuites) {
    novasSuites = Number(formData.get("suites"));
    if (!Number.isInteger(novasSuites) || novasSuites < 0) {
      return { success: false, message: "Número de suítes inválido." };
    }
  }

  if (
    aplicarDormitorios &&
    aplicarSuites &&
    novasSuites !== undefined &&
    novosDormitorios !== undefined &&
    novasSuites > novosDormitorios
  ) {
    return {
      success: false,
      message: "O número de suítes não pode ser maior que o de dormitórios.",
    };
  }

  let novasVagas: number | undefined;
  if (aplicarVagas) {
    novasVagas = Number(formData.get("vagas"));
    if (!Number.isInteger(novasVagas) || novasVagas < 0) {
      return { success: false, message: "Número de vagas inválido." };
    }
  }

  let novaArea: number | undefined;
  if (aplicarArea) {
    novaArea = Number(formData.get("areaPrivativa"));
    if (!Number.isFinite(novaArea) || novaArea <= 0) {
      return { success: false, message: "Área privativa inválida." };
    }
  }

  let novaAreaGaragem: number | undefined;
  if (aplicarAreaGaragem) {
    novaAreaGaragem = Number(formData.get("areaGaragem"));
    if (!Number.isFinite(novaAreaGaragem) || novaAreaGaragem < 0) {
      return { success: false, message: "Área da garagem inválida." };
    }
  }

  let novaAreaComum: number | undefined;
  if (aplicarAreaComum) {
    novaAreaComum = Number(formData.get("areaComum"));
    if (!Number.isFinite(novaAreaComum) || novaAreaComum < 0) {
      return { success: false, message: "Área comum inválida." };
    }
  }

  const motivo = (String(formData.get("motivo") ?? "").trim() || null) as string | null;

  const unidades = await prisma.unidade.findMany({
    where: { id: { in: unidadeIds }, empreendimentoId },
    select: { id: true, preco: true, status: true },
  });

  const data: Record<string, unknown> = {};
  if (aplicarPreco && novoPreco !== undefined) data.preco = novoPreco;
  if (aplicarStatus && novoStatus) data.status = novoStatus;
  if (aplicarDormitorios && novosDormitorios !== undefined) data.dormitorios = novosDormitorios;
  if (aplicarSuites && novasSuites !== undefined) data.suites = novasSuites;
  if (aplicarVagas && novasVagas !== undefined) data.vagas = novasVagas;
  if (aplicarArea && novaArea !== undefined) data.areaPrivativa = novaArea;
  if (aplicarAreaGaragem && novaAreaGaragem !== undefined) data.areaGaragem = novaAreaGaragem;
  if (aplicarAreaComum && novaAreaComum !== undefined) data.areaComum = novaAreaComum;

  // Uma updateMany + até 2 createMany, em vez de um update + create por
  // unidade — com dezenas/centenas de unidades selecionadas, o loop antigo
  // estourava o timeout padrão (5s) da transação interativa do Prisma.
  await prisma.$transaction(async (tx) => {
    await tx.unidade.updateMany({ where: { id: { in: unidadeIds }, empreendimentoId }, data });

    await registrarHistoricoUnidadesEmLote(tx, {
      unidades,
      precoNovo: aplicarPreco ? novoPreco : undefined,
      statusNovo: aplicarStatus ? novoStatus : undefined,
      autorId: admin.id,
      motivo,
    });
  });

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  redirect(`/admin/empreendimentos/${empreendimentoId}`);
}
