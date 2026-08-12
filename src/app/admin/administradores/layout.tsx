import { requireAdminPagina } from "@/lib/dal";

export default async function AdministradoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPagina("administradores");
  return <>{children}</>;
}
