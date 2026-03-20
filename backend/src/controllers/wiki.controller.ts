// src/controllers/wiki.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ok, listOk, created, noContent, notFound, forbidden, parsePagination, paginate } from '../lib/response';

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const [total, data] = await Promise.all([
    prisma.wikiPage.count(),
    prisma.wikiPage.findMany({ skip, take: limit, orderBy: { title: 'asc' } }),
  ]);
  return listOk(res, data, paginate(total, page, limit));
}

export async function getOne(req: Request, res: Response) {
  const page = await prisma.wikiPage.findUnique({ where: { id: req.params.id } });
  if (!page) return notFound(res, 'Wiki Page');
  return ok(res, page);
}

export async function create(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  const wikiPage = await prisma.wikiPage.create({
    data: { ...req.body, author_id: req.user.userId, author: req.user.name },
  });
  return created(res, wikiPage);
}

export async function update(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  const wikiPage = await prisma.wikiPage.findUnique({ where: { id: req.params.id } });
  if (!wikiPage) return notFound(res, 'Wiki Page');
  const canEdit = req.user.role === 'admin' || wikiPage.author_id === req.user.userId || ['it_staff', 'admin_staff'].includes(req.user.designation);
  if (!canEdit) return forbidden(res);
  const updated = await prisma.wikiPage.update({
    where: { id: req.params.id },
    data: { ...req.body, author: req.user.name },
  });
  return ok(res, updated);
}

export async function remove(req: Request, res: Response) {
  await prisma.wikiPage.delete({ where: { id: req.params.id } });
  return noContent(res);
}
