import Image from "next/image";
import Link from "next/link";
import { WhatsAppIcon } from "./whatsapp-icon";

const CONTATOS = [
  {
    titulo: "Central de Atendimento",
    telefoneExibido: "+55 13 3495-7537",
    whatsapp: "551334957537",
  },
  {
    titulo: "Comercial",
    telefoneExibido: "+55 13 97418-5096",
    whatsapp: "5513974185096",
  },
];

export function SiteFooter() {
  return (
    <footer id="contato" className="bg-[#20201e] pt-8 pb-4 text-white/70">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="shrink-0">
            <Image
              src="/images/logo_horizontal.png"
              alt="Construtora Arco-íris-mar"
              width={210}
              height={39}
              className="h-8 w-auto object-contain"
            />
          </Link>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-10">
            {CONTATOS.map((contato) => (
              <a
                key={contato.whatsapp}
                href={`https://wa.me/${contato.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 transition hover:text-white"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accent">
                  <WhatsAppIcon className="size-[18px]" />
                </span>
                <div className="leading-tight">
                  <p className="text-xs text-white/50">{contato.titulo}</p>
                  <p className="text-sm font-semibold text-white">{contato.telefoneExibido}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Arco-íris-mar. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
