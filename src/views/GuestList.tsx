"use client";

import React, { useState } from 'react';
import { useAppContext, Guest } from '../store/AppContext';
import { Search, Filter, Plus, Download, MessageCircle, Users, CheckCircle, Clock, XCircle, Trash2, Edit, Upload, FileSpreadsheet } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import * as XLSX from 'xlsx';

export const GuestList: React.FC = () => {
  const { guests, addGuest, deleteGuest, editGuest, targetGuests, guestGroups } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Pending' | 'Declined'>('All');
  const [groupFilter, setGroupFilter] = useState('All');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGuest, setNewGuest] = useState<Partial<Guest>>({ status: 'Pending', group: 'Unassigned', table: 'Unassigned' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean, title: string, message: string, type: 'danger' | 'info', confirmText: string, onConfirm: () => void } | null>(null);

  // Download Excel Template — file .xlsx ASLI (bukan .csv) supaya kolom
  // Name, Phone, Group, Status, Table selalu terpisah rapi saat dibuka di
  // Excel manapun, terlepas dari pengaturan regional (mis. Indonesia yang
  // memakai titik-koma sebagai pemisah CSV default).
  const handleDownloadTemplate = () => {
    const rows = [
      ['Name', 'Phone', 'Group', 'Status', 'Table'],
      ['Arthur Pendelton', '+62812345678', 'Family', 'Confirmed', 'T-01'],
      ['Clara Oswald', '+62819876543', 'Friends', 'Pending', 'Unassigned'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Guest List Template');
    XLSX.writeFile(wb, 'Guest_List_Template.xlsx');
  };

  // Parses one CSV line while respecting quoted fields that may contain commas,
  // e.g. "Doe, John",+62...,Family,Confirmed,T-01
  const parseCsvLine = (line: string): string[] => {
    const cols: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cols.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    cols.push(cur.trim());
    return cols;
  };

  const buildGuestFromRow = (cols: string[], idx: number): Guest | null => {
    if (!cols[0]) return null;
    return {
      id: `${Date.now()}-${idx}`,
      name: String(cols[0]).trim(),
      phone: cols[1] ? String(cols[1]).trim() : '',
      group: cols[2] ? String(cols[2]).trim() : 'Unassigned',
      status: (cols[3] === 'Confirmed' || cols[3] === 'Declined') ? cols[3] : 'Pending',
      table: cols[4] ? String(cols[4]).trim() : 'Unassigned',
    };
  };

  // Import Guests dari file .xlsx ATAU .csv — membaca setiap baris data
  // (setelah header) dan menambahkan SEMUANYA, bukan cuma baris terakhir.
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isExcel = /\.(xlsx|xls)$/i.test(file.name);

    const processRows = (rows: string[][]) => {
      const dataRows = rows.filter(r => r.some(c => String(c ?? '').trim().length > 0));
      if (dataRows.length <= 1) {
        alert('File kosong atau hanya berisi header. Isi minimal 1 baris data tamu.');
        e.target.value = '';
        return;
      }
      const newGuests: Guest[] = [];
      for (let i = 1; i < dataRows.length; i++) {
        const g = buildGuestFromRow(dataRows[i], i);
        if (g) newGuests.push(g);
      }
      newGuests.forEach(g => addGuest(g));
      alert(`${newGuests.length} tamu berhasil diimpor.`);
      e.target.value = '';
    };

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = evt.target?.result;
        if (!data) return;
        const wb = XLSX.read(data, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, raw: false });
        processRows(rows);
      };
      reader.readAsBinaryString(file);
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (!text) return;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        const rows = lines.map(l => parseCsvLine(l).map(c => c.replace(/^["']|["']$/g, '')));
        processRows(rows);
      };
      reader.readAsText(file);
    }
  };

  // Export current guests — file .xlsx asli dengan kolom terpisah.
  const handleExportGuests = () => {
    const rows = [
      ['Name', 'Phone', 'Group', 'Status', 'Table'],
      ...guests.map(g => [g.name, g.phone, g.group, g.status, g.table]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Guest List');
    XLSX.writeFile(wb, `EverVow_Guest_List_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filteredGuests = guests
    .filter(g =>
      (g.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.group || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(g => statusFilter === 'All' || g.status === statusFilter)
    .filter(g => groupFilter === 'All' || g.group === groupFilter);

  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.status === 'Confirmed').length,
    pending: guests.filter(g => g.status === 'Pending').length,
    declined: guests.filter(g => g.status === 'Declined').length,
  };

  const openAddModal = () => {
    setEditingId(null);
    setNewGuest({ status: 'Pending', group: 'Unassigned', table: 'Unassigned' });
    setShowAddModal(true);
  };

  const openEditModal = (guest: Guest) => {
    setEditingId(guest.id);
    setNewGuest({ ...guest });
    setShowAddModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGuest.name && newGuest.phone) {
      setConfirmState({
        isOpen: true,
        title: editingId ? 'Save Changes' : 'Add Guest',
        message: editingId ? 'Are you sure you want to update this guest?' : 'Are you sure you want to add this guest?',
        type: 'info',
        confirmText: 'Save',
        onConfirm: () => {
          if (editingId) {
            editGuest({
              id: editingId,
              name: newGuest.name!,
              phone: newGuest.phone!,
              group: newGuest.group || 'Unassigned',
              status: newGuest.status as any,
              table: newGuest.table || 'Unassigned'
            });
          } else {
            addGuest({
              id: Date.now().toString(),
              name: newGuest.name!,
              phone: newGuest.phone!,
              group: newGuest.group || 'Unassigned',
              status: newGuest.status as any,
              table: newGuest.table || 'Unassigned'
            });
          }
          setShowAddModal(false);
          setConfirmState(null);
        }
      });
    }
  };

  const handleDelete = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Guest',
      message: 'Are you sure you want to delete this guest? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: () => {
        deleteGuest(id);
        setConfirmState(null);
      }
    });
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allFilteredSelected = filteredGuests.length > 0 && filteredGuests.every(g => selectedIds.has(g.id));

  const toggleSelectAll = () => {
    setSelectedIds(prev => {
      if (allFilteredSelected) {
        // Unselect hanya yang lagi tampil (sesuai filter aktif)
        const next = new Set(prev);
        filteredGuests.forEach(g => next.delete(g.id));
        return next;
      }
      const next = new Set(prev);
      filteredGuests.forEach(g => next.add(g.id));
      return next;
    });
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    setConfirmState({
      isOpen: true,
      title: 'Delete Selected Guests',
      message: `Are you sure you want to delete ${count} selected guest${count > 1 ? 's' : ''}? This action cannot be undone.`,
      type: 'danger',
      confirmText: `Delete ${count}`,
      onConfirm: () => {
        selectedIds.forEach(id => deleteGuest(id));
        setSelectedIds(new Set());
        setConfirmState(null);
      }
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-xs font-semibold text-brand-accent uppercase tracking-widest mb-2">Management</p>
          <h2 className="font-headline text-4xl text-brand-text">Guest List & Seating</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-4 py-2.5 bg-brand-surface border border-brand-accent text-brand-accent rounded-xl hover:bg-brand-accent/10 transition-colors font-semibold text-xs">
            <FileSpreadsheet size={16} /> Excel Template
          </button>
          <label className="flex items-center gap-2 px-4 py-2.5 bg-brand-surface border border-brand-border text-brand-text rounded-xl hover:bg-brand-surface-hover transition-colors font-semibold text-xs cursor-pointer">
            <Upload size={16} /> Import Guests
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleImportCSV} className="hidden" />
          </label>
          <button onClick={handleExportGuests} className="flex items-center gap-2 px-4 py-2.5 bg-brand-surface border border-brand-border text-brand-text rounded-xl hover:bg-brand-surface-hover transition-colors font-semibold text-xs">
            <Download size={16} /> Export List
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-xl shadow-md hover:bg-brand-primary-hover transition-colors font-semibold text-xs" onClick={openAddModal}>
            <Plus size={16} /> Add Guest
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Target Guests" value={targetGuests} icon={<Users />} color="text-brand-primary" bg="bg-brand-primary/10" subtitle={`${stats.total} Invited`} />
        <StatCard title="Confirmed" value={stats.confirmed} icon={<CheckCircle />} color="text-brand-success" bg="bg-brand-success-bg" subtitle={`${Math.round((stats.confirmed/stats.total)*100)||0}%`} />
        <StatCard title="Pending" value={stats.pending} icon={<Clock />} color="text-brand-warning" bg="bg-brand-warning-bg" subtitle="Awaiting" />
        <StatCard title="Declined" value={stats.declined} icon={<XCircle />} color="text-brand-danger" bg="bg-brand-danger-bg" subtitle="Regrets" />
      </div>

      {/* Table Section */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-brand-border flex flex-col md:flex-row justify-between gap-4 items-center bg-brand-surface-hover/50">
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" />
            <input 
              type="text" 
              placeholder="Search guests by name or group..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm text-brand-text"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterPanel(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${(statusFilter !== 'All' || groupFilter !== 'All') ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'bg-brand-surface border-brand-border hover:bg-brand-surface-hover'}`}
            >
              <Filter size={18} /> More Filters {(statusFilter !== 'All' || groupFilter !== 'All') && <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />}
            </button>
            {showFilterPanel && (
              <div className="absolute right-0 mt-2 w-64 bg-brand-surface border border-brand-border rounded-xl shadow-lg z-50 p-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-brand-text-muted mb-1.5 block">Status</label>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-full px-3 py-2 rounded-lg bg-brand-surface-hover border border-brand-border text-sm focus:outline-none focus:border-brand-primary">
                    <option value="All">Semua Status</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-brand-text-muted mb-1.5 block">Group</label>
                  <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-brand-surface-hover border border-brand-border text-sm focus:outline-none focus:border-brand-primary">
                    <option value="All">Semua Group</option>
                    {guestGroups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                {(statusFilter !== 'All' || groupFilter !== 'All') && (
                  <button onClick={() => { setStatusFilter('All'); setGroupFilter('All'); }} className="text-xs font-semibold text-brand-danger hover:underline">Reset Filter</button>
                )}
              </div>
            )}
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="px-6 py-3 bg-brand-primary/5 border-b border-brand-border flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm font-semibold text-brand-primary">{selectedIds.size} tamu dipilih</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedIds(new Set())} className="text-xs font-semibold text-brand-text-muted hover:text-brand-text">
                Batalkan Pilihan
              </button>
              <button onClick={handleBulkDelete} className="flex items-center gap-2 px-3 py-1.5 bg-brand-danger text-white rounded-lg hover:bg-brand-danger/90 transition-colors font-semibold text-xs">
                <Trash2 size={14} /> Hapus {selectedIds.size} Tamu
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-surface-hover border-b border-brand-border text-xs font-semibold text-brand-text-muted uppercase tracking-wider">
                <th className="py-4 px-6 w-10">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer"
                  />
                </th>
                <th className="py-4 px-6">Guest Name</th>
                <th className="py-4 px-6">Group</th>
                <th className="py-4 px-6">RSVP Status</th>
                <th className="py-4 px-6">Table No.</th>
                <th className="py-4 px-6 text-center">Contact</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredGuests.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-brand-text-muted">No guests found.</td></tr>
              ) : (
                filteredGuests.map(guest => (
                  <tr key={guest.id} className={`hover:bg-brand-surface-hover transition-colors group ${selectedIds.has(guest.id) ? 'bg-brand-primary/5' : ''}`}>
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(guest.id)}
                        onChange={() => toggleSelectOne(guest.id)}
                        className="w-4 h-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-surface-hover border border-brand-border flex items-center justify-center font-headline text-brand-primary">
                          {guest.name ? guest.name.split(' ').map(n => n[0]).join('').substring(0, 2) : '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-brand-text">{guest.name || 'Unnamed Guest'}</p>
                          <p className="text-xs text-brand-text-muted">{guest.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-brand-border/30 text-brand-text rounded-full text-xs font-medium whitespace-nowrap">
                        {guest.group}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        guest.status === 'Confirmed' ? 'bg-brand-success-bg text-brand-success' :
                        guest.status === 'Pending' ? 'bg-brand-warning-bg text-brand-warning' :
                        'bg-brand-danger-bg text-brand-danger'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          guest.status === 'Confirmed' ? 'bg-brand-success' :
                          guest.status === 'Pending' ? 'bg-brand-warning' :
                          'bg-brand-danger'
                        }`}></span>
                        {guest.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-semibold ${guest.table === 'Unassigned' ? 'text-brand-text-muted italic text-xs' : 'text-brand-primary font-headline text-lg'}`}>
                        {guest.table}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <a href={`https://wa.me/${guest.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-colors" title="Message on WhatsApp">
                          <MessageCircle size={16} />
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(guest)} className="p-2 text-brand-text-muted hover:text-brand-primary hover:bg-brand-surface-hover rounded-lg transition-colors">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(guest.id)} className="p-2 text-brand-text-muted hover:text-brand-danger hover:bg-brand-danger-bg rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-surface w-full max-w-lg rounded-2xl shadow-xl border border-brand-border max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-brand-border flex justify-between items-center bg-brand-surface-hover">
              <h3 className="font-headline text-2xl text-brand-primary">{editingId ? 'Edit Guest' : 'Add New Guest'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-brand-text-muted hover:text-brand-text"><XCircle size={24} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-text-muted uppercase">Full Name</label>
                <input required type="text" value={newGuest.name || ''} onChange={e => setNewGuest({...newGuest, name: e.target.value})} className="w-full px-4 py-2 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary text-sm text-brand-text" placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-text-muted uppercase">Phone (WhatsApp)</label>
                <input required type="tel" value={newGuest.phone || ''} onChange={e => setNewGuest({...newGuest, phone: e.target.value})} className="w-full px-4 py-2 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary text-sm text-brand-text" placeholder="+62 812 3456 7890" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-text-muted uppercase">Group</label>
                  <select 
                    value={guestGroups.includes(newGuest.group as string) ? newGuest.group : 'Other'} 
                    onChange={e => setNewGuest({...newGuest, group: e.target.value})} 
                    className="w-full px-4 py-2 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary text-sm text-brand-text appearance-none"
                  >
                    {guestGroups.filter(g => g !== 'Other').map(g => <option key={g} value={g}>{g}</option>)}
                    <option value="Other">Other</option>
                  </select>
                  {(!guestGroups.includes(newGuest.group as string) || newGuest.group === 'Other') && (
                    <input 
                      type="text" 
                      value={newGuest.group === 'Other' ? '' : (newGuest.group || '')} 
                      onChange={e => setNewGuest({...newGuest, group: e.target.value})} 
                      className="w-full px-4 py-2 mt-2 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary text-sm text-brand-text" 
                      placeholder="Specify other group..." 
                    />
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-text-muted uppercase">Table No.</label>
                  <input type="text" value={newGuest.table || ''} onChange={e => setNewGuest({...newGuest, table: e.target.value})} className="w-full px-4 py-2 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary text-sm text-brand-text" placeholder="e.g. T-01" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-text-muted uppercase">Status</label>
                <select value={newGuest.status} onChange={e => setNewGuest({...newGuest, status: e.target.value as any})} className="w-full px-4 py-2 bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary text-sm text-brand-text">
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 rounded-xl font-semibold text-brand-text-muted hover:bg-brand-surface-hover">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover">{editingId ? 'Update Guest' : 'Save Guest'}</button>
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

const StatCard = ({ title, value, icon, color, bg, subtitle }: any) => (
  <div className="card p-6 flex flex-col justify-between group cursor-pointer hover:border-brand-accent transition-colors">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-brand-text">{title}</h3>
      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
    <div className="flex items-end gap-2">
      <span className={`font-headline text-4xl leading-none ${color === 'text-brand-primary' ? 'text-brand-primary' : 'text-brand-text'}`}>{value}</span>
      <span className="text-sm text-brand-text-muted mb-1">{subtitle}</span>
    </div>

</div>
);
