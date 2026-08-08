"use client";

import { useActionState } from "react";
import { enviarImagemConteudo, type EnviarImagemConteudoState } from "./conteudo-actions";

export function ImagemConteudoUpload({
  campo,
  imagemAtual,
}: {
  campo: "sobre" | "missao" | "visao" | "valores";
  imagemAtual: string | null;
}) {
  const [state, formAction, pending] = useActionState<EnviarImagemConteudoState, FormData>(
    (prevState, formData) => enviarImagemConteudo(campo, prevState, formData),
    undefined
  );

  const imagemExibida = state?.success ? state.url : imagemAtual;

  return (
    <div className="space-y-3">
      {imagemExibida && (
        // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL, not a local asset
        <img
          src={imagemExibida}
          alt="Imagem atual"
          className="h-40 w-full rounded-lg border border-line object-cover"
        />
      )}

      <form action={formAction} className="flex flex-wrap items-center gap-4">
        <input
          type="file"
          name="arquivo"
          accept="image/png,image/jpeg,image/webp"
          required
          className="text-sm text-ink/70 file:mr-4 file:rounded-md file:border-0 file:bg-mist file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-line"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
        >
          {pending ? "Enviando..." : "Enviar imagem"}
        </button>
      </form>

      {state?.success === false && <p className="text-sm text-red-600">{state.message}</p>}
    </div>
  );
}
