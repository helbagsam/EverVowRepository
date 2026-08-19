"use client";

import React from 'react';
import { Sparkles, X, ArrowRight, Globe } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { tutorialCopy } from '../lib/tutorialCopy';

// Banner floating luxury yang muncul di atas semua panel selama
// isTutorialMode aktif. Dua varian copy berbeda tergantung tutorialTrigger:
// - "first-time": user baru pertama kali masuk, dashboard sudah penuh
//   dummy data. Fokus copy: ajak pindah ke data asli.
// - "replay": user memanggil ulang tutorial dari Settings di tengah jalan.
//   Fokus copy: pengingat ini cuma pratinjau, tombol kembali ke data asli.
export const TutorialBanner: React.FC = () => {
  const { isTutorialMode, tutorialTrigger, exitTutorial, tutorialLang, setTutorialLang } = useAppContext();

  if (!isTutorialMode) return null;

  const copy = tutorialCopy[tutorialLang];
  const isReplay = tutorialTrigger === 'replay';
  const variant = isReplay ? copy.replay : copy.firstTime;
  // Ekstrak label tombol secara eksplisit di sini (bukan di JSX) supaya
  // TypeScript tidak bingung menyempitkan union type "replay | firstTime".
  const ctaLabel = isReplay ? copy.replay.exitCta : copy.firstTime.cta;

  return (
    <div className="sticky top-0 z-[120] px-4 pt-4 md:px-6 md:pt-6 print:hidden animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="max-w-[1440px] mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-brand-accent/40 shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #8B4A52 0%, #6b3138 55%, #4a2126 100%)',
          }}
        >
          {/* Aksen dekoratif — garis emas tipis khas luxury */}
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: 'linear-gradient(90deg, transparent, #B8965A, transparent)' }} />

          <div className="relative flex flex-col md:flex-row md:items-center gap-4 px-5 py-4 md:px-7 md:py-5">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Sparkles size={20} className="text-brand-accent" />
              </div>
              <div className="min-w-0">
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-1">
                  {variant.badge}
                </span>
                <h3 className="font-headline text-lg md:text-xl text-white leading-snug">
                  {variant.title}
                </h3>
                <p className="text-white/75 text-xs md:text-sm mt-1 leading-relaxed max-w-2xl">
                  {variant.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-stretch md:self-center pl-0 md:pl-2">
              {/* Language toggle — pilihan bahasa, bukan dua bahasa sekaligus */}
              <div className="hidden sm:flex items-center gap-1 bg-white/10 border border-white/15 rounded-lg p-1">
                <Globe size={14} className="text-white/50 ml-1.5" />
                {(['id', 'en'] as const).map((lng) => (
                  <button
                    key={lng}
                    onClick={() => setTutorialLang(lng)}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase transition-colors ${
                      tutorialLang === lng ? 'bg-white text-brand-primary' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {lng}
                  </button>
                ))}
              </div>

              {isReplay ? (
                <button
                  onClick={exitTutorial}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-brand-primary rounded-xl text-xs md:text-sm font-semibold hover:bg-white/90 active:scale-95 transition-all shadow-sm whitespace-nowrap"
                >
                  <X size={16} />
                  {ctaLabel}
                </button>
              ) : (
                <button
                  onClick={exitTutorial}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-brand-primary rounded-xl text-xs md:text-sm font-semibold hover:bg-white/90 active:scale-95 transition-all shadow-sm whitespace-nowrap"
                >
                  {ctaLabel}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Quick-exit kecil, selalu ada terlepas dari tombol CTA utama —
              supaya user first-time pun bisa langsung kabur dari preview
              kalau tidak sabar menunggu, tanpa kehilangan opsi CTA utama. */}
          <button
            onClick={exitTutorial}
            aria-label="Close preview"
            className="absolute top-3 right-3 md:hidden w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
