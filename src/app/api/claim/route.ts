import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { licenses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getSession } from "@/lib/session";
import {
  activateLicense,
  EmailMismatchError,
  LicenseExpiredError,
  LicenseInactiveError,
  UsernameTakenError,
} from "@/lib/activateLicense";

/**
 * Jalur masuk UTAMA untuk pembeli dari Lynk.id.
 *
 * URL halaman ini yang dipasang sebagai "isi produk" di Lynk.id, sehingga
 * Lynk.id mengirimkannya otomatis ke pembeli lewat email & WhatsApp mereka
 * sendiri. Pembeli membuktikan diri dengan No. Order + email pembelian —
 * keduanya tercetak di pesan yang sama yang baru mereka terima — lalu
 * LANGSUNG masuk ke dashboard tanpa pernah menyalin kode lisensi.
 *
 * Kenapa butuh DUA data, bukan email saja: kalau cukup email, siapa pun yang
 * menebak email pembeli bisa mengambil alih akun mereka. No. Order adalah
 * rahasia bersama yang cuma dimiliki pembeli asli.
 *
 * Kode lisensi tetap dikembalikan supaya pembeli bisa menyimpannya untuk
 * masuk dari perangkat lain lewat /login — tapi jalur normal tidak
 * mengharuskan mereka menyentuhnya sama sekali.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  // Ambang per-IP longgar — lihat catatan yang sama di /api/auth/login.
  // Ini jalur MASUK UTAMA pembeli (dari link Lynk.id), jadi risiko CGNAT
  // operator seluler membuat pembeli tak bersalah saling mengunci di sini
  // justru lebih berbahaya daripada di /login. Perlindungan brute-force
  // yang berarti ada di rate limit per-No.-Order (claim-ref) di bawah.
  const rateLimit = await checkRateLimit(`claim:${ip}`, { maxAttempts: 30, windowMinutes: 15 });
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

  // Rate limit KEDUA, di-key pada No. Order. Yang di atas bisa dilewati
  // penyerang yang merotasi IP; kunci ini menahan tebakan email terhadap
  // satu order tertentu berapa pun jumlah IP yang dipakai.
  const refLimit = await checkRateLimit(`claim-ref:${normalizedRef}`, {
    maxAttempts: 10,
    windowMinutes: 15,
  });
  if (refLimit.blocked) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan untuk order ini. Coba lagi dalam beberapa menit." },
      { status: 429 }
    );
  }

  const license = await db.query.licenses.findFirst({
    where: eq(licenses.orderRef, normalizedRef),
  });

  // Pesan sengaja disamakan untuk "order tidak ada" dan "email tidak cocok",
  // supaya endpoint ini tidak bisa dipakai memastikan sebuah No. Order valid.
  if (!license || !license.buyerEmail || license.buyerEmail.toLowerCase() !== normalizedEmail) {
    return NextResponse.json(
      { error: "Data tidak ditemukan. Pastikan No. Order dan email sama persis dengan saat pembelian." },
      { status: 404 }
    );
  }

  try {
    const account = await activateLicense(license, normalizedEmail);

    const session = await getSession();
    session.accountId = account.id;
    session.username = account.username;
    await session.save();

    return NextResponse.json({
      ok: true,
      code: license.code,
      username: account.username,
      // Sinyal untuk halaman /claim: aman langsung mengarahkan ke dashboard.
      loggedIn: true,
    });
  } catch (err) {
    if (err instanceof LicenseInactiveError) {
      return NextResponse.json({ error: "Lisensi ini sudah dinonaktifkan. Hubungi admin." }, { status: 403 });
    }
    if (err instanceof LicenseExpiredError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (err instanceof EmailMismatchError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (err instanceof UsernameTakenError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
