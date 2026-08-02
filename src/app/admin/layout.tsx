import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

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
