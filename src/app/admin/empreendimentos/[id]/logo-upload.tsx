"use client";

import { useActionState } from "react";
import { enviarLogoEmpreendimento, type LogoUploadState } from "./logo-actions";

export function LogoUpload({
  empreendimentoId,
  logoAtual,
}: {
  empreendimentoId: string;
  logoAtual: string | null;
}) {
  const [state, formAction, pending] = useActionState<LogoUploadState, FormData>(
    (prevState, formData) => enviarLogoEmpreendimento(empreendimentoId, prevState, formData),
    undefined
  );

  const logoExibido = state?.success ? state.url : logoAtual;

  return (
    <div className="space-y-4 rounded-xl border border-line bg-white p-8">
      <div>
        <h3 className="font-display text-lg font-medium text-primary">Logo do empreendimento</h3>
        <p className="text-sm text-ink/60">
          Exibido ao lado do nome do empreendimento no banner da home. PNG, JPEG ou WebP, até 5MB.
        </p>
      </div>

      {logoExibido && (
        <div className="flex h-24 w-fit items-center rounded-lg border border-line bg-mist px-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL, not a local asset */}
          <img src={logoExibido} alt="Logo atual" className="h-16 w-auto object-contain" />
        </div>
      )}

      <form action={formAction} className="flex flex-wrap items-center gap-4">
        <input
          type="file"
          name="logo"
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
