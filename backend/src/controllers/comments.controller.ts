// src/controllers/comments.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ok, created, noContent, notFound, badRequest, forbidden, parsePagination } from '../lib/response';

const createSchema = z.object({
  target_type: z.enum(['document', 'knowledge', 'wiki']),
  target_id: z.string(),
  message: z.string().min(1).max(5000),
});

export async function list(req: Request, res: Response) {
  const { targetType, targetId } = req.query;
  if (!targetType || !targetId) return badRequest(res, 'targetType and targetId are required');
  const comments = await prisma.contentComment.findMany({
    where: { target_type: targetType as any, target_id: String(targetId) },
    orderBy: { created_at: 'asc' },
  });
  return ok(res, comments);
}

export async function create(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Validation failed', parsed.error.errors);
  const comment = await prisma.contentComment.create({
    data: {
      ...parsed.data,
      author_id: req.user.userId,
      author_name: req.user.name,
      author_role: req.user.designation.replace('_', ' '),
    },
  });
  return created(res, comment);
}

export async function remove(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  const comment = await prisma.contentComment.findUnique({ where: { id: req.params.id } });
  if (!comment) return notFound(res, 'Comment');
  if (req.user.role !== 'admin' && comment.author_id !== req.user.userId) return forbidden(res);
  await prisma.contentComment.delete({ where: { id: req.params.id } });
  return noContent(res);
}
