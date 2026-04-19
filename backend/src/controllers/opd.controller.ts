// src/controllers/opd.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ok, listOk, created, noContent, notFound, badRequest, parsePagination, paginate } from '../lib/response';

const createSchema = z.object({
  patient_id: z.string().uuid(),
  patient_name: z.string(),
  patient_phone: z.string(),
  doctor_id: z.string().uuid(),
  doctor_name: z.string(),
  department_id: z.string().uuid(),
  department_name: z.string(),
  visit_date: z.string(),
  visit_time: z.string(),
  chief_complaint: z.string().min(2),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
  status: z.enum(['waiting', 'in_progress', 'completed', 'cancelled']).default('waiting'),
  vitals: z.object({
    blood_pressure: z.string().optional(),
    temperature: z.string().optional(),
    pulse: z.string().optional(),
    weight: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = String(req.query.search || '');
  const status = req.query.status as string | undefined;
  const departmentId = req.query.department_id as string | undefined;
  const date = req.query.date as string | undefined;

  const where: Record<string, unknown> = {};
  if (search) where.patient_name = { contains: search, mode: 'insensitive' };
  if (status) where.status = status;
  if (departmentId) where.department_id = departmentId;
  if (date) where.visit_date = date;

  const [total, data] = await Promise.all([
    prisma.oPDVisit.count({ where }),
    prisma.oPDVisit.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } }),
  ]);

  return listOk(res, data, paginate(total, page, limit));
}

export async function getOne(req: Request, res: Response) {
  const visit = await prisma.oPDVisit.findUnique({ where: { id: req.params.id } });
  if (!visit) return notFound(res, 'OPD Visit');
  return ok(res, visit);
}

export async function create(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Validation failed', parsed.error.errors);
  const visit = await prisma.oPDVisit.create({ data: parsed.data });
  return created(res, visit);
}

export async function update(req: Request, res: Response) {
  const visit = await prisma.oPDVisit.findUnique({ where: { id: req.params.id } });
  if (!visit) return notFound(res, 'OPD Visit');
  const updated = await prisma.oPDVisit.update({ where: { id: req.params.id }, data: req.body });
  return ok(res, updated);
}

export async function updateStatus(req: Request, res: Response) {
  const { status } = req.body;
  if (!status) return badRequest(res, 'status is required');
  const updated = await prisma.oPDVisit.update({ where: { id: req.params.id }, data: { status } });
  return ok(res, updated);
}

export async function updateVitals(req: Request, res: Response) {
  const { vitals } = req.body;
  if (!vitals) return badRequest(res, 'vitals object is required');
  const updated = await prisma.oPDVisit.update({ where: { id: req.params.id }, data: { vitals } });
  return ok(res, updated);
}

export async function remove(req: Request, res: Response) {
  await prisma.oPDVisit.delete({ where: { id: req.params.id } });
  return noContent(res);
}
