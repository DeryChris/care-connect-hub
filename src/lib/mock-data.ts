import { User } from './constants';

export const mockUsers: User[] = [
  { id: '1', name: 'Dr. John Doe', email: 'admin@hmis.com', role: 'admin', designation: 'doctor', is_active: true, permissions: ['read:patient', 'write:patient'], department_id: '1', specialization: 'Cardiology' },
  { id: '2', name: 'Dr. Sarah Wilson', email: 'sarah@hmis.com', role: 'staff', designation: 'doctor', is_active: true, permissions: ['read:patient'], department_id: '1', specialization: 'Cardiology' },
  { id: '3', name: 'Nurse Jane Smith', email: 'jane@hmis.com', role: 'staff', designation: 'nurse', is_active: true, department_id: '1' },
  { id: '4', name: 'Receptionist Bob', email: 'bob@hmis.com', role: 'staff', designation: 'receptionist', is_active: true, department_id: '1' },
  { id: '5', name: 'Lab Tech Mike', email: 'mike@hmis.com', role: 'staff', designation: 'lab_technician', is_active: false, department_id: '5' },
  { id: '6', name: 'Pharmacist Amy', email: 'amy@hmis.com', role: 'staff', designation: 'pharmacist', is_active: true, department_id: '6' },
  { id: '7', name: 'Admin Staff Rob', email: 'rob@hmis.com', role: 'staff', designation: 'admin_staff', is_active: true, department_id: '7' },
];

export const mockDepartments = [
    { id: '1', name: 'Cardiology', description: 'Heart and vascular care', is_active: true, staff_count: 10 },
    { id: '2', name: 'Orthopedics', description: 'Bone and joint care', is_active: true, staff_count: 8 },
    { id: '3', name: 'Neurology', description: 'Brain and nervous system', is_active: true, staff_count: 7 },
    { id: '4', name: 'Pediatrics', description: 'Child healthcare', is_active: true, staff_count: 12 },
    { id: '5', name: 'Laboratory', description: 'Diagnostic testing', is_active: true, staff_count: 5 },
    { id: '6', name: 'Pharmacy', description: 'Medication dispensing', is_active: true, staff_count: 4 },
    { id: '7', name: 'Administration', description: 'Hospital management', is_active: true, staff_count: 6 },
];