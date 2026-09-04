"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { gerarTabelaRevendasCore } from "./gerar-tabela";

const ID_CONFIG = "configuracao-revenda";

export type SalvarLinkMidiaState =
  | { success: true }
  | { success: false; message: string }
  | undefined;

export async function salvarLinkMidiaRevenda(
  _prevState: SalvarLinkMidiaState,
  formData: FormData
): Promise<SalvarLinkMidiaState> {
  await requireAdmin();

  const link = String(formData.get("linkMidiaPublica") ?? "").trim() || null;

  await prisma.configuracaoRevenda.upsert({
    where: { id: ID_CONFIG },
    update: { linkMidiaPublica: link },
    create: { id: ID_CONFIG, linkMidiaPublica: link },
  });

  revalidatePath("/admin/revendas");
  revalidatePath("/corretores/empreendimentos");

  return { success: true };
}

export type GerarTabelaRevendasState =
  | { success: true; url: string; geradoEm: string; avisos: string[] }
  | { success: false; message: string }
  | undefined;

export async function gerarTabelaRevendas(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- mantido pra casar com a assinatura do useActionState
  _prevState: GerarTabelaRevendasState
): Promise<GerarTabelaRevendasState> {
  await requireAdmin();

  const resultado = await gerarTabelaRevendasCore();
  if (!resultado.sucesso) {
    return { success: false, message: resultado.mensagem };
  }

  revalidatePath("/admin/revendas");
  revalidatePath("/corretores/empreendimentos");

  return { success: true, url: resultado.url, geradoEm: resultado.geradoEm, avisos: resultado.avisos };
}
