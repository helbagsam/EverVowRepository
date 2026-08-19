"use client";

import React from 'react';
import { AppProvider, useAppContext } from '@/store/AppContext';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { Dashboard } from '@/views/Dashboard';
import { GuestList } from '@/views/GuestList';
import { Budget } from '@/views/Budget';
import { Settings } from '@/views/Settings';
import { Administration } from '@/views/Administration';
import { Entertainment } from '@/views/Entertainment';
import { Attire } from '@/views/Attire';
import { Logistics } from '@/views/Logistics';
import { PhotoVideo } from '@/views/PhotoVideo';
import { Timeline } from '@/views/Timeline';
import { HelpCenter } from '@/views/HelpCenter';
import { Vendors } from '@/views/Vendors';

function LoadingSkeleton() {
  return (
    <div className="flex h-dvh items-center justify-center bg-brand-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
        <p className="text-sm text-brand-text-muted">Memuat data pernikahan kamu...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { currentView, setCurrentView, loading } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (loading) return <LoadingSkeleton />;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'guests': return <GuestList />;
      case 'vendors': return <Vendors />;
      case 'budget': return <Budget />;
      case 'settings': return <Settings />;
      case 'admin': return <Administration />;
      case 'entertainment': return <Entertainment />;
      case 'attire': return <Attire />;
      case 'logistics': return <Logistics />;
      case 'photo': return <PhotoVideo />;
      case 'timeline': return <Timeline />;
      case 'help': return <HelpCenter />;
      default: return (
        <div className="flex items-center justify-center h-full text-brand-text-muted">
          <div className="text-center">
            <h2 className="font-headline text-3xl mb-2 text-brand-primary">Coming Soon</h2>
            <p>This module is currently being crafted for your luxury experience.</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-brand-bg text-brand-text font-body transition-colors duration-300 print:block print:h-auto print:overflow-visible">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 md:ml-64 flex flex-col h-dvh overflow-hidden print:ml-0 print:h-auto print:overflow-visible print:block">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 hide-scrollbar print:overflow-visible print:p-0">
          <div id="print-area">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
