import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-white">
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-8 px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/images/logo_preto.png"
            alt="Construtora Arco-íris-mar"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 text-[15px] font-semibold text-primary lg:flex">
          <Link href="/" className="transition hover:text-accent">
            Home
          </Link>
          <div className="dropdown relative py-2">
            <button className="flex items-center gap-1 transition hover:text-accent">
              Empreendimentos
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div className="dropdown-panel absolute top-full left-0 w-56 pt-3">
              <div className="rounded-lg border border-line bg-white py-2 shadow-lg">
                <Link
                  href="/empreendimentos"
                  className="block px-4 py-2 text-sm font-medium transition hover:bg-mist hover:text-accent"
                >
                  Todos os empreendimentos
                </Link>
                <Link
                  href="/empreendimentos?status=LANCAMENTO"
                  className="block px-4 py-2 text-sm font-medium transition hover:bg-mist hover:text-accent"
                >
                  Em lançamento
                </Link>
                <Link
                  href="/empreendimentos?status=PRONTO"
                  className="block px-4 py-2 text-sm font-medium transition hover:bg-mist hover:text-accent"
                >
                  Prontos para morar
                </Link>
              </div>
            </div>
          </div>
          <a href="#sobre" className="transition hover:text-accent">
            Empresa
          </a>
          <a href="#contato" className="transition hover:text-accent">
            Contato
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-6">
          <a
            href="https://wa.me/551334957537"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-3 xl:flex"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-mist text-primary">
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
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            <div className="leading-tight">
              <p className="text-xs text-ink/60">Central de Atendimento</p>
              <p className="text-sm font-bold text-primary">+55 13 3495 7537</p>
            </div>
          </a>

          <Link
            href="/login"
            className="hidden whitespace-nowrap rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-light md:inline-flex md:items-center md:justify-center"
          >
            Acesso Corretores
          </Link>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
