import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UnidadeForm } from "../unidade-form";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { criarUnidade } from "../actions";

export default async function NovaUnidadePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const empreendimento = await prisma.empreendimento.findUnique({ where: { id } });
  if (!empreendimento) notFound();

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <Breadcrumb
          items={[
            { label: "Empreendimentos", href: "/admin/empreendimentos" },
            { label: empreendimento.nome, href: `/admin/empreendimentos/${empreendimento.id}` },
            { label: "Unidades", href: `/admin/empreendimentos/${empreendimento.id}` },
            { label: "Nova unidade" },
          ]}
        />
        <div>
          <h1 className="font-display text-3xl font-medium text-primary">Nova unidade</h1>
          <p className="mt-1 text-sm text-ink/60">{empreendimento.nome}</p>
        </div>
        <UnidadeForm action={criarUnidade.bind(null, empreendimento.id)} submitLabel="Criar unidade" />
      </div>
    </main>
  );
}
