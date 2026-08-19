import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { licenses, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/adminSession";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await req.json();
  const normalizedCode = String(code || "").trim().toUpperCase();

  const license = await db.query.licenses.findFirst({ where: eq(licenses.code, normalizedCode) });
  if (!license) {
    return NextResponse.json({ found: false });
  }

  const account = await db.query.accounts.findFirst({ where: eq(accounts.licenseId, license.id) });

  return NextResponse.json({ found: true, license, activatedBy: account?.username || null });
}
