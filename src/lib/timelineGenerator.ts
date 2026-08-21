import type { Category, Task } from "@/lib/weddingTypes";

/**
 * Generator timeline persiapan nikah otomatis dari tanggal pernikahan.
 *
 * Masalah yang diselesaikan: pengantin baru mulai persiapan seringkali
 * tidak tahu harus mulai dari mana — dan urutan yang benar itu BEDA
 * tergantung berapa lama waktu persiapan mereka (3 bulan vs 24 bulan).
 *
 * Ada dua jenis tugas dengan sifat waktu yang beda:
 * - FIXED: waktunya tidak bisa digeser proporsional dengan lama persiapan.
 *   Contoh: daftar nikah ke KUA wajib H-10 hari kerja, mau persiapannya
 *   3 bulan atau 24 bulan sama saja. Kalau dipaksa mundur proporsional
 *   (mis. jadi H-200 untuk persiapan 24 bulan), itu salah — orang akan
 *   lupa karena terlalu jauh dari hari-H, atau malah terlambat kalau
 *   dipercepat ke H-2 untuk persiapan singkat.
 * - FLEXIBLE: waktunya ideal dihitung dari REFERENCE_DAYS (365 hari =
 *   asumsi persiapan nyaman 12 bulan). Kalau waktu tersedia lebih pendek
 *   dari referensi, jadwalnya dipadatkan proporsional — tapi tidak pernah
 *   di bawah minDaysBefore (batas realistis minimum, mis. venue tetap
 *   butuh minimal 3 minggu survei+booking walau dikebut).
 *
 * Kalau bahkan setelah dipadatkan jadwalnya jatuh sebelum hari ini (waktu
 * benar-benar tidak cukup), item itu ditandai flagged=true — di tampilan
 * dinaikkan jadi priority "High" dan catatannya diberi peringatan, supaya
 * pengantin tahu ini harus dikejar duluan, bukan diam-diam telat.
 */

const REFERENCE_DAYS = 365;

type Anchor = "fixed" | "flexible";

interface ChecklistItem {
  categoryKey: CategoryKey;
  title: string;
  desc: string;
  anchor: Anchor;
  /** Fixed: persis segini hari sebelum hari-H. Flexible: ideal-nya segini hari sebelum hari-H kalau persiapan 12 bulan penuh. */
  idealDaysBefore: number;
  /** Batas realistis minimum hari sebelum hari-H, walau dipadatkan habis-habisan. */
  minDaysBefore: number;
  priority: Task["priority"];
}

type CategoryKey =
  | "venue"
  | "design"
  | "attire"
  | "photo"
  | "entertainment"
  | "logistics"
  | "admin"
  | "guests"
  | "budget";

const CATEGORY_DEFS: Record<CategoryKey, Omit<Category, "id">> = {
  venue: { name: "Venue & Catering", icon: "home", colorClass: "text-brand-primary", bgClass: "bg-brand-primary" },
  design: { name: "Design & Decor", icon: "palette", colorClass: "text-brand-accent", bgClass: "bg-brand-accent" },
  attire: { name: "Attire", icon: "shirt", colorClass: "text-brand-success", bgClass: "bg-brand-success" },
  photo: { name: "Photo & Video", icon: "camera", colorClass: "text-brand-warning", bgClass: "bg-brand-warning" },
  entertainment: { name: "Entertainment", icon: "music", colorClass: "text-brand-primary", bgClass: "bg-brand-primary" },
  logistics: { name: "Logistics", icon: "truck", colorClass: "text-brand-accent", bgClass: "bg-brand-accent" },
  admin: { name: "Administration", icon: "filetext", colorClass: "text-brand-success", bgClass: "bg-brand-success" },
  guests: { name: "Guests & Invitations", icon: "users", colorClass: "text-brand-warning", bgClass: "bg-brand-warning" },
  budget: { name: "Budget & Finance", icon: "creditcard", colorClass: "text-brand-primary", bgClass: "bg-brand-primary" },
};

/**
 * Checklist master. Angka idealDaysBefore/minDaysBefore disusun dari pola
 * umum persiapan nikah di Indonesia (bukan tebakan acak) — tapi ini tetap
 * template umum, bukan saran hukum/agama. Syarat KUA & dokumen bisa beda
 * per daerah, jadi copy-nya selalu mengarahkan untuk konfirmasi ke KUA/
 * catatan sipil setempat, bukan mengklaim kepastian.
 */
const CHECKLIST: ChecklistItem[] = [
  // ---------- Budget & Finance ----------
  { categoryKey: "budget", title: "Tentukan total budget & alokasi per kategori", desc: "Sepakati angka total dulu sebelum booking apa pun — supaya pilihan vendor & venue disesuaikan ke budget, bukan sebaliknya.", anchor: "flexible", idealDaysBefore: 300, minDaysBefore: 14, priority: "High" },
  { categoryKey: "budget", title: "Buka rekening/tabungan bersama khusus dana nikah", desc: "Memisahkan dana nikah dari rekening harian memudahkan pantau sisa budget.", anchor: "flexible", idealDaysBefore: 270, minDaysBefore: 14, priority: "Medium" },
  { categoryKey: "budget", title: "Bayar DP ke vendor-vendor utama", desc: "Venue, catering, fotografer — kunci tanggal dengan DP begitu deal.", anchor: "flexible", idealDaysBefore: 200, minDaysBefore: 14, priority: "High" },
  { categoryKey: "budget", title: "Cicil pelunasan bertahap sesuai termin tiap vendor", desc: "Cek ulang jadwal cicilan semua vendor supaya tidak menumpuk di akhir.", anchor: "flexible", idealDaysBefore: 90, minDaysBefore: 14, priority: "Medium" },
  { categoryKey: "budget", title: "Pelunasan akhir ke seluruh vendor", desc: "Sebagian besar vendor mensyaratkan lunas sebelum hari-H — konfirmasi tenggatnya masing-masing.", anchor: "fixed", idealDaysBefore: 7, minDaysBefore: 3, priority: "High" },

  // ---------- Administration ----------
  { categoryKey: "admin", title: "Kumpulkan dokumen pribadi (KTP, KK, akta lahir, pas foto)", desc: "Siapkan dokumen kedua belah pihak dari awal supaya tidak terburu-buru saat mendaftar.", anchor: "flexible", idealDaysBefore: 120, minDaysBefore: 14, priority: "High" },
  { categoryKey: "admin", title: "Urus surat pengantar RT/RW & kelurahan", desc: "Syarat administratif standar sebelum daftar ke KUA/catatan sipil.", anchor: "flexible", idealDaysBefore: 60, minDaysBefore: 14, priority: "High" },
  { categoryKey: "admin", title: "Cek syarat tambahan (wali nikah, dispensasi usia, dll bila perlu)", desc: "Tidak semua pasangan butuh ini — cek ke KUA/catatan sipil setempat kalau ada situasi khusus.", anchor: "flexible", idealDaysBefore: 60, minDaysBefore: 14, priority: "Medium" },
  { categoryKey: "admin", title: "Daftar & serahkan berkas nikah ke KUA/Dinas Dukcapil", desc: "Aturan umum: minimal H-10 hari kerja sebelum akad. Ini bukan hal yang bisa dipercepat lewat template — konfirmasi langsung ke KUA/catatan sipil setempat.", anchor: "fixed", idealDaysBefore: 30, minDaysBefore: 10, priority: "High" },
  { categoryKey: "admin", title: "Tes kesehatan pranikah", desc: "Sebagian daerah mensyaratkan ini sebagai kelengkapan berkas — cek ketentuan setempat.", anchor: "fixed", idealDaysBefore: 30, minDaysBefore: 14, priority: "Medium" },
  { categoryKey: "admin", title: "Konfirmasi jadwal akad dengan penghulu/pemuka agama", desc: "Kunci jam & lokasi akad supaya tidak bentrok dengan jadwal resepsi.", anchor: "fixed", idealDaysBefore: 14, minDaysBefore: 5, priority: "High" },

  // ---------- Venue & Catering ----------
  { categoryKey: "venue", title: "Survei & bandingkan pilihan venue", desc: "Venue populer biasanya paling cepat penuh — mulai survei sepaling awal mungkin.", anchor: "flexible", idealDaysBefore: 300, minDaysBefore: 21, priority: "High" },
  { categoryKey: "venue", title: "Booking & DP venue", desc: "Kunci tanggal begitu pilihan final, sebelum diambil pasangan lain.", anchor: "flexible", idealDaysBefore: 270, minDaysBefore: 21, priority: "High" },
  { categoryKey: "venue", title: "Survei & tasting menu catering", desc: "Coba minimal 2-3 pilihan sebelum memutuskan paket menu.", anchor: "flexible", idealDaysBefore: 240, minDaysBefore: 14, priority: "High" },
  { categoryKey: "venue", title: "Booking & DP catering", desc: "Kunci vendor catering setelah tasting dan cocok dengan budget.", anchor: "flexible", idealDaysBefore: 210, minDaysBefore: 14, priority: "High" },
  { categoryKey: "venue", title: "Finalisasi menu & paket katering", desc: "Sesuaikan menu final dengan estimasi jumlah tamu terbaru.", anchor: "flexible", idealDaysBefore: 60, minDaysBefore: 14, priority: "Medium" },
  { categoryKey: "venue", title: "Walkthrough venue terakhir dengan tim", desc: "Cek ulang denah, akses listrik, dan jalur masuk vendor lain di lokasi.", anchor: "fixed", idealDaysBefore: 14, minDaysBefore: 3, priority: "Medium" },
  { categoryKey: "venue", title: "Konfirmasi final jumlah tamu ke katering", desc: "Sebagian besar katering mengunci harga dari jumlah tamu final di titik ini.", anchor: "fixed", idealDaysBefore: 7, minDaysBefore: 3, priority: "High" },

  // ---------- Design & Decor ----------
  { categoryKey: "design", title: "Tentukan konsep & mood board dekorasi", desc: "Sepakati palet warna dan tema sebelum booking vendor dekorasi.", anchor: "flexible", idealDaysBefore: 270, minDaysBefore: 14, priority: "Medium" },
  { categoryKey: "design", title: "Survei & booking vendor dekorasi", desc: "Vendor dekorasi bagus juga cepat penuh terutama musim ramai nikahan.", anchor: "flexible", idealDaysBefore: 210, minDaysBefore: 14, priority: "High" },
  { categoryKey: "design", title: "Finalisasi desain dekorasi & rangkaian bunga", desc: "Kunci detail akhir setelah venue & jumlah tamu final.", anchor: "flexible", idealDaysBefore: 45, minDaysBefore: 7, priority: "Medium" },

  // ---------- Attire ----------
  { categoryKey: "attire", title: "Riset & booking gaun/jas pengantin", desc: "Kalau custom-made, butuh waktu jahit lebih lama — mulai lebih awal daripada vendor lain.", anchor: "flexible", idealDaysBefore: 210, minDaysBefore: 30, priority: "High" },
  { categoryKey: "attire", title: "Tentukan seragam/kebaya keluarga & bridesmaid", desc: "Koordinasikan warna dan model dengan tema dekorasi.", anchor: "flexible", idealDaysBefore: 90, minDaysBefore: 14, priority: "Medium" },
  { categoryKey: "attire", title: "Fitting pertama busana pengantin", desc: "Cek potongan awal, masih ada waktu untuk revisi kalau perlu.", anchor: "flexible", idealDaysBefore: 90, minDaysBefore: 14, priority: "Medium" },
  { categoryKey: "attire", title: "Fitting akhir & ambil busana", desc: "Pastikan semua aksesoris lengkap saat pengambilan.", anchor: "fixed", idealDaysBefore: 10, minDaysBefore: 5, priority: "High" },

  // ---------- Photo & Video ----------
  { categoryKey: "photo", title: "Survei & booking fotografer + videografer", desc: "Fotografer favorit biasanya di-booking jauh-jauh hari, terutama akhir pekan musim ramai.", anchor: "flexible", idealDaysBefore: 240, minDaysBefore: 14, priority: "High" },
  { categoryKey: "photo", title: "Sesi foto pre-wedding (opsional)", desc: "Tidak wajib, tapi kalau mau, sisakan waktu sebelum sibuk detail teknis lain.", anchor: "flexible", idealDaysBefore: 120, minDaysBefore: 14, priority: "Low" },
  { categoryKey: "photo", title: "Diskusi shot list & referensi gaya foto", desc: "Kirimkan daftar momen wajib (keluarga, adat, dll) ke tim foto/video.", anchor: "flexible", idealDaysBefore: 30, minDaysBefore: 7, priority: "Medium" },

  // ---------- Entertainment ----------
  { categoryKey: "entertainment", title: "Booking MC", desc: "MC berpengalaman biasanya juga cepat penuh jadwalnya.", anchor: "flexible", idealDaysBefore: 180, minDaysBefore: 14, priority: "Medium" },
  { categoryKey: "entertainment", title: "Booking band/musik/DJ", desc: "Sesuaikan genre musik dengan suasana acara yang diinginkan.", anchor: "flexible", idealDaysBefore: 180, minDaysBefore: 14, priority: "Medium" },
  { categoryKey: "entertainment", title: "Susun rundown acara & games (bila ada)", desc: "Rundown jadi acuan bersama MC, band, dan tim dokumentasi.", anchor: "flexible", idealDaysBefore: 30, minDaysBefore: 7, priority: "Medium" },
  { categoryKey: "entertainment", title: "Briefing final ke MC & tim hiburan", desc: "Selaraskan rundown terakhir dan istilah/nama yang perlu disebut MC.", anchor: "fixed", idealDaysBefore: 5, minDaysBefore: 2, priority: "Medium" },

  // ---------- Guests & Invitations ----------
  { categoryKey: "guests", title: "Buat draft daftar tamu & alamat", desc: "Kelompokkan per grup (keluarga, kolega, teman) untuk memudahkan RSVP nanti.", anchor: "flexible", idealDaysBefore: 180, minDaysBefore: 7, priority: "High" },
  { categoryKey: "guests", title: "Kirim save-the-date untuk tamu luar kota (opsional)", desc: "Membantu tamu dari luar kota mengatur cuti/transportasi lebih awal.", anchor: "flexible", idealDaysBefore: 120, minDaysBefore: 7, priority: "Low" },
  { categoryKey: "guests", title: "Desain & pesan/cetak undangan", desc: "Sisakan waktu untuk revisi desain sebelum cetak massal.", anchor: "flexible", idealDaysBefore: 90, minDaysBefore: 14, priority: "Medium" },
  { categoryKey: "guests", title: "Kirim undangan resmi", desc: "Kirim ke seluruh daftar tamu, digital maupun fisik.", anchor: "flexible", idealDaysBefore: 45, minDaysBefore: 10, priority: "High" },
  { categoryKey: "guests", title: "Follow-up RSVP tamu yang belum konfirmasi", desc: "Hubungi personal tamu yang belum membalas — jangan tunggu sampai mepet.", anchor: "flexible", idealDaysBefore: 21, minDaysBefore: 5, priority: "Medium" },
  { categoryKey: "guests", title: "Susun seating chart final", desc: "Kunci setelah RSVP mendekati final.", anchor: "fixed", idealDaysBefore: 10, minDaysBefore: 3, priority: "High" },

  // ---------- Logistics ----------
  { categoryKey: "logistics", title: "Booking transportasi pengantin & rombongan", desc: "Termasuk mobil pengantin dan armada untuk keluarga inti.", anchor: "flexible", idealDaysBefore: 90, minDaysBefore: 14, priority: "Medium" },
  { categoryKey: "logistics", title: "Booking akomodasi untuk tamu luar kota", desc: "Blokir kamar hotel terdekat venue kalau ada tamu dari luar kota.", anchor: "flexible", idealDaysBefore: 90, minDaysBefore: 14, priority: "Medium" },
  { categoryKey: "logistics", title: "Pesan souvenir pernikahan", desc: "Sesuaikan jumlah dengan estimasi tamu final.", anchor: "flexible", idealDaysBefore: 60, minDaysBefore: 14, priority: "Low" },
  { categoryKey: "logistics", title: "Siapkan mahar/seserahan", desc: "Cek kelengkapan sesuai adat/tradisi keluarga masing-masing.", anchor: "fixed", idealDaysBefore: 21, minDaysBefore: 7, priority: "High" },
  { categoryKey: "logistics", title: "Konfirmasi jadwal delivery & setup vendor H-1", desc: "Pastikan semua vendor tahu jam setup dan titik akses venue.", anchor: "fixed", idealDaysBefore: 3, minDaysBefore: 1, priority: "High" },
  { categoryKey: "logistics", title: "Siapkan tas darurat hari-H (dokumen, obat, alat jahit, dll)", desc: "Barang-barang kecil yang sering terlupa tapi menyelamatkan hari-H.", anchor: "fixed", idealDaysBefore: 2, minDaysBefore: 1, priority: "Low" },
];

function parseISODate(iso: string): Date | null {
  const d = new Date(iso + "T00:00:00");
  return Number.isFinite(d.getTime()) ? d : null;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + Math.round(days));
  return d;
}

export interface GeneratedTimeline {
  categories: Category[];
  tasks: Task[];
  /** Jumlah tugas yang jadwal idealnya tidak muat dan harus dipadatkan ke "secepatnya". */
  flaggedCount: number;
}

/**
 * ID kategori & tugas hasil generator diprefix "gen-" supaya bisa dibedakan
 * dari yang dibuat manual oleh pengguna — dipakai saat "buat ulang timeline"
 * untuk hanya mengganti yang pernah digenerate, tanpa menyentuh kategori/
 * tugas yang sudah ditambah/diedit sendiri oleh pengantin.
 */
export const GENERATED_ID_PREFIX = "gen-";

export function generateTimelineFromWeddingDate(
  weddingDateISO: string,
  today: Date = new Date()
): GeneratedTimeline | null {
  const weddingDate = parseISODate(weddingDateISO);
  if (!weddingDate) return null;

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const totalDays = Math.round((weddingDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

  // Tanggal sudah lewat atau hari ini — tidak ada waktu tersisa untuk
  // dijadwalkan, generator tidak masuk akal dipakai di titik ini.
  if (totalDays <= 0) return null;

  const compressionRatio = Math.min(1, totalDays / REFERENCE_DAYS);

  const categoryIds: Record<CategoryKey, string> = {
    venue: `${GENERATED_ID_PREFIX}cat-venue`,
    design: `${GENERATED_ID_PREFIX}cat-design`,
    attire: `${GENERATED_ID_PREFIX}cat-attire`,
    photo: `${GENERATED_ID_PREFIX}cat-photo`,
    entertainment: `${GENERATED_ID_PREFIX}cat-entertainment`,
    logistics: `${GENERATED_ID_PREFIX}cat-logistics`,
    admin: `${GENERATED_ID_PREFIX}cat-admin`,
    guests: `${GENERATED_ID_PREFIX}cat-guests`,
    budget: `${GENERATED_ID_PREFIX}cat-budget`,
  };

  const categories: Category[] = (Object.keys(CATEGORY_DEFS) as CategoryKey[]).map((key) => ({
    id: categoryIds[key],
    ...CATEGORY_DEFS[key],
  }));

  let flaggedCount = 0;

  const tasks: Task[] = CHECKLIST.map((item, index) => {
    const targetDaysBefore =
      item.anchor === "fixed"
        ? item.idealDaysBefore
        : Math.max(item.minDaysBefore, Math.round(item.idealDaysBefore * compressionRatio));

    let daysFromToday = totalDays - targetDaysBefore;
    let flagged = false;
    if (daysFromToday < 0) {
      // Bahkan setelah dipadatkan, jadwal idealnya sudah lewat dari sisa
      // waktu yang ada — jadwalkan sesegera mungkin (hari ini) dan tandai.
      daysFromToday = 0;
      flagged = true;
      flaggedCount += 1;
    }

    const dueDate = toISODate(addDays(startOfToday, daysFromToday));
    const desc = flagged
      ? `⚠️ Waktu persiapan kamu mepet untuk item ini — prioritaskan duluan. ${item.desc}`
      : item.desc;

    return {
      id: `${GENERATED_ID_PREFIX}t${index + 1}`,
      categoryId: categoryIds[item.categoryKey],
      title: item.title,
      status: "Not Started",
      assigneeId: "",
      dueDate,
      priority: flagged ? "High" : item.priority,
      desc,
    };
  });

  return { categories, tasks, flaggedCount };
}
