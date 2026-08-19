import { cookies } from "next/headers";
import { getIronSession, IronSession, SessionOptions } from "iron-session";

export interface SessionData {
  accountId?: string;
  username?: string;
}

if (!process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET belum diset. Isi string acak minimal 32 karakter di .env.local."
  );
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "evervow_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 hari
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
