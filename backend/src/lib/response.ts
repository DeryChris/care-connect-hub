// src/lib/response.ts
// Standard API response envelope — every endpoint uses these helpers

import { Response } from 'express';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** 200 OK — single item */
export function ok<T>(res: Response, data: T) {
  return res.status(200).json({ data });
}

/** 200 OK — list with pagination */
export function listOk<T>(res: Response, data: T[], meta: PaginationMeta) {
  return res.status(200).json({ data, meta });
}

/** 201 Created */
export function created<T>(res: Response, data: T) {
  return res.status(201).json({ data });
}

/** 204 No Content */
export function noContent(res: Response) {
  return res.status(204).send();
}

/** 400 Bad Request */
export function badRequest(res: Response, message: string, details?: unknown) {
  return res.status(400).json({ error: { code: 'BAD_REQUEST', message, details } });
}

/** 401 Unauthorized */
export function unauthorized(res: Response, message = 'Authentication required') {
  return res.status(401).json({ error: { code: 'UNAUTHORIZED', message } });
}

/** 403 Forbidden */
export function forbidden(res: Response, message = 'Insufficient permissions') {
  return res.status(403).json({ error: { code: 'FORBIDDEN', message } });
}

/** 404 Not Found */
export function notFound(res: Response, resource = 'Resource') {
  return res.status(404).json({ error: { code: 'NOT_FOUND', message: `${resource} not found` } });
}

/** 409 Conflict */
export function conflict(res: Response, message: string) {
  return res.status(409).json({ error: { code: 'CONFLICT', message } });
}

/** 500 Internal Server Error */
export function serverError(res: Response, message = 'Internal server error') {
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message } });
}

/** Helper to build pagination meta */
export function paginate(total: number, page: number, limit: number): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/** Helper to parse page/limit query params */
export function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? '20'), 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
