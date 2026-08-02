"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { CadastroCorretorSchema } from "./schema";

export type CadastroState =
  | { success: true }
  | { success: false; errors?: Record<string, string[] | undefined>; message?: string }
  | undefined;

export async function cadastrarCorretor(
  _prevState: CadastroState,
  formData: FormData
): Promise<CadastroState> {
  const parsed = CadastroCorretorSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    creci: formData.get("creci"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { nome, email, telefone, creci, senha } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, message: "Já existe um cadastro com este e-mail." };
  }

  const hashedPassword = await bcrypt.hash(senha, 10);

  await prisma.user.create({
    data: {
      name: nome,
      email,
      telefone,
      creci,
      password: hashedPassword,
      role: "CORRETOR",
      status: "PENDENTE",
    },
  });

  return { success: true };
}
