import { withApiToken } from "@/lib/api-auth";
import { gerarTabelaEmpreendimentoCore } from "@/app/admin/empreendimentos/[id]/gerar-tabela";

export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  return withApiToken(request, "empreendimentos", async () => {
    const { id } = await params;

    const resultado = await gerarTabelaEmpreendimentoCore(id);
    if (!resultado.sucesso) {
      return Response.json({ error: resultado.mensagem }, { status: 422 });
    }

    return Response.json({ url: resultado.url, geradoEm: resultado.geradoEm });
  });
}
