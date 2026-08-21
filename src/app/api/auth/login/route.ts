import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { licenses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import {
  activateLicense,
  EmailMismatchError,
  LicenseExpiredError,
  LicenseInactiveError,
  UsernameTakenError,
} from "@/lib/activateLicense";

/**
 * Jalur masuk manual: pembeli mengetik email + kode lisensi sendiri.
 *
 * Jalur normal pembeli baru dari Lynk.id BUKAN di sini — mereka lewat
 * /claim yang memasukkan mereka tanpa mengetik kode. Endpoint ini untuk
 * masuk lagi dari perangkat lain, atau untuk lisensi yang dibuat manual
 * lewat /admin (penjualan di luar Lynk.id).
 *
 * Aturan aktivasi (kadaluarsa, email harus cocok, satu lisensi satu akun)
 * hidup di lib/activateLicense.ts dan dipakai bersama dengan /claim.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  // Ambang per-IP sengaja jauh lebih longgar daripada per-akun di bawah.
  // Operator seluler Indonesia umumnya pakai CGNAT — ratusan pembeli tak
  // saling kenal bisa tampil sebagai SATU alamat IP di mata server ini.
  // Kalau ambang ini seketat per-akun, satu pembeli yang salah ketik
  // berkali-kali bisa ikut mengunci pembeli lain di operator yang sama.
  // Perlindungan utama terhadap brute-force tetap di rate limit per-akun
  // (login-user di bawah), yang tidak punya masalah berbagi IP ini.
  const rateLimit = await checkRateLimit(`login:${ip}`, { maxAttempts: 30, windowMinutes: 15 });
  if (rateLimit.blocked) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan login. Coba lagi dalam beberapa menit." },
      { status: 429 }
    );
  }

  const { username, code } = await req.json();

  if (!username?.trim() || !code?.trim()) {
    return NextResponse.json(
      { error: "Username dan kode lisensi wajib diisi." },
      { status: 400 }
    );
  }

  const normalizedUsername = String(username).trim().toLowerCase();
  const normalizedCode = String(code).trim().toUpperCase();

  // Rate limit KEDUA, di-key pada username (bukan IP). Rate limit per-IP di
  // atas bisa dilewati penyerang yang merotasi IP; kunci per-username ini
  // membuat brute-force terhadap satu akun tertentu tetap terhambat berapa
  // pun jumlah IP yang dipakai. Penting karena kode lisensi memakai format
  // berbasis nama yang entropinya lebih rendah dari format acak.
  const userRateLimit = await checkRateLimit(`login-user:${normalizedUsername}`, {
    maxAttempts: 10,
    windowMinutes: 15,
  });
  if (userRateLimit.blocked) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan login untuk akun ini. Coba lagi dalam beberapa menit." },
      { status: 429 }
    );
  }

  const license = await db.query.licenses.findFirst({
    where: eq(licenses.code, normalizedCode),
  });

  if (!license) {
    return NextResponse.json(
      { error: "Kode lisensi tidak valid atau sudah tidak aktif." },
      { status: 401 }
    );
  }

  try {
    const account = await activateLicense(license, normalizedUsername);

    const session = await getSession();
    session.accountId = account.id;
    session.username = account.username;
    await session.save();

    return NextResponse.json({ ok: true, username: account.username });
  } catch (err) {
    if (err instanceof LicenseInactiveError || err instanceof LicenseExpiredError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof EmailMismatchError) {
      return NextResponse.json(
        { error: "Username/email tidak cocok dengan kode lisensi ini." },
        { status: 401 }
      );
    }
    if (err instanceof UsernameTakenError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
