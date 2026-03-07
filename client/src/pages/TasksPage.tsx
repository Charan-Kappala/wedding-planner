import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useWeddingStore } from '../store/weddingStore';
import type { Task } from '@shared/types';
import { TASK_CATEGORY } from '@shared/types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { CheckSquare, Plus, Edit2, Trash2, Calendar, User, Clock } from 'lucide-react';

const DEFAULT_TASKS: Partial<Task>[] = [
  { title: 'Determine your budget', category: 'Other', completed: false },
  { title: 'Draft a guest list', category: 'Other', completed: false },
  { title: 'Hire a wedding planner', category: 'Other', completed: false },
  { title: 'Book the venue', category: 'Venue', completed: false },
  { title: 'Hire the caterer', category: 'Catering', completed: false },
  { title: 'Book the photographer', category: 'Photography', completed: false },
  { title: 'Purchase wedding attire', category: 'Attire', completed: false },
  { title: 'Book the band/DJ', category: 'Music', completed: false },
  { title: 'Hire the florist', category: 'Flowers', completed: false },
  { title: 'Order invitations', category: 'Invitations', completed: false },
  { title: 'Book honeymoon', category: 'Honeymoon', completed: false },
  { title: 'Get marriage license', category: 'Legal', completed: false },
];

type FilterType = 'All' | 'Incomplete' | 'Complete' | 'Overdue';

export default function TasksPage() {
  const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask, bulkCreateTasks, wedding } = useWeddingStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const [filter, setFilter] = useState<FilterType>('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<Partial<Task>>({});

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const loadTemplate = async () => {
    try {
      // Calculate due dates relative to wedding date if exists
      const template = DEFAULT_TASKS.map(t => {
        let dueDate = undefined;
        if (wedding?.date) {
           const d = new Date(wedding.date);
           d.setMonth(d.getMonth() - 2); // default roughly 2 months before
           dueDate = d.toISOString();
        }
        return { ...t, dueDate };
      });
      await bulkCreateTasks(template);
      toast.success('Template loaded successfully');
    } catch (err) {
      toast.error('Failed to load template');
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && !t.completed;
      if (filter === 'Complete') return t.completed;
      if (filter === 'Incomplete') return !t.completed;
      if (filter === 'Overdue') return isOverdue;
      return true; // All
    });
  }, [tasks, filter]);

  // Group by category
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    Object.values(TASK_CATEGORY).forEach(c => {
      groups[c] = [];
    });
    filteredTasks.forEach(t => {
      const cat = t.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(t);
    });
    return groups;
  }, [filteredTasks]);

  const allGrouped = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    tasks.forEach(t => {
      const cat = t.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(t);
    });
    return groups;
  }, [tasks]);

  const totalTasks = tasks.length;

  const openNewModal = () => {
    setEditingTask(null);
    setForm({ category: 'Other', completed: false });
    setIsModalOpen(true);
  };

  const openEditModal = (t: Task) => {
    setEditingTask(t);
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = t.dueDate ? (new Date(new Date(t.dueDate).getTime() - tzoffset)).toISOString().slice(0, 16) : undefined;
    
    setForm({ ...t, dueDate: localISOTime });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      };

      if (editingTask) {
        await updateTask(editingTask.id, payload);
        toast.success('Task updated');
      } else {
        await createTask(payload as Partial<Task>);
        toast.success('Task created');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Failed to save task');
    }
  };

  const toggleComplete = async (t: Task) => {
    try {
      await updateTask(t.id, { completed: !t.completed });
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete.id);
      toast.success('Task deleted');
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-semibold text-charcoal">Checklist</h1>
        <div className="flex items-center gap-3">
          {totalTasks === 0 && (
            <Button variant="secondary" onClick={loadTemplate}>
              Load Template
            </Button>
          )}
          <Button onClick={openNewModal} icon={<Plus className="h-4 w-4" />}>
            Add Task
          </Button>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-blush-100 flex flex-wrap gap-2 items-center bg-gray-50/50">
          {(['All', 'Incomplete', 'Complete', 'Overdue'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === f
                  ? 'bg-charcoal text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {totalTasks === 0 && !loading.tasks ? (
        <div className="card text-center py-16 flex flex-col items-center">
           <div className="h-16 w-16 bg-blush-50 rounded-full flex items-center justify-center mb-4">
            <CheckSquare className="h-8 w-8 text-blush-400" />
          </div>
          <h3 className="text-lg font-medium text-charcoal">No tasks yet</h3>
          <p className="text-gray-500 text-sm mt-1 mb-4">Add your own tasks or load our standard wedding checklist.</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={loadTemplate}>Load Template</Button>
            <Button onClick={openNewModal} icon={<Plus className="h-4 w-4" />}>Add Custom Task</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTasks).map(([category, catTasks]) => {
            const allCatTasks = allGrouped[category] || [];
            if (allCatTasks.length === 0) return null; // hide empty categories entirely

            const categoryCompleted = allCatTasks.filter((t) => t.completed).length;
            const progress = Math.round((categoryCompleted / allCatTasks.length) * 100);

            if (catTasks.length === 0 && filter !== 'All') return null; // hide empty if filtered

            return (
              <div key={category} className="card !bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading text-lg font-semibold text-charcoal">{category}</h3>
                  <span className="text-sm font-medium text-gray-500">{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div
                    className="bg-blush-400 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="space-y-2 mt-4">
                  {catTasks.map((t) => {
                    const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && !t.completed;
                    return (
                      <div
                        key={t.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          t.completed ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200'
                        } ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`}
                      >
                        <button
                          className={`mt-0.5 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded border ${
                            t.completed
                              ? 'bg-blush-400 border-blush-400 text-white'
                              : 'border-gray-300 hover:border-blush-400 bg-white'
                          }`}
                          onClick={() => toggleComplete(t)}
                        >
                          {t.completed && <CheckSquare className="w-3.5 h-3.5" />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${t.completed ? 'line-through text-gray-500' : 'text-charcoal'}`}>
                            {t.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 mt-1">
                            {t.dueDate && (
                              <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                {isOverdue ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                                <span>
                                  {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                            )}
                            {t.assignee && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <User className="w-3 h-3" />
                                <span>{t.assignee}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 sm:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(t)}
                            className="p-1.5 text-gray-400 hover:text-charcoal hover:bg-gray-100 rounded-md"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setTaskToDelete(t);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTask ? 'Edit Task' : 'Add Task'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Task Title"
            required
            value={form.title || ''}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Call photographer"
          />

          <div>
            <label className="label">Category</label>
            <select
              className="input bg-white"
              value={form.category || 'Other'}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {Object.values(TASK_CATEGORY).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date & Time"
              type="datetime-local"
              value={form.dueDate || ''}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
            <Input
              label="Assignee"
              value={form.assignee || ''}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
              placeholder="e.g. John"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTask ? 'Save Changes' : 'Add Task'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete this task?`}
        confirmLabel="Delete"
      />
    </div>
  );
}
