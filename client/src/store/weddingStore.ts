import { create } from 'zustand';
import type { Wedding, Guest, Vendor, Task, Expense, SeatingTable, MoodImage, CreateMoodImageUrlRequest, UpdateMoodImageRequest } from '@shared/types';
import {
  apiGetWedding,
  apiUpdateWedding,
  apiGetGuests,
  apiCreateGuest,
  apiUpdateGuest,
  apiDeleteGuest,
  apiImportGuests,
  apiRemindGuest,
  apiGetVendors,
  apiCreateVendor,
  apiUpdateVendor,
  apiDeleteVendor,
  apiGetTasks,
  apiCreateTask,
  apiUpdateTask,
  apiDeleteTask,
  apiBulkCreateTasks,
  apiGetExpenses,
  apiCreateExpense,
  apiUpdateExpense,
  apiDeleteExpense,
  apiGetTables,
  apiCreateTable,
  apiUpdateTable,
  apiDeleteTable,
  apiGetMoodImages,
  apiUploadMoodImage,
  apiAddMoodImageUrl,
  apiUpdateMoodImage,
  apiDeleteMoodImage,
} from '../api/wedding';

interface WeddingState {
  wedding: Wedding | null;
  guests: Guest[];
  vendors: Vendor[];
  tasks: Task[];
  expenses: Expense[];
  tables: SeatingTable[];
  loading: Record<string, boolean>;

  // Wedding
  fetchWedding: () => Promise<void>;
  updateWedding: (data: Partial<Wedding>) => Promise<void>;

  // Guests
  fetchGuests: () => Promise<void>;
  createGuest: (data: Partial<Guest>) => Promise<Guest>;
  updateGuest: (id: string, data: Partial<Guest>) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
  importGuests: (guests: Partial<Guest>[]) => Promise<void>;
  remindGuest: (id: string) => Promise<void>;

  // Vendors
  fetchVendors: () => Promise<void>;
  createVendor: (data: Partial<Vendor>) => Promise<Vendor>;
  updateVendor: (id: string, data: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;

  // Tasks
  fetchTasks: () => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  bulkCreateTasks: (tasks: Partial<Task>[]) => Promise<void>;

  // Expenses
  fetchExpenses: () => Promise<void>;
  createExpense: (data: Partial<Expense>) => Promise<Expense>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Tables
  fetchTables: () => Promise<void>;
  createTable: (data: Partial<SeatingTable>) => Promise<SeatingTable>;
  updateTable: (id: string, data: Partial<SeatingTable>) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;

  // Mood Images
  moodImages: MoodImage[];
  fetchMoodImages: () => Promise<void>;
  uploadMoodImage: (file: File, tag?: string) => Promise<MoodImage>;
  addMoodImageUrl: (payload: CreateMoodImageUrlRequest) => Promise<MoodImage>;
  updateMoodImage: (id: string, payload: UpdateMoodImageRequest) => Promise<void>;
  deleteMoodImage: (id: string) => Promise<void>;
}

function setLoading(
  set: (fn: (s: WeddingState) => WeddingState) => void,
  key: string,
  value: boolean,
) {
  set((s) => ({ ...s, loading: { ...s.loading, [key]: value } }));
}

export const useWeddingStore = create<WeddingState>()((set) => ({
  wedding: null,
  guests: [],
  vendors: [],
  tasks: [],
  expenses: [],
  tables: [],
  moodImages: [],
  loading: {},

  // ─── Wedding ───────────────────────────────────────────────────────────────
  fetchWedding: async () => {
    setLoading(set, 'wedding', true);
    try {
      const wedding = await apiGetWedding();
      set((s) => ({ ...s, wedding }));
    } finally {
      setLoading(set, 'wedding', false);
    }
  },

  updateWedding: async (data) => {
    const wedding = await apiUpdateWedding(data);
    set((s) => ({ ...s, wedding }));
  },

  // ─── Guests ────────────────────────────────────────────────────────────────
  fetchGuests: async () => {
    setLoading(set, 'guests', true);
    try {
      const guests = await apiGetGuests();
      set((s) => ({ ...s, guests }));
    } finally {
      setLoading(set, 'guests', false);
    }
  },

  createGuest: async (data) => {
    const guest = await apiCreateGuest(data);
    set((s) => ({ ...s, guests: [...s.guests, guest] }));
    return guest;
  },

  updateGuest: async (id, data) => {
    // Optimistic update
    set((s) => ({
      ...s,
      guests: s.guests.map((g) => (g.id === id ? { ...g, ...data } : g)),
    }));
    try {
      const updated = await apiUpdateGuest(id, data);
      set((s) => ({ ...s, guests: s.guests.map((g) => (g.id === id ? updated : g)) }));
    } catch (err) {
      // Revert optimistic on error — refetch
      const guests = await apiGetGuests();
      set((s) => ({ ...s, guests }));
      throw err;
    }
  },

  deleteGuest: async (id) => {
    set((s) => ({ ...s, guests: s.guests.filter((g) => g.id !== id) }));
    try {
      await apiDeleteGuest(id);
    } catch (err) {
      const guests = await apiGetGuests();
      set((s) => ({ ...s, guests }));
      throw err;
    }
  },

  importGuests: async (guestData) => {
    await apiImportGuests(guestData);
    const guests = await apiGetGuests();
    set((s) => ({ ...s, guests }));
  },

  remindGuest: async (id) => {
    await apiRemindGuest(id);
  },

  // ─── Vendors ───────────────────────────────────────────────────────────────
  fetchVendors: async () => {
    setLoading(set, 'vendors', true);
    try {
      const vendors = await apiGetVendors();
      set((s) => ({ ...s, vendors }));
    } finally {
      setLoading(set, 'vendors', false);
    }
  },

  createVendor: async (data) => {
    const vendor = await apiCreateVendor(data);
    set((s) => ({ ...s, vendors: [...s.vendors, vendor] }));
    return vendor;
  },

  updateVendor: async (id, data) => {
    set((s) => ({
      ...s,
      vendors: s.vendors.map((v) => (v.id === id ? { ...v, ...data } : v)),
    }));
    try {
      const updated = await apiUpdateVendor(id, data);
      set((s) => ({ ...s, vendors: s.vendors.map((v) => (v.id === id ? updated : v)) }));
    } catch (err) {
      const vendors = await apiGetVendors();
      set((s) => ({ ...s, vendors }));
      throw err;
    }
  },

  deleteVendor: async (id) => {
    set((s) => ({ ...s, vendors: s.vendors.filter((v) => v.id !== id) }));
    try {
      await apiDeleteVendor(id);
    } catch (err) {
      const vendors = await apiGetVendors();
      set((s) => ({ ...s, vendors }));
      throw err;
    }
  },

  // ─── Tasks ─────────────────────────────────────────────────────────────────
  fetchTasks: async () => {
    setLoading(set, 'tasks', true);
    try {
      const tasks = await apiGetTasks();
      set((s) => ({ ...s, tasks }));
    } finally {
      setLoading(set, 'tasks', false);
    }
  },

  createTask: async (data) => {
    const task = await apiCreateTask(data);
    set((s) => ({ ...s, tasks: [...s.tasks, task] }));
    return task;
  },

  updateTask: async (id, data) => {
    set((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }));
    try {
      const updated = await apiUpdateTask(id, data);
      set((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? updated : t)) }));
    } catch (err) {
      const tasks = await apiGetTasks();
      set((s) => ({ ...s, tasks }));
      throw err;
    }
  },

  deleteTask: async (id) => {
    set((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
    try {
      await apiDeleteTask(id);
    } catch (err) {
      const tasks = await apiGetTasks();
      set((s) => ({ ...s, tasks }));
      throw err;
    }
  },

  bulkCreateTasks: async (taskData) => {
    const newTasks = await apiBulkCreateTasks(taskData);
    set((s) => ({ ...s, tasks: [...s.tasks, ...newTasks] }));
  },

  // ─── Expenses ──────────────────────────────────────────────────────────────
  fetchExpenses: async () => {
    setLoading(set, 'expenses', true);
    try {
      const expenses = await apiGetExpenses();
      set((s) => ({ ...s, expenses }));
    } finally {
      setLoading(set, 'expenses', false);
    }
  },

  createExpense: async (data) => {
    const expense = await apiCreateExpense(data);
    set((s) => ({ ...s, expenses: [...s.expenses, expense] }));
    return expense;
  },

  updateExpense: async (id, data) => {
    set((s) => ({
      ...s,
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));
    try {
      const updated = await apiUpdateExpense(id, data);
      set((s) => ({ ...s, expenses: s.expenses.map((e) => (e.id === id ? updated : e)) }));
    } catch (err) {
      const expenses = await apiGetExpenses();
      set((s) => ({ ...s, expenses }));
      throw err;
    }
  },

  deleteExpense: async (id) => {
    set((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));
    try {
      await apiDeleteExpense(id);
    } catch (err) {
      const expenses = await apiGetExpenses();
      set((s) => ({ ...s, expenses }));
      throw err;
    }
  },

  // ─── Tables ────────────────────────────────────────────────────────────────
  fetchTables: async () => {
    setLoading(set, 'tables', true);
    try {
      const tables = await apiGetTables();
      set((s) => ({ ...s, tables }));
    } finally {
      setLoading(set, 'tables', false);
    }
  },

  createTable: async (data) => {
    const table = await apiCreateTable(data);
    set((s) => ({ ...s, tables: [...s.tables, table] }));
    return table;
  },

  updateTable: async (id, data) => {
    set((s) => ({
      ...s,
      tables: s.tables.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }));
    try {
      const updated = await apiUpdateTable(id, data);
      set((s) => ({ ...s, tables: s.tables.map((t) => (t.id === id ? updated : t)) }));
    } catch (err) {
      const tables = await apiGetTables();
      set((s) => ({ ...s, tables }));
      throw err;
    }
  },

  deleteTable: async (id) => {
    set((s) => ({ ...s, tables: s.tables.filter((t) => t.id !== id) }));
    try {
      await apiDeleteTable(id);
    } catch (err) {
      const tables = await apiGetTables();
      set((s) => ({ ...s, tables }));
      throw err;
    }
  },

  // ─── Mood Images ─────────────────────────────────────────────────────────────
  fetchMoodImages: async () => {
    setLoading(set, 'mood', true);
    try {
      const moodImages = await apiGetMoodImages();
      set((s) => ({ ...s, moodImages }));
    } finally {
      setLoading(set, 'mood', false);
    }
  },

  uploadMoodImage: async (file, tag) => {
    const image = await apiUploadMoodImage(file, tag);
    set((s) => ({ ...s, moodImages: [...s.moodImages, image] }));
    return image;
  },

  addMoodImageUrl: async (payload) => {
    const image = await apiAddMoodImageUrl(payload);
    set((s) => ({ ...s, moodImages: [...s.moodImages, image] }));
    return image;
  },

  updateMoodImage: async (id, payload) => {
    set((s) => ({
      ...s,
      moodImages: s.moodImages.map((m) => (m.id === id ? { ...m, ...payload } : m)),
    }));
    try {
      const updated = await apiUpdateMoodImage(id, payload);
      set((s) => ({ ...s, moodImages: s.moodImages.map((m) => (m.id === id ? updated : m)) }));
    } catch (err) {
      const moodImages = await apiGetMoodImages();
      set((s) => ({ ...s, moodImages }));
      throw err;
    }
  },

  deleteMoodImage: async (id) => {
    set((s) => ({ ...s, moodImages: s.moodImages.filter((m) => m.id !== id) }));
    try {
      await apiDeleteMoodImage(id);
    } catch (err) {
      const moodImages = await apiGetMoodImages();
      set((s) => ({ ...s, moodImages }));
      throw err;
    }
  },
}));
