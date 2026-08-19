import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { weddingState } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.accountId) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const row = await db.query.weddingState.findFirst({
    where: eq(weddingState.accountId, session.accountId),
  });

  if (!row) {
    return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ state: row.state, username: session.username });
}

// Menerima seluruh objek state dan menyimpannya sebagai 1 baris JSONB.
// AppContext di client men-debounce pemanggilan ini (~800ms) supaya
// tidak boros write ke Neon walau user mengetik cepat / banyak perubahan.
const MAX_STATE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB — jauh di atas kebutuhan wajar (data teks, gambar lewat UploadThing terpisah)
const REQUIRED_ARRAY_KEYS = ['guests', 'expenses', 'vendors', 'tasks', 'logistics'] as const;

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.accountId) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const body = await req.json();
  if (!body || typeof body !== "object" || !("state" in body)) {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const state = body.state;
  if (typeof state !== "object" || state === null || Array.isArray(state)) {
    return NextResponse.json({ error: "Struktur data tidak valid." }, { status: 400 });
  }

  // Validasi bentuk dasar — mencegah data korup menimpa struktur yang benar.
  for (const key of REQUIRED_ARRAY_KEYS) {
    if (!Array.isArray(state[key])) {
      return NextResponse.json({ error: `Field "${key}" harus berupa array.` }, { status: 400 });
    }
  }

  // Batas ukuran — mencegah penyalahgunaan kuota storage Neon oleh 1 akun.
  const sizeBytes = new TextEncoder().encode(JSON.stringify(state)).length;
  if (sizeBytes > MAX_STATE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Data terlalu besar untuk disimpan. Kurangi jumlah data atau hubungi support." },
      { status: 413 }
    );
  }

  await db
    .update(weddingState)
    .set({ state, updatedAt: new Date() })
    .where(eq(weddingState.accountId, session.accountId));

  return NextResponse.json({ ok: true });
}
