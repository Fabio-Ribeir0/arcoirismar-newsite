"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

const VALID_STATUS = ["PENDENTE", "APROVADO", "REJEITADO"] as const;

export async function atualizarStatusCorretor(
  id: string,
  status: (typeof VALID_STATUS)[number]
) {
  await requireAdmin();

  if (!VALID_STATUS.includes(status)) return;

  await prisma.user.updateMany({
    where: { id, role: "CORRETOR" },
    data: { status },
  });

  revalidatePath("/admin/corretores");
}
