import { prisma } from "@/lib/prisma";
import { withApiToken } from "@/lib/api-auth";
import { RevendaSchema } from "@/app/admin/revendas/schema";
import { atualizarUnidadeRevendaCore } from "@/app/admin/revendas/core";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  return withApiToken(request, "revendas", async () => {
    const { id } = await params;
    const unidade = await prisma.unidadeRevenda.findUnique({
      where: { id },
      include: { fotos: { orderBy: { ordem: "asc" } } },
    });
    if (!unidade) {
      return Response.json({ error: "Unidade não encontrada." }, { status: 404 });
    }
    return Response.json({ unidade });
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return withApiToken(request, "revendas", async (user) => {
    const { id } = await params;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return Response.json({ error: "Corpo da requisição precisa ser um objeto JSON." }, { status: 400 });
    }

    // "motivo" não faz parte do RevendaSchema (é só o registro de auditoria da mudança de
    // status) — separa antes de validar o resto contra o schema.
    const { motivo, ...dados } = body as Record<string, unknown> & { motivo?: unknown };

    const parsed = RevendaSchema.safeParse(dados);
    if (!parsed.success) {
      return Response.json(
        { error: "Dados inválidos.", detalhes: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const resultado = await atualizarUnidadeRevendaCore(
      id,
      parsed.data,
      user.id,
      typeof motivo === "string" && motivo.trim() ? motivo.trim() : null
    );
    if (!resultado.sucesso) {
      const status = resultado.mensagem === "Unidade não encontrada." ? 404 : 422;
      return Response.json({ error: resultado.mensagem }, { status });
    }

    return Response.json({ unidade: resultado.unidade });
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return withApiToken(request, "revendas", async () => {
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    if (!body || body.confirmar !== true) {
      return Response.json(
        { error: 'Envie {"confirmar": true} no corpo da requisição pra confirmar a exclusão.' },
        { status: 400 }
      );
    }

    const existente = await prisma.unidadeRevenda.findUnique({ where: { id } });
    if (!existente) {
      return Response.json({ error: "Unidade não encontrada." }, { status: 404 });
    }

    await prisma.unidadeRevenda.delete({ where: { id } });
    return Response.json({ sucesso: true });
  });
}
