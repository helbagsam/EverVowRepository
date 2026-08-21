"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Plus, History, Search, Copy, Check, LogOut, RefreshCw, Ban, CheckCircle2 } from "lucide-react";

interface License {
  id: string;
  code: string;
  buyerName: string;
  buyerEmail: string | null;
  orderRef: string | null;
  platform: string | null;
  price: number | null;
  notes: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  activatedAt: string | null;
  username: string | null;
}

const PLATFORMS = ["Tokopedia", "Shopee", "TikTok Shop", "Lynk.id", "Instagram/WA", "Lainnya"];

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"generate" | "history" | "verify">("generate");
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [form, setForm] = useState({ buyerName: "", buyerEmail: "", orderRef: "", platform: "Tokopedia", price: "", notes: "", expiresInDays: "" });
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  const fetchLicenses = useCallback(async () => {
    setLoadingList(true);
    const res = await fetch("/api/admin/licenses");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    setLicenses(json.licenses || []);
    setLoadingList(false);
  }, [router]);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.buyerName.trim() || !form.buyerEmail.trim()) return;
    setGenerating(true);
    const res = await fetch("/api/admin/licenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: form.price ? Number(form.price) : undefined }),
    });
    const json = await res.json();
    setGenerating(false);
    if (res.ok) {
      setGeneratedCode(json.license.code);
      setForm({ buyerName: "", buyerEmail: "", orderRef: "", platform: "Tokopedia", price: "", notes: "", expiresInDays: "" });
      fetchLicenses();
    } else {
      alert(json.error || "Gagal membuat lisensi.");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyMessage = () => {
    if (!generatedCode) return;
    const msg = `Halo! Terima kasih sudah membeli EverVow Lux 🎉\n\nBerikut kode lisensi kamu:\nKode: ${generatedCode}\n\nCara masuk:\n1. Buka dashboard EverVow Lux\n2. Isi Email (harus sama dengan email saat pembelian)\n3. Isi Kode Lisensi di atas\n4. Klik "Masuk ke Dashboard"\n\nSelamat merencanakan pernikahan impian kamu! 💍`;
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const toggleActive = async (lic: License) => {
    const res = await fetch(`/api/admin/licenses/${lic.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !lic.isActive }),
    });
    if (res.ok) fetchLicenses();
  };

  const editExpiry = async (lic: License) => {
    const current = lic.expiresAt ? new Date(lic.expiresAt).toISOString().slice(0, 10) : "";
    const input = window.prompt(
      "Tanggal kadaluarsa baru (YYYY-MM-DD). Kosongkan untuk menghapus masa berlaku (jadi lifetime).",
      current
    );
    if (input === null) return; // dibatalkan
    const trimmed = input.trim();
    if (trimmed && Number.isNaN(new Date(trimmed).getTime())) {
      alert("Format tanggal tidak valid.");
      return;
    }
    const res = await fetch(`/api/admin/licenses/${lic.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiresAt: trimmed || null }),
    });
    if (res.ok) fetchLicenses();
    else alert("Gagal mengubah masa berlaku.");
  };

  const isExpired = (lic: License) => !!lic.expiresAt && new Date(lic.expiresAt).getTime() < Date.now();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;
    setVerifying(true);
    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: verifyCode }),
    });
    const json = await res.json();
    setVerifying(false);
    setVerifyResult(json);
  };

  const totalLicenses = licenses.length;
  const thisMonth = licenses.filter(l => {
    const d = new Date(l.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const today = licenses.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length;

  return (
    <div className="min-h-dvh bg-brand-bg">
      <header className="glass-panel border-b border-brand-border sticky top-0 z-40 bg-brand-bg/95">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <KeyRound size={20} />
            </div>
            <div>
              <h1 className="font-headline text-2xl text-brand-primary leading-tight">Generator Lisensi</h1>
              <p className="text-xs text-brand-text-muted">EverVow Lux · Seller Tool</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-brand-danger hover:bg-brand-danger-bg rounded-xl text-sm font-semibold transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-5 text-center">
            <p className="text-3xl font-headline text-brand-primary">{totalLicenses}</p>
            <p className="text-xs text-brand-text-muted uppercase tracking-wide mt-1">Total Lisensi</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-3xl font-headline text-brand-primary">{thisMonth}</p>
            <p className="text-xs text-brand-text-muted uppercase tracking-wide mt-1">Bulan Ini</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-3xl font-headline text-brand-primary">{today}</p>
            <p className="text-xs text-brand-text-muted uppercase tracking-wide mt-1">Hari Ini</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-brand-border">
          {[
            { id: "generate", label: "Generate", icon: Plus },
            { id: "history", label: "Riwayat", icon: History },
            { id: "verify", label: "Verifikasi", icon: Search },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === t.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-text-muted hover:text-brand-primary'}`}
              >
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "generate" && (
          <div className="grid md:grid-cols-2 gap-6">
            <form onSubmit={handleGenerate} className="card p-6 space-y-4">
              <h2 className="font-headline text-xl text-brand-primary mb-2">Buat Lisensi Baru</h2>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text-muted uppercase">Nama Pembeli *</label>
                <input required value={form.buyerName} onChange={e => setForm({ ...form, buyerName: e.target.value })} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-primary" placeholder="mis. Budi & Siti" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text-muted uppercase">Email Pembeli *</label>
                <input required type="email" value={form.buyerEmail} onChange={e => setForm({ ...form, buyerEmail: e.target.value })} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-primary" placeholder="mis. budi.siti@email.com" />
                <p className="text-[11px] text-brand-text-muted">Email ini otomatis jadi username login pembeli — pastikan sama dengan yang dipakai saat checkout.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text-muted uppercase">No. Order / Invoice</label>
                <input value={form.orderRef} onChange={e => setForm({ ...form, orderRef: e.target.value })} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-primary" placeholder="mis. INV-00123" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text-muted uppercase">Platform Jual</label>
                  <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-primary">
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text-muted uppercase">Harga Jual (Rp)</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-primary" placeholder="150000" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text-muted uppercase">Masa Berlaku (hari, opsional)</label>
                <input type="number" min={1} value={form.expiresInDays} onChange={e => setForm({ ...form, expiresInDays: e.target.value })} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-primary" placeholder="Kosongkan = lifetime" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text-muted uppercase">Catatan (opsional)</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-primary resize-none" />
              </div>
              <button type="submit" disabled={generating} className="w-full py-3 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover transition-all disabled:opacity-60">
                {generating ? "Membuat..." : "🔑 Generate Kode Lisensi"}
              </button>
            </form>

            <div className="card p-6">
              <h2 className="font-headline text-xl text-brand-primary mb-4">Kode Siap Dikirim</h2>
              {generatedCode ? (
                <div className="space-y-4">
                  <div className="text-center py-6 bg-brand-primary/5 rounded-xl border border-brand-primary/20">
                    <p className="text-2xl font-mono font-bold text-brand-primary tracking-wider">{generatedCode}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleCopy(generatedCode)} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-brand-border rounded-xl text-sm font-semibold hover:bg-brand-surface-hover transition-colors">
                      {copied ? <Check size={16} /> : <Copy size={16} />} Copy Kode
                    </button>
                    <button onClick={handleCopyMessage} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary-hover transition-colors">
                      💬 Copy Pesan WA
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-brand-text-muted text-center py-12">Belum ada kode yang di-generate. Isi form di sebelah kiri lalu klik Generate.</p>
              )}
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-brand-border flex items-center justify-between">
              <h2 className="font-headline text-xl text-brand-primary">Riwayat Lisensi</h2>
              <button onClick={fetchLicenses} className="flex items-center gap-2 px-3 py-1.5 text-sm text-brand-text-muted hover:text-brand-primary transition-colors">
                <RefreshCw size={14} /> Muat Ulang
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-brand-text-muted uppercase border-b border-brand-border">
                    <th className="px-4 py-3">Kode</th>
                    <th className="px-4 py-3">Pembeli</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Berlaku s/d</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingList && (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-brand-text-muted">Memuat...</td></tr>
                  )}
                  {!loadingList && licenses.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-brand-text-muted">Belum ada riwayat lisensi.</td></tr>
                  )}
                  {licenses.map(l => (
                    <tr key={l.id} className="border-b border-brand-border last:border-0 hover:bg-brand-surface-hover/50">
                      <td className="px-4 py-3 font-mono text-xs">{l.code}</td>
                      <td className="px-4 py-3 font-medium">{l.buyerName}</td>
                      <td className="px-4 py-3 text-brand-text-muted text-xs">{l.buyerEmail || '—'}</td>
                      <td className="px-4 py-3 text-brand-text-muted">{l.platform || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isExpired(l) ? 'bg-brand-danger-bg text-brand-danger' : l.isActive ? 'bg-brand-success-bg text-brand-success' : 'bg-brand-danger-bg text-brand-danger'}`}>
                          {isExpired(l) ? 'Kadaluarsa' : l.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-brand-text-muted text-xs">
                        {l.expiresAt ? new Date(l.expiresAt).toLocaleDateString('id-ID') : <span className="italic">lifetime</span>}
                      </td>
                      <td className="px-4 py-3 text-brand-text-muted">{l.username || <span className="italic">belum dipakai</span>}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleActive(l)} className="text-xs font-semibold text-brand-text-muted hover:text-brand-primary transition-colors flex items-center gap-1">
                            {l.isActive ? <><Ban size={12} /> Nonaktifkan</> : <><CheckCircle2 size={12} /> Aktifkan</>}
                          </button>
                          <button onClick={() => editExpiry(l)} className="text-xs font-semibold text-brand-text-muted hover:text-brand-primary transition-colors">
                            Atur Masa Berlaku
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "verify" && (
          <div className="card p-6 max-w-lg">
            <h2 className="font-headline text-xl text-brand-primary mb-2">Verifikasi Kode</h2>
            <p className="text-sm text-brand-text-muted mb-4">Cek apakah sebuah kode lisensi valid dan milik siapa.</p>
            <form onSubmit={handleVerify} className="flex gap-2 mb-4">
              <input value={verifyCode} onChange={e => setVerifyCode(e.target.value)} placeholder="EVLX-BUDI-2847" className="flex-1 px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm font-mono focus:outline-none focus:border-brand-primary uppercase" />
              <button type="submit" disabled={verifying} className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary-hover transition-colors disabled:opacity-60">
                {verifying ? '...' : 'Cek'}
              </button>
            </form>
            {verifyResult && (
              verifyResult.found ? (
                <div className="p-4 rounded-xl bg-brand-success-bg text-sm space-y-1">
                  <p><span className="font-semibold">Pembeli:</span> {verifyResult.license.buyerName}</p>
                  <p><span className="font-semibold">Email:</span> {verifyResult.license.buyerEmail || '—'}</p>
                  <p><span className="font-semibold">Status:</span> {verifyResult.license.isActive ? 'Aktif' : 'Nonaktif'}</p>
                  <p><span className="font-semibold">Dipakai oleh:</span> {verifyResult.activatedBy || 'Belum diaktivasi'}</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-brand-danger-bg text-brand-danger text-sm font-medium">Kode tidak ditemukan.</div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
