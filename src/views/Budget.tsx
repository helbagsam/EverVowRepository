"use client";

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle, XCircle, Search, Edit2, Target, Wallet, BarChart3, Receipt, Lightbulb, Filter, PlusCircle, MoreVertical, FileText } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { UploadButton } from '../utils/uploadthing';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatIDR } from '../utils/formatters';

export const Budget: React.FC = () => {
  const { expenses, addExpense, deleteExpense, editExpense, totalBudget, setTotalBudget } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Lunas' | 'DP' | 'Unpaid'>('All');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState<Partial<any>>({ status: 'Unpaid', total: 0, paid: 0 });
  
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(totalBudget.toString());

  const [confirmState, setConfirmState] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptExpense, setReceiptExpense] = useState<any>(null);


  const stats = useMemo(() => {
    const totalAllocated = expenses.reduce((acc, exp) => acc + (exp.total || 0), 0);
    const totalPaid = expenses.reduce((acc, exp) => acc + (exp.paid || 0), 0);
    const remainingToPay = totalAllocated - totalPaid;
    const remainingBudget = Math.max(0, totalBudget - totalAllocated);
    
    const lunas = expenses.filter(e => e.status === 'Lunas').length;
    const dp = expenses.filter(e => e.status === 'DP').length;
    const unpaid = expenses.filter(e => e.status === 'Unpaid').length;
    
    const isOverbudget = totalAllocated > totalBudget;
    const overbudgetAmount = isOverbudget ? totalAllocated - totalBudget : 0;

    return { totalAllocated, totalPaid, remainingToPay, remainingBudget, lunas, dp, unpaid, isOverbudget, overbudgetAmount };
  }, [expenses, totalBudget]);

  const chartData = useMemo(() => [
    { name: 'Total Paid', value: stats.totalPaid, color: '#10b981' },
    { name: 'Remaining to Pay', value: stats.remainingToPay, color: '#f59e0b' },
    { name: 'Remaining Budget', value: stats.remainingBudget, color: '#6366f1' },
  ].filter(d => d.value > 0), [stats]);

  const filteredExpenses = expenses
    .filter(e =>
      (e.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.vendor || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(e => statusFilter === 'All' || e.status === statusFilter);

  const categories: string[] = Array.from(new Set(filteredExpenses.map(e => e.category as string)));

  const allCategoriesList = Array.from(new Set(['Venue & Catering', 'Florals & Decor', 'Photography & Video', 'Entertainment', 'Attire & Beauty', 'Transportation', 'Gifts', ...expenses.map(e => e.category as string)])).filter(Boolean);

  const handleBudgetSave = () => {
    const val = Number(tempBudget);
    if (!isNaN(val) && val >= 0) {
      setTotalBudget(val);
    }
    setIsEditingBudget(false);
  };

  const openAddModal = (defaultCategory?: string) => {
    setEditingId(null);
    setNewExpense({ name: '', vendor: '', total: 0, paid: 0, status: 'Unpaid', category: defaultCategory || '' });
    setShowAddModal(true);
  };

  const openEditModal = (expense: any) => {
    setEditingId(expense.id);
    setNewExpense(expense);
    setShowAddModal(true);
  };

  const handleTotalChange = (valStr: string) => {
    let total = Number(valStr);
    if (total < 0) total = 0;
    
    let paid = newExpense.paid || 0;
    if (paid > total) paid = total;
    
    let status = newExpense.status;
    if (paid === 0) status = 'Unpaid';
    else if (paid === total && total > 0) status = 'Lunas';
    else if (paid > 0 && paid < total) status = 'DP';

    setNewExpense({ ...newExpense, total, paid, status });
  };

  const handlePaidChange = (valStr: string) => {
    let paid = Number(valStr);
    const total = newExpense.total || 0;
    if (paid < 0) paid = 0;
    if (paid > total) paid = total;
    
    let status = newExpense.status;
    if (paid === 0) status = 'Unpaid';
    else if (paid === total && total > 0) status = 'Lunas';
    else if (paid > 0 && paid < total) status = 'DP';

    setNewExpense({ ...newExpense, paid, status });
  };

  const handleStatusChange = (status: 'Lunas' | 'DP' | 'Unpaid') => {
    let paid = newExpense.paid || 0;
    const total = newExpense.total || 0;
    
    if (status === 'Lunas') paid = total;
    else if (status === 'Unpaid') paid = 0;
    else if (status === 'DP' && (paid === 0 || paid === total)) {
      paid = Math.floor(total * 0.5); // auto set 50% if invalid DP amount
    }

    setNewExpense({ ...newExpense, status, paid });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      editExpense({ ...newExpense, id: editingId } as any);
    } else {
      addExpense({ ...newExpense, id: Date.now().toString() } as any);
    }
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense record?',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: () => {
        deleteExpense(id);
        setConfirmState(null);
      }
    });
  };

  const openReceiptModal = (exp: any) => {
    setReceiptExpense(exp);
    setShowReceiptModal(true);
  };

  // Upload kuitansi sekarang ditangani oleh UploadThing (lihat UploadButton
  // di modal receipt) — hasilnya URL permanen, bukan base64 lokal.


  const percentAllocated = totalBudget > 0 ? Math.round((stats.totalAllocated / totalBudget) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-4xl text-brand-text mb-2">Budget Planner & Auditor</h2>
          <p className="text-brand-text-muted">Track expenses, enforce payment logic, and monitor financial health in IDR.</p>
        </div>
        <button onClick={() => openAddModal()} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold shadow-md hover:bg-brand-primary-hover active:scale-95 transition-all">
          <Plus size={18} /> Add Expense
        </button>
      </header>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 flex flex-col justify-between hover:border-brand-primary/30 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Total Goal</h3>
            <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
              <Target size={20} />
            </div>
          </div>
          <div>
            {isEditingBudget ? (
              <div className="flex items-center gap-2 mb-1">
                <input 
                  type="number" 
                  value={tempBudget} 
                  onChange={(e) => setTempBudget(e.target.value)} 
                  onBlur={handleBudgetSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleBudgetSave()}
                  autoFocus
                  className="w-full bg-brand-surface border-b border-brand-primary focus:outline-none text-xl font-headline text-brand-text"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1 group cursor-pointer" onClick={() => { setIsEditingBudget(true); setTempBudget(totalBudget.toString()); }}>
                <div className="font-headline text-2xl text-brand-text">{formatIDR(totalBudget)}</div>
                <Edit2 size={16} className="text-brand-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            <p className="text-xs text-brand-text-muted">Click to edit total budget</p>
          </div>
        </div>

        <SummaryCard 
          title="Total Allocated" 
          amount={stats.totalAllocated} 
          subtitle="Sum of all planned expenses" 
          icon={<BarChart3 size={20} />} 
          color="text-brand-accent" bg="bg-brand-accent/10" 
          formatIDR={formatIDR}
        />
        <SummaryCard 
          title="Actual Paid" 
          amount={stats.totalPaid} 
          subtitle="Funds already disbursed" 
          icon={<Wallet size={20} />} 
          color="text-brand-success" bg="bg-brand-success/10" 
          formatIDR={formatIDR}
        />
        <SummaryCard 
          title="Remaining to Pay" 
          amount={stats.remainingToPay} 
          subtitle="Pending balance to clear" 
          icon={<Receipt size={20} />} 
          color="text-brand-warning" bg="bg-brand-warning/10" 
          formatIDR={formatIDR}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-8 flex flex-col md:flex-row items-center gap-8 border-l-4 border-l-brand-primary">
          <div className="w-48 h-48 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatIDR(Number(value) || 0)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-4">
            <h3 className="font-headline text-xl text-brand-text">Auditor Analysis</h3>
            <p className="text-sm text-brand-text-muted leading-relaxed">
              Based on your total budget of <strong className="text-brand-text">{formatIDR(totalBudget)}</strong>, you have allocated <strong className="text-brand-text">{formatIDR(stats.totalAllocated)}</strong>.
            </p>
            {stats.isOverbudget ? (
              <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-xl flex items-start gap-3 text-brand-danger">
                <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Overbudget Alert</h4>
                  <p className="text-xs mt-1">You exceed your budget by {formatIDR(stats.overbudgetAmount)}. Consider revising costs.</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-brand-success/10 border border-brand-success/20 rounded-xl flex items-start gap-3 text-brand-success">
                <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Healthy Budget</h4>
                  <p className="text-xs mt-1">You have {formatIDR(stats.remainingBudget)} left in unallocated funds. Great job!</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card p-8 space-y-6">
          <h3 className="font-headline text-xl text-brand-text mb-4">Payment Distribution</h3>
          <StatusBar 
            title="Paid in Full (Lunas)" 
            count={stats.lunas} 
            total={expenses.length}
            icon={<CheckCircle size={16} />} 
            colorClass="text-brand-success" 
            bgClass="bg-brand-success" 
            desc="Expenses completely cleared"
          />
          <StatusBar 
            title="Down Payment (DP)" 
            count={stats.dp} 
            total={expenses.length}
            icon={<Clock size={16} />} 
            colorClass="text-brand-warning" 
            bgClass="bg-brand-warning" 
            desc="Partially paid items"
          />
          <StatusBar 
            title="Unpaid" 
            count={stats.unpaid} 
            total={expenses.length}
            icon={<AlertCircle size={16} />} 
            colorClass="text-brand-danger" 
            bgClass="bg-brand-danger" 
            desc="Pending initial payment"
          />
        </div>
      </div>

      {/* Expense Breakdown Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-surface">
          <h3 className="font-headline text-2xl text-brand-text">Expense Breakdown</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-72">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-primary transition-all"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilterPanel(v => !v)}
                className={`p-2 rounded-xl transition-all ${statusFilter !== 'All' ? 'text-brand-primary bg-brand-primary/10' : 'text-brand-text-muted hover:text-brand-primary hover:bg-brand-surface-hover'}`}
              >
                <Filter size={20} />
              </button>
              {showFilterPanel && (
                <div className="absolute right-0 mt-2 w-52 bg-brand-surface border border-brand-border rounded-xl shadow-lg z-50 p-2 space-y-1">
                  {(['All', 'Lunas', 'DP', 'Unpaid'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => { setStatusFilter(st); setShowFilterPanel(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${statusFilter === st ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'hover:bg-brand-surface-hover'}`}
                    >
                      {st === 'All' ? 'Semua Status' : st}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-brand-surface border-b border-brand-border">
          <div className="bg-brand-surface-hover/80 border border-brand-border/80 rounded-xl p-4 flex items-start sm:items-center gap-4">
            <div className="text-brand-primary flex-shrink-0 mt-1 sm:mt-0">
              <Lightbulb size={24} />
            </div>
            <p className="text-sm text-brand-text leading-relaxed">
              <span className="font-semibold text-brand-primary">Insight:</span> You've allocated {percentAllocated}% of your budget. Consider reviewing upcoming payments to maintain liquidity.
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surface">
                <th className="py-4 px-6 text-xs font-semibold text-brand-text-muted uppercase tracking-wider w-[35%]">Item & Vendor</th>
                <th className="py-4 px-6 text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Total Amount</th>
                <th className="py-4 px-6 text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Paid</th>
                <th className="py-4 px-6 text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-brand-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-brand-surface">
              {categories.map(category => (
                <React.Fragment key={category}>
                  <tr className="border-b border-brand-border">
                    <td colSpan={5} className="py-5 px-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-headline text-brand-primary">{category}</h4>
                        <button onClick={() => openAddModal(category)} className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors">
                          <PlusCircle size={18} /> Add Sub-Expense
                        </button>
                      </div>
                    </td>
                  </tr>
                  {filteredExpenses.filter(e => e.category === category).map((exp, idx) => {
                    return (
                      <tr key={exp.id} className="hover:bg-brand-surface-hover transition-colors group border-b border-brand-border/50">
                        <td className="py-4 px-6">
                          <p className="font-semibold text-brand-text text-base cursor-pointer hover:text-brand-primary" onClick={() => openEditModal(exp)}>{exp.name}</p>
                          <p className="text-sm text-brand-text-muted mt-0.5">{exp.vendor}</p>
                          <div className="w-12 h-0.5 bg-brand-primary/40 mt-3 rounded-full hidden group-hover:block transition-all"></div>
                        </td>
                        <td className="py-4 px-6 font-medium text-brand-text">{formatIDR(exp.total)}</td>
                        <td className="py-4 px-6 font-medium text-brand-text">{formatIDR(exp.paid)}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            exp.status === 'Lunas' ? 'bg-brand-success/10 text-brand-success border border-brand-success/20' :
                            exp.status === 'DP' ? 'bg-brand-warning/10 text-brand-warning border border-brand-warning/20' :
                            'bg-brand-danger/10 text-brand-danger border border-brand-danger/20'
                          }`}>
                            {exp.status === 'Lunas' && <CheckCircle size={14} />}
                            {exp.status === 'DP' && <Clock size={14} />}
                            {exp.status === 'Unpaid' && <AlertCircle size={14} />}
                            {exp.status === 'DP' ? `DP ${Math.round((exp.paid/exp.total)*100)}%` : exp.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(exp)} className="p-2 text-brand-text-muted hover:text-brand-primary transition-colors rounded-lg hover:bg-brand-surface-hover" title="Edit">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => openReceiptModal(exp)} className="p-2 text-brand-text-muted hover:text-brand-primary transition-colors rounded-lg hover:bg-brand-surface-hover" title="Receipt">
                              <FileText size={18} />
                            </button>
                            <button onClick={() => handleDelete(exp.id)} className="p-2 text-brand-text-muted hover:text-brand-danger transition-colors rounded-lg hover:bg-brand-danger-bg" title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-brand-text-muted font-medium">No expenses recorded yet. Click 'Add Expense' to begin.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-surface w-full max-w-lg rounded-2xl shadow-xl border border-brand-border max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-brand-border flex justify-between items-center bg-brand-surface-hover/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                  {editingId ? <Edit size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 className="font-headline text-xl text-brand-primary">{editingId ? 'Edit Expense Record' : 'Add Sub-Expense'}</h3>
                  <p className="text-xs text-brand-text-muted mt-0.5">Auditor active: Payment logic enforced.</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-brand-text-muted hover:text-brand-danger transition-colors p-1"><XCircle size={24} /></button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Item Name</label>
                  <input required type="text" value={newExpense.name || ''} onChange={e => setNewExpense({...newExpense, name: e.target.value})} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm text-brand-text transition-all" placeholder="e.g. Catering Deposit" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Category</label>
                  <select 
                    value={allCategoriesList.includes(newExpense.category as string) ? newExpense.category : 'Other'} 
                    onChange={e => setNewExpense({...newExpense, category: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm text-brand-text transition-all appearance-none"
                  >
                    {allCategoriesList.filter(c => c !== 'Other').map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="Other">Other</option>
                  </select>
                  {(!allCategoriesList.includes(newExpense.category as string) || newExpense.category === 'Other') && (
                    <input 
                      required 
                      type="text" 
                      value={newExpense.category === 'Other' ? '' : (newExpense.category || '')} 
                      onChange={e => setNewExpense({...newExpense, category: e.target.value})} 
                      className="w-full px-4 py-2 mt-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm text-brand-text transition-all" 
                      placeholder="Specify other category..." 
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Vendor</label>
                  <input type="text" value={newExpense.vendor || ''} onChange={e => setNewExpense({...newExpense, vendor: e.target.value})} className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm text-brand-text transition-all" placeholder="Vendor Name" />
                </div>
              </div>

              <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-xl space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider text-brand-primary">Total Amount (Rp)</label>
                    <input required type="number" min="0" value={newExpense.total || ''} onChange={e => handleTotalChange(e.target.value)} className="w-full px-4 py-2.5 bg-brand-surface border border-brand-primary/30 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm font-semibold text-brand-text transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider text-brand-primary">Amount Paid (Rp)</label>
                    <input type="number" min="0" value={newExpense.paid || ''} onChange={e => handlePaidChange(e.target.value)} className="w-full px-4 py-2.5 bg-brand-surface border border-brand-primary/30 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm font-semibold text-brand-text transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Calculated Status</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" onClick={() => handleStatusChange('Unpaid')} className={`py-2 rounded-lg text-xs font-bold transition-all border ${newExpense.status === 'Unpaid' ? 'bg-brand-danger text-white border-brand-danger shadow-md' : 'bg-brand-surface text-brand-text-muted border-brand-border hover:border-brand-danger/50 hover:text-brand-danger'}`}>Unpaid</button>
                    <button type="button" onClick={() => handleStatusChange('DP')} className={`py-2 rounded-lg text-xs font-bold transition-all border ${newExpense.status === 'DP' ? 'bg-brand-warning text-white border-brand-warning shadow-md' : 'bg-brand-surface text-brand-text-muted border-brand-border hover:border-brand-warning/50 hover:text-brand-warning'}`}>DP</button>
                    <button type="button" onClick={() => handleStatusChange('Lunas')} className={`py-2 rounded-lg text-xs font-bold transition-all border ${newExpense.status === 'Lunas' ? 'bg-brand-success text-white border-brand-success shadow-md' : 'bg-brand-surface text-brand-text-muted border-brand-border hover:border-brand-success/50 hover:text-brand-success'}`}>Lunas</button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2.5 rounded-xl font-semibold text-brand-text-muted hover:bg-brand-surface-hover transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-brand-primary text-white rounded-xl font-semibold shadow-md hover:bg-brand-primary-hover active:scale-95 transition-all">{editingId ? 'Save Changes' : 'Record Expense'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {showReceiptModal && receiptExpense && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-brand-border">
              <div>
                <h3 className="font-headline text-xl text-brand-text">Kuitansi / Bukti Pembayaran</h3>
                <p className="text-xs text-brand-text-muted mt-1">{receiptExpense.name}</p>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-brand-text-muted hover:text-brand-text transition-colors">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6">
              {receiptExpense.receiptUrl ? (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-brand-text mb-2">Pratinjau Kuitansi:</p>
                  <img src={receiptExpense.receiptUrl} alt="Receipt Preview" className="w-full max-h-64 object-contain border border-brand-border rounded-xl bg-brand-surface-hover mb-4" />
                  <div className="flex justify-between gap-3 items-center">
                    <UploadButton
                      endpoint="weddingImageUploader"
                      onClientUploadComplete={(res) => {
                        const url = res?.[0]?.ufsUrl;
                        if (url) {
                          editExpense({ ...receiptExpense, receiptUrl: url });
                          setReceiptExpense({ ...receiptExpense, receiptUrl: url });
                        }
                      }}
                      onUploadError={(err) => alert(`Upload gagal: ${err.message}`)}
                      appearance={{
                        button: 'flex-1 !bg-brand-primary/10 !text-brand-primary rounded-xl font-semibold text-sm hover:!bg-brand-primary/20 !w-full',
                        container: 'flex-1 w-full',
                        allowedContent: 'hidden',
                      }}
                      content={{ button: 'Ganti Kuitansi' }}
                    />
                    <button onClick={() => {
                       editExpense({ ...receiptExpense, receiptUrl: undefined });
                       setReceiptExpense({ ...receiptExpense, receiptUrl: undefined });
                    }} className="flex-1 px-4 py-2 bg-brand-danger-bg text-brand-danger rounded-xl font-semibold text-sm hover:bg-brand-danger/20 transition-colors">
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-brand-border rounded-xl p-8 text-center bg-brand-surface-hover/50 hover:bg-brand-surface-hover hover:border-brand-primary/50 transition-all">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-primary mb-3 shadow-sm mx-auto">
                    <PlusCircle size={24} />
                  </div>
                  <span className="font-semibold text-brand-text mb-1 block">Unggah Kuitansi</span>
                  <span className="text-xs text-brand-text-muted block mb-4">JPG atau PNG, maksimal 4MB</span>
                  <UploadButton
                    endpoint="weddingImageUploader"
                    onClientUploadComplete={(res) => {
                      const url = res?.[0]?.ufsUrl;
                      if (url) {
                        editExpense({ ...receiptExpense, receiptUrl: url });
                        setReceiptExpense({ ...receiptExpense, receiptUrl: url });
                      }
                    }}
                    onUploadError={(err) => alert(`Upload gagal: ${err.message}`)}
                    appearance={{
                      button: '!bg-brand-primary !text-white rounded-xl font-semibold text-sm hover:!bg-brand-primary-hover mx-auto',
                      allowedContent: 'hidden',
                    }}
                    content={{ button: 'Pilih File' }}
                  />
                </div>
              )}
            </div>
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

const SummaryCard = ({ title, amount, subtitle, icon, color, bg, formatIDR }: any) => (
  <div className={`card p-6 flex flex-col justify-between hover:border-brand-primary/30 transition-all cursor-default relative overflow-hidden`}>
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">{title}</h3>
      <div className={`p-2 rounded-lg ${bg} ${color}`}>
        {icon}
      </div>
    </div>
    <div>
      <div className="font-headline text-2xl mb-1 text-brand-text">
        {formatIDR(amount)}
      </div>
      <p className="text-xs text-brand-text-muted">{subtitle}</p>
    </div>
  </div>
);

const StatusBar = ({ title, count, total, icon, colorClass, bgClass, desc }: any) => {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2">
          <span className={colorClass}>{icon}</span>
          <span className="font-semibold text-brand-text">{title}</span>
        </div>
        <span className="text-sm font-bold text-brand-text">{count} <span className="text-brand-text-muted font-normal text-xs">items ({percent}%)</span></span>
      </div>
      <div className="h-2.5 w-full bg-brand-surface-hover rounded-full overflow-hidden border border-brand-border/50">
        <div className={`h-full rounded-full shadow-sm transition-all duration-1000 ${bgClass}`} style={{ width: `${percent}%` }}></div>
      </div>
      <p className="text-[10px] uppercase tracking-wider font-semibold text-brand-text-muted mt-2">{desc}</p>
    </div>
  );
}
