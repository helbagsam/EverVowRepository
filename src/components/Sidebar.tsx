"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  Store, 
  CalendarDays, 
  Shirt, 
  Gamepad2, 
  Camera, 
  Truck, 
  ShieldCheck, 
  Settings, 
  HelpCircle, 
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, mobileOpen, onCloseMobile }) => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };
  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'budget', label: 'Budget', icon: Wallet },
    { id: 'guests', label: 'Daftar Tamu', icon: Users },
    { id: 'vendors', label: 'Vendor', icon: Store },
    { id: 'timeline', label: 'Timeline', icon: CalendarDays },
    { id: 'attire', label: 'Busana', icon: Shirt },
    { id: 'entertainment', label: 'Hiburan', icon: Gamepad2 },
    { id: 'photo', label: 'Foto & Video', icon: Camera },
    { id: 'logistics', label: 'Logistik', icon: Truck },
    { id: 'admin', label: 'Administrasi', icon: ShieldCheck },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    setCurrentView(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Backdrop khusus mobile — klik di luar sidebar untuk menutup */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden print:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`flex flex-col w-64 bg-brand-surface border-r border-brand-border h-dvh fixed left-0 top-0 py-4 gap-1 z-50 overflow-y-auto hide-scrollbar print:hidden
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="px-6 mb-8 mt-2 flex items-center justify-between">
          <div className="flex flex-col items-start cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <h1 className="font-headline text-2xl text-brand-primary tracking-tight">EverVow Lux</h1>
            <span className="text-xs font-semibold text-brand-text-muted uppercase tracking-widest mt-1">Perencanaan Mewah</span>
          </div>
          <button onClick={onCloseMobile} className="md:hidden text-brand-text-muted hover:text-brand-primary p-1">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 flex flex-col gap-1 px-2">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                  isActive 
                    ? 'bg-brand-primary text-white font-semibold shadow-sm scale-[0.98]' 
                    : 'text-brand-text-muted hover:bg-brand-surface-hover hover:text-brand-primary'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : ''} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto px-2 pt-4 border-t border-brand-border flex flex-col gap-1">
          <button onClick={() => handleNavClick('help')} className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors text-left ${currentView === 'help' ? 'bg-brand-primary text-white font-semibold shadow-sm' : 'text-brand-text-muted hover:bg-brand-surface-hover hover:text-brand-primary'}`}>
            <HelpCircle size={20} />
            <span className="text-sm">Pusat Bantuan</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-brand-danger hover:bg-brand-danger-bg rounded-xl transition-colors text-left">
            <LogOut size={20} />
            <span className="text-sm">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};
