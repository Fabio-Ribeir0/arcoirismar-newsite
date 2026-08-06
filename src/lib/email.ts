import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

/**
 * Sem RESEND_API_KEY configurada, só loga e segue em frente — os fluxos que
 * dependem de e-mail (redefinição de senha, convite de admin) continuam
 * funcionando no resto da lógica, só não entregam nada de verdade até a
 * chave ser configurada.
 */
export async function enviarEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ enviado: boolean }> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY não configurada — e-mail para ${to} ("${subject}") não foi enviado.`);
    return { enviado: false };
  }

  const { error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
  if (error) {
    console.error("[email] Falha ao enviar:", error);
    return { enviado: false };
  }

  return { enviado: true };
}
