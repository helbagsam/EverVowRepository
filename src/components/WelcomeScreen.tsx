"use client";

import React from 'react';
import { Sparkles, Compass, Eye, PenLine, ArrowRight, Globe } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { tutorialCopy } from '../lib/tutorialCopy';

const POINT_ICONS = [Compass, Eye, PenLine];

// TAHAP 1 dari alur onboarding: splash sambutan.
// Hanya muncul untuk pembeli yang BENAR-BENAR baru (first-time). Saat
// tutorial dipanggil ulang dari Settings, enterTutorial('replay') langsung
// melompat ke tahap 'guide', jadi layar ini tidak muncul lagi — sambutan
// "Selamat Datang" untuk orang yang sudah lama pakai terasa aneh.
export const WelcomeScreen: React.FC = () => {
  const { tutorialStage, goToGuideStage, exitTutorial, tutorialLang, setTutorialLang } = useAppContext();

  if (tutorialStage !== 'welcome') return null;

  const c = tutorialCopy[tutorialLang].welcome;

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 md:p-6 bg-brand-bg/95 backdrop-blur-md animate-in fade-in duration-500 print:hidden">
      <div className="w-full max-w-2xl text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">

        {/* Language selector — ditaruh di atas supaya user bisa pilih bahasa
            SEBELUM membaca apa pun, bukan setelah terlanjur bingung. */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-1.5 bg-brand-surface border border-brand-border rounded-lg px-2 py-1.5 shadow-sm">
            <Globe size={14} className="text-brand-text-muted" />
            <span className="text-xs font-medium text-brand-text-muted mr-1">{c.langLabel}</span>
            {(['id', 'en'] as const).map((lng) => (
              <button
                key={lng}
                onClick={() => setTutorialLang(lng)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase transition-colors ${
                  tutorialLang === lng ? 'bg-brand-primary text-white' : 'text-brand-text-muted hover:text-brand-text'
                }`}
              >
                {lng}
              </button>
            ))}
          </div>
        </div>

        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-primary/10 border border-brand-accent/30 flex items-center justify-center mb-6">
          <Sparkles size={30} className="text-brand-accent" />
        </div>

        <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-brand-accent mb-3">
          {c.eyebrow}
        </span>
        <h1 className="font-headline text-3xl md:text-4xl text-brand-primary leading-tight mb-4">
          {c.title}
        </h1>
        <p className="text-sm md:text-base text-brand-text-muted leading-relaxed max-w-lg mx-auto mb-10">
          {c.subtitle}
        </p>

        {/* 3 poin = preview alur yang akan dilalui, supaya user tahu ini
            proses bertahap dan tidak merasa "dipaksa" masuk tur panjang. */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
          {c.points.map((p, i) => {
            const Icon = POINT_ICONS[i] ?? Compass;
            return (
              <div key={i} className="p-4 rounded-xl border border-brand-border bg-brand-surface">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-brand-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-brand-text-muted">{i + 1}</span>
                </div>
                <p className="text-sm font-semibold text-brand-text mb-1">{p.title}</p>
                <p className="text-xs text-brand-text-muted leading-snug">{p.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={goToGuideStage}
            className="flex items-center gap-2 px-8 py-3.5 bg-brand-primary text-white rounded-xl font-semibold text-sm shadow-lg hover:bg-brand-primary-hover active:scale-95 transition-all"
          >
            {c.primaryCta} <ArrowRight size={16} />
          </button>
          {/* Escape hatch — user yang sudah paham/tidak sabar tetap bisa
              langsung ke data asli tanpa harus melewati semua tahap. */}
          <button
            onClick={exitTutorial}
            className="text-xs font-medium text-brand-text-muted hover:text-brand-primary underline underline-offset-4 transition-colors"
          >
            {c.skipCta}
          </button>
        </div>
      </div>
    </div>
  );
};
