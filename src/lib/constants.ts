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

// Patient types
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  blood_group?: string;
  address: string;
  department_id?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  insurance_provider?: string;
  insurance_number?: string;
  is_active: boolean;
  created_at: string;
}

// Appointment types
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentType = 'consultation' | 'followup' | 'emergency' | 'checkup';

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  department_id: string;
  department_name: string;
  appointment_date: string;
  appointment_time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  created_at: string;
}

// Laboratory types
export type LabTestStatus = 'pending' | 'sample_collected' | 'processing' | 'completed' | 'cancelled';
export type LabTestResult = 'normal' | 'abnormal' | 'critical';

export interface LaboratoryTest {
  id: string;
  patient_id: string;
  patient_name: string;
  test_name: string;
  test_code: string;
  category: string;
  status: LabTestStatus;
  result?: string;
  result_value?: string;
  result_unit?: string;
  reference_range?: string;
  result_status?: LabTestResult;
  ordered_by: string;
  ordered_by_name: string;
  collected_at?: string;
  completed_at?: string;
  created_at: string;
}

// Pharmacy types
export interface PharmacyItem {
  id: string;
  name: string;
  generic_name?: string;
  category: string;
  unit: string;
  quantity: number;
  min_quantity: number;
  unit_price: number;
  supplier: string;
  location: string;
  expiry_date?: string;
  barcode: string;
  dosage?: string;
  side_effects?: string;
  notes: string;
  is_active: boolean;
  created_at: string;
}

export const APPOINTMENT_STATUSES = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
] as const;

export const APPOINTMENT_TYPES = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'followup', label: 'Follow-up' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'checkup', label: 'Check-up' },
] as const;

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const LAB_TEST_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'sample_collected', label: 'Sample Collected' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const LAB_TEST_CATEGORIES = [
  'Hematology',
  'Biochemistry',
  'Microbiology',
  'Serology',
  'Pathology',
  'Radiology',
  'Other',
] as const;

export const PHARMACY_CATEGORIES = [
  'Medicine',
  'Injection',
  'Syrup',
  'Cream',
  'Drops',
  'Inhaler',
  'Surgical Supply',
  'Consumable',
  'Other',
] as const;

// OPD Types
export type OPDStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';

export interface OPDVisit {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  doctor_id: string;
  doctor_name: string;
  department_id: string;
  department_name: string;
  visit_date: string;
  visit_time: string;
  chief_complaint: string;
  diagnosis?: string;
  prescription?: string;
  status: OPDStatus;
  vitals?: {
    blood_pressure?: string;
    temperature?: string;
    pulse?: string;
    weight?: string;
  };
  notes?: string;
  created_at: string;
}

// IPD Types
export type IPDStatus = 'admitted' | 'in_progress' | 'discharged' | 'transferred';

export interface IPDAdmission {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  patient_age: number;
  patient_gender: string;
  doctor_id: string;
  doctor_name: string;
  department_id: string;
  department_name: string;
  room_number: string;
  bed_number: string;
  admission_date: string;
  admission_time: string;
  discharge_date?: string;
  diagnosis: string;
  treatment_plan?: string;
  status: IPDStatus;
  notes?: string;
  created_at: string;
}

// Radiology Types
export type RadiologyStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type RadiologyType = 'xray' | 'ultrasound' | 'ct_scan' | 'mri' | 'mammography' | 'angiography' | 'other';

export interface RadiologyRequest {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  doctor_id: string;
  doctor_name: string;
  radiology_type: RadiologyType;
  examination: string;
  clinical_history?: string;
  status: RadiologyStatus;
  appointment_date?: string;
  appointment_time?: string;
  report?: string;
  findings?: string;
  impression?: string;
  radiologist_notes?: string;
  completed_at?: string;
  created_at: string;
}

// Billing Types
export type BillingStatus = 'pending' | 'paid' | 'partial' | 'cancelled' | 'refunded';
export type BillingType = 'consultation' | 'laboratory' | 'radiology' | 'pharmacy' | 'ipd' | 'procedure' | 'other';

export interface BillingInvoice {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  invoice_number: string;
  billing_type: BillingType;
  items: BillingItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amount_paid: number;
  status: BillingStatus;
  due_date?: string;
  paid_at?: string;
  created_at: string;
}

export interface BillingItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

