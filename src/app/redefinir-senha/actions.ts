"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validarTokenAcesso, consumirTokenAcesso } from "@/lib/auth-tokens";

export type RedefinirSenhaState =
  | { success: true }
  | { success: false; message: string }
  | undefined;

export async function redefinirSenha(
  token: string,
  _prevState: RedefinirSenhaState,
  formData: FormData
): Promise<RedefinirSenhaState> {
  const senha = String(formData.get("senha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");

  if (senha.length < 8) {
    return { success: false, message: "A senha deve ter pelo menos 8 caracteres." };
  }
  if (senha !== confirmacao) {
    return { success: false, message: "As senhas não coincidem." };
  }

  const email = await validarTokenAcesso(token);
  if (!email) {
    return { success: false, message: "Link inválido ou expirado. Solicite um novo." };
  }

  const hashedPassword = await bcrypt.hash(senha, 10);
  await prisma.user.update({ where: { email }, data: { password: hashedPassword } });
  await consumirTokenAcesso(token);

  return { success: true };
}
