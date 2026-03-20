// src/controllers/appointments.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ok, listOk, created, noContent, notFound, badRequest, parsePagination, paginate } from '../lib/response';

const createSchema = z.object({
  patient_id: z.string().uuid(),
  patient_name: z.string(),
  doctor_id: z.string().uuid(),
  doctor_name: z.string(),
  department_id: z.string().uuid(),
  department_name: z.string(),
  appointment_date: z.string(),
  appointment_time: z.string(),
  type: z.enum(['consultation', 'followup', 'emergency', 'checkup']),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).default('scheduled'),
  reason: z.string().min(2),
  notes: z.string().optional(),
});

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = String(req.query.search || '');
  const doctorId = req.query.doctor_id as string | undefined;
  const date = req.query.date as string | undefined;
  const status = req.query.status as string | undefined;

  const where: Record<string, unknown> = {};
  if (search) where.patient_name = { contains: search, mode: 'insensitive' };
  if (doctorId) where.doctor_id = doctorId;
  if (date) where.appointment_date = date;
  if (status) where.status = status;

  const [total, data] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({ where, skip, take: limit, orderBy: [{ appointment_date: 'desc' }, { appointment_time: 'asc' }] }),
  ]);

  return listOk(res, data, paginate(total, page, limit));
}

export async function getOne(req: Request, res: Response) {
  const appt = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!appt) return notFound(res, 'Appointment');
  return ok(res, appt);
}

export async function create(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Validation failed', parsed.error.errors);
  const appt = await prisma.appointment.create({ data: parsed.data });
  return created(res, appt);
}

export async function update(req: Request, res: Response) {
  const appt = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!appt) return notFound(res, 'Appointment');
  const updated = await prisma.appointment.update({ where: { id: req.params.id }, data: req.body });
  return ok(res, updated);
}

export async function updateStatus(req: Request, res: Response) {
  const { status } = req.body;
  if (!status) return badRequest(res, 'status is required');
  const updated = await prisma.appointment.update({ where: { id: req.params.id }, data: { status } });
  return ok(res, updated);
}

export async function remove(req: Request, res: Response) {
  await prisma.appointment.delete({ where: { id: req.params.id } });
  return noContent(res);
}
