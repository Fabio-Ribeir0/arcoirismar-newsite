"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { gerarToken, hashToken } from "@/lib/api-auth";

export type CriarTokenApiState =
  | { success: true; token: string }
  | { success: false; message: string }
  | undefined;

export async function criarTokenApi(
  _prevState: CriarTokenApiState,
  formData: FormData
): Promise<CriarTokenApiState> {
  await requireAdmin();

  const nome = String(formData.get("nome") ?? "").trim();
  const userId = String(formData.get("userId") ?? "").trim();

  if (!nome) {
    return { success: false, message: "Informe um nome para o token." };
  }

  const usuario = await prisma.user.findUnique({ where: { id: userId } });
  if (!usuario || usuario.role !== "ADMIN") {
    return { success: false, message: "Selecione um administrador válido." };
  }

  const token = gerarToken();

  await prisma.apiToken.create({
    data: { nome, userId, tokenHash: hashToken(token) },
  });

  revalidatePath("/admin/administradores");

  return { success: true, token };
}

export async function revogarTokenApi(tokenId: string) {
  await requireAdmin();
  await prisma.apiToken.update({ where: { id: tokenId }, data: { revogadoEm: new Date() } });
  revalidatePath("/admin/administradores");
}
