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
  const messageId = asString(getPath(payload, ["data", "message_id"]));
  const grandTotalRaw = getPath(messageData ?? {}, ["totals", "grandTotal"]);
  const grandTotal = asString(grandTotalRaw);

  if (!verifySignature(req, refId, grandTotal, messageId)) {
    return NextResponse.json({ error: "Unauthorized — signature tidak cocok." }, { status: 401 });
  }

  const buyerName = asString(getPath(messageData ?? {}, ["customer", "name"])) || "Pembeli Lynk.id";
  const buyerEmail = asString(getPath(messageData ?? {}, ["customer", "email"]));
  const buyerPhone = asString(getPath(messageData ?? {}, ["customer", "phone"]));
  const grandTotalNumber = grandTotalRaw !== undefined ? Number(grandTotalRaw) : null;

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
