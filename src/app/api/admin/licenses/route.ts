import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { licenses, accounts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/adminSession";

async function requireAdmin() {
  const session = await getAdminSession();
  return session.isAdmin === true;
}

// Fallback kalau nama pembeli tidak menghasilkan huruf sama sekali setelah
// disaring (mis. nama cuma berisi emoji/simbol) — sangat jarang, tapi kode
// tetap harus valid dan tidak kosong.
const FALLBACK_WORDS = ["MELATI", "MAWAR", "PERMATA", "CINTA", "BERKAH", "PELANGI", "ISTANA", "KUSUMA"];

/**
 * Ambil bagian yang bisa dipakai sebagai kode dari nama pembeli:
 * huruf A-Z saja (tanda baca, spasi, angka, emoji dibuang), diakritik
 * dilepas (é -> e), diseragamkan huruf besar, dibatasi 14 karakter supaya
 * kode tidak jadi panjang sekali untuk nama seperti "PT Wedding Organizer
 * Sejahtera Abadi".
 */
function slugifyName(name: string): string {
  const cleaned = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // lepas diakritik
    .toUpperCase()
    .replace(/[^A-Z]/g, ""); // sisakan huruf saja
  return cleaned.slice(0, 14);
}

/**
 * Kode lisensi format: EVLX-BUDI-2847
 *
 * Dibangun dari nama pembeli asli (bukan kata acak) supaya kode terasa
 * personal dan lebih mudah dikonfirmasi pembeli ("oh iya ini nama saya").
 * Kalau nama berisi beberapa kata (mis. "Budi & Siti"), dipakai kata
 * PERTAMA saja supaya kode tetap ringkas.
 *
 * CATATAN KEAMANAN: karena bagian nama bisa ditebak (nama pembeli kadang
 * publik), jangan andalkan kode ini sendirian sebagai satu-satunya lapis
 * keamanan — pastikan rate limiting di login route (per-IP DAN
 * per-username) tetap aktif. 4 digit acak di akhir + rate limit membuat
 * brute-force tetap tidak praktis.
 */
function generateCode(buyerName: string): string {
  const firstWord = buyerName.trim().split(/\s+/)[0] || "";
  let namePart = slugifyName(firstWord);
  if (namePart.length < 2) {
    // Nama tidak menghasilkan huruf yang cukup — pakai fallback acak.
    namePart = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)];
  }
  const digits = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `EVLX-${namePart}-${digits}`;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: licenses.id,
      code: licenses.code,
      buyerName: licenses.buyerName,
      buyerEmail: licenses.buyerEmail,
      orderRef: licenses.orderRef,
      platform: licenses.platform,
      price: licenses.price,
      notes: licenses.notes,
      isActive: licenses.isActive,
      createdAt: licenses.createdAt,
      activatedAt: licenses.activatedAt,
      username: accounts.username,
    })
    .from(licenses)
    .leftJoin(accounts, eq(accounts.licenseId, licenses.id))
    .orderBy(desc(licenses.createdAt));

  return NextResponse.json({ licenses: rows });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const buyerName = String(body.buyerName || "").trim();
  if (!buyerName) {
    return NextResponse.json({ error: "Nama pembeli wajib diisi." }, { status: 400 });
  }

  // Email WAJIB diisi untuk lisensi baru — ini yang akan jadi username
  // login pembeli (lihat login route). Lisensi lama tanpa email tetap
  // valid (kolom nullable di DB), tapi semua lisensi BARU harus punya ini.
  const buyerEmail = String(body.buyerEmail || "").trim().toLowerCase();
  if (!buyerEmail) {
    return NextResponse.json({ error: "Email pembeli wajib diisi." }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(buyerEmail)) {
    return NextResponse.json({ error: "Format email pembeli tidak valid." }, { status: 400 });
  }

  // Generate kode unik, coba ulang kalau tabrakan (sangat jarang terjadi).
  let code = generateCode(buyerName);
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await db.query.licenses.findFirst({ where: eq(licenses.code, code) });
    if (!existing) break;
    code = generateCode(buyerName);
  }

  const [created] = await db
    .insert(licenses)
    .values({
      code,
      buyerName,
      buyerEmail,
      orderRef: body.orderRef || null,
      platform: body.platform || null,
      price: body.price ? Number(body.price) : null,
      notes: body.notes || null,
      isActive: true,
    })
    .returning();

  return NextResponse.json({ license: created });
}
