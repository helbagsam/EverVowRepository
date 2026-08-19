"use client";

import React, { useState, useMemo } from 'react';
import { Search, Rocket, Handshake, Store, Wallet, Shield, ChevronRight, ChevronDown, Users, Shirt, Truck } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  icon: React.ReactNode;
  title: string;
  desc: string;
  items: FaqItem[];
}

const categories: FaqCategory[] = [
  {
    icon: <Rocket size={24} />,
    title: 'Memulai (Getting Started)',
    desc: 'Panduan dasar pengaturan akun dan profil EverVow.',
    items: [
      { q: 'Bagaimana cara mengganti tanggal pernikahan?', a: 'Buka menu Settings > tab "Client Profile", lalu ubah field "Wedding Date". Perubahan otomatis memengaruhi hitung mundur di Dashboard.' },
      { q: 'Bagaimana cara mengubah nama pasangan yang tampil di Dashboard?', a: 'Buka Settings > "Client Profile", isi "Bride\'s Full Name" dan "Groom\'s Full Name", lalu klik Save Changes.' },
      { q: 'Bagaimana cara mengganti tema terang/gelap?', a: 'Buka Settings > tab "Preferences" > "Appearance & Theme", pilih Light atau Dark.' },
    ],
  },
  {
    icon: <Users size={24} />,
    title: 'Tugas & Kolaborasi',
    desc: 'Alur kerja tim, pendelegasian, dan linimasa proyek.',
    items: [
      { q: 'Bagaimana cara menambah task baru?', a: 'Buka menu Timeline, klik "Add Task" pada kategori yang sesuai, isi judul, prioritas, due date, dan assignee.' },
      { q: 'Bagaimana cara menambah atau mengganti nama planner/tim (assignee)?', a: 'Buka Settings > tab "Team & Assignee". Di sana kamu bisa menambah, mengubah nama, atau menghapus planner yang muncul sebagai pilihan assignee di Timeline.' },
      { q: 'Kenapa filter "Incomplete" di Timeline tidak menampilkan task tertentu?', a: 'Filter "Incomplete" hanya menyembunyikan task dengan status Completed. Task dengan status Not Started, In Progress, atau On Hold tetap tampil.' },
    ],
  },
  {
    icon: <Handshake size={24} />,
    title: 'Manajemen Tamu (Guest List)',
    desc: 'Import, export, dan pengelolaan status tamu undangan.',
    items: [
      { q: 'Bagaimana format file CSV untuk import tamu?', a: 'Unduh dulu template lewat tombol "Excel Template" di menu Guest List. Formatnya: Name, Phone, Group, Status, Table — satu baris per tamu, dipisah koma. Semua baris akan ikut terimpor, bukan cuma baris terakhir.' },
      { q: 'Kenapa hanya sebagian tamu yang muncul di tabel?', a: 'Cek tombol "More Filters" di pojok kanan atas tabel — kemungkinan ada filter Status atau Group yang aktif. Klik "Reset Filter" untuk menampilkan semua tamu lagi.' },
      { q: 'Apa arti status Confirmed, Pending, dan Declined?', a: 'Confirmed = tamu sudah mengonfirmasi kehadiran. Pending = belum ada jawaban. Declined = tamu tidak dapat hadir.' },
    ],
  },
  {
    icon: <Store size={24} />,
    title: 'Manajemen Vendor',
    desc: 'Komunikasi, kontrak, dan pembayaran vendor.',
    items: [
      { q: 'Apa perbedaan status vendor RESEARCHING, NEGOTIATING, dan BOOKED?', a: 'RESEARCHING = masih mencari opsi. CONTACTED = sudah dihubungi. NEGOTIATING = sedang tawar-menawar harga/detail. BOOKED = sudah deal dan dikontrak. COMPLETED = layanan sudah selesai diberikan.' },
      { q: 'Bagaimana cara memasukkan biaya vendor ke Budget?', a: 'Pada kartu vendor, gunakan opsi "Push to Budget" agar nilai total vendor otomatis tercatat sebagai pengeluaran di menu Budget.' },
      { q: 'Bagaimana cara memfilter vendor berdasarkan kategori atau status?', a: 'Gunakan tombol kategori (Venue & Catering, Florals & Decor, dst.) dan tombol status di bagian atas menu Vendors — keduanya bisa dikombinasikan.' },
    ],
  },
  {
    icon: <Wallet size={24} />,
    title: 'Anggaran & Faktur',
    desc: 'Pelacakan budget, kuitansi, dan tagihan klien.',
    items: [
      { q: 'Bagaimana cara mengatur total budget pernikahan?', a: 'Buka Settings > "Client Profile" > "Target Budget (IDR)". Nilai ini menjadi acuan progress bar dan status overbudget di menu Budget.' },
      { q: 'Bagaimana cara memfilter pengeluaran berdasarkan status pembayaran?', a: 'Klik ikon Filter di atas tabel "Expense Breakdown" pada menu Budget, lalu pilih Lunas, DP, atau Unpaid.' },
      { q: 'Format apa yang didukung untuk upload kuitansi/receipt?', a: 'Hanya file gambar JPG dan PNG yang bisa diupload sebagai bukti pembayaran. Format lain seperti PDF atau Word tidak didukung.' },
    ],
  },
  {
    icon: <Shirt size={24} />,
    title: 'Attire & Fitting',
    desc: 'Pengukuran, status fitting, dan catatan vendor busana.',
    items: [
      { q: 'Bagaimana cara memfilter attire berdasarkan peran (Bride, Groom, dst.)?', a: 'Gunakan deretan tombol peran di bagian atas menu Attire — klik salah satu untuk menampilkan hanya item milik peran tersebut.' },
      { q: 'Bagaimana cara menambahkan foto untuk item attire?', a: 'Saat menambah/mengedit item, masukkan URL gambar pada field "Image URL", atau gunakan tombol upload (mendukung JPG/PNG).' },
    ],
  },
  {
    icon: <Truck size={24} />,
    title: 'Logistik & Operasional',
    desc: 'Sewa peralatan, transportasi, dan serah terima barang bernilai tinggi.',
    items: [
      { q: 'Bagaimana cara memfilter inventaris logistik per kategori?', a: 'Gunakan tombol kategori (Rentals, Decor, Gifts, dst.) di bagian atas menu Logistics — daftar item otomatis mengikuti kategori yang dipilih.' },
      { q: 'Bagaimana cara mencatat serah terima cincin/mahar?', a: 'Buka bagian "High-Value Handover" di menu Logistics, tandai status menjadi "Handed Over" atau "Returned" — waktunya tercatat otomatis.' },
    ],
  },
  {
    icon: <Shield size={24} />,
    title: 'Akun & Keamanan',
    desc: 'Login, lisensi, dan keamanan akun.',
    items: [
      { q: 'Bagaimana cara login ke dashboard?', a: 'Gunakan username dan kode lisensi unik yang diberikan saat pembelian. Kode ini hanya bisa dipakai oleh satu akun.' },
      { q: 'Data saya tersimpan di mana?', a: 'Seluruh data pernikahan kamu (tamu, budget, vendor, dll.) tersimpan aman di server, bukan hanya di browser — jadi tidak hilang saat ganti perangkat.' },
    ],
  },
];

export const HelpCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [openItem, setOpenItem] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return categories;
    return categories
      .map(cat => ({
        ...cat,
        items: cat.items.filter(
          it => it.q.toLowerCase().includes(term) || it.a.toLowerCase().includes(term) || cat.title.toLowerCase().includes(term)
        ),
      }))
      .filter(cat => cat.items.length > 0);
  }, [searchTerm]);

  const toggleCategory = (i: number) => setOpenCategory(openCategory === i ? null : i);
  const toggleItem = (key: string) => setOpenItem(openItem === key ? null : key);

  return (
    <div className="max-w-[1140px] mx-auto pb-32 animate-in fade-in duration-500">
      <section className="text-center mb-16 max-w-2xl mx-auto pt-8">
        <h1 className="font-headline text-5xl text-brand-primary mb-4">How can we help you today?</h1>
        <p className="text-lg text-brand-text-muted mb-8">Cari pertanyaan atau jelajahi kategori di bawah ini.</p>
        <div className="relative group">
          <Search size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted group-focus-within:text-brand-accent transition-colors z-10" />
          <input
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setOpenCategory(null); }}
            className="w-full pl-14 pr-4 py-4 rounded-xl bg-brand-surface border border-brand-border focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all shadow-sm text-lg text-brand-text placeholder:text-brand-text-muted/50 outline-none"
            placeholder="Cari mis. 'import tamu' atau 'filter budget'"
            type="text"
          />
        </div>
      </section>

      {searchTerm.trim() && filtered.length === 0 && (
        <p className="text-center text-brand-text-muted mb-16">Tidak ada hasil untuk "{searchTerm}". Coba kata kunci lain seperti "filter", "import", atau "assignee".</p>
      )}

      <section className="mb-16">
        {!searchTerm.trim() && <h2 className="font-headline text-3xl text-brand-primary mb-6">Browse by Category</h2>}
        <div className={searchTerm.trim() ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
          {filtered.map((cat, i) => {
            const isOpen = searchTerm.trim() ? true : openCategory === i;
            return (
              <div key={cat.title} className="card p-6 hover:shadow-lg hover:border-brand-primary/50 transition-all duration-300">
                <button onClick={() => !searchTerm.trim() && toggleCategory(i)} className="w-full text-left">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
                      {cat.icon}
                    </div>
                    {!searchTerm.trim() && (isOpen ? <ChevronDown size={20} className="text-brand-text-muted mt-3" /> : <ChevronRight size={20} className="text-brand-text-muted mt-3" />)}
                  </div>
                  <h3 className="font-semibold text-xl mb-2 text-brand-text">{cat.title}</h3>
                  <p className="text-sm text-brand-text-muted mb-2">{cat.desc}</p>
                </button>
                {isOpen && (
                  <ul className="flex flex-col gap-1 text-sm mt-4 border-t border-brand-border pt-4">
                    {cat.items.map((it, j) => {
                      const key = `${cat.title}-${j}`;
                      const itemOpen = openItem === key;
                      return (
                        <li key={key} className="border-b border-brand-border/50 last:border-0">
                          <button onClick={() => toggleItem(key)} className="w-full flex items-center justify-between gap-2 py-2.5 text-left text-brand-text font-medium hover:text-brand-primary transition-colors">
                            <span>{it.q}</span>
                            {itemOpen ? <ChevronDown size={16} className="shrink-0" /> : <ChevronRight size={16} className="shrink-0" />}
                          </button>
                          {itemOpen && <p className="text-brand-text-muted pb-3 leading-relaxed">{it.a}</p>}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
