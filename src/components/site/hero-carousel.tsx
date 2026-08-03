"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export type HeroSlide = {
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  href: string;
  imagemUrl?: string | null;
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

  return (
    <section className="relative min-h-[640px] overflow-hidden bg-primary text-white">
      {slides.map((slide, index) => (
        <div
          key={slide.href + index}
          className="absolute inset-0 flex items-center transition-opacity duration-1000"
          style={{ opacity: index === atual ? 1 : 0 }}
        >
          {slide.imagemUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- admin-managed Supabase Storage URL */}
              <img
                src={slide.imagemUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/70 to-primary/10" />
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
                className="rounded-md border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Sou corretor
              </Link>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
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
      )}
    </section>
  );
}
