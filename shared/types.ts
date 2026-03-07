// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

// ─── Wedding ──────────────────────────────────────────────────────────────────

export interface Wedding {
  id: string;
  userId: string;
  date: string | null;
  venueName: string | null;
  venueAddress: string | null;
  budget: number;
  partner1Name: string | null;
  partner2Name: string | null;
}

// ─── Guests ───────────────────────────────────────────────────────────────────

export const RSVP_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
} as const;

export type RsvpStatus = (typeof RSVP_STATUS)[keyof typeof RSVP_STATUS];

export interface Guest {
  id: string;
  weddingId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  rsvpStatus: RsvpStatus;
  dietaryNeeds: string | null;
  plusOne: boolean;
  tableId: string | null;
}

export interface CreateGuestRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  rsvpStatus?: RsvpStatus;
  dietaryNeeds?: string;
  plusOne?: boolean;
  tableId?: string;
}

export type UpdateGuestRequest = Partial<CreateGuestRequest>;

// ─── Vendors ──────────────────────────────────────────────────────────────────

export const VENDOR_STATUS = {
  INQUIRY: 'INQUIRY',
  BOOKED: 'BOOKED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;

export type VendorStatus = (typeof VENDOR_STATUS)[keyof typeof VENDOR_STATUS];

export const VENDOR_CATEGORY = {
  CATERING: 'CATERING',
  FLORIST: 'FLORIST',
  PHOTOGRAPHER: 'PHOTOGRAPHER',
  VIDEOGRAPHER: 'VIDEOGRAPHER',
  MUSIC: 'MUSIC',
  VENUE: 'VENUE',
  CAKE: 'CAKE',
  TRANSPORT: 'TRANSPORT',
  ATTIRE: 'ATTIRE',
  OTHER: 'OTHER',
} as const;

export type VendorCategory = (typeof VENDOR_CATEGORY)[keyof typeof VENDOR_CATEGORY];

export interface VendorFile {
  id: string;
  vendorId: string;
  url: string;
  filename: string;
  mimeType: string;
}

export interface Vendor {
  id: string;
  weddingId: string;
  name: string;
  category: string;
  contact: string | null;
  price: number | null;
  status: VendorStatus;
  notes: string | null;
  files: VendorFile[];
}

export interface CreateVendorRequest {
  name: string;
  category: string;
  contact?: string;
  price?: number;
  status?: VendorStatus;
  notes?: string;
}

export type UpdateVendorRequest = Partial<CreateVendorRequest>;

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const TASK_CATEGORY = {
  VENUE: 'Venue',
  CATERING: 'Catering',
  ATTIRE: 'Attire',
  PHOTOGRAPHY: 'Photography',
  MUSIC: 'Music',
  FLOWERS: 'Flowers',
  INVITATIONS: 'Invitations',
  TRANSPORT: 'Transport',
  HONEYMOON: 'Honeymoon',
  LEGAL: 'Legal',
  OTHER: 'Other',
} as const;

export type TaskCategory = (typeof TASK_CATEGORY)[keyof typeof TASK_CATEGORY];

export interface Task {
  id: string;
  weddingId: string;
  title: string;
  dueDate: string | null;
  completed: boolean;
  category: string | null;
  assignee: string | null;
}

export interface CreateTaskRequest {
  title: string;
  dueDate?: string;
  completed?: boolean;
  category?: string;
  assignee?: string;
}

export type UpdateTaskRequest = Partial<CreateTaskRequest>;

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const EXPENSE_CATEGORY = {
  VENUE: 'Venue',
  CATERING: 'Catering',
  PHOTOGRAPHY: 'Photography',
  VIDEOGRAPHY: 'Videography',
  MUSIC: 'Music',
  FLOWERS: 'Flowers',
  ATTIRE: 'Attire',
  CAKE: 'Cake',
  TRANSPORT: 'Transport',
  STATIONERY: 'Stationery',
  DECOR: 'Decor',
  HONEYMOON: 'Honeymoon',
  OTHER: 'Other',
} as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORY)[keyof typeof EXPENSE_CATEGORY];

export interface Expense {
  id: string;
  weddingId: string;
  category: string;
  description: string;
  estimated: number;
  actual: number | null;
  vendorId: string | null;
}

export interface CreateExpenseRequest {
  category: string;
  description: string;
  estimated: number;
  actual?: number;
  vendorId?: string;
}

export type UpdateExpenseRequest = Partial<CreateExpenseRequest>;

// ─── Tables / Seating ─────────────────────────────────────────────────────────

export interface SeatingTable {
  id: string;
  weddingId: string;
  name: string;
  capacity: number;
  guests: Guest[];
  posX: number;
  posY: number;
}

export interface CreateTableRequest {
  name: string;
  capacity?: number;
  posX?: number;
  posY?: number;
}

export type UpdateTableRequest = Partial<CreateTableRequest>;

// ─── Mood / Inspiration ────────────────────────────────────────────────────────

export interface MoodImage {
  id: string;
  weddingId: string;
  url: string;
  filename: string | null;
  tag: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface CreateMoodImageUrlRequest {
  url: string;
  tag?: string;
}

export interface UpdateMoodImageRequest {
  tag?: string | null;
  sortOrder?: number;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
