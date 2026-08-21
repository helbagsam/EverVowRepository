"use client";

import React from 'react';
import { Eye, BookOpen, Check } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { tutorialCopy } from '../lib/tutorialCopy';

// TAHAP 3 dari alur onboarding: user bebas menjelajah dummy data.
// Sengaja strip tipis satu baris (bukan modal/kartu besar) karena di tahap
// ini fokus user adalah MELIHAT panel-panelnya — apa pun yang menutupi
// konten justru melawan tujuan tahap ini. Strip tetap terlihat di semua
// panel sebagai pengingat permanen "ini bukan data Anda", plus dua jalan
// keluar: buka panduan lagi, atau selesai dan mulai isi data asli.
export const PreviewStrip: React.FC = () => {
  const { tutorialStage, goToGuideStage, exitTutorial, tutorialLang } = useAppContext();

  if (tutorialStage !== 'preview') return null;

  const c = tutorialCopy[tutorialLang].preview;

  return (
    <div
      className="relative flex items-center gap-3 px-4 md:px-6 h-12 border-b animate-in fade-in slide-in-from-top-2 duration-300 print:hidden"
      style={{
        background: 'linear-gradient(90deg, #6b3138 0%, #8B4A52 55%, #6b3138 100%)',
        borderColor: 'rgba(184,150,90,0.35)',
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #B8965A, transparent)' }} />

      <Eye size={15} className="text-brand-accent shrink-0" />
      <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest text-brand-accent shrink-0">
        {c.badge}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-white text-xs md:text-sm font-medium truncate">{c.title}</p>
        <p className="hidden lg:block text-white/60 text-[11px] truncate">{c.hint}</p>
      </div>

      <button
        onClick={goToGuideStage}
        className="shrink-0 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] md:text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors whitespace-nowrap"
      >
        <BookOpen size={12} />
        {c.reopenGuide}
      </button>

      <button
        onClick={exitTutorial}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white text-brand-primary rounded-lg text-[11px] md:text-xs font-semibold hover:bg-white/90 active:scale-95 transition-all whitespace-nowrap"
      >
        <Check size={12} />
        {c.exitCta}
      </button>
    </div>
  );
};
