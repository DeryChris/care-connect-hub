// src/controllers/radiology.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ok, listOk, created, noContent, notFound, badRequest, parsePagination, paginate } from '../lib/response';

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = String(req.query.search || '');
  const status = req.query.status as string | undefined;
  const type = req.query.type as string | undefined;
  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ patient_name: { contains: search, mode: 'insensitive' } }, { examination: { contains: search, mode: 'insensitive' } }];
  if (status) where.status = status;
  if (type) where.radiology_type = type;
  const [total, data] = await Promise.all([prisma.radiologyRequest.count({ where }), prisma.radiologyRequest.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } })]);
  return listOk(res, data, paginate(total, page, limit));
}

export async function getOne(req: Request, res: Response) {
  const r = await prisma.radiologyRequest.findUnique({ where: { id: req.params.id } });
  if (!r) return notFound(res, 'Radiology Request');
  return ok(res, r);
}

export async function create(req: Request, res: Response) {
  const req_record = await prisma.radiologyRequest.create({ data: req.body });
  return created(res, req_record);
}

export async function update(req: Request, res: Response) {
  const updated = await prisma.radiologyRequest.update({ where: { id: req.params.id }, data: req.body });
  return ok(res, updated);
}

export async function updateStatus(req: Request, res: Response) {
  const { status } = req.body;
  if (!status) return badRequest(res, 'status is required');
  const updated = await prisma.radiologyRequest.update({ where: { id: req.params.id }, data: { status } });
  return ok(res, updated);
}

export async function updateReport(req: Request, res: Response) {
  const { findings, impression, radiologist_notes } = req.body;
  const updated = await prisma.radiologyRequest.update({
    where: { id: req.params.id },
    data: { findings, impression, radiologist_notes, status: 'completed', completed_at: new Date().toISOString(), report: 'Available' },
  });
  return ok(res, updated);
}

export async function remove(req: Request, res: Response) {
  await prisma.radiologyRequest.delete({ where: { id: req.params.id } });
  return noContent(res);
}
