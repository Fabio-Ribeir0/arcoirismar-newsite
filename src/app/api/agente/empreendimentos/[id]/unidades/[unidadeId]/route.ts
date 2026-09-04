import { prisma } from "@/lib/prisma";
import { withApiToken } from "@/lib/api-auth";
import { UnidadeSchema } from "@/app/admin/empreendimentos/[id]/unidades/schema";
import { atualizarUnidadeCore } from "@/app/admin/empreendimentos/[id]/unidades/core";

type Params = { params: Promise<{ id: string; unidadeId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withApiToken(request, "empreendimentos", async (user) => {
    const { id, unidadeId } = await params;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return Response.json({ error: "Corpo da requisição precisa ser um objeto JSON." }, { status: 400 });
    }

    const parsed = UnidadeSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Dados inválidos.", detalhes: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const resultado = await atualizarUnidadeCore(id, unidadeId, parsed.data, user.id);
    if (!resultado.sucesso) {
      const status = resultado.mensagem === "Unidade não encontrada." ? 404 : 422;
      return Response.json({ error: resultado.mensagem }, { status });
    }

    return Response.json({ unidade: resultado.unidade });
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return withApiToken(request, "empreendimentos", async () => {
    const { id, unidadeId } = await params;

    const body = await request.json().catch(() => ({}));
    if (!body || body.confirmar !== true) {
      return Response.json(
        { error: 'Envie {"confirmar": true} no corpo da requisição pra confirmar a exclusão.' },
        { status: 400 }
      );
    }

    const existente = await prisma.unidade.findUnique({ where: { id: unidadeId } });
    if (!existente || existente.empreendimentoId !== id) {
      return Response.json({ error: "Unidade não encontrada." }, { status: 404 });
    }

    await prisma.unidade.delete({ where: { id: unidadeId } });
    return Response.json({ sucesso: true });
  });
}
