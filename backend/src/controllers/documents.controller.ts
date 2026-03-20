// src/controllers/documents.controller.ts
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { ok, listOk, created, noContent, notFound, badRequest, forbidden, parsePagination, paginate } from '../lib/response';
import { formatFileSize } from '../middleware/upload';

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = String(req.query.search || '');
  const category = req.query.category as string | undefined;
  const status = req.query.status as string | undefined;
  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { filename: { contains: search, mode: 'insensitive' } }];
  if (category) where.category = category;
  if (status) where.status = status;
  const [total, data] = await Promise.all([prisma.document.count({ where }), prisma.document.findMany({ where, skip, take: limit, orderBy: { uploaded_at: 'desc' } })]);
  return listOk(res, data, paginate(total, page, limit));
}

export async function getOne(req: Request, res: Response) {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) return notFound(res, 'Document');
  await prisma.document.update({ where: { id: req.params.id }, data: { views: { increment: 1 } } });
  return ok(res, doc);
}

export async function create(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  if (!req.file) return badRequest(res, 'File is required');
  const { title, category, department_id, tags } = req.body;
  const doc = await prisma.document.create({
    data: {
      title: title || req.file.originalname,
      filename: req.file.originalname,
      file_path: req.file.path,
      category: category || 'manual',
      size: formatFileSize(req.file.size),
      mime_type: req.file.mimetype,
      uploaded_by: req.user.userId,
      uploaded_by_name: req.user.name,
      status: 'draft',
      tags: tags ? JSON.parse(tags) : [],
      department_id: department_id || null,
    },
  });
  return created(res, doc);
}

export async function update(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) return notFound(res, 'Document');
  if (req.user.role !== 'admin' && doc.uploaded_by !== req.user.userId) return forbidden(res);
  const updateData: Record<string, unknown> = { ...req.body };
  if (req.file) {
    updateData.filename = req.file.originalname;
    updateData.file_path = req.file.path;
    updateData.size = formatFileSize(req.file.size);
    updateData.mime_type = req.file.mimetype;
  }
  if (req.body.tags && typeof req.body.tags === 'string') updateData.tags = JSON.parse(req.body.tags);
  const updated = await prisma.document.update({ where: { id: req.params.id }, data: updateData });
  return ok(res, updated);
}

export async function updateStatus(req: Request, res: Response) {
  const { status } = req.body;
  if (!status) return badRequest(res, 'status is required');
  const updated = await prisma.document.update({ where: { id: req.params.id }, data: { status } });
  return ok(res, updated);
}

export async function download(req: Request, res: Response) {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) return notFound(res, 'Document');
  // Increment download count
  await prisma.document.update({ where: { id: req.params.id }, data: { downloads: { increment: 1 } } });
  const filePath = path.resolve(doc.file_path);
  if (!fs.existsSync(filePath)) return notFound(res, 'File');
  return res.download(filePath, doc.filename);
}

export async function remove(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) return notFound(res, 'Document');
  if (req.user.role !== 'admin' && doc.uploaded_by !== req.user.userId) return forbidden(res);
  await prisma.document.update({ where: { id: req.params.id }, data: { status: 'archived' } });
  return noContent(res);
}
