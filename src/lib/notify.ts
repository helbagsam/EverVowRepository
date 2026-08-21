import { Resend } from "resend";

/**
 * Pengiriman email otomatis (kode lisensi ke pembeli setelah webhook
 * Lynk.id diterima). Pakai Resend (resend.com) — ada free tier (100
 * email/hari, 3000/bulan), setup-nya cuma butuh 1 API key.
 *
 * Kalau RESEND_API_KEY belum diset, fungsi ini TIDAK melempar error —
 * cuma mengembalikan { ok: false } supaya endpoint webhook tetap bisa
 * membuat lisensinya (data pembeli tidak hilang), pembeli tinggal
 * dilayani manual/lewat /claim sementara kamu setup Resend-nya.
 */
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendLicenseEmail(opts: {
  to: string;
  buyerName: string;
  code: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY belum diset di environment variables." };
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  const loginUrl = appUrl ? `${appUrl}/login` : "/login";

  try {
    const result = await resend.emails.send({
      from: process.env.NOTIFY_FROM_EMAIL || "EverVow Lux <onboarding@resend.dev>",
      to: opts.to,
      subject: "Kode Lisensi EverVow Lux Kamu 💍",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #2d2d2d;">
          <h2 style="color: #b5495b;">Terima kasih, ${escapeHtml(opts.buyerName)}! 🎉</h2>
          <p>Pembayaran kamu untuk <strong>EverVow Lux</strong> sudah kami terima. Berikut kode lisensi kamu:</p>
          <div style="background: #fdf2f4; border: 1px solid #f0d5da; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-family: monospace; font-size: 20px; font-weight: bold; letter-spacing: 1px; color: #b5495b;">${escapeHtml(opts.code)}</span>
          </div>
          <p><strong>Cara masuk:</strong></p>
          <ol>
            <li>Buka <a href="${loginUrl}">${loginUrl}</a></li>
            <li>Isi Email — HARUS persis sama dengan email ini (${escapeHtml(opts.to)})</li>
            <li>Isi Kode Lisensi di atas</li>
            <li>Klik "Masuk ke Dashboard"</li>
          </ol>
          <p style="color: #777; font-size: 13px; margin-top: 24px;">Simpan email ini baik-baik — kode lisensi hanya bisa dipakai untuk satu akun. Kalau butuh bantuan, balas email ini.</p>
        </div>
      `,
    });

    if (result.error) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
