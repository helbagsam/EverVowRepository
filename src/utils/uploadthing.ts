import { generateUploadButton, generateUploadDropzone, generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();

// Mengekstrak file key dari URL UploadThing (format:
// https://<app>.ufs.sh/f/<fileKey>) — dipakai buat minta backend hapus
// file lama saat foto/dokumen diganti atau dihapus dari app.
function extractFileKeyFromUrl(url: string): string | null {
  try {
    const path = new URL(url).pathname; // "/f/<fileKey>"
    const key = path.split('/').filter(Boolean).pop();
    return key || null;
  } catch {
    return null;
  }
}

// Hapus file lama dari UploadThing storage supaya tidak jadi file yatim
// yang tetap makan kuota. Sengaja "fire-and-forget" — dipanggil tanpa
// await di titik pemanggilan, dan tidak pernah melempar error ke UI kalau
// gagal (aksi utama user, mis. hapus/ganti data, tidak boleh ikut gagal
// hanya karena cleanup storage gagal).
export function deleteUploadedFile(url: string | undefined | null) {
  if (!url) return;
  const fileKey = extractFileKeyFromUrl(url);
  if (!fileKey) return;
  fetch('/api/uploadthing/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileKey }),
  }).catch(() => {
    // Diamkan — cleanup storage bukan aksi kritikal, tidak boleh
    // mengganggu alur utama user kalau gagal (mis. jaringan putus).
  });
}
