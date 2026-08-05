"use client";

import { useActionState } from "react";
import { enviarBannerEmpreendimento, type BannerUploadState } from "./banner-actions";

export function BannerUpload({
  empreendimentoId,
  bannerAtual,
}: {
  empreendimentoId: string;
  bannerAtual: string | null;
}) {
  const [state, formAction, pending] = useActionState<BannerUploadState, FormData>(
    (prevState, formData) => enviarBannerEmpreendimento(empreendimentoId, prevState, formData),
    undefined
  );

  const bannerExibido = state?.success ? state.url : bannerAtual;

  return (
    <div className="space-y-4 rounded-xl border border-line bg-white p-8">
      <div>
        <h3 className="font-display text-lg font-medium text-primary">Imagem de banner</h3>
        <p className="text-sm text-ink/60">
          Usada no hero da home, no card de destaque e no topo da página do empreendimento.
          PNG, JPEG ou WebP, até 5MB.
        </p>
      </div>

      {bannerExibido && (
        // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL, not a local asset
        <img
          src={bannerExibido}
          alt="Banner atual"
          className="h-48 w-full rounded-lg border border-line object-cover"
        />
      )}

      <form action={formAction} className="flex flex-wrap items-center gap-4">
        <input
          type="file"
          name="banner"
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
