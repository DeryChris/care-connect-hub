// src/controllers/comments.controller.ts
// Supports threaded replies (parent_id), per-comment likes, and notifications.

import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ok, created, noContent, notFound, badRequest, forbidden } from '../lib/response';
import { createNotification } from './notifications.controller';

const createSchema = z.object({
  target_type: z.enum(['document', 'knowledge', 'wiki']),
  target_id:   z.string(),
  message:     z.string().min(1).max(5000),
  parent_id:   z.string().optional(),
});

// ── List comments with likes + liked_by_me ─────────────────────────────────
export async function list(req: Request, res: Response) {
  const { targetType, targetId } = req.query;
  if (!targetType || !targetId) return badRequest(res, 'targetType and targetId are required');

  const comments = await (prisma.contentComment as any).findMany({
    where: { target_type: targetType as any, target_id: String(targetId) },
    orderBy: { created_at: 'asc' },
    include: { _count: { select: { likes: true } } },
  });

  const userId    = req.user!.userId;
  const userLikes = await (prisma.contentCommentLike as any).findMany({
    where: { user_id: userId, comment_id: { in: comments.map((c: any) => c.id) } },
    select: { comment_id: true },
  });
  const likedSet = new Set((userLikes as any[]).map((l: any) => l.comment_id));

  const result = comments.map((c: any) => {
    const { _count, ...rest } = c;
    return { ...rest, likes_count: _count.likes, liked_by_me: likedSet.has(c.id) };
  });

  return ok(res, result);
}

// ── Create comment or reply ────────────────────────────────────────────────
export async function create(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Validation failed', parsed.error.errors);

  const { target_type, target_id, message, parent_id } = parsed.data;

  const comment = await (prisma.contentComment as any).create({
    data: {
      target_type,
      target_id,
      message,
      parent_id:   parent_id ?? null,
      author_id:   req.user.userId,
      author_name: req.user.name,
      author_role: req.user.designation.replace('_', ' '),
    },
  });

  const commenterName = req.user.name;

  if (parent_id) {
    // Reply — notify parent comment author
    const parent = await (prisma.contentComment as any).findUnique({
      where: { id: parent_id },
      select: { author_id: true },
    });
    if (parent && parent.author_id !== req.user.userId) {
      await createNotification(
        parent.author_id, 'reply',
        `${commenterName} replied to your comment`,
        message.slice(0, 150),
        { targetType: target_type, targetId: target_id, link: `/${target_type === 'knowledge' ? 'knowledge' : target_type}` },
      );
    }
  } else {
    // Top-level comment — notify content owner
    let ownerId: string | null = null;
    let contentTitle = '';
    if (target_type === 'document') {
      const d = await prisma.document.findUnique({ where: { id: target_id }, select: { uploaded_by: true, title: true } });
      ownerId = d?.uploaded_by ?? null; contentTitle = d?.title ?? '';
    } else if (target_type === 'knowledge') {
      const a = await prisma.knowledgeArticle.findUnique({ where: { id: target_id }, select: { author_id: true, title: true } });
      ownerId = a?.author_id ?? null; contentTitle = a?.title ?? '';
    } else if (target_type === 'wiki') {
      const w = await prisma.wikiPage.findUnique({ where: { id: target_id }, select: { author_id: true, title: true } });
      ownerId = w?.author_id ?? null; contentTitle = w?.title ?? '';
    }
    if (ownerId && ownerId !== req.user.userId) {
      await createNotification(
        ownerId, 'comment',
        `${commenterName} commented on "${contentTitle}"`,
        message.slice(0, 150),
        { targetType: target_type, targetId: target_id, link: `/${target_type === 'knowledge' ? 'knowledge' : target_type}` },
      );
    }
  }

  return created(res, { ...comment, likes_count: 0, liked_by_me: false });
}

// ── Toggle like ────────────────────────────────────────────────────────────
export async function toggleLike(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  const commentId = req.params.id;
  const userId    = req.user.userId;

  const existing = await (prisma.contentCommentLike as any).findUnique({
    where: { comment_id_user_id: { comment_id: commentId, user_id: userId } },
  });

  if (existing) {
    await (prisma.contentCommentLike as any).delete({
      where: { comment_id_user_id: { comment_id: commentId, user_id: userId } },
    });
  } else {
    await (prisma.contentCommentLike as any).create({
      data: { comment_id: commentId, user_id: userId },
    });
  }

  const likes_count = await (prisma.contentCommentLike as any).count({ where: { comment_id: commentId } });
  return ok(res, { liked: !existing, likes_count });
}

// ── Delete ─────────────────────────────────────────────────────────────────
export async function remove(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  const comment = await (prisma.contentComment as any).findUnique({ where: { id: req.params.id } });
  if (!comment) return notFound(res, 'Comment');
  if (req.user.role !== 'admin' && comment.author_id !== req.user.userId) return forbidden(res);
  await (prisma.contentComment as any).delete({ where: { id: req.params.id } });
  return noContent(res);
}