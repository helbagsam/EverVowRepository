"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAppContext } from '../store/AppContext';
import { Camera, Plus, Share2, Star, Users, CheckCircle, Video, Edit2, Trash2, X, Edit, MessageCircle } from 'lucide-react';

interface Shot {
  id: string;
  category: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  type: 'Photo' | 'Video' | 'Both';
  done: boolean;
}

interface TechNote {
  id: string;
  title: string;
  note: string;
}

// Catatan: dulu ada initialShots/initialTechNotes berisi data contoh
// ("Dress hung on custom hanger", "Lighting Restriction", dst.) yang
// diam-diam ter-seed ke akun baru lewat effect di bawah. Sudah dihapus.

export const PhotoVideo: React.FC = () => {
  const { misc, setMiscItem } = useAppContext();
  const [shots, setShots] = useState<Shot[]>([]);
  const [techNotes, setTechNotes] = useState<TechNote[]>([]);
  const hydratedShots = useRef(false);
  const hydratedNotes = useRef(false);

  // Shot Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newShot, setNewShot] = useState<Partial<Shot>>({
    title: '', category: 'Getting Ready', priority: 'Medium', type: 'Photo'
  });

  // Tech Note Modal State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState<Partial<TechNote>>({ title: '', note: '' });

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean, title: string, message: string, type: 'danger' | 'info', confirmText: string, onConfirm: () => void } | null>(null);

  // Sinkron dari data server (NeonDB, lewat context.misc) sekali saat data
  // pertama kali tersedia, lalu simpan balik ke server setiap ada perubahan.
  useEffect(() => {
    if (!hydratedShots.current && misc?.evervow_shots !== undefined) {
      setShots(misc.evervow_shots);
      hydratedShots.current = true;
    }
  }, [misc]);

  useEffect(() => {
    if (!hydratedShots.current) return;
    setMiscItem('evervow_shots', shots);
  }, [shots]);

  useEffect(() => {
    if (!hydratedNotes.current && misc?.evervow_tech_notes !== undefined) {
      setTechNotes(misc.evervow_tech_notes);
      hydratedNotes.current = true;
    }
  }, [misc]);

  useEffect(() => {
    if (!hydratedNotes.current) return;
    setMiscItem('evervow_tech_notes', techNotes);
  }, [techNotes]);

  const openAddModal = () => {
    setEditingId(null);
    setNewShot({ title: '', category: 'Getting Ready', priority: 'Medium', type: 'Photo' });
    setShowModal(true);
  };

  const openEditModal = (shot: Shot) => {
    setEditingId(shot.id);
    setNewShot({ ...shot });
    setShowModal(true);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShot.title) return;
    
    if (editingId) {
      setShots(shots.map(s => s.id === editingId ? {
        ...s,
        title: newShot.title!,
        category: newShot.category!,
        priority: newShot.priority as any,
        type: newShot.type as any
      } : s));
    } else {
      setShots([...shots, { ...newShot, id: Date.now().toString(), done: false } as Shot]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Shot',
      message: 'Are you sure you want to delete this shot?',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: () => {
        deleteShot(id);
        setConfirmState(null);
      }
    });
  };

  const toggleDone = (id: string) => {
    setShots(shots.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const deleteShot = (id: string) => {
    setShots(shots.filter(s => s.id !== id));
  };

  // --- Tech Note Handlers ---
  const openNoteModal = (note?: TechNote) => {
    if (note) {
      setEditingNoteId(note.id);
      setNoteForm(note);
    } else {
      setEditingNoteId(null);
      setNoteForm({ title: '', note: '' });
    }
    setShowNoteModal(true);
  };

  const saveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title || !noteForm.note) return;
    if (editingNoteId) {
      setTechNotes(techNotes.map(n => n.id === editingNoteId ? { ...n, ...noteForm } as TechNote : n));
    } else {
      setTechNotes([...techNotes, { ...noteForm, id: Date.now().toString() } as TechNote]);
    }
    setShowNoteModal(false);
  };

  const deleteNote = (id: string) => {
    setTechNotes(techNotes.filter(n => n.id !== id));
  };

  // --- Share to WhatsApp for Crew Team ---
  const handleShareWhatsApp = () => {
    const totalCount = shots.length;
    const doneCount = shots.filter(s => s.done).length;
    const highCount = shots.filter(s => s.priority === 'High').length;
    const catList = Array.from(new Set(shots.map(s => s.category)));

    let text = `📸 *EVERVOW LUX - PHOTO & VIDEO SHOT LIST SUMMARY*\n\n`;
    text += `📊 *Progress:* ${doneCount}/${totalCount} Shots Captured (${totalCount ? Math.round((doneCount/totalCount)*100) : 0}%)\n`;
    text += `⭐ *High Priority Shots:* ${highCount} moments\n\n`;
    text += `📋 *Categories & Shots:*\n`;

    catList.forEach(cat => {
      text += `\n*${cat}:*\n`;
      shots.filter(s => s.category === cat).forEach(s => {
        const icon = s.done ? '✅' : '🔴';
        text += `${icon} [${s.priority}] [${s.type}] ${s.title}\n`;
      });
    });

    if (techNotes.length > 0) {
      text += `\n📌 *TECHNICAL NOTES FOR CREW:*\n`;
      techNotes.forEach(n => {
        text += `• *${n.title}*: ${n.note}\n`;
      });
    }

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const categories = Array.from(new Set(shots.map(s => s.category)));
  const totalShots = shots.length;
  const capturedShots = shots.filter(s => s.done).length;
  const progress = totalShots > 0 ? Math.round((capturedShots / totalShots) * 100) : 0;
  const highPriority = shots.filter(s => s.priority === 'High');
  const highPriorityDone = highPriority.filter(s => s.done).length;

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-500 relative pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold text-brand-accent uppercase tracking-widest mb-2">Visual Production</p>
          <h2 className="font-headline text-4xl text-brand-primary mb-2">Photo & Video Shot List</h2>
          <p className="text-brand-text-muted text-lg">Curating the visual narrative and technical execution for your crew.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleShareWhatsApp} className="px-6 py-3 rounded-xl border border-green-600 bg-green-50 text-green-700 font-semibold text-sm hover:bg-green-600 hover:text-white transition-all flex items-center gap-2 shadow-sm">
            <MessageCircle size={18} /> Share Summary via WhatsApp
          </button>
          <button onClick={openAddModal} className="px-6 py-3 rounded-xl bg-brand-primary text-white font-semibold text-sm hover:bg-brand-primary-hover transition-colors shadow-md flex items-center gap-2">
            <Plus size={18} /> Add Shot
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Total Shots</span>
            <div className="p-2 bg-brand-accent/10 rounded-full text-brand-accent"><Camera size={20} /></div>
          </div>
          <p className="font-headline text-4xl text-brand-primary">{totalShots}</p>
          <div className="w-full bg-brand-surface-hover h-1.5 mt-4 rounded-full overflow-hidden">
            <div className="bg-brand-accent h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-brand-text-muted font-medium">
            <span>{progress}% captured</span>
          </div>
        </div>
        
        <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Priority Moments</span>
            <div className="p-2 bg-brand-warning-bg rounded-full text-brand-warning"><Star size={20} /></div>
          </div>
          <p className="font-headline text-4xl text-brand-primary">{highPriority.length}</p>
          <p className="text-sm text-brand-text-muted mt-4 font-medium"><span className="text-brand-success font-semibold">{highPriority.length - highPriorityDone}</span> remaining</p>
        </div>

        <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Team Assignment</span>
            <div className="p-2 bg-brand-primary/10 rounded-full text-brand-primary"><Users size={20} /></div>
          </div>
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-brand-text">Photography (Lumière)</span>
              <span className="bg-brand-surface-hover px-2.5 py-1 rounded-md text-xs font-semibold text-brand-primary">{shots.filter(s => s.type !== 'Video').length} shots</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-brand-text">Videography (CineLux)</span>
              <span className="bg-brand-surface-hover px-2.5 py-1 rounded-md text-xs font-semibold text-brand-accent">{shots.filter(s => s.type !== 'Photo').length} shots</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {categories.length === 0 && (
            <div className="text-center py-16 text-brand-text-muted border-2 border-dashed border-brand-border rounded-2xl bg-brand-surface/50">
              <Camera size={40} className="mx-auto text-brand-border mb-4" />
              <p className="font-semibold text-lg text-brand-text mb-1">Belum ada shot list.</p>
              <p className="text-sm mb-4">Klik "Add Shot" untuk mulai menyusun daftar momen yang wajib diabadikan.</p>
            </div>
          )}
          {categories.map(cat => {
            const catShots = shots.filter(s => s.category === cat);
            const catDone = catShots.filter(s => s.done).length;
            const catProgress = Math.round((catDone / catShots.length) * 100);
            
            return (
              <div key={cat} className="card overflow-hidden">
                <div className="border-b border-brand-border px-6 py-4 bg-brand-surface-hover/50 flex justify-between items-center">
                  <h3 className="font-headline text-2xl text-brand-primary">{cat}</h3>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-success-bg text-brand-success text-xs font-bold uppercase">{catProgress}% Done</span>
                </div>
                <div className="divide-y divide-brand-border">
                  {catShots.map(shot => (
                    <div key={shot.id} className="p-4 hover:bg-brand-surface-hover transition-colors flex items-center gap-4 group">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${shot.done ? 'bg-brand-success-bg border-brand-success text-brand-success' : 'bg-brand-surface-hover border-brand-border text-brand-text-muted'}`}>
                        {shot.type === 'Video' ? <Video size={24} /> : <Camera size={24} />}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-base transition-colors ${shot.done ? 'text-brand-text-muted line-through' : 'text-brand-text'}`}>{shot.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${shot.priority === 'High' ? 'bg-brand-warning-bg text-brand-warning' : 'bg-brand-accent/10 text-brand-accent'}`}>{shot.priority} Priority</span>
                          <span className="text-brand-text-muted text-xs font-medium flex items-center gap-1">{shot.type}</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex gap-2">
                        <button onClick={() => openEditModal(shot)} className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center hover:bg-brand-surface-hover hover:text-brand-primary transition-colors text-brand-text-muted opacity-0 group-hover:opacity-100"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(shot.id)} className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center hover:bg-brand-danger-bg hover:text-brand-danger hover:border-brand-danger transition-colors text-brand-text-muted opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                        <button onClick={() => toggleDone(shot.id)} className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${shot.done ? 'bg-brand-success border-brand-success text-white' : 'border-brand-border text-brand-text-muted hover:bg-brand-success hover:border-brand-success hover:text-white'}`}>
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {categories.length === 0 && (
             <div className="text-center py-12 text-brand-text-muted border-2 border-dashed border-brand-border rounded-xl">
               No shots added yet. Add your first shot to start building your list!
             </div>
          )}
        </div>
        
        {/* Editable Technical Notes */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <div className="flex justify-between items-center border-b border-brand-border pb-4 mb-4">
              <h3 className="font-headline text-2xl text-brand-primary">Technical Notes</h3>
              <button onClick={() => openNoteModal()} className="text-brand-primary text-xs font-semibold hover:underline flex items-center gap-1">
                <Plus size={14} /> Add Note
              </button>
            </div>
            <div className="space-y-4">
              {techNotes.map(n => (
                <div key={n.id} className="p-4 rounded-xl bg-brand-surface-hover border border-brand-border relative group">
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    <button onClick={() => openNoteModal(n)} className="p-1 text-brand-text-muted hover:text-brand-primary"><Edit2 size={14} /></button>
                    <button onClick={() => deleteNote(n.id)} className="p-1 text-brand-text-muted hover:text-brand-danger"><Trash2 size={14} /></button>
                  </div>
                  <h4 className="font-semibold text-sm text-brand-text mb-1 pr-12">{n.title}</h4>
                  <p className="text-xs text-brand-text-muted leading-relaxed">{n.note}</p>
                </div>
              ))}
              {techNotes.length === 0 && (
                <p className="text-xs text-brand-text-muted italic">No technical notes added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: Shot Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-brand-border bg-brand-surface-hover">
              <h3 className="font-headline text-xl text-brand-text">{editingId ? 'Edit Shot' : 'Add Shot'}</h3>
              <button onClick={() => setShowModal(false)} className="text-brand-text-muted hover:text-brand-text transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Shot Title/Description</label>
                <input required value={newShot.title} onChange={e => setNewShot({...newShot, title: e.target.value})} type="text" placeholder="e.g. Bride's shoes" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Category (Event)</label>
                  <input required value={newShot.category} onChange={e => setNewShot({...newShot, category: e.target.value})} type="text" list="categories" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" />
                  <datalist id="categories">
                    <option value="Getting Ready" />
                    <option value="Ceremony" />
                    <option value="Reception" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Type</label>
                  <select value={newShot.type} onChange={e => setNewShot({...newShot, type: e.target.value as any})} className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary">
                    <option value="Photo">Photo</option>
                    <option value="Video">Video</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Priority</label>
                <select value={newShot.priority} onChange={e => setNewShot({...newShot, priority: e.target.value as any})} className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-brand-border text-brand-text rounded-xl font-semibold text-sm hover:bg-brand-surface-hover">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover">{editingId ? 'Update Shot' : 'Save Shot'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Technical Note Form */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-brand-border bg-brand-surface-hover">
              <h3 className="font-headline text-xl text-brand-text">{editingNoteId ? 'Edit Technical Note' : 'Add Technical Note'}</h3>
              <button onClick={() => setShowNoteModal(false)} className="text-brand-text-muted hover:text-brand-text"><X size={20} /></button>
            </div>
            <form onSubmit={saveNote} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Note Title</label>
                <input required value={noteForm.title || ''} onChange={e => setNoteForm({...noteForm, title: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="e.g. Drone License & Restrictions" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Technical Note Content</label>
                <textarea required value={noteForm.note || ''} onChange={e => setNoteForm({...noteForm, note: e.target.value})} rows={4} className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="Details for the camera team..." />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowNoteModal(false)} className="flex-1 px-4 py-2 border border-brand-border text-brand-text rounded-xl font-semibold text-sm hover:bg-brand-surface-hover">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover">{editingNoteId ? 'Update Note' : 'Save Note'}</button>
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
