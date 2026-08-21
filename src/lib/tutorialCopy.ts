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
  // Tahap 1: splash sambutan (hanya first-time, di-skip saat replay).
  welcome: {
    eyebrow: string;
    title: string;
    subtitle: string;
    points: { title: string; desc: string }[];
    primaryCta: string;
    skipCta: string;
    langLabel: string;
  };
  // Tahap 3: strip tipis saat user menjelajah dummy data.
  preview: {
    badge: string;
    title: string;
    hint: string;
    reopenGuide: string;
    exitCta: string;
  };
  // Konten modal "Getting Started Guide" (lihat OnboardingGuide.tsx).
  guide: {
    eyebrow: string;
    title: string;
    subtitle: string;
    introLabel: string;
    introText: string;
    flowLabel: string;
    stepLabel: string; // contoh: "Langkah {n} dari {total}"
    steps: { title: string; openMenu: string; view: string; bullets: string[]; whyLabel: string; why: string }[];
    matrixTitle: string;
    modules: { name: string; desc: string }[];
    footerNote: string;
    primaryCta: string;
    secondaryCta: string;
  };
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
    welcome: {
      eyebrow: "Selamat Datang",
      title: "Mari Mulai Merencanakan Hari Bahagia Anda",
      subtitle:
        "Sebelum mulai mengisi data, kami akan mengajak Anda berkeliling sebentar — supaya Anda tahu persis apa yang bisa dilakukan di setiap panel.",
      points: [
        { title: "Pahami Alurnya", desc: "Panduan singkat 3 langkah tentang cara kerja dashboard ini." },
        { title: "Lihat Contohnya", desc: "Jelajahi dashboard berisi contoh pernikahan lengkap, bebas diklik-klik." },
        { title: "Mulai Isi Data Anda", desc: "Setelah paham, dashboard dikosongkan dan siap Anda isi sendiri." },
      ],
      primaryCta: "Mulai Panduan",
      skipCta: "Lewati, saya langsung isi data",
      langLabel: "Bahasa",
    },
    preview: {
      badge: "Mode Contoh",
      title: "Ini contoh pernikahan — silakan jelajahi setiap panel di menu kiri",
      hint: "Semua yang Anda lihat hanya ilustrasi. Perubahan apa pun di mode ini tidak akan tersimpan.",
      reopenGuide: "Buka Panduan",
      exitCta: "Selesai, Mulai Isi Data Saya",
    },
    guide: {
      eyebrow: "Getting Started",
      title: "Panduan Memulai EverVow Lux",
      subtitle: "Pahami alur kerja dan struktur dashboard sebelum mulai mengisi data pernikahan Anda.",
      introLabel: "101",
      introText:
        "EverVow Lux dirancang khusus untuk mengelola perencanaan pernikahan mewah secara terpusat — dari budget, tamu, vendor, hingga hari-H. Semua modul saling terhubung, jadi Anda tidak perlu bolak-balik spreadsheet terpisah. Contoh data yang Anda lihat sekarang murni ilustrasi; nanti akan diganti dengan data pernikahan Anda sendiri.",
      flowLabel: "ALUR 3 LANGKAH MEMULAI PERENCANAAN",
      stepLabel: "Langkah {n} dari {total}",
      steps: [
        {
          title: "Atur Profil & Target Utama",
          openMenu: "Lihat Contoh Profil",
          view: "settings",
          bullets: [
            "Isi nama pasangan, tanggal pernikahan, dan venue utama",
            "Tentukan target jumlah tamu dan total anggaran",
            "Data ini jadi acuan untuk semua modul lain",
          ],
          whyLabel: "Kenapa Langkah Ini Penting?",
          why: "Target budget & jumlah tamu di sini otomatis jadi acuan progress bar di Dashboard dan Budget — tanpa ini, modul lain tidak punya pembanding untuk menghitung persentase.",
        },
        {
          title: "Lengkapi Modul Perencanaan",
          openMenu: "Lihat Contoh Budget",
          view: "budget",
          bullets: [
            "Tambahkan vendor dan catat setiap pembayaran di Budget",
            "Undang tamu dan kelompokkan mereka di Guest List",
            "Susun milestone & tugas per fase acara di Timeline",
          ],
          whyLabel: "Kenapa Langkah Ini Penting?",
          why: "Setiap modul saling terhubung — vendor yang di-booking otomatis muncul sebagai baris di Budget, dan tugas yang selesai otomatis memperbarui progress di Timeline & Dashboard.",
        },
        {
          title: "Pantau & Selesaikan Administrasi",
          openMenu: "Lihat Contoh Dashboard",
          view: "dashboard",
          bullets: [
            "Cek ringkasan progress keseluruhan di Dashboard",
            "Unggah dokumen administrasi pernikahan (KTP, KK, surat)",
            "Export ringkasan PDF kapan saja untuk dibagikan ke keluarga",
          ],
          whyLabel: "Kenapa Langkah Ini Penting?",
          why: "Dashboard merangkum semua modul jadi satu tampilan — Anda tidak perlu membuka satu per satu hanya untuk tahu seberapa siap pernikahan Anda.",
        },
      ],
      matrixTitle: "Peta Modul EverVow Lux",
      modules: [
        { name: "Dashboard", desc: "Ringkasan progress, countdown, dan sorotan semua modul." },
        { name: "Budget", desc: "Catat vendor, pembayaran, dan sisa anggaran." },
        { name: "Guest List", desc: "Kelola tamu, RSVP, dan pembagian meja." },
        { name: "Vendors", desc: "Direktori vendor beserta status kontrak & kontak." },
        { name: "Timeline", desc: "Milestone dan tugas per fase, dengan penanggung jawab." },
        { name: "Attire", desc: "Detail busana pengantin & bridal party, termasuk fitting." },
        { name: "Entertainment", desc: "Susunan acara, games, dan hiburan resepsi." },
        { name: "Photo & Video", desc: "Shot list prioritas untuk tim fotografer & videografer." },
        { name: "Logistics", desc: "Sewa peralatan, transportasi, dan akomodasi." },
        { name: "Administration", desc: "Dokumen pernikahan resmi dan status pengurusannya." },
      ],
      footerNote: "Data Anda tersimpan otomatis dan bersifat privat.",
      primaryCta: "Lihat Contoh Dashboard",
      secondaryCta: "Lewati, langsung isi data saya",
    },
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
    welcome: {
      eyebrow: "Welcome",
      title: "Let's Start Planning Your Big Day",
      subtitle:
        "Before you start entering data, we'll take you on a short tour — so you know exactly what each panel can do for you.",
      points: [
        { title: "Learn the Flow", desc: "A quick 3-step guide to how this dashboard works." },
        { title: "Explore an Example", desc: "Browse a fully filled-in sample wedding, click around freely." },
        { title: "Enter Your Own Data", desc: "Once you're comfortable, the dashboard clears and it's all yours." },
      ],
      primaryCta: "Start the Guide",
      skipCta: "Skip, I'll enter my data now",
      langLabel: "Language",
    },
    preview: {
      badge: "Sample Mode",
      title: "This is a sample wedding — feel free to explore any panel on the left",
      hint: "Everything you see is illustrative only. Any changes made in this mode won't be saved.",
      reopenGuide: "Open Guide",
      exitCta: "Done, Let Me Enter My Data",
    },
    guide: {
      eyebrow: "Getting Started",
      title: "Your Guide to EverVow Lux",
      subtitle: "Understand the workflow and dashboard structure before filling in your own wedding details.",
      introLabel: "101",
      introText:
        "EverVow Lux is built to manage luxury wedding planning in one place — from budget and guests to vendors and the big day itself. Every module is connected, so you don't need to juggle separate spreadsheets. The sample data you see right now is purely illustrative; it'll be replaced with your own wedding details.",
      flowLabel: "3-STEP FLOW TO GET STARTED",
      stepLabel: "Step {n} of {total}",
      steps: [
        {
          title: "Set Up Your Profile & Key Targets",
          openMenu: "See Profile Example",
          view: "settings",
          bullets: [
            "Enter the couple's names, wedding date, and main venue",
            "Set your target guest count and total budget",
            "This data becomes the reference point for every other module",
          ],
          whyLabel: "Why This Step Matters",
          why: "The budget & guest targets you set here automatically drive the progress bars on the Dashboard and Budget page — without them, other modules have nothing to measure progress against.",
        },
        {
          title: "Fill In Your Planning Modules",
          openMenu: "See Budget Example",
          view: "budget",
          bullets: [
            "Add vendors and log every payment in Budget",
            "Invite guests and group them in Guest List",
            "Lay out milestones & tasks per phase in Timeline",
          ],
          whyLabel: "Why This Step Matters",
          why: "Every module is connected — a booked vendor automatically appears as a line item in Budget, and completed tasks automatically update progress on Timeline & Dashboard.",
        },
        {
          title: "Track Progress & Handle Admin",
          openMenu: "See Dashboard Example",
          view: "dashboard",
          bullets: [
            "Check your overall progress summary on the Dashboard",
            "Upload official wedding documents (ID, family card, letters)",
            "Export a PDF summary anytime to share with family",
          ],
          whyLabel: "Why This Step Matters",
          why: "The Dashboard rolls up every module into one view — you won't need to open each panel individually just to know how ready your wedding is.",
        },
      ],
      matrixTitle: "EverVow Lux Module Map",
      modules: [
        { name: "Dashboard", desc: "Progress summary, countdown, and highlights from every module." },
        { name: "Budget", desc: "Track vendors, payments, and remaining budget." },
        { name: "Guest List", desc: "Manage guests, RSVPs, and table assignments." },
        { name: "Vendors", desc: "Vendor directory with contract status and contacts." },
        { name: "Timeline", desc: "Milestones and tasks per phase, with owners assigned." },
        { name: "Attire", desc: "Bridal party attire details, including fittings." },
        { name: "Entertainment", desc: "Reception run-of-show, games, and entertainment." },
        { name: "Photo & Video", desc: "Priority shot list for your photo & video crew." },
        { name: "Logistics", desc: "Equipment rentals, transportation, and accommodation." },
        { name: "Administration", desc: "Official wedding documents and their processing status." },
      ],
      footerNote: "Your data is saved automatically and stays private.",
      primaryCta: "Show Me the Example",
      secondaryCta: "Skip, let me enter my data",
    },
  },
};
