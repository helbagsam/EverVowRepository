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

  const license = await db.query.licenses.findFirst({
    where: eq(licenses.code, normalizedCode),
  });

  if (!license || !license.isActive) {
    return NextResponse.json(
      { error: "Kode lisensi tidak valid atau sudah tidak aktif." },
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
        { error: "Username tidak cocok dengan kode lisensi ini." },
        { status: 401 }
      );
    }
  } else {
    // Aktivasi pertama kali: pastikan username belum dipakai akun lain.
    const usernameTaken = await db.query.accounts.findFirst({
      where: eq(accounts.username, normalizedUsername),
    });
    if (usernameTaken) {
      return NextResponse.json(
        { error: "Username sudah dipakai. Pilih username lain." },
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
