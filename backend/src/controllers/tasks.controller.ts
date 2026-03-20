// src/controllers/tasks.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ok, listOk, created, noContent, notFound, badRequest, parsePagination, paginate } from '../lib/response';

const createSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  module: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  due_date: z.string().optional(),
  assigned_to: z.string().uuid().optional().nullable(),
  assigned_to_name: z.string().optional(),
});

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = String(req.query.search || '');
  const status = req.query.status as string | undefined;
  const priority = req.query.priority as string | undefined;
  const assignedToMe = req.query.assigned_to === 'me';
  const where: Record<string, unknown> = {};
  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assignedToMe && req.user) where.assigned_to = req.user.userId;
  const [total, data] = await Promise.all([prisma.task.count({ where }), prisma.task.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } })]);
  return listOk(res, data, paginate(total, page, limit));
}

export async function getOne(req: Request, res: Response) {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) return notFound(res, 'Task');
  return ok(res, task);
}

export async function create(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Validation failed', parsed.error.errors);
  const task = await prisma.task.create({
    data: { ...parsed.data, assigned_by: req.user.userId, assigned_by_name: req.user.name },
  });
  return created(res, task);
}

export async function update(req: Request, res: Response) {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) return notFound(res, 'Task');
  const updated = await prisma.task.update({ where: { id: req.params.id }, data: req.body });
  return ok(res, updated);
}

export async function updateStatus(req: Request, res: Response) {
  const { status } = req.body;
  if (!status) return badRequest(res, 'status is required');
  const updated = await prisma.task.update({ where: { id: req.params.id }, data: { status } });
  return ok(res, updated);
}

export async function remove(req: Request, res: Response) {
  await prisma.task.update({ where: { id: req.params.id }, data: { status: 'cancelled' } });
  return noContent(res);
}
