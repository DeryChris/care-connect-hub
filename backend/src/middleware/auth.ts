// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { unauthorized, forbidden } from '../lib/response';
import { TokenPayload, verifyAccessToken } from '../services/auth.service';

// Re-export so other files can import from here
export type { TokenPayload };

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return unauthorized(res);

  const token = authHeader.slice(7);
  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return unauthorized(res, 'Invalid or expired token');
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return unauthorized(res);
  if (req.user.role !== 'admin') return forbidden(res, 'Admin access required');
  return next();
}

export function requirePermission(moduleKey: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return unauthorized(res);
    if (req.user.role === 'admin') return next();
    if (!req.user.permissions.includes(moduleKey)) {
      return forbidden(res, `Access to module '${moduleKey}' is not permitted`);
    }
    return next();
  };
}

export function requireOwnerOrAdmin(getOwnerId: (req: Request) => string | undefined) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return unauthorized(res);
    if (req.user.role === 'admin') return next();
    const ownerId = getOwnerId(req);
    if (ownerId && ownerId === req.user.userId) return next();
    return forbidden(res, 'You can only modify your own content');
  };
}