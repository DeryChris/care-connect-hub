// src/controllers/dashboard.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ok } from '../lib/response';

export async function getStats(req: Request, res: Response) {
  const [
    activeStaff, pendingTasks, inventoryItems,
    lowStockItems, patients, admissions,
    appointments, labTests,
  ] = await Promise.all([
    prisma.user.count({ where: { is_active: true } }),
    prisma.task.count({ where: { status: { in: ['pending', 'in_progress'] } } }),
    prisma.inventoryItem.findMany({ where: { is_active: true }, select: { quantity: true, unit_price: true, min_quantity: true } }),
    prisma.inventoryItem.count({ where: { is_active: true, quantity: { lte: prisma.inventoryItem.fields.min_quantity } } }),
    prisma.patient.count({ where: { is_active: true } }),
    prisma.iPDAdmission.count({ where: { status: { in: ['admitted', 'in_progress'] } } }),
    prisma.appointment.findMany({ where: { status: { notIn: ['cancelled', 'no_show'] } }, orderBy: { created_at: 'desc' }, take: 10 }),
    prisma.laboratoryTest.count({ where: { status: 'pending' } }),
  ]);

  const totalInventoryValue = inventoryItems.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

  // Low stock count using JS since Prisma can't compare two columns directly
  const lowStockCount = inventoryItems.filter(i => i.quantity <= i.min_quantity).length;

  // Patients by department
  const patientsByDept = await prisma.oPDVisit.groupBy({
    by: ['department_name'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  // Recent activity (last 8 events)
  const recentTasks = await prisma.task.findMany({ orderBy: { created_at: 'desc' }, take: 4, select: { title: true, created_at: true } });
  const recentActivities = recentTasks.map(t => ({ text: `Task: ${t.title}`, time: t.created_at.toISOString() }));

  // Active departments with staff
  const departments = await prisma.department.findMany({
    where: { is_active: true },
    include: { _count: { select: { users: true } } },
    orderBy: { name: 'asc' },
    take: 6,
  });

  return ok(res, {
    activeStaff,
    pendingTasks,
    totalInventoryValue,
    lowStockCount,
    totalPatients: patients,
    currentInpatients: admissions,
    pendingLabTests: labTests,
    patientsByDepartment: patientsByDept.map(d => ({
      name: d.department_name,
      count: d._count.id,
    })),
    recentActivities,
    departments: departments.map(d => ({ ...d, staff_count: d._count.users })),
  });
}
