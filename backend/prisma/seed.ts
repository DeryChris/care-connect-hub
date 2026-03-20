// prisma/seed.ts
// Seeds the database with all existing mock data
// Run: npx ts-node prisma/seed.ts  (or: npm run db:seed)

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── 1. System Settings ────────────────────────────────────────────────────
  await prisma.systemSetting.upsert({
    where: { key: "hospital_name" },
    update: {},
    create: { key: "hospital_name", value: "Care Connect Hospital" },
  });
  await prisma.systemSetting.upsert({
    where: { key: "currency" },
    update: {},
    create: { key: "currency", value: "GHS" },
  });
  await prisma.systemSetting.upsert({
    where: { key: "currency_symbol" },
    update: {},
    create: { key: "currency_symbol", value: "₵" },
  });
  await prisma.systemSetting.upsert({
    where: { key: "dark_mode" },
    update: {},
    create: { key: "dark_mode", value: "false" },
  });
  await prisma.systemSetting.upsert({
    where: { key: "appointment_duration" },
    update: {},
    create: { key: "appointment_duration", value: "30" },
  });
  console.log("✓ System settings");

  // ── 2. Departments ────────────────────────────────────────────────────────
  const departments = [
    {
      id: "dept-1",
      name: "Cardiology",
      description: "Heart and cardiovascular system",
      is_active: true,
    },
    {
      id: "dept-2",
      name: "Orthopedics",
      description: "Bones, joints, and musculoskeletal system",
      is_active: true,
    },
    {
      id: "dept-3",
      name: "Neurology",
      description: "Brain and nervous system disorders",
      is_active: true,
    },
    {
      id: "dept-4",
      name: "Pediatrics",
      description: "Medical care for infants and children",
      is_active: true,
    },
    {
      id: "dept-5",
      name: "Dermatology",
      description: "Skin conditions and diseases",
      is_active: false,
    },
    {
      id: "dept-6",
      name: "Emergency",
      description: "Emergency and trauma care",
      is_active: true,
    },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { id: dept.id },
      update: dept,
      create: dept,
    });
  }
  console.log("✓ Departments");

  // ── 3. Users ──────────────────────────────────────────────────────────────
  const defaultPassword = await bcrypt.hash("Password123!", 12);

  const users = [
    {
      id: "user-1",
      name: "Admin User",
      email: "admin@hmis.com",
      password_hash: defaultPassword,
      role: "admin" as const,
      designation: "admin_staff" as const,
      phone: "+1234567890",
      is_active: true,
      permissions: [],
    },
    {
      id: "user-2",
      name: "Dr. Sarah Wilson",
      email: "sarah@hmis.com",
      password_hash: defaultPassword,
      role: "user" as const,
      designation: "doctor" as const,
      phone: "+1234567891",
      is_active: true,
      permissions: ["general", "appointment", "opd", "ipd"],
      department_id: "dept-1",
      specialization: "Cardiology",
      qualification: "MBBS, MD",
      fee: 150,
    },
    {
      id: "user-3",
      name: "Dr. James Chen",
      email: "james@hmis.com",
      password_hash: defaultPassword,
      role: "user" as const,
      designation: "doctor" as const,
      phone: "+1234567892",
      is_active: true,
      permissions: ["general", "appointment", "opd"],
      department_id: "dept-2",
      specialization: "Orthopedics",
      qualification: "MBBS, MS",
      fee: 120,
    },
    {
      id: "user-4",
      name: "Emily Davis",
      email: "emily@hmis.com",
      password_hash: defaultPassword,
      role: "user" as const,
      designation: "nurse" as const,
      phone: "+1234567893",
      is_active: true,
      permissions: ["general", "ipd", "opd"],
    },
    {
      id: "user-5",
      name: "Michael Brown",
      email: "michael@hmis.com",
      password_hash: defaultPassword,
      role: "user" as const,
      designation: "pharmacist" as const,
      phone: "+1234567894",
      is_active: true,
      permissions: ["general", "pharmacy", "inventory"],
    },
    {
      id: "user-6",
      name: "Lisa Anderson",
      email: "lisa@hmis.com",
      password_hash: defaultPassword,
      role: "user" as const,
      designation: "lab_technician" as const,
      phone: "+1234567895",
      is_active: false, // INACTIVE — login should be rejected
      permissions: ["general", "laboratory"],
    },
    {
      id: "user-7",
      name: "Robert Taylor",
      email: "robert@hmis.com",
      password_hash: defaultPassword,
      role: "user" as const,
      designation: "receptionist" as const,
      phone: "+1234567896",
      is_active: true,
      permissions: ["general", "registration", "appointment"],
    },
    {
      id: "user-8",
      name: "Karen Martinez",
      email: "karen@hmis.com",
      password_hash: defaultPassword,
      role: "user" as const,
      designation: "accountant" as const,
      phone: "+1234567897",
      is_active: true,
      permissions: ["general", "billing", "reports"],
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }
  console.log("✓ Users (all passwords: Password123!)");

  // ── 4. Patients ────────────────────────────────────────────────────────────
  const patients = [
    {
      id: "pat-1",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1234567890",
      date_of_birth: "1985-03-15",
      gender: "male" as const,
      blood_group: "O+",
      address: "123 Main St, City",
      emergency_contact: "Jane Smith",
      emergency_phone: "+1234567891",
      insurance_provider: "HealthPlus",
      insurance_number: "HP123456",
      is_active: true,
    },
    {
      id: "pat-2",
      name: "Emily Johnson",
      email: "emily.j@email.com",
      phone: "+1234567892",
      date_of_birth: "1990-07-22",
      gender: "female" as const,
      blood_group: "A+",
      address: "456 Oak Ave, City",
      emergency_contact: "Mike Johnson",
      emergency_phone: "+1234567893",
      insurance_provider: "MedCare",
      insurance_number: "MC789012",
      is_active: true,
    },
    {
      id: "pat-3",
      name: "Michael Brown",
      email: "michael.b@email.com",
      phone: "+1234567894",
      date_of_birth: "1978-11-08",
      gender: "male" as const,
      blood_group: "B+",
      address: "789 Pine Rd, City",
      emergency_contact: "Sarah Brown",
      emergency_phone: "+1234567895",
      is_active: true,
    },
    {
      id: "pat-4",
      name: "Sarah Davis",
      email: "sarah.d@email.com",
      phone: "+1234567896",
      date_of_birth: "1995-05-30",
      gender: "female" as const,
      blood_group: "AB-",
      address: "321 Elm St, City",
      emergency_contact: "Tom Davis",
      emergency_phone: "+1234567897",
      insurance_provider: "HealthPlus",
      insurance_number: "HP345678",
      is_active: true,
    },
    {
      id: "pat-5",
      name: "Robert Wilson",
      email: "robert.w@email.com",
      phone: "+1234567898",
      date_of_birth: "1982-09-12",
      gender: "male" as const,
      blood_group: "O-",
      address: "654 Maple Dr, City",
      emergency_contact: "Lisa Wilson",
      emergency_phone: "+1234567899",
      is_active: false,
    },
    {
      id: "pat-6",
      name: "Jennifer Lee",
      email: "jennifer.l@email.com",
      phone: "+1234567900",
      date_of_birth: "1988-02-28",
      gender: "female" as const,
      blood_group: "A-",
      address: "987 Cedar Ln, City",
      emergency_contact: "David Lee",
      emergency_phone: "+1234567901",
      insurance_provider: "MedCare",
      insurance_number: "MC901234",
      is_active: true,
    },
  ];

  for (const patient of patients) {
    await prisma.patient.upsert({
      where: { id: patient.id },
      update: patient,
      create: patient,
    });
  }
  console.log("✓ Patients");

  // ── 5. Appointments ────────────────────────────────────────────────────────
  const appointments = [
    {
      id: "appt-1",
      patient_id: "pat-1",
      patient_name: "John Smith",
      doctor_id: "user-2",
      doctor_name: "Dr. Sarah Wilson",
      department_id: "dept-1",
      department_name: "Cardiology",
      appointment_date: "2024-12-20",
      appointment_time: "09:00",
      type: "consultation" as const,
      status: "confirmed" as const,
      reason: "Heart checkup",
    },
    {
      id: "appt-2",
      patient_id: "pat-2",
      patient_name: "Emily Johnson",
      doctor_id: "user-3",
      doctor_name: "Dr. James Chen",
      department_id: "dept-2",
      department_name: "Orthopedics",
      appointment_date: "2024-12-20",
      appointment_time: "10:30",
      type: "followup" as const,
      status: "scheduled" as const,
      reason: "Follow-up on knee injury",
    },
    {
      id: "appt-3",
      patient_id: "pat-3",
      patient_name: "Michael Brown",
      doctor_id: "user-2",
      doctor_name: "Dr. Sarah Wilson",
      department_id: "dept-1",
      department_name: "Cardiology",
      appointment_date: "2024-12-21",
      appointment_time: "14:00",
      type: "checkup" as const,
      status: "scheduled" as const,
      reason: "Annual cardiac checkup",
    },
    {
      id: "appt-4",
      patient_id: "pat-4",
      patient_name: "Sarah Davis",
      doctor_id: "user-3",
      doctor_name: "Dr. James Chen",
      department_id: "dept-2",
      department_name: "Orthopedics",
      appointment_date: "2024-12-19",
      appointment_time: "11:00",
      type: "consultation" as const,
      status: "completed" as const,
      reason: "Back pain consultation",
    },
    {
      id: "appt-5",
      patient_id: "pat-6",
      patient_name: "Jennifer Lee",
      doctor_id: "user-2",
      doctor_name: "Dr. Sarah Wilson",
      department_id: "dept-1",
      department_name: "Cardiology",
      appointment_date: "2024-12-22",
      appointment_time: "15:30",
      type: "emergency" as const,
      status: "scheduled" as const,
      reason: "Chest discomfort",
    },
    {
      id: "appt-6",
      patient_id: "pat-1",
      patient_name: "John Smith",
      doctor_id: "user-3",
      doctor_name: "Dr. James Chen",
      department_id: "dept-2",
      department_name: "Orthopedics",
      appointment_date: "2024-12-18",
      appointment_time: "09:30",
      type: "followup" as const,
      status: "cancelled" as const,
      reason: "Knee follow-up",
      notes: "Patient requested cancellation",
    },
  ];

  for (const appt of appointments) {
    await prisma.appointment.upsert({
      where: { id: appt.id },
      update: appt,
      create: appt,
    });
  }
  console.log("✓ Appointments");

  // ── 6. OPD Visits ─────────────────────────────────────────────────────────
  const opdVisits = [
    {
      id: "opd-1",
      patient_id: "pat-1",
      patient_name: "John Smith",
      patient_phone: "+1234567890",
      doctor_id: "user-2",
      doctor_name: "Dr. Sarah Wilson",
      department_id: "dept-1",
      department_name: "Cardiology",
      visit_date: "2024-12-20",
      visit_time: "09:30",
      chief_complaint: "Chest pain and shortness of breath",
      diagnosis: "Mild angina",
      status: "completed" as const,
      vitals: {
        blood_pressure: "120/80",
        temperature: "36.8°C",
        pulse: "72 bpm",
        weight: "75 kg",
      },
      notes: "Follow up in 2 weeks",
    },
    {
      id: "opd-2",
      patient_id: "pat-2",
      patient_name: "Emily Johnson",
      patient_phone: "+1234567892",
      doctor_id: "user-3",
      doctor_name: "Dr. James Chen",
      department_id: "dept-2",
      department_name: "Orthopedics",
      visit_date: "2024-12-20",
      visit_time: "10:30",
      chief_complaint: "Knee pain while walking",
      status: "completed" as const,
      vitals: {
        blood_pressure: "118/78",
        temperature: "36.5°C",
        pulse: "68 bpm",
        weight: "62 kg",
      },
      diagnosis: "Patellofemoral pain syndrome",
    },
    {
      id: "opd-3",
      patient_id: "pat-3",
      patient_name: "Michael Brown",
      patient_phone: "+1234567894",
      doctor_id: "user-2",
      doctor_name: "Dr. Sarah Wilson",
      department_id: "dept-1",
      department_name: "Cardiology",
      visit_date: "2024-12-21",
      visit_time: "11:00",
      chief_complaint: "Regular checkup",
      status: "in_progress" as const,
      vitals: {
        blood_pressure: "125/85",
        temperature: "37.0°C",
        pulse: "76 bpm",
        weight: "80 kg",
      },
    },
    {
      id: "opd-4",
      patient_id: "pat-4",
      patient_name: "Sarah Davis",
      patient_phone: "+1234567896",
      doctor_id: "user-3",
      doctor_name: "Dr. James Chen",
      department_id: "dept-2",
      department_name: "Orthopedics",
      visit_date: "2024-12-21",
      visit_time: "14:00",
      chief_complaint: "Back pain",
      status: "waiting" as const,
    },
    {
      id: "opd-5",
      patient_id: "pat-6",
      patient_name: "Jennifer Lee",
      patient_phone: "+1234567900",
      doctor_id: "user-2",
      doctor_name: "Dr. Sarah Wilson",
      department_id: "dept-1",
      department_name: "Cardiology",
      visit_date: "2024-12-21",
      visit_time: "15:30",
      chief_complaint: "Dizziness and fatigue",
      status: "waiting" as const,
    },
  ];

  for (const visit of opdVisits) {
    await prisma.oPDVisit.upsert({
      where: { id: visit.id },
      update: visit,
      create: visit,
    });
  }
  console.log("✓ OPD Visits");

  // ── 7. IPD Admissions ──────────────────────────────────────────────────────
  const ipdAdmissions = [
    {
      id: "ipd-1",
      patient_id: "pat-1",
      patient_name: "John Smith",
      patient_phone: "+1234567890",
      patient_age: 39,
      patient_gender: "male",
      doctor_id: "user-2",
      doctor_name: "Dr. Sarah Wilson",
      department_id: "dept-1",
      department_name: "Cardiology",
      room_number: "ICU-01",
      bed_number: "Bed 1",
      admission_date: "2024-12-15",
      admission_time: "08:00",
      diagnosis: "Acute myocardial infarction",
      treatment_plan: "Cardiac monitoring, medication",
      status: "in_progress" as const,
      notes: "Stable condition",
    },
    {
      id: "ipd-2",
      patient_id: "pat-3",
      patient_name: "Michael Brown",
      patient_phone: "+1234567894",
      patient_age: 46,
      patient_gender: "male",
      doctor_id: "user-3",
      doctor_name: "Dr. James Chen",
      department_id: "dept-2",
      department_name: "Orthopedics",
      room_number: "WARD-A",
      bed_number: "Bed 5",
      admission_date: "2024-12-18",
      admission_time: "14:30",
      diagnosis: "Hip replacement surgery",
      treatment_plan: "Post-operative care, physiotherapy",
      status: "admitted" as const,
      notes: "Post-surgery Day 2",
    },
    {
      id: "ipd-3",
      patient_id: "pat-5",
      patient_name: "Robert Wilson",
      patient_phone: "+1234567898",
      patient_age: 42,
      patient_gender: "male",
      doctor_id: "user-2",
      doctor_name: "Dr. Sarah Wilson",
      department_id: "dept-1",
      department_name: "Cardiology",
      room_number: "WARD-B",
      bed_number: "Bed 3",
      admission_date: "2024-12-10",
      admission_time: "10:00",
      diagnosis: "Hypertension management",
      treatment_plan: "Blood pressure monitoring, medication adjustment",
      discharge_date: "2024-12-20",
      status: "discharged" as const,
      notes: "Discharged in stable condition",
    },
    {
      id: "ipd-4",
      patient_id: "pat-2",
      patient_name: "Emily Johnson",
      patient_phone: "+1234567892",
      patient_age: 34,
      patient_gender: "female",
      doctor_id: "user-3",
      doctor_name: "Dr. James Chen",
      department_id: "dept-2",
      department_name: "Orthopedics",
      room_number: "WARD-A",
      bed_number: "Bed 2",
      admission_date: "2024-12-19",
      admission_time: "16:00",
      diagnosis: "Fracture of tibia",
      treatment_plan: "Surgery scheduled, pain management",
      status: "admitted" as const,
      notes: "Awaiting surgery",
    },
  ];

  for (const admission of ipdAdmissions) {
    await prisma.iPDAdmission.upsert({
      where: { id: admission.id },
      update: admission,
      create: admission,
    });
  }
  console.log("✓ IPD Admissions");

  // ── 8. Laboratory Tests ────────────────────────────────────────────────────
  const labTests = [
    {
      id: "lab-1",
      patient_id: "pat-1",
      patient_name: "John Smith",
      test_name: "Complete Blood Count",
      test_code: "CBC001",
      category: "Hematology",
      status: "completed" as const,
      result: "All values normal",
      result_value: "14.5",
      result_unit: "g/dL",
      reference_range: "12.0-17.5",
      result_status: "normal" as const,
      ordered_by: "user-2",
      ordered_by_name: "Dr. Sarah Wilson",
      collected_at: "2024-12-15 09:00",
      completed_at: "2024-12-15 14:00",
    },
    {
      id: "lab-2",
      patient_id: "pat-2",
      patient_name: "Emily Johnson",
      test_name: "Blood Glucose Test",
      test_code: "GLU001",
      category: "Biochemistry",
      status: "completed" as const,
      result: "Elevated sugar level",
      result_value: "142",
      result_unit: "mg/dL",
      reference_range: "70-100",
      result_status: "abnormal" as const,
      ordered_by: "user-3",
      ordered_by_name: "Dr. James Chen",
      collected_at: "2024-12-16 10:00",
      completed_at: "2024-12-16 12:00",
    },
    {
      id: "lab-3",
      patient_id: "pat-3",
      patient_name: "Michael Brown",
      test_name: "Lipid Profile",
      test_code: "LIP001",
      category: "Biochemistry",
      status: "processing" as const,
      ordered_by: "user-2",
      ordered_by_name: "Dr. Sarah Wilson",
      collected_at: "2024-12-17 08:30",
    },
    {
      id: "lab-4",
      patient_id: "pat-4",
      patient_name: "Sarah Davis",
      test_name: "Thyroid Function Test",
      test_code: "THY001",
      category: "Biochemistry",
      status: "sample_collected" as const,
      ordered_by: "user-3",
      ordered_by_name: "Dr. James Chen",
      collected_at: "2024-12-18 09:15",
    },
    {
      id: "lab-5",
      patient_id: "pat-6",
      patient_name: "Jennifer Lee",
      test_name: "Liver Function Test",
      test_code: "LFT001",
      category: "Biochemistry",
      status: "pending" as const,
      ordered_by: "user-2",
      ordered_by_name: "Dr. Sarah Wilson",
    },
    {
      id: "lab-6",
      patient_id: "pat-1",
      patient_name: "John Smith",
      test_name: "Urinalysis",
      test_code: "URI001",
      category: "Pathology",
      status: "completed" as const,
      result: "Normal",
      result_value: "Normal",
      result_unit: "",
      reference_range: "Normal",
      result_status: "normal" as const,
      ordered_by: "user-2",
      ordered_by_name: "Dr. Sarah Wilson",
      collected_at: "2024-12-15 09:30",
      completed_at: "2024-12-15 15:00",
    },
  ];

  for (const test of labTests) {
    await prisma.laboratoryTest.upsert({
      where: { id: test.id },
      update: test,
      create: test,
    });
  }
  console.log("✓ Laboratory Tests");

  // ── 9. Radiology Requests ─────────────────────────────────────────────────
  const radiologyRequests = [
    {
      id: "rad-1",
      patient_id: "pat-1",
      patient_name: "John Smith",
      patient_age: 39,
      patient_gender: "male",
      doctor_id: "user-2",
      doctor_name: "Dr. Sarah Wilson",
      radiology_type: "xray" as const,
      examination: "Chest X-Ray",
      clinical_history: "Chest pain, shortness of breath",
      status: "completed" as const,
      appointment_date: "2024-12-16",
      appointment_time: "10:00",
      report: "Available",
      findings:
        "No acute cardiopulmonary abnormality. Heart size normal. Lungs are clear.",
      impression: "Normal chest radiograph",
      completed_at: "2024-12-16 11:30",
    },
    {
      id: "rad-2",
      patient_id: "pat-2",
      patient_name: "Emily Johnson",
      patient_age: 34,
      patient_gender: "female",
      doctor_id: "user-3",
      doctor_name: "Dr. James Chen",
      radiology_type: "ultrasound" as const,
      examination: "Knee Ultrasound",
      clinical_history: "Knee pain and swelling",
      status: "scheduled" as const,
      appointment_date: "2024-12-22",
      appointment_time: "09:00",
    },
    {
      id: "rad-3",
      patient_id: "pat-3",
      patient_name: "Michael Brown",
      patient_age: 46,
      patient_gender: "male",
      doctor_id: "user-2",
      doctor_name: "Dr. Sarah Wilson",
      radiology_type: "ct_scan" as const,
      examination: "CT Angiography",
      clinical_history: "Suspected coronary artery disease",
      status: "in_progress" as const,
      appointment_date: "2024-12-21",
      appointment_time: "14:00",
    },
    {
      id: "rad-4",
      patient_id: "pat-4",
      patient_name: "Sarah Davis",
      patient_age: 29,
      patient_gender: "female",
      doctor_id: "user-3",
      doctor_name: "Dr. James Chen",
      radiology_type: "mri" as const,
      examination: "Lumbar Spine MRI",
      clinical_history: "Chronic lower back pain",
      status: "pending" as const,
    },
    {
      id: "rad-5",
      patient_id: "pat-6",
      patient_name: "Jennifer Lee",
      patient_age: 36,
      patient_gender: "female",
      doctor_id: "user-2",
      doctor_name: "Dr. Sarah Wilson",
      radiology_type: "mammography" as const,
      examination: "Diagnostic Mammogram",
      clinical_history: "Breast lump suspected",
      status: "completed" as const,
      appointment_date: "2024-12-18",
      appointment_time: "11:00",
      findings: "No suspicious lesions detected. BI-RADS 1.",
      impression: "Normal mammogram",
      completed_at: "2024-12-18 12:00",
    },
  ];

  for (const req of radiologyRequests) {
    await prisma.radiologyRequest.upsert({
      where: { id: req.id },
      update: req,
      create: req,
    });
  }
  console.log("✓ Radiology Requests");

  // ── 10. Pharmacy Items ────────────────────────────────────────────────────
  const pharmacyItems = [
    {
      id: "ph-1",
      name: "Paracetamol 500mg",
      generic_name: "Acetaminophen",
      category: "Medicine",
      unit: "strip",
      quantity: 500,
      min_quantity: 100,
      unit_price: 2.5,
      supplier: "PharmaCorp",
      location: "Shelf A1",
      expiry_date: "2025-06-30",
      barcode: "PHA001",
      dosage: "500mg",
      notes: "Pain reliever",
      is_active: true,
    },
    {
      id: "ph-2",
      name: "Amoxicillin 250mg",
      generic_name: "Amoxicillin",
      category: "Medicine",
      unit: "bottle",
      quantity: 30,
      min_quantity: 40,
      unit_price: 12.0,
      supplier: "PharmaCorp",
      location: "Shelf A2",
      expiry_date: "2025-03-15",
      barcode: "PHA002",
      dosage: "250mg",
      notes: "Antibiotic",
      is_active: true,
    },
    {
      id: "ph-3",
      name: "Ibuprofen 400mg",
      generic_name: "Ibuprofen",
      category: "Medicine",
      unit: "strip",
      quantity: 200,
      min_quantity: 50,
      unit_price: 3.0,
      supplier: "MedSupply Co",
      location: "Shelf A3",
      expiry_date: "2025-08-20",
      barcode: "PHA003",
      dosage: "400mg",
      notes: "Anti-inflammatory",
      is_active: true,
    },
    {
      id: "ph-4",
      name: "Cetirizine 10mg",
      generic_name: "Cetirizine",
      category: "Medicine",
      unit: "strip",
      quantity: 150,
      min_quantity: 30,
      unit_price: 4.5,
      supplier: "PharmaCorp",
      location: "Shelf B1",
      expiry_date: "2025-12-31",
      barcode: "PHA004",
      dosage: "10mg",
      notes: "Antihistamine",
      is_active: true,
    },
    {
      id: "ph-5",
      name: "Metformin 500mg",
      generic_name: "Metformin",
      category: "Medicine",
      unit: "bottle",
      quantity: 25,
      min_quantity: 30,
      unit_price: 18.0,
      supplier: "PharmaCorp",
      location: "Shelf B2",
      expiry_date: "2025-04-30",
      barcode: "PHA005",
      dosage: "500mg",
      notes: "Diabetes medication",
      is_active: true,
    },
    {
      id: "ph-6",
      name: "Aspirin 75mg",
      generic_name: "Aspirin",
      category: "Medicine",
      unit: "strip",
      quantity: 80,
      min_quantity: 20,
      unit_price: 5.0,
      supplier: "MedSupply Co",
      location: "Shelf B3",
      expiry_date: "2025-09-15",
      barcode: "PHA006",
      dosage: "75mg",
      notes: "Blood thinner",
      is_active: true,
    },
    {
      id: "ph-7",
      name: "Omeprazole 20mg",
      generic_name: "Omeprazole",
      category: "Medicine",
      unit: "strip",
      quantity: 100,
      min_quantity: 25,
      unit_price: 8.0,
      supplier: "PharmaCorp",
      location: "Shelf C1",
      expiry_date: "2025-07-31",
      barcode: "PHA007",
      dosage: "20mg",
      notes: "Acid reducer",
      is_active: true,
    },
    {
      id: "ph-8",
      name: "Amoxicillin Injection",
      generic_name: "Amoxicillin",
      category: "Injection",
      unit: "vial",
      quantity: 45,
      min_quantity: 20,
      unit_price: 15.0,
      supplier: "MedSupply Co",
      location: "Fridge F1",
      expiry_date: "2025-02-28",
      barcode: "PHA008",
      dosage: "500mg",
      notes: "IV/IM injection",
      is_active: true,
    },
  ];

  for (const item of pharmacyItems) {
    await prisma.pharmacyItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
  console.log("✓ Pharmacy Items");

  // ── 11. Inventory Items ────────────────────────────────────────────────────
  const inventoryItems = [
    {
      id: "inv-1",
      name: "Paracetamol 500mg",
      category: "Medicine",
      unit: "strip",
      quantity: 500,
      min_quantity: 100,
      unit_price: 2.5,
      supplier: "PharmaCorp",
      location: "Shelf A1",
      expiry_date: "2025-06-30",
      barcode: "MED001",
      notes: "",
      is_active: true,
    },
    {
      id: "inv-2",
      name: "Surgical Gloves (L)",
      category: "Consumable",
      unit: "box",
      quantity: 45,
      min_quantity: 50,
      unit_price: 8.0,
      supplier: "MedSupply Co",
      location: "Store B2",
      barcode: "CON002",
      notes: "Latex-free",
      is_active: true,
    },
    {
      id: "inv-3",
      name: "Digital Thermometer",
      category: "Equipment",
      unit: "pcs",
      quantity: 25,
      min_quantity: 10,
      unit_price: 15.0,
      supplier: "TechMed",
      location: "Shelf C1",
      barcode: "EQP003",
      notes: "",
      is_active: true,
    },
    {
      id: "inv-4",
      name: "Amoxicillin 250mg",
      category: "Medicine",
      unit: "bottle",
      quantity: 30,
      min_quantity: 40,
      unit_price: 12.0,
      supplier: "PharmaCorp",
      location: "Shelf A2",
      expiry_date: "2025-03-15",
      barcode: "MED004",
      notes: "",
      is_active: true,
    },
    {
      id: "inv-5",
      name: "Blood Collection Tubes",
      category: "Lab Reagent",
      unit: "box",
      quantity: 200,
      min_quantity: 50,
      unit_price: 25.0,
      supplier: "LabEquip Inc",
      location: "Lab Store",
      expiry_date: "2025-12-31",
      barcode: "LAB005",
      notes: "EDTA tubes",
      is_active: true,
    },
    {
      id: "inv-6",
      name: "Surgical Masks",
      category: "Consumable",
      unit: "box",
      quantity: 15,
      min_quantity: 30,
      unit_price: 5.0,
      supplier: "MedSupply Co",
      location: "Store B1",
      barcode: "CON006",
      notes: "3-ply",
      is_active: true,
    },
    {
      id: "inv-7",
      name: "IV Cannula 20G",
      category: "Surgical Supply",
      unit: "pcs",
      quantity: 150,
      min_quantity: 50,
      unit_price: 3.5,
      supplier: "SurgicalPlus",
      location: "Store D1",
      expiry_date: "2026-01-15",
      barcode: "SUR007",
      notes: "",
      is_active: true,
    },
    {
      id: "inv-8",
      name: "Printer Paper A4",
      category: "Stationery",
      unit: "pack",
      quantity: 80,
      min_quantity: 20,
      unit_price: 4.0,
      supplier: "OfficeMax",
      location: "Office Store",
      barcode: "STA008",
      notes: "500 sheets per pack",
      is_active: true,
    },
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
  console.log("✓ Inventory Items");

  // ── 12. Billing Invoices ───────────────────────────────────────────────────
  const invoices = [
    {
      id: "bill-1",
      patient_id: "pat-1",
      patient_name: "John Smith",
      patient_phone: "+1234567890",
      invoice_number: "INV-2024-001",
      billing_type: "ipd" as const,
      subtotal: 3950,
      discount: 200,
      tax: 300,
      total: 4050,
      amount_paid: 4050,
      status: "paid" as const,
      paid_at: "2024-12-20",
      items: [
        {
          id: "bi-1",
          description: "ICU Room Charge (5 days)",
          quantity: 5,
          unit_price: 500,
          total: 2500,
        },
        {
          id: "bi-2",
          description: "Cardiac Monitoring",
          quantity: 5,
          unit_price: 200,
          total: 1000,
        },
        {
          id: "bi-3",
          description: "Consultation Fee",
          quantity: 3,
          unit_price: 150,
          total: 450,
        },
      ],
    },
    {
      id: "bill-2",
      patient_id: "pat-2",
      patient_name: "Emily Johnson",
      patient_phone: "+1234567892",
      invoice_number: "INV-2024-002",
      billing_type: "consultation" as const,
      subtotal: 315,
      discount: 0,
      tax: 25,
      total: 340,
      amount_paid: 0,
      status: "pending" as const,
      due_date: "2024-12-27",
      items: [
        {
          id: "bi-4",
          description: "Consultation Fee - Dr. James Chen",
          quantity: 1,
          unit_price: 120,
          total: 120,
        },
        {
          id: "bi-5",
          description: "X-Ray - Knee",
          quantity: 1,
          unit_price: 150,
          total: 150,
        },
        {
          id: "bi-6",
          description: "Pain Medication",
          quantity: 1,
          unit_price: 45,
          total: 45,
        },
      ],
    },
    {
      id: "bill-3",
      patient_id: "pat-3",
      patient_name: "Michael Brown",
      patient_phone: "+1234567894",
      invoice_number: "INV-2024-003",
      billing_type: "ipd" as const,
      subtotal: 7200,
      discount: 500,
      tax: 600,
      total: 7300,
      amount_paid: 3650,
      status: "partial" as const,
      items: [
        {
          id: "bi-7",
          description: "Ward Room Charge (3 days)",
          quantity: 3,
          unit_price: 300,
          total: 900,
        },
        {
          id: "bi-8",
          description: "Hip Surgery",
          quantity: 1,
          unit_price: 5000,
          total: 5000,
        },
        {
          id: "bi-9",
          description: "Anesthesia",
          quantity: 1,
          unit_price: 800,
          total: 800,
        },
        {
          id: "bi-10",
          description: "Physiotherapy Sessions",
          quantity: 5,
          unit_price: 100,
          total: 500,
        },
      ],
    },
  ];

  for (const invoice of invoices) {
    const { items, ...invoiceData } = invoice;
    await prisma.billingInvoice.upsert({
      where: { id: invoice.id },
      update: { ...invoiceData, items: { deleteMany: {}, create: items } },
      create: { ...invoiceData, items: { create: items } },
    });
  }
  console.log("✓ Billing Invoices");

  // ── 13. Tasks ─────────────────────────────────────────────────────────────
  const tasks = [
    {
      id: "task-1",
      title: "Update patient records system",
      description: "Migrate old records to new digital format",
      module: "registration",
      priority: "high" as const,
      status: "in_progress" as const,
      due_date: "2024-12-30",
      assigned_to: "user-4",
      assigned_to_name: "Emily Davis",
      assigned_by: "user-1",
      assigned_by_name: "Admin User",
    },
    {
      id: "task-2",
      title: "Inventory audit for pharmacy",
      description: "Quarterly stock verification",
      module: "inventory",
      priority: "medium" as const,
      status: "pending" as const,
      due_date: "2024-12-15",
      assigned_to: "user-5",
      assigned_to_name: "Michael Brown",
      assigned_by: "user-1",
      assigned_by_name: "Admin User",
    },
    {
      id: "task-3",
      title: "Lab equipment calibration",
      description: "Calibrate all lab instruments",
      module: "laboratory",
      priority: "urgent" as const,
      status: "pending" as const,
      due_date: "2024-12-05",
      assigned_to: "user-6",
      assigned_to_name: "Lisa Anderson",
      assigned_by: "user-2",
      assigned_by_name: "Dr. Sarah Wilson",
    },
    {
      id: "task-4",
      title: "Staff training on new billing",
      description: "Train accounting team on updated billing software",
      module: "billing",
      priority: "low" as const,
      status: "completed" as const,
      assigned_to: "user-8",
      assigned_to_name: "Karen Martinez",
      assigned_by: "user-1",
      assigned_by_name: "Admin User",
    },
    {
      id: "task-5",
      title: "Setup appointment reminders",
      description: "Configure SMS reminder system for appointments",
      module: "appointment",
      priority: "medium" as const,
      status: "in_progress" as const,
      assigned_to: "user-7",
      assigned_to_name: "Robert Taylor",
      assigned_by: "user-1",
      assigned_by_name: "Admin User",
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: task,
      create: task,
    });
  }
  console.log("✓ Tasks");

  // ── 14. Knowledge Articles (first 5 as samples — add rest similarly) ────────
  const knowledgeArticles = [
    {
      id: "ka-1",
      title: "Hypertension Management Protocol",
      category: "protocol" as const,
      tags: ["cardiology", "hypertension", "guideline"],
      content: `## Initial Assessment\n1. Measure BP (both arms, 2 readings)\n2. Fundoscopy for retinopathy\n3. Assess end-organ damage\n\n## Target BP\n- <60yrs: <130/80 mmHg\n- ≥60yrs: <150/90 mmHg\n\n## First Line Drugs\n- ACEI/ARB + CCB\n- Thiazide diuretic\n\n## Follow-up\n- 1 week if BP >180/110\n- 1 month otherwise`,
      author_id: "user-2",
      author_name: "Dr. Sarah Wilson",
      status: "approved" as const,
      version: 3,
      views: 245,
      department_id: "dept-1",
    },
    {
      id: "ka-2",
      title: "Acute Asthma Exacerbation",
      category: "protocol" as const,
      tags: ["emergency", "respiratory", "asthma"],
      content: `## Assessment\nFEV1 or PEF <50% predicted = Moderate/Severe\n\n## Treatment\n**Oxygen**: Maintain SaO2 ≥92%\n**Salbutamol**: 4-8 puffs q20min x3\n**Ipratropium**: 8 puffs q20min x3\n**Steroids**: Prednisolone 40-50mg oral\n\n## Admit Criteria\n- PEF <75% 1hr post treatment\n- RR >25, HR >120\n- SaO2 <92% on air`,
      author_id: "user-6",
      author_name: "Emergency Dept",
      status: "approved" as const,
      version: 2,
      views: 189,
      department_id: "dept-6",
    },
    {
      id: "ka-3",
      title: "Hand Hygiene SOP",
      category: "sop" as const,
      tags: ["infection-control", "hygiene", "who"],
      content: `## WHO 5 Moments\n1. Before touching a patient\n2. Before clean/aseptic procedure\n3. After body fluid exposure risk\n4. After touching a patient\n5. After touching patient surroundings\n\n## Technique (20-30 seconds)\n1. Wet hands with water\n2. Apply soap (palm to palm)\n3. Right palm over left dorsum (vice versa)\n4. Palm to palm fingers interlaced\n5. Backs of fingers to opposing palms\n6. Rotational rubbing of thumbs\n7. Rinse and dry`,
      author_id: "user-1",
      author_name: "Admin User",
      status: "approved" as const,
      version: 5,
      views: 534,
    },
    {
      id: "ka-4",
      title: "Sepsis Management Bundle",
      category: "protocol" as const,
      tags: ["sepsis", "emergency", "criticalcare"],
      content: `## Hour-1 Bundle\n**Measure** lactate\n**Blood cultures** prior antibiotics\n**Broad spectrum** antibiotics\n**Fluids** 30ml/kg crystalloid\n\n## Repeat lactate 2-4hrs\nLactate clearance <10% → escalate\n\n## Vasopressors\nNorepinephrine if MAP <65 despite fluids\n\n## Source Control\nIdentify and remove source within 6-12hrs`,
      author_id: "user-1",
      author_name: "Admin User",
      status: "approved" as const,
      version: 2,
      views: 312,
      department_id: "dept-6",
    },
    {
      id: "ka-5",
      title: "CPR and Basic Life Support",
      category: "training" as const,
      tags: ["cpr", "bls", "resuscitation", "acls"],
      content: `## Adult BLS Algorithm\n1. Check safety\n2. Check response (shake and shout)\n3. Call for help / activate emergency system\n4. Open airway (head-tilt chin-lift)\n5. Check breathing (10 seconds max)\n6. If not breathing: start CPR\n\n## CPR Technique\n- **Rate**: 100-120 compressions/min\n- **Depth**: 5-6cm\n- **Recoil**: Allow full chest recoil\n- **Ratio**: 30 compressions : 2 breaths`,
      author_id: "user-4",
      author_name: "Emily Davis",
      status: "approved" as const,
      version: 4,
      views: 487,
      department_id: "dept-6",
    },
  ];

  for (const article of knowledgeArticles) {
    await prisma.knowledgeArticle.upsert({
      where: { id: article.id },
      update: article,
      create: article,
    });
  }
  console.log(
    "✓ Knowledge Articles (5 sample articles — add remaining 50 from mock-knowledge.ts)",
  );

  // ── 15. Documents ─────────────────────────────────────────────────────────
  // const documents = [
  //   { id: 'doc-1', title: 'COVID-19 Treatment Protocol v2.3', filename: 'COVID19_Protocol_v2.3.pdf', file_path: 'documents/COVID19_Protocol_v2.3.pdf', category: 'protocol' as const, size: '1.2 MB', mime_type: 'application/pdf', uploaded_by: 'user-2', uploaded_by_name: 'Dr. Sarah Wilson', status: 'approved' as const, views: 247, downloads: 89, tags: ['covid', 'protocol', 'treatment', 'respiratory'], department_id: 'dept-1' },
  //   { id: 'doc-2', title: 'Hypertension Management Guideline', filename: 'Hypertension_Guideline_2024.pdf', file_path: 'documents/Hypertension_Guideline_2024.pdf', category: 'guideline' as const, size: '892 KB', mime_type: 'application/pdf', uploaded_by: 'user-3', uploaded_by_name: 'Dr. James Chen', status: 'approved' as const, views: 156, downloads: 42, tags: ['hypertension', 'cardiology', 'guideline'], department_id: 'dept-1' },
  //   { id: 'doc-3', title: 'Emergency Department SOP', filename: 'Emergency_SOP_v1.8.docx', file_path: 'documents/Emergency_SOP_v1.8.docx', category: 'sop' as const, size: '345 KB', mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploaded_by: 'user-1', uploaded_by_name: 'Admin User', status: 'approved' as const, views: 89, downloads: 23, tags: ['emergency', 'sop', 'triage'], department_id: 'dept-6' },
  //   { id: 'doc-4', title: 'Nursing Procedures Manual', filename: 'Nursing_Manual_2024.pdf', file_path: 'documents/Nursing_Manual_2024.pdf', category: 'manual' as const, size: '4.8 MB', mime_type: 'application/pdf', uploaded_by: 'user-4', uploaded_by_name: 'Emily Davis', status: 'approved' as const, views: 134, downloads: 56, tags: ['nursing', 'manual', 'procedure'] },
  //   { id: 'doc-5', title: 'ECG Interpretation Guide', filename: 'ECG_Guide_v3.2.pdf', file_path: 'documents/ECG_Guide_v3.2.pdf', category: 'training' as const, size: '1.8 MB', mime_type: 'application/pdf', uploaded_by: 'user-2', uploaded_by_name: 'Dr. Sarah Wilson', status: 'approved' as const, views: 78, downloads: 19, tags: ['ecg', 'cardiology', 'training'], department_id: 'dept-1' },
  // ];

  const documents = [
    {
      id: "doc-1",
      title: "COVID-19 Treatment Protocol v2.3",
      filename: "COVID19_Protocol_v2.3.pdf",
      file_path: "documents/COVID19_Protocol_v2.3.pdf",
      category: "protocol" as const,
      size: "1.2 MB",
      mime_type: "application/pdf",
      uploaded_by: "user-2",
      uploaded_by_name: "Dr. Sarah Wilson",
      status: "approved" as const,
      views: 247,
      downloads: 89,
      tags: ["covid", "protocol", "treatment", "respiratory"],
      department_id: "dept-1",
      content:
        "This document outlines the updated treatment protocol for COVID-19, including antiviral therapies, respiratory support, and patient management strategies based on the latest clinical evidence.",
    },
    {
      id: "doc-2",
      title: "Hypertension Management Guideline",
      filename: "Hypertension_Guideline_2024.pdf",
      file_path: "documents/Hypertension_Guideline_2024.pdf",
      category: "guideline" as const,
      size: "892 KB",
      mime_type: "application/pdf",
      uploaded_by: "user-3",
      uploaded_by_name: "Dr. James Chen",
      status: "approved" as const,
      views: 156,
      downloads: 42,
      tags: ["hypertension", "cardiology", "guideline"],
      department_id: "dept-1",
      content:
        "Comprehensive guidelines for the diagnosis and management of hypertension, including lifestyle modifications, pharmacological treatments, and monitoring recommendations for adult patients.",
    },
    {
      id: "doc-3",
      title: "Emergency Department SOP",
      filename: "Emergency_SOP_v1.8.docx",
      file_path: "documents/Emergency_SOP_v1.8.docx",
      category: "sop" as const,
      size: "345 KB",
      mime_type:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      uploaded_by: "user-1",
      uploaded_by_name: "Admin User",
      status: "approved" as const,
      views: 89,
      downloads: 23,
      tags: ["emergency", "sop", "triage"],
      department_id: "dept-6",
      content:
        "Standard operating procedures for emergency department operations, covering triage protocols, patient flow, emergency response, and coordination with other departments during critical situations.",
    },
    {
      id: "doc-4",
      title: "Nursing Procedures Manual",
      filename: "Nursing_Manual_2024.pdf",
      file_path: "documents/Nursing_Manual_2024.pdf",
      category: "manual" as const,
      size: "4.8 MB",
      mime_type: "application/pdf",
      uploaded_by: "user-4",
      uploaded_by_name: "Emily Davis",
      status: "approved" as const,
      views: 134,
      downloads: 56,
      tags: ["nursing", "manual", "procedure"],
      content:
        "A comprehensive manual detailing nursing procedures, including patient assessment, medication administration, wound care, and infection control practices for all hospital units.",
    },
    {
      id: "doc-5",
      title: "ECG Interpretation Guide",
      filename: "ECG_Guide_v3.2.pdf",
      file_path: "documents/ECG_Guide_v3.2.pdf",
      category: "training" as const,
      size: "1.8 MB",
      mime_type: "application/pdf",
      uploaded_by: "user-2",
      uploaded_by_name: "Dr. Sarah Wilson",
      status: "approved" as const,
      views: 78,
      downloads: 19,
      tags: ["ecg", "cardiology", "training"],
      department_id: "dept-1",
      content:
        "A training guide for interpreting electrocardiograms (ECGs), covering normal sinus rhythm, arrhythmias, ischemic changes, and other common cardiac findings with illustrative examples.",
    },
  ];

  for (const doc of documents) {
    await prisma.document.upsert({
      where: { id: doc.id },
      update: doc,
      create: doc,
    });
  }
  console.log("✓ Documents");

  // ── 16. Wiki Pages ────────────────────────────────────────────────────────
  const wikiPages = [
    {
      id: "wiki-1",
      title: "Hospital Overview",
      author_id: "user-1",
      author: "Admin User",
      content: `## Care Connect Hospital\n\nWelcome to the internal wiki. This is the central knowledge hub for hospital staff.\n\n## Quick Links\n- [Protocols & Guidelines](/knowledge)\n- [Document Library](/documents)\n- [Staff Directory](/users)\n\n## Mission\nTo provide exceptional patient care through evidence-based practice, continuous learning, and collaborative teamwork.\n\n## Key Contacts\n| Department | Extension |\n|------------|-----------|\n| Emergency | Ext. 100 |\n| ICU | Ext. 200 |\n| Pharmacy | Ext. 300 |\n| Lab | Ext. 400 |`,
    },
    {
      id: "wiki-2",
      title: "IT Systems Guide",
      author_id: "user-1",
      author: "Admin User",
      content: `## Systems Overview\n\n### HMIS (Hospital Management Information System)\nThe main system for patient records, appointments, lab results, and billing.\n\n**Login**: Use your hospital email and assigned password.\n**Password Reset**: Contact IT at Ext. 500 or it@hmis.com\n\n### Email\n- Webmail: https://mail.hospital.local\n- All clinical communication must use hospital email only`,
    },
    {
      id: "wiki-3",
      title: "Pharmacy Formulary Summary",
      author_id: "user-5",
      author: "Michael Brown",
      content: `## Approved Formulary Categories\n\n### Analgesics\n- Paracetamol 500mg/1g tablets, IV\n- Ibuprofen 200mg/400mg\n- Morphine 10mg/ml injection, oral solution\n\n### Antibiotics (Common)\n- Amoxicillin 250mg/500mg\n- Co-amoxiclav 625mg tablets, 1.2g IV`,
    },
  ];

  for (const page of wikiPages) {
    await prisma.wikiPage.upsert({
      where: { id: page.id },
      update: page,
      create: page,
    });
  }
  console.log("✓ Wiki Pages");

  // ── 17. Comments ──────────────────────────────────────────────────────────
  // Seed a few sample comments — add more as needed
  const comments = [
    {
      id: "cmt-1",
      target_type: "knowledge" as const,
      target_id: "ka-1",
      author_id: "user-3",
      author_name: "Dr. James Chen",
      author_role: "doctor",
      message:
        "Great article — the overview and treatment pathway are concise and practical.",
      created_at: new Date("2024-12-05T11:20:00"),
    },
    {
      id: "cmt-2",
      target_type: "knowledge" as const,
      target_id: "ka-2",
      author_id: "user-4",
      author_name: "Emily Davis",
      author_role: "nurse",
      message:
        "This was useful during rounds; consider adding one more note on escalation criteria later.",
      created_at: new Date("2024-12-06T09:00:00"),
    },
    {
      id: "cmt-3",
      target_type: "document" as const,
      target_id: "doc-1",
      author_id: "user-2",
      author_name: "Dr. Sarah Wilson",
      author_role: "doctor",
      message:
        "Helpful reference for daily clinical work — the steps are clear and easy to follow.",
      created_at: new Date("2024-12-10T09:15:00"),
    },
    {
      id: "cmt-4",
      target_type: "wiki" as const,
      target_id: "wiki-1",
      author_id: "user-7",
      author_name: "Robert Taylor",
      author_role: "receptionist",
      message:
        "This overview is very clear. Is there a plan to add a section for the new cardiology wing?",
      created_at: new Date("2024-12-02T16:00:00"),
    },
  ];

  for (const comment of comments) {
    await prisma.contentComment.upsert({
      where: { id: comment.id },
      update: comment,
      create: comment,
    });
  }
  console.log("✓ Comments");

  console.log("\n🎉 Seeding complete!");
  console.log("📝 Note: All users have password: Password123!");
  console.log(
    "📝 Note: Lisa Anderson (lisa@hmis.com) is inactive — login will be rejected",
  );
  console.log(
    "📝 Note: Add remaining 50 knowledge articles from mock-knowledge.ts as needed",
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
