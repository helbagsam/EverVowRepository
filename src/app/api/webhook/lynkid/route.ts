import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/db";
import { licenses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createLicenseWithUniqueCode, LicenseCodeCollisionError } from "@/lib/licenseCode";
import { sendLicenseEmail } from "@/lib/notify";

/**
 * Webhook penerima notifikasi "pembayaran sukses" dari Lynk.id.
 *
 * Setup di Lynk.id: Settings → Integrations → Webhooks →
 *   - URL: https://<domain-kamu>/api/webhook/lynkid
 *   - Merchant Key muncul setelah URL disimpan — isi persis ke
 *     LYNKID_WEBHOOK_SECRET (di Vercel & .env.local).
 *
 * Payload & skema autentikasi diverifikasi langsung dari dokumentasi resmi
 * Lynk.id (Postman collection, tautan "See Webhook Documentations" di
 * halaman setting webhook Lynk.id) — bukan tebakan:
 *
 * - Event yang relevan: "payment.received".
 * - Header X-Lynk-Signature berisi SHA256 hex dari
 *   `grandTotal + refId + message_id + merchantKey` (string concat, bukan
 *   dipisah delimiter apapun).
 * - refId, message_id, dan totals.grandTotal ada di dalam data.message_data.
 * - Info pembeli ada di data.message_data.customer (email, name, phone).
 *
 * Lynk.id juga mengirim event lain lewat tombol "Test URL" di dashboard
 * mereka ({"event":"test_event",...}) TANPA X-Lynk-Signature sama sekali —
 * itu murni ping konektivitas, bukan payload yang perlu diautentikasi.
 * Endpoint ini membalas 200 untuk event non-"payment.received" tanpa
 * memproses apa pun, supaya tombol Test URL Lynk.id berhasil; validasi
 * signature SHA256 di atas tetap wajib & ketat untuk "payment.received".
 */

type JsonPayload = Record<string, unknown>;

function getPath(payload: JsonPayload, path: string[]): unknown {
  let value: unknown = payload;
  for (const part of path) {
    if (value && typeof value === "object") {
      value = (value as JsonPayload)[part];
    } else {
      return undefined;
    }
  }
  return value;
}

function asString(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

/**
 * Judul pertanyaan yang dipasang di Lynk.id (Product → Question for Customer).
 * Pencocokan sengaja longgar — dicocokkan dengan huruf kecil tanpa spasi —
 * supaya jawaban tetap terbaca kalau nanti judulnya diedit sedikit di
 * dashboard Lynk.id (mis. menambah tanda tanya atau mengubah kapitalisasi).
 * Kalau judulnya diubah total, jawabannya cuma tidak terpakai untuk mengisi
 * dashboard — lisensi tetap dibuat, tidak ada order yang hilang.
 */
const QUESTION_KEYS = {
  brideName: ["namamempelaiwanita", "namacalonistri", "namapengantinwanita"],
  groomName: ["namamempelaipria", "namacalonsuami", "namapengantinpria"],
  weddingDate: ["tanggalpernikahan", "tanggalnikah", "rencanatanggalpernikahan"],
  totalBudget: ["estimasibudget", "perkiraanbudget", "estimasianggaran"],
} as const;

function normalizeKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** "12 Juni 2027", "2027-06-12", "12/06/2027" → "2027-06-12"; gagal → "". */
function parseWeddingDate(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return trimmed;

  const dmy = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const MONTHS: Record<string, string> = {
    januari: "01", februari: "02", maret: "03", april: "04", mei: "05", juni: "06",
    juli: "07", agustus: "08", september: "09", oktober: "10", november: "11", desember: "12",
    january: "01", february: "02", march: "03", may: "05", june: "06", july: "07",
    august: "08", october: "10", december: "12",
  };
  const named = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (named) {
    const month = MONTHS[named[2].toLowerCase()];
    if (month) return `${named[3]}-${month}-${named[1].padStart(2, "0")}`;
  }

  return "";
}

/** "Rp 150.000.000" / "150jt" / "150000000" → 150000000; gagal → null. */
function parseBudget(raw: string): number | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;

  const digitsOnly = trimmed.replace(/[^0-9]/g, "");
  if (!digitsOnly) return null;
  let value = Number(digitsOnly);
  if (!Number.isFinite(value) || value <= 0) return null;

  // Tangani singkatan yang lazim ditulis orang: "150jt", "1,5 M".
  if (/\b(jt|juta)\b/.test(trimmed) && value < 1_000_000) value *= 1_000_000;
  else if (/\b(m|milyar|miliar)\b/.test(trimmed) && value < 1_000_000_000) value *= 1_000_000_000;

  return value;
}

/**
 * Kumpulkan jawaban "Question for Customer" dari seluruh item di keranjang.
 * Lynk.id mengirimnya sebagai STRING JSON di items[].questions, dengan judul
 * pertanyaan sebagai key.
 */
function extractCheckoutAnswers(messageData: JsonPayload | undefined): Record<string, unknown> {
  const items = messageData?.items;
  if (!Array.isArray(items)) return {};

  const merged: Record<string, string> = {};
  for (const item of items) {
    const raw = (item as JsonPayload)?.questions;
    if (typeof raw !== "string" || !raw.trim()) continue;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      for (const [question, answer] of Object.entries(parsed)) {
        const value = asString(answer);
        if (value) merged[normalizeKey(question)] = value;
      }
    } catch {
      // Jawaban tidak bisa diparse — abaikan saja, jangan gagalkan webhook.
      // Lisensi jauh lebih penting daripada isian awal dashboard.
    }
  }

  const pick = (candidates: readonly string[]): string => {
    for (const key of candidates) {
      if (merged[key]) return merged[key];
    }
    return "";
  };

  const answers: Record<string, unknown> = {};
  const bride = pick(QUESTION_KEYS.brideName);
  const groom = pick(QUESTION_KEYS.groomName);
  const date = parseWeddingDate(pick(QUESTION_KEYS.weddingDate));
  const budget = parseBudget(pick(QUESTION_KEYS.totalBudget));

  if (bride) answers.brideName = bride;
  if (groom) answers.groomName = groom;
  if (date) answers.weddingDate = date;
  if (budget !== null) answers.totalBudget = budget;

  // Simpan juga jawaban mentahnya — kalau nanti judul pertanyaan diubah dan
  // pencocokan di atas meleset, datanya tidak hilang dan masih bisa dilihat.
  if (Object.keys(merged).length) answers._raw = merged;

  return answers;
}

function verifySignature(req: NextRequest, refId: string, grandTotal: string, messageId: string): boolean {
  const secret = process.env.LYNKID_WEBHOOK_SECRET;
  if (!secret) {
    // Belum dikonfigurasi sama sekali — tolak demi keamanan (jangan biarkan
    // endpoint ini terbuka tanpa proteksi apapun di production).
    return false;
  }

  const signature = req.headers.get("x-lynk-signature");
  if (!signature) return false;

  const expected = createHash("sha256").update(grandTotal + refId + messageId + secret).digest("hex");
  return signature === expected;
}

export async function POST(req: NextRequest) {
  let payload: JsonPayload;
  try {
    payload = (await req.json()) as JsonPayload;
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid." }, { status: 400 });
  }

  const event = asString(payload.event);

  // Ping konektivitas dari tombol "Test URL" Lynk.id (event lain selain
  // payment.received) — tidak bawa signature, tidak perlu diproses.
  if (event !== "payment.received") {
    return NextResponse.json({ ok: true, ignored: true, event });
  }

  const messageData = getPath(payload, ["data", "message_data"]) as JsonPayload | undefined;
  const refId = asString(messageData?.refId);
  const messageId = asString(messageData?.message_id);
  const grandTotalRaw = getPath(messageData ?? {}, ["totals", "grandTotal"]);
  const grandTotal = asString(grandTotalRaw);

  if (!verifySignature(req, refId, grandTotal, messageId)) {
    return NextResponse.json({ error: "Unauthorized — signature tidak cocok." }, { status: 401 });
  }

  const buyerName = asString(getPath(messageData ?? {}, ["customer", "name"])) || "Pembeli Lynk.id";
  const buyerEmail = asString(getPath(messageData ?? {}, ["customer", "email"]));
  const buyerPhone = asString(getPath(messageData ?? {}, ["customer", "phone"]));
  const grandTotalNumber = grandTotalRaw !== undefined ? Number(grandTotalRaw) : null;

  // Jawaban pertanyaan checkout → dipakai sekali saat aktivasi untuk mengisi
  // dashboard, supaya pembeli tidak disambut form kosong.
  const checkoutAnswers = extractCheckoutAnswers(messageData);
  if (buyerEmail) checkoutAnswers.contactEmail = buyerEmail;
  if (buyerPhone) checkoutAnswers.contactPhone = buyerPhone;

  // Idempotensi: webhook bisa terkirim lebih dari sekali untuk order yang
  // sama (retry Lynk.id kalau respons kita bukan 2xx, dsb). Kalau refId
  // ini sudah punya lisensi, JANGAN buat lisensi baru / kirim email lagi.
  if (refId) {
    const existing = await db.query.licenses.findFirst({ where: eq(licenses.orderRef, refId) });
    if (existing) {
      return NextResponse.json({ ok: true, alreadyProcessed: true, code: existing.code });
    }
  }

  let created;
  try {
    created = await createLicenseWithUniqueCode({
      buyerName,
      buyerEmail: buyerEmail || null,
      buyerPhone: buyerPhone || null,
      orderRef: refId || null,
      platform: "Lynk.id",
      price: grandTotalNumber !== null && Number.isFinite(grandTotalNumber) ? grandTotalNumber : null,
      notes: null,
      checkoutAnswers: Object.keys(checkoutAnswers).length ? checkoutAnswers : null,
    });
  } catch (err) {
    if (err instanceof LicenseCodeCollisionError) {
      return NextResponse.json({ error: "Gagal membuat kode unik, Lynk.id akan retry webhook ini." }, { status: 500 });
    }
    throw err;
  }

  let emailResult: { ok: boolean; error?: string } = { ok: false, error: "Tidak ada email pembeli di payload." };
  if (buyerEmail) {
    emailResult = await sendLicenseEmail({ to: buyerEmail, buyerName, code: created.code });
  }

  if (!emailResult.ok) {
    // Lisensinya SUDAH dibuat (bagian terpenting — order tetap terpenuhi).
    // Gagal kirim email cuma dicatat di log; pembeli masih bisa dilayani
    // manual dari /admin, atau lewat /claim kalau emailnya sempat kecatat
    // tapi pengiriman yang gagal (mis. quota Resend habis).
    console.error("[webhook/lynkid] Lisensi dibuat tapi email gagal dikirim:", {
      refId,
      buyerEmail,
      error: emailResult.error,
    });
  }

  return NextResponse.json({
    ok: true,
    code: created.code,
    emailSent: emailResult.ok,
  });
}
