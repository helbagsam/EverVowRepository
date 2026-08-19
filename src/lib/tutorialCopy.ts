// Copywriting bilingual untuk fitur "Getting Started" / Tutorial mode.
// Prinsip: bahasa dipilih lewat language selector (toggle ID/EN), BUKAN
// menampilkan dua bahasa sekaligus dalam satu teks — supaya tidak terlihat
// aneh/berantakan di UI luxury seperti EverVow Lux.

export type TutorialLang = "id" | "en";

export interface TutorialCopySet {
  languageName: string;
  // Banner yang tampil otomatis saat user PERTAMA KALI masuk (belum pernah
  // menyelesaikan tutorial). Fokus: transisi ke data asli.
  firstTime: {
    badge: string;
    title: string;
    description: string;
    cta: string;
  };
  // Banner saat tutorial dipanggil ulang dari Settings. Fokus: pengingat
  // fitur + jalan kembali ke data asli.
  replay: {
    badge: string;
    title: string;
    description: string;
    exitCta: string;
  };
  // Modal konfirmasi sebelum replay dimulai (dari Settings).
  confirmReplay: {
    title: string;
    message: string;
    confirm: string;
    cancel: string;
  };
  // Seksi di Settings > Preferences.
  settings: {
    title: string;
    description: string;
    button: string;
    languageLabel: string;
    seenBadge: string;
    notSeenBadge: string;
  };
  // Label kecil "read-only preview" yang menempel di elemen saat tutorial aktif.
  previewTag: string;
}

export const tutorialCopy: Record<TutorialLang, TutorialCopySet> = {
  id: {
    languageName: "Indonesia",
    firstTime: {
      badge: "Contoh Interaktif",
      title: "Ini contoh bagaimana pernikahan impian Anda akan terlihat",
      description:
        "Kami sudah mengisi dashboard ini dengan data contoh agar Anda bisa merasakan pengalaman lengkapnya. Saat siap, mulai isi dengan detail pernikahan Anda yang sesungguhnya — dan biarkan EverVow Lux merapikan semuanya.",
      cta: "Mulai Rencana Pernikahan Saya",
    },
    replay: {
      badge: "Mode Pratinjau",
      title: "Anda sedang melihat contoh, bukan data Anda",
      description:
        "Ini contoh interaktif untuk mengingat kembali cara kerja setiap panel. Data pernikahan asli Anda aman dan tidak berubah sedikit pun.",
      exitCta: "Keluar dari Tur & Kembali ke Budget Saya",
    },
    confirmReplay: {
      title: "Putar Ulang Panduan?",
      message:
        "Data asli Anda akan disembunyikan sementara dan diganti dengan contoh interaktif. Tidak ada data yang akan terhapus atau berubah.",
      confirm: "Mulai Tur",
      cancel: "Batal",
    },
    settings: {
      title: "Panduan Getting Started",
      description:
        "Lupa cara membaca dashboard atau panel tertentu? Putar ulang tur singkat kapan saja — data asli Anda tidak akan tersentuh.",
      button: "Putar Ulang Tur",
      languageLabel: "Bahasa Tur",
      seenBadge: "Sudah pernah dilihat",
      notSeenBadge: "Belum pernah dilihat",
    },
    previewTag: "Pratinjau — bukan data Anda",
  },
  en: {
    languageName: "English",
    firstTime: {
      badge: "Interactive Sample",
      title: "This is a glimpse of how your dream wedding will look",
      description:
        "We've filled this dashboard with sample data so you can experience the full picture. When you're ready, start entering your real wedding details — and let EverVow Lux take it from there.",
      cta: "Start My Real Wedding Plan",
    },
    replay: {
      badge: "Preview Mode",
      title: "You're viewing a sample, not your data",
      description:
        "You're viewing an interactive sample to refresh how each panel works. Your real wedding data is safe and untouched.",
      exitCta: "Exit Tutorial & Return to My Budget",
    },
    confirmReplay: {
      title: "Replay the Tour?",
      message:
        "Your real data will be temporarily hidden and replaced with an interactive sample. Nothing will be deleted or changed.",
      confirm: "Start Tour",
      cancel: "Cancel",
    },
    settings: {
      title: "Getting Started Guide",
      description:
        "Forgot how to read the dashboard or a specific panel? Replay the short tour anytime — your real data stays untouched.",
      button: "Replay Tour",
      languageLabel: "Tour Language",
      seenBadge: "Already viewed",
      notSeenBadge: "Not viewed yet",
    },
    previewTag: "Preview — not your data",
  },
};
