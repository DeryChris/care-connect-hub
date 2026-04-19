-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "Designation" AS ENUM ('doctor', 'nurse', 'receptionist', 'lab_technician', 'radiologist', 'pharmacist', 'accountant', 'hr_officer', 'data_entry', 'it_staff', 'admin_staff', 'employee');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('consultation', 'followup', 'emergency', 'checkup');

-- CreateEnum
CREATE TYPE "LabTestStatus" AS ENUM ('pending', 'sample_collected', 'processing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "LabTestResult" AS ENUM ('normal', 'abnormal', 'critical');

-- CreateEnum
CREATE TYPE "RadiologyStatus" AS ENUM ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "RadiologyType" AS ENUM ('xray', 'ultrasound', 'ct_scan', 'mri', 'mammography', 'angiography', 'other');

-- CreateEnum
CREATE TYPE "OPDStatus" AS ENUM ('waiting', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "IPDStatus" AS ENUM ('admitted', 'in_progress', 'discharged', 'transferred');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('pending', 'paid', 'partial', 'cancelled', 'refunded');

-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('consultation', 'laboratory', 'radiology', 'pharmacy', 'ipd', 'procedure', 'other');

-- CreateEnum
CREATE TYPE "KnowledgeCategory" AS ENUM ('protocol', 'guideline', 'sop', 'drug_info', 'training', 'administrative');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'review', 'approved', 'rejected', 'archived');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('protocol', 'guideline', 'sop', 'manual', 'training', 'report');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "CommentTargetType" AS ENUM ('document', 'knowledge', 'wiki');

-- CreateEnum
CREATE TYPE "InventoryTxType" AS ENUM ('in', 'out', 'adjustment');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "designation" "Designation" NOT NULL,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "department_id" TEXT,
    "specialization" TEXT,
    "qualification" TEXT,
    "fee" DOUBLE PRECISION,
    "permissions" TEXT[],
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "date_of_birth" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "blood_group" TEXT,
    "address" TEXT NOT NULL,
    "department_id" TEXT,
    "emergency_contact" TEXT,
    "emergency_phone" TEXT,
    "insurance_provider" TEXT,
    "insurance_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "doctor_name" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "department_name" TEXT NOT NULL,
    "appointment_date" TEXT NOT NULL,
    "appointment_time" TEXT NOT NULL,
    "type" "AppointmentType" NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'scheduled',
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OPDVisit" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "patient_phone" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "doctor_name" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "department_name" TEXT NOT NULL,
    "visit_date" TEXT NOT NULL,
    "visit_time" TEXT NOT NULL,
    "chief_complaint" TEXT NOT NULL,
    "diagnosis" TEXT,
    "prescription" TEXT,
    "status" "OPDStatus" NOT NULL DEFAULT 'waiting',
    "vitals" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OPDVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IPDAdmission" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "patient_phone" TEXT NOT NULL,
    "patient_age" INTEGER NOT NULL,
    "patient_gender" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "doctor_name" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "department_name" TEXT NOT NULL,
    "room_number" TEXT NOT NULL,
    "bed_number" TEXT NOT NULL,
    "admission_date" TEXT NOT NULL,
    "admission_time" TEXT NOT NULL,
    "discharge_date" TEXT,
    "diagnosis" TEXT NOT NULL,
    "treatment_plan" TEXT,
    "status" "IPDStatus" NOT NULL DEFAULT 'admitted',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IPDAdmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaboratoryTest" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "test_code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "LabTestStatus" NOT NULL DEFAULT 'pending',
    "result" TEXT,
    "result_value" TEXT,
    "result_unit" TEXT,
    "reference_range" TEXT,
    "result_status" "LabTestResult",
    "ordered_by" TEXT NOT NULL,
    "ordered_by_name" TEXT NOT NULL,
    "collected_at" TEXT,
    "completed_at" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaboratoryTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadiologyRequest" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "patient_age" INTEGER NOT NULL,
    "patient_gender" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "doctor_name" TEXT NOT NULL,
    "radiology_type" "RadiologyType" NOT NULL,
    "examination" TEXT NOT NULL,
    "clinical_history" TEXT,
    "status" "RadiologyStatus" NOT NULL DEFAULT 'pending',
    "appointment_date" TEXT,
    "appointment_time" TEXT,
    "report" TEXT,
    "findings" TEXT,
    "impression" TEXT,
    "radiologist_notes" TEXT,
    "completed_at" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadiologyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "generic_name" TEXT,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "min_quantity" INTEGER NOT NULL DEFAULT 0,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "supplier" TEXT,
    "location" TEXT,
    "expiry_date" TEXT,
    "barcode" TEXT,
    "dosage" TEXT,
    "side_effects" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PharmacyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "min_quantity" INTEGER NOT NULL DEFAULT 0,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "supplier" TEXT,
    "location" TEXT,
    "expiry_date" TEXT,
    "barcode" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" TEXT NOT NULL,
    "inventory_item_id" TEXT NOT NULL,
    "type" "InventoryTxType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingInvoice" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "patient_phone" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "billing_type" "BillingType" NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "amount_paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "BillingStatus" NOT NULL DEFAULT 'pending',
    "due_date" TEXT,
    "paid_at" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingItem" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BillingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "status" "TaskStatus" NOT NULL DEFAULT 'pending',
    "due_date" TEXT,
    "assigned_to" TEXT,
    "assigned_to_name" TEXT,
    "assigned_by" TEXT NOT NULL,
    "assigned_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "KnowledgeCategory" NOT NULL,
    "tags" TEXT[],
    "content" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "views" INTEGER NOT NULL DEFAULT 0,
    "department_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "size" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_by_name" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "department_id" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WikiPage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WikiPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentComment" (
    "id" TEXT NOT NULL,
    "target_type" "CommentTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_department_id_idx" ON "User"("department_id");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE INDEX "Patient_name_idx" ON "Patient"("name");

-- CreateIndex
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");

-- CreateIndex
CREATE INDEX "Appointment_patient_id_idx" ON "Appointment"("patient_id");

-- CreateIndex
CREATE INDEX "Appointment_doctor_id_idx" ON "Appointment"("doctor_id");

-- CreateIndex
CREATE INDEX "Appointment_appointment_date_idx" ON "Appointment"("appointment_date");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "OPDVisit_patient_id_idx" ON "OPDVisit"("patient_id");

-- CreateIndex
CREATE INDEX "OPDVisit_visit_date_idx" ON "OPDVisit"("visit_date");

-- CreateIndex
CREATE INDEX "OPDVisit_status_idx" ON "OPDVisit"("status");

-- CreateIndex
CREATE INDEX "IPDAdmission_patient_id_idx" ON "IPDAdmission"("patient_id");

-- CreateIndex
CREATE INDEX "IPDAdmission_status_idx" ON "IPDAdmission"("status");

-- CreateIndex
CREATE INDEX "IPDAdmission_admission_date_idx" ON "IPDAdmission"("admission_date");

-- CreateIndex
CREATE INDEX "LaboratoryTest_patient_id_idx" ON "LaboratoryTest"("patient_id");

-- CreateIndex
CREATE INDEX "LaboratoryTest_status_idx" ON "LaboratoryTest"("status");

-- CreateIndex
CREATE INDEX "RadiologyRequest_patient_id_idx" ON "RadiologyRequest"("patient_id");

-- CreateIndex
CREATE INDEX "RadiologyRequest_status_idx" ON "RadiologyRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PharmacyItem_barcode_key" ON "PharmacyItem"("barcode");

-- CreateIndex
CREATE INDEX "PharmacyItem_name_idx" ON "PharmacyItem"("name");

-- CreateIndex
CREATE INDEX "PharmacyItem_category_idx" ON "PharmacyItem"("category");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_barcode_key" ON "InventoryItem"("barcode");

-- CreateIndex
CREATE INDEX "InventoryItem_name_idx" ON "InventoryItem"("name");

-- CreateIndex
CREATE INDEX "InventoryItem_category_idx" ON "InventoryItem"("category");

-- CreateIndex
CREATE INDEX "InventoryTransaction_inventory_item_id_idx" ON "InventoryTransaction"("inventory_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "BillingInvoice_invoice_number_key" ON "BillingInvoice"("invoice_number");

-- CreateIndex
CREATE INDEX "BillingInvoice_patient_id_idx" ON "BillingInvoice"("patient_id");

-- CreateIndex
CREATE INDEX "BillingInvoice_status_idx" ON "BillingInvoice"("status");

-- CreateIndex
CREATE INDEX "BillingInvoice_invoice_number_idx" ON "BillingInvoice"("invoice_number");

-- CreateIndex
CREATE INDEX "Task_assigned_to_idx" ON "Task"("assigned_to");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "Task"("priority");

-- CreateIndex
CREATE INDEX "KnowledgeArticle_category_idx" ON "KnowledgeArticle"("category");

-- CreateIndex
CREATE INDEX "KnowledgeArticle_status_idx" ON "KnowledgeArticle"("status");

-- CreateIndex
CREATE INDEX "KnowledgeArticle_author_id_idx" ON "KnowledgeArticle"("author_id");

-- CreateIndex
CREATE INDEX "Document_category_idx" ON "Document"("category");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "Document_uploaded_by_idx" ON "Document"("uploaded_by");

-- CreateIndex
CREATE INDEX "ContentComment_target_type_target_id_idx" ON "ContentComment"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "ContentComment_author_id_idx" ON "ContentComment"("author_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OPDVisit" ADD CONSTRAINT "OPDVisit_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OPDVisit" ADD CONSTRAINT "OPDVisit_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OPDVisit" ADD CONSTRAINT "OPDVisit_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IPDAdmission" ADD CONSTRAINT "IPDAdmission_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IPDAdmission" ADD CONSTRAINT "IPDAdmission_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IPDAdmission" ADD CONSTRAINT "IPDAdmission_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryTest" ADD CONSTRAINT "LaboratoryTest_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryTest" ADD CONSTRAINT "LaboratoryTest_ordered_by_fkey" FOREIGN KEY ("ordered_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadiologyRequest" ADD CONSTRAINT "RadiologyRequest_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadiologyRequest" ADD CONSTRAINT "RadiologyRequest_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingInvoice" ADD CONSTRAINT "BillingInvoice_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingItem" ADD CONSTRAINT "BillingItem_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "BillingInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeArticle" ADD CONSTRAINT "KnowledgeArticle_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeArticle" ADD CONSTRAINT "KnowledgeArticle_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiPage" ADD CONSTRAINT "WikiPage_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentComment" ADD CONSTRAINT "ContentComment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add markdown content field to Document table
-- This allows documents to have rich markdown body content written inline
-- in the browser, in addition to optional file attachments.
-- The field is nullable so existing documents with only file_path still work.

ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "content" TEXT;


-- Migration: add comment replies, comment likes, and notifications
-- Run: cd backend && npx prisma migrate dev --name comments_likes_notifications

-- 1. Add parent_id to ContentComment (for threaded replies)
ALTER TABLE "ContentComment" ADD COLUMN "parent_id" TEXT;

-- 2. Create ContentCommentLike table
CREATE TABLE "ContentCommentLike" (
  "id"         TEXT         NOT NULL,
  "comment_id" TEXT         NOT NULL,
  "user_id"    TEXT         NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContentCommentLike_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ContentCommentLike_comment_id_user_id_key"
  ON "ContentCommentLike"("comment_id", "user_id");
CREATE INDEX "ContentCommentLike_comment_id_idx" ON "ContentCommentLike"("comment_id");
CREATE INDEX "ContentCommentLike_user_id_idx"    ON "ContentCommentLike"("user_id");

ALTER TABLE "ContentCommentLike"
  ADD CONSTRAINT "ContentCommentLike_comment_id_fkey"
  FOREIGN KEY ("comment_id") REFERENCES "ContentComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContentCommentLike"
  ADD CONSTRAINT "ContentCommentLike_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Create Notification table
CREATE TYPE "NotificationType" AS ENUM ('comment', 'reply', 'status_change');

CREATE TABLE "Notification" (
  "id"          TEXT             NOT NULL,
  "user_id"     TEXT             NOT NULL,
  "type"        "NotificationType" NOT NULL,
  "title"       TEXT             NOT NULL,
  "message"     TEXT             NOT NULL,
  "link"        TEXT,
  "target_type" TEXT,
  "target_id"   TEXT,
  "is_read"     BOOLEAN          NOT NULL DEFAULT false,
  "created_at"  TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_user_id_idx" ON "Notification"("user_id");
CREATE INDEX "Notification_is_read_idx" ON "Notification"("is_read");

ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;