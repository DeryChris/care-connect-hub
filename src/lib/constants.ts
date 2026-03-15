export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'staff';
    designation: 'doctor' | 'nurse' | 'receptionist' | 'lab_technician' | 'pharmacist' | 'admin_staff';
    is_active: boolean;
    permissions?: string[];
    department_id?: string;
    specialization?: string;
    phone?: string;
}