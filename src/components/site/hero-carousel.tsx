"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type HeroSlide = {
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  href: string;
  imagemUrl?: string | null;
  videoUrl?: string | null;
};

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setAtual((i) => (i + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const anterior = () => setAtual((i) => (i - 1 + slides.length) % slides.length);
  const proximo = () => setAtual((i) => (i + 1) % slides.length);

  return (
    <section className="relative min-h-[640px] overflow-hidden bg-primary text-white">
      {slides.map((slide, index) => (
        <div
          key={slide.href + index}
          className="absolute inset-0 flex items-center transition-opacity duration-1000"
          style={{ opacity: index === atual ? 1 : 0 }}
        >
          {slide.videoUrl ? (
            <>
              <SlideVideo videoUrl={slide.videoUrl} imagemUrl={slide.imagemUrl} ativo={index === atual} />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-primary/10" />
            </>
          ) : slide.imagemUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- admin-managed Supabase Storage URL */}
              <img
                src={slide.imagemUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-primary/10" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-light" />
          )}
          <div className="relative w-full max-w-7xl mx-auto px-6">
            <p className="mb-4 text-xs font-semibold tracking-widest text-accent-light uppercase">
              {slide.eyebrow}
            </p>
            <h1 className="font-display max-w-2xl text-4xl leading-tight font-medium md:text-6xl">
              {slide.titulo}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">{slide.subtitulo}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={slide.href}
                className="rounded-md bg-accent px-6 py-3 font-semibold text-primary transition hover:bg-accent-light"
              >
                Ver empreendimento
              </Link>
              <Link
                href="/login"
                className="rounded-md bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-light"
              >
                Sou corretor
              </Link>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={anterior}
            aria-label="Slide anterior"
            className="absolute top-1/2 left-2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-4"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={proximo}
            aria-label="Próximo slide"
            className="absolute top-1/2 right-2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-4"
          >
            <ChevronIcon direction="right" />
          </button>

          <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.href + index}
                type="button"
                aria-label={`Slide ${index + 1}`}
                onClick={() => setAtual(index)}
                className={`size-2.5 rounded-full transition ${index === atual ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
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

/**
 * Vídeo de fundo do hero. Só toca de fato o slide ativo (os demais ficam
 * pausados fora de tela) e é escondido no mobile — autoplay de vídeo pesa
 * demais em dados móveis, então nesse caso cai para a imagem (poster).
 */
function SlideVideo({
  videoUrl,
  imagemUrl,
  ativo,
}: {
  videoUrl: string;
  imagemUrl?: string | null;
  ativo: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (ativo) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [ativo]);

  return (
    <>
      {imagemUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- fallback shown on mobile / while video loads
        <img
          src={imagemUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover md:hidden"
        />
      )}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={imagemUrl ?? undefined}
        muted
        loop
        playsInline
        preload={ativo ? "auto" : "none"}
        className="absolute inset-0 hidden h-full w-full object-cover md:block"
      />
    </>
  );
}
