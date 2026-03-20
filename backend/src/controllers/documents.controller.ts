// src/controllers/documents.controller.ts
// Supports two document modes:
//   1. File upload  — PDF, Word, etc. stored on disk
//   2. Markdown     — content written inline via MDEditor, no file needed
//
// NOTE: The `content` field is added by the migration
// (20260320000000_document_content). Run `npx prisma migrate dev` or the raw
// SQL first, then `npx prisma generate`, before building the backend.
// Until then the TypeScript types won't include `content` — hence we use
// `as any` on the data objects to avoid compile errors during that window.

import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import {
  ok, listOk, created, noContent, notFound, badRequest, forbidden,
  parsePagination, paginate,
} from '../lib/response';
import { formatFileSize } from '../middleware/upload';

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search   = String(req.query.search || '');
  const category = req.query.category as string | undefined;
  const status   = req.query.status   as string | undefined;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title:    { contains: search, mode: 'insensitive' } },
      { filename: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (category) where.category = category;
  if (status)   where.status   = status;

  const [total, data] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { uploaded_at: 'desc' },
      // No `select` — return all fields including `content` once migration runs
    }),
  ]);

  // Strip the internal file_path from list responses (security — never expose raw paths)
  const safeData = data.map(({ file_path: _fp, ...rest }) => rest);
  return listOk(res, safeData, paginate(total, page, limit));
}

export async function getOne(req: Request, res: Response) {
  const doc = await prisma.document.findUnique({
    where: { id: req.params.id },
  });
  if (!doc) return notFound(res, 'Document');

  await prisma.document.update({
    where: { id: req.params.id },
    data:  { views: { increment: 1 } },
  });

  // Strip internal file_path
  const { file_path: _fp, ...safe } = doc;
  return ok(res, safe);
}

export async function create(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');

  const { title, category, department_id, tags, content } = req.body;

  // ── Markdown-only mode (no file uploaded) ────────────────────────────────
  if (!req.file) {
    if (!title?.trim()) return badRequest(res, 'Title is required');

    const doc = await (prisma.document as any).create({
      data: {
        title:            title.trim(),
        filename:         '',
        file_path:        '',
        content:          content ?? '',
        category:         category || 'manual',
        size:             '0 B',
        mime_type:        'text/markdown',
        uploaded_by:      req.user.userId,
        uploaded_by_name: req.user.name,
        status:           'draft',
        tags:             tags ? JSON.parse(tags) : [],
        department_id:    department_id || null,
      },
    });
    const { file_path: _fp, ...safe } = doc;
    return created(res, safe);
  }

  // ── File upload mode ──────────────────────────────────────────────────────
  const doc = await (prisma.document as any).create({
    data: {
      title:            (title || req.file.originalname).trim(),
      filename:         req.file.originalname,
      file_path:        req.file.path,
      content:          content ?? null,
      category:         category || 'manual',
      size:             formatFileSize(req.file.size),
      mime_type:        req.file.mimetype,
      uploaded_by:      req.user.userId,
      uploaded_by_name: req.user.name,
      status:           'draft',
      tags:             tags ? JSON.parse(tags) : [],
      department_id:    department_id || null,
    },
  });
  const { file_path: _fp, ...safe } = doc;
  return created(res, safe);
}

export async function update(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');

  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) return notFound(res, 'Document');
  if (req.user.role !== 'admin' && doc.uploaded_by !== req.user.userId) return forbidden(res);

  const updateData: Record<string, unknown> = {};

  if (req.body.title !== undefined)         updateData.title         = req.body.title.trim();
  if (req.body.category !== undefined)      updateData.category      = req.body.category;
  if (req.body.department_id !== undefined) updateData.department_id = req.body.department_id || null;
  if (req.body.content !== undefined)       updateData.content       = req.body.content;
  if (req.body.tags !== undefined) {
    updateData.tags = typeof req.body.tags === 'string'
      ? JSON.parse(req.body.tags)
      : req.body.tags;
  }

  if (req.file) {
    updateData.filename  = req.file.originalname;
    updateData.file_path = req.file.path;
    updateData.size      = formatFileSize(req.file.size);
    updateData.mime_type = req.file.mimetype;
  }

  const updated = await (prisma.document as any).update({
    where: { id: req.params.id },
    data:  updateData,
  });
  const { file_path: _fp, ...safe } = updated;
  return ok(res, safe);
}

export async function updateStatus(req: Request, res: Response) {
  const { status } = req.body;
  if (!status) return badRequest(res, 'status is required');
  const updated = await prisma.document.update({
    where: { id: req.params.id },
    data:  { status },
  });
  return ok(res, updated);
}

export async function download(req: Request, res: Response) {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) return notFound(res, 'Document');

  if (!doc.file_path) {
    return badRequest(res, 'This document has no downloadable file.');
  }

  await prisma.document.update({
    where: { id: req.params.id },
    data:  { downloads: { increment: 1 } },
  });

  const filePath = path.resolve(doc.file_path);
  if (!fs.existsSync(filePath)) {
    return notFound(res, 'File not found on server');
  }

  res.download(filePath, doc.filename, err => {
    if (err && !res.headersSent) {
      res.status(500).json({ error: { code: 'DOWNLOAD_ERROR', message: 'Failed to send file' } });
    }
  });
}

export async function remove(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) return notFound(res, 'Document');
  if (req.user.role !== 'admin' && doc.uploaded_by !== req.user.userId) return forbidden(res);

  if (doc.file_path) {
    const filePath = path.resolve(doc.file_path);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }

  await prisma.document.delete({ where: { id: req.params.id } });
  return noContent(res);
}