"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, Bell, RefreshCw, ChevronDown, Moon, Sun, Settings, User, LogOut, CheckCircle2, AlertCircle, Info, Flame } from 'lucide-react';
import { useAppContext } from '../store/AppContext';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const { setCurrentView, username } = useAppContext();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const initials = username ? username.slice(0, 2).toUpperCase() : '?';
  
  const [isDark, setIsDark] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Dynamic notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Deposit paid to The Grand Estate', time: '2 hours ago', unread: true, urgency: 'success' },
    { id: 2, text: 'Sarah RSVPed "Attending"', time: 'Yesterday', unread: true, urgency: 'info' },
    { id: 3, text: 'Photography contract signed', time: 'Oct 05', unread: false, urgency: 'success' },
    { id: 4, text: 'Overdue: Finalize Guest List', time: '2 days ago', unread: true, urgency: 'high' },
    { id: 5, text: 'Budget exceeded in "Attire" category', time: '1 week ago', unread: true, urgency: 'medium' },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const getUrgencyIcon = (urgency: string, unread: boolean) => {
    if (!unread) return <CheckCircle2 size={16} className="text-brand-text-muted" />;
    
    switch (urgency) {
      case 'high': return <Flame size={16} className="text-brand-danger" />;
      case 'medium': return <AlertCircle size={16} className="text-brand-warning" />;
      case 'success': return <CheckCircle2 size={16} className="text-brand-success" />;
      case 'info':
      default: return <Info size={16} className="text-brand-primary" />;
    }
  };

  const getUrgencyBg = (urgency: string, unread: boolean) => {
    if (!unread) return '';
    switch (urgency) {
      case 'high': return 'bg-brand-danger/5 border-l-2 border-brand-danger';
      case 'medium': return 'bg-brand-warning/5 border-l-2 border-brand-warning';
      case 'success': return 'bg-brand-success/5 border-l-2 border-brand-success';
      case 'info':
      default: return 'bg-brand-primary/5 border-l-2 border-brand-primary';
    }
  };

  return (
    <header className="h-[72px] glass-panel border-b border-brand-border flex items-center justify-between px-6 sticky top-0 z-40 bg-brand-bg/95 print:hidden">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 md:hidden">
          <button onClick={onOpenMobileMenu} className="text-brand-text-muted hover:text-brand-primary transition-colors">
            <Menu size={24} />
          </button>
          <h1 className="font-headline text-xl text-brand-primary leading-tight font-medium">EverVow Lux</h1>
        </div>
        
        {/* Search */}
        <div className="hidden md:block relative w-96" ref={searchRef}>
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" />
            <input 
              type="text" 
              placeholder="Search planning, guests, budget..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(e.target.value.length > 0);
              }}
              onFocus={() => setShowSearchResults(searchQuery.length > 0)}
              className="w-full h-11 pl-12 pr-4 bg-brand-surface rounded-full border border-brand-border focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm text-brand-text placeholder:text-brand-text-muted/60"
            />
          </div>
          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 mt-2 w-full bg-brand-surface border border-brand-border rounded-xl shadow-lg overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Quick Results</div>
              <button onClick={() => { setCurrentView('budget'); setShowSearchResults(false); }} className="w-full text-left px-4 py-2 text-sm text-brand-text hover:bg-brand-surface-hover flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-brand-text-muted">account_balance_wallet</span>
                Budget Planning
              </button>
              <button onClick={() => { setCurrentView('guests'); setShowSearchResults(false); }} className="w-full text-left px-4 py-2 text-sm text-brand-text hover:bg-brand-surface-hover flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-brand-text-muted">group</span>
                Guest List
              </button>
              <button onClick={() => { setCurrentView('timeline'); setShowSearchResults(false); }} className="w-full text-left px-4 py-2 text-sm text-brand-text hover:bg-brand-surface-hover flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-brand-text-muted">event_available</span>
                Timeline Milestones
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="p-2 text-brand-text-muted hover:text-brand-primary transition-colors rounded-full hover:bg-brand-surface-hover" title="Toggle Dark Mode">
          {isDark ? <Sun size={22} /> : <Moon size={22} />}
        </button>

        {/* Sync Button */}
        <button 
          onClick={handleSync}
          className="hidden md:flex items-center gap-2 px-4 py-2 text-brand-primary hover:bg-brand-primary/5 rounded-full transition-colors text-sm font-semibold"
        >
          <RefreshCw size={18} className={isSyncing ? 'animate-spin text-brand-accent' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
        
        <div className="w-px h-6 bg-brand-border hidden md:block mx-1"></div>
        
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 transition-colors rounded-full hover:bg-brand-surface-hover ${showNotifications ? 'text-brand-primary bg-brand-surface-hover' : 'text-brand-text-muted hover:text-brand-primary'}`}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-brand-danger text-[8px] font-bold text-white border-2 border-brand-bg"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-brand-surface border border-brand-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-bg">
                <h3 className="font-semibold text-brand-text">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs font-semibold text-brand-accent hover:text-brand-primary hover:underline cursor-pointer transition-colors">Mark all read</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    className={`p-4 border-b border-brand-border hover:bg-brand-surface-hover cursor-pointer transition-colors ${getUrgencyBg(n.urgency, n.unread)} ${!n.unread ? 'opacity-70' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        {getUrgencyIcon(n.urgency, n.unread)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${n.unread ? 'font-semibold text-brand-text' : 'text-brand-text-muted'}`}>{n.text}</p>
                        <p className="text-[10px] uppercase tracking-wider text-brand-text-muted mt-1 font-semibold">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-brand-border bg-brand-bg">
                <button onClick={() => setShowNotifications(false)} className="text-xs font-semibold text-brand-primary hover:underline hover:text-brand-accent transition-colors">View All Notifications</button>
              </div>
            </div>
          )}
        </div>
        
        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity pl-2"
          >
            <div className="w-10 h-10 rounded-full bg-[#f4ecea] flex items-center justify-center text-brand-primary font-semibold text-sm border border-brand-border dark:bg-brand-surface-hover">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-brand-text leading-tight">{username || 'Loading...'}</p>
              <p className="text-xs text-brand-text-muted leading-tight mt-0.5">Lead Planner</p>
            </div>
            <ChevronDown size={18} className={`text-brand-text-muted hidden md:block transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 bg-brand-surface border border-brand-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-brand-border bg-brand-bg md:hidden">
                <p className="text-sm font-semibold text-brand-text leading-tight">{username || 'Loading...'}</p>
                <p className="text-xs text-brand-text-muted leading-tight mt-0.5">Lead Planner</p>
              </div>
              <div className="p-2">
                <button onClick={() => { setCurrentView('settings'); setShowProfile(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-brand-text hover:bg-brand-surface-hover hover:text-brand-primary rounded-lg transition-colors">
                  <User size={16} /> My Profile
                </button>
                <button onClick={() => { setCurrentView('settings'); setShowProfile(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-brand-text hover:bg-brand-surface-hover hover:text-brand-primary rounded-lg transition-colors">
                  <Settings size={16} /> Account Settings
                </button>
              </div>
              <div className="border-t border-brand-border p-2">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-brand-danger hover:bg-brand-danger-bg hover:text-brand-danger rounded-lg transition-colors">
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
