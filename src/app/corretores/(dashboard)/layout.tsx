import { requireCorretor } from "@/lib/dal";
import { LogoutButton } from "@/components/logout-button";

export default async function CorretorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCorretor();

  return (
    <div className="flex flex-1 flex-col bg-mist">
      <header className="no-print border-b border-line bg-white">
        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="relative flex items-stretch">
            {/* -left-[100vw] garante que o preto cubra a margem antes do container
                centralizado, até a borda esquerda real do header. */}
            <div className="header-brand-clip absolute top-0 right-0 bottom-0 -left-[100vw] bg-black" />
            <span className="relative z-10 py-2 pr-16 pl-8 font-display text-lg font-semibold text-white">
              Área do corretor
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink/60">{user.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
