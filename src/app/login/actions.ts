"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export type LoginState = { error?: string } | undefined;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/painel",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          "E-mail ou senha inválidos, ou cadastro de corretor ainda aguardando aprovação.",
      };
    }
    throw error;
  }
}
