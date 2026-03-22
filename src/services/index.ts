// src/services/index.ts
// All API service functions — one file, clean imports

import { api, buildQuery } from '@/lib/api';
import type {
  User, Department, Patient, Appointment, OPDVisit, IPDAdmission,
  LaboratoryTest, RadiologyRequest, PharmacyItem, BillingInvoice,
  InventoryItem, InventoryTransaction, Task, KnowledgeArticle, Document,
} from '@/lib/constants';

// ── Shared types ──────────────────────────────────────────────────────────────

export interface ApiList<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ApiOne<T> { data: T }

export interface WikiPage {
  id: string;
  title: string;
  content: string;
  author: string;
  author_id: string;
  updated_at: string;
  created_at: string;
}

export interface ContentCommentAPI {
  id: string;
  target_type: 'document' | 'knowledge' | 'wiki';
  target_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  message: string;
  parent_id?: string | null;
  likes_count: number;
  liked_by_me: boolean;
  created_at: string;
}

export interface SearchResult {
  id: string;
  title: string;
  type: 'knowledge' | 'patient' | 'user' | 'appointment' | 'labtest';
  category?: string;
  excerpt: string;
  url: string;
}

export interface DashboardStats {
  activeStaff: number;
  pendingTasks: number;
  totalInventoryValue: number;
  lowStockCount: number;
  totalPatients: number;
  currentInpatients: number;
  pendingLabTests: number;
  patientsByDepartment: { name: string; count: number }[];
  recentActivities: { text: string; time: string }[];
  departments: (Department & { staff_count: number })[];
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authService = {
  login: (email: string, password: string) =>
    api.post<ApiOne<{ accessToken: string; user: User }>>('/auth/login', { email, password }),

  logout: () => api.post<void>('/auth/logout'),

  refresh: () => api.post<ApiOne<{ accessToken: string }>>('/auth/refresh'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersService = {
  list: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get<ApiList<User>>(`/users${buildQuery(params || {})}`),

  me: () => api.get<ApiOne<User>>('/users/me'),

  getOne: (id: string) => api.get<ApiOne<User>>(`/users/${id}`),

  create: (data: Partial<User> & { password: string }) =>
    api.post<ApiOne<User>>('/users', data),

  update: (id: string, data: Partial<User> & { password?: string }) =>
    api.put<ApiOne<User>>(`/users/${id}`, data),

  toggleActive: (id: string) =>
    api.patch<ApiOne<User>>(`/users/${id}/toggle-active`),

  updatePermissions: (id: string, permissions: string[]) =>
    api.patch<ApiOne<User>>(`/users/${id}/permissions`, { permissions }),

  remove: (id: string) => api.delete<null>(`/users/${id}`),
};

// ── Departments ───────────────────────────────────────────────────────────────

export const departmentsService = {
  list: (params?: { active?: boolean; page?: number; limit?: number }) =>
    api.get<ApiList<Department & { staff_count: number }>>(`/departments${buildQuery(params || {})}`),

  getOne: (id: string) =>
    api.get<ApiOne<Department & { staff_count: number }>>(`/departments/${id}`),

  create: (data: Partial<Department>) =>
    api.post<ApiOne<Department>>('/departments', data),

  update: (id: string, data: Partial<Department>) =>
    api.put<ApiOne<Department>>(`/departments/${id}`, data),

  remove: (id: string) => api.delete<null>(`/departments/${id}`),
};

// ── Patients ──────────────────────────────────────────────────────────────────

export const patientsService = {
  list: (params?: { search?: string; department_id?: string; active?: boolean; page?: number; limit?: number }) =>
    api.get<ApiList<Patient>>(`/patients${buildQuery(params || {})}`),

  getOne: (id: string) => api.get<ApiOne<Patient>>(`/patients/${id}`),

  timeline: (id: string) => api.get<ApiOne<Record<string, unknown>>>(`/patients/${id}/timeline`),

  create: (data: Partial<Patient>) => api.post<ApiOne<Patient>>('/patients', data),

  update: (id: string, data: Partial<Patient>) =>
    api.put<ApiOne<Patient>>(`/patients/${id}`, data),

  remove: (id: string) => api.delete<null>(`/patients/${id}`),
};

// ── Appointments ──────────────────────────────────────────────────────────────

export const appointmentsService = {
  list: (params?: { search?: string; doctor_id?: string; date?: string; status?: string; page?: number; limit?: number }) =>
    api.get<ApiList<Appointment>>(`/appointments${buildQuery(params || {})}`),

  getOne: (id: string) => api.get<ApiOne<Appointment>>(`/appointments/${id}`),

  create: (data: Partial<Appointment>) =>
    api.post<ApiOne<Appointment>>('/appointments', data),

  update: (id: string, data: Partial<Appointment>) =>
    api.put<ApiOne<Appointment>>(`/appointments/${id}`, data),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiOne<Appointment>>(`/appointments/${id}/status`, { status }),

  remove: (id: string) => api.delete<null>(`/appointments/${id}`),
};

// ── OPD ───────────────────────────────────────────────────────────────────────

export const opdService = {
  list: (params?: { search?: string; status?: string; department_id?: string; date?: string; page?: number; limit?: number }) =>
    api.get<ApiList<OPDVisit>>(`/opd-visits${buildQuery(params || {})}`),

  getOne: (id: string) => api.get<ApiOne<OPDVisit>>(`/opd-visits/${id}`),

  create: (data: Partial<OPDVisit>) =>
    api.post<ApiOne<OPDVisit>>('/opd-visits', data),

  update: (id: string, data: Partial<OPDVisit>) =>
    api.put<ApiOne<OPDVisit>>(`/opd-visits/${id}`, data),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiOne<OPDVisit>>(`/opd-visits/${id}/status`, { status }),

  updateVitals: (id: string, vitals: OPDVisit['vitals']) =>
    api.patch<ApiOne<OPDVisit>>(`/opd-visits/${id}/vitals`, { vitals }),

  remove: (id: string) => api.delete<null>(`/opd-visits/${id}`),
};

// ── IPD ───────────────────────────────────────────────────────────────────────

export const ipdService = {
  list: (params?: { search?: string; status?: string; department_id?: string; page?: number; limit?: number }) =>
    api.get<ApiList<IPDAdmission>>(`/ipd-admissions${buildQuery(params || {})}`),

  getOne: (id: string) => api.get<ApiOne<IPDAdmission>>(`/ipd-admissions/${id}`),

  create: (data: Partial<IPDAdmission>) =>
    api.post<ApiOne<IPDAdmission>>('/ipd-admissions', data),

  update: (id: string, data: Partial<IPDAdmission>) =>
    api.put<ApiOne<IPDAdmission>>(`/ipd-admissions/${id}`, data),

  discharge: (id: string, discharge_date?: string, notes?: string) =>
    api.post<ApiOne<IPDAdmission>>(`/ipd-admissions/${id}/discharge`, { discharge_date, notes }),

  remove: (id: string) => api.delete<null>(`/ipd-admissions/${id}`),
};

// ── Laboratory ────────────────────────────────────────────────────────────────

export const laboratoryService = {
  list: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    api.get<ApiList<LaboratoryTest>>(`/laboratory-tests${buildQuery(params || {})}`),

  getOne: (id: string) => api.get<ApiOne<LaboratoryTest>>(`/laboratory-tests/${id}`),

  create: (data: Partial<LaboratoryTest>) =>
    api.post<ApiOne<LaboratoryTest>>('/laboratory-tests', data),

  update: (id: string, data: Partial<LaboratoryTest>) =>
    api.put<ApiOne<LaboratoryTest>>(`/laboratory-tests/${id}`, data),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiOne<LaboratoryTest>>(`/laboratory-tests/${id}/status`, { status }),

  updateResults: (id: string, results: Partial<LaboratoryTest>) =>
    api.patch<ApiOne<LaboratoryTest>>(`/laboratory-tests/${id}/results`, results),

  remove: (id: string) => api.delete<null>(`/laboratory-tests/${id}`),
};

// ── Radiology ─────────────────────────────────────────────────────────────────

export const radiologyService = {
  list: (params?: { search?: string; status?: string; type?: string; page?: number; limit?: number }) =>
    api.get<ApiList<RadiologyRequest>>(`/radiology${buildQuery(params || {})}`),

  getOne: (id: string) => api.get<ApiOne<RadiologyRequest>>(`/radiology/${id}`),

  create: (data: Partial<RadiologyRequest>) =>
    api.post<ApiOne<RadiologyRequest>>('/radiology', data),

  update: (id: string, data: Partial<RadiologyRequest>) =>
    api.put<ApiOne<RadiologyRequest>>(`/radiology/${id}`, data),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiOne<RadiologyRequest>>(`/radiology/${id}/status`, { status }),

  updateReport: (id: string, report: { findings: string; impression: string; radiologist_notes?: string }) =>
    api.patch<ApiOne<RadiologyRequest>>(`/radiology/${id}/report`, report),

  remove: (id: string) => api.delete<null>(`/radiology/${id}`),
};

// ── Pharmacy ──────────────────────────────────────────────────────────────────

export const pharmacyService = {
  list: (params?: { search?: string; category?: string; low_stock?: boolean; expiring_soon?: boolean; page?: number; limit?: number }) =>
    api.get<ApiList<PharmacyItem>>(`/pharmacy${buildQuery(params || {})}`),

  getOne: (id: string) => api.get<ApiOne<PharmacyItem>>(`/pharmacy/${id}`),

  create: (data: Partial<PharmacyItem>) =>
    api.post<ApiOne<PharmacyItem>>('/pharmacy', data),

  update: (id: string, data: Partial<PharmacyItem>) =>
    api.put<ApiOne<PharmacyItem>>(`/pharmacy/${id}`, data),

  adjustStock: (id: string, quantity: number, type: 'in' | 'out' | 'adjustment') =>
    api.patch<ApiOne<PharmacyItem>>(`/pharmacy/${id}/stock`, { quantity, type }),

  remove: (id: string) => api.delete<null>(`/pharmacy/${id}`),
};

// ── Billing ───────────────────────────────────────────────────────────────────

export interface BillingSummary {
  totalRevenue: number;
  pendingAmount: number;
  totalInvoices: number;
  pendingCount: number;
}

export const billingService = {
  list: (params?: { search?: string; status?: string; type?: string; page?: number; limit?: number }) =>
    api.get<ApiList<BillingInvoice>>(`/billing${buildQuery(params || {})}`),

  summary: () => api.get<ApiOne<BillingSummary>>('/billing/summary'),

  getOne: (id: string) => api.get<ApiOne<BillingInvoice>>(`/billing/${id}`),

  create: (data: Partial<BillingInvoice>) =>
    api.post<ApiOne<BillingInvoice>>('/billing', data),

  update: (id: string, data: Partial<BillingInvoice>) =>
    api.put<ApiOne<BillingInvoice>>(`/billing/${id}`, data),

  recordPayment: (id: string, amount: number) =>
    api.patch<ApiOne<BillingInvoice>>(`/billing/${id}/payment`, { amount }),

  remove: (id: string) => api.delete<null>(`/billing/${id}`),
};

// ── Inventory ─────────────────────────────────────────────────────────────────

export const inventoryService = {
  list: (params?: { search?: string; category?: string; low_stock?: boolean; page?: number; limit?: number }) =>
    api.get<ApiList<InventoryItem>>(`/inventory${buildQuery(params || {})}`),

  getOne: (id: string) => api.get<ApiOne<InventoryItem>>(`/inventory/${id}`),

  getTransactions: (id: string) =>
    api.get<ApiOne<InventoryTransaction[]>>(`/inventory/${id}/transactions`),

  create: (data: Partial<InventoryItem>) =>
    api.post<ApiOne<InventoryItem>>('/inventory', data),

  update: (id: string, data: Partial<InventoryItem>) =>
    api.put<ApiOne<InventoryItem>>(`/inventory/${id}`, data),

  processTransaction: (
    id: string,
    type: 'in' | 'out' | 'adjustment',
    quantity: number,
    unit_price?: number,
    reference?: string,
    notes?: string,
  ) =>
    api.post<ApiOne<{ item: InventoryItem; transaction: InventoryTransaction }>>(
      `/inventory/${id}/transaction`,
      { type, quantity, unit_price, reference, notes },
    ),

  remove: (id: string) => api.delete<null>(`/inventory/${id}`),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────

export const tasksService = {
  list: (params?: { search?: string; status?: string; priority?: string; assigned_to?: string; page?: number; limit?: number }) =>
    api.get<ApiList<Task>>(`/tasks${buildQuery(params || {})}`),

  getOne: (id: string) => api.get<ApiOne<Task>>(`/tasks/${id}`),

  create: (data: Partial<Task>) => api.post<ApiOne<Task>>('/tasks', data),

  update: (id: string, data: Partial<Task>) =>
    api.put<ApiOne<Task>>(`/tasks/${id}`, data),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiOne<Task>>(`/tasks/${id}/status`, { status }),

  remove: (id: string) => api.delete<null>(`/tasks/${id}`),
};

// ── Knowledge ─────────────────────────────────────────────────────────────────

export const knowledgeService = {
  list: (params?: { search?: string; category?: string; status?: string; page?: number; limit?: number }) =>
    api.get<ApiList<KnowledgeArticle>>(`/knowledge${buildQuery(params || {})}`),

  getOne: (id: string) => api.get<ApiOne<KnowledgeArticle>>(`/knowledge/${id}`),

  create: (data: Partial<KnowledgeArticle>) =>
    api.post<ApiOne<KnowledgeArticle>>('/knowledge', data),

  update: (id: string, data: Partial<KnowledgeArticle>) =>
    api.put<ApiOne<KnowledgeArticle>>(`/knowledge/${id}`, data),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiOne<KnowledgeArticle>>(`/knowledge/${id}/status`, { status }),

  remove: (id: string) => api.delete<null>(`/knowledge/${id}`),
};

// ── Documents ─────────────────────────────────────────────────────────────────

export const documentsService = {
  list: (params?: { search?: string; category?: string; status?: string; page?: number; limit?: number }) =>
    api.get<ApiList<Document>>(`/documents${buildQuery(params || {})}`),

  getOne: (id: string) => api.get<ApiOne<Document>>(`/documents/${id}`),

  getDownloadUrl: (id: string) =>
    `${import.meta.env.VITE_API_URL ?? '/api'}/documents/${id}/download`,

  upload: (formData: FormData) =>
    api.upload<ApiOne<Document>>('/documents', formData, 'POST'),

  update: (id: string, formData: FormData) =>
    api.upload<ApiOne<Document>>(`/documents/${id}`, formData, 'PUT'),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiOne<Document>>(`/documents/${id}/status`, { status }),

  remove: (id: string) => api.delete<null>(`/documents/${id}`),
};

// ── Wiki ──────────────────────────────────────────────────────────────────────

export const wikiService = {
  list: () => api.get<ApiList<WikiPage>>('/wiki'),

  getOne: (id: string) => api.get<ApiOne<WikiPage>>(`/wiki/${id}`),

  create: (data: { title: string; content: string }) =>
    api.post<ApiOne<WikiPage>>('/wiki', data),

  update: (id: string, data: { title?: string; content?: string }) =>
    api.put<ApiOne<WikiPage>>(`/wiki/${id}`, data),

  remove: (id: string) => api.delete<null>(`/wiki/${id}`),
};

// ── Comments ──────────────────────────────────────────────────────────────────

export const commentsService = {
  list: (targetType: string, targetId: string) =>
    api.get<ApiOne<ContentCommentAPI[]>>(
      `/comments?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`,
    ),

  create: (targetType: string, targetId: string, message: string, parentId?: string) =>
    api.post<ApiOne<ContentCommentAPI>>('/comments', {
      target_type: targetType,
      target_id:   targetId,
      message,
      ...(parentId ? { parent_id: parentId } : {}),
    }),

  toggleLike: (commentId: string) =>
    api.post<ApiOne<{ liked: boolean; likes_count: number }>>(`/comments/${commentId}/like`),

  remove: (id: string) => api.delete<null>(`/comments/${id}`),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  type: 'comment' | 'reply' | 'status_change';
  title: string;
  message: string;
  link?: string;
  target_type?: string;
  target_id?: string;
  is_read: boolean;
  created_at: string;
}

export const notificationsService = {
  list: () => api.get<ApiOne<NotificationItem[]>>('/notifications'),
  markRead: (id: string) => api.patch<ApiOne<{ success: boolean }>>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<ApiOne<{ success: boolean }>>('/notifications/read-all'),
  remove: (id: string) => api.delete<null>(`/notifications/${id}`),
};

// ── Search ────────────────────────────────────────────────────────────────────

export const searchService = {
  search: (q: string) =>
    api.get<ApiOne<SearchResult[]>>(`/search?q=${encodeURIComponent(q)}`),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const dashboardService = {
  getStats: () => api.get<ApiOne<DashboardStats>>('/dashboard/stats'),
};

// ── Reports ───────────────────────────────────────────────────────────────────

export const reportsService = {
  overview: () => api.get<ApiOne<Record<string, unknown>>>('/reports/overview'),
  inventory: () => api.get<ApiOne<Record<string, unknown>>>('/reports/inventory'),
  billing: (range?: string) =>
    api.get<ApiOne<Record<string, unknown>>>(`/reports/billing${range ? `?range=${range}` : ''}`),
  staff: () => api.get<ApiOne<Record<string, unknown>>>('/reports/staff'),
};

// ── Settings ──────────────────────────────────────────────────────────────────

export const settingsService = {
  list: () => api.get<ApiOne<Record<string, string>>>('/settings'),

  update: (key: string, value: string | boolean | number) =>
    api.patch<ApiOne<{ key: string; value: string }>>(`/settings/${key}`, {
      value: String(value),
    }),
};