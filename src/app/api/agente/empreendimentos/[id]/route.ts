import { prisma } from "@/lib/prisma";
import { withApiToken } from "@/lib/api-auth";
import { EmpreendimentoSchema } from "@/app/admin/empreendimentos/schema";
import { atualizarEmpreendimentoCore } from "@/app/admin/empreendimentos/core";

type Params = { params: Promise<{ id: string }> };

function normalizarCorpo(body: Record<string, unknown>) {
  return { ...body, espelhoVenda: body.espelhoVenda ? "on" : "" };
}

export async function GET(request: Request, { params }: Params) {
  return withApiToken(request, "empreendimentos", async () => {
    const { id } = await params;
    const empreendimento = await prisma.empreendimento.findUnique({
      where: { id },
      include: {
        unidades: { orderBy: [{ andar: "asc" }, { identificador: "asc" }] },
        condicoesPagamento: { orderBy: { ordem: "asc" } },
        documentosAdicionais: { orderBy: { ordem: "asc" } },
      },
    });
    if (!empreendimento) {
      return Response.json({ error: "Empreendimento não encontrado." }, { status: 404 });
    }
    return Response.json({ empreendimento });
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return withApiToken(request, "empreendimentos", async (user) => {
    const { id } = await params;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return Response.json({ error: "Corpo da requisição precisa ser um objeto JSON." }, { status: 400 });
    }

    const parsed = EmpreendimentoSchema.safeParse(normalizarCorpo(body as Record<string, unknown>));
    if (!parsed.success) {
      return Response.json(
        { error: "Dados inválidos.", detalhes: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const resultado = await atualizarEmpreendimentoCore(id, parsed.data, user.id);
    if (!resultado.sucesso) {
      const status = resultado.mensagem === "Empreendimento não encontrado." ? 404 : 422;
      return Response.json({ error: resultado.mensagem }, { status });
    }

    return Response.json({ empreendimento: resultado.empreendimento });
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return withApiToken(request, "empreendimentos", async () => {
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    if (!body || body.confirmar !== true) {
      return Response.json(
        { error: 'Envie {"confirmar": true} no corpo da requisição pra confirmar a exclusão.' },
        { status: 400 }
      );
    }

    const existente = await prisma.empreendimento.findUnique({ where: { id } });
    if (!existente) {
      return Response.json({ error: "Empreendimento não encontrado." }, { status: 404 });
    }

    await prisma.empreendimento.delete({ where: { id } });
    return Response.json({ sucesso: true });
  });
}
