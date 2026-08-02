"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { ConfiguracaoSimulacaoSchema } from "./schema";

export type ConfiguracaoFormState =
  | { success: true }
  | { success: false; errors?: Record<string, string[] | undefined>; message?: string }
  | undefined;

export async function criarConfiguracaoSimulacao(
  _prevState: ConfiguracaoFormState,
  formData: FormData
): Promise<ConfiguracaoFormState> {
  const admin = await requireAdmin();

  const parsed = ConfiguracaoSimulacaoSchema.safeParse({
    taxaJurosAnual: formData.get("taxaJurosAnual"),
    prazoMaximoMeses: formData.get("prazoMaximoMeses"),
    entradaMinimaPercentual: formData.get("entradaMinimaPercentual"),
    sistemaAmortizacao: formData.get("sistemaAmortizacao"),
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  await prisma.configuracaoSimulacao.create({
    data: {
      taxaJurosAnual: data.taxaJurosAnual,
      prazoMaximoMeses: data.prazoMaximoMeses,
      entradaMinimaPercentual: data.entradaMinimaPercentual,
      sistemaAmortizacao: data.sistemaAmortizacao,
      autorId: admin.id,
    },
  });

  revalidatePath("/admin/configuracoes");
  return { success: true };
}
