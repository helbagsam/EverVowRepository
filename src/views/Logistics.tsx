"use client";

import React, { useState } from 'react';
import { 
  Truck, Plus, Search, Edit2, Trash2, Box, Package, Wallet, XCircle, 
  ShieldCheck, Clock, Car, CheckCircle, AlertCircle, Edit, User, Phone, FileText 
} from 'lucide-react';
import { 
  useAppContext, LogisticItem, RentalItem, HandoverItem, LogisticsTimeline, TransportStay 
} from '../store/AppContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatIDR } from '../utils/formatters';
import {
  logisticItemStatusLabel, rentalConditionLabel, handoverStatusLabel,
  logisticsTimelineTypeLabel, transportStayTypeLabel
} from '../lib/labels';

export const Logistics: React.FC = () => {
  const { 
    logistics, addLogisticItem, deleteLogisticItem, editLogisticItem,
    rentals, addRental, editRental,
    handovers, addHandover, editHandover,
    logisticsTimelines, addLogisticsTimeline, editLogisticsTimeline,
    transportStays, addTransportStay, editTransportStay,
    vendors
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'inventory' | 'rentals' | 'handovers' | 'venueTimeline' | 'transport'>('inventory');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modals state
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null);
  const [inventoryForm, setInventoryForm] = useState<Partial<LogisticItem>>({ category: 'Rentals', status: 'Inquiry', cost: 0, percent: 0 });

  const [showRentalModal, setShowRentalModal] = useState(false);
  const [editingRentalId, setEditingRentalId] = useState<string | null>(null);
  const [rentalForm, setRentalForm] = useState<Partial<RentalItem>>({ arrivalStatus: 'Pending', returnStatus: 'Pending', quantity: 1 });

  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [editingHandoverId, setEditingHandoverId] = useState<string | null>(null);
  const [handoverForm, setHandoverForm] = useState<Partial<HandoverItem>>({ status: 'Pending' });

  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null);
  const [timelineForm, setTimelineForm] = useState<Partial<LogisticsTimeline>>({ type: 'Load-In', status: 'Pending', startTime: '08:00', endTime: '10:00' });

  const [showTransportModal, setShowTransportModal] = useState(false);
  const [editingTransportId, setEditingTransportId] = useState<string | null>(null);
  const [transportForm, setTransportForm] = useState<Partial<TransportStay>>({ type: 'Vehicle' });

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean, title: string, message: string, type: 'danger' | 'info', confirmText: string, onConfirm: () => void } | null>(null);

  // --- Handlers ---
  const openInventoryModal = (item?: LogisticItem) => {
    if (item) {
      setEditingInventoryId(item.id);
      setInventoryForm(item);
    } else {
      setEditingInventoryId(null);
      setInventoryForm({ name: '', category: 'Rentals', supplier: '', cost: 0, status: 'Inquiry', percent: 0 });
    }
    setShowInventoryModal(true);
  };

  const saveInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryForm.name) return;
    if (editingInventoryId) {
      editLogisticItem({ ...inventoryForm, id: editingInventoryId } as LogisticItem);
    } else {
      addLogisticItem({ ...inventoryForm, id: Date.now().toString() } as LogisticItem);
    }
    setShowInventoryModal(false);
  };

  const openRentalModal = (rental?: RentalItem) => {
    if (rental) {
      setEditingRentalId(rental.id);
      setRentalForm(rental);
    } else {
      setEditingRentalId(null);
      setRentalForm({ name: '', vendorId: vendors[0]?.id || '', quantity: 1, arrivalStatus: 'Pending', returnStatus: 'Pending', notes: '' });
    }
    setShowRentalModal(true);
  };

  const saveRental = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rentalForm.name) return;
    if (editingRentalId) editRental({ ...rentalForm, id: editingRentalId } as RentalItem);
    else addRental({ ...rentalForm, id: Date.now().toString() } as RentalItem);
    setShowRentalModal(false);
  };

  const openHandoverModal = (handover?: HandoverItem) => {
    if (handover) {
      setEditingHandoverId(handover.id);
      setHandoverForm(handover);
    } else {
      setEditingHandoverId(null);
      setHandoverForm({ name: '', valueDescription: '', picName: '', status: 'Pending' });
    }
    setShowHandoverModal(true);
  };

  const saveHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverForm.name) return;
    if (editingHandoverId) editHandover({ ...handoverForm, id: editingHandoverId } as HandoverItem);
    else addHandover({ ...handoverForm, id: Date.now().toString() } as HandoverItem);
    setShowHandoverModal(false);
  };

  const openTimelineModal = (tl?: LogisticsTimeline) => {
    if (tl) {
      setEditingTimelineId(tl.id);
      setTimelineForm(tl);
    } else {
      setEditingTimelineId(null);
      setTimelineForm({ activity: '', vendorId: vendors[0]?.id || '', type: 'Load-In', startTime: '08:00', endTime: '10:00', status: 'Pending' });
    }
    setShowTimelineModal(true);
  };

  const saveTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timelineForm.activity) return;
    if (editingTimelineId) editLogisticsTimeline({ ...timelineForm, id: editingTimelineId } as LogisticsTimeline);
    else addLogisticsTimeline({ ...timelineForm, id: Date.now().toString() } as LogisticsTimeline);
    setShowTimelineModal(false);
  };

  const openTransportModal = (ts?: TransportStay) => {
    if (ts) {
      setEditingTransportId(ts.id);
      setTransportForm(ts);
    } else {
      setEditingTransportId(null);
      setTransportForm({ type: 'Vehicle', name: '', allocation: '', capacity: '', notes: '' });
    }
    setShowTransportModal(true);
  };

  const saveTransport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transportForm.name) return;
    if (editingTransportId) editTransportStay({ ...transportForm, id: editingTransportId } as TransportStay);
    else addTransportStay({ ...transportForm, id: Date.now().toString() } as TransportStay);
    setShowTransportModal(false);
  };

  const filteredInventory = logistics
    .filter(l => filterCategory === 'All' || l.category === filterCategory)
    .filter(l => (l.name || '').toLowerCase().includes(search.toLowerCase()) || (l.supplier || '').toLowerCase().includes(search.toLowerCase()));

  const totalCost = logistics.reduce((sum, l) => sum + (l.cost || 0), 0);
  const pendingCount = logistics.filter(l => l.status === 'Pending' || l.status === 'Inquiry').length;

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-500 relative pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-semibold text-brand-accent uppercase tracking-widest mb-2">Pusat Operasi & Aset Acara</p>
          <h2 className="font-headline text-4xl text-brand-primary">Logistik & Operasi Venue</h2>
          <p className="text-brand-text-muted">Kelola item, aset sewa, protokol serah terima, jadwal load-in/out, dan mobilitas.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              if (activeTab === 'inventory') openInventoryModal();
              if (activeTab === 'rentals') openRentalModal();
              if (activeTab === 'handovers') openHandoverModal();
              if (activeTab === 'venueTimeline') openTimelineModal();
              if (activeTab === 'transport') openTransportModal();
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover transition-all font-semibold text-sm shadow-sm"
          >
            <Plus size={18} /> Tambah Entri Logistik
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 border-b border-brand-border">
        {[
          { id: 'inventory', label: 'Inventaris & Kebutuhan Pokok', icon: Box },
          { id: 'rentals', label: 'Sewa & Pelacakan Aset', icon: Package },
          { id: 'handovers', label: 'Serah Terima Mahar & Hadiah', icon: ShieldCheck },
          { id: 'venueTimeline', label: 'Timeline Load-In / Out Venue', icon: Clock },
          { id: 'transport', label: 'Transportasi & Akomodasi', icon: Car },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-brand-primary text-white shadow-sm' 
                  : 'bg-brand-surface text-brand-text-muted hover:bg-brand-surface-hover hover:text-brand-primary border border-brand-border'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: INVENTORY & ESSENTIALS */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 relative overflow-hidden group hover:border-brand-primary/40 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Box size={64} className="text-brand-primary" />
              </div>
              <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide mb-2">Total Item Logistik</p>
              <h3 className="font-headline text-4xl text-brand-primary mb-1">{logistics.length}</h3>
              <p className="text-sm text-brand-text-muted">Di seluruh kategori inventaris</p>
            </div>
            <div className="card p-6 relative overflow-hidden group hover:border-brand-warning/40 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Package size={64} className="text-brand-warning" />
              </div>
              <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide mb-2">Item Tertunda</p>
              <h3 className="font-headline text-4xl text-brand-primary mb-1">{pendingCount}</h3>
              <p className="text-sm font-medium text-brand-warning">Tanya Ketersediaan / Menunggu Konfirmasi</p>
            </div>
            <div className="card p-6 relative overflow-hidden group hover:border-brand-accent/40 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Wallet size={64} className="text-brand-accent" />
              </div>
              <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide mb-2">Estimasi Biaya Inventaris</p>
              <h3 className="font-headline text-3xl text-brand-primary mb-1">{formatIDR(totalCost)}</h3>
              <p className="text-sm text-brand-text-muted">Total budget yang dialokasikan untuk kebutuhan pokok</p>
            </div>
          </section>

          <section className="card flex flex-col overflow-hidden">
            <div className="p-6 border-b border-brand-border flex flex-col sm:flex-row justify-between gap-4 items-center bg-brand-surface-hover/30">
              <div className="relative w-full sm:w-96">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Cari item, supplier..." className="w-full h-11 pl-11 pr-4 bg-brand-surface rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary transition-all text-sm text-brand-text" />
              </div>
              <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
                {['All', 'Rentals', 'Decor', 'Gifts'].map(cat => (
                  <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filterCategory === cat ? 'bg-brand-primary text-white' : 'bg-brand-surface border border-brand-border text-brand-text-muted hover:border-brand-accent'}`}>{cat === 'All' ? 'Semua' : cat === 'Rentals' ? 'Sewa' : cat === 'Decor' ? 'Dekorasi' : 'Hadiah'}</button>
                ))}
              </div>
            </div>

            <div className="flex flex-col p-6 gap-4">
              {filteredInventory.map(item => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-brand-surface rounded-xl border border-brand-border hover:border-brand-primary/40 transition-colors group cursor-pointer shadow-sm">
                  <div className="col-span-1 md:col-span-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-brand-surface-hover flex items-center justify-center text-brand-primary border border-brand-border">
                      <Box size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-brand-primary">{item.name}</h4>
                        <span className="text-[10px] text-brand-accent font-bold uppercase">{item.percent}% Budget</span>
                      </div>
                      <div className="w-full bg-brand-surface-hover h-1 rounded-full mt-1 overflow-hidden">
                        <div className="bg-brand-accent h-full" style={{ width: `${item.percent}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block col-span-2 text-sm text-brand-text-muted">{item.category}</div>
                  <div className="hidden md:block col-span-2 text-sm text-brand-text">{item.supplier}</div>
                  <div className="hidden md:block col-span-2 text-right text-sm font-semibold">{formatIDR(item.cost)}</div>
                  <div className="col-span-1 flex justify-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'Confirmed' ? 'bg-brand-success-bg text-brand-success' :
                      item.status === 'Pending' ? 'bg-brand-warning-bg text-brand-warning' :
                      'bg-brand-danger-bg text-brand-danger'
                    }`}>{logisticItemStatusLabel(item.status)}</span>
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <button onClick={() => openInventoryModal(item)} className="p-1.5 hover:bg-brand-surface-hover rounded-lg transition-colors text-brand-text-muted hover:text-brand-primary"><Edit2 size={16} /></button>
                    <button onClick={() => deleteLogisticItem(item.id)} className="p-1.5 hover:bg-brand-danger-bg rounded-lg transition-colors text-brand-text-muted hover:text-brand-danger"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {filteredInventory.length === 0 && (
                <div className="text-center py-12 text-brand-text-muted border-2 border-dashed border-brand-border rounded-xl">
                  Tidak ada item inventaris ditemukan.
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: RENTALS & ASSETS TRACKING */}
      {activeTab === 'rentals' && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-surface-hover/50">
            <div>
              <h3 className="font-headline text-2xl text-brand-primary">Sewa & Pelacakan Aset</h3>
              <p className="text-xs text-brand-text-muted mt-1">Audit kondisi dan status kedatangan/pengembalian untuk kursi, dekorasi, kristal, dan peralatan sewaan.</p>
            </div>
            <button onClick={() => openRentalModal()} className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-primary-hover flex items-center gap-2">
              <Plus size={16} /> Tambah Aset Sewa
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-surface-hover border-b border-brand-border text-xs font-semibold text-brand-text-muted uppercase tracking-wider">
                  <th className="py-4 px-6">Item & Vendor</th>
                  <th className="py-4 px-6">Jumlah</th>
                  <th className="py-4 px-6">Kondisi Kedatangan</th>
                  <th className="py-4 px-6">Status Pengembalian</th>
                  <th className="py-4 px-6">Catatan</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {rentals.map(rental => {
                  const vendor = vendors.find(v => v.id === rental.vendorId);
                  return (
                    <tr key={rental.id} className="hover:bg-brand-surface-hover/50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-semibold text-brand-text text-sm">{rental.name}</p>
                        <p className="text-xs text-brand-text-muted">{vendor?.name || 'Vendor partner'}</p>
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-brand-primary">{rental.quantity} pcs</td>
                      <td className="py-4 px-6">
                        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                          rental.arrivalStatus === 'Good' ? 'bg-brand-success-bg text-brand-success' :
                          rental.arrivalStatus === 'Damaged' ? 'bg-brand-danger-bg text-brand-danger' :
                          'bg-brand-warning-bg text-brand-warning'
                        }`}>
                          {rentalConditionLabel(rental.arrivalStatus)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                          rental.returnStatus === 'Good' ? 'bg-brand-success-bg text-brand-success' :
                          rental.returnStatus === 'Damaged' ? 'bg-brand-danger-bg text-brand-danger' :
                          'bg-brand-warning-bg text-brand-warning'
                        }`}>
                          {rentalConditionLabel(rental.returnStatus)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-brand-text-muted italic max-w-[200px] truncate">{rental.notes || '-'}</td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => openRentalModal(rental)} className="p-2 text-brand-text-muted hover:text-brand-primary rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {rentals.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-brand-text-muted text-sm">Belum ada aset sewa terlacak.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MAHAR & GIFT HANDOVER */}
      {activeTab === 'handovers' && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-surface-hover/50">
            <div>
              <h3 className="font-headline text-2xl text-brand-primary">Protokol Serah Terima Barang Bernilai Tinggi</h3>
              <p className="text-xs text-brand-text-muted mt-1">Lacak aset bernilai tinggi (cincin nikah, Mahar, uang tunai, mas kawin, perhiasan keluarga) dan PIC penanggung jawab.</p>
            </div>
            <button onClick={() => openHandoverModal()} className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-primary-hover flex items-center gap-2">
              <Plus size={16} /> Tambah Item Serah Terima
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-surface-hover border-b border-brand-border text-xs font-semibold text-brand-text-muted uppercase tracking-wider">
                  <th className="py-4 px-6">Item & Deskripsi</th>
                  <th className="py-4 px-6">PIC Penanggung Jawab</th>
                  <th className="py-4 px-6">Status Serah Terima</th>
                  <th className="py-4 px-6 text-right">Aksi Protokol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {handovers.map(item => (
                  <tr key={item.id} className="hover:bg-brand-surface-hover/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-brand-text text-sm">{item.name}</p>
                      <p className="text-xs text-brand-text-muted">{item.valueDescription}</p>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-brand-text">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-brand-text-muted" />
                        {item.picName}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'Handed Over' ? 'bg-brand-success-bg text-brand-success' :
                        item.status === 'Returned' ? 'bg-brand-primary/10 text-brand-primary' :
                        'bg-brand-warning-bg text-brand-warning'
                      }`}>
                        {handoverStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        {item.status !== 'Handed Over' && (
                          <button
                            onClick={() => editHandover({ ...item, status: 'Handed Over', handoverTime: new Date().toLocaleTimeString() })}
                            className="px-3 py-1 bg-brand-success-bg text-brand-success rounded-lg text-xs font-semibold hover:bg-brand-success/20 transition-colors"
                          >
                            Tandai Diserahkan
                          </button>
                        )}
                        {item.status === 'Handed Over' && (
                          <button
                            onClick={() => editHandover({ ...item, status: 'Returned', returnTime: new Date().toLocaleTimeString() })}
                            className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-xs font-semibold hover:bg-brand-primary/20 transition-colors"
                          >
                            Tandai Dikembalikan
                          </button>
                        )}
                        <button onClick={() => openHandoverModal(item)} className="p-1.5 text-brand-text-muted hover:text-brand-primary rounded-lg">
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {handovers.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-brand-text-muted text-sm">Belum ada protokol serah terima tercatat.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: VENUE LOGISTICS TIMELINE */}
      {activeTab === 'venueTimeline' && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-surface-hover/50">
            <div>
              <h3 className="font-headline text-2xl text-brand-primary">Jadwal Load-In / Out Venue</h3>
              <p className="text-xs text-brand-text-muted mt-1">Koordinasikan loading dock, jendela setup vendor, sound check, dan pembongkaran pasca-resepsi.</p>
            </div>
            <button onClick={() => openTimelineModal()} className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-primary-hover flex items-center gap-2">
              <Plus size={16} /> Tambah Jendela Muat
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-surface-hover border-b border-brand-border text-xs font-semibold text-brand-text-muted uppercase tracking-wider">
                  <th className="py-4 px-6">Jendela Waktu</th>
                  <th className="py-4 px-6">Aktivitas & Vendor</th>
                  <th className="py-4 px-6">Tipe</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {logisticsTimelines.map(log => {
                  const vendor = vendors.find(v => v.id === log.vendorId);
                  return (
                    <tr key={log.id} className="hover:bg-brand-surface-hover/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-sm text-brand-primary">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-brand-accent" />
                          {log.startTime} - {log.endTime}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-brand-text text-sm">{log.activity}</p>
                        <p className="text-xs text-brand-text-muted">{vendor?.name || 'Partner'}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-brand-surface border border-brand-border text-brand-text-muted rounded-md text-xs font-medium">
                          {logisticsTimelineTypeLabel(log.type)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={log.status}
                          onChange={(e) => editLogisticsTimeline({ ...log, status: e.target.value as any })}
                          className="bg-brand-surface border border-brand-border text-brand-text text-xs rounded-lg px-2.5 py-1 font-semibold focus:outline-none"
                        >
                          <option value="Pending">Menunggu</option>
                          <option value="In Progress">Berjalan</option>
                          <option value="Completed">Selesai</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => openTimelineModal(log)} className="p-2 text-brand-text-muted hover:text-brand-primary rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {logisticsTimelines.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-brand-text-muted text-sm">Belum ada jendela muat venue.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: TRANSPORT & ACCOMMODATION */}
      {activeTab === 'transport' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {transportStays.map(item => (
            <div key={item.id} className="card p-6 flex flex-col justify-between hover:border-brand-primary/40 transition-colors relative group">
              <button 
                onClick={() => openTransportModal(item)} 
                className="absolute top-4 right-4 p-2 bg-brand-surface-hover text-brand-text-muted hover:text-brand-primary rounded-full transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-semibold">
                    {item.type === 'Accommodation' ? <FileText size={24} /> : <Car size={24} />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">{transportStayTypeLabel(item.type)}</span>
                    <h4 className="font-headline text-2xl text-brand-text leading-tight">{item.name}</h4>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-brand-text-muted border-t border-brand-border pt-4">
                  <div className="flex justify-between">
                    <span>Alokasi:</span>
                    <span className="font-semibold text-brand-text">{item.allocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kapasitas:</span>
                    <span className="font-semibold text-brand-text">{item.capacity}</span>
                  </div>
                  {item.notes && (
                    <p className="mt-2 italic text-brand-text-muted border-l-2 border-brand-accent pl-3 py-1">
                      "{item.notes}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {transportStays.length === 0 && (
            <div className="col-span-full text-center py-12 card text-brand-text-muted">
              Belum ada mobilitas atau akomodasi yang ditugaskan.
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Inventory Form */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-brand-border bg-brand-surface-hover">
              <h3 className="font-headline text-xl text-brand-text">{editingInventoryId ? 'Edit Item Logistik' : 'Tambah Item Logistik'}</h3>
              <button onClick={() => setShowInventoryModal(false)} className="text-brand-text-muted hover:text-brand-text"><XCircle size={20} /></button>
            </div>
            <form onSubmit={saveInventory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Nama Item</label>
                <input required value={inventoryForm.name || ''} onChange={e => setInventoryForm({...inventoryForm, name: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Kategori</label>
                  <select value={inventoryForm.category || 'Rentals'} onChange={e => setInventoryForm({...inventoryForm, category: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary">
                    <option value="Rentals">Sewa</option>
                    <option value="Decor">Dekorasi</option>
                    <option value="Gifts">Hadiah</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Status</label>
                  <select value={inventoryForm.status || 'Inquiry'} onChange={e => setInventoryForm({...inventoryForm, status: e.target.value as any})} className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary">
                    <option value="Inquiry">Tanya Ketersediaan</option>
                    <option value="Pending">Menunggu</option>
                    <option value="Confirmed">Terkonfirmasi</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Biaya (Rp)</label>
                  <input value={inventoryForm.cost || 0} onChange={e => setInventoryForm({...inventoryForm, cost: parseInt(e.target.value) || 0})} type="number" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Budget %</label>
                  <input value={inventoryForm.percent || 0} onChange={e => setInventoryForm({...inventoryForm, percent: parseFloat(e.target.value) || 0})} type="number" step="0.1" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Supplier</label>
                <input value={inventoryForm.supplier || ''} onChange={e => setInventoryForm({...inventoryForm, supplier: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowInventoryModal(false)} className="flex-1 px-4 py-2 border border-brand-border text-brand-text rounded-xl font-semibold text-sm hover:bg-brand-surface-hover">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover">{editingInventoryId ? 'Perbarui Item' : 'Simpan Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Rental Form */}
      {showRentalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-brand-border bg-brand-surface-hover">
              <h3 className="font-headline text-xl text-brand-text">{editingRentalId ? 'Edit Aset Sewa' : 'Tambah Aset Sewa'}</h3>
              <button onClick={() => setShowRentalModal(false)} className="text-brand-text-muted hover:text-brand-text"><XCircle size={20} /></button>
            </div>
            <form onSubmit={saveRental} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Nama Aset</label>
                <input required value={rentalForm.name || ''} onChange={e => setRentalForm({...rentalForm, name: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="cth. Kursi Chiavari - Emas" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Vendor Partner</label>
                  <select value={rentalForm.vendorId || ''} onChange={e => setRentalForm({...rentalForm, vendorId: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary">
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Jumlah</label>
                  <input value={rentalForm.quantity || 1} onChange={e => setRentalForm({...rentalForm, quantity: Number(e.target.value)})} type="number" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Status Kedatangan</label>
                  <select value={rentalForm.arrivalStatus || 'Pending'} onChange={e => setRentalForm({...rentalForm, arrivalStatus: e.target.value as any})} className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary">
                    <option value="Pending">Menunggu</option>
                    <option value="Good">Baik</option>
                    <option value="Damaged">Rusak</option>
                    <option value="Missing">Hilang</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Status Pengembalian</label>
                  <select value={rentalForm.returnStatus || 'Pending'} onChange={e => setRentalForm({...rentalForm, returnStatus: e.target.value as any})} className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary">
                    <option value="Pending">Menunggu</option>
                    <option value="Good">Baik</option>
                    <option value="Damaged">Rusak</option>
                    <option value="Missing">Hilang</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Catatan</label>
                <input value={rentalForm.notes || ''} onChange={e => setRentalForm({...rentalForm, notes: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="Catatan penanganan khusus..." />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowRentalModal(false)} className="flex-1 px-4 py-2 border border-brand-border text-brand-text rounded-xl font-semibold text-sm hover:bg-brand-surface-hover">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover">{editingRentalId ? 'Perbarui Aset' : 'Simpan Aset'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Handover Form */}
      {showHandoverModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-brand-border bg-brand-surface-hover">
              <h3 className="font-headline text-xl text-brand-text">{editingHandoverId ? 'Edit Item Serah Terima' : 'Tambah Protokol Serah Terima'}</h3>
              <button onClick={() => setShowHandoverModal(false)} className="text-brand-text-muted hover:text-brand-text"><XCircle size={20} /></button>
            </div>
            <form onSubmit={saveHandover} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Judul Item</label>
                <input required value={handoverForm.name || ''} onChange={e => setHandoverForm({...handoverForm, name: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="cth. Cincin Nikah / Mahar" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Deskripsi & Nilai</label>
                <input value={handoverForm.valueDescription || ''} onChange={e => setHandoverForm({...handoverForm, valueDescription: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="cth. Set cincin Platinum & Berlian" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">PIC Penanggung Jawab</label>
                <input value={handoverForm.picName || ''} onChange={e => setHandoverForm({...handoverForm, picName: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="cth. Pendamping Utama Pria (Arthur)" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Status</label>
                <select value={handoverForm.status || 'Pending'} onChange={e => setHandoverForm({...handoverForm, status: e.target.value as any})} className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary">
                  <option value="Pending">Menunggu</option>
                  <option value="Handed Over">Sudah Diserahkan</option>
                  <option value="Returned">Sudah Dikembalikan</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowHandoverModal(false)} className="flex-1 px-4 py-2 border border-brand-border text-brand-text rounded-xl font-semibold text-sm hover:bg-brand-surface-hover">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover">{editingHandoverId ? 'Perbarui Protokol' : 'Simpan Protokol'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Venue Timeline Form */}
      {showTimelineModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-brand-border bg-brand-surface-hover">
              <h3 className="font-headline text-xl text-brand-text">{editingTimelineId ? 'Edit Slot Load-In' : 'Tambah Slot Muat Venue'}</h3>
              <button onClick={() => setShowTimelineModal(false)} className="text-brand-text-muted hover:text-brand-text"><XCircle size={20} /></button>
            </div>
            <form onSubmit={saveTimeline} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Nama Aktivitas</label>
                <input required value={timelineForm.activity || ''} onChange={e => setTimelineForm({...timelineForm, activity: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="cth. Muat & Rigging Dekorasi" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Waktu Mulai</label>
                  <input value={timelineForm.startTime || '08:00'} onChange={e => setTimelineForm({...timelineForm, startTime: e.target.value})} type="time" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Waktu Selesai</label>
                  <input value={timelineForm.endTime || '10:00'} onChange={e => setTimelineForm({...timelineForm, endTime: e.target.value})} type="time" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Tipe</label>
                  <select value={timelineForm.type || 'Load-In'} onChange={e => setTimelineForm({...timelineForm, type: e.target.value as any})} className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary">
                    <option value="Load-In">Muat Masuk</option>
                    <option value="Operational">Operasional</option>
                    <option value="Load-Out">Muat Keluar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Vendor Partner</label>
                  <select value={timelineForm.vendorId || ''} onChange={e => setTimelineForm({...timelineForm, vendorId: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary">
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowTimelineModal(false)} className="flex-1 px-4 py-2 border border-brand-border text-brand-text rounded-xl font-semibold text-sm hover:bg-brand-surface-hover">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover">{editingTimelineId ? 'Perbarui Slot' : 'Simpan Slot'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Transport Form */}
      {showTransportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-brand-border bg-brand-surface-hover">
              <h3 className="font-headline text-xl text-brand-text">{editingTransportId ? 'Edit Mobilitas / Menginap' : 'Tambah Transportasi / Akomodasi'}</h3>
              <button onClick={() => setShowTransportModal(false)} className="text-brand-text-muted hover:text-brand-text"><XCircle size={20} /></button>
            </div>
            <form onSubmit={saveTransport} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Judul / Nama Kendaraan</label>
                <input required value={transportForm.name || ''} onChange={e => setTransportForm({...transportForm, name: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="cth. Alphard Hitam VIP / Presidential Suite" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Tipe</label>
                  <select value={transportForm.type || 'Vehicle'} onChange={e => setTransportForm({...transportForm, type: e.target.value as any})} className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary">
                    <option value="Vehicle">Kendaraan</option>
                    <option value="Shuttle">Shuttle</option>
                    <option value="Accommodation">Akomodasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Kapasitas</label>
                  <input value={transportForm.capacity || ''} onChange={e => setTransportForm({...transportForm, capacity: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="cth. 4 Pax" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Alokasi / Diperuntukkan Untuk</label>
                <input value={transportForm.allocation || ''} onChange={e => setTransportForm({...transportForm, allocation: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="cth. Pasangan & Orang Tua" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted uppercase mb-1">Catatan & Jadwal</label>
                <input value={transportForm.notes || ''} onChange={e => setTransportForm({...transportForm, notes: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl bg-brand-surface-hover border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-primary" placeholder="cth. Standby pukul 07:00 di Lobi Hotel" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowTransportModal(false)} className="flex-1 px-4 py-2 border border-brand-border text-brand-text rounded-xl font-semibold text-sm hover:bg-brand-surface-hover">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-hover">{editingTransportId ? 'Perbarui Entri' : 'Simpan Entri'}</button>
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
