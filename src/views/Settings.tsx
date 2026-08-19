"use client";

import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Moon, Sun, Monitor, Save, User, Heart, Settings as SettingsIcon, Phone, Mail, MapPin, Users, Plus, Trash2, Edit2, Check, X, PlayCircle, Globe, BadgeCheck } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { tutorialCopy, type TutorialLang } from '../lib/tutorialCopy';

const MEMBER_COLORS = [
  { bg: '#8b4a52', text: '#ffffff' },
  { bg: '#c9a86a', text: '#ffffff' },
  { bg: '#4a6b8b', text: '#ffffff' },
  { bg: '#5a8b4a', text: '#ffffff' },
  { bg: '#8b6b4a', text: '#ffffff' },
];

export const Settings: React.FC = () => {
  const { theme, setTheme, weddingDate, setWeddingDate, targetGuests, setTargetGuests, totalBudget, setTotalBudget, coupleProfile, setCoupleProfile, members, addMember, setMembers, tasks, setTasks, guestGroups, setGuestGroups, guests, editGuest, enterTutorial, hasSeenTutorial, tutorialLang, setTutorialLang } = useAppContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'client' | 'team' | 'categories' | 'preferences'>('client');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReplayConfirm, setShowReplayConfirm] = useState(false);
  const [formProfile, setFormProfile] = useState(coupleProfile);
  const [newMemberName, setNewMemberName] = useState('');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupIdx, setEditingGroupIdx] = useState<number | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [editingMemberName, setEditingMemberName] = useState('');
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  const getInitials = (name: string) => name.trim().split(/\s+/).map(w => w[0]).join('').substring(0, 2).toUpperCase();

  const handleAddMember = () => {
    const name = newMemberName.trim();
    if (!name) return;
    const color = MEMBER_COLORS[members.length % MEMBER_COLORS.length];
    addMember({ id: `m${Date.now()}`, name, initials: getInitials(name), color: color.text, bgColor: color.bg });
    setNewMemberName('');
  };

  const startEditMember = (id: string, name: string) => {
    setEditingMemberId(id);
    setEditingMemberName(name);
  };

  const saveEditMember = (id: string) => {
    const name = editingMemberName.trim();
    if (!name) return;
    setMembers(members.map(m => m.id === id ? { ...m, name, initials: getInitials(name) } : m));
    setEditingMemberId(null);
  };

  const confirmDeleteMember = () => {
    if (!memberToDelete) return;
    setMembers(members.filter(m => m.id !== memberToDelete));
    // Lepaskan assignment task yang sebelumnya dipegang planner ini, jangan biarkan mengarah ke id yang sudah dihapus.
    setTasks(tasks.map(t => t.assigneeId === memberToDelete ? { ...t, assigneeId: '' } : t));
    setMemberToDelete(null);
  };

  const handleAddGroup = () => {
    const name = newGroupName.trim();
    if (!name || guestGroups.includes(name)) return;
    setGuestGroups([...guestGroups, name]);
    setNewGroupName('');
  };

  const startEditGroup = (idx: number, name: string) => {
    setEditingGroupIdx(idx);
    setEditingGroupName(name);
  };

  const saveEditGroup = (idx: number) => {
    const name = editingGroupName.trim();
    if (!name) return;
    const oldName = guestGroups[idx];
    const updated = guestGroups.map((g, i) => (i === idx ? name : g));
    setGuestGroups(updated);
    // Ikut update tamu yang sudah memakai nama grup lama, biar tidak "nyangkut" ke label usang.
    guests.filter(g => g.group === oldName).forEach(g => editGuest({ ...g, group: name }));
    setEditingGroupIdx(null);
  };

  const confirmDeleteGroup = () => {
    if (!groupToDelete) return;
    setGuestGroups(guestGroups.filter(g => g !== groupToDelete));
    guests.filter(g => g.group === groupToDelete).forEach(g => editGuest({ ...g, group: 'Unassigned' }));
    setGroupToDelete(null);
  };

  const handleSave = () => {
    setShowConfirm(true);
  };

  const confirmSave = () => {
    setCoupleProfile(formProfile);
    setShowConfirm(false);
  };

  const handleReplayTutorial = () => {
    setShowReplayConfirm(false);
    enterTutorial('replay');
  };

  const tCopy = tutorialCopy[tutorialLang];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-4xl text-brand-text mb-2">Settings & Profile</h2>
          <p className="text-brand-text-muted">Manage your planner account, client details, and preferences.</p>
        </div>
        <button onClick={handleSave} className="flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-xl font-semibold shadow-md hover:bg-brand-primary-hover active:scale-95 transition-all">
          <Save size={18} /> Save Changes
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="space-y-2">
          <button 
            onClick={() => setActiveTab('client')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'client' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text-muted hover:bg-brand-surface-hover hover:text-brand-primary'
            }`}
          >
            <Heart size={18} /> Client Profile
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'profile' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text-muted hover:bg-brand-surface-hover hover:text-brand-primary'
            }`}
          >
            <User size={18} /> Planner Account
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'team' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text-muted hover:bg-brand-surface-hover hover:text-brand-primary'
            }`}
          >
            <Users size={18} /> Team & Assignee
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'categories' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text-muted hover:bg-brand-surface-hover hover:text-brand-primary'
            }`}
          >
            <Users size={18} /> Guest Categories
          </button>
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'preferences' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text-muted hover:bg-brand-surface-hover hover:text-brand-primary'
            }`}
          >
            <SettingsIcon size={18} /> Preferences
          </button>
        </aside>

        {/* Content Area */}
        <div className="space-y-6">

          {/* CLIENT PROFILE TAB */}
          {activeTab === 'client' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              
              <section className="card overflow-hidden">
                <div className="px-8 py-6 border-b border-brand-border flex items-center gap-3 bg-brand-surface-hover/50">
                  <Heart className="text-brand-primary" />
                  <h3 className="font-headline text-2xl text-brand-primary">The Couple</h3>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8 items-start">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-32 h-32 rounded-full border-4 border-brand-surface-hover bg-[#f4ecea] overflow-hidden flex items-center justify-center text-brand-text-muted">
                      <span className="font-headline text-4xl text-brand-primary">{(formProfile.brideName?.[0] || '?')}&{(formProfile.groomName?.[0] || '?')}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Bride's Full Name</label>
                        <input type="text" value={formProfile.brideName} onChange={(e) => setFormProfile({...formProfile, brideName: e.target.value})} className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Groom's Full Name</label>
                        <input type="text" value={formProfile.groomName} onChange={(e) => setFormProfile({...formProfile, groomName: e.target.value})} className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Contact Email</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                          <input type="email" value={formProfile.contactEmail} onChange={(e) => setFormProfile({...formProfile, contactEmail: e.target.value})} className="w-full bg-brand-bg border border-brand-border rounded-xl pl-10 pr-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Contact Phone</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                          <input type="tel" value={formProfile.contactPhone} onChange={(e) => setFormProfile({...formProfile, contactPhone: e.target.value})} className="w-full bg-brand-bg border border-brand-border rounded-xl pl-10 pr-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="card overflow-hidden">
                <div className="px-8 py-6 border-b border-brand-border flex items-center gap-3 bg-brand-surface-hover/50">
                  <MapPin className="text-brand-primary" />
                  <h3 className="font-headline text-2xl text-brand-primary">Event Details</h3>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Wedding Title / Hashtag</label>
                    <input type="text" value={formProfile.weddingTitle} onChange={(e) => setFormProfile({...formProfile, weddingTitle: e.target.value})} className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Wedding Date</label>
                      <input type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Time</label>
                      <input type="time" value={formProfile.weddingTime} onChange={(e) => setFormProfile({...formProfile, weddingTime: e.target.value})} className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Primary Venue</label>
                    <input type="text" value={formProfile.primaryVenue} onChange={(e) => setFormProfile({...formProfile, primaryVenue: e.target.value})} className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Target Guests</label>
                      <input type="number" value={targetGuests} onChange={(e) => setTargetGuests(parseInt(e.target.value) || 0)} className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Target Budget (IDR)</label>
                      <input type="number" value={totalBudget} onChange={(e) => setTotalBudget(parseInt(e.target.value) || 0)} className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* PLANNER ACCOUNT TAB */}
          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <section className="card overflow-hidden">
                <div className="px-8 py-6 border-b border-brand-border flex items-center gap-3 bg-brand-surface-hover/50">
                  <User className="text-brand-primary" />
                  <h3 className="font-headline text-2xl text-brand-primary">Planner Profile</h3>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8 items-start">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-32 h-32 rounded-full border-4 border-brand-surface-hover bg-brand-primary/10 overflow-hidden flex items-center justify-center text-brand-primary font-headline text-4xl">
                      IS
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Full Name</label>
                        <input type="text" defaultValue="Isabella Smith" className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Role</label>
                        <input type="text" defaultValue="Lead Planner" className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Email Address</label>
                      <input type="email" defaultValue="isabella@evervow.com" className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
                    </div>
                    <div className="pt-4 border-t border-brand-border">
                      <button className="text-sm font-semibold text-brand-danger hover:underline">Change Password</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TEAM & ASSIGNEE TAB */}
          {activeTab === 'team' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <section className="card overflow-hidden">
                <div className="px-8 py-6 border-b border-brand-border flex items-center gap-3 bg-brand-surface-hover/50">
                  <Users className="text-brand-primary" />
                  <div>
                    <h3 className="font-headline text-2xl text-brand-primary">Team & Assignee</h3>
                    <p className="text-xs text-brand-text-muted mt-1">Kelola nama planner/tim yang bisa dipilih sebagai assignee di menu Timeline.</p>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                      placeholder="Nama planner/tim baru, mis. Planner Sarah"
                      className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                    />
                    <button onClick={handleAddMember} className="flex items-center gap-2 px-5 py-3 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover active:scale-95 transition-all whitespace-nowrap">
                      <Plus size={16} /> Tambah
                    </button>
                  </div>

                  <div className="space-y-2">
                    {members.length === 0 && (
                      <p className="text-sm text-brand-text-muted italic py-4 text-center">Belum ada planner/tim ditambahkan.</p>
                    )}
                    {members.map(m => {
                      const taskCount = tasks.filter(t => t.assigneeId === m.id).length;
                      return (
                        <div key={m.id} className="flex items-center gap-4 p-3 rounded-xl border border-brand-border bg-brand-surface-hover/40">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0" style={{ backgroundColor: m.bgColor, color: m.color }}>
                            {m.initials}
                          </div>
                          {editingMemberId === m.id ? (
                            <input
                              autoFocus
                              type="text"
                              value={editingMemberName}
                              onChange={(e) => setEditingMemberName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveEditMember(m.id)}
                              className="flex-1 bg-brand-bg border border-brand-primary rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                            />
                          ) : (
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-brand-text">{m.name}</p>
                              <p className="text-xs text-brand-text-muted">{taskCount} task ditugaskan</p>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            {editingMemberId === m.id ? (
                              <>
                                <button onClick={() => saveEditMember(m.id)} className="p-2 text-brand-success hover:bg-brand-surface rounded-lg transition-colors"><Check size={16} /></button>
                                <button onClick={() => setEditingMemberId(null)} className="p-2 text-brand-text-muted hover:bg-brand-surface rounded-lg transition-colors"><X size={16} /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEditMember(m.id, m.name)} className="p-2 text-brand-text-muted hover:text-brand-primary hover:bg-brand-surface rounded-lg transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => setMemberToDelete(m.id)} className="p-2 text-brand-text-muted hover:text-brand-danger hover:bg-brand-surface rounded-lg transition-colors"><Trash2 size={16} /></button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* GUEST CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <section className="card overflow-hidden">
                <div className="px-8 py-6 border-b border-brand-border flex items-center gap-3 bg-brand-surface-hover/50">
                  <Users className="text-brand-primary" />
                  <div>
                    <h3 className="font-headline text-2xl text-brand-primary">Guest Categories</h3>
                    <p className="text-xs text-brand-text-muted mt-1">Kelola daftar Group yang muncul di dropdown menu Guest List (tambah, form, dan filter).</p>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                      placeholder="Nama kategori baru, mis. Sahabat Kuliah"
                      className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                    />
                    <button onClick={handleAddGroup} className="flex items-center gap-2 px-5 py-3 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover active:scale-95 transition-all whitespace-nowrap">
                      <Plus size={16} /> Tambah
                    </button>
                  </div>

                  <div className="space-y-2">
                    {guestGroups.length === 0 && (
                      <p className="text-sm text-brand-text-muted italic py-4 text-center">Belum ada kategori tamu.</p>
                    )}
                    {guestGroups.map((g, idx) => {
                      const guestCount = guests.filter(x => x.group === g).length;
                      return (
                        <div key={g} className="flex items-center gap-4 p-3 rounded-xl border border-brand-border bg-brand-surface-hover/40">
                          {editingGroupIdx === idx ? (
                            <input
                              autoFocus
                              type="text"
                              value={editingGroupName}
                              onChange={(e) => setEditingGroupName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveEditGroup(idx)}
                              className="flex-1 bg-brand-bg border border-brand-primary rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                            />
                          ) : (
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-brand-text">{g}</p>
                              <p className="text-xs text-brand-text-muted">{guestCount} tamu memakai kategori ini</p>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            {editingGroupIdx === idx ? (
                              <>
                                <button onClick={() => saveEditGroup(idx)} className="p-2 text-brand-success hover:bg-brand-surface rounded-lg transition-colors"><Check size={16} /></button>
                                <button onClick={() => setEditingGroupIdx(null)} className="p-2 text-brand-text-muted hover:bg-brand-surface rounded-lg transition-colors"><X size={16} /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEditGroup(idx, g)} className="p-2 text-brand-text-muted hover:text-brand-primary hover:bg-brand-surface rounded-lg transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => setGroupToDelete(g)} className="p-2 text-brand-text-muted hover:text-brand-danger hover:bg-brand-surface rounded-lg transition-colors"><Trash2 size={16} /></button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

              {/* GETTING STARTED / TUTORIAL REPLAY */}
              <section className="card overflow-hidden">
                <div className="px-8 py-6 border-b border-brand-border flex items-center gap-3 bg-brand-surface-hover/50">
                  <PlayCircle className="text-brand-primary" />
                  <h3 className="font-headline text-2xl text-brand-primary">{tCopy.settings.title}</h3>
                </div>
                <div className="p-8 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1 space-y-3">
                    <p className="text-sm text-brand-text-muted leading-relaxed max-w-lg">
                      {tCopy.settings.description}
                    </p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                      hasSeenTutorial
                        ? 'bg-brand-success-bg text-brand-success'
                        : 'bg-brand-warning-bg text-brand-warning'
                    }`}>
                      <BadgeCheck size={13} />
                      {hasSeenTutorial ? tCopy.settings.seenBadge : tCopy.settings.notSeenBadge}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 shrink-0">
                    {/* Language selector — dipilih, bukan ditampilkan dua bahasa sekaligus */}
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-brand-text-muted" />
                      <span className="text-xs font-semibold text-brand-text-muted">{tCopy.settings.languageLabel}</span>
                      <div className="flex bg-brand-surface-hover rounded-lg p-0.5 border border-brand-border">
                        {(['id', 'en'] as TutorialLang[]).map((lng) => (
                          <button
                            key={lng}
                            onClick={() => setTutorialLang(lng)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all ${
                              tutorialLang === lng ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text-muted hover:text-brand-text'
                            }`}
                          >
                            {lng}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setShowReplayConfirm(true)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold text-sm shadow-md hover:bg-brand-primary-hover active:scale-95 transition-all whitespace-nowrap"
                    >
                      <PlayCircle size={18} />
                      {tCopy.settings.button}
                    </button>
                  </div>
                </div>
              </section>

              <section className="card overflow-hidden">
                <div className="px-8 py-6 border-b border-brand-border flex items-center gap-3 bg-brand-surface-hover/50">
                  <Monitor className="text-brand-primary" />
                  <h3 className="font-headline text-2xl text-brand-primary">Appearance & Theme</h3>
                </div>
                <div className="p-8">
                  <div className="flex flex-col gap-4 max-w-sm">
                    <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Theme Mode</label>
                    <div className="flex bg-brand-surface-hover rounded-xl p-1 border border-brand-border">
                      <button 
                        onClick={() => setTheme('light')}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${theme === 'light' ? 'bg-brand-surface shadow-md text-brand-primary' : 'text-brand-text-muted hover:text-brand-text'}`}
                      >
                        <Sun size={18} /> Light
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${theme === 'dark' ? 'bg-brand-surface shadow-md text-brand-primary' : 'text-brand-text-muted hover:text-brand-text'}`}
                      >
                        <Moon size={18} /> Dark
                      </button>
                    </div>
                    <p className="text-xs text-brand-text-muted mt-2 leading-relaxed">
                      Experience the luxury of EverVow in both pristine light mode and sophisticated dark mode. Changes apply immediately across all modules.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog 
          isOpen={showConfirm}
          title="Save Changes"
          message="Are you sure you want to save these profile changes?"
          type="info"
          confirmText="Yes, Save"
          onConfirm={confirmSave}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showReplayConfirm && (
        <ConfirmDialog
          isOpen={showReplayConfirm}
          title={tCopy.confirmReplay.title}
          message={tCopy.confirmReplay.message}
          type="info"
          confirmText={tCopy.confirmReplay.confirm}
          cancelText={tCopy.confirmReplay.cancel}
          onConfirm={handleReplayTutorial}
          onCancel={() => setShowReplayConfirm(false)}
        />
      )}

      {memberToDelete && (
        <ConfirmDialog
          isOpen={!!memberToDelete}
          title="Hapus Planner/Tim"
          message="Task yang sudah ditugaskan ke orang ini akan menjadi Unassigned. Lanjutkan hapus?"
          type="danger"
          confirmText="Ya, Hapus"
          onConfirm={confirmDeleteMember}
          onCancel={() => setMemberToDelete(null)}
        />
      )}

      {groupToDelete && (
        <ConfirmDialog
          isOpen={!!groupToDelete}
          title="Hapus Kategori Tamu"
          message={`Tamu yang memakai kategori "${groupToDelete}" akan dipindah ke "Unassigned". Lanjutkan hapus?`}
          type="danger"
          confirmText="Ya, Hapus"
          onConfirm={confirmDeleteGroup}
          onCancel={() => setGroupToDelete(null)}
        />
      )}
    </div>
  );
};
