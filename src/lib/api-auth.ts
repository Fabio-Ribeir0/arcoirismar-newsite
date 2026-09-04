import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";
import type { PaginaAdmin } from "@/lib/admin-paginas";

export function gerarToken(): string {
  return randomBytes(32).toString("hex"); // 64 chars, mostrado uma única vez na criação
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Como requireAdmin(), mas por Bearer token em vez de sessão de cookie — pra rotas de API
 * chamadas por automações, que não conseguem "logar" interativamente. Em vez de redirecionar
 * (o que faz sentido pra uma página, não pra uma API), lança a própria `Response` de erro
 * pronta pra o chamador devolver com `catch (r) { if (r instanceof Response) return r; }`.
 */
export async function requireApiToken(request: Request, pagina: PaginaAdmin) {
  const cabecalho = request.headers.get("authorization") ?? "";
  const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7).trim() : null;
  if (!token) {
    throw Response.json({ error: "Token ausente. Envie 'Authorization: Bearer <token>'." }, { status: 401 });
  }

  const registro = await prisma.apiToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!registro || registro.revogadoEm) {
    throw Response.json({ error: "Token inválido ou revogado." }, { status: 401 });
  }
  if (registro.user.role !== "ADMIN") {
    throw Response.json({ error: "Token inválido." }, { status: 401 });
  }
  if (!registro.user.paginasPermitidas.includes(pagina)) {
    throw Response.json({ error: "Este token não tem acesso a esta área." }, { status: 403 });
  }

  // Best-effort — não bloqueia a resposta se essa escrita falhar.
  await prisma.apiToken.update({ where: { id: registro.id }, data: { ultimoUsoEm: new Date() } }).catch(() => {});

  return registro.user;
}

/**
 * Envolve um handler de rota da API de agente: autentica o token, e devolve como resposta
 * HTTP tanto o 401/403 de `requireApiToken` quanto qualquer outro erro que o handler jogue —
 * evita repetir o mesmo `try/catch` em cada rota.
 */
export async function withApiToken(
  request: Request,
  pagina: PaginaAdmin,
  handler: (user: User) => Promise<Response>
): Promise<Response> {
  try {
    const user = await requireApiToken(request, pagina);
    return await handler(user);
  } catch (erro) {
    if (erro instanceof Response) return erro;
    throw erro;
  }
}
