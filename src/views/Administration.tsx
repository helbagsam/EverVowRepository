"use client";

import React, { useRef, useState } from 'react';
import { FileText, Plus, Search, Filter, Edit, Eye, Trash2, Upload, Paperclip, X, Loader2 } from 'lucide-react';
import { useAppContext, Requirement } from '../store/AppContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useUploadThing, deleteUploadedFile } from '../utils/uploadthing';
import { compressImagesBeforeUpload } from '../utils/imageCompression';

export const Administration: React.FC = () => {
  const { requirements, addRequirement, deleteRequirement, editRequirement } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Selesai' | 'Proses' | 'Belum Diunggah'>('All');
  const [showStatusFilterPanel, setShowStatusFilterPanel] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean, title: string, message: string, type: 'danger' | 'info', confirmText: string, onConfirm: () => void } | null>(null);

  // --- Upload dokumen (JPG/PNG) ke UploadThing ---
  // uploadTargetId: 'new' -> file dijadikan Requirement baru (dari drop zone/"Add Evidence"),
  // string lain -> file dipasang ke Requirement yang sudah ada (dari tombol per-baris).
  const [uploadTargetId, setUploadTargetId] = useState<string | 'new' | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing('weddingImageUploader', {
    onBeforeUploadBegin: compressImagesBeforeUpload,
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.ufsUrl;
      const fileName = res?.[0]?.name;
      if (url && uploadTargetId === 'new') {
        addRequirement({
          id: Date.now().toString(),
          name: fileName || 'Dokumen Baru',
          desc: '',
          status: 'Selesai',
          category: 'Other',
          file: url,
        });
      } else if (url && uploadTargetId) {
        const target = requirements.find(r => r.id === uploadTargetId);
        if (target) {
          const oldUrl = target.file;
          editRequirement({ ...target, file: url, status: 'Selesai' });
          deleteUploadedFile(oldUrl);
        }
      }
      setUploadTargetId(null);
    },
    onUploadError: (err) => {
      alert(`Upload gagal: ${err.message}`);
      setUploadTargetId(null);
    },
  });

  const triggerUploadFor = (targetId: string | 'new') => {
    setUploadTargetId(targetId);
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) startUpload(Array.from(files));
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setUploadTargetId('new');
      startUpload(Array.from(files));
    }
  };
  
  const [newReq, setNewReq] = useState<Partial<Requirement>>({
    name: '',
    desc: '',
    status: 'Belum Diunggah',
    category: 'CPP',
    file: null
  });

  const openAddModal = () => {
    setEditingId(null);
    setNewReq({ name: '', desc: '', status: 'Belum Diunggah', category: 'CPP', file: null });
    setShowModal(true);
  };

  const openEditModal = (req: Requirement) => {
    setEditingId(req.id);
    setNewReq({ ...req });
    setShowModal(true);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReq.name) return;
    
    setConfirmState({
      isOpen: true,
      title: editingId ? 'Save Changes' : 'Add Requirement',
      message: editingId ? 'Are you sure you want to update this requirement?' : 'Are you sure you want to add this requirement?',
      type: 'info',
      confirmText: 'Save',
      onConfirm: () => {
        if (editingId) {
          editRequirement({
            id: editingId,
            name: newReq.name!,
            desc: newReq.desc || '',
            status: newReq.status as any,
            category: newReq.category || 'CPP',
            file: newReq.file || null,
          });
        } else {
          addRequirement({
            id: Date.now().toString(),
            name: newReq.name!,
            desc: newReq.desc || '',
            status: newReq.status as any,
            category: newReq.category || 'CPP',
            file: newReq.file || null,
          });
        }
        setShowModal(false);
        setConfirmState(null);
      }
    });
  };

  const handleDelete = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Requirement',
      message: 'Are you sure you want to delete this requirement? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: () => {
        const target = requirements.find(r => r.id === id);
        deleteRequirement(id);
        deleteUploadedFile(target?.file);
        setConfirmState(null);
      }
    });
  };

  const filteredReqs = requirements
    .filter(r => categoryFilter === 'All' || r.category === categoryFilter)
    .filter(r => statusFilter === 'All' || r.status === statusFilter);

  const allCategoriesList = Array.from(new Set(['CPP', 'CPW', 'Joint', 'KUA', 'Other', ...requirements.map(r => r.category as string)])).filter(Boolean);
  const completed = requirements.filter(r => r.status === 'Selesai').length;
  const progressPercent = requirements.length > 0 ? Math.round((completed / requirements.length) * 100) : 0;

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-4xl text-brand-text mb-2">Legal & Administration</h1>
          <p className="text-brand-text-muted">Manage your official documents and requirements.</p>
        </div>
        <div className="flex gap-3 relative">
          <button onClick={() => setShowStatusFilterPanel(v => !v)} className={`px-6 py-2.5 border rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors ${statusFilter !== 'All' ? 'bg-brand-accent/10 border-brand-accent text-brand-accent' : 'border-brand-accent text-brand-accent hover:bg-brand-accent/10'}`}>
            <Filter size={18} /> Filter
          </button>
          {showStatusFilterPanel && (
            <div className="absolute right-[168px] top-14 w-56 bg-brand-surface border border-brand-border rounded-xl shadow-lg z-50 p-2 space-y-1">
              {(['All', 'Selesai', 'Proses', 'Belum Diunggah'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => { setStatusFilter(st); setShowStatusFilterPanel(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${statusFilter === st ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'hover:bg-brand-surface-hover'}`}
                >
                  {st === 'All' ? 'Semua Status' : st}
                </button>
              ))}
            </div>
          )}
          <button onClick={openAddModal} className="px-6 py-2.5 bg-gradient-to-r from-brand-primary to-brand-accent text-white rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
            <Plus size={18} /> Add Requirement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-brand-surface-hover/50">
              <h3 className="font-headline text-xl text-brand-primary">Categories</h3>
            </div>
            <div className="p-2 space-y-1">
              {['All', 'CPP', 'CPW', 'Joint', 'KUA'].map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${categoryFilter === cat ? 'bg-brand-primary/10 text-brand-primary' : 'text-brand-text-muted hover:bg-brand-surface-hover'}`}>
                  <FileText size={18} />
                  <span className="text-sm">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h4 className="text-xs text-brand-text-muted uppercase tracking-wider font-semibold mb-3">Overall Progress</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-brand-primary">{progressPercent}% Complete</span>
              <span className="text-xs text-brand-text-muted font-medium">{completed} of {requirements.length} docs</span>
            </div>
            <div className="h-2 w-full bg-brand-surface-hover rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-6">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-surface-hover border-b border-brand-border">
                    <th className="px-6 py-4 text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Document Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-xs font-semibold text-brand-text-muted uppercase tracking-wider">File</th>
                    <th className="px-6 py-4 text-xs font-semibold text-brand-text-muted uppercase tracking-wider w-32">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-brand-text-muted uppercase tracking-wider w-32 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {filteredReqs.map((req) => (
                    <tr key={req.id} className="hover:bg-brand-surface-hover transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-brand-text">{req.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-text-muted">{req.desc}</td>
                      <td className="px-6 py-4">
                        {req.file ? (
                          /\.(jpg|jpeg|png|webp)(\?|$)/i.test(req.file) ? (
                            <div className="flex items-center gap-2">
                              <img src={req.file} alt={req.name} className="w-9 h-9 rounded-lg object-cover border border-brand-border shrink-0" />
                              <span className="text-xs text-brand-text-muted font-medium">Lihat dokumen</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-brand-text-muted font-medium">
                              <Paperclip size={14} /> {req.file}
                            </div>
                          )
                        ) : (
                          <span className="text-xs text-brand-text-muted/50 italic">No file</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          req.status === 'Selesai' ? 'bg-brand-success-bg text-brand-success' :
                          req.status === 'Proses' ? 'bg-brand-warning-bg text-brand-warning' :
                          'bg-brand-danger-bg text-brand-danger'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => openEditModal(req)} className="p-1.5 text-brand-text-muted hover:text-brand-primary rounded-lg transition-colors"><Edit size={16} /></button>
                          <button
                            onClick={() => req.file ? window.open(req.file, '_blank') : triggerUploadFor(req.id)}
                            disabled={isUploading && uploadTargetId === req.id}
                            title={req.file ? 'Lihat file' : 'Unggah file'}
                            className="p-1.5 text-brand-primary rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isUploading && uploadTargetId === req.id ? <Loader2 size={16} className="animate-spin" /> : req.file ? <Eye size={16} /> : <Upload size={16} />}
                          </button>
                          <button onClick={() => handleDelete(req.id)} className="p-1.5 text-brand-text-muted hover:text-brand-danger rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredReqs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-brand-text-muted text-sm">No documents in this category.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`p-8 border-2 border-dashed rounded-xl bg-brand-surface-hover/30 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer group ${isDragOver ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-border hover:border-brand-primary'}`}
            onClick={() => !isUploading && triggerUploadFor('new')}
          >
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
              {isUploading && uploadTargetId === 'new' ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-brand-text">
                {isUploading && uploadTargetId === 'new' ? 'Mengunggah...' : 'Drag and drop file to upload'}
              </p>
              <p className="text-xs text-brand-text-muted mt-1">Support JPG, PNG (Max 4MB)</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); if (!isUploading) triggerUploadFor('new'); }}
              disabled={isUploading}
              className="mt-2 px-4 py-1.5 text-xs font-semibold rounded-lg border border-brand-accent text-brand-accent disabled:opacity-50"
            >
              Add Evidence
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-brand-border">
              <h3 className="font-headline text-xl text-brand-text">{editingId ? 'Edit Document Requirement' : 'Add Document Requirement'}</h3>
              <button onClick={() => setShowModal(false)} className="text-brand-text-muted hover:text-brand-text transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-brand-text mb-1">Document Name</label>
                <input required value={newReq.name} onChange={e => setNewReq({...newReq, name: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" placeholder="e.g. Surat Pengantar" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-text mb-1">Description</label>
                <input value={newReq.desc} onChange={e => setNewReq({...newReq, desc: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-text mb-1">Category</label>
                  <select 
                    value={allCategoriesList.includes(newReq.category as string) ? newReq.category : 'Other'} 
                    onChange={e => setNewReq({...newReq, category: e.target.value})} 
                    className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all appearance-none"
                  >
                    {allCategoriesList.filter(c => c !== 'Other').map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="Other">Other</option>
                  </select>
                  {(!allCategoriesList.includes(newReq.category as string) || newReq.category === 'Other') && (
                    <input 
                      type="text" 
                      value={newReq.category === 'Other' ? '' : (newReq.category || '')} 
                      onChange={e => setNewReq({...newReq, category: e.target.value})} 
                      className="w-full px-4 py-2 mt-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" 
                      placeholder="Specify other category..." 
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-text mb-1">Status</label>
                  <select value={newReq.status} onChange={e => setNewReq({...newReq, status: e.target.value as any})} className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all appearance-none">
                    <option value="Belum Diunggah">Belum Diunggah</option>
                    <option value="Proses">Proses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-brand-border text-brand-text rounded-xl font-semibold text-sm hover:bg-brand-surface-hover transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover transition-colors">{editingId ? 'Update Document' : 'Save Document'}</button>
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
}
