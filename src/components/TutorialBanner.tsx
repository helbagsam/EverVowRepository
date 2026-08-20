"use client";

import React, { useState } from 'react';
import { Sparkles, X, ArrowRight, ChevronDown } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { tutorialCopy } from '../lib/tutorialCopy';

// Strip tipis (bukan kartu besar) yang menyatu langsung di bawah Topbar —
// satu baris saja, warna solid senada brand, tanpa margin/rounded-corner/
// shadow yang membuatnya terasa seperti widget terpisah yang menghalangi.
// Deskripsi panjang disembunyikan di balik "expand" (klik judul atau
// chevron) supaya baris utama tetap ringkas dan tidak makan tempat,
// tapi detailnya tetap bisa diakses kapan saja user butuh.
export const TutorialBanner: React.FC = () => {
  const { isTutorialMode, tutorialTrigger, exitTutorial, tutorialLang, setTutorialLang } = useAppContext();
  const [expanded, setExpanded] = useState(false);

  if (!isTutorialMode) return null;

  const copy = tutorialCopy[tutorialLang];
  const isReplay = tutorialTrigger === 'replay';
  const variant = isReplay ? copy.replay : copy.firstTime;
  const ctaLabel = isReplay ? copy.replay.exitCta : copy.firstTime.cta;
  const ctaShort = isReplay ? (tutorialLang === 'id' ? 'Keluar' : 'Exit') : (tutorialLang === 'id' ? 'Mulai' : 'Start');

  return (
    <div className="animate-in fade-in duration-300 print:hidden">
      {/* Baris utama — tinggi tetap ~48px, edge-to-edge, sejajar dengan
          padding Topbar (px-6) supaya terasa seperti kelanjutan header,
          bukan elemen baru yang disisipkan. */}
      <div
        className="relative flex items-center gap-3 px-4 md:px-6 h-12 border-b"
        style={{
          background: 'linear-gradient(90deg, #6b3138 0%, #8B4A52 55%, #6b3138 100%)',
          borderColor: 'rgba(184,150,90,0.35)',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #B8965A, transparent)' }} />

        <Sparkles size={15} className="text-brand-accent shrink-0" />

        <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest text-brand-accent shrink-0">
          {variant.badge}
        </span>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 min-w-0 flex-1 text-left group"
        >
          <span className="text-white text-xs md:text-sm font-medium truncate">
            {variant.title}
          </span>
          <ChevronDown
            size={13}
            className={`text-white/50 shrink-0 transition-transform group-hover:text-white/80 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Language toggle — pilihan, bukan dua bahasa ditampilkan sekaligus */}
        <div className="hidden lg:flex items-center gap-0.5 bg-white/10 rounded-md p-0.5 shrink-0">
          {(['id', 'en'] as const).map((lng) => (
            <button
              key={lng}
              onClick={() => setTutorialLang(lng)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                tutorialLang === lng ? 'bg-white text-brand-primary' : 'text-white/60 hover:text-white'
              }`}
            >
              {lng}
            </button>
          ))}
        </div>

        <button
          onClick={exitTutorial}
          className="shrink-0 flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 bg-white text-brand-primary rounded-lg text-[11px] md:text-xs font-semibold hover:bg-white/90 active:scale-95 transition-all whitespace-nowrap"
        >
          <span className="hidden sm:inline">{ctaLabel}</span>
          <span className="sm:hidden">{ctaShort}</span>
          {isReplay ? <X size={12} /> : <ArrowRight size={12} />}
        </button>
      </div>

      {/* Detail — hanya render kalau user klik expand. Ini menjaga baris
          utama tetap satu baris tipis di semua kondisi. */}
      {expanded && (
        <div className="px-4 md:px-6 py-3 text-xs md:text-sm text-brand-text-muted bg-brand-surface-hover border-b border-brand-border animate-in fade-in duration-200">
          {variant.description}
        </div>
      )}
    </div>
  );
};
