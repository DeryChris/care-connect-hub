// src/controllers/reports.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ok } from '../lib/response';

export async function overview(req: Request, res: Response) {
  const [totalUsers, activeUsers, pendingTasks, completedTasks, totalPatients, totalInvoices, paidInvoices] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { is_active: true } }),
    prisma.task.count({ where: { status: { in: ['pending', 'in_progress'] } } }),
    prisma.task.count({ where: { status: 'completed' } }),
    prisma.patient.count({ where: { is_active: true } }),
    prisma.billingInvoice.count(),
    prisma.billingInvoice.count({ where: { status: 'paid' } }),
  ]);
  return ok(res, { totalUsers, activeUsers, pendingTasks, completedTasks, totalPatients, totalInvoices, paidInvoices });
}

export async function inventoryReport(req: Request, res: Response) {
  const items = await prisma.inventoryItem.findMany({ where: { is_active: true } });
  const totalValue = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const lowStockCount = items.filter(i => i.quantity <= i.min_quantity).length;
  const byCategory = items.reduce((acc: Record<string, number>, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {});
  return ok(res, { totalItems: items.length, totalValue, lowStockCount, byCategory });
}

export async function billingReport(req: Request, res: Response) {
  const range = req.query.range as string || 'month';
  const invoices = await prisma.billingInvoice.findMany({ include: { items: true } });
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending' || i.status === 'partial').reduce((s, i) => s + (i.total - i.amount_paid), 0);
  const byType = invoices.reduce((acc: Record<string, number>, i) => {
    acc[i.billing_type] = (acc[i.billing_type] || 0) + i.total;
    return acc;
  }, {});
  return ok(res, { totalRevenue, pendingAmount, totalInvoices: invoices.length, byType, range });
}

export async function staffReport(req: Request, res: Response) {
  const users = await prisma.user.findMany({ include: { department: true } });
  const byDesignation = users.reduce((acc: Record<string, number>, u) => {
    acc[u.designation] = (acc[u.designation] || 0) + 1;
    return acc;
  }, {});
  return ok(res, { totalStaff: users.length, activeStaff: users.filter(u => u.is_active).length, byDesignation });
}
