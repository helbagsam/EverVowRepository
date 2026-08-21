import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { licenses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * Jalur "klaim ulang" kode lisensi — jaring pengaman kalau email otomatis
 * dari webhook Lynk.id gagal terkirim / masuk spam. Pembeli masukkan No.
 * Order (ref_id dari Lynk.id) + email yang dipakai saat beli; kalau cocok,
 * kode lisensinya ditampilkan lagi.
 *
 * Sengaja butuh KEDUA data itu (bukan cuma salah satu) + rate limit, supaya
 * tidak bisa dipakai untuk menebak-nebak/mengambil kode milik orang lain.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(`claim:${ip}`, { maxAttempts: 10, windowMinutes: 15 });
  if (rateLimit.blocked) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi dalam beberapa menit." },
      { status: 429 }
    );
  }

  const { orderRef, email } = await req.json();
  const normalizedRef = String(orderRef || "").trim();
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedRef || !normalizedEmail) {
    return NextResponse.json({ error: "No. Order dan email wajib diisi." }, { status: 400 });
  }

  const license = await db.query.licenses.findFirst({ where: eq(licenses.orderRef, normalizedRef) });

  if (!license || !license.buyerEmail || license.buyerEmail.toLowerCase() !== normalizedEmail) {
    return NextResponse.json(
      { error: "Data tidak ditemukan. Pastikan No. Order dan email sama persis dengan saat pembelian." },
      { status: 404 }
    );
  }

  if (!license.isActive) {
    return NextResponse.json({ error: "Lisensi ini sudah dinonaktifkan. Hubungi admin." }, { status: 403 });
  }

  return NextResponse.json({ code: license.code });
}
