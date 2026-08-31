import { requireAdminPagina } from "@/lib/dal";

export default async function RevendasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPagina("revendas");
  return <>{children}</>;
}
