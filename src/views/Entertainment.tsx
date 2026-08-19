"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Gamepad2, Plus, Clock, Edit2, Trash2, PartyPopper, Gift, X, CheckCircle } from 'lucide-react';
import { useAppContext, Activity } from '../store/AppContext';

interface FlowSlot {
  id: string;
  time: string;
  title: string;
  duration?: string;
  highlight?: boolean;
}

// Catatan: dulu ada defaultFlowSlots berisi 6 acara contoh ("Cocktail Hour",
// "The Shoe Game", dst.) yang secara diam-diam ter-seed ke akun baru.
// Sudah dihapus — slot flow timeline sekarang murni ditambahkan manual.

export const Entertainment: React.FC = () => {
  const { activities, addActivity, deleteActivity, editActivity, misc, setMiscItem } = useAppContext();
  const [filter, setFilter] = useState('All');
  
  // Activity Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Flow Timeline Slots State (Editable), disinkronkan ke server lewat context.misc
  const [flowSlots, setFlowSlots] = useState<FlowSlot[]>([]);
  const hydratedFlow = useRef(false);

  const [showFlowModal, setShowFlowModal] = useState(false);
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [flowForm, setFlowForm] = useState<Partial<FlowSlot>>({ time: '19:00', title: '', duration: '', highlight: false });

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean, title: string, message: string, type: 'danger' | 'info', confirmText: string, onConfirm: () => void } | null>(null);
  
  const [newAct, setNewAct] = useState<Partial<Activity>>({
    title: '',
    category: 'Reception',
    status: 'Planning',
    duration: 15,
    needs: '',
    desc: ''
  });

  useEffect(() => {
    if (!hydratedFlow.current && misc?.evervow_flow_slots !== undefined) {
      // Jangan fallback ke defaultFlowSlots di sini — itu akan diam-diam
      // menulis 6 acara contoh ke akun baru lewat effect setMiscItem di
      // bawah. Biarkan kosong; UI sudah punya empty state + tombol "Add Slot".
      setFlowSlots(misc.evervow_flow_slots);
      hydratedFlow.current = true;
    }
  }, [misc]);

  useEffect(() => {
    if (!hydratedFlow.current) return;
    setMiscItem('evervow_flow_slots', flowSlots);
  }, [flowSlots]);

  const openAddModal = () => {
    setEditingId(null);
    setNewAct({ title: '', category: 'Reception', status: 'Planning', duration: 15, needs: '', desc: '' });
    setShowModal(true);
  };

  const openEditModal = (act: Activity) => {
    setEditingId(act.id);
    setNewAct({ ...act });
    setShowModal(true);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAct.title) return;
    
    if (editingId) {
      editActivity({
        id: editingId,
        title: newAct.title!,
        category: newAct.category || 'Reception',
        status: newAct.status as any,
        duration: newAct.duration || 15,
        needs: newAct.needs || '',
        desc: newAct.desc || ''
      });
    } else {
      addActivity({
        id: Date.now().toString(),
        title: newAct.title!,
        category: newAct.category || 'Reception',
        status: newAct.status as any,
        duration: newAct.duration || 15,
        needs: newAct.needs || '',
        desc: newAct.desc || ''
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Activity',
      message: 'Are you sure you want to delete this activity?',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: () => {
        deleteActivity(id);
        setConfirmState(null);
      }
    });
  };

  // --- Flow Timeline Handlers ---
  const openFlowModal = (slot?: FlowSlot) => {
    if (slot) {
      setEditingFlowId(slot.id);
      setFlowForm(slot);
    } else {
      setEditingFlowId(null);
      setFlowForm({ time: '20:00', title: '', duration: '15 mins', highlight: false });
    }
    setShowFlowModal(true);
  };

  const saveFlowSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowForm.title || !flowForm.time) return;
    if (editingFlowId) {
      setFlowSlots(flowSlots.map(s => s.id === editingFlowId ? { ...s, ...flowForm } as FlowSlot : s));
    } else {
      setFlowSlots([...flowSlots, { ...flowForm, id: Date.now().toString() } as FlowSlot]);
    }
    setShowFlowModal(false);
  };

  const deleteFlowSlot = (id: string) => {
    setFlowSlots(flowSlots.filter(s => s.id !== id));
  };

  const allCategoriesList = Array.from(new Set(['Reception', 'Icebreaker', 'Pre-Wedding', 'After Party', 'Other', ...activities.map(a => a.category as string)])).filter(Boolean);
  const filterCategories = ['All', ...allCategoriesList.filter(c => c !== 'Other')];

  const filteredActs = filter === 'All' ? activities : activities.filter(a => a.category === filter);
  const totalDuration = activities.reduce((sum, act) => sum + act.duration, 0);

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-500 relative pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-xs font-semibold text-brand-accent uppercase tracking-widest mb-2">Program & Engagement</p>
          <h1 className="font-headline text-4xl text-brand-text mb-2">Entertainment & Event Flow</h1>
          <p className="text-brand-text-muted">Curate games, speeches, acoustic performances, and run of show timelines.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={openAddModal} className="px-6 py-2.5 bg-brand-primary text-white rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-brand-primary-hover transition-colors shadow-sm">
            <Plus size={18} /> Add Activity
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center gap-4 hover:border-brand-accent transition-colors">
          <div className="w-12 h-12 rounded-full bg-brand-surface-hover flex items-center justify-center text-brand-primary">
            <PartyPopper size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider mb-1">Total Activities</p>
            <p className="font-headline text-3xl text-brand-text">{activities.length}</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4 hover:border-brand-accent transition-colors">
          <div className="w-12 h-12 rounded-full bg-brand-surface-hover flex items-center justify-center text-brand-accent">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider mb-1">Scheduled Duration</p>
            <p className="font-headline text-3xl text-brand-text">{totalDuration} mins</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4 hover:border-brand-accent transition-colors">
          <div className="w-12 h-12 rounded-full bg-brand-surface-hover flex items-center justify-center text-brand-primary">
            <Gift size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider mb-1">Timeline Slots</p>
            <p className="font-headline text-3xl text-brand-text">{flowSlots.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Activities List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 bg-brand-surface p-1 rounded-lg border border-brand-border w-fit overflow-x-auto hide-scrollbar">
            {filterCategories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-md font-semibold text-sm whitespace-nowrap transition-colors ${filter === cat ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text-muted hover:bg-brand-surface-hover'}`}>{cat}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredActs.map((act) => (
              <div key={act.id} className="card p-6 hover:border-brand-accent transition-colors flex flex-col relative group">
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                  <button onClick={() => openEditModal(act)} className="p-1.5 bg-brand-surface-hover rounded-full text-brand-text-muted hover:text-brand-primary transition-all"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(act.id)} className="p-1.5 bg-brand-surface-hover rounded-full text-brand-text-muted hover:text-brand-danger transition-all"><Trash2 size={16} /></button>
                </div>
                <div className="flex justify-between items-start mb-4 pr-16">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${
                      act.category === 'Reception' ? 'bg-brand-accent/20 text-brand-accent' : 'bg-brand-primary/20 text-brand-primary'
                    }`}>
                      {act.category}
                    </span>
                    <h3 className="font-headline text-2xl text-brand-text">{act.title}</h3>
                  </div>
                </div>
                <div className="mb-2">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${
                    act.status === 'Confirmed' ? 'bg-brand-success-bg text-brand-success border-brand-success/20' : 'bg-brand-warning-bg text-brand-warning border-brand-warning/30'
                  }`}>
                    {act.status}
                  </span>
                </div>
                <p className="text-sm text-brand-text-muted mb-4 line-clamp-2 flex-1">{act.desc}</p>
                <div className="flex items-center gap-4 border-t border-brand-border pt-4">
                  <div className="flex items-center gap-1 text-brand-text-muted text-xs font-medium">
                    <Clock size={16} /> {act.duration} mins
                  </div>
                  {act.needs && (
                    <div className="flex items-center gap-1 text-brand-text-muted text-xs font-medium line-clamp-1">
                      <Gift size={16} /> {act.needs}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filteredActs.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center py-12 text-brand-text-muted border-2 border-dashed border-brand-border rounded-xl">
                No activities found in this category.
              </div>
            )}
          </div>
        </div>

        {/* Editable Flow Timeline */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="flex justify-between items-center border-b border-brand-border pb-4 mb-6">
              <h3 className="font-headline text-2xl text-brand-text">Flow Timeline</h3>
              <button onClick={() => openFlowModal()} className="flex items-center gap-1 text-brand-primary text-xs font-semibold hover:underline transition-all">
                <Plus size={14} /> Add Slot
              </button>
            </div>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-brand-border">
              {flowSlots.map(slot => (
                <div key={slot.id} className="relative group">
                  <div className={`absolute -left-[30px] top-1 w-3 h-3 rounded-full border-2 border-brand-surface z-10 ${
                    slot.highlight ? 'bg-brand-primary shadow-[0_0_0_2px_rgba(139,74,82,0.3)]' : 'bg-brand-accent'
                  }`}></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-xs font-semibold ${slot.highlight ? 'text-brand-primary font-bold' : 'text-brand-text-muted'}`}>{slot.time}</p>
                      <h4 className={`font-semibold text-sm ${slot.highlight ? 'text-brand-primary' : 'text-brand-text'}`}>{slot.title}</h4>
                      {slot.duration && <p className="text-[11px] text-brand-text-muted mt-0.5">{slot.duration}</p>}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                      <button onClick={() => openFlowModal(slot)} className="p-1 text-brand-text-muted hover:text-brand-primary"><Edit2 size={14} /></button>
                      <button onClick={() => deleteFlowSlot(slot.id)} className="p-1 text-brand-text-muted hover:text-brand-danger"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}

              {flowSlots.length === 0 && (
                <p className="text-xs text-brand-text-muted italic">No flow timeline slots defined.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: Activity Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-brand-border bg-brand-surface-hover">
              <h3 className="font-headline text-xl text-brand-text">{editingId ? 'Edit Activity' : 'Add Activity'}</h3>
              <button onClick={() => setShowModal(false)} className="text-brand-text-muted hover:text-brand-text transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Activity Title</label>
                <input required value={newAct.title} onChange={e => setNewAct({...newAct, title: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Description</label>
                <input value={newAct.desc} onChange={e => setNewAct({...newAct, desc: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Category</label>
                  <select 
                    value={allCategoriesList.includes(newAct.category as string) ? newAct.category : 'Other'} 
                    onChange={e => setNewAct({...newAct, category: e.target.value})} 
                    className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary"
                  >
                    {allCategoriesList.filter(c => c !== 'Other').map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Duration (mins)</label>
                  <input value={newAct.duration} onChange={e => setNewAct({...newAct, duration: parseInt(e.target.value) || 0})} type="number" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Needs/Prizes</label>
                <input value={newAct.needs} onChange={e => setNewAct({...newAct, needs: e.target.value})} type="text" placeholder="e.g. 2 Chairs, 5 Prizes" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-brand-border text-brand-text rounded-xl font-semibold text-sm hover:bg-brand-surface-hover">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover">{editingId ? 'Update Activity' : 'Save Activity'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Flow Timeline Slot Form */}
      {showFlowModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-brand-border bg-brand-surface-hover">
              <h3 className="font-headline text-xl text-brand-text">{editingFlowId ? 'Edit Flow Slot' : 'Add Flow Timeline Slot'}</h3>
              <button onClick={() => setShowFlowModal(false)} className="text-brand-text-muted hover:text-brand-text"><X size={20} /></button>
            </div>
            <form onSubmit={saveFlowSlot} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Time Slot (HH:MM)</label>
                <input required value={flowForm.time || ''} onChange={e => setFlowForm({...flowForm, time: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="e.g. 19:30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Program / Activity Title</label>
                <input required value={flowForm.title || ''} onChange={e => setFlowForm({...flowForm, title: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="e.g. First Dance & Cake Cutting" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Duration Note (Optional)</label>
                <input value={flowForm.duration || ''} onChange={e => setFlowForm({...flowForm, duration: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="e.g. 15 mins" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="highlight" checked={flowForm.highlight || false} onChange={e => setFlowForm({...flowForm, highlight: e.target.checked})} className="rounded text-brand-primary focus:ring-brand-primary" />
                <label htmlFor="highlight" className="text-sm font-medium text-brand-text">Highlight as Key Moment</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowFlowModal(false)} className="flex-1 px-4 py-2 border border-brand-border text-brand-text rounded-xl font-semibold text-sm hover:bg-brand-surface-hover">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover">{editingFlowId ? 'Update Slot' : 'Save Slot'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    
      {confirmState && (
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          type={confirmState.type}
          confirmText={confirmState.confirmText}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
};
