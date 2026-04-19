// src/controllers/laboratory.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ok, listOk, created, noContent, notFound, badRequest, parsePagination, paginate } from '../lib/response';

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = String(req.query.search || '');
  const status = req.query.status as string | undefined;
  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ patient_name: { contains: search, mode: 'insensitive' } }, { test_name: { contains: search, mode: 'insensitive' } }];
  if (status) where.status = status;
  const [total, data] = await Promise.all([prisma.laboratoryTest.count({ where }), prisma.laboratoryTest.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } })]);
  return listOk(res, data, paginate(total, page, limit));
}

export async function getOne(req: Request, res: Response) {
  const t = await prisma.laboratoryTest.findUnique({ where: { id: req.params.id } });
  if (!t) return notFound(res, 'Lab Test');
  return ok(res, t);
}

export async function create(req: Request, res: Response) {
  const test = await prisma.laboratoryTest.create({ data: req.body });
  return created(res, test);
}

export async function update(req: Request, res: Response) {
  const updated = await prisma.laboratoryTest.update({ where: { id: req.params.id }, data: req.body });
  return ok(res, updated);
}

export async function updateStatus(req: Request, res: Response) {
  const { status } = req.body;
  if (!status) return badRequest(res, 'status is required');
  const updated = await prisma.laboratoryTest.update({ where: { id: req.params.id }, data: { status } });
  return ok(res, updated);
}

export async function updateResults(req: Request, res: Response) {
  const { result, result_value, result_unit, reference_range, result_status } = req.body;
  const updated = await prisma.laboratoryTest.update({
    where: { id: req.params.id },
    data: { result, result_value, result_unit, reference_range, result_status, status: 'completed', completed_at: new Date().toISOString() },
  });
  return ok(res, updated);
}

export async function remove(req: Request, res: Response) {
  await prisma.laboratoryTest.delete({ where: { id: req.params.id } });
  return noContent(res);
}
