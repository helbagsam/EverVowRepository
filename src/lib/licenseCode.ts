import { db } from "@/db";
import { licenses } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    .replace(/\p{Diacritic}/gu, "") // lepas diakritik
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
 *
 * SATU logika ini dipakai bersama oleh generator manual (/admin) maupun
 * webhook otomatis (/api/webhook/lynkid) lewat createLicenseWithUniqueCode
 * di bawah — supaya tidak ada 2 implementasi yang bisa diam-diam menyimpang.
 */
export function generateLicenseCode(buyerName: string): string {
  const firstWord = buyerName.trim().split(/\s+/)[0] || "";
  let namePart = slugifyName(firstWord);
  if (namePart.length < 2) {
    // Nama tidak menghasilkan huruf yang cukup — pakai fallback acak.
    namePart = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)];
  }
  const digits = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `EVLX-${namePart}-${digits}`;
}

export interface CreateLicenseInput {
  buyerName: string;
  buyerEmail?: string | null;
  buyerPhone?: string | null;
  orderRef?: string | null;
  platform?: string | null;
  price?: number | null;
  notes?: string | null;
  expiresAt?: Date | null;
  /** Jawaban "Question for Customer" dari checkout Lynk.id, sudah dinormalkan. */
  checkoutAnswers?: Record<string, unknown> | null;
}

export class LicenseCodeCollisionError extends Error {
  constructor() {
    super("Gagal membuat kode unik setelah beberapa percobaan.");
    this.name = "LicenseCodeCollisionError";
  }
}

/**
 * Insert lisensi baru dengan kode unik (retry kalau tabrakan, sangat jarang
 * terjadi). Kalau 5 percobaan tetap tabrakan, lempar
 * LicenseCodeCollisionError daripada insert buta yang akan gagal dengan
 * raw DB unique-constraint error.
 */
export async function createLicenseWithUniqueCode(input: CreateLicenseInput) {
  let code = generateLicenseCode(input.buyerName);
  let unique = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await db.query.licenses.findFirst({ where: eq(licenses.code, code) });
    if (!existing) {
      unique = true;
      break;
    }
    code = generateLicenseCode(input.buyerName);
  }

  if (!unique) {
    throw new LicenseCodeCollisionError();
  }

  const [created] = await db
    .insert(licenses)
    .values({
      code,
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail?.trim().toLowerCase() || null,
      buyerPhone: input.buyerPhone?.trim() || null,
      orderRef: input.orderRef || null,
      platform: input.platform || null,
      price: input.price ?? null,
      notes: input.notes || null,
      isActive: true,
      expiresAt: input.expiresAt ?? null,
      checkoutAnswers: input.checkoutAnswers ?? null,
    })
    .returning();

  return created;
}
