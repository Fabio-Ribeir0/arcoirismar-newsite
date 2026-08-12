import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const pendentes = await prisma.user.count({
    where: { role: "CORRETOR", status: "PENDENTE" },
  });

  return (
    <div className="flex flex-1 flex-col bg-mist">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <nav className="flex items-center gap-6 text-sm font-medium text-ink">
            <Link href="/admin" className="font-display text-lg font-semibold text-primary">
              Painel admin
            </Link>
            <Link href="/admin/empreendimentos" className="hover:text-accent">
              Empreendimentos
            </Link>
            <Link href="/admin/corretores" className="flex items-center gap-1.5 hover:text-accent">
              Corretores
              {pendentes > 0 && (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-xs font-semibold text-primary">
                  {pendentes}
                </span>
              )}
            </Link>
            <Link href="/admin/configuracoes" className="hover:text-accent">
              Empresa
            </Link>
            <Link href="/admin/administradores" className="hover:text-accent">
              Administradores
            </Link>
            <Link href="/admin/espelho-venda" className="hover:text-accent">
              Espelho de Venda
            </Link>
          </nav>
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
