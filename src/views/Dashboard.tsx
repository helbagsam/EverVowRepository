"use client";

import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatIDR, formatShortIDR } from '../utils/formatters';
import { generateSummaryPdf, downloadPdfBytes } from '../utils/exportSummaryPdf';
import { vendorStatusLabel, taskPriorityLabel } from '../lib/labels';

export const Dashboard = () => {
  const { 
    expenses, guests, tasks, activities, setCurrentView, 
    weddingDate, totalBudget, targetGuests, coupleProfile,
    vendors, logistics, rentals, handovers, logisticsTimelines 
  } = useAppContext();
  
  const targetDate = new Date(weddingDate || '2024-10-24');
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const diffHrs = Math.max(0, Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  // Derived Budget Data
  const totalProjected = totalBudget;
  const totalPaid = expenses.reduce((sum, e) => sum + e.paid, 0);
  const remainingAllocated = totalProjected - totalPaid;
  const paidPercent = totalProjected ? Math.round((totalPaid / totalProjected) * 100) : 0;
  // Total nilai yang sudah dialokasikan ke pos-pos expense (baik sudah
  // dibayar maupun belum), dibanding target budget keseluruhan.
  const totalAllocatedExpenses = expenses.reduce((sum, e) => sum + (e.total || 0), 0);
  const allocatedPercent = totalBudget > 0 ? Math.min(100, Math.round((totalAllocatedExpenses / totalBudget) * 100)) : 0;
  
  // Format currency

  // Derived Guest Data
  const totalGuests = targetGuests;
  const confirmedGuests = guests.filter(g => g.status === 'Confirmed').length;
  const pendingGuests = guests.filter(g => g.status === 'Pending').length;
  const declinedGuests = guests.filter(g => g.status === 'Declined').length;
  const confirmedPercent = totalGuests ? Math.round((confirmedGuests / totalGuests) * 100) : 0;
  const pendingPercent = totalGuests ? Math.round((pendingGuests / totalGuests) * 100) : 0;
  const declinedPercent = totalGuests ? Math.round((declinedGuests / totalGuests) * 100) : 0;

  // Derived Vendor & Logistics Data
  const totalVendors = vendors.length;
  const bookedVendors = vendors.filter(v => v.status === 'BOOKED' || v.status === 'COMPLETED').length;
  const vendorContractValue = vendors.reduce((acc, v) => acc + (v.totalValue || 0), 0);
  
  const totalLogisticsCount = logistics.length;
  const pendingLogisticsCount = logistics.filter(l => l.status === 'Pending' || l.status === 'Inquiry').length;
  const pendingHandoversCount = handovers.filter(h => h.status === 'Pending').length;

  // Derived Timeline / Tasks Data
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const upcomingTasks = tasks.filter(t => t.status !== 'Completed').slice(0, 3);

  // Derived "Recent Activity" — item terakhir yang ditambahkan ke tiap
  // array (bukan konten statis fiktif seperti sebelumnya). Karena semua
  // fungsi add* selalu menambah ke akhir array, item terakhir = yang
  // paling baru ditambahkan.
  const latestGuest = guests.length > 0 ? guests[guests.length - 1] : null;
  const latestExpense = expenses.length > 0 ? expenses[expenses.length - 1] : null;
  const latestVendor = vendors.length > 0 ? vendors[vendors.length - 1] : null;
  const hasAnyActivity = latestGuest || latestExpense || latestVendor;

  const [showConfirm, setShowConfirm] = useState(false);
  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const coupleTitle = (coupleProfile.groomName || coupleProfile.brideName)
        ? `${coupleProfile.groomName || ''} & ${coupleProfile.brideName || ''}`.trim()
        : 'EverVow Lux';
      const weddingDateLabel = weddingDate
        ? new Date(weddingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Tanggal belum diatur';
      const daysLeftLabel = diffDays > 0 ? `${diffDays} hari lagi` : 'Hari H sudah tiba';

      const bytes = await generateSummaryPdf({
        coupleTitle,
        weddingDateLabel,
        daysLeftLabel,
        totalBudget,
        totalPaid,
        totalAllocated: totalAllocatedExpenses,
        totalGuests,
        confirmedGuests,
        pendingGuests,
        declinedGuests,
        totalVendors,
        bookedVendors,
        totalTasks,
        completedTasks,
      });
      downloadPdfBytes(bytes, `EverVow_Ringkasan_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      alert('Gagal membuat PDF. Coba lagi.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-500 pb-24">
      <style dangerouslySetInnerHTML={{__html: `
        .luxury-shadow-1 { box-shadow: 0px 4px 20px rgba(139, 74, 82, 0.05); }
        .text-gradient-primary {
            background: linear-gradient(135deg, #8B4A52 0%, #B8965A 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            color: transparent;
        }
      `}} />

      {/* Welcome Section */}
      <section className="relative bg-brand-surface rounded-xl luxury-shadow-1 border border-brand-border p-8 overflow-hidden flex flex-col md:flex-row items-center justify-between">
        <div className="z-10 relative space-y-4 text-center md:text-left">
          <h1 className="font-headline text-4xl md:text-5xl text-brand-primary tracking-tight">
            {coupleProfile.groomName || coupleProfile.brideName ? (
              <>Selamat datang kembali, <br/><span className="text-gradient-primary">{coupleProfile.groomName?.split(' ')[0] || 'Partner'} & {coupleProfile.brideName?.split(' ')[0] || 'Partner'}</span></>
            ) : (
              <>Selamat Datang di <br/><span className="text-gradient-primary">EverVow Lux</span></>
            )}
          </h1>
          <p className="font-body text-lg text-brand-text-muted max-w-lg">
            {coupleProfile.groomName || coupleProfile.brideName
              ? 'Perjalanan menuju hari sempurna kalian sedang berlangsung dengan indah. Berikut posisi persiapan kalian saat ini.'
              : 'Mulai dengan mengisi nama pasangan di Settings > Client Profile untuk personalisasi dashboard kamu.'}
          </p>
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
            {!(coupleProfile.groomName || coupleProfile.brideName) && (
              <button
                onClick={() => setCurrentView('settings')}
                className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-primary-hover transition-colors shadow-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Lengkapi Profil
              </button>
            )}
            <button 
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-primary-hover transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              {isExportingPdf ? 'Membuat PDF...' : 'Ekspor Ringkasan PDF'}
            </button>
          </div>
        </div>
        
        <div className="hidden lg:flex flex-col items-center gap-2 px-8 border-l border-r border-brand-border/30">
          <div className="relative flex flex-col items-center justify-center gap-4 w-full">
            <div className="relative w-32 h-32 flex items-center justify-center group cursor-pointer" onClick={() => setCurrentView('timeline')}>
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="45" stroke="var(--border)" strokeWidth="8"></circle>
                <circle className="transition-all duration-1000 ease-out group-hover:stroke-brand-primary" cx="50" cy="50" fill="none" r="45" stroke="var(--success)" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * overallProgress) / 100} strokeWidth="8"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-headline text-2xl text-brand-primary">{overallProgress}%</span>
                <span className="font-semibold text-[10px] uppercase tracking-widest text-brand-text-muted">Keseluruhan</span>
              </div>
            </div>
            <div className="w-full max-w-[120px] space-y-2">
              <div className="flex justify-between font-semibold text-[10px] uppercase tracking-wider text-brand-text-muted">
                <span>Milestone</span>
                <span className="font-bold text-brand-primary">{completedTasks}/{totalTasks}</span>
              </div>
              <div className="h-1.5 w-full bg-brand-surface-hover rounded-full overflow-hidden">
                <div className="h-full bg-brand-success rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="z-10 relative mt-8 md:mt-0 flex gap-4 md:gap-8 items-center justify-center">
          <div className="text-center">
            <span className="block font-headline text-5xl text-brand-accent">{String(diffDays).padStart(2, '0')}</span>
            <span className="font-semibold text-xs text-brand-text-muted uppercase tracking-widest">Hari</span>
          </div>
          <div className="text-brand-text-muted font-headline text-5xl opacity-30">:</div>
          <div className="text-center">
            <span className="block font-headline text-5xl text-brand-accent">{String(diffHrs).padStart(2, '0')}</span>
            <span className="font-semibold text-xs text-brand-text-muted uppercase tracking-widest">Jam</span>
          </div>
        </div>
        
        {/* Decorative abstract element */}
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-accent via-transparent to-transparent"></div>
      </section>

      {/* Vendor & Logistics Command Center Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vendor Metrics Card */}
        <div onClick={() => setCurrentView('vendors')} className="bg-brand-surface rounded-xl luxury-shadow-1 border border-brand-border p-6 flex flex-col justify-between group hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-brand-primary">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
              <span className="material-symbols-outlined">storefront</span>
            </div>
            <span className="font-semibold text-xs text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/20 group-hover:bg-brand-primary group-hover:text-white transition-colors">
              Pusat Vendor
            </span>
          </div>

          <div>
            <span className="font-semibold text-[10px] text-brand-text-muted uppercase tracking-widest">Jaringan Partner</span>
            <h3 className="font-headline text-3xl text-brand-primary mb-3">{bookedVendors} / {totalVendors} Dipesan</h3>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-brand-border">
              <div>
                <span className="text-[10px] text-brand-text-muted uppercase block">Nilai Kontrak</span>
                <span className="font-bold text-sm text-brand-text whitespace-nowrap" title={formatIDR(vendorContractValue)}>{formatShortIDR(vendorContractValue)}</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-text-muted uppercase block">Negosiasi</span>
                <span className="font-bold text-sm text-brand-accent">{vendors.filter(v => v.status === 'NEGOTIATING').length} Vendor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logistics Metrics Card */}
        <div onClick={() => setCurrentView('logistics')} className="bg-brand-surface rounded-xl luxury-shadow-1 border border-brand-border p-6 flex flex-col justify-between group hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-brand-accent">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-brand-accent/10 rounded-lg text-brand-accent">
              <span className="material-symbols-outlined">local_shipping</span>
            </div>
            <span className="font-semibold text-xs text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full border border-brand-accent/20 group-hover:bg-brand-accent group-hover:text-white transition-colors">
              Pusat Operasi
            </span>
          </div>

          <div>
            <span className="font-semibold text-[10px] text-brand-text-muted uppercase tracking-widest">Aset & Protokol Acara</span>
            <h3 className="font-headline text-3xl text-brand-primary mb-3">{totalLogisticsCount} Item Terlacak</h3>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-brand-border">
              <div>
                <span className="text-[10px] text-brand-text-muted uppercase block">Logistik Tertunda</span>
                <span className="font-bold text-sm text-brand-warning">{pendingLogisticsCount} Tertunda</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-text-muted uppercase block">Protokol Serah Terima</span>
                <span className="font-bold text-sm text-brand-success">{pendingHandoversCount} Tertunda</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Metrics Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Budget Card */}
        <div onClick={() => setCurrentView('budget')} className="bg-brand-surface rounded-xl luxury-shadow-1 border border-brand-border p-6 flex flex-col justify-between group hover:shadow-lg transition-shadow duration-300 hover:scale-[1.01] transition-transform cursor-pointer">
          <div className="flex justify-between items-start mb-6">
            <div className="p-2 bg-brand-surface-hover rounded-lg group-hover:bg-brand-primary/10 transition-colors duration-300">
              <span className="material-symbols-outlined text-brand-primary">account_balance_wallet</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-semibold text-[10px] text-brand-success uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">trending_up</span> Sesuai Rencana
              </span>
              <span className="font-headline text-xl text-brand-primary mt-1">{formatIDR(totalProjected)}</span>
              <span className="font-semibold text-[8px] text-brand-text-muted uppercase tracking-widest">Target Budget</span>
            </div>
          </div>
          
          <div className="relative h-24 flex items-center justify-center mb-6 group/chart">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="40" stroke="var(--border)" strokeWidth="12"></circle>
              {/* Remaining (Rose Gold) */}
              <circle className="transition-all duration-500 opacity-40 group-hover/chart:opacity-100" cx="50" cy="50" fill="none" r="40" stroke="var(--accent)" strokeDasharray="251.3" strokeDashoffset={251.3 - (251.3 * (100 - paidPercent))/100} strokeWidth="12"></circle>
              {/* Paid (Deep Burgundy) */}
              <circle className="transition-all duration-500 group-hover/chart:scale-105 origin-center" cx="50" cy="50" fill="none" r="40" stroke="var(--primary)" strokeDasharray="251.3" strokeDashoffset={251.3 - (251.3 * paidPercent)/100} strokeWidth="12"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-headline text-xl text-brand-primary">{paidPercent}%</span>
              <span className="font-semibold text-[8px] uppercase text-brand-text-muted">Terbayar</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-end">
                <h3 className="font-headline text-lg text-brand-text">Kesehatan Budget</h3>
                <span className="font-semibold text-xs text-brand-primary">{allocatedPercent}% Teralokasi</span>
              </div>
              <div className="h-2 w-full bg-brand-surface-hover rounded-full overflow-hidden flex">
                <div className="h-full bg-brand-success" style={{ width: `${paidPercent}%` }} title="Terbayar"></div>
                <div className="h-full bg-brand-warning" style={{ width: `${100 - paidPercent}%` }} title="Sisa"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="flex flex-col p-2 rounded-lg hover:bg-brand-success/10 transition-colors w-full min-w-0">
                <span className="font-semibold text-[10px] text-brand-text-muted uppercase">Terbayar</span>
                <span className="font-bold text-brand-success text-xs whitespace-nowrap overflow-hidden text-ellipsis" title={formatIDR(totalPaid)}>{formatShortIDR(totalPaid)}</span>
              </div>
              <div className="flex flex-col p-2 rounded-lg hover:bg-brand-warning/10 transition-colors w-full min-w-0">
                <span className="font-semibold text-[10px] text-brand-text-muted uppercase">Sisa</span>
                <span className="font-bold text-brand-warning text-xs whitespace-nowrap overflow-hidden text-ellipsis" title={formatIDR(remainingAllocated)}>{formatShortIDR(remainingAllocated)}</span>
              </div>
              <div className="flex flex-col p-2 rounded-lg hover:bg-brand-surface-hover transition-colors w-full min-w-0">
                <span className="font-semibold text-[10px] text-brand-text-muted uppercase">Proj.</span>
                <span className="font-bold text-brand-text-muted text-xs whitespace-nowrap overflow-hidden text-ellipsis" title={formatIDR(totalProjected)}>{formatShortIDR(totalProjected)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guests Card */}
        <div onClick={() => setCurrentView('guests')} className="bg-brand-surface rounded-xl luxury-shadow-1 border border-brand-border p-6 flex flex-col justify-between group hover:shadow-lg transition-shadow duration-300 hover:scale-[1.01] transition-transform cursor-pointer">
          <div className="flex justify-between items-start mb-6">
            <div className="p-2 bg-brand-surface-hover rounded-lg group-hover:bg-brand-primary/10 transition-colors duration-300">
              <span className="material-symbols-outlined text-brand-primary">group_add</span>
            </div>
            <span className="font-semibold text-xs text-brand-text-muted bg-brand-surface px-3 py-1 rounded-full border border-brand-border group-hover:bg-brand-primary group-hover:text-white transition-colors">Kelola</span>
          </div>

          <div className="flex-1 flex flex-col">
            <h3 className="font-headline text-2xl text-brand-text mb-6">Kesiapan Tamu</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-[10px] text-brand-text-muted uppercase tracking-wider">Tingkat Respons</span>
                  <span className="font-semibold text-xl text-brand-primary">{confirmedGuests} <span className="text-sm font-normal text-brand-text-muted">/ {totalGuests}</span></span>
                </div>
                <div className="h-3 w-full bg-brand-surface-hover rounded-full overflow-hidden flex">
                  <div className="h-full bg-brand-success" style={{ width: `${confirmedPercent}%` }} title="Terkonfirmasi"></div>
                  <div className="h-full bg-brand-warning" style={{ width: `${pendingPercent}%` }} title="Menunggu"></div>
                  <div className="h-full bg-brand-text-muted/30" style={{ width: `${declinedPercent}%` }} title="Menolak"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-brand-surface-hover transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-success"></div>
                    <span className="font-semibold text-[10px] text-brand-text-muted uppercase">Terkonfirmasi</span>
                  </div>
                  <span className="font-bold text-sm text-brand-success">{confirmedGuests}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-brand-surface-hover transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-warning"></div>
                    <span className="font-semibold text-[10px] text-brand-text-muted uppercase">Menunggu</span>
                  </div>
                  <span className="font-bold text-sm text-brand-warning">{pendingGuests}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-brand-surface-hover transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-border"></div>
                    <span className="font-semibold text-[10px] text-brand-text-muted uppercase">Menolak</span>
                  </div>
                  <span className="font-bold text-sm text-brand-text-muted">{declinedGuests}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Card */}
        <div className="bg-brand-surface rounded-xl luxury-shadow-1 border border-brand-border p-6 flex flex-col justify-between group hover:shadow-lg transition-shadow duration-300 lg:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-brand-surface-hover rounded-lg group-hover:bg-brand-primary/10 transition-colors duration-300 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-brand-primary">task_alt</span>
            </div>
            <button onClick={() => setCurrentView('timeline')} className="font-semibold text-xs text-brand-accent hover:text-brand-primary transition-colors flex items-center hover:underline active:scale-95 transition-transform">
              Lihat Semua <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
            </button>
          </div>

          <div>
            <h3 className="font-headline text-2xl text-brand-text mb-4">Milestone Mendatang</h3>
            <ul className="space-y-3">
              {upcomingTasks.map((t, idx) => (
                <li key={t.id || idx} onClick={() => setCurrentView('timeline')} className={`flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer group/item border-l-4 shadow-sm hover:shadow-md hover:scale-[1.02] ${
                  t.priority === 'High' ? 'bg-brand-primary/5 hover:bg-brand-primary/10 border-brand-primary' :
                  t.priority === 'Medium' ? 'bg-brand-warning/5 hover:bg-brand-warning/10 border-brand-warning' :
                  'bg-brand-success/5 hover:bg-brand-success/10 border-brand-success'
                }`}>
                  <div className="flex-1">
                    <span className="font-semibold text-base text-brand-text block mb-1">{t.title}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-[10px] uppercase tracking-widest ${
                         t.priority === 'High' ? 'text-brand-primary' :
                         t.priority === 'Medium' ? 'text-brand-warning' : 'text-brand-success'
                      }`}>Prioritas {taskPriorityLabel(t.priority)}</span>
                      <span className="text-brand-border">|</span>
                      <span className="font-medium text-[10px] text-brand-text-muted italic">{t.dueDate}</span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setCurrentView('timeline'); }} className="group-hover/item:opacity-100 opacity-0 transition-all bg-brand-primary text-white px-4 py-2 rounded-lg font-semibold text-[10px] uppercase hover:opacity-90 hover:shadow-md active:scale-95">Lihat Detail</button>
                </li>
              ))}
              {upcomingTasks.length === 0 && (
                <div className="text-center py-6 text-brand-text-muted italic border-2 border-dashed border-brand-border rounded-xl">Semua milestone sudah selesai!</div>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section className="bg-brand-surface rounded-xl luxury-shadow-1 border border-brand-border overflow-hidden">
        <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-surface-hover/30">
          <h2 className="font-headline text-2xl text-brand-primary">Aktivitas Terbaru</h2>
          <div className="relative">
            <button onClick={() => setShowActivityMenu(!showActivityMenu)} className="material-symbols-outlined text-brand-text-muted hover:text-brand-primary transition-colors focus:outline-none">
              more_horiz
            </button>
            {showActivityMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-brand-surface border border-brand-border rounded-xl shadow-md z-50 p-2 space-y-1">
                <button onClick={() => setCurrentView('timeline')} className="w-full text-left px-3 py-2 text-sm hover:bg-brand-surface-hover rounded-lg transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">list_alt</span> Lihat Semua Aktivitas
                </button>
                <button onClick={() => setCurrentView('settings')} className="w-full text-left px-3 py-2 text-sm hover:bg-brand-surface-hover rounded-lg transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">settings</span> Pengaturan Aktivitas
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-6">
          {!hasAnyActivity ? (
            <div className="text-center py-10 text-brand-text-muted">
              <p className="font-semibold mb-1">Belum ada aktivitas.</p>
              <p className="text-sm">Aktivitas terbaru akan muncul di sini setelah kamu mulai mengisi data tamu, vendor, atau budget.</p>
            </div>
          ) : (
            <div className="relative border-l border-brand-border ml-4 space-y-8">
              {latestExpense && (
                <div className="relative pl-8">
                  <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-brand-surface border-2 border-brand-accent flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-brand-accent"></div>
                  </div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-lg text-brand-text">Pengeluaran Terbaru</h4>
                  </div>
                  <p className="font-body text-sm text-brand-text-muted mb-2">{latestExpense.name}{latestExpense.vendor ? ` — ${latestExpense.vendor}` : ''}</p>
                  <span className="inline-block px-3 py-1 bg-brand-surface-hover text-brand-text-muted font-semibold text-xs rounded-full border border-brand-border">{formatIDR(latestExpense.total)}</span>
                  <button onClick={() => setCurrentView('budget')} className="mt-2 text-brand-primary font-semibold text-xs hover:underline flex items-center gap-1">Lihat Budget <span className="material-symbols-outlined text-sm">open_in_new</span></button>
                </div>
              )}

              {latestGuest && (
                <div className="relative pl-8">
                  <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-brand-surface border-2 border-brand-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                  </div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-lg text-brand-text">Tamu Terbaru</h4>
                  </div>
                  <p className="font-body text-sm text-brand-text-muted mb-2">{latestGuest.name} ditambahkan ke grup '{latestGuest.group}'.</p>
                  <button onClick={() => setCurrentView('guests')} className="mt-2 text-brand-primary font-semibold text-xs hover:underline flex items-center gap-1">Lihat Daftar Tamu <span className="material-symbols-outlined text-sm">open_in_new</span></button>
                </div>
              )}

              {latestVendor && (
                <div className="relative pl-8">
                  <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-brand-surface border-2 border-brand-border flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-brand-border"></div>
                  </div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-lg text-brand-text">Vendor Terbaru</h4>
                  </div>
                  <p className="font-body text-sm text-brand-text-muted mb-3">{latestVendor.name} — {latestVendor.category} ({vendorStatusLabel(latestVendor.status)}).</p>
                  <button onClick={() => setCurrentView('vendors')} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-surface text-brand-primary font-semibold text-xs rounded-xl border border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">storefront</span>
                    Lihat Vendor
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {showConfirm && (
        <ConfirmDialog 
          isOpen={showConfirm}
          title="Konfirmasi Tindakan"
          message="Apakah kamu yakin ingin melanjutkan tindakan ini?"
          type="info"
          confirmText="Ya, Lanjutkan"
          onConfirm={() => setShowConfirm(false)}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};
