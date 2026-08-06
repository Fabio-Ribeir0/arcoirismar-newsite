"use server";

import { prisma } from "@/lib/prisma";
import { criarTokenAcesso } from "@/lib/auth-tokens";
import { enviarEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/base-url";

export type EsqueciSenhaState = { success: true; message: string } | { success: false; message: string } | undefined;

// Mesma mensagem sempre, exista ou não o e-mail — evita dar pra descobrir
// quais e-mails têm conta só tentando recuperar senha.
const MENSAGEM_GENERICA =
  "Se esse e-mail estiver cadastrado, enviamos um link de redefinição de senha em instantes.";

export async function solicitarRedefinicaoSenha(
  _prevState: EsqueciSenhaState,
  formData: FormData
): Promise<EsqueciSenhaState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { success: false, message: "Informe um e-mail válido." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = await criarTokenAcesso(email);
    const link = `${getBaseUrl()}/redefinir-senha?token=${token}`;

    await enviarEmail({
      to: email,
      subject: "Redefinição de senha — Arco-íris-mar",
      html: `
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p><a href="${link}">Clique aqui para criar uma nova senha</a>.</p>
        <p>Esse link expira em 1 hora. Se você não pediu isso, pode ignorar este e-mail.</p>
      `,
    });
  }

  return { success: true, message: MENSAGEM_GENERICA };
}
