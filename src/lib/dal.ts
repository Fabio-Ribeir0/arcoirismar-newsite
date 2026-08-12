import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { PaginaAdmin } from "./admin-paginas";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }
  return session.user;
}

/** Além de exigir ADMIN, checa se este admin tem a página específica liberada. */
export async function requireAdminPagina(pagina: PaginaAdmin) {
  const user = await requireAdmin();
  if (!user.paginasPermitidas.includes(pagina)) {
    redirect("/admin");
  }
  return user;
}

export async function requireCorretor() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CORRETOR") {
    redirect("/login");
  }
  return session.user;
}
