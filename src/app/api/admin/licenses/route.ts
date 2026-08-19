import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { licenses, accounts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/adminSession";

async function requireAdmin() {
  const session = await getAdminSession();
  return session.isAdmin === true;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa karakter yang gampang salah baca (I, O, 0, 1)
  const part = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `EVLX-${part()}-${part()}`;
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
