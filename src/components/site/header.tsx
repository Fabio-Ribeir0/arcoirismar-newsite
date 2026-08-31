import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "./mobile-menu";
import { WhatsAppIcon } from "./whatsapp-icon";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-white">
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-8 px-6">
        <div className="relative flex h-full shrink-0 items-stretch">
          {/* -left-[100vw] garante que o preto cubra a margem antes do container
              centralizado (max-w-7xl), até a borda esquerda real do header,
              qualquer que seja a largura da tela. */}
          <div className="header-brand-clip absolute top-0 right-0 bottom-0 -left-[100vw] bg-black" />
          <Link href="/" className="relative z-10 flex shrink-0 items-center pr-6 pl-6">
            <Image
              src="/images/logo_horizontal.png"
              alt="Construtora Arco-íris-mar"
              width={210}
              height={39}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="relative z-10 hidden items-center gap-8 py-2 pr-16 text-[15px] font-semibold text-white lg:flex">
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
                    className="block px-4 py-2 text-sm font-medium text-primary transition hover:bg-mist hover:text-accent"
                  >
                    Todos os empreendimentos
                  </Link>
                  <Link
                    href="/empreendimentos?status=LANCAMENTO"
                    className="block px-4 py-2 text-sm font-medium text-primary transition hover:bg-mist hover:text-accent"
                  >
                    Em lançamento
                  </Link>
                  <Link
                    href="/empreendimentos?status=PRONTO"
                    className="block px-4 py-2 text-sm font-medium text-primary transition hover:bg-mist hover:text-accent"
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
        </div>

        <div className="ml-auto flex items-center gap-6">
          <a
            href="https://wa.me/551334957537"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-3 xl:flex"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-mist text-primary">
              <WhatsAppIcon className="size-[18px]" />
            </span>
            <div className="leading-tight">
              <p className="text-xs text-ink/60">Central de Atendimento</p>
              <p className="text-sm font-bold text-primary">+55 13 3495 7537</p>
            </div>
          </a>

          <Link
            href="/login"
            className="hidden whitespace-nowrap rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-primary transition hover:bg-accent-light md:inline-flex md:items-center md:justify-center"
          >
            Acesso Corretores
          </Link>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
