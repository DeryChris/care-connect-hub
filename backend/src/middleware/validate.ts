// src/middleware/validate.ts
// Zod request body validation middleware

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { badRequest } from '../lib/response';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return badRequest(res, 'Validation failed', details);
      }
      return next(err);
    }
  };
}

// src/middleware/errorHandler.ts
// Global error handler — must be the LAST middleware registered in server.ts
import { Request as Req, Response as Res, NextFunction as Next } from 'express';

export function errorHandler(err: Error, _req: Req, res: Res, _next: Next) {
  console.error('[ERROR]', err.message, err.stack);

  // Prisma unique constraint violation
  if ((err as any).code === 'P2002') {
    return res.status(409).json({
      error: { code: 'CONFLICT', message: 'A record with this value already exists' },
    });
  }

  // Prisma record not found
  if ((err as any).code === 'P2025') {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Record not found' },
    });
  }

  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
}
