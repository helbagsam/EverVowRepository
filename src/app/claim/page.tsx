"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Copy, Check } from "lucide-react";

/**
 * Halaman aktivasi — URL ini yang dipasang sebagai "isi produk" di Lynk.id,
 * jadi inilah tautan yang diterima pembeli lewat WhatsApp & email mereka
 * setelah pembayaran berhasil.
 *
 * Nada halamannya sengaja "selamat datang", bukan "pemulihan kode yang
 * hilang" — mayoritas yang membuka ini adalah pembeli yang BARU saja bayar,
 * bukan orang yang kehilangan sesuatu.
 */
export default function ClaimPage() {
  const router = useRouter();
  const [orderRef, setOrderRef] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderRef, email }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Gagal mengaktifkan. Coba lagi.");
        setLoading(false);
        return;
      }
      // Sesi sudah dibuat server-side. Tampilkan kode sebentar untuk disimpan
      // pembeli, lalu mereka tinggal klik untuk lanjut — tidak perlu login ulang.
      setCode(json.code);
      setLoading(false);
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const goToDashboard = () => {
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-brand-bg px-4 py-10">
      <div className="w-full max-w-md">

        {code ? (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-brand-success-bg text-brand-success flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} />
              </div>
              <h1 className="font-headline text-3xl text-brand-primary">Akun kamu sudah aktif</h1>
              <p className="text-sm text-brand-text-muted mt-2">
                Simpan kode di bawah ini — dipakai kalau nanti kamu mau masuk dari HP atau laptop lain.
              </p>
            </div>

            <div className="card p-8 space-y-5 text-center">
              <div className="py-5 bg-brand-primary/5 rounded-xl border border-brand-primary/20">
                <p className="text-xl font-mono font-bold text-brand-primary tracking-wider">{code}</p>
              </div>

              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-brand-border rounded-xl text-sm font-semibold hover:bg-brand-surface-hover transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Kode tersalin" : "Salin kode"}
              </button>

              <button
                onClick={goToDashboard}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover active:scale-[0.99] transition-all"
              >
                Mulai Rencanakan Pernikahan <ArrowRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} />
              </div>
              <h1 className="font-headline text-3xl text-brand-primary">Aktifkan EverVow Lux</h1>
              <p className="text-sm text-brand-text-muted mt-2">
                Isi dua data di bawah ini — keduanya ada di pesan WhatsApp atau email yang baru kamu terima dari Lynk.id.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="card p-8 space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="orderRef" className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide">
                  No. Order
                </label>
                <input
                  id="orderRef"
                  required
                  type="text"
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                  placeholder="Tercantum di pesan pembelian"
                  className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide">
                  Email saat pembelian
                </label>
                <input
                  id="email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@kamu.com"
                  className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                  autoComplete="email"
                />
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-brand-danger-bg text-brand-danger text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Mengaktifkan..." : <>Masuk ke Dashboard <ArrowRight size={16} /></>}
              </button>

              <p className="text-xs text-center text-brand-text-muted pt-2">
                Sudah punya kode lisensi?{" "}
                <a href="/login" className="text-brand-primary font-semibold hover:underline">
                  Masuk lewat sini
                </a>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
