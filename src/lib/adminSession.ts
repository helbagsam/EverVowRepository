import { cookies } from "next/headers";
import { getIronSession, IronSession, SessionOptions } from "iron-session";

export interface AdminSessionData {
  isAdmin?: boolean;
}

if (!process.env.ADMIN_SESSION_SECRET) {
  throw new Error(
    "ADMIN_SESSION_SECRET belum diset. Isi string acak minimal 32 karakter di .env.local (beda dari SESSION_SECRET pembeli)."
  );
}

export const adminSessionOptions: SessionOptions = {
  password: process.env.ADMIN_SESSION_SECRET,
  cookieName: "evervow_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12, // 12 jam — sesi admin sengaja lebih pendek dari sesi pembeli
  },
};

export async function getAdminSession(): Promise<IronSession<AdminSessionData>> {
  const cookieStore = await cookies();
  return getIronSession<AdminSessionData>(cookieStore, adminSessionOptions);
}
