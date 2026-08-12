import { requireAdminPagina } from "@/lib/dal";

export default async function EmpreendimentosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPagina("empreendimentos");
  return <>{children}</>;
}
