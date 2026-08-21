import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { licenses, accounts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/adminSession";

async function requireAdmin() {
  const session = await getAdminSession();
  return session.isAdmin === true;
}

// Daftar kata bertema pernikahan/romantis. Dipilih yang: mudah dieja lewat
// telepon/WhatsApp, tidak ambigu bunyinya, dan tidak ada yang mirip satu
// sama lain (mis. tidak ada "MAWAR" sekaligus "MAWARNYA").
const CODE_WORDS = [
  "MELATI", "MAWAR", "ANGGREK", "TULIP", "SERUNI", "KENANGA", "CEMPAKA", "TERATAI",
  "PERMATA", "MUTIARA", "BERLIAN", "ZAMRUD", "SAFIR", "INTAN", "EMAS", "PERAK",
  "CINTA", "KASIH", "SETIA", "BAHAGIA", "HARMONI", "JANJI", "RESTU", "SYUKUR",
  "PELANGI", "MENTARI", "REMBULAN", "BINTANG", "FAJAR", "SENJA", "CAKRAWALA", "SAMUDRA",
  "PUSPA", "SEKAR", "CANDRA", "KIRANA", "LARAS", "GITA", "IRAMA", "SANJUNG",
  "ANGGUN", "JELITA", "PESONA", "AURA", "KEMILAU", "CAHAYA", "SINAR", "KILAU",
  "SUTERA", "BELUDRU", "SATIN", "RENDA", "KEBAYA", "SONGKET", "BATIK", "TENUN",
  "MADU", "GULA", "SANTAN", "VANILA", "KAYU", "CENGKEH", "PANDAN", "KELAPA",
  "ISTANA", "PURI", "TAMAN", "PENDOPO", "BALAI", "PELAMINAN", "SINGGASANA", "MAHLIGAI",
  "MERPATI", "CENDRAWASIH", "KUTILANG", "MURAI", "RAJAWALI", "CAMAR", "KENARI", "PIPIT",
  "SAMUDERA", "TELAGA", "EMBUN", "GERIMIS", "BAYU", "AWAN", "KABUT", "SALJU",
  "MUSIM", "PUSAKA", "WARISAN", "SEJATI", "ABADI", "SELAMANYA", "SEMESTA", "CAKRA",
  "RAGAM", "INDAH", "MOLEK", "AYU", "RUPAWAN", "GEMILANG", "CEMERLANG", "MEGAH",
  "DAMAI", "TENTRAM", "SENTOSA", "MAKMUR", "SEJAHTERA", "BERKAH", "RAHMAT", "ANUGERAH",
  "NUSA", "BANGSA", "PERTIWI", "NIRWANA", "KAYANGAN", "SURGA", "ARUNA", "SASMITA",
  "WIJAYA", "KUSUMA", "PRATAMA", "UTAMA", "PERKASA", "JAYA", "MULIA", "AGUNG",
];

/**
 * Kode lisensi format: EVLX-MELATI-CINTA-2847
 *
 * Dibanding format acak lama (EVLX-GQ27-6VEL), format ini jauh lebih mudah
 * diingat, dieja lewat telepon, dan terasa personal/sesuai tema produk.
 *
 * CATATAN KEAMANAN (trade-off yang disengaja):
 * Format lama punya ~1,1 triliun kemungkinan (32^8). Format ini punya
 * ~164 juta (128 x 128 x 10.000) — memang lebih kecil. Kompensasinya:
 * (1) penyerang tetap harus menebak username yang cocok juga,
 * (2) rate limit per-IP (10 percobaan / 15 menit) DAN per-username
 *     (lihat login route) membuat brute-force tidak praktis.
 * Kalau suatu saat butuh entropi lebih tinggi tanpa mengorbankan
 * keterbacaan, cukup naikkan digit dari 4 ke 6 di bawah.
 *
 * Prefix EVLX dipertahankan supaya kode tetap terlihat sebagai milik
 * EverVow Lux, dan kode-kode LAMA yang sudah beredar tetap valid karena
 * login hanya mencocokkan string persis, tanpa validasi format.
 */
function generateCode(): string {
  const word = () => CODE_WORDS[Math.floor(Math.random() * CODE_WORDS.length)];
  const first = word();
  let second = word();
  // Hindari kata kembar (mis. EVLX-CINTA-CINTA-1234) yang terlihat seperti bug.
  while (second === first) second = word();
  const digits = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `EVLX-${first}-${second}-${digits}`;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: licenses.id,
      code: licenses.code,
      buyerName: licenses.buyerName,
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

  // Generate kode unik, coba ulang kalau tabrakan (sangat jarang terjadi).
  let code = generateCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await db.query.licenses.findFirst({ where: eq(licenses.code, code) });
    if (!existing) break;
    code = generateCode();
  }

  const [created] = await db
    .insert(licenses)
    .values({
      code,
      buyerName,
      orderRef: body.orderRef || null,
      platform: body.platform || null,
      price: body.price ? Number(body.price) : null,
      notes: body.notes || null,
      isActive: true,
    })
    .returning();

  return NextResponse.json({ license: created });
}
