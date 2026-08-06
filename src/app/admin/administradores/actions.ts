"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { criarTokenAcesso } from "@/lib/auth-tokens";
import { enviarEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/base-url";

export type ConvidarAdminState =
  | { success: true; link: string; emailEnviado: boolean }
  | { success: false; message: string }
  | undefined;

export async function convidarAdmin(
  _prevState: ConvidarAdminState,
  formData: FormData
): Promise<ConvidarAdminState> {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const nome = String(formData.get("nome") ?? "").trim();

  if (!email || !email.includes("@")) {
    return { success: false, message: "Informe um e-mail válido." };
  }
  if (!nome) {
    return { success: false, message: "Informe o nome." };
  }

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return { success: false, message: "Já existe uma conta cadastrada com esse e-mail." };
  }

  await prisma.user.create({
    data: { email, name: nome, role: "ADMIN", password: null },
  });

  const token = await criarTokenAcesso(email);
  const link = `${getBaseUrl()}/redefinir-senha?token=${token}`;

  const { enviado } = await enviarEmail({
    to: email,
    subject: "Convite para administrar o site — Arco-íris-mar",
    html: `
      <p>Você foi convidado para ser administrador do site da Arco-íris-mar.</p>
      <p><a href="${link}">Clique aqui para criar sua senha</a> e acessar o painel.</p>
      <p>Esse link expira em 1 hora.</p>
    `,
  });

  revalidatePath("/admin/administradores");

  return { success: true, link, emailEnviado: enviado };
}

export async function cancelarConviteAdmin(adminId: string) {
  const admin = await requireAdmin();

  const alvo = await prisma.user.findUnique({ where: { id: adminId } });
  if (!alvo || alvo.role !== "ADMIN") return;

  // Só permite cancelar convites ainda não aceitos (sem senha definida) — um
  // admin já ativo não é excluído por aqui.
  if (alvo.password !== null) return;

  // Não deixa se autoexcluir por engano nem zerar o último admin restante.
  if (alvo.id === admin.id) return;

  await prisma.user.delete({ where: { id: adminId } });
  revalidatePath("/admin/administradores");
}
