import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }
  return session.user;
}

export async function requireCorretor() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CORRETOR") {
    redirect("/login");
  }
  return session.user;
}
