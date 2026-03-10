export const DESIGNATIONS = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'lab_technician', label: 'Lab Technician' },
  { value: 'radiologist', label: 'Radiologist' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'hr_officer', label: 'HR Officer' },
  { value: 'data_entry', label: 'Data Entry' },
  { value: 'it_staff', label: 'IT Staff' },
  { value: 'admin_staff', label: 'Admin Staff' },
  { value: 'employee', label: 'Employee' },
] as const;

export const MODULES = [
  { key: 'general', label: 'General', icon: 'LayoutDashboard' },
  { key: 'registration', label: 'Registration', icon: 'UserPlus' },
  { key: 'appointment', label: 'Appointment', icon: 'CalendarDays' },
  { key: 'laboratory', label: 'Laboratory', icon: 'FlaskConical' },
  { key: 'radiology', label: 'Radiology', icon: 'Scan' },
  { key: 'pharmacy', label: 'Pharmacy', icon: 'Pill' },
  { key: 'ipd', label: 'IPD', icon: 'BedDouble' },
  { key: 'opd', label: 'OPD', icon: 'Stethoscope' },
  { key: 'billing', label: 'Billing', icon: 'Receipt' },
  { key: 'hr', label: 'HR', icon: 'Users' },
  { key: 'reports', label: 'Reports', icon: 'BarChart3' },
  { key: 'tasks', label: 'Tasks', icon: 'CheckSquare' },
  { key: 'inventory', label: 'Inventory', icon: 'Package' },
  { key: 'it', label: 'IT', icon: 'Monitor' },
] as const;

export const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-muted text-muted-foreground' },
  { value: 'medium', label: 'Medium', color: 'bg-info text-info-foreground' },
  { value: 'high', label: 'High', color: 'bg-warning text-warning-foreground' },
  { value: 'urgent', label: 'Urgent', color: 'bg-destructive text-destructive-foreground' },
] as const;

export const TASK_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const INVENTORY_CATEGORIES = [
  'Medicine', 'Equipment', 'Surgical Supply', 'Consumable',
  'Lab Reagent', 'Linen', 'Stationery', 'Other',
] as const;

export const INVENTORY_UNITS = [
  'pcs', 'box', 'bottle', 'pack', 'roll', 'kg', 'liter', 'tube', 'vial', 'strip',
] as const;

export type UserRole = 'admin' | 'user';
export type Designation = typeof DESIGNATIONS[number]['value'];
export type Priority = typeof PRIORITIES[number]['value'];
export type TaskStatus = typeof TASK_STATUSES[number]['value'];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: Designation;
  phone: string;
  is_active: boolean;
  permissions: string[];
  department_id?: string;
  specialization?: string;
  qualification?: string;
  fee?: number;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  staff_count: number;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  module: string;
  priority: Priority;
  status: TaskStatus;
  due_date?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  assigned_by: string;
  assigned_by_name?: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  min_quantity: number;
  unit_price: number;
  supplier: string;
  location: string;
  expiry_date?: string;
  barcode: string;
  notes: string;
  is_active: boolean;
  created_at: string;
}

export interface InventoryTransaction {
  id: string;
  inventory_item_id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  unit_price: number;
  reference: string;
  notes: string;
  created_by: string;
  created_at: string;
}
