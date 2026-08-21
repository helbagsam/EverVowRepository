# EverVow Lux — Next.js + NeonDB + UploadThing (Semua Jadi 1 Project)

Project ini gabungan dari:
1. **Dashboard pembeli** (`/login`, `/dashboard/*`) — login pakai username + kode lisensi
2. **Admin/Generator Lisensi** (`/admin/login`, `/admin`) — login terpisah pakai password admin, buat generate & kelola kode lisensi (pengganti `admin.html` yang lama)

Keduanya connect ke **1 NeonDB yang sama**, dan **1 project Vercel** untuk semuanya.

## Setup pertama kali

1. `npm install`
2. Salin `.env.example` jadi `.env.local`, isi semua variabel:
   - `DATABASE_URL` — dari Neon dashboard
   - `SESSION_SECRET` — string acak 32+ karakter (`openssl rand -base64 32`)
   - `ADMIN_SESSION_SECRET` — string acak LAIN, beda dari `SESSION_SECRET`
   - `ADMIN_PASSWORD` — password kamu sendiri untuk masuk ke `/admin`
   - `UPLOADTHING_TOKEN` — dari uploadthing.com > API Keys (lihat bagian UploadThing di bawah)
   - (opsional) `LYNKID_WEBHOOK_SECRET`, `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL`, `NEXT_PUBLIC_APP_URL` — cuma dibutuhkan kalau pakai automasi jual lewat Lynk.id, lihat bagian "Automasi jual lewat Lynk.id" di bawah.
3. Buat tabel di database:
   ```
   npx drizzle-kit push
   ```
4. `npm run dev`, buka `http://localhost:3000/admin/login`, masuk pakai `ADMIN_PASSWORD` kamu.
5. Di tab "Generate", buat 1 kode lisensi test.
6. Buka `http://localhost:3000/login` di tab lain, coba login pakai username bebas + kode yang baru dibuat.

## Setup UploadThing

1. Daftar/login di [uploadthing.com](https://uploadthing.com), buat app baru.
2. Ambil token dari **API Keys**, isi ke `UPLOADTHING_TOKEN` di `.env.local` (dan nanti di Environment Variables Vercel juga).
3. Upload dibatasi **JPG/PNG saja, maksimal 4MB per file** — sudah diatur di `src/app/api/uploadthing/core.ts` sesuai keputusan kamu sebelumnya. Kalau mau ubah batasannya, edit di file itu.
4. Free tier UploadThing = 2GB storage. Karena ukurannya dibatasi kecil & cuma untuk foto (bukan dokumen), ini akan tahan lama dipakai banyak pembeli.

## Struktur penting

- `src/db/schema.ts` — skema database: `licenses`, `accounts`, `wedding_state`, `assets`.
- `src/store/AppContext.tsx` — state pembeli, baca/tulis ke `/api/state` (NeonDB), debounced 800ms.
- `src/app/api/auth/*` — login/logout pembeli.
- `src/app/api/admin/*` — login/logout admin, generate & list lisensi, verifikasi kode.
- `src/app/api/uploadthing/*` — file router upload gambar (JPG/PNG only, auth wajib login pembeli).
- `src/proxy.ts` — proteksi route (pembeli & admin punya sesi terpisah, sama sekali tidak bisa saling akses).
- `src/views/*` — 12 modul dashboard pembeli.
- `src/app/admin/*` — halaman generator lisensi (pengganti `admin.html`).
- `src/lib/licenseCode.ts` — logika generate + insert kode lisensi unik, dipakai bersama oleh `/admin` dan webhook Lynk.id.
- `src/app/api/webhook/lynkid/*` — terima notifikasi pembayaran sukses dari Lynk.id, auto-generate lisensi.
- `src/lib/notify.ts` — kirim email kode lisensi (Resend).
- `src/app/claim/*`, `src/app/api/claim/*` — halaman "ambil ulang kode" untuk pembeli, jaga-jaga email otomatis tidak sampai.

## Deploy ke Vercel

1. Push project ini ke repo GitHub **baru** (bukan repo Vite lama — beda framework, lihat penjelasan sebelumnya kalau butuh alasan lengkap).
2. Import ke Vercel sebagai project baru — akan otomatis terdeteksi sebagai Next.js.
3. Isi semua environment variables di atas di Project Settings > Environment Variables.
4. Deploy. Setelah online, `/admin` adalah tempat kamu generate kode, dan `/login` adalah tempat pembeli login.

## Automasi jual lewat Lynk.id (kode lisensi otomatis)

Sebelumnya, tiap ada pembeli, admin harus buka `/admin` dan generate kode lisensi manual satu-satu. Sekarang ada jalur otomatis lewat webhook Lynk.id — kode lisensi dibuat & dikirim ke pembeli otomatis begitu pembayaran sukses, tanpa admin buka `/admin` sama sekali (tapi `/admin` tetap ada untuk kasus manual/di luar Lynk.id).

### Cara kerja singkat

1. Pembeli checkout & bayar di Lynk.id.
2. Lynk.id kirim webhook (event pembayaran sukses) ke `POST /api/webhook/lynkid` di app ini.
3. Endpoint itu generate kode lisensi unik (fungsi yang sama persis dengan yang dipakai `/admin`, lihat `src/lib/licenseCode.ts`), simpan ke database (`platform: "Lynk.id"`), lalu kirim email ke pembeli berisi kode + link login (lewat Resend, `src/lib/notify.ts`).
4. Pembeli buka `/login`, isi **Email** (harus sama persis dengan email saat checkout — ini yang jadi username-nya, bukan bebas ketik, lihat login route) + masukkan kode dari email → akun aktif.
5. Kalau email tidak sampai (masuk spam, dll), pembeli bisa ambil ulang kodenya sendiri di `/claim` (masukkan No. Order + email yang dipakai saat beli).

### Setup

1. **Resend** (pengirim email): daftar di [resend.com](https://resend.com), ambil API key, isi ke `RESEND_API_KEY`. Verifikasi domain kamu sendiri di sana untuk `NOTIFY_FROM_EMAIL` — kalau belum, fallback ke alamat testing `resend.dev` yang cuma bisa kirim ke email pemilik akun Resend (tidak cocok untuk pembeli asli).
2. Isi `NEXT_PUBLIC_APP_URL` dengan URL production kamu (mis. `https://evervowlux.vercel.app`, tanpa `/` di akhir).
3. **Lynk.id**: masuk ke Settings → Integrations → Webhooks di dashboard Lynk.id kamu, pasang URL `https://<domain-kamu>/api/webhook/lynkid`, pilih event pembayaran sukses (biasanya `order.paid`/`order.completed`), method POST. Lynk.id akan kasih **Merchant Key** — isi persis ke `LYNKID_WEBHOOK_SECRET`.
4. Sebelum jual ke pembeli asli: pakai fitur **"Test Webhook"** bawaan Lynk.id, lalu cek log request yang masuk (Vercel → project kamu → Logs). **Penting**: nama field payload di `src/app/api/webhook/lynkid/route.ts` (`name`, `email`, `phone`, `ref_id`, dst) disusun dari pola umum webhook Lynk.id, BUKAN dari dokumentasi resmi yang terverifikasi terhadap payload asli. Kalau payload asli beda nama field-nya, sesuaikan daftar di fungsi `extractField(...)` pada file itu.
5. Ini semua sudah lolos `npx drizzle-kit push` (kolom `buyer_email`, `buyer_phone`, `expires_at` di tabel `licenses` sudah ada) — kalau kamu clone di mesin lain, jalankan `npx drizzle-kit push` sekali sebelum `npm run dev`.

### Catatan keamanan

Endpoint webhook menolak (401) semua request kalau `LYNKID_WEBHOOK_SECRET` kosong atau tidak cocok — jadi wajib diisi sebelum dipasang di Lynk.id. Endpoint juga idempotent: kalau Lynk.id kirim webhook dobel untuk order yang sama (retry), tidak akan membuat lisensi dobel atau kirim email dobel. Sudah diverifikasi lewat test manual (buat lisensi via webhook → retry webhook sama → cek `/claim` → login pakai email+kode) — lihat riwayat commit untuk detail.

## Catatan build

`next/font/google` butuh akses `fonts.googleapis.com` — ini normal jalan di Vercel (mereka ada akses internet penuh), tapi bisa gagal kalau kamu build di jaringan yang memblokir domain itu (seperti sandbox saya). Sudah saya verifikasi terpisah: seluruh TypeScript, routing, admin, dan UploadThing lolos build bersih saat font sementara dinonaktifkan untuk isolasi masalah — jadi kalau nanti build gagal karena font, itu murni soal akses jaringan, bukan bug di kode.

## Yang masih manual / belum ada UI khusus

- Menghapus lisensi permanen belum ada tombolnya (sengaja — cuma bisa "Nonaktifkan" biar riwayat tidak hilang). Kalau perlu hapus permanen, lewat Neon SQL editor langsung.
- Halaman Administration (dokumen CPP/CPW) belum saya sambungkan ke UploadThing — saat ini masih placeholder seperti sebelumnya. Kabari kalau mau saya sambungkan juga.

## Perbaikan layout (dari screenshot testing lokal kamu — round 2)

1. **Sidebar tidak muncul / semua elemen tidak bisa diklik** — root cause: sidebar (`Sidebar.tsx`) sebelumnya pakai `hidden md:flex` (cuma tampil di layar ≥768px CSS width, TANPA versi mobile sama sekali), dan tombol hamburger di Topbar tidak punya `onClick` — jadi begitu browser menganggap viewport-nya di bawah 768px, sidebar hilang total dan tidak ada cara membukanya lagi. Sudah diperbaiki: sidebar sekarang jadi drawer yang bisa dibuka/tutup di mobile (slide-in dari kiri + backdrop gelap, tap di luar buat nutup), tombol hamburger di Topbar sudah tersambung.
   - **Kalau di layar desktop kamu masih kejadian**: coba cek zoom browser (reset ke 100% lewat Ctrl/Cmd+0) atau lebarkan window — kemungkinan besar penyebabnya browser mendeteksi CSS viewport width di bawah 768px (bisa karena scaling display Windows 150%/175%, atau window tidak semaksimal yang terlihat).

2. **Layout "Export PDF Summary" berantakan saat di-print** — sebelumnya cuma `window.print()` mentah tanpa CSS khusus print, jadi yang ke-print = sidebar+topbar+tombol interaktif ikut kecetak asal-asalan. Sudah diperbaiki: sidebar, topbar, dan tombol-tombol aksi sekarang otomatis disembunyikan saat print (`print:hidden`), halaman dashboard dapat judul khusus print ("EverVow Lux — Ringkasan Pernikahan" + nama pasangan + tanggal cetak), dan margin halaman print diatur rapi (1.5cm).

3. **Kompatibilitas iOS Safari (viewport tinggi)** — `h-screen` (`100vh`) di CSS punya masalah terkenal di Safari iOS: address bar yang collapsible bikin `100vh` kadang menghitung area yang ketutup browser chrome, menyebabkan bagian bawah layout terpotong/tidak kebaca. Diganti ke `h-dvh`/`min-h-dvh` (dynamic viewport height) di semua container full-screen (Sidebar, Dashboard shell, halaman Login & Admin) — unit ini didukung penuh di semua browser modern (Safari 15.4+, Chrome 108+, Firefox 101+) dan otomatis menyesuaikan saat address bar muncul/hilang.

4. **Modal/form terpotong di layar HP kecil** — hampir semua modal (Add Vendor, Add Guest, Add Task, dll — 20 modal di 9 file) sebelumnya tidak punya batas tinggi maksimum atau scroll internal. Di layar kecil (mis. iPhone SE), form yang panjang bisa membuat **tombol Save/Cancel di bagian bawah modal jadi tidak kebaca dan tidak bisa diklik sama sekali** — form-nya kepotong tapi tidak bisa di-scroll. Sudah diperbaiki semua: tiap modal sekarang dibatasi `max-h-[90vh]` dengan scroll internal, jadi selalu bisa di-scroll sampai ke tombol paling bawah berapa pun panjang formnya.

## Perbaikan round 3 (dari testing manual deploy kamu)

1. **Hydration error saat `npm run dev`** — pesan error React soal atribut `data-new-gr-c-s-check-loaded`/`data-gr-ext-installed` yang tidak cocok antara server & client. **Ini bukan bug di kode kita** — dua atribut itu disuntikkan oleh ekstensi browser **Grammarly** ke tag `<body>` sebelum React selesai hydrate, persis skenario yang disebutkan eksplisit di pesan error React sendiri ("can also happen if the client has a browser extension installed"). Ditambahkan `suppressHydrationWarning` di `<body>` (`src/app/layout.tsx`) — ini rekomendasi resmi Next.js untuk kasus ini, cuma meredam warning-nya, bukan menyembunyikan bug sungguhan.

2. **Timeline: 2 kategori milestone / sistem ganda** — waktu perbaikan dummy-data kemarin, saya tidak sadar Timeline **sudah punya fitur "New Category" yang berfungsi dari awal** (tombol di header atas, modal dengan icon picker) — saya malah bikin sistem kedua yang terpisah (tombol "Add Category" + empty state + modal sendiri), jadi keduanya render bersamaan dan bikin tampilan dobel seperti di screenshot kamu. **Sudah digabung jadi satu**: dipertahankan sistem original (`showCatModal`/`newCat`, modal dengan icon picker 10 pilihan), ditambahkan kemampuan **Edit & Delete** yang tadinya cuma ada di sistem duplikat saya (sekarang nempel di header tiap kolom kategori). Sistem duplikat saya dihapus total — tidak ada lagi 2 tombol/2 empty-state yang tabrakan.

3. **Angka Budget di Dashboard tidak proporsional** — 2 masalah sekaligus di widget "Budget Health":
   - Angka `Rp 200.0M` di 3 kolom sempit (Paid/Rem./Proj.) sebelumnya bisa patah jadi 2 baris ("Rp" di baris atas, "200.0M" di bawah) karena kolom terlalu sempit untuk `text-sm`. Diperbaiki: font dikecilkan ke `text-xs`, ditambah `whitespace-nowrap` + `overflow-hidden text-ellipsis`, dan gap antar-kolom dirapatkan — angka besar sekarang otomatis disingkat rapi dalam 1 baris, dengan tooltip (hover) menampilkan angka lengkapnya.
   - **"80% Allocated" ternyata angka hardcode**, bukan dihitung dari data asli (bug dummy-data yang lolos dari audit sebelumnya). Diganti jadi dihitung sungguhan dari total nilai expense dibanding target budget (`allocatedPercent`).
   - Sekalian diperbaiki `formatShortIDR()` di `utils/formatters.ts` supaya benar menampilkan angka negatif (kasus budget overspend, mis. "-Rp 1.5M" bukan angka mentah tak tersingkat).

Semua perbaikan di atas (round 2 & 3) sudah diverifikasi lewat full production build (`next build`) tanpa error.

## Soal kompatibilitas lintas device (jujur, bukan klaim kosong)

Aplikasi ini **web app responsif**, bukan aplikasi native terpisah untuk iOS/Android — jadi otomatis bisa diakses dari browser apapun (Safari, Chrome, Firefox) di HP, tablet, maupun desktop, tanpa perlu instalasi dari App Store/Play Store. Secara arsitektur ini sudah benar untuk "jalan di semua platform".

**Tapi saya harus jujur soal batas verifikasi saya**: saya tidak punya akses ke browser sungguhan (Safari, Chrome asli, device fisik) di lingkungan kerja saya — cuma bisa baca kode dan menjalankan `next build` untuk cek error compile. Semua bug layout yang diperbaiki di atas **ditemukan dari screenshot yang kamu kirim**, bukan dari pengujian saya sendiri. Jadi:

- Perbaikan di atas adalah perbaikan berdasarkan **pola bug yang sudah diketahui umum terjadi** — bukan jaminan 100% mulus di semua kombinasi device/browser/OS version yang belum pernah dilaporkan.
- **Sangat disarankan**: sebelum full launch, tes manual minimal di 3 kondisi ini: (1) iPhone Safari asli, (2) Android Chrome asli, (3) tablet (iPad/Android tablet) — buka tiap modul, coba buka semua modal, coba upload foto, coba filter, coba resize/rotate layar.
- Kalau nemu masalah lagi, kirim screenshot + info device/browser-nya (mis. "iPhone 14, Safari") seperti kemarin — saya bisa diagnosis & perbaiki dengan pola yang sama.

## Audit data dummy (sebelum jual ke pembeli)

Ditemukan & diperbaiki karena ini krusial untuk produk yang akan dijual — sebelumnya akun pembeli baru bisa melihat data fiktif, bahkan sebagian ter-**tulis permanen ke database mereka**, bukan cuma tampil di layar:

1. **State awal akun baru** — `defaultWeddingState()` (berisi "Siti Aminah & Budi Santoso", vendor "The Ritz-Carlton", dll) dipisah jadi:
   - `emptyWeddingState()` — benar-benar kosong, satu-satunya yang dipakai saat aktivasi lisensi baru (`src/app/api/auth/login/route.ts`).
   - `demoWeddingState()` — data contoh, disimpan di `src/lib/defaultState.ts` untuk keperluan testing/demo internal, **tidak dipanggil di jalur produksi manapun**.

2. **Dashboard.tsx — angka & konten palsu yang selalu muncul, bukan cuma di akun baru:**
   - Fallback `|| 142`, `|| 22`, `|| 16`, `|| 25`, `|| 18` pada hitungan tamu/task dihapus — sekarang selalu tampilkan angka asli (termasuk 0).
   - 3 task fiktif ("Finalize Florist Contract" dll) yang tampil kalau task asli kosong — dihapus.
   - Section "Recent Activity" tadinya berisi 3 aktivitas **statis permanen** ("Payment Sent to Venue - The Grand Estate", "Sarah added 4 new guests", dll) yang tampil ke **semua** akun tanpa terkecuali — diganti dengan ringkasan asli (item terakhir yang benar-benar ditambahkan pembeli).
   - Nama "Budi & Siti" di header — diganti ajakan lengkapi profil kalau `coupleProfile` masih kosong.

3. **Bug paling serius — auto-seed yang MENULIS data fiktif ke NeonDB** (bukan cuma tampilan, tapi tersimpan permanen ke akun pembeli begitu mereka membuka halaman terkait):
   - `Timeline.tsx` — otomatis membuat member "Sarah J."/"Planner Mark" + 3 task contoh untuk akun manapun yang datanya masih kosong. **Dihapus total.** *(Catatan: perbaikan Add/Edit/Delete Category untuk ini sempat menghasilkan sistem duplikat — sudah digabungkan & diperbaiki, lihat "Perbaikan round 3" di atas.)*
   - `Entertainment.tsx` — otomatis menyimpan 6 "Flow Timeline" contoh ("Cocktail Hour & Guest Arrival", "The Shoe Game Interactive Event", dst.). **Dihapus**, empty state sudah tersedia di UI.
   - `PhotoVideo.tsx` — otomatis menyimpan shot list & tech notes contoh. **Dihapus**, ditambahkan empty state yang layak.

Semua fix di atas sudah diverifikasi lewat 3x full production build (`next build`) tanpa error setelah rangkaian perubahan ini.

## Catatan keamanan (audit yang sudah dilakukan)

Sudah diverifikasi lewat pembacaan kode langsung, bukan asumsi:

- **Isolasi data antar akun**: setiap query `/api/state` (data wedding) di-filter pakai `accountId` dari session cookie server-side yang ditandatangani, bukan dari input client — jadi 1 akun tidak bisa mengakses/menimpa data akun lain lewat cara wajar. Tidak ada endpoint yang menerima `accountId` dari body/URL untuk dipakai query.
- **Sesi admin vs pembeli benar-benar terpisah**: cookie beda nama (`evervow_session` vs `evervow_admin_session`), secret beda, dan setiap API route admin cross-check `session.isAdmin` sendiri-sendiri (tidak hanya mengandalkan middleware).
- **Rate limiting login** (baru ditambahkan hari ini): percobaan login pembeli dibatasi 10x/15 menit per IP, login admin 5x/15 menit per IP — dicatat di database (bukan memory) supaya tetap berlaku walau function serverless di-restart.
- **Validasi payload** `PUT /api/state` (baru ditambahkan): menolak data yang bukan object, struktur field inti yang salah tipe, atau ukuran di atas 3MB — mencegah penyalahgunaan kuota storage.
- **SQL injection**: aman, semua query pakai Drizzle ORM dengan parameter terikat (`eq()`), tidak ada string SQL yang digabung manual.
- **Upload gambar**: wajib session pembeli aktif (dicek di `middleware` UploadThing sendiri, bukan cuma di UI), dibatasi JPG/PNG 4MB.

### Belum sempat dikerjakan / limitasi yang perlu kamu tahu
- **Tidak ada CSRF token eksplisit** — mitigasi saat ini mengandalkan `SameSite=Lax` di cookie session, yang menahan sebagian besar serangan CSRF standar tapi bukan proteksi berlapis penuh.
- **Tidak ada validasi skema penuh (schema validation)** untuk seluruh 20 jenis data di dalam `state` — saat ini cuma dicek 5 field inti wajib array + batas ukuran total. Kalau mau lebih ketat lagi (misal pakai Zod), saya bisa tambahkan.
- **Password admin tidak di-hash** — karena disimpan sebagai environment variable di Vercel (bukan di database), bukan di kode/repo. Ini wajar untuk skala 1 admin, tapi kalau nanti ada banyak admin, sebaiknya diganti ke sistem akun+hash.
- Saya **tidak melakukan penetration testing sungguhan** (mis. coba exploit beneran dari luar) — audit ini murni code review manual atas apa yang saya tulis sendiri. Kalau produk ini akan menangani data sensitif dalam skala besar, saya sarankan review keamanan independen sebelum go-live penuh.

