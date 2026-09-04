"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PAGINAS_ADMIN } from "@/lib/admin-paginas";
import { atualizarPermissoesAdmin, type AtualizarPermissoesState } from "./actions";

export function EditarPermissoesButton({
  admin,
}: {
  admin: { id: string; nome: string; paginasPermitidas: string[] };
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-sm font-medium text-primary hover:underline"
      >
        Editar acesso
      </button>
      {aberto && <ModalPermissoes admin={admin} onFechar={() => setAberto(false)} />}
    </>
  );
}

function ModalPermissoes({
  admin,
  onFechar,
}: {
  admin: { id: string; nome: string; paginasPermitidas: string[] };
  onFechar: () => void;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<AtualizarPermissoesState, FormData>(
    (prev, formData) => atualizarPermissoesAdmin(admin.id, prev, formData),
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      router.refresh();
      onFechar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reage a `state` mudar
  }, [state]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto my-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-xl font-medium text-primary">Acesso de {admin.nome}</h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="shrink-0 text-ink/40 transition hover:text-ink"
          >
            ✕
          </button>
        </div>

        <form action={action} className="mt-5 space-y-5">
          <div className="flex flex-col gap-2">
            {PAGINAS_ADMIN.map((pagina) => (
              <label key={pagina.chave} className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  name="paginas"
                  value={pagina.chave}
                  defaultChecked={admin.paginasPermitidas.includes(pagina.chave)}
                  className="size-4 rounded border-line"
                />
                {pagina.label}
              </label>
            ))}
          </div>

          {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}

          <p className="text-xs text-ink/50">
            A mudança vale a partir do próximo login dessa pessoa.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
            >
              {pending ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              onClick={onFechar}
              className="text-sm font-medium text-ink/60 hover:underline"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
