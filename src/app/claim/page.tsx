"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Search } from "lucide-react";

export default function ClaimPage() {
  const [orderRef, setOrderRef] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCode(null);
    setLoading(true);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderRef, email }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Gagal mengambil kode. Coba lagi.");
        setLoading(false);
        return;
      }
      setCode(json.code);
      setLoading(false);
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-4">
            <Mail size={28} />
          </div>
          <h1 className="font-headline text-3xl text-brand-primary">Ambil Ulang Kode Lisensi</h1>
          <p className="text-sm text-brand-text-muted mt-2">
            Sudah bayar tapi email kode lisensi belum masuk (cek folder spam juga)? Cari lagi di sini.
          </p>
        </div>

        {code ? (
          <div className="card p-8 space-y-5 text-center">
            <p className="text-sm text-brand-text-muted">Ini kode lisensi kamu:</p>
            <div className="py-5 bg-brand-primary/5 rounded-xl border border-brand-primary/20">
              <p className="text-xl font-mono font-bold text-brand-primary tracking-wider">{code}</p>
            </div>
            <Link
              href="/login"
              className="inline-block w-full py-3 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover transition-all"
            >
              Lanjut ke Halaman Masuk
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide">
                No. Order / Invoice
              </label>
              <input
                required
                type="text"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                placeholder="mis. dari email konfirmasi Lynk.id"
                className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide">
                Email saat pembelian
              </label>
              <input
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
              <Search size={16} /> {loading ? "Mencari..." : "Cari Kode Lisensi"}
            </button>

            <p className="text-xs text-center text-brand-text-muted pt-2">
              Masih tidak ketemu? Hubungi kami langsung dengan bukti pembayaran.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
