"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatDate } from '../utils/formatters';
import { taskPriorityLabel } from '../lib/labels';
import { 
  Plus, Clock, CheckCircle, Gauge, 
  MapPin, Palette, Plane, Filter, PlusCircle, Edit2, Trash2,
  X, Home, Shirt, Camera, Music, Truck, 
  FileText, Users, CreditCard, MoreHorizontal, User,
  Store, FolderPlus
} from 'lucide-react';

// --- Types ---
type Member = { id: string; name: string; initials: string; color: string; bgColor: string };
type Category = { id: string; name: string; icon: string; colorClass: string; bgClass: string };
type Task = {
  id: string;
  categoryId: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  assigneeId: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  desc: string;
};

// Catatan: dulu ada initialMembers/initialCategories/initialTasks berisi
// data contoh ("Sarah J.", "Finalize Venue Contract", dst.) yang di-seed
// otomatis ke akun baru. Sudah dihapus total — akun baru mulai kosong,
// kategori/task/member semua dibuat manual lewat UI.

const ICON_MAP: Record<string, React.ElementType> = {
  home: Home, palette: Palette, shirt: Shirt, camera: Camera,
  music: Music, truck: Truck, filetext: FileText, users: Users,
  creditcard: CreditCard, more: MoreHorizontal, plane: Plane, store: Store
};

const getInitials = (name: string) => {
  return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
};

const getRandomColors = () => {
  const hues = [
    { c: '#1e3a8a', bg: '#dbeafe' }, // blue
    { c: '#065f46', bg: '#d1fae5' }, // green
    { c: '#5b21b6', bg: '#ede9fe' }, // purple
    { c: '#9d174d', bg: '#fce7f3' }, // pink
  ];
  return hues[Math.floor(Math.random() * hues.length)];
};

export const Timeline: React.FC = () => {
  const { members, setMembers, categories, setCategories, tasks, setTasks } = useAppContext();

  // Catatan: sebelumnya di sini ada auto-seed yang diam-diam menyuntikkan
  // data fiktif (anggota tim "Sarah J."/"Planner Mark" dan task contoh)
  // ke akun BARU sekalipun. Sudah dihapus — akun baru sekarang benar-benar
  // kosong. Kategori dibuat manual lewat tombol "New Category" di header
  // (fitur ini sudah ada dari awal — showCatModal/newCat di bawah — kini
  // dilengkapi kemampuan edit & hapus, bukan cuma tambah).

  // --- State ---
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'incomplete'>('all');

  // Modals state
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [newCat, setNewCat] = useState({ name: '', icon: 'home' });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({ title: '', status: 'Not Started', assigneeId: '', dueDate: '', priority: 'Medium', desc: '', categoryId: '' });
  
  const [showNewMemberInput, setShowNewMemberInput] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean, title: string, message: string, type: 'danger' | 'info', confirmText: string, onConfirm: () => void } | null>(null);

  // --- Effects ---
  // Catatan: members, categories, dan tasks sudah otomatis tersimpan ke
  // server (NeonDB) lewat AppContext yang baru — tidak perlu localStorage lagi.

  useEffect(() => {
    const handleClick = () => setShowFilter(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // --- Derived State & Calculations ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // S-Curve Math
  const sCurveActualY = 90 - (overallProgress / 100) * 80;

  // --- Handlers ---
  const openAddCategory = () => {
    setEditingCatId(null);
    setNewCat({ name: '', icon: 'home' });
    setShowCatModal(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setNewCat({ name: cat.name, icon: cat.icon });
    setShowCatModal(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    if (editingCatId) {
      setCategories(categories.map(c => c.id === editingCatId ? { ...c, name: newCat.name, icon: newCat.icon } : c));
    } else {
      const cat: Category = {
        id: Date.now().toString(),
        name: newCat.name,
        icon: newCat.icon,
        colorClass: 'text-brand-primary',
        bgClass: 'bg-brand-primary'
      };
      setCategories([...categories, cat]);
    }
    setShowCatModal(false);
    setEditingCatId(null);
    setNewCat({ name: '', icon: 'home' });
  };

  const handleDeleteCategory = (id: string) => {
    // Task yang berada di kategori ini juga ikut dihapus supaya tidak jadi task "yatim".
    setTasks(tasks.filter(t => t.categoryId !== id));
    setCategories(categories.filter(c => c.id !== id));
  };

  const openAddTask = (categoryId?: string) => {
    setEditingTaskId(null);
    setNewTask({ title: '', status: 'Not Started', assigneeId: '', dueDate: '', priority: 'Medium', desc: '', categoryId: categoryId || (categories[0]?.id || '') });
    setShowNewMemberInput(false);
    setShowTaskModal(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTask(task);
    setShowNewMemberInput(false);
    setShowTaskModal(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.categoryId) return;
    
    let finalAssigneeId = newTask.assigneeId;
    
    // Handle inline new member creation
    if (showNewMemberInput && newMemberName.trim()) {
      const colors = getRandomColors();
      const newMem: Member = {
        id: 'm_' + Date.now().toString(),
        name: newMemberName.trim(),
        initials: getInitials(newMemberName.trim()),
        color: colors.c,
        bgColor: colors.bg
      };
      setMembers([...members, newMem]);
      finalAssigneeId = newMem.id;
    }

    if (editingTaskId) {
      setTasks(tasks.map(t => t.id === editingTaskId ? { ...t, ...newTask, assigneeId: finalAssigneeId } as Task : t));
    } else {
      setTasks([...tasks, { ...newTask, id: Date.now().toString(), assigneeId: finalAssigneeId } as Task]);
    }
    setShowTaskModal(false);
    setNewMemberName('');
    setShowNewMemberInput(false);
  };

  const handleDeleteTask = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Hapus Tugas',
      message: 'Apakah kamu yakin ingin menghapus tugas ini?',
      type: 'danger',
      confirmText: 'Hapus',
      onConfirm: () => {
        setTasks(tasks.filter(t => t.id !== id));
        setConfirmState(null);
      }
    });
  };

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'Completed' ? 'Not Started' : 'Completed';
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
  };

  return (
    <div className="max-w-[1440px] mx-auto w-full space-y-12 animate-in fade-in duration-500 pb-24">
      <style dangerouslySetInnerHTML={{__html: `
        .luxury-shadow-sm { box-shadow: 0px 4px 20px rgba(139, 74, 82, 0.05); }
        select.editable-field, input[type="date"].editable-field {
            background-color: transparent; border: 1px solid transparent;
            padding: 2px 6px; border-radius: 4px; cursor: pointer; transition: all 0.2s;
        }
        select.editable-field:hover, input[type="date"].editable-field:hover {
            border-color: var(--border); background-color: var(--surface-hover);
        }
        select.editable-field:focus, input[type="date"].editable-field:focus {
            border-color: var(--primary); outline: none;
            box-shadow: 0 0 0 2px rgba(139, 74, 82, 0.1);
        }
      `}} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-border pb-6 pt-4">
        <div>
          <h2 className="font-headline text-4xl text-brand-primary mb-2">Master Timeline</h2>
          <p className="font-body text-lg text-brand-text-muted max-w-2xl">Rencanakan setiap detail perayaan kamu dengan presisi. Lacak progres di seluruh fase utama.</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <button onClick={() => openAddCategory()} className="px-6 py-3 rounded-xl border border-brand-primary text-brand-primary font-semibold text-xs tracking-wide hover:bg-brand-primary/5 hover:shadow-md hover:scale-[1.02] transition-all flex items-center gap-2">
            <PlusCircle size={18} /> Kategori Baru
          </button>

          <div className="bg-brand-surface-hover rounded-xl p-1 flex border border-brand-border">
            <button onClick={() => setViewMode('list')} className={`px-6 py-2 rounded-lg font-semibold text-xs tracking-wide transition-all ${viewMode === 'list' ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text-muted hover:text-brand-primary'}`}>
              Tampilan List
            </button>
            <button onClick={() => setViewMode('gantt')} className={`px-6 py-2 rounded-lg font-semibold text-xs tracking-wide transition-all ${viewMode === 'gantt' ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text-muted hover:text-brand-primary'}`}>
              Gantt Chart
            </button>
          </div>

          <button onClick={() => openAddTask()} className="bg-brand-primary text-white px-6 py-3 rounded-xl font-semibold text-xs tracking-wide shadow-sm hover:opacity-90 hover:shadow-md hover:scale-[1.02] transition-all flex items-center gap-2">
            <Plus size={18} /> Tambah Tugas
          </button>
        </div>
      </div>

      {/* Milestone Cards */}
      <section>
        <h3 className="font-headline text-2xl text-brand-primary mb-6">Ringkasan Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-brand-surface rounded-xl p-6 border border-brand-border luxury-shadow-sm flex flex-col justify-center items-center text-center">
            <div className="relative w-24 h-24 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-brand-border" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                <path className="text-brand-accent transition-all duration-1000 ease-out" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${overallProgress}, 100`} strokeLinecap="round" strokeWidth="3"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-headline text-2xl text-brand-primary">
                {overallProgress}%
              </div>
            </div>
            <h4 className="font-semibold text-lg text-brand-text mb-1">Progres Keseluruhan</h4>
            <p className="font-body text-sm text-brand-text-muted">{completedTasks} dari {totalTasks} tugas selesai.</p>
          </div>

          <div className="bg-brand-surface rounded-xl p-6 border border-brand-border luxury-shadow-sm">
             <h4 className="font-semibold text-xs tracking-wide text-brand-text-muted uppercase mb-4">Statistik Cepat</h4>
             <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-brand-border/50">
                   <span className="text-brand-text font-medium flex items-center gap-2"><CheckCircle size={16} className="text-brand-success" /> Selesai</span>
                   <span className="font-bold text-brand-text">{completedTasks}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-brand-border/50">
                   <span className="text-brand-text font-medium flex items-center gap-2"><Clock size={16} className="text-brand-warning" /> Berjalan</span>
                   <span className="font-bold text-brand-text">{tasks.filter(t => t.status === 'In Progress').length}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-brand-border/50">
                   <span className="text-brand-text font-medium flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-brand-border"></div> Belum Mulai</span>
                   <span className="font-bold text-brand-text">{tasks.filter(t => t.status === 'Not Started').length}</span>
                </div>
             </div>
          </div>

          <div className="bg-brand-surface rounded-xl p-6 border border-brand-border luxury-shadow-sm flex flex-col">
            <h4 className="font-semibold text-xs tracking-wide text-brand-text-muted uppercase mb-4">Beban Kerja Tim</h4>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {members.map(member => {
                const memberTasks = tasks.filter(t => t.assigneeId === member.id);
                if (memberTasks.length === 0) return null;
                const memberDone = memberTasks.filter(t => t.status === 'Completed').length;
                const pct = Math.round((memberDone / memberTasks.length) * 100);
                return (
                  <div key={member.id} className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0" style={{ backgroundColor: member.bgColor, color: member.color, border: '1px solid white' }}>
                        {member.initials}
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-brand-text">{member.name}</span>
                          <span className="text-brand-text-muted">{memberDone}/{memberTasks.length}</span>
                        </div>
                        <div className="w-full h-1.5 bg-brand-border rounded-full overflow-hidden">
                           <div className="h-full bg-brand-primary" style={{ width: `${pct}%` }}></div>
                        </div>
                     </div>
                  </div>
                )
              })}
              {members.filter(m => tasks.some(t => t.assigneeId === m.id)).length === 0 && (
                <p className="text-sm text-brand-text-muted text-center pt-6">Belum ada tugas yang ditugaskan.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gantt View Section */}
      {viewMode === 'gantt' && (
        <section className="space-y-6 animate-in fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="font-headline text-2xl text-brand-primary">Jadwal Proyek & Kurva-S</h3>
            <div className="flex items-center gap-6 bg-brand-surface p-4 rounded-xl border border-brand-border luxury-shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-primary"></div>
                <span className="font-semibold text-xs tracking-wide">Rencana</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-accent"></div>
                <span className="font-semibold text-xs tracking-wide">Aktual</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-surface rounded-xl border border-brand-border luxury-shadow-sm overflow-hidden">
            <div className="grid grid-cols-[250px_1fr] border-b border-brand-border bg-brand-surface-hover">
              <div className="p-4 font-semibold text-xs tracking-wide border-r border-brand-border">Fase / Kategori</div>
              <div className="grid grid-cols-4 p-4 font-semibold text-xs tracking-wide text-center">
                <div>Q1</div><div>Q2</div><div>Q3</div><div>Q4</div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 grid grid-cols-[250px_1fr] pointer-events-none">
                <div className="border-r border-brand-border"></div>
                <div className="grid grid-cols-4">
                  <div className="border-r border-brand-border/30"></div>
                  <div className="border-r border-brand-border/30"></div>
                  <div className="border-r border-brand-border/30"></div>
                  <div></div>
                </div>
              </div>
              
              <div className="space-y-4 p-4 relative z-10">
                {categories.map(cat => {
                  const catTasks = tasks.filter(t => t.categoryId === cat.id);
                  const doneCount = catTasks.filter(t => t.status === 'Completed').length;
                  const progress = catTasks.length === 0 ? 0 : Math.round((doneCount / catTasks.length) * 100);
                  const IconComponent = ICON_MAP[cat.icon] || Home;
                  
                  // Find most active assignee for the bubble
                  let primaryAssignee: Member | null = null;
                  if (catTasks.length > 0) {
                    const assigneeCounts = catTasks.reduce((acc, t) => { if(t.assigneeId) acc[t.assigneeId] = (acc[t.assigneeId]||0)+1; return acc; }, {} as Record<string,number>);
                    const topId = Object.keys(assigneeCounts).sort((a,b) => assigneeCounts[b] - assigneeCounts[a])[0];
                    primaryAssignee = members.find(m => m.id === topId) || null;
                  }

                  return (
                    <div key={cat.id} className="grid grid-cols-[230px_1fr] items-center gap-4 group cursor-pointer hover:bg-brand-surface-hover/50 p-2 rounded-lg transition-colors" onClick={() => setViewMode('list')}>
                      <div className="flex items-center gap-2">
                        <IconComponent size={18} className={cat.colorClass} />
                        <span className="font-semibold text-sm truncate max-w-[190px]">{cat.name}</span>
                      </div>
                      <div className="relative h-8 bg-brand-border/50 rounded-full overflow-hidden">
                        <div className={`absolute left-0 top-0 h-full ${cat.bgClass} rounded-full flex items-center px-3 justify-between transition-all duration-1000`} style={{ width: `${Math.max(progress, 5)}%` }}>
                          <div className="flex -space-x-2 mr-2">
                            {primaryAssignee && (
                              <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[8px] font-bold" style={{ backgroundColor: primaryAssignee.bgColor, color: primaryAssignee.color }}>
                                {primaryAssignee.initials}
                              </div>
                            )}
                          </div>
                          {progress > 15 && <span className="text-[10px] text-white font-bold">{progress}%</span>}
                          <div className="w-2 h-2 bg-white rounded-full shadow-sm ml-auto"></div>
                        </div>
                        {/* Actual Marker representing exact progress */}
                        {progress > 0 && <div className="absolute top-0 h-full w-0.5 bg-brand-accent z-10 transition-all duration-1000" style={{ left: `calc(${progress}% - 2px)` }}></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* S-Curve Area */}
              <div className="mt-8 px-6 pb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Kurva-S Penyelesaian</span>
                </div>
                <div className="relative h-40 border-l border-b border-brand-border/50 bg-gradient-to-t from-brand-surface-hover/30 to-transparent">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 100">
                    {/* Planned Curve (Ideal) */}
                    <path d="M0,90 Q250,80 500,50 T1000,10" fill="none" stroke="var(--primary)" strokeDasharray="5,5" strokeWidth="2"></path>

                    {/* Actual Curve (Dynamic based on overall progress) */}
                    <path d={`M0,90 Q250,${(90 + sCurveActualY)/2} 500,${sCurveActualY}`} fill="none" stroke="var(--accent)" strokeWidth="3" className="transition-all duration-1000"></path>

                    {/* Connection line */}
                    <line stroke="var(--accent)" strokeDasharray="2,2" strokeWidth="1" x1="500" x2="500" y1={sCurveActualY} y2="50" className="transition-all duration-1000"></line>
                    <circle cx="500" cy={sCurveActualY} fill="var(--accent)" r="5" stroke="white" strokeWidth="2" className="transition-all duration-1000"></circle>
                    <circle cx="500" cy="50" fill="var(--primary)" opacity="0.5" r="4"></circle>
                  </svg>
                  <div className="absolute -bottom-6 left-0 w-full flex justify-between text-[10px] font-semibold tracking-wide text-brand-text-muted">
                    <span>Mulai Proyek</span>
                    <span className="text-brand-accent font-bold">Progres Saat Ini ({overallProgress}%)</span>
                    <span>Target Selesai</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Milestone Checklist Section */}
      {viewMode === 'list' && (
        <section className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-headline text-2xl text-brand-primary">Checklist Milestone</h3>
            <div className="flex gap-4 items-center">
              <button onClick={() => setIsExpanded(!isExpanded)} className="font-semibold text-xs tracking-wide text-brand-primary hover:underline focus:ring-2 focus:ring-brand-primary/20 rounded px-2 py-1 transition-all active:scale-95">
                {isExpanded ? 'Tutup Semua' : 'Buka Semua'}
              </button>
              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setShowFilter(!showFilter); }} className="font-semibold text-xs tracking-wide text-brand-text-muted hover:text-brand-primary focus:ring-2 focus:ring-brand-primary/20 rounded px-2 py-1 transition-all active:scale-95 flex items-center gap-1">
                  Filter <Filter size={16} />
                </button>
                {showFilter && (
                  <div className="absolute right-0 mt-2 w-48 bg-brand-surface border border-brand-border rounded-xl shadow-md z-50 p-2 space-y-1">
                    <button onClick={() => { setTaskFilter('all'); setShowFilter(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${taskFilter === 'all' ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'hover:bg-brand-surface-hover'}`}>Semua Tugas</button>
                    <button onClick={() => { setTaskFilter('incomplete'); setShowFilter(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${taskFilter === 'incomplete' ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'hover:bg-brand-surface-hover'}`}>Belum Selesai</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {categories.map(cat => {
              const allCatTasks = tasks.filter(t => t.categoryId === cat.id);
              const catTasks = taskFilter === 'incomplete' ? allCatTasks.filter(t => t.status !== 'Completed') : allCatTasks;
              const doneCount = allCatTasks.filter(t => t.status === 'Completed').length;
              const progress = allCatTasks.length === 0 ? 0 : Math.round((doneCount / allCatTasks.length) * 100);
              const isDone = progress === 100 && allCatTasks.length > 0;

              return (
                <div key={cat.id} className="bg-brand-surface rounded-xl border border-brand-border luxury-shadow-sm overflow-hidden">
                  <div className="bg-brand-surface-hover px-6 py-4 flex justify-between items-center border-b border-brand-border">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-lg text-brand-primary">{cat.name}</span>
                      <span className="font-semibold text-xs tracking-wide text-brand-text-muted">({progress}% Selesai)</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block w-32 h-1.5 bg-brand-border/50 rounded-full overflow-hidden">
                        <div className={`h-full ${isDone ? 'bg-brand-success' : 'bg-brand-accent'} transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                      </div>
                      <button onClick={() => openAddTask(cat.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-brand-border text-brand-text font-semibold text-[12px] hover:border-brand-primary hover:text-brand-primary hover:shadow-sm transition-all sm:ml-4">
                        <Plus size={16} />Tambah Tugas
                      </button>
                      <button onClick={() => openEditCategory(cat)} className="p-1.5 text-brand-text-muted hover:text-brand-primary rounded-lg transition-colors" title="Edit Kategori">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-brand-text-muted hover:text-brand-danger rounded-lg transition-colors" title="Hapus Kategori">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className={`divide-y divide-brand-border/50 ${isExpanded ? '' : 'hidden'}`}>
                    {catTasks.map(task => {
                      const assignee = members.find(m => m.id === task.assigneeId);
                      const isTaskDone = task.status === 'Completed';
                      return (
                        <div key={task.id} className="group flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4 hover:bg-brand-surface-hover/50 transition-colors">
                          <button onClick={() => toggleTaskStatus(task)} className="shrink-0">
                             <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isTaskDone ? 'bg-brand-primary border-brand-primary text-white' : 'border-brand-border bg-brand-surface hover:border-brand-primary'}`}>
                                {isTaskDone && <CheckCircle size={14} strokeWidth={4} />}
                             </div>
                          </button>

                          <div className="flex-1 min-w-[200px]">
                            <p className={`font-semibold text-sm transition-all ${isTaskDone ? 'text-brand-text-muted line-through opacity-70' : 'text-brand-text'}`}>{task.title}</p>
                            {task.desc && <p className={`text-xs mt-0.5 ${isTaskDone ? 'text-brand-text-muted/50' : 'text-brand-text-muted'}`}>{task.desc}</p>}
                          </div>

                          <div className="flex items-center gap-3 ml-auto shrink-0">
                            {/* Due Date Display (Readonly in list for cleaner UI, editable in Modal) */}
                            {task.dueDate && (
                               <div className={`text-xs font-medium px-2 py-1 rounded bg-brand-surface border border-brand-border whitespace-nowrap ${isTaskDone ? 'text-brand-text-muted/50' : 'text-brand-text-muted'}`}>
                                 {formatDate(task.dueDate)}
                               </div>
                            )}

                            {/* Assignee Display */}
                            {assignee ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border border-brand-border shrink-0" style={{ backgroundColor: assignee.bgColor, color: assignee.color }}>
                                  {assignee.initials}
                                </div>
                                <span className={`text-xs font-medium hidden sm:block whitespace-nowrap ${isTaskDone ? 'text-brand-text-muted/50' : 'text-brand-text-muted'}`}>{assignee.name}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-brand-text-muted/50 italic hidden sm:block whitespace-nowrap">Belum Ditugaskan</span>
                            )}

                            {/* Priority Badge */}
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded whitespace-nowrap
                                ${task.priority === 'High' ? 'bg-brand-danger-bg text-brand-danger' :
                                  task.priority === 'Medium' ? 'bg-brand-warning-bg text-brand-warning' :
                                  'bg-brand-border/50 text-brand-text-muted'}
                                ${isTaskDone ? 'opacity-50 grayscale' : ''}
                            `}>
                              {taskPriorityLabel(task.priority)}
                            </span>

                            {/* Actions */}
                            <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditTask(task)} className="p-1.5 text-brand-text-muted hover:text-brand-primary rounded"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-brand-text-muted hover:text-brand-danger rounded"><X size={16} /></button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {catTasks.length === 0 && (
                      <div className="px-6 py-8 text-center text-brand-text-muted text-sm italic">
                        Belum ada tugas di kategori ini.
                      </div>
                    )}
                    <div className="px-6 py-3 bg-brand-surface-hover/50 border-t border-brand-border/50">
                      <button onClick={() => openAddTask(cat.id)} className="w-full py-2 flex items-center justify-center gap-2 text-brand-primary font-semibold text-xs tracking-wide hover:bg-brand-primary/5 rounded-lg transition-all">
                        <PlusCircle size={18} /> Tambah Tugas ke {cat.name}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {categories.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-brand-border rounded-xl">
                <FolderPlus size={48} className="mx-auto text-brand-border mb-4" />
                <h3 className="font-headline text-2xl text-brand-text mb-2">Belum Ada Kategori</h3>
                <p className="text-brand-text-muted mb-6">Buat kategori untuk mulai mengorganisir timeline kamu.</p>
                <button onClick={() => openAddCategory()} className="px-6 py-3 rounded-xl bg-brand-primary text-white font-semibold text-sm hover:opacity-90">
                  Buat Kategori Pertama
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* --- MODALS --- */}

      {/* Add/Edit Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-brand-surface w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-brand-border my-8 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-surface-hover/30">
              <h3 className="font-headline text-3xl text-brand-primary">{editingTaskId ? 'Edit Milestone' : 'Tambah Milestone Baru'}</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-brand-text-muted hover:text-brand-primary p-1 rounded-full hover:bg-brand-border/50 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form className="p-6 space-y-5" onSubmit={handleSaveTask}>
              <div className="space-y-1.5">
                <label className="font-semibold text-xs tracking-wide text-brand-text-muted">Nama Tugas</label>
                <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} type="text" placeholder="cth. Finalisasi Palet Bunga" className="w-full bg-brand-surface-hover border border-brand-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="font-semibold text-xs tracking-wide text-brand-text-muted">Kategori</label>
                  <select required value={newTask.categoryId} onChange={e => setNewTask({...newTask, categoryId: e.target.value})} className="w-full bg-brand-surface-hover border border-brand-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none appearance-none">
                    <option value="" disabled>Pilih Kategori</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-xs tracking-wide text-brand-text-muted">Status</label>
                  <select value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value as any})} className="w-full bg-brand-surface-hover border border-brand-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none appearance-none">
                    <option value="Not Started">Belum Mulai</option>
                    <option value="In Progress">Berjalan</option>
                    <option value="Completed">Selesai</option>
                    <option value="On Hold">Ditunda</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="font-semibold text-xs tracking-wide text-brand-text-muted">Penanggung Jawab</label>
                  <select
                    value={showNewMemberInput ? 'NEW' : (newTask.assigneeId || '')}
                    onChange={e => {
                      if (e.target.value === 'NEW') {
                        setShowNewMemberInput(true);
                        setNewTask({...newTask, assigneeId: ''});
                      } else {
                        setShowNewMemberInput(false);
                        setNewTask({...newTask, assigneeId: e.target.value});
                      }
                    }}
                    className="w-full bg-brand-surface-hover border border-brand-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none appearance-none"
                  >
                    <option value="">Belum Ditugaskan</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    <option value="NEW" className="font-bold text-brand-primary">+ Undang Anggota Baru</option>
                  </select>

                  {/* Dynamic Inline Input for New Member */}
                  {showNewMemberInput && (
                    <div className="mt-2 animate-in slide-in-from-top-2">
                       <input autoFocus required value={newMemberName} onChange={e => setNewMemberName(e.target.value)} type="text" placeholder="Masukkan nama anggota baru..." className="w-full bg-white border border-brand-primary rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-xs tracking-wide text-brand-text-muted">Tenggat Waktu</label>
                  <input value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} type="date" className="w-full bg-brand-surface-hover border border-brand-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-xs tracking-wide text-brand-text-muted">Deskripsi (Opsional)</label>
                <textarea value={newTask.desc} onChange={e => setNewTask({...newTask, desc: e.target.value})} placeholder="Tambahkan detail..." className="w-full bg-brand-surface-hover border border-brand-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none h-20 resize-none"></textarea>
              </div>

              <div className="flex gap-3 pt-4 border-t border-brand-border/50">
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 px-6 py-3 rounded-xl border border-brand-border font-semibold text-xs tracking-wide text-brand-text-muted hover:bg-brand-surface-hover transition-all">Batal</button>
                <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-brand-primary text-white font-semibold text-xs tracking-wide hover:opacity-90 hover:shadow-md transition-all active:scale-95">Simpan Milestone</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-brand-surface w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-brand-border animate-in zoom-in-95 duration-200 my-8">
            <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-surface-hover/30">
              <h3 className="font-headline text-3xl text-brand-primary">{editingCatId ? 'Edit Kategori' : 'Kategori Baru'}</h3>
              <button onClick={() => { setShowCatModal(false); setEditingCatId(null); }} className="text-brand-text-muted hover:text-brand-primary p-1 rounded-full hover:bg-brand-border/50 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form className="p-6 space-y-6" onSubmit={handleSaveCategory}>
              <div className="space-y-1.5">
                <label className="font-semibold text-xs tracking-wide text-brand-text-muted">Nama Kategori</label>
                <input autoFocus required value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} type="text" placeholder="cth. Bunga & Dekorasi" className="w-full bg-brand-surface-hover border border-brand-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all" />
              </div>

              <div className="space-y-2.5">
                <label className="font-semibold text-xs tracking-wide text-brand-text-muted">Pilih Ikon</label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {[
                    { id: 'home', label: 'Venue', icon: Home },
                    { id: 'palette', label: 'Desain', icon: Palette },
                    { id: 'shirt', label: 'Busana', icon: Shirt },
                    { id: 'camera', label: 'Foto', icon: Camera },
                    { id: 'music', label: 'Musik', icon: Music },
                    { id: 'truck', label: 'Logistik', icon: Truck },
                    { id: 'filetext', label: 'Admin', icon: FileText },
                    { id: 'users', label: 'Tamu', icon: Users },
                    { id: 'creditcard', label: 'Budget', icon: CreditCard },
                    { id: 'more', label: 'Lainnya', icon: MoreHorizontal },
                  ].map(item => {
                    const IconComp = item.icon;
                    const isActive = newCat.icon === item.id;
                    return (
                      <button 
                        key={item.id} 
                        type="button" 
                        onClick={() => setNewCat({...newCat, icon: item.id})}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${isActive ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-sm' : 'border-brand-border hover:border-brand-primary/50 text-brand-text-muted hover:text-brand-primary hover:bg-brand-surface-hover'}`}
                      >
                        <IconComp size={22} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[9px] font-bold uppercase mt-2 tracking-wider">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-brand-border/50">
                <button type="button" onClick={() => { setShowCatModal(false); setEditingCatId(null); }} className="flex-1 px-6 py-3 rounded-xl border border-brand-border font-semibold text-xs tracking-wide text-brand-text-muted hover:bg-brand-surface-hover transition-all">Batal</button>
                <button type="submit" disabled={!newCat.name.trim()} className="flex-1 px-6 py-3 rounded-xl bg-brand-primary text-white font-semibold text-xs tracking-wide hover:opacity-90 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed">{editingCatId ? 'Simpan Perubahan' : 'Buat Kategori'}</button>
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
