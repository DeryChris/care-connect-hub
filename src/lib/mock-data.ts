import { User, Department, Task, InventoryItem } from './constants';

export const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@hmis.com', role: 'admin', designation: 'admin_staff', phone: '+1234567890', is_active: true, permissions: [], created_at: '2024-01-15' },
  { id: '2', name: 'Dr. Sarah Wilson', email: 'sarah@hmis.com', role: 'user', designation: 'doctor', phone: '+1234567891', is_active: true, permissions: ['general','appointment','opd','ipd'], department_id: '1', specialization: 'Cardiology', qualification: 'MBBS, MD', fee: 150, created_at: '2024-02-10' },
  { id: '3', name: 'Dr. James Chen', email: 'james@hmis.com', role: 'user', designation: 'doctor', phone: '+1234567892', is_active: true, permissions: ['general','appointment','opd'], department_id: '2', specialization: 'Orthopedics', qualification: 'MBBS, MS', fee: 120, created_at: '2024-02-15' },
  { id: '4', name: 'Emily Davis', email: 'emily@hmis.com', role: 'user', designation: 'nurse', phone: '+1234567893', is_active: true, permissions: ['general','ipd','opd'], created_at: '2024-03-01' },
  { id: '5', name: 'Michael Brown', email: 'michael@hmis.com', role: 'user', designation: 'pharmacist', phone: '+1234567894', is_active: true, permissions: ['general','pharmacy','inventory'], created_at: '2024-03-10' },
  { id: '6', name: 'Lisa Anderson', email: 'lisa@hmis.com', role: 'user', designation: 'lab_technician', phone: '+1234567895', is_active: false, permissions: ['general','laboratory'], created_at: '2024-03-20' },
  { id: '7', name: 'Robert Taylor', email: 'robert@hmis.com', role: 'user', designation: 'receptionist', phone: '+1234567896', is_active: true, permissions: ['general','registration','appointment'], created_at: '2024-04-01' },
  { id: '8', name: 'Karen Martinez', email: 'karen@hmis.com', role: 'user', designation: 'accountant', phone: '+1234567897', is_active: true, permissions: ['general','billing','reports'], created_at: '2024-04-15' },
];

export const mockDepartments: Department[] = [
  { id: '1', name: 'Cardiology', description: 'Heart and cardiovascular system', is_active: true, staff_count: 5, created_at: '2024-01-10' },
  { id: '2', name: 'Orthopedics', description: 'Bones, joints, and musculoskeletal system', is_active: true, staff_count: 4, created_at: '2024-01-10' },
  { id: '3', name: 'Neurology', description: 'Brain and nervous system disorders', is_active: true, staff_count: 3, created_at: '2024-01-10' },
  { id: '4', name: 'Pediatrics', description: 'Medical care for infants and children', is_active: true, staff_count: 6, created_at: '2024-01-10' },
  { id: '5', name: 'Dermatology', description: 'Skin conditions and diseases', is_active: false, staff_count: 0, created_at: '2024-02-15' },
  { id: '6', name: 'Emergency', description: 'Emergency and trauma care', is_active: true, staff_count: 8, created_at: '2024-01-10' },
];

export const mockTasks: Task[] = [
  { id: '1', title: 'Update patient records system', description: 'Migrate old records to new digital format', module: 'registration', priority: 'high', status: 'in_progress', due_date: '2024-12-30', assigned_to: '4', assigned_to_name: 'Emily Davis', assigned_by: '1', assigned_by_name: 'Admin User', created_at: '2024-11-01' },
  { id: '2', title: 'Inventory audit for pharmacy', description: 'Quarterly stock verification', module: 'inventory', priority: 'medium', status: 'pending', due_date: '2024-12-15', assigned_to: '5', assigned_to_name: 'Michael Brown', assigned_by: '1', assigned_by_name: 'Admin User', created_at: '2024-11-10' },
  { id: '3', title: 'Lab equipment calibration', description: 'Calibrate all lab instruments', module: 'laboratory', priority: 'urgent', status: 'pending', due_date: '2024-12-05', assigned_to: '6', assigned_to_name: 'Lisa Anderson', assigned_by: '2', assigned_by_name: 'Dr. Sarah Wilson', created_at: '2024-11-15' },
  { id: '4', title: 'Staff training on new billing', description: 'Train accounting team on updated billing software', module: 'billing', priority: 'low', status: 'completed', assigned_to: '8', assigned_to_name: 'Karen Martinez', assigned_by: '1', assigned_by_name: 'Admin User', created_at: '2024-10-01' },
  { id: '5', title: 'Setup appointment reminders', description: 'Configure SMS reminder system for appointments', module: 'appointment', priority: 'medium', status: 'in_progress', assigned_to: '7', assigned_to_name: 'Robert Taylor', assigned_by: '1', assigned_by_name: 'Admin User', created_at: '2024-11-20' },
];

export const mockInventory: InventoryItem[] = [
  { id: '1', name: 'Paracetamol 500mg', category: 'Medicine', unit: 'strip', quantity: 500, min_quantity: 100, unit_price: 2.5, supplier: 'PharmaCorp', location: 'Shelf A1', expiry_date: '2025-06-30', barcode: 'MED001', notes: '', is_active: true, created_at: '2024-01-15' },
  { id: '2', name: 'Surgical Gloves (L)', category: 'Consumable', unit: 'box', quantity: 45, min_quantity: 50, unit_price: 8.0, supplier: 'MedSupply Co', location: 'Store B2', barcode: 'CON002', notes: 'Latex-free', is_active: true, created_at: '2024-01-15' },
  { id: '3', name: 'Digital Thermometer', category: 'Equipment', unit: 'pcs', quantity: 25, min_quantity: 10, unit_price: 15.0, supplier: 'TechMed', location: 'Shelf C1', barcode: 'EQP003', notes: '', is_active: true, created_at: '2024-02-01' },
  { id: '4', name: 'Amoxicillin 250mg', category: 'Medicine', unit: 'bottle', quantity: 30, min_quantity: 40, unit_price: 12.0, supplier: 'PharmaCorp', location: 'Shelf A2', expiry_date: '2025-03-15', barcode: 'MED004', notes: '', is_active: true, created_at: '2024-02-15' },
  { id: '5', name: 'Blood Collection Tubes', category: 'Lab Reagent', unit: 'box', quantity: 200, min_quantity: 50, unit_price: 25.0, supplier: 'LabEquip Inc', location: 'Lab Store', expiry_date: '2025-12-31', barcode: 'LAB005', notes: 'EDTA tubes', is_active: true, created_at: '2024-03-01' },
  { id: '6', name: 'Surgical Masks', category: 'Consumable', unit: 'box', quantity: 15, min_quantity: 30, unit_price: 5.0, supplier: 'MedSupply Co', location: 'Store B1', barcode: 'CON006', notes: '3-ply', is_active: true, created_at: '2024-03-10' },
  { id: '7', name: 'IV Cannula 20G', category: 'Surgical Supply', unit: 'pcs', quantity: 150, min_quantity: 50, unit_price: 3.5, supplier: 'SurgicalPlus', location: 'Store D1', expiry_date: '2026-01-15', barcode: 'SUR007', notes: '', is_active: true, created_at: '2024-04-01' },
  { id: '8', name: 'Printer Paper A4', category: 'Stationery', unit: 'pack', quantity: 80, min_quantity: 20, unit_price: 4.0, supplier: 'OfficeMax', location: 'Office Store', barcode: 'STA008', notes: '500 sheets per pack', is_active: true, created_at: '2024-04-15' },
];
