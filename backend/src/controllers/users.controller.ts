// src/controllers/users.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ok, listOk, created, noContent, notFound, badRequest, serverError, parsePagination, paginate } from '../lib/response';
import { hashPassword } from '../services/auth.service';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'user']).default('user'),
  designation: z.enum(['doctor','nurse','receptionist','lab_technician','radiologist','pharmacist','accountant','hr_officer','data_entry','it_staff','admin_staff','employee']),
  phone: z.string().optional(),
  department_id: z.string().uuid().optional().nullable(),
  specialization: z.string().optional(),
  qualification: z.string().optional(),
  fee: z.number().optional(),
  permissions: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
});

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = String(req.query.search || '');
  const where = search ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }] } : {};

  const [total, data] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, skip, take: limit, orderBy: { name: 'asc' }, select: { id: true, name: true, email: true, role: true, designation: true, phone: true, is_active: true, permissions: true, department_id: true, specialization: true, qualification: true, fee: true, created_at: true, department: { select: { name: true } } } }),
  ]);

  return listOk(res, data, paginate(total, page, limit));
}

export async function me(req: Request, res: Response) {
  if (!req.user) return ok(res, null);
  const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { id: true, name: true, email: true, role: true, designation: true, phone: true, is_active: true, permissions: true, department_id: true, specialization: true, qualification: true, fee: true, created_at: true } });
  if (!user) return notFound(res, 'User');
  return ok(res, user);
}

export async function getOne(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, name: true, email: true, role: true, designation: true, phone: true, is_active: true, permissions: true, department_id: true, specialization: true, qualification: true, fee: true, created_at: true } });
  if (!user) return notFound(res, 'User');
  return ok(res, user);
}

export async function create(req: Request, res: Response) {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Validation failed', parsed.error.errors);
  const { password, ...data } = parsed.data;
  const password_hash = await hashPassword(password);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return badRequest(res, 'Email already in use');
  const user = await prisma.user.create({ data: { ...data, password_hash }, select: { id: true, name: true, email: true, role: true, designation: true, permissions: true, is_active: true, created_at: true } });
  return created(res, user);
}

export async function update(req: Request, res: Response) {
  const { password, ...data } = req.body;
  const updateData: Record<string, unknown> = { ...data };
  if (password) updateData.password_hash = await hashPassword(password);
  const user = await prisma.user.update({ where: { id: req.params.id }, data: updateData, select: { id: true, name: true, email: true, role: true, designation: true, permissions: true, is_active: true, created_at: true } });
  return ok(res, user);
}

export async function toggleActive(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return notFound(res, 'User');
  const updated = await prisma.user.update({ where: { id: req.params.id }, data: { is_active: !user.is_active }, select: { id: true, name: true, is_active: true } });
  return ok(res, updated);
}

export async function updatePermissions(req: Request, res: Response) {
  const { permissions } = req.body;
  if (!Array.isArray(permissions)) return badRequest(res, 'permissions must be an array');
  const updated = await prisma.user.update({ where: { id: req.params.id }, data: { permissions }, select: { id: true, name: true, permissions: true } });
  return ok(res, updated);
}

export async function remove(req: Request, res: Response) {
  await prisma.user.update({ where: { id: req.params.id }, data: { is_active: false } });
  return noContent(res);
}
