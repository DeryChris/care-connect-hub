// src/controllers/billing.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ok, listOk, created, noContent, notFound, badRequest, parsePagination, paginate } from '../lib/response';

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = String(req.query.search || '');
  const status = req.query.status as string | undefined;
  const type = req.query.type as string | undefined;
  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ patient_name: { contains: search, mode: 'insensitive' } }, { invoice_number: { contains: search, mode: 'insensitive' } }];
  if (status) where.status = status;
  if (type) where.billing_type = type;
  const [total, data] = await Promise.all([
    prisma.billingInvoice.count({ where }),
    prisma.billingInvoice.findMany({ where, skip, take: limit, include: { items: true }, orderBy: { created_at: 'desc' } }),
  ]);
  return listOk(res, data, paginate(total, page, limit));
}

export async function summary(req: Request, res: Response) {
  const all = await prisma.billingInvoice.findMany();
  const totalRevenue = all.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const pendingAmount = all.filter(i => i.status === 'pending' || i.status === 'partial').reduce((s, i) => s + (i.total - i.amount_paid), 0);
  const totalInvoices = all.length;
  const pendingCount = all.filter(i => i.status === 'pending').length;
  return ok(res, { totalRevenue, pendingAmount, totalInvoices, pendingCount });
}

export async function getOne(req: Request, res: Response) {
  const inv = await prisma.billingInvoice.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!inv) return notFound(res, 'Invoice');
  return ok(res, inv);
}

export async function create(req: Request, res: Response) {
  const { items, ...invoiceData } = req.body;
  // Auto-generate invoice number
  const count = await prisma.billingInvoice.count();
  const year = new Date().getFullYear();
  const invoice_number = `INV-${year}-${String(count + 1).padStart(3, '0')}`;
  const inv = await prisma.billingInvoice.create({
    data: { ...invoiceData, invoice_number, items: { create: items || [] } },
    include: { items: true },
  });
  return created(res, inv);
}

export async function update(req: Request, res: Response) {
  const { items, ...data } = req.body;
  const updated = await prisma.billingInvoice.update({
    where: { id: req.params.id },
    data: items ? { ...data, items: { deleteMany: {}, create: items } } : data,
    include: { items: true },
  });
  return ok(res, updated);
}

export async function recordPayment(req: Request, res: Response) {
  const { amount } = req.body;
  if (!amount || amount <= 0) return badRequest(res, 'Valid amount is required');
  const inv = await prisma.billingInvoice.findUnique({ where: { id: req.params.id } });
  if (!inv) return notFound(res, 'Invoice');
  const newPaid = inv.amount_paid + amount;
  const newStatus = newPaid >= inv.total ? 'paid' : 'partial';
  const updated = await prisma.billingInvoice.update({
    where: { id: req.params.id },
    data: { amount_paid: newPaid, status: newStatus, paid_at: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined },
    include: { items: true },
  });
  return ok(res, updated);
}

export async function remove(req: Request, res: Response) {
  await prisma.billingInvoice.update({ where: { id: req.params.id }, data: { status: 'cancelled' } });
  return noContent(res);
}
