// src/controllers/departments.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ok, listOk, created, noContent, notFound, badRequest, parsePagination, paginate } from '../lib/response';

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const activeOnly = req.query.active === 'true';
  const where = activeOnly ? { is_active: true } : {};
  const [total, data] = await Promise.all([
    prisma.department.count({ where }),
    prisma.department.findMany({ where, skip, take: limit, orderBy: { name: 'asc' }, include: { _count: { select: { users: true } } } }),
  ]);
  const mapped = data.map(d => ({ ...d, staff_count: d._count.users }));
  return listOk(res, mapped, paginate(total, page, limit));
}

export async function getOne(req: Request, res: Response) {
  const dept = await prisma.department.findUnique({ where: { id: req.params.id }, include: { _count: { select: { users: true } } } });
  if (!dept) return notFound(res, 'Department');
  return ok(res, { ...dept, staff_count: dept._count.users });
}

export async function create(req: Request, res: Response) {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Validation failed', parsed.error.errors);
  const dept = await prisma.department.create({ data: parsed.data });
  return created(res, dept);
}

export async function update(req: Request, res: Response) {
  const dept = await prisma.department.update({ where: { id: req.params.id }, data: req.body });
  return ok(res, dept);
}

export async function remove(req: Request, res: Response) {
  await prisma.department.update({ where: { id: req.params.id }, data: { is_active: false } });
  return noContent(res);
}
