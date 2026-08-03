export function SiteFooter() {
  return (
    <footer id="contato" className="bg-[#20201e] py-12 text-white/70">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm md:flex-row">
        <span className="font-display text-lg text-white">
          Arco<span className="text-accent">íris</span>
        </span>
        <p>© {new Date().getFullYear()} Arco-íris-mar. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
