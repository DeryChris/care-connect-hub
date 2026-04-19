// src/controllers/inventory.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ok, listOk, created, noContent, notFound, badRequest, parsePagination, paginate } from '../lib/response';

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = String(req.query.search || '');
  const category = req.query.category as string | undefined;
  const lowStock = req.query.low_stock === 'true';
  const where: Record<string, unknown> = { is_active: true };
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (category) where.category = category;
  const [total, allItems] = await Promise.all([prisma.inventoryItem.count({ where }), prisma.inventoryItem.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } })]);
  const data = lowStock ? allItems.filter(i => i.quantity <= i.min_quantity) : allItems;
  return listOk(res, data, paginate(total, page, limit));
}

export async function getOne(req: Request, res: Response) {
  const item = await prisma.inventoryItem.findUnique({ where: { id: req.params.id } });
  if (!item) return notFound(res, 'Inventory Item');
  return ok(res, item);
}

export async function getTransactions(req: Request, res: Response) {
  const txns = await prisma.inventoryTransaction.findMany({
    where: { inventory_item_id: req.params.id },
    orderBy: { created_at: 'desc' },
  });
  return ok(res, txns);
}

export async function create(req: Request, res: Response) {
  const item = await prisma.inventoryItem.create({ data: req.body });
  return created(res, item);
}

export async function update(req: Request, res: Response) {
  const updated = await prisma.inventoryItem.update({ where: { id: req.params.id }, data: req.body });
  return ok(res, updated);
}

export async function processTransaction(req: Request, res: Response) {
  if (!req.user) return notFound(res, 'User');
  const { type, quantity, unit_price, reference, notes } = req.body;
  if (!type || !quantity) return badRequest(res, 'type and quantity are required');
  const item = await prisma.inventoryItem.findUnique({ where: { id: req.params.id } });
  if (!item) return notFound(res, 'Inventory Item');

  let newQty = item.quantity;
  if (type === 'in') newQty += quantity;
  else if (type === 'out') newQty = Math.max(0, newQty - quantity);
  else newQty = quantity; // adjustment

  const [updatedItem, txn] = await prisma.$transaction([
    prisma.inventoryItem.update({ where: { id: item.id }, data: { quantity: newQty } }),
    prisma.inventoryTransaction.create({
      data: { inventory_item_id: item.id, type, quantity, unit_price: unit_price || item.unit_price, reference, notes, created_by: req.user.userId },
    }),
  ]);

  return ok(res, { item: updatedItem, transaction: txn });
}

export async function remove(req: Request, res: Response) {
  await prisma.inventoryItem.update({ where: { id: req.params.id }, data: { is_active: false } });
  return noContent(res);
}
