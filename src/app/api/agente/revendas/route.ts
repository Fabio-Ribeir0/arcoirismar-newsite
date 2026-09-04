import { prisma } from "@/lib/prisma";
import { withApiToken } from "@/lib/api-auth";
import { RevendaSchema } from "@/app/admin/revendas/schema";
import { criarUnidadeRevendaCore } from "@/app/admin/revendas/core";

export async function GET(request: Request) {
  return withApiToken(request, "revendas", async () => {
    const unidades = await prisma.unidadeRevenda.findMany({
      orderBy: [{ ordem: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        nome: true,
        numeroUnidade: true,
        status: true,
        valor: true,
        template: true,
        createdAt: true,
      },
    });
    return Response.json({ unidades });
  });
}

export async function POST(request: Request) {
  return withApiToken(request, "revendas", async () => {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return Response.json({ error: "Corpo da requisição precisa ser um objeto JSON." }, { status: 400 });
    }

    const parsed = RevendaSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Dados inválidos.", detalhes: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const resultado = await criarUnidadeRevendaCore(parsed.data);
    if (!resultado.sucesso) {
      return Response.json({ error: resultado.mensagem }, { status: 422 });
    }

    return Response.json({ unidade: resultado.unidade }, { status: 201 });
  });
}
