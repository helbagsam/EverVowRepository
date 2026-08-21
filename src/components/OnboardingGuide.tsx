"use client";

import React, { useState } from 'react';
import {
  Compass, X, Sparkles, ChevronRight, ChevronLeft, Globe, CheckCircle2,
  LayoutDashboard, Wallet, Users, Store, CalendarDays, Shirt, Gamepad2, Camera, Truck, ShieldCheck,
} from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { tutorialCopy } from '../lib/tutorialCopy';

// Ikon untuk grid "Peta Modul" — urutan HARUS sama dengan urutan
// tutorialCopy.guide.modules (Dashboard, Budget, Guest List, Vendors,
// Timeline, Attire, Entertainment, Photo & Video, Logistics, Administration).
const MODULE_ICONS = [LayoutDashboard, Wallet, Users, Store, CalendarDays, Shirt, Gamepad2, Camera, Truck, ShieldCheck];

// Modal "Getting Started Guide" — muncul otomatis saat login pertama kali,
// dan bisa dipanggil ulang kapan saja dari Settings > Getting Started.
// Dashboard di baliknya tetap terisi dummy data selama modal ini terbuka
// (isTutorialMode masih true); menutup modal dengan cara APAPUN (X, "Tutup
// Panduan", atau CTA utama) mengembalikan user ke data asli mereka.
export const OnboardingGuide: React.FC = () => {
  const { tutorialStage, tutorialSessionId, goToPreviewStage, exitTutorial, tutorialLang, setTutorialLang, setCurrentView } = useAppContext();
  const [step, setStep] = useState(0);
  const [stepSessionId, setStepSessionId] = useState(tutorialSessionId);

  // Reset ke langkah 1 setiap kali SESI tutorial baru dimulai (replay dari
  // Settings menaikkan tutorialSessionId), tanpa memakai useEffect —
  // menghitungnya saat render menghindari cascading render sekaligus
  // mencegah modal sempat "berkedip" di step lama sebelum ter-reset.
  // Transisi guide <-> preview TIDAK menaikkan sessionId, jadi posisi step
  // tetap terjaga saat user klik "Buka Panduan" dari strip preview.
  let activeStep = step;
  if (stepSessionId !== tutorialSessionId) {
    activeStep = 0;
    setStepSessionId(tutorialSessionId);
    setStep(0);
  }

  if (tutorialStage !== 'guide') return null;

  const copy = tutorialCopy[tutorialLang];
  const g = copy.guide;
  const total = g.steps.length;
  const current = g.steps[activeStep];

  // "Buka menu X" — lompat ke panel terkait DAN masuk tahap preview,
  // supaya user langsung melihat panel itu terisi contoh data. Bukan
  // exitTutorial, karena user belum selesai belajar di titik ini.
  const goToStepView = () => {
    setCurrentView(current.view);
    goToPreviewStage();
  };

  const finish = () => exitTutorial();
  const seeExample = () => goToPreviewStage();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 print:hidden">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-brand-surface border border-brand-border shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-start gap-4 px-6 md:px-8 py-5 border-b border-brand-border bg-brand-surface/95 backdrop-blur">
          <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
            <Compass size={22} className="text-brand-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-headline text-xl md:text-2xl text-brand-primary leading-tight">{g.title}</h2>
              <span className="px-2 py-0.5 rounded-full bg-brand-accent/15 text-brand-accent text-[10px] font-bold uppercase tracking-wider">
                {g.eyebrow}
              </span>
            </div>
            <p className="text-sm text-brand-text-muted mt-1">{g.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-0.5 bg-brand-surface-hover rounded-md p-0.5 border border-brand-border">
              <Globe size={13} className="text-brand-text-muted ml-1" />
              {(['id', 'en'] as const).map((lng) => (
                <button
                  key={lng}
                  onClick={() => setTutorialLang(lng)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                    tutorialLang === lng ? 'bg-brand-primary text-white' : 'text-brand-text-muted hover:text-brand-text'
                  }`}
                >
                  {lng}
                </button>
              ))}
            </div>
            <button
              onClick={finish}
              aria-label="Close"
              className="w-8 h-8 rounded-full hover:bg-brand-surface-hover flex items-center justify-center text-brand-text-muted hover:text-brand-text transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-6 md:px-8 py-6 space-y-8">
          {/* INTRO */}
          <div className="flex gap-4 p-4 rounded-xl border border-brand-border bg-brand-surface-hover/40">
            <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
              {g.introLabel}
            </div>
            <p className="text-sm text-brand-text-muted leading-relaxed">{g.introText}</p>
          </div>

          {/* STEP TABS */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-text-muted mb-3">{g.flowLabel}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {g.steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    i === activeStep
                      ? 'border-brand-primary bg-brand-primary/5 shadow-sm'
                      : 'border-brand-border hover:border-brand-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === activeStep ? 'bg-brand-primary text-white' : 'bg-brand-surface-hover text-brand-text-muted'
                    }`}>
                      {i + 1}
                    </span>
                    {i < activeStep && <CheckCircle2 size={16} className="text-brand-success" />}
                  </div>
                  <p className={`text-sm font-semibold leading-snug ${i === activeStep ? 'text-brand-primary' : 'text-brand-text'}`}>
                    {s.title}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* STEP DETAIL */}
          <div className="rounded-xl border border-brand-border overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-brand-surface-hover/50 border-b border-brand-border">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded-md bg-brand-primary/10 text-brand-primary text-[11px] font-bold uppercase tracking-wide shrink-0">
                  {g.stepLabel.replace('{n}', String(activeStep + 1)).replace('{total}', String(total))}
                </span>
                <h3 className="font-headline text-lg text-brand-text">{current.title}</h3>
              </div>
              <button
                onClick={goToStepView}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-semibold hover:bg-brand-primary-hover active:scale-95 transition-all whitespace-nowrap"
              >
                {current.openMenu} <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
              <div>
                <ul className="space-y-2.5">
                  {current.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-brand-text-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-1.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-brand-accent/10 border border-brand-accent/25">
                <p className="text-xs font-bold text-brand-accent uppercase tracking-wide mb-1.5">💡 {current.whyLabel}</p>
                <p className="text-sm text-brand-text-muted leading-relaxed">{current.why}</p>
              </div>
            </div>

            {/* Prev / Next */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-brand-border bg-brand-surface-hover/30">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={activeStep === 0}
                className="flex items-center gap-1 text-xs font-semibold text-brand-text-muted hover:text-brand-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={14} /> {tutorialLang === 'id' ? 'Sebelumnya' : 'Previous'}
              </button>
              <div className="flex items-center gap-1.5">
                {g.steps.map((_, i) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeStep ? 'bg-brand-primary' : 'bg-brand-border'}`} />
                ))}
              </div>
              <button
                onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
                disabled={activeStep === total - 1}
                className="flex items-center gap-1 text-xs font-semibold text-brand-text-muted hover:text-brand-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                {tutorialLang === 'id' ? 'Berikutnya' : 'Next'} <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* MODULE MATRIX */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-text-muted mb-3">{g.matrixTitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {g.modules.map((m, i) => {
                const Icon = MODULE_ICONS[i] ?? LayoutDashboard;
                return (
                  <div key={m.name} className="flex items-start gap-3 p-3.5 rounded-lg border border-brand-border bg-brand-surface-hover/30">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-brand-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-text">{m.name}</p>
                      <p className="text-xs text-brand-text-muted leading-snug mt-0.5">{m.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 px-6 md:px-8 py-4 border-t border-brand-border bg-brand-surface/95 backdrop-blur">
          <span className="flex items-center gap-1.5 text-xs text-brand-text-muted">
            <CheckCircle2 size={14} className="text-brand-success shrink-0" /> {g.footerNote}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={finish}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-brand-text-muted hover:bg-brand-surface-hover transition-colors"
            >
              {g.secondaryCta}
            </button>
            <button
              onClick={seeExample}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-semibold shadow-md hover:bg-brand-primary-hover active:scale-95 transition-all"
            >
              <Sparkles size={15} />
              {g.primaryCta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
