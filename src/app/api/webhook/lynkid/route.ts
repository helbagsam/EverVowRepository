import { NextRequest, NextResponse } from "next/server";
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
 *   - Event: order.paid / order.completed (nama persis bisa beda,
 *     pilih yang berarti "pembayaran sudah lunas")
 *   - Method: POST
 * Lynk.id akan memberi sebuah "Merchant Key" saat webhook disimpan —
 * isi ke env var LYNKID_WEBHOOK_SECRET (di Vercel & .env.local).
 *
 * =========================================================================
 * PENTING — BACA SEBELUM GO-LIVE:
 * Nama field payload & cara verifikasi di bawah ini disusun dari pola umum
 * webhook Lynk.id (integrasi resmi Lynk.id×StarSender memakai variable
 * template {name}, {product_title}, {grand_total}, {ref_id}) — BUKAN dari
 * dokumentasi resmi yang sudah terverifikasi terhadap payload asli.
 *
 * Sebelum dipakai sungguhan:
 * 1. Pasang webhook ini di Lynk.id, lalu pakai fitur "Test Webhook" bawaan
 *    Lynk.id (ada di halaman yang sama tempat kamu pasang URL webhook).
 * 2. Lihat log request yang masuk (Vercel → project → Logs) untuk lihat
 *    payload ASLI yang dikirim Lynk.id.
 * 3. Sesuaikan `extractField()` di bawah kalau nama field/cara verifikasi
 *    beda dari yang diasumsikan di sini.
 * =========================================================================
 */

type JsonPayload = Record<string, unknown>;

function extractField(payload: JsonPayload, paths: string[]): string {
  for (const path of paths) {
    const parts = path.split(".");
    let value: unknown = payload;
    for (const part of parts) {
      if (value && typeof value === "object") {
        value = (value as JsonPayload)[part];
      } else {
        value = undefined;
      }
    }
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

function verifySecret(req: NextRequest, payload: JsonPayload): boolean {
  const expected = process.env.LYNKID_WEBHOOK_SECRET;
  if (!expected) {
    // Belum dikonfigurasi sama sekali — tolak demi keamanan (jangan biarkan
    // endpoint ini terbuka tanpa proteksi apapun di production).
    return false;
  }

  const candidates = [
    req.headers.get("x-lynk-signature"),
    req.headers.get("x-merchant-key"),
    req.headers.get("x-webhook-secret"),
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, ""),
    extractField(payload, ["merchant_key", "secret", "signature", "webhook_secret"]),
  ];

  return candidates.some((c) => c && c === expected);
}

export async function POST(req: NextRequest) {
  let payload: JsonPayload;
  try {
    payload = (await req.json()) as JsonPayload;
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid." }, { status: 400 });
  }

  if (!verifySecret(req, payload)) {
    return NextResponse.json({ error: "Unauthorized — merchant key tidak cocok." }, { status: 401 });
  }

  const buyerName = extractField(payload, ["name", "customer_name", "customer.name", "buyer_name", "full_name"]) || "Pembeli Lynk.id";
  const buyerEmail = extractField(payload, ["email", "customer_email", "customer.email", "buyer_email"]);
  const buyerPhone = extractField(payload, ["phone", "whatsapp", "customer_phone", "customer.phone", "buyer_phone"]);
  const orderRef = extractField(payload, ["ref_id", "order_id", "id", "transaction_id", "invoice_id"]);
  const productTitle = extractField(payload, ["product_title", "product_name", "item_title"]);
  const grandTotalRaw = extractField(payload, ["grand_total", "total", "amount"]);
  const grandTotal = grandTotalRaw ? Number(grandTotalRaw.replace(/[^0-9.-]/g, "")) : null;

  // Idempotensi: webhook bisa terkirim lebih dari sekali untuk order yang
  // sama (retry Lynk.id kalau respons kita bukan 2xx, dsb). Kalau orderRef
  // ini sudah punya lisensi, JANGAN buat lisensi baru / kirim email lagi.
  if (orderRef) {
    const existing = await db.query.licenses.findFirst({ where: eq(licenses.orderRef, orderRef) });
    if (existing) {
      return NextResponse.json({ ok: true, alreadyProcessed: true, code: existing.code });
    }
  }

  // buyerEmail jadi username login pembeli (sama seperti generator manual
  // di /admin) — kalau payload Lynk.id tidak punya email, lisensi tetap
  // dibuat (order tidak boleh hilang) tapi pembeli harus dilayani manual
  // dari /admin karena tidak ada cara aman menetapkan username otomatis.
  let created;
  try {
    created = await createLicenseWithUniqueCode({
      buyerName,
      buyerEmail: buyerEmail || null,
      buyerPhone: buyerPhone || null,
      orderRef: orderRef || null,
      platform: "Lynk.id",
      price: grandTotal,
      notes: productTitle ? `Produk: ${productTitle}` : null,
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
      orderRef,
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
