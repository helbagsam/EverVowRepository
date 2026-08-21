import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { licenses, accounts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/adminSession";
import { createLicenseWithUniqueCode, LicenseCodeCollisionError } from "@/lib/licenseCode";

async function requireAdmin() {
  const session = await getAdminSession();
  return session.isAdmin === true;
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
      expiresAt: licenses.expiresAt,
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

  // Masa berlaku opsional (mis. lisensi trial/langganan). Kosong = lifetime.
  let expiresAt: Date | null = null;
  if (body.expiresInDays !== undefined && body.expiresInDays !== null && body.expiresInDays !== "") {
    const days = Number(body.expiresInDays);
    if (!Number.isFinite(days) || days <= 0) {
      return NextResponse.json({ error: "Masa berlaku harus berupa jumlah hari yang valid." }, { status: 400 });
    }
    expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  // Kode dibuat lewat lib bersama supaya generator manual ini dan webhook
  // otomatis Lynk.id (/api/webhook/lynkid) memakai SATU logika yang sama.
  try {
    const created = await createLicenseWithUniqueCode({
      buyerName,
      buyerEmail,
      orderRef: body.orderRef || null,
      platform: body.platform || null,
      price: body.price ? Number(body.price) : null,
      notes: body.notes || null,
      expiresAt,
    });
    return NextResponse.json({ license: created });
  } catch (err) {
    if (err instanceof LicenseCodeCollisionError) {
      return NextResponse.json(
        { error: "Gagal membuat kode unik, coba submit lagi." },
        { status: 409 }
      );
    }
    throw err;
  }
}
