import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { licenses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/adminSession";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const update: { isActive?: boolean; expiresAt?: Date | null } = {};
  if (body.isActive !== undefined) {
    update.isActive = Boolean(body.isActive);
  }
  // expiresAt: string ISO untuk set tanggal baru, null untuk hapus expiry
  // (jadi lifetime lagi). Field tidak dikirim sama sekali = tidak diubah.
  if ("expiresAt" in body) {
    update.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  }

  const [updated] = await db
    .update(licenses)
    .set(update)
    .where(eq(licenses.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Lisensi tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ license: updated });
}
