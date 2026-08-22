"use client";

import React, { useState } from 'react';
import { useAppContext, Vendor } from '../store/AppContext';
import { 
  Store, 
  MessageCircle,
  FileText,
  Plus,
  CheckCircle,
  Mail,
  Globe,
  Star,
  User,
  Phone,
  XCircle,
  Search,
  Edit2,
  Trash2,
  PieChart as PieChartIcon,
  Upload
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatIDR as formatCurrency } from '../utils/formatters';
import { vendorStatusLabel } from '../lib/labels';

export const Vendors: React.FC = () => {
  const { 
    vendors, addVendor, editVendor, deleteVendor, addExpense
  } = useAppContext();
  
  // Filters for directory
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [vendorForm, setVendorForm] = useState<Partial<Vendor>>({});
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; title: string; message: string; type: 'danger' | 'info'; confirmText: string; onConfirm: () => void } | null>(null);


  const calculateTotalValue = () => vendors.reduce((acc, v) => acc + (v.totalValue || 0), 0);
  const calculateTotalPaid = () => vendors.reduce((acc, v) => acc + (v.paidValue || 0), 0);

  const pushToBudget = (vendor: Vendor) => {
    if (vendor.pushedToBudget) return;
    
    addExpense({
      id: Date.now().toString(),
      name: `Kontrak: ${vendor.name}`,
      vendor: vendor.name,
      total: vendor.totalValue,
      paid: vendor.paidValue,
      status: vendor.totalValue === vendor.paidValue ? 'Lunas' : (vendor.paidValue > 0 ? 'DP' : 'Unpaid'),
      category: vendor.category || 'Lainnya',
    } as any);

    editVendor({ ...vendor, pushedToBudget: true });
  };

  const openVendorModal = (vendor?: Vendor) => {
    if (vendor) {
      setEditingVendorId(vendor.id);
      setVendorForm(vendor);
    } else {
      setEditingVendorId(null);
      setVendorForm({
        category: 'Venue & Katering',
        status: 'RESEARCHING', 
        totalValue: 0, 
        paidValue: 0,
        rating: 5
      });
    }
    setShowVendorModal(true);
  };

  const saveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name) return;

    if (editingVendorId) {
      editVendor(vendorForm as Vendor);
    } else {
      addVendor({ 
        ...vendorForm, 
        id: Date.now().toString(),
        totalValue: Number(vendorForm.totalValue) || 0,
        paidValue: Number(vendorForm.paidValue) || 0,
        rating: Number(vendorForm.rating) || 5
      } as Vendor);
    }
    setShowVendorModal(false);
  };

  const handleDeleteVendor = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Hapus Vendor',
      message: 'Apakah kamu yakin ingin menghapus vendor partner ini?',
      type: 'danger',
      confirmText: 'Hapus',
      onConfirm: () => {
        deleteVendor(id);
        setConfirmState(null);
      }
    });
  };

  // --- DIRECTORY FILTERS ---
  const categoriesList = ['All', 'Venue & Katering', 'Bunga & Dekorasi', 'Foto & Video', 'Hiburan', 'Busana & Kecantikan', 'Transportasi', 'Lainnya'];
  const statuses = ['ALL', 'RESEARCHING', 'CONTACTED', 'NEGOTIATING', 'BOOKED', 'COMPLETED'];

  const filteredVendors = vendors.filter(v => {
    const matchCategory = filterCategory === 'All' || v.category === filterCategory;
    const matchStatus = filterStatus === 'ALL' || v.status === filterStatus;
    const matchSearch = (v.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (v.picName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  });

  const categoryData = vendors.reduce((acc, v) => {
    const cat = v.category || 'Other';
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += v.totalValue || 0;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value: Number(value) }))
    .filter(d => d.value > 0);

  const CHART_COLORS = ['#8B4A52', '#B8965A', '#5A8B74', '#D4AF37', '#2D7A5D', '#E65100', '#5D4037', '#455A64'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BOOKED':
      case 'COMPLETED': return 'bg-[#E3F2EB] text-[#2D7A5D]'; // Greenish
      case 'NEGOTIATING': return 'bg-[#FFF3E0] text-[#E65100]'; // Orangeish/Yellow
      case 'RESEARCHING':
      case 'CONTACTED': return 'bg-brand-surface-hover text-brand-text-muted';
      default: return 'bg-brand-surface-hover text-brand-text-muted';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold text-brand-accent uppercase tracking-widest mb-2">Direktori Partner</p>
          <h2 className="font-headline text-4xl text-brand-primary mb-2">Direktori Vendor & Partner</h2>
          <p className="text-brand-text-muted">Kelola relasi vendor, kontrak, tarif, dan milestone pembayaran.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => openVendorModal()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover transition-colors shadow-sm text-sm font-semibold"
          >
            <Plus size={16} />
            Tambah Vendor
          </button>
        </div>
      </div>

      {/* Summary & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col justify-center shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand-surface-hover rounded-lg text-brand-primary">
                <Store size={20} />
              </div>
              <h3 className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Total Vendor</h3>
            </div>
            <p className="font-headline text-4xl text-brand-text">{vendors.length}</p>
            <p className="text-xs text-brand-text-muted mt-2 font-medium">
              {vendors.filter(v => v.status === 'BOOKED' || v.status === 'COMPLETED').length} terkonfirmasi dipesan
            </p>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col justify-center shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                <FileText size={20} />
              </div>
              <h3 className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Nilai Kontrak</h3>
            </div>
            <p className="font-headline text-2xl text-brand-text truncate">{formatCurrency(calculateTotalValue())}</p>
            <div className="w-full h-1.5 bg-brand-surface-hover rounded-full overflow-hidden mt-3 mb-1">
              <div className="h-full bg-brand-primary rounded-full" style={{ width: `${calculateTotalValue() ? (calculateTotalPaid() / calculateTotalValue()) * 100 : 0}%` }} />
            </div>
            <p className="text-xs text-brand-text-muted font-medium">{formatCurrency(calculateTotalPaid())} dibayar</p>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col justify-center shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand-success-bg rounded-lg text-brand-success">
                <CheckCircle size={20} />
              </div>
              <h3 className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Tersinkron ke Budget</h3>
            </div>
            <p className="font-headline text-4xl text-brand-text">
              {vendors.filter(v => v.pushedToBudget).length}
            </p>
            <p className="text-xs text-brand-text-muted mt-2 font-medium">didorong ke audit budget</p>
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm min-h-[240px] flex flex-col">
          <h3 className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <PieChartIcon size={16} /> Pengeluaran per Kategori
          </h3>
          {chartData.length > 0 ? (
            <div className="flex-1 w-full relative min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => formatCurrency(Number(value) || 0)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-brand-text-muted text-sm font-medium">
              Belum ada data pengeluaran kategori
            </div>
          )}
        </div>
      </div>

      {/* Search & Category Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-brand-surface p-4 rounded-2xl border border-brand-border">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Cari vendor atau PIC..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-brand-surface-hover rounded-xl border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-primary transition-all"
          />
        </div>
        <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full md:w-auto pb-1 md:pb-0">
          {categoriesList.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                filterCategory === cat ? 'bg-brand-primary text-white border-brand-primary' : 'bg-brand-surface border-brand-border text-brand-text-muted hover:border-brand-accent'
              }`}
            >
              {cat === 'All' ? 'Semua' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        {statuses.map(st => (
          <button 
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-1 rounded-full text-xs font-bold tracking-wider transition-colors border ${
              filterStatus === st ? 'bg-brand-primary text-white border-brand-primary' : 'bg-brand-surface-hover border-transparent text-brand-text-muted hover:border-brand-border'
            }`}
          >
            {st === 'ALL' ? 'SEMUA' : vendorStatusLabel(st as Vendor['status']).toUpperCase()}
          </button>
        ))}
      </div>

      {/* Vendors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map(vendor => (
          <div key={vendor.id} className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex flex-col hover:shadow-md transition-shadow relative group">
            
            <div className="absolute top-4 right-4 flex gap-1 opacity-90 group-hover:opacity-100">
              <button 
                onClick={() => openVendorModal(vendor)} 
                className="p-2 bg-brand-surface-hover text-brand-text-muted hover:text-brand-primary rounded-full transition-colors"
                title="Edit Vendor"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDeleteVendor(vendor.id)}
                className="p-2 bg-brand-surface-hover text-brand-text-muted hover:text-brand-danger rounded-full transition-colors"
                title="Hapus Vendor"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex gap-4 items-start mb-4 pr-16">
              <div className="w-14 h-14 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-headline text-2xl font-medium shrink-0">
                {vendor.name ? vendor.name.substring(0, 2).toUpperCase() : '?'}
              </div>
              <div className="flex-1">
                <h3 className="font-headline text-2xl text-brand-text leading-tight mb-1">{vendor.name || 'Vendor Tanpa Nama'}</h3>
                <p className="text-[10px] font-bold text-brand-accent tracking-wider uppercase mb-1">{vendor.category}</p>
                <div className="flex gap-1 text-brand-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < (vendor.rating || 0) ? 'fill-current' : 'text-brand-border fill-brand-border'} />
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vendor.status || '')}`}>
                {vendor.status ? vendorStatusLabel(vendor.status) : 'Tidak diketahui'}
              </span>
            </div>

            <div className="space-y-2.5 mb-6 text-xs text-brand-text flex-1">
              <div className="flex items-center gap-3">
                <User size={15} className="text-brand-text-muted shrink-0" />
                <span>{vendor.picName || 'PIC belum ditentukan'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={15} className="text-brand-text-muted shrink-0" />
                <span>{vendor.picPhone || 'Tidak ada telepon'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={15} className="text-brand-text-muted shrink-0" />
                <span className="truncate">{vendor.picEmail || 'Tidak ada email'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe size={15} className="text-brand-text-muted shrink-0" />
                <span className="truncate">{vendor.website || 'Tidak ada website'}</span>
              </div>
            </div>

            <div className="border-t border-brand-border pt-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-brand-text-muted">Nilai Kontrak</span>
                <span className="font-semibold text-brand-text text-sm">{formatCurrency(vendor.totalValue || 0)}</span>
              </div>
              <div className="w-full h-1.5 bg-brand-surface-hover rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-brand-success rounded-full"
                  style={{ width: `${vendor.totalValue ? ((vendor.paidValue || 0) / vendor.totalValue) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-text-muted">{formatCurrency(vendor.paidValue || 0)} dibayar</span>
                <span className="font-semibold text-brand-text-muted">{Math.round(((vendor.paidValue || 0) / (vendor.totalValue || 1)) * 100)}%</span>
              </div>
            </div>

            {vendor.notes && (
              <p className="text-xs text-brand-text-muted italic mb-6 line-clamp-2">
                {vendor.notes}
              </p>
            )}

            <div className="mt-auto space-y-2">
              <a 
                href={`https://wa.me/${(vendor.picPhone || '').replace(/[^0-9]/g, '')}`} 
                target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full py-2 bg-brand-surface-hover text-brand-text rounded-xl font-semibold text-xs flex items-center justify-center gap-2 hover:bg-brand-surface-hover/80 transition-colors"
              >
                <MessageCircle size={16} />
                Kontak WhatsApp
              </a>
              {vendor.status === 'BOOKED' || vendor.status === 'COMPLETED' ? (
                <button
                  disabled={vendor.pushedToBudget}
                  onClick={(e) => { e.stopPropagation(); pushToBudget(vendor); }}
                  className={`w-full py-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors ${
                    vendor.pushedToBudget
                      ? 'bg-brand-surface-hover text-brand-text-muted cursor-not-allowed border border-brand-border'
                      : 'bg-brand-primary text-white hover:bg-brand-primary-hover'
                  }`}
                >
                  {vendor.pushedToBudget ? (
                    <><CheckCircle size={16} /> Tersinkron ke Budget</>
                  ) : (
                    <><Upload size={16} /> Dorong ke Budget</>
                  )}
                </button>
              ) : null}
            </div>
          </div>
        ))}

        {filteredVendors.length === 0 && (
          <div className="col-span-full text-center py-12 text-brand-text-muted border-2 border-dashed border-brand-border rounded-2xl">
            Tidak ada vendor yang cocok dengan kriteria kamu.
          </div>
        )}
      </div>

      {/* Add/Edit Vendor Modal */}
      {showVendorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-brand-border bg-brand-surface-hover">
              <h3 className="font-headline text-2xl text-brand-primary">{editingVendorId ? 'Edit Vendor Partner' : 'Tambah Vendor Partner Baru'}</h3>
              <button onClick={() => setShowVendorModal(false)} className="text-brand-text-muted hover:text-brand-text transition-colors">
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={saveVendor} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto hide-scrollbar">
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Nama Vendor</label>
                <input required value={vendorForm.name || ''} onChange={e => setVendorForm({...vendorForm, name: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="cth. The Grand Estate" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Kategori</label>
                  <select value={vendorForm.category || 'Venue & Katering'} onChange={e => setVendorForm({...vendorForm, category: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary">
                    {categoriesList.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Status</label>
                  <select value={vendorForm.status || 'RESEARCHING'} onChange={e => setVendorForm({...vendorForm, status: e.target.value as any})} className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary">
                    <option value="RESEARCHING">Riset</option>
                    <option value="CONTACTED">Dihubungi</option>
                    <option value="NEGOTIATING">Negosiasi</option>
                    <option value="BOOKED">Dipesan</option>
                    <option value="COMPLETED">Selesai</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Total Kontrak (Rp)</label>
                  <input value={vendorForm.totalValue || 0} onChange={e => setVendorForm({...vendorForm, totalValue: Number(e.target.value)})} type="number" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Nilai Dibayar (Rp)</label>
                  <input value={vendorForm.paidValue || 0} onChange={e => setVendorForm({...vendorForm, paidValue: Number(e.target.value)})} type="number" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Nama PIC</label>
                  <input value={vendorForm.picName || ''} onChange={e => setVendorForm({...vendorForm, picName: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="cth. Amanda Wells" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Telepon PIC (WhatsApp)</label>
                  <input value={vendorForm.picPhone || ''} onChange={e => setVendorForm({...vendorForm, picPhone: e.target.value})} type="tel" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="+628123456789" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Email PIC</label>
                  <input value={vendorForm.picEmail || ''} onChange={e => setVendorForm({...vendorForm, picEmail: e.target.value})} type="email" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="contact@vendor.id" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Rating (1-5)</label>
                  <input value={vendorForm.rating || 5} onChange={e => setVendorForm({...vendorForm, rating: Number(e.target.value)})} type="number" min="1" max="5" className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Catatan</label>
                <textarea value={vendorForm.notes || ''} onChange={e => setVendorForm({...vendorForm, notes: e.target.value})} rows={3} className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="Tambahkan catatan kontrak atau detail walkthrough..." />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowVendorModal(false)} className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-xl font-semibold text-sm hover:bg-brand-surface-hover">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover">{editingVendorId ? 'Perbarui Partner' : 'Simpan Partner'}</button>
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
