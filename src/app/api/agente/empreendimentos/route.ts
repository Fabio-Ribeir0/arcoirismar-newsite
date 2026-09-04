import { prisma } from "@/lib/prisma";
import { withApiToken } from "@/lib/api-auth";
import { EmpreendimentoSchema } from "@/app/admin/empreendimentos/schema";
import { criarEmpreendimentoCore } from "@/app/admin/empreendimentos/core";

function normalizarCorpo(body: Record<string, unknown>) {
  return { ...body, espelhoVenda: body.espelhoVenda ? "on" : "" };
}

export async function GET(request: Request) {
  return withApiToken(request, "empreendimentos", async () => {
    const empreendimentos = await prisma.empreendimento.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nome: true,
        slug: true,
        status: true,
        destaque: true,
        espelhoVenda: true,
        createdAt: true,
      },
    });
    return Response.json({ empreendimentos });
  });
}

export async function POST(request: Request) {
  return withApiToken(request, "empreendimentos", async () => {
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

    const resultado = await criarEmpreendimentoCore(parsed.data);
    if (!resultado.sucesso) {
      return Response.json({ error: resultado.mensagem }, { status: 422 });
    }

    return Response.json({ empreendimento: resultado.empreendimento }, { status: 201 });
  });
}
