import "server-only";
import crypto from "crypto";
import { prisma } from "./prisma";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

/**
 * Gera um token de uso único (redefinição de senha / convite de admin),
 * reaproveitando o modelo VerificationToken já usado pelo Auth.js. Um
 * e-mail só tem um link válido por vez — gerar um novo invalida o anterior.
 */
export async function criarTokenAcesso(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } });

  return token;
}

/** Retorna o e-mail associado ao token se ele existir e ainda for válido, senão null. */
export async function validarTokenAcesso(token: string): Promise<string | null> {
  const registro = await prisma.verificationToken.findUnique({ where: { token } });
  if (!registro) return null;

  if (registro.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return null;
  }

  return registro.identifier;
}

/** Consome (apaga) o token depois de usado, pra não dar pra reutilizar o mesmo link. */
export async function consumirTokenAcesso(token: string): Promise<void> {
  await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
}
