"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/empreendimentos", label: "Empreendimentos" },
  { href: "#sobre", label: "Empresa" },
  { href: "#contato", label: "Contato" },
  { href: "/login", label: "Acesso Corretores" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Abrir menu"
        onClick={() => setOpen((v) => !v)}
        className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#f9fafc] text-primary"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {open ? (
            <>
              <line x1="6" x2="18" y1="6" y2="18" />
              <line x1="6" x2="18" y1="18" y2="6" />
            </>
          ) : (
            <>
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-20 border-b border-line bg-white px-6 py-4 shadow-lg">
          <nav className="flex flex-col gap-4 text-sm font-semibold text-primary">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="transition hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
