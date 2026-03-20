// src/controllers/patients.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ok, listOk, created, noContent, notFound, badRequest, parsePagination, paginate } from '../lib/response';

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(5),
  date_of_birth: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  blood_group: z.string().optional(),
  address: z.string().min(5),
  department_id: z.string().uuid().optional().nullable(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  insurance_provider: z.string().optional(),
  insurance_number: z.string().optional(),
  is_active: z.boolean().default(true),
});

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = String(req.query.search || '');
  const departmentId = req.query.department_id as string | undefined;
  const activeOnly = req.query.active !== 'false';

  const where: Record<string, unknown> = { is_active: activeOnly };
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (departmentId) where.department_id = departmentId;

  const [total, data] = await Promise.all([
    prisma.patient.count({ where }),
    prisma.patient.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
  ]);

  return listOk(res, data, paginate(total, page, limit));
}

export async function getOne(req: Request, res: Response) {
  const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
  if (!patient) return notFound(res, 'Patient');
  return ok(res, patient);
}

export async function create(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Validation failed', parsed.error.errors);
  const patient = await prisma.patient.create({ data: parsed.data });
  return created(res, patient);
}

export async function update(req: Request, res: Response) {
  const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
  if (!patient) return notFound(res, 'Patient');
  const updated = await prisma.patient.update({ where: { id: req.params.id }, data: req.body });
  return ok(res, updated);
}

export async function remove(req: Request, res: Response) {
  const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
  if (!patient) return notFound(res, 'Patient');
  await prisma.patient.update({ where: { id: req.params.id }, data: { is_active: false } });
  return noContent(res);
}

// GET /api/patients/:id/timeline — all clinical records for a patient
export async function timeline(req: Request, res: Response) {
  const id = req.params.id;
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) return notFound(res, 'Patient');

  const [appointments, opdVisits, ipdAdmissions, labTests, radiologyRequests, invoices] = await Promise.all([
    prisma.appointment.findMany({ where: { patient_id: id }, orderBy: { created_at: 'desc' } }),
    prisma.oPDVisit.findMany({ where: { patient_id: id }, orderBy: { visit_date: 'desc' } }),
    prisma.iPDAdmission.findMany({ where: { patient_id: id }, orderBy: { admission_date: 'desc' } }),
    prisma.laboratoryTest.findMany({ where: { patient_id: id }, orderBy: { created_at: 'desc' } }),
    prisma.radiologyRequest.findMany({ where: { patient_id: id }, orderBy: { created_at: 'desc' } }),
    prisma.billingInvoice.findMany({ where: { patient_id: id }, include: { items: true }, orderBy: { created_at: 'desc' } }),
  ]);

  return ok(res, { patient, appointments, opdVisits, ipdAdmissions, labTests, radiologyRequests, invoices });
}
