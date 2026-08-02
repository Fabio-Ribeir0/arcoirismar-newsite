import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Optimistic role-based redirects, read only from the session cookie/JWT.
// The authoritative check happens server-side in each protected layout/page (see src/lib/dal.ts).
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  const isAdminRoute = pathname.startsWith("/admin");
  const isCorretorRoute = pathname.startsWith("/corretores") && !pathname.startsWith("/corretores/cadastro");

  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (isCorretorRoute && role !== "CORRETOR") {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/corretores/:path*"],
};
