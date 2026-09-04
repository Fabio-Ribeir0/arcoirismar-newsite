import { withApiToken } from "@/lib/api-auth";
import { gerarTabelaRevendasCore } from "@/app/admin/revendas/gerar-tabela";

export const maxDuration = 60;

export async function POST(request: Request) {
  return withApiToken(request, "revendas", async () => {
    const resultado = await gerarTabelaRevendasCore();
    if (!resultado.sucesso) {
      return Response.json({ error: resultado.mensagem }, { status: 422 });
    }

    return Response.json({ url: resultado.url, geradoEm: resultado.geradoEm, avisos: resultado.avisos });
  });
}
