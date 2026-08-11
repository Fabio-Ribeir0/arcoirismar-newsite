"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export type SalvarLinkMidiaPublicaState =
  | { success: true }
  | { success: false; message: string }
  | undefined;

export async function atualizarLinkMidiaPublica(
  empreendimentoId: string,
  _prevState: SalvarLinkMidiaPublicaState,
  formData: FormData
): Promise<SalvarLinkMidiaPublicaState> {
  await requireAdmin();

  const link = String(formData.get("linkMidiaPublica") ?? "").trim();

  if (link && !/^https?:\/\//i.test(link)) {
    return { success: false, message: "Informe um link completo, começando com http:// ou https://." };
  }

  await prisma.empreendimento.update({
    where: { id: empreendimentoId },
    data: { linkMidiaPublica: link || null },
  });

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  revalidatePath(`/corretores/empreendimentos/${empreendimentoId}`);

  return { success: true };
}
