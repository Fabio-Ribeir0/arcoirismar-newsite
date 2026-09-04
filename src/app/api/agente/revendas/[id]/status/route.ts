import { withApiToken } from "@/lib/api-auth";
import { REVENDA_STATUS } from "@/app/admin/revendas/schema";
import { atualizarStatusRevendaCore } from "@/app/admin/revendas/core";

type Params = { params: Promise<{ id: string }> };

/**
 * Atalho pra mudar só o status de uma revenda, sem reenviar o objeto inteiro — pensado pra
 * um agente de IA chamar com poucos parâmetros. Ver também `POST /revendas/{id}/reservar`.
 */
export async function PATCH(request: Request, { params }: Params) {
  return withApiToken(request, "revendas", async (user) => {
    const { id } = await params;

    const body = await request.json().catch(() => null);
    const status = body && typeof body === "object" ? (body as Record<string, unknown>).status : undefined;
    if (typeof status !== "string" || !REVENDA_STATUS.includes(status as (typeof REVENDA_STATUS)[number])) {
      return Response.json(
        { error: `"status" precisa ser um de: ${REVENDA_STATUS.join(", ")}.` },
        { status: 422 }
      );
    }
    const motivo = typeof (body as Record<string, unknown>).motivo === "string"
      ? ((body as Record<string, unknown>).motivo as string).trim() || null
      : null;

    const resultado = await atualizarStatusRevendaCore(
      id,
      status as (typeof REVENDA_STATUS)[number],
      user.id,
      motivo
    );
    if (!resultado.sucesso) {
      return Response.json({ error: resultado.mensagem }, { status: 404 });
    }

    return Response.json({ unidade: resultado.unidade });
  });
}
