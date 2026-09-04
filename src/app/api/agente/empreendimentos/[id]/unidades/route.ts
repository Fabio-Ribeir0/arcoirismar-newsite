import { prisma } from "@/lib/prisma";
import { withApiToken } from "@/lib/api-auth";
import { UnidadeSchema } from "@/app/admin/empreendimentos/[id]/unidades/schema";
import { criarUnidadeCore } from "@/app/admin/empreendimentos/[id]/unidades/core";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  return withApiToken(request, "empreendimentos", async () => {
    const { id } = await params;
    const unidades = await prisma.unidade.findMany({
      where: { empreendimentoId: id },
      orderBy: [{ andar: "asc" }, { identificador: "asc" }],
    });
    return Response.json({ unidades });
  });
}

export async function POST(request: Request, { params }: Params) {
  return withApiToken(request, "empreendimentos", async () => {
    const { id } = await params;

    const empreendimento = await prisma.empreendimento.findUnique({ where: { id } });
    if (!empreendimento) {
      return Response.json({ error: "Empreendimento não encontrado." }, { status: 404 });
    }

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

    const resultado = await criarUnidadeCore(id, parsed.data);
    if (!resultado.sucesso) {
      return Response.json({ error: resultado.mensagem }, { status: 422 });
    }

    return Response.json({ unidade: resultado.unidade }, { status: 201 });
  });
}
