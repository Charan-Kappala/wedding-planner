import apiClient from './client';
import type { Wedding, Guest, Vendor, Task, Expense, SeatingTable, MoodImage, CreateMoodImageUrlRequest, UpdateMoodImageRequest } from '@shared/types';

// ─── Wedding ──────────────────────────────────────────────────────────────────
export async function apiGetWedding(): Promise<Wedding> {
  const { data } = await apiClient.get<{ success: true; data: Wedding }>('/wedding');
  return data.data;
}

export async function apiUpdateWedding(payload: Partial<Wedding>): Promise<Wedding> {
  const { data } = await apiClient.put<{ success: true; data: Wedding }>('/wedding', payload);
  return data.data;
}

// ─── Guests ───────────────────────────────────────────────────────────────────
export async function apiGetGuests(): Promise<Guest[]> {
  const { data } = await apiClient.get<{ success: true; data: Guest[] }>('/guests');
  return data.data;
}

export async function apiCreateGuest(payload: Partial<Guest>): Promise<Guest> {
  const { data } = await apiClient.post<{ success: true; data: Guest }>('/guests', payload);
  return data.data;
}

export async function apiUpdateGuest(id: string, payload: Partial<Guest>): Promise<Guest> {
  const { data } = await apiClient.put<{ success: true; data: Guest }>(`/guests/${id}`, payload);
  return data.data;
}

export async function apiDeleteGuest(id: string): Promise<void> {
  await apiClient.delete(`/guests/${id}`);
}

export async function apiImportGuests(guests: Partial<Guest>[]): Promise<{ count: number }> {
  const { data } = await apiClient.post<{ success: true; data: { count: number } }>(
    '/guests/import',
    guests,
  );
  return data.data;
}

export async function apiRemindGuest(id: string): Promise<void> {
  await apiClient.post(`/guests/${id}/remind`);
}

// ─── Vendors ──────────────────────────────────────────────────────────────────
export async function apiGetVendors(): Promise<Vendor[]> {
  const { data } = await apiClient.get<{ success: true; data: Vendor[] }>('/vendors');
  return data.data;
}

export async function apiCreateVendor(payload: Partial<Vendor>): Promise<Vendor> {
  const { data } = await apiClient.post<{ success: true; data: Vendor }>('/vendors', payload);
  return data.data;
}

export async function apiUpdateVendor(id: string, payload: Partial<Vendor>): Promise<Vendor> {
  const { data } = await apiClient.put<{ success: true; data: Vendor }>(`/vendors/${id}`, payload);
  return data.data;
}

export async function apiDeleteVendor(id: string): Promise<void> {
  await apiClient.delete(`/vendors/${id}`);
}

export async function apiUploadVendorFile(vendorId: string, file: File): Promise<void> {
  const form = new FormData();
  form.append('file', file);
  await apiClient.post(`/vendors/${vendorId}/files`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export async function apiGetTasks(): Promise<Task[]> {
  const { data } = await apiClient.get<{ success: true; data: Task[] }>('/tasks');
  return data.data;
}

export async function apiCreateTask(payload: Partial<Task>): Promise<Task> {
  const { data } = await apiClient.post<{ success: true; data: Task }>('/tasks', payload);
  return data.data;
}

export async function apiUpdateTask(id: string, payload: Partial<Task>): Promise<Task> {
  const { data } = await apiClient.put<{ success: true; data: Task }>(`/tasks/${id}`, payload);
  return data.data;
}

export async function apiDeleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}

export async function apiBulkCreateTasks(tasks: Partial<Task>[]): Promise<Task[]> {
  const { data } = await apiClient.post<{ success: true; data: Task[] }>('/tasks/bulk', tasks);
  return data.data;
}

// ─── Expenses ─────────────────────────────────────────────────────────────────
export async function apiGetExpenses(): Promise<Expense[]> {
  const { data } = await apiClient.get<{ success: true; data: Expense[] }>('/expenses');
  return data.data;
}

export async function apiCreateExpense(payload: Partial<Expense>): Promise<Expense> {
  const { data } = await apiClient.post<{ success: true; data: Expense }>('/expenses', payload);
  return data.data;
}

export async function apiUpdateExpense(id: string, payload: Partial<Expense>): Promise<Expense> {
  const { data } = await apiClient.put<{ success: true; data: Expense }>(
    `/expenses/${id}`,
    payload,
  );
  return data.data;
}

export async function apiDeleteExpense(id: string): Promise<void> {
  await apiClient.delete(`/expenses/${id}`);
}

// ─── Tables ───────────────────────────────────────────────────────────────────
export async function apiGetTables(): Promise<SeatingTable[]> {
  const { data } = await apiClient.get<{ success: true; data: SeatingTable[] }>('/tables');
  return data.data;
}

export async function apiCreateTable(payload: Partial<SeatingTable>): Promise<SeatingTable> {
  const { data } = await apiClient.post<{ success: true; data: SeatingTable }>('/tables', payload);
  return data.data;
}

export async function apiUpdateTable(
  id: string,
  payload: Partial<SeatingTable>,
): Promise<SeatingTable> {
  const { data } = await apiClient.put<{ success: true; data: SeatingTable }>(
    `/tables/${id}`,
    payload,
  );
  return data.data;
}

export async function apiDeleteTable(id: string): Promise<void> {
  await apiClient.delete(`/tables/${id}`);
}

// ─── Mood / Inspiration ────────────────────────────────────────────────────────

export async function apiGetMoodImages(): Promise<MoodImage[]> {
  const { data } = await apiClient.get<{ success: true; data: MoodImage[] }>('/mood');
  return data.data;
}

export async function apiUploadMoodImage(file: File, tag?: string): Promise<MoodImage> {
  const form = new FormData();
  form.append('image', file);
  if (tag) form.append('tag', tag);
  const { data } = await apiClient.post<{ success: true; data: MoodImage }>('/mood/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function apiAddMoodImageUrl(payload: CreateMoodImageUrlRequest): Promise<MoodImage> {
  const { data } = await apiClient.post<{ success: true; data: MoodImage }>('/mood/url', payload);
  return data.data;
}

export async function apiUpdateMoodImage(id: string, payload: UpdateMoodImageRequest): Promise<MoodImage> {
  const { data } = await apiClient.put<{ success: true; data: MoodImage }>(`/mood/${id}`, payload);
  return data.data;
}

export async function apiDeleteMoodImage(id: string): Promise<void> {
  await apiClient.delete(`/mood/${id}`);
}
