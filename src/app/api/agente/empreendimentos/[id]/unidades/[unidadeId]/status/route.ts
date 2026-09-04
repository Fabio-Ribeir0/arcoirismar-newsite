import { withApiToken } from "@/lib/api-auth";
import { UNIDADE_STATUS } from "@/app/admin/empreendimentos/[id]/unidades/schema";
import { atualizarStatusUnidadeCore } from "@/app/admin/empreendimentos/[id]/unidades/core";

type Params = { params: Promise<{ id: string; unidadeId: string }> };

/**
 * Atalho pra mudar só o status de uma unidade, sem reenviar o objeto inteiro — pensado pra
 * um agente de IA chamar com poucos parâmetros.
 */
export async function PATCH(request: Request, { params }: Params) {
  return withApiToken(request, "empreendimentos", async (user) => {
    const { id, unidadeId } = await params;

    const body = await request.json().catch(() => null);
    const status = body && typeof body === "object" ? (body as Record<string, unknown>).status : undefined;
    if (typeof status !== "string" || !UNIDADE_STATUS.includes(status as (typeof UNIDADE_STATUS)[number])) {
      return Response.json(
        { error: `"status" precisa ser um de: ${UNIDADE_STATUS.join(", ")}.` },
        { status: 422 }
      );
    }
    const motivo = typeof (body as Record<string, unknown>).motivo === "string"
      ? ((body as Record<string, unknown>).motivo as string).trim() || null
      : null;

    const resultado = await atualizarStatusUnidadeCore(
      id,
      unidadeId,
      status as (typeof UNIDADE_STATUS)[number],
      user.id,
      motivo
    );
    if (!resultado.sucesso) {
      return Response.json({ error: resultado.mensagem }, { status: 404 });
    }

    return Response.json({ unidade: resultado.unidade });
  });
}
