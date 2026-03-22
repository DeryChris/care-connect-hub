// src/controllers/knowledge.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ok, listOk, created, noContent, notFound, badRequest, forbidden, parsePagination, paginate } from '../lib/response';
import { createNotification } from './notifications.controller';

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = String(req.query.search || '');
  const category = req.query.category as string | undefined;
  const status = req.query.status as string | undefined;
  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { content: { contains: search, mode: 'insensitive' } }];
  if (category) where.category = category;
  if (status) where.status = status;
  const [total, data] = await Promise.all([prisma.knowledgeArticle.count({ where }), prisma.knowledgeArticle.findMany({ where, skip, take: limit, orderBy: { updated_at: 'desc' } })]);
  return listOk(res, data, paginate(total, page, limit));
}

export async function getOne(req: Request, res: Response) {
  const article = await prisma.knowledgeArticle.findUnique({ where: { id: req.params.id } });
  if (!article) return notFound(res, 'Knowledge Article');
  // Increment view count
  await prisma.knowledgeArticle.update({ where: { id: req.params.id }, data: { views: { increment: 1 } } });
  return ok(res, { ...article, views: article.views + 1 });
}

export async function create(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  const article = await prisma.knowledgeArticle.create({
    data: { ...req.body, author_id: req.user.userId, author_name: req.user.name },
  });
  return created(res, article);
}

export async function update(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  const article = await prisma.knowledgeArticle.findUnique({ where: { id: req.params.id } });
  if (!article) return notFound(res, 'Knowledge Article');
  if (req.user.role !== 'admin' && article.author_id !== req.user.userId) return forbidden(res);
  const updated = await prisma.knowledgeArticle.update({
    where: { id: req.params.id },
    data: { ...req.body, version: { increment: 1 } },
  });
  return ok(res, updated);
}

export async function updateStatus(req: Request, res: Response) {
  const { status } = req.body;
  if (!status) return badRequest(res, 'status is required');
  const updated = await prisma.knowledgeArticle.update({ where: { id: req.params.id }, data: { status } });

  if (req.user && updated.author_id !== req.user.userId) {
    const label = ({ approved: 'approved ✓', rejected: 'rejected', archived: 'archived', review: 'submitted for review', draft: 'moved back to draft' } as Record<string, string>)[status] ?? status;
    await createNotification(
      updated.author_id, 'status_change',
      `Article ${label}: "${updated.title}"`,
      `Your knowledge article status was changed to ${status}.`,
      { targetType: 'knowledge', targetId: updated.id, link: '/knowledge' },
    );
  }
  return ok(res, updated);
}

export async function remove(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  const article = await prisma.knowledgeArticle.findUnique({ where: { id: req.params.id } });
  if (!article) return notFound(res, 'Knowledge Article');
  if (req.user.role !== 'admin' && article.author_id !== req.user.userId) return forbidden(res);
  await prisma.knowledgeArticle.update({ where: { id: req.params.id }, data: { status: 'archived' } });
  return noContent(res);
}