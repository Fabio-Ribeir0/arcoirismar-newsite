import { requireAdminPagina } from "@/lib/dal";

export default async function ConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPagina("configuracoes");
  return <>{children}</>;
}
