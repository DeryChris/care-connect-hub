// src/controllers/pharmacy.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ok, listOk, created, noContent, notFound, badRequest, parsePagination, paginate } from '../lib/response';

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = String(req.query.search || '');
  const category = req.query.category as string | undefined;
  const lowStock = req.query.low_stock === 'true';
  const expiringSoon = req.query.expiring_soon === 'true';
  const where: Record<string, unknown> = { is_active: true };
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (category) where.category = category;
  const [total, allItems] = await Promise.all([prisma.pharmacyItem.count({ where }), prisma.pharmacyItem.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } })]);
  let data = allItems;
  if (lowStock) data = data.filter(i => i.quantity <= i.min_quantity);
  if (expiringSoon) {
    const soon = new Date(); soon.setDate(soon.getDate() + 30);
    data = data.filter(i => i.expiry_date && new Date(i.expiry_date) <= soon);
  }
  return listOk(res, data, paginate(total, page, limit));
}

export async function getOne(req: Request, res: Response) {
  const item = await prisma.pharmacyItem.findUnique({ where: { id: req.params.id } });
  if (!item) return notFound(res, 'Pharmacy Item');
  return ok(res, item);
}

export async function create(req: Request, res: Response) {
  const item = await prisma.pharmacyItem.create({ data: req.body });
  return created(res, item);
}

export async function update(req: Request, res: Response) {
  const updated = await prisma.pharmacyItem.update({ where: { id: req.params.id }, data: req.body });
  return ok(res, updated);
}

export async function adjustStock(req: Request, res: Response) {
  const { quantity, type } = req.body;
  if (quantity === undefined) return badRequest(res, 'quantity is required');
  const item = await prisma.pharmacyItem.findUnique({ where: { id: req.params.id } });
  if (!item) return notFound(res, 'Pharmacy Item');
  let newQty = item.quantity;
  if (type === 'in') newQty += quantity;
  else if (type === 'out') newQty = Math.max(0, newQty - quantity);
  else newQty = quantity; // adjustment
  const updated = await prisma.pharmacyItem.update({ where: { id: req.params.id }, data: { quantity: newQty } });
  return ok(res, updated);
}

export async function remove(req: Request, res: Response) {
  await prisma.pharmacyItem.update({ where: { id: req.params.id }, data: { is_active: false } });
  return noContent(res);
}
