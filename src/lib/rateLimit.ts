import { db } from "@/db";
import { loginAttempts } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

/**
 * Ambil IP client dari header (Vercel selalu mengisi x-forwarded-for).
 * Fallback ke "unknown" kalau tidak ada (mis. saat testing lokal).
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Cek + catat percobaan login. Mengembalikan { blocked: true } kalau
 * sudah melewati batas percobaan dalam jendela waktu tertentu.
 *
 * Dicatat ke DB (bukan memory) supaya rate-limit tetap berlaku walau
 * serverless function di-restart / cold start di request berikutnya.
 */
export async function checkRateLimit(
  key: string,
  opts: { maxAttempts?: number; windowMinutes?: number } = {}
): Promise<{ blocked: boolean; remainingSeconds?: number }> {
  const maxAttempts = opts.maxAttempts ?? 8;
  const windowMinutes = opts.windowMinutes ?? 15;
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

  const recentAttempts = await db
    .select({ count: sql<number>`count(*)` })
    .from(loginAttempts)
    .where(and(eq(loginAttempts.attemptKey, key), gte(loginAttempts.createdAt, windowStart)));

  const count = Number(recentAttempts[0]?.count ?? 0);

  if (count >= maxAttempts) {
    return { blocked: true, remainingSeconds: windowMinutes * 60 };
  }

  // Catat percobaan ini (dipanggil SEBELUM memvalidasi kredensial, supaya
  // percobaan yang gagal maupun berhasil tetap terhitung — mencegah bypass).
  await db.insert(loginAttempts).values({ attemptKey: key });

  return { blocked: false };
}
