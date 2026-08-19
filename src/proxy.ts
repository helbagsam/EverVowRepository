import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { adminSessionOptions, AdminSessionData } from "@/lib/adminSession";

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/admin/:path*"],
};

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;

  // --- Rute Admin (sesi & login TERPISAH dari pembeli) ---
  if (path.startsWith("/admin")) {
    const adminSession = await getIronSession<AdminSessionData>(req, res, adminSessionOptions);
    const isAdminLoggedIn = Boolean(adminSession.isAdmin);
    const isAdminLoginPage = path.startsWith("/admin/login");

    if (!isAdminLoggedIn && !isAdminLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (isAdminLoggedIn && isAdminLoginPage) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return res;
  }

  // --- Rute Pembeli ---
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  const isLoggedIn = Boolean(session.accountId);
  const isLoginPage = path.startsWith("/login");

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}
