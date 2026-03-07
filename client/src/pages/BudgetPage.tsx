import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { useWeddingStore } from '../store/weddingStore';
import type { Expense, ExpenseCategory } from '@shared/types';
import { EXPENSE_CATEGORY } from '@shared/types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { DollarSign, Plus, Download, Edit2, Trash2, AlertCircle } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = [
  '#E8A0BF', '#D4AF37', '#e8d0d0', '#dddc8c', '#596680',
  '#f8c4b4', '#b5cbb7', '#d2b4de', '#aeb6bf', '#f5cba7',
  '#a2d9ce', '#f9e79f', '#d5d8dc'
];

export default function BudgetPage() {
  const { wedding, expenses, vendors, updateWedding, fetchWedding, fetchExpenses, fetchVendors, createExpense, updateExpense, deleteExpense } = useWeddingStore();

  useEffect(() => {
    fetchWedding();
    fetchExpenses();
    fetchVendors();
  }, [fetchWedding, fetchExpenses, fetchVendors]);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetVal, setBudgetVal] = useState('');

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseForm, setExpenseForm] = useState<Partial<Expense>>({});

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const totalBudget = wedding?.budget || 0;
  const totalEstimated = expenses.reduce((sum, e) => sum + e.estimated, 0);
  const totalActual = expenses.reduce((sum, e) => sum + (e.actual || 0), 0);
  const isOverBudget = totalActual > totalBudget;

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateWedding({ budget: Number(budgetVal) });
      toast.success('Budget updated');
      setIsBudgetModalOpen(false);
    } catch (err) {
      toast.error('Failed to update budget');
    }
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseForm as Partial<Expense>);
        toast.success('Expense updated');
      } else {
        await createExpense(expenseForm as Partial<Expense>);
        toast.success('Expense added');
      }
      setIsExpenseModalOpen(false);
    } catch (err) {
      toast.error('Failed to save expense');
    }
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await deleteExpense(expenseToDelete.id);
      toast.success('Expense deleted');
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  const handleExport = () => {
    const csv = Papa.unparse(
      expenses.map((e) => ({
        Category: e.category,
        Description: e.description,
        Estimated: e.estimated,
        Actual: e.actual || 0,
        Difference: e.estimated - (e.actual || 0),
        Vendor: vendors.find((v) => v.id === e.vendorId)?.name || '',
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'wedding-budget.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openNewModal = () => {
    setEditingExpense(null);
    setExpenseForm({ category: 'Venue', estimated: 0 });
    setIsExpenseModalOpen(true);
  };

  const openEditModal = (e: Expense) => {
    setEditingExpense(e);
    setExpenseForm(e);
    setIsExpenseModalOpen(true);
  };

  const openDeleteModal = (e: Expense) => {
    setExpenseToDelete(e);
    setIsDeleteModalOpen(true);
  };

  // Chart Data
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => {
      map.set(e.category, (map.get(e.category) || 0) + (e.actual || e.estimated));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const barData = [
    {
      name: 'Budget Overview',
      Budget: totalBudget,
      Estimated: totalEstimated,
      Actual: totalActual,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-semibold text-charcoal">Budget Tracker</h1>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleExport} icon={<Download className="h-4 w-4" />}>
            Export CSV
          </Button>
          <Button onClick={openNewModal} icon={<Plus className="h-4 w-4" />}>
            Add Expense
          </Button>
        </div>
      </div>

      {isOverBudget && totalBudget > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">You are over budget!</h3>
            <p className="text-sm text-red-600 mt-1">
              Your actual spending (${totalActual.toLocaleString()}) exceeds your total budget (${totalBudget.toLocaleString()}).
            </p>
          </div>
        </div>
      )}

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card text-center relative overflow-hidden group">
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                setBudgetVal(String(totalBudget));
                setIsBudgetModalOpen(true);
              }}
              className="p-1.5 text-gray-400 hover:text-charcoal bg-gray-100 rounded-md"
            >
              <Edit2 className="h-3 w-3" />
            </button>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Budget</p>
          <p className="text-3xl font-bold mt-2 text-charcoal">${totalBudget.toLocaleString()}</p>
        </div>

        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Estimated</p>
          <p className="text-3xl font-bold mt-2 text-charcoal">${totalEstimated.toLocaleString()}</p>
        </div>

        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Actual</p>
          <p className={`text-3xl font-bold mt-2 ${isOverBudget ? 'text-red-500' : 'text-green-600'}`}>
            ${totalActual.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card flex flex-col items-center">
          <h2 className="font-heading text-xl font-semibold w-full text-left mb-4">Category Breakdown</h2>
          {categoryData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
              <DollarSign className="h-10 w-10 text-blush-200 mb-2" />
              <p>No expenses to chart.</p>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="card flex flex-col">
          <h2 className="font-heading text-xl font-semibold mb-4">Budget vs Actual</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis tickFormatter={(val) => `$${val}`} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend layout="horizontal" verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: 20 }} />
                <Bar dataKey="Budget" fill="#E8A0BF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Estimated" fill="#aeb6bf" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-blush-100 bg-gray-50/50">
          <h2 className="font-heading text-xl font-semibold text-charcoal">Expense Items</h2>
        </div>
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-16 w-16 bg-blush-50 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="h-8 w-8 text-blush-400" />
            </div>
            <h3 className="text-lg font-medium text-charcoal">No expenses</h3>
            <p className="text-gray-500 text-sm mt-1 mb-4">Add expenses to track your budget.</p>
            <Button onClick={openNewModal} icon={<Plus className="h-4 w-4" />}>
              Add your first expense
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 font-medium uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 w-full">Description</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4 text-right">Estimated</th>
                  <th className="px-6 py-4 text-right">Actual</th>
                  <th className="px-6 py-4 text-right">Diff</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((e) => {
                  const diff = e.estimated - (e.actual || 0);
                  const isNegative = diff < 0;
                  return (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-charcoal">{e.category}</td>
                      <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{e.description}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {vendors.find((v) => v.id === e.vendorId)?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">${e.estimated.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-medium text-charcoal">
                        {e.actual !== null ? `$${e.actual.toLocaleString()}` : '-'}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
                        {isNegative ? `-${Math.abs(diff).toLocaleString()}` : `+${diff.toLocaleString()}`}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="Edit"
                            onClick={() => openEditModal(e)}
                            className="p-1.5 text-gray-400 hover:text-charcoal hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => openDeleteModal(e)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Set Budget Modal */}
      <Modal open={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} title="Total Budget" size="sm">
        <form onSubmit={handleUpdateBudget} className="space-y-4">
          <Input
            label="Total Wedding Budget"
            type="number"
            required
            min={0}
            step="0.01"
            value={budgetVal}
            onChange={(e) => setBudgetVal(e.target.value)}
            hint="Set your total spending limit"
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsBudgetModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal open={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title={editingExpense ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                className="input bg-white"
                value={expenseForm.category || 'Venue'}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })}
              >
                {Object.values(EXPENSE_CATEGORY).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Vendor (Optional)</label>
              <select
                className="input bg-white"
                value={expenseForm.vendorId || ''}
                onChange={(e) => setExpenseForm({ ...expenseForm, vendorId: e.target.value || undefined })}
              >
                <option value="">None</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Description"
            required
            value={expenseForm.description || ''}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
            placeholder="e.g. Venue deposit"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Estimated Cost"
              type="number"
              required
              min={0}
              step="0.01"
              value={expenseForm.estimated ?? ''}
              onChange={(e) => setExpenseForm({ ...expenseForm, estimated: Number(e.target.value) })}
            />
            <Input
              label="Actual Cost (Optional)"
              type="number"
              min={0}
              step="0.01"
              value={expenseForm.actual ?? ''}
              onChange={(e) => setExpenseForm({ ...expenseForm, actual: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsExpenseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingExpense ? 'Save Changes' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete ${expenseToDelete?.description}?`}
        confirmLabel="Delete"
      />
    </div>
  );
}
