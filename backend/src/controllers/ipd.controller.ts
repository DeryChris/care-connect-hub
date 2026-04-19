// src/controllers/ipd.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ok, listOk, created, noContent, notFound, badRequest, parsePagination, paginate } from '../lib/response';

const createSchema = z.object({
  patient_id: z.string().uuid(),
  patient_name: z.string(),
  patient_phone: z.string(),
  patient_age: z.number().int().positive(),
  patient_gender: z.string(),
  doctor_id: z.string().uuid(),
  doctor_name: z.string(),
  department_id: z.string().uuid(),
  department_name: z.string(),
  room_number: z.string(),
  bed_number: z.string(),
  admission_date: z.string(),
  admission_time: z.string(),
  diagnosis: z.string().min(2),
  treatment_plan: z.string().optional(),
  status: z.enum(['admitted', 'in_progress', 'discharged', 'transferred']).default('admitted'),
  notes: z.string().optional(),
});

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = String(req.query.search || '');
  const status = req.query.status as string | undefined;
  const departmentId = req.query.department_id as string | undefined;

  const where: Record<string, unknown> = {};
  if (search) where.patient_name = { contains: search, mode: 'insensitive' };
  if (status) where.status = status;
  if (departmentId) where.department_id = departmentId;

  const [total, data] = await Promise.all([
    prisma.iPDAdmission.count({ where }),
    prisma.iPDAdmission.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } }),
  ]);

  return listOk(res, data, paginate(total, page, limit));
}

export async function getOne(req: Request, res: Response) {
  const admission = await prisma.iPDAdmission.findUnique({ where: { id: req.params.id } });
  if (!admission) return notFound(res, 'IPD Admission');
  return ok(res, admission);
}

export async function create(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Validation failed', parsed.error.errors);
  const admission = await prisma.iPDAdmission.create({ data: parsed.data });
  return created(res, admission);
}

export async function update(req: Request, res: Response) {
  const admission = await prisma.iPDAdmission.findUnique({ where: { id: req.params.id } });
  if (!admission) return notFound(res, 'IPD Admission');
  const updated = await prisma.iPDAdmission.update({ where: { id: req.params.id }, data: req.body });
  return ok(res, updated);
}

export async function discharge(req: Request, res: Response) {
  const { discharge_date, notes } = req.body;
  const updated = await prisma.iPDAdmission.update({
    where: { id: req.params.id },
    data: {
      status: 'discharged',
      discharge_date: discharge_date || new Date().toISOString().split('T')[0],
      notes,
    },
  });
  return ok(res, updated);
}

export async function remove(req: Request, res: Response) {
  await prisma.iPDAdmission.delete({ where: { id: req.params.id } });
  return noContent(res);
}
