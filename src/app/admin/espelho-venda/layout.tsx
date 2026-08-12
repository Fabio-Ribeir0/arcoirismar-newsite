import { requireAdminPagina } from "@/lib/dal";

export default async function EspelhoVendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPagina("espelho-venda");
  return <>{children}</>;
}
