import { EmpreendimentoForm } from "../empreendimento-form";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { criarEmpreendimento } from "../actions";

export default function NovoEmpreendimentoPage() {
  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <Breadcrumb
          items={[
            { label: "Empreendimentos", href: "/admin/empreendimentos" },
            { label: "Novo empreendimento" },
          ]}
        />
        <h1 className="font-display text-3xl font-medium text-primary">
          Novo empreendimento
        </h1>
        <EmpreendimentoForm action={criarEmpreendimento} submitLabel="Criar empreendimento" />
      </div>
    </main>
  );
}
