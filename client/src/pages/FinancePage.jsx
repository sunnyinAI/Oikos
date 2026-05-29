import { useEffect, useState } from 'react';
import { Plus, Trash2, CheckCircle, TrendingDown, TrendingUp, ChevronLeft, ChevronRight, ScanLine } from 'lucide-react';
import BillScannerSheet from '../components/finance/BillScannerSheet';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../store/useFinanceStore';
import { useUIStore } from '../store/useUIStore';
import Sheet from '../components/ui/Sheet';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Chip from '../components/ui/Chip';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, formatDate, daysUntilDue, formatMonth } from '../lib/formatters';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, POPULAR_SUBSCRIPTIONS } from '../config/constants';
import { playCoinSound } from '../lib/sound';

const TABS = ['Overview', 'Transactions', 'Bills', 'Subscriptions'];

export default function FinancePage() {
  const { transactions, bills, subscriptions, summary, currentMonth, fetchAll, addTransaction, deleteTransaction, addBill, payBill, deleteBill, addSubscription, toggleSubscription, deleteSubscription, setMonth } = useFinanceStore();
  const { addToast } = useUIStore();
  const [tab, setTab] = useState('Overview');
  const [showTxSheet, setShowTxSheet] = useState(false);
  const [showBillSheet, setShowBillSheet] = useState(false);
  const [showSubSheet, setShowSubSheet] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [txForm, setTxForm] = useState({ amount: '', type: 'expense', category: 'grocery', description: '', date: new Date().toISOString().split('T')[0], payment_method: 'upi' });
  const [billForm, setBillForm] = useState({ name: '', amount: '', due_date: '', recurrence: 'monthly', category: 'utility' });
  const [loadingTx, setLoadingTx] = useState(false);

  useEffect(() => { fetchAll(); }, [currentMonth, fetchAll]);

  const handleAddTx = async (e) => {
    e.preventDefault();
    setLoadingTx(true);
    try {
      await addTransaction({ ...txForm, amount: parseFloat(txForm.amount) });
      playCoinSound(txForm.type === 'income' ? 'credit' : 'debit');
      setTxForm({ amount: '', type: 'expense', category: 'grocery', description: '', date: new Date().toISOString().split('T')[0], payment_method: 'upi' });
      setShowTxSheet(false);
      addToast('Transaction added', 'success');
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoadingTx(false); }
  };

  const handleAddBill = async (e) => {
    e.preventDefault();
    try {
      await addBill({ ...billForm, amount: parseFloat(billForm.amount) });
      setBillForm({ name: '', amount: '', due_date: '', recurrence: 'monthly', category: 'utility' });
      setShowBillSheet(false);
      addToast('Bill added', 'success');
    } catch (err) { addToast(err.message, 'error'); }
  };

  const changeMonth = (delta) => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta);
    setMonth(d.toISOString().slice(0, 7));
  };

  const budgetPct = summary?.budget_used_pct || 0;
  const budgetColor = budgetPct >= 100 ? 'red' : budgetPct >= 80 ? 'yellow' : 'green';

  return (
    <div className="page-container">
      {/* Month selector */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronLeft size={18} className="text-gray-500" /></button>
        <span className="font-semibold text-gray-800 dark:text-gray-200">{formatMonth(currentMonth)}</span>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight size={18} className="text-gray-500" /></button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {TABS.map((t) => <Chip key={t} active={tab === t} onClick={() => setTab(t)}>{t}</Chip>)}
      </div>

      {tab === 'Overview' && summary && (
        <div className="space-y-4">
          {/* Budget ring (SVG donut) */}
          <div className="card flex items-center gap-5">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={budgetColor === 'red' ? '#ef4444' : budgetColor === 'yellow' ? '#f59e0b' : '#138808'}
                  strokeWidth="3.5" strokeDasharray={`${Math.min(budgetPct, 100)} ${100 - Math.min(budgetPct, 100)}`}
                  strokeLinecap="round" className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{Math.min(budgetPct, 999)}%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Monthly Budget</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(summary.budget)}</p>
              <div className="flex gap-4 mt-2 text-sm">
                <div>
                  <p className="text-red-500 font-medium flex items-center gap-1"><TrendingDown size={13} />{formatCurrency(summary.total_expense)}</p>
                  <p className="text-xs text-gray-400">Spent</p>
                </div>
                <div>
                  <p className="text-kgreen-600 font-medium">{formatCurrency(Math.max(0, summary.budget - summary.total_expense))}</p>
                  <p className="text-xs text-gray-400">Left</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          {summary.by_category?.length > 0 && (
            <div className="card">
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-3">By Category</p>
              <div className="space-y-2">
                {summary.by_category.sort((a, b) => b.total - a.total).map((cat) => {
                  const c = EXPENSE_CATEGORIES.find((e) => e.id === cat.category);
                  const pct = Math.round((cat.total / summary.total_expense) * 100);
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-300">{c?.icon || '📦'} {c?.label || cat.category}</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(cat.total)}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                        <div className="bg-saffron-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming bills */}
          {summary.upcoming_bills?.length > 0 && (
            <div className="card">
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-3">Upcoming Bills</p>
              <div className="space-y-2">
                {summary.upcoming_bills.map((bill) => {
                  const days = daysUntilDue(bill.due_date);
                  return (
                    <div key={bill.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{bill.name}</p>
                        <p className="text-xs text-gray-400">{days <= 0 ? 'Overdue!' : `Due in ${days} days`}</p>
                      </div>
                      <span className={`font-semibold ${days <= 0 ? 'text-red-500' : days <= 3 ? 'text-yellow-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {formatCurrency(bill.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" className="w-full" onClick={() => setShowScanner(true)}>
              <ScanLine size={18} /> Scan Bill
            </Button>
            <Button className="w-full" onClick={() => setShowTxSheet(true)}>
              <Plus size={18} /> Add Expense
            </Button>
          </div>
        </div>
      )}

      {tab === 'Transactions' && (
        <div>
          {transactions.length === 0 ? (
            <EmptyState icon="💸" title="No transactions" description="Track your daily expenses" action={<Button onClick={() => setShowTxSheet(true)}>Add Expense</Button>} />
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const cat = EXPENSE_CATEGORIES.find((c) => c.id === tx.category);
                return (
                  <div key={tx.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <span className="text-xl">{cat?.icon || '💸'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{tx.description || cat?.label || tx.category}</p>
                      <p className="text-xs text-gray-400">{formatDate(tx.date)} · {tx.payment_method}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.type === 'income' ? 'text-kgreen-600' : 'text-gray-800 dark:text-gray-200'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                    </div>
                    <button onClick={() => deleteTransaction(tx.id)} className="p-1 text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowTxSheet(true)}
            className="fixed bottom-24 right-4 w-14 h-14 bg-saffron-500 text-white rounded-full shadow-lg flex items-center justify-center z-20">
            <Plus size={24} />
          </motion.button>
        </div>
      )}

      {tab === 'Bills' && (
        <div>
          {bills.length === 0 ? (
            <EmptyState icon="📄" title="No bills tracked" description="Add electricity, gas, internet bills" action={<Button onClick={() => setShowBillSheet(true)}>Add Bill</Button>} />
          ) : (
            <div className="space-y-2">
              {bills.map((bill) => {
                const days = daysUntilDue(bill.due_date);
                return (
                  <div key={bill.id} className={`bg-white dark:bg-gray-800 border rounded-2xl px-4 py-3 flex items-center gap-3 ${bill.is_paid ? 'border-gray-100 dark:border-gray-700 opacity-60' : days <= 0 ? 'border-red-200 dark:border-red-800' : days <= 3 ? 'border-yellow-200 dark:border-yellow-800' : 'border-gray-100 dark:border-gray-700'}`}>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-gray-100">{bill.name}</p>
                      <p className={`text-xs mt-0.5 ${bill.is_paid ? 'text-kgreen-600' : days <= 0 ? 'text-red-500' : days <= 3 ? 'text-yellow-500' : 'text-gray-400'}`}>
                        {bill.is_paid ? '✓ Paid' : days <= 0 ? 'Overdue!' : `Due in ${days} days · ${formatDate(bill.due_date)}`}
                      </p>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{formatCurrency(bill.amount)}</span>
                    {!bill.is_paid && (
                      <button onClick={() => payBill(bill.id)} className="p-1.5 rounded-lg bg-kgreen-50 dark:bg-kgreen-900/20 text-kgreen-600">
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button onClick={() => deleteBill(bill.id)} className="p-1 text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowBillSheet(true)}
            className="fixed bottom-24 right-4 w-14 h-14 bg-saffron-500 text-white rounded-full shadow-lg flex items-center justify-center z-20">
            <Plus size={24} />
          </motion.button>
        </div>
      )}

      {tab === 'Subscriptions' && (
        <div>
          {subscriptions.length === 0 ? (
            <EmptyState icon="📺" title="No subscriptions" description="Track Netflix, Hotstar, Spotify and more"
              action={<Button onClick={() => setShowSubSheet(true)}>Add Subscription</Button>} />
          ) : (
            <div className="space-y-3">
              <div className="card mb-2">
                <p className="text-sm text-gray-500">Monthly subscription cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(subscriptions.filter(s => s.is_active).reduce((sum, s) => sum + (s.billing_cycle === 'annual' ? s.amount / 12 : s.amount), 0))}
                  <span className="text-sm font-normal text-gray-400">/mo</span>
                </p>
              </div>
              {subscriptions.map((sub) => (
                <div key={sub.id} className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-3 ${!sub.is_active ? 'opacity-50' : ''}`}>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-100">{sub.name}</p>
                    <p className="text-xs text-gray-400">{sub.billing_cycle} · {sub.renewal_date ? `Renews ${formatDate(sub.renewal_date)}` : 'No renewal date'}</p>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{formatCurrency(sub.amount)}</span>
                  <button onClick={() => toggleSubscription(sub.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${sub.is_active ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : 'bg-kgreen-100 text-kgreen-700 dark:bg-kgreen-900/30 dark:text-kgreen-400'}`}>
                    {sub.is_active ? 'Pause' : 'Resume'}
                  </button>
                  <button onClick={() => deleteSubscription(sub.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowSubSheet(true)}
            className="fixed bottom-24 right-4 w-14 h-14 bg-saffron-500 text-white rounded-full shadow-lg flex items-center justify-center z-20">
            <Plus size={24} />
          </motion.button>
        </div>
      )}

      {/* Add Transaction Sheet */}
      <Sheet isOpen={showTxSheet} onClose={() => setShowTxSheet(false)} title="Add Transaction">
        <form onSubmit={handleAddTx} className="space-y-4">
          <div className="flex gap-2 mb-2">
            {['expense', 'income'].map((t) => (
              <button key={t} type="button" onClick={() => setTxForm({ ...txForm, type: t })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border capitalize transition-all ${txForm.type === t ? (t === 'income' ? 'bg-kgreen-500 text-white border-kgreen-500' : 'bg-red-500 text-white border-red-500') : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'}`}>
                {t}
              </button>
            ))}
          </div>
          <Input label="Amount *" type="number" min="0" step="0.01" prefix="₹" placeholder="0.00" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} />
          <Input label="Description" placeholder="e.g. Big Bazaar grocery..." value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {EXPENSE_CATEGORIES.map((c) => (
                <button key={c.id} type="button" onClick={() => setTxForm({ ...txForm, category: c.id })}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${txForm.category === c.id ? 'bg-saffron-500 text-white border-saffron-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'}`}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={txForm.date} onChange={(e) => setTxForm({ ...txForm, date: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment</label>
              <select value={txForm.payment_method} onChange={(e) => setTxForm({ ...txForm, payment_method: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 text-gray-900 dark:text-gray-100">
                {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.icon} {m.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowTxSheet(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={loadingTx}>Add</Button>
          </div>
        </form>
      </Sheet>

      {/* Add Bill Sheet */}
      <Sheet isOpen={showBillSheet} onClose={() => setShowBillSheet(false)} title="Add Bill">
        <form onSubmit={handleAddBill} className="space-y-4">
          <Input label="Bill Name *" placeholder="e.g. Electricity, Gas, Internet..." value={billForm.name} onChange={(e) => setBillForm({ ...billForm, name: e.target.value })} />
          <Input label="Amount *" type="number" prefix="₹" value={billForm.amount} onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })} />
          <Input label="Due Date *" type="date" value={billForm.due_date} onChange={(e) => setBillForm({ ...billForm, due_date: e.target.value })} />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowBillSheet(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">Add Bill</Button>
          </div>
        </form>
      </Sheet>

      {/* Add Subscription Sheet */}
      <Sheet isOpen={showSubSheet} onClose={() => setShowSubSheet(false)} title="Add Subscription">
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Quick add popular services:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {POPULAR_SUBSCRIPTIONS.map((s) => (
              <button key={s.name} onClick={async () => { await addSubscription(s); setShowSubSheet(false); addToast(`${s.name} added`, 'success'); }}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:border-saffron-300 transition-colors">
                {s.name} · ₹{s.amount}/mo
              </button>
            ))}
          </div>
          <Button variant="secondary" className="w-full" onClick={() => setShowSubSheet(false)}>Close</Button>
        </div>
      </Sheet>

      <BillScannerSheet isOpen={showScanner} onClose={() => setShowScanner(false)} />
    </div>
  );
}
