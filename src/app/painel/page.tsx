import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function PainelPage() {
  const session = await auth();

  if (session?.user.role === "ADMIN") redirect("/admin");
  if (session?.user.role === "CORRETOR") redirect("/corretores");

  redirect("/login");
}
