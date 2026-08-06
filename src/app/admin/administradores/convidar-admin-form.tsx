"use client";

import { useActionState, useState } from "react";
import { convidarAdmin } from "./actions";

export function ConvidarAdminForm() {
  const [state, action, pending] = useActionState(convidarAdmin, undefined);
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="space-y-4 rounded-xl border border-line bg-white p-6">
      <div>
        <h2 className="font-display text-lg font-medium text-primary">Convidar administrador</h2>
        <p className="text-sm text-ink/60">
          Cria a conta e envia um e-mail com um link para a pessoa definir a própria senha.
        </p>
      </div>

      <form action={action} className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <label htmlFor="nome" className="text-xs font-medium text-ink/60">
            Nome
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            required
            className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-medium text-ink/60">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
        >
          {pending ? "Convidando..." : "Convidar"}
        </button>
      </form>

      {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}

      {state?.success && (
        <div className="space-y-2 rounded-md border border-line bg-mist p-4">
          {state.emailEnviado ? (
            <p className="text-sm text-green-700">Convite enviado por e-mail.</p>
          ) : (
            <p className="text-sm text-ink/70">
              Envio de e-mail não configurado ainda — copie e envie este link manualmente pra
              pessoa convidada:
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={state.link}
              onFocus={(e) => e.target.select()}
              className="flex-1 truncate rounded-md border border-line bg-white px-3 py-2 text-xs text-ink/70"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(state.link);
                setCopiado(true);
                setTimeout(() => setCopiado(false), 2000);
              }}
              className="rounded-md border border-line px-3 py-2 text-xs font-semibold text-primary hover:bg-white"
            >
              {copiado ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <p className="text-xs text-ink/50">Válido por 1 hora.</p>
        </div>
      )}
    </div>
  );
}
