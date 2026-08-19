import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { and, eq } from "drizzle-orm";

// Menghapus file yang sudah tidak dipakai lagi dari UploadThing (misalnya
// saat foto/kuitansi/dokumen diganti atau dihapus dari app) supaya tidak
// jadi file yatim yang tetap makan kuota storage 2GB free tier.
//
// Selalu dipanggil "fire-and-forget" dari sisi client — gagal di sini
// TIDAK PERNAH menggagalkan aksi utama user (hapus/ganti data tetap
// jalan meski cleanup storage-nya gagal).
const utapi = new UTApi();

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.accountId) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const fileKey = body?.fileKey;
  if (!fileKey || typeof fileKey !== "string") {
    return NextResponse.json({ error: "fileKey wajib diisi." }, { status: 400 });
  }

  // Verifikasi file ini memang milik akun yang sedang login — supaya 1 akun
  // tidak bisa memicu penghapusan file akun lain hanya dengan menebak key.
  const owned = await db.query.assets.findFirst({
    where: and(eq(assets.fileKey, fileKey), eq(assets.accountId, session.accountId)),
  });
  if (!owned) {
    // Bukan berarti error mencurigakan — bisa juga file lama dari sebelum
    // tabel assets ada. Diamkan saja, tidak ada yang perlu dihapus.
    return NextResponse.json({ success: true, skipped: true });
  }

  try {
    await utapi.deleteFiles(fileKey);
    await db.delete(assets).where(eq(assets.id, owned.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Gagal menghapus file dari storage." }, { status: 500 });
  }
}
