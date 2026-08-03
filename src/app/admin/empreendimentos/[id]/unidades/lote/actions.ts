"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { UNIDADE_STATUS } from "../schema";
import { registrarHistoricoUnidade } from "../service";

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
  const aplicarTipo = formData.get("aplicarTipo") === "on";
  const aplicarVagas = formData.get("aplicarVagas") === "on";
  const aplicarArea = formData.get("aplicarArea") === "on";
  const aplicarDecorado = formData.get("aplicarDecorado") === "on";

  if (!aplicarPreco && !aplicarStatus && !aplicarTipo && !aplicarVagas && !aplicarArea && !aplicarDecorado) {
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

  let novoTipo: string | undefined;
  if (aplicarTipo) {
    novoTipo = String(formData.get("tipo") ?? "").trim();
    if (!novoTipo) return { success: false, message: "Informe o tipo." };
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

  const novoDecorado = formData.get("isDecorado") === "on";
  const motivo = (String(formData.get("motivo") ?? "").trim() || null) as string | null;

  const unidades = await prisma.unidade.findMany({
    where: { id: { in: unidadeIds }, empreendimentoId },
  });

  await prisma.$transaction(async (tx) => {
    for (const atual of unidades) {
      const data: Record<string, unknown> = {};
      if (aplicarPreco && novoPreco !== undefined) data.preco = novoPreco;
      if (aplicarStatus && novoStatus) data.status = novoStatus;
      if (aplicarTipo && novoTipo !== undefined) data.tipo = novoTipo;
      if (aplicarVagas && novasVagas !== undefined) data.vagas = novasVagas;
      if (aplicarArea && novaArea !== undefined) data.areaPrivativa = novaArea;
      if (aplicarDecorado) data.isDecorado = novoDecorado;

      await tx.unidade.update({ where: { id: atual.id }, data });

      await registrarHistoricoUnidade(tx, {
        unidadeId: atual.id,
        precoAnterior: atual.preco,
        precoNovo: aplicarPreco ? novoPreco : undefined,
        statusAnterior: atual.status,
        statusNovo: aplicarStatus ? novoStatus : undefined,
        autorId: admin.id,
        motivo,
      });
    }
  });

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  redirect(`/admin/empreendimentos/${empreendimentoId}`);
}
