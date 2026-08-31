"use client";

import { useEffect, useState } from "react";

export type LightboxImage = {
  id: string;
  url: string;
  alt: string;
  /** Legenda visível (título cadastrado pelo admin) — quando ausente, nenhuma legenda é exibida. */
  legenda?: string | null;
};

export function LightboxGallery({ images }: { images: LightboxImage[] }) {
  const [indice, setIndice] = useState<number | null>(null);

  const fechar = () => setIndice(null);
  const anterior = () => setIndice((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  const proxima = () => setIndice((i) => (i === null ? null : (i + 1) % images.length));

  useEffect(() => {
    if (indice === null) return;

    // Compensa a largura da barra de rolagem que desaparece ao travar o
    // scroll — sem isso a página por trás "respira" alguns pixels e aparece
    // por baixo da borda do overlay (fundo escuro com texto de outra seção,
    // ilegível por cima da imagem).
    const larguraScrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${larguraScrollbar}px`;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") proxima();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fechar/anterior/proxima são estáveis o bastante aqui
  }, [indice, images.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {images.map((imagem, i) => (
          <button
            key={imagem.id}
            type="button"
            onClick={() => setIndice(i)}
            className="block cursor-zoom-in overflow-hidden rounded-lg border border-line text-left"
          >
            <div className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- external/admin-managed URLs, not local assets */}
              <img
                src={imagem.url}
                alt={imagem.alt}
                className="h-40 w-full object-cover transition duration-300 hover:scale-105"
              />
            </div>
            {imagem.legenda && (
              <p className="truncate border-t border-line px-2 py-1.5 text-xs text-ink/60">
                {imagem.legenda}
              </p>
            )}
          </button>
        ))}
      </div>

      {indice !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={fechar}
        >
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar"
            className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <CloseIcon />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  anterior();
                }}
                aria-label="Anterior"
                className="absolute left-2 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-4"
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  proxima();
                }}
                aria-label="Próxima"
                className="absolute right-2 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-4"
              >
                <ChevronIcon direction="right" />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element -- external/admin-managed URLs, not local assets */}
          <img
            src={images[indice].url}
            alt={images[indice].alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />

          {(images[indice].legenda || images.length > 1) && (
            <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-1 px-4 text-center">
              {images[indice].legenda && (
                <p className="text-sm font-medium text-white">{images[indice].legenda}</p>
              )}
              {images.length > 1 && (
                <p className="text-sm text-white/70">
                  {indice + 1} / {images.length}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
    >
      <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}
