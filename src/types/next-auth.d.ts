import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "ADMIN" | "CORRETOR";
  }

  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CORRETOR";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "CORRETOR";
  }
}
