"use client";

import { useActionState } from "react";
import { cadastrarCorretor } from "./actions";

export default function CadastroCorretorPage() {
  const [state, action, pending] = useActionState(cadastrarCorretor, undefined);

  if (state?.success) {
    return (
      <main className="flex flex-1 items-center justify-center bg-mist px-6 py-24">
        <div className="max-w-md space-y-3 text-center">
          <h1 className="font-display text-2xl font-medium text-primary">
            Cadastro enviado
          </h1>
          <p className="text-ink/70">
            Recebemos seus dados. Nossa equipe vai validar seu CRECI e liberar seu
            acesso em breve.
          </p>
        </div>
      </main>
    );
  }

  const errors = state?.success === false ? state.errors : undefined;
  const message = state?.success === false ? state.message : undefined;

  return (
    <main className="flex flex-1 items-center justify-center bg-mist px-6 py-16">
      <form
        action={action}
        className="w-full max-w-md space-y-5 rounded-xl border border-line bg-white p-8"
      >
        <div>
          <h1 className="font-display text-2xl font-medium text-primary">
            Cadastro de corretor
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Preencha seus dados para solicitar acesso à área do corretor.
          </p>
        </div>

        <Field label="Nome completo" name="nome" errors={errors?.nome} />
        <Field label="E-mail" name="email" type="email" errors={errors?.email} />
        <Field label="Telefone" name="telefone" errors={errors?.telefone} />
        <Field label="CRECI" name="creci" errors={errors?.creci} />
        <Field label="Senha" name="senha" type="password" errors={errors?.senha} />

        {message && <p className="text-sm text-red-600">{message}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-primary px-4 py-2.5 font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
        >
          {pending ? "Enviando..." : "Enviar cadastro"}
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  errors,
}: {
  label: string;
  name: string;
  type?: string;
  errors?: string[];
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
      />
      {errors?.map((error) => (
        <p key={error} className="text-sm text-red-600">
          {error}
        </p>
      ))}
    </div>
  );
}
