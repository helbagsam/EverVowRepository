"use client";

import React, { useState } from 'react';
import { useAppContext, AttireItem, AttireVendorNote } from '../store/AppContext';
import { Shirt, Plus, Edit, UserPlus, Trash2, X, CheckCircle, Clock, AlertCircle, Camera, Calendar, FileText } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatDate } from '../utils/formatters';
import { UploadButton, deleteUploadedFile } from '../utils/uploadthing';
import { compressImagesBeforeUpload } from '../utils/imageCompression';


export const Attire: React.FC = () => {
  const { 
    attireItems, addAttireItem, deleteAttireItem, editAttireItem,
    attireVendorNotes, addAttireVendorNote, deleteAttireVendorNote, editAttireVendorNote
  } = useAppContext();
  
  const [filter, setFilter] = useState('All Roles');
  
  // Member Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Note Form State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const [confirmState, setConfirmState] = useState<any>(null);
  
  const [newItem, setNewItem] = useState<Partial<AttireItem>>({
    name: '', role: 'Bride', status: 'Not Started', vendor: '', desc: '', measurements: '', imageUrl: ''
  });

  const [newNote, setNewNote] = useState<Partial<AttireVendorNote>>({
    vendorName: '', notes: '', dueDate: ''
  });

  const allRolesList = Array.from(new Set(['Bride', 'Groom', 'Maid of Honor', 'Best Man', 'Bridesmaids', 'Groomsmen', "Bride's Family", "Groom's Family", 'Other', ...attireItems.map(a => a.role as string)])).filter(Boolean);
  const filterRoles = ['All Roles', ...allRolesList.filter(r => r !== 'Other')];

  const filteredItems = filter === 'All Roles' ? attireItems : attireItems.filter(a => a.role === filter);

  // --- Member Methods ---
  const openAddModal = () => {
    setEditingId(null);
    setNewItem({ name: '', role: 'Bride', status: 'Not Started', vendor: '', desc: '', measurements: '', imageUrl: '' });
    setShowModal(true);
  };

  const openEditModal = (item: AttireItem) => {
    setEditingId(item.id);
    setNewItem(item);
    setShowModal(true);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      editAttireItem({
        id: editingId,
        name: newItem.name!,
        role: newItem.role || 'Bride',
        status: newItem.status as any,
        vendor: newItem.vendor || '',
        desc: newItem.desc || '',
        measurements: newItem.measurements || '',
        imageUrl: newItem.imageUrl || ''
      });
    } else {
      addAttireItem({
        id: Date.now().toString(),
        name: newItem.name!,
        role: newItem.role || 'Bride',
        status: newItem.status as any,
        vendor: newItem.vendor || '',
        desc: newItem.desc || '',
        measurements: newItem.measurements || '',
        imageUrl: newItem.imageUrl || ''
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Attire Record',
      message: 'Are you sure you want to delete this record? This cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: () => {
        const target = attireItems.find(a => a.id === id);
        deleteAttireItem(id);
        deleteUploadedFile(target?.imageUrl);
        setConfirmState(null);
      }
    });
  };

  // --- Note Methods ---
  const openAddNoteModal = () => {
    setEditingNoteId(null);
    setNewNote({ vendorName: '', notes: '', dueDate: '' });
    setShowNoteModal(true);
  };

  const openEditNoteModal = (note: AttireVendorNote) => {
    setEditingNoteId(note.id);
    setNewNote(note);
    setShowNoteModal(true);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNoteId) {
      editAttireVendorNote({
        id: editingNoteId,
        vendorName: newNote.vendorName!,
        notes: newNote.notes || '',
        dueDate: newNote.dueDate || ''
      });
    } else {
      addAttireVendorNote({
        id: Date.now().toString(),
        vendorName: newNote.vendorName!,
        notes: newNote.notes || '',
        dueDate: newNote.dueDate || ''
      });
    }
    setShowNoteModal(false);
  };

  const handleDeleteNote = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Vendor Note',
      message: 'Are you sure you want to delete this note?',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: () => {
        deleteAttireVendorNote(id);
        setConfirmState(null);
      }
    });
  };

  // --- Helpers ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Final Fitting':
      case 'Completed': return 'text-brand-success';
      case 'In Progress': return 'text-brand-warning';
      default: return 'text-brand-danger';
    }
  };
  
  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Final Fitting':
      case 'Completed': return 'bg-brand-success';
      case 'In Progress': return 'bg-brand-warning';
      default: return 'bg-brand-danger';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Final Fitting':
      case 'Completed': return <CheckCircle size={18} className="text-brand-success" />;
      case 'In Progress': return <Clock size={18} className="text-brand-warning" />;
      default: return <AlertCircle size={18} className="text-brand-danger" />;
    }
  };

  const getProgress = (status: string) => {
    switch (status) {
      case 'Completed': return 100;
      case 'Final Fitting': return 80;
      case 'In Progress': return 50;
      default: return 10;
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-500 relative pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="font-headline text-4xl text-brand-text mb-2">Attire & Uniforms</h1>
          <p className="text-brand-text-muted text-lg">Manage fittings, measurements, and vendor notes.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={openAddModal} className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-semibold text-sm hover:bg-brand-primary-hover transition-all flex items-center gap-2 shadow-sm">
            <UserPlus size={18} />
            Add Member
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Member List */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {filterRoles.map(role => (
              <button 
                key={role} 
                onClick={() => setFilter(role)}
                className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                  filter === role ? 'bg-brand-primary text-white' : 'bg-brand-surface-hover text-brand-text hover:bg-brand-surface-hover/80 border border-brand-border/50'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-brand-surface rounded-2xl border border-brand-border shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start relative overflow-hidden group hover:border-brand-primary transition-all">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusBgColor(item.status)} opacity-80`}></div>
                
                <div className="flex-shrink-0 flex flex-col items-center gap-3 w-full md:w-32">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand-border/50 bg-brand-surface-hover flex items-center justify-center text-brand-text-muted">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Shirt size={32} />
                    )}
                  </div>
                  <div className="text-center">
                    <span className="bg-brand-surface-hover border border-brand-border text-brand-text-muted font-semibold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">{item.role}</span>
                    <h3 className="font-headline text-lg text-brand-text mt-2 leading-tight">{item.name}</h3>
                  </div>
                  <div className="flex justify-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(item)} className="text-brand-text-muted hover:text-brand-primary hover:bg-brand-surface-hover p-1.5 rounded-full transition-colors">
                          <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-brand-text-muted hover:text-brand-danger hover:bg-brand-danger-bg p-1.5 rounded-full transition-colors">
                          <Trash2 size={16} />
                      </button>
                  </div>
                </div>
                
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div>
                    <p className="font-semibold text-brand-text-muted mb-2 uppercase tracking-wide text-[10px]">Fitting Status</p>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-semibold text-brand-text">{item.status}</span>
                    </div>
                    <div className="w-full bg-brand-surface-hover rounded-full h-1.5 overflow-hidden">
                      <div className={`h-1.5 rounded-full ${getStatusBgColor(item.status)}`} style={{ width: `${getProgress(item.status)}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-text-muted mb-2 uppercase tracking-wide text-[10px]">Couturier / Tailor</p>
                    <p className="text-sm font-semibold text-brand-text">{item.vendor || 'TBD'}</p>
                    <p className="text-xs text-brand-text-muted mt-1 truncate">{item.desc}</p>
                  </div>
                  <div className="sm:col-span-2 bg-brand-surface-hover/30 rounded-xl p-4 border border-brand-border/30">
                    <p className="font-semibold text-brand-text-muted mb-2 uppercase tracking-wide text-[10px]">Measurements</p>
                    <p className="text-sm text-brand-text font-medium leading-relaxed">{item.measurements || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredItems.length === 0 && (
              <div className="text-center py-16 text-brand-text-muted border-2 border-dashed border-brand-border rounded-2xl bg-brand-surface/50">
                <Shirt size={48} className="mx-auto text-brand-border mb-4" />
                <p className="font-semibold text-lg text-brand-text mb-1">No attire records found.</p>
                <p className="text-sm">Click "Add Member" to create a new fitting record.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Auxiliary Data */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Vendor Notes */}
          <div className="bg-brand-surface rounded-2xl border border-brand-border shadow-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-headline text-xl text-brand-text">Vendor Notes</h3>
              <button onClick={openAddNoteModal} className="text-brand-text-muted hover:bg-brand-primary-hover hover:text-white bg-brand-surface-hover p-1.5 rounded-full transition-colors" title="Add Note">
                <Plus size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              {attireVendorNotes.map(note => (
                <div key={note.id} className="border border-brand-border/50 rounded-xl p-4 bg-brand-surface hover:border-brand-primary/50 transition-all group relative">
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button onClick={() => openEditNoteModal(note)} className="p-1 text-brand-text-muted hover:text-brand-primary bg-brand-surface-hover rounded-md">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDeleteNote(note.id)} className="p-1 text-brand-text-muted hover:text-brand-danger bg-brand-surface-hover rounded-md">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <p className="text-sm font-bold text-brand-text pr-12 mb-1.5">{note.vendorName}</p>
                  <p className="text-sm text-brand-text-muted italic leading-relaxed mb-3">"{note.notes}"</p>
                  
                  {note.dueDate && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-primary bg-brand-primary/10 w-fit px-2 py-1 rounded-md">
                      <Calendar size={12} />
                      Due: {formatDate(note.dueDate)}
                    </div>
                  )}
                </div>
              ))}
              
              {attireVendorNotes.length === 0 && (
                <div className="text-center py-6 text-brand-text-muted">
                  <FileText size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No vendor notes added yet.</p>
                </div>
              )}
            </div>
          </div>


        </div>
      </div>

      {/* Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-brand-border">
              <h3 className="font-headline text-2xl text-brand-text">{editingId ? 'Edit Member Profile' : 'Add New Member'}</h3>
              <button onClick={() => setShowModal(false)} className="text-brand-text-muted hover:text-brand-text transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider mb-2 block">Profile Photo</label>
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-brand-border flex flex-col items-center justify-center gap-2 bg-brand-surface-hover/50 text-brand-text-muted overflow-hidden relative">
                    {newItem.imageUrl ? (
                      <img src={newItem.imageUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <>
                        <Camera size={24} />
                        <span className="text-[10px] font-semibold uppercase">Upload</span>
                      </>
                    )}
                  </div>
                  <div className="mt-3 flex justify-center">
                    <UploadButton
                      endpoint="weddingImageUploader"
                      onBeforeUploadBegin={compressImagesBeforeUpload}
                      onClientUploadComplete={(res) => {
                        const url = res?.[0]?.ufsUrl;
                        if (url) {
                          const oldUrl = newItem.imageUrl;
                          setNewItem({ ...newItem, imageUrl: url });
                          // Cuma hapus versi lama kalau memang sebelumnya sudah ada foto
                          // ter-upload (bukan URL manual yang ditempel user).
                          if (oldUrl) deleteUploadedFile(oldUrl);
                        }
                      }}
                      onUploadError={(err) => alert(`Upload gagal: ${err.message}`)}
                      appearance={{
                        button: '!bg-brand-primary/10 !text-brand-primary !text-xs rounded-lg font-semibold hover:!bg-brand-primary/20 !h-8 !px-3',
                        allowedContent: 'hidden',
                      }}
                      content={{ button: newItem.imageUrl ? 'Ganti Foto' : 'Pilih Foto' }}
                    />
                  </div>
                  <input type="text" value={newItem.imageUrl || ''} onChange={e => setNewItem({...newItem, imageUrl: e.target.value})} placeholder="atau tempel Image URL..." className="w-full mt-2 px-3 py-1.5 text-xs rounded-lg bg-brand-surface-hover border border-brand-border focus:border-brand-primary outline-none" />
                </div>
                
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Full Name</label>
                    <input required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} type="text" className="w-full px-4 py-2.5 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" placeholder="e.g. Julianne Moore" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Role</label>
                    <select 
                      value={allRolesList.includes(newItem.role as string) ? newItem.role : 'Other'} 
                      onChange={e => setNewItem({...newItem, role: e.target.value})} 
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all appearance-none"
                    >
                      {allRolesList.filter(c => c !== 'Other').map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="Other">Other</option>
                    </select>
                    {(!allRolesList.includes(newItem.role as string) || newItem.role === 'Other') && (
                      <input 
                        type="text" 
                        value={newItem.role === 'Other' ? '' : (newItem.role || '')} 
                        onChange={e => setNewItem({...newItem, role: e.target.value})} 
                        className="w-full px-4 py-2.5 mt-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" 
                        placeholder="Specify other role..." 
                      />
                    )}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Fitting Status</label>
                    <select value={newItem.status} onChange={e => setNewItem({...newItem, status: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all appearance-none">
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Final Fitting">Final Fitting</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Couturier / Tailor</label>
                    <input value={newItem.vendor} onChange={e => setNewItem({...newItem, vendor: e.target.value})} type="text" className="w-full px-4 py-2.5 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" placeholder="e.g. Savile Row" />
                  </div>
                  
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Description</label>
                    <input value={newItem.desc} onChange={e => setNewItem({...newItem, desc: e.target.value})} type="text" className="w-full px-4 py-2.5 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" placeholder="e.g. Midnight Blue Tuxedo" />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-semibold text-brand-primary uppercase tracking-widest border-b border-brand-border pb-2">Measurements Info</h4>
                <div className="space-y-1.5">
                  <input value={newItem.measurements} onChange={e => setNewItem({...newItem, measurements: e.target.value})} type="text" placeholder="e.g. Chest: 40, Waist: 32, Inseam: 30" className="w-full px-4 py-3 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-brand-surface-hover border border-brand-border text-brand-text rounded-xl font-semibold text-sm hover:bg-brand-border/50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover transition-colors shadow-sm">{editingId ? 'Save Changes' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-brand-border">
              <h3 className="font-headline text-2xl text-brand-text">{editingNoteId ? 'Edit Vendor Note' : 'Add Vendor Note'}</h3>
              <button onClick={() => setShowNoteModal(false)} className="text-brand-text-muted hover:text-brand-text transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddNote} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Vendor / Topic</label>
                <input required value={newNote.vendorName} onChange={e => setNewNote({...newNote, vendorName: e.target.value})} type="text" className="w-full px-4 py-2.5 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" placeholder="e.g. Maison de Blanc" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Due Date (Optional)</label>
                <input value={newNote.dueDate} onChange={e => setNewNote({...newNote, dueDate: e.target.value})} type="date" className="w-full px-4 py-2.5 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Notes</label>
                <textarea required value={newNote.notes} onChange={e => setNewNote({...newNote, notes: e.target.value})} rows={4} className="w-full px-4 py-3 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-none" placeholder="Enter instructions or reminders..." />
              </div>
              
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowNoteModal(false)} className="flex-1 px-4 py-3 bg-brand-surface-hover border border-brand-border text-brand-text rounded-xl font-semibold text-sm hover:bg-brand-border/50 transition-colors">Cancel</button>
                <button type="submit" disabled={!newNote.vendorName || !newNote.notes} className="flex-1 px-4 py-3 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">{editingNoteId ? 'Save Changes' : 'Add Note'}</button>
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
