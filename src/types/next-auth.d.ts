import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "ADMIN" | "CORRETOR";
    paginasPermitidas: string[];
  }

  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CORRETOR";
      paginasPermitidas: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "CORRETOR";
    paginasPermitidas: string[];
  }
}
