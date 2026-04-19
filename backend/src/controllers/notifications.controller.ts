// src/controllers/notifications.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ok, noContent, notFound, badRequest } from '../lib/response';

/** GET /notifications — unread + recent for the logged-in user */
export async function list(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  const notifications = await prisma.notification.findMany({
    where: { user_id: req.user.userId },
    orderBy: { created_at: 'desc' },
    take: 50,
  });
  return ok(res, notifications);
}

/** PATCH /notifications/:id/read */
export async function markRead(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  await prisma.notification.updateMany({
    where: { id: req.params.id, user_id: req.user.userId },
    data: { is_read: true },
  });
  return ok(res, { success: true });
}

/** PATCH /notifications/read-all */
export async function markAllRead(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  await prisma.notification.updateMany({
    where: { user_id: req.user.userId, is_read: false },
    data: { is_read: true },
  });
  return ok(res, { success: true });
}

/** DELETE /notifications/:id */
export async function remove(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  await prisma.notification.deleteMany({
    where: { id: req.params.id, user_id: req.user.userId },
  });
  return noContent(res);
}

// ── Shared helper used by other controllers ───────────────────────────────────

export async function createNotification(
  userId: string,
  type: 'comment' | 'reply' | 'status_change',
  title: string,
  message: string,
  opts?: { targetType?: string; targetId?: string; link?: string },
) {
  try {
    await (prisma.notification as any).create({
      data: {
        user_id: userId,
        type,
        title,
        message,
        link: opts?.link ?? null,
        target_type: opts?.targetType ?? null,
        target_id: opts?.targetId ?? null,
      },
    });
  } catch {
    // Notifications are fire-and-forget — never fail the main request
  }
}