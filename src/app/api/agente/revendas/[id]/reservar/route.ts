import { withApiToken } from "@/lib/api-auth";
import { atualizarStatusRevendaCore } from "@/app/admin/revendas/core";

type Params = { params: Promise<{ id: string }> };

/**
 * Marca a revenda como RESERVADA — a ação mais comum de um agente que acabou de receber
 * uma proposta. Atalho de `PATCH /revendas/{id}/status`, sem parâmetro de status pra errar.
 */
export async function POST(request: Request, { params }: Params) {
  return withApiToken(request, "revendas", async (user) => {
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const motivo = body && typeof (body as Record<string, unknown>).motivo === "string"
      ? ((body as Record<string, unknown>).motivo as string).trim() || null
      : null;

    const resultado = await atualizarStatusRevendaCore(id, "RESERVADA", user.id, motivo);
    if (!resultado.sucesso) {
      return Response.json({ error: resultado.mensagem }, { status: 404 });
    }

    return Response.json({ unidade: resultado.unidade });
  });
}
