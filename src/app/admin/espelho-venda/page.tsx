import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import {
  EspelhoVendaCarousel,
  type EmpreendimentoEspelho,
  type UnidadeEspelho,
} from "./espelho-venda-carousel";

export default async function EspelhoVendaPage() {
  const empreendimentos = await prisma.empreendimento.findMany({
    where: { espelhoVenda: true },
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      unidades: {
        select: { id: true, identificador: true, andar: true, status: true },
        orderBy: [{ andar: "desc" }, { identificador: "asc" }],
      },
    },
  });

  const dados: EmpreendimentoEspelho[] = empreendimentos.map((empreendimento) => {
    const porAndar = new Map<number, UnidadeEspelho[]>();
    let unidadesSemAndar = 0;

    for (const unidade of empreendimento.unidades) {
      if (unidade.andar === null) {
        unidadesSemAndar += 1;
        continue;
      }
      const lista = porAndar.get(unidade.andar) ?? [];
      lista.push({ id: unidade.id, identificador: unidade.identificador, status: unidade.status });
      porAndar.set(unidade.andar, lista);
    }

    const andares = Array.from(porAndar.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([andar, unidades]) => ({
        andar,
        unidades: unidades.sort((a, b) =>
          a.identificador.localeCompare(b.identificador, undefined, { numeric: true })
        ),
      }));

    return { id: empreendimento.id, nome: empreendimento.nome, andares, unidadesSemAndar };
  });

  return (
    <main className="px-6 py-16">
      <div className="space-y-8">
        <Breadcrumb items={[{ label: "Espelho de Venda" }]} />
        <h1 className="font-display text-3xl font-medium text-primary">Espelho de Venda</h1>
        <EspelhoVendaCarousel empreendimentos={dados} />
      </div>
    </main>
  );
}
