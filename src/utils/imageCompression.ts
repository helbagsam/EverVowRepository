// Kompres gambar di browser (pakai Canvas) sebelum dikirim ke UploadThing,
// supaya foto dari kamera HP modern (sering 3-8MB) tetap bisa lolos batas
// 4MB tanpa user harus kompres manual di luar. Kalau file sudah di bawah
// ambang batas atau bukan gambar (mis. sudah kena validasi UploadThing di
// sisi lain), file dikembalikan apa adanya — tidak pernah menahan/gagalkan
// proses upload hanya karena kompresi gagal.

const COMPRESS_THRESHOLD_BYTES = 1_000_000; // 1MB — di atas ini baru dikompres
const MAX_DIMENSION = 1920; // sisi terpanjang dibatasi, cukup untuk kebutuhan web
const TARGET_BYTES = 3_500_000; // target aman di bawah limit 4MB server

async function compressOneImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  if (file.size <= COMPRESS_THRESHOLD_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    // Coba beberapa level kualitas sampai ukurannya masuk target, atau
    // berhenti di kualitas terendah yang masih wajar (0.5).
    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    let quality = 0.85;
    let blob: Blob | null = null;
    for (let i = 0; i < 4; i++) {
      blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, quality));
      if (!blob || blob.size <= TARGET_BYTES || quality <= 0.5) break;
      quality -= 0.15;
    }

    if (!blob || blob.size >= file.size) return file; // gagal / tidak lebih kecil -> pakai file asli
    return new File([blob], file.name, { type: outputType, lastModified: Date.now() });
  } catch {
    return file; // gagal kompres (mis. browser lama) -> tetap upload file asli
  }
}

export async function compressImagesBeforeUpload(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressOneImage));
}
