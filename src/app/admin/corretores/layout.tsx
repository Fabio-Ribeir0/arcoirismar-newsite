import { requireAdminPagina } from "@/lib/dal";

export default async function CorretoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPagina("corretores");
  return <>{children}</>;
}
