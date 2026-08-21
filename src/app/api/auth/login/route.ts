import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { accounts, licenses, weddingState } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { emptyWeddingState } from "@/lib/defaultState";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(`login:${ip}`, { maxAttempts: 10, windowMinutes: 15 });
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
  // pun jumlah IP yang dipakai. Penting karena kode lisensi kini memakai
  // format berbasis kata yang lebih mudah diingat (entropi lebih rendah
  // dari format acak lama).
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

  if (!license || !license.isActive) {
    return NextResponse.json(
      { error: "Kode lisensi tidak valid atau sudah tidak aktif." },
      { status: 401 }
    );
  }

  if (license.expiresAt && license.expiresAt.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "Kode lisensi sudah kadaluarsa. Hubungi penjual untuk perpanjangan." },
      { status: 401 }
    );
  }

  // Cari akun yang sudah pernah dibuat untuk lisensi ini.
  let account = await db.query.accounts.findFirst({
    where: eq(accounts.licenseId, license.id),
  });

  if (account) {
    // Lisensi sudah pernah dipakai — username harus cocok.
    if (account.username !== normalizedUsername) {
      return NextResponse.json(
        { error: "Username/email tidak cocok dengan kode lisensi ini." },
        { status: 401 }
      );
    }
  } else {
    // Aktivasi pertama kali.
    //
    // Lisensi BARU (punya buyerEmail): username WAJIB persis sama dengan
    // email yang dicatat admin saat lisensi dibuat — ini jadi lapis
    // verifikasi tambahan ("benar pembeli yang sah") sekaligus bikin
    // username otomatis konsisten (selalu email, bukan bebas ketik).
    //
    // Lisensi LAMA (buyerEmail kosong, dibuat sebelum kolom ini ada):
    // tetap pakai perilaku lama — username bebas asal belum dipakai akun
    // lain — supaya kode yang sudah beredar ke pembeli lama tidak rusak.
    if (license.buyerEmail && license.buyerEmail.toLowerCase() !== normalizedUsername) {
      return NextResponse.json(
        { error: "Email tidak cocok dengan kode lisensi ini. Gunakan email yang sama dengan saat pembelian." },
        { status: 401 }
      );
    }

    const usernameTaken = await db.query.accounts.findFirst({
      where: eq(accounts.username, normalizedUsername),
    });
    if (usernameTaken) {
      return NextResponse.json(
        { error: license.buyerEmail ? "Email ini sudah terdaftar pada akun lain." : "Username sudah dipakai. Pilih username lain." },
        { status: 409 }
      );
    }

    const [created] = await db
      .insert(accounts)
      .values({ username: normalizedUsername, licenseId: license.id })
      .returning();
    account = created;

    // Inisialisasi state KOSONG untuk akun baru — bukan data demo.
    await db.insert(weddingState).values({
      accountId: account.id,
      state: emptyWeddingState(),
    });

    await db
      .update(licenses)
      .set({ activatedAt: new Date() })
      .where(eq(licenses.id, license.id));
  }

  await db
    .update(accounts)
    .set({ lastLoginAt: new Date() })
    .where(eq(accounts.id, account.id));

  const session = await getSession();
  session.accountId = account.id;
  session.username = account.username;
  await session.save();

  return NextResponse.json({ ok: true, username: account.username });
}
