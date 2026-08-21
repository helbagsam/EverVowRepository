"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Gagal login. Coba lagi.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
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
            <Heart size={28} />
          </div>
          <h1 className="font-headline text-4xl text-brand-primary">EverVow Lux</h1>
          <p className="text-sm text-brand-text-muted mt-2">Masuk dengan username dan kode lisensi kamu</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide">Username</label>
            <input
              required
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="mis. budisiti"
              className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              autoComplete="username"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide">Kode Lisensi</label>
            <input
              required
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="mis. EVLX-MELATI-CINTA-2847"
              className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all uppercase tracking-wider"
              autoComplete="off"
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
            className="w-full py-3 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Masuk ke Dashboard"}
          </button>

          <p className="text-xs text-center text-brand-text-muted pt-2">
            Belum punya kode lisensi? Hubungi wedding planner kamu untuk mendapatkannya.
          </p>
        </form>
      </div>
    </div>
  );
}
